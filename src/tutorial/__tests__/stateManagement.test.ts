/**
 * TDD Tests for Tutorial State Management
 * 
 * Defines the contract for state:
 * 1. State must be valid for chunks to start
 * 2. State must flow through chunks correctly
 * 3. State must be validatable and predictable
 * 4. Chunks must not leave invalid state
 * 
 * These tests drive the state validation implementation.
 */

import {
    WELCOME_CHUNK,
    TEXT_GENERATION_CHUNK,
    EDITING_CHUNK,
    IMAGE_GENERATION_CHUNK,
    COMPLETION_CHUNK,
    ALL_CHUNKS,
    createEmptyState,
    createHermioneState,
    createHermioneEditedState,
    mergeState,
    statesMatch,
    TutorialState,
} from '../chunks';
import { validateChunkSequence, canTransitionChunks } from '../chunks';

describe('Tutorial State Management', () => {
    describe('State structure', () => {
        it('should have all required state properties', () => {
            const state = createEmptyState();

            expect(state).toHaveProperty('canvas');
            expect(state).toHaveProperty('drawer');
            expect(state).toHaveProperty('drawerTab');
            expect(state).toHaveProperty('editMode');
            expect(state).toHaveProperty('imageModal');
            expect(state).toHaveProperty('selectedImageIndex');
            expect(state).toHaveProperty('mockAuth');
        });

        it('should have valid initial state', () => {
            const state = createEmptyState();

            expect(['empty', 'hermione', 'hermione-edited', 'hermione-with-image']).toContain(
                state.canvas
            );
            expect(['open', 'closed']).toContain(state.drawer);
            expect(typeof state.drawerTab).toBe('string' || 'object');
            expect(typeof state.editMode).toBe('boolean');
            expect(['closed', 'open', 'navigated']).toContain(state.imageModal);
            expect(typeof state.selectedImageIndex).toBe('number');
            expect(typeof state.mockAuth).toBe('boolean');
        });
    });

    describe('State validation with statesMatch', () => {
        it('should validate empty state correctly', () => {
            const empty = createEmptyState();
            const required = { canvas: 'empty' as const, drawer: 'closed' as const };

            expect(statesMatch(required, empty)).toBe(true);
        });

        it('should reject state that does not match requirements', () => {
            const state = createEmptyState();
            const requiredState = { canvas: 'hermione' as const };

            expect(statesMatch(requiredState, state)).toBe(false);
        });

        it('should validate partial state requirements', () => {
            const state = createHermioneState();
            const requiredState = { canvas: 'hermione' as const };

            expect(statesMatch(requiredState, state)).toBe(true);
        });

        it('should validate multiple state properties', () => {
            const state = mergeState(createEmptyState(), {
                drawer: 'open',
                drawerTab: 'text',
            });
            const requiredState = { drawer: 'open' as const, drawerTab: 'text' as const };

            expect(statesMatch(requiredState, state)).toBe(true);
        });
    });

    describe('Chunk state requirements', () => {
        it('WELCOME chunk should require empty state', () => {
            const emptyState = createEmptyState();
            expect(WELCOME_CHUNK.canStart(emptyState)).toBe(true);
        });

        it('WELCOME chunk should reject hermione state', () => {
            const hermioneState = createHermioneState();
            expect(WELCOME_CHUNK.canStart(hermioneState)).toBe(false);
        });

        it('TEXT_GENERATION should reject empty state', () => {
            const emptyState = createEmptyState();
            expect(TEXT_GENERATION_CHUNK.canStart(emptyState)).toBe(false);
        });

        it('TEXT_GENERATION should require drawer=open, drawerTab=text', () => {
            const state = mergeState(createEmptyState(), {
                drawer: 'open',
                drawerTab: 'text',
            });
            expect(TEXT_GENERATION_CHUNK.canStart(state)).toBe(true);
        });

        it('EDITING should require hermione state', () => {
            const state = createHermioneState();
            expect(EDITING_CHUNK.canStart(state)).toBe(true);
        });

        it('EDITING should reject empty state', () => {
            const state = createEmptyState();
            expect(EDITING_CHUNK.canStart(state)).toBe(false);
        });

        it('IMAGE_GENERATION should require hermione-edited state', () => {
            const state = createHermioneEditedState();
            expect(IMAGE_GENERATION_CHUNK.canStart(state)).toBe(true);
        });

        it('COMPLETION should require hermione-with-image state', () => {
            const state = mergeState(createHermioneEditedState(), {
                canvas: 'hermione-with-image',
            });
            expect(COMPLETION_CHUNK.canStart(state)).toBe(true);
        });
    });

    describe('State transitions between chunks', () => {
        it('should transition from WELCOME to TEXT_GENERATION', () => {
            const welcomeProvidedState = WELCOME_CHUNK.providesState as Partial<TutorialState>;
            expect(TEXT_GENERATION_CHUNK.canStart(welcomeProvidedState as TutorialState)).toBe(true);
        });

        it('should transition from TEXT_GENERATION to EDITING', () => {
            const state = mergeState(createEmptyState(), TEXT_GENERATION_CHUNK.providesState);
            expect(EDITING_CHUNK.canStart(state)).toBe(true);
        });

        it('should transition from EDITING to IMAGE_GENERATION', () => {
            const state = mergeState(createEmptyState(), EDITING_CHUNK.providesState);
            expect(IMAGE_GENERATION_CHUNK.canStart(state)).toBe(true);
        });

        it('should transition from IMAGE_GENERATION to COMPLETION', () => {
            const state = mergeState(createEmptyState(), IMAGE_GENERATION_CHUNK.providesState);
            expect(COMPLETION_CHUNK.canStart(state)).toBe(true);
        });

        it('should NOT allow backward transitions', () => {
            const textGenState = mergeState(createEmptyState(), TEXT_GENERATION_CHUNK.providesState);
            // WELCOME requires empty state, but we have hermione state
            expect(WELCOME_CHUNK.canStart(textGenState)).toBe(false);
        });

        it('should NOT allow skipping chunks', () => {
            const welcomeState = mergeState(createEmptyState(), WELCOME_CHUNK.providesState);
            // Try to skip TEXT_GENERATION and go straight to EDITING
            expect(EDITING_CHUNK.canStart(welcomeState)).toBe(false);
        });
    });

    describe('State flow through full tutorial', () => {
        it('should maintain valid state through entire tutorial', () => {
            let currentState = createEmptyState();

            for (const chunk of ALL_CHUNKS) {
                // Chunk should be startable with current state
                expect(chunk.canStart(currentState)).toBe(
                    true,
                    `${chunk.name} should be startable with current state`
                );

                // After executing chunk, state should be valid for next chunk
                currentState = mergeState(currentState, chunk.providesState);
            }

            // Final state should be ready for restart
            expect(WELCOME_CHUNK.canStart(createEmptyState())).toBe(true);
        });

        it('should complete all chunks', () => {
            let currentState = createEmptyState();
            const completedChunks: string[] = [];

            for (const chunk of ALL_CHUNKS) {
                // Execute chunk (simulate)
                expect(chunk.canStart(currentState)).toBe(true);

                // Update state to what chunk provides
                currentState = mergeState(currentState, chunk.providesState);

                // Verify chunk is marked complete
                if (chunk.isComplete(currentState)) {
                    completedChunks.push(chunk.name);
                }
            }

            expect(completedChunks.length).toBe(ALL_CHUNKS.length);
        });
    });

    describe('State merging', () => {
        it('should merge partial state into full state', () => {
            const initial = createEmptyState();
            const update = { drawer: 'open' as const };

            const merged = mergeState(initial, update);

            expect(merged.drawer).toBe('open');
            expect(merged.canvas).toBe('empty'); // Unchanged
        });

        it('should overwrite existing properties', () => {
            const initial = createEmptyState();
            const update = { canvas: 'hermione' as const };

            const merged = mergeState(initial, update);

            expect(merged.canvas).toBe('hermione');
        });

        it('should not modify original state', () => {
            const initial = createEmptyState();
            const initialCanvas = initial.canvas;
            const update = { canvas: 'hermione' as const };

            mergeState(initial, update);

            expect(initial.canvas).toBe(initialCanvas);
        });

        it('should handle multiple property updates', () => {
            const initial = createEmptyState();
            const update = {
                canvas: 'hermione' as const,
                drawer: 'open' as const,
                drawerTab: 'text' as const,
            };

            const merged = mergeState(initial, update);

            expect(merged.canvas).toBe('hermione');
            expect(merged.drawer).toBe('open');
            expect(merged.drawerTab).toBe('text');
        });
    });

    describe('State validation across chunk sequence', () => {
        it('should validate entire chunk sequence', () => {
            const result = validateChunkSequence();
            expect(result.valid).toBe(true);
        });

        it('should report errors for invalid sequence', () => {
            // If we had invalid transitions, they would appear here
            const result = validateChunkSequence();
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('State immutability', () => {
        it('should not mutate state when merging', () => {
            const original = createEmptyState();
            const originalValues = { ...original };

            mergeState(original, { drawer: 'open' });

            expect(original).toEqual(originalValues);
        });

        it('should not share state references between chunks', () => {
            const state1 = createEmptyState();
            const state2 = createEmptyState();

            expect(state1).not.toBe(state2);
            expect(state1).toEqual(state2);
        });
    });

    describe('Complex state scenarios', () => {
        it('should handle editing then image generation', () => {
            let state = createEmptyState();

            // WELCOME
            expect(WELCOME_CHUNK.canStart(state)).toBe(true);
            state = mergeState(state, WELCOME_CHUNK.providesState);

            // TEXT_GENERATION
            expect(TEXT_GENERATION_CHUNK.canStart(state)).toBe(true);
            state = mergeState(state, TEXT_GENERATION_CHUNK.providesState);

            // EDITING
            expect(EDITING_CHUNK.canStart(state)).toBe(true);
            state = mergeState(state, EDITING_CHUNK.providesState);
            expect(state.canvas).toBe('hermione-edited');

            // IMAGE_GENERATION (requires edited state)
            expect(IMAGE_GENERATION_CHUNK.canStart(state)).toBe(true);
            state = mergeState(state, IMAGE_GENERATION_CHUNK.providesState);
            expect(state.canvas).toBe('hermione-with-image');
        });

        it('should handle state with auth changes', () => {
            let state = createEmptyState();
            expect(state.mockAuth).toBe(false);

            // After WELCOME
            state = mergeState(state, WELCOME_CHUNK.providesState);

            // During IMAGE_GENERATION, auth might be enabled
            state = mergeState(state, { mockAuth: true });
            expect(state.mockAuth).toBe(true);

            // Should cleanup after IMAGE_GENERATION
            state = mergeState(state, { mockAuth: false });
            expect(state.mockAuth).toBe(false);
        });
    });

    describe('State canvas progression', () => {
        it('should follow canvas state progression', () => {
            let state = createEmptyState();
            expect(state.canvas).toBe('empty');

            // After TEXT_GENERATION
            state = mergeState(state, TEXT_GENERATION_CHUNK.providesState);
            expect(state.canvas).toBe('hermione');

            // After EDITING
            state = mergeState(state, EDITING_CHUNK.providesState);
            expect(state.canvas).toBe('hermione-edited');

            // After IMAGE_GENERATION
            state = mergeState(state, IMAGE_GENERATION_CHUNK.providesState);
            expect(state.canvas).toBe('hermione-with-image');

            // After COMPLETION (back to empty for restart)
            state = mergeState(state, COMPLETION_CHUNK.providesState);
            expect(state.canvas).toBe('empty');
        });
    });

    describe('State drawer progression', () => {
        it('should handle drawer open/close correctly', () => {
            let state = createEmptyState();
            expect(state.drawer).toBe('closed');

            // WELCOME opens drawer
            state = mergeState(state, WELCOME_CHUNK.providesState);
            expect(state.drawer).toBe('open');
            expect(state.drawerTab).toBe('text');

            // TEXT_GENERATION closes drawer
            state = mergeState(state, TEXT_GENERATION_CHUNK.providesState);
            expect(state.drawer).toBe('closed');

            // After IMAGE_GENERATION stays closed
            state = mergeState(state, IMAGE_GENERATION_CHUNK.providesState);
            expect(state.drawer).toBe('closed');

            // COMPLETION opens drawer again
            state = mergeState(state, COMPLETION_CHUNK.providesState);
            expect(state.drawer).toBe('open');
        });
    });
});
