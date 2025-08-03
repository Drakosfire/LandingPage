import React, { useState } from 'react';
import {
    Stack,
    Group,
    Text,
    Button,
    ActionIcon,
    Card,
    Avatar,
    Badge,
    Menu,
    ScrollArea,
    Divider,
    TextInput,
    Title,
    Collapse,
    Paper
} from '@mantine/core';
import {
    IconPlus,
    IconDeviceFloppy,
    IconDotsVertical,
    IconCopy,
    IconTrash,
    IconSearch,
    IconFolder,
    IconFolderOpen,
    IconChevronLeft,
    IconChevronRight,
    IconDownload
} from '@tabler/icons-react';
import { ProjectSummary } from '../../types/card.types';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface ProjectsDrawerProps {
    projects: ProjectSummary[];
    currentProjectId?: string;
    currentItemName?: string;
    isLoadingProjects?: boolean;
    canSaveProject?: boolean;
    onLoadProject: (projectId: string) => void;
    onCreateNewProject: () => void;
    onSaveProject?: () => Promise<void>;
    onDeleteProject: (projectId: string) => Promise<void>;
    onDuplicateProject: (projectId: string) => Promise<void>;
    onRefreshProjects?: () => Promise<void>;
    currentProjectState?: any; // For development mode metadata display
    isGenerationInProgress?: boolean; // Generation lock state
}

