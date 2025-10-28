/**
 * Chunk Utility Functions
 * 
 * Helper functions for working with chunks during tutorial execution.
 * Used for determining current chunk, validating state, and managing transitions.
 */

import {
    getChunkByStep,
    getChunkIndex,
    getTotalChunks,
} from '../chunks';
import { getStepName } from '../../constants/tutorialSteps';
import type { TutorialChunk, TutorialState } from '../chunks';

/**
 * Get the current chunk based on step index
 * @param stepIndex - Current step index (0-based)
 * @param tutorialSteps - Array of tutorial steps
 * @returns The chunk containing this step, or undefined if not found
 */
export const getCurrentChunk = (stepIndex: number, tutorialSteps: any[]): TutorialChunk | undefined => {
    if (stepIndex < 0 || stepIndex >= tutorialSteps.length) {
        return undefined;
    }

    const stepName = getStepName(stepIndex);
    if (!stepName) {
        return undefined;
    }

    return getChunkByStep(stepName);
};

/**
 * Get the current step name from index
 * @param stepIndex - Current step index (0-based)
 * @returns Step name or undefined
 */
export const getCurrentStepName = (stepIndex: number): string | undefined => {
    return getStepName(stepIndex);
};

/**
 * Check if a state meets the requirements of a chunk
 * @param chunk - The chunk to check
 * @param state - Current state
 * @returns true if state meets required conditions
 */
export const stateIsValidForChunk = (chunk: TutorialChunk, state: Partial<TutorialState>): boolean => {
    return chunk.canStart(state as TutorialState);
};

/**
 * Check if a chunk has been completed with given state
 * @param chunk - The chunk to check
 * @param state - Current state
 * @returns true if state indicates chunk completion
 */
export const chunkIsComplete = (chunk: TutorialChunk, state: Partial<TutorialState>): boolean => {
    return chunk.isComplete(state as TutorialState);
};

/**
 * Validate that a state transition between chunks is valid
 * @param fromChunk - Source chunk
 * @param toChunk - Target chunk
 * @param providedState - State that fromChunk provides
 * @returns Validation result with errors if invalid
 */
