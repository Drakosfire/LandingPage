/**
 * MaskGallery - Grid display of mask images
 * 
 * Similar to ProjectGallery but for mask images.
 * Used when mode requires mask display.
 */

import React from 'react';
import { SimpleGrid, Card, Image, Text, Center, Stack, Badge } from '@mantine/core';
import { IconMask } from '@tabler/icons-react';
import type { MaskImage } from '../types';

export interface MaskGalleryProps {
  /** Array of mask images */
  masks: MaskImage[];
  /** Currently selected mask URL (for highlighting) */
  selectedMaskUrl?: string | null;
  /** Callback when mask is clicked */
  onMaskClick?: (mask: MaskImage, index: number) => void;
  /** Callback when mask is double-clicked (select for use) */
  onMaskSelect?: (mask: MaskImage, index: number) => void;
}

/**
 * MaskGallery component for displaying mask images in a grid
 */
export function MaskGallery({
  masks,
  selectedMaskUrl,
  onMaskClick,
  onMaskSelect,
}: MaskGalleryProps) {
  if (masks.length === 0) {
    return (
      <Center h={150}>
        <Stack gap="xs" align="center">
          <IconMask size={32} color="var(--mantine-color-gray-5)" />
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
      spacing="sm"
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
              border: isSelected
                ? '2px solid var(--mantine-color-grape-6)'
                : '1px solid var(--mantine-color-gray-3)',
              opacity: isSelected ? 1 : 0.9,
              transition: 'all 0.2s',
            }}
            onClick={() => onMaskClick?.(mask, index)}
            onDoubleClick={() => onMaskSelect?.(mask, index)}
            data-testid={`mask-gallery-item-${index}`}
            data-selected={isSelected}
          >
            <Image
              src={mask.url}
              alt={`Mask${mask.projectName ? ` from ${mask.projectName}` : ''}`}
              fit="contain"
              h={100}
              radius="sm"
              style={{ backgroundColor: 'var(--mantine-color-dark-8)' }}
            />
            {mask.projectName && (
              <Stack gap={4} mt="xs">
                <Text size="xs" fw={500} lineClamp={1}>
                  {mask.projectName}
                </Text>
                {mask.updatedAt && (
                  <Badge size="xs" variant="light" color="grape">
                    {new Date(mask.updatedAt).toLocaleDateString()}
                  </Badge>
                )}
              </Stack>
            )}
          </Card>
        );
      })}
    </SimpleGrid>
  );
}

export default MaskGallery;
