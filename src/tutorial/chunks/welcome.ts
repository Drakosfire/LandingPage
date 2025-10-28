import { TutorialChunk, statesMatch } from './types';
import { TUTORIAL_STEP_NAMES } from '../../constants/tutorialSteps';
import { TutorialLogger } from '../utils/chunkUtilities';

/**
 * WELCOME Chunk: Introduction and drawer setup
 * 
 * Steps: WELCOME → DRAWER
 * Duration: ~30 seconds
 * Side effects: Open generation drawer, switch to text tab
 * 
 * This is the first chunk users encounter. It introduces the app and opens
 * the generation drawer, setting up for text generation demo.
 */
export const WELCOME_CHUNK: TutorialChunk = {
    name: 'WELCOME',

    steps: [
        TUTORIAL_STEP_NAMES.WELCOME,
        TUTORIAL_STEP_NAMES.DRAWER,
    ],

    purpose: 'Introduce app and open generation drawer for text generation',

    requiredState: {
        canvas: 'empty',
        drawer: 'closed',
    },

    providesState: {
        canvas: 'empty',
        drawer: 'open',
        drawerTab: 'text',
    },

    /**
     * Setup: Ensure clean starting state
     * - Clear canvas to empty
     * - Close all drawers
     * - Disable edit mode
     */
    setup: async () => {
        TutorialLogger.chunkStart('WELCOME');
    },

    /**
     * Cleanup: Ensure drawer is open and on text tab
     * - Keep drawer open
     * - Verify we're on text tab
     * - Ready for TEXT_GENERATION chunk
     */
    cleanup: async () => {
        TutorialLogger.chunkComplete('WELCOME');
    },

    /**
     * Step-specific handlers
     * Each handler is called when user progresses through that step
     * 
     * Note: Handlers will be wrapped with callbacks in TutorialTour.tsx
     * using a closure pattern or dependency injection.
     */
    handlers: {
        // Step 1: Welcome message
        // User reads introduction and clicks Next
        [TUTORIAL_STEP_NAMES.WELCOME]: async (data) => {
            if (data.action === 'next') {
                TutorialLogger.stepExecute('WELCOME', TUTORIAL_STEP_NAMES.WELCOME, 'next');
            }
        },

        // Step 2: Drawer explanation
        // When user clicks Next, open the generation drawer
        [TUTORIAL_STEP_NAMES.DRAWER]: async (data) => {
            if (data.action === 'next') {
                TutorialLogger.stepExecute('WELCOME', TUTORIAL_STEP_NAMES.DRAWER, 'next');
            }
        },
    },

    /**
     * Validation: Can this chunk start?
     * True if canvas is empty and drawer is closed
     */
    canStart: (state) => {
        return statesMatch({ canvas: 'empty', drawer: 'closed' }, state);
    },

    /**
     * Validation: Is this chunk complete?
     * True if drawer is open and on text tab
     */
    isComplete: (state) => {
        return state.drawer === 'open' && state.drawerTab === 'text';
    },
};
