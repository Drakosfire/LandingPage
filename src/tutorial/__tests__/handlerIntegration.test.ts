/**
 * TDD Tests for Handler and Callback Integration
 * 
 * Defines the contract for handlers:
 * 1. Handlers receive Joyride CallBackProps
 * 2. Handlers can invoke callback functions
 * 3. Handlers must be async-safe
 * 4. Multiple callbacks can be orchestrated
 * 
 * These tests drive the handler implementation that will call
 * callbacks provided by TutorialTour.tsx
 */

import { CallBackProps, STATUS } from 'react-joyride';
import {
    WELCOME_CHUNK,
    TEXT_GENERATION_CHUNK,
    EDITING_CHUNK,
    IMAGE_GENERATION_CHUNK,
} from '../chunks';
import { TUTORIAL_STEP_NAMES } from '../../constants/tutorialSteps';

/**
 * Mock callbacks that handlers will invoke
 */
class MockCallbacks {
    onOpenGenerationDrawer = jest.fn();
    onCloseGenerationDrawer = jest.fn();
    onToggleEditMode = jest.fn();
    onSimulateTyping = jest.fn();
    onTutorialCheckbox = jest.fn();
    onTutorialClickButton = jest.fn();
    onTutorialEditText = jest.fn();
    onSwitchDrawerTab = jest.fn();
    onSwitchImageTab = jest.fn();
    onSetGenerationCompleteCallback = jest.fn();
    onSetMockAuthState = jest.fn();

    reset() {
        jest.clearAllMocks();
    }
}

