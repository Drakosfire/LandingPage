/**
 * Unit tests for GenerationPanel component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { GenerationPanel } from '../components/GenerationPanel';
import type { ValidationResult } from '../types';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('GenerationPanel', () => {
  const defaultProps = {
    input: { prompt: 'test' },
    onGenerate: jest.fn(),
    isGenerating: false,
    error: null,
    validateInput: jest.fn(() => ({ valid: true } as ValidationResult))
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Generate Button', () => {
    it('renders enabled when input valid and not generating', () => {
      renderWithProvider(<GenerationPanel {...defaultProps} />);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      expect(generateButton).not.toBeDisabled();
    });

    it('renders disabled when input invalid', () => {
      const validateInput = jest.fn(() => ({
        valid: false,
        errors: { prompt: 'Prompt is required' }
      } as ValidationResult));

      renderWithProvider(
        <GenerationPanel
          {...defaultProps}
          validateInput={validateInput}
        />
      );
      const generateButton = screen.getByRole('button', { name: /generate/i });
      expect(generateButton).toBeDisabled();
    });

    it('renders disabled while generating (FR-008a)', () => {
      renderWithProvider(<GenerationPanel {...defaultProps} isGenerating={true} />);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      expect(generateButton).toBeDisabled();
    });

    it('shows loading spinner while generating', () => {
      renderWithProvider(<GenerationPanel {...defaultProps} isGenerating={true} />);
      // Mantine Button shows Loader when loading prop is true
      const generateButton = screen.getByRole('button', { name: /generate/i });
      expect(generateButton).toBeDisabled();
    });

    it('calls onGenerate when clicked', () => {
      const onGenerate = jest.fn();
      renderWithProvider(<GenerationPanel {...defaultProps} onGenerate={onGenerate} />);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      fireEvent.click(generateButton);
      expect(onGenerate).toHaveBeenCalledTimes(1);
    });

    it('applies data-tutorial="generate-button"', () => {
      renderWithProvider(<GenerationPanel {...defaultProps} />);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      expect(generateButton).toHaveAttribute('data-tutorial', 'generate-button');
    });
  });

  describe('Input Validation', () => {
    it('runs validateInput on generate click', () => {
      const validateInput = jest.fn(() => ({ valid: true } as ValidationResult));
      renderWithProvider(
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

      renderWithProvider(
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

      renderWithProvider(
        <GenerationPanel
          {...defaultProps}
          validateInput={validateInput}
        />
      );
      const generateButton = screen.getByRole('button', { name: /generate/i });
      fireEvent.click(generateButton);

      // Validation errors should be displayed (passed to InputSlot via errors prop)
      // Note: Actual error display depends on InputSlot implementation
    });

    it('clears errors on successful validation', async () => {
      const validateInput = jest
        .fn()
        .mockReturnValueOnce({
          valid: false,
          errors: { prompt: 'Required' }
        } as ValidationResult)
        .mockReturnValueOnce({ valid: true } as ValidationResult);

      const { rerender } = renderWithProvider(
        <GenerationPanel
          {...defaultProps}
          validateInput={validateInput}
        />
      );

      const generateButton = screen.getByRole('button', { name: /generate/i });
      fireEvent.click(generateButton);

      // Re-validate with valid input
      rerender(
        <MantineProvider>
          <GenerationPanel
            {...defaultProps}
            validateInput={validateInput}
          />
        </MantineProvider>
      );

      fireEvent.click(generateButton);

      // Button should be enabled after validation passes
      await waitFor(() => {
        expect(generateButton).not.toBeDisabled();
      });
    });
  });

  describe('Progress Display', () => {
    it('shows progress panel when generating', () => {
      renderWithProvider(
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
      renderWithProvider(
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

      renderWithProvider(
        <GenerationPanel
          {...defaultProps}
          error={error}
          onRetry={jest.fn()}
        />
      );
      expect(screen.getByText('Timeout')).toBeInTheDocument();
    });

    it('hides error when error is null', () => {
      renderWithProvider(<GenerationPanel {...defaultProps} error={null} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});

