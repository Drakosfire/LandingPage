// rulesLawyerToolboxConfig.tsx - Rules Lawyer AppToolbox Configuration
// Centralizes toolbox section definitions for UnifiedHeader integration

import React from 'react';
import { IconTrash, IconHelp, IconBook } from '@tabler/icons-react';
import { ToolboxSection } from '../AppToolbox';

/**
 * Props for creating Rules Lawyer toolbox sections
 */
export interface RulesLawyerToolboxConfigProps {
    // Chat Actions
    onClearChat: () => void;
    
    // Embedding Selector
    embeddingSelectorComponent?: React.ReactNode;
    
    // Help
    onHelpClick?: () => void;
}

/**
 * Create Rules Lawyer toolbox sections
 * 
 * Returns a ToolboxSection array configured with all Rules Lawyer controls:
 * - Chat: Clear chat button
 * - Sources: Embedding selector
 * - Help: Tutorial/help link
 * 
 * Usage:
 * ```typescript
 * const toolboxSections = createRulesLawyerToolboxSections({
 *   onClearChat: handleClearChat,
 *   embeddingSelectorComponent: <EmbeddingSelector />,
 *   onHelpClick: handleHelp
 * });
 * 
 * <UnifiedHeader toolboxSections={toolboxSections} />
 * ```
 */
export const createRulesLawyerToolboxSections = (props: RulesLawyerToolboxConfigProps): ToolboxSection[] => {
    const {
        onClearChat,
        embeddingSelectorComponent,
        onHelpClick
    } = props;

    const sections: ToolboxSection[] = [
        // Section 1: Chat Actions
        {
            id: 'chat',
            label: 'Chat',
            controls: [
                {
                    id: 'clear-chat',
                    type: 'menu-item',
                    label: 'Clear Chat',
                    icon: <IconTrash size={16} />,
                    onClick: onClearChat,
                    color: 'red',
                    dataAttributes: {
                        'data-tutorial': 'clear-chat-button'
                    }
                }
            ]
        }
    ];

    // Section 2: Sources (if embedding selector provided)
    if (embeddingSelectorComponent) {
        sections.push({
            id: 'sources',
            label: 'Sources',
            controls: [
                {
                    id: 'embedding-selector',
                    type: 'component',
                    component: (
                        <div data-tutorial="embedding-selector">
                            {embeddingSelectorComponent}
                        </div>
                    )
                }
            ]
        });
    }

    // Section 3: Help (if handler provided)
    if (onHelpClick) {
        sections.push({
            id: 'help',
            label: 'Help',
            controls: [
                {
                    id: 'tutorial',
                    type: 'menu-item',
                    label: 'How to Use',
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


