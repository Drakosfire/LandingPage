/**
 * useImageCapabilities - Fetches image generation capabilities from backend
 * 
 * Provides available models, styles, and constraints for the Generation Drawer Engine.
 * Designed to be called once at app/service startup and cached.
 */

import { useState, useEffect, useCallback } from 'react';
import { DUNGEONMIND_API_URL } from '../../../config';
import type { ImageGenerationModel, ImageGenerationStyle } from '../types';

/**
 * Response shape from /api/images/capabilities endpoint
 */
export interface ImageCapabilities {
  models: ImageGenerationModel[];
  styles: ImageGenerationStyle[];
  maxImages: number;
  defaultNumImages: number;
}

/**
 * Default capabilities when backend is unavailable
 */
const DEFAULT_CAPABILITIES: ImageCapabilities = {
  models: [
    { id: 'flux-pro', name: 'FLUX Pro', description: 'High quality, balanced speed', default: true }
  ],
  styles: [
    { id: 'classic_dnd', name: 'Classic D&D', suffix: 'in the style of classic Dungeons & Dragons art', default: true }
  ],
  maxImages: 4,
  defaultNumImages: 4
};

export interface UseImageCapabilitiesConfig {
  /** API endpoint (defaults to /api/images/capabilities) */
  endpoint?: string;
  /** Skip fetching and use defaults (for tutorial mode) */
  skip?: boolean;
  /** Override capabilities (for testing) */
  override?: Partial<ImageCapabilities>;
}

export interface UseImageCapabilitiesReturn {
  /** Available capabilities */
  capabilities: ImageCapabilities;
  /** Whether capabilities are loading */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Whether using default/fallback capabilities */
  isUsingDefaults: boolean;
  /** Manually refresh capabilities */
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch image generation capabilities from backend.
 * 
 * @example
 * ```tsx
 * const { capabilities, isLoading } = useImageCapabilities();
 * 
 * // Pass to drawer config
 * imageConfig: {
 *   models: capabilities.models,
 *   styles: capabilities.styles,
 *   maxImages: capabilities.maxImages
 * }
 * ```
 */
export function useImageCapabilities(
  config: UseImageCapabilitiesConfig = {}
): UseImageCapabilitiesReturn {
  const {
    endpoint = '/api/images/capabilities',
    skip = false,
    override
  } = config;

  const [capabilities, setCapabilities] = useState<ImageCapabilities>(DEFAULT_CAPABILITIES);
  const [isLoading, setIsLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);
  const [isUsingDefaults, setIsUsingDefaults] = useState(true);

  const fetchCapabilities = useCallback(async () => {
    if (skip) {
      console.log('📦 [ImageCapabilities] Skipped fetch (skip=true)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = endpoint.startsWith('http')
        ? endpoint
        : `${DUNGEONMIND_API_URL}${endpoint}`;

      console.log('📦 [ImageCapabilities] Fetching from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch capabilities: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Validate response shape
      if (!data.models || !Array.isArray(data.models)) {
        throw new Error('Invalid capabilities response: missing models array');
      }
      if (!data.styles || !Array.isArray(data.styles)) {
        throw new Error('Invalid capabilities response: missing styles array');
      }

      const fetchedCapabilities: ImageCapabilities = {
        models: data.models,
        styles: data.styles,
        maxImages: data.maxImages ?? 4,
        defaultNumImages: data.defaultNumImages ?? 4
      };

      // Apply overrides if provided
      const finalCapabilities = override
        ? { ...fetchedCapabilities, ...override }
        : fetchedCapabilities;

      setCapabilities(finalCapabilities);
      setIsUsingDefaults(false);

      console.log('✅ [ImageCapabilities] Loaded:', {
        models: finalCapabilities.models.length,
        styles: finalCapabilities.styles.length,
        maxImages: finalCapabilities.maxImages
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ [ImageCapabilities] Fetch failed:', message);
      setError(message);
      setIsUsingDefaults(true);
      // Keep using default capabilities on error
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, skip, override]);

  // Fetch on mount
  useEffect(() => {
    fetchCapabilities();
  }, [fetchCapabilities]);

  return {
    capabilities,
    isLoading,
    error,
    isUsingDefaults,
    refresh: fetchCapabilities
  };
}


