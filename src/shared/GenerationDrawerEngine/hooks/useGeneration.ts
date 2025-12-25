/**
 * useGeneration - Generation API hook
 * 
 * Handles API calls for generation with abort, timeout, error categorization,
 * and tutorial mode support.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DUNGEONMIND_API_URL } from '../../../config';
import { ErrorCode, type GenerationError } from '../types';

export interface UseGenerationConfig<TInput, TOutput> {
  generationEndpoint: string;
  transformInput: (input: TInput) => Record<string, unknown>;
  transformOutput: (response: unknown) => TOutput;
  timeout?: number;
  tutorialConfig?: {
    mockData?: TOutput; // Optional mock data for tutorial mode
    simulatedDurationMs?: number;
  };
}

export interface UseGenerationReturn<TInput, TOutput> {
  /** Whether generation is in progress */
  isGenerating: boolean;
  /** Current error (if any) */
  error: GenerationError | null;
  /** Generate function */
  generate: (input: TInput) => Promise<TOutput>;
  /** Clear error */
  clearError: () => void;
}

/**
 * Hook for handling generation API calls
 * @param config - Generation configuration
 * @param isTutorialMode - Whether in tutorial mode (bypasses API)
 * @returns Generation state and functions
 */
export function useGeneration<TInput, TOutput>(
  config: UseGenerationConfig<TInput, TOutput>,
  isTutorialMode: boolean
): UseGenerationReturn<TInput, TOutput> {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<GenerationError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Categorize error from response
  const categorizeError = useCallback(
    (status: number, message: string): GenerationError => {
      if (status === 504) {
        return {
          code: ErrorCode.GATEWAY_TIMEOUT,
          title: 'Gateway Timeout',
          message: 'The server took too long to respond. Please try again.',
          retryable: true
        };
      }

      if (status === 401 || status === 403) {
        return {
          code: ErrorCode.AUTH,
          title: 'Authentication Required',
          message: 'Please log in to continue.',
          retryable: false
        };
      }

      if (status === 400) {
        return {
          code: ErrorCode.VALIDATION,
          title: 'Validation Error',
          message: message || 'Please check your input and try again.',
          retryable: false
        };
      }

      return {
        code: ErrorCode.UNKNOWN,
        title: 'Generation Error',
        message: message || 'An unexpected error occurred. Please try again.',
        retryable: true
      };
    },
    []
  );

  // Generate function
  const generate = useCallback(
    async (input: TInput): Promise<TOutput> => {
      // Clear previous error
      setError(null);

      // Tutorial mode: simulate delay and return mock data
      if (isTutorialMode && config.tutorialConfig) {
        setIsGenerating(true);
        const { mockData, simulatedDurationMs = 7000 } = config.tutorialConfig;

        return new Promise((resolve) => {
          setTimeout(() => {
            setIsGenerating(false);
            // Priority: mockData > transformOutput > empty object
            if (mockData) {
              resolve(mockData);
            } else if (config.transformOutput) {
              // Use transformOutput to generate mock data (services define this)
              resolve(config.transformOutput({}));
            } else {
              console.warn('⚠️ [useGeneration] Tutorial mode: no mockData or transformOutput provided');
              resolve({} as TOutput);
            }
          }, simulatedDurationMs);
        });
      }

      // Abort previous request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Set timeout
      const timeout = config.timeout || 150000; // Default 150s
      timeoutRef.current = setTimeout(() => {
        abortController.abort();
        setError({
          code: ErrorCode.TIMEOUT,
          title: 'Request Timeout',
          message: 'The request took too long to complete. Please try again.',
          retryable: true
        });
        setIsGenerating(false);
      }, timeout);

      try {
        setIsGenerating(true);

        // Transform input
        const requestBody = config.transformInput(input);

        // Make API call
        const endpoint = config.generationEndpoint.startsWith('http')
          ? config.generationEndpoint
          : `${DUNGEONMIND_API_URL}${config.generationEndpoint}`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          signal: abortController.signal,
          body: JSON.stringify(requestBody)
        });

        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // Handle response
        if (!response.ok) {
          if (response.status === 504) {
            throw new Error('GATEWAY_TIMEOUT');
          }

          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail || `Server returned ${response.status}: ${response.statusText}`
          );
        }

        const responseData = await response.json();

        // Transform output
        const output = config.transformOutput(responseData);

        setIsGenerating(false);
        return output;
      } catch (err: any) {
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        setIsGenerating(false);

        // Handle abort (timeout or manual)
        if (err.name === 'AbortError') {
          // Check if it was a timeout
          if (error?.code === ErrorCode.TIMEOUT) {
            // Error already set by timeout handler
            throw err;
          }
          // Manual abort - don't set error
          throw err;
        }

        // Handle network errors
        if (
          err.message.includes('Failed to fetch') ||
          err.message.includes('NetworkError')
        ) {
          const networkError: GenerationError = {
            code: ErrorCode.NETWORK,
            title: 'Network Error',
            message: 'Unable to connect to the server. Please check your connection and try again.',
            retryable: true
          };
          setError(networkError);
          throw err;
        }

        // Handle gateway timeout
        if (err.message === 'GATEWAY_TIMEOUT') {
          const timeoutError: GenerationError = {
            code: ErrorCode.GATEWAY_TIMEOUT,
            title: 'Gateway Timeout',
            message: 'The server took too long to respond. Please try again.',
            retryable: true
          };
          setError(timeoutError);
          throw err;
        }

        // Handle other errors
        const categorizedError = categorizeError(500, err.message);
        setError(categorizedError);
        throw err;
      }
    },
    [config, isTutorialMode, error, categorizeError]
  );

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Cleanup effect
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    isGenerating,
    error,
    generate,
    clearError
  };
}

