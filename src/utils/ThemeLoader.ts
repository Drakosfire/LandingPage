/**
 * ThemeLoader - Runtime CSS Theme Loading with Layer Injection
 * 
 * SINGLETON PATTERN: State survives React StrictMode remounts.
 * 
 * Fetches CSS from any URL and injects it into the `theme` layer.
 * This ensures Canvas structural CSS (@layer canvas-structure) always wins
 * without needing !important declarations.
 * 
 * Usage:
 *   // Async - wait for theme to load
 *   await ThemeLoader.ensureLoaded(['url1', 'url2'], baseUrl);
 *   
 *   // Sync check
 *   if (ThemeLoader.isLoaded()) { ... }
 *   
 *   // Subscribe to state changes (for React hooks)
 *   const unsubscribe = ThemeLoader.subscribe(state => { ... });
 * 
 * Architecture:
 *   @layer canvas-structure  ← Higher priority (Canvas owns)
 *   @layer theme             ← Lower priority (Themes go here)
 * 
 * Key Properties:
 *   - SINGLETON: Module-level state survives component remounts
 *   - IDEMPOTENT: Multiple calls return same promise, CSS injected once
 *   - OBSERVABLE: Hooks can subscribe to state changes
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ThemeLoadingState = 'idle' | 'loading' | 'loaded' | 'error';

export type StateChangeCallback = (state: ThemeLoadingState) => void;

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

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON STATE - Module level, survives React remounts
// ═══════════════════════════════════════════════════════════════════════════

let _state: ThemeLoadingState = 'idle';
let _loadingPromise: Promise<void> | null = null;
let _loadedUrlKey: string | null = null;
let _error: Error | null = null;
const _subscribers = new Set<StateChangeCallback>();
let _options: Required<ThemeLoaderOptions> = {
    styleId: 'dm-theme-layer',
    timeout: 10000,
    debug: false,
};

// ═══════════════════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function setState(newState: ThemeLoadingState): void {
    if (_state !== newState) {
        const oldState = _state;
        _state = newState;
        if (_options.debug) {
            console.log(`🎨 [ThemeLoader] State: ${oldState} → ${newState}`);
        }
        notifySubscribers();
    }
}

function notifySubscribers(): void {
    _subscribers.forEach(callback => {
        try {
            callback(_state);
        } catch (err) {
            console.error('[ThemeLoader] Subscriber error:', err);
        }
    });
}

function rewriteRelativeUrls(cssText: string, baseUrl: string): string {
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
}

function injectLayeredCSS(cssText: string, styleId: string, baseUrl?: string): void {
    // IDEMPOTENT: Check if already injected
    const existing = document.getElementById(styleId);
    if (existing) {
        if (_options.debug) {
            console.log(`🎨 [ThemeLoader] Style element already exists, skipping injection`);
        }
        return; // Don't re-inject!
    }

    // Rewrite relative URLs to absolute if baseUrl provided
    let processedCSS = cssText;
    if (baseUrl) {
        processedCSS = rewriteRelativeUrls(cssText, baseUrl);
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

    if (_options.debug) {
        console.log(`🎨 [ThemeLoader] Injected ${processedCSS.length} bytes into #${styleId}`);
    }
}

async function doLoad(urls: string[], baseUrl: string): Promise<void> {
    const { styleId, timeout, debug } = _options;

    // Build URL key for idempotency check
    const urlKey = urls.sort().join('|');

    // Already loaded these exact URLs? Return immediately.
    if (_loadedUrlKey === urlKey && document.getElementById(styleId)) {
        if (debug) {
            console.log(`🎨 [ThemeLoader] Already loaded, skipping fetch`);
        }
        return;
    }

    if (debug) {
        console.log(`🎨 [ThemeLoader] Loading ${urls.length} CSS files...`);
    }

    // Fetch all CSS files
    const cssTexts: string[] = [];
    for (const url of urls) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} loading ${url}`);
            }

            const cssText = await response.text();
            cssTexts.push(`/* Source: ${url} */\n${cssText}`);
        } catch (err) {
            clearTimeout(timeoutId);
            throw new Error(`Failed to load ${url}: ${err instanceof Error ? err.message : err}`);
        }
    }

    // Combine and inject (ONCE)
    const combinedCSS = cssTexts.join('\n\n');
    injectLayeredCSS(combinedCSS, styleId, baseUrl);

    // CRITICAL: Wait for browser to compute/apply CSS
    // CSS injection is synchronous, but style computation happens in subsequent frames.
    // Double RAF ensures styles are computed after the next paint.
    await new Promise<void>(resolve => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                resolve();
            });
        });
    });

    // Mark as loaded
    _loadedUrlKey = urlKey;

    if (debug) {
        console.log(`✅ [ThemeLoader] Loaded and applied ${combinedCSS.length} bytes from ${urls.length} files`);
        console.log(`   Base URL for relative paths: ${baseUrl}`);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════

export const ThemeLoader = {
    /**
     * Configure ThemeLoader options.
     * Call before ensureLoaded() for options to take effect.
     */
    configure(options: ThemeLoaderOptions): void {
        _options = { ..._options, ...options };
    },

    /**
     * Get current loading state (synchronous).
     * Safe to call from render.
     */
    getState(): ThemeLoadingState {
        return _state;
    },

    /**
     * Check if theme is loaded (synchronous).
     * Safe to call from render.
     */
    isLoaded(): boolean {
        return _state === 'loaded';
    },

    /**
     * Get loading error if any.
     */
    getError(): Error | null {
        return _error;
    },

    /**
     * Ensure theme is loaded. IDEMPOTENT - safe to call multiple times.
     * 
     * - If already loaded: Returns resolved promise immediately
     * - If currently loading: Returns existing loading promise (no duplicate work)
     * - If idle/error: Starts loading, returns new promise
     * 
     * This is the PRIMARY API for loading themes.
     * 
     * @param urls - CSS file URLs to load
     * @param baseUrl - Base URL for relative path rewriting (fonts, images)
     */
    async ensureLoaded(urls: string[], baseUrl: string): Promise<void> {
        // Already loaded - return immediately
        if (_state === 'loaded') {
            return Promise.resolve();
        }

        // Already loading - return existing promise (prevents race!)
        if (_state === 'loading' && _loadingPromise) {
            return _loadingPromise;
        }

        // Start loading
        setState('loading');
        _error = null;
        _loadingPromise = doLoad(urls, baseUrl);

        try {
            await _loadingPromise;
            setState('loaded');
        } catch (err) {
            _error = err instanceof Error ? err : new Error(String(err));
            setState('error');
            // Re-throw so caller knows loading failed
            throw _error;
        }
    },

    /**
     * Subscribe to state changes.
     * Returns unsubscribe function.
     * 
     * Callback is invoked immediately with current state,
     * then on every subsequent state change.
     */
    subscribe(callback: StateChangeCallback): () => void {
        _subscribers.add(callback);
        // Immediately notify of current state
        callback(_state);
        return () => {
            _subscribers.delete(callback);
        };
    },

    /**
     * Unload the current theme.
     * For testing or theme switching. In production, themes typically stay loaded.
     */
    unloadTheme(): void {
        const { styleId, debug } = _options;

        const existing = document.getElementById(styleId);
        if (existing) {
            existing.remove();
        }

        // Reset state
        _state = 'idle';
        _loadingPromise = null;
        _loadedUrlKey = null;
        _error = null;

        if (debug) {
            console.log(`🎨 [ThemeLoader] Theme unloaded, state reset to idle`);
        }

        // Notify subscribers of state change
        notifySubscribers();
    },

    /**
     * Get the currently loaded URL key (for debugging).
     */
    getLoadedUrlKey(): string | null {
        return _loadedUrlKey;
    },

    // ═══════════════════════════════════════════════════════════════════════
    // LEGACY API (deprecated, use ensureLoaded instead)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * @deprecated Use ensureLoaded() instead
     */
    async loadTheme(url: string): Promise<ThemeLoadResult> {
        try {
            await this.ensureLoaded([url], new URL(url).origin);
            return { success: true, url };
        } catch (err) {
            return {
                success: false,
                url,
                error: err instanceof Error ? err.message : String(err)
            };
        }
    },

    /**
     * @deprecated Use ensureLoaded() instead
     */
    async loadThemeBundle(urls: string[]): Promise<ThemeLoadResult[]> {
        const results: ThemeLoadResult[] = [];
        for (const url of urls) {
            results.push(await this.loadTheme(url));
        }
        return results;
    },

    /**
     * Load theme directly from CSS text.
     * For AI-generated or user-provided CSS.
     */
    loadThemeFromText(cssText: string, sourceId: string = 'custom'): ThemeLoadResult {
        const { styleId, debug } = _options;

        if (debug) {
            console.log(`🎨 [ThemeLoader] Loading theme from text (${cssText.length} bytes)`);
        }

        try {
            // For text loading, we inject directly (overwrite if exists)
            const existing = document.getElementById(styleId);
            if (existing) {
                existing.remove();
            }

            const style = document.createElement('style');
            style.id = styleId;
            style.setAttribute('data-theme-loader', 'true');
            style.textContent = `@layer theme {\n${cssText}\n}`;
            document.head.appendChild(style);

            setState('loaded');
            _loadedUrlKey = `text://${sourceId}`;

            return {
                success: true,
                url: `text://${sourceId}`,
                cssLength: cssText.length,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            _error = new Error(message);
            setState('error');
            return {
                success: false,
                error: message,
            };
        }
    },

    /**
     * Internal: For useTheme hook to inject combined CSS with baseUrl rewriting.
     * @deprecated Use ensureLoaded() instead - it handles everything.
     */
    _injectLayeredCSS(cssText: string, styleId: string, baseUrl?: string): void {
        injectLayeredCSS(cssText, styleId, baseUrl);
    },
};

export default ThemeLoader;
