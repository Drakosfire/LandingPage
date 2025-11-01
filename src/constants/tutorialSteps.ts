import { Step } from 'react-joyride';

// Step names for dynamic index lookup (no hardcoded indices!)
export const TUTORIAL_STEP_NAMES = {
    WELCOME: 'welcome',
    GENERATION_HEADER: 'generation-header',
    PROJECTS_HEADER: 'projects-header',
    TOOLS_HEADER: 'tools-header',
    DRAWER: 'drawer',
    TEXT_TAB: 'text-tab',
    GENERATE_BUTTON: 'generate-button',
    PROGRESS_BAR: 'progress-bar',
    CANVAS: 'canvas',
    EDIT_TOGGLE_ON: 'edit-toggle-on',
    CREATURE_NAME: 'creature-name',
    EDIT_TOGGLE_OFF: 'edit-toggle-off',
    IMAGE_GEN_TAB: 'image-gen-tab',
    IMAGE_GEN_PROMPT: 'image-gen-prompt',
    IMAGE_GEN_BUTTON: 'image-gen-button',
    IMAGE_GEN_RESULTS: 'image-gen-results',
    MODAL_NAVIGATION: 'modal-navigation',
    IMAGE_SELECT: 'image-select',
    IMAGE_ON_CANVAS: 'image-on-canvas',
    IMAGE_LOGIN_REMINDER: 'image-login-reminder',
    UPLOAD: 'upload',
    SAVE: 'save',
    EXPORT: 'export',
    PROJECTS: 'projects',
    HELP: 'help'
} as const;

// Extended Step type with name property
export type TutorialStep = Step & { name: string };

// Individual step definitions
const WELCOME: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.WELCOME,
    target: 'body',
    content: '👋 Welcome to StatBlock Generator! Let\'s take a quick tour of the main features. This tutorial will show you how to create, edit, and export D&D 5e creature statblocks.',
    disableBeacon: true,
    placement: 'center',
};

const GENERATION_HEADER: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.GENERATION_HEADER,
    target: '[data-tutorial="generation-button"]',
    content: '🎨 Click here to open AI Generation - create creatures from text descriptions or generate portrait images.',
    placement: 'bottom',
};

const PROJECTS_HEADER: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.PROJECTS_HEADER,
    target: '[data-tutorial="projects-button"]',
    content: '💾 Projects lets you save and organize your creations. (Requires free account)',
    placement: 'bottom',
};

const TOOLS_HEADER: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.TOOLS_HEADER,
    target: '[data-tutorial="app-toolbox"]',
    content: '🛠️ The Tools menu has editing controls, export options, and help. You can restart this tutorial anytime from here!',
    placement: 'bottom-end',
};

const DRAWER: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.DRAWER,
    target: '[data-tutorial="generation-drawer-title"]',
    content: '🎨 This is the Generation Drawer - your AI creation hub! Text generation works for everyone, but image generation and uploads require login. Create a free account to unlock all features!',
    placement: 'bottom-start',
    offset: 0,
    styles: {
        tooltip: {
            marginTop: '10px',
            maxWidth: '360px',
        },
    },
};

const TEXT_TAB: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.TEXT_TAB,
    target: '[data-tutorial="text-generation-tab"]',
    content: '✨ Text Generation creates complete D&D 5e creatures from a description. Watch as we automatically fill in the details for "Hermione the All Cat"!',
    placement: 'bottom-start',
    offset: 10,
    styles: {
        tooltip: {
            marginTop: '15px',
            maxWidth: '300px',
        },
    },
};

const GENERATE_BUTTON: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.GENERATE_BUTTON,
    target: '[data-tutorial="generate-button"]',
    content: '🎲 We\'ve entered a description and enabled Legendary Actions, Lair Actions, and Spellcasting! Now we\'ll click Generate to create Hermione. Watch as she appears on the canvas!',
    placement: 'bottom',
    styles: {
        tooltip: {
            marginTop: '10px',
            maxWidth: '340px',
        },
    },
};

const PROGRESS_BAR: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.PROGRESS_BAR,
    target: '[data-tutorial="progress-bar"]',
    content: '⏳ Watch the AI generate your creature! The progress bar shows which stage of creation we\'re in - from calculating stats to weaving in legendary actions, lair actions, and spells. This usually takes 20-40 seconds for complex creatures.',
    placement: 'top',
    styles: {
        tooltip: {
            maxWidth: '360px',
        },
    },
};

