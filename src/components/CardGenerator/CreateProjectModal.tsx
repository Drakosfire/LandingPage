import React, { useState } from 'react';
import { Modal, TextInput, Textarea, Button, Group, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { Project } from '../../types/card.types';
import { projectAPI } from '../../services/projectAPI';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProjectCreated: (project: Project) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
    isOpen,
    onClose,
    onProjectCreated
}) => {
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!projectName.trim()) {
            setError('Project name is required');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            const newProject = await projectAPI.createProject({
                name: projectName.trim(),
                description: description.trim() || undefined
            });

            onProjectCreated(newProject);
            onClose();

            // Reset form
            setProjectName('');
            setDescription('');
            setError(null);

        } catch (error) {
            console.error('Failed to create project:', error);
            setError(error instanceof Error ? error.message : 'Failed to create project');
        } finally {
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        if (!isCreating) {
            onClose();
            // Reset form
            setProjectName('');
            setDescription('');
            setError(null);
        }
    };

    return (
        <Modal
            opened={isOpen}
            onClose={handleClose}
            title="Create New Project"
            centered
            size="md"
        >
            <Stack gap="md">
                <TextInput
                    label="Project Name"
                    placeholder="My Awesome Cards"
                    value={projectName}
                    onChange={(e) => {
                        setProjectName(e.currentTarget.value);
                        if (error) setError(null); // Clear error when user starts typing
                    }}
                    required
                    error={error}
                    disabled={isCreating}
                />

                <Textarea
                    label="Description (Optional)"
                    placeholder="A collection of magical items for my campaign..."
                    value={description}
                    onChange={(e) => setDescription(e.currentTarget.value)}
                    autosize
                    minRows={2}
                    maxRows={4}
                    disabled={isCreating}
                />

                <Group justify="flex-end" mt="md">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isCreating}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        loading={isCreating}
                        disabled={!projectName.trim()}
                        leftSection={<IconPlus size={16} />}
                    >
                        Create Project
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
};

export default CreateProjectModal; 