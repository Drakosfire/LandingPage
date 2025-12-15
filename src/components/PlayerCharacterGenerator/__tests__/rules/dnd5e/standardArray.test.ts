/**
 * Standard Array rules tests
 * 
 * Tests for D&D 5e standard array validation.
 * 
 * @module CharacterGenerator/__tests__/rules/dnd5e
 */

import '../../setup';
import { 
    validateStandardArray,
    isValidStandardArrayAssignment,
    STANDARD_ARRAY_VALUES
} from '../../../rules/dnd5e/standardArray';
import { DnD5eAbilityScores } from '../../../types';

describe('Standard Array Validation', () => {
    describe('validateStandardArray', () => {
        it('should validate correct standard array assignment', () => {
            const scores: DnD5eAbilityScores = {
                strength: 15,
                dexterity: 14,
                constitution: 13,
                intelligence: 12,
                wisdom: 10,
                charisma: 8
            };
            const result = validateStandardArray(scores);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        
        it('should validate different assignment order', () => {
            const scores: DnD5eAbilityScores = {
                strength: 8,
                dexterity: 10,
                constitution: 12,
                intelligence: 13,
                wisdom: 14,
                charisma: 15
            };
            const result = validateStandardArray(scores);
            expect(result.isValid).toBe(true);
        });
        
        it('should reject duplicate values', () => {
            const scores: DnD5eAbilityScores = {
                strength: 15,
                dexterity: 15,
                constitution: 15,
                intelligence: 8,
                wisdom: 8,
                charisma: 8
            };
            const result = validateStandardArray(scores);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0].message).toContain('standard array');
        });
        
        it('should reject wrong values', () => {
            const scores: DnD5eAbilityScores = {
                strength: 16,
                dexterity: 14,
                constitution: 13,
                intelligence: 12,
                wisdom: 10,
                charisma: 7
            };
            const result = validateStandardArray(scores);
            expect(result.isValid).toBe(false);
        });
        
        it('should reject if missing values from standard array', () => {
            const scores: DnD5eAbilityScores = {
                strength: 15,
                dexterity: 14,
                constitution: 13,
                intelligence: 12,
                wisdom: 10,
                charisma: 10  // Duplicate 10, missing 8
            };
            const result = validateStandardArray(scores);
            expect(result.isValid).toBe(false);
        });
    });
    
    describe('isValidStandardArrayAssignment', () => {
        it('should return true for valid assignment', () => {
            const scores: DnD5eAbilityScores = {
                strength: 15,
                dexterity: 14,
                constitution: 13,
                intelligence: 12,
                wisdom: 10,
                charisma: 8
            };
            expect(isValidStandardArrayAssignment(scores)).toBe(true);
        });
        
        it('should return false for invalid assignment', () => {
            const scores: DnD5eAbilityScores = {
                strength: 16,
                dexterity: 14,
                constitution: 13,
                intelligence: 12,
                wisdom: 10,
                charisma: 8
            };
            expect(isValidStandardArrayAssignment(scores)).toBe(false);
        });
    });
    
    describe('STANDARD_ARRAY_VALUES', () => {
        it('should export the correct values', () => {
            expect(STANDARD_ARRAY_VALUES).toEqual([15, 14, 13, 12, 10, 8]);
        });
    });
});

