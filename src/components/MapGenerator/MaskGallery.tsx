/**
 * Mask Gallery Component
 * 
 * Displays saved masks from the current project in a grid layout.
 * Similar to ProjectGallery but for mask images.
 */

import React from 'react';
import { SimpleGrid, Card, Image, Text, Center, Stack, Badge } from '@mantine/core';
import { IconMask } from '@tabler/icons-react';

export interface MaskGalleryItem {
  /** Mask image URL */
  url: string;
  /** Project ID this mask belongs to */
  projectId: string;
  /** Project name */
  projectName: string;
  /** When the mask was saved */
  updatedAt: string;
  /** Optional ID for selection */
  id?: string;
}

export interface MaskGalleryProps {
  /** Array of saved masks */
  masks: MaskGalleryItem[];
  /** Currently selected mask URL (for highlighting) */
  selectedMaskUrl: string | null;
  /** Callback when mask is clicked */
  onMaskClick: (mask: MaskGalleryItem, index: number) => void;
  /** Callback when mask is selected for use */
  onMaskSelect?: (mask: MaskGalleryItem, index: number) => void;
}

export const MaskGallery: React.FC<MaskGalleryProps> = ({
  masks,
  selectedMaskUrl,
  onMaskClick,
  onMaskSelect,
}) => {
  if (masks.length === 0) {
    return (
      <Center h={300}>
        <Stack gap="xs" align="center">
          <IconMask size={48} color="var(--mantine-color-gray-5)" />
          <Text c="dimmed" size="sm">
            No masks saved yet
          </Text>
          <Text c="dimmed" size="xs">
            Draw and save masks to see them here
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <SimpleGrid
      cols={{ base: 2, sm: 3, md: 4 }}
      spacing="md"
      data-testid="mask-gallery"
    >
      {masks.map((mask, index) => {
        const isSelected = selectedMaskUrl === mask.url;
        const maskKey = mask.id || mask.url || `mask-${index}`;

        return (
          <Card
            key={maskKey}
            p="xs"
            style={{
              cursor: 'pointer',
              border: isSelected ? '2px solid var(--mantine-color-grape-6)' : '1px solid var(--mantine-color-gray-3)',
              opacity: isSelected ? 1 : 0.9,
              transition: 'all 0.2s',
            }}
            onClick={() => onMaskClick(mask, index)}
            onDoubleClick={() => onMaskSelect?.(mask, index)}
            data-testid={`mask-gallery-item-${index}`}
            data-selected={isSelected}
          >
            <Image
              src={mask.url}
              alt={`Mask from ${mask.projectName}`}
              fit="contain"
              h={150}
              radius="sm"
              style={{ backgroundColor: 'var(--mantine-color-dark-8)' }}
            />
            <Stack gap={4} mt="xs">
              <Text size="xs" fw={500} lineClamp={1}>
                {mask.projectName}
              </Text>
              <Badge size="xs" variant="light" color="grape">
                {new Date(mask.updatedAt).toLocaleDateString()}
              </Badge>
            </Stack>
          </Card>
        );
      })}
    </SimpleGrid>
  );
};

export default MaskGallery;
