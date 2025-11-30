/**
 * useTheme - React hook for loading CSS themes
 * 
 * SIMPLIFIED: This hook now just observes the ThemeLoader singleton.
 * All state management happens in ThemeLoader (survives React remounts).
 * 
 * Usage:
 *   const { isLoaded, error } = usePHBTheme(DND_CSS_BASE_URL);
 *   
 *   // Wait for theme before measuring
 *   const ready = fontsReady && isLoaded;
 */

import { useState, useEffect, useMemo } from 'react';
import { ThemeLoader, ThemeLoadingState } from '../utils/ThemeLoader';

export interface UseThemeOptions {
    /** Whether to enable debug logging */
    debug?: boolean;
}

export interface UseThemeResult {
    /** Whether the theme is currently loaded */
    isLoaded: boolean;
    /** Whether the theme is currently loading */
    isLoading: boolean;
    /** Error message if loading failed */
    error: string | null;
    /** Manually reload the theme (forces re-fetch) */
    reload: () => Promise<void>;
    /** Manually unload the theme */
    unload: () => void;
}

/**
 * Hook to load a theme from a base URL with multiple CSS files.
 * 
 * SAFE FOR STRICT MODE: Uses ThemeLoader singleton for state.
 * Multiple component instances share the same loading state.
 */
export function useTheme(
    baseUrl: string | undefined,
    cssFiles: string[],
    options: UseThemeOptions = {}
): UseThemeResult {
    const { debug = false } = options;

    // Subscribe to singleton state changes
    const [state, setState] = useState<ThemeLoadingState>(ThemeLoader.getState());

    // Memoize the URL list to prevent unnecessary effect triggers
    const urlsKey = useMemo(() => cssFiles.join(','), [cssFiles]);

    useEffect(() => {
        // Configure debug mode
        ThemeLoader.configure({ debug });

        // Subscribe to state changes from singleton
        const unsubscribe = ThemeLoader.subscribe((newState) => {
            setState(newState);
        });

        return unsubscribe;
    }, [debug]);

    useEffect(() => {
        if (!baseUrl || cssFiles.length === 0) {
            if (debug) console.log('🎨 [useTheme] No baseUrl or cssFiles, skipping');
            return;
        }

        // Build full URLs
        const urls = cssFiles.map(file => `${baseUrl}/${file}`);

        // Trigger load (IDEMPOTENT - safe to call multiple times)
        // If already loaded, this returns immediately.
        // If already loading, this returns the existing promise.
        ThemeLoader.ensureLoaded(urls, baseUrl).catch((err) => {
            // Error is captured in singleton state, but log for visibility
            console.error('❌ [useTheme] Theme loading failed:', err);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseUrl, urlsKey]);

    const reload = async (): Promise<void> => {
        if (!baseUrl || cssFiles.length === 0) return;

        // Force reload by unloading first
        ThemeLoader.unloadTheme();

        const urls = cssFiles.map(file => `${baseUrl}/${file}`);
        await ThemeLoader.ensureLoaded(urls, baseUrl);
    };

    const unload = (): void => {
        ThemeLoader.unloadTheme();
    };

    const error = ThemeLoader.getError();

    return {
        isLoaded: state === 'loaded',
        isLoading: state === 'loading',
        error: error?.message ?? null,
        reload,
        unload,
    };
}

/**
 * Hook to load the D&D PHB theme specifically.
 * 
 * Usage:
 *   const { isLoaded } = usePHBTheme(DND_CSS_BASE_URL);
 */
export function usePHBTheme(
    baseUrl: string | undefined, 
    options?: UseThemeOptions
): UseThemeResult {
    return useTheme(
        baseUrl,
        ['all.css', 'bundle.css', 'style.css', '5ePHBstyle.css'],
        options
    );
}

export default useTheme;
