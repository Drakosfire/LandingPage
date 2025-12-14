/**
 * AI Character Generation Types
 * 
 * Types for the AI-assisted character generation system.
 * 
 * Architecture:
 * 1. User provides: Class, Race, Level, Background (identity)
 * 2. Rule Engine provides: Constraints (valid skills, spells, equipment)
 * 3. AI generates: Preferences (priorities, themes, flavor)
 * 4. Translator converts: Preferences → valid mechanics
 * 5. Generator computes: Derived stats (HP, AC, modifiers)
 * 
 * @module CharacterGenerator/generation/types
 */

import { DnD5eAbilityScores, DnD5eCharacter, DnD5ePersonality } from '../types/dnd5e/character.types';

// ============================================================================
// ABILITY NAMES
// ============================================================================

/**
 * D&D 5e ability names (for type safety in preferences)
 */
export type AbilityName =
    | 'strength'
    | 'dexterity'
    | 'constitution'
    | 'intelligence'
    | 'wisdom'
    | 'charisma';

/**
 * All ability names as array (for iteration)
 */
export const ABILITY_NAMES: AbilityName[] = [
    'strength',
    'dexterity',
    'constitution',
    'intelligence',
    'wisdom',
    'charisma'
];

// ============================================================================
// USER INPUT (Foundation)
// ============================================================================

/**
 * User-provided foundation for character generation
 * 
 * These are identity decisions that the user makes.
 * They're the hardest to validate and most personal.
 */
export interface GenerationInput {
    /** Selected class ID (e.g., 'fighter', 'wizard') */
    classId: string;

    /** Selected subclass ID, if level allows (e.g., 'champion') */
    subclassId?: string;

    /** Selected race ID (e.g., 'human', 'dwarf') */
    raceId: string;

    /** Selected subrace ID, if applicable (e.g., 'hill-dwarf') */
    subraceId?: string;

    /** Character level (1-3 for initial scope) */
    level: 1 | 2 | 3;

    /** Selected background ID (e.g., 'soldier', 'sage') */
    backgroundId: string;

    /** Free-text character concept for AI to interpret */
    concept: string;
}

// ============================================================================
// RULE ENGINE CONSTRAINTS
// ============================================================================

/**
 * Constraints computed by Rule Engine based on user input
 * 
 * These are the valid options the AI can express preferences about.
 * The translator uses these to validate and map AI preferences.
 */
export interface GenerationConstraints {
    /** Class information */
    class: {
        id: string;
        name: string;
        hitDie: number;
        primaryAbilities: AbilityName[];
    };

    /** Subclass information (if applicable) */
    subclass?: {
        id: string;
        name: string;
    };

    /** Race information */
    race: {
        id: string;
        name: string;
        abilityBonuses: Partial<Record<AbilityName, number>>;
        traits: string[];
    };

    /** Background information */
    background: {
        id: string;
        name: string;
        grantedSkills: string[];  // Skills automatically granted
    };

    /** Skill selection constraints */
    skills: {
        grantedByBackground: string[];  // Automatically proficient
        classOptions: string[];         // Can choose from these
        chooseCount: number;            // How many to pick from class
        overlapHandling: 'replace' | 'free-choice';  // What to do if background grants class skill
    };

    /** Equipment constraints */
    equipment: {
        packages: EquipmentPackage[];   // Pre-defined packages to choose from
    };

    /** Class feature choices (fighting style, etc.) */
    featureChoices: FeatureChoice[];

    /** Spellcasting constraints (if caster) */
    spellcasting?: SpellcastingConstraints;
}

/**
 * Equipment package option
 */
export interface EquipmentPackage {
    id: string;
    description: string;
    items: string[];  // Item IDs
}

/**
 * A class feature that requires a choice
 */
export interface FeatureChoice {
    featureId: string;
    featureName: string;
    description: string;
    options: {
        id: string;
        name: string;
        description: string;
    }[];
}

/**
 * Spellcasting constraints for caster classes
 */
export interface SpellcastingConstraints {
    ability: AbilityName;
    casterType?: 'known' | 'prepared';
    preparedFormula?: 'abilityModPlusLevel';
    cantripsKnown: number;
    spellsKnown?: number;        // For known casters (bard, sorcerer, ranger)
    spellsPrepared?: number;     // For prepared casters (cleric, druid, wizard)
    maxSpellLevel: number;       // Based on character level
    availableCantrips: SpellOption[];
    availableSpells: SpellOption[];
}

/**
 * Spell option for AI to consider
 */
export interface SpellOption {
    id: string;
    name: string;
    level: number;
    school: string;
    description: string;  // Brief description for AI context
}

