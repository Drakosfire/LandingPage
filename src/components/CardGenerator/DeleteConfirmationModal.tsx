import React from 'react';
import { Modal, Text, Button, Group, Stack } from '@mantine/core';
import { IconAlertTriangle, IconTrash } from '@tabler/icons-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    title?: string;
    message?: string;
    itemName?: string;
    isLoading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Delete',
    message = 'Are you sure you want to delete this item?',
    itemName,
    isLoading = false
}) => {
    const handleConfirm = async () => {
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error('Delete operation failed:', error);
            // Error handling can be added here if needed
        }
    };

    const displayMessage = itemName
        ? `${message} "${itemName}"?`
        : message;

    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            title={title}
            centered
            size="sm"
        >
            <Stack gap="md">
                <Group gap="sm">
                    <IconAlertTriangle
                        size={24}
                        color="var(--mantine-color-orange-6)"
                    />
                    <Text size="sm" c="dimmed">
                        {displayMessage}
                    </Text>
                </Group>

                <Text size="xs" c="dimmed">
                    This action cannot be undone.
                </Text>

                <Group justify="flex-end" mt="md">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="red"
                        onClick={handleConfirm}
                        loading={isLoading}
                        leftSection={<IconTrash size={16} />}
                    >
                        Delete
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
};

export default DeleteConfirmationModal; 