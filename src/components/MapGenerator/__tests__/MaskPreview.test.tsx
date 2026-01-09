/**
 * MaskPreview Component Tests (TDD - T174-T175)
 *
 * Tests for the mask preview thumbnail component.
 * Written BEFORE implementation - these tests MUST FAIL initially.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MaskPreview } from '../MaskPreview';

describe('MaskPreview', () => {
  // =========================================================================
  // T174: Renders Thumbnail of Mask
  // =========================================================================
  describe('renders thumbnail of mask (T174)', () => {
    it('should render preview container', () => {
      render(<MaskPreview maskData="data:image/png;base64,iVBORw0KGgo..." />);

      expect(screen.getByTestId('mask-preview')).toBeInTheDocument();
    });

    it('should render image when maskData is provided', () => {
      const testMaskData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      render(<MaskPreview maskData={testMaskData} />);

      const image = screen.getByRole('img', { name: /mask preview/i });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', testMaskData);
    });

    it('should not display mask dimensions (removed feature)', () => {
      render(
        <MaskPreview
          maskData="data:image/png;base64,iVBORw0KGgo..."
        />
      );

      // Dimensions display was removed - should not show dimensions
      expect(screen.queryByText(/\d+.*\d+/)).not.toBeInTheDocument();
    });

    it('should render thumbnail at reduced size', () => {
      render(<MaskPreview maskData="data:image/png;base64,iVBORw0KGgo..." />);

      const preview = screen.getByTestId('mask-preview');
      // Thumbnail should have constrained max-width
      expect(preview).toHaveStyle({ maxWidth: expect.stringMatching(/\d+px/) });
    });
  });

  // =========================================================================
  // T175: Shows "No Mask" When Empty
  // =========================================================================
  describe('shows "No mask" when empty (T175)', () => {
    it('should show "No mask" message when maskData is null', () => {
      render(<MaskPreview maskData={null} />);

      expect(screen.getByText(/no mask/i)).toBeInTheDocument();
    });

    it('should show "No mask" message when maskData is undefined', () => {
      render(<MaskPreview maskData={undefined} />);

      expect(screen.getByText(/no mask/i)).toBeInTheDocument();
    });

    it('should show "No mask" message when maskData is empty string', () => {
      render(<MaskPreview maskData="" />);

      expect(screen.getByText(/no mask/i)).toBeInTheDocument();
    });

    it('should not render image when no mask data', () => {
      render(<MaskPreview maskData={null} />);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('should show placeholder icon when no mask', () => {
      render(<MaskPreview maskData={null} />);

      // Should show some visual indicator that there's no mask
      expect(screen.getByTestId('no-mask-placeholder')).toBeInTheDocument();
    });
  });
});
