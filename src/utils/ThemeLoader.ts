/**
 * ThemeLoader - Runtime CSS Theme Loading with Layer Injection
 * 
 * Fetches CSS from any URL and injects it into the `theme` layer.
 * This ensures Canvas structural CSS (@layer canvas-structure) always wins
 * without needing !important declarations.
 * 
 * Usage:
 *   await ThemeLoader.loadTheme('https://example.com/theme.css');
 *   ThemeLoader.unloadTheme();
 *   ThemeLoader.loadThemeFromText(cssString);
 * 
 * Architecture:
 *   @layer canvas-structure  ← Higher priority (Canvas owns)
 *   @layer theme             ← Lower priority (Themes go here)
 * 
 * Future: Supports AI-generated CSS, user-uploaded themes, runtime switching
 */

export interface ThemeLoadResult {
    success: boolean;
    url?: string;
    error?: string;
    cssLength?: number;
}

export interface ThemeLoaderOptions {
    /** ID for the injected style element (default: 'dm-theme-layer') */
    styleId?: string;
    /** Timeout for fetch in milliseconds (default: 10000) */
    timeout?: number;
    /** Whether to log debug info (default: false) */
    debug?: boolean;
}

const DEFAULT_OPTIONS: Required<ThemeLoaderOptions> = {
    styleId: 'dm-theme-layer',
    timeout: 10000,
    debug: false,
};

/**
 * ThemeLoader singleton for managing CSS theme injection
 */
export const ThemeLoader = {
    _options: { ...DEFAULT_OPTIONS },
    _loadedUrls: new Set<string>(),

    /**
     * Configure ThemeLoader options
     */
    configure(options: ThemeLoaderOptions): void {
        this._options = { ...DEFAULT_OPTIONS, ...options };
    },

    /**
     * Load a theme from a URL, wrapping it in @layer theme
     */
    async loadTheme(url: string): Promise<ThemeLoadResult> {
        const { styleId, timeout, debug } = this._options;

        if (debug) console.log(`🎨 [ThemeLoader] Loading theme from: ${url}`);

        try {
            // Fetch with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const cssText = await response.text();

            // Inject into layer
            this._injectLayeredCSS(cssText, styleId);
            this._loadedUrls.add(url);

            if (debug) console.log(`✅ [ThemeLoader] Loaded ${cssText.length} bytes from ${url}`);

            return {
                success: true,
                url,
                cssLength: cssText.length,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error(`❌ [ThemeLoader] Failed to load theme from ${url}:`, message);

            return {
                success: false,
                url,
                error: message,
            };
        }
    },

    /**
     * Load multiple theme CSS files (e.g., PHB requires all.css, bundle.css, style.css, 5ePHBstyle.css)
     */
    async loadThemeBundle(urls: string[]): Promise<ThemeLoadResult[]> {
        const { debug } = this._options;

        if (debug) console.log(`🎨 [ThemeLoader] Loading theme bundle: ${urls.length} files`);

        // Load all CSS files
        const results = await Promise.all(urls.map(url => this.loadTheme(url)));

        // Combine all CSS into a single layer injection
        const allSuccess = results.every(r => r.success);

        if (debug) {
            const totalBytes = results.reduce((sum, r) => sum + (r.cssLength || 0), 0);
            console.log(`${allSuccess ? '✅' : '⚠️'} [ThemeLoader] Bundle loaded: ${totalBytes} bytes total`);
        }

        return results;
    },

    /**
     * Load theme directly from CSS text (for AI-generated or user-provided CSS)
     */
    loadThemeFromText(cssText: string, sourceId: string = 'custom'): ThemeLoadResult {
        const { styleId, debug } = this._options;

        if (debug) console.log(`🎨 [ThemeLoader] Loading theme from text (${cssText.length} bytes)`);

        try {
            this._injectLayeredCSS(cssText, styleId);

            return {
                success: true,
                url: `text://${sourceId}`,
                cssLength: cssText.length,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                error: message,
            };
        }
    },

    /**
     * Unload the current theme
     */
    unloadTheme(): void {
        const { styleId, debug } = this._options;

        const existing = document.getElementById(styleId);
        if (existing) {
            existing.remove();
            this._loadedUrls.clear();
            if (debug) console.log(`🎨 [ThemeLoader] Theme unloaded`);
        }
    },

    /**
     * Check if a theme is currently loaded
     */
    isLoaded(): boolean {
        const { styleId } = this._options;
        return document.getElementById(styleId) !== null;
    },

    /**
     * Get the currently loaded theme URLs
     */
    getLoadedUrls(): string[] {
        return Array.from(this._loadedUrls);
    },

    /**
     * Internal: Inject CSS wrapped in @layer theme
     */
    _injectLayeredCSS(cssText: string, styleId: string, baseUrl?: string): void {
        // Remove existing theme
        const existing = document.getElementById(styleId);
        if (existing) {
            existing.remove();
        }

        // Rewrite relative URLs to absolute if baseUrl provided
        let processedCSS = cssText;
        if (baseUrl) {
            processedCSS = this._rewriteRelativeUrls(cssText, baseUrl);
        }

        // Create new style element with layered CSS
        const style = document.createElement('style');
        style.id = styleId;
        style.setAttribute('data-theme-loader', 'true');

        // Wrap CSS in @layer theme
        // This ensures canvas-structure layer has higher priority
        style.textContent = `@layer theme {\n${processedCSS}\n}`;

        // Insert into head
        document.head.appendChild(style);
    },

    /**
     * Internal: Rewrite relative URLs in CSS to absolute URLs
     * Handles url('./path'), url('../path'), url('path'), url("path")
     */
    _rewriteRelativeUrls(cssText: string, baseUrl: string): string {
        // Ensure baseUrl ends without trailing slash
        const base = baseUrl.replace(/\/$/, '');

        // Match url() with relative paths (not starting with http, https, data, or /)
        return cssText.replace(
            /url\(\s*(['"]?)(?!(?:https?:|data:|\/))([^'")]+)\1\s*\)/gi,
            (match, quote, path) => {
                // Handle ./ and ../ prefixes
                let resolvedPath = path;
                if (path.startsWith('./')) {
                    resolvedPath = path.slice(2);
                } else if (path.startsWith('../')) {
                    // For ../ we need to go up one level from base
                    const baseParts = base.split('/');
                    baseParts.pop(); // Remove last segment
                    resolvedPath = path.slice(3);
                    return `url(${quote}${baseParts.join('/')}/${resolvedPath}${quote})`;
                }
                return `url(${quote}${base}/${resolvedPath}${quote})`;
            }
        );
    },

    /**
     * Append additional CSS to the existing theme layer
     * Useful for loading multiple CSS files into the same layer
     */
    _appendToLayer(cssText: string, styleId: string): void {
        const existing = document.getElementById(styleId);

        if (existing) {
            // Append to existing layer
            // Extract content between @layer theme { and final }
            const currentContent = existing.textContent || '';
            const match = currentContent.match(/@layer theme \{\n([\s\S]*)\n\}$/);
            const existingCSS = match ? match[1] : '';

            existing.textContent = `@layer theme {\n${existingCSS}\n${cssText}\n}`;
        } else {
            // Create new
            this._injectLayeredCSS(cssText, styleId);
        }
    },
};

export default ThemeLoader;

