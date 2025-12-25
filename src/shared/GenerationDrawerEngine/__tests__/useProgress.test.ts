/**
 * Unit tests for useProgress hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useProgress } from '../hooks/useProgress';
import type { ProgressConfig, Milestone } from '../types';

describe('useProgress', () => {
  const defaultConfig: ProgressConfig = {
    estimatedDurationMs: 10000, // 10 seconds
    milestones: [
      { at: 0, message: 'Starting...' },
      { at: 50, message: 'Halfway there...' },
      { at: 90, message: 'Almost done...' }
    ],
    color: 'violet'
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('starts at 0% when not generating', () => {
      const { result } = renderHook(() =>
        useProgress(false, defaultConfig)
      );
      expect(result.current.progress).toBe(0);
      expect(result.current.currentMessage).toBe('');
    });
  });

  describe('Progress Calculation', () => {
    it('increases progress over time when generating', async () => {
      const { result, rerender } = renderHook(
        ({ isGenerating }) => useProgress(isGenerating, defaultConfig),
        { initialProps: { isGenerating: false } }
      );

      expect(result.current.progress).toBe(0);

      // Start generating
      rerender({ isGenerating: true });

      // Fast-forward 2 seconds (20% of 10s)
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(result.current.progress).toBeGreaterThan(15);
        expect(result.current.progress).toBeLessThan(25);
      });

      // Fast-forward to 5 seconds (50%)
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(result.current.progress).toBeGreaterThan(45);
        expect(result.current.progress).toBeLessThan(55);
      });
    });

    it('respects estimatedDurationMs', async () => {
      const shortConfig: ProgressConfig = {
        estimatedDurationMs: 5000, // 5 seconds
        milestones: []
      };

      const { result, rerender } = renderHook(
        ({ isGenerating }) => useProgress(isGenerating, shortConfig),
        { initialProps: { isGenerating: false } }
      );

      rerender({ isGenerating: true });

      // Fast-forward 2.5 seconds (50% of 5s)
      act(() => {
        jest.advanceTimersByTime(2500);
      });

      await waitFor(() => {
        expect(result.current.progress).toBeGreaterThan(45);
        expect(result.current.progress).toBeLessThan(55);
      });
    });

    it('caps at 95% until onComplete called', async () => {
      const { result, rerender } = renderHook(
        ({ isGenerating }) => useProgress(isGenerating, defaultConfig),
        { initialProps: { isGenerating: false } }
      );

      rerender({ isGenerating: true });

      // Fast-forward past estimated duration
      act(() => {
        jest.advanceTimersByTime(12000);
      });

      await waitFor(() => {
        expect(result.current.progress).toBeLessThanOrEqual(95);
      });

      // Call onComplete
      act(() => {
        result.current.onComplete();
      });

      await waitFor(() => {
        expect(result.current.progress).toBe(100);
      });
    });

    it('jumps to 100% when onComplete called', async () => {
      const { result, rerender } = renderHook(
        ({ isGenerating }) => useProgress(isGenerating, defaultConfig),
        { initialProps: { isGenerating: false } }
      );

      rerender({ isGenerating: true });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Call onComplete before reaching 95%
      act(() => {
        result.current.onComplete();
      });

      await waitFor(() => {
        expect(result.current.progress).toBe(100);
      });
    });

    it('resets to 0% when isGenerating becomes false', async () => {
      const { result, rerender } = renderHook(
        ({ isGenerating }) => useProgress(isGenerating, defaultConfig),
        { initialProps: { isGenerating: false } }
      );

      rerender({ isGenerating: true });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(result.current.progress).toBeGreaterThan(0);
      });

      // Stop generating
      rerender({ isGenerating: false });

      await waitFor(() => {
        expect(result.current.progress).toBe(0);
      });
    });
  });

  describe('Milestones', () => {
    it('returns empty message when no milestones', () => {
      const configWithoutMilestones: ProgressConfig = {
        estimatedDurationMs: 10000
      };

      const { result, rerender } = renderHook(
        ({ isGenerating }) => useProgress(isGenerating, configWithoutMilestones),
        { initialProps: { isGenerating: false } }
      );

      rerender({ isGenerating: true });

      expect(result.current.currentMessage).toBe('');
    });

    it('returns first milestone message at start', async () => {
      const { result, rerender } = renderHook(
        ({ isGenerating }) => useProgress(isGenerating, defaultConfig),
        { initialProps: { isGenerating: false } }
      );

      rerender({ isGenerating: true });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.currentMessage).toBe('Starting...');
      });
    });

    it('transitions to next milestone at threshold', async () => {
      const { result, rerender } = renderHook(
        ({ isGenerating }) => useProgress(isGenerating, defaultConfig),
        { initialProps: { isGenerating: false } }
      );

      rerender({ isGenerating: true });

      // Fast-forward to 50%
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(result.current.currentMessage).toBe('Halfway there...');
      });
    });

    it('returns last milestone near end', async () => {
      const { result, rerender } = renderHook(
        ({ isGenerating }) => useProgress(isGenerating, defaultConfig),
        { initialProps: { isGenerating: false } }
      );

      rerender({ isGenerating: true });

      // Fast-forward to 90%
      act(() => {
        jest.advanceTimersByTime(9000);
      });

      await waitFor(() => {
        expect(result.current.currentMessage).toBe('Almost done...');
      });
    });
  });

  describe('Performance', () => {
    it('updates at ~60fps (16ms interval)', async () => {
      const { result, rerender } = renderHook(
        ({ isGenerating }) => useProgress(isGenerating, defaultConfig),
        { initialProps: { isGenerating: false } }
      );

      rerender({ isGenerating: true });

      const initialProgress = result.current.progress;

      act(() => {
        jest.advanceTimersByTime(16); // One frame
      });

      await waitFor(() => {
        // Progress should have updated
        expect(result.current.progress).toBeGreaterThan(initialProgress);
      });
    });

    it('cleans up interval on unmount', () => {
      const { unmount, rerender } = renderHook(
        ({ isGenerating }) => useProgress(isGenerating, defaultConfig),
        { initialProps: { isGenerating: false } }
      );

      rerender({ isGenerating: true });

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });

    it('does not update when component unmounted', () => {
      const { result, rerender, unmount } = renderHook(
        ({ isGenerating }) => useProgress(isGenerating, defaultConfig),
        { initialProps: { isGenerating: false } }
      );

      rerender({ isGenerating: true });
      const progressBeforeUnmount = result.current.progress;

      unmount();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Progress should not have changed after unmount
      expect(result.current.progress).toBe(progressBeforeUnmount);
    });
  });
});


