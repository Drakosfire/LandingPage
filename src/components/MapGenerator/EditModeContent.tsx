/**
 * EditModeContent Component
 * 
 * Content for the "Edit" mode - modify existing maps with optional masking.
 * Includes: image selection, edit prompt, optional mask toggle, saved masks.
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
  Switch,
  ThemeIcon,
  Loader,
} from '@mantine/core';
import { IconBrush, IconTrash, IconPhoto } from '@tabler/icons-react';
import { exportMaskToBase64 } from 'dungeonmind-canvas';
import { useMapGenerator } from './MapGeneratorProvider';
import { ProjectGallery } from '../../shared/GenerationDrawerEngine/components/ProjectGallery';
import { MaskGallery } from '../../shared/GenerationDrawerEngine/components/MaskGallery';
import { MaskPreview } from './MaskPreview';

interface EditModeContentProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  isGenerating: boolean;
  useMask: boolean;
  onUseMaskChange: (useMask: boolean) => void;
}

export function EditModeContent({
  prompt,
  onPromptChange,
  isGenerating,
  useMask,
  onUseMaskChange,
}: EditModeContentProps) {
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

  // Selected image for editing
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  
  // State for generated mask preview from drawn strokes
  const [drawnMaskPreview, setDrawnMaskPreview] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Check mask state
  const hasDrawnMask = maskDrawingState.strokes.length > 0;
  const hasSavedMask = !!maskImageUrl;
  const hasMask = hasDrawnMask || hasSavedMask;

  // Generate preview image from drawn strokes
  useEffect(() => {
    // Clear preview if no strokes or mask mode not active
    if (maskDrawingState.strokes.length === 0 || !useMask) {
      setDrawnMaskPreview(null);
      return;
    }

    // Debounce the preview generation
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsGeneratingPreview(true);
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
          const timeout = setTimeout(() => {
            resolve({ width: 1024, height: 1024 });
          }, 3000);
          img.onload = () => {
            clearTimeout(timeout);
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
          };
          img.onerror = () => {
            clearTimeout(timeout);
            resolve({ width: 1024, height: 1024 });
          };
          img.src = baseImageUrl;
        });

        const maskExport = await exportMaskToBase64({
          width: dimensions.width,
          height: dimensions.height,
          strokes: maskDrawingState.strokes,
        });

        console.log('🎭 [EditMode] Generated mask preview');
        setDrawnMaskPreview(maskExport.base64);
      } catch (err) {
        console.error('❌ [EditMode] Failed to generate mask preview:', err);
        setDrawnMaskPreview(null);
      } finally {
        setIsGeneratingPreview(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [maskDrawingState.strokes, baseImageUrl, useMask]);

  // Handle image selection for editing
  const handleImageSelect = (image: { id: string; url: string }, index: number) => {
    setSelectedImageId(image.id);
    setBaseImageUrl(image.url);
    console.log('🖼️ [EditMode] Image selected for editing:', image.id);
  };

  // Handle draw mask
  const handleDrawMask = () => {
    setMaskEnabled(true);
    onUseMaskChange(true);
    console.log('🎭 [EditMode] Enabling mask drawing mode');
  };

  // Handle clear mask
  const handleClearMask = () => {
    clearMask();
    console.log('🎭 [EditMode] Mask cleared');
  };

  // Handle saved mask selection
  const handleMaskSelect = (mask: { url: string; id?: string }) => {
    setMaskImageUrl(mask.url);
    onUseMaskChange(true);
    console.log('🎭 [EditMode] Saved mask selected:', mask.id || 'unknown');
  };

  // Build mask images for gallery
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
      {/* Image Selection */}
      <Divider label="Select Image to Edit" labelPosition="center" />
      {generatedImages.length > 0 ? (
        <ScrollArea h={140}>
          <ProjectGallery
            images={generatedImages}
            selectedImageId={selectedImageId}
            onImageClick={handleImageSelect}
            onImageSelect={handleImageSelect}
          />
        </ScrollArea>
      ) : (
        <Paper p="md" withBorder style={{ textAlign: 'center' }}>
          <Stack gap="xs" align="center">
            <ThemeIcon size={40} variant="light" color="gray">
              <IconPhoto size={24} />
            </ThemeIcon>
            <Text size="sm" c="dimmed">
              No images to edit. Generate a map first.
            </Text>
          </Stack>
        </Paper>
      )}

      {/* Edit Prompt */}
      <Textarea
        label="Describe the changes"
        placeholder="Add more trees to the northern edge, replace the water with lava..."
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        disabled={isGenerating}
        minRows={2}
        maxRows={4}
        required
        data-testid="edit-prompt-input"
      />

      {/* Mask Toggle */}
      <Paper p="sm" withBorder bg={useMask ? 'blue.0' : undefined}>
        <Stack gap="sm">
          <Switch
            label="Use mask (only modify masked region)"
            checked={useMask}
            onChange={(e) => onUseMaskChange(e.currentTarget.checked)}
            disabled={isGenerating}
            size="md"
          />

          {useMask && (
            <Group gap="md" align="flex-start">
              {/* Mask Preview */}
              <Box w={80} h={80} style={{ flexShrink: 0 }}>
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
                      <Loader size="xs" color="blue" />
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
                        Drawing...
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
                    <Text size="xs" c="dimmed" ta="center">
                      No mask
                    </Text>
                  </Paper>
                )}
              </Box>

              {/* Mask Actions */}
              <Stack gap="xs">
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconBrush size={14} />}
                  onClick={handleDrawMask}
                  disabled={isGenerating}
                >
                  Draw Mask
                </Button>
                {hasMask && (
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
                )}
              </Stack>
            </Group>
          )}
        </Stack>
      </Paper>

      {/* Saved Masks */}
      {useMask && (
        <>
          <Divider label="Saved Masks" labelPosition="center" />
          {savedMasks.length > 0 ? (
            <ScrollArea h={80}>
              <MaskGallery
                masks={savedMasks}
                selectedMaskUrl={hasSavedMask && !hasDrawnMask ? maskImageUrl : null}
                onMaskSelect={handleMaskSelect}
              />
            </ScrollArea>
          ) : (
            <Paper p="xs" withBorder style={{ textAlign: 'center' }}>
              <Text size="xs" c="dimmed">
                No saved masks
              </Text>
            </Paper>
          )}
        </>
      )}
    </Stack>
  );
}

export default EditModeContent;
