// cardToolboxConfig.tsx - Card Generator AppToolbox Configuration
// Centralizes toolbox section definitions for UnifiedHeader integration

import React from 'react';
import { IconDeviceFloppy, IconFolder, IconHelp, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { ToolboxSection } from '../AppToolbox';

/**
 * Props for creating Card Generator toolbox sections
 */
export interface CardToolboxConfigProps {
    // Save
    isLoggedIn: boolean;
    saveStatus: 'idle' | 'saving' | 'saved' | 'error';
    onSave: () => void;
    canSave: boolean;
    
    // Projects
    onProjectsClick?: () => void;
    
    // Navigation
    currentStepIndex: number;
    totalSteps: number;
    canGoNext: boolean;
    canGoPrevious: boolean;
    onNext: () => void;
    onPrevious: () => void;
    
    // Help
    onHelpClick?: () => void;
}

/**
 * Create Card Generator toolbox sections
 * 
 * Returns a ToolboxSection array configured with all Card Generator controls:
 * - Navigation: Previous/Next step controls
 * - Actions: Save, Projects
 * - Help: Tutorial/help link
 * 
 * Usage:
 * ```typescript
 * const toolboxSections = createCardToolboxSections({
 *   isLoggedIn,
 *   saveStatus,
 *   onSave,
 *   canSave,
 *   currentStepIndex,
 *   totalSteps,
 *   canGoNext,
 *   canGoPrevious,
 *   onNext,
 *   onPrevious,
 *   onProjectsClick,
 *   onHelpClick
 * });
 * 
 * <UnifiedHeader toolboxSections={toolboxSections} />
 * ```
 */
export const createCardToolboxSections = (props: CardToolboxConfigProps): ToolboxSection[] => {
    const {
        isLoggedIn,
        saveStatus,
        onSave,
        canSave,
        onProjectsClick,
        currentStepIndex,
        totalSteps,
        canGoNext,
        canGoPrevious,
        onNext,
        onPrevious,
        onHelpClick
    } = props;

    const sections: ToolboxSection[] = [
        // Section 1: Navigation
        {
            id: 'navigation',
            label: `Step ${currentStepIndex + 1} of ${totalSteps}`,
            controls: [
                {
                    id: 'previous-step',
                    type: 'menu-item',
                    label: 'Previous Step',
                    icon: <IconChevronLeft size={16} />,
                    onClick: onPrevious,
                    disabled: !canGoPrevious,
                    dataAttributes: {
                        'data-tutorial': 'previous-step-button'
                    }
                },
                {
                    id: 'next-step',
                    type: 'menu-item',
                    label: 'Next Step',
                    icon: <IconChevronRight size={16} />,
                    onClick: onNext,
                    disabled: !canGoNext,
                    dataAttributes: {
                        'data-tutorial': 'next-step-button'
                    }
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
                    label: 'Save Project',
                    icon: <IconDeviceFloppy size={16} />,
                    onClick: onSave,
                    disabled: !isLoggedIn || !canSave || saveStatus === 'saving',
                    color: saveStatus === 'error' ? 'red' : saveStatus === 'saved' ? 'green' : 'blue',
                    dataAttributes: {
                        'data-tutorial': 'save-button'
                    }
                },
                ...(onProjectsClick ? [{
                    id: 'projects',
                    type: 'menu-item' as const,
                    label: 'My Projects',
                    icon: <IconFolder size={16} />,
                    onClick: onProjectsClick,
                    disabled: !isLoggedIn,
                    dataAttributes: {
                        'data-tutorial': 'projects-button'
                    }
                }] : [])
            ]
        }
    ];

    // Section 3: Help (if handler provided)
    if (onHelpClick) {
        sections.push({
            id: 'help',
            label: 'Help',
            controls: [
                {
                    id: 'tutorial',
                    type: 'menu-item',
                    label: 'Tutorial',
                    icon: <IconHelp size={16} />,
                    onClick: onHelpClick,
                    dataAttributes: {
                        'data-tutorial': 'help-button'
                    }
                }
            ]
        });
    }

    return sections;
};


