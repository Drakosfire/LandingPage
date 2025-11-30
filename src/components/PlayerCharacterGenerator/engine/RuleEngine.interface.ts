/**
 * Rule Engine Interface
 * 
 * Defines how the frontend interacts with game rules.
 * Implementations are system-specific (D&D 5e, Pathfinder, etc.)
 * 
 * CONSUMER (Frontend) provides: Character data, user choices
 * PROVIDER (Engine) returns: Validation results, available choices, derived stats
 * 
 * @module PlayerCharacterGenerator/engine
 */

import type {
    CreationStep,
    ValidationResult,
    SkillChoice,
    EquipmentChoiceGroup,
    DerivedStats,
    AbilityScores
} from './RuleEngine.types';

/**
 * Generic Rule Engine Interface
 * 
 * Type parameters allow each implementation to use its own data types
 * while conforming to the same interface contract.
 * 
 * @template TCharacter - The system-specific character type
 * @template TRace - The system-specific race type
 * @template TClass - The system-specific class type
 * @template TBackground - The system-specific background type
 * @template TSpell - The system-specific spell type
 */
export interface RuleEngine<
    TCharacter,
    TRace,
    TClass,
    TBackground,
    TSpell = unknown
> {
    // ===== IDENTITY =====
    
    /** System identifier (e.g., 'dnd5e', 'pf2e', 'custom') */
    readonly systemId: string;
    
    /** Human-readable system name (e.g., 'D&D 5th Edition') */
    readonly systemName: string;
    
    /** Engine version (semver) */
    readonly version: string;

    // ===== VALIDATION =====
    
    /**
     * Validate entire character, returns all errors/warnings
     * @param character - The character to validate
     * @returns Validation result with all issues
     */
    validateCharacter(character: TCharacter): ValidationResult;
    
    /**
     * Validate a specific wizard step
     * @param character - The character to validate
     * @param step - Which step to validate
     * @returns Validation result for that step only
     */
    validateStep(character: TCharacter, step: CreationStep): ValidationResult;
    
    /**
     * Check if character is complete and valid (ready to finalize)
     * @param character - The character to check
     * @returns True if all validations pass
     */
    isCharacterComplete(character: TCharacter): boolean;

    // ===== DATA PROVIDERS =====
    
    /**
     * Get all available races for this system
     * @returns Array of race definitions
     */
    getAvailableRaces(): TRace[];
    
    /**
     * Get all available classes for this system
     * @returns Array of class definitions
     */
    getAvailableClasses(): TClass[];
    
    /**
     * Get all available backgrounds for this system
     * @returns Array of background definitions
     */
    getAvailableBackgrounds(): TBackground[];
    
    /**
     * Get subraces for a given base race
     * @param baseRaceId - ID of the base race
     * @returns Array of subrace definitions (empty if none)
     */
    getSubraces(baseRaceId: string): TRace[];

    // ===== CHOICE HELPERS =====
    
    /**
     * Get valid skill choices based on current character state
     * @param character - Current character state
     * @returns Skill choice with available options
     */
    getValidSkillChoices(character: TCharacter): SkillChoice;
    
    /**
     * Get equipment choice groups for a class
     * @param classId - ID of the class
     * @returns Array of equipment choice groups
     */
    getEquipmentChoices(classId: string): EquipmentChoiceGroup[];
    
    /**
     * Get spells available at a specific level
     * @param character - Current character state
     * @param spellLevel - Spell level (0 for cantrips)
     * @returns Array of available spells
     */
    getAvailableSpells(character: TCharacter, spellLevel: number): TSpell[];

    // ===== CALCULATIONS =====
    
    /**
     * Calculate all derived stats for a character
     * @param character - Current character state
     * @returns Derived stats (AC, HP, etc.)
     */
    calculateDerivedStats(character: TCharacter): DerivedStats;
    
    /**
     * Apply racial bonuses to base ability scores
     * @param baseScores - Ability scores before racial bonuses
     * @param raceId - ID of the race to apply
     * @returns Modified ability scores
     */
    applyRacialBonuses(baseScores: AbilityScores, raceId: string): AbilityScores;
    
    /**
     * Calculate HP gained from leveling up
     * @param character - Current character state
     * @param hitDieRoll - Result of hit die roll (or 0 for average)
     * @returns HP to add
     */
    calculateLevelUpHP(character: TCharacter, hitDieRoll: number): number;
    
    /**
     * Get proficiency bonus for a level
     * @param level - Character level
     * @returns Proficiency bonus value
     */
    getProficiencyBonus(level: number): number;
}

/**
 * Type guard to check if an object implements RuleEngine
 */
export const isRuleEngine = <T, R, C, B, S>(obj: unknown): obj is RuleEngine<T, R, C, B, S> => {
    if (typeof obj !== 'object' || obj === null) return false;
    
    const engine = obj as Record<string, unknown>;
    
    return (
        typeof engine.systemId === 'string' &&
        typeof engine.systemName === 'string' &&
        typeof engine.version === 'string' &&
        typeof engine.validateCharacter === 'function' &&
        typeof engine.validateStep === 'function' &&
        typeof engine.isCharacterComplete === 'function' &&
        typeof engine.getAvailableRaces === 'function' &&
        typeof engine.getAvailableClasses === 'function' &&
        typeof engine.getAvailableBackgrounds === 'function'
    );
};

