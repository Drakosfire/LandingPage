/**
 * D&D 5e Point Buy rules
 * 
 * Implementation of D&D 5e point buy system.
 * Rules from Player's Handbook (PHB).
 * 
 * @module CharacterGenerator/rules/dnd5e/pointBuy
 */

import { DnD5eAbilityScores } from '../../types/dnd5e/character.types';
import { 
    ValidationResult, 
    createSuccessResult,
    createValidationError 
} from '../../types/validation.types';
import { 
    POINT_BUY_TOTAL, 
    POINT_BUY_MIN_SCORE, 
    POINT_BUY_MAX_SCORE 
} from '../../types/dnd5e/abilityScores.types';

// Re-export constants for convenience
export { POINT_BUY_TOTAL, POINT_BUY_MIN_SCORE, POINT_BUY_MAX_SCORE } from '../../types/dnd5e/abilityScores.types';

/**
 * Point buy cost table (D&D 5e PHB p.13)
 */
const POINT_BUY_COSTS: Record<number, number> = {
    8: 0,
    9: 1,
    10: 2,
    11: 3,
    12: 4,
    13: 5,
    14: 7,
    15: 9
};

/**
 * Get the point cost for a given ability score
 * 
 * @param score - Ability score (must be 8-15)
 * @returns Point cost
 * @throws Error if score is out of range
 */
export function getPointBuyCost(score: number): number {
    if (score < POINT_BUY_MIN_SCORE || score > POINT_BUY_MAX_SCORE) {
        throw new Error(
            `Point buy scores must be between ${POINT_BUY_MIN_SCORE} and ${POINT_BUY_MAX_SCORE} ` +
            `(got: ${score})`
        );
    }
    return POINT_BUY_COSTS[score];
}

/**
 * Calculate total points spent for given ability scores
 * 
 * @param scores - Ability scores
 * @returns Total points spent
 */
export function calculateTotalPointsSpent(scores: DnD5eAbilityScores): number {
    const abilities: (keyof DnD5eAbilityScores)[] = [
        'strength',
        'dexterity',
        'constitution',
        'intelligence',
        'wisdom',
        'charisma'
    ];
    
    return abilities.reduce((total, ability) => {
        const score = scores[ability];
        // Handle scores outside valid range gracefully for UI
        if (score < POINT_BUY_MIN_SCORE) return total;
        if (score > POINT_BUY_MAX_SCORE) return total + POINT_BUY_COSTS[POINT_BUY_MAX_SCORE];
        return total + getPointBuyCost(score);
    }, 0);
}

/**
 * Validate point buy ability scores
 * 
 * Checks:
 * - All scores are in range 8-15
 * - Total points spent equals 27
 * 
 * @param scores - Ability scores to validate
 * @returns Validation result
 */
export function validatePointBuy(scores: DnD5eAbilityScores): ValidationResult {
    const errors: any[] = [];
    
    const abilities: Array<{key: keyof DnD5eAbilityScores, name: string}> = [
        { key: 'strength', name: 'Strength' },
        { key: 'dexterity', name: 'Dexterity' },
        { key: 'constitution', name: 'Constitution' },
        { key: 'intelligence', name: 'Intelligence' },
        { key: 'wisdom', name: 'Wisdom' },
        { key: 'charisma', name: 'Charisma' }
    ];
    
    // Check each ability score is in valid range
    for (const { key, name } of abilities) {
        const score = scores[key];
        
        if (score < POINT_BUY_MIN_SCORE) {
            errors.push(createValidationError(
                'error',
                1,
                `${name} must be at least ${POINT_BUY_MIN_SCORE} (current: ${score})`,
                key
            ));
        }
        
        if (score > POINT_BUY_MAX_SCORE) {
            errors.push(createValidationError(
                'error',
                1,
                `${name} cannot exceed ${POINT_BUY_MAX_SCORE} before racial bonuses (current: ${score})`,
                key
            ));
        }
    }
    
    // Check total points
    const totalSpent = calculateTotalPointsSpent(scores);
    if (totalSpent !== POINT_BUY_TOTAL) {
        errors.push(createValidationError(
            'error',
            1,
            `Must spend exactly ${POINT_BUY_TOTAL} points (current: ${totalSpent})`,
            'pointBuy'
        ));
    }
    
    if (errors.length === 0) {
        return createSuccessResult();
    }
    
    return {
        isValid: false,
        errors,
        warnings: []
    };
}

/**
 * Check if an ability score can be increased
 * 
 * @param currentScore - Current ability score
 * @param pointsRemaining - Points remaining to spend
 * @returns True if score can be increased
 */
export function canIncrease(currentScore: number, pointsRemaining: number): boolean {
    // Can't exceed max
    if (currentScore >= POINT_BUY_MAX_SCORE) {
        return false;
    }
    
    // Check if we have enough points for the increase
    const nextScore = currentScore + 1;
    const currentCost = currentScore >= POINT_BUY_MIN_SCORE 
        ? getPointBuyCost(currentScore) 
        : 0;
    const nextCost = getPointBuyCost(nextScore);
    const costDifference = nextCost - currentCost;
    
    return pointsRemaining >= costDifference;
}

/**
 * Check if an ability score can be decreased
 * 
 * @param currentScore - Current ability score
 * @returns True if score can be decreased
 */
export function canDecrease(currentScore: number): boolean {
    return currentScore > POINT_BUY_MIN_SCORE;
}

/**
 * Get the cost to increase a score by 1
 * 
 * @param currentScore - Current ability score
 * @returns Cost to increase, or 0 if cannot increase
 */
export function getIncreaseCost(currentScore: number): number {
    if (currentScore >= POINT_BUY_MAX_SCORE) {
        return 0;
    }
    
    const currentCost = currentScore >= POINT_BUY_MIN_SCORE 
        ? getPointBuyCost(currentScore) 
        : 0;
    const nextCost = getPointBuyCost(currentScore + 1);
    
    return nextCost - currentCost;
}

/**
 * Get the points refunded by decreasing a score by 1
 * 
 * @param currentScore - Current ability score
 * @returns Points refunded, or 0 if cannot decrease
 */
export function getDecreaseRefund(currentScore: number): number {
    if (currentScore <= POINT_BUY_MIN_SCORE) {
        return 0;
    }
    
    const currentCost = getPointBuyCost(currentScore);
    const prevCost = currentScore > POINT_BUY_MIN_SCORE 
        ? getPointBuyCost(currentScore - 1) 
        : 0;
    
    return currentCost - prevCost;
}

