/**
 * ProjectGallery - Grid display of generated images for current session
 * 
 * Displays images in a responsive grid with selection highlighting.
 * Used in the "Project" tab of image generation drawers.
 */

import React from 'react';
import { SimpleGrid, Card, Image, Text, Center, Stack } from '@mantine/core';
import type { GeneratedImage } from '../types';

// Extended interface for session images (may have timestamp instead of createdAt)
export interface SessionImage extends Omit<GeneratedImage, 'createdAt'> {
  timestamp?: string;
  createdAt?: string;
}

export interface ProjectGalleryProps {
  /** Array of generated images for current session */
  images: (GeneratedImage | SessionImage)[];
  /** Currently selected image ID (for highlighting) */
  selectedImageId: string | null;
  /** Callback when image is clicked (opens modal) */
  onImageClick: (image: GeneratedImage | SessionImage, index: number) => void;
  /** Callback when image is selected (for use in project) */
  onImageSelect?: (image: GeneratedImage | SessionImage, index: number) => void;
}

/**
 * ProjectGallery component for displaying session images in a grid
 */
export function ProjectGallery({
  images,
  selectedImageId,
  onImageClick,
  onImageSelect
}: ProjectGalleryProps) {
  if (images.length === 0) {
    return (
      <Center h={300}>
        <Stack gap="xs" align="center">
          <Text c="dimmed" size="sm">
            No images generated yet
          </Text>
          <Text c="dimmed" size="xs">
            Generate images to see them here
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <SimpleGrid
      cols={{ base: 2, sm: 3, md: 4 }}
      spacing="md"
      data-testid="project-gallery"
      data-tutorial="image-results-grid"
    >
      {images.map((image, index) => {
        const isSelected = selectedImageId === image.id;
        // Add data-tutorial for specific indices (for tutorial targeting)
        const tutorialAttr = index === 0 ? 'image-result-0' : index === 2 ? 'image-result-2' : undefined;

        return (
          <Card
            key={image.id}
            p="xs"
            style={{
              cursor: 'pointer',
              border: isSelected ? '2px solid var(--mantine-color-violet-6)' : '1px solid var(--mantine-color-gray-3)',
              opacity: isSelected ? 1 : 0.9,
              transition: 'all 0.2s'
            }}
            onClick={() => onImageClick(image, index)}
            onDoubleClick={() => onImageSelect?.(image, index)}
            data-testid={`gallery-image-${image.id}`}
            data-tutorial={tutorialAttr}
            data-selected={isSelected}
          >
            <Image
              src={image.url}
              alt={image.prompt || `Generated image ${index + 1}`}
              fit="cover"
              h={150}
              radius="sm"
            />
            {image.prompt && (
              <Text
                size="xs"
                c="dimmed"
                mt="xs"
                lineClamp={2}
                title={image.prompt}
              >
                {image.prompt}
              </Text>
            )}
          </Card>
        );
      })}
    </SimpleGrid>
  );
}

