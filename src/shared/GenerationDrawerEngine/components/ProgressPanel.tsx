/**
 * ProgressPanel - Progress bar with milestone messages
 * 
 * Displays animated progress bar with configurable milestones during generation.
 */

import React from 'react';
import { Progress, Stack, Text, Group } from '@mantine/core';
import { IconWand } from '@tabler/icons-react';
import { useProgress } from '../hooks/useProgress';
import type { ProgressConfig } from '../types';

export interface ProgressPanelProps {
  /** Whether generation is in progress */
  isGenerating: boolean;
  /** Progress configuration */
  config: ProgressConfig;
  /** Completion callback ref (parent calls this when generation completes) */
  onCompleteRef?: React.MutableRefObject<(() => void) | null>;
  /** Optional: Persisted start time from parent for progress continuity across remounts */
  persistedStartTime?: number | null;
}

/**
 * ProgressPanel component for displaying generation progress
 */
export const ProgressPanel: React.FC<ProgressPanelProps> = ({
  isGenerating,
  config,
  onCompleteRef,
  persistedStartTime
}) => {
  const { progress, currentMessage, onComplete } = useProgress(
    isGenerating,
    config,
    persistedStartTime
  );

  // Expose onComplete callback via ref for parent to call
  React.useEffect(() => {
    if (onCompleteRef) {
      onCompleteRef.current = onComplete;
    }
  }, [onComplete, onCompleteRef]);

  if (!isGenerating) {
    return null;
  }

  const elapsedSeconds = Math.floor((progress / 100) * (config.estimatedDurationMs / 1000));
  const estimatedSeconds = Math.ceil(config.estimatedDurationMs / 1000);

  return (
    <Stack
      gap="md"
      p="md"
      data-testid="progress-panel"
      data-tutorial="progress-bar"
      style={{
        backgroundColor: 'var(--mantine-color-violet-0)',
        borderRadius: 'var(--mantine-radius-md)',
        border: '1px solid var(--mantine-color-violet-2)'
      }}
    >
      {/* Header with icon and time */}
      <Group justify="space-between">
        <Group gap="xs">
          <IconWand size={20} color="var(--mantine-color-violet-6)" />
          <Text fw={500} size="sm">
            Generating
          </Text>
        </Group>
        <Text size="sm" c="dimmed">
          {elapsedSeconds}s / ~{estimatedSeconds}s
        </Text>
      </Group>

      {/* Progress bar */}
      <Stack gap="xs">
        <Progress
          value={progress}
          size="lg"
          radius="sm"
          animated
          color={config.color || 'violet'}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Generation progress"
          styles={{
            root: {
              backgroundColor: 'var(--mantine-color-gray-2)'
            },
            section: {
              transition: 'width 0.1s ease-out'
            }
          }}
        />

        {/* Milestone message and percentage */}
        {currentMessage && (
          <Group justify="space-between">
            <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>
              {currentMessage}
            </Text>
            <Text size="xs" c="dimmed" fw={600}>
              {Math.round(progress)}%
            </Text>
          </Group>
        )}
      </Stack>
    </Stack>
  );
};

