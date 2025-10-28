/**
 * TDD Tests for Chunk Execution
 * 
 * Defines the contract for how chunks execute:
 * 1. Setup phase runs first to prepare state
 * 2. Handlers execute in response to step events
 * 3. Cleanup phase runs last to finalize state
 * 
 * These tests drive the implementation of chunk handlers.
 */

import { CallBackProps, STATUS } from 'react-joyride';
import {
    WELCOME_CHUNK,
    TEXT_GENERATION_CHUNK,
    EDITING_CHUNK,
    createEmptyState,
    createHermioneState,
    mergeState,
} from '../chunks';
import { TUTORIAL_STEP_NAMES } from '../../constants/tutorialSteps';

/**
 * Mock implementation of chunk execution
 * This will be replaced with actual implementation that these tests drive
 */
class ChunkExecutor {
    private state: any;
    private setupCalled = false;
    private cleanupCalled = false;
    private handlersExecuted: string[] = [];

    constructor(initialState: any = {}) {
        this.state = initialState;
    }

    async runSetup(chunk: any): Promise<void> {
        await chunk.setup(this.state);
        this.setupCalled = true;
    }

    async runHandler(chunk: any, stepName: string, data: CallBackProps): Promise<void> {
        if (chunk.handlers[stepName]) {
            await chunk.handlers[stepName](data);
            this.handlersExecuted.push(stepName);
        }
    }

    async runCleanup(chunk: any): Promise<void> {
        await chunk.cleanup(this.state);
        this.cleanupCalled = true;
    }

    getState() {
        return this.state;
    }

    setState(newState: any) {
        this.state = newState;
    }

    getSetupCalled() {
        return this.setupCalled;
    }

    getCleanupCalled() {
        return this.cleanupCalled;
    }

    getHandlersExecuted() {
        return this.handlersExecuted;
    }
}

