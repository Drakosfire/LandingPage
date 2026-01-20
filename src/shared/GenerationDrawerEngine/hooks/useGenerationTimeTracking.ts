/**
 * useGenerationTimeTracking - Hook for tracking generation times and progressively improving progress bar timing
 * 
 * Tracks actual generation durations and calculates statistics (mean, median, percentiles)
 * to progressively dial in the progress bar's estimatedDurationMs based on real data.
 * 
 * Stores data in localStorage keyed by service and generation type (text/image).
 */

import { useState, useCallback, useEffect, useMemo } from 'react';

export interface GenerationTimeRecord {
  /** Timestamp when generation completed */
  timestamp: number;
  /** Duration in milliseconds */
  durationMs: number;
  /** Generation type (text/image) */
  generationType: 'text' | 'image';
  /** Optional metadata (model, service, etc.) */
  metadata?: Record<string, string | number>;
}

export interface GenerationTimeStats {
  /** Service identifier */
  service: string;
  /** Generation type */
  generationType: 'text' | 'image';
  /** Number of recorded times */
  count: number;
  /** Mean duration in milliseconds */
  meanMs: number;
  /** Median duration in milliseconds */
  medianMs: number;
  /** P50 duration (same as median) */
  p50Ms: number;
  /** P75 duration */
  p75Ms: number;
  /** P95 duration */
  p95Ms: number;
  /** P99 duration */
  p99Ms: number;
  /** Minimum duration */
  minMs: number;
  /** Maximum duration */
  maxMs: number;
  /** Recommended estimatedDurationMs (default: P95 for safety margin) */
  recommendedEstimatedMs: number;
  /** All recorded durations (for debugging) */
  durations: number[];
}

export interface UseGenerationTimeTrackingConfig {
  /** Service identifier (e.g., 'statblock', 'map', 'pcg') */
  service: string;
  /** Generation type being tracked */
  generationType: 'text' | 'image';
  /** Maximum number of records to keep (default: 100) */
  maxRecords?: number;
  /** Which percentile to use for recommended estimate (default: 95 for P95) */
  recommendedPercentile?: number;
}

export interface UseGenerationTimeTrackingReturn {
  /** Record a generation duration */
  recordDuration: (durationMs: number, metadata?: Record<string, string | number>) => void;
  /** Get current statistics */
  stats: GenerationTimeStats | null;
  /** Get recommended estimatedDurationMs for progress bar */
  recommendedEstimatedMs: number;
  /** Clear all recorded times for this service/type */
  clearRecords: () => void;
  /** Number of records */
  recordCount: number;
}

const STORAGE_PREFIX = 'generation_times_';

function getStorageKey(service: string, generationType: 'text' | 'image'): string {
  return `${STORAGE_PREFIX}${service}_${generationType}`;
}

function loadRecords(service: string, generationType: 'text' | 'image'): GenerationTimeRecord[] {
  try {
    const key = getStorageKey(service, generationType);
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log(`📊 [TimeTracking] Loaded ${parsed.length} records for ${service}/${generationType}`);
      return parsed;
    }
  } catch (err) {
    console.warn('❌ [TimeTracking] Failed to load records:', err);
  }
  return [];
}

function saveRecords(service: string, generationType: 'text' | 'image', records: GenerationTimeRecord[]): void {
  try {
    const key = getStorageKey(service, generationType);
    localStorage.setItem(key, JSON.stringify(records));
    console.log(`💾 [TimeTracking] Saved ${records.length} records for ${service}/${generationType}`);
    window.dispatchEvent(new CustomEvent('generation-time-recorded', {
      detail: { service, generationType }
    }));
  } catch (err) {
    console.warn('❌ [TimeTracking] Failed to save records:', err);
  }
}

function calculateStats(
  records: GenerationTimeRecord[],
  service: string,
  generationType: 'text' | 'image',
  recommendedPercentile: number = 95
): GenerationTimeStats {
  if (records.length === 0) {
    return {
      service,
      generationType,
      count: 0,
      meanMs: 0,
      medianMs: 0,
      p50Ms: 0,
      p75Ms: 0,
      p95Ms: 0,
      p99Ms: 0,
      minMs: 0,
      maxMs: 0,
      recommendedEstimatedMs: 0,
      durations: []
    };
  }

  const durations = records.map(r => r.durationMs).sort((a, b) => a - b);
  const count = durations.length;
  const sum = durations.reduce((acc, d) => acc + d, 0);
  const meanMs = sum / count;
  const minMs = durations[0];
  const maxMs = durations[count - 1];

  // Calculate percentiles
  const p50Ms = durations[Math.floor(count * 0.50)];
  const p75Ms = durations[Math.floor(count * 0.75)];
  const p95Ms = durations[Math.floor(count * 0.95)];
  const p99Ms = durations[Math.floor(count * 0.99)];

  // Use requested percentile for recommendation (default P95)
  const percentileIndex = Math.floor(count * (recommendedPercentile / 100));
  const recommendedEstimatedMs = durations[percentileIndex];

  return {
    service,
    generationType,
    count,
    meanMs,
    medianMs: p50Ms,
    p50Ms,
    p75Ms,
    p95Ms,
    p99Ms,
    minMs,
    maxMs,
    recommendedEstimatedMs,
    durations
  };
}

