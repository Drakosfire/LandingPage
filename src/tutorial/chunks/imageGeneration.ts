import { TutorialChunk, statesMatch } from './types';
import { TUTORIAL_STEP_NAMES } from '../../constants/tutorialSteps';
import { TutorialLogger } from '../utils/chunkUtilities';

/**
 * IMAGE_GENERATION Chunk: Generate and select creature portrait
 * 
 * Steps: IMAGE_GEN_TAB → IMAGE_GEN_PROMPT → IMAGE_GEN_BUTTON →
 *        IMAGE_GEN_RESULTS → MODAL_NAVIGATION → IMAGE_SELECT → IMAGE_ON_CANVAS
 * Duration: ~3-4 minutes
 * Side effects: Switch to image tab, trigger generation, show modal, select image
 * 
 * This chunk demonstrates AI image generation. It requires mock auth
 * so users can see the full image generation flow without logging in.
 */
export const IMAGE_GENERATION_CHUNK: TutorialChunk = {
    name: 'IMAGE_GENERATION',

    steps: [
        TUTORIAL_STEP_NAMES.IMAGE_GEN_TAB,
        TUTORIAL_STEP_NAMES.IMAGE_GEN_PROMPT,
        TUTORIAL_STEP_NAMES.IMAGE_GEN_BUTTON,
        TUTORIAL_STEP_NAMES.IMAGE_GEN_RESULTS,
        TUTORIAL_STEP_NAMES.MODAL_NAVIGATION,
        TUTORIAL_STEP_NAMES.IMAGE_SELECT,
        TUTORIAL_STEP_NAMES.IMAGE_ON_CANVAS,
    ],

    purpose: 'Complete image generation and selection flow',

    requiredState: {
        canvas: 'hermione-edited',
        drawer: 'closed',
        editMode: false,
    },

    providesState: {
        canvas: 'hermione-with-image',
        drawer: 'closed',
        mockAuth: false,
    },

    /**
     * Setup: Enable mock auth for image generation
     * - Enable mock auth (tutorial perk)
     * - Ensure Hermione is loaded
     * - Ready to open drawer
     */
    setup: async () => {
        TutorialLogger.chunkStart('IMAGE_GENERATION');
    },

    /**
     * Cleanup: Clean up after image generation
     * - Image should be applied to canvas
     * - Drawer should be closed
     * - Disable mock auth
     * - Ready for COMPLETION chunk
     */
    cleanup: async () => {
        TutorialLogger.chunkComplete('IMAGE_GENERATION');
    },

    /**
     * Step-specific handlers for image generation flow
     */
    handlers: {
        // Step 10: Image generation tab
        // Introduce image generation feature
        [TUTORIAL_STEP_NAMES.IMAGE_GEN_TAB]: async (data) => {
            if (data.action === 'next') {
                TutorialLogger.stepExecute('IMAGE_GENERATION', TUTORIAL_STEP_NAMES.IMAGE_GEN_TAB, 'next');
            }
        },

        // Step 11: Image prompt
        // Show auto-filled prompt
        [TUTORIAL_STEP_NAMES.IMAGE_GEN_PROMPT]: async (data) => {
            if (data.action === 'next') {
                TutorialLogger.stepExecute('IMAGE_GENERATION', TUTORIAL_STEP_NAMES.IMAGE_GEN_PROMPT, 'next');
            }
        },

        // Step 12: Generate images button
        // Trigger image generation
        [TUTORIAL_STEP_NAMES.IMAGE_GEN_BUTTON]: async (data) => {
            if (data.action === 'next') {
                TutorialLogger.stepExecute('IMAGE_GENERATION', TUTORIAL_STEP_NAMES.IMAGE_GEN_BUTTON, 'next');
            }
        },

        // Step 13: Image results grid
        // Show generated images
        [TUTORIAL_STEP_NAMES.IMAGE_GEN_RESULTS]: async (data) => {
            if (data.action === 'next') {
                TutorialLogger.stepExecute('IMAGE_GENERATION', TUTORIAL_STEP_NAMES.IMAGE_GEN_RESULTS, 'next');
            }
        },

        // Step 14: Modal navigation
        // Demonstrate image browsing
        [TUTORIAL_STEP_NAMES.MODAL_NAVIGATION]: async (data) => {
            if (data.action === 'next') {
                TutorialLogger.stepExecute('IMAGE_GENERATION', TUTORIAL_STEP_NAMES.MODAL_NAVIGATION, 'next');
            }
        },

        // Step 15: Image selection
        // Select 3rd image for portrait
        [TUTORIAL_STEP_NAMES.IMAGE_SELECT]: async (data) => {
            if (data.action === 'next') {
                TutorialLogger.stepExecute('IMAGE_GENERATION', TUTORIAL_STEP_NAMES.IMAGE_SELECT, 'next');
            }
        },

        // Step 16: Image on canvas
        // Show final result with portrait
        [TUTORIAL_STEP_NAMES.IMAGE_ON_CANVAS]: async (data) => {
            if (data.action === 'next') {
                TutorialLogger.stepExecute('IMAGE_GENERATION', TUTORIAL_STEP_NAMES.IMAGE_ON_CANVAS, 'next');
            }
        },
    },

    /**
     * Validation: Can this chunk start?
     * True if Hermione is edited, drawer closed, edit mode off
     */
    canStart: (state) => {
        return statesMatch(
            {
                canvas: 'hermione-edited',
                drawer: 'closed',
                editMode: false,
            },
            state
        );
    },

    /**
     * Validation: Is this chunk complete?
     * True if image is applied and drawer is closed
     */
    isComplete: (state) => {
        return state.canvas === 'hermione-with-image' && state.drawer === 'closed';
    },
};
