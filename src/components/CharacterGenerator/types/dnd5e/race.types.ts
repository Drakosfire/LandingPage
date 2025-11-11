/**
 * D&D 5e race types
 * 
 * Defines race, subrace, and racial trait structures for D&D 5th Edition.
 * 
 * @module CharacterGenerator/types/dnd5e/race
 */

import { CreatureSize, SpeedObject, AbilityBonus } from '../system.types';

/**
 * D&D 5e race definition
 * Represents a character's race (e.g., Dwarf, Elf, Human)
 */
export interface DnD5eRace {
    id: string;                      // Unique race ID (e.g., 'hill-dwarf')
    name: string;                    // Race name (e.g., 'Hill Dwarf')
    baseRace?: string;               // Base race name for subraces (e.g., 'dwarf')
    
    // Physical characteristics
    size: CreatureSize;              // Creature size (usually 'small' or 'medium')
    speed: SpeedObject;              // Movement speeds
    
    // Ability score increases
    abilityBonuses: AbilityBonus[];  // Racial ability score bonuses
    
    // Racial traits
    traits: DnD5eRacialTrait[];      // All racial traits (e.g., Darkvision, Brave)
    
    // Languages
    languages: string[];             // Automatic languages (e.g., ['Common', 'Dwarvish'])
    languageChoices?: number;        // Number of additional languages to choose
    
    // Description and lore
    description: string;             // Flavor text and racial description
    source: string;                  // Source book (e.g., 'PHB', 'SRD')
}

/**
 * Racial trait
 * Special abilities granted by race
 */
export interface DnD5eRacialTrait {
    id: string;                      // Unique trait ID (e.g., 'darkvision')
    name: string;                    // Trait name (e.g., 'Darkvision')
    description: string;             // Full trait description
    type?: 'passive' | 'active';     // Whether trait requires action
}

/**
 * Subrace definition
 * Some races (Dwarf, Elf, Gnome, Halfling) have subraces
 */
export interface DnD5eSubrace extends DnD5eRace {
    baseRace: string;                // Required for subraces
    subraceTraits: DnD5eRacialTrait[]; // Additional traits from subrace
}

/**
 * Helper: Check if race requires subrace selection
 */
export function requiresSubrace(race: DnD5eRace): boolean {
    const racesWithSubraces = ['dwarf', 'elf', 'gnome', 'halfling'];
    return racesWithSubraces.includes(race.baseRace?.toLowerCase() || race.name.toLowerCase());
}

/**
 * Helper: Get total speed from race
 */
export function getRaceSpeed(race: DnD5eRace): number {
    return race.speed.walk;
}

/**
 * Helper: Get race ability modifiers as object
 */
export function getRaceAbilityModifiers(race: DnD5eRace): Record<string, number> {
    const modifiers: Record<string, number> = {};
    for (const bonus of race.abilityBonuses) {
        modifiers[bonus.ability] = bonus.bonus;
    }
    return modifiers;
}

