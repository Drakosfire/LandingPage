/**
 * CharacterRoster Component
 * 
 * Displays a list of saved character projects with thematic D&D styling.
 * Shows race/class/level at a glance with class-specific icons.
 * 
 * Features:
 * - Character cards with class icons (🗡️ Fighter, 🔮 Wizard, etc.)
 * - Race/Class/Level visible at a glance
 * - Active character badge
 * - Load/Delete actions per character
 * - Search filtering
 * - "Create New Character" button
 * 
 * @module PlayerCharacterGenerator
 */

import React, { useState, useCallback } from 'react';
import {
    Stack,
    Group,
    Text,
    Button,
    ActionIcon,
    Card,
    Badge,
    ScrollArea,
    Divider,
    TextInput,
    Title,
    Drawer,
    Box
} from '@mantine/core';
import {
    IconPlus,
    IconTrash,
    IconSearch,
    IconUsers,
    IconLoader,
    IconRefresh,
    IconDownload
} from '@tabler/icons-react';
import { CharacterProjectSummary } from './PlayerCharacterGeneratorProvider';
import { getClassIcon } from './utils/classIcons';
import DeleteConfirmationModal from '../CardGenerator/DeleteConfirmationModal';

/**
 * Format relative time for display
 * @param dateString - ISO date string
 * @returns Formatted relative time string
 */
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            if (diffMins < 1) return 'Just now';
            return `${diffMins}m ago`;
        }
        return `${diffHours}h ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    // Fallback to date
    return date.toLocaleDateString();
}

interface CharacterRosterProps {
    opened: boolean;
    onClose: () => void;
    projects: CharacterProjectSummary[];
    currentProjectId?: string;
    currentCharacterName?: string;
    isLoadingProjects?: boolean;
    onLoadProject: (projectId: string) => Promise<void>;
    onCreateNewCharacter: () => void;
    onDeleteProject: (projectId: string) => Promise<void>;
    onRefresh?: () => Promise<void>;
}

const CharacterRoster: React.FC<CharacterRosterProps> = ({
    opened,
    onClose,
    projects,
    currentProjectId,
    currentCharacterName,
    isLoadingProjects = false,
    onLoadProject,
    onCreateNewCharacter,
    onDeleteProject,
    onRefresh
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<CharacterProjectSummary | null>(null);
    const [isDeletingProject, setIsDeletingProject] = useState(false);
    const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);

    // Filter projects based on search
    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.race?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.className?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort projects by last updated (most recent first)
    const sortedProjects = [...filteredProjects].sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const handleLoadProject = async (projectId: string) => {
        if (loadingProjectId) return;

        setLoadingProjectId(projectId);
        try {
            await onLoadProject(projectId);
            onClose(); // Close drawer after loading
        } catch (error) {
            console.error('Failed to load character:', error);
        } finally {
            setLoadingProjectId(null);
        }
    };

    const handleDeleteClick = (project: CharacterProjectSummary) => {
        setProjectToDelete(project);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;

        setIsDeletingProject(true);
        try {
            await onDeleteProject(projectToDelete.id);
        } catch (error) {
            console.error('Failed to delete character:', error);
            throw error;
        } finally {
            setIsDeletingProject(false);
        }
    };

    const handleCreateNew = () => {
        onCreateNewCharacter();
        onClose(); // Close roster after starting new character
    };

    return (
        <>
            <Drawer
                opened={opened}
                onClose={onClose}
                position="right"
                size="md"
                title={
                    <Group gap="sm">
                        <IconUsers size={20} />
                        <Title order={4}>Character Roster</Title>
                        {loadingProjectId && (
                            <Text size="xs" c="blue">
                                Loading...
                            </Text>
                        )}
                    </Group>
                }
                closeButtonProps={{ 'aria-label': 'Close character roster' }}
                overlayProps={{ opacity: 0.3, blur: 2 }}
                styles={{
                    content: {
                        marginTop: '88px', // Below UnifiedHeader (88px desktop height)
                        height: 'calc(100vh - 88px)'
                    }
                }}
            >
                <Stack gap="md" h="100%">
                    {/* Refresh Button */}
                    {onRefresh && (
                        <Group justify="flex-end">
                            <ActionIcon
                                variant="subtle"
                                color="blue"
                                size="md"
                                loading={isLoadingProjects}
                                onClick={onRefresh}
                                title="Refresh character list"
                                style={{ minWidth: 36, minHeight: 36 }}
                            >
                                <IconRefresh size={16} />
                            </ActionIcon>
                        </Group>
                    )}

                    {/* Create New Character Button */}
                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={handleCreateNew}
                        variant="filled"
                        fullWidth
                        size="md"
                        style={{ minHeight: 44 }}
                    >
                        Create New Character
                    </Button>

                    <Divider />

                    {/* Search */}
                    <TextInput
                        placeholder="Search characters..."
                        leftSection={<IconSearch size={16} />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.currentTarget.value)}
                        size="sm"
                    />

                    {/* Characters List */}
                    <ScrollArea flex={1} type="scroll">
                        <Stack gap="xs" style={{ paddingRight: '8px' }}>
                            {isLoadingProjects ? (
                                <Text c="dimmed" ta="center" size="sm">Loading characters...</Text>
                            ) : sortedProjects.length === 0 ? (
                                <Stack gap="md" align="center" py="xl">
                                    <Text c="dimmed" ta="center" size="sm">
                                        {searchQuery ? 'No characters match your search.' : 'No saved characters yet.'}
                                    </Text>
                                    {!searchQuery && (
                                        <Text c="dimmed" ta="center" size="xs">
                                            Create your first character to get started!
                                        </Text>
                                    )}
                                </Stack>
                            ) : (
                                sortedProjects.map((project) => {
                                    const isCurrentProject = currentProjectId === project.id;
                                    const isBeingLoaded = loadingProjectId === project.id;
                                    const isDisabled = !!loadingProjectId;
                                    const classIcon = getClassIcon(project.className);

                                    return (
                                        <Card
                                            key={project.id}
                                            withBorder
                                            radius="sm"
                                            padding="sm"
                                            style={{
                                                cursor: 'pointer',
                                                borderColor: isCurrentProject ? 'var(--mantine-color-blue-4)' : undefined,
                                                backgroundColor: isCurrentProject ? 'var(--mantine-color-blue-0)' : undefined,
                                                width: '100%',
                                                maxWidth: '100%',
                                                overflow: 'hidden'
                                            }}
                                            onClick={() => !isDisabled && handleLoadProject(project.id)}
                                        >
                                            <Stack gap="xs">
                                                {/* Character Name with Class Icon */}
                                                <Group justify="space-between" wrap="nowrap" gap="xs">
                                                    <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                                                        <Text size="xl" style={{ lineHeight: 1 }}>
                                                            {classIcon}
                                                        </Text>
                                                        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                                                            <Text fw={600} size="sm" truncate>
                                                                {project.name || 'Unnamed Character'}
                                                            </Text>
                                                            <Text size="xs" c="dimmed">
                                                                {project.race} {project.className} {project.level}
                                                            </Text>
                                                        </Stack>
                                                    </Group>

                                                    {/* Status Badge or Load Button */}
                                                    <Group gap={4} wrap="nowrap">
                                                        {isBeingLoaded ? (
                                                            <Badge
                                                                color="blue"
                                                                variant="light"
                                                                leftSection={<IconLoader size={12} />}
                                                            >
                                                                Loading...
                                                            </Badge>
                                                        ) : isCurrentProject ? (
                                                            <Badge color="green" variant="light">
                                                                Active
                                                            </Badge>
                                                        ) : (
                                                            <Button
                                                                size="xs"
                                                                variant="light"
                                                                color="blue"
                                                                disabled={isDisabled}
                                                                leftSection={<IconDownload size={14} />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleLoadProject(project.id);
                                                                }}
                                                            >
                                                                Load
                                                            </Button>
                                                        )}

                                                        {/* Delete Button */}
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            size="md"
                                                            disabled={isDisabled}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteClick(project);
                                                            }}
                                                            title={
                                                                isCurrentProject
                                                                    ? "Delete this active character (⚠️ Will clear current work)"
                                                                    : "Delete this character"
                                                            }
                                                            style={{
                                                                opacity: isDisabled ? 0.5 : 1,
                                                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                                minWidth: 36,
                                                                minHeight: 36
                                                            }}
                                                        >
                                                            <IconTrash size={16} />
                                                        </ActionIcon>
                                                    </Group>
                                                </Group>

                                                {/* Updated Time */}
                                                <Text size="xs" c="dimmed">
                                                    Updated: {formatRelativeTime(project.updatedAt)}
                                                </Text>
                                            </Stack>
                                        </Card>
                                    );
                                })
                            )}
                        </Stack>
                    </ScrollArea>
                </Stack>
            </Drawer>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setProjectToDelete(null);
                    setIsDeletingProject(false);
                }}
                onConfirm={confirmDelete}
                title="Delete Character"
                message={
                    projectToDelete?.id === currentProjectId
                        ? "⚠️ You are about to delete your ACTIVE character. This will clear your current work and cannot be undone."
                        : "Are you sure you want to delete this character?"
                }
                itemName={projectToDelete?.name}
                isLoading={isDeletingProject}
            />
        </>
    );
};

export default CharacterRoster;
