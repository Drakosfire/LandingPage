/**
 * D&D 5e SRD Classes Tests - Martial Classes
 * 
 * Tests for Barbarian, Fighter, Monk, Rogue class data.
 * Verifies SRD accuracy and data structure integrity.
 * 
 * @module CharacterGenerator/__tests__/data/dnd5e/classes
 */

import {
    BARBARIAN,
    FIGHTER,
    MONK,
    ROGUE,
    SRD_MARTIAL_CLASSES,
    SRD_CLASSES,
    FIGHTER_FIGHTING_STYLES,
    MONK_MARTIAL_ARTS_DIE,
    ROGUE_SNEAK_ATTACK_DICE,
    getClassById,
    getSubclassById,
    isSpellcaster,
    getMartialClasses,
    getSpellcasterClasses
} from '../../../data/dnd5e/classes';

describe('SRD Martial Classes', () => {
    // ==========================================================================
    // CLASS LIST TESTS
    // ==========================================================================
    
    describe('Class list exports', () => {
        it('should export exactly 4 martial classes', () => {
            expect(SRD_MARTIAL_CLASSES).toHaveLength(4);
        });

        it('should export the correct martial classes', () => {
            const classIds = SRD_MARTIAL_CLASSES.map(cls => cls.id);
            expect(classIds).toContain('barbarian');
            expect(classIds).toContain('fighter');
            expect(classIds).toContain('monk');
            expect(classIds).toContain('rogue');
        });

        it('SRD_CLASSES should equal SRD_MARTIAL_CLASSES (until casters added)', () => {
            expect(SRD_CLASSES).toEqual(SRD_MARTIAL_CLASSES);
        });
    });

    // ==========================================================================
    // BARBARIAN TESTS
    // ==========================================================================
    
    describe('Barbarian class', () => {
        it('should have correct basic properties', () => {
            expect(BARBARIAN.id).toBe('barbarian');
            expect(BARBARIAN.name).toBe('Barbarian');
            expect(BARBARIAN.hitDie).toBe(12);
            expect(BARBARIAN.source).toBe('SRD');
        });

        it('should have correct saving throw proficiencies', () => {
            expect(BARBARIAN.savingThrows).toEqual(['strength', 'constitution']);
        });

        it('should have correct armor proficiencies', () => {
            expect(BARBARIAN.armorProficiencies).toContain('light armor');
            expect(BARBARIAN.armorProficiencies).toContain('medium armor');
            expect(BARBARIAN.armorProficiencies).toContain('shields');
            expect(BARBARIAN.armorProficiencies).not.toContain('heavy armor');
        });

        it('should have correct weapon proficiencies', () => {
            expect(BARBARIAN.weaponProficiencies).toContain('simple weapons');
            expect(BARBARIAN.weaponProficiencies).toContain('martial weapons');
        });

        it('should have 6 skill choices, choose 2', () => {
            expect(BARBARIAN.skillChoices.choose).toBe(2);
            expect(BARBARIAN.skillChoices.from).toHaveLength(6);
            expect(BARBARIAN.skillChoices.from).toContain('Athletics');
            expect(BARBARIAN.skillChoices.from).toContain('Intimidation');
        });

        it('should have Rage and Unarmored Defense at level 1', () => {
            const level1Features = BARBARIAN.features[1];
            expect(level1Features).toBeDefined();
            expect(level1Features.some(f => f.id === 'rage')).toBe(true);
            expect(level1Features.some(f => f.id === 'unarmored-defense-barbarian')).toBe(true);
        });

        it('should have Reckless Attack and Danger Sense at level 2', () => {
            const level2Features = BARBARIAN.features[2];
            expect(level2Features).toBeDefined();
            expect(level2Features.some(f => f.id === 'reckless-attack')).toBe(true);
            expect(level2Features.some(f => f.id === 'danger-sense')).toBe(true);
        });

        it('should have Primal Path at level 3', () => {
            const level3Features = BARBARIAN.features[3];
            expect(level3Features).toBeDefined();
            expect(level3Features.some(f => f.id === 'primal-path')).toBe(true);
        });

        it('should have Berserker subclass at level 3', () => {
            expect(BARBARIAN.subclassLevel).toBe(3);
            expect(BARBARIAN.subclasses).toHaveLength(1);
            expect(BARBARIAN.subclasses[0].id).toBe('berserker');
        });

        it('should have Frenzy feature in Berserker subclass', () => {
            const berserker = BARBARIAN.subclasses[0];
            expect(berserker.features[3]).toBeDefined();
            expect(berserker.features[3].some(f => f.id === 'frenzy')).toBe(true);
        });

        it('should not have spellcasting', () => {
            expect(BARBARIAN.spellcasting).toBeUndefined();
        });

        it('should have equipment options', () => {
            expect(BARBARIAN.equipmentOptions.length).toBeGreaterThan(0);
        });
    });

    // ==========================================================================
    // FIGHTER TESTS
    // ==========================================================================
    
    describe('Fighter class', () => {
        it('should have correct basic properties', () => {
            expect(FIGHTER.id).toBe('fighter');
            expect(FIGHTER.name).toBe('Fighter');
            expect(FIGHTER.hitDie).toBe(10);
            expect(FIGHTER.source).toBe('SRD');
        });

        it('should have correct saving throw proficiencies', () => {
            expect(FIGHTER.savingThrows).toEqual(['strength', 'constitution']);
        });

        it('should have all armor proficiencies', () => {
            expect(FIGHTER.armorProficiencies).toContain('light armor');
            expect(FIGHTER.armorProficiencies).toContain('medium armor');
            expect(FIGHTER.armorProficiencies).toContain('heavy armor');
            expect(FIGHTER.armorProficiencies).toContain('shields');
        });

        it('should have 8 skill choices, choose 2', () => {
            expect(FIGHTER.skillChoices.choose).toBe(2);
            expect(FIGHTER.skillChoices.from).toHaveLength(8);
        });

        it('should have Fighting Style and Second Wind at level 1', () => {
            const level1Features = FIGHTER.features[1];
            expect(level1Features).toBeDefined();
            expect(level1Features.some(f => f.id === 'fighting-style-fighter')).toBe(true);
            expect(level1Features.some(f => f.id === 'second-wind')).toBe(true);
        });

        it('should have Action Surge at level 2', () => {
            const level2Features = FIGHTER.features[2];
            expect(level2Features).toBeDefined();
            expect(level2Features.some(f => f.id === 'action-surge')).toBe(true);
        });

        it('should have Martial Archetype at level 3', () => {
            const level3Features = FIGHTER.features[3];
            expect(level3Features).toBeDefined();
            expect(level3Features.some(f => f.id === 'martial-archetype')).toBe(true);
        });

        it('should have Champion subclass at level 3', () => {
            expect(FIGHTER.subclassLevel).toBe(3);
            expect(FIGHTER.subclasses).toHaveLength(1);
            expect(FIGHTER.subclasses[0].id).toBe('champion');
        });

        it('should have Improved Critical feature in Champion subclass', () => {
            const champion = FIGHTER.subclasses[0];
            expect(champion.features[3]).toBeDefined();
            expect(champion.features[3].some(f => f.id === 'improved-critical')).toBe(true);
        });

        it('should not have spellcasting', () => {
            expect(FIGHTER.spellcasting).toBeUndefined();
        });
    });

    describe('Fighter Fighting Styles', () => {
        it('should export 6 fighting styles', () => {
            expect(FIGHTER_FIGHTING_STYLES).toHaveLength(6);
        });

        it('should include Archery, Defense, Dueling, Great Weapon, Protection, Two-Weapon', () => {
            const styleIds = FIGHTER_FIGHTING_STYLES.map(s => s.id);
            expect(styleIds).toContain('archery');
            expect(styleIds).toContain('defense');
            expect(styleIds).toContain('dueling');
            expect(styleIds).toContain('great-weapon-fighting');
            expect(styleIds).toContain('protection');
            expect(styleIds).toContain('two-weapon-fighting');
        });
    });

    // ==========================================================================
    // MONK TESTS
    // ==========================================================================
    
    describe('Monk class', () => {
        it('should have correct basic properties', () => {
            expect(MONK.id).toBe('monk');
            expect(MONK.name).toBe('Monk');
            expect(MONK.hitDie).toBe(8);
            expect(MONK.source).toBe('SRD');
        });

        it('should have correct saving throw proficiencies (STR, DEX)', () => {
            expect(MONK.savingThrows).toEqual(['strength', 'dexterity']);
        });

        it('should have no armor proficiencies', () => {
            expect(MONK.armorProficiencies).toHaveLength(0);
        });

        it('should have simple weapons and shortswords', () => {
            expect(MONK.weaponProficiencies).toContain('simple weapons');
            expect(MONK.weaponProficiencies).toContain('shortswords');
        });

        it('should have 6 skill choices, choose 2', () => {
            expect(MONK.skillChoices.choose).toBe(2);
            expect(MONK.skillChoices.from).toHaveLength(6);
            expect(MONK.skillChoices.from).toContain('Acrobatics');
            expect(MONK.skillChoices.from).toContain('Stealth');
        });

        it('should have Unarmored Defense and Martial Arts at level 1', () => {
            const level1Features = MONK.features[1];
            expect(level1Features).toBeDefined();
            expect(level1Features.some(f => f.id === 'unarmored-defense-monk')).toBe(true);
            expect(level1Features.some(f => f.id === 'martial-arts')).toBe(true);
        });

        it('should have Ki features at level 2', () => {
            const level2Features = MONK.features[2];
            expect(level2Features).toBeDefined();
            expect(level2Features.some(f => f.id === 'ki')).toBe(true);
            expect(level2Features.some(f => f.id === 'flurry-of-blows')).toBe(true);
            expect(level2Features.some(f => f.id === 'patient-defense')).toBe(true);
            expect(level2Features.some(f => f.id === 'step-of-the-wind')).toBe(true);
            expect(level2Features.some(f => f.id === 'unarmored-movement')).toBe(true);
        });

        it('should have Monastic Tradition and Deflect Missiles at level 3', () => {
            const level3Features = MONK.features[3];
            expect(level3Features).toBeDefined();
            expect(level3Features.some(f => f.id === 'monastic-tradition')).toBe(true);
            expect(level3Features.some(f => f.id === 'deflect-missiles')).toBe(true);
        });

        it('should have Way of the Open Hand subclass at level 3', () => {
            expect(MONK.subclassLevel).toBe(3);
            expect(MONK.subclasses).toHaveLength(1);
            expect(MONK.subclasses[0].id).toBe('way-of-the-open-hand');
        });

        it('should have Open Hand Technique in subclass', () => {
            const openHand = MONK.subclasses[0];
            expect(openHand.features[3]).toBeDefined();
            expect(openHand.features[3].some(f => f.id === 'open-hand-technique')).toBe(true);
        });

        it('should not have spellcasting', () => {
            expect(MONK.spellcasting).toBeUndefined();
        });
    });

    describe('Monk Martial Arts Die', () => {
        it('should have correct die progression', () => {
            // d4 at levels 1-4
            expect(MONK_MARTIAL_ARTS_DIE[1]).toBe(4);
            expect(MONK_MARTIAL_ARTS_DIE[4]).toBe(4);
            
            // d6 at levels 5-10
            expect(MONK_MARTIAL_ARTS_DIE[5]).toBe(6);
            expect(MONK_MARTIAL_ARTS_DIE[10]).toBe(6);
            
            // d8 at levels 11-16
            expect(MONK_MARTIAL_ARTS_DIE[11]).toBe(8);
            expect(MONK_MARTIAL_ARTS_DIE[16]).toBe(8);
            
            // d10 at levels 17-20
            expect(MONK_MARTIAL_ARTS_DIE[17]).toBe(10);
            expect(MONK_MARTIAL_ARTS_DIE[20]).toBe(10);
        });
    });

    // ==========================================================================
    // ROGUE TESTS
    // ==========================================================================
    
    describe('Rogue class', () => {
        it('should have correct basic properties', () => {
            expect(ROGUE.id).toBe('rogue');
            expect(ROGUE.name).toBe('Rogue');
            expect(ROGUE.hitDie).toBe(8);
            expect(ROGUE.source).toBe('SRD');
        });

        it('should have correct saving throw proficiencies (DEX, INT)', () => {
            expect(ROGUE.savingThrows).toEqual(['dexterity', 'intelligence']);
        });

        it('should have only light armor proficiency', () => {
            expect(ROGUE.armorProficiencies).toEqual(['light armor']);
        });

        it('should have correct weapon proficiencies including finesse weapons', () => {
            expect(ROGUE.weaponProficiencies).toContain('simple weapons');
            expect(ROGUE.weaponProficiencies).toContain('hand crossbows');
            expect(ROGUE.weaponProficiencies).toContain('longswords');
            expect(ROGUE.weaponProficiencies).toContain('rapiers');
            expect(ROGUE.weaponProficiencies).toContain('shortswords');
        });

        it('should have thieves\' tools proficiency', () => {
            expect(ROGUE.toolProficiencies).toContain("thieves' tools");
        });

        it('should have 11 skill choices, choose 4', () => {
            expect(ROGUE.skillChoices.choose).toBe(4);
            expect(ROGUE.skillChoices.from).toHaveLength(11);
            expect(ROGUE.skillChoices.from).toContain('Stealth');
            expect(ROGUE.skillChoices.from).toContain('Sleight of Hand');
        });

        it('should have Expertise, Sneak Attack, and Thieves\' Cant at level 1', () => {
            const level1Features = ROGUE.features[1];
            expect(level1Features).toBeDefined();
            expect(level1Features.some(f => f.id === 'expertise-rogue')).toBe(true);
            expect(level1Features.some(f => f.id === 'sneak-attack')).toBe(true);
            expect(level1Features.some(f => f.id === 'thieves-cant')).toBe(true);
        });

        it('should have Cunning Action at level 2', () => {
            const level2Features = ROGUE.features[2];
            expect(level2Features).toBeDefined();
            expect(level2Features.some(f => f.id === 'cunning-action')).toBe(true);
        });

        it('should have Roguish Archetype at level 3', () => {
            const level3Features = ROGUE.features[3];
            expect(level3Features).toBeDefined();
            expect(level3Features.some(f => f.id === 'roguish-archetype')).toBe(true);
        });

        it('should have Thief subclass at level 3', () => {
            expect(ROGUE.subclassLevel).toBe(3);
            expect(ROGUE.subclasses).toHaveLength(1);
            expect(ROGUE.subclasses[0].id).toBe('thief');
        });

        it('should have Fast Hands and Second-Story Work in Thief subclass', () => {
            const thief = ROGUE.subclasses[0];
            expect(thief.features[3]).toBeDefined();
            expect(thief.features[3].some(f => f.id === 'fast-hands')).toBe(true);
            expect(thief.features[3].some(f => f.id === 'second-story-work')).toBe(true);
        });

        it('should not have spellcasting', () => {
            expect(ROGUE.spellcasting).toBeUndefined();
        });
    });

    describe('Rogue Sneak Attack Dice', () => {
        it('should have correct die progression', () => {
            // 1d6 at levels 1-2
            expect(ROGUE_SNEAK_ATTACK_DICE[1]).toBe(1);
            expect(ROGUE_SNEAK_ATTACK_DICE[2]).toBe(1);
            
            // 2d6 at levels 3-4
            expect(ROGUE_SNEAK_ATTACK_DICE[3]).toBe(2);
            expect(ROGUE_SNEAK_ATTACK_DICE[4]).toBe(2);
            
            // 5d6 at levels 9-10
            expect(ROGUE_SNEAK_ATTACK_DICE[9]).toBe(5);
            expect(ROGUE_SNEAK_ATTACK_DICE[10]).toBe(5);
            
            // 10d6 at levels 19-20
            expect(ROGUE_SNEAK_ATTACK_DICE[19]).toBe(10);
            expect(ROGUE_SNEAK_ATTACK_DICE[20]).toBe(10);
        });
    });

    // ==========================================================================
    // HELPER FUNCTION TESTS
    // ==========================================================================
    
    describe('getClassById', () => {
        it('should find class by ID', () => {
            expect(getClassById('barbarian')).toBe(BARBARIAN);
            expect(getClassById('fighter')).toBe(FIGHTER);
            expect(getClassById('monk')).toBe(MONK);
            expect(getClassById('rogue')).toBe(ROGUE);
        });

        it('should return undefined for unknown class', () => {
            expect(getClassById('wizard')).toBeUndefined();
            expect(getClassById('unknown')).toBeUndefined();
        });
    });

    describe('getSubclassById', () => {
        it('should find subclass by class ID and subclass ID', () => {
            const berserker = getSubclassById('barbarian', 'berserker');
            expect(berserker).toBeDefined();
            expect(berserker?.name).toBe('Path of the Berserker');

            const champion = getSubclassById('fighter', 'champion');
            expect(champion).toBeDefined();
            expect(champion?.name).toBe('Champion');
        });

        it('should return undefined for unknown class', () => {
            expect(getSubclassById('wizard', 'evoker')).toBeUndefined();
        });

        it('should return undefined for unknown subclass', () => {
            expect(getSubclassById('fighter', 'battlemaster')).toBeUndefined();
        });
    });

    describe('isSpellcaster', () => {
        it('should return false for all martial classes', () => {
            expect(isSpellcaster('barbarian')).toBe(false);
            expect(isSpellcaster('fighter')).toBe(false);
            expect(isSpellcaster('monk')).toBe(false);
            expect(isSpellcaster('rogue')).toBe(false);
        });

        it('should return false for unknown class', () => {
            expect(isSpellcaster('unknown')).toBe(false);
        });
    });

    describe('getMartialClasses', () => {
        it('should return all 4 martial classes', () => {
            const martial = getMartialClasses();
            expect(martial).toHaveLength(4);
            expect(martial.map(c => c.id)).toEqual(['barbarian', 'fighter', 'monk', 'rogue']);
        });
    });

    describe('getSpellcasterClasses', () => {
        it('should return empty array (no casters yet)', () => {
            const casters = getSpellcasterClasses();
            expect(casters).toHaveLength(0);
        });
    });

    // ==========================================================================
    // DATA INTEGRITY TESTS
    // ==========================================================================
    
    describe('Data integrity', () => {
        it('all classes should have unique IDs', () => {
            const ids = SRD_CLASSES.map(cls => cls.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it('all classes should have exactly 2 saving throw proficiencies', () => {
            SRD_CLASSES.forEach(cls => {
                expect(cls.savingThrows).toHaveLength(2);
            });
        });

        it('all classes should have features for levels 1, 2, and 3', () => {
            SRD_CLASSES.forEach(cls => {
                expect(cls.features[1]).toBeDefined();
                expect(cls.features[1].length).toBeGreaterThan(0);
                expect(cls.features[2]).toBeDefined();
                expect(cls.features[2].length).toBeGreaterThan(0);
                expect(cls.features[3]).toBeDefined();
                expect(cls.features[3].length).toBeGreaterThan(0);
            });
        });

        it('all classes should have at least one subclass', () => {
            SRD_CLASSES.forEach(cls => {
                expect(cls.subclasses.length).toBeGreaterThan(0);
            });
        });

        it('all classes should have equipment options', () => {
            SRD_CLASSES.forEach(cls => {
                expect(cls.equipmentOptions.length).toBeGreaterThan(0);
            });
        });

        it('all subclasses should reference their parent class', () => {
            SRD_CLASSES.forEach(cls => {
                cls.subclasses.forEach(sub => {
                    expect(sub.className).toBe(cls.id);
                });
            });
        });

        it('all feature IDs should be unique within a class', () => {
            SRD_CLASSES.forEach(cls => {
                const allFeatureIds: string[] = [];
                
                // Collect class features
                Object.values(cls.features).forEach(levelFeatures => {
                    levelFeatures.forEach(f => allFeatureIds.push(f.id));
                });
                
                const uniqueIds = new Set(allFeatureIds);
                expect(uniqueIds.size).toBe(allFeatureIds.length);
            });
        });
    });
});



