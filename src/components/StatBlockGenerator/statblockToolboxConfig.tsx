// statblockToolboxConfig.tsx - StatBlock Generator AppToolbox Configuration
// Centralizes toolbox section definitions for UnifiedHeader integration

import React from 'react';
import { IconDeviceFloppy, IconDownload, IconFileText, IconPrinter, IconHelp } from '@tabler/icons-react';
import { ToolboxSection } from '../AppToolbox';
import { EditModeSwitch } from './EditModeSwitch';

/**
 * Props for creating StatBlock toolbox sections
 */
export interface StatBlockToolboxConfigProps {
    // Edit Mode
    isCanvasEditMode: boolean;
    setIsCanvasEditMode: (enabled: boolean) => void;

    // Actions
    isLoggedIn: boolean;
    saveNow: () => void;
    saveStatus: 'idle' | 'saving' | 'saved' | 'error';
    handleExportHTML: () => void;
    handleExportPDF: () => void;

    // Help
    handleHelpTutorial: () => void;
}

/**
 * Create StatBlock Generator toolbox sections
 * 
 * Returns a ToolboxSection array configured with all StatBlock controls:
 * - Editing: Edit Mode toggle
 * - Actions: Save, Export (HTML/PDF)
 * - Help: Tutorial
 * 
 * Note: Generation and Projects are now separate header buttons (not in toolbox)
 * 
 * Usage:
 * ```typescript
 * const toolboxSections = createStatBlockToolboxSections({
 *   isCanvasEditMode,
 *   setIsCanvasEditMode,
 *   isLoggedIn,
 *   saveNow,
 *   saveStatus,
 *   handleExportHTML,
 *   handleExportPDF,
 *   handleHelpTutorial
 * });
 * 
 * <UnifiedHeader toolboxSections={toolboxSections} />
 * ```
 */
export const createStatBlockToolboxSections = (props: StatBlockToolboxConfigProps): ToolboxSection[] => {
    const {
        isCanvasEditMode,
        setIsCanvasEditMode,
        isLoggedIn,
        saveNow,
        saveStatus,
        handleExportHTML,
        handleExportPDF,
        handleHelpTutorial
    } = props;

    return [
        // Section 1: Editing
        {
            id: 'editing',
            label: 'Editing',
            controls: [
                {
                    id: 'edit-mode',
                    type: 'component',
                    component: (
                        <EditModeSwitch
                            checked={isCanvasEditMode}
                            onChange={setIsCanvasEditMode}
                        />
                    )
                }
            ]
        },

        // Section 2: Actions
        {
            id: 'actions',
            label: 'Actions',
            controls: [
                {
                    id: 'save',
                    type: 'menu-item',
                    label: 'Save Now',
                    icon: <IconDeviceFloppy size={16} />,
                    onClick: saveNow,
                    disabled: !isLoggedIn || saveStatus === 'saving',
                    color: saveStatus === 'error' ? 'red' : saveStatus === 'saved' ? 'green' : 'blue'
                },
                {
                    id: 'export',
                    type: 'submenu',
                    label: 'Export',
                    icon: <IconDownload size={16} />,
                    submenuItems: [
                        {
                            id: 'export-html',
                            label: 'Export as HTML',
                            icon: <IconFileText size={14} />,
                            onClick: handleExportHTML
                        },
                        {
                            id: 'export-pdf',
                            label: 'Export as PDF',
                            icon: <IconPrinter size={14} />,
                            onClick: handleExportPDF
                        }
                    ]
                }
            ]
        },

        // Section 3: Help
        {
            id: 'help',
            label: 'Help',
            controls: [
                {
                    id: 'tutorial',
                    type: 'menu-item',
                    label: 'Tutorial',
                    icon: <IconHelp size={16} />,
                    onClick: handleHelpTutorial
                }
            ]
        }
    ];
};
