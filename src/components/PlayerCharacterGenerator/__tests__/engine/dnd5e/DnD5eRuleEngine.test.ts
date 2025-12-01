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
import { createTestDnD5eCharacter } from '../../utils/testHelpers';

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

    // ===== T033-T035: Class Data Integration Tests =====

    describe('Class Data Integration (T033-T035)', () => {
        describe('getAvailableClasses (T033)', () => {
            it('should return all 12 SRD classes', () => {
                const classes = engine.getAvailableClasses();
                expect(classes.length).toBe(12);
            });

            it('should include all expected class IDs', () => {
                const classes = engine.getAvailableClasses();
                const classIds = classes.map(c => c.id);

                // Martial classes
                expect(classIds).toContain('barbarian');
                expect(classIds).toContain('fighter');
                expect(classIds).toContain('monk');
                expect(classIds).toContain('rogue');

                // Half-casters
                expect(classIds).toContain('paladin');
                expect(classIds).toContain('ranger');

                // Full casters
                expect(classIds).toContain('bard');
                expect(classIds).toContain('cleric');
                expect(classIds).toContain('druid');
                expect(classIds).toContain('sorcerer');
                expect(classIds).toContain('warlock');
                expect(classIds).toContain('wizard');
            });

            it('should return classes with valid structure', () => {
                const classes = engine.getAvailableClasses();

                for (const cls of classes) {
                    expect(cls.id).toBeDefined();
                    expect(cls.name).toBeDefined();
                    expect(cls.hitDie).toBeGreaterThanOrEqual(6);
                    expect(cls.hitDie).toBeLessThanOrEqual(12);
                    expect(cls.savingThrows.length).toBe(2);
                    expect(cls.skillChoices.choose).toBeGreaterThan(0);
                    expect(cls.skillChoices.from.length).toBeGreaterThan(0);
                }
            });
        });

        describe('getValidSkillChoices (T034)', () => {
            let testCharacter: DnD5eCharacter;

            beforeEach(() => {
                testCharacter = createEmptyDnD5eCharacter();
            });

            it('should return empty choices for character without class', () => {
                testCharacter.classes = [];
                const skillChoice = engine.getValidSkillChoices(testCharacter);

                expect(skillChoice.count).toBe(0);
                expect(skillChoice.options).toEqual([]);
                expect(skillChoice.selected).toEqual([]);
            });

            it('should return Fighter skill choices (2 from list)', () => {
                testCharacter.classes = [{
                    name: 'Fighter',
                    level: 1,
                    hitDie: 10,
                    features: []
                }];

                const skillChoice = engine.getValidSkillChoices(testCharacter);

                expect(skillChoice.count).toBe(2);
                expect(skillChoice.options).toContain('Acrobatics');
                expect(skillChoice.options).toContain('Athletics');
                expect(skillChoice.options).toContain('Intimidation');
                expect(skillChoice.options).toContain('Perception');
            });

            it('should return Rogue skill choices (4 from list)', () => {
                testCharacter.classes = [{
                    name: 'Rogue',
                    level: 1,
                    hitDie: 8,
                    features: []
                }];

                const skillChoice = engine.getValidSkillChoices(testCharacter);

                expect(skillChoice.count).toBe(4);
                expect(skillChoice.options).toContain('Stealth');
                expect(skillChoice.options).toContain('Acrobatics');
                expect(skillChoice.options).toContain('Sleight of Hand');
            });

            it('should return Bard skill choices (3 from ANY)', () => {
                testCharacter.classes = [{
                    name: 'Bard',
                    level: 1,
                    hitDie: 8,
                    features: []
                }];

                const skillChoice = engine.getValidSkillChoices(testCharacter);

                expect(skillChoice.count).toBe(3);
                // Bards can choose any skill
                expect(skillChoice.options.length).toBe(18);
            });

            it('should track already selected skills', () => {
                testCharacter.classes = [{
                    name: 'Fighter',
                    level: 1,
                    hitDie: 10,
                    features: []
                }];
                testCharacter.proficiencies = {
                    skills: ['Athletics', 'Perception'],
                    savingThrows: [],
                    armor: [],
                    weapons: [],
                    tools: [],
                    languages: []
                };

                const skillChoice = engine.getValidSkillChoices(testCharacter);

                expect(skillChoice.selected).toContain('Athletics');
                expect(skillChoice.selected).toContain('Perception');
                expect(skillChoice.selected.length).toBe(2);
            });
        });

        describe('Subclass Methods (T035g-i)', () => {
            describe('getAvailableSubclasses (T035g)', () => {
                it('should return subclasses for Fighter', () => {
                    const subclasses = engine.getAvailableSubclasses('fighter');
                    expect(subclasses.length).toBeGreaterThan(0);
                    expect(subclasses[0].id).toBe('champion');
                });

                it('should return Life Domain for Cleric', () => {
                    const subclasses = engine.getAvailableSubclasses('cleric');
                    expect(subclasses.length).toBeGreaterThan(0);
                    expect(subclasses[0].id).toBe('life-domain');
                    expect(subclasses[0].name).toBe('Life Domain');
                });

                it('should return Draconic Bloodline for Sorcerer', () => {
                    const subclasses = engine.getAvailableSubclasses('sorcerer');
                    expect(subclasses.length).toBeGreaterThan(0);
                    expect(subclasses[0].id).toBe('draconic-bloodline');
                });

                it('should return The Fiend for Warlock', () => {
                    const subclasses = engine.getAvailableSubclasses('warlock');
                    expect(subclasses.length).toBeGreaterThan(0);
                    expect(subclasses[0].id).toBe('the-fiend');
                });

                it('should return empty array for unknown class', () => {
                    const subclasses = engine.getAvailableSubclasses('nonexistent');
                    expect(subclasses).toEqual([]);
                });
            });

            describe('getSubclassLevel (T035h)', () => {
                it('should return 1 for Cleric (L1 subclass)', () => {
                    expect(engine.getSubclassLevel('cleric')).toBe(1);
                });

                it('should return 1 for Sorcerer (L1 subclass)', () => {
                    expect(engine.getSubclassLevel('sorcerer')).toBe(1);
                });

                it('should return 1 for Warlock (L1 subclass)', () => {
                    expect(engine.getSubclassLevel('warlock')).toBe(1);
                });

                it('should return 2 for Druid (L2 subclass)', () => {
                    expect(engine.getSubclassLevel('druid')).toBe(2);
                });

                it('should return 2 for Wizard (L2 subclass)', () => {
                    expect(engine.getSubclassLevel('wizard')).toBe(2);
                });

                it('should return 3 for Fighter (L3 subclass)', () => {
                    expect(engine.getSubclassLevel('fighter')).toBe(3);
                });

                it('should return 3 for Rogue (L3 subclass)', () => {
                    expect(engine.getSubclassLevel('rogue')).toBe(3);
                });

                it('should return 0 for unknown class', () => {
                    expect(engine.getSubclassLevel('nonexistent')).toBe(0);
                });
            });

            describe('requiresLevel1Subclass', () => {
                it('should return true for Cleric', () => {
                    expect(engine.requiresLevel1Subclass('cleric')).toBe(true);
                });

                it('should return true for Sorcerer', () => {
                    expect(engine.requiresLevel1Subclass('sorcerer')).toBe(true);
                });

                it('should return true for Warlock', () => {
                    expect(engine.requiresLevel1Subclass('warlock')).toBe(true);
                });

                it('should return false for Fighter (L3)', () => {
                    expect(engine.requiresLevel1Subclass('fighter')).toBe(false);
                });

                it('should return false for Wizard (L2)', () => {
                    expect(engine.requiresLevel1Subclass('wizard')).toBe(false);
                });

                it('should return false for Barbarian (L3)', () => {
                    expect(engine.requiresLevel1Subclass('barbarian')).toBe(false);
                });
            });

            describe('getClassById', () => {
                it('should find class by ID', () => {
                    const fighter = engine.getClassById('fighter');
                    expect(fighter).toBeDefined();
                    expect(fighter!.name).toBe('Fighter');
                });

                it('should return undefined for unknown class', () => {
                    expect(engine.getClassById('nonexistent')).toBeUndefined();
                });
            });

            describe('getSubclassById', () => {
                it('should find subclass by class and subclass ID', () => {
                    const champion = engine.getSubclassById('fighter', 'champion');
                    expect(champion).toBeDefined();
                    expect(champion!.name).toBe('Champion');
                });

                it('should find Life Domain', () => {
                    const lifeDomain = engine.getSubclassById('cleric', 'life-domain');
                    expect(lifeDomain).toBeDefined();
                    expect(lifeDomain!.name).toBe('Life Domain');
                });

                it('should return undefined for unknown subclass', () => {
                    expect(engine.getSubclassById('fighter', 'nonexistent')).toBeUndefined();
                });

                it('should return undefined for unknown class', () => {
                    expect(engine.getSubclassById('nonexistent', 'champion')).toBeUndefined();
                });
            });
        });

        describe('L1 Subclass Validation (T035i)', () => {
            let testCharacter: DnD5eCharacter;

            beforeEach(() => {
                testCharacter = createEmptyDnD5eCharacter();
            });

            it('should fail validation for Cleric without subclass', () => {
                testCharacter.classes = [{
                    name: 'Cleric',
                    level: 1,
                    hitDie: 8,
                    features: []
                    // No subclass!
                }];

                const result = engine.validateStep(testCharacter, 'class');

                expect(result.isValid).toBe(false);
                expect(result.errors.some(e => e.code === 'SUBCLASS_REQUIRED_L1')).toBe(true);
            });

            it('should fail validation for Sorcerer without subclass', () => {
                testCharacter.classes = [{
                    name: 'Sorcerer',
                    level: 1,
                    hitDie: 6,
                    features: []
                }];

                const result = engine.validateStep(testCharacter, 'class');

                expect(result.isValid).toBe(false);
                expect(result.errors.some(e => e.code === 'SUBCLASS_REQUIRED_L1')).toBe(true);
            });

            it('should fail validation for Warlock without subclass', () => {
                testCharacter.classes = [{
                    name: 'Warlock',
                    level: 1,
                    hitDie: 8,
                    features: []
                }];

                const result = engine.validateStep(testCharacter, 'class');

                expect(result.isValid).toBe(false);
                expect(result.errors.some(e => e.code === 'SUBCLASS_REQUIRED_L1')).toBe(true);
            });

            it('should pass validation for Cleric with Life Domain', () => {
                testCharacter.classes = [{
                    name: 'Cleric',
                    level: 1,
                    hitDie: 8,
                    subclass: 'Life Domain',
                    features: []
                }];

                const result = engine.validateStep(testCharacter, 'class');

                expect(result.isValid).toBe(true);
                expect(result.errors.length).toBe(0);
            });

            it('should pass validation for Fighter without subclass (L3 subclass)', () => {
                testCharacter.classes = [{
                    name: 'Fighter',
                    level: 1,
                    hitDie: 10,
                    features: []
                    // No subclass needed at L1
                }];

                const result = engine.validateStep(testCharacter, 'class');

                expect(result.isValid).toBe(true);
            });

            it('should fail validation for character with no class', () => {
                testCharacter.classes = [];

                const result = engine.validateStep(testCharacter, 'class');

                expect(result.isValid).toBe(false);
                expect(result.errors.some(e => e.code === 'CLASS_REQUIRED')).toBe(true);
            });
        });

        describe('getEquipmentChoices (T035)', () => {
            it('should return empty array for unknown class', () => {
                const choices = engine.getEquipmentChoices('nonexistent');
                expect(choices).toEqual([]);
            });

            it('should return Fighter equipment choices', () => {
                const choices = engine.getEquipmentChoices('fighter');

                expect(choices.length).toBeGreaterThan(0);

                // Each choice group should have valid structure
                for (const choice of choices) {
                    expect(choice.id).toBeDefined();
                    expect(choice.description).toBeDefined();
                    expect(choice.options.length).toBeGreaterThan(0);
                    expect(choice.selectedIndex).toBeUndefined();
                }
            });

            it('should return Barbarian equipment choices with correct options', () => {
                const choices = engine.getEquipmentChoices('barbarian');

                // Barbarian has: weapon choice, second weapon choice, pack, javelins
                expect(choices.length).toBeGreaterThanOrEqual(3);

                // Find the weapon choice
                const weaponChoice = choices.find(c => c.id === 'barbarian-weapon-1');
                expect(weaponChoice).toBeDefined();
                expect(weaponChoice!.options.length).toBe(2); // Greataxe or martial melee
            });

            it('should return Wizard equipment choices', () => {
                const choices = engine.getEquipmentChoices('wizard');

                expect(choices.length).toBeGreaterThan(0);

                // Wizard should have spellbook
                const hasSpellbook = choices.some(c =>
                    c.options.some(opt =>
                        opt.items.some(item => item.id === 'spellbook')
                    )
                );
                expect(hasSpellbook).toBe(true);
            });

            it('should format item names correctly', () => {
                const choices = engine.getEquipmentChoices('fighter');

                // Check that at least one item has a formatted name
                const allItems = choices.flatMap(c => c.options.flatMap(o => o.items));
                const hasFormattedName = allItems.some(item =>
                    item.name.charAt(0) === item.name.charAt(0).toUpperCase()
                );
                expect(hasFormattedName).toBe(true);
            });

            it('should identify item types correctly', () => {
                const choices = engine.getEquipmentChoices('fighter');
                const allItems = choices.flatMap(c => c.options.flatMap(o => o.items));

                // Should have weapons
                const hasWeapon = allItems.some(item => item.type === 'weapon');
                expect(hasWeapon).toBe(true);

                // Should have pack
                const hasPack = allItems.some(item => item.type === 'pack');
                expect(hasPack).toBe(true);
            });
        });

        describe('Spellcasting Methods (T035m-o)', () => {
            let wizardCharacter: DnD5eCharacter;
            let clericCharacter: DnD5eCharacter;
            let fighterCharacter: DnD5eCharacter;

            beforeEach(() => {
                wizardCharacter = {
                    ...createEmptyDnD5eCharacter(),
                    classes: [{
                        name: 'Wizard',
                        level: 3,
                        hitDie: 6,
                        features: []
                    }],
                    abilityScores: {
                        strength: 8,
                        dexterity: 14,
                        constitution: 14,
                        intelligence: 16, // +3 mod
                        wisdom: 12,
                        charisma: 10
                    }
                };

                clericCharacter = {
                    ...createEmptyDnD5eCharacter(),
                    classes: [{
                        name: 'Cleric',
                        level: 1,
                        hitDie: 8,
                        subclass: 'Life Domain',
                        features: []
                    }],
                    abilityScores: {
                        strength: 14,
                        dexterity: 10,
                        constitution: 14,
                        intelligence: 8,
                        wisdom: 16, // +3 mod
                        charisma: 12
                    }
                };

                fighterCharacter = {
                    ...createEmptyDnD5eCharacter(),
                    classes: [{
                        name: 'Fighter',
                        level: 1,
                        hitDie: 10,
                        features: []
                    }]
                };
            });

            describe('getSpellcastingInfo (T035m)', () => {
                it('should return correct info for Wizard', () => {
                    const info = engine.getSpellcastingInfo(wizardCharacter);

                    expect(info.isSpellcaster).toBe(true);
                    expect(info.casterType).toBe('full');
                    expect(info.spellcastingClass).toBe('Wizard');
                    expect(info.spellcastingAbility).toBe('intelligence');

                    // Level 3 Wizard: Prof +2, INT +3 = spell save DC 13, attack +5
                    expect(info.spellSaveDC).toBe(13);
                    expect(info.spellAttackBonus).toBe(5);

                    // Level 3 Wizard: 3 cantrips
                    expect(info.cantripsKnown).toBe(3);

                    // Wizard is a prepared caster
                    expect(info.prepareFormula).toBe('INT_MOD + LEVEL');
                    expect(info.maxPreparedSpells).toBe(6); // 3 + 3

                    // Full caster level 3: 4 1st-level, 2 2nd-level slots
                    expect(info.spellSlots[1]?.total).toBe(4);
                    expect(info.spellSlots[2]?.total).toBe(2);

                    expect(info.ritualCasting).toBe(true);
                });

                it('should return correct info for Cleric', () => {
                    const info = engine.getSpellcastingInfo(clericCharacter);

                    expect(info.isSpellcaster).toBe(true);
                    expect(info.casterType).toBe('full');
                    expect(info.spellcastingClass).toBe('Cleric');
                    expect(info.spellcastingAbility).toBe('wisdom');

                    // Level 1 Cleric: Prof +2, WIS +3 = spell save DC 13, attack +5
                    expect(info.spellSaveDC).toBe(13);
                    expect(info.spellAttackBonus).toBe(5);

                    // Level 1 Cleric: 3 cantrips
                    expect(info.cantripsKnown).toBe(3);

                    // Cleric is a prepared caster
                    expect(info.prepareFormula).toBe('WIS_MOD + LEVEL');
                    expect(info.maxPreparedSpells).toBe(4); // 3 + 1

                    // Full caster level 1: 2 1st-level slots
                    expect(info.spellSlots[1]?.total).toBe(2);

                    expect(info.ritualCasting).toBe(true);
                });

                it('should return non-caster info for Fighter', () => {
                    const info = engine.getSpellcastingInfo(fighterCharacter);

                    expect(info.isSpellcaster).toBe(false);
                    expect(info.casterType).toBe('none');
                    expect(info.spellcastingClass).toBeUndefined();
                    expect(info.cantripsKnown).toBe(0);
                    expect(info.ritualCasting).toBe(false);
                });

                it('should return correct info for Warlock (Pact Magic)', () => {
                    const warlockCharacter: DnD5eCharacter = {
                        ...createEmptyDnD5eCharacter(),
                        classes: [{
                            name: 'Warlock',
                            level: 2,
                            hitDie: 8,
                            subclass: 'The Fiend',
                            features: []
                        }],
                        abilityScores: {
                            strength: 8,
                            dexterity: 14,
                            constitution: 14,
                            intelligence: 10,
                            wisdom: 12,
                            charisma: 16 // +3 mod
                        }
                    };

                    const info = engine.getSpellcastingInfo(warlockCharacter);

                    expect(info.isSpellcaster).toBe(true);
                    expect(info.casterType).toBe('pact');
                    expect(info.spellcastingClass).toBe('Warlock');
                    expect(info.spellcastingAbility).toBe('charisma');

                    // Warlock is a known caster
                    expect(info.maxSpellsKnown).toBe(3); // Level 2 warlock knows 3 spells

                    // Pact Magic: Level 2 = 2 slots at 1st level
                    expect(info.pactMagic).toBeDefined();
                    expect(info.pactMagic!.slotCount).toBe(2);
                    expect(info.pactMagic!.slotLevel).toBe(1);
                });

                it('should return correct info for Paladin (half-caster)', () => {
                    const paladinCharacter: DnD5eCharacter = {
                        ...createEmptyDnD5eCharacter(),
                        classes: [{
                            name: 'Paladin',
                            level: 2,
                            hitDie: 10,
                            features: []
                        }],
                        abilityScores: {
                            strength: 16,
                            dexterity: 10,
                            constitution: 14,
                            intelligence: 8,
                            wisdom: 12,
                            charisma: 14 // +2 mod
                        }
                    };

                    const info = engine.getSpellcastingInfo(paladinCharacter);

                    expect(info.isSpellcaster).toBe(true);
                    expect(info.casterType).toBe('half');
                    expect(info.spellcastingAbility).toBe('charisma');

                    // Level 2 Paladin: 0 cantrips (Paladins don't get cantrips)
                    expect(info.cantripsKnown).toBe(0);

                    // Half-caster level 2: 2 1st-level slots
                    expect(info.spellSlots[1]?.total).toBe(2);
                });
            });

            describe('getAvailableSpells (T035o)', () => {
                it('should return wizard cantrips', () => {
                    const cantrips = engine.getAvailableSpells(wizardCharacter, 0);

                    expect(cantrips.length).toBeGreaterThan(0);

                    // Should include Fire Bolt (wizard cantrip)
                    const fireBolt = cantrips.find(s => s.id === 'fire-bolt');
                    expect(fireBolt).toBeDefined();
                    expect(fireBolt!.level).toBe(0);
                    expect(fireBolt!.classes).toContain('wizard');
                });

                it('should return cleric 1st-level spells', () => {
                    const spells = engine.getAvailableSpells(clericCharacter, 1);

                    expect(spells.length).toBeGreaterThan(0);

                    // Should include Cure Wounds (cleric spell)
                    const cureWounds = spells.find(s => s.id === 'cure-wounds');
                    expect(cureWounds).toBeDefined();
                    expect(cureWounds!.level).toBe(1);
                    expect(cureWounds!.classes).toContain('cleric');
                });

                it('should return empty for non-spellcasters', () => {
                    const spells = engine.getAvailableSpells(fighterCharacter, 1);
                    expect(spells).toEqual([]);
                });

                it('should filter by correct class list', () => {
                    // Wizard cantrips should not include Sacred Flame (Cleric only)
                    const wizardCantrips = engine.getAvailableSpells(wizardCharacter, 0);
                    const hasSacredFlame = wizardCantrips.some(s => s.id === 'sacred-flame');
                    expect(hasSacredFlame).toBe(false);

                    // Cleric cantrips should include Sacred Flame
                    const clericCantrips = engine.getAvailableSpells(clericCharacter, 0);
                    const clericHasSacredFlame = clericCantrips.some(s => s.id === 'sacred-flame');
                    expect(clericHasSacredFlame).toBe(true);
                });
            });
        });

        describe('getAvailableBackgrounds (T037)', () => {
            it('should return all 6 SRD backgrounds', () => {
                const backgrounds = engine.getAvailableBackgrounds();
                expect(backgrounds).toHaveLength(6);
            });

            it('should include Acolyte background', () => {
                const backgrounds = engine.getAvailableBackgrounds();
                const acolyte = backgrounds.find(bg => bg.id === 'acolyte');
                expect(acolyte).toBeDefined();
                expect(acolyte!.name).toBe('Acolyte');
                expect(acolyte!.skillProficiencies).toContain('insight');
                expect(acolyte!.skillProficiencies).toContain('religion');
            });

            it('should include Soldier background', () => {
                const backgrounds = engine.getAvailableBackgrounds();
                const soldier = backgrounds.find(bg => bg.id === 'soldier');
                expect(soldier).toBeDefined();
                expect(soldier!.name).toBe('Soldier');
                expect(soldier!.skillProficiencies).toContain('athletics');
                expect(soldier!.skillProficiencies).toContain('intimidation');
            });

            it('should have all backgrounds with source SRD', () => {
                const backgrounds = engine.getAvailableBackgrounds();
                for (const bg of backgrounds) {
                    expect(bg.source).toBe('SRD');
                }
            });

            it('should have all backgrounds with 2 skill proficiencies', () => {
                const backgrounds = engine.getAvailableBackgrounds();
                for (const bg of backgrounds) {
                    expect(bg.skillProficiencies).toHaveLength(2);
                }
            });

            it('should have all backgrounds with features', () => {
                const backgrounds = engine.getAvailableBackgrounds();
                for (const bg of backgrounds) {
                    expect(bg.feature).toBeDefined();
                    expect(bg.feature.name).toBeDefined();
                    expect(bg.feature.description).toBeDefined();
                }
            });
        });
    });

    // =========================================================================
    // VALIDATION TESTS (T038-T046)
    // =========================================================================
    describe('Validation Methods', () => {
        describe('validateStep (T043)', () => {
            describe('abilityScores step (T038)', () => {
                it('should pass validation for valid ability scores', () => {
                    const character = createTestDnD5eCharacter({
                        abilityScores: {
                            strength: 15,
                            dexterity: 14,
                            constitution: 13,
                            intelligence: 12,
                            wisdom: 10,
                            charisma: 8
                        }
                    });
                    const result = engine.validateStep(character, 'abilityScores');
                    expect(result.isValid).toBe(true);
                    expect(result.errors).toHaveLength(0);
                });

                it('should fail validation for ability scores of 0', () => {
                    const character = createTestDnD5eCharacter({
                        abilityScores: {
                            strength: 0,
                            dexterity: 14,
                            constitution: 13,
                            intelligence: 12,
                            wisdom: 10,
                            charisma: 8
                        }
                    });
                    const result = engine.validateStep(character, 'abilityScores');
                    expect(result.isValid).toBe(false);
                    expect(result.errors.some(e => e.code === 'ABILITY_SCORE_NOT_SET')).toBe(true);
                });

                it('should fail validation for ability scores over 30', () => {
                    const character = createTestDnD5eCharacter({
                        abilityScores: {
                            strength: 31,
                            dexterity: 14,
                            constitution: 13,
                            intelligence: 12,
                            wisdom: 10,
                            charisma: 8
                        }
                    });
                    const result = engine.validateStep(character, 'abilityScores');
                    expect(result.isValid).toBe(false);
                    expect(result.errors.some(e => e.code === 'ABILITY_SCORE_OUT_OF_RANGE')).toBe(true);
                });

                it('should fail validation for multiple invalid scores', () => {
                    const character = createTestDnD5eCharacter({
                        abilityScores: {
                            strength: 0,
                            dexterity: 0,
                            constitution: 0,
                            intelligence: 0,
                            wisdom: 0,
                            charisma: 0
                        }
                    });
                    const result = engine.validateStep(character, 'abilityScores');
                    expect(result.isValid).toBe(false);
                    // 0 triggers both "out of range" and "not set" for each ability = 12 errors
                    expect(result.errors.length).toBe(12);
                });
            });

            describe('race step (T039)', () => {
                it('should fail validation when no race selected', () => {
                    const character = createTestDnD5eCharacter({
                        race: undefined
                    });
                    const result = engine.validateStep(character, 'race');
                    expect(result.isValid).toBe(false);
                    expect(result.errors.some(e => e.code === 'RACE_REQUIRED')).toBe(true);
                });

                it('should pass validation for valid race', () => {
                    const character = createTestDnD5eCharacter({
                        race: { id: 'human', name: 'Human' }
                    });
                    const result = engine.validateStep(character, 'race');
                    expect(result.isValid).toBe(true);
                });

                it('should fail validation for invalid race ID', () => {
                    const character = createTestDnD5eCharacter({
                        race: { id: 'invalid-race', name: 'Invalid' }
                    });
                    const result = engine.validateStep(character, 'race');
                    expect(result.isValid).toBe(false);
                    expect(result.errors.some(e => e.code === 'RACE_INVALID')).toBe(true);
                });

                it('should pass validation for subrace (Hill Dwarf)', () => {
                    const character = createTestDnD5eCharacter({
                        race: { id: 'hill-dwarf', name: 'Hill Dwarf' }
                    });
                    const result = engine.validateStep(character, 'race');
                    expect(result.isValid).toBe(true);
                });

                it('should validate flexible bonus choices for Half-Elf', () => {
                    const character = createTestDnD5eCharacter({
                        race: { id: 'half-elf', name: 'Half-Elf' },
                        flexibleAbilityBonusChoices: [
                            { ability: 'strength', bonus: 1 },
                            { ability: 'wisdom', bonus: 1 }
                        ]
                    });
                    const result = engine.validateStep(character, 'race');
                    expect(result.isValid).toBe(true);
                });

                it('should fail validation for Half-Elf with missing flexible bonuses', () => {
                    const character = createTestDnD5eCharacter({
                        race: { id: 'half-elf', name: 'Half-Elf' },
                        flexibleAbilityBonusChoices: [] // Missing required choices
                    });
                    const result = engine.validateStep(character, 'race');
                    expect(result.isValid).toBe(false);
                    expect(result.errors.some(e => e.code === 'FLEXIBLE_BONUS_COUNT_INVALID')).toBe(true);
                });
            });

            describe('class step (T040)', () => {
                it('should fail validation when no class selected', () => {
                    const character = createTestDnD5eCharacter({
                        classes: []
                    });
                    const result = engine.validateStep(character, 'class');
                    expect(result.isValid).toBe(false);
                    expect(result.errors.some(e => e.code === 'CLASS_REQUIRED')).toBe(true);
                });

                it('should pass validation for Fighter (no L1 subclass required)', () => {
                    const character = createTestDnD5eCharacter({
                        classes: [{ name: 'Fighter', level: 1 }]
                    });
                    const result = engine.validateStep(character, 'class');
                    expect(result.isValid).toBe(true);
                });

                it('should fail validation for Cleric without subclass', () => {
                    const character = createTestDnD5eCharacter({
                        classes: [{ name: 'Cleric', level: 1 }]
                    });
                    const result = engine.validateStep(character, 'class');
                    expect(result.isValid).toBe(false);
                    expect(result.errors.some(e => e.code === 'SUBCLASS_REQUIRED_L1')).toBe(true);
                });

                it('should pass validation for Cleric with Life Domain', () => {
                    const character = createTestDnD5eCharacter({
                        classes: [{ name: 'Cleric', level: 1, subclass: 'Life Domain' }]
                    });
                    const result = engine.validateStep(character, 'class');
                    expect(result.isValid).toBe(true);
                });

                it('should fail validation for Warlock without subclass', () => {
                    const character = createTestDnD5eCharacter({
                        classes: [{ name: 'Warlock', level: 1 }]
                    });
                    const result = engine.validateStep(character, 'class');
                    expect(result.isValid).toBe(false);
                    expect(result.errors.some(e => e.code === 'SUBCLASS_REQUIRED_L1')).toBe(true);
                });

                it('should pass validation for Sorcerer with Draconic Bloodline', () => {
                    const character = createTestDnD5eCharacter({
                        classes: [{ name: 'Sorcerer', level: 1, subclass: 'Draconic Bloodline' }]
                    });
                    const result = engine.validateStep(character, 'class');
                    expect(result.isValid).toBe(true);
                });
            });

            describe('background step (T041)', () => {
                it('should fail validation when no background selected', () => {
                    const character = createTestDnD5eCharacter({
                        background: undefined
                    });
                    const result = engine.validateStep(character, 'background');
                    expect(result.isValid).toBe(false);
                    expect(result.errors.some(e => e.code === 'BACKGROUND_REQUIRED')).toBe(true);
                });

                it('should pass validation for valid background', () => {
                    const character = createTestDnD5eCharacter({
                        background: 'soldier'
                    });
                    const result = engine.validateStep(character, 'background');
                    expect(result.isValid).toBe(true);
                });

                it('should fail validation for invalid background ID', () => {
                    const character = createTestDnD5eCharacter({
                        background: 'invalid-background'
                    });
                    const result = engine.validateStep(character, 'background');
                    expect(result.isValid).toBe(false);
                    expect(result.errors.some(e => e.code === 'BACKGROUND_INVALID')).toBe(true);
                });

                it('should pass validation for all SRD backgrounds', () => {
                    const backgrounds = ['acolyte', 'criminal', 'folk-hero', 'noble', 'sage', 'soldier'];
                    for (const bg of backgrounds) {
                        const character = createTestDnD5eCharacter({ background: bg });
                        const result = engine.validateStep(character, 'background');
                        expect(result.isValid).toBe(true);
                    }
                });
            });

            describe('equipment step (T042)', () => {
                it('should pass validation even without equipment (optional)', () => {
                    const character = createTestDnD5eCharacter({
                        classes: [{ name: 'Fighter', level: 1 }],
                        equipment: []
                    });
                    const result = engine.validateStep(character, 'equipment');
                    expect(result.isValid).toBe(true);
                });

                it('should add info message when no equipment selected', () => {
                    const character = createTestDnD5eCharacter({
                        classes: [{ name: 'Fighter', level: 1 }],
                        equipment: []
                    });
                    const result = engine.validateStep(character, 'equipment');
                    expect(result.info.some(i => i.code === 'EQUIPMENT_NOT_SELECTED')).toBe(true);
                });
            });
        });

        describe('validateCharacter (T044)', () => {
            it('should return valid for complete character', () => {
                const character = createTestDnD5eCharacter({
                    abilityScores: {
                        strength: 15,
                        dexterity: 14,
                        constitution: 13,
                        intelligence: 12,
                        wisdom: 10,
                        charisma: 8
                    },
                    race: { id: 'human', name: 'Human' },
                    classes: [{ name: 'Fighter', level: 1 }],
                    background: 'soldier',
                    equipment: ['longsword']
                });
                const result = engine.validateCharacter(character);
                expect(result.isValid).toBe(true);
            });

            it('should aggregate errors from multiple steps', () => {
                const character = createTestDnD5eCharacter({
                    abilityScores: {
                        strength: 0, // Invalid
                        dexterity: 0,
                        constitution: 0,
                        intelligence: 0,
                        wisdom: 0,
                        charisma: 0
                    },
                    race: undefined, // Missing
                    classes: [], // Missing
                    background: undefined // Missing
                });
                const result = engine.validateCharacter(character);
                expect(result.isValid).toBe(false);
                expect(result.errors.length).toBeGreaterThan(1);
            });
        });

        describe('isCharacterComplete (T045)', () => {
            it('should return true for complete character', () => {
                const character = createTestDnD5eCharacter({
                    abilityScores: {
                        strength: 15,
                        dexterity: 14,
                        constitution: 13,
                        intelligence: 12,
                        wisdom: 10,
                        charisma: 8
                    },
                    race: { id: 'human', name: 'Human' },
                    classes: [{ name: 'Fighter', level: 1 }],
                    background: 'soldier'
                });
                expect(engine.isCharacterComplete(character)).toBe(true);
            });

            it('should return false for incomplete character', () => {
                const character = createTestDnD5eCharacter({
                    race: undefined,
                    classes: []
                });
                expect(engine.isCharacterComplete(character)).toBe(false);
            });
        });
    });
});

