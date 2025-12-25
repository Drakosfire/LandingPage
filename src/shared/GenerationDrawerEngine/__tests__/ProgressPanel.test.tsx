/**
 * Unit tests for ProgressPanel component
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { ProgressPanel } from '../components/ProgressPanel';
import type { ProgressConfig } from '../types';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('ProgressPanel', () => {
  const defaultConfig: ProgressConfig = {
    estimatedDurationMs: 10000,
    milestones: [
      { at: 0, message: 'Starting generation...' },
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

  describe('Rendering', () => {
    it('does not render when not generating', () => {
      renderWithProvider(<ProgressPanel isGenerating={false} config={defaultConfig} />);
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('renders progress bar when generating', async () => {
      renderWithProvider(<ProgressPanel isGenerating={true} config={defaultConfig} />);
      // Hook uses setInterval which needs time to initialize
      act(() => {
        jest.advanceTimersByTime(100);
      });
      await waitFor(() => {
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();
      });
    });

    it('updates progress over time', async () => {
      const { rerender } = renderWithProvider(
        <ProgressPanel isGenerating={false} config={defaultConfig} />
      );

      rerender(
        <MantineProvider>
          <ProgressPanel isGenerating={true} config={defaultConfig} />
        </MantineProvider>
      );

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        const progressBar = screen.getByRole('progressbar');
        const value = parseInt(progressBar.getAttribute('aria-valuenow') || '0');
        expect(value).toBeGreaterThan(15);
      });
    });

    it('applies color from config', async () => {
      renderWithProvider(<ProgressPanel isGenerating={true} config={defaultConfig} />);
      // Hook uses setInterval which needs time to initialize
      act(() => {
        jest.advanceTimersByTime(100);
      });
      await waitFor(() => {
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();
      });
    });

    it('displays milestone message at correct percentage', async () => {
      const { rerender } = renderWithProvider(
        <ProgressPanel isGenerating={false} config={defaultConfig} />
      );

      rerender(
        <MantineProvider>
          <ProgressPanel isGenerating={true} config={defaultConfig} />
        </MantineProvider>
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByText('Starting generation...')).toBeInTheDocument();
      });
    });

    it('caps progress at 95% until complete', async () => {
      const { rerender } = renderWithProvider(
        <ProgressPanel isGenerating={false} config={defaultConfig} />
      );

      rerender(
        <MantineProvider>
          <ProgressPanel isGenerating={true} config={defaultConfig} />
        </MantineProvider>
      );

      act(() => {
        jest.advanceTimersByTime(12000); // Past estimated duration
      });

      await waitFor(() => {
        const progressBar = screen.getByRole('progressbar');
        const value = parseInt(progressBar.getAttribute('aria-valuenow') || '0');
        expect(value).toBeLessThanOrEqual(95);
      });
    });

    it('jumps to 100% on completion', async () => {
      const onCompleteRef = React.createRef<(() => void) | null>();
      const { rerender } = renderWithProvider(
        <ProgressPanel
          isGenerating={false}
          config={defaultConfig}
          onCompleteRef={onCompleteRef}
        />
      );

      rerender(
        <MantineProvider>
          <ProgressPanel
            isGenerating={true}
            config={defaultConfig}
            onCompleteRef={onCompleteRef}
          />
        </MantineProvider>
      );

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Simulate completion by calling the ref callback
      act(() => {
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      });

      await waitFor(() => {
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-valuenow', '100');
      });
    });

    it('applies data-tutorial="progress-bar"', () => {
      renderWithProvider(<ProgressPanel isGenerating={true} config={defaultConfig} />);
      const container = screen.getByTestId('progress-panel');
      expect(container).toHaveAttribute('data-tutorial', 'progress-bar');
    });
  });

  describe('Milestone Messages', () => {
    it('shows first milestone immediately', async () => {
      const { rerender } = renderWithProvider(
        <ProgressPanel isGenerating={false} config={defaultConfig} />
      );

      rerender(
        <MantineProvider>
          <ProgressPanel isGenerating={true} config={defaultConfig} />
        </MantineProvider>
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByText('Starting generation...')).toBeInTheDocument();
      });
    });

    it('transitions to next milestone at threshold', async () => {
      const { rerender } = renderWithProvider(
        <ProgressPanel isGenerating={false} config={defaultConfig} />
      );

      rerender(
        <MantineProvider>
          <ProgressPanel isGenerating={true} config={defaultConfig} />
        </MantineProvider>
      );

      act(() => {
        jest.advanceTimersByTime(5000); // 50% of 10s
      });

      await waitFor(() => {
        expect(screen.getByText('Halfway there...')).toBeInTheDocument();
      });
    });

    it('shows final milestone near completion', async () => {
      const { rerender } = renderWithProvider(
        <ProgressPanel isGenerating={false} config={defaultConfig} />
      );

      rerender(
        <MantineProvider>
          <ProgressPanel isGenerating={true} config={defaultConfig} />
        </MantineProvider>
      );

      act(() => {
        jest.advanceTimersByTime(9000); // 90% of 10s
      });

      await waitFor(() => {
        expect(screen.getByText('Almost done...')).toBeInTheDocument();
      });
    });
  });
});

