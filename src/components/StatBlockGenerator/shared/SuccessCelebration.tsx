// SuccessCelebration.tsx - Success Celebration Component (Placeholder)
import React from 'react';
import { Modal, Stack, Text, Button, Title } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

interface SuccessCelebrationProps {
    isVisible: boolean;
    onClose: () => void;
    title: string;
    message: string;
}

const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({
    isVisible,
    onClose,
    title,
    message
}) => {
    return (
        <Modal
            opened={isVisible}
            onClose={onClose}
            centered
            size="sm"
        >
            <Stack align="center" gap="lg" p="lg">
                <IconCheck size={48} color="var(--mantine-color-green-6)" />
                <Title order={3} ta="center">{title}</Title>
                <Text ta="center" c="dimmed">{message}</Text>
                <Button onClick={onClose} color="green">
                    Awesome!
                </Button>
            </Stack>
        </Modal>
    );
};

export default SuccessCelebration;
