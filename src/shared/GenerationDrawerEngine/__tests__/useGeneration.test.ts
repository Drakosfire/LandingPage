/**
 * Unit tests for useGeneration hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useGeneration } from '../hooks/useGeneration';
import { ErrorCode, GenerationType } from '../types';
import { setupFetchMock, mockGenerationSuccess, mockGenerationError, mockNetworkError, mockTimeout } from './test-utils/mockApi';

// Mock fetch
global.fetch = jest.fn() as jest.Mock;

describe('useGeneration', () => {
  const defaultConfig = {
    generationEndpoint: '/api/test/generate',
    transformInput: (input: { prompt: string }) => ({ description: input.prompt }),
    transformOutput: (response: any) => response.data,
    timeout: 30000
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('API Calls', () => {
    it('calls endpoint with transformed input', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockGenerationSuccess({ data: { result: 'test' } })
      );

      const { result } = renderHook(() =>
        useGeneration(defaultConfig, false)
      );

      await act(async () => {
        await result.current.generate({ prompt: 'test prompt' });
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test/generate',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: 'test prompt' })
        })
      );
    });

    it('includes credentials in request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockGenerationSuccess({ data: { result: 'test' } })
      );

      const { result } = renderHook(() =>
        useGeneration(defaultConfig, false)
      );

      await act(async () => {
        await result.current.generate({ prompt: 'test' });
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include'
        })
      );
    });

    it('sets correct Content-Type header', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockGenerationSuccess({ data: { result: 'test' } })
      );

      const { result } = renderHook(() =>
        useGeneration(defaultConfig, false)
      );

      await act(async () => {
        await result.current.generate({ prompt: 'test' });
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('returns transformed output on success', async () => {
      const mockData = { data: { result: 'test output' } };
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockGenerationSuccess(mockData)
      );

      const { result } = renderHook(() =>
        useGeneration(defaultConfig, false)
      );

      let output: any = null;
      await act(async () => {
        output = await result.current.generate({ prompt: 'test' });
      });

      expect(output).toEqual({ result: 'test output' });
    });
  });

  describe('State Management', () => {
    it('sets isGenerating true on start', async () => {
      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise((resolve) => setTimeout(() => resolve(mockGenerationSuccess({ data: {} })), 100))
      );

      const { result } = renderHook(() =>
        useGeneration(defaultConfig, false)
      );

      expect(result.current.isGenerating).toBe(false);

      act(() => {
        result.current.generate({ prompt: 'test' });
      });

      await waitFor(() => {
        expect(result.current.isGenerating).toBe(true);
      });
    });

    it('sets isGenerating false on complete', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockGenerationSuccess({ data: {} })
      );

      const { result } = renderHook(() =>
        useGeneration(defaultConfig, false)
      );

      await act(async () => {
        await result.current.generate({ prompt: 'test' });
      });

      expect(result.current.isGenerating).toBe(false);
    });

    it('sets isGenerating false on error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockGenerationError(500, 'Server error')
      );

      const { result } = renderHook(() =>
        useGeneration(defaultConfig, false)
      );

      await act(async () => {
        try {
          await result.current.generate({ prompt: 'test' });
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.isGenerating).toBe(false);
    });

    it('clears error on new generation', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockGenerationError(500, 'Error'))
        .mockResolvedValueOnce(mockGenerationSuccess({ data: {} }));

      const { result } = renderHook(() =>
        useGeneration(defaultConfig, false)
      );

      // First generation fails
      await act(async () => {
        try {
          await result.current.generate({ prompt: 'test' });
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error).toBeTruthy();

      // Second generation succeeds
      await act(async () => {
        await result.current.generate({ prompt: 'test' });
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Abort Handling', () => {
    it('aborts previous request on new generation', async () => {
      const abortSpy = jest.fn();
      const abortController = new AbortController();
      abortController.abort = abortSpy;

      (global.fetch as jest.Mock).mockImplementation(() => {
        return new Promise(() => {}); // Never resolves
      });

      const { result } = renderHook(() =>
        useGeneration(defaultConfig, false)
      );

      act(() => {
        result.current.generate({ prompt: 'first' });
      });

      // Start second generation
      act(() => {
        result.current.generate({ prompt: 'second' });
      });

      // First request should be aborted
      await waitFor(() => {
        expect(abortSpy).toHaveBeenCalled();
      });
    });

    it('aborts on unmount', () => {
      const abortSpy = jest.fn();

      (global.fetch as jest.Mock).mockImplementation(() => {
        return new Promise(() => {}); // Never resolves
      });

      const { result, unmount } = renderHook(() =>
        useGeneration(defaultConfig, false)
      );

      act(() => {
        result.current.generate({ prompt: 'test' });
      });

      unmount();

      // Should not throw
      expect(() => unmount()).not.toThrow();
    });

    it('handles abort gracefully (no error thrown)', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => {
        return Promise.reject(new DOMException('Aborted', 'AbortError'));
      });

      const { result } = renderHook(() =>
        useGeneration(defaultConfig, false)
      );

      await act(async () => {
        try {
          await result.current.generate({ prompt: 'test' });
        } catch (e) {
          // AbortError should be handled gracefully
        }
      });

      // Should not have a generic error
      expect(result.current.error?.code).not.toBe(ErrorCode.UNKNOWN);
    });
  });

  describe('Timeout', () => {
    it('aborts after timeout duration', async () => {
      jest.useFakeTimers();
      (global.fetch as jest.Mock).mockImplementation(() => mockTimeout());

      const { result } = renderHook(() =>
        useGeneration({ ...defaultConfig, timeout: 5000 }, false)
      );

      act(() => {
        result.current.generate({ prompt: 'test' });
      });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(result.current.error?.code).toBe(ErrorCode.TIMEOUT);
      });

      jest.useRealTimers();
    });

    it('returns timeout error on timeout', async () => {
      jest.useFakeTimers();
      (global.fetch as jest.Mock).mockImplementation(() => mockTimeout());

      const { result } = renderHook(() =>
        useGeneration({ ...defaultConfig, timeout: 1000 }, false)
      );

      act(() => {
        result.current.generate({ prompt: 'test' });
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.error?.code).toBe(ErrorCode.TIMEOUT);
        expect(result.current.error?.retryable).toBe(true);
      });

      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('returns TIMEOUT error on client timeout', async () => {
      jest.useFakeTimers();
      (global.fetch as jest.Mock).mockImplementation(() => mockTimeout());

      const { result } = renderHook(() =>
        useGeneration({ ...defaultConfig, timeout: 1000 }, false)
      );

      act(() => {
        result.current.generate({ prompt: 'test' });
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.error?.code).toBe(ErrorCode.TIMEOUT);
      });

      jest.useRealTimers();
    });

    it('returns GATEWAY_TIMEOUT on 504 response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockGenerationError(504, 'Gateway Timeout')
      );

      const { result } = renderHook(() =>
        useGeneration(defaultConfig, false)
      );

      await act(async () => {
        try {
          await result.current.generate({ prompt: 'test' });
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error?.code).toBe(ErrorCode.GATEWAY_TIMEOUT);
    });

    it('returns NETWORK error on fetch failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Failed to fetch')
      );

      const { result } = renderHook(() =>
        useGeneration(defaultConfig, false)
      );

      await act(async () => {
        try {
          await result.current.generate({ prompt: 'test' });
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error?.code).toBe(ErrorCode.NETWORK);
    });

    it('returns UNKNOWN error on other failures', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockGenerationError(500, 'Internal Server Error')
      );

      const { result } = renderHook(() =>
        useGeneration(defaultConfig, false)
      );

      await act(async () => {
        try {
          await result.current.generate({ prompt: 'test' });
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error?.code).toBe(ErrorCode.UNKNOWN);
    });

    it('preserves error message from response', async () => {
      const errorMessage = 'Custom error message';
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockGenerationError(400, errorMessage)
      );

      const { result } = renderHook(() =>
        useGeneration(defaultConfig, false)
      );

      await act(async () => {
        try {
          await result.current.generate({ prompt: 'test' });
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error?.message).toContain(errorMessage);
    });
  });

  describe('Tutorial Mode', () => {
    it('skips API call in tutorial mode', async () => {
      const mockData = { result: 'tutorial mock' };
      const config = {
        ...defaultConfig,
        tutorialConfig: {
          mockData,
          simulatedDurationMs: 1000
        }
      };

      const { result } = renderHook(() =>
        useGeneration(config, true) // isTutorialMode = true
      );

      await act(async () => {
        const output = await result.current.generate({ prompt: 'test' });
        expect(output).toEqual(mockData);
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('simulates delay in tutorial mode', async () => {
      jest.useFakeTimers();
      const mockData = { result: 'tutorial mock' };
      const config = {
        ...defaultConfig,
        tutorialConfig: {
          mockData,
          simulatedDurationMs: 2000
        }
      };

      const { result } = renderHook(() =>
        useGeneration(config, true)
      );

      let resolved = false;
      act(() => {
        result.current.generate({ prompt: 'test' }).then(() => {
          resolved = true;
        });
      });

      // Should not resolve immediately
      expect(resolved).toBe(false);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(resolved).toBe(true);
      });

      jest.useRealTimers();
    });

    it('returns mock data in tutorial mode', async () => {
      const mockData = { result: 'tutorial mock' };
      const config = {
        ...defaultConfig,
        tutorialConfig: {
          mockData,
          simulatedDurationMs: 100
        }
      };

      const { result } = renderHook(() =>
        useGeneration(config, true)
      );

      await act(async () => {
        const output = await result.current.generate({ prompt: 'test' });
        expect(output).toEqual(mockData);
      });
    });
  });
});

