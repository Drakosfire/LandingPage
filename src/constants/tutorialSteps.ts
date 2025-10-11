import { Step } from 'react-joyride';

export const tutorialSteps: Step[] = [
    {
        target: '[data-tutorial="generation-button"]',
        content: '👋 Welcome to StatBlock Generator! Click here to create your first creature using AI.',
        disableBeacon: true,
        placement: 'bottom',
    },
    {
        target: '[data-tutorial="generation-drawer-title"]',
        content: '🎨 This is the Generation Drawer - your AI creation hub! Here you can generate creatures and their artwork.',
        placement: 'bottom-start',
        offset: 0,
        styles: {
            tooltip: {
                marginTop: '10px',
                maxWidth: '320px',
            },
        },
    },
    {
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
        target: '[data-tutorial="canvas-area"]',
        content: '📜 Here\'s Hermione the All Cat! Your generated statblock appears here, fully formatted with all the legendary actions, lair actions, and spells we requested.',
        placement: 'center',
    },
    {
        target: '[data-tutorial="edit-mode-toggle"]',
        content: '✏️ Edit Mode lets you click and modify any text on your statblock. We\'ll turn it ON now - watch the toggle change!',
        placement: 'left',
    },
    {
        target: '[data-tutorial="save-button"]',
        content: '💾 Save your changes to persist your creature. Auto-save keeps your work safe every 30 seconds.',
        placement: 'bottom',
    },
    {
        target: '[data-tutorial="export-menu"]',
        content: '📄 Export your statblock as HTML or PDF (Firefox recommended for perfect PDFs).',
        placement: 'bottom',
    },
    {
        target: '[data-tutorial="projects-button"]',
        content: '📁 All your creatures are saved here. Load, delete, or manage your projects anytime.',
        placement: 'bottom',
    },
    {
        target: '[data-tutorial="help-button"]',
        content: '❓ Need help? Click here anytime to restart this tutorial. Happy creature creating! 🐉',
        placement: 'bottom',
    },
];

