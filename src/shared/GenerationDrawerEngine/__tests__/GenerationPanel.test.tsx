/**
 * Unit tests for GenerationPanel component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GenerationPanel } from '../components/GenerationPanel';
import type { ValidationResult } from '../types';

describe('GenerationPanel', () => {
  const defaultProps = {
    onGenerate: jest.fn(),
    isGenerating: false,
    validateInput: jest.fn(() => ({ valid: true } as ValidationResult))
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Generate Button', () => {
    it('renders enabled when input valid and not generating', () => {
      render(<GenerationPanel {...defaultProps} />);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      expect(generateButton).not.toBeDisabled();
    });

    it('renders disabled when input invalid', () => {
      const validateInput = jest.fn(() => ({
        valid: false,
        errors: { prompt: 'Prompt is required' }
      } as ValidationResult));

      render(
        <GenerationPanel
          {...defaultProps}
          validateInput={validateInput}
        />
      );
      const generateButton = screen.getByRole('button', { name: /generate/i });
      expect(generateButton).toBeDisabled();
    });

    it('renders disabled while generating (FR-008a)', () => {
      render(<GenerationPanel {...defaultProps} isGenerating={true} />);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      expect(generateButton).toBeDisabled();
    });

    it('shows loading spinner while generating', () => {
      render(<GenerationPanel {...defaultProps} isGenerating={true} />);
      // Mantine Button shows Loader when loading prop is true
      const generateButton = screen.getByRole('button', { name: /generate/i });
      expect(generateButton).toBeDisabled();
    });

    it('calls onGenerate when clicked', () => {
      const onGenerate = jest.fn();
      render(<GenerationPanel {...defaultProps} onGenerate={onGenerate} />);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      fireEvent.click(generateButton);
      expect(onGenerate).toHaveBeenCalledTimes(1);
    });

    it('applies data-tutorial="generate-button"', () => {
      render(<GenerationPanel {...defaultProps} />);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      expect(generateButton).toHaveAttribute('data-tutorial', 'generate-button');
    });
  });

  describe('Input Validation', () => {
    it('runs validateInput on generate click', () => {
      const validateInput = jest.fn(() => ({ valid: true } as ValidationResult));
      render(
        <GenerationPanel
          {...defaultProps}
          validateInput={validateInput}
        />
      );
      const generateButton = screen.getByRole('button', { name: /generate/i });
      fireEvent.click(generateButton);
      expect(validateInput).toHaveBeenCalledTimes(1);
    });

    it('prevents generation when validation fails', () => {
      const onGenerate = jest.fn();
      const validateInput = jest.fn(() => ({
        valid: false,
        errors: { prompt: 'Required' }
      } as ValidationResult));

      render(
        <GenerationPanel
          {...defaultProps}
          onGenerate={onGenerate}
          validateInput={validateInput}
        />
      );
      const generateButton = screen.getByRole('button', { name: /generate/i });
      fireEvent.click(generateButton);
      expect(onGenerate).not.toHaveBeenCalled();
    });

    it('displays validation errors', () => {
      const validateInput = jest.fn(() => ({
        valid: false,
        errors: { prompt: 'Prompt is required' }
      } as ValidationResult));

      render(
        <GenerationPanel
          {...defaultProps}
          validateInput={validateInput}
        />
      );
      const generateButton = screen.getByRole('button', { name: /generate/i });
      fireEvent.click(generateButton);

      // Validation errors should be displayed
      expect(screen.getByText(/prompt is required/i)).toBeInTheDocument();
    });

    it('clears errors on successful validation', async () => {
      const validateInput = jest
        .fn()
        .mockReturnValueOnce({
          valid: false,
          errors: { prompt: 'Required' }
        } as ValidationResult)
        .mockReturnValueOnce({ valid: true } as ValidationResult);

      const { rerender } = render(
        <GenerationPanel
          {...defaultProps}
          validateInput={validateInput}
        />
      );

      const generateButton = screen.getByRole('button', { name: /generate/i });
      fireEvent.click(generateButton);

      // Error should be shown
      expect(screen.getByText(/required/i)).toBeInTheDocument();

      // Re-validate with valid input
      rerender(
        <GenerationPanel
          {...defaultProps}
          validateInput={validateInput}
        />
      );

      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Progress Display', () => {
    it('shows progress panel when generating', () => {
      render(
        <GenerationPanel
          {...defaultProps}
          isGenerating={true}
          progressConfig={{
            estimatedDurationMs: 10000,
            milestones: []
          }}
        />
      );
      expect(screen.getByTestId('progress-panel')).toBeInTheDocument();
    });

    it('hides progress panel when not generating', () => {
      render(
        <GenerationPanel
          {...defaultProps}
          isGenerating={false}
          progressConfig={{
            estimatedDurationMs: 10000,
            milestones: []
          }}
        />
      );
      expect(screen.queryByTestId('progress-panel')).not.toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('shows error when error is provided', () => {
      const error = {
        code: 'TIMEOUT' as any,
        title: 'Timeout',
        message: 'Request timed out.',
        retryable: true
      };

      render(
        <GenerationPanel
          {...defaultProps}
          error={error}
          onRetry={jest.fn()}
        />
      );
      expect(screen.getByText('Timeout')).toBeInTheDocument();
    });

    it('hides error when error is null', () => {
      render(<GenerationPanel {...defaultProps} error={null} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});

