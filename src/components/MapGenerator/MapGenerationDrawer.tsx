/**
 * MapGenerationDrawer - Mode-based generation drawer
 * 
 * New simplified drawer with 4 modes:
 * - Generate: Create new maps from text prompts
 * - Inpaint: Generate content within masked regions
 * - Edit: Modify existing maps with optional masking
 * - SVG Mask: Generate procedural masks (coming soon)
 * 
 * Features:
 * - Single mode selector (no conflicting tabs)
 * - Fixed footer with art style selector and generate button
 * - Mode-specific content areas
 * - Compact style options
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Drawer,
  Stack,
  Box,
  ScrollArea,
  SegmentedControl,
  Group,
  Select,
  Button,
  Progress,
  Text,
  Paper,
  Alert,
} from '@mantine/core';
import {
  IconWand,
  IconMask,
  IconEdit,
  IconVectorSpline,
  IconPlayerPlay,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useMapGenerator } from './MapGeneratorProvider';
import { GenerateModeContent } from './GenerateModeContent';
import { InpaintModeContent } from './InpaintModeContent';
import { EditModeContent } from './EditModeContent';
import { SvgModeContent } from './SvgModeContent';
import { DEFAULT_STYLE_OPTIONS, type MapGenerationInput, type MapStyleOptions } from './mapTypes';
import { exportMaskToBase64 } from 'dungeonmind-canvas';
import { DUNGEONMIND_API_URL } from '../../config';

// Art style options for the footer selector
const ART_STYLES = [
  { value: 'hand-painted', label: 'Hand-Painted' },
  { value: 'digital', label: 'Digital' },
  { value: 'sketch', label: 'Sketch' },
  { value: 'pixel-art', label: 'Pixel Art' },
];

interface MapGenerationDrawerProps {
  opened: boolean;
  onClose: () => void;
  isTutorialMode?: boolean;
  onGenerationComplete?: () => void;
}

export function MapGenerationDrawer({
  opened,
  onClose,
  isTutorialMode = false,
  onGenerationComplete,
}: MapGenerationDrawerProps) {
  const {
    generationMode,
    setGenerationMode,
    handleGenerationComplete: contextHandleComplete,
    maskDrawingState,
    maskImageUrl,
    baseImageUrl,
    addGeneratedImage,
  } = useMapGenerator();

  // Input state
  const [input, setInput] = useState<MapGenerationInput>({
    prompt: '',
    styleOptions: DEFAULT_STYLE_OPTIONS,
  });

  // Edit mode specific state
  const [useMask, setUseMask] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);

  // Handle input changes
  const handleInputChange = useCallback((changes: Partial<MapGenerationInput>) => {
    setInput((prev) => ({ ...prev, ...changes }));
  }, []);

  // Handle prompt changes (for Inpaint and Edit modes)
  const handlePromptChange = useCallback((prompt: string) => {
    setInput((prev) => ({ ...prev, prompt }));
  }, []);

  // Check if we have a valid mask for inpaint/edit
  const hasDrawnMask = maskDrawingState.strokes.length > 0;
  const hasSavedMask = !!maskImageUrl;
  const hasMask = hasDrawnMask || hasSavedMask;

  // Determine if generate button should be enabled
  const canGenerate = (() => {
    if (isGenerating) return false;
    if (generationMode === 'svg') return false;
    if (generationMode === 'inpaint' && !hasMask) return false;
    if (!input.prompt || input.prompt.trim().length < 10) return false;
    return true;
  })();

  // Get button text based on mode
  const getButtonText = () => {
    switch (generationMode) {
      case 'generate':
        return 'Generate';
      case 'inpaint':
        return 'Inpaint';
      case 'edit':
        return 'Apply Edit';
      default:
        return 'Generate';
    }
  };

  /**
   * Convert image URL to base64 data URI format
   */
  const imageUrlToDataUri = async (url: string): Promise<string> => {
    if (url.startsWith('data:image/')) return url;

    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  /**
   * Get image dimensions from URL
   */
  const getImageDimensions = async (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = url;
    });
  };

  // Handle generation
  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    setProgress(0);
    setProgressMessage('Starting generation...');
    setGenerationStartTime(Date.now());

    try {
      // Build request payload based on mode
      const styleOptions = {
        fantasy_level: input.styleOptions.fantasyLevel,
        rendering: input.styleOptions.rendering,
        tone: input.styleOptions.tone,
        scale: input.styleOptions.scale,
        movement_space: input.styleOptions.movementSpace,
        cover_density: input.styleOptions.coverDensity,
        saturation: input.styleOptions.saturation,
        contrast: input.styleOptions.contrast,
        temperature: input.styleOptions.temperature,
        pathways: input.styleOptions.pathways,
        elevation_present: input.styleOptions.elevationPresent,
        texture_density: input.styleOptions.textureDensity,
      };

      const payload: Record<string, unknown> = {
        prompt: input.prompt,
        style_options: styleOptions,
      };

      // For inpaint or edit with mask, add mask data
      const needsMask =
        generationMode === 'inpaint' || (generationMode === 'edit' && useMask);

      let endpoint = '/api/mapgenerator/generate';

      if (needsMask && hasMask && baseImageUrl) {
        endpoint = '/api/mapgenerator/generate-masked';

        // Get mask data
        let maskData: string;

        if (hasDrawnMask) {
          // Export drawn mask
          const dimensions = await getImageDimensions(baseImageUrl);
          const maskExport = await exportMaskToBase64({
            width: dimensions.width,
            height: dimensions.height,
            strokes: maskDrawingState.strokes,
          });
          maskData = maskExport.base64.startsWith('data:image/')
            ? maskExport.base64
            : `data:image/png;base64,${maskExport.base64}`;
        } else {
          // Use saved mask
          maskData = await imageUrlToDataUri(maskImageUrl!);
        }

        // Get base image data
        const baseImageData = await imageUrlToDataUri(baseImageUrl);

        payload.mask_base64 = maskData;
        payload.base_image_base64 = baseImageData;
      }

      // Progress simulation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          const increment = Math.random() * 5 + 2;
          return Math.min(prev + increment, 90);
        });
      }, 500);

      // Messages based on progress
      const messageInterval = setInterval(() => {
        setProgress((current) => {
          if (current < 20) {
            setProgressMessage('Analyzing prompt...');
          } else if (current < 40) {
            setProgressMessage('Generating map structure...');
          } else if (current < 60) {
            setProgressMessage('Adding details...');
          } else if (current < 80) {
            setProgressMessage('Refining textures...');
          } else {
            setProgressMessage('Finalizing...');
          }
          return current;
        });
      }, 2000);

      // Make API request
      const response = await fetch(`${DUNGEONMIND_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      clearInterval(progressInterval);
      clearInterval(messageInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      setProgress(100);
      setProgressMessage('Complete!');

      // Handle successful generation
      const imageUrl = result.imageUrl || result.image_url;

      if (imageUrl) {
        // Add to project gallery
        addGeneratedImage({
          id: `gen-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          url: imageUrl,
          prompt: input.prompt,
          createdAt: new Date().toISOString(),
          sessionId: '',
          service: 'map',
        });

        // Update context
        contextHandleComplete({
          imageUrl,
          compiledPrompt: result.compiledPrompt || result.compiled_prompt,
          mapspec: result.mapspec,
          input: { prompt: input.prompt, styleOptions: input.styleOptions },
        });

        // Call external callback
        onGenerationComplete?.();

        console.log('✅ [MapGenerationDrawer] Generation complete:', imageUrl);
      }

      // Close drawer after short delay to show completion
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('❌ [MapGenerationDrawer] Generation error:', err);
      setError(err instanceof Error ? err.message : 'Generation failed');
      setIsGenerating(false);
      setProgress(0);
      setGenerationStartTime(null);
    }
  };

  // Handle retry
  const handleRetry = () => {
    setError(null);
    handleGenerate();
  };

  // Reset error when mode changes
  useEffect(() => {
    setError(null);
  }, [generationMode]);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Generate Battle Map"
      position="left"
      size="lg"
      padding={0}
      styles={{
        content: {
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100vh',
        },
        header: {
          flex: '0 0 auto',
        },
        body: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0,
        },
      }}
    >
      <Stack h="100%" gap={0} style={{ overflow: 'hidden' }}>
        {/* Mode Selector */}
        <Box p="md" pb={0} style={{ flexShrink: 0 }}>
          <SegmentedControl
            fullWidth
            value={generationMode}
            onChange={(value) => setGenerationMode(value as typeof generationMode)}
            disabled={isGenerating}
            data={[
              {
                value: 'generate',
                label: (
                  <Group gap={6} wrap="nowrap">
                    <IconWand size={16} />
                    <span>Generate</span>
                  </Group>
                ),
              },
              {
                value: 'inpaint',
                label: (
                  <Group gap={6} wrap="nowrap">
                    <IconMask size={16} />
                    <span>Inpaint</span>
                  </Group>
                ),
              },
              {
                value: 'edit',
                label: (
                  <Group gap={6} wrap="nowrap">
                    <IconEdit size={16} />
                    <span>Edit</span>
                  </Group>
                ),
              },
              {
                value: 'svg',
                disabled: true,
                label: (
                  <Group gap={6} wrap="nowrap">
                    <IconVectorSpline size={16} />
                    <span>SVG</span>
                  </Group>
                ),
              },
            ]}
          />
        </Box>

        {/* Scrollable Content Area */}
        <ScrollArea flex={1} p="md" style={{ minHeight: 0 }}>
          {/* Error Display */}
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Generation Failed"
              color="red"
              withCloseButton
              onClose={() => setError(null)}
              mb="md"
            >
              <Stack gap="xs">
                <Text size="sm">{error}</Text>
                <Button size="xs" variant="light" color="red" onClick={handleRetry}>
                  Try Again
                </Button>
              </Stack>
            </Alert>
          )}

          {/* Progress Panel (when generating) */}
          {isGenerating && (
            <Paper p="md" mb="md" withBorder bg="violet.0">
              <Stack gap="sm">
                <Group gap="xs">
                  <IconWand size={16} />
                  <Text size="sm" fw={500}>{progressMessage}</Text>
                </Group>
                <Progress value={progress} color="violet" animated />
                <Text size="xs" c="dimmed" ta="center">
                  {Math.round(progress)}% complete
                </Text>
              </Stack>
            </Paper>
          )}

          {/* Mode-specific Content */}
          {generationMode === 'generate' && (
            <GenerateModeContent
              input={input}
              onInputChange={handleInputChange}
              isGenerating={isGenerating}
            />
          )}

          {generationMode === 'inpaint' && (
            <InpaintModeContent
              prompt={input.prompt}
              onPromptChange={handlePromptChange}
              isGenerating={isGenerating}
            />
          )}

          {generationMode === 'edit' && (
            <EditModeContent
              prompt={input.prompt}
              onPromptChange={handlePromptChange}
              isGenerating={isGenerating}
              useMask={useMask}
              onUseMaskChange={setUseMask}
            />
          )}

          {generationMode === 'svg' && <SvgModeContent />}
        </ScrollArea>

        {/* Fixed Footer */}
        <Box
          p="md"
          style={{
            flexShrink: 0,
            borderTop: '1px solid var(--mantine-color-gray-3)',
            backgroundColor: 'var(--mantine-color-body)',
          }}
        >
          <Group justify="space-between">
            <Select
              size="sm"
              label="Art Style"
              data={ART_STYLES}
              value={input.styleOptions.rendering}
              onChange={(value) =>
                value &&
                handleInputChange({
                  styleOptions: {
                    ...input.styleOptions,
                    rendering: value as MapStyleOptions['rendering'],
                  },
                })
              }
              disabled={isGenerating || generationMode === 'svg'}
              w={160}
              allowDeselect={false}
            />
            <Button
              size="md"
              rightSection={<IconPlayerPlay size={16} />}
              onClick={handleGenerate}
              disabled={!canGenerate}
              loading={isGenerating}
            >
              {getButtonText()}
            </Button>
          </Group>
        </Box>
      </Stack>
    </Drawer>
  );
}

export default MapGenerationDrawer;
