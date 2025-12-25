/**
 * Generation Drawer Engine - Type Definitions
 * 
 * This file defines the TypeScript interfaces that form the contract
 * between the GenerationDrawerEngine and consuming services.
 * 
 * @module GenerationDrawerEngine
 * @version 1.0.0
 */

import type { ReactNode, ComponentType } from 'react';
import type { MantineColor } from '@mantine/core';

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Supported generation modalities.
 * TEXT and IMAGE are implemented; others are placeholders for future expansion.
 */
export enum GenerationType {
    TEXT = 'text',
    IMAGE = 'image',
    AUDIO = 'audio',      // Future: ElevenLabs, OpenAI TTS
    VIDEO = 'video',      // Future: Runway, Pika
    MODEL_3D = 'model_3d' // Future: Meshy, Tripo3D
}

/**
 * Error codes for categorized error handling.
 */
export enum ErrorCode {
    TIMEOUT = 'TIMEOUT',
    GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',
    NETWORK = 'NETWORK',
    AUTH = 'AUTH',
    VALIDATION = 'VALIDATION',
    UNKNOWN = 'UNKNOWN'
}

// =============================================================================
// CORE TYPES
// =============================================================================

/**
 * Progress milestone configuration.
 */
export interface Milestone {
    /** Percentage (0-100) at which this milestone triggers */
    at: number;
    /** Message to display when milestone is reached */
    message: string;
}

/**
 * Progress bar configuration for a generation type.
 */
export interface ProgressConfig {
    /** Expected generation time in milliseconds */
    estimatedDurationMs: number;
    /** Array of milestones with messages */
    milestones?: Milestone[];
    /** Progress bar color (Mantine color) */
    color?: MantineColor;
}

/**
 * Tab configuration within the drawer.
 */
export interface TabConfig {
    /** Unique tab identifier */
    id: string;
    /** Display label */
    label: string;
    /** Tab icon (typically Tabler icon) */
    icon?: ReactNode;
    /** Links tab to generation type; undefined for custom content tabs */
    generationType?: GenerationType;
    /** Whether tab is disabled */
    disabled?: boolean;
    /** Badge content (e.g., image count) */
    badge?: string | number;
    /** Content type for special tabs (e.g., 'upload', 'library') */
    contentType?: 'upload' | 'library';
}

/**
 * Quick-fill example configuration.
 * @typeParam TInput - The input type for the service
 */
export interface ExampleConfig<TInput> {
    /** Example display name */
    name: string;
    /** Input data to populate the form */
    input: TInput;
    /** Optional description */
    description?: string;
    /** Optional icon */
    icon?: ReactNode;
}

/**
 * Generated image entity.
 */
export interface GeneratedImage {
    /** Unique identifier (UUID) */
    id: string;
    /** CDN URL */
    url: string;
    /** Generation prompt used */
    prompt: string;
    /** ISO timestamp of creation */
    createdAt: string;
    /** Session that created this image */
    sessionId: string;
    /** Service that created the image */
    service: string;
}

/**
 * Tutorial mode configuration.
 */
export interface TutorialConfig {
    /** Bypass authentication checks */
    mockAuthState?: boolean;
    /** Pre-loaded gallery images for tutorial */
    mockImages?: GeneratedImage[];
    /** Mock data to return from generation (for text generation) */
    mockData?: unknown;
    /** Progress bar simulation duration (default: 7000ms) */
    simulatedDurationMs?: number;
    /** Callback when tutorial simulation completes */
    onTutorialComplete?: () => void;
}

/**
 * Standardized error structure.
 */
export interface GenerationError {
    /** Error category */
    code: ErrorCode;
    /** User-facing title */
    title: string;
    /** User-facing message */
    message: string;
    /** Whether retry is possible */
    retryable: boolean;
}

/**
 * Input validation result.
 */
export interface ValidationResult {
    /** Whether input is valid */
    valid: boolean;
    /** Field-specific error messages */
    errors?: Record<string, string>;
}

// =============================================================================
// SLOT COMPONENT PROPS
// =============================================================================

/**
 * Props passed to service-provided input form component.
 * @typeParam TInput - The input type for the service
 */
export interface InputSlotProps<TInput> {
    /** Current input state */
    value: TInput;
    /** Update input state (partial merge) */
    onChange: (value: Partial<TInput>) => void;
    /** Whether generation is in progress */
    isGenerating: boolean;
    /** Whether in tutorial mode */
    isTutorialMode: boolean;
    /** Validation errors by field */
    errors?: Record<string, string>;
}

/**
 * Props for optional output display component.
 * @typeParam TOutput - The output type for the service
 */
export interface OutputSlotProps<TOutput> {
    /** Generation result */
    output: TOutput | null;
    /** Whether loading */
    isLoading: boolean;
    /** Selection callback */
    onSelect?: (item: unknown, index: number) => void;
    /** Currently selected index */
    selectedIndex?: number;
}

// =============================================================================
// IMAGE CONFIGURATION
// =============================================================================

/**
 * Image generation configuration.
 * @typeParam TOutput - The output type that contains image prompt
 */
