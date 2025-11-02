// GenerateWithProjectGuard.tsx - Prevent accidental overwrite of saved projects

import React from 'react';
import { Modal, Stack, Text, Button, Group, Alert } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface GenerateWithProjectGuardProps {
    opened: boolean;
    onClose: () => void;
    projectName: string;
    onCreateNew: () => void;
    onOverwrite: () => void;
}

export const GenerateWithProjectGuard: React.FC<GenerateWithProjectGuardProps> = ({
    opened,
    onClose,
    projectName,
    onCreateNew,
    onOverwrite
}) => {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Generate in Saved Project?"
            size="md"
            centered
        >
            <Stack gap="md">
                <Alert icon={<IconAlertTriangle size={20} />} color="yellow" variant="light">
                    <Text size="sm" fw={500}>
                        You have a saved project loaded: "{projectName}"
                    </Text>
                </Alert>

                <Text size="sm">
                    Generating will replace the current statblock. Would you like to:
                </Text>

                <Stack gap="sm">
                    <Button
                        variant="filled"
                        color="blue"
                        onClick={onCreateNew}
                        fullWidth
                    >
                        Create New Project
                    </Button>
                    <Text size="xs" c="dimmed" ta="center">
                        Current project will be saved. Generate in a new project.
                    </Text>
                </Stack>

                <Stack gap="sm">
                    <Button
                        variant="light"
                        color="red"
                        onClick={onOverwrite}
                        fullWidth
                    >
                        Overwrite Current Project
                    </Button>
                    <Text size="xs" c="dimmed" ta="center">
                        ⚠️ This will replace the statblock in "{projectName}"
                    </Text>
                </Stack>

                <Button variant="subtle" onClick={onClose} fullWidth>
                    Cancel
                </Button>
            </Stack>
        </Modal>
    );
};