// ============================================================================
// AI PREFERENCES (Output from AI)
// ============================================================================

/**
 * AI-generated preferences for character build
 * 
 * Key design principle: AI expresses INTENT, not exact mechanics.
 * - abilityPriorities: ordered list, not exact scores
 * - skillThemes: descriptive themes, not specific skill names
 * - equipmentStyle: description, not item IDs
 * 
 * The translator converts these to valid mechanical choices.
 */
export interface AiPreferences {
    // ===== ABILITY SCORE PREFERENCES =====

    /**
     * Ability priorities in order of importance (highest first)
     * Should include all 6 abilities in preferred order.
     * Translator will optimize point buy based on this order.
     */
    abilityPriorities: AbilityName[];

    /**
     * Brief reasoning for ability priorities
     * Helps validate coherence with concept
     */
    abilityReasoning: string;

    // ===== COMBAT & SKILL PREFERENCES =====

    /**
     * Description of combat approach
     * e.g., "Defensive tank who protects allies"
     * e.g., "Aggressive striker who takes risks"
     */
    combatApproach: string;

    /**
     * Thematic skill preferences (not specific skill names)
     * e.g., ["physical prowess", "intimidation", "awareness"]
     * e.g., ["stealth", "deception", "sleight of hand"]
     * Translator maps to available skills
     */
    skillThemes: string[];

    // ===== EQUIPMENT PREFERENCES =====

    /**
     * Description of equipment style
     * e.g., "Heavy armor and shield, reliable weapon"
     * e.g., "Light and mobile, ranged options"
     * Translator selects matching package
     */
    equipmentStyle: string;

    // ===== CLASS FEATURE PREFERENCES =====

    /**
     * Subclass preference with brief reasoning
     * Only relevant if level >= subclassLevel
     */
    subclassPreference?: {
        id: string;
        reasoning: string;
    };

    /**
     * Fighting style preference (if applicable)
     * For Fighter (L1), Paladin (L2), Ranger (L2)
     */
    fightingStylePreference?: {
        id: string;
        reasoning: string;
    };

    /**
     * Other feature choice preferences
     * Key is featureId, value is chosen option ID with reasoning
     */
    featureChoicePreferences?: Record<string, {
        optionId: string;
        reasoning: string;
    }>;

    // ===== SPELL PREFERENCES (if caster) =====

    /**
     * Cantrip preferences (themes, not specific spells)
     * e.g., ["damage", "utility", "light"]
     */
    cantripThemes?: string[];

    /**
     * Spell preferences (themes and tactical roles)
     * e.g., ["control", "damage", "healing", "buff"]
     */
    spellThemes?: string[];

    // ===== CHARACTER FLAVOR =====

    /**
     * Generated character details
     */
    character: {
        /** Character name */
        name: string;

        /** Personality following D&D 5e structure */
        personality: DnD5ePersonality;

        /** Backstory (2-4 paragraphs) */
        backstory: string;

        /** Physical appearance description */
        appearance?: string;

        /** Character age */
        age?: number;
    };
}

// ============================================================================
// TRANSLATION RESULT
// ============================================================================

/**
 * Result of translating AI preferences to valid mechanics
 */
export interface TranslationResult {
    /** Whether translation was successful */
    success: boolean;

    /** Translated character data (if successful) */
    character?: Partial<DnD5eCharacter>;

    /** Specific translation outcomes */
    translations: {
        /** Point buy translation */
        abilityScores?: {
            success: boolean;
            scores?: DnD5eAbilityScores;
            pointsSpent?: number;
            issues?: string[];
        };

        /** Skill translation */
        skills?: {
            success: boolean;
            selected?: string[];
            unmatchedThemes?: string[];
            issues?: string[];
        };

        /** Equipment translation */
        equipment?: {
            success: boolean;
            packageId?: string;
            issues?: string[];
        };

        /** Feature choice translations */
        featureChoices?: {
            success: boolean;
            choices?: Record<string, string>;  // featureId → optionId
            issues?: string[];
        };

        /** Spell translation (if caster) */
        spells?: {
            success: boolean;
            cantrips?: string[];
            spells?: string[];
            unmatchedThemes?: string[];
            issues?: string[];
        };
    };

    /** Overall issues encountered */
    issues: string[];
}

// ============================================================================
// TEST HARNESS TYPES
// ============================================================================

/**
 * Test case for synthetic testing
 */
export interface TestCase {
    /** Unique test case ID */
    id: string;

    /** User input foundation */
    input: GenerationInput;

