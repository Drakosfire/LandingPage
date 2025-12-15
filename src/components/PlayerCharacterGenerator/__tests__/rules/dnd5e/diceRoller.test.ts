/**
 * Dice Roller rules tests
 * 
 * Tests for D&D 5e dice rolling (4d6 drop lowest).
 * 
 * @module CharacterGenerator/__tests__/rules/dnd5e
 */

import '../../setup';
import {
    roll4d6DropLowest,
    rollAbilityScores,
    shouldRerollScores,
    DiceRollResult
} from '../../../rules/dnd5e/diceRoller';
import { getAbilityModifier } from '../../../types';

describe('Dice Roller', () => {
    describe('roll4d6DropLowest', () => {
        it('should return a score between 3 and 18', () => {
            for (let i = 0; i < 100; i++) {
                const result = roll4d6DropLowest();
                expect(result.total).toBeGreaterThanOrEqual(3);
                expect(result.total).toBeLessThanOrEqual(18);
            }
        });

        it('should roll exactly 4 dice', () => {
            const result = roll4d6DropLowest();
            expect(result.rolls).toHaveLength(4);
        });

        it('should have all dice values between 1 and 6', () => {
            for (let i = 0; i < 50; i++) {
                const result = roll4d6DropLowest();
                result.rolls.forEach(die => {
                    expect(die).toBeGreaterThanOrEqual(1);
                    expect(die).toBeLessThanOrEqual(6);
                });
            }
        });

        it('should drop the lowest die', () => {
            const result = roll4d6DropLowest();
            const sortedRolls = [...result.rolls].sort((a, b) => a - b);
            expect(result.dropped).toBe(sortedRolls[0]);
        });

        it('should total be sum of 3 highest dice', () => {
            const result = roll4d6DropLowest();
            const sortedRolls = [...result.rolls].sort((a, b) => a - b);
            const expectedTotal = sortedRolls[1] + sortedRolls[2] + sortedRolls[3];
            expect(result.total).toBe(expectedTotal);
        });
    });

    describe('rollAbilityScores', () => {
        it('should return 6 scores', () => {
            const result = rollAbilityScores();
            expect(result.scores).toHaveLength(6);
            expect(result.rollHistory).toHaveLength(6);
        });

        it('should return all scores between 3 and 18', () => {
            const result = rollAbilityScores();
            result.scores.forEach(score => {
                expect(score).toBeGreaterThanOrEqual(3);
                expect(score).toBeLessThanOrEqual(18);
            });
        });

        it('should record roll history for each score', () => {
            const result = rollAbilityScores();
            expect(result.rollHistory).toHaveLength(6);
            result.rollHistory.forEach(roll => {
                expect(roll.rolls).toHaveLength(4);
                expect(roll.total).toBeGreaterThanOrEqual(3);
                expect(roll.total).toBeLessThanOrEqual(18);
            });
        });

        it('should generate different results on multiple calls', () => {
            const result1 = rollAbilityScores();
            const result2 = rollAbilityScores();

            // Very unlikely to get exact same 6 scores
            const same = result1.scores.every((score, idx) => score === result2.scores[idx]);
            expect(same).toBe(false);
        });
    });

    describe('shouldRerollScores', () => {
        it('should recommend reroll if total modifiers < 1', () => {
            // All 10s = total modifiers of 0
            const scores = [10, 10, 10, 10, 10, 10];
            expect(shouldRerollScores(scores)).toBe(true);
        });

        it('should recommend reroll if no score is 15+', () => {
            // Good total modifiers but no high score
            const scores = [14, 14, 14, 10, 10, 10];
            expect(shouldRerollScores(scores)).toBe(true);
        });

        it('should not recommend reroll if total modifiers >= 1 and has 15+', () => {
            const scores = [15, 14, 13, 12, 10, 8]; // Standard array
            const totalMods = scores.reduce((sum, s) => sum + getAbilityModifier(s), 0);
            console.log('Total mods for standard array:', totalMods); // Should be +1

            expect(shouldRerollScores(scores)).toBe(false);
        });

        it('should not recommend reroll for very good rolls', () => {
            const scores = [18, 16, 14, 12, 10, 8];
            expect(shouldRerollScores(scores)).toBe(false);
        });
    });
});



