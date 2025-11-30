/**
 * System-agnostic types for multi-system character support
 * 
 * These types are universal across all RPG systems.
 * Enables future Pathfinder, OSR, etc. without breaking changes.
 * 
 * @module CharacterGenerator/types/system
 */

/**
 * Supported RPG systems
 * Start with D&D 5e, expand to other systems in future phases
 */
export type RPGSystem = 
    | 'dnd5e'           // D&D 5th Edition (Phase 0-1)
    | 'pathfinder1e'    // Pathfinder 1st Edition (Future)
    | 'pathfinder2e'    // Pathfinder 2nd Edition (Future)
    | 'osr'             // Old School Renaissance (OSE, B/X, etc.) (Future)
    | 'traveller'       // Traveller RPG (Future)
    | 'custom';         // Custom/homebrew systems (Future)

/**
 * Creature size categories (universal across most TTRPGs)
 * Matches D&D 5e, Pathfinder, and many other systems
 */
export type CreatureSize = 
    | 'tiny'        // 2.5x2.5 ft (e.g., pixie, sprite)
    | 'small'       // 5x5 ft (e.g., halfling, goblin)
    | 'medium'      // 5x5 ft (e.g., human, elf, orc)
    | 'large'       // 10x10 ft (e.g., ogre, horse)
    | 'huge'        // 15x15 ft (e.g., giant, dragon)
    | 'gargantuan'; // 20x20 ft or larger (e.g., kraken, tarrasque)

/**
 * Movement speeds (universal concept)
 * Different systems may use different units, but structure is common
 */
export interface SpeedObject {
    walk: number;      // Base walking/ground speed (required)
    fly?: number;      // Flying speed (if applicable)
    swim?: number;     // Swimming speed (if applicable)
    climb?: number;    // Climbing speed (if applicable)
    burrow?: number;   // Burrowing speed (if applicable)
}

/**
 * Ability bonus structure (common pattern)
 * Used by races, items, buffs, etc.
 */
export interface AbilityBonus {
    ability: string;   // System-specific ability name
    bonus: number;     // Numeric modifier
}

/**
 * Skill proficiency level (expandable)
 * D&D 5e uses proficient/not proficient
 * Pathfinder uses ranks 0-max
 * This supports both paradigms
 */
export type ProficiencyLevel = 
    | 'none'
    | 'proficient'
    | 'expertise'      // D&D 5e double proficiency
    | 'trained'        // Pathfinder terminology
    | 'expert'
    | 'master'
    | 'legendary';

/**
 * Alignment (common across many systems)
 * D&D/Pathfinder use 9-alignment system
 * Some systems may use fewer alignments
 */
export type Alignment = 
    | 'lawful good'
    | 'neutral good'
    | 'chaotic good'
    | 'lawful neutral'
    | 'true neutral'
    | 'chaotic neutral'
    | 'lawful evil'
    | 'neutral evil'
    | 'chaotic evil'
    | 'unaligned';     // For creatures without moral compass

/**
 * Damage types (common concept, systems may vary)
 * D&D 5e standard damage types + common additions
 */
export type DamageType = 
    | 'acid'
    | 'bludgeoning'
    | 'cold'
    | 'fire'
    | 'force'
    | 'lightning'
    | 'necrotic'
    | 'piercing'
    | 'poison'
    | 'psychic'
    | 'radiant'
    | 'slashing'
    | 'thunder';

/**
 * Condition types (common in many systems)
 * D&D 5e standard conditions + common additions
 */
export type ConditionType = 
    | 'blinded'
    | 'charmed'
    | 'deafened'
    | 'exhaustion'
    | 'frightened'
    | 'grappled'
    | 'incapacitated'
    | 'invisible'
    | 'paralyzed'
    | 'petrified'
    | 'poisoned'
    | 'prone'
    | 'restrained'
    | 'stunned'
    | 'unconscious';

/**
 * Metadata for character creation/modification
 * Universal tracking across all systems
 */
export interface CharacterMetadata {
    createdAt: string;      // ISO 8601 timestamp
    updatedAt: string;      // ISO 8601 timestamp
    createdBy?: string;     // User ID who created
    lastModifiedBy?: string; // User ID who last modified
    version: number;        // Version number for change tracking
}

