/**
 * D&D 5e SRD Races
 * 
 * Complete race data from D&D 5e System Reference Document.
 * 
 * Phase 0: Basic structure with 1 example race (Hill Dwarf)
 * Phase 1+: Will be expanded to include all 9 SRD races + subraces
 * 
 * @module CharacterGenerator/data/dnd5e/races
 */

import { DnD5eRace } from '../../types';

/**
 * Hill Dwarf (example implementation)
 * Full SRD-compliant race data
 */
export const HILL_DWARF: DnD5eRace = {
    id: 'hill-dwarf',
    name: 'Hill Dwarf',
    baseRace: 'dwarf',
    
    size: 'medium',
    speed: {
        walk: 25  // Dwarves have 25 ft speed (not slowed by armor)
    },
    
    abilityBonuses: [
        { ability: 'constitution', bonus: 2 },  // All dwarves get +2 CON
        { ability: 'wisdom', bonus: 1 }         // Hill dwarves get +1 WIS
    ],
    
    traits: [
        {
            id: 'darkvision',
            name: 'Darkvision',
            description: 'Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.',
            type: 'passive'
        },
        {
            id: 'dwarven-resilience',
            name: 'Dwarven Resilience',
            description: 'You have advantage on saving throws against poison, and you have resistance against poison damage.',
            type: 'passive'
        },
        {
            id: 'dwarven-combat-training',
            name: 'Dwarven Combat Training',
            description: 'You have proficiency with the battleaxe, handaxe, light hammer, and warhammer.',
            type: 'passive'
        },
        {
            id: 'tool-proficiency',
            name: 'Tool Proficiency',
            description: 'You gain proficiency with the artisan\'s tools of your choice: smith\'s tools, brewer\'s supplies, or mason\'s tools.',
            type: 'passive'
        },
        {
            id: 'stonecunning',
            name: 'Stonecunning',
            description: 'Whenever you make an Intelligence (History) check related to the origin of stonework, you are considered proficient in the History skill and add double your proficiency bonus to the check, instead of your normal proficiency bonus.',
            type: 'passive'
        },
        {
            id: 'dwarven-toughness',
            name: 'Dwarven Toughness',
            description: 'Your hit point maximum increases by 1, and it increases by 1 every time you gain a level.',
            type: 'passive'
        }
    ],
    
    languages: ['Common', 'Dwarvish'],
    languageChoices: 0,
    
    description: 'As a hill dwarf, you have keen senses, deep intuition, and remarkable resilience. The gold dwarves of Faerûn in their mighty southern kingdom are hill dwarves, as are the exiled Neidar and the debased Klar of Krynn in the Dragonlance setting.',
    
    source: 'SRD'
};

/**
 * All SRD races
 * Phase 0: Only Hill Dwarf implemented
 * TODO Phase 1: Add remaining races
 */
export const SRD_RACES: DnD5eRace[] = [
    HILL_DWARF
    // TODO: Add Mountain Dwarf
    // TODO: Add High Elf
    // TODO: Add Wood Elf
    // TODO: Add Lightfoot Halfling
    // TODO: Add Stout Halfling
    // TODO: Add Human
    // TODO: Add Dragonborn
    // TODO: Add Gnome (Forest)
    // TODO: Add Gnome (Rock)
    // TODO: Add Half-Elf
    // TODO: Add Half-Orc
    // TODO: Add Tiefling
];

/**
 * Helper: Get race by ID
 */
export function getRaceById(id: string): DnD5eRace | undefined {
    return SRD_RACES.find(race => race.id === id);
}

/**
 * Helper: Get all base races (no subraces)
 */
export function getBaseRaces(): DnD5eRace[] {
    return SRD_RACES.filter(race => !race.baseRace);
}

/**
 * Helper: Get subraces for a base race
 */
export function getSubraces(baseRaceName: string): DnD5eRace[] {
    return SRD_RACES.filter(race => 
        race.baseRace?.toLowerCase() === baseRaceName.toLowerCase()
    );
}

