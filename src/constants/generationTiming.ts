/**
 * Image Generation Timing Constants
 * 
 * Based on benchmark results from cloud API calls (OpenAI, Fal.ai).
 * Last updated: October 10, 2025
 * Run `pnpm benchmark:images` to regenerate with current data.
 * 
 * Source: benchmark-results.json
 * Note: Cloud APIs have consistent timing - no cold/warm start distinction
 */

export interface ModelStage {
    name: string;
    percentage: number;  // % of total generation time
    message: string;     // User-facing message for this stage
}

export interface ModelTiming {
    name: string;
    estimatedTime: number;  // ms - Average generation time from benchmarks
    stages: ModelStage[];
}

/**
 * Timing data for all supported image generation models
 * 
 * Benchmark Results (Oct 10, 2025):
 * - flux-pro: ~9.2s average (varies 6.6s - 17s)
 * - imagen4: ~21.4s average (varies 19.7s - 23s)
 * - openai: ~54.3s average (4 sequential DALL-E 3 calls)
 */
export const MODEL_TIMINGS: Record<string, ModelTiming> = {
    'flux-pro': {
        name: 'FLUX Pro',
        estimatedTime: 9222,  // Average from benchmarks: 9.2s
        stages: [
            {
                name: 'initializing',
                percentage: 10,
                message: 'Initializing FLUX Pro...'
            },
            {
                name: 'encoding',
                percentage: 20,
                message: 'Understanding your prompt...'
            },
            {
                name: 'generating',
                percentage: 60,
                message: 'Crafting your creature images...'
            },
            {
                name: 'finalizing',
                percentage: 10,
                message: 'Adding final touches...'
            }
        ]
    },
    'imagen4': {
        name: 'Imagen4',
        estimatedTime: 21381,  // Average from benchmarks: 21.4s
        stages: [
            {
                name: 'loading',
                percentage: 15,
                message: 'Loading Google Imagen4...'
            },
            {
                name: 'processing',
                percentage: 70,
                message: 'Generating high-quality images...'
            },
            {
                name: 'upscaling',
                percentage: 15,
                message: 'Enhancing image quality...'
            }
        ]
    },
    'openai': {
        name: 'OpenAI DALL-E 3',
        estimatedTime: 54336,  // Average from benchmarks: 54.3s (4 sequential calls)
        stages: [
            {
                name: 'initializing',
                percentage: 20,
                message: 'Starting DALL-E 3 generation...'
            },
            {
                name: 'generating',
                percentage: 70,
                message: 'Creating creature images (4 sequential calls)...'
            },
            {
                name: 'finalizing',
                percentage: 10,
                message: 'Finishing up...'
            }
        ]
    }
};

/**
 * Get estimated generation time for a model
 * @param model - Model identifier ('flux-pro', 'imagen4', or 'openai')
 * @returns Estimated time in milliseconds
 */
export const getEstimatedTime = (model: string): number => {
    const timing = MODEL_TIMINGS[model];

    if (!timing) {
        console.warn(`Unknown model: ${model}, using default timing`);
        return 12000; // Default fallback: 12 seconds
    }

    return timing.estimatedTime;
};

/**
 * Get timing data for a specific model
 * @param model - Model identifier
 * @returns Model timing configuration
 */
export const getModelTiming = (model: string): ModelTiming | undefined => {
    return MODEL_TIMINGS[model];
};

/**
 * List all supported models
 * @returns Array of model identifiers
 */
export const getSupportedModels = (): string[] => {
    return Object.keys(MODEL_TIMINGS);
};
