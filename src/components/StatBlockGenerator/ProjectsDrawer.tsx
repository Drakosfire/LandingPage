// ProjectsDrawer.tsx - Mantine Drawer for Projects
// Phase 5: Converted to Mantine Drawer (like GenerationDrawer)

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
} from '@mantine/core';
import {
    IconPlus,
    IconTrash,
    IconSearch,
    IconFolderOpen,
    IconLoader,
    IconRefresh,
    IconDeviceFloppy,
    IconDownload
} from '@tabler/icons-react';
import { StatBlockProjectSummary } from '../../types/statblock.types';
import DeleteConfirmationModal from '../CardGenerator/DeleteConfirmationModal';

interface ProjectsDrawerProps {
    opened: boolean;  // Phase 5: Changed from forceExpanded
    onClose: () => void;  // Phase 5: Standard drawer prop
    projects: StatBlockProjectSummary[];
    currentProjectId?: string;
    currentCreatureName?: string;
    isLoadingProjects?: boolean;
    canSaveProject?: boolean;
    onLoadProject: (projectId: string) => Promise<void>;
    onCreateNewProject: () => Promise<void>;
    onSaveProject?: () => Promise<void>;
    onDeleteProject: (projectId: string) => Promise<void>;
    onRefresh?: () => Promise<void>;
    isGenerationInProgress?: boolean;
}

