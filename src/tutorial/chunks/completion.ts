import { TutorialChunk, statesMatch } from './types';
import { TUTORIAL_STEP_NAMES } from '../../constants/tutorialSteps';
import { TutorialLogger } from '../utils/chunkUtilities';

/**
 * COMPLETION/EXIT Chunk: Congratulate, showcase features, and prepare for independent creation
 * 
 * Steps: IMAGE_LOGIN_REMINDER, SAVE, HELP
 * Duration: ~2-3 minutes
 * Side effects: Show quicksave info, tutorial button location, login requirements
 * 
 * This chunk provides the EXIT flow:
 * 1. Congratulations and quicksave explanation (IMAGE_LOGIN_REMINDER)
 * 2. Show where to save work (SAVE button)
 * 3. Show where tutorial button is (HELP button)
 * 4. Final login reminder for advanced features
 * 5. Clear canvas and prepare for independent creation
 */
export const COMPLETION_CHUNK: TutorialChunk = {
    name: 'COMPLETION',

    steps: [
        TUTORIAL_STEP_NAMES.IMAGE_LOGIN_REMINDER,
        TUTORIAL_STEP_NAMES.SAVE,
        TUTORIAL_STEP_NAMES.HELP,
    ],

    purpose: 'Guide through exit flow: congratulate, showcase save/help features, remind about login',

    requiredState: {
        canvas: 'hermione-with-image',
        drawer: 'closed',
    },

    providesState: {
        canvas: 'empty',
        drawer: 'open',
        drawerTab: 'text',
    },

    /**
     * Setup: Ensure final state is ready
     * - Hermione with image should be on canvas
     * - Drawer should be closed
     */
    setup: async () => {
        TutorialLogger.chunkStart('COMPLETION');
    },

    /**
     * Cleanup: Reset for user to start creating
     * - Mark tutorial as completed in cookies
     * - Clear canvas to empty
     * - Open generation drawer on text tab
     * - User is now ready to create independently
     */
    cleanup: async () => {
        TutorialLogger.chunkComplete('COMPLETION');
    },

    /**
     * Step-specific handlers for completion flow
     */
    handlers: {
        // Step 16: Congratulations and quicksave explanation
        [TUTORIAL_STEP_NAMES.IMAGE_LOGIN_REMINDER]: async (data) => {
            if (data.action === 'next' || data.status === 'finished') {
                TutorialLogger.stepExecute('COMPLETION', TUTORIAL_STEP_NAMES.IMAGE_LOGIN_REMINDER, 'next');
            }
        },

        // Step 17: Save button - show where to save work
        [TUTORIAL_STEP_NAMES.SAVE]: async (data) => {
            if (data.action === 'next' || data.status === 'finished') {
                TutorialLogger.stepExecute('COMPLETION', TUTORIAL_STEP_NAMES.SAVE, 'next');
            }
        },

        // Step 18: Help button - show where tutorial button is
        [TUTORIAL_STEP_NAMES.HELP]: async (data) => {
            if (data.action === 'next' || data.status === 'finished') {
                TutorialLogger.stepExecute('COMPLETION', TUTORIAL_STEP_NAMES.HELP, 'next');
            }
        },
    },

    /**
     * Validation: Can this chunk start?
     * True if Hermione with image is on canvas
     */
    canStart: (state) => {
        return statesMatch(
            {
                canvas: 'hermione-with-image',
                drawer: 'closed',
            },
            state
        );
    },

    /**
     * Validation: Is this chunk complete?
     * True if canvas is empty and drawer is open on text tab
     */
    isComplete: (state) => {
        return (
            state.canvas === 'empty' &&
            state.drawer === 'open' &&
            state.drawerTab === 'text'
        );
    },
};
