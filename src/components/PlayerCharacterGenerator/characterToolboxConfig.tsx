/**
 * CharacterGenerator Toolbox Configuration
 * 
 * Defines toolbox sections for UnifiedHeader integration.
 * Phase 1: Minimal toolbox (Help only)
 * Phase 2+: Will add Save, Export, etc.
 * 
 * @module CharacterGenerator
 */

import React from 'react';
import { IconHelp } from '@tabler/icons-react';
import { ToolboxSection } from '../AppToolbox';

/**
 * Props for creating Character Generator toolbox sections
 */
export interface CharacterToolboxConfigProps {
    // Help
    handleHelpTutorial?: () => void;

    // Phase 2+: Save, Export, etc.
    // isLoggedIn?: boolean;
    // saveNow?: () => void;
    // saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
}

/**
 * Create Character Generator toolbox sections
 * 
 * Phase 1: Minimal toolbox (just help placeholder)
 * Phase 2+: Will expand with Save, Export, etc.
 */
export const createCharacterToolboxSections = (
    props: CharacterToolboxConfigProps
): ToolboxSection[] => {
    const { handleHelpTutorial } = props;

    return [
        // Section 1: Help (placeholder for Phase 1)
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

