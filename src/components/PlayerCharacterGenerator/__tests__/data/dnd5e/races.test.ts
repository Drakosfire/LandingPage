/**
 * D&D 5e races data tests
 * 
 * Tests for all SRD race data integrity and helper functions.
 * 
 * @module CharacterGenerator/__tests__/data/dnd5e
 */

import '../../setup';
import { 
    SRD_RACES, 
    HILL_DWARF,
    MOUNTAIN_DWARF,
    HIGH_ELF,
    WOOD_ELF,
    LIGHTFOOT_HALFLING,
    STOUT_HALFLING,
    HUMAN,
    DRAGONBORN,
    FOREST_GNOME,
    ROCK_GNOME,
    HALF_ELF,
    HALF_ORC,
    TIEFLING,
    DRACONIC_ANCESTRIES,
    getRaceById,
    getBaseRaces,
    getSubraces,
    getUniqueBaseRaceNames
} from '../../../data/dnd5e/races';

describe('D&D 5e SRD Races', () => {
    // =========================================================================
    // DWARF RACES
    // =========================================================================
    
    describe('Hill Dwarf data', () => {
        it('should have complete Hill Dwarf data', () => {
            expect(HILL_DWARF.name).toBe('Hill Dwarf');
            expect(HILL_DWARF.id).toBe('hill-dwarf');
            expect(HILL_DWARF.baseRace).toBe('dwarf');
            expect(HILL_DWARF.size).toBe('medium');
            expect(HILL_DWARF.speed.walk).toBe(25);
        });
        
        it('should have correct ability bonuses (+2 CON, +1 WIS)', () => {
            expect(HILL_DWARF.abilityBonuses).toHaveLength(2);
            expect(HILL_DWARF.abilityBonuses).toContainEqual({ ability: 'constitution', bonus: 2 });
            expect(HILL_DWARF.abilityBonuses).toContainEqual({ ability: 'wisdom', bonus: 1 });
        });
        
        it('should have Dwarven Toughness trait', () => {
            expect(HILL_DWARF.traits.map(t => t.id)).toContain('dwarven-toughness');
        });
        
        it('should have all base dwarf traits', () => {
            expect(HILL_DWARF.traits.map(t => t.id)).toContain('darkvision');
            expect(HILL_DWARF.traits.map(t => t.id)).toContain('dwarven-resilience');
            expect(HILL_DWARF.traits.map(t => t.id)).toContain('dwarven-combat-training');
            expect(HILL_DWARF.traits.map(t => t.id)).toContain('stonecunning');
        });
        
        it('should have correct languages', () => {
            expect(HILL_DWARF.languages).toContain('Common');
            expect(HILL_DWARF.languages).toContain('Dwarvish');
        });
    });
    
    describe('Mountain Dwarf data', () => {
        it('should have complete Mountain Dwarf data', () => {
            expect(MOUNTAIN_DWARF.name).toBe('Mountain Dwarf');
            expect(MOUNTAIN_DWARF.id).toBe('mountain-dwarf');
            expect(MOUNTAIN_DWARF.baseRace).toBe('dwarf');
            expect(MOUNTAIN_DWARF.size).toBe('medium');
            expect(MOUNTAIN_DWARF.speed.walk).toBe(25);
        });
        
        it('should have correct ability bonuses (+2 CON, +2 STR)', () => {
            expect(MOUNTAIN_DWARF.abilityBonuses).toHaveLength(2);
            expect(MOUNTAIN_DWARF.abilityBonuses).toContainEqual({ ability: 'constitution', bonus: 2 });
            expect(MOUNTAIN_DWARF.abilityBonuses).toContainEqual({ ability: 'strength', bonus: 2 });
        });
        
        it('should have Dwarven Armor Training trait', () => {
            expect(MOUNTAIN_DWARF.traits.map(t => t.id)).toContain('dwarven-armor-training');
        });
    });

    // =========================================================================
    // ELF RACES
    // =========================================================================
    
    describe('High Elf data', () => {
        it('should have complete High Elf data', () => {
            expect(HIGH_ELF.name).toBe('High Elf');
            expect(HIGH_ELF.id).toBe('high-elf');
            expect(HIGH_ELF.baseRace).toBe('elf');
            expect(HIGH_ELF.size).toBe('medium');
            expect(HIGH_ELF.speed.walk).toBe(30);
        });
        
        it('should have correct ability bonuses (+2 DEX, +1 INT)', () => {
            expect(HIGH_ELF.abilityBonuses).toHaveLength(2);
            expect(HIGH_ELF.abilityBonuses).toContainEqual({ ability: 'dexterity', bonus: 2 });
            expect(HIGH_ELF.abilityBonuses).toContainEqual({ ability: 'intelligence', bonus: 1 });
        });
        
        it('should have cantrip and extra language traits', () => {
            expect(HIGH_ELF.traits.map(t => t.id)).toContain('cantrip');
            expect(HIGH_ELF.traits.map(t => t.id)).toContain('extra-language');
            expect(HIGH_ELF.languageChoices).toBe(1);
        });
        
        it('should have base elf traits', () => {
            expect(HIGH_ELF.traits.map(t => t.id)).toContain('darkvision');
            expect(HIGH_ELF.traits.map(t => t.id)).toContain('fey-ancestry');
            expect(HIGH_ELF.traits.map(t => t.id)).toContain('trance');
        });
    });
    
    describe('Wood Elf data', () => {
        it('should have 35 ft speed', () => {
            expect(WOOD_ELF.speed.walk).toBe(35);
        });
        
        it('should have correct ability bonuses (+2 DEX, +1 WIS)', () => {
            expect(WOOD_ELF.abilityBonuses).toContainEqual({ ability: 'dexterity', bonus: 2 });
            expect(WOOD_ELF.abilityBonuses).toContainEqual({ ability: 'wisdom', bonus: 1 });
        });
        
        it('should have Fleet of Foot and Mask of the Wild traits', () => {
            expect(WOOD_ELF.traits.map(t => t.id)).toContain('fleet-of-foot');
            expect(WOOD_ELF.traits.map(t => t.id)).toContain('mask-of-the-wild');
        });
    });

    // =========================================================================
    // HALFLING RACES
    // =========================================================================
    
    describe('Lightfoot Halfling data', () => {
        it('should be small size with 25 ft speed', () => {
            expect(LIGHTFOOT_HALFLING.size).toBe('small');
            expect(LIGHTFOOT_HALFLING.speed.walk).toBe(25);
        });
        
        it('should have correct ability bonuses (+2 DEX, +1 CHA)', () => {
            expect(LIGHTFOOT_HALFLING.abilityBonuses).toContainEqual({ ability: 'dexterity', bonus: 2 });
            expect(LIGHTFOOT_HALFLING.abilityBonuses).toContainEqual({ ability: 'charisma', bonus: 1 });
        });
        
        it('should have Naturally Stealthy trait', () => {
            expect(LIGHTFOOT_HALFLING.traits.map(t => t.id)).toContain('naturally-stealthy');
        });
        
        it('should have base halfling traits', () => {
            expect(LIGHTFOOT_HALFLING.traits.map(t => t.id)).toContain('lucky');
            expect(LIGHTFOOT_HALFLING.traits.map(t => t.id)).toContain('brave');
            expect(LIGHTFOOT_HALFLING.traits.map(t => t.id)).toContain('halfling-nimbleness');
        });
    });
    
    describe('Stout Halfling data', () => {
        it('should have correct ability bonuses (+2 DEX, +1 CON)', () => {
            expect(STOUT_HALFLING.abilityBonuses).toContainEqual({ ability: 'dexterity', bonus: 2 });
            expect(STOUT_HALFLING.abilityBonuses).toContainEqual({ ability: 'constitution', bonus: 1 });
        });
        
        it('should have Stout Resilience trait', () => {
            expect(STOUT_HALFLING.traits.map(t => t.id)).toContain('stout-resilience');
        });
    });

    // =========================================================================
    // HUMAN
    // =========================================================================
    
    describe('Human data', () => {
        it('should have no baseRace (no subraces)', () => {
            expect(HUMAN.baseRace).toBeUndefined();
        });
        
        it('should have +1 to ALL ability scores', () => {
            expect(HUMAN.abilityBonuses).toHaveLength(6);
            expect(HUMAN.abilityBonuses).toContainEqual({ ability: 'strength', bonus: 1 });
            expect(HUMAN.abilityBonuses).toContainEqual({ ability: 'dexterity', bonus: 1 });
            expect(HUMAN.abilityBonuses).toContainEqual({ ability: 'constitution', bonus: 1 });
            expect(HUMAN.abilityBonuses).toContainEqual({ ability: 'intelligence', bonus: 1 });
            expect(HUMAN.abilityBonuses).toContainEqual({ ability: 'wisdom', bonus: 1 });
            expect(HUMAN.abilityBonuses).toContainEqual({ ability: 'charisma', bonus: 1 });
        });
        
        it('should have no racial traits (SRD)', () => {
            expect(HUMAN.traits).toHaveLength(0);
        });
        
        it('should have 1 extra language choice', () => {
            expect(HUMAN.languageChoices).toBe(1);
        });
    });

    // =========================================================================
    // DRAGONBORN
    // =========================================================================
    
    describe('Dragonborn data', () => {
        it('should have correct ability bonuses (+2 STR, +1 CHA)', () => {
            expect(DRAGONBORN.abilityBonuses).toContainEqual({ ability: 'strength', bonus: 2 });
            expect(DRAGONBORN.abilityBonuses).toContainEqual({ ability: 'charisma', bonus: 1 });
        });
        
        it('should have breath weapon and damage resistance traits', () => {
            expect(DRAGONBORN.traits.map(t => t.id)).toContain('draconic-ancestry');
            expect(DRAGONBORN.traits.map(t => t.id)).toContain('breath-weapon');
            expect(DRAGONBORN.traits.map(t => t.id)).toContain('damage-resistance');
        });
        
        it('should speak Common and Draconic', () => {
            expect(DRAGONBORN.languages).toContain('Common');
            expect(DRAGONBORN.languages).toContain('Draconic');
        });
    });
    
    describe('Draconic Ancestries', () => {
        it('should have 10 ancestry options', () => {
            expect(DRACONIC_ANCESTRIES).toHaveLength(10);
        });
        
        it('should include all chromatic dragons', () => {
            const dragons = DRACONIC_ANCESTRIES.map(a => a.dragon);
            expect(dragons).toContain('Black');
            expect(dragons).toContain('Blue');
            expect(dragons).toContain('Green');
            expect(dragons).toContain('Red');
            expect(dragons).toContain('White');
        });
        
        it('should include all metallic dragons', () => {
            const dragons = DRACONIC_ANCESTRIES.map(a => a.dragon);
            expect(dragons).toContain('Brass');
            expect(dragons).toContain('Bronze');
            expect(dragons).toContain('Copper');
            expect(dragons).toContain('Gold');
            expect(dragons).toContain('Silver');
        });
    });

    // =========================================================================
    // GNOME RACES
    // =========================================================================
    
    describe('Forest Gnome data', () => {
        it('should be small size', () => {
            expect(FOREST_GNOME.size).toBe('small');
        });
        
        it('should have correct ability bonuses (+2 INT, +1 DEX)', () => {
            expect(FOREST_GNOME.abilityBonuses).toContainEqual({ ability: 'intelligence', bonus: 2 });
            expect(FOREST_GNOME.abilityBonuses).toContainEqual({ ability: 'dexterity', bonus: 1 });
        });
        
        it('should have Natural Illusionist and Speak with Small Beasts', () => {
            expect(FOREST_GNOME.traits.map(t => t.id)).toContain('natural-illusionist');
            expect(FOREST_GNOME.traits.map(t => t.id)).toContain('speak-with-small-beasts');
        });
    });
    
    describe('Rock Gnome data', () => {
        it('should have correct ability bonuses (+2 INT, +1 CON)', () => {
            expect(ROCK_GNOME.abilityBonuses).toContainEqual({ ability: 'intelligence', bonus: 2 });
            expect(ROCK_GNOME.abilityBonuses).toContainEqual({ ability: 'constitution', bonus: 1 });
        });
        
        it('should have Artificer\'s Lore and Tinker traits', () => {
            expect(ROCK_GNOME.traits.map(t => t.id)).toContain('artificers-lore');
            expect(ROCK_GNOME.traits.map(t => t.id)).toContain('tinker');
        });
    });

    // =========================================================================
    // HALF-ELF
    // =========================================================================
    
    describe('Half-Elf data', () => {
        it('should have +2 CHA as fixed bonus', () => {
            expect(HALF_ELF.abilityBonuses).toContainEqual({ ability: 'charisma', bonus: 2 });
        });
        
        it('should have ability score choice trait for +1 to two others', () => {
            expect(HALF_ELF.traits.map(t => t.id)).toContain('ability-score-increase-choice');
        });
        
        it('should have Skill Versatility trait', () => {
            expect(HALF_ELF.traits.map(t => t.id)).toContain('skill-versatility');
        });
        
        it('should have Fey Ancestry from elven heritage', () => {
            expect(HALF_ELF.traits.map(t => t.id)).toContain('fey-ancestry');
        });
        
        it('should have 1 extra language choice', () => {
            expect(HALF_ELF.languageChoices).toBe(1);
        });
    });

    // =========================================================================
    // HALF-ORC
    // =========================================================================
    
    describe('Half-Orc data', () => {
        it('should have correct ability bonuses (+2 STR, +1 CON)', () => {
            expect(HALF_ORC.abilityBonuses).toContainEqual({ ability: 'strength', bonus: 2 });
            expect(HALF_ORC.abilityBonuses).toContainEqual({ ability: 'constitution', bonus: 1 });
        });
        
        it('should have Menacing, Relentless Endurance, and Savage Attacks', () => {
            expect(HALF_ORC.traits.map(t => t.id)).toContain('menacing');
            expect(HALF_ORC.traits.map(t => t.id)).toContain('relentless-endurance');
            expect(HALF_ORC.traits.map(t => t.id)).toContain('savage-attacks');
        });
        
        it('should speak Common and Orc', () => {
            expect(HALF_ORC.languages).toContain('Common');
            expect(HALF_ORC.languages).toContain('Orc');
        });
    });

    // =========================================================================
    // TIEFLING
    // =========================================================================
    
    describe('Tiefling data', () => {
        it('should have correct ability bonuses (+2 CHA, +1 INT)', () => {
            expect(TIEFLING.abilityBonuses).toContainEqual({ ability: 'charisma', bonus: 2 });
            expect(TIEFLING.abilityBonuses).toContainEqual({ ability: 'intelligence', bonus: 1 });
        });
        
        it('should have Hellish Resistance and Infernal Legacy', () => {
            expect(TIEFLING.traits.map(t => t.id)).toContain('hellish-resistance');
            expect(TIEFLING.traits.map(t => t.id)).toContain('infernal-legacy');
        });
        
        it('should speak Common and Infernal', () => {
            expect(TIEFLING.languages).toContain('Common');
            expect(TIEFLING.languages).toContain('Infernal');
        });
    });

    // =========================================================================
    // SRD_RACES ARRAY
    // =========================================================================
    
    describe('SRD_RACES array', () => {
        it('should contain all 13 SRD races/subraces', () => {
            expect(SRD_RACES).toHaveLength(13);
        });
        
        it('should have unique IDs', () => {
            const ids = SRD_RACES.map(r => r.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });
        
        it('should have all required fields for every race', () => {
            SRD_RACES.forEach(race => {
                expect(race.id).toBeDefined();
                expect(race.name).toBeDefined();
                expect(race.size).toBeDefined();
                expect(race.speed).toBeDefined();
                expect(race.speed.walk).toBeDefined();
                expect(race.abilityBonuses).toBeDefined();
                expect(Array.isArray(race.abilityBonuses)).toBe(true);
                expect(race.traits).toBeDefined();
                expect(Array.isArray(race.traits)).toBe(true);
                expect(race.languages).toBeDefined();
                expect(Array.isArray(race.languages)).toBe(true);
                expect(race.description).toBeDefined();
                expect(race.source).toBe('SRD');
            });
        });
        
        it('should have 2 dwarf subraces', () => {
            const dwarves = SRD_RACES.filter(r => r.baseRace === 'dwarf');
            expect(dwarves).toHaveLength(2);
        });
        
        it('should have 2 elf subraces', () => {
            const elves = SRD_RACES.filter(r => r.baseRace === 'elf');
            expect(elves).toHaveLength(2);
        });
        
        it('should have 2 halfling subraces', () => {
            const halflings = SRD_RACES.filter(r => r.baseRace === 'halfling');
            expect(halflings).toHaveLength(2);
        });
        
        it('should have 2 gnome subraces', () => {
            const gnomes = SRD_RACES.filter(r => r.baseRace === 'gnome');
            expect(gnomes).toHaveLength(2);
        });
        
        it('should have 5 races without subraces', () => {
            const noSubraces = SRD_RACES.filter(r => !r.baseRace);
            expect(noSubraces).toHaveLength(5);
            expect(noSubraces.map(r => r.id)).toContain('human');
            expect(noSubraces.map(r => r.id)).toContain('dragonborn');
            expect(noSubraces.map(r => r.id)).toContain('half-elf');
            expect(noSubraces.map(r => r.id)).toContain('half-orc');
            expect(noSubraces.map(r => r.id)).toContain('tiefling');
        });
    });

    // =========================================================================
    // HELPER FUNCTIONS
    // =========================================================================
    
    describe('getRaceById', () => {
        it('should find race by ID', () => {
            const race = getRaceById('hill-dwarf');
            expect(race).toBeDefined();
            expect(race?.name).toBe('Hill Dwarf');
        });
        
        it('should find all races by their IDs', () => {
            const ids = ['hill-dwarf', 'mountain-dwarf', 'high-elf', 'wood-elf', 
                        'lightfoot-halfling', 'stout-halfling', 'human', 'dragonborn',
                        'forest-gnome', 'rock-gnome', 'half-elf', 'half-orc', 'tiefling'];
            ids.forEach(id => {
                expect(getRaceById(id)).toBeDefined();
            });
        });
        
        it('should return undefined for invalid ID', () => {
            const race = getRaceById('invalid-race');
            expect(race).toBeUndefined();
        });
    });
    
    describe('getBaseRaces', () => {
        it('should return only races without baseRace', () => {
            const baseRaces = getBaseRaces();
            expect(baseRaces.every(race => !race.baseRace)).toBe(true);
        });
        
        it('should return 5 base races', () => {
            const baseRaces = getBaseRaces();
            expect(baseRaces).toHaveLength(5);
        });
    });
    
    describe('getSubraces', () => {
        it('should return 2 subraces for dwarf', () => {
            const dwarfSubraces = getSubraces('dwarf');
            expect(dwarfSubraces).toHaveLength(2);
            expect(dwarfSubraces.every(race => race.baseRace === 'dwarf')).toBe(true);
        });
        
        it('should return 2 subraces for elf', () => {
            const elfSubraces = getSubraces('elf');
            expect(elfSubraces).toHaveLength(2);
        });
        
        it('should return 2 subraces for halfling', () => {
            const halflingSubraces = getSubraces('halfling');
            expect(halflingSubraces).toHaveLength(2);
        });
        
        it('should return 2 subraces for gnome', () => {
            const gnomeSubraces = getSubraces('gnome');
            expect(gnomeSubraces).toHaveLength(2);
        });
        
        it('should return empty array for races without subraces', () => {
            expect(getSubraces('human')).toHaveLength(0);
            expect(getSubraces('dragonborn')).toHaveLength(0);
        });
        
        it('should be case-insensitive', () => {
            expect(getSubraces('DWARF')).toHaveLength(2);
            expect(getSubraces('Elf')).toHaveLength(2);
        });
    });
    
    describe('getUniqueBaseRaceNames', () => {
        it('should return all unique base race identifiers', () => {
            const baseNames = getUniqueBaseRaceNames();
            expect(baseNames).toContain('dwarf');
            expect(baseNames).toContain('elf');
            expect(baseNames).toContain('halfling');
            expect(baseNames).toContain('gnome');
            expect(baseNames).toContain('human');
            expect(baseNames).toContain('dragonborn');
            expect(baseNames).toContain('half-elf');
            expect(baseNames).toContain('half-orc');
            expect(baseNames).toContain('tiefling');
        });
    });
});
