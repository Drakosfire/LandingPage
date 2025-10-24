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
    IMAGE_GEN: 'image-gen',
    UPLOAD: 'upload',
    SAVE: 'save',
    EXPORT: 'export',
    PROJECTS: 'projects',
    HELP: 'help'
} as const;

// Extended Step type with name property
export type TutorialStep = Step & { name: string };

export const tutorialSteps: TutorialStep[] = [
    {
        name: TUTORIAL_STEP_NAMES.WELCOME,
        target: '[data-tutorial="generation-button"]',
        content: '👋 Welcome to StatBlock Generator! Click here to create your first creature using AI.',
        disableBeacon: true,
        placement: 'bottom',
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
        name: TUTORIAL_STEP_NAMES.PROGRESS_BAR,
        target: '[data-tutorial="progress-bar"]',
        content: '⏳ Watch the AI generate your creature! The progress bar shows which stage of creation we\'re in - from calculating stats to weaving in legendary actions, lair actions, and spells. This usually takes 20-40 seconds for complex creatures.',
        placement: 'top',
        styles: {
            tooltip: {
                maxWidth: '360px',
            },
        },
    },
    {
        name: TUTORIAL_STEP_NAMES.CANVAS,
        target: '[data-tutorial="canvas-area"]',
        content: '📜 Here\'s Hermione the All Cat! Your generated statblock appears here, fully formatted with all the legendary actions, lair actions, and spells we requested. Complex creatures may span multiple pages - scroll down to see everything!',
        placement: 'center',
    },
    {
        name: TUTORIAL_STEP_NAMES.EDIT_TOGGLE_ON,
        target: '[data-tutorial="edit-mode-toggle"]',
        content: '✏️ Here\'s the Edit Mode toggle in the App Toolbox menu! We\'ll turn it ON now so you can edit any text on your statblock. Watch the toggle change!',
        placement: 'left',
        styles: {
            tooltip: {
                maxWidth: '340px',
            },
        },
    },
    {
        name: TUTORIAL_STEP_NAMES.CREATURE_NAME,
        target: '[data-tutorial="creature-name"]',
        content: '✏️ Edit Mode is now ON! You can click any text to change it. Watch as we demonstrate by editing the creature name! (Tip: Edit Mode toggle is in the App Toolbox menu)',
        placement: 'right',
        styles: {
            tooltip: {
                maxWidth: '340px',
            },
        },
    },
    {
        name: TUTORIAL_STEP_NAMES.EDIT_TOGGLE_OFF,
        target: '[data-tutorial="edit-mode-toggle"]',
        content: '🔒 Now we\'ll turn Edit Mode OFF to lock your changes and prevent accidental edits. Watch the toggle change!',
        placement: 'left',
        styles: {
            tooltip: {
                maxWidth: '340px',
            },
        },
    },
    {
        name: TUTORIAL_STEP_NAMES.IMAGE_GEN,
        target: '[data-tutorial="image-generation-tab"]',
        content: '🖼️ Image Generation creates custom creature portraits using AI! ⚠️ IMPORTANT: You must be logged in to generate and save images. The placeholder shows what your creature could look like - create an account to unlock this feature!',
        placement: 'bottom',
        styles: {
            tooltip: {
                maxWidth: '380px',
            },
        },
    },
    {
        name: TUTORIAL_STEP_NAMES.UPLOAD,
        target: '[data-tutorial="upload-zone"]',
        content: '📤 Upload your own images to customize your statblock! All uploaded images are stored permanently in your library. ⚠️ Login required for this feature. (Note: This step is only shown for logged-in users)',
        placement: 'top',
        styles: {
            tooltip: {
                maxWidth: '360px',
            },
        },
    },
    {
        name: TUTORIAL_STEP_NAMES.SAVE,
        target: '[data-tutorial="save-button"]',
        content: '💾 Log in to save your creatures permanently and access projects! Without an account, you can still export to HTML/PDF to keep your work.',
        placement: 'bottom',
    },
    {
        name: TUTORIAL_STEP_NAMES.EXPORT,
        target: '[data-tutorial="export-menu"]',
        content: '📄 Export your statblock as HTML or PDF (Firefox recommended for perfect PDFs).',
        placement: 'bottom',
    },
    {
        name: TUTORIAL_STEP_NAMES.PROJECTS,
        target: '[data-tutorial="projects-button"]',
        content: '📁 Projects let you save and manage all your creatures permanently. Log in to unlock this feature!',
        placement: 'bottom',
    },
    {
        name: TUTORIAL_STEP_NAMES.HELP,
        target: '[data-tutorial="help-button"]',
        content: '❓ Need help? Click here anytime to restart this tutorial. Happy creature creating! 🐉',
        placement: 'bottom',
    },
];

// Helper function to get step index by name
export const getStepIndex = (name: string): number => {
    return tutorialSteps.findIndex(step => step.name === name);
};

// Helper function to get step name by index
export const getStepName = (index: number): string | undefined => {
    return tutorialSteps[index]?.name;
};

