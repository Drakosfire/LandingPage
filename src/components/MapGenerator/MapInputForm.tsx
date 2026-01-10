/**
 * Map Input Form - Input component for GenerationDrawerEngine
 * 
 * Provides the input form for map generation with prompt and style toggles.
 * Persists prompt and style options to localStorage for recovery across sessions.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { Stack, Textarea, Divider, Switch, Group, Button } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import type { MapGenerationInput } from './mapTypes';
import type { InputSlotProps } from '../../shared/GenerationDrawerEngine';
import MapStyleToggles from './MapStyleToggles';
import { MaskPreview } from './MaskPreview';
import { useMapGenerator } from './MapGeneratorProvider';
import { exportMaskToBase64 } from 'dungeonmind-canvas';
import { saveMapInput } from './utils/persistence';

/**
 * MapInputForm component for the GenerationDrawerEngine.
 * 
 * Provides:
 * - Prompt textarea for map description
 * - Style toggles (fantasy level, rendering, tone, layout, palette, etc.)
 */
const MapInputForm: React.FC<InputSlotProps<MapGenerationInput>> = ({
  value,
  onChange,
  isGenerating,
  errors
}) => {
  const { maskConfig, maskDrawingState, baseImageUrl, clearMask } = useMapGenerator();
  const [isApplyingMask, setIsApplyingMask] = React.useState(!!value.maskData);

  // Auto-reset mask toggle when mask is cleared (e.g., after generation completes)
  // This handles the case where handleGenerationComplete clears the mask
  React.useEffect(() => {
    if (isApplyingMask && maskDrawingState.strokes.length === 0 && !value.maskData) {
      console.log('🎭 [MapInputForm] Auto-resetting mask toggle (mask was cleared)');
      setIsApplyingMask(false);
    }
  }, [isApplyingMask, maskDrawingState.strokes.length, value.maskData]);

  // Debug: Log mask state to understand why toggle might not show
  React.useEffect(() => {
    console.log('🎭 [MapInputForm] Mask state:', {
      hasBaseImage: !!baseImageUrl,
      strokeCount: maskDrawingState.strokes.length,
      shouldShowToggle: baseImageUrl && maskDrawingState.strokes.length > 0,
      isApplyingMask,
      baseImageUrl: baseImageUrl?.substring(0, 50) + '...',
    });
  }, [baseImageUrl, maskDrawingState.strokes.length, isApplyingMask]);

  // Debounced save of prompt and style options to localStorage
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef(false);
  
  useEffect(() => {
    // Skip the first render (initial load) to avoid overwriting loaded values
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      return;
    }
    
    // Debounce saves to avoid excessive writes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveMapInput({
        prompt: value.prompt,
        styleOptions: value.styleOptions,
      });
    }, 1000); // 1 second debounce
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [value.prompt, value.styleOptions]);

  const handleStyleOptionsChange = useCallback((newStyleOptions: typeof value.styleOptions) => {
    onChange({
      ...value,
      styleOptions: newStyleOptions,
    });
  }, [onChange, value]);

  /**
   * Convert image URL to base64 data URI format
   */
  const imageUrlToDataUri = async (url: string): Promise<string> => {
    // If already a data URI, return as-is
    if (url.startsWith('data:image/')) {
      return url;
    }

    // Fetch image and convert to base64
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error('❌ [MapInputForm] Failed to convert image to data URI:', err);
      throw err;
    }
  };

  /**
   * Normalize base64 string to data URI format
   */
  const normalizeToDataUri = (data: string): string => {
    // If already a data URI, return as-is
    if (data.startsWith('data:image/')) {
      return data;
    }
    // Otherwise, assume it's raw base64 and add PNG data URI prefix
    return `data:image/png;base64,${data}`;
  };

  /**
   * Get image dimensions from URL
   */
  const getImageDimensions = async (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  /**
   * Handle mask deletion
   */
  const handleDeleteMask = () => {
    setIsApplyingMask(false);
    onChange({
      ...value,
      maskData: null,
      baseImageData: null,
    });
    // Also clear mask from canvas
    clearMask();
  };

  const handleApplyMaskToggle = async (checked: boolean) => {
    setIsApplyingMask(checked);
    
    if (checked) {
      // Export mask and base image to base64
      if (maskDrawingState.strokes.length > 0 && baseImageUrl) {
        try {
          // Get actual image dimensions
          const dimensions = await getImageDimensions(baseImageUrl);
          
          const maskExport = await exportMaskToBase64({
            width: dimensions.width,
            height: dimensions.height,
            strokes: maskDrawingState.strokes,
          });

          // Normalize mask to ensure data URI format
          const normalizedMaskData = normalizeToDataUri(maskExport.base64);

          // Convert base image URL to base64 data URI
          const baseImageData = await imageUrlToDataUri(baseImageUrl);

          onChange({
            ...value,
            maskData: normalizedMaskData,
            baseImageData: baseImageData,
          });
        } catch (err) {
          console.error('❌ [MapInputForm] Failed to export mask:', err);
          setIsApplyingMask(false);
        }
      } else {
        // No mask drawn or no base image
        setIsApplyingMask(false);
      }
    } else {
      // Remove mask data
      onChange({
        ...value,
        maskData: null,
        baseImageData: null,
      });
    }
  };

  // Check if mask is ready to apply (strokes drawn on base image)
  const hasMaskReady = baseImageUrl && maskDrawingState.strokes.length > 0;

  return (
    <Stack gap="md">
      {/* Apply Mask - PROMINENT at top when mask is ready */}
      {hasMaskReady && (
        <>
          <Group justify="space-between" align="flex-start" p="sm" style={{ 
            backgroundColor: 'var(--mantine-color-blue-light)', 
            borderRadius: 'var(--mantine-radius-md)',
            border: '2px solid var(--mantine-color-blue-6)'
          }}>
            <Stack gap="xs" style={{ flex: 1 }}>
              <Switch
                label="Apply Mask to Generation"
                description="Generate content only within the masked region using GPT Image 1.5"
                checked={isApplyingMask}
                onChange={(e) => handleApplyMaskToggle(e.currentTarget.checked)}
                disabled={isGenerating}
                size="md"
                data-testid="apply-mask-toggle"
              />
            </Stack>
            {value.maskData && (
              <Stack gap="xs" align="flex-end">
                <MaskPreview
                  maskData={value.maskData}
                  onDelete={handleDeleteMask}
                />
                <Button
                  size="xs"
                  variant="subtle"
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={handleDeleteMask}
                >
                  Delete Mask
                </Button>
              </Stack>
            )}
          </Group>
          <Divider />
        </>
      )}

      {/* Main Prompt Input */}
      <Textarea
        label={hasMaskReady && isApplyingMask ? "Describe what to generate in the masked region" : "Map Description"}
        placeholder={hasMaskReady && isApplyingMask 
          ? "Describe what to add... (e.g., 'a small campfire with bedrolls')"
          : "Describe your battle map... (e.g., 'A forest clearing at the moment of transition, where settled ground loosens into rising roots and layered undergrowth')"
        }
        value={value.prompt}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onChange({ ...value, prompt: e.target.value })
        }
        minRows={hasMaskReady && isApplyingMask ? 2 : 4}
        maxRows={8}
        disabled={isGenerating}
        required
        error={errors?.prompt}
        data-testid="map-prompt-input"
      />

      {/* Style Options - HIDDEN in inpainting mode for simplified UX */}
      {!(hasMaskReady && isApplyingMask) && (
        <>
          <Divider label="Style Options" labelPosition="center" />

          {/* Style Toggles */}
          <MapStyleToggles
            value={value.styleOptions}
            onChange={handleStyleOptionsChange}
          />
        </>
      )}

      {/* Mask hint - Show when base image exists but no mask drawn yet */}
      {baseImageUrl && !hasMaskReady && (
        <>
          <Divider label="Mask Options" labelPosition="center" />
          <Stack gap="xs" p="sm" style={{ 
            backgroundColor: 'var(--mantine-color-gray-light)',
            borderRadius: 'var(--mantine-radius-md)'
          }}>
            <Switch
              label="Apply Mask"
              description="Draw a mask on the map first, then enable this toggle"
              checked={false}
              disabled
              data-testid="apply-mask-toggle-disabled"
            />
          </Stack>
        </>
      )}
    </Stack>
  );
};

export default MapInputForm;