    /** Timestamp of creation */
    createdAt: string;
}

/**
 * Result of a single test run
 */
export interface TestResult {
    /** Test case that was run */
    testCase: TestCase;

    /** Timestamp of execution */
    executedAt: string;

    // ===== AI GENERATION PHASE =====

    aiGeneration: {
        /** Whether AI returned valid JSON */
        parseSuccess: boolean;

        /** Parsed preferences (if successful) */
        preferences?: AiPreferences;

        /** Parse error (if failed) */
        parseError?: string;

        /** Raw response from AI */
        rawResponse: string;
    };

    // ===== TRANSLATION PHASE =====

    translation: TranslationResult;

    // ===== VALIDATION PHASE =====

    validation: {
        /** Overall validation passed */
        isValid: boolean;

        /** Point buy validation */
        pointBuy: {
            valid: boolean;
            pointsSpent: number;
            issues: string[];
        };

        /** Skills validation */
        skills: {
            valid: boolean;
            invalidSkills: string[];
        };

        /** Equipment validation */
        equipment: {
            valid: boolean;
            issues: string[];
        };

        /** Spells validation (if caster) */
        spells?: {
            valid: boolean;
            invalidSpells: string[];
            levelViolations: string[];
        };

        /** All validation issues */
        allIssues: string[];

        /** Backend validation result (optional) */
        backend?: {
            valid: boolean;
            issues: string[];
            sections?: Record<string, any>;
        };

        /** Backend derived-stats compute result (optional, E3) */
        backendCompute?: {
            success: boolean;
            issues: string[];
            derivedStats?: Record<string, any>;
            sections?: Record<string, any>;
        };
    };

    // ===== METRICS =====

    metrics: {
        /** Prompt tokens used */
        promptTokens: number;

        /** Completion tokens used */
        completionTokens: number;

        /** Total tokens used */
        totalTokens: number;

        /** End-to-end latency in milliseconds */
        latencyMs: number;

        /** Estimated cost in USD */
        costUsd: number;

        /**
         * Stage timings (ms) for driving UX (e.g., animated loading bars)
         * and for performance analysis. Optional because older runs won't have it.
         */
        stageMs?: {
            constraintsMs?: number;
            promptBuildMs?: number;
            aiCallMs?: number;
            parseMs?: number;
            translateMs?: number;
            validateMs?: number;
            backendValidateMs?: number;
            backendComputeMs?: number;
        };
    };
}

/**
 * Aggregated test results summary
 */
export interface TestSummary {
    /** Total test cases run */
    totalCases: number;

    /** Timestamp of summary generation */
    generatedAt: string;

    // ===== SUCCESS RATES =====

    successRates: {
        /** AI returned valid JSON */
        parseSuccess: number;

        /** Preferences translated successfully */
        translationSuccess: number;

        /** All validations passed */
        validationSuccess: number;

        /** Overall success (parse + translate + validate) */
        overallSuccess: number;
    };

    // ===== BREAKDOWNS =====

    byClass: Record<string, {
        total: number;
        parseSuccess: number;
        translationSuccess: number;
        validationSuccess: number;
    }>;

    byRace: Record<string, {
        total: number;
        validationSuccess: number;
    }>;

    byLevel: Record<number, {
        total: number;
        validationSuccess: number;
    }>;

    // ===== FAILURE PATTERNS =====

    failurePatterns: {
        pattern: string;
        count: number;
        percentage: number;
        examples: string[];
    }[];

    // ===== METRICS AGGREGATES =====

    metrics: {
        avgPromptTokens: number;
        avgCompletionTokens: number;
        avgTotalTokens: number;
        avgLatencyMs: number;
        p50LatencyMs: number;
        p95LatencyMs: number;
        totalCostUsd: number;
        costPerSuccess: number;
    };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create an empty AiPreferences object for testing
 */
export function createEmptyAiPreferences(): AiPreferences {
    return {
        abilityPriorities: ['strength', 'constitution', 'dexterity', 'wisdom', 'charisma', 'intelligence'],
        abilityReasoning: '',
        combatApproach: '',
        skillThemes: [],
        equipmentStyle: '',
        character: {
            name: '',
            personality: {},
            backstory: ''
        }
    };
}

/**
 * Create an empty TranslationResult for testing
 */
export function createEmptyTranslationResult(): TranslationResult {
    return {
        success: false,
        translations: {},
        issues: []
    };
}

/**
 * Create a test case ID from input
 */
export function createTestCaseId(input: GenerationInput): string {
    return `${input.classId}-${input.raceId}-L${input.level}-${input.backgroundId}`;
}

