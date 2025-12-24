/**
 * GenerationPanel - Generation trigger and state management
 * 
 * Handles Generate button, input validation, progress display, and error handling.
 */

import React, { useState, useRef, useCallback } from 'react';
import { Button, Stack } from '@mantine/core';
import { IconWand } from '@tabler/icons-react';
import { useGeneration } from '../hooks/useGeneration';
import { ProgressPanel } from './ProgressPanel';
import { ErrorDisplay } from './ErrorDisplay';
import type { ValidationResult, ProgressConfig, GenerationType } from '../types';

export interface GenerationPanelProps<TInput> {
  /** Current input value */
  input: TInput;
  /** Input validation function */
  validateInput?: (input: TInput) => ValidationResult;
  /** Generate callback */
  onGenerate: (input: TInput) => Promise<void>;
  /** Whether generation is in progress */
  isGenerating: boolean;
  /** Current error (if any) */
  error: any;
  /** Retry callback */
  onRetry?: () => void;
  /** Progress configuration */
  progressConfig?: ProgressConfig;
  /** Generation type (for progress config lookup) */
  generationType?: GenerationType;
}

/**
 * GenerationPanel component for triggering and managing generation
 */
export function GenerationPanel<TInput>({
  input,
  validateInput,
  onGenerate,
  isGenerating,
  error,
  onRetry,
  progressConfig,
  generationType
}: GenerationPanelProps<TInput>) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string> | undefined>();
  const progressOnCompleteRef = useRef<(() => void) | null>(null);

  // Handle generate button click
  const handleGenerate = useCallback(async () => {
    // Clear previous errors
    setValidationErrors(undefined);

    // Validate input if validator provided
    if (validateInput) {
      const validation = validateInput(input);
      if (!validation.valid) {
        setValidationErrors(validation.errors);
        return;
      }
    }

    // Trigger generation
    try {
      await onGenerate(input);
      // Call progress onComplete when generation finishes
      if (progressOnCompleteRef.current) {
        progressOnCompleteRef.current();
      }
    } catch (err) {
      // Error is handled by parent via error prop
      console.error('Generation failed:', err);
    }
  }, [input, validateInput, onGenerate]);

  // Get progress config for current generation type
  const currentProgressConfig = generationType && progressConfig
    ? progressConfig
    : progressConfig;

  // Determine if generate button should be enabled
  const isButtonEnabled = !isGenerating && (!validateInput || validateInput(input).valid);

  return (
    <Stack gap="md">
      {/* Error Display */}
      {error && (
        <ErrorDisplay
          error={error}
          onRetry={onRetry}
          onDismiss={() => {
            // Clear error via parent
            if (onRetry) {
              // Retry will clear error
            }
          }}
        />
      )}

      {/* Progress Panel */}
      {currentProgressConfig && (
        <ProgressPanel
          isGenerating={isGenerating}
          config={currentProgressConfig}
          onCompleteRef={progressOnCompleteRef}
        />
      )}

      {/* Generate Button */}
      <Button
        leftSection={isGenerating ? undefined : <IconWand size={16} />}
        onClick={handleGenerate}
        disabled={!isButtonEnabled}
        loading={isGenerating}
        size="md"
        fullWidth
        style={{ minHeight: 44 }}
        data-tutorial="generate-button"
      >
        {isGenerating ? 'Generating...' : 'Generate'}
      </Button>
    </Stack>
  );
}