const ProjectsDrawer: React.FC<ProjectsDrawerProps> = ({
    opened,  // Phase 5: Using standard opened prop
    onClose,  // Phase 5: Using standard onClose prop
    projects,
    currentProjectId,
    currentCreatureName,
    isLoadingProjects = false,
    canSaveProject = false,
    onLoadProject,
    onCreateNewProject,
    onSaveProject,
    onDeleteProject,
    onRefresh,
    isGenerationInProgress = false
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<StatBlockProjectSummary | null>(null);
    const [isDeletingProject, setIsDeletingProject] = useState(false);
    const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);

    // Filter projects based on search
    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.creatureType?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort projects by last updated (most recent first)
    const sortedProjects = [...filteredProjects].sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const handleSave = async () => {
        if (!onSaveProject || saveStatus === 'saving') return;

        setSaveStatus('saving');
        try {
            await onSaveProject();
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error('Failed to save project:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    const handleLoadProject = async (projectId: string) => {
        if (loadingProjectId || isGenerationInProgress) return;

        setLoadingProjectId(projectId);
        try {
            await onLoadProject(projectId);
        } catch (error) {
            console.error('Failed to load project:', error);
        } finally {
            setLoadingProjectId(null);
        }
    };

    const handleDeleteClick = (project: StatBlockProjectSummary) => {
        setProjectToDelete(project);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;

        setIsDeletingProject(true);
        try {
            await onDeleteProject(projectToDelete.id);
        } catch (error) {
            console.error('Failed to delete project:', error);
            throw error;
        } finally {
            setIsDeletingProject(false);
        }
    };

    const getSaveButtonContent = () => {
        switch (saveStatus) {
            case 'saving':
                return { text: 'Saving...', disabled: true };
            case 'success':
                return { text: 'Saved!', disabled: false };
            case 'error':
                return { text: 'Save Failed', disabled: false };
            default:
                return { text: 'Save Project', disabled: false };
        }
    };

    const saveButtonContent = getSaveButtonContent();

    return (
        <>
            <Drawer
                opened={opened}
                onClose={onClose}
                position="right"
                size="md"
                title={
                    <Group gap="sm">
                        <IconFolderOpen size={20} />
                        <Title order={4}>Projects</Title>
                        {loadingProjectId && (
                            <Text size="xs" c="blue">
                                Loading...
                            </Text>
                        )}
                    </Group>
                }
                closeButtonProps={{ 'aria-label': 'Close projects drawer' }}
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
                                title="Refresh projects list"
                                style={{ minWidth: 36, minHeight: 36 }}
                            >
                                <IconRefresh size={16} />
                            </ActionIcon>
                        </Group>
                    )}

                    {/* Action Buttons */}
                    <Stack gap="xs">
                        <Button
                            leftSection={<IconPlus size={16} />}
                            onClick={onCreateNewProject}
                            variant="filled"
                            fullWidth
                            disabled={isGenerationInProgress}
                            title={isGenerationInProgress ? "Project creation disabled during generation" : ""}
                            size="md"
                            style={{ minHeight: 44 }}
                        >
                            New Project
                        </Button>
                    </Stack>

                    <Divider />

                    {/* Search */}
                    <TextInput
                        placeholder="Search projects..."
                        leftSection={<IconSearch size={16} />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.currentTarget.value)}
                        size="sm"
                    />

                    {/* Projects List */}
                    <ScrollArea flex={1} type="scroll">
                        <Stack gap="xs" style={{ paddingRight: '8px' }}>
                            {isLoadingProjects ? (
                                <Text c="dimmed" ta="center" size="sm">Loading...</Text>
                            ) : sortedProjects.length === 0 ? (
                                <Text c="dimmed" ta="center" size="sm">
                                    {searchQuery ? 'No matches.' : 'No projects yet.'}
                                </Text>
                            ) : (
                                sortedProjects.map((project) => {
                                    const isCurrentProject = currentProjectId === project.id;
                                    const isBeingLoaded = loadingProjectId === project.id;
                                    const isDisabled = !!loadingProjectId || isGenerationInProgress;

                                    return (
                                        <Card
                                            key={project.id}
                                            withBorder
                                            radius="sm"
                                            padding="xs"
                                            style={{
                                                cursor: 'pointer',
                                                borderColor: isCurrentProject ? 'var(--mantine-color-blue-4)' : undefined,
                                                backgroundColor: isCurrentProject ? 'var(--mantine-color-blue-0)' : undefined,
                                                width: '100%',
                                                maxWidth: '100%',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <Stack gap="xs">
                                                <Group justify="space-between" wrap="nowrap" gap="xs">
                                                    <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                                                        <Text fw={500} size="sm" truncate>
                                                            {project.name || 'Untitled Project'}
                                                        </Text>
                                                        <Text size="xs" c="dimmed" truncate>
                                                            {project.creatureType} • CR {project.challengeRating}
                                                        </Text>
                                                        <Text size="xs" c="dimmed">
                                                            {new Date(project.updatedAt).toLocaleDateString()}
                                                        </Text>
                                                    </Stack>

                                                    {/* Load Button and Actions */}
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
                                                                loading={isBeingLoaded}
                                                                leftSection={<IconDownload size={14} />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleLoadProject(project.id);
                                                                }}
                                                                title={
                                                                    isDisabled ?
                                                                        "Cannot load during generation" :
                                                                        "Load this project"
                                                                }
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
                                                                isDisabled ?
                                                                    "Cannot delete during generation" :
                                                                    isCurrentProject ?
                                                                        "Delete this active project (⚠️ Will clear current work)" :
                                                                        "Delete this project"
                                                            }
                                                            style={{
                                                                opacity: isDisabled ? 0.5 : 1,
                                                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                                minWidth: 36,
                                                                minHeight: 36,
                                                                position: 'relative',
                                                                zIndex: 10
                                                            }}
                                                        >
                                                            <IconTrash size={16} />
                                                        </ActionIcon>
                                                    </Group>
                                                </Group>
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
                title="Delete Project"
                message={
                    projectToDelete?.id === currentProjectId
                        ? "⚠️ You are about to delete your ACTIVE project. This will clear your current work and cannot be undone."
                        : "Are you sure you want to delete this project?"
                }
                itemName={projectToDelete?.name}
                isLoading={isDeletingProject}
            />
        </>
    );
};

export default ProjectsDrawer;

