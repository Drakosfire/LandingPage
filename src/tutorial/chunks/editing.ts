import { TutorialChunk, statesMatch } from './types';
import { TUTORIAL_STEP_NAMES } from '../../constants/tutorialSteps';
import { TutorialLogger } from '../utils/chunkUtilities';

/**
 * EDITING Chunk: Demonstrate statblock editing
 * 
 * Steps: EDIT_TOGGLE_ON → CREATURE_NAME → EDIT_TOGGLE_OFF
 * Duration: ~1-2 minutes
 * Side effects: Enable edit mode, edit name, disable edit mode
 * 
 * This chunk shows how users can customize the generated statblock by
 * editing any text directly on the canvas.
 */
export const EDITING_CHUNK: TutorialChunk = {
    name: 'EDITING',

    steps: [
        TUTORIAL_STEP_NAMES.EDIT_TOGGLE_ON,
        TUTORIAL_STEP_NAMES.CREATURE_NAME,
        TUTORIAL_STEP_NAMES.EDIT_TOGGLE_OFF,
    ],

    purpose: 'Demonstrate statblock editing capabilities',

    requiredState: {
        canvas: 'hermione',
        drawer: 'closed',
        editMode: false,
    },

    providesState: {
        canvas: 'hermione-edited',
        drawer: 'closed',
        editMode: false,
    },

    /**
     * Setup: Ensure Hermione is loaded and ready to edit
     * - Hermione should be on canvas
     * - Drawer should be closed
     * - Edit mode should be OFF
     * - Open toolbox menu
     */
    setup: async () => {
        TutorialLogger.chunkStart('EDITING');
    },

    /**
     * Cleanup: Clean up after editing demo
     * - Edit mode should be OFF
     * - Toolbox menu should be closed
     * - Ready for IMAGE_GENERATION chunk
     */
    cleanup: async () => {
        TutorialLogger.chunkComplete('EDITING');
    },

    /**
     * Step-specific handlers for editing flow
     */
    handlers: {
        // Step 7: Edit toggle ON
        // Show where the edit mode toggle is and turn it on
        [TUTORIAL_STEP_NAMES.EDIT_TOGGLE_ON]: async (data) => {
            if (data.action === 'next') {
                TutorialLogger.stepExecute('EDITING', TUTORIAL_STEP_NAMES.EDIT_TOGGLE_ON, 'next');
            }
        },

        // Step 8: Edit creature name
        // Demonstrate editing the creature name
        [TUTORIAL_STEP_NAMES.CREATURE_NAME]: async (data) => {
            if (data.action === 'next') {
                TutorialLogger.stepExecute('EDITING', TUTORIAL_STEP_NAMES.CREATURE_NAME, 'next');
            }
        },

        // Step 9: Edit toggle OFF
        // Turn off edit mode to lock changes
        [TUTORIAL_STEP_NAMES.EDIT_TOGGLE_OFF]: async (data) => {
            if (data.action === 'next') {
                TutorialLogger.stepExecute('EDITING', TUTORIAL_STEP_NAMES.EDIT_TOGGLE_OFF, 'next');
            }
        },
    },

    /**
     * Validation: Can this chunk start?
     * True if Hermione is loaded, drawer closed, and edit mode is off
     */
    canStart: (state) => {
        return statesMatch(
            {
                canvas: 'hermione',
                drawer: 'closed',
                editMode: false,
            },
            state
        );
    },

    /**
     * Validation: Is this chunk complete?
     * True if canvas shows edited Hermione and edit mode is off
     */
    isComplete: (state) => {
        return state.canvas === 'hermione-edited' && !state.editMode;
    },
};