const CANVAS: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.CANVAS,
    target: '[data-tutorial="canvas-area"]',
    content: '📜 Here\'s Hermione the All Cat! Your generated statblock appears here, fully formatted with all the legendary actions, lair actions, and spells we requested. Complex creatures may span multiple pages - scroll down to see everything!',
    placement: 'center',
};

const EDIT_TOGGLE_ON: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.EDIT_TOGGLE_ON,
    target: '[data-tutorial="edit-mode-toggle"]',
    content: '✏️ Here\'s the Edit Mode toggle in the App Toolbox menu! We\'ll turn it ON now so you can edit any text on your statblock. Watch the toggle change!',
    placement: 'left',
    styles: {
        tooltip: {
            maxWidth: '340px',
        },
    },
};

const CREATURE_NAME: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.CREATURE_NAME,
    target: '[data-tutorial="creature-name"]',
    content: '✏️ Edit Mode is now ON! You can click any text to change it. Watch as we demonstrate by editing the creature name! (Tip: Edit Mode toggle is in the App Toolbox menu)',
    placement: 'right',
    styles: {
        tooltip: {
            maxWidth: '340px',
        },
    },
};

const EDIT_TOGGLE_OFF: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.EDIT_TOGGLE_OFF,
    target: '[data-tutorial="edit-mode-toggle"]',
    content: '🔒 Now we\'ll turn Edit Mode OFF to lock your changes and prevent accidental edits. Watch the toggle change!',
    placement: 'left',
    styles: {
        tooltip: {
            maxWidth: '340px',
        },
    },
};

const IMAGE_GEN_TAB: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.IMAGE_GEN_TAB,
    target: '[data-tutorial="image-generation-tab"]',
    content: '🖼️ Image Generation creates custom creature portraits using AI! Let\'s walk through how it works. For this demo, we\'ll pretend you\'re logged in to show the full process.',
    placement: 'bottom',
    styles: {
        tooltip: {
            maxWidth: '380px',
        },
    },
};

const IMAGE_GEN_PROMPT: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.IMAGE_GEN_PROMPT,
    target: '[data-tutorial="image-prompt-input"]',
    content: '✍️ Describe the image you want. We\'ve auto-filled a description based on Hermione! You can include style preferences like "digital art" or "realistic".',
    placement: 'top',
    styles: {
        tooltip: {
            maxWidth: '360px',
        },
    },
};

const IMAGE_GEN_BUTTON: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.IMAGE_GEN_BUTTON,
    target: '[data-tutorial="image-generate-button"]',
    content: '🎨 Click Generate to create 4 AI images! In the real app, this takes about 30-60 seconds. For the tutorial, we\'ll show instant results.',
    placement: 'top',
    styles: {
        tooltip: {
            maxWidth: '360px',
        },
    },
};

const IMAGE_GEN_RESULTS: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.IMAGE_GEN_RESULTS,
    target: '[data-tutorial="image-results-grid"]',
    content: '🖼️ Here are your generated images! Each generation creates 4 variations. Watch as we use the expand button to view images full size!',
    placement: 'top',
    styles: {
        tooltip: {
            maxWidth: '360px',
        },
    },
};

const MODAL_NAVIGATION: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.MODAL_NAVIGATION,
    target: '[data-tutorial="modal-prev-button"]',
    content: '⬅️➡️ Use these navigation buttons to flip through all 4 images in full size! We\'re currently viewing the 4th image, so the previous button is highlighted. Close the modal when you\'re done browsing.',
    placement: 'top',
    styles: {
        tooltip: {
            maxWidth: '340px',
        },
    },
};

const IMAGE_SELECT: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.IMAGE_SELECT,
    target: '[data-tutorial="image-result-2"]',
    content: '🖼️ Watch as we select the 3rd image to use as Hermione\'s portrait. You can choose any image from your generated set!',
    placement: 'top',
    styles: {
        tooltip: {
            maxWidth: '340px',
        },
    },
};

