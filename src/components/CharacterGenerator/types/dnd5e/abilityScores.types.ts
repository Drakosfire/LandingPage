/**
 * D&D 5e ability score types
 * 
 * Types for ability score assignment methods.
 * 
 * @module CharacterGenerator/types/dnd5e/abilityScores
 */

import { DnD5eAbilityScores } from './character.types';

/**
 * Ability score assignment method
 */
export type AbilityScoreMethod = 'pointBuy' | 'standardArray' | 'rolled' | 'manual';

/**
 * Ability score assignment state
 * Tracks how scores were assigned and the history
 */
export interface AbilityScoreAssignment {
    method: AbilityScoreMethod;
    baseScores: DnD5eAbilityScores;  // Before racial bonuses
    finalScores: DnD5eAbilityScores; // After racial bonuses
    pointsSpent?: number;            // For point buy
    rollHistory?: DiceRoll[];        // For rolled (6 sets of rolls)
}

/**
 * Dice roll result (4d6 drop lowest)
 */
export interface DiceRoll {
    rolls: number[];                 // All 4 dice rolled
    dropped: number;                 // Which die was dropped (lowest)
    total: number;                   // Sum of 3 highest dice
}

/**
 * Point buy state
 */
export interface PointBuyState {
    scores: DnD5eAbilityScores;
    totalSpent: number;
    pointsRemaining: number;
    isValid: boolean;
}

/**
 * Standard array (D&D 5e PHB)
 */
export const STANDARD_ARRAY: number[] = [15, 14, 13, 12, 10, 8];

/**
 * Point buy constants
 */
export const POINT_BUY_TOTAL = 27;
export const POINT_BUY_MIN_SCORE = 8;
export const POINT_BUY_MAX_SCORE = 15;

