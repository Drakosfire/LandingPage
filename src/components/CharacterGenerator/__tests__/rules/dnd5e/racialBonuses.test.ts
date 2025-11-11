/**
 * Racial Bonuses tests
 * 
 * Tests for applying racial ability score bonuses.
 * 
 * @module CharacterGenerator/__tests__/rules/dnd5e
 */

import '../../setup';
import {
    applyRacialBonuses,
    getRacialBonusForAbility,
    getTotalRacialBonuses
} from '../../../rules/dnd5e/racialBonuses';
import { DnD5eAbilityScores } from '../../../types';
import { HILL_DWARF } from '../../../data/dnd5e/races';

describe('Racial Bonuses', () => {
    const baseScores: DnD5eAbilityScores = {
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8
    };

    describe('applyRacialBonuses', () => {
        it('should apply Hill Dwarf bonuses (+2 CON, +1 WIS)', () => {
            const finalScores = applyRacialBonuses(baseScores, HILL_DWARF);

            expect(finalScores.strength).toBe(15); // Unchanged
            expect(finalScores.dexterity).toBe(14); // Unchanged
            expect(finalScores.constitution).toBe(15); // 13 + 2
            expect(finalScores.intelligence).toBe(12); // Unchanged
            expect(finalScores.wisdom).toBe(11); // 10 + 1
            expect(finalScores.charisma).toBe(8); // Unchanged
        });

        it('should not modify original base scores', () => {
            const original = { ...baseScores };
            applyRacialBonuses(baseScores, HILL_DWARF);

            // Base scores should be unchanged
            expect(baseScores).toEqual(original);
        });

        it('should handle race with no bonuses', () => {
            const noBonusRace = {
                ...HILL_DWARF,
                abilityBonuses: []
            };

            const finalScores = applyRacialBonuses(baseScores, noBonusRace);

            // All scores should be unchanged
            expect(finalScores).toEqual(baseScores);
        });

        it('should handle multiple bonuses to same ability', () => {
            const doubleBonusRace = {
                ...HILL_DWARF,
                abilityBonuses: [
                    { ability: 'strength', bonus: 1 },
                    { ability: 'strength', bonus: 1 }
                ]
            };

            const finalScores = applyRacialBonuses(baseScores, doubleBonusRace);

            expect(finalScores.strength).toBe(17); // 15 + 1 + 1
        });
    });

    describe('getRacialBonusForAbility', () => {
        it('should return correct bonus for constitution', () => {
            const bonus = getRacialBonusForAbility(HILL_DWARF, 'constitution');
            expect(bonus).toBe(2);
        });

        it('should return correct bonus for wisdom', () => {
            const bonus = getRacialBonusForAbility(HILL_DWARF, 'wisdom');
            expect(bonus).toBe(1);
        });

        it('should return 0 for abilities without bonuses', () => {
            expect(getRacialBonusForAbility(HILL_DWARF, 'strength')).toBe(0);
            expect(getRacialBonusForAbility(HILL_DWARF, 'dexterity')).toBe(0);
            expect(getRacialBonusForAbility(HILL_DWARF, 'intelligence')).toBe(0);
            expect(getRacialBonusForAbility(HILL_DWARF, 'charisma')).toBe(0);
        });
    });

    describe('getTotalRacialBonuses', () => {
        it('should return total of all racial bonuses for Hill Dwarf', () => {
            const total = getTotalRacialBonuses(HILL_DWARF);
            expect(total).toBe(3); // +2 CON, +1 WIS
        });

        it('should return 0 for race with no bonuses', () => {
            const noBonusRace = {
                ...HILL_DWARF,
                abilityBonuses: []
            };

            const total = getTotalRacialBonuses(noBonusRace);
            expect(total).toBe(0);
        });
    });
});

