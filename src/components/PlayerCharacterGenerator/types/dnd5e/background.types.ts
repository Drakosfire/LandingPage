/**
 * D&D 5e background types
 * 
 * Defines character background structures for D&D 5th Edition.
 * Backgrounds grant skill proficiencies, languages, equipment, and a feature.
 * 
 * @module CharacterGenerator/types/dnd5e/background
 */

import { DnD5eFeature } from './character.types';

/**
 * D&D 5e background definition
 * Represents character's past (e.g., Acolyte, Criminal, Soldier)
 */
export interface DnD5eBackground {
    id: string;                      // Unique background ID (e.g., 'soldier')
    name: string;                    // Background name (e.g., 'Soldier')
    
    // Proficiencies
    skillProficiencies: string[];    // Always grants exactly 2 skills
    toolProficiencies?: string[];    // Tool proficiencies (if any)
    languageChoices?: number;        // Number of languages to choose
    
    // Equipment
    equipment: string[];             // Starting equipment from background
    startingGold?: number;           // Starting gold (in gp)
    
    // Background feature
    feature: DnD5eFeature;           // Special background feature
    
    // Personality suggestions
    suggestedCharacteristics: {
        traits: string[];            // Suggested personality traits (player chooses 2)
        ideals: string[];            // Suggested ideals (player chooses 1)
        bonds: string[];             // Suggested bonds (player chooses 1)
        flaws: string[];             // Suggested flaws (player chooses 1)
    };
    
    // Description
    description: string;             // Background description
    source: string;                  // Source book (e.g., 'PHB', 'SRD')
}

/**
 * Helper: Get skill proficiencies from background
 */
export function getBackgroundSkills(background: DnD5eBackground): string[] {
    return background.skillProficiencies;
}

/**
 * Helper: Check for duplicate skills between class and background
 * Returns skills that would be duplicates
 */
export function findDuplicateSkills(
    backgroundSkills: string[],
    classSkills: string[]
): string[] {
    return backgroundSkills.filter(skill => classSkills.includes(skill));
}

