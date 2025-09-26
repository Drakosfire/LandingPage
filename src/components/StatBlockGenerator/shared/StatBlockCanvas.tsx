import React, { useMemo } from 'react';
import { Text, Stack, Card } from '@mantine/core';

import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';
import DnDStatblockWorkspace from '../DnDStatblockWorkspace';

const StatBlockCanvas: React.FC = () => {
    const { currentStepId, isCanvasPreviewReady } = useStatBlockGenerator();

    const canvasContent = useMemo(() => {
        if (isCanvasPreviewReady) {
            return <DnDStatblockWorkspace />;
        }

        return (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="sm">
                    <Text fw={500}>Canvas Preview</Text>
                    <Text size="sm" c="dimmed">
                        Canvas content for the {currentStepId ? currentStepId.replace('-', ' ') : 'current'} step will
                        appear here once its tooling is connected. We’ll wire this up alongside the upcoming feature
                        work.
                    </Text>
                </Stack>
            </Card>
        );
    }, [currentStepId, isCanvasPreviewReady]);

    return (
        <div className="statblock-canvas-area">
            {canvasContent}
        </div>
    );
};

export default StatBlockCanvas;

