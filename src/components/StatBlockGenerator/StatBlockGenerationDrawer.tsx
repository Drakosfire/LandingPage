// StatBlockGenerationDrawer.tsx - Context-aware wrapper for Generation Drawer
// Pattern: Follow StatBlockProjectsDrawer.tsx structure

import React from 'react';
import GenerationDrawer from './GenerationDrawer';
import { useStatBlockGenerator } from './StatBlockGeneratorProvider';

interface StatBlockGenerationDrawerProps {
    opened: boolean;
    onClose: () => void;
    initialTab?: 'text' | 'image';
    initialPrompt?: string;
    isTutorialMode?: boolean;
    onGenerationComplete?: () => void;
}

const StatBlockGenerationDrawer: React.FC<StatBlockGenerationDrawerProps> = ({
    opened,
    onClose,
    initialTab,
    initialPrompt,
    isTutorialMode,
    onGenerationComplete
}) => {
    const { isGenerating } = useStatBlockGenerator();

    return (
        <GenerationDrawer
            opened={opened}
            onClose={onClose}
            isGenerationInProgress={isGenerating}
            initialTab={initialTab}
            initialPrompt={initialPrompt}
            isTutorialMode={isTutorialMode}
            onGenerationComplete={onGenerationComplete}
        />
    );
};

export default StatBlockGenerationDrawer;
