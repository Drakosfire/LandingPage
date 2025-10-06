import React, { useState, useCallback, useEffect } from 'react';
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
    Collapse,
    Paper,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
    IconPlus,
    IconDeviceFloppy,
    IconTrash,
    IconSearch,
    IconFolderOpen,
    IconDownload,
    IconLoader,
    IconRefresh
} from '@tabler/icons-react';
import { StatBlockProjectSummary } from '../../types/statblock.types';
import DeleteConfirmationModal from '../CardGenerator/DeleteConfirmationModal';

interface ProjectsDrawerProps {
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
    forceExpanded?: boolean;
}

const ProjectsDrawer: React.FC<ProjectsDrawerProps> = ({
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
    isGenerationInProgress = false,
    forceExpanded = false
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<StatBlockProjectSummary | null>(null);
    const [isDeletingProject, setIsDeletingProject] = useState(false);
    const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);

    // Handle external force expand
    useEffect(() => {
        if (forceExpanded) {
            setIsExpanded(true);
        }
    }, [forceExpanded]);

    // Computed expanded state (either internal or forced)
    const isDrawerExpanded = isExpanded || forceExpanded;

    // Responsive breakpoints
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isTablet = useMediaQuery('(max-width: 1024px)');

    // Determine sizes based on screen size
    const collapsedWidth = isMobile ? '20px' : '60px';
    const expandedWidth = isMobile ? '280px' : isTablet ? '320px' : '350px';

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
            <style>
                {`
                    .statblock-projects-panel {
                        transition: width 0.3s ease;
                    }
                    .statblock-projects-panel.collapsed {
                        width: ${collapsedWidth} !important;
                    }
                    .statblock-toggle-button {
                        border-radius: ${isMobile ? '12px 0 0 12px' : '8px 0 0 8px'};
                        border-right: none;
                    }
                `}
            </style>
            <Paper
                shadow="lg"
                className={`statblock-projects-panel ${!isDrawerExpanded ? 'collapsed' : ''}`}
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    height: '100vh',
                    width: isDrawerExpanded ? expandedWidth : collapsedWidth,
                    zIndex: 300,
                    transition: 'width 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: isMobile ? '12px 0 0 12px' : '8px 0 0 8px',
                    borderRight: 'none',
                    padding: 0
                }}
            >
                {/* Toggle Button */}
                <Button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="statblock-toggle-button"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: isDrawerExpanded ? '0px' : '50%',
                        transform: isDrawerExpanded ? 'translateY(-50%)' : 'translate(-50%, -50%)',
                        zIndex: 301,
                        transition: 'left 0.3s ease, transform 0.3s ease',
                        width: '20px',
                        minHeight: '120px',
                        padding: 'var(--space-3) 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    size="sm"
                    variant="filled"
                    color="blue"
                >
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        height: '100%',
                        padding: '2px 0'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 1
                        }}>
                            <Text
                                size="xs"
                                style={{
                                    color: 'white',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    transform: 'rotate(-90deg)',
                                    padding: '2px'
                                }}
                            >
                                PROJECTS
                            </Text>
                        </div>
                        <Text
                            size="sm"
                            style={{
                                color: 'white',
                                fontWeight: 600,
                                transform: isDrawerExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s ease',
                                padding: '2px'
                            }}
                        >
                            ›
                        </Text>
                    </div>
                </Button>

                {/* Expanded State - Full content */}
                <Collapse in={isDrawerExpanded} style={{ height: '100%' }}>
                    <Stack
                        gap={isMobile ? "xs" : "sm"}
                        style={{
                            height: '100%',
                            marginLeft: '20px',
                            width: 'calc(100% - 20px)',
                            padding: 'var(--space-sm)'
                        }}
                    >
                        {/* Header */}
                        <Group gap={isMobile ? "xs" : "sm"} justify="space-between">
                            <Group gap={isMobile ? "xs" : "sm"}>
                                <IconFolderOpen size={isMobile ? 16 : 20} />
                                <Title order={isMobile ? 5 : 4}>Projects</Title>
                                {loadingProjectId && (
                                    <Text size="xs" c="blue">
                                        Loading...
                                    </Text>
                                )}
                            </Group>
                            {onRefresh && (
                                <ActionIcon
                                    variant="subtle"
                                    color="blue"
                                    size="sm"
                                    loading={isLoadingProjects}
                                    onClick={onRefresh}
                                    title="Refresh projects list"
                                >
                                    <IconRefresh size={16} />
                                </ActionIcon>
                            )}
                        </Group>

                        {/* Action Buttons */}
                        <Stack gap="xs">
                            <Button
                                leftSection={<IconPlus size={isMobile ? 14 : 16} />}
                                onClick={onCreateNewProject}
                                variant="filled"
                                fullWidth
                                size={isMobile ? "sm" : "md"}
                                disabled={isGenerationInProgress}
                                title={isGenerationInProgress ? "Project creation disabled during generation" : ""}
                            >
                                {isMobile ? "New" : "New Project"}
                            </Button>

                            {canSaveProject && currentCreatureName && (
                                <Button
                                    leftSection={<IconDeviceFloppy size={isMobile ? 14 : 16} />}
                                    onClick={handleSave}
                                    loading={saveStatus === 'saving'}
                                    disabled={saveButtonContent.disabled}
                                    variant="outline"
                                    color={saveStatus === 'success' ? 'green' : saveStatus === 'error' ? 'red' : 'blue'}
                                    fullWidth
                                    size={isMobile ? "sm" : "md"}
                                >
                                    {saveButtonContent.text}
                                </Button>
                            )}
                        </Stack>

                        <Divider />

                        {/* Search */}
                        <TextInput
                            placeholder={isMobile ? "Search..." : "Search projects..."}
                            leftSection={<IconSearch size={isMobile ? 14 : 16} />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            size={isMobile ? "xs" : "sm"}
                        />

                        {/* Projects List */}
                        <ScrollArea flex={1} type="scroll">
                            <Stack gap="xs">
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
                                                padding={isMobile ? "xs" : "sm"}
                                                style={{
                                                    cursor: 'pointer',
                                                    borderColor: isCurrentProject ? 'var(--mantine-color-blue-4)' : undefined,
                                                    backgroundColor: isCurrentProject ? 'var(--mantine-color-blue-0)' : undefined
                                                }}
                                            >
                                                <Stack gap="sm">
                                                    <Group justify="space-between">
                                                        <Stack gap="xs" style={{ flex: 1 }}>
                                                            <Text fw={500} size="sm" truncate>
                                                                {project.name || 'Untitled Project'}
                                                            </Text>
                                                            <Group gap="xs">
                                                                <Text size="xs" c="dimmed">
                                                                    {project.creatureType} • CR {project.challengeRating}
                                                                </Text>
                                                            </Group>
                                                            <Text size="xs" c="dimmed">
                                                                {new Date(project.updatedAt).toLocaleDateString()}
                                                            </Text>
                                                        </Stack>

                                                        {/* Load Button and Actions */}
                                                        <Group gap="xs">
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
                                                                size="sm"
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
                                                                    cursor: isDisabled ? 'not-allowed' : 'pointer'
                                                                }}
                                                            >
                                                                <IconTrash size={isMobile ? 14 : 16} />
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
                </Collapse>
            </Paper>

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

