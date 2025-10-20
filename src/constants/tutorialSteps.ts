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
        content: '🎨 This is the Generation Drawer - your AI creation hub! Generate creatures and upload your own images (we\'ll host them free for 1 week). Log in to save everything permanently!',
        placement: 'bottom-start',
        offset: 0,
        styles: {
            tooltip: {
                marginTop: '10px',
                maxWidth: '340px',
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
        content: '📜 Here\'s Hermione the All Cat! Your generated statblock appears here, fully formatted with all the legendary actions, lair actions, and spells we requested. Complex creatures may span multiple pages - scroll down to see everything!',
        placement: 'center',
    },
    {
        target: '[data-tutorial="edit-mode-toggle"]',
        content: '✏️ Edit Mode lets you click and modify any text on your statblock. We\'ll turn it ON now - watch the toggle change!',
        placement: 'left',
    },
    {
        target: '[data-tutorial="creature-name"]',
        content: '✍️ With Edit Mode enabled, you can click any text to change it. Watch as we demonstrate by editing the creature name!',
        placement: 'right',
        styles: {
            tooltip: {
                maxWidth: '300px',
            },
        },
    },
    {
        target: '[data-tutorial="edit-mode-toggle"]',
        content: '🔒 Great! You can click on any text in Edit Mode to change it. Now we\'ll turn Edit Mode OFF to lock your changes and prevent accidental edits.',
        placement: 'left',
        styles: {
            tooltip: {
                maxWidth: '320px',
            },
        },
    },
    {
        target: '[data-tutorial="image-generation-tab"]',
        content: '🖼️ Image Generation creates custom creature portraits using AI! Login is required to save images permanently. The placeholder image shows what your creature could look like - click the Image Generation tab to create your own!',
        placement: 'bottom',
        styles: {
            tooltip: {
                maxWidth: '360px',
            },
        },
    },
    {
        target: '[data-tutorial="upload-zone"]',
        content: '📤 Upload your own images to customize your statblock! Images are stored permanently in your library when logged in. (Note: This step is only shown for logged-in users)',
        placement: 'top',
        styles: {
            tooltip: {
                maxWidth: '340px',
            },
        },
    },
    {
        target: '[data-tutorial="save-button"]',
        content: '💾 Log in to save your creatures permanently and access projects! Without an account, you can still export to HTML/PDF to keep your work.',
        placement: 'bottom',
    },
    {
        target: '[data-tutorial="export-menu"]',
        content: '📄 Export your statblock as HTML or PDF (Firefox recommended for perfect PDFs).',
        placement: 'bottom',
    },
    {
        target: '[data-tutorial="projects-button"]',
        content: '📁 Projects let you save and manage all your creatures permanently. Log in to unlock this feature!',
        placement: 'bottom',
    },
    {
        target: '[data-tutorial="help-button"]',
        content: '❓ Need help? Click here anytime to restart this tutorial. Happy creature creating! 🐉',
        placement: 'bottom',
    },
];

