/**
 * Player Character Generator - Pure Engine Configuration
 * 
 * This file contains the pure configuration for the GenerationDrawerEngine,
 * WITHOUT any callback wiring. The factory pattern handles callback wiring.
 * 
 * @module PlayerCharacterGenerator
 */

import React from 'react';
import { IconWand, IconPhoto, IconUpload, IconLibrary } from '@tabler/icons-react';
import type { Character } from './types/character.types';
import { DUNGEONMIND_API_URL } from '../../config';
import type {
    GenerationDrawerConfig,
    ProgressConfig
} from '../../shared/GenerationDrawerEngine/factory';
import { GenerationType } from '../../shared/GenerationDrawerEngine/factory';
import type { PCGInput, LevelOption } from './PCGInputForm';
import { PCG_V0_BASE_RACE_IDS, PCG_V0_BACKGROUND_IDS } from './PCGInputForm';

// =============================================================================
// OUTPUT TYPE
// =============================================================================

/**
 * Output type from PCG generation.
 * Contains the generated character and metadata.
 */
export interface PCGOutput {
    /** Generated character data */
    character: Character;
    /** Prompt for portrait generation (derived from character) */
    imagePrompt: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Default input values */
export const PCG_DEFAULT_INPUT: PCGInput = {
    concept: '',
    classId: '',
    level: 1 as LevelOption,
    baseRaceId: null,
    subraceId: null,
    backgroundId: null
};

/** Minimum concept length for validation */
export const CONCEPT_MIN_LENGTH = 10;

/** Quick-fill examples for the form */
export const PCG_EXAMPLES = [
    {
        name: 'Battle-Hardened Veteran',
        input: {
            concept: 'A battle-hardened veteran seeking redemption after a war gone wrong, now protecting the innocent',
            classId: 'fighter',
            level: 3 as LevelOption,
            baseRaceId: 'human',
            subraceId: null,
            backgroundId: 'soldier'
        }
    },
    {
        name: 'Curious Scholar',
        input: {
            concept: 'An insatiably curious scholar who left the academy to find knowledge forbidden in dusty tomes',
            classId: 'wizard',
            level: 2 as LevelOption,
            baseRaceId: 'elf',
            subraceId: 'high-elf',
            backgroundId: 'sage'
        }
    },
    {
        name: 'Streetwise Rogue',
        input: {
            concept: 'A charming thief with a heart of gold, robbing from the rich to help the downtrodden',
            classId: 'rogue',
            level: 2 as LevelOption,
            baseRaceId: 'halfling',
            subraceId: 'lightfoot',
            backgroundId: 'criminal'
        }
    },
    {
        name: 'Devoted Healer',
        input: {
            concept: 'A devoted priest who hears whispers from their deity, tasked with a sacred mission',
            classId: 'cleric',
            level: 2 as LevelOption,
            baseRaceId: 'dwarf',
            subraceId: 'hill-dwarf',
            backgroundId: 'acolyte'
        }
    },
    {
        name: 'Wild Berserker',
        input: {
            concept: 'A fierce warrior from the frozen north, driven by primal rage and a thirst for glory',
            classId: 'barbarian',
            level: 3 as LevelOption,
            baseRaceId: 'half-orc',
            subraceId: null,
            backgroundId: 'folk-hero'
        }
    }
];

/** Progress configuration for text generation */
const TEXT_PROGRESS_CONFIG: ProgressConfig = {
    estimatedDurationMs: 45000, // 45 seconds typical for character generation
    milestones: [
        { at: 10, message: 'Analyzing your concept...' },
        { at: 25, message: 'Rolling ability scores...' },
        { at: 40, message: 'Selecting skills and proficiencies...' },
        { at: 55, message: 'Choosing equipment...' },
        { at: 70, message: 'Writing backstory and personality...' },
        { at: 85, message: 'Finalizing character sheet...' }
    ],
    color: 'violet'
};

/** Progress configuration for image generation */
const IMAGE_PROGRESS_CONFIG: ProgressConfig = {
    estimatedDurationMs: 15000, // 15 seconds typical
    milestones: [
        { at: 20, message: 'Preparing portrait prompt...' },
        { at: 60, message: 'Generating portrait...' },
        { at: 90, message: 'Uploading to gallery...' }
    ],
    color: 'violet'
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Pick a random value from an array of options
 */
function pickRandomValue<T extends { value: string }>(options: T[]): string {
    if (!options.length) {
        throw new Error('No options available');
    }
    const idx = Math.floor(Math.random() * options.length);
    return options[idx].value;
}

/**
 * Get base race options filtered to v0 catalog
 */
function getBaseRaceOptions(): Array<{ value: string; label: string }> {
    return Array.from(PCG_V0_BASE_RACE_IDS).map(id => ({
        value: id,
        label: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ')
    }));
}

/**
 * Get background options filtered to v0 catalog
 */
function getBackgroundOptions(): Array<{ value: string; label: string }> {
    return Array.from(PCG_V0_BACKGROUND_IDS).map(id => ({
        value: id,
        label: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ')
    }));
}

// =============================================================================
// ENGINE CONFIGURATION
// =============================================================================

/**
 * Pure engine configuration for Player Character Generator.
 * 
 * This configuration is used by createServiceDrawer() to create a fully-wired
 * drawer component. Callbacks are NOT included here - the factory handles them.
 * 
 * @note InputSlot is added by the factory
 */
export const pcgEngineConfig: Omit<
    GenerationDrawerConfig<PCGInput, PCGOutput>,
    'id' | 'title' | 'InputSlot' | 'onGenerationStart' | 'onGenerationComplete' | 'onGenerationError'
> = {
    tabs: [
        {
            id: 'text',
            label: 'Character Generation',
            icon: React.createElement(IconWand, { size: 16 }),
            generationType: GenerationType.TEXT
        },
        {
            id: 'image',
            label: 'Portrait',
            icon: React.createElement(IconPhoto, { size: 16 }),
            generationType: GenerationType.IMAGE
        },
        {
            id: 'upload',
            label: 'Upload',
            icon: React.createElement(IconUpload, { size: 16 })
        },
        {
            id: 'library',
            label: 'Library',
            icon: React.createElement(IconLibrary, { size: 16 })
        }
    ],

    defaultTab: 'text',

    initialInput: PCG_DEFAULT_INPUT,

    validateInput: (input: PCGInput) => {
        const errors: Record<string, string> = {};

        // Concept validation
        if (!input.concept || input.concept.trim().length < CONCEPT_MIN_LENGTH) {
            errors.concept = `Concept must be at least ${CONCEPT_MIN_LENGTH} characters`;
        }

        // Class validation
        if (!input.classId || input.classId.trim() === '') {
            errors.classId = 'Class is required';
        }

        // Subrace validation: required if base race has subraces
        // Note: This is a simplified check - the form handles the UI logic
        // The full subrace check happens in transformInput

        if (Object.keys(errors).length > 0) {
            return { valid: false, errors };
        }
        return { valid: true };
    },

    // API endpoints
    generationEndpoint: `${DUNGEONMIND_API_URL}/api/playercharactergenerator/generate`,
    imageGenerationEndpoint: `${DUNGEONMIND_API_URL}/api/images/generate`,

    // Transform input for text generation API
    transformInput: (input: PCGInput) => {
        // Resolve random values for optional fields
        const resolvedBaseRaceId = input.baseRaceId || pickRandomValue(getBaseRaceOptions());
        const resolvedBackgroundId = input.backgroundId || pickRandomValue(getBackgroundOptions());

        return {
            concept: input.concept,
            classId: input.classId,
            level: input.level,
            raceId: resolvedBaseRaceId,
            ...(input.subraceId ? { subraceId: input.subraceId } : {}),
            backgroundId: resolvedBackgroundId
        };
    },

    // Transform input for image generation API
    // Uses description field (set by engine's image tab textarea)
    imageTransformInput: (input: PCGInput) => ({
        prompt: input.description || ''
    }),

    // Transform API response to output type
    transformOutput: (response: unknown): PCGOutput => {
        const data = response as {
            success?: boolean;
            data?: {
                character?: Character;
            };
            character?: Character;
        };

        // Handle nested response structure
        const character = data?.data?.character || data?.character;
        if (!character) {
            throw new Error('Invalid response: missing character data');
        }

        // The imagePrompt will be derived from the character using derivePortraitPrompt
        // in the factory's handleOutput callback
        return {
            character,
            imagePrompt: '' // Will be set by factory via getImagePrompt
        };
    },

    // Progress configuration
    progressConfig: {
        [GenerationType.TEXT]: TEXT_PROGRESS_CONFIG,
        [GenerationType.IMAGE]: IMAGE_PROGRESS_CONFIG
    },

    // Image configuration (sessionId and callbacks added by factory)
    // Note: models and styles are fetched from /api/images/capabilities automatically
    // Note: endpoints are relative paths - useImageLibrary.ts prepends DUNGEONMIND_API_URL
    imageConfig: {
        promptField: 'imagePrompt',
        uploadEndpoint: '/api/images/upload',
        deleteEndpoint: '/api/images/delete',
        libraryEndpoint: '/api/images/library',
        // models, styles, maxImages fetched from backend /api/images/capabilities
        defaultModel: 'flux-2-pro',
        defaultStyle: 'classic_dnd'
    },

    // Examples for quick-fill
    examples: PCG_EXAMPLES,

    // State management
    resetOnClose: false
};

// Re-export types for consumers
export type { PCGInput, LevelOption } from './PCGInputForm';
