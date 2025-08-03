import React, { useState, useEffect } from 'react';
import { Box, Stack, Title, Text, Progress, Badge } from '@mantine/core';

interface FunGenerationFeedbackProps {
    stage: 'text' | 'image' | 'border' | 'assembly';
    progress?: number;
    itemName?: string;
}

const FunGenerationFeedback: React.FC<FunGenerationFeedbackProps> = ({
    stage,
    progress,
    itemName
}) => {
    const stageConfig = {
        text: {
            title: "🎭 Crafting Your Story",
            messages: [
                "Consulting ancient tomes...",
                "Channeling magical energies...",
                "Weaving words of power...",
                "Summoning descriptive magic..."
            ],
            icon: "📚",
            color: "blue"
        },
        image: {
            title: "🎨 Painting Your Vision",
            messages: [
                "Gathering mystical pigments...",
                "Brushes dancing across canvas...",
                "Light and shadow playing...",
                "Bringing your vision to life..."
            ],
            icon: "🎨",
            color: "purple"
        },
        border: {
            title: "✨ Designing Your Style",
            messages: [
                "Forging ornate frames...",
                "Crafting magical borders...",
                "Weaving decorative patterns...",
                "Adding final enchantments..."
            ],
            icon: "✨",
            color: "gold"
        },
        assembly: {
            title: "🔮 Assembling Your Card",
            messages: [
                "Combining all elements...",
                "Balancing magic and form...",
                "Finalizing your creation...",
                "Preparing for download..."
            ],
            icon: "🔮",
            color: "green"
        }
    };

    const config = stageConfig[stage];
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex(prev =>
                prev < config.messages.length - 1 ? prev + 1 : 0
            );
        }, 2000);

        return () => clearInterval(interval);
    }, [config.messages.length]);

    const getEstimatedTime = () => {
        switch (stage) {
            case 'text': return '~10 seconds';
            case 'image': return '~30 seconds';
            case 'border': return '~45 seconds';
            case 'assembly': return '~15 seconds';
            default: return '~20 seconds';
        }
    };

    return (
        <Box
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem',
                textAlign: 'center',
                minHeight: '400px'
            }}
        >
            <Stack gap="xl" align="center">
                {/* Animated Icon */}
                <Box
                    style={{
                        fontSize: '4rem',
                        animation: 'pulse 2s infinite'
                    }}
                >
                    {config.icon}
                </Box>

                {/* Title */}
                <Title order={3} c={config.color}>
                    {config.title}
                </Title>

                {/* Rotating Messages */}
                <Text size="lg" c="dimmed" style={{ minHeight: '2rem' }}>
                    {config.messages[currentMessageIndex]}
                </Text>

                {/* Progress Bar */}
                {progress !== undefined && (
                    <Box style={{ width: '100%', maxWidth: '300px' }}>
                        <Progress
                            value={progress}
                            color={config.color}
                            size="lg"
                            radius="md"
                        />
                    </Box>
                )}

                {/* Item Name Display */}
                {itemName && (
                    <Badge size="lg" variant="light" color={config.color}>
                        Creating: {itemName}
                    </Badge>
                )}

                {/* Estimated Time */}
                <Text size="sm" c="dimmed">
                    {getEstimatedTime()}
                </Text>
            </Stack>
        </Box>
    );
};

export default FunGenerationFeedback; 