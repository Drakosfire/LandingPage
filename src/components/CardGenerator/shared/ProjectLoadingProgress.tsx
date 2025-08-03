import React, { useState, useEffect } from 'react';
import { Alert, Stack, Text, Progress, Loader } from '@mantine/core';

interface ProjectLoadingProgressProps {
    projectId: string;
    projectName: string;
    onComplete?: () => void;
}

const ProjectLoadingProgress: React.FC<ProjectLoadingProgressProps> = ({
    projectId,
    projectName,
    onComplete
}) => {
    const [loadingStage, setLoadingStage] = useState<'init' | 'data' | 'assets' | 'complete'>('init');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const stages = ['init', 'data', 'assets', 'complete'];
        let currentStageIndex = 0;

        const interval = setInterval(() => {
            if (currentStageIndex < stages.length - 1) {
                currentStageIndex++;
                setLoadingStage(stages[currentStageIndex] as any);
                setProgress((currentStageIndex / (stages.length - 1)) * 100);
            } else {
                clearInterval(interval);
                if (onComplete) {
                    setTimeout(onComplete, 500); // Small delay for smooth transition
                }
            }
        }, 500);

        return () => clearInterval(interval);
    }, [onComplete]);

    const stageMessages = {
        init: 'Initializing project...',
        data: 'Loading project data...',
        assets: 'Loading images and assets...',
        complete: 'Project loaded successfully!'
    };

    const stageIcons = {
        init: '📁',
        data: '📊',
        assets: '🖼️',
        complete: '✅'
    };

    return (
        <Alert
            icon={<Loader size={16} />}
            color="blue"
            variant="light"
            style={{ marginBottom: '1rem' }}
        >
            <Stack gap="xs">
                <Text size="sm" fw={500}>
                    Loading: {projectName}
                </Text>
                <Text size="xs" c="dimmed">
                    {stageMessages[loadingStage]}
                </Text>
                <Progress
                    value={progress}
                    size="sm"
                    color="blue"
                />
                <Text size="xs" c="dimmed" ta="center">
                    {Math.round(progress)}% complete
                </Text>
            </Stack>
        </Alert>
    );
};

export default ProjectLoadingProgress; 