import { TutorialChunk, statesMatch } from './types';
import { TUTORIAL_STEP_NAMES } from '../../constants/tutorialSteps';
import { TutorialLogger } from '../utils/chunkUtilities';

/**
 * TEXT_GENERATION Chunk: Auto-generate Hermione demo creature
 * 
 * Steps: TEXT_TAB → GENERATE_BUTTON → PROGRESS_BAR → CANVAS
 * Duration: ~2-3 minutes
 * Side effects: Auto-fill form, trigger generation, load Hermione demo
 * 
 * This chunk demonstrates the core feature: text generation. Users see
 * the form being auto-filled and then watch Hermione generate.
 */
export const TEXT_GENERATION_CHUNK: TutorialChunk = {
    name: 'TEXT_GENERATION',

    steps: [
        TUTORIAL_STEP_NAMES.TEXT_TAB,
        TUTORIAL_STEP_NAMES.GENERATE_BUTTON,
        TUTORIAL_STEP_NAMES.PROGRESS_BAR,
        TUTORIAL_STEP_NAMES.CANVAS,
    ],

    purpose: 'Complete text generation flow with Hermione demo',

    requiredState: {
        canvas: 'empty',
        drawer: 'open',
        drawerTab: 'text',
    },

    providesState: {
        canvas: 'hermione',
        drawer: 'closed',
        drawerTab: null,
        editMode: false,
    },

    /**
     * Setup: Ensure we're on text tab
     * - Drawer should be open
     * - Switch to text tab
     * - Clear canvas to empty
     */
    setup: async () => {
        TutorialLogger.chunkStart('TEXT_GENERATION');
    },

    /**
     * Cleanup: Ensure Hermione is loaded and drawer closed
     * - Hermione statblock should be on canvas
     * - Drawer should be closed
     * - Ready for EDITING chunk
     */
    cleanup: async () => {
        TutorialLogger.chunkComplete('TEXT_GENERATION');
    },

    /**
     * Step-specific handlers for text generation flow
     */
    handlers: {
        // Step 3: Text tab explanation
        // Show benefits of text generation
        [TUTORIAL_STEP_NAMES.TEXT_TAB]: async (data) => {
            if (data.action === 'next') {
                TutorialLogger.stepExecute('TEXT_GENERATION', TUTORIAL_STEP_NAMES.TEXT_TAB, 'next');
            }
        },

        // Step 4: Generate button explanation
        // Show what will happen when we click Generate
        [TUTORIAL_STEP_NAMES.GENERATE_BUTTON]: async (data) => {
            if (data.action === 'next') {
                TutorialLogger.stepExecute('TEXT_GENERATION', TUTORIAL_STEP_NAMES.GENERATE_BUTTON, 'next');
            }
        },

        // Step 5: Progress bar
        // Show generation in progress
        [TUTORIAL_STEP_NAMES.PROGRESS_BAR]: async (data) => {
            if (data.action === 'next') {
                TutorialLogger.stepExecute('TEXT_GENERATION', TUTORIAL_STEP_NAMES.PROGRESS_BAR, 'next');
            }
        },

        // Step 6: Canvas with generated statblock
        // Show Hermione on canvas
        [TUTORIAL_STEP_NAMES.CANVAS]: async (data) => {
            if (data.action === 'next') {
                TutorialLogger.stepExecute('TEXT_GENERATION', TUTORIAL_STEP_NAMES.CANVAS, 'next');
            }
        },
    },

    /**
     * Validation: Can this chunk start?
     * True if drawer is open on text tab with empty canvas
     */
    canStart: (state) => {
        return statesMatch(
            {
                canvas: 'empty',
                drawer: 'open',
                drawerTab: 'text',
            },
            state
        );
    },

    /**
     * Validation: Is this chunk complete?
     * True if Hermione is loaded and drawer is closed
     */
    isComplete: (state) => {
        return state.canvas === 'hermione' && state.drawer === 'closed';
    },
};
