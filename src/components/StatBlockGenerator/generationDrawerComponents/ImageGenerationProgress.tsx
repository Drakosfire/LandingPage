/**
 * Image Generation Progress Component
 * 
 * Displays animated progress bar with stage-based feedback during image generation.
 * Shows elapsed time, estimated completion, current stage message, and visual indicators.
 */

import React, { useState, useEffect } from 'react';
import { Progress, Stack, Text, Group, Badge } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import { MODEL_TIMINGS, getEstimatedTime } from '../../../constants/generationTiming';

interface ImageGenerationProgressProps {
    model: string;
    startTime: number;
}

export const ImageGenerationProgress: React.FC<ImageGenerationProgressProps> = ({
    model,
    startTime
}) => {
    const [progress, setProgress] = useState(0);
    const [currentStageIndex, setCurrentStageIndex] = useState(0);

    const timing = MODEL_TIMINGS[model];
    const estimatedTime = getEstimatedTime(model);

    // Update progress every 100ms
    useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;

            // Calculate progress percentage (cap at 99% until actual completion)
            const calculatedProgress = Math.min((elapsed / estimatedTime) * 100, 99);
            setProgress(calculatedProgress);

            // Determine current stage based on progress
            if (timing && timing.stages) {
                let cumulativePercentage = 0;

                for (let i = 0; i < timing.stages.length; i++) {
                    cumulativePercentage += timing.stages[i].percentage;

                    if (calculatedProgress < cumulativePercentage) {
                        setCurrentStageIndex(i);
                        break;
                    }
                }

                // If we've passed all stages, stay on last stage
                if (calculatedProgress >= cumulativePercentage) {
                    setCurrentStageIndex(timing.stages.length - 1);
                }
            }
        }, 100);

        return () => clearInterval(interval);
    }, [startTime, estimatedTime, timing]);

    // Get current stage (with fallback)
    const currentStage = timing?.stages?.[currentStageIndex] || {
        name: 'generating',
        percentage: 100,
        message: 'Generating images...'
    };

    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const estimatedSeconds = Math.ceil(estimatedTime / 1000);

    return (
        <Stack gap="md" p="md" style={{
            backgroundColor: 'var(--mantine-color-blue-0)',
            borderRadius: 'var(--mantine-radius-md)',
            border: '1px solid var(--mantine-color-blue-2)'
        }}>
            {/* Header with icon and time */}
            <Group justify="space-between">
                <Group gap="xs">
                    <IconSparkles size={20} color="var(--mantine-color-blue-6)" />
                    <Text fw={500} size="sm">
                        Generating Images
                    </Text>
                </Group>
                <Text size="sm" c="dimmed">
                    {elapsedSeconds}s / ~{estimatedSeconds}s
                </Text>
            </Group>

            {/* Progress bar */}
            <Stack gap="xs">
                <Progress
                    value={progress}
                    size="lg"
                    radius="sm"
                    animated
                    color="blue"
                    styles={{
                        root: {
                            backgroundColor: 'var(--mantine-color-gray-2)'
                        },
                        section: {
                            transition: 'width 0.1s ease-out'
                        }
                    }}
                />

                {/* Stage message and percentage */}
                <Group justify="space-between">
                    <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>
                        {currentStage.message}
                    </Text>
                    <Text size="xs" c="dimmed" fw={600}>
                        {Math.round(progress)}%
                    </Text>
                </Group>
            </Stack>

            {/* Stage indicators (dots) */}
            {timing && timing.stages && timing.stages.length > 0 && (
                <Group gap="xs" justify="center">
                    {timing.stages.map((stage, index) => (
                        <div
                            key={stage.name}
                            title={stage.name}
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: index <= currentStageIndex
                                    ? 'var(--mantine-color-blue-5)'
                                    : 'var(--mantine-color-gray-3)',
                                transition: 'background-color 0.3s ease',
                                cursor: 'help'
                            }}
                        />
                    ))}
                </Group>
            )}
        </Stack>
    );
};



