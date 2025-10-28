/**
 * Chunk Registry
 * 
 * Central export for all tutorial chunks and chunk utilities.
 * Each chunk represents a logical phase of the tutorial with
 * explicit state requirements and transitions.
 */

import { WELCOME_CHUNK } from './welcome';
import { TEXT_GENERATION_CHUNK } from './textGeneration';
import { EDITING_CHUNK } from './editing';
import { IMAGE_GENERATION_CHUNK } from './imageGeneration';
import { COMPLETION_CHUNK } from './completion';
import type { TutorialChunk, TutorialState } from './types';

export { WELCOME_CHUNK } from './welcome';
export { TEXT_GENERATION_CHUNK } from './textGeneration';
export { EDITING_CHUNK } from './editing';
export { IMAGE_GENERATION_CHUNK } from './imageGeneration';
export { COMPLETION_CHUNK } from './completion';

export type { TutorialChunk, TutorialState, StepHandler, TutorialCallbacks } from './types';
export {
    createEmptyState,
    createHermioneState,
    createHermioneEditedState,
    mergeState,
    statesMatch,
} from './types';

/**
 * Ordered list of all chunks in the tutorial
 * Used for sequential progression and validation
 */
export const ALL_CHUNKS: TutorialChunk[] = [
    WELCOME_CHUNK,
    TEXT_GENERATION_CHUNK,
    EDITING_CHUNK,
    IMAGE_GENERATION_CHUNK,
    COMPLETION_CHUNK,
];

/**
 * Map chunks by name for quick lookup
 */
const CHUNKS_BY_NAME: Map<string, TutorialChunk> = new Map(
    ALL_CHUNKS.map(chunk => [chunk.name, chunk])
);

/**
 * Map chunks by step name for quick lookup
 * Each chunk can contain multiple steps
 */
const CHUNKS_BY_STEP: Map<string, TutorialChunk> = new Map();
ALL_CHUNKS.forEach(chunk => {
    chunk.steps.forEach(step => {
        CHUNKS_BY_STEP.set(step, chunk);
    });
});

/**
 * Get a chunk by name
 * @param name - Chunk name (e.g., 'WELCOME', 'TEXT_GENERATION')
 * @returns The chunk, or undefined if not found
 */
export const getChunkByName = (name: string): TutorialChunk | undefined => {
    return CHUNKS_BY_NAME.get(name);
};

/**
 * Get a chunk by step name
 * @param stepName - Step name (e.g., 'welcome', 'text-tab')
 * @returns The chunk containing this step, or undefined if not found
 */
export const getChunkByStep = (stepName: string): TutorialChunk | undefined => {
    return CHUNKS_BY_STEP.get(stepName);
};

/**
 * Get all chunks containing the given step
 * (Usually just one, but defined for flexibility)
 */
export const getChunksForStep = (stepName: string): TutorialChunk[] => {
    const chunk = CHUNKS_BY_STEP.get(stepName);
    return chunk ? [chunk] : [];
};

/**
 * Get the next chunk in sequence
 * @param currentChunk - Current chunk
 * @returns The next chunk, or undefined if this is the last chunk
 */
export const getNextChunk = (currentChunk: TutorialChunk): TutorialChunk | undefined => {
    const currentIndex = ALL_CHUNKS.indexOf(currentChunk);
    return currentIndex >= 0 && currentIndex < ALL_CHUNKS.length - 1
        ? ALL_CHUNKS[currentIndex + 1]
        : undefined;
};

/**
 * Get the previous chunk in sequence
 * @param currentChunk - Current chunk
 * @returns The previous chunk, or undefined if this is the first chunk
 */
export const getPreviousChunk = (currentChunk: TutorialChunk): TutorialChunk | undefined => {
    const currentIndex = ALL_CHUNKS.indexOf(currentChunk);
    return currentIndex > 0 ? ALL_CHUNKS[currentIndex - 1] : undefined;
};

/**
 * Check if chunks transition correctly
 * @param from - Source chunk
 * @param to - Target chunk
 * @returns true if 'to' can start given the state that 'from' provides
 */
export const canTransitionChunks = (from: TutorialChunk, to: TutorialChunk): boolean => {
    return to.canStart(from.providesState as TutorialState);
};

/**
 * Get the index of a chunk in the sequence
 * @param chunk - The chunk
 * @returns 0-based index, or -1 if not found
 */
export const getChunkIndex = (chunk: TutorialChunk): number => {
    return ALL_CHUNKS.indexOf(chunk);
};

/**
 * Get total number of chunks
 */
export const getTotalChunks = (): number => {
    return ALL_CHUNKS.length;
};

/**
 * Get all steps in order across all chunks
 */
export const getAllStepsInOrder = (): string[] => {
    return ALL_CHUNKS.flatMap(chunk => chunk.steps);
};

/**
 * Validate chunk sequence is correct
 * (For development/testing)
 */
export const validateChunkSequence = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    for (let i = 0; i < ALL_CHUNKS.length - 1; i++) {
        const current = ALL_CHUNKS[i];
        const next = ALL_CHUNKS[i + 1];

        if (!canTransitionChunks(current, next)) {
            errors.push(
                `Cannot transition from ${current.name} to ${next.name}. ` +
                `${next.name} requires state: ${JSON.stringify(next.requiredState)}, ` +
                `but ${current.name} provides: ${JSON.stringify(current.providesState)}`
            );
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};
