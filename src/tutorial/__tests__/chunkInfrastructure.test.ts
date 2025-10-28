/**
 * Tests for Tutorial Chunk Infrastructure
 * 
 * Validates:
 * - Chunk definitions are properly structured
 * - State transitions between chunks are valid
 * - Required/provided states match up correctly
 * - Utility functions work as expected
 */

import {
    WELCOME_CHUNK,
    TEXT_GENERATION_CHUNK,
    EDITING_CHUNK,
    IMAGE_GENERATION_CHUNK,
    COMPLETION_CHUNK,
    ALL_CHUNKS,
    getChunkByName,
    getChunkByStep,
    canTransitionChunks,
    validateChunkSequence,
    createEmptyState,
    createHermioneState,
    statesMatch,
} from '../chunks';

describe('Tutorial Chunk Infrastructure', () => {
    describe('Chunk definitions exist', () => {
        it('should have WELCOME chunk', () => {
            expect(WELCOME_CHUNK).toBeDefined();
            expect(WELCOME_CHUNK.name).toBe('WELCOME');
        });

        it('should have TEXT_GENERATION chunk', () => {
            expect(TEXT_GENERATION_CHUNK).toBeDefined();
            expect(TEXT_GENERATION_CHUNK.name).toBe('TEXT_GENERATION');
        });

        it('should have EDITING chunk', () => {
            expect(EDITING_CHUNK).toBeDefined();
            expect(EDITING_CHUNK.name).toBe('EDITING');
        });

        it('should have IMAGE_GENERATION chunk', () => {
            expect(IMAGE_GENERATION_CHUNK).toBeDefined();
            expect(IMAGE_GENERATION_CHUNK.name).toBe('IMAGE_GENERATION');
        });

        it('should have COMPLETION chunk', () => {
            expect(COMPLETION_CHUNK).toBeDefined();
            expect(COMPLETION_CHUNK.name).toBe('COMPLETION');
        });

        it('should have 5 chunks total', () => {
            expect(ALL_CHUNKS).toHaveLength(5);
        });
    });

    describe('Chunk structure validation', () => {
        ALL_CHUNKS.forEach(chunk => {
            describe(`${chunk.name} chunk`, () => {
                it('should have required properties', () => {
                    expect(chunk.name).toBeDefined();
                    expect(chunk.steps).toBeDefined();
                    expect(Array.isArray(chunk.steps)).toBe(true);
                    expect(chunk.purpose).toBeDefined();
                    expect(chunk.requiredState).toBeDefined();
                    expect(chunk.providesState).toBeDefined();
                });

                it('should have lifecycle hooks', () => {
                    expect(chunk.setup).toBeDefined();
                    expect(typeof chunk.setup).toBe('function');
                    expect(chunk.cleanup).toBeDefined();
                    expect(typeof chunk.cleanup).toBe('function');
                });

                it('should have handlers object', () => {
                    expect(chunk.handlers).toBeDefined();
                    expect(typeof chunk.handlers).toBe('object');
                    // Should have at least one handler
                    expect(Object.keys(chunk.handlers).length).toBeGreaterThan(0);
                });

                it('should have validation methods', () => {
                    expect(chunk.canStart).toBeDefined();
                    expect(typeof chunk.canStart).toBe('function');
                    expect(chunk.isComplete).toBeDefined();
                    expect(typeof chunk.isComplete).toBe('function');
                });

                it('should have matching handler count to steps', () => {
                    const handlerCount = Object.keys(chunk.handlers).length;
                    expect(handlerCount).toBe(chunk.steps.length);
                });
            });
        });
    });

    describe('State transitions between chunks', () => {
        it('should allow transition from WELCOME to TEXT_GENERATION', () => {
            const canTransition = canTransitionChunks(WELCOME_CHUNK, TEXT_GENERATION_CHUNK);
            expect(canTransition).toBe(true);
        });

        it('should allow transition from TEXT_GENERATION to EDITING', () => {
            const canTransition = canTransitionChunks(TEXT_GENERATION_CHUNK, EDITING_CHUNK);
            expect(canTransition).toBe(true);
        });

        it('should allow transition from EDITING to IMAGE_GENERATION', () => {
            const canTransition = canTransitionChunks(EDITING_CHUNK, IMAGE_GENERATION_CHUNK);
            expect(canTransition).toBe(true);
        });

        it('should allow transition from IMAGE_GENERATION to COMPLETION', () => {
            const canTransition = canTransitionChunks(IMAGE_GENERATION_CHUNK, COMPLETION_CHUNK);
            expect(canTransition).toBe(true);
        });
    });

    describe('Chunk sequence validation', () => {
        it('should validate complete chunk sequence', () => {
            const result = validateChunkSequence();
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('State validation methods', () => {
        it('WELCOME chunk should accept empty state', () => {
            const emptyState = createEmptyState();
            expect(WELCOME_CHUNK.canStart(emptyState)).toBe(true);
        });

        it('TEXT_GENERATION should not accept empty state', () => {
            const emptyState = createEmptyState();
            expect(TEXT_GENERATION_CHUNK.canStart(emptyState)).toBe(false);
        });

        it('WELCOME chunk should provide correct state', () => {
            const emptyState = createEmptyState();
            expect(WELCOME_CHUNK.isComplete({ ...emptyState, ...WELCOME_CHUNK.providesState })).toBe(true);
        });
    });

    describe('Chunk lookup utilities', () => {
        it('should find chunk by name', () => {
            const chunk = getChunkByName('WELCOME');
            expect(chunk).toBe(WELCOME_CHUNK);
        });

        it('should find chunk by step name', () => {
            const chunk = getChunkByStep('welcome');
            expect(chunk).toBe(WELCOME_CHUNK);
        });

        it('should return undefined for unknown chunk name', () => {
            const chunk = getChunkByName('UNKNOWN');
            expect(chunk).toBeUndefined();
        });

        it('should return undefined for unknown step', () => {
            const chunk = getChunkByStep('unknown-step');
            expect(chunk).toBeUndefined();
        });
    });

    describe('State matching utilities', () => {
        it('should match empty state correctly', () => {
            const emptyState = createEmptyState();
            const match = statesMatch({ canvas: 'empty', drawer: 'closed' }, emptyState);
            expect(match).toBe(true);
        });

        it('should not match when canvas differs', () => {
            const hermioineState = createHermioneState();
            const match = statesMatch({ canvas: 'empty' }, hermioineState);
            expect(match).toBe(false);
        });
    });

    describe('Chunk steps', () => {
        it('WELCOME should have 2 steps', () => {
            expect(WELCOME_CHUNK.steps.length).toBe(2);
        });

        it('TEXT_GENERATION should have 4 steps', () => {
            expect(TEXT_GENERATION_CHUNK.steps.length).toBe(4);
        });

        it('EDITING should have 3 steps', () => {
            expect(EDITING_CHUNK.steps.length).toBe(3);
        });

        it('IMAGE_GENERATION should have 7 steps', () => {
            expect(IMAGE_GENERATION_CHUNK.steps.length).toBe(7);
        });

        it('COMPLETION should have 1 step', () => {
            expect(COMPLETION_CHUNK.steps.length).toBe(1);
        });

        it('total should be 17 steps', () => {
            const totalSteps = ALL_CHUNKS.reduce((sum, chunk) => sum + chunk.steps.length, 0);
            expect(totalSteps).toBe(17);
        });
    });
});
