/**
 * D&D 5e SRD Classes Tests - All SRD Classes
 * 
 * Tests for all SRD class data:
 * - Martial: Barbarian, Fighter, Monk, Rogue
 * - Half-Casters: Paladin, Ranger
 * - Full Casters: Bard, Cleric, Druid, Sorcerer, Warlock, Wizard
 * 
 * Verifies SRD accuracy and data structure integrity.
 * 
 * @module CharacterGenerator/__tests__/data/dnd5e/classes
 */

import {
    BARBARIAN,
    FIGHTER,
    MONK,
    ROGUE,
    PALADIN,
    RANGER,
    BARD,
    CLERIC,
    DRUID,
    SORCERER,
    WARLOCK,
    WIZARD,
    SRD_MARTIAL_CLASSES,
    SRD_HALF_CASTER_CLASSES,
    SRD_FULL_CASTER_CLASSES,
    SRD_CASTER_CLASSES,
    SRD_CLASSES,
    FIGHTER_FIGHTING_STYLES,
    MONK_MARTIAL_ARTS_DIE,
    ROGUE_SNEAK_ATTACK_DICE,
    FULL_CASTER_SPELL_SLOTS,
    PACT_MAGIC_SLOTS,
    BARD_SPELLS_KNOWN,
    BARD_CANTRIPS_KNOWN,
    CLERIC_CANTRIPS_KNOWN,
    DRUID_CANTRIPS_KNOWN,
    getClassById,
    getSubclassById,
    isSpellcaster,
    getMartialClasses,
    getSpellcasterClasses
} from '../../../data/dnd5e/classes';

