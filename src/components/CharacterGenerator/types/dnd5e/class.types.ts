/**
 * D&D 5e class types
 * 
 * Defines class, subclass, and class feature structures for D&D 5th Edition.
 * 
 * @module CharacterGenerator/types/dnd5e/class
 */

import { DnD5eFeature } from './character.types';

/**
 * D&D 5e class definition
 * Represents a character class (e.g., Fighter, Wizard, Rogue)
 */
export interface DnD5eClass {
    id: string;                      // Unique class ID (e.g., 'fighter')
    name: string;                    // Class name (e.g., 'Fighter')
    
    // Hit points
    hitDie: number;                  // Hit die size (6, 8, 10, 12)
    
    // Primary abilities
    primaryAbility: string[];        // Suggested primary abilities (e.g., ['strength', 'dexterity'])
    
    // Proficiencies granted at level 1
    savingThrows: string[];          // Proficient saving throws (exactly 2)
    armorProficiencies: string[];    // Armor proficiencies
    weaponProficiencies: string[];   // Weapon proficiencies
    toolProficiencies?: string[];    // Tool proficiencies (if any)
    
    // Skill choices
    skillChoices: {
        choose: number;              // Number of skills to choose
        from: string[];              // List of available skills
    };
    
    // Starting equipment
    equipmentOptions: EquipmentOption[];
    startingGold?: { dice: string; multiplier: number }; // Alternative to equipment (e.g., '5d4', 10)
    
    // Class features by level
    features: Record<number, DnD5eFeature[]>; // Features gained at each level
    
    // Subclasses
    subclasses: DnD5eSubclass[];
    subclassLevel: number;           // Level at which subclass is chosen (usually 1, 2, or 3)
    
    // Spellcasting (if applicable)
    spellcasting?: ClassSpellcastingInfo;
    
    // Description
    description: string;             // Class description and role
    source: string;                  // Source book (e.g., 'PHB', 'SRD')
}

/**
 * Equipment choice group
 * Player chooses one option from each group
 */
export interface EquipmentOption {
    groupId: string;                 // Unique group ID (e.g., 'fighter-weapon-1')
    choose: number;                  // Usually 1 (choose 1 option)
    options: EquipmentChoice[];      // Available choices
}

/**
 * Single equipment choice
 */
export interface EquipmentChoice {
    id: string;                      // Choice ID
    description: string;             // Human-readable description
    items: string[];                 // Item IDs granted by this choice
}

/**
 * Subclass (archetype) definition
 */
export interface DnD5eSubclass {
    id: string;                      // Unique subclass ID (e.g., 'champion')
    name: string;                    // Subclass name (e.g., 'Champion')
    className: string;               // Parent class (e.g., 'fighter')
    description: string;             // Subclass description
    features: Record<number, DnD5eFeature[]>; // Features granted at each level
    source: string;                  // Source book
}

/**
 * Spellcasting information for a class
 */
export interface ClassSpellcastingInfo {
    ability: string;                 // Spellcasting ability ('intelligence', 'wisdom', 'charisma')
    
    // Cantrips
    cantripsKnown: Record<number, number>; // Cantrips known at each level
    
    // Spells known (for classes that know spells)
    spellsKnown?: Record<number, number>;  // Spells known at each level
    
    // Prepared spells (for classes that prepare spells)
    preparedSpells?: {
        formula: string;             // e.g., 'INT_MOD + LEVEL' (for clerics/druids)
    };
    
    // Spell slots by level
    spellSlots: Record<number, number[]>; // Spell slots at each character level
    // Example: { 1: [2, 0, 0, ...], 2: [3, 0, 0, ...], 3: [4, 2, 0, ...] }
    
    // Spell list
    spellListId: string;             // Which spell list to use (e.g., 'wizard', 'cleric')
    
    // Ritual casting
    ritualCasting?: boolean;         // Can cast ritual spells
    
    // Spellbook (wizards only)
    spellbook?: {
        startingSpells: number;      // Spells in spellbook at level 1 (usually 6)
        spellsPerLevel: number;      // Spells added per level (usually 2)
    };
}

/**
 * Helper: Get class features at a specific level
 */
export function getFeaturesAtLevel(classData: DnD5eClass, level: number): DnD5eFeature[] {
    return classData.features[level] || [];
}

/**
 * Helper: Get all features up to a level
 */
export function getAllFeaturesUpToLevel(classData: DnD5eClass, level: number): DnD5eFeature[] {
    const features: DnD5eFeature[] = [];
    for (let i = 1; i <= level; i++) {
        features.push(...(classData.features[i] || []));
    }
    return features;
}

/**
 * Helper: Get spell slots for a level
 */
export function getSpellSlotsAtLevel(classData: DnD5eClass, level: number): number[] {
    if (!classData.spellcasting) {
        return [];
    }
    return classData.spellcasting.spellSlots[level] || [];
}

/**
 * Helper: Check if class has spellcasting
 */
export function isSpellcaster(classData: DnD5eClass): boolean {
    return classData.spellcasting !== undefined;
}

