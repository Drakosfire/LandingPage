/**
 * Hook for managing demo statblocks
 * 
 * Provides utilities for loading random demo statblocks and checking demo status.
 * Used by the StatBlock Generator to show impressive content to new users.
 */

import { useCallback } from 'react';
import { getRandomDemo, isDemoStatblock, DEMO_STATBLOCKS } from '../fixtures/demoStatblocks';
import { StatBlockDetails } from '../types/statblock.types';

export const useRandomDemo = () => {
    /**
     * Get a random demo statblock from the collection
     */
    const getDemo = useCallback((): StatBlockDetails => {
        return getRandomDemo();
    }, []);

    /**
     * Check if a given statblock name matches one of the demos
     */
    const isDemo = useCallback((name: string): boolean => {
        return isDemoStatblock(name);
    }, []);

    /**
     * Get total count of available demos
     */
    const getDemoCount = useCallback((): number => {
        return DEMO_STATBLOCKS.length;
    }, []);

    /**
     * Get all demo names (for display purposes)
     */
    const getDemoNames = useCallback((): string[] => {
        return DEMO_STATBLOCKS.map(demo => demo.name);
    }, []);

    return {
        getDemo,
        isDemo,
        getDemoCount,
        getDemoNames
    };
};

