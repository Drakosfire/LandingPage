/**
 * GenerationProgress Component
 * 
 * Shows animated progress bar with rotating D&D-themed flavor text
 * during AI generation (text or image)
 */

import React, { useState, useEffect } from 'react';
import { Progress, Text, Stack, Box } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import {
    GENERATION_FLAVOR_TEXTS,
    FLAVOR_TEXT_ROTATION_MS
} from '../../constants/generationFlavorText';

interface GenerationProgressProps {
    isGenerating: boolean;
    generationType?: 'text' | 'image';
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
    isGenerating,
    generationType = 'text'
}) => {
    const [flavorText, setFlavorText] = useState(GENERATION_FLAVOR_TEXTS[0]);
    const [textIndex, setTextIndex] = useState(0);

    // Rotate through flavor texts while generating
    useEffect(() => {
        if (!isGenerating) {
            // Reset to first text when not generating
            setTextIndex(0);
            setFlavorText(GENERATION_FLAVOR_TEXTS[0]);
            return;
        }

        const interval = setInterval(() => {
            setTextIndex(prev => (prev + 1) % GENERATION_FLAVOR_TEXTS.length);
        }, FLAVOR_TEXT_ROTATION_MS);

        return () => clearInterval(interval);
    }, [isGenerating]);

    // Update flavor text when index changes
    useEffect(() => {
        setFlavorText(GENERATION_FLAVOR_TEXTS[textIndex]);
    }, [textIndex]);

    if (!isGenerating) return null;

    return (
        <Box
            p="md"
            style={{
                borderRadius: 8,
                backgroundColor: 'var(--mantine-color-violet-0)',
                border: '1px solid var(--mantine-color-violet-3)'
            }}
        >
            <Stack gap="sm">
                <Progress
                    value={100}
                    animated
                    color="violet"
                    size="lg"
                    radius="sm"
                />
                <Text
                    size="sm"
                    fw={500}
                    c="violet.7"
                    style={{
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                    }}
                >
                    <IconSparkles size={16} />
                    {flavorText}
                </Text>
            </Stack>
        </Box>
    );
};

