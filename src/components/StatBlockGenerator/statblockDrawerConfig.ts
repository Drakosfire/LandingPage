/**
 * StatBlock Generator - Generation Drawer Engine Configuration
 * 
 * Defines the configuration for integrating StatBlockGenerator with the 
 * reusable GenerationDrawerEngine.
 * 
 * @module StatBlockGenerator
 */

import type { 
    GenerationDrawerConfig, 
    GenerationError,
    ImageGenerationModel,
    ImageGenerationStyle,
    ProgressConfig 
} from '../../shared/GenerationDrawerEngine';
import { GenerationType } from '../../shared/GenerationDrawerEngine';
import { IconWand, IconPhoto, IconUpload, IconLibrary } from '@tabler/icons-react';
import React from 'react';
import type { StatBlockDetails } from '../../types/statblock.types';
import { DUNGEONMIND_API_URL } from '../../config';
import { normalizeStatblock } from '../../utils/statblockNormalization';

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
        description: 'A mystical creature that protects ancient forests, with bark-like skin and glowing green eyes',
        input: {
            description: 'A mystical creature that protects ancient forests, with bark-like skin and glowing green eyes',
            includeSpellcasting: false,
            includeLegendaryActions: false,
            includeLairActions: false
        }
    },
    { 
        name: 'Shadow Assassin',
        description: 'A deadly humanoid that can meld with shadows and strikes from darkness',
        input: {
            description: 'A deadly humanoid that can meld with shadows and strikes from darkness',
            includeSpellcasting: false,
            includeLegendaryActions: false,
            includeLairActions: false
        }
    },
    { 
        name: 'Crystal Golem',
        description: 'A construct made of living crystal that pulses with magical energy',
        input: {
            description: 'A construct made of living crystal that pulses with magical energy',
            includeSpellcasting: false,
            includeLegendaryActions: false,
            includeLairActions: false
        }
    },
    { 
        name: 'Flame Salamander',
        description: 'A fire-breathing lizard that dwells in volcanic regions',
        input: {
            description: 'A fire-breathing lizard that dwells in volcanic regions',
            includeSpellcasting: false,
            includeLegendaryActions: false,
            includeLairActions: false
        }
    },
    { 
        name: 'Storm Eagle',
        description: 'A magnificent bird that can summon lightning and control weather',
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

/** Default image generation models */
const IMAGE_MODELS: ImageGenerationModel[] = [
    { id: 'flux-pro', name: 'FLUX Pro', description: 'High quality, balanced speed', default: true },
    { id: 'imagen4', name: 'Imagen 4', description: "Google's model, premium quality" },
    { id: 'openai', name: 'OpenAI GPT-Image', description: 'Fast, cost-effective' }
];

/** Default image generation styles */
const IMAGE_STYLES: ImageGenerationStyle[] = [
    { id: 'classic_dnd', name: 'Classic D&D', suffix: 'in the style of classic Dungeons & Dragons art, detailed fantasy illustration', default: true },
    { id: 'oil_painting', name: 'Oil Painting', suffix: 'oil painting, traditional fantasy art, detailed brushwork' },
    { id: 'fantasy_book', name: 'Fantasy Book Cover', suffix: 'epic fantasy book cover art, dramatic lighting, cinematic composition' },
    { id: 'dark_gothic', name: 'Dark Gothic', suffix: 'dark gothic fantasy art, dramatic shadows, moody atmosphere' },
    { id: 'anime', name: 'Anime Style', suffix: 'anime fantasy art, vibrant colors, dynamic pose' },
    { id: 'realistic', name: 'Photorealistic', suffix: 'photorealistic fantasy creature, highly detailed, 8k resolution' }
];

// =============================================================================
// CONFIGURATION FACTORY
// =============================================================================

export interface CreateStatBlockConfigOptions {
    /** Current session ID for image management */
    sessionId: string;
    /** Callback when generation starts */
    onGenerationStart?: () => void;
    /** Callback with generated statblock */
    onGenerationComplete?: (output: StatBlockOutput) => void;
    /** Callback when generation fails */
    onGenerationError?: (error: GenerationError) => void;
    /** Callback when images are generated */
    onImageGenerated?: (images: { url: string; id: string }[]) => void;
    /** Callback when an image is selected */
    onImageSelected?: (url: string, index: number) => void;
    /** Tutorial mode - bypasses auth checks */
    isTutorialMode?: boolean;
    /** Mock auth state for tutorial */
    mockAuthState?: boolean;
    /** Simulated duration for tutorial progress */
    tutorialDurationMs?: number;
    /** Callback when tutorial simulation completes */
    onTutorialComplete?: () => void;
    /** Dynamic models from backend capabilities */
    models?: ImageGenerationModel[];
    /** Dynamic styles from backend capabilities */
    styles?: ImageGenerationStyle[];
    /** Max images from backend capabilities */
    maxImages?: number;
}

/**
 * Creates a GenerationDrawerConfig for StatBlockGenerator.
 * 
 * This factory function creates a fully configured config object that can be
 * passed to GenerationDrawerEngine. It connects the engine to StatBlock-specific
 * API endpoints and state management.
 */
export function createStatBlockDrawerConfig(
    InputSlot: React.ComponentType<{
        value: StatBlockInput;
        onChange: (value: Partial<StatBlockInput>) => void;
        isGenerating: boolean;
        isTutorialMode: boolean;
        errors?: Record<string, string>;
    }>,
    options: CreateStatBlockConfigOptions
): GenerationDrawerConfig<StatBlockInput, StatBlockOutput> {
    const {
        sessionId,
        onGenerationStart,
        onGenerationComplete,
        onGenerationError,
        onImageGenerated,
        onImageSelected,
        isTutorialMode = false,
        mockAuthState = false,
        tutorialDurationMs = 7000,
        onTutorialComplete,
        models,
        styles,
        maxImages
    } = options;

    return {
        id: 'statblock',
        title: 'AI Generation',

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

        InputSlot,
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

        // Image configuration
        imageConfig: {
            promptField: 'imagePrompt',
            uploadEndpoint: `${DUNGEONMIND_API_URL}/api/images/upload`,
            deleteEndpoint: `${DUNGEONMIND_API_URL}/api/images/delete`,
            libraryEndpoint: `${DUNGEONMIND_API_URL}/api/images/library`,
            sessionId,
            onImageGenerated: onImageGenerated as ((images: { id: string; url: string; prompt: string; createdAt: string; sessionId: string; service: string }[]) => void) | undefined,
            onImageSelected,
            // Dynamic capabilities
            models: models || IMAGE_MODELS,
            defaultModel: 'flux-pro',
            styles: styles || IMAGE_STYLES,
            defaultStyle: 'classic_dnd',
            maxImages: maxImages || 4,
            defaultNumImages: 4
        },

        // Examples for quick-fill
        examples: STATBLOCK_EXAMPLES,

        // Callbacks
        onGenerationStart,
        onGenerationComplete,
        onGenerationError,

        // Tutorial configuration
        tutorialConfig: isTutorialMode ? {
            mockAuthState,
            simulatedDurationMs: tutorialDurationMs,
            simulateGeneration: true, // Use simulated generation in tutorial
            onTutorialComplete
        } : undefined,

        // State management
        resetOnClose: false, // Preserve state on close
        isTutorialMode
    };
}

