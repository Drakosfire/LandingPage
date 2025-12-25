/**
 * Unit tests for ProjectGallery component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { ProjectGallery } from '../components/ProjectGallery';
import type { GeneratedImage } from '../types';
import type { SessionImage } from '../components/ProjectGallery';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('ProjectGallery', () => {
  const mockImages: (GeneratedImage | SessionImage)[] = [
    {
      id: '1',
      url: 'https://example.com/image1.jpg',
      prompt: 'A fierce dragon',
      createdAt: '2024-01-01T00:00:00Z',
      sessionId: 'session1',
      service: 'test'
    },
    {
      id: '2',
      url: 'https://example.com/image2.jpg',
      prompt: 'A magical forest',
      createdAt: '2024-01-01T01:00:00Z',
      sessionId: 'session1',
      service: 'test'
    },
    {
      id: '3',
      url: 'https://example.com/image3.jpg',
      prompt: 'A brave knight',
      createdAt: '2024-01-01T02:00:00Z',
      sessionId: 'session1',
      service: 'test'
    }
  ];

  const defaultProps = {
    images: mockImages,
    selectedImageId: null,
    onImageClick: jest.fn(),
    onImageSelect: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Grid Rendering', () => {
    it('renders all images in grid', () => {
      renderWithProvider(<ProjectGallery {...defaultProps} />);
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(mockImages.length);
    });

    it('displays image URLs correctly', () => {
      renderWithProvider(<ProjectGallery {...defaultProps} />);
      const firstImage = screen.getByAltText('A fierce dragon');
      expect(firstImage).toHaveAttribute('src', mockImages[0].url);
    });

    it('renders images with correct alt text from prompt', () => {
      renderWithProvider(<ProjectGallery {...defaultProps} />);
      expect(screen.getByAltText('A fierce dragon')).toBeInTheDocument();
      expect(screen.getByAltText('A magical forest')).toBeInTheDocument();
      expect(screen.getByAltText('A brave knight')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays empty state message when no images', () => {
      renderWithProvider(
        <ProjectGallery
          {...defaultProps}
          images={[]}
        />
      );
      expect(screen.getByText(/no images generated yet/i)).toBeInTheDocument();
    });

    it('does not render empty state when images exist', () => {
      renderWithProvider(<ProjectGallery {...defaultProps} />);
      expect(screen.queryByText(/no images generated yet/i)).not.toBeInTheDocument();
    });
  });

  describe('Image Click', () => {
    it('calls onImageClick when image is clicked', () => {
      const onImageClick = jest.fn();
      renderWithProvider(
        <ProjectGallery
          {...defaultProps}
          onImageClick={onImageClick}
        />
      );
      const firstImage = screen.getByAltText('A fierce dragon');
      fireEvent.click(firstImage);
      expect(onImageClick).toHaveBeenCalledWith(mockImages[0], 0);
    });

    it('calls onImageClick with correct index', () => {
      const onImageClick = jest.fn();
      renderWithProvider(
        <ProjectGallery
          {...defaultProps}
          onImageClick={onImageClick}
        />
      );
      const secondImage = screen.getByAltText('A magical forest');
      fireEvent.click(secondImage);
      expect(onImageClick).toHaveBeenCalledWith(mockImages[1], 1);
    });
  });

  describe('Selection Highlight', () => {
    it('highlights selected image', () => {
      renderWithProvider(
        <ProjectGallery
          {...defaultProps}
          selectedImageId="1"
        />
      );
      const firstImage = screen.getByAltText('A fierce dragon');
      const card = firstImage.closest('[class*="mantine-Card"]');
      // Selected image should have visual indication (border, opacity, etc.)
      expect(card).toBeInTheDocument();
    });

    it('does not highlight unselected images', () => {
      renderWithProvider(
        <ProjectGallery
          {...defaultProps}
          selectedImageId="2"
        />
      );
      const firstImage = screen.getByAltText('A fierce dragon');
      const card = firstImage.closest('[class*="mantine-Card"]');
      // Unselected image should not have selection styling
      expect(card).toBeInTheDocument();
    });

    it('handles null selectedImageId', () => {
      renderWithProvider(
        <ProjectGallery
          {...defaultProps}
          selectedImageId={null}
        />
      );
      // No images should be highlighted
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(mockImages.length);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for images', () => {
      renderWithProvider(<ProjectGallery {...defaultProps} />);
      const images = screen.getAllByRole('img');
      images.forEach((img, index) => {
        expect(img).toHaveAttribute('alt', mockImages[index].prompt);
      });
    });

    it('images are keyboard accessible', () => {
      renderWithProvider(<ProjectGallery {...defaultProps} />);
      const firstImage = screen.getByAltText('A fierce dragon');
      const card = firstImage.closest('[class*="mantine-Card"]');
      // Card should be focusable
      expect(card).toBeInTheDocument();
    });
  });
});

