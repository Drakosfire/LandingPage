/**
 * Point Buy rules tests
 * 
 * Tests for D&D 5e point buy calculator and validation.
 * 
 * @module CharacterGenerator/__tests__/rules/dnd5e
 */

import '../../setup';
import { 
    getPointBuyCost,
    calculateTotalPointsSpent,
    validatePointBuy,
    canIncrease,
    canDecrease
} from '../../../rules/dnd5e/pointBuy';
import { DnD5eAbilityScores } from '../../../types';

describe('Point Buy Calculator', () => {
    describe('getPointBuyCost', () => {
        it('should return correct costs for valid scores', () => {
            expect(getPointBuyCost(8)).toBe(0);
            expect(getPointBuyCost(9)).toBe(1);
            expect(getPointBuyCost(10)).toBe(2);
            expect(getPointBuyCost(11)).toBe(3);
            expect(getPointBuyCost(12)).toBe(4);
            expect(getPointBuyCost(13)).toBe(5);
            expect(getPointBuyCost(14)).toBe(7);
            expect(getPointBuyCost(15)).toBe(9);
        });
        
        it('should throw for scores below 8', () => {
            expect(() => getPointBuyCost(7)).toThrow('between 8 and 15');
            expect(() => getPointBuyCost(3)).toThrow('between 8 and 15');
        });
        
        it('should throw for scores above 15', () => {
            expect(() => getPointBuyCost(16)).toThrow('between 8 and 15');
            expect(() => getPointBuyCost(20)).toThrow('between 8 and 15');
        });
    });
    
    describe('calculateTotalPointsSpent', () => {
        it('should calculate total for standard array (should be 27)', () => {
            const scores: DnD5eAbilityScores = {
                strength: 15,
                dexterity: 14,
                constitution: 13,
                intelligence: 12,
                wisdom: 10,
                charisma: 8
            };
            expect(calculateTotalPointsSpent(scores)).toBe(27);
        });
        
        it('should calculate total for all 8s (should be 0)', () => {
            const scores: DnD5eAbilityScores = {
                strength: 8,
                dexterity: 8,
                constitution: 8,
                intelligence: 8,
                wisdom: 8,
                charisma: 8
            };
            expect(calculateTotalPointsSpent(scores)).toBe(0);
        });
        
        it('should calculate total for all 15s (should be 54)', () => {
            const scores: DnD5eAbilityScores = {
                strength: 15,
                dexterity: 15,
                constitution: 15,
                intelligence: 15,
                wisdom: 15,
                charisma: 15
            };
            expect(calculateTotalPointsSpent(scores)).toBe(54); // 9 * 6
        });
    });
    
    describe('validatePointBuy', () => {
        it('should validate correct point buy (27 points)', () => {
            const scores: DnD5eAbilityScores = {
                strength: 15,
                dexterity: 14,
                constitution: 13,
                intelligence: 12,
                wisdom: 10,
                charisma: 8
            };
            const result = validatePointBuy(scores);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        
        it('should reject scores below 8', () => {
            const scores: DnD5eAbilityScores = {
                strength: 7,
                dexterity: 15,
                constitution: 15,
                intelligence: 15,
                wisdom: 15,
                charisma: 15
            };
            const result = validatePointBuy(scores);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0].message).toContain('at least 8');
        });
        
        it('should reject scores above 15', () => {
            const scores: DnD5eAbilityScores = {
                strength: 16,
                dexterity: 8,
                constitution: 8,
                intelligence: 8,
                wisdom: 8,
                charisma: 8
            };
            const result = validatePointBuy(scores);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0].message).toContain('cannot exceed 15');
        });
        
        it('should reject total not equal to 27 (too low)', () => {
            const scores: DnD5eAbilityScores = {
                strength: 8,
                dexterity: 8,
                constitution: 8,
                intelligence: 8,
                wisdom: 8,
                charisma: 8
            };
            const result = validatePointBuy(scores);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.message.includes('exactly 27'))).toBe(true);
        });
        
        it('should reject total not equal to 27 (too high)', () => {
            const scores: DnD5eAbilityScores = {
                strength: 15,
                dexterity: 15,
                constitution: 15,
                intelligence: 15,
                wisdom: 15,
                charisma: 15
            };
            const result = validatePointBuy(scores);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.message.includes('exactly 27'))).toBe(true);
        });
    });
    
    describe('canIncrease', () => {
        it('should allow increase if score < 15', () => {
            expect(canIncrease(14, 27)).toBe(true);
            expect(canIncrease(10, 27)).toBe(true);
        });
        
        it('should not allow increase if score = 15', () => {
            expect(canIncrease(15, 27)).toBe(false);
        });
        
        it('should not allow increase if not enough points', () => {
            expect(canIncrease(14, 0)).toBe(false);
        });
    });
    
    describe('canDecrease', () => {
        it('should allow decrease if score > 8', () => {
            expect(canDecrease(15)).toBe(true);
            expect(canDecrease(10)).toBe(true);
        });
        
        it('should not allow decrease if score = 8', () => {
            expect(canDecrease(8)).toBe(false);
        });
    });
});