const ProjectsDrawer: React.FC<ProjectsDrawerProps> = ({
    projects,
    currentProjectId,
    currentItemName,
    isLoadingProjects = false,
    canSaveProject = false,
    onLoadProject,
    onCreateNewProject,
    onSaveProject,
    onDeleteProject,
    onDuplicateProject,
    onRefreshProjects,
    currentProjectState,
    isGenerationInProgress = false
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<ProjectSummary | null>(null);
    const [isDeletingProject, setIsDeletingProject] = useState(false);
    const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);

    // Filter projects based on search
    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
            if (onRefreshProjects) {
                await onRefreshProjects();
            }
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error('Failed to save project:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    const handleLoadProject = async (projectId: string) => {
        if (loadingProjectId) {
            console.log('📂 ProjectsDrawer: Load blocked - already loading project:', loadingProjectId);
            return; // Prevent multiple loads
        }

        // 🔒 GENERATION LOCK: Prevent project loading during async operations
        if (isGenerationInProgress) {
            console.log('🔒 ProjectsDrawer: Load blocked - generation in progress');
            return;
        }

        console.log('📂 ProjectsDrawer: Starting load for project:', projectId);
        setLoadingProjectId(projectId);
        try {
            await onLoadProject(projectId);
            console.log('📂 ProjectsDrawer: Load completed for project:', projectId);
        } catch (error) {
            console.error('📂 ProjectsDrawer: Load failed for project:', projectId, error);
        } finally {
            setLoadingProjectId(null);
        }
    };

    const handleDeleteClick = (project: ProjectSummary) => {
        setProjectToDelete(project);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;

        setIsDeletingProject(true);
        try {
            await onDeleteProject(projectToDelete.id);
            if (onRefreshProjects) {
                await onRefreshProjects();
            }
        } catch (error) {
            console.error('Failed to delete project:', error);
        } finally {
            setIsDeletingProject(false);
            setProjectToDelete(null);
            setIsDeleteModalOpen(false);
        }
    };

    const handleDuplicate = async (projectId: string) => {
        try {
            await onDuplicateProject(projectId);
            if (onRefreshProjects) {
                await onRefreshProjects();
            }
        } catch (error) {
            console.error('Failed to duplicate project:', error);
        }
    };

    const getSaveButtonContent = () => {
        switch (saveStatus) {
            case 'saving':
                return { text: 'Saving...', icon: '⏳', disabled: true };
            case 'success':
                return { text: 'Saved!', icon: '✅', disabled: false };
            case 'error':
                return { text: 'Save Failed', icon: '❌', disabled: false };
            default:
                return { text: 'Save', icon: '💾', disabled: false };
        }
    };

    const saveButtonContent = getSaveButtonContent();

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <>
            <Paper
                shadow="lg"
                className={`projects-panel ${!isExpanded ? 'collapsed' : ''}`}
                style={{
                    position: 'fixed',
                    top: '80px', // Account for header height
                    right: 0,
                    height: 'calc(100vh - 80px)',
                    width: isExpanded ? '350px' : '60px',
                    zIndex: 300, // Below header
                    transition: 'width 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '8px 0 0 8px',
                    borderRight: 'none'
                }}
            >
                {/* Toggle Button */}
                <Button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="toggle-button"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: isExpanded ? '10px' : '50%',
                        transform: isExpanded ? 'translateY(-50%)' : 'translate(-50%, -50%)',
                        zIndex: 301, // Above the panel but below header
                        transition: 'left 0.3s ease, transform 0.3s ease',
                        width: '20px', // Fixed narrow width
                        minHeight: '120px', // Extend vertically to fit rotated text
                        padding: 'var(--space-3) 0', // No horizontal padding
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
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s ease',
                                padding: '2px'
                            }}
                        >
                            ›
                        </Text>
                    </div>
                </Button>

                {/* Expanded State - Full content */}
                <Collapse in={isExpanded} style={{ height: '100%' }}>
                    <Stack gap="md" style={{ height: '100%', padding: '60px 16px 16px 16px' }}>
                        {/* Header */}
                        <Group gap="sm">
                            <IconFolderOpen size={20} />
                            <Title order={4}>Projects</Title>
                            {loadingProjectId && (
                                <Text size="xs" c="blue">
                                    Loading...
                                </Text>
                            )}
                        </Group>

                        {/* Action Buttons */}
                        <Stack gap="sm">
                            <Button
                                leftSection={<IconPlus size={16} />}
                                onClick={onCreateNewProject}
                                variant="filled"
                                fullWidth
                                disabled={isGenerationInProgress} // 🔒 Disable during generation
                                title={isGenerationInProgress ? "Project creation disabled during generation" : ""}
                            >
                                New Project
                            </Button>

                            {canSaveProject && currentItemName && (
                                <Button
                                    leftSection={<IconDeviceFloppy size={16} />}
                                    onClick={handleSave}
                                    loading={saveStatus === 'saving'}
                                    disabled={saveButtonContent.disabled}
                                    variant="outline"
                                    color={saveStatus === 'success' ? 'green' : saveStatus === 'error' ? 'red' : 'blue'}
                                    fullWidth
                                >
                                    {saveButtonContent.text}
                                </Button>
                            )}
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
                            <Stack gap="sm">
                                {isLoadingProjects ? (
                                    <Text c="dimmed" ta="center" size="sm">Loading...</Text>
                                ) : sortedProjects.length === 0 ? (
                                    <Text c="dimmed" ta="center" size="sm">
                                        {searchQuery ? 'No matches.' : 'No projects yet.'}
                                    </Text>
                                ) : (
                                    sortedProjects.map((project) => {
                                        const isCurrentProject = currentProjectId === project.id;
                                        const isLoading = loadingProjectId === project.id;

                                        return (
                                            <Card
                                                key={project.id}
                                                withBorder
                                                radius="sm"
                                                padding="sm"
                                                style={{
                                                    cursor: 'pointer',
                                                    borderColor: isCurrentProject ? 'var(--mantine-color-blue-4)' : undefined,
                                                    backgroundColor: isCurrentProject ? 'var(--mantine-color-blue-0)' : undefined
                                                }}
                                            >
                                                <Group wrap="nowrap" align="flex-start" gap="sm">
                                                    {/* Project Thumbnail/Avatar */}
                                                    <Avatar
                                                        size="md"
                                                        radius="sm"
                                                        color="blue"
                                                        variant="light"
                                                    >
                                                        <IconFolder size={18} />
                                                    </Avatar>

                                                    {/* Project Info */}
                                                    <Stack gap="xs" flex={1} style={{ minWidth: 0 }}>
                                                        <Group justify="space-between" wrap="nowrap">
                                                            <Text
                                                                fw={600}
                                                                size="xs"
                                                                truncate
                                                                style={{ maxWidth: '120px' }}
                                                            >
                                                                {project.name || 'Unnamed'}
                                                            </Text>

                                                            {/* Action Buttons */}
                                                            <Group gap="xs">
                                                                {/* Load Button */}
                                                                <ActionIcon
                                                                    variant="subtle"
                                                                    color={isCurrentProject ? "green" : "blue"}
                                                                    size="xs"
                                                                    loading={isLoading}
                                                                    disabled={!!loadingProjectId || isGenerationInProgress} // 🔒 Disable during project loading OR generation
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleLoadProject(project.id);
                                                                    }}
                                                                    title={
                                                                        isGenerationInProgress ? "Project loading disabled during generation" :
                                                                            loadingProjectId ? "Loading project..." :
                                                                                isCurrentProject ? "Currently Loaded" : "Load Project"
                                                                    }
                                                                >
                                                                    <IconDownload size={12} />
                                                                </ActionIcon>

                                                                {/* Menu Button */}
                                                                <Menu position="bottom-end" withinPortal>
                                                                    <Menu.Target>
                                                                        <ActionIcon
                                                                            variant="subtle"
                                                                            color="gray"
                                                                            size="xs"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            <IconDotsVertical size={12} />
                                                                        </ActionIcon>
                                                                    </Menu.Target>
                                                                    <Menu.Dropdown>
                                                                        <Menu.Item
                                                                            leftSection={<IconCopy size={12} />}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDuplicate(project.id);
                                                                            }}
                                                                        >
                                                                            Duplicate
                                                                        </Menu.Item>
                                                                        <Menu.Item
                                                                            leftSection={<IconTrash size={12} />}
                                                                            color="red"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDeleteClick(project);
                                                                            }}
                                                                        >
                                                                            Delete
                                                                        </Menu.Item>
                                                                    </Menu.Dropdown>
                                                                </Menu>
                                                            </Group>
                                                        </Group>

                                                        {isCurrentProject && (
                                                            <Badge size="xs" color="green" variant="filled">
                                                                Loaded
                                                            </Badge>
                                                        )}

                                                        {/* Development Mode: Detailed Metadata for Current Project */}
                                                        {process.env.NODE_ENV === 'development' && isCurrentProject && currentProjectState && (
                                                            <Stack gap="xs">
                                                                <Group justify="space-between">
                                                                    <Text size="xs" c="dimmed">
                                                                        Core Images: {currentProjectState?.generatedContent?.images?.length || 0}
                                                                    </Text>
                                                                    <Text size="xs" c="dimmed">
                                                                        Card Images: {currentProjectState?.selectedAssets?.generatedCardImages?.length || 0}
                                                                    </Text>
                                                                </Group>
                                                                <Group justify="space-between">
                                                                    <Text size="xs" c="dimmed">
                                                                        Text Cards: {currentProjectState?.generatedContent?.renderedCards?.length || 0}
                                                                    </Text>
                                                                    <Text size="xs" c="blue">
                                                                        Step: {currentProjectState?.currentStep || 'none'}
                                                                    </Text>
                                                                </Group>
                                                                <Group justify="space-between">
                                                                    <Text size="xs" c="dimmed">
                                                                        Selected: {currentProjectState?.selectedAssets?.selectedGeneratedCardImage ? '✓' : '✗'}
                                                                    </Text>
                                                                    <Text size="xs" c="dimmed">
                                                                        {new Date(project.updatedAt).toLocaleDateString()}
                                                                    </Text>
                                                                </Group>
                                                            </Stack>
                                                        )}

                                                        {/* Development Mode: Basic Display for Non-Current Projects */}
                                                        {process.env.NODE_ENV === 'development' && (!isCurrentProject || !currentProjectState) && (
                                                            <Group justify="space-between">
                                                                <Text size="xs" c="dimmed">
                                                                    {project.cardCount} {project.cardCount === 1 ? 'card' : 'cards'}
                                                                </Text>
                                                                <Text size="xs" c="dimmed">
                                                                    {new Date(project.updatedAt).toLocaleDateString()}
                                                                </Text>
                                                            </Group>
                                                        )}

                                                        {/* Production Mode: Simple Display */}
                                                        {process.env.NODE_ENV !== 'development' && (
                                                            <Group justify="space-between">
                                                                <Text size="xs" c="dimmed">
                                                                    {project.cardCount} {project.cardCount === 1 ? 'card' : 'cards'}
                                                                </Text>
                                                                <Text size="xs" c="dimmed">
                                                                    {new Date(project.updatedAt).toLocaleDateString()}
                                                                </Text>
                                                            </Group>
                                                        )}
                                                    </Stack>
                                                </Group>
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
                }}
                onConfirm={confirmDelete}
                title="Delete Project"
                message="Are you sure you want to delete this project?"
                itemName={projectToDelete?.name}
                isLoading={isDeletingProject}
            />
        </>
    );
};

export default ProjectsDrawer; 