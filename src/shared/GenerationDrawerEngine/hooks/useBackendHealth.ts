/**
 * useBackendHealth - Backend health check hook
 * 
 * Polls backend health endpoints to determine service availability.
 * Used by demo page to enable/disable live mode.
 */

import { useState, useEffect, useCallback } from 'react';
import { DUNGEONMIND_API_URL } from '../../../config';

export interface ServiceHealth {
  status: 'checking' | 'online' | 'offline' | 'error';
  lastChecked: Date | null;
  details?: Record<string, unknown>;
  error?: string;
}

export interface BackendHealthState {
  /** Overall API health */
  api: ServiceHealth;
  /** StatBlockGenerator service health */
  statblockgenerator: ServiceHealth;
  /** PlayerCharacterGenerator service health */
  playercharactergenerator: ServiceHealth;
  /** Whether any service is online */
  anyOnline: boolean;
  /** Whether all services are online */
  allOnline: boolean;
}

export interface UseBackendHealthReturn {
  /** Current health state */
  health: BackendHealthState;
  /** Whether currently checking health */
  isChecking: boolean;
  /** Manually trigger health check */
  checkHealth: () => Promise<void>;
  /** Last error message */
  error: string | null;
}

const initialServiceHealth: ServiceHealth = {
  status: 'checking',
  lastChecked: null
};

const initialHealth: BackendHealthState = {
  api: initialServiceHealth,
  statblockgenerator: initialServiceHealth,
  playercharactergenerator: initialServiceHealth,
  anyOnline: false,
  allOnline: false
};

/**
 * Check a single health endpoint
 */
async function checkEndpoint(endpoint: string): Promise<ServiceHealth> {
  try {
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${DUNGEONMIND_API_URL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      // Short timeout for health checks
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const data = await response.json();
      return {
        status: 'online',
        lastChecked: new Date(),
        details: data
      };
    } else {
      return {
        status: 'error',
        lastChecked: new Date(),
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (err: any) {
    // Handle timeout specifically
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return {
        status: 'offline',
        lastChecked: new Date(),
        error: 'Request timeout'
      };
    }
    
    // Network error (server not running)
    if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      return {
        status: 'offline',
        lastChecked: new Date(),
        error: 'Server not reachable'
      };
    }

    return {
      status: 'error',
      lastChecked: new Date(),
      error: err.message || 'Unknown error'
    };
  }
}

/**
 * Hook for checking backend health
 * @param autoCheck - Whether to automatically check on mount (default: true)
 * @param pollInterval - Interval in ms to poll health (0 = no polling, default: 0)
 */
export function useBackendHealth(
  autoCheck: boolean = true,
  pollInterval: number = 0
): UseBackendHealthReturn {
  const [health, setHealth] = useState<BackendHealthState>(initialHealth);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    setError(null);

    try {
      // Check all endpoints in parallel
      const [apiHealth, sbgHealth, pcgHealth] = await Promise.all([
        checkEndpoint('/api/health'),
        checkEndpoint('/api/statblockgenerator/health'),
        checkEndpoint('/api/playercharactergenerator/health')
      ]);

      const anyOnline = 
        apiHealth.status === 'online' ||
        sbgHealth.status === 'online' ||
        pcgHealth.status === 'online';

      const allOnline = 
        apiHealth.status === 'online' &&
        sbgHealth.status === 'online' &&
        pcgHealth.status === 'online';

      setHealth({
        api: apiHealth,
        statblockgenerator: sbgHealth,
        playercharactergenerator: pcgHealth,
        anyOnline,
        allOnline
      });

      console.log('🏥 [Health] Check complete:', {
        api: apiHealth.status,
        sbg: sbgHealth.status,
        pcg: pcgHealth.status,
        anyOnline,
        allOnline
      });
    } catch (err: any) {
      setError(err.message || 'Health check failed');
      console.error('❌ [Health] Check failed:', err);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Auto-check on mount
  useEffect(() => {
    if (autoCheck) {
      checkHealth();
    }
  }, [autoCheck, checkHealth]);

  // Polling
  useEffect(() => {
    if (pollInterval > 0) {
      const interval = setInterval(checkHealth, pollInterval);
      return () => clearInterval(interval);
    }
  }, [pollInterval, checkHealth]);

  return {
    health,
    isChecking,
    checkHealth,
    error
  };
}

