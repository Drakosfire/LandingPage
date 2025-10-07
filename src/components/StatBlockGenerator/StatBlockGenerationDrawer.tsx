// StatBlockGenerationDrawer.tsx - Context-aware wrapper for Generation Drawer
// Pattern: Follow StatBlockProjectsDrawer.tsx structure

import React from 'react';
import GenerationDrawer from './GenerationDrawer';
import { useStatBlockGenerator } from './StatBlockGeneratorProvider';

interface StatBlockGenerationDrawerProps {
    opened: boolean;
    onClose: () => void;
}

const StatBlockGenerationDrawer: React.FC<StatBlockGenerationDrawerProps> = ({
    opened,
    onClose
}) => {
    const { isGenerating } = useStatBlockGenerator();

    return (
        <GenerationDrawer
            opened={opened}
            onClose={onClose}
            isGenerationInProgress={isGenerating}
        />
    );
};

export default StatBlockGenerationDrawer;
