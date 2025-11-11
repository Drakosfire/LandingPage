/**
 * D&D 5e Standard Array rules
 * 
 * Implementation of D&D 5e standard array ability score assignment.
 * Rules from Player's Handbook (PHB).
 * 
 * @module CharacterGenerator/rules/dnd5e/standardArray
 */

import { DnD5eAbilityScores } from '../../types/dnd5e/character.types';
import { STANDARD_ARRAY } from '../../types/dnd5e/abilityScores.types';
import { 
    ValidationResult, 
    createSuccessResult,
    createValidationError 
} from '../../types/validation.types';

/**
 * Standard array values (exported for convenience)
 */
export const STANDARD_ARRAY_VALUES: number[] = Array.from(STANDARD_ARRAY);

/**
 * Validate that ability scores match standard array
 * 
 * The standard array is: 15, 14, 13, 12, 10, 8
 * Each value must be used exactly once.
 * 
 * @param scores - Ability scores to validate
 * @returns Validation result
 */
export function validateStandardArray(scores: DnD5eAbilityScores): ValidationResult {
    const scoreValues = Object.values(scores);
    
    // Sort both arrays for comparison
    const sortedScores = [...scoreValues].sort((a, b) => b - a);
    const sortedStandard = [...STANDARD_ARRAY_VALUES].sort((a, b) => b - a);
    
    // Check if arrays match exactly
    const matches = sortedScores.length === sortedStandard.length &&
                    sortedScores.every((val, idx) => val === sortedStandard[idx]);
    
    if (!matches) {
        return {
            isValid: false,
            errors: [
                createValidationError(
                    'error',
                    1,
                    `Scores must exactly match standard array: ${STANDARD_ARRAY_VALUES.join(', ')}. ` +
                    `Each value must be used exactly once.`,
                    'standardArray'
                )
            ],
            warnings: []
        };
    }
    
    return createSuccessResult();
}

/**
 * Check if scores are a valid standard array assignment
 * 
 * @param scores - Ability scores to check
 * @returns True if valid standard array assignment
 */
export function isValidStandardArrayAssignment(scores: DnD5eAbilityScores): boolean {
    return validateStandardArray(scores).isValid;
}

/**
 * Create a standard array assignment with all values set to 8 (minimum)
 * User can then assign the remaining values
 * 
 * @returns Ability scores with all values set to minimum
 */
export function createEmptyStandardArrayAssignment(): DnD5eAbilityScores {
    return {
        strength: 8,
        dexterity: 8,
        constitution: 8,
        intelligence: 8,
        wisdom: 8,
        charisma: 8
    };
}

/**
 * Get remaining values from standard array that haven't been assigned
 * 
 * @param scores - Current ability scores
 * @returns Array of unassigned values
 */
export function getRemainingStandardArrayValues(scores: DnD5eAbilityScores): number[] {
    const assigned = Object.values(scores);
    const remaining: number[] = [];
    
    // For each standard array value, check if it's been assigned
    for (const value of STANDARD_ARRAY_VALUES) {
        const assignedCount = assigned.filter(s => s === value).length;
        const standardCount = STANDARD_ARRAY_VALUES.filter(s => s === value).length;
        
        // Add to remaining if not fully assigned
        for (let i = assignedCount; i < standardCount; i++) {
            remaining.push(value);
        }
    }
    
    return remaining.sort((a, b) => b - a);
}

/**
 * Check if a value can be assigned (is in standard array and not already fully assigned)
 * 
 * @param scores - Current ability scores
 * @param value - Value to check
 * @returns True if value can be assigned
 */
export function canAssignStandardArrayValue(
    scores: DnD5eAbilityScores,
    value: number
): boolean {
    // Check if value is in standard array
    if (!STANDARD_ARRAY_VALUES.includes(value)) {
        return false;
    }
    
    const remaining = getRemainingStandardArrayValues(scores);
    return remaining.includes(value);
}