/**
 * Hook for tracking generation times and calculating statistics
 */
export function useGenerationTimeTracking(
  config: UseGenerationTimeTrackingConfig
): UseGenerationTimeTrackingReturn {
  const {
    service,
    generationType,
    maxRecords = 100,
    recommendedPercentile = 95
  } = config;

  // Load records on mount
  const [records, setRecords] = useState<GenerationTimeRecord[]>(() => 
    loadRecords(service, generationType)
  );

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ service: string; generationType: 'text' | 'image' }>;
      if (!customEvent.detail) return;
      if (customEvent.detail.service !== service || customEvent.detail.generationType !== generationType) return;
      setRecords(loadRecords(service, generationType));
    };

    window.addEventListener('generation-time-recorded', handleUpdate);
    return () => window.removeEventListener('generation-time-recorded', handleUpdate);
  }, [service, generationType]);

  // Calculate stats from records
  const stats = useMemo(() => {
    return calculateStats(records, service, generationType, recommendedPercentile);
  }, [records, service, generationType, recommendedPercentile]);

  // Record a new duration
  const recordDuration = useCallback(
    (durationMs: number, metadata?: Record<string, string | number>) => {
      const newRecord: GenerationTimeRecord = {
        timestamp: Date.now(),
        durationMs,
        generationType,
        metadata
      };

      setRecords((prev) => {
        // Add new record and sort by timestamp (newest first)
        const updated = [newRecord, ...prev].sort((a, b) => b.timestamp - a.timestamp);
        
        // Keep only the most recent maxRecords
        const trimmed = updated.slice(0, maxRecords);
        
        // Save to localStorage
        saveRecords(service, generationType, trimmed);
        
        console.log(`⏱️ [TimeTracking] Recorded ${durationMs}ms for ${service}/${generationType} (${trimmed.length} total records)`);
        
        return trimmed;
      });
    },
    [service, generationType, maxRecords]
  );

  // Clear all records
  const clearRecords = useCallback(() => {
    setRecords([]);
    saveRecords(service, generationType, []);
    console.log(`🗑️ [TimeTracking] Cleared all records for ${service}/${generationType}`);
  }, [service, generationType]);

  // Recommended estimate (default to fallback if no stats)
  const recommendedEstimatedMs = stats.count > 0 
    ? stats.recommendedEstimatedMs 
    : 0;

  return {
    recordDuration,
    stats: stats.count > 0 ? stats : null,
    recommendedEstimatedMs,
    clearRecords,
    recordCount: stats.count
  };
}

/**
 * Track generation duration automatically
 * 
 * Usage:
 * ```typescript
 * const startTime = performance.now();
 * try {
 *   const result = await generate(input);
 *   const duration = performance.now() - startTime;
 *   trackGenerationTime(duration);
 * } catch (err) {
 *   // Don't track failed generations
 * }
 * ```
 */
export function trackGenerationTime(
  service: string,
  generationType: 'text' | 'image',
  durationMs: number,
  metadata?: Record<string, string | number>
): void {
  try {
    const key = getStorageKey(service, generationType);
    const existing = loadRecords(service, generationType);
    
    const newRecord: GenerationTimeRecord = {
      timestamp: Date.now(),
      durationMs,
      generationType,
      metadata
    };

    // Add new record and keep most recent 100
    const updated = [newRecord, ...existing]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100);

    saveRecords(service, generationType, updated);
    console.log(`⏱️ [TimeTracking] Recorded ${durationMs}ms for ${service}/${generationType}`);
  } catch (err) {
    console.warn('❌ [TimeTracking] Failed to track time:', err);
  }
}

/**
 * Get recommended estimatedDurationMs for a service/generation type
 */
export function getRecommendedEstimatedMs(
  service: string,
  generationType: 'text' | 'image',
  fallbackMs: number,
  recommendedPercentile: number = 95
): number {
  const records = loadRecords(service, generationType);
  if (records.length === 0) {
    return fallbackMs;
  }

  const stats = calculateStats(records, service, generationType, recommendedPercentile);
  return stats.recommendedEstimatedMs;
}
