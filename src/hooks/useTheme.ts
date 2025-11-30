/**
 * useTheme - React hook for loading CSS themes with layer injection
 * 
 * Automatically loads theme CSS on mount and cleans up on unmount.
 * Uses ThemeLoader to ensure themes are wrapped in @layer theme,
 * giving Canvas structural CSS higher priority.
 * 
 * Usage:
 *   const { isLoaded, error } = useTheme(DND_CSS_BASE_URL, ['all.css', 'bundle.css', 'style.css', '5ePHBstyle.css']);
 */

import { useState, useEffect, useRef } from 'react';
import { ThemeLoader, ThemeLoadResult } from '../utils/ThemeLoader';

export interface UseThemeOptions {
    /** Whether to enable debug logging */
    debug?: boolean;
    /** Whether to unload theme on unmount (default: false for shared themes) */
    unloadOnUnmount?: boolean;
}

export interface UseThemeResult {
    /** Whether the theme is currently loaded */
    isLoaded: boolean;
    /** Whether the theme is currently loading */
    isLoading: boolean;
    /** Error message if loading failed */
    error: string | null;
    /** Results from loading each CSS file */
    results: ThemeLoadResult[];
    /** Manually reload the theme */
    reload: () => Promise<void>;
    /** Manually unload the theme */
    unload: () => void;
}

/**
 * Hook to load a theme from a base URL with multiple CSS files
 */
export function useTheme(
    baseUrl: string | undefined,
    cssFiles: string[],
    options: UseThemeOptions = {}
): UseThemeResult {
    const { debug = false, unloadOnUnmount = false } = options;

    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<ThemeLoadResult[]>([]);

    const hasLoadedRef = useRef(false);

    const loadTheme = async () => {
        if (!baseUrl || cssFiles.length === 0) {
            if (debug) console.log('🎨 [useTheme] No baseUrl or cssFiles, skipping');
            return;
        }

        // Skip if already loaded (avoid double-loading in React strict mode)
        if (hasLoadedRef.current && ThemeLoader.isLoaded()) {
            if (debug) console.log('🎨 [useTheme] Theme already loaded, skipping');
            return;
        }

        setIsLoading(true);
        setError(null);

        // Configure ThemeLoader
        ThemeLoader.configure({ debug });

        // Build full URLs
        const urls = cssFiles.map(file => `${baseUrl}/${file}`);

        if (debug) console.log('🎨 [useTheme] Loading theme:', urls);

        // Fetch all CSS files and combine into a single layer injection
        const allCSS: string[] = [];
        const loadResults: ThemeLoadResult[] = [];

        for (const url of urls) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const cssText = await response.text();
                allCSS.push(`/* Source: ${url} */\n${cssText}`);
                loadResults.push({ success: true, url, cssLength: cssText.length });
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                loadResults.push({ success: false, url, error: message });
                console.error(`❌ [useTheme] Failed to load ${url}:`, message);
            }
        }

        // Inject combined CSS into theme layer
        if (allCSS.length > 0) {
            const combinedCSS = allCSS.join('\n\n');
            // Pass baseUrl for relative URL rewriting (fonts, images, etc.)
            ThemeLoader._injectLayeredCSS(combinedCSS, 'dm-theme-layer', baseUrl);

            // CRITICAL FIX: Wait for browser to compute/apply CSS before marking as loaded
            // CSS injection is synchronous, but style computation happens in subsequent render cycles.
            // Without this delay, measurements may be taken before styles are fully applied.
            // Using double RAF ensures styles are computed after the next paint.
            await new Promise<void>((resolve) => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        resolve();
                    });
                });
            });

            hasLoadedRef.current = true;
            setIsLoaded(true);

            if (debug) {
                console.log(`✅ [useTheme] Theme loaded and applied: ${combinedCSS.length} bytes from ${allCSS.length} files`);
                console.log(`   Base URL for relative paths: ${baseUrl}`);
            }
        }

        // Check for any failures
        const failures = loadResults.filter(r => !r.success);
        if (failures.length > 0) {
            setError(`Failed to load ${failures.length} CSS file(s)`);
        }

        setResults(loadResults);
        setIsLoading(false);
    };

    const unload = () => {
        ThemeLoader.unloadTheme();
        hasLoadedRef.current = false;
        setIsLoaded(false);
        setResults([]);
    };

    useEffect(() => {
        loadTheme();

        return () => {
            if (unloadOnUnmount) {
                unload();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseUrl, cssFiles.join(',')]);

    return {
        isLoaded,
        isLoading,
        error,
        results,
        reload: loadTheme,
        unload,
    };
}

/**
 * Hook to load the D&D PHB theme specifically
 */
export function usePHBTheme(baseUrl: string | undefined, options?: UseThemeOptions): UseThemeResult {
    return useTheme(
        baseUrl,
        ['all.css', 'bundle.css', 'style.css', '5ePHBstyle.css'],
        options
    );
}

export default useTheme;

