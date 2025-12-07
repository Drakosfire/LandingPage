/**
 * CharacterGenerator Toolbox Configuration
 * 
 * Defines toolbox sections for UnifiedHeader integration.
 * Phase 1: Minimal toolbox (Help + Dev Tools)
 * Phase 2+: Will add Save, Export, etc.
 * 
 * @module CharacterGenerator
 */

import React from 'react';
import { IconHelp, IconUser, IconSword, IconWand } from '@tabler/icons-react';
import { ToolboxSection } from '../AppToolbox';

/**
 * Demo character option
 */
export interface DemoCharacterOption {
    value: string;
    label: string;
}

/**
 * Props for creating Character Generator toolbox sections
 */
export interface CharacterToolboxConfigProps {
    // Help
    handleHelpTutorial?: () => void;

    // Dev Tools
    loadDemoCharacter?: (key: string) => void;
    demoCharacterOptions?: DemoCharacterOption[];

    // Phase 2+: Save, Export, etc.
    // isLoggedIn?: boolean;
    // saveNow?: () => void;
    // saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
}

/**
 * Get icon for demo character type
 */
const getDemoIcon = (key: string) => {
    switch (key) {
        case 'wizard': return <IconWand size={16} />;
        case 'fighter':
        default: return <IconSword size={16} />;
    }
};

/**
 * Create Character Generator toolbox sections
 * 
 * Phase 1: Minimal toolbox (Help + Dev Tools)
 * Phase 2+: Will expand with Save, Export, etc.
 */
export const createCharacterToolboxSections = (
    props: CharacterToolboxConfigProps
): ToolboxSection[] => {
    const { handleHelpTutorial, loadDemoCharacter, demoCharacterOptions = [] } = props;

    // Build demo character controls from options
    const demoControls = demoCharacterOptions.map(option => ({
        id: `load-demo-${option.value}`,
        type: 'menu-item' as const,
        label: option.label,
        icon: getDemoIcon(option.value),
        onClick: () => loadDemoCharacter?.(option.value),
        disabled: !loadDemoCharacter
    }));

    return [
        // Section 1: Dev Tools (for testing)
        {
            id: 'dev',
            label: 'Dev Tools',
            controls: demoControls.length > 0 ? demoControls : [
                {
                    id: 'load-demo',
                    type: 'menu-item' as const,
                    label: 'Load Demo Character',
                    icon: <IconUser size={16} />,
                    onClick: () => loadDemoCharacter?.('fighter'),
                    disabled: !loadDemoCharacter
                }
            ]
        },

        // Section 2: Help (placeholder for Phase 1)
        {
            id: 'help',
            label: 'Help',
            controls: [
                {
                    id: 'tutorial',
                    type: 'menu-item' as const,
                    label: 'Tutorial',
                    icon: <IconHelp size={16} />,
                    onClick: handleHelpTutorial || (() => console.log('🎓 Tutorial (Phase 2+)')),
                    disabled: !handleHelpTutorial
                }
            ]
        }

        // Phase 2+: Add more sections
        // {
        //     id: 'actions',
        //     label: 'Actions',
        //     controls: [
        //         { id: 'save', type: 'menu-item', label: 'Save', onClick: saveNow },
        //         { id: 'export', type: 'menu-item', label: 'Export', onClick: handleExport }
        //     ]
        // }
    ];
};

