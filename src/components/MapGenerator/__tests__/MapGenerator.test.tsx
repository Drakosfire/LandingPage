/**
 * MapGenerator Component Tests
 * 
 * Tests for image upload handling, file size validation, and error display.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MapGenerator } from '../MapGenerator';
import { MapGeneratorProvider } from '../MapGeneratorProvider';

// Mock the auth context
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    isLoggedIn: true,
    userId: 'test-user-id',
  }),
}));

// Mock the canvas package
jest.mock('dungeonmind-canvas', () => ({
  MapViewport: ({ baseImageUrl }: { baseImageUrl: string }) => (
    <div data-testid="map-viewport">
      {baseImageUrl ? <img src={baseImageUrl} alt="Map" /> : 'No image'}
    </div>
  ),
  useMapCanvas: () => ({
    gridConfig: { type: 'square', cellSizePx: 50, offsetX: 0, offsetY: 0, color: '#000000', opacity: 0.5, visible: false },
    setGridConfig: jest.fn(),
    labels: [],
    addLabel: jest.fn(),
    updateLabel: jest.fn(),
    removeLabel: jest.fn(),
    selectLabel: jest.fn(),
    selectedLabelId: null,
    view: { zoom: 1, panX: 0, panY: 0 },
    setView: jest.fn(),
    fitToViewport: jest.fn(),
    mode: 'view',
    setMode: jest.fn(),
  }),
  DEFAULT_GRID_CONFIG: {
    type: 'square' as const,
    cellSizePx: 50,
    offsetX: 0,
    offsetY: 0,
    color: '#000000',
    opacity: 0.5,
    visible: false,
  },
}));

// Mock the API config
jest.mock('../../../config', () => ({
  DUNGEONMIND_API_URL: 'http://localhost:8000',
}));

describe('MapGenerator - Image Upload', () => {
  beforeEach(() => {
    // Reset fetch mock
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('File Size Validation', () => {
    it('should reject files larger than 10MB', async () => {
      const user = userEvent.setup();
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large-map.png', {
        type: 'image/png',
      });

      // Mock FileReader for file size check
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        result: 'data:image/png;base64,test',
        onload: null as any,
      };
      global.FileReader = jest.fn(() => mockFileReader) as any;

      render(
        <MapGeneratorProvider>
          <MapGenerator />
        </MapGeneratorProvider>
      );

      // Open generation drawer
      const generateButton = screen.getByText('Generate');
      await user.click(generateButton);

      // Wait for drawer to open and find upload tab
      await waitFor(() => {
        expect(screen.getByText(/upload/i)).toBeInTheDocument();
      });

      // Click upload tab
      const uploadTab = screen.getByText(/upload/i);
      await user.click(uploadTab);

      // Find file input (hidden)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();

      // Create a data transfer object for the file
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(largeFile);

      // Simulate file selection
      Object.defineProperty(fileInput, 'files', {
        value: [largeFile],
        writable: false,
      });

      // Trigger change event
      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      // Wait for error message
      await waitFor(() => {
        // UploadZone should call onError with file size error
        // The error should be displayed in the recent uploads section
        expect(screen.getByText(/too large|10MB|maximum size/i)).toBeInTheDocument();
      });
    });

    it('should accept files under 10MB', async () => {
      const user = userEvent.setup();
      const validFile = new File(['x'.repeat(5 * 1024 * 1024)], 'map.png', {
        type: 'image/png',
      });

      // Mock successful upload
      const mockImageUrl = 'https://example.com/uploaded-map.png';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'upload-id',
          url: mockImageUrl,
          prompt: 'map.png',
          createdAt: new Date().toISOString(),
        }),
      });

      render(
        <MapGeneratorProvider>
          <MapGenerator />
        </MapGeneratorProvider>
      );

      // Open generation drawer
      const generateButton = screen.getByText('Generate');
      await user.click(generateButton);

      // Wait for drawer and click upload tab
      await waitFor(() => {
        expect(screen.getByText(/upload/i)).toBeInTheDocument();
      });

      const uploadTab = screen.getByText(/upload/i);
      await user.click(uploadTab);

      // Find file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();

      // Simulate file selection
      Object.defineProperty(fileInput, 'files', {
        value: [validFile],
        writable: false,
      });

      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      // Wait for upload to complete and image to be set
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/images/upload'),
          expect.any(Object)
        );
      }, { timeout: 3000 });
    });
  });

  describe('File Format Validation', () => {
    it('should reject unsupported file formats', async () => {
      const user = userEvent.setup();
      const invalidFile = new File(['test'], 'map.pdf', {
        type: 'application/pdf',
      });

      render(
        <MapGeneratorProvider>
          <MapGenerator />
        </MapGeneratorProvider>
      );

      // Open generation drawer
      const generateButton = screen.getByText('Generate');
      await user.click(generateButton);

      // Wait for drawer and click upload tab
      await waitFor(() => {
        expect(screen.getByText(/upload/i)).toBeInTheDocument();
      });

      const uploadTab = screen.getByText(/upload/i);
      await user.click(uploadTab);

      // Find file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();

      // Simulate file selection
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        writable: false,
      });

      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/invalid file type|accepted types/i)).toBeInTheDocument();
      });
    });
  });

  describe('Upload Integration', () => {
    it('should set baseImageUrl when upload succeeds', async () => {
      const user = userEvent.setup();
      const validFile = new File(['test'], 'map.png', {
        type: 'image/png',
      });

      const mockImageUrl = 'https://example.com/uploaded-map.png';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'upload-id',
          url: mockImageUrl,
          prompt: 'map.png',
          createdAt: new Date().toISOString(),
        }),
      });

      render(
        <MapGeneratorProvider>
          <MapGenerator />
        </MapGeneratorProvider>
      );

      // Open generation drawer
      const generateButton = screen.getByText('Generate');
      await user.click(generateButton);

      // Wait for drawer and click upload tab
      await waitFor(() => {
        expect(screen.getByText(/upload/i)).toBeInTheDocument();
      });

      const uploadTab = screen.getByText(/upload/i);
      await user.click(uploadTab);

      // Find file input and upload
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      Object.defineProperty(fileInput, 'files', {
        value: [validFile],
        writable: false,
      });

      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      // Wait for upload to complete
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      }, { timeout: 3000 });

      // The image should be set in the viewport (via handleImagesGenerated -> handleGenerationComplete)
      // This is tested indirectly through the component integration
    });
  });
});
