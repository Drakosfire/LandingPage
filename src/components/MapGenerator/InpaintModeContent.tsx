/**
 * InpaintModeContent Component
 * 
 * Content for the "Inpaint" mode - generate content within masked regions.
 * Includes: active mask preview, prompt, saved masks gallery, base image gallery.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Stack,
  Textarea,
  Group,
  Button,
  Text,
  ScrollArea,
  Divider,
  Paper,
  Box,
  ThemeIcon,
  Badge,
  Loader,
} from '@mantine/core';
import { IconMask, IconBrush, IconTrash, IconDownload } from '@tabler/icons-react';
import { exportMaskToBase64 } from 'dungeonmind-canvas';
import { useMapGenerator } from './MapGeneratorProvider';
import { ProjectGallery } from '../../shared/GenerationDrawerEngine/components/ProjectGallery';
import { MaskGallery } from '../../shared/GenerationDrawerEngine/components/MaskGallery';
import { MaskPreview } from './MaskPreview';
import { DEFAULT_PAPYRUS_TEXTURE_URL } from './mapTypes';

interface InpaintModeContentProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  isGenerating: boolean;
}

export function InpaintModeContent({
  prompt,
  onPromptChange,
  isGenerating,
}: InpaintModeContentProps) {
  const {
    maskDrawingState,
    maskImageUrl,
    generatedImages,
    baseImageUrl,
    setBaseImageUrl,
    setMaskEnabled,
    clearMask,
    setMaskImageUrl,
  } = useMapGenerator();

  // State for generated mask preview from drawn strokes
  const [drawnMaskPreview, setDrawnMaskPreview] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Check if we have an active mask (drawn strokes or saved mask)
  const hasDrawnMask = maskDrawingState.strokes.length > 0;
  const hasSavedMask = !!maskImageUrl;
  const hasMask = hasDrawnMask || hasSavedMask;

  // Generate preview image from drawn strokes
  useEffect(() => {
    // Clear preview if no strokes
    if (maskDrawingState.strokes.length === 0) {
      setDrawnMaskPreview(null);
      return;
    }

    // Debounce the preview generation to avoid excessive renders
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsGeneratingPreview(true);
      try {
        // Get base image dimensions
        const img = new Image();
        img.crossOrigin = 'anonymous';

        const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.onerror = () => {
            // Fallback to default dimensions if image load fails
            console.warn('🎭 [InpaintMode] Failed to load base image, using fallback dimensions');
            resolve({ width: 1024, height: 1024 });
          };
          // Set a timeout in case the image never loads
          const timeout = setTimeout(() => {
            console.warn('🎭 [InpaintMode] Base image load timeout, using fallback dimensions');
            resolve({ width: 1024, height: 1024 });
          }, 3000);
          img.onload = () => {
            clearTimeout(timeout);
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
          };
          img.src = baseImageUrl;
        });

        // Export mask strokes to base64
        const maskExport = await exportMaskToBase64({
          width: dimensions.width,
          height: dimensions.height,
          strokes: maskDrawingState.strokes,
        });

        console.log('🎭 [InpaintMode] Generated mask preview');
        setDrawnMaskPreview(maskExport.base64);
      } catch (err) {
        console.error('❌ [InpaintMode] Failed to generate mask preview:', err);
        setDrawnMaskPreview(null);
      } finally {
        setIsGeneratingPreview(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [maskDrawingState.strokes, baseImageUrl]);

  // Handle "Draw New" - enable mask mode on canvas
  const handleDrawNew = () => {
    setMaskEnabled(true);
    console.log('🎭 [InpaintMode] Enabling mask drawing mode');
  };

  // Handle mask clear
  const handleClearMask = () => {
    clearMask();
    console.log('🎭 [InpaintMode] Mask cleared');
  };

  // Handle base image selection
  const handleBaseImageSelect = (image: { url: string }, index: number) => {
    setBaseImageUrl(image.url);
    console.log('🖼️ [InpaintMode] Base image selected:', index);
  };

  // Handle saved mask selection
  const handleMaskSelect = (mask: { url: string; id?: string }) => {
    setMaskImageUrl(mask.url);
    console.log('🎭 [InpaintMode] Saved mask selected:', mask.id || 'unknown');
  };

  // Build mask images for gallery from project's saved mask
  const savedMasks = hasSavedMask
    ? [
      {
        id: 'current-mask',
        url: maskImageUrl!,
        projectName: 'Current Project',
        updatedAt: new Date().toISOString(),
      },
    ]
    : [];

  return (
    <Stack gap="md">
      {/* Active Mask Status */}
      <Paper p="md" withBorder bg={hasMask ? 'blue.0' : 'gray.0'}>
        <Group gap="md" align="flex-start">
          {/* Mask Preview */}
          <Box w={100} h={100} style={{ flexShrink: 0 }}>
            {hasDrawnMask ? (
              <Paper
                p={0}
                withBorder
                h="100%"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--mantine-color-dark-9)',
                  overflow: 'hidden',
                }}
              >
                {isGeneratingPreview ? (
                  <Loader size="sm" color="blue" />
                ) : drawnMaskPreview ? (
                  <img
                    src={drawnMaskPreview}
                    alt="Drawn mask preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <Text size="xs" c="dimmed" ta="center" p="xs">
                    Mask drawn on canvas
                  </Text>
                )}
              </Paper>
            ) : hasSavedMask ? (
              <MaskPreview maskData={maskImageUrl!} />
            ) : (
              <Paper
                p="xs"
                withBorder
                h="100%"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ThemeIcon size={40} variant="light" color="gray">
                  <IconMask size={24} />
                </ThemeIcon>
              </Paper>
            )}
          </Box>

          {/* Mask Status & Actions */}
          <Stack gap="xs" style={{ flex: 1 }}>
            {hasMask ? (
              <>
                <Group gap="xs">
                  <Badge color="blue" variant="filled">
                    Mask Ready
                  </Badge>
                  {hasDrawnMask && <Badge color="grape" variant="light">Drawn</Badge>}
                  {hasSavedMask && !hasDrawnMask && <Badge color="green" variant="light">Saved</Badge>}
                </Group>
                <Text size="xs" c="dimmed">
                  Mask defines map structure. Entire image will be filled.
                </Text>
                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconBrush size={14} />}
                    onClick={handleDrawNew}
                    disabled={isGenerating}
                  >
                    Draw New
                  </Button>
                  <Button
                    size="xs"
                    variant="subtle"
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={handleClearMask}
                    disabled={isGenerating}
                  >
                    Clear
                  </Button>
                </Group>
              </>
            ) : (
              <>
                <Text fw={500}>No mask drawn</Text>
                <Text size="xs" c="dimmed">
                  Draw on the canvas or select a saved mask below
                </Text>
                <Button
                  size="xs"
                  variant="filled"
                  leftSection={<IconBrush size={14} />}
                  onClick={handleDrawNew}
                  disabled={isGenerating}
                >
                  Draw Mask
                </Button>
              </>
            )}
          </Stack>
        </Group>
      </Paper>

      {/* Inpaint Prompt */}
      <Textarea
        label="Describe your map (mask defines the structure)"
        placeholder="a natural cave system with multiple chambers, a dungeon with stone corridors, a forest clearing..."
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        disabled={isGenerating}
        minRows={2}
        maxRows={4}
        maxLength={8000}
        required
        description={`The mask shape defines your map's structure. The entire image will be filled - no white space. (${prompt.length}/8000 characters)`}
        data-testid="inpaint-prompt-input"
        error={prompt.length > 8000 ? 'Prompt exceeds maximum length of 8000 characters' : undefined}
      />

      {/* Saved Masks Gallery */}
      <Divider label="Saved Masks" labelPosition="center" />
      {savedMasks.length > 0 ? (
        <ScrollArea h={100}>
          <MaskGallery
            masks={savedMasks}
            selectedMaskUrl={hasSavedMask && !hasDrawnMask ? maskImageUrl : null}
            onMaskSelect={handleMaskSelect}
          />
        </ScrollArea>
      ) : (
        <Paper p="sm" withBorder style={{ textAlign: 'center' }}>
          <Group gap="xs" justify="center">
            <IconDownload size={16} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">
              No saved masks. Draw a mask and it will be saved after generation.
            </Text>
          </Group>
        </Paper>
      )}

      {/* Base Images Gallery */}
      <Divider label="Base Image (select to mask)" labelPosition="center" />
      <ScrollArea h={100}>
        <ProjectGallery
          images={[
            // Always include blank papyrus as first option
            {
              id: 'blank-papyrus',
              url: DEFAULT_PAPYRUS_TEXTURE_URL,
              prompt: 'Blank Papyrus',
              createdAt: '',
              sessionId: '',
              service: 'map',
            },
            // Then include generated images
            ...generatedImages,
          ]}
          selectedImageId={baseImageUrl === DEFAULT_PAPYRUS_TEXTURE_URL ? 'blank-papyrus' : null}
          onImageClick={handleBaseImageSelect}
          onImageSelect={handleBaseImageSelect}
        />
      </ScrollArea>
    </Stack>
  );
}

export default InpaintModeContent;