describe('Chunk Execution Lifecycle', () => {
    let executor: ChunkExecutor;

    beforeEach(() => {
        executor = new ChunkExecutor(createEmptyState());
    });

    describe('Setup phase', () => {
        it('should call setup before executing chunk', async () => {
            const setupSpy = jest.spyOn(WELCOME_CHUNK, 'setup');

            await executor.runSetup(WELCOME_CHUNK);

            expect(setupSpy).toHaveBeenCalled();
            expect(executor.getSetupCalled()).toBe(true);
        });

        it('should setup in correct order: setup → handlers → cleanup', async () => {
            const executionOrder: string[] = [];
            const setupSpy = jest.spyOn(WELCOME_CHUNK, 'setup').mockImplementation(async () => {
                executionOrder.push('setup');
            });
            const cleanupSpy = jest.spyOn(WELCOME_CHUNK, 'cleanup').mockImplementation(async () => {
                executionOrder.push('cleanup');
            });

            await executor.runSetup(WELCOME_CHUNK);
            const mockData: Partial<CallBackProps> = { action: 'next' };
            await executor.runHandler(
                WELCOME_CHUNK,
                TUTORIAL_STEP_NAMES.WELCOME,
                mockData as CallBackProps
            );
            executionOrder.push('handler');
            await executor.runCleanup(WELCOME_CHUNK);

            expect(executionOrder).toEqual(['setup', 'handler', 'cleanup']);

            setupSpy.mockRestore();
            cleanupSpy.mockRestore();
        });

        it('should handle async setup operations', async () => {
            let setupCompleted = false;
            const asyncSetupChunk = {
                ...WELCOME_CHUNK,
                setup: async () => {
                    await new Promise(resolve => setTimeout(resolve, 10));
                    setupCompleted = true;
                }
            };

            await executor.runSetup(asyncSetupChunk);

            expect(setupCompleted).toBe(true);
        });
    });

    describe('Handler execution', () => {
        it('should execute handler for specific step', async () => {
            const mockData: Partial<CallBackProps> = { action: 'next' };

            await executor.runHandler(
                WELCOME_CHUNK,
                TUTORIAL_STEP_NAMES.WELCOME,
                mockData as CallBackProps
            );

            expect(executor.getHandlersExecuted()).toContain(TUTORIAL_STEP_NAMES.WELCOME);
        });

        it('should execute correct handler for each step', async () => {
            const steps = [TUTORIAL_STEP_NAMES.WELCOME, TUTORIAL_STEP_NAMES.DRAWER];
            const mockData: Partial<CallBackProps> = { action: 'next' };

            for (const stepName of steps) {
                await executor.runHandler(WELCOME_CHUNK, stepName, mockData as CallBackProps);
            }

            expect(executor.getHandlersExecuted()).toEqual(steps);
        });

        it('should handle handler with action=next', async () => {
            const mockData: CallBackProps = {
                action: 'next',
                index: 0,
                status: STATUS.RUNNING,
                type: 'step:before',
                step: { target: '[data-tutorial="generation-button"]' } as any,
                lifecycle: 'complete',
            } as CallBackProps;

            let handlerCalled = false;
            const testChunk = {
                ...WELCOME_CHUNK,
                handlers: {
                    [TUTORIAL_STEP_NAMES.WELCOME]: async (data: CallBackProps) => {
                        if (data.action === 'next') {
                            handlerCalled = true;
                        }
                    }
                }
            };

            await executor.runHandler(testChunk, TUTORIAL_STEP_NAMES.WELCOME, mockData);

            expect(handlerCalled).toBe(true);
        });

        it('should handle handler with action=back', async () => {
            const mockData: CallBackProps = {
                action: 'back',
                index: 0,
                status: STATUS.RUNNING,
                type: 'step:before',
                step: { target: '[data-tutorial="generation-button"]' } as any,
                lifecycle: 'complete',
            } as CallBackProps;

            let backHandlerCalled = false;
            const testChunk = {
                ...WELCOME_CHUNK,
                handlers: {
                    [TUTORIAL_STEP_NAMES.WELCOME]: async (data: CallBackProps) => {
                        if (data.action === 'back') {
                            backHandlerCalled = true;
                        }
                    }
                }
            };

            await executor.runHandler(testChunk, TUTORIAL_STEP_NAMES.WELCOME, mockData);

            expect(backHandlerCalled).toBe(true);
        });

        it('should not fail if handler does not exist for step', async () => {
            const mockData: Partial<CallBackProps> = { action: 'next' };

            expect(async () => {
                await executor.runHandler(WELCOME_CHUNK, 'non-existent-step', mockData as CallBackProps);
            }).not.toThrow();
        });
    });

    describe('Cleanup phase', () => {
        it('should call cleanup after handlers complete', async () => {
            const cleanupSpy = jest.spyOn(WELCOME_CHUNK, 'cleanup');

            await executor.runCleanup(WELCOME_CHUNK);

            expect(cleanupSpy).toHaveBeenCalled();
            expect(executor.getCleanupCalled()).toBe(true);

            cleanupSpy.mockRestore();
        });

        it('should handle async cleanup operations', async () => {
            let cleanupCompleted = false;
            const asyncCleanupChunk = {
                ...WELCOME_CHUNK,
                cleanup: async () => {
                    await new Promise(resolve => setTimeout(resolve, 10));
                    cleanupCompleted = true;
                }
            };

            await executor.runCleanup(asyncCleanupChunk);

            expect(cleanupCompleted).toBe(true);
        });

        it('should finalize state for next chunk', async () => {
            const initialState = createEmptyState();
            executor.setState(initialState);

            // After WELCOME cleanup, state should be ready for TEXT_GENERATION
            const expectedState = mergeState(initialState, WELCOME_CHUNK.providesState);

            await executor.runCleanup(WELCOME_CHUNK);
            executor.setState(expectedState);

            // Verify state matches what TEXT_GENERATION requires
            expect(TEXT_GENERATION_CHUNK.canStart(executor.getState())).toBe(true);
        });
    });

    describe('Full chunk execution flow', () => {
        it('should execute complete setup → handler → cleanup flow', async () => {
            const executionOrder: string[] = [];
            const testChunk = {
                ...WELCOME_CHUNK,
                setup: async () => {
                    executionOrder.push('setup');
                },
                cleanup: async () => {
                    executionOrder.push('cleanup');
                },
                handlers: {
                    [TUTORIAL_STEP_NAMES.WELCOME]: async () => {
                        executionOrder.push('handler');
                    }
                }
            };

            // Execute full flow
            await executor.runSetup(testChunk);
            const mockData: Partial<CallBackProps> = { action: 'next' };
            await executor.runHandler(testChunk, TUTORIAL_STEP_NAMES.WELCOME, mockData as CallBackProps);
            await executor.runCleanup(testChunk);

            expect(executionOrder).toEqual(['setup', 'handler', 'cleanup']);
        });

        it('should handle chunk-to-chunk transition', async () => {
            const state1 = createEmptyState();
            executor.setState(state1);

            // Execute WELCOME chunk
            await executor.runSetup(WELCOME_CHUNK);
            const mockData: Partial<CallBackProps> = { action: 'next' };
            await executor.runHandler(WELCOME_CHUNK, TUTORIAL_STEP_NAMES.DRAWER, mockData as CallBackProps);
            await executor.runCleanup(WELCOME_CHUNK);

            // Verify state is ready for next chunk
            const newState = mergeState(state1, WELCOME_CHUNK.providesState);
            executor.setState(newState);

            expect(TEXT_GENERATION_CHUNK.canStart(executor.getState())).toBe(true);
        });

        it('should maintain state through entire tutorial', async () => {
            let currentState = createEmptyState();

            // Simulate executing each chunk
            const chunks = [WELCOME_CHUNK, TEXT_GENERATION_CHUNK, EDITING_CHUNK];

            for (const chunk of chunks) {
                // Verify chunk can start
                expect(chunk.canStart(currentState)).toBe(true);

                // Execute chunk
                await executor.runSetup(chunk);
                const mockData: Partial<CallBackProps> = { action: 'next' };
                for (const stepName of chunk.steps) {
                    await executor.runHandler(chunk, stepName, mockData as CallBackProps);
                }
                await executor.runCleanup(chunk);

                // Update state for next iteration
                currentState = mergeState(currentState, chunk.providesState);
            }

            // Final state should be ready for IMAGE_GENERATION
            const { IMAGE_GENERATION_CHUNK } = require('../chunks');
            expect(IMAGE_GENERATION_CHUNK.canStart(currentState)).toBe(true);
        });
    });

    describe('Multiple handler calls within chunk', () => {
        it('should support multiple handler calls for multi-step chunks', async () => {
            const handlersExecuted: string[] = [];
            const testChunk = {
                ...TEXT_GENERATION_CHUNK,
                handlers: {
                    [TUTORIAL_STEP_NAMES.TEXT_TAB]: async () => {
                        handlersExecuted.push(TUTORIAL_STEP_NAMES.TEXT_TAB);
                    },
                    [TUTORIAL_STEP_NAMES.GENERATE_BUTTON]: async () => {
                        handlersExecuted.push(TUTORIAL_STEP_NAMES.GENERATE_BUTTON);
                    },
                    [TUTORIAL_STEP_NAMES.PROGRESS_BAR]: async () => {
                        handlersExecuted.push(TUTORIAL_STEP_NAMES.PROGRESS_BAR);
                    },
                    [TUTORIAL_STEP_NAMES.CANVAS]: async () => {
                        handlersExecuted.push(TUTORIAL_STEP_NAMES.CANVAS);
                    }
                }
            };

            const mockData: Partial<CallBackProps> = { action: 'next' };

            for (const stepName of testChunk.steps) {
                await executor.runHandler(testChunk, stepName, mockData as CallBackProps);
            }

            expect(handlersExecuted).toEqual(testChunk.steps);
        });
    });

    describe('Handler isolation', () => {
        it('should not execute handlers from other chunks', async () => {
            const mockData: Partial<CallBackProps> = { action: 'next' };

            // Try to execute handler from different chunk
            await executor.runHandler(
                WELCOME_CHUNK,
                TUTORIAL_STEP_NAMES.TEXT_TAB, // This is from TEXT_GENERATION, not WELCOME
                mockData as CallBackProps
            );

            // Should not be in handlers executed because WELCOME doesn't have this step
            expect(executor.getHandlersExecuted()).not.toContain(TUTORIAL_STEP_NAMES.TEXT_TAB);
        });
    });
});
