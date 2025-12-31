/**
 * ImageModal - Full-size image viewer with navigation
 * 
 * Displays a single image at full size with previous/next navigation,
 * keyboard support, and Select/Delete actions.
 */

import React, { useEffect } from 'react';
import { Modal, Image, Text, Group, Button, ActionIcon, Stack } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconTrash } from '@tabler/icons-react';
import type { GeneratedImage } from '../types';
import type { SessionImage } from './ProjectGallery';

export interface ImageModalProps {
  /** Whether modal is open */
  opened: boolean;
  /** Array of all images */
  images: (GeneratedImage | SessionImage)[];
  /** Current image index */
  currentIndex: number;
  /** Close callback */
  onClose: () => void;
  /** Select callback (image URL, index) */
  onSelect: (url: string, index: number) => void;
  /** Delete callback (image ID) - optional */
  onDelete?: (imageId: string) => void;
  /** Navigation callback (new index) */
  onNavigate: (newIndex: number) => void;
}

/**
 * ImageModal component for full-size image viewing
 */
export function ImageModal({
  opened,
  images,
  currentIndex,
  onClose,
  onSelect,
  onDelete,
  onNavigate
}: ImageModalProps) {
  const currentImage = images[currentIndex] as GeneratedImage | SessionImage | undefined;
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < images.length - 1;

  // Keyboard navigation
  useEffect(() => {
    if (!opened) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && canGoPrevious) {
        onNavigate(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && canGoNext) {
        onNavigate(currentIndex + 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [opened, currentIndex, canGoPrevious, canGoNext, onNavigate, onClose]);

  if (!currentImage) {
    return null;
  }

  const handleSelect = () => {
    onSelect(currentImage.url, currentIndex);
  };

  const handleDelete = () => {
    if (onDelete && currentImage.id) {
      onDelete(currentImage.id);
      // If deleting last image, close modal
      if (images.length === 1) {
        onClose();
      } else if (currentIndex === images.length - 1) {
        // If deleting last image in array, go to previous
        onNavigate(currentIndex - 1);
      }
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      zIndex={500} // Above DrawerShell (400) so modal appears on top
      title={
        <Text size="sm" c="dimmed">
          {currentIndex + 1} / {images.length}
        </Text>
      }
      centered
      data-testid="image-modal"
    >
      <Stack gap="md">
        {/* Image with navigation arrows */}
        <div style={{ position: 'relative' }}>
          <Image
            src={currentImage.url}
            alt={currentImage.prompt || `Image ${currentIndex + 1}`}
            fit="contain"
            mah={500}
            radius="sm"
            data-testid="modal-image"
          />

          {/* Previous button */}
          {canGoPrevious && (
            <ActionIcon
              variant="filled"
              size="lg"
              radius="xl"
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)'
              }}
              onClick={() => onNavigate(currentIndex - 1)}
              aria-label="Previous image"
              data-testid="prev-button"
              data-tutorial="modal-prev-button"
            >
              <IconChevronLeft size={20} />
            </ActionIcon>
          )}

          {/* Next button */}
          {canGoNext && (
            <ActionIcon
              variant="filled"
              size="lg"
              radius="xl"
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)'
              }}
              onClick={() => onNavigate(currentIndex + 1)}
              aria-label="Next image"
              data-testid="next-button"
              data-tutorial="modal-next-button"
            >
              <IconChevronRight size={20} />
            </ActionIcon>
          )}
        </div>

        {/* Prompt text */}
        {currentImage.prompt && (
          <Text size="sm" c="dimmed" ta="center">
            {currentImage.prompt}
          </Text>
        )}

        {/* Action buttons */}
        <Group justify="center" gap="md">
          <Button
            onClick={handleSelect}
            variant="filled"
            data-testid="select-button"
          >
            Select
          </Button>
          {onDelete && (
            <Button
              onClick={handleDelete}
              variant="outline"
              color="red"
              leftSection={<IconTrash size={16} />}
              data-testid="delete-button"
            >
              Delete
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="default"
            data-testid="close-button"
            data-tutorial="modal-close-button"
          >
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

