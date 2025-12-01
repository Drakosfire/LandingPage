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

    // ===== T024-T026: Race Data Integration Tests =====

    describe('Race Data Integration (T024-T026)', () => {
        describe('getAvailableRaces (T024)', () => {
            it('should return all 13 SRD races', () => {
                const races = engine.getAvailableRaces();
                expect(races.length).toBe(13);
            });

            it('should include all expected race IDs', () => {
                const races = engine.getAvailableRaces();
                const raceIds = races.map(r => r.id);

                expect(raceIds).toContain('hill-dwarf');
                expect(raceIds).toContain('mountain-dwarf');
                expect(raceIds).toContain('high-elf');
                expect(raceIds).toContain('wood-elf');
                expect(raceIds).toContain('lightfoot-halfling');
                expect(raceIds).toContain('stout-halfling');
                expect(raceIds).toContain('human');
                expect(raceIds).toContain('dragonborn');
                expect(raceIds).toContain('forest-gnome');
                expect(raceIds).toContain('rock-gnome');
                expect(raceIds).toContain('half-elf');
                expect(raceIds).toContain('half-orc');
                expect(raceIds).toContain('tiefling');
            });
        });

        describe('getBaseRaceOptions', () => {
            it('should return 9 unique base race options', () => {
                const options = engine.getBaseRaceOptions();
                expect(options.length).toBe(9);
            });

            it('should correctly identify races with subraces', () => {
                const options = engine.getBaseRaceOptions();

                const dwarf = options.find(o => o.id === 'dwarf');
                expect(dwarf?.hasSubraces).toBe(true);

                const elf = options.find(o => o.id === 'elf');
                expect(elf?.hasSubraces).toBe(true);

                const human = options.find(o => o.id === 'human');
                expect(human?.hasSubraces).toBe(false);

                const dragonborn = options.find(o => o.id === 'dragonborn');
                expect(dragonborn?.hasSubraces).toBe(false);
            });

            it('should have properly capitalized names', () => {
                const options = engine.getBaseRaceOptions();

                const dwarf = options.find(o => o.id === 'dwarf');
                expect(dwarf?.name).toBe('Dwarf');

                const human = options.find(o => o.id === 'human');
                expect(human?.name).toBe('Human');
            });
        });

        describe('getSubraces (T025)', () => {
            it('should return 2 dwarf subraces', () => {
                const subraces = engine.getSubraces('dwarf');
                expect(subraces.length).toBe(2);

                const ids = subraces.map(r => r.id);
                expect(ids).toContain('hill-dwarf');
                expect(ids).toContain('mountain-dwarf');
            });

            it('should return 2 elf subraces', () => {
                const subraces = engine.getSubraces('elf');
                expect(subraces.length).toBe(2);

                const ids = subraces.map(r => r.id);
                expect(ids).toContain('high-elf');
                expect(ids).toContain('wood-elf');
            });

            it('should return 2 halfling subraces', () => {
                const subraces = engine.getSubraces('halfling');
                expect(subraces.length).toBe(2);
            });

            it('should return 2 gnome subraces', () => {
                const subraces = engine.getSubraces('gnome');
                expect(subraces.length).toBe(2);
            });

            it('should return empty array for races without subraces', () => {
                expect(engine.getSubraces('human').length).toBe(0);
                expect(engine.getSubraces('dragonborn').length).toBe(0);
                expect(engine.getSubraces('half-elf').length).toBe(0);
            });

            it('should return empty array for unknown base race', () => {
                expect(engine.getSubraces('unknown').length).toBe(0);
            });
        });

        describe('getRaceById', () => {
            it('should find race by ID', () => {
                const hillDwarf = engine.getRaceById('hill-dwarf');
                expect(hillDwarf).toBeDefined();
                expect(hillDwarf?.name).toBe('Hill Dwarf');
            });

            it('should return undefined for unknown ID', () => {
                expect(engine.getRaceById('unknown-race')).toBeUndefined();
            });
        });

        describe('applyRacialBonuses (T026)', () => {
            const baseScores = {
                strength: 10,
                dexterity: 10,
                constitution: 10,
                intelligence: 10,
                wisdom: 10,
                charisma: 10
            };

            it('should apply Hill Dwarf bonuses (+2 CON, +1 WIS)', () => {
                const modified = engine.applyRacialBonuses(baseScores, 'hill-dwarf');

                expect(modified.constitution).toBe(12);
                expect(modified.wisdom).toBe(11);
                expect(modified.strength).toBe(10); // unchanged
            });

            it('should apply Mountain Dwarf bonuses (+2 CON, +2 STR)', () => {
                const modified = engine.applyRacialBonuses(baseScores, 'mountain-dwarf');

                expect(modified.constitution).toBe(12);
                expect(modified.strength).toBe(12);
            });

            it('should apply High Elf bonuses (+2 DEX, +1 INT)', () => {
                const modified = engine.applyRacialBonuses(baseScores, 'high-elf');

                expect(modified.dexterity).toBe(12);
                expect(modified.intelligence).toBe(11);
            });

            it('should apply Human bonuses (+1 to all)', () => {
                const modified = engine.applyRacialBonuses(baseScores, 'human');

                expect(modified.strength).toBe(11);
                expect(modified.dexterity).toBe(11);
                expect(modified.constitution).toBe(11);
                expect(modified.intelligence).toBe(11);
                expect(modified.wisdom).toBe(11);
                expect(modified.charisma).toBe(11);
            });

            it('should apply Dragonborn bonuses (+2 STR, +1 CHA)', () => {
                const modified = engine.applyRacialBonuses(baseScores, 'dragonborn');

                expect(modified.strength).toBe(12);
                expect(modified.charisma).toBe(11);
            });

            it('should apply Half-Elf bonus (+2 CHA, flexible +1/+1 not applied)', () => {
                const modified = engine.applyRacialBonuses(baseScores, 'half-elf');

                // Half-Elf only has +2 CHA in fixed bonuses
                // The +1/+1 to two other abilities is handled separately
                expect(modified.charisma).toBe(12);
            });

            it('should not modify original scores object', () => {
                const original = { ...baseScores };
                engine.applyRacialBonuses(baseScores, 'hill-dwarf');

                expect(baseScores).toEqual(original);
            });

            it('should return unmodified scores for unknown race', () => {
                const modified = engine.applyRacialBonuses(baseScores, 'unknown-race');
                expect(modified).toEqual(baseScores);
            });
        });

        // ===== T026b-g: Flexible Ability Bonuses =====
        
        describe('Flexible Ability Bonuses (T026b-g)', () => {
            describe('hasFlexibleAbilityBonuses (T026d)', () => {
                it('should return true for Half-Elf', () => {
                    expect(engine.hasFlexibleAbilityBonuses('half-elf')).toBe(true);
                });

                it('should return false for races with only fixed bonuses', () => {
                    expect(engine.hasFlexibleAbilityBonuses('hill-dwarf')).toBe(false);
                    expect(engine.hasFlexibleAbilityBonuses('human')).toBe(false);
                    expect(engine.hasFlexibleAbilityBonuses('dragonborn')).toBe(false);
                });

                it('should return false for unknown race', () => {
                    expect(engine.hasFlexibleAbilityBonuses('unknown')).toBe(false);
                });
            });

            describe('getFlexibleAbilityBonusOptions (T026e)', () => {
                it('should return config for Half-Elf', () => {
                    const config = engine.getFlexibleAbilityBonusOptions('half-elf');
                    
                    expect(config).toBeDefined();
                    expect(config?.raceId).toBe('half-elf');
                    expect(config?.choiceCount).toBe(2);
                    expect(config?.bonusPerChoice).toBe(1);
                    expect(config?.excludedAbilities).toContain('charisma');
                    expect(config?.allowStacking).toBe(false);
                });

                it('should return undefined for races without flexible bonuses', () => {
                    expect(engine.getFlexibleAbilityBonusOptions('human')).toBeUndefined();
                });
            });

            describe('getValidFlexibleBonusAbilities', () => {
                it('should return 5 abilities for Half-Elf (all except CHA)', () => {
                    const abilities = engine.getValidFlexibleBonusAbilities('half-elf');
                    
                    expect(abilities.length).toBe(5);
                    expect(abilities).toContain('strength');
                    expect(abilities).toContain('dexterity');
                    expect(abilities).toContain('constitution');
                    expect(abilities).toContain('intelligence');
                    expect(abilities).toContain('wisdom');
                    expect(abilities).not.toContain('charisma');
                });

                it('should return empty array for races without flexible bonuses', () => {
                    expect(engine.getValidFlexibleBonusAbilities('human')).toEqual([]);
                });
            });

            describe('validateFlexibleBonusChoices (T026g)', () => {
                it('should validate correct Half-Elf choices', () => {
                    const choices = [
                        { ability: 'strength' as const, bonus: 1 },
                        { ability: 'intelligence' as const, bonus: 1 }
                    ];
                    
                    const result = engine.validateFlexibleBonusChoices('half-elf', choices);
                    
                    expect(result.isValid).toBe(true);
                    expect(result.errors.length).toBe(0);
                });

                it('should reject wrong number of choices', () => {
                    const choices = [
                        { ability: 'strength' as const, bonus: 1 }
                    ]; // Only 1 choice, need 2
                    
                    const result = engine.validateFlexibleBonusChoices('half-elf', choices);
                    
                    expect(result.isValid).toBe(false);
                    expect(result.errors.some(e => e.code === 'FLEXIBLE_BONUS_COUNT_INVALID')).toBe(true);
                });

                it('should reject excluded ability (charisma for Half-Elf)', () => {
                    const choices = [
                        { ability: 'charisma' as const, bonus: 1 }, // Not allowed!
                        { ability: 'strength' as const, bonus: 1 }
                    ];
                    
                    const result = engine.validateFlexibleBonusChoices('half-elf', choices);
                    
                    expect(result.isValid).toBe(false);
                    expect(result.errors.some(e => e.code === 'FLEXIBLE_BONUS_EXCLUDED_ABILITY')).toBe(true);
                });

                it('should reject stacking bonuses on same ability', () => {
                    const choices = [
                        { ability: 'strength' as const, bonus: 1 },
                        { ability: 'strength' as const, bonus: 1 } // Can't stack!
                    ];
                    
                    const result = engine.validateFlexibleBonusChoices('half-elf', choices);
                    
                    expect(result.isValid).toBe(false);
                    expect(result.errors.some(e => e.code === 'FLEXIBLE_BONUS_NO_STACKING')).toBe(true);
                });

                it('should reject choices for races without flexible bonuses', () => {
                    const choices = [
                        { ability: 'strength' as const, bonus: 1 }
                    ];
                    
                    const result = engine.validateFlexibleBonusChoices('human', choices);
                    
                    expect(result.isValid).toBe(false);
                    expect(result.errors.some(e => e.code === 'FLEXIBLE_BONUS_NOT_ALLOWED')).toBe(true);
                });

                it('should pass empty choices for races without flexible bonuses', () => {
                    const result = engine.validateFlexibleBonusChoices('human', []);
                    expect(result.isValid).toBe(true);
                });
            });

            describe('applyRacialBonuses with flexible bonuses (T026f)', () => {
                const baseScores = {
                    strength: 10,
                    dexterity: 10,
                    constitution: 10,
                    intelligence: 10,
                    wisdom: 10,
                    charisma: 10
                };

                it('should apply Half-Elf fixed (+2 CHA) and flexible (+1 STR, +1 INT)', () => {
                    const flexibleBonuses = [
                        { ability: 'strength' as const, bonus: 1 },
                        { ability: 'intelligence' as const, bonus: 1 }
                    ];
                    
                    const modified = engine.applyRacialBonuses(baseScores, 'half-elf', flexibleBonuses);
                    
                    expect(modified.charisma).toBe(12);     // +2 fixed
                    expect(modified.strength).toBe(11);     // +1 flexible
                    expect(modified.intelligence).toBe(11); // +1 flexible
                    expect(modified.dexterity).toBe(10);    // unchanged
                });

                it('should only apply fixed bonuses if flexible choices invalid', () => {
                    const invalidChoices = [
                        { ability: 'strength' as const, bonus: 1 }
                        // Only 1 choice when 2 required
                    ];
                    
                    const modified = engine.applyRacialBonuses(baseScores, 'half-elf', invalidChoices);
                    
                    // Only fixed bonus applied, flexible ignored
                    expect(modified.charisma).toBe(12);  // +2 fixed
                    expect(modified.strength).toBe(10); // NOT applied (invalid)
                });

                it('should work without flexible bonuses parameter', () => {
                    const modified = engine.applyRacialBonuses(baseScores, 'half-elf');
                    
                    // Only fixed bonus applied
                    expect(modified.charisma).toBe(12);
                    expect(modified.strength).toBe(10);
                });
            });
        });
    });
});

