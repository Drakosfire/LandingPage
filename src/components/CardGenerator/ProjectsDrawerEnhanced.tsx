import React, { useState, useCallback } from 'react';
import {
    Stack,
    Group,
    Text,
    Button,
    ActionIcon,
    Card,
    Badge,
    Menu,
    ScrollArea,
    Divider,
    TextInput,
    Title,
    Collapse,
    Paper,
    Progress
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
    IconPlus,
    IconDeviceFloppy,
    IconDotsVertical,
    IconCopy,
    IconTrash,
    IconSearch,
    IconFolderOpen,
    IconDownload,
    IconLoader
} from '@tabler/icons-react';
import { ProjectSummary, CardGeneratorState } from '../../types/card.types';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface ProjectsDrawerEnhancedProps {
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
    forceExpanded?: boolean; // External control to force drawer open
}

const ProjectsDrawerEnhanced: React.FC<ProjectsDrawerEnhancedProps> = ({
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
    isGenerationInProgress = false,
    forceExpanded = false
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<ProjectSummary | null>(null);
    const [isDeletingProject, setIsDeletingProject] = useState(false);

    // Handle external force expand
    React.useEffect(() => {
        if (forceExpanded) {
            setIsExpanded(true);
        }
    }, [forceExpanded]);

    // Computed expanded state (either internal or forced)
    const isDrawerExpanded = isExpanded || forceExpanded;

    const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);

    // Completion status calculation for projects
    const calculateProjectCompletion = useCallback((project: ProjectSummary, state?: CardGeneratorState) => {
        if (!state) {
            return {
                hasText: false,
                hasImages: false,
                hasBorders: false,
                hasFinalCard: false,
                percentage: 0
            };
        }

        const itemDetails = state.itemDetails;
        const selectedAssets = state.selectedAssets;
        const generatedContent = state.generatedContent;

        // Step 1: Text Generation
        const hasText = !!(itemDetails?.name?.trim() || itemDetails?.description?.trim());

        // Step 2: Core Image  
        const hasImages = !!(selectedAssets?.finalImage?.trim());

        // Step 3: Border Generation
        const hasBorders = !!(
            selectedAssets?.border?.trim() &&
            generatedContent?.images?.length > 0 &&
            selectedAssets?.selectedGeneratedCardImage?.trim()
        );

        // Step 4: Final Assembly
        const hasFinalCard = !!(selectedAssets?.finalCardWithText?.trim());

        // Calculate completion percentage
        const completedSteps = [hasText, hasImages, hasBorders, hasFinalCard].filter(Boolean).length;
        const percentage = Math.round((completedSteps / 4) * 100);

        return {
            hasText,
            hasImages,
            hasBorders,
            hasFinalCard,
            percentage
        };
    }, []);

    // Responsive breakpoints
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isTablet = useMediaQuery('(max-width: 1024px)');

    // Determine sizes based on screen size
    const collapsedWidth = isMobile ? '20px' : '60px'; // Match NavBar mobile width
    const expandedWidth = isMobile ? '280px' : isTablet ? '320px' : '350px';

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

    const handleDeleteClick = (project: ProjectSummary) => {
        setProjectToDelete(project);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;

        setIsDeletingProject(true);
        try {
            await onDeleteProject(projectToDelete.id);
            // Let the modal handle closing and cleanup
        } catch (error) {
            console.error('Failed to delete project:', error);
            // Re-throw to let the modal handle the error state
            throw error;
        } finally {
            setIsDeletingProject(false);
        }
    };

    const handleDuplicate = async (projectId: string) => {
        try {
            await onDuplicateProject(projectId);
        } catch (error) {
            console.error('Failed to duplicate project:', error);
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
                    .projects-panel {
                        transition: width 0.3s ease;
                    }
                    .projects-panel.collapsed {
                        width: ${collapsedWidth} !important;
                    }
                    .toggle-button {
                        border-radius: ${isMobile ? '12px 0 0 12px' : '8px 0 0 8px'};
                        border-right: none;
                    }
                    .no-padding .mantine-Paper-root > * {
                        padding: 0 !important;
                    }
                `}
            </style>
            <Paper
                shadow="lg"
                className={`projects-panel ${!isDrawerExpanded ? 'collapsed' : ''} no-padding`}
                styles={{
                    root: {
                        padding: '0 !important', // Force override Mantine's default Paper padding
                        '--paper-padding': '0 !important', // Override Mantine's CSS custom property
                        '--mantine-spacing-lg': '0 !important' // Override the specific spacing variable
                    }
                }}
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    height: '100vh',
                    width: isDrawerExpanded ? expandedWidth : collapsedWidth,
                    zIndex: 300, // High z-index for overlay
                    transition: 'width 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: isMobile ? '12px 0 0 12px' : '8px 0 0 8px',
                    borderRight: 'none',
                    padding: '0 !important' // Additional inline style override
                }}
            >
                {/* Toggle Button */}
                <Button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="toggle-button"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: isDrawerExpanded ? '0px' : '50%',
                        transform: isDrawerExpanded ? 'translateY(-50%)' : 'translate(-50%, -50%)',
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
                            marginLeft: '20px', // Add space for the toggle button
                            width: 'calc(100% - 20px)' // Adjust width to account for the margin
                        }}
                    >
                        {/* Header */}
                        <Group gap={isMobile ? "xs" : "sm"}>
                            <IconFolderOpen size={isMobile ? 16 : 20} />
                            <Title order={isMobile ? 5 : 4}>Projects</Title>
                            {loadingProjectId && (
                                <Text size="xs" c="blue">
                                    Loading...
                                </Text>
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
                                disabled={isGenerationInProgress} // 🔒 Disable during generation
                                title={isGenerationInProgress ? "Project creation disabled during generation" : ""}
                            >
                                {isMobile ? "New" : "New Project"}
                            </Button>

                            {canSaveProject && currentItemName && (
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

                                        // Calculate completion status for current project
                                        const completion = isCurrentProject && currentProjectState
                                            ? calculateProjectCompletion(project, currentProjectState)
                                            : { hasText: false, hasImages: false, hasBorders: false, hasFinalCard: false, percentage: 0 };

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
                                                        <Stack gap="xs">
                                                            <Text fw={500} size="sm" truncate>
                                                                {project.name || 'Untitled Project'}
                                                            </Text>
                                                            <Text size="xs" c="dimmed">
                                                                {new Date(project.updatedAt).toLocaleDateString()}
                                                            </Text>
                                                        </Stack>

                                                        {/* Enhanced Load Button and Actions */}
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

                                                            {/* Prominent Delete Button */}
                                                            <ActionIcon
                                                                variant="subtle"
                                                                color="red"
                                                                size="sm"
                                                                disabled={isDisabled}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    console.log('Delete clicked for project:', project.id, 'isCurrentProject:', isCurrentProject, 'isDisabled:', isDisabled);
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

                                                    {/* Project Progress Indicator */}
                                                    {isCurrentProject && completion.percentage > 0 && (
                                                        <Progress
                                                            value={completion.percentage}
                                                            size="xs"
                                                            color={completion.percentage === 100 ? 'green' : 'blue'}
                                                        />
                                                    )}

                                                    {/* Project Metadata */}
                                                    <Group gap="xs">
                                                        {isCurrentProject ? (
                                                            // Show completion badges for current project
                                                            <>
                                                                {completion.hasText && (
                                                                    <Badge size="xs" color="blue" variant="light">
                                                                        Text ✓
                                                                    </Badge>
                                                                )}
                                                                {completion.hasImages && (
                                                                    <Badge size="xs" color="purple" variant="light">
                                                                        Images ✓
                                                                    </Badge>
                                                                )}
                                                                {completion.hasBorders && (
                                                                    <Badge size="xs" color="gold" variant="light">
                                                                        Style ✓
                                                                    </Badge>
                                                                )}
                                                                {completion.hasFinalCard && (
                                                                    <Badge size="xs" color="green" variant="light">
                                                                        Complete ✓
                                                                    </Badge>
                                                                )}
                                                            </>
                                                        ) : (
                                                            // Show card count for other projects
                                                            <Badge size="xs" color="blue" variant="light">
                                                                {project.cardCount} {project.cardCount === 1 ? 'card' : 'cards'}
                                                            </Badge>
                                                        )}
                                                    </Group>

                                                    {/* Menu Button */}
                                                    <Group justify="flex-end">
                                                        <Menu position="bottom-end" withinPortal>
                                                            <Menu.Target>
                                                                <ActionIcon
                                                                    variant="subtle"
                                                                    color="gray"
                                                                    size={isMobile ? "sm" : "xs"}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <IconDotsVertical size={isMobile ? 14 : 12} />
                                                                </ActionIcon>
                                                            </Menu.Target>
                                                            <Menu.Dropdown>
                                                                <Menu.Item
                                                                    leftSection={<IconCopy size={isMobile ? 14 : 12} />}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDuplicate(project.id);
                                                                    }}
                                                                >
                                                                    Duplicate
                                                                </Menu.Item>
                                                                <Menu.Item
                                                                    leftSection={<IconTrash size={isMobile ? 14 : 12} />}
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
                    setIsDeletingProject(false); // Reset loading state on close
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

export default ProjectsDrawerEnhanced; 