// StatBlockProjectsDrawer.tsx - Projects Drawer for StatBlock Generator
// Phase 4: Full project management integration

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, Text, Button, Stack, TextInput, Loader, Center } from '@mantine/core';
import ProjectsDrawer from './ProjectsDrawer';
import { useStatBlockGenerator } from './StatBlockGeneratorProvider';
import { useAuth } from '../../context/AuthContext';
import { StatBlockProjectSummary } from '../../types/statblock.types';

interface StatBlockProjectsDrawerProps {
    opened: boolean;  // Phase 5: Updated to match Drawer pattern
    onClose: () => void;  // Phase 5: Updated to match Drawer pattern
}

const StatBlockProjectsDrawer: React.FC<StatBlockProjectsDrawerProps> = ({
    opened,
    onClose
}) => {
    const { isLoggedIn } = useAuth();
    const {
        currentProject,
        creatureDetails,
        listProjects,
        loadProject,
        createProject,
        deleteProject,
        saveProject,
        isGenerating,
        saveStatus
    } = useStatBlockGenerator();

    const [projects, setProjects] = useState<StatBlockProjectSummary[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    
    // Loading state for individual project operations (load/delete)
    const [isLoadingProject, setIsLoadingProject] = useState(false);
    const [loadingProjectName, setLoadingProjectName] = useState<string>('');
    
    // Ref to track if we're in the middle of loading a project (to skip refresh effects)
    const isLoadingProjectRef = useRef(false);

    // Define loadProjectsList with useCallback to prevent infinite loops
    const loadProjectsList = useCallback(async () => {
        // Skip refresh if we're in the middle of loading a project
        if (isLoadingProjectRef.current) {
            console.log('📁 [ProjectsDrawer] Skipping refresh - project load in progress');
            return;
        }
        
        setIsLoadingProjects(true);
        try {
            const projectsList = await listProjects();
            setProjects(projectsList);
            console.log('📁 [ProjectsDrawer] Loaded projects:', projectsList.length);
        } catch (err) {
            console.error('Failed to load projects:', err);
        } finally {
            setIsLoadingProjects(false);
        }
    }, [listProjects]);

    // Load projects on mount when logged in (initial load)
    useEffect(() => {
        if (isLoggedIn) {
            console.log('📁 [ProjectsDrawer] Initial load on mount');
            loadProjectsList();
        }
    }, [isLoggedIn, loadProjectsList]);

    // Refresh list when drawer opens (in case projects changed elsewhere)
    useEffect(() => {
        if (isLoggedIn && opened && !isLoadingProjectRef.current) {
            console.log('📁 [ProjectsDrawer] Refreshing on drawer open');
            loadProjectsList();
        }
    }, [isLoggedIn, opened, loadProjectsList]);

    // Refresh list when current project changes (after save/create/delete)
    // Skip during active project load to prevent duplicate refreshes
    useEffect(() => {
        if (isLoggedIn && currentProject?.id && !isLoadingProjectRef.current) {
            console.log('📁 [ProjectsDrawer] Refreshing after project change:', currentProject.id);
            loadProjectsList();
        }
    }, [isLoggedIn, currentProject?.id, loadProjectsList]);

    const handleLoadProject = async (projectId: string) => {
        // Prevent multiple loads
        if (isLoadingProject) {
            console.log('⚠️ [ProjectsDrawer] Already loading a project, ignoring click');
            return;
        }
        
        try {
            // Phase 4 Task 5: Unsaved changes warning
            if (saveStatus === 'saving') {
                const confirmSwitch = window.confirm(
                    'You have unsaved changes. Are you sure you want to load a different project?'
                );
                if (!confirmSwitch) {
                    return;
                }
            }

            // Find project name for loading modal
            const project = projects.find(p => p.id === projectId);
            setLoadingProjectName(project?.name || 'project');
            
            // Set loading state (both state and ref)
            setIsLoadingProject(true);
            isLoadingProjectRef.current = true;
            console.log('🔒 [ProjectsDrawer] Loading project - locking UI:', projectId);

            await loadProject(projectId);
            
            // Refresh list AFTER load completes (but before unlocking)
            await loadProjectsList();
            
        } catch (err) {
            console.error('Failed to load project:', err);
        } finally {
            // Clear loading state
            setIsLoadingProject(false);
            isLoadingProjectRef.current = false;
            setLoadingProjectName('');
            console.log('🔓 [ProjectsDrawer] Project loaded - unlocking UI');
        }
    };

    const handleCreateNewProject = async () => {
        setIsNewProjectModalOpen(true);
    };

    const handleConfirmNewProject = async () => {
        if (!newProjectName.trim()) {
            alert('Please enter a project name');
            return;
        }

        try {
            // Phase 4 Task 5: Unsaved changes warning
            if (saveStatus === 'saving') {
                const confirmCreate = window.confirm(
                    'You have unsaved changes. Are you sure you want to create a new project?'
                );
                if (!confirmCreate) {
                    return;
                }
            }

            await createProject(newProjectName, newProjectDescription);
            await loadProjectsList(); // Refresh list
            setIsNewProjectModalOpen(false);
            setNewProjectName('');
            setNewProjectDescription('');
        } catch (err) {
            console.error('Failed to create project:', err);
            alert('Failed to create project. Please try again.');
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        try {
            await deleteProject(projectId);
            await loadProjectsList(); // Refresh list
        } catch (err) {
            console.error('Failed to delete project:', err);
            alert('Failed to delete project. Please try again.');
        }
    };

    const handleSaveProject = async () => {
        try {
            await saveProject();
            await loadProjectsList(); // Refresh list to show updated timestamp
        } catch (err) {
            console.error('Failed to save project:', err);
        }
    };

    // Don't render Projects drawer if user is not logged in
    if (!isLoggedIn) {
        return null;
    }

    return (
        <>
            <ProjectsDrawer
                opened={opened}
                onClose={() => {
                    // Prevent closing while loading a project
                    if (isLoadingProject) {
                        console.log('⚠️ [ProjectsDrawer] Cannot close while loading');
                        return;
                    }
                    onClose();
                }}
                projects={projects}
                currentProjectId={currentProject?.id}
                currentCreatureName={creatureDetails.name}
                isLoadingProjects={isLoadingProjects}
                canSaveProject={isLoggedIn && !!creatureDetails.name}
                onLoadProject={handleLoadProject}
                onCreateNewProject={handleCreateNewProject}
                onSaveProject={handleSaveProject}
                onDeleteProject={handleDeleteProject}
                onRefresh={loadProjectsList}
                isGenerationInProgress={isGenerating}
                isLoadingProject={isLoadingProject}
            />

            {/* Loading Modal - Blocks all interaction while loading a project */}
            <Modal
                opened={isLoadingProject}
                onClose={() => {}} // Cannot close
                withCloseButton={false}
                centered
                size="sm"
                overlayProps={{ blur: 3 }}
                closeOnClickOutside={false}
                closeOnEscape={false}
            >
                <Center>
                    <Stack align="center" gap="md" py="lg">
                        <Loader size="lg" />
                        <Text size="lg" fw={500}>Loading Project</Text>
                        <Text size="sm" c="dimmed">
                            {loadingProjectName ? `Loading "${loadingProjectName}"...` : 'Please wait...'}
                        </Text>
                    </Stack>
                </Center>
            </Modal>

            {/* New Project Modal */}
            <Modal
                opened={isNewProjectModalOpen}
                onClose={() => {
                    setIsNewProjectModalOpen(false);
                    setNewProjectName('');
                    setNewProjectDescription('');
                }}
                title="Create New Project"
                centered
                size="md"
                fullScreen={typeof window !== 'undefined' && window.innerWidth < 480}
            >
                <Stack gap="md">
                    <TextInput
                        label="Project Name"
                        placeholder="Enter creature name..."
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.currentTarget.value)}
                        required
                        size="md"
                        styles={{
                            input: { minHeight: 44 }
                        }}
                    />
                    <TextInput
                        label="Description (Optional)"
                        placeholder="Brief description..."
                        value={newProjectDescription}
                        onChange={(e) => setNewProjectDescription(e.currentTarget.value)}
                        size="md"
                        styles={{
                            input: { minHeight: 44 }
                        }}
                    />
                    <Button
                        onClick={handleConfirmNewProject}
                        disabled={!newProjectName.trim()}
                        fullWidth
                        size="md"
                        style={{ minHeight: 44 }}
                    >
                        Create Project
                    </Button>
                </Stack>
            </Modal>
        </>
    );
};

export default StatBlockProjectsDrawer;
