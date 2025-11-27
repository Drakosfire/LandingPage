import React from 'react';
import { Modal, Text, Stack, Loader, Center } from '@mantine/core';

interface LoadingModalProps {
    isOpen: boolean;
    message?: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({
    isOpen,
    message = 'Loading embeddings...'
}) => {
    return (
        <Modal
            opened={isOpen}
            onClose={() => { }} // Prevent closing during loading
            title="Loading Rules Lawyer"
            centered
            size="sm"
            closeOnClickOutside={false}
            closeOnEscape={false}
            withCloseButton={false}
        >
            <Stack gap="md" align="center" py="md">
                <Center>
                    <Loader size="lg" />
                </Center>
                <Text size="sm" c="dimmed" ta="center">
                    {message}
                </Text>
                <Text size="xs" c="dimmed" ta="center">
                    Please wait while we prepare the rulebook for queries...
                </Text>
            </Stack>
        </Modal>
    );
};

export default LoadingModal;

