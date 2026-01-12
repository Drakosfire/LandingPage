/**
 * GenerateModeContent Component
 * 
 * Content for the "Generate" mode - create new maps from text prompts.
 * Includes: examples, prompt textarea, compact style options, optional upload, project gallery.
 */

import React, { useState } from 'react';
import {
  Stack,
  Textarea,
  Group,
  Button,
  Text,
  ScrollArea,
  Divider,
  Tooltip,
  Paper,
} from '@mantine/core';
import { useMapGenerator } from './MapGeneratorProvider';
import { CompactStyleOptions } from './CompactStyleOptions';
import { MAP_EXAMPLES, exampleToInput } from './mapExamples';
import { ProjectGallery } from '../../shared/GenerationDrawerEngine/components/ProjectGallery';
import { UploadZone } from '../../shared/GenerationDrawerEngine/components/UploadZone';
import type { MapGenerationInput } from './mapTypes';

interface GenerateModeContentProps {
  input: MapGenerationInput;
  onInputChange: (input: Partial<MapGenerationInput>) => void;
  isGenerating: boolean;
}

export function GenerateModeContent({
  input,
  onInputChange,
  isGenerating,
}: GenerateModeContentProps) {
  const { generatedImages, setBaseImageUrl, addGeneratedImage } = useMapGenerator();

  // Upload state
  const [recentUploads, setRecentUploads] = useState<Array<{
    id: string;
    name: string;
    url?: string;
    status: 'pending' | 'success' | 'error';
    error?: string;
  }>>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Handle example click
  const handleExampleClick = (exampleId: string) => {
    const example = MAP_EXAMPLES.find((ex) => ex.id === exampleId);
    if (example) {
      const newInput = exampleToInput(example);
      onInputChange(newInput);
      console.log('📋 [GenerateMode] Example selected:', example.name);
    }
  };

  // Handle file upload
  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    setIsUploading(true);

    for (const file of files) {
      const uploadId = `upload-${Date.now()}-${file.name}`;
      console.log('📤 [GenerateMode] Uploading file:', file.name);

      // Add pending upload
      setRecentUploads((prev) => [
        { id: uploadId, name: file.name, status: 'pending' },
        ...prev.slice(0, 4),
      ]);

      try {
        // Create object URL for preview (TODO: implement actual API upload)
        const objectUrl = URL.createObjectURL(file);
        setBaseImageUrl(objectUrl);

        // Add to gallery
        addGeneratedImage({
          id: uploadId,
          url: objectUrl,
          prompt: file.name,
          createdAt: new Date().toISOString(),
          sessionId: '',
          service: 'map',
        });

        // Update upload status
        setRecentUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId ? { ...u, status: 'success' as const, url: objectUrl } : u
          )
        );
      } catch (err) {
        setRecentUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId
              ? { ...u, status: 'error' as const, error: 'Upload failed' }
              : u
          )
        );
      }
    }
    setIsUploading(false);
  };

  // Handle upload error
  const handleUploadError = (error: string) => {
    console.error('📤 [GenerateMode] Upload error:', error);
  };

  // Clear upload from list
  const handleClearUpload = (uploadId: string) => {
    setRecentUploads((prev) => prev.filter((u) => u.id !== uploadId));
  };

  // Handle gallery image click
  const handleImageClick = (image: { url: string }, index: number) => {
    setBaseImageUrl(image.url);
    console.log('🖼️ [GenerateMode] Image selected:', index);
  };

  return (
    <Stack gap="md">
      {/* Quick Start Examples */}
      <div>
        <Text size="sm" fw={500} mb="xs">
          Quick Start
        </Text>
        <ScrollArea scrollbarSize={6}>
          <Group gap="xs" wrap="nowrap">
            {MAP_EXAMPLES.map((example) => (
              <Tooltip key={example.id} label={example.name} position="bottom">
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => handleExampleClick(example.id)}
                  disabled={isGenerating}
                  style={{ minWidth: 'auto' }}
                >
                  <span style={{ fontSize: '1.2rem', marginRight: 4 }}>{example.icon}</span>
                  {example.name}
                </Button>
              </Tooltip>
            ))}
          </Group>
        </ScrollArea>
      </div>

      {/* Prompt Input */}
      <Textarea
        label="Describe your battle map"
        placeholder="A forest clearing with ancient standing stones, morning mist drifting between the trees..."
        value={input.prompt}
        onChange={(e) => onInputChange({ prompt: e.target.value })}
        disabled={isGenerating}
        minRows={3}
        maxRows={5}
        required
        data-testid="map-prompt-input"
      />

      {/* Compact Style Options */}
      <CompactStyleOptions
        value={input.styleOptions}
        onChange={(styleOptions) => onInputChange({ styleOptions })}
        disabled={isGenerating}
      />

      {/* Upload Section */}
      <Divider label="Add Image" labelPosition="center" />
      <UploadZone
        onUpload={handleFileUpload}
        onError={handleUploadError}
        isUploading={isUploading}
        recentUploads={recentUploads}
        onClearUpload={handleClearUpload}
        maxSize={10 * 1024 * 1024}
        acceptedTypes={['image/png', 'image/jpeg', 'image/webp']}
        multiple={false}
      />

      {/* Project Gallery */}
      <Divider label="Project Images" labelPosition="center" />
      {generatedImages.length > 0 ? (
        <ScrollArea h={120}>
          <ProjectGallery
            images={generatedImages}
            selectedImageId={null}
            onImageClick={handleImageClick}
            onImageSelect={handleImageClick}
          />
        </ScrollArea>
      ) : (
        <Paper p="md" withBorder style={{ textAlign: 'center' }}>
          <Text size="sm" c="dimmed">
            No images yet. Generate or upload to see them here.
          </Text>
        </Paper>
      )}
    </Stack>
  );
}

export default GenerateModeContent;