export const validateChunkTransition = (
    fromChunk: TutorialChunk,
    toChunk: TutorialChunk,
    providedState: Partial<TutorialState>
): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check that toChunk can start with the state fromChunk provides
    if (!toChunk.canStart(providedState as TutorialState)) {
        errors.push(
            `${toChunk.name} cannot start after ${fromChunk.name}. ` +
            `${toChunk.name} requires: ${JSON.stringify(toChunk.requiredState)}, ` +
            `but ${fromChunk.name} provides: ${JSON.stringify(providedState)}`
        );
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

/**
 * Get progress information for the tutorial
 * @param stepIndex - Current step index
 * @param totalSteps - Total number of steps
 * @returns Progress object with counts and percentages
 */
export const getTutorialProgress = (
    stepIndex: number,
    totalSteps: number
): {
    currentStep: number;
    totalSteps: number;
    percentComplete: number;
    currentChunk?: TutorialChunk;
    currentChunkProgress?: { current: number; total: number };
} => {
    const currentChunk = getCurrentChunk(stepIndex, new Array(totalSteps));
    let chunkProgress;

    if (currentChunk) {
        // Find which step in this chunk we're currently on
        const currentStepName = getStepName(stepIndex);
        const stepPositionInChunk = currentChunk.steps.indexOf(currentStepName ?? '');
        const stepsInChunk = currentChunk.steps.length;

        // If step is found in chunk, calculate progress within chunk
        if (stepPositionInChunk >= 0) {
            chunkProgress = {
                current: stepPositionInChunk + 1,
                total: stepsInChunk,
            };
        }
    }

    return {
        currentStep: stepIndex + 1,
        totalSteps,
        percentComplete: Math.round(((stepIndex + 1) / totalSteps) * 100),
        currentChunk,
        currentChunkProgress: chunkProgress,
    };
};

/**
 * Check if we can skip ahead to a specific step (for debug mode)
 * @param targetStepName - Target step name
 * @param currentState - Current state
 * @returns Validation result
 */
export const canSkipToStep = (
    targetStepName: string,
    currentState: TutorialState
): { canSkip: boolean; reason?: string } => {
    const chunk = getChunkByStep(targetStepName);

    if (!chunk) {
        return {
            canSkip: false,
            reason: `Step "${targetStepName}" not found in any chunk`,
        };
    }

    if (!chunk.canStart(currentState)) {
        return {
            canSkip: false,
            reason: `Cannot start ${chunk.name}. Required state not met.`,
        };
    }

    return { canSkip: true };
};

/**
 * Get a human-readable description of a chunk
 * @param chunk - The chunk
 * @returns Formatted string with chunk info
 */
export const getChunkDescription = (chunk: TutorialChunk): string => {
    const index = getChunkIndex(chunk);
    const total = getTotalChunks();
    const stepCount = chunk.steps.length;

    return `${chunk.name} [${index + 1}/${total}] - ${chunk.purpose} (${stepCount} steps)`;
};

/**
 * Debug helper: Print chunk sequence
 */
export const printChunkSequence = (): void => {
    console.log('📋 Tutorial Chunk Sequence:');
    console.log('============================');

    const chunks = require('../chunks').ALL_CHUNKS;
    chunks.forEach((chunk: TutorialChunk, index: number) => {
        const stepsStr = chunk.steps.join(', ');
        console.log(
            `${index + 1}. ${chunk.name} → ` +
            `${chunk.purpose} (${chunk.steps.length} steps)`
        );
        console.log(`   Required: ${JSON.stringify(chunk.requiredState)}`);
        console.log(`   Provides: ${JSON.stringify(chunk.providesState)}`);
        console.log(`   Steps: ${stepsStr}`);
    });
};

/**
 * ============================================
 * TUTORIAL LOGGING SYSTEM
 * ============================================
 * 
 * Clean, focused logging for chunk-based tutorial execution.
 * All logs use consistent emoji/prefix system for easy filtering.
 */

/**
 * Tutorial logging levels
 */
export enum TutorialLogLevel {
    TRACE = 0,   // Very detailed, can be noisy
    DEBUG = 1,   // Development debugging
    INFO = 2,    // Normal operation
    WARN = 3,    // Warnings, potential issues
    ERROR = 4,   // Errors only
}

/**
 * Current log level (can be changed via TutorialLogger.setLevel())
 */
let currentLogLevel = TutorialLogLevel.INFO;

/**
 * Chunk-focused tutorial logger
 * 
 * Usage:
 *   TutorialLogger.chunkStart('WELCOME');
 *   TutorialLogger.stepExecute('WELCOME', 'welcome', 'next');
 *   TutorialLogger.chunkComplete('WELCOME');
 */
export const TutorialLogger = {
    /**
     * Set the global log level
     */
    setLevel: (level: TutorialLogLevel) => {
        currentLogLevel = level;
    },

    /**
     * Log when a chunk starts
     */
    chunkStart: (chunkName: string) => {
        if (currentLogLevel <= TutorialLogLevel.INFO) {
            console.log(`📖 [Chunk] Starting: ${chunkName}`);
        }
    },

    /**
     * Log when a chunk completes
     */
    chunkComplete: (chunkName: string) => {
        if (currentLogLevel <= TutorialLogLevel.INFO) {
            console.log(`✅ [Chunk] Complete: ${chunkName}`);
        }
    },

    /**
     * Log step execution
     */
    stepExecute: (chunkName: string, stepName: string, action: string) => {
        if (currentLogLevel <= TutorialLogLevel.DEBUG) {
            console.log(`  → [${chunkName}] ${stepName} (${action})`);
        }
    },

    /**
     * Log handler execution
     */
    handlerExecute: (stepName: string) => {
        if (currentLogLevel <= TutorialLogLevel.TRACE) {
            console.log(`    ⚙️  Handler: ${stepName}`);
        }
    },

    /**
     * Log callback invocation
     */
    callbackInvoke: (callbackName: string, args?: any) => {
        if (currentLogLevel <= TutorialLogLevel.TRACE) {
            console.log(`      → Callback: ${callbackName}`, args || '');
        }
    },

    /**
     * Log state transition
     */
    stateChange: (from: string, to: string) => {
        if (currentLogLevel <= TutorialLogLevel.DEBUG) {
            console.log(`🔄 [State] ${from} → ${to}`);
        }
    },

    /**
     * Log warning
     */
    warn: (message: string, context?: any) => {
        if (currentLogLevel <= TutorialLogLevel.WARN) {
            console.warn(`⚠️  [Tutorial] ${message}`, context || '');
        }
    },

    /**
     * Log error
     */
    error: (message: string, error?: any) => {
        console.error(`❌ [Tutorial] ${message}`, error || '');
    },

    /**
     * Log info message
     */
    info: (message: string, context?: any) => {
        if (currentLogLevel <= TutorialLogLevel.INFO) {
            console.log(`ℹ️  [Tutorial] ${message}`, context || '');
        }
    },
};

/**
 * Create an integrated handler that delegates to chunk handlers
 * This factory creates callback-aware handler factories for each chunk
 * 
 * Usage in TutorialTour.tsx:
 *   const executeChunkHandler = createChunkHandlerExecutor(callbacks);
 *   await executeChunkHandler(stepName, callbackProps);
 * 
 * @param callbacks - The tutorial callbacks from TutorialTour
 * @returns A function that can execute any chunk handler with callbacks in scope
 */
export const createChunkHandlerExecutor = (
    callbacks: any // TutorialCallbacks - using any to avoid circular imports
) => {
    return async (stepName: string, callbackProps: any) => {
        // Get the chunk that contains this step
        const chunk = getChunkByStep(stepName);

        if (!chunk) {
            console.warn(`⚠️ No chunk found for step: ${stepName}`);
            return;
        }

        // Get the handler for this step
        const handler = chunk.handlers[stepName];

        if (!handler) {
            console.warn(`⚠️ No handler found for step: ${stepName} in chunk: ${chunk.name}`);
            return;
        }

        // Execute the handler
        // The handler is wrapped so it has access to callbacks through closure
        try {
            // Create a wrapped handler that has callbacks available
            const wrappedHandler = createHandlerWithCallbacks(handler, callbacks);
            await wrappedHandler(callbackProps);
        } catch (error) {
            console.error(`❌ Error executing handler for ${stepName}:`, error);
        }
    };
};

/**
 * Wrap a single handler to provide callbacks through closure
 * This is the key integration pattern that connects handlers to TutorialTour callbacks
 * 
 * @param handler - The original handler function
 * @param callbacks - The available callbacks
 * @returns A new handler that can call callbacks through closure
 */
const createHandlerWithCallbacks = (handler: any, callbacks: any) => {
    return async (data: any) => {
        // Make callbacks available through this scope
        // Handler can now theoretically access them (though current implementation doesn't need to)
        await handler(data);

        // TODO: When handlers are refactored to use callbacks, they would do:
        // if (data.action === 'next') {
        //   callbacks.onOpenGenerationDrawer?.();
        // }
    };
};
