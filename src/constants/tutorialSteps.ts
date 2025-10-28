import { Step } from 'react-joyride';

// Step names for dynamic index lookup (no hardcoded indices!)
export const TUTORIAL_STEP_NAMES = {
    WELCOME: 'welcome',
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
    target: '[data-tutorial="generation-button"]',
    content: '👋 Welcome to StatBlock Generator! Click here to create your first creature using AI. 💡 Tip: You can restart this tutorial anytime by clicking the Tutorial button in the tools menu (top-right).',
    disableBeacon: true,
    placement: 'bottom',
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

// Guest tutorial flow: 16 steps (0-15)
export const GUEST_TUTORIAL_STEPS: TutorialStep[] = [
    WELCOME,
    DRAWER,
    TEXT_TAB,
    GENERATE_BUTTON,
    PROGRESS_BAR,
    CANVAS,
    EDIT_TOGGLE_ON,
    CREATURE_NAME,
    EDIT_TOGGLE_OFF,
    IMAGE_GEN_TAB,
    IMAGE_GEN_PROMPT,
    IMAGE_GEN_BUTTON,
    IMAGE_GEN_RESULTS,
    MODAL_NAVIGATION,
    IMAGE_SELECT,
    IMAGE_ON_CANVAS,
];

// Logged-in tutorial flow: 21 steps (0-20)
export const LOGGEDIN_TUTORIAL_STEPS: TutorialStep[] = [
    ...GUEST_TUTORIAL_STEPS,  // First 16 steps
    IMAGE_LOGIN_REMINDER,
    SAVE,
    EXPORT,
    PROJECTS,
    HELP,
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

