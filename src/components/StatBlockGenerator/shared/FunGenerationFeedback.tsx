// FunGenerationFeedback.tsx - Generation Feedback Component (Placeholder)
import React from 'react';
import { Modal, Stack, Text, Loader, Group } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';

interface FunGenerationFeedbackProps {
    isVisible: boolean;
    currentStep: string;
}

const FunGenerationFeedback: React.FC<FunGenerationFeedbackProps> = ({
    isVisible,
    currentStep
}) => {
    const getStepMessage = () => {
        switch (currentStep) {
            case 'creature-description':
                return 'Crafting your creature with AI magic...';
            case 'creature-image':
                return 'Painting your creature\'s portrait...';
            case 'model-generation':
                return 'Sculpting a 3D model...';
            case 'export-finalization':
                return 'Preparing your statblock...';
            default:
                return 'Working on something amazing...';
        }
    };

    return (
        <Modal
            opened={isVisible}
            onClose={() => { }} // Cannot close during generation
            centered
            withCloseButton={false}
            overlayProps={{ opacity: 0.7 }}
        >
            <Stack align="center" gap="lg" p="lg">
                <Group gap="sm">
                    <IconSparkles size={24} color="var(--mantine-color-blue-6)" />
                    <Loader size="sm" />
                </Group>
                <Text size="lg" fw={500} ta="center">
                    {getStepMessage()}
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                    This may take a moment...
                </Text>
            </Stack>
        </Modal>
    );
};

export default FunGenerationFeedback;