export interface ImageConfig<TOutput> {
    /** Field in output containing image prompt */
    promptField: keyof TOutput;
    /** Callback when images are generated */
    onImageGenerated?: (images: GeneratedImage[]) => void;
    /** Callback when user selects an image */
    onImageSelected?: (url: string, index: number) => void;
    /** API endpoint for uploading images (enables upload tab) */
    uploadEndpoint?: string;
    /** API endpoint for fetching library images (enables library tab) */
    libraryEndpoint?: string;
    /** API endpoint for deleting images */
    deleteEndpoint?: string;
    /** Current session ID for filtering project gallery */
    sessionId?: string;
    /** Maximum upload file size in bytes (default: 5MB) */
    maxUploadSize?: number;
    /** Accepted MIME types for upload (default: ['image/jpeg', 'image/png', 'image/webp']) */
    acceptedUploadTypes?: string[];
    /** Allow multiple file uploads at once (default: false) */
    allowMultipleUploads?: boolean;
}

// =============================================================================
// MAIN CONFIGURATION
// =============================================================================

/**
 * Main configuration object for a service's generation drawer.
 * 
 * Services provide this configuration to customize the drawer behavior
 * while the engine handles the shell, progress, and common interactions.
 * 
 * @typeParam TInput - The input type for the service
 * @typeParam TOutput - The output type for the service
 * 
 * @example
 * ```typescript
 * const statblockConfig: GenerationDrawerConfig<StatBlockInput, StatBlockDetails> = {
 *   id: 'statblock',
 *   title: 'AI Generation',
 *   tabs: [
 *     { id: 'text', label: 'Text Generation', icon: <IconWand />, generationType: GenerationType.TEXT },
 *     { id: 'image', label: 'Image Generation', icon: <IconPhoto />, generationType: GenerationType.IMAGE },
 *   ],
 *   InputSlot: StatBlockInputForm,
 *   initialInput: { prompt: '', options: { spellcasting: false } },
 *   generationEndpoint: '/api/statblockgenerator/generate-statblock',
 *   transformInput: (input) => ({ description: input.prompt, ...input.options }),
 *   transformOutput: (response) => normalizeStatblock(response.data.statblock),
 * };
 * ```
 */
export interface GenerationDrawerConfig<TInput, TOutput> {
    // === Identity ===
    /** Service identifier (e.g., 'statblock', 'character', 'card') */
    id: string;
    /** Drawer title */
    title: string;

    // === Tabs ===
    /** Tab configuration array */
    tabs: TabConfig[];
    /** Initial active tab ID */
    defaultTab?: string;

    // === Input Slot ===
    /** Service-provided input form component */
    InputSlot: ComponentType<InputSlotProps<TInput>>;
    /** Default input values */
    initialInput: TInput;
    /** Input validation function */
    validateInput?: (input: TInput) => ValidationResult;

    // === Generation ===
    /** API endpoint for generation (POST) */
    generationEndpoint: string;
    /** Transform input for API request body */
    transformInput: (input: TInput) => Record<string, unknown>;
    /** Transform API response to output type */
    transformOutput: (response: unknown) => TOutput;

    // === Callbacks ===
    /** Called when generation starts */
    onGenerationStart?: () => void;
    /** Called on successful generation */
    onGenerationComplete?: (output: TOutput) => void;
    /** Called on generation error */
    onGenerationError?: (error: GenerationError) => void;

    // === Progress ===
    /** Progress configuration per generation type */
    progressConfig?: Partial<Record<GenerationType, ProgressConfig>>;

    // === Optional Features ===
    /** Enable image upload via drag & drop */
    enableUpload?: boolean;
    /** Image upload API endpoint */
    uploadEndpoint?: string;
    /** Enable library browsing */
    enableLibrary?: boolean;
    /** Library API endpoint */
    libraryEndpoint?: string;

    // === Examples ===
    /** Quick-fill example configurations */
    examples?: ExampleConfig<TInput>[];

    // === Tutorial ===
    /** Tutorial mode configuration */
    tutorialConfig?: TutorialConfig;

    // === Image ===
    /** Image generation configuration */
    imageConfig?: ImageConfig<TOutput>;

    // === State Management ===
    /** Reset input/tab/state to initial values when drawer closes (default: false) */
    resetOnClose?: boolean;
    /** Tutorial mode - uses simulated generation with mock data */
    isTutorialMode?: boolean;
}

// =============================================================================
// ENGINE COMPONENT PROPS
// =============================================================================

/**
 * Props for the GenerationDrawerEngine component.
 * @typeParam TInput - The input type for the service
 * @typeParam TOutput - The output type for the service
 */
export interface GenerationDrawerEngineProps<TInput, TOutput> {
    /** Drawer configuration */
    config: GenerationDrawerConfig<TInput, TOutput>;
    /** Whether drawer is open */
    opened: boolean;
    /** Close drawer callback */
    onClose: () => void;
    /** Optional service context (e.g., React context value) */
    context?: unknown;
    /** Whether in tutorial mode (bypasses API, uses mock data) */
    isTutorialMode?: boolean;
    /** Initial images to display in gallery */
    initialImages?: GeneratedImage[];
    /** Callback when generation completes successfully */
    onGenerationComplete?: (output: TOutput) => void;
}