describe('SRD Classes', () => {
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

        it('should export exactly 2 half-caster classes', () => {
            expect(SRD_HALF_CASTER_CLASSES).toHaveLength(2);
        });

        it('should export the correct half-caster classes', () => {
            const classIds = SRD_HALF_CASTER_CLASSES.map(cls => cls.id);
            expect(classIds).toContain('paladin');
            expect(classIds).toContain('ranger');
        });

        it('should export exactly 6 full caster classes', () => {
            expect(SRD_FULL_CASTER_CLASSES).toHaveLength(6);
        });

        it('should export the correct full caster classes', () => {
            const classIds = SRD_FULL_CASTER_CLASSES.map(cls => cls.id);
            expect(classIds).toContain('bard');
            expect(classIds).toContain('cleric');
            expect(classIds).toContain('druid');
            expect(classIds).toContain('sorcerer');
            expect(classIds).toContain('warlock');
            expect(classIds).toContain('wizard');
        });

        it('SRD_CASTER_CLASSES should contain all casters (full + half)', () => {
            expect(SRD_CASTER_CLASSES).toHaveLength(8);
            const classIds = SRD_CASTER_CLASSES.map(cls => cls.id);
            expect(classIds).toContain('bard');
            expect(classIds).toContain('cleric');
            expect(classIds).toContain('druid');
            expect(classIds).toContain('sorcerer');
            expect(classIds).toContain('warlock');
            expect(classIds).toContain('wizard');
            expect(classIds).toContain('paladin');
            expect(classIds).toContain('ranger');
        });

        it('SRD_CLASSES should contain all 12 classes', () => {
            expect(SRD_CLASSES).toHaveLength(12);
            const allIds = SRD_CLASSES.map(cls => cls.id);
            expect(allIds).toContain('barbarian');
            expect(allIds).toContain('fighter');
            expect(allIds).toContain('monk');
            expect(allIds).toContain('rogue');
            expect(allIds).toContain('paladin');
            expect(allIds).toContain('ranger');
            expect(allIds).toContain('bard');
            expect(allIds).toContain('cleric');
            expect(allIds).toContain('druid');
            expect(allIds).toContain('sorcerer');
            expect(allIds).toContain('warlock');
            expect(allIds).toContain('wizard');
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
    // BARD TESTS (Full Caster - Known Spells)
    // ==========================================================================

    describe('Bard class', () => {
        it('should have correct basic properties', () => {
            expect(BARD.id).toBe('bard');
            expect(BARD.name).toBe('Bard');
            expect(BARD.hitDie).toBe(8);
            expect(BARD.source).toBe('SRD');
        });

        it('should have correct saving throw proficiencies (DEX, CHA)', () => {
            expect(BARD.savingThrows).toEqual(['dexterity', 'charisma']);
        });

        it('should have light armor proficiency only', () => {
            expect(BARD.armorProficiencies).toEqual(['light armor']);
        });

        it('should have correct weapon proficiencies including finesse weapons', () => {
            expect(BARD.weaponProficiencies).toContain('simple weapons');
            expect(BARD.weaponProficiencies).toContain('hand crossbows');
            expect(BARD.weaponProficiencies).toContain('longswords');
            expect(BARD.weaponProficiencies).toContain('rapiers');
            expect(BARD.weaponProficiencies).toContain('shortswords');
        });

        it('should have three musical instrument proficiencies', () => {
            expect(BARD.toolProficiencies).toContain('three musical instruments of your choice');
        });

        it('should have all skills available, choose 3', () => {
            expect(BARD.skillChoices.choose).toBe(3);
            expect(BARD.skillChoices.from).toHaveLength(18);
        });

        it('should have Spellcasting and Bardic Inspiration at level 1', () => {
            const level1Features = BARD.features[1];
            expect(level1Features).toBeDefined();
            expect(level1Features.some(f => f.id === 'spellcasting-bard')).toBe(true);
            expect(level1Features.some(f => f.id === 'bardic-inspiration')).toBe(true);
        });

        it('should have Jack of All Trades and Song of Rest at level 2', () => {
            const level2Features = BARD.features[2];
            expect(level2Features).toBeDefined();
            expect(level2Features.some(f => f.id === 'jack-of-all-trades')).toBe(true);
            expect(level2Features.some(f => f.id === 'song-of-rest')).toBe(true);
        });

        it('should have Bard College and Expertise at level 3', () => {
            const level3Features = BARD.features[3];
            expect(level3Features).toBeDefined();
            expect(level3Features.some(f => f.id === 'bard-college')).toBe(true);
            expect(level3Features.some(f => f.id === 'expertise-bard')).toBe(true);
        });

        it('should have College of Lore subclass at level 3', () => {
            expect(BARD.subclassLevel).toBe(3);
            expect(BARD.subclasses).toHaveLength(1);
            expect(BARD.subclasses[0].id).toBe('college-of-lore');
        });

        it('should have spellcasting with Charisma ability', () => {
            expect(BARD.spellcasting).toBeDefined();
            expect(BARD.spellcasting?.ability).toBe('charisma');
        });

        it('should be a known-spell caster (has spellsKnown, no preparedSpells)', () => {
            expect(BARD.spellcasting?.spellsKnown).toBeDefined();
            expect(BARD.spellcasting?.preparedSpells).toBeUndefined();
        });

        it('should have ritual casting', () => {
            expect(BARD.spellcasting?.ritualCasting).toBe(true);
        });
    });

    describe('Bard Spellcasting Progression', () => {
        it('should have correct cantrips known at levels 1-3', () => {
            expect(BARD_CANTRIPS_KNOWN[1]).toBe(2);
            expect(BARD_CANTRIPS_KNOWN[2]).toBe(2);
            expect(BARD_CANTRIPS_KNOWN[3]).toBe(2);
        });

        it('should have correct spells known at levels 1-3', () => {
            expect(BARD_SPELLS_KNOWN[1]).toBe(4);
            expect(BARD_SPELLS_KNOWN[2]).toBe(5);
            expect(BARD_SPELLS_KNOWN[3]).toBe(6);
        });
    });

    // ==========================================================================
    // CLERIC TESTS (Full Caster - Prepared Spells)
    // ==========================================================================

    describe('Cleric class', () => {
        it('should have correct basic properties', () => {
            expect(CLERIC.id).toBe('cleric');
            expect(CLERIC.name).toBe('Cleric');
            expect(CLERIC.hitDie).toBe(8);
            expect(CLERIC.source).toBe('SRD');
        });

        it('should have correct saving throw proficiencies (WIS, CHA)', () => {
            expect(CLERIC.savingThrows).toEqual(['wisdom', 'charisma']);
        });

        it('should have light, medium armor and shields proficiency', () => {
            expect(CLERIC.armorProficiencies).toContain('light armor');
            expect(CLERIC.armorProficiencies).toContain('medium armor');
            expect(CLERIC.armorProficiencies).toContain('shields');
            expect(CLERIC.armorProficiencies).not.toContain('heavy armor');
        });

        it('should have simple weapons proficiency', () => {
            expect(CLERIC.weaponProficiencies).toEqual(['simple weapons']);
        });

        it('should have 5 skill choices, choose 2', () => {
            expect(CLERIC.skillChoices.choose).toBe(2);
            expect(CLERIC.skillChoices.from).toHaveLength(5);
            expect(CLERIC.skillChoices.from).toContain('Religion');
            expect(CLERIC.skillChoices.from).toContain('Medicine');
        });

        it('should have Spellcasting and Divine Domain at level 1', () => {
            const level1Features = CLERIC.features[1];
            expect(level1Features).toBeDefined();
            expect(level1Features.some(f => f.id === 'spellcasting-cleric')).toBe(true);
            expect(level1Features.some(f => f.id === 'divine-domain')).toBe(true);
        });

        it('should have Channel Divinity at level 2', () => {
            const level2Features = CLERIC.features[2];
            expect(level2Features).toBeDefined();
            expect(level2Features.some(f => f.id === 'channel-divinity-cleric')).toBe(true);
            expect(level2Features.some(f => f.id === 'turn-undead')).toBe(true);
        });

        it('should choose subclass (Divine Domain) at level 1', () => {
            expect(CLERIC.subclassLevel).toBe(1);
            expect(CLERIC.subclasses).toHaveLength(1);
            expect(CLERIC.subclasses[0].id).toBe('life-domain');
        });

        it('Life Domain should grant features at level 1', () => {
            const lifeDomain = CLERIC.subclasses[0];
            expect(lifeDomain.features[1]).toBeDefined();
            expect(lifeDomain.features[1].some(f => f.id === 'domain-spells-life')).toBe(true);
            expect(lifeDomain.features[1].some(f => f.id === 'bonus-proficiency-life')).toBe(true);
            expect(lifeDomain.features[1].some(f => f.id === 'disciple-of-life')).toBe(true);
        });

        it('should have spellcasting with Wisdom ability', () => {
            expect(CLERIC.spellcasting).toBeDefined();
            expect(CLERIC.spellcasting?.ability).toBe('wisdom');
        });

        it('should be a prepared-spell caster (has preparedSpells formula)', () => {
            expect(CLERIC.spellcasting?.preparedSpells).toBeDefined();
            expect(CLERIC.spellcasting?.preparedSpells?.formula).toBe('WIS_MOD + LEVEL');
            expect(CLERIC.spellcasting?.spellsKnown).toBeUndefined();
        });

        it('should have ritual casting', () => {
            expect(CLERIC.spellcasting?.ritualCasting).toBe(true);
        });
    });

    describe('Cleric Spellcasting Progression', () => {
        it('should have correct cantrips known at levels 1-3', () => {
            expect(CLERIC_CANTRIPS_KNOWN[1]).toBe(3);
            expect(CLERIC_CANTRIPS_KNOWN[2]).toBe(3);
            expect(CLERIC_CANTRIPS_KNOWN[3]).toBe(3);
        });
    });

    // ==========================================================================
    // DRUID TESTS (Full Caster - Prepared Spells)
    // ==========================================================================

    describe('Druid class', () => {
        it('should have correct basic properties', () => {
            expect(DRUID.id).toBe('druid');
            expect(DRUID.name).toBe('Druid');
            expect(DRUID.hitDie).toBe(8);
            expect(DRUID.source).toBe('SRD');
        });

        it('should have correct saving throw proficiencies (INT, WIS)', () => {
            expect(DRUID.savingThrows).toEqual(['intelligence', 'wisdom']);
        });

        it('should have light, medium armor and shields proficiency', () => {
            expect(DRUID.armorProficiencies).toContain('light armor');
            expect(DRUID.armorProficiencies).toContain('medium armor');
            expect(DRUID.armorProficiencies).toContain('shields');
        });

        it('should have specific druid weapon proficiencies', () => {
            expect(DRUID.weaponProficiencies).toContain('clubs');
            expect(DRUID.weaponProficiencies).toContain('daggers');
            expect(DRUID.weaponProficiencies).toContain('scimitars');
            expect(DRUID.weaponProficiencies).toContain('quarterstaffs');
        });

        it('should have herbalism kit proficiency', () => {
            expect(DRUID.toolProficiencies).toContain('herbalism kit');
        });

        it('should have 8 skill choices, choose 2', () => {
            expect(DRUID.skillChoices.choose).toBe(2);
            expect(DRUID.skillChoices.from).toHaveLength(8);
            expect(DRUID.skillChoices.from).toContain('Nature');
            expect(DRUID.skillChoices.from).toContain('Animal Handling');
        });

        it('should have Druidic and Spellcasting at level 1', () => {
            const level1Features = DRUID.features[1];
            expect(level1Features).toBeDefined();
            expect(level1Features.some(f => f.id === 'druidic')).toBe(true);
            expect(level1Features.some(f => f.id === 'spellcasting-druid')).toBe(true);
        });

        it('should have Wild Shape and Druid Circle at level 2', () => {
            const level2Features = DRUID.features[2];
            expect(level2Features).toBeDefined();
            expect(level2Features.some(f => f.id === 'wild-shape')).toBe(true);
            expect(level2Features.some(f => f.id === 'druid-circle')).toBe(true);
        });

        it('should choose subclass (Druid Circle) at level 2', () => {
            expect(DRUID.subclassLevel).toBe(2);
            expect(DRUID.subclasses).toHaveLength(1);
            expect(DRUID.subclasses[0].id).toBe('circle-of-the-land');
        });

        it('Circle of the Land should grant features at level 2', () => {
            const circleLand = DRUID.subclasses[0];
            expect(circleLand.features[2]).toBeDefined();
            expect(circleLand.features[2].some(f => f.id === 'bonus-cantrip-land')).toBe(true);
            expect(circleLand.features[2].some(f => f.id === 'natural-recovery')).toBe(true);
            expect(circleLand.features[2].some(f => f.id === 'circle-spells-land')).toBe(true);
        });

        it('should have spellcasting with Wisdom ability', () => {
            expect(DRUID.spellcasting).toBeDefined();
            expect(DRUID.spellcasting?.ability).toBe('wisdom');
        });

        it('should be a prepared-spell caster (has preparedSpells formula)', () => {
            expect(DRUID.spellcasting?.preparedSpells).toBeDefined();
            expect(DRUID.spellcasting?.preparedSpells?.formula).toBe('WIS_MOD + LEVEL');
            expect(DRUID.spellcasting?.spellsKnown).toBeUndefined();
        });

        it('should have ritual casting', () => {
            expect(DRUID.spellcasting?.ritualCasting).toBe(true);
        });
    });

    describe('Druid Spellcasting Progression', () => {
        it('should have correct cantrips known at levels 1-3', () => {
            expect(DRUID_CANTRIPS_KNOWN[1]).toBe(2);
            expect(DRUID_CANTRIPS_KNOWN[2]).toBe(2);
            expect(DRUID_CANTRIPS_KNOWN[3]).toBe(2);
        });
    });

    // ==========================================================================
    // PALADIN TESTS (HALF CASTER)
    // ==========================================================================

    describe('Paladin class', () => {
        it('should have correct basic properties', () => {
            expect(PALADIN.id).toBe('paladin');
            expect(PALADIN.name).toBe('Paladin');
            expect(PALADIN.hitDie).toBe(10);
            expect(PALADIN.source).toBe('SRD');
        });

        it('should have STR and CHA as primary abilities', () => {
            expect(PALADIN.primaryAbility).toContain('strength');
            expect(PALADIN.primaryAbility).toContain('charisma');
        });

        it('should save on WIS and CHA', () => {
            expect(PALADIN.savingThrows).toContain('wisdom');
            expect(PALADIN.savingThrows).toContain('charisma');
        });

        it('should have heavy armor proficiency', () => {
            expect(PALADIN.armorProficiencies).toContain('heavy armor');
            expect(PALADIN.armorProficiencies).toContain('shields');
        });

        it('should have martial weapon proficiency', () => {
            expect(PALADIN.weaponProficiencies).toContain('martial weapons');
        });

        it('should choose 2 skills from paladin list', () => {
            expect(PALADIN.skillChoices.choose).toBe(2);
            expect(PALADIN.skillChoices.from).toContain('Religion');
            expect(PALADIN.skillChoices.from).toContain('Persuasion');
            expect(PALADIN.skillChoices.from).toContain('Athletics');
        });

        it('should have Divine Sense and Lay on Hands at level 1', () => {
            const l1Features = PALADIN.features[1];
            const featureIds = l1Features.map(f => f.id);
            expect(featureIds).toContain('divine-sense');
            expect(featureIds).toContain('lay-on-hands');
        });

        it('should have Spellcasting, Fighting Style, and Divine Smite at level 2', () => {
            const l2Features = PALADIN.features[2];
            const featureIds = l2Features.map(f => f.id);
            expect(featureIds).toContain('spellcasting-paladin');
            expect(featureIds).toContain('fighting-style-paladin');
            expect(featureIds).toContain('divine-smite');
        });

        it('should get Divine Health and Sacred Oath at level 3', () => {
            const l3Features = PALADIN.features[3];
            const featureIds = l3Features.map(f => f.id);
            expect(featureIds).toContain('divine-health');
            expect(featureIds).toContain('sacred-oath');
        });

        it('should have Oath of Devotion subclass at level 3', () => {
            expect(PALADIN.subclassLevel).toBe(3);
            expect(PALADIN.subclasses).toHaveLength(1);
            expect(PALADIN.subclasses[0].id).toBe('oath-of-devotion');
        });

        it('should have spellcasting with Charisma ability', () => {
            expect(PALADIN.spellcasting).toBeDefined();
            expect(PALADIN.spellcasting?.ability).toBe('charisma');
        });

        it('should be a prepared-spell caster (half level formula)', () => {
            expect(PALADIN.spellcasting?.preparedSpells).toBeDefined();
            expect(PALADIN.spellcasting?.preparedSpells?.formula).toBe('CHA_MOD + HALF_LEVEL');
            expect(PALADIN.spellcasting?.spellsKnown).toBeUndefined();
        });

        it('should NOT have cantrips (half caster)', () => {
            expect(PALADIN.spellcasting?.cantripsKnown[1]).toBe(0);
            expect(PALADIN.spellcasting?.cantripsKnown[2]).toBe(0);
            expect(PALADIN.spellcasting?.cantripsKnown[3]).toBe(0);
        });

        it('should NOT have ritual casting', () => {
            expect(PALADIN.spellcasting?.ritualCasting).toBe(false);
        });

        it('should use half-caster spell slot progression', () => {
            const slots = PALADIN.spellcasting?.spellSlots;
            // Level 1: No slots (spellcasting starts at L2)
            expect(slots?.[1][0]).toBe(0);
            // Level 2: 2 1st-level slots
            expect(slots?.[2][0]).toBe(2);
            // Level 3: 3 1st-level slots
            expect(slots?.[3][0]).toBe(3);
        });
    });

    describe('Oath of Devotion subclass', () => {
        const oathOfDevotion = PALADIN.subclasses[0];

        it('should have correct basic properties', () => {
            expect(oathOfDevotion.id).toBe('oath-of-devotion');
            expect(oathOfDevotion.name).toBe('Oath of Devotion');
            expect(oathOfDevotion.className).toBe('paladin');
        });

        it('should grant Channel Divinity at level 3', () => {
            const l3Features = oathOfDevotion.features[3];
            expect(l3Features).toBeDefined();
            const featureIds = l3Features?.map(f => f.id);
            expect(featureIds).toContain('channel-divinity-devotion');
        });

        it('should grant oath spells (Protection from Evil/Good, Sanctuary)', () => {
            expect(oathOfDevotion.spellsGranted).toBeDefined();
            expect(oathOfDevotion.spellsGranted?.[3]).toContain('protection-from-evil-and-good');
            expect(oathOfDevotion.spellsGranted?.[3]).toContain('sanctuary');
        });
    });

    // ==========================================================================
    // RANGER TESTS (HALF CASTER)
    // ==========================================================================

    describe('Ranger class', () => {
        it('should have correct basic properties', () => {
            expect(RANGER.id).toBe('ranger');
            expect(RANGER.name).toBe('Ranger');
            expect(RANGER.hitDie).toBe(10);
            expect(RANGER.source).toBe('SRD');
        });

        it('should have DEX and WIS as primary abilities', () => {
            expect(RANGER.primaryAbility).toContain('dexterity');
            expect(RANGER.primaryAbility).toContain('wisdom');
        });

        it('should save on STR and DEX', () => {
            expect(RANGER.savingThrows).toContain('strength');
            expect(RANGER.savingThrows).toContain('dexterity');
        });

        it('should have medium armor and shield proficiency', () => {
            expect(RANGER.armorProficiencies).toContain('medium armor');
            expect(RANGER.armorProficiencies).toContain('shields');
            expect(RANGER.armorProficiencies).not.toContain('heavy armor');
        });

        it('should have martial weapon proficiency', () => {
            expect(RANGER.weaponProficiencies).toContain('martial weapons');
        });

        it('should choose 3 skills from ranger list', () => {
            expect(RANGER.skillChoices.choose).toBe(3);
            expect(RANGER.skillChoices.from).toContain('Stealth');
            expect(RANGER.skillChoices.from).toContain('Survival');
            expect(RANGER.skillChoices.from).toContain('Nature');
            expect(RANGER.skillChoices.from).toContain('Perception');
        });

        it('should have Favored Enemy and Natural Explorer at level 1', () => {
            const l1Features = RANGER.features[1];
            const featureIds = l1Features.map(f => f.id);
            expect(featureIds).toContain('favored-enemy');
            expect(featureIds).toContain('natural-explorer');
        });

        it('should have Spellcasting and Fighting Style at level 2', () => {
            const l2Features = RANGER.features[2];
            const featureIds = l2Features.map(f => f.id);
            expect(featureIds).toContain('spellcasting-ranger');
            expect(featureIds).toContain('fighting-style-ranger');
        });

        it('should get Ranger Archetype and Primeval Awareness at level 3', () => {
            const l3Features = RANGER.features[3];
            const featureIds = l3Features.map(f => f.id);
            expect(featureIds).toContain('ranger-archetype');
            expect(featureIds).toContain('primeval-awareness');
        });

        it('should have Hunter subclass at level 3', () => {
            expect(RANGER.subclassLevel).toBe(3);
            expect(RANGER.subclasses).toHaveLength(1);
            expect(RANGER.subclasses[0].id).toBe('hunter');
        });

        it('should have spellcasting with Wisdom ability', () => {
            expect(RANGER.spellcasting).toBeDefined();
            expect(RANGER.spellcasting?.ability).toBe('wisdom');
        });

        it('should be a known-spell caster (like sorcerer)', () => {
            expect(RANGER.spellcasting?.spellsKnown).toBeDefined();
            expect(RANGER.spellcasting?.preparedSpells).toBeUndefined();
        });

        it('should have correct spells known at levels 1-3', () => {
            expect(RANGER.spellcasting?.spellsKnown?.[1]).toBe(0); // No spells at L1
            expect(RANGER.spellcasting?.spellsKnown?.[2]).toBe(2);
            expect(RANGER.spellcasting?.spellsKnown?.[3]).toBe(3);
        });

        it('should NOT have cantrips (half caster)', () => {
            expect(RANGER.spellcasting?.cantripsKnown[1]).toBe(0);
            expect(RANGER.spellcasting?.cantripsKnown[2]).toBe(0);
            expect(RANGER.spellcasting?.cantripsKnown[3]).toBe(0);
        });

        it('should NOT have ritual casting', () => {
            expect(RANGER.spellcasting?.ritualCasting).toBe(false);
        });

        it('should use half-caster spell slot progression', () => {
            const slots = RANGER.spellcasting?.spellSlots;
            // Level 1: No slots (spellcasting starts at L2)
            expect(slots?.[1][0]).toBe(0);
            // Level 2: 2 1st-level slots
            expect(slots?.[2][0]).toBe(2);
            // Level 3: 3 1st-level slots
            expect(slots?.[3][0]).toBe(3);
        });
    });

    describe('Hunter subclass', () => {
        const hunter = RANGER.subclasses[0];

        it('should have correct basic properties', () => {
            expect(hunter.id).toBe('hunter');
            expect(hunter.name).toBe('Hunter');
            expect(hunter.className).toBe('ranger');
        });

        it('should grant Hunter\'s Prey at level 3', () => {
            const l3Features = hunter.features[3];
            expect(l3Features).toBeDefined();
            const featureIds = l3Features?.map(f => f.id);
            expect(featureIds).toContain('hunters-prey');
        });
    });

    // ==========================================================================
    // SORCERER TESTS (FULL CASTER - L1 SUBCLASS)
    // ==========================================================================

    describe('Sorcerer class', () => {
        it('should have correct basic properties', () => {
            expect(SORCERER.id).toBe('sorcerer');
            expect(SORCERER.name).toBe('Sorcerer');
            expect(SORCERER.hitDie).toBe(6);
            expect(SORCERER.source).toBe('SRD');
        });

        it('should have CHA as primary ability', () => {
            expect(SORCERER.primaryAbility).toContain('charisma');
        });

        it('should save on CON and CHA', () => {
            expect(SORCERER.savingThrows).toContain('constitution');
            expect(SORCERER.savingThrows).toContain('charisma');
        });

        it('should have NO armor proficiency', () => {
            expect(SORCERER.armorProficiencies).toHaveLength(0);
        });

        it('should have limited weapon proficiencies', () => {
            expect(SORCERER.weaponProficiencies).toContain('daggers');
            expect(SORCERER.weaponProficiencies).toContain('light crossbows');
            expect(SORCERER.weaponProficiencies).not.toContain('martial weapons');
        });

        it('should choose 2 skills from sorcerer list', () => {
            expect(SORCERER.skillChoices.choose).toBe(2);
            expect(SORCERER.skillChoices.from).toContain('Arcana');
            expect(SORCERER.skillChoices.from).toContain('Persuasion');
        });

        it('should have Spellcasting and Sorcerous Origin at level 1', () => {
            const l1Features = SORCERER.features[1];
            const featureIds = l1Features.map(f => f.id);
            expect(featureIds).toContain('spellcasting-sorcerer');
            expect(featureIds).toContain('sorcerous-origin');
        });

        it('should have Font of Magic at level 2', () => {
            const l2Features = SORCERER.features[2];
            const featureIds = l2Features.map(f => f.id);
            expect(featureIds).toContain('font-of-magic');
        });

        it('should have Metamagic at level 3', () => {
            const l3Features = SORCERER.features[3];
            const featureIds = l3Features.map(f => f.id);
            expect(featureIds).toContain('metamagic');
        });

        it('should choose subclass (Sorcerous Origin) at Level 1!', () => {
            expect(SORCERER.subclassLevel).toBe(1);
            expect(SORCERER.subclasses).toHaveLength(1);
            expect(SORCERER.subclasses[0].id).toBe('draconic-bloodline');
        });

        it('should have spellcasting with Charisma ability', () => {
            expect(SORCERER.spellcasting).toBeDefined();
            expect(SORCERER.spellcasting?.ability).toBe('charisma');
        });

        it('should be a known-spell caster (no preparedSpells)', () => {
            expect(SORCERER.spellcasting?.spellsKnown).toBeDefined();
            expect(SORCERER.spellcasting?.preparedSpells).toBeUndefined();
        });

        it('should have 4 cantrips at all levels 1-3', () => {
            expect(SORCERER.spellcasting?.cantripsKnown[1]).toBe(4);
            expect(SORCERER.spellcasting?.cantripsKnown[2]).toBe(4);
            expect(SORCERER.spellcasting?.cantripsKnown[3]).toBe(4);
        });

        it('should have correct spells known at levels 1-3', () => {
            expect(SORCERER.spellcasting?.spellsKnown?.[1]).toBe(2);
            expect(SORCERER.spellcasting?.spellsKnown?.[2]).toBe(3);
            expect(SORCERER.spellcasting?.spellsKnown?.[3]).toBe(4);
        });

        it('should NOT have ritual casting', () => {
            expect(SORCERER.spellcasting?.ritualCasting).toBe(false);
        });

        it('should use full caster spell slot progression', () => {
            expect(SORCERER.spellcasting?.spellSlots).toBe(FULL_CASTER_SPELL_SLOTS);
        });
    });

    describe('Draconic Bloodline subclass', () => {
        const draconicBloodline = SORCERER.subclasses[0];

        it('should have correct basic properties', () => {
            expect(draconicBloodline.id).toBe('draconic-bloodline');
            expect(draconicBloodline.name).toBe('Draconic Bloodline');
            expect(draconicBloodline.className).toBe('sorcerer');
        });

        it('should grant features at level 1 (not level 3!)', () => {
            const l1Features = draconicBloodline.features[1];
            expect(l1Features).toBeDefined();
            const featureIds = l1Features?.map(f => f.id);
            expect(featureIds).toContain('dragon-ancestor');
            expect(featureIds).toContain('draconic-resilience');
        });
    });

    // ==========================================================================
    // WARLOCK TESTS (PACT MAGIC - DIFFERENT SYSTEM!)
    // ==========================================================================

    describe('Warlock class', () => {
        it('should have correct basic properties', () => {
            expect(WARLOCK.id).toBe('warlock');
            expect(WARLOCK.name).toBe('Warlock');
            expect(WARLOCK.hitDie).toBe(8);
            expect(WARLOCK.source).toBe('SRD');
        });

        it('should have CHA as primary ability', () => {
            expect(WARLOCK.primaryAbility).toContain('charisma');
        });

        it('should save on WIS and CHA', () => {
            expect(WARLOCK.savingThrows).toContain('wisdom');
            expect(WARLOCK.savingThrows).toContain('charisma');
        });

        it('should have light armor proficiency only', () => {
            expect(WARLOCK.armorProficiencies).toContain('light armor');
            expect(WARLOCK.armorProficiencies).not.toContain('medium armor');
        });

        it('should have simple weapons only', () => {
            expect(WARLOCK.weaponProficiencies).toContain('simple weapons');
            expect(WARLOCK.weaponProficiencies).not.toContain('martial weapons');
        });

        it('should choose 2 skills from warlock list', () => {
            expect(WARLOCK.skillChoices.choose).toBe(2);
            expect(WARLOCK.skillChoices.from).toContain('Arcana');
            expect(WARLOCK.skillChoices.from).toContain('Deception');
            expect(WARLOCK.skillChoices.from).toContain('Investigation');
        });

        it('should have Otherworldly Patron and Pact Magic at level 1', () => {
            const l1Features = WARLOCK.features[1];
            const featureIds = l1Features.map(f => f.id);
            expect(featureIds).toContain('otherworldly-patron');
            expect(featureIds).toContain('pact-magic');
        });

        it('should have Eldritch Invocations at level 2', () => {
            const l2Features = WARLOCK.features[2];
            const featureIds = l2Features.map(f => f.id);
            expect(featureIds).toContain('eldritch-invocations');
        });

        it('should have Pact Boon at level 3', () => {
            const l3Features = WARLOCK.features[3];
            const featureIds = l3Features.map(f => f.id);
            expect(featureIds).toContain('pact-boon');
        });

        it('should choose subclass (Otherworldly Patron) at Level 1!', () => {
            expect(WARLOCK.subclassLevel).toBe(1);
            expect(WARLOCK.subclasses).toHaveLength(1);
            expect(WARLOCK.subclasses[0].id).toBe('the-fiend');
        });

        it('should have spellcasting with Charisma ability', () => {
            expect(WARLOCK.spellcasting).toBeDefined();
            expect(WARLOCK.spellcasting?.ability).toBe('charisma');
        });

        it('should use Pact Magic system (not regular slots!)', () => {
            expect(WARLOCK.spellcasting?.pactMagic).toBe(true);
        });

        it('should be a known-spell caster', () => {
            expect(WARLOCK.spellcasting?.spellsKnown).toBeDefined();
            expect(WARLOCK.spellcasting?.preparedSpells).toBeUndefined();
        });

        it('should have 2 cantrips at all levels 1-3', () => {
            expect(WARLOCK.spellcasting?.cantripsKnown[1]).toBe(2);
            expect(WARLOCK.spellcasting?.cantripsKnown[2]).toBe(2);
            expect(WARLOCK.spellcasting?.cantripsKnown[3]).toBe(2);
        });

        it('should have correct spells known at levels 1-3', () => {
            expect(WARLOCK.spellcasting?.spellsKnown?.[1]).toBe(2);
            expect(WARLOCK.spellcasting?.spellsKnown?.[2]).toBe(3);
            expect(WARLOCK.spellcasting?.spellsKnown?.[3]).toBe(4);
        });

        it('should NOT have ritual casting (without invocation)', () => {
            expect(WARLOCK.spellcasting?.ritualCasting).toBe(false);
        });
    });

    describe('The Fiend patron subclass', () => {
        const theFiend = WARLOCK.subclasses[0];

        it('should have correct basic properties', () => {
            expect(theFiend.id).toBe('the-fiend');
            expect(theFiend.name).toBe('The Fiend');
            expect(theFiend.className).toBe('warlock');
        });

        it('should grant Dark One\'s Blessing at level 1', () => {
            const l1Features = theFiend.features[1];
            expect(l1Features).toBeDefined();
            const featureIds = l1Features?.map(f => f.id);
            expect(featureIds).toContain('dark-ones-blessing');
        });

        it('should have expanded spell list', () => {
            expect(theFiend.expandedSpellList).toBeDefined();
            expect(theFiend.expandedSpellList?.[1]).toContain('burning-hands');
            expect(theFiend.expandedSpellList?.[1]).toContain('command');
        });
    });

    describe('Pact Magic spell slot progression', () => {
        it('should have 1 slot at level 1 (1st-level)', () => {
            expect(PACT_MAGIC_SLOTS[1].slotCount).toBe(1);
            expect(PACT_MAGIC_SLOTS[1].slotLevel).toBe(1);
        });

        it('should have 2 slots at level 2 (1st-level)', () => {
            expect(PACT_MAGIC_SLOTS[2].slotCount).toBe(2);
            expect(PACT_MAGIC_SLOTS[2].slotLevel).toBe(1);
        });

        it('should upgrade to 2nd-level slots at level 3', () => {
            expect(PACT_MAGIC_SLOTS[3].slotCount).toBe(2);
            expect(PACT_MAGIC_SLOTS[3].slotLevel).toBe(2);
        });
    });

    // ==========================================================================
    // WIZARD TESTS (FULL CASTER - SPELLBOOK)
    // ==========================================================================

    describe('Wizard class', () => {
        it('should have correct basic properties', () => {
            expect(WIZARD.id).toBe('wizard');
            expect(WIZARD.name).toBe('Wizard');
            expect(WIZARD.hitDie).toBe(6);
            expect(WIZARD.source).toBe('SRD');
        });

        it('should have INT as primary ability', () => {
            expect(WIZARD.primaryAbility).toContain('intelligence');
        });

        it('should save on INT and WIS', () => {
            expect(WIZARD.savingThrows).toContain('intelligence');
            expect(WIZARD.savingThrows).toContain('wisdom');
        });

        it('should have NO armor proficiency', () => {
            expect(WIZARD.armorProficiencies).toHaveLength(0);
        });

        it('should have limited weapon proficiencies (same as sorcerer)', () => {
            expect(WIZARD.weaponProficiencies).toContain('daggers');
            expect(WIZARD.weaponProficiencies).toContain('quarterstaffs');
            expect(WIZARD.weaponProficiencies).toContain('light crossbows');
        });

        it('should choose 2 skills from wizard list', () => {
            expect(WIZARD.skillChoices.choose).toBe(2);
            expect(WIZARD.skillChoices.from).toContain('Arcana');
            expect(WIZARD.skillChoices.from).toContain('History');
            expect(WIZARD.skillChoices.from).toContain('Investigation');
        });

        it('should have Spellcasting and Arcane Recovery at level 1', () => {
            const l1Features = WIZARD.features[1];
            const featureIds = l1Features.map(f => f.id);
            expect(featureIds).toContain('spellcasting-wizard');
            expect(featureIds).toContain('arcane-recovery');
        });

        it('should have Arcane Tradition at level 2', () => {
            const l2Features = WIZARD.features[2];
            const featureIds = l2Features.map(f => f.id);
            expect(featureIds).toContain('arcane-tradition');
        });

        it('should have subclass at level 2 (not 1 or 3)', () => {
            expect(WIZARD.subclassLevel).toBe(2);
            expect(WIZARD.subclasses).toHaveLength(1);
            expect(WIZARD.subclasses[0].id).toBe('school-of-evocation');
        });

        it('should have spellcasting with Intelligence ability', () => {
            expect(WIZARD.spellcasting).toBeDefined();
            expect(WIZARD.spellcasting?.ability).toBe('intelligence');
        });

        it('should be a prepared-spell caster (prepares from spellbook)', () => {
            expect(WIZARD.spellcasting?.preparedSpells).toBeDefined();
            expect(WIZARD.spellcasting?.preparedSpells?.formula).toBe('INT_MOD + LEVEL');
            expect(WIZARD.spellcasting?.spellsKnown).toBeUndefined();
        });

        it('should have 3 cantrips at all levels 1-3', () => {
            expect(WIZARD.spellcasting?.cantripsKnown[1]).toBe(3);
            expect(WIZARD.spellcasting?.cantripsKnown[2]).toBe(3);
            expect(WIZARD.spellcasting?.cantripsKnown[3]).toBe(3);
        });

        it('should have ritual casting (from spellbook)', () => {
            expect(WIZARD.spellcasting?.ritualCasting).toBe(true);
        });

        it('should have spellbook with starting spells and spells per level', () => {
            expect(WIZARD.spellcasting?.spellbook).toBeDefined();
            expect(WIZARD.spellcasting?.spellbook?.startingSpells).toBe(6);
            expect(WIZARD.spellcasting?.spellbook?.spellsPerLevel).toBe(2);
        });

        it('should use full caster spell slot progression', () => {
            expect(WIZARD.spellcasting?.spellSlots).toBe(FULL_CASTER_SPELL_SLOTS);
        });
    });

    describe('School of Evocation subclass', () => {
        const evocation = WIZARD.subclasses[0];

        it('should have correct basic properties', () => {
            expect(evocation.id).toBe('school-of-evocation');
            expect(evocation.name).toBe('School of Evocation');
            expect(evocation.className).toBe('wizard');
        });

        it('should grant features at level 2', () => {
            const l2Features = evocation.features[2];
            expect(l2Features).toBeDefined();
            const featureIds = l2Features?.map(f => f.id);
            expect(featureIds).toContain('evocation-savant');
            expect(featureIds).toContain('sculpt-spells');
        });
    });

    // ==========================================================================
    // FULL CASTER SPELL SLOTS TESTS
    // ==========================================================================

    describe('Full Caster Spell Slots', () => {
        it('should have correct slots at level 1', () => {
            const slots = FULL_CASTER_SPELL_SLOTS[1];
            expect(slots[0]).toBe(2); // 1st-level slots
            expect(slots[1]).toBe(0); // 2nd-level slots
        });

        it('should have correct slots at level 2', () => {
            const slots = FULL_CASTER_SPELL_SLOTS[2];
            expect(slots[0]).toBe(3); // 1st-level slots
            expect(slots[1]).toBe(0); // 2nd-level slots
        });

        it('should have correct slots at level 3', () => {
            const slots = FULL_CASTER_SPELL_SLOTS[3];
            expect(slots[0]).toBe(4); // 1st-level slots
            expect(slots[1]).toBe(2); // 2nd-level slots
            expect(slots[2]).toBe(0); // 3rd-level slots
        });

        it('should have 9 spell levels in slot array', () => {
            Object.values(FULL_CASTER_SPELL_SLOTS).forEach(slots => {
                expect(slots).toHaveLength(9);
            });
        });
    });

    // ==========================================================================
    // HELPER FUNCTION TESTS
    // ==========================================================================

    describe('getClassById', () => {
        it('should find martial class by ID', () => {
            expect(getClassById('barbarian')).toBe(BARBARIAN);
            expect(getClassById('fighter')).toBe(FIGHTER);
            expect(getClassById('monk')).toBe(MONK);
            expect(getClassById('rogue')).toBe(ROGUE);
        });

        it('should find half-caster class by ID', () => {
            expect(getClassById('paladin')).toBe(PALADIN);
            expect(getClassById('ranger')).toBe(RANGER);
        });

        it('should find full caster class by ID', () => {
            expect(getClassById('bard')).toBe(BARD);
            expect(getClassById('cleric')).toBe(CLERIC);
            expect(getClassById('druid')).toBe(DRUID);
            expect(getClassById('sorcerer')).toBe(SORCERER);
            expect(getClassById('warlock')).toBe(WARLOCK);
            expect(getClassById('wizard')).toBe(WIZARD);
        });

        it('should return undefined for unknown class', () => {
            expect(getClassById('artificer')).toBeUndefined();
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


    describe('getMartialClasses', () => {
        it('should return all 4 martial classes', () => {
            const martial = getMartialClasses();
            expect(martial).toHaveLength(4);
            expect(martial.map(c => c.id)).toEqual(['barbarian', 'fighter', 'monk', 'rogue']);
        });

        it('should NOT include half-casters', () => {
            const martial = getMartialClasses();
            expect(martial.map(c => c.id)).not.toContain('paladin');
            expect(martial.map(c => c.id)).not.toContain('ranger');
        });
    });

    describe('getSpellcasterClasses', () => {
        it('should return all 8 caster classes (6 full + 2 half)', () => {
            const casters = getSpellcasterClasses();
            expect(casters).toHaveLength(8);
        });

        it('should include full caster classes', () => {
            const casters = getSpellcasterClasses();
            expect(casters.map(c => c.id)).toContain('bard');
            expect(casters.map(c => c.id)).toContain('cleric');
            expect(casters.map(c => c.id)).toContain('druid');
            expect(casters.map(c => c.id)).toContain('sorcerer');
            expect(casters.map(c => c.id)).toContain('warlock');
            expect(casters.map(c => c.id)).toContain('wizard');
        });

        it('should include half-caster classes', () => {
            const casters = getSpellcasterClasses();
            expect(casters.map(c => c.id)).toContain('paladin');
            expect(casters.map(c => c.id)).toContain('ranger');
        });
    });

    describe('isSpellcaster', () => {
        it('should return true for full caster classes', () => {
            expect(isSpellcaster('bard')).toBe(true);
            expect(isSpellcaster('cleric')).toBe(true);
            expect(isSpellcaster('druid')).toBe(true);
            expect(isSpellcaster('sorcerer')).toBe(true);
            expect(isSpellcaster('warlock')).toBe(true);
            expect(isSpellcaster('wizard')).toBe(true);
        });

        it('should return true for half-caster classes', () => {
            expect(isSpellcaster('paladin')).toBe(true);
            expect(isSpellcaster('ranger')).toBe(true);
        });

        it('should return false for martial classes', () => {
            expect(isSpellcaster('barbarian')).toBe(false);
            expect(isSpellcaster('fighter')).toBe(false);
            expect(isSpellcaster('monk')).toBe(false);
            expect(isSpellcaster('rogue')).toBe(false);
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

        it('all classes should have features defined for levels 1, 2, and 3', () => {
            SRD_CLASSES.forEach(cls => {
                expect(cls.features[1]).toBeDefined();
                expect(cls.features[1].length).toBeGreaterThan(0);
                expect(cls.features[2]).toBeDefined();
                // Some classes (Cleric, Druid) get level 2/3 features from subclass
                // So we just check that the features object exists
                expect(cls.features[3]).toBeDefined();
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



