/**
 * Rule Engine Shared Types
 * 
 * Types used by all RuleEngine implementations.
 * These are system-agnostic and define the contract structure.
 * 
 * @module PlayerCharacterGenerator/engine
 */

/**
 * Character creation wizard steps
 */
export type CreationStep =
    | 'abilityScores'
    | 'race'
    | 'class'
    | 'spells'
    | 'background'
    | 'equipment'
    | 'review';

/**
 * Validation error severity levels
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * A single validation error/warning/info message
 */
export interface ValidationError {
    /** Machine-readable error code (e.g., 'SKILL_COUNT_INVALID') */
    code: string;

    /** Human-readable error message */
    message: string;

    /** Which wizard step this error relates to */
    step: CreationStep;

    /** Specific field within the step (optional) */
    field?: string;

    /** Severity level */
    severity: ValidationSeverity;
}

/**
 * Result of validating a character or step
 */
export interface ValidationResult {
    /** True if no errors (warnings/info allowed) */
    isValid: boolean;

    /** Errors that MUST be fixed */
    errors: ValidationError[];

    /** Warnings that SHOULD be fixed */
    warnings: ValidationError[];

    /** Informational messages */
    info: ValidationError[];
}

/**
 * Represents a skill choice for class/background selection
 */
export interface SkillChoice {
    /** Number of skills to choose */
    count: number;

    /** Available skill names to choose from */
    options: string[];

    /** Currently selected skill names */
    selected: string[];
}

/**
 * A single equipment option within a choice group
 */
export interface EquipmentOption {
    /** Unique identifier */
    id: string;

    /** Display name */
    name: string;

    /** Items included in this option */
    items: EquipmentItem[];

    /** Description of the option */
    description?: string;
}

/**
 * Basic equipment item reference
 */
export interface EquipmentItem {
    /** Item identifier */
    id: string;

    /** Item name */
    name: string;

    /** Quantity */
    quantity: number;

    /** Item type */
    type: 'weapon' | 'armor' | 'gear' | 'tool' | 'pack';
}

/**
 * A group of mutually exclusive equipment choices
 * (e.g., "Choose: (a) longsword OR (b) any simple weapon")
 */
export interface EquipmentChoiceGroup {
    /** Unique identifier for this choice group */
    id: string;

    /** Description (e.g., "Choose one of the following") */
    description: string;

    /** Available options */
    options: EquipmentOption[];

    /** Index of selected option (undefined if not yet chosen) */
    selectedIndex?: number;
}

/**
 * Derived combat and other stats
 */
export interface DerivedStats {
    /** Armor Class */
    armorClass: number;

    /** Initiative bonus */
    initiative: number;

    /** Base walking speed */
    speed: number;

    /** Maximum hit points */
    maxHitPoints: number;

    /** Current hit points (defaults to max) */
    currentHitPoints: number;

    /** Proficiency bonus */
    proficiencyBonus: number;

    /** Passive Perception */
    passivePerception: number;

    /** Spell save DC (if spellcaster) */
    spellSaveDC?: number;

    /** Spell attack bonus (if spellcaster) */
    spellAttackBonus?: number;
}

/**
 * Base ability scores (before racial bonuses)
 */
export interface AbilityScores {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
}

/**
 * Ability name type (T026b)
 */
export type AbilityName = keyof AbilityScores;

/**
 * A player's choice for flexible ability bonus (T026c)
 * Used for races like Half-Elf that allow choosing which abilities to boost
 */
export interface AbilityBonusChoice {
    /** Which ability to boost */
    ability: AbilityName;

    /** Bonus amount (typically +1) */
    bonus: number;
}

/**
 * Configuration for races with flexible ability bonuses (T026b)
 * E.g., Half-Elf: +2 CHA fixed, +1 to two other abilities of choice
 */
export interface FlexibleBonusConfig {
    /** Race ID this config applies to */
    raceId: string;

    /** Number of bonus choices to make */
    choiceCount: number;

    /** Bonus amount for each choice (typically +1) */
    bonusPerChoice: number;

    /** Abilities that are excluded from choice (already have fixed bonus) */
    excludedAbilities: AbilityName[];

    /** Can the same ability be chosen multiple times? */
    allowStacking: boolean;
}

// ===== SPELLCASTING TYPES (T035j) =====

/**
 * Caster type classification
 */
export type CasterType = 'full' | 'half' | 'pact' | 'none';

/**
 * Character's computed spellcasting information (T035j)
 * Returned by getSpellcastingInfo() - contains all computed spellcasting state
 */
export interface SpellcastingInfo {
    /** Is this character a spellcaster? */
    isSpellcaster: boolean;

    /** Caster type (full/half/pact/none) */
    casterType: CasterType;

    /** Primary spellcasting class (first class with spellcasting) */
    spellcastingClass?: string;

    /** Spellcasting ability (intelligence/wisdom/charisma) */
    spellcastingAbility?: AbilityName;

    /** Spell save DC = 8 + proficiency + ability modifier */
    spellSaveDC?: number;

    /** Spell attack bonus = proficiency + ability modifier */
    spellAttackBonus?: number;

    /** Number of cantrips known */
    cantripsKnown: number;

    /** Cantrip IDs the character knows */
    knownCantrips: string[];

    /** For known-spell casters: max spells known */
    maxSpellsKnown?: number;

    /** For prepared-spell casters: max spells that can be prepared */
    maxPreparedSpells?: number;

    /** Spell preparation formula (e.g., 'WIS_MOD + LEVEL') */
    prepareFormula?: string;

    /** Currently known spell IDs */
    knownSpells: string[];

    /** Currently prepared spell IDs (for prepared casters) */
    preparedSpells: string[];

    /** Spell slots by level: { 1: { total: 2, used: 0 }, 2: { total: 0, used: 0 }, ... } */
    spellSlots: Record<number, { total: number; used: number }>;

    /** For Warlocks: Pact Magic slot info */
    pactMagic?: {
        slotCount: number;
        slotLevel: number;
        slotsUsed: number;
    };

    /** Can cast rituals without using spell slots? */
    ritualCasting: boolean;

    /** Subclass-granted spells (always prepared, don't count against limit) */
    bonusSpells: string[];

    /** Class spell list ID for filtering available spells */
    spellListId?: string;
}

/**
 * Empty spellcasting info for non-casters
 */
export const EMPTY_SPELLCASTING_INFO: SpellcastingInfo = {
    isSpellcaster: false,
    casterType: 'none',
    cantripsKnown: 0,
    knownCantrips: [],
    knownSpells: [],
    preparedSpells: [],
    spellSlots: {},
    ritualCasting: false,
    bonusSpells: []
};

/**
 * Factory function to create an empty ValidationResult
 */
export const createEmptyValidationResult = (): ValidationResult => ({
    isValid: true,
    errors: [],
    warnings: [],
    info: []
});

/**
 * Factory function to create a validation error
 */
export const createValidationError = (
    code: string,
    message: string,
    step: CreationStep,
    severity: ValidationSeverity = 'error',
    field?: string
): ValidationError => ({
    code,
    message,
    step,
    severity,
    field
});

/**
 * Merge multiple validation results into one
 */
export const mergeValidationResults = (...results: ValidationResult[]): ValidationResult => {
    const merged: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        info: []
    };

    for (const result of results) {
        merged.errors.push(...result.errors);
        merged.warnings.push(...result.warnings);
        merged.info.push(...result.info);
    }

    merged.isValid = merged.errors.length === 0;
    return merged;
};

