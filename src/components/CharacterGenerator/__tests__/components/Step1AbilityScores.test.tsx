/**
 * Step1AbilityScores component tests
 * 
 * Tests for ability score assignment UI.
 * Phase 1: Basic logic tests (component rendering tests in Phase 2)
 * 
 * @module CharacterGenerator/__tests__/components
 */

import '../setup';
import {
    validatePointBuy,
    validateStandardArray,
    applyRacialBonuses,
    rollAbilityScores
} from '../../rules/dnd5e';
import { DnD5eAbilityScores } from '../../types';
import { HILL_DWARF } from '../../data/dnd5e/races';

describe('Step1AbilityScores Integration', () => {
    describe('Point Buy Workflow', () => {
        it('should validate a complete point buy assignment', () => {
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
        });

        it('should apply racial bonuses after point buy', () => {
            const baseScores: DnD5eAbilityScores = {
                strength: 15,
                dexterity: 14,
                constitution: 13,
                intelligence: 12,
                wisdom: 10,
                charisma: 8
            };

            const finalScores = applyRacialBonuses(baseScores, HILL_DWARF);

            expect(finalScores.constitution).toBe(15); // 13 + 2
            expect(finalScores.wisdom).toBe(11); // 10 + 1
        });
    });

    describe('Standard Array Workflow', () => {
        it('should validate a complete standard array assignment', () => {
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
        });
    });

    describe('Dice Rolling Workflow', () => {
        it('should generate valid rolled scores', () => {
            const result = rollAbilityScores();

            expect(result.scores).toHaveLength(6);
            result.scores.forEach(score => {
                expect(score).toBeGreaterThanOrEqual(3);
                expect(score).toBeLessThanOrEqual(18);
            });
        });
    });

    describe('Complete Ability Score Assignment', () => {
        it('should complete full workflow: point buy → racial bonuses → final scores', () => {
            // Step 1: Assign with point buy
            const baseScores: DnD5eAbilityScores = {
                strength: 15,
                dexterity: 12,
                constitution: 14,
                intelligence: 10,
                wisdom: 13,
                charisma: 8
            };

            // Step 2: Validate
            const validation = validatePointBuy(baseScores);
            expect(validation.isValid).toBe(true);

            // Step 3: Apply racial bonuses (Hill Dwarf)
            const finalScores = applyRacialBonuses(baseScores, HILL_DWARF);

            // Step 4: Verify final scores
            expect(finalScores.strength).toBe(15);
            expect(finalScores.dexterity).toBe(12);
            expect(finalScores.constitution).toBe(16); // 14 + 2
            expect(finalScores.intelligence).toBe(10);
            expect(finalScores.wisdom).toBe(14); // 13 + 1
            expect(finalScores.charisma).toBe(8);
        });
    });
});

