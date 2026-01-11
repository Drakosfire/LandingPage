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
  const { maskConfig, maskDrawingState, baseImageUrl, clearMask, maskImageUrl } = useMapGenerator();
  const [isApplyingMask, setIsApplyingMask] = React.useState(!!value.maskData);
  const [isViewingSavedMask, setIsViewingSavedMask] = React.useState(false);

  // Auto-reset mask toggle when mask strokes are cleared AND no saved mask exists
  // This handles the case where handleGenerationComplete clears the mask from the canvas
  React.useEffect(() => {
    // If mask was being applied but strokes are now cleared and no saved mask, reset everything
    // (If saved mask exists, user can still use it)
    if (isApplyingMask && maskDrawingState.strokes.length === 0 && !maskImageUrl) {
      console.log('🎭 [MapInputForm] Auto-resetting mask toggle (strokes were cleared, no saved mask)');
      setIsApplyingMask(false);
      // Also clear the input's mask data to complete the reset
      if (value.maskData) {
        onChange({
          ...value,
          maskData: null,
          baseImageData: null,
        });
      }
    }
  }, [isApplyingMask, maskDrawingState.strokes.length, value.maskData, value, onChange, maskImageUrl]);

  // Debug: Log mask state to understand why toggle might not show
  React.useEffect(() => {
    console.log('🎭 [MapInputForm] Mask state:', {
      hasBaseImage: !!baseImageUrl,
      strokeCount: maskDrawingState.strokes.length,
      hasSavedMask: !!maskImageUrl,
      savedMaskUrl: maskImageUrl?.substring(0, 50) || null,
      isApplyingMask,
      isViewingSavedMask,
      baseImageUrl: baseImageUrl?.substring(0, 50) + '...',
    });
  }, [baseImageUrl, maskDrawingState.strokes.length, isApplyingMask, maskImageUrl, isViewingSavedMask]);

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
      // Priority 1: Fresh strokes on canvas
      if (maskDrawingState.strokes.length > 0 && baseImageUrl) {
        try {
          console.log('🎭 [MapInputForm] Using fresh strokes for mask');
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
      }
      // Priority 2: Saved mask from project
      else if (maskImageUrl && baseImageUrl) {
        try {
          console.log('🎭 [MapInputForm] Using saved mask from project:', maskImageUrl);
          // Convert saved mask URL to base64
          const savedMaskData = await imageUrlToDataUri(maskImageUrl);
          // Convert base image URL to base64 data URI
          const baseImageData = await imageUrlToDataUri(baseImageUrl);

          onChange({
            ...value,
            maskData: savedMaskData,
            baseImageData: baseImageData,
          });
        } catch (err) {
          console.error('❌ [MapInputForm] Failed to load saved mask:', err);
          setIsApplyingMask(false);
        }
      }
      // No mask available
      else {
        console.log('🎭 [MapInputForm] No mask available');
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
  const hasFreshStrokes = baseImageUrl && maskDrawingState.strokes.length > 0;
  // Check if saved mask exists from project
  const hasSavedMask = !!maskImageUrl;
  // Either fresh strokes or saved mask can be used
  const hasMaskReady = hasFreshStrokes || hasSavedMask;

  // ═══════════════════════════════════════════════════════════════════════════
  // INPAINT MODE - Drastically simplified UI when mask is active
  // ═══════════════════════════════════════════════════════════════════════════
  if (hasMaskReady && isApplyingMask) {
    return (
      <Stack gap="md">
        {/* Inpaint Mode Header */}
        <Group justify="space-between" align="center" p="sm" style={{ 
          backgroundColor: 'var(--mantine-color-blue-1)', 
          borderRadius: 'var(--mantine-radius-md)',
          border: '2px solid var(--mantine-color-blue-6)'
        }}>
          <Stack gap={4}>
            <Group gap="xs">
              <span style={{ fontSize: '1.1rem' }}>🎭</span>
              <span style={{ fontWeight: 600, color: 'var(--mantine-color-blue-7)' }}>Inpaint Mode</span>
            </Group>
            <span style={{ fontSize: '0.8rem', color: 'var(--mantine-color-dimmed)' }}>
              Generating only within the masked region
            </span>
          </Stack>
          <Button
            size="xs"
            variant="light"
            color="gray"
            onClick={() => handleApplyMaskToggle(false)}
            disabled={isGenerating}
          >
            Exit Inpaint Mode
          </Button>
        </Group>

        {/* Mask Preview with Delete */}
        {value.maskData && (
          <Group justify="center" gap="md" p="sm" style={{
            backgroundColor: 'var(--mantine-color-gray-0)',
            borderRadius: 'var(--mantine-radius-md)'
          }}>
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
              Clear Mask
            </Button>
          </Group>
        )}

        {/* Inpaint Prompt - Simplified, focused input */}
        <Textarea
          label="What should appear in the masked area?"
          placeholder="Describe what to add... (e.g., 'a small campfire with bedrolls', 'dense forest undergrowth', 'a stone bridge')"
          value={value.prompt}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onChange({ ...value, prompt: e.target.value })
          }
          minRows={2}
          maxRows={4}
          disabled={isGenerating}
          required
          error={errors?.prompt}
          data-testid="map-prompt-input"
          styles={{
            input: {
              backgroundColor: 'var(--mantine-color-white)',
              border: '2px solid var(--mantine-color-blue-3)',
            }
          }}
        />

        {/* Note about inpaint generation */}
        <span style={{ 
          fontSize: '0.75rem', 
          color: 'var(--mantine-color-dimmed)',
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          Style options are inherited from the base image. Only the masked region will be regenerated.
        </span>
      </Stack>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NORMAL MODE - Full generation form
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <Stack gap="md">
      {/* Main Prompt Input */}
      <Textarea
        label="Map Description"
        placeholder="Describe your battle map... (e.g., 'A forest clearing at the moment of transition, where settled ground loosens into rising roots and layered undergrowth')"
        value={value.prompt}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onChange({ ...value, prompt: e.target.value })
        }
        minRows={4}
        maxRows={8}
        disabled={isGenerating}
        required
        error={errors?.prompt}
        data-testid="map-prompt-input"
      />

      <Divider label="Style Options" labelPosition="center" />

      {/* Style Toggles */}
      <MapStyleToggles
        value={value.styleOptions}
        onChange={handleStyleOptionsChange}
      />

      {/* Mask / Inpaint Section - Always visible */}
      <Divider label="Inpaint Options" labelPosition="center" />
      
      {/* Saved Mask Preview - Show when saved mask exists */}
      {hasSavedMask && !hasFreshStrokes && (
        <Group justify="space-between" align="center" p="sm" style={{
          backgroundColor: 'var(--mantine-color-grape-0)',
          borderRadius: 'var(--mantine-radius-md)',
          border: '1px solid var(--mantine-color-grape-3)'
        }}>
          <Group gap="sm">
            <MaskPreview maskData={maskImageUrl} />
            <Stack gap={2}>
              <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Saved Mask</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--mantine-color-dimmed)' }}>
                From project • Can be used for inpainting
              </span>
            </Stack>
          </Group>
          <Button
            size="xs"
            variant="light"
            color="grape"
            onClick={() => setIsViewingSavedMask(!isViewingSavedMask)}
          >
            {isViewingSavedMask ? 'Hide' : 'Preview'}
          </Button>
        </Group>
      )}
      
      {/* Saved Mask Full Preview - Expandable */}
      {isViewingSavedMask && hasSavedMask && (
        <Group justify="center" p="md" style={{
          backgroundColor: 'var(--mantine-color-dark-9)',
          borderRadius: 'var(--mantine-radius-md)'
        }}>
          <img 
            src={maskImageUrl!} 
            alt="Saved mask preview" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '200px',
              borderRadius: 'var(--mantine-radius-sm)',
              border: '2px solid var(--mantine-color-grape-5)'
            }} 
          />
        </Group>
      )}

      {/* Mask Toggle */}
      <Stack gap="xs" p="sm" style={{ 
        backgroundColor: hasMaskReady 
          ? 'var(--mantine-color-blue-light)' 
          : 'var(--mantine-color-gray-light)',
        borderRadius: 'var(--mantine-radius-md)',
        border: hasMaskReady ? '2px solid var(--mantine-color-blue-6)' : 'none'
      }}>
        <Switch
          label="Apply Mask to Generation"
          description={
            hasFreshStrokes 
              ? "Use drawn mask for inpainting - generate only within the masked region"
              : hasSavedMask 
                ? "Use saved mask for inpainting - generate only within the masked region"
                : "Draw a mask on the map first, then enable this toggle"
          }
          checked={isApplyingMask}
          onChange={(e) => handleApplyMaskToggle(e.currentTarget.checked)}
          disabled={isGenerating || !hasMaskReady}
          size="md"
          data-testid="apply-mask-toggle"
        />
        {hasFreshStrokes && hasSavedMask && (
          <span style={{ fontSize: '0.75rem', color: 'var(--mantine-color-blue-7)', fontStyle: 'italic' }}>
            Using new mask strokes (overwrites saved mask)
          </span>
        )}
      </Stack>
    </Stack>
  );
};

export default MapInputForm;
