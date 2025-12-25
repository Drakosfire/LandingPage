/**
 * ErrorDisplay - Standardized error handling
 * 
 * Displays user-friendly error messages with retry option when applicable.
 */

import React from 'react';
import { Alert, Button, Group } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import type { GenerationError } from '../types';

export interface ErrorDisplayProps {
  /** Error to display */
  error: GenerationError | null;
  /** Retry callback */
  onRetry?: () => void;
  /** Dismiss callback */
  onDismiss?: () => void;
}

/**
 * ErrorDisplay component for showing generation errors
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss
}) => {
  if (!error) {
    return null;
  }

  // Determine alert color based on error code
  const getAlertColor = (code: string): string => {
    switch (code) {
      case 'TIMEOUT':
      case 'GATEWAY_TIMEOUT':
        return 'orange';
      case 'NETWORK':
        return 'red';
      case 'AUTH':
        return 'yellow';
      case 'VALIDATION':
        return 'red';
      default:
        return 'red';
    }
  };

  return (
    <Alert
      icon={<IconAlertCircle size={16} />}
      color={getAlertColor(error.code)}
      title={error.title}
      onClose={onDismiss}
      withCloseButton
    >
      <Group justify="space-between" mt="xs">
        <div>{error.message}</div>
        {error.retryable && onRetry && (
          <Button
            size="xs"
            variant="light"
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
      </Group>
    </Alert>
  );
};


