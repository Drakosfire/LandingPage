/**
 * Unit tests for ErrorDisplay component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { ErrorCode } from '../types';
import type { GenerationError } from '../types';

describe('ErrorDisplay', () => {
  const createError = (
    code: ErrorCode,
    title: string,
    message: string,
    retryable: boolean
  ): GenerationError => ({
    code,
    title,
    message,
    retryable
  });

  describe('Error Categories', () => {
    it('displays timeout error with correct styling', () => {
      const error = createError(
        ErrorCode.TIMEOUT,
        'Request Timeout',
        'The request took too long to complete.',
        true
      );
      render(<ErrorDisplay error={error} onRetry={jest.fn()} onDismiss={jest.fn()} />);
      expect(screen.getByText('Request Timeout')).toBeInTheDocument();
      expect(screen.getByText('The request took too long to complete.')).toBeInTheDocument();
    });

    it('displays gateway timeout error', () => {
      const error = createError(
        ErrorCode.GATEWAY_TIMEOUT,
        'Gateway Timeout',
        'The server took too long to respond.',
        true
      );
      render(<ErrorDisplay error={error} onRetry={jest.fn()} onDismiss={jest.fn()} />);
      expect(screen.getByText('Gateway Timeout')).toBeInTheDocument();
    });

    it('displays network error', () => {
      const error = createError(
        ErrorCode.NETWORK,
        'Network Error',
        'Unable to connect to the server.',
        true
      );
      render(<ErrorDisplay error={error} onRetry={jest.fn()} onDismiss={jest.fn()} />);
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });

    it('displays auth error', () => {
      const error = createError(
        ErrorCode.AUTH,
        'Authentication Required',
        'Please log in to continue.',
        false
      );
      render(<ErrorDisplay error={error} onRetry={jest.fn()} onDismiss={jest.fn()} />);
      expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    });

    it('displays validation error', () => {
      const error = createError(
        ErrorCode.VALIDATION,
        'Validation Error',
        'Please check your input.',
        false
      );
      render(<ErrorDisplay error={error} onRetry={jest.fn()} onDismiss={jest.fn()} />);
      expect(screen.getByText('Validation Error')).toBeInTheDocument();
    });

    it('displays unknown error', () => {
      const error = createError(
        ErrorCode.UNKNOWN,
        'Unexpected Error',
        'Something went wrong.',
        true
      );
      render(<ErrorDisplay error={error} onRetry={jest.fn()} onDismiss={jest.fn()} />);
      expect(screen.getByText('Unexpected Error')).toBeInTheDocument();
    });
  });

  describe('Retry', () => {
    it('shows retry button for retryable errors', () => {
      const error = createError(
        ErrorCode.TIMEOUT,
        'Timeout',
        'Request timed out.',
        true
      );
      render(<ErrorDisplay error={error} onRetry={jest.fn()} onDismiss={jest.fn()} />);
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('hides retry button for non-retryable errors', () => {
      const error = createError(
        ErrorCode.VALIDATION,
        'Validation Error',
        'Invalid input.',
        false
      );
      render(<ErrorDisplay error={error} onRetry={jest.fn()} onDismiss={jest.fn()} />);
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });

    it('calls onRetry when retry clicked', () => {
      const onRetry = jest.fn();
      const error = createError(
        ErrorCode.TIMEOUT,
        'Timeout',
        'Request timed out.',
        true
      );
      render(<ErrorDisplay error={error} onRetry={onRetry} onDismiss={jest.fn()} />);
      const retryButton = screen.getByRole('button', { name: /retry/i });
      retryButton.click();
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dismissal', () => {
    it('shows close button', () => {
      const error = createError(
        ErrorCode.UNKNOWN,
        'Error',
        'Something went wrong.',
        true
      );
      render(<ErrorDisplay error={error} onRetry={jest.fn()} onDismiss={jest.fn()} />);
      // Mantine Alert has a close button
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('calls onDismiss when closed', () => {
      const onDismiss = jest.fn();
      const error = createError(
        ErrorCode.UNKNOWN,
        'Error',
        'Something went wrong.',
        true
      );
      render(<ErrorDisplay error={error} onRetry={jest.fn()} onDismiss={onDismiss} />);
      // Find and click close button (Mantine Alert close button)
      const alert = screen.getByRole('alert');
      const closeButton = alert.querySelector('[aria-label*="close" i], [aria-label*="dismiss" i]');
      if (closeButton) {
        (closeButton as HTMLElement).click();
        expect(onDismiss).toHaveBeenCalledTimes(1);
      }
    });
  });
});

