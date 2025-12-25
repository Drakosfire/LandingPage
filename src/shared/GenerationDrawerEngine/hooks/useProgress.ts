/**
 * useProgress - Progress simulation hook
 * 
 * Simulates progress bar animation with milestone messages during generation.
 * Caps at 95% until explicitly completed, then jumps to 100%.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ProgressConfig, Milestone } from '../types';

export interface UseProgressReturn {
  /** Current progress percentage (0-100) */
  progress: number;
  /** Current milestone message */
  currentMessage: string;
  /** Call to complete progress (jumps to 100%) */
  onComplete: () => void;
}

/**
 * Hook for simulating progress during generation
 * @param isGenerating - Whether generation is in progress
 * @param config - Progress configuration with duration and milestones
 * @param persistedStartTime - Optional: Start time from parent for progress continuity
 * @returns Progress state and completion callback
 */
export function useProgress(
  isGenerating: boolean,
  config: ProgressConfig | undefined,
  persistedStartTime?: number | null
): UseProgressReturn {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const completedRef = useRef(false);

  // Reset when generation starts, using persisted start time if available
  useEffect(() => {
    if (isGenerating && !startTimeRef.current) {
      // Use persisted start time if available (for continuity across remounts)
      startTimeRef.current = persistedStartTime || Date.now();
      completedRef.current = false;

      // Calculate initial progress if resuming from persisted time
      if (persistedStartTime && config) {
        const elapsed = Date.now() - persistedStartTime;
        const initialProgress = Math.min((elapsed / config.estimatedDurationMs) * 100, 95);
        setProgress(initialProgress);
      } else {
        setProgress(0);
        setCurrentMessage('');
      }
    } else if (!isGenerating) {
      // Reset when generation stops
      startTimeRef.current = null;
      completedRef.current = false;
      setProgress(0);
      setCurrentMessage('');
    }
  }, [isGenerating, persistedStartTime, config]);

  // Update progress at ~60fps (16ms interval)
  useEffect(() => {
    if (!isGenerating || !config || !startTimeRef.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      if (!startTimeRef.current || completedRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const { estimatedDurationMs, milestones = [] } = config;

      // Calculate progress (cap at 95% until complete)
      const calculatedProgress = Math.min(
        (elapsed / estimatedDurationMs) * 100,
        95
      );
      setProgress(calculatedProgress);

      // Determine current milestone message
      let message = '';
      if (milestones.length > 0) {
        // Find the milestone we're currently at
        for (let i = milestones.length - 1; i >= 0; i--) {
          if (calculatedProgress >= milestones[i].at) {
            message = milestones[i].message;
            break;
          }
        }
        // If no milestone matched, use first one
        if (!message && milestones.length > 0) {
          message = milestones[0].message;
        }
      }
      setCurrentMessage(message);
    }, 16); // ~60fps

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isGenerating, config]);

  // Completion callback
  const onComplete = useCallback(() => {
    completedRef.current = true;
    setProgress(100);
    // Use last milestone message if available
    if (config?.milestones && config.milestones.length > 0) {
      const lastMilestone = config.milestones[config.milestones.length - 1];
      setCurrentMessage(lastMilestone.message);
    }
  }, [config]);

  return {
    progress,
    currentMessage,
    onComplete
  };
}


