/**
 * Tutorial Progress Bar Simulation
 * 
 * A self-contained, simulated version of TextGenerationProgress for use in tutorials.
 * Runs completely independently from the actual generation system.
 * 
 * Duration: 7 seconds
 * Complexity: 'full' (legendary + lair + spellcasting)
 */

import React, { useState, useEffect } from 'react';
import { Progress, Stack, Text, Group } from '@mantine/core';
import { IconWand } from '@tabler/icons-react';
import { COMPLEXITY_TIMINGS } from '../../constants/textGenerationTiming';

interface TutorialProgressBarSimulationProps {
    onComplete?: () => void;
}

export const TutorialProgressBarSimulation: React.FC<TutorialProgressBarSimulationProps> = ({
    onComplete
}) => {
    const [progress, setProgress] = useState(0);
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    const complexity = 'full'; // Tutorial always uses full complexity (Hermione)
    const tutorialDuration = 7000; // 7 seconds
    const estimatedSeconds = 7;

    const timing = COMPLEXITY_TIMINGS[complexity];

    useEffect(() => {
        console.log('🎓 [Tutorial] Starting progress bar simulation');
        const startTime = Date.now();

        // Update progress every 100ms
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const elapsedSec = Math.floor(elapsed / 1000);
            setElapsedSeconds(elapsedSec);

            // Calculate progress percentage (cap at 99% until completion)
            const calculatedProgress = Math.min((elapsed / tutorialDuration) * 100, 99);
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

            // Complete at 7 seconds
            if (elapsed >= tutorialDuration) {
                clearInterval(interval);
                setProgress(100);
                console.log('✅ [Tutorial] Progress bar simulation complete');
                onComplete?.();
            }
        }, 100);

        return () => {
            clearInterval(interval);
        };
    }, [onComplete]); // eslint-disable-line react-hooks/exhaustive-deps

    // Get current stage (with fallback)
    const currentStage = timing?.stages?.[currentStageIndex] || {
        name: 'generating',
        percentage: 100,
        message: '🎲 Generating creature...'
    };

    return (
        <Stack
            gap="md"
            p="md"
            style={{
                backgroundColor: 'var(--mantine-color-violet-0)',
                borderRadius: 'var(--mantine-radius-md)',
                border: '1px solid var(--mantine-color-violet-2)',
                marginTop: '1rem'
            }}
            data-tutorial="progress-bar"
        >
            {/* Header with icon and time */}
            <Group justify="space-between">
                <Group gap="xs">
                    <IconWand size={20} color="var(--mantine-color-violet-6)" />
                    <Text fw={500} size="sm">
                        Generating Creature (Tutorial Demo)
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
                    color="violet"
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
                                    ? 'var(--mantine-color-violet-5)'
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