const IMAGE_ON_CANVAS: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.IMAGE_ON_CANVAS,
    target: '[data-tutorial="creature-portrait"]',
    content: '✨ Perfect! The image now appears on your statblock as your creature\'s portrait. You can generate new images anytime or upload your own!',
    placement: 'bottom',
    styles: {
        tooltip: {
            maxWidth: '340px',
        },
    },
};

const IMAGE_LOGIN_REMINDER: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.IMAGE_LOGIN_REMINDER,
    target: 'body',
    content: '🎉 Tutorial Complete! You\'re ready to create your own creatures! Text generation works without login, but you\'ll need a free account for image generation and project management. Click Next to start creating!',
    placement: 'center',
    styles: {
        tooltip: {
            maxWidth: '400px',
        },
    },
};

const SAVE: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.SAVE,
    target: '[data-tutorial="save-button"]',
    content: '💾 Log in to save your creatures permanently and access projects! Without an account, you can still export to HTML/PDF to keep your work.',
    placement: 'bottom',
};

const EXPORT: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.EXPORT,
    target: '[data-tutorial="export-menu"]',
    content: '📄 Export your statblock as HTML or PDF (Firefox recommended for perfect PDFs).',
    placement: 'bottom',
};

const PROJECTS: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.PROJECTS,
    target: '[data-tutorial="projects-button"]',
    content: '📁 Projects let you save and manage all your creatures permanently. Log in to unlock this feature!',
    placement: 'bottom',
};

const HELP: TutorialStep = {
    name: TUTORIAL_STEP_NAMES.HELP,
    target: '[data-tutorial="help-button"]',
    content: '❓ Need help? Click here anytime to restart this tutorial. Happy creature creating! 🐉',
    placement: 'bottom',
};

// Guest tutorial flow: 19 steps (0-18) - added 3 header orientation steps
export const GUEST_TUTORIAL_STEPS: TutorialStep[] = [
    WELCOME,              // Step 0: Welcome overview
    GENERATION_HEADER,    // Step 1: Generation button
    PROJECTS_HEADER,      // Step 2: Projects button
    TOOLS_HEADER,         // Step 3: Tools menu
    DRAWER,               // Step 4: Generation drawer (was step 1)
    TEXT_TAB,             // Step 5: Text gen tab (was step 2)
    GENERATE_BUTTON,      // Step 6: Generate button (was step 3)
    PROGRESS_BAR,         // Step 7: Progress bar (was step 4)
    CANVAS,               // Step 8: Canvas (was step 5)
    EDIT_TOGGLE_ON,       // Step 9: Edit mode on (was step 6)
    CREATURE_NAME,        // Step 10: Creature name (was step 7)
    EDIT_TOGGLE_OFF,      // Step 11: Edit mode off (was step 8)
    IMAGE_GEN_TAB,        // Step 12: Image gen tab (was step 9)
    IMAGE_GEN_PROMPT,     // Step 13: Image prompt (was step 10)
    IMAGE_GEN_BUTTON,     // Step 14: Image gen button (was step 11)
    IMAGE_GEN_RESULTS,    // Step 15: Image results (was step 12)
    MODAL_NAVIGATION,     // Step 16: Image modal nav (was step 13)
    IMAGE_SELECT,         // Step 17: Image select (was step 14)
    IMAGE_ON_CANVAS,      // Step 18: Image on canvas (was step 15)
];

// Logged-in tutorial flow: 24 steps (0-23)
export const LOGGEDIN_TUTORIAL_STEPS: TutorialStep[] = [
    ...GUEST_TUTORIAL_STEPS,  // First 19 steps
    IMAGE_LOGIN_REMINDER,     // Step 19: Login reminder (was step 16)
    SAVE,                     // Step 20: Save (was step 17)
    EXPORT,                   // Step 21: Export (was step 18)
    PROJECTS,                 // Step 22: Projects (was step 19)
    HELP,                     // Step 23: Help (was step 20)
];

// Master list (for backwards compatibility / reference)
export const tutorialSteps: TutorialStep[] = LOGGEDIN_TUTORIAL_STEPS;

// Helper function to get step index by name
export const getStepIndex = (name: string): number => {
    return tutorialSteps.findIndex(step => step.name === name);
};

// Helper function to get step name by index
export const getStepName = (index: number): string | undefined => {
    return tutorialSteps[index]?.name;
};

