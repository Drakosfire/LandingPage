/**
 * StatBlock Generator - Pure Engine Configuration
 * 
 * This file contains the pure configuration for the GenerationDrawerEngine,
 * WITHOUT any callback wiring. The factory pattern handles callback wiring.
 * 
 * @module StatBlockGenerator
 */

import React from 'react';
import { IconWand, IconPhoto, IconUpload, IconLibrary } from '@tabler/icons-react';
import type { StatBlockDetails } from '../../types/statblock.types';
import { DUNGEONMIND_API_URL } from '../../config';
import { normalizeStatblock } from '../../utils/statblockNormalization';
import type {
    GenerationDrawerConfig,
    ProgressConfig
} from '../../shared/GenerationDrawerEngine/factory';
import { GenerationType } from '../../shared/GenerationDrawerEngine/factory';

// =============================================================================
// INPUT/OUTPUT TYPES
// =============================================================================

/**
 * Input type for StatBlock generation.
 * Contains the user's description and generation options.
 */
export interface StatBlockInput {
    /** Creature description prompt */
    description: string;
    /** Include spellcasting abilities */
    includeSpellcasting: boolean;
    /** Include legendary actions */
    includeLegendaryActions: boolean;
    /** Include lair actions */
    includeLairActions: boolean;
}

/**
 * Output type from StatBlock generation.
 * Contains the generated statblock and metadata.
 */
export interface StatBlockOutput {
    /** Generated statblock data */
    statblock: StatBlockDetails;
    /** Prompt for image generation */
    imagePrompt: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Default input values */
export const STATBLOCK_DEFAULT_INPUT: StatBlockInput = {
    description: '',
    includeSpellcasting: false,
    includeLegendaryActions: false,
    includeLairActions: false
};

/** Quick-fill examples for the form */
export const STATBLOCK_EXAMPLES = [
    { 
        name: 'Forest Guardian',
        input: {
            description: 'A mystical creature that protects ancient forests, with bark-like skin and glowing green eyes',
            includeSpellcasting: false,
            includeLegendaryActions: false,
            includeLairActions: false
        }
    },
    { 
        name: 'Shadow Assassin',
        input: {
            description: 'A deadly humanoid that can meld with shadows and strikes from darkness',
            includeSpellcasting: false,
            includeLegendaryActions: false,
            includeLairActions: false
        }
    },
    { 
        name: 'Crystal Golem',
        input: {
            description: 'A construct made of living crystal that pulses with magical energy',
            includeSpellcasting: false,
            includeLegendaryActions: false,
            includeLairActions: false
        }
    },
    { 
        name: 'Flame Salamander',
        input: {
            description: 'A fire-breathing lizard that dwells in volcanic regions',
            includeSpellcasting: false,
            includeLegendaryActions: false,
            includeLairActions: false
        }
    },
    { 
        name: 'Storm Eagle',
        input: {
            description: 'A magnificent bird that can summon lightning and control weather',
            includeSpellcasting: true,
            includeLegendaryActions: false,
            includeLairActions: false
        }
    }
];

/** Progress configuration for text generation */
const TEXT_PROGRESS_CONFIG: ProgressConfig = {
    estimatedDurationMs: 25000, // 25 seconds typical
    milestones: [
        { at: 15, message: 'Analyzing creature description...' },
        { at: 35, message: 'Crafting stats and abilities...' },
        { at: 60, message: 'Generating actions and traits...' },
        { at: 85, message: 'Polishing final details...' }
    ],
    color: 'blue'
};

/** Progress configuration for image generation */
const IMAGE_PROGRESS_CONFIG: ProgressConfig = {
    estimatedDurationMs: 15000, // 15 seconds typical
    milestones: [
        { at: 20, message: 'Preparing prompt...' },
        { at: 60, message: 'Generating images...' },
        { at: 90, message: 'Uploading to gallery...' }
    ],
    color: 'violet'
};

// Note: Image models and styles are now fetched from /api/images/capabilities
// See DungeonMindServer/shared/image_models.py for the canonical source of truth

// =============================================================================
// ENGINE CONFIGURATION
// =============================================================================

/**
 * Pure engine configuration for StatBlock Generator.
 * 
 * This configuration is used by createServiceDrawer() to create a fully-wired
 * drawer component. Callbacks are NOT included here - the factory handles them.
 * 
 * @note InputSlot is added by the factory
 */
export const statblockEngineConfig: Omit<
    GenerationDrawerConfig<StatBlockInput, StatBlockOutput>,
    'id' | 'title' | 'InputSlot' | 'onGenerationStart' | 'onGenerationComplete' | 'onGenerationError'
> = {
    tabs: [
        {
            id: 'text',
            label: 'Text Generation',
            icon: React.createElement(IconWand, { size: 16 }),
            generationType: GenerationType.TEXT
        },
        {
            id: 'image',
            label: 'Image Generation',
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

    initialInput: STATBLOCK_DEFAULT_INPUT,

    validateInput: (input: StatBlockInput) => {
        if (!input.description || input.description.trim().length === 0) {
            return {
                valid: false,
                errors: { description: 'Description is required' }
            };
        }
        return { valid: true };
    },

    // API endpoints
    generationEndpoint: `${DUNGEONMIND_API_URL}/api/statblockgenerator/generate-statblock`,
    imageGenerationEndpoint: `${DUNGEONMIND_API_URL}/api/images/generate`,

    // Transform input for text generation API
    transformInput: (input: StatBlockInput) => ({
        description: input.description,
        includeSpellcasting: input.includeSpellcasting,
        includeLegendaryActions: input.includeLegendaryActions,
        includeLairActions: input.includeLairActions
    }),

    // Transform input for image generation API
    imageTransformInput: (input: StatBlockInput) => ({
        prompt: input.description
    }),

    // Transform API response to output type
    transformOutput: (response: unknown): StatBlockOutput => {
        const data = response as { 
            success?: boolean;
            data?: { 
                statblock?: StatBlockDetails;
                image_prompt?: string;
            };
            statblock?: StatBlockDetails;
        };

        // Handle nested response structure
        const statblock = data?.data?.statblock || data?.statblock;
        if (!statblock) {
            throw new Error('Invalid response: missing statblock data');
        }

        // Normalize the statblock
        const normalized = normalizeStatblock(statblock);

        return {
            statblock: normalized,
            imagePrompt: statblock.sdPrompt || data?.data?.image_prompt || ''
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
        defaultModel: 'flux-pro',
        defaultStyle: 'classic_dnd'
    },

    // Examples for quick-fill
    examples: STATBLOCK_EXAMPLES,

    // State management
    resetOnClose: false
};