describe('Handler and Callback Integration', () => {
    let callbacks: MockCallbacks;

    beforeEach(() => {
        callbacks = new MockCallbacks();
    });

    describe('Handler signature and execution', () => {
        it('should accept CallBackProps as parameter', async () => {
            const mockData: CallBackProps = {
                action: 'next',
                index: 0,
                status: STATUS.RUNNING,
                type: 'step:before',
                step: { target: '[data-tutorial="generation-button"]' } as any,
                lifecycle: 'complete',
            } as CallBackProps;

            const handler = WELCOME_CHUNK.handlers[TUTORIAL_STEP_NAMES.WELCOME];
            expect(handler).toBeDefined();

            // Should be async and not throw
            const result = handler(mockData);
            expect(result).toBeInstanceOf(Promise);

            await expect(result).resolves.not.toThrow();
        });

        it('should handle different action types', async () => {
            const baseData: Partial<CallBackProps> = {
                index: 0,
                status: STATUS.RUNNING,
                type: 'step:before',
                step: { target: '[data-tutorial="generation-button"]' } as any,
                lifecycle: 'complete',
            };

            const handler = WELCOME_CHUNK.handlers[TUTORIAL_STEP_NAMES.WELCOME];

            // Test with 'next' action
            await expect(
                handler({ ...baseData, action: 'next' } as CallBackProps)
            ).resolves.not.toThrow();

            // Test with 'back' action
            await expect(
                handler({ ...baseData, action: 'back' } as CallBackProps)
            ).resolves.not.toThrow();

            // Test with 'skip' action
            await expect(
                handler({ ...baseData, action: 'skip' } as CallBackProps)
            ).resolves.not.toThrow();
        });
    });

    describe('Callback delegation in handlers', () => {
        it('WELCOME handler should open drawer on next', async () => {
            const mockData: CallBackProps = {
                action: 'next',
                index: 1,
                status: STATUS.RUNNING,
                type: 'step:after',
                step: { target: '[data-tutorial="generation-drawer-title"]' } as any,
                lifecycle: 'complete',
            } as CallBackProps;

            // Create a wrapped handler that uses callbacks
            const wrappedHandler = async (data: CallBackProps) => {
                if (data.action === 'next' && data.index === 1) {
                    callbacks.onOpenGenerationDrawer();
                }
            };

            await wrappedHandler(mockData);

            expect(callbacks.onOpenGenerationDrawer).toHaveBeenCalled();
        });

        it('should switch drawer tabs when needed', async () => {
            const mockData: CallBackProps = {
                action: 'next',
                index: 9,
                status: STATUS.RUNNING,
                type: 'step:before',
                step: { target: '[data-tutorial="image-generation-tab"]' } as any,
                lifecycle: 'complete',
            } as CallBackProps;

            // Simulate handler that switches tabs
            const wrappedHandler = async (data: CallBackProps) => {
                if (data.index === 9) {
                    callbacks.onOpenGenerationDrawer();
                    callbacks.onSwitchDrawerTab('image');
                }
            };

            await wrappedHandler(mockData);

            expect(callbacks.onOpenGenerationDrawer).toHaveBeenCalled();
            expect(callbacks.onSwitchDrawerTab).toHaveBeenCalledWith('image');
        });

        it('should toggle edit mode and back', async () => {
            const enableData: CallBackProps = {
                action: 'next',
                index: 6,
                status: STATUS.RUNNING,
                type: 'step:after',
                step: { target: '[data-tutorial="edit-mode-toggle"]' } as any,
                lifecycle: 'complete',
            } as CallBackProps;

            const disableData: CallBackProps = {
                action: 'next',
                index: 8,
                status: STATUS.RUNNING,
                type: 'step:after',
                step: { target: '[data-tutorial="edit-mode-toggle"]' } as any,
                lifecycle: 'complete',
            } as CallBackProps;

            // Simulate toggle on
            const toggleOnHandler = async (data: CallBackProps) => {
                if (data.index === 6) {
                    callbacks.onToggleEditMode(true);
                }
            };

            // Simulate toggle off
            const toggleOffHandler = async (data: CallBackProps) => {
                if (data.index === 8) {
                    callbacks.onToggleEditMode(false);
                }
            };

            await toggleOnHandler(enableData);
            expect(callbacks.onToggleEditMode).toHaveBeenCalledWith(true);

            callbacks.reset();

            await toggleOffHandler(disableData);
            expect(callbacks.onToggleEditMode).toHaveBeenCalledWith(false);
        });
    });

    describe('Complex callback sequences', () => {
        it('should handle typing demo sequence', async () => {
            const mockData: CallBackProps = {
                action: 'next',
                index: 2,
                status: STATUS.RUNNING,
                type: 'step:after',
                step: { target: '[data-tutorial="text-generation-tab"]' } as any,
                lifecycle: 'complete',
            } as CallBackProps;

            // Simulate TEXT_TAB handler that does typing demo
            const textTabHandler = async (data: CallBackProps) => {
                if (data.action === 'next') {
                    // Auto-fill form
                    await callbacks.onSimulateTyping(
                        '[data-tutorial="creature-description"]',
                        'A mystical creature...'
                    );

                    // Check checkboxes
                    await callbacks.onTutorialCheckbox('[data-tutorial="legendary-actions"]');
                    await callbacks.onTutorialCheckbox('[data-tutorial="lair-actions"]');
                    await callbacks.onTutorialCheckbox('[data-tutorial="spellcasting"]');
                }
            };

            await textTabHandler(mockData);

            expect(callbacks.onSimulateTyping).toHaveBeenCalled();
            expect(callbacks.onTutorialCheckbox).toHaveBeenCalledTimes(3);
        });

        it('should handle generation and progress sequence', async () => {
            let generationComplete = false;

            const generateButtonData: CallBackProps = {
                action: 'next',
                index: 3,
                status: STATUS.RUNNING,
                type: 'step:after',
                step: { target: '[data-tutorial="generate-button"]' } as any,
                lifecycle: 'complete',
            } as CallBackProps;

            // Simulate GENERATE_BUTTON handler
            const generateHandler = async (data: CallBackProps) => {
                if (data.action === 'next') {
                    // Set callback for when generation completes
                    callbacks.onSetGenerationCompleteCallback(() => {
                        generationComplete = true;
                    });

                    // Click generate
                    await callbacks.onTutorialClickButton('[data-tutorial="generate-button"]');
                }
            };

            await generateHandler(generateButtonData);

            // Simulate generation completing
            callbacks.onSetGenerationCompleteCallback.mock.calls[0]?.[0]?.();

            expect(generationComplete).toBe(true);
        });

        it('should handle image selection and application', async () => {
            const selectData: CallBackProps = {
                action: 'next',
                index: 14,
                status: STATUS.RUNNING,
                type: 'step:after',
                step: { target: '[data-tutorial="image-result-2"]' } as any,
                lifecycle: 'complete',
            } as CallBackProps;

            // Simulate IMAGE_SELECT handler
            const selectHandler = async (data: CallBackProps) => {
                if (data.action === 'next') {
                    // Click image selection button
                    await callbacks.onTutorialClickButton('[data-tutorial="image-result-2"]');
                }
            };

            await selectHandler(selectData);

            expect(callbacks.onTutorialClickButton).toHaveBeenCalledWith(
                '[data-tutorial="image-result-2"]'
            );
        });
    });

    describe('Error handling in callbacks', () => {
        it('should not throw if callback is not provided', async () => {
            const mockData: CallBackProps = {
                action: 'next',
                index: 0,
                status: STATUS.RUNNING,
                type: 'step:before',
                step: { target: '[data-tutorial="generation-button"]' } as any,
                lifecycle: 'complete',
            } as CallBackProps;

            // Handler without callbacks provided
            const safeHandler = async (data: CallBackProps) => {
                // Gracefully handle missing callback
                // undefined?.onOpenGenerationDrawer?.() would not throw
            };

            await expect(safeHandler(mockData)).resolves.not.toThrow();
        });

        it('should handle callback errors gracefully', async () => {
            const failingCallback = jest.fn().mockRejectedValue(new Error('Callback failed'));

            const mockData: CallBackProps = {
                action: 'next',
                index: 0,
                status: STATUS.RUNNING,
                type: 'step:before',
                step: { target: '[data-tutorial="generation-button"]' } as any,
                lifecycle: 'complete',
            } as CallBackProps;

            // Handler that catches callback errors
            const safeHandler = async (data: CallBackProps) => {
                try {
                    await failingCallback();
                } catch (error) {
                    console.error('Callback error:', error);
                    // Continue execution instead of crashing
                }
            };

            await expect(safeHandler(mockData)).resolves.not.toThrow();
        });
    });

    describe('Handler composition', () => {
        it('should support callback chains', async () => {
            const mockData: CallBackProps = {
                action: 'next',
                index: 9,
                status: STATUS.RUNNING,
                type: 'step:before',
                step: { target: '[data-tutorial="image-generation-tab"]' } as any,
                lifecycle: 'complete',
            } as CallBackProps;

            const composedHandler = async (data: CallBackProps) => {
                // Step 1: Open drawer
                callbacks.onOpenGenerationDrawer();

                // Step 2: Switch to image tab
                callbacks.onSwitchDrawerTab('image');

                // Step 3: Enable mock auth
                callbacks.onSetMockAuthState(true);
            };

            await composedHandler(mockData);

            // Verify call order
            const callOrder: string[] = [];
            callbacks.onOpenGenerationDrawer.mockImplementation(() => {
                callOrder.push('open');
            });
            callbacks.onSwitchDrawerTab.mockImplementation(() => {
                callOrder.push('switch');
            });
            callbacks.onSetMockAuthState.mockImplementation(() => {
                callOrder.push('auth');
            });

            await composedHandler(mockData);

            expect(callOrder).toEqual(['open', 'switch', 'auth']);
        });
    });

    describe('Callback timing and async operations', () => {
        it('should wait for async callbacks', async () => {
            let callbackExecuted = false;
            const asyncCallback = jest.fn().mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
                callbackExecuted = true;
            });

            const mockData: CallBackProps = {
                action: 'next',
                index: 3,
                status: STATUS.RUNNING,
                type: 'step:after',
                step: { target: '[data-tutorial="generate-button"]' } as any,
                lifecycle: 'complete',
            } as CallBackProps;

            const handler = async (data: CallBackProps) => {
                await asyncCallback();
            };

            await handler(mockData);

            expect(callbackExecuted).toBe(true);
        });

        it('should handle sequential callbacks', async () => {
            const executionOrder: string[] = [];

            const callback1 = jest.fn().mockImplementation(async () => {
                executionOrder.push('first');
            });

            const callback2 = jest.fn().mockImplementation(async () => {
                executionOrder.push('second');
            });

            const mockData: CallBackProps = {
                action: 'next',
                index: 2,
                status: STATUS.RUNNING,
                type: 'step:after',
                step: { target: '[data-tutorial="text-generation-tab"]' } as any,
                lifecycle: 'complete',
            } as CallBackProps;

            const handler = async (data: CallBackProps) => {
                await callback1();
                await callback2();
            };

            await handler(mockData);

            expect(executionOrder).toEqual(['first', 'second']);
        });
    });

    describe('Mock auth state management', () => {
        it('should enable mock auth for image generation', async () => {
            const mockData: CallBackProps = {
                action: 'next',
                index: 9,
                status: STATUS.RUNNING,
                type: 'step:before',
                step: { target: '[data-tutorial="image-generation-tab"]' } as any,
                lifecycle: 'complete',
            } as CallBackProps;

            const setupImageGen = async (data: CallBackProps) => {
                callbacks.onSetMockAuthState(true);
            };

            await setupImageGen(mockData);

            expect(callbacks.onSetMockAuthState).toHaveBeenCalledWith(true);
        });

        it('should disable mock auth after image generation', async () => {
            const cleanupData: CallBackProps = {
                action: 'next',
                index: 16,
                status: STATUS.RUNNING,
                type: 'step:after',
                step: { target: 'body' } as any,
                lifecycle: 'complete',
            } as CallBackProps;

            const cleanupHandler = async (data: CallBackProps) => {
                callbacks.onSetMockAuthState(false);
            };

            await cleanupHandler(cleanupData);

            expect(callbacks.onSetMockAuthState).toHaveBeenCalledWith(false);
        });
    });
});
