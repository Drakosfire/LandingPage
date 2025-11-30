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

