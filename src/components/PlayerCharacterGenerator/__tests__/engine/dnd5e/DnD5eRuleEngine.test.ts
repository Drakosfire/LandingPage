/**
 * D&D 5e Rule Engine Tests
 * 
 * Tests for interface compliance and basic functionality.
 * 
 * @module PlayerCharacterGenerator/__tests__/engine/dnd5e
 */

import { DnD5eRuleEngine, createDnD5eRuleEngine } from '../../../engine/dnd5e/DnD5eRuleEngine';
import { isRuleEngine } from '../../../engine/RuleEngine.interface';
import type { DnD5eCharacter } from '../../../types/dnd5e/character.types';
import { createEmptyDnD5eCharacter } from '../../../types/dnd5e/character.types';

describe('DnD5eRuleEngine', () => {
    let engine: DnD5eRuleEngine;

    beforeEach(() => {
        engine = createDnD5eRuleEngine();
    });

    describe('Identity', () => {
        it('should have correct systemId', () => {
            expect(engine.systemId).toBe('dnd5e');
        });

        it('should have correct systemName', () => {
            expect(engine.systemName).toBe('D&D 5th Edition (SRD)');
        });

        it('should have a version string', () => {
            expect(engine.version).toBeDefined();
            expect(typeof engine.version).toBe('string');
            expect(engine.version).toMatch(/^\d+\.\d+\.\d+$/); // semver format
        });
    });

    describe('Interface Compliance', () => {
        it('should pass isRuleEngine type guard', () => {
            expect(isRuleEngine(engine)).toBe(true);
        });

        it('should have all required validation methods', () => {
            expect(typeof engine.validateCharacter).toBe('function');
            expect(typeof engine.validateStep).toBe('function');
            expect(typeof engine.isCharacterComplete).toBe('function');
        });

        it('should have all required data provider methods', () => {
            expect(typeof engine.getAvailableRaces).toBe('function');
            expect(typeof engine.getAvailableClasses).toBe('function');
            expect(typeof engine.getAvailableBackgrounds).toBe('function');
            expect(typeof engine.getSubraces).toBe('function');
        });

        it('should have all required choice helper methods', () => {
            expect(typeof engine.getValidSkillChoices).toBe('function');
            expect(typeof engine.getEquipmentChoices).toBe('function');
            expect(typeof engine.getAvailableSpells).toBe('function');
        });

        it('should have all required calculation methods', () => {
            expect(typeof engine.calculateDerivedStats).toBe('function');
            expect(typeof engine.applyRacialBonuses).toBe('function');
            expect(typeof engine.calculateLevelUpHP).toBe('function');
            expect(typeof engine.getProficiencyBonus).toBe('function');
        });
    });

    describe('Validation Methods (stub behavior)', () => {
        let testCharacter: DnD5eCharacter;

        beforeEach(() => {
            testCharacter = createEmptyDnD5eCharacter();
        });

        it('validateCharacter should return a ValidationResult', () => {
            const result = engine.validateCharacter(testCharacter);

            expect(result).toBeDefined();
            expect(typeof result.isValid).toBe('boolean');
            expect(Array.isArray(result.errors)).toBe(true);
            expect(Array.isArray(result.warnings)).toBe(true);
            expect(Array.isArray(result.info)).toBe(true);
        });

        it('validateStep should accept all CreationStep values', () => {
            const steps = ['abilityScores', 'race', 'class', 'background', 'equipment', 'review'] as const;

            for (const step of steps) {
                const result = engine.validateStep(testCharacter, step);
                expect(result).toBeDefined();
                expect(typeof result.isValid).toBe('boolean');
            }
        });

        it('isCharacterComplete should return boolean', () => {
            const result = engine.isCharacterComplete(testCharacter);
            expect(typeof result).toBe('boolean');
        });
    });

    describe('Data Provider Methods (stub behavior)', () => {
        it('getAvailableRaces should return an array', () => {
            const races = engine.getAvailableRaces();
            expect(Array.isArray(races)).toBe(true);
        });

        it('getAvailableClasses should return an array', () => {
            const classes = engine.getAvailableClasses();
            expect(Array.isArray(classes)).toBe(true);
        });

        it('getAvailableBackgrounds should return an array', () => {
            const backgrounds = engine.getAvailableBackgrounds();
            expect(Array.isArray(backgrounds)).toBe(true);
        });

        it('getSubraces should return an array', () => {
            const subraces = engine.getSubraces('dwarf');
            expect(Array.isArray(subraces)).toBe(true);
        });
    });

    describe('Choice Helper Methods (stub behavior)', () => {
        let testCharacter: DnD5eCharacter;

        beforeEach(() => {
            testCharacter = createEmptyDnD5eCharacter();
        });

        it('getValidSkillChoices should return a SkillChoice object', () => {
            const skillChoice = engine.getValidSkillChoices(testCharacter);

            expect(skillChoice).toBeDefined();
            expect(typeof skillChoice.count).toBe('number');
            expect(Array.isArray(skillChoice.options)).toBe(true);
            expect(Array.isArray(skillChoice.selected)).toBe(true);
        });

        it('getEquipmentChoices should return an array', () => {
            const choices = engine.getEquipmentChoices('fighter');
            expect(Array.isArray(choices)).toBe(true);
        });

        it('getAvailableSpells should return an array', () => {
            const spells = engine.getAvailableSpells(testCharacter, 0);
            expect(Array.isArray(spells)).toBe(true);
        });
    });

    describe('Calculation Methods', () => {
        let testCharacter: DnD5eCharacter;

        beforeEach(() => {
            testCharacter = createEmptyDnD5eCharacter();
            testCharacter.abilityScores = {
                strength: 15,
                dexterity: 14,
                constitution: 13,
                intelligence: 12,
                wisdom: 10,
                charisma: 8
            };
            testCharacter.level = 1;
        });

        it('calculateDerivedStats should return a DerivedStats object', () => {
            const stats = engine.calculateDerivedStats(testCharacter);

            expect(stats).toBeDefined();
            expect(typeof stats.armorClass).toBe('number');
            expect(typeof stats.initiative).toBe('number');
            expect(typeof stats.speed).toBe('number');
            expect(typeof stats.maxHitPoints).toBe('number');
            expect(typeof stats.currentHitPoints).toBe('number');
            expect(typeof stats.proficiencyBonus).toBe('number');
            expect(typeof stats.passivePerception).toBe('number');
        });

        it('calculateDerivedStats should calculate correct base AC', () => {
            // DEX 14 = +2 modifier, base AC = 10 + 2 = 12
            const stats = engine.calculateDerivedStats(testCharacter);
            expect(stats.armorClass).toBe(12);
        });

        it('calculateDerivedStats should calculate correct initiative', () => {
            // DEX 14 = +2 modifier
            const stats = engine.calculateDerivedStats(testCharacter);
            expect(stats.initiative).toBe(2);
        });

        it('applyRacialBonuses should return modified ability scores', () => {
            const baseScores = {
                strength: 15,
                dexterity: 14,
                constitution: 13,
                intelligence: 12,
                wisdom: 10,
                charisma: 8
            };

            const modified = engine.applyRacialBonuses(baseScores, 'unknown-race');

            // With no race data, should return same scores
            expect(modified).toEqual(baseScores);
        });

        it('getProficiencyBonus should return correct values for levels 1-20', () => {
            const expectedBonuses: Record<number, number> = {
                1: 2, 2: 2, 3: 2, 4: 2,
                5: 3, 6: 3, 7: 3, 8: 3,
                9: 4, 10: 4, 11: 4, 12: 4,
                13: 5, 14: 5, 15: 5, 16: 5,
                17: 6, 18: 6, 19: 6, 20: 6
            };

            for (const [level, expected] of Object.entries(expectedBonuses)) {
                expect(engine.getProficiencyBonus(Number(level))).toBe(expected);
            }
        });

        it('calculateLevelUpHP should return at least 1', () => {
            const hp = engine.calculateLevelUpHP(testCharacter, 0);
            expect(hp).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Factory Function', () => {
        it('createDnD5eRuleEngine should return a valid engine', () => {
            const engine = createDnD5eRuleEngine();
            expect(engine).toBeInstanceOf(DnD5eRuleEngine);
            expect(isRuleEngine(engine)).toBe(true);
        });
    });
});

