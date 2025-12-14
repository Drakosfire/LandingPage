/**
 * AI Character Generation Module
 * 
 * Exports types and utilities for AI-assisted character generation.
 * 
 * @module CharacterGenerator/generation
 */

// Types from types.ts
export type {
    // Core input/output
    GenerationInput,
    GenerationConstraints,
    AiPreferences,
    TranslationResult,

    // Constraint sub-types
    EquipmentPackage,
    FeatureChoice,
    SpellcastingConstraints,
    SpellOption,

    // Test harness types
    TestCase,
    TestResult,
    TestSummary,

    // Utility types
    AbilityName,
} from './types';

// Types from preferenceTranslator.ts
export type {
    AbilityTranslationResult,
    SkillTranslationResult,
    EquipmentTranslationResult,
    FeatureChoiceTranslationResult,
    SpellTranslationResult,
} from './preferenceTranslator';

// Constants
export { ABILITY_NAMES } from './types';

// Helper functions from types.ts
export {
    createEmptyAiPreferences,
    createEmptyTranslationResult,
    createTestCaseId,
} from './types';

// Translator functions
export {
    translatePreferences,
    translateAbilityPriorities,
    translateSkillThemes,
    translateEquipmentStyle,
    translateFeatureChoices,
    translateSpellThemes,
} from './preferenceTranslator';

// Test harness
export {
    // Test data
    TEST_CLASSES,
    TEST_RACES,
    TEST_LEVELS,
    TEST_BACKGROUNDS,
    SAMPLE_CONCEPTS,

    // Test case generators
    generateTestCase,
    generatePilotTestCases,
    generateRepresentativeSample,
    generateFilteredMatrix,

    generateFilteredSample,
    generateFullMatrix,

    // Result handling
    createEmptyTestResult,
    aggregateResults,

    // Reporting
    formatSummaryReport,
    printTestCases,
} from './testHarness';

// Prompt builder
export {
    // Constants
    SYSTEM_PROMPT,

    // Main prompt builder
    buildPreferencePrompt,

    // Section formatters
    formatSkillOptions,
    formatEquipmentOptions,
    formatFeatureChoices,
    formatSpellList,

    // Response parsing
    parseAiResponse,
    validatePreferences,

    // Mock constraints (for testing)
    createMockFighterConstraints,
    createMockWizardConstraints,
    getMockConstraints,
} from './promptBuilder';

// Test runner
export {
    runTestCase,
    runPilotTest,
    showPromptDemo,
    showPipelineDemo,
} from './testRunner';

