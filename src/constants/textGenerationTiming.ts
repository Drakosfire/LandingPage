/**
 * Text Generation Timing Constants
 * 
 * Based on benchmark results from LLM text generation (creature stat blocks).
 * Last updated: October 12, 2025
 * Run `pnpm benchmark:text` to regenerate with current data.
 * 
 * Source: benchmark-text-results.json
 * Note: Times vary based on complexity (legendary, lair, spellcasting options)
 */

export interface ComplexityStage {
    name: string;
    percentage: number;  // % of total generation time
    message: string;     // User-facing message for this stage
}

export interface ComplexityTiming {
    name: string;
    estimatedTime: number;  // ms - Average generation time from benchmarks
    stages: ComplexityStage[];
}

/**
 * Timing data for all creature complexity levels
 * 
 * Benchmark Results (Oct 12, 2025):
 * - base: ~14.1s average (varies 11s - 16s)
 * - legendary: ~17.9s average (varies 15s - 19s)
 * - lair: ~21.7s average (varies 20s - 25s)
 * - spellcasting: ~28.7s average (varies 23s - 34s)
 * - full: ~41.6s average (varies 35s - 48s)
 */
export const COMPLEXITY_TIMINGS: Record<string, ComplexityTiming> = {
    'base': {
        name: 'Base Creature',
        estimatedTime: 19114,  // Average from benchmarks: 14.1s + 5s buffer
        stages: [
            {
                name: 'initializing',
                percentage: 15,
                message: '🎲 Rolling for initiative...'
            },
            {
                name: 'generating',
                percentage: 70,
                message: '📊 Calculating ability scores...'
            },
            {
                name: 'finalizing',
                percentage: 15,
                message: '✨ Adding final touches...'
            }
        ]
    },
    'legendary': {
        name: 'Legendary Creature',
        estimatedTime: 22929,  // Average from benchmarks: 17.9s + 5s buffer
        stages: [
            {
                name: 'initializing',
                percentage: 15,
                message: '🎲 Rolling for initiative...'
            },
            {
                name: 'generating',
                percentage: 50,
                message: '📊 Calculating ability scores...'
            },
            {
                name: 'legendary',
                percentage: 20,
                message: '⚔️ Forging legendary actions...'
            },
            {
                name: 'finalizing',
                percentage: 15,
                message: '✨ Polishing the legend...'
            }
        ]
    },
    'lair': {
        name: 'Lair Creature',
        estimatedTime: 26677,  // Average from benchmarks: 21.7s + 5s buffer
        stages: [
            {
                name: 'initializing',
                percentage: 10,
                message: '🎲 Rolling for initiative...'
            },
            {
                name: 'generating',
                percentage: 45,
                message: '📊 Calculating ability scores...'
            },
            {
                name: 'legendary',
                percentage: 20,
                message: '⚔️ Forging legendary actions...'
            },
            {
                name: 'lair',
                percentage: 15,
                message: '🏰 Building the lair...'
            },
            {
                name: 'finalizing',
                percentage: 10,
                message: '✨ Adding environmental hazards...'
            }
        ]
    },
    'spellcasting': {
        name: 'Spellcasting Creature',
        estimatedTime: 33675,  // Average from benchmarks: 28.7s + 5s buffer
        stages: [
            {
                name: 'initializing',
                percentage: 10,
                message: '🎲 Rolling for initiative...'
            },
            {
                name: 'generating',
                percentage: 40,
                message: '📊 Calculating ability scores...'
            },
            {
                name: 'spellcasting',
                percentage: 35,
                message: '📚 Consulting ancient spellbooks...'
            },
            {
                name: 'finalizing',
                percentage: 15,
                message: '✨ Preparing spell slots...'
            }
        ]
    },
    'full': {
        name: 'Full Complexity Creature',
        estimatedTime: 46650,  // Average from benchmarks: 41.6s + 5s buffer
        stages: [
            {
                name: 'initializing',
                percentage: 10,
                message: '🎲 Summoning the dungeon master...'
            },
            {
                name: 'generating',
                percentage: 30,
                message: '📊 Calculating ability scores...'
            },
            {
                name: 'legendary',
                percentage: 15,
                message: '⚔️ Forging legendary actions...'
            },
            {
                name: 'lair',
                percentage: 10,
                message: '🏰 Building the lair...'
            },
            {
                name: 'spellcasting',
                percentage: 25,
                message: '📚 Consulting ancient spellbooks...'
            },
            {
                name: 'finalizing',
                percentage: 10,
                message: '✨ Weaving it all together...'
            }
        ]
    }
};

/**
 * Determine complexity level based on selected features
 * @param includeSpellcasting - Whether spellcasting is enabled
 * @param includeLegendaryActions - Whether legendary actions are enabled
 * @param includeLairActions - Whether lair actions are enabled
 * @returns Complexity identifier string
 */
export const getComplexityLevel = (
    includeSpellcasting: boolean,
    includeLegendaryActions: boolean,
    includeLairActions: boolean
): string => {
    if (includeSpellcasting && includeLegendaryActions && includeLairActions) {
        return 'full';
    }
    if (includeSpellcasting) {
        return 'spellcasting';
    }
    if (includeLairActions && includeLegendaryActions) {
        return 'lair';
    }
    if (includeLegendaryActions) {
        return 'legendary';
    }
    return 'base';
};

/**
 * Get estimated generation time for a complexity level
 * @param complexity - Complexity identifier
 * @returns Estimated time in milliseconds
 */
export const getEstimatedTime = (complexity: string): number => {
    const timing = COMPLEXITY_TIMINGS[complexity];

    if (!timing) {
        console.warn(`Unknown complexity: ${complexity}, using default timing`);
        return 14114; // Default fallback: base creature time
    }

    return timing.estimatedTime;
};

/**
 * Get timing data for a specific complexity level
 * @param complexity - Complexity identifier
 * @returns Complexity timing configuration
 */
export const getComplexityTiming = (complexity: string): ComplexityTiming | undefined => {
    return COMPLEXITY_TIMINGS[complexity];
};

