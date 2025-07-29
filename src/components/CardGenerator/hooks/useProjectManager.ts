import { useState, useCallback, useRef } from 'react';
import { Project, ProjectSummary, CardGeneratorState } from '../../../types/card.types';
import { projectAPI } from '../../../services/projectAPI';
import { useAuth } from '../../../context/AuthContext';
import { saveNamedProject, createInitialState } from '../../../utils/firestorePersistence';

export interface UseProjectManagerReturn {
    // State
    currentProject: Project | null;
    availableProjects: ProjectSummary[];
    projects: ProjectSummary[];
    isLoadingProjects: boolean;
    isCreateProjectModalOpen: boolean;

    // Actions
    setCurrentProject: (project: Project | null) => void;
    setAvailableProjects: (projects: ProjectSummary[]) => void;
    setProjects: (projects: ProjectSummary[]) => void;
    setIsLoadingProjects: (loading: boolean) => void;
    setIsCreateProjectModalOpen: (open: boolean) => void;

    // Project operations
    switchToProject: (projectId: string) => Promise<void>;
    loadProjects: () => Promise<void>;
    handleSaveProject: () => Promise<void>;
    handleDeleteProject: (projectId: string) => Promise<void>;
    duplicateProject: (projectId: string) => Promise<void>;
    handleLoadProject: (state: CardGeneratorState, templateBlob: Blob | null) => void;

    // Utilities
    canSaveProject: () => boolean;
    getCurrentState: () => CardGeneratorState;
    getReliableItemName: () => string;
}

export const useProjectManager = (
    itemDetails: any,
    selectedFinalImage: string,
    selectedBorder: string,
    selectedSeedImage: string,
    templateBlob: Blob | null,
    generatedCardImages: string[],
    selectedGeneratedCardImage: string,
    finalCardWithText: string,
    generatedImages: any[],
    renderedCards: any[]
): UseProjectManagerReturn => {
    // Project Management State
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [availableProjects, setAvailableProjects] = useState<ProjectSummary[]>([]);
    const [projects, setProjects] = useState<ProjectSummary[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

    // Refs for project management
    const isInitializingProjects = useRef(false);
    const lastSavedProjectId = useRef<string | null>(null);
    const lastProjectSwitchTime = useRef<number>(0);

    // Authentication
    const { userId, isLoggedIn, authState } = useAuth();

    // Get current state for saving
    const getCurrentState = useCallback((): CardGeneratorState => {
        return {
            currentStepId: 'text-generation', // Default step
            stepCompletion: {},
            itemDetails,
            selectedAssets: {
                finalImage: selectedFinalImage,
                border: selectedBorder,
                seedImage: selectedSeedImage,
                generatedCardImages,
                selectedGeneratedCardImage,
                finalCardWithText,
                templateBlob: templateBlob ? 'data:image/png;base64,' : undefined
            },
            generatedContent: {
                images: generatedImages,
                renderedCards
            },
            autoSaveEnabled: true,
            lastSaved: new Date().toISOString()
        };
    }, [
        itemDetails,
        selectedFinalImage,
        selectedBorder,
        selectedSeedImage,
        templateBlob,
        generatedCardImages,
        selectedGeneratedCardImage,
        finalCardWithText,
        generatedImages,
        renderedCards
    ]);

    // Get reliable item name for display
    const getReliableItemName = useCallback((): string => {
        if (itemDetails.name && itemDetails.name.trim()) {
            return itemDetails.name.trim();
        }
        if (currentProject?.name) {
            return currentProject.name;
        }
        return 'New Project';
    }, [itemDetails.name, currentProject?.name]);

    // Check if project can be saved
    const canSaveProject = useCallback((): boolean => {
        return isLoggedIn &&
            currentProject?.id &&
            (itemDetails.name?.trim() || itemDetails.description?.trim());
    }, [isLoggedIn, currentProject?.id, itemDetails.name, itemDetails.description]);

    // Switch to a different project
    const switchToProject = useCallback(async (projectId: string) => {
        if (!isLoggedIn || !userId) {
            console.warn('🔒 Cannot switch projects: User not logged in');
            return;
        }

        const now = Date.now();
        const timeSinceLastSwitch = now - lastProjectSwitchTime.current;

        if (timeSinceLastSwitch < 1000) {
            console.warn('⏱️ Project switch throttled - too soon since last switch');
            return;
        }

        lastProjectSwitchTime.current = now;

        try {
            console.log('📂 Switching to project ID:', projectId);

            const project = await projectAPI.getProject(projectId);
            if (!project) {
                console.error('📂 Project not found:', projectId);
                return;
            }

            setCurrentProject(project);
            console.log('📂 Successfully switched to project:', project.name);

        } catch (error) {
            console.error('📂 Failed to switch to project:', error);
        }
    }, [isLoggedIn, userId]);

    // Load all projects for the user
    const loadProjects = useCallback(async () => {
        if (!isLoggedIn || !userId) {
            console.warn('🔒 Cannot load projects: User not logged in');
            return;
        }

        if (isInitializingProjects.current) {
            console.log('📂 Projects already being initialized, skipping...');
            return;
        }

        isInitializingProjects.current = true;
        setIsLoadingProjects(true);

        try {
            console.log('📂 Loading projects for user:', userId);

            const userProjects = await projectAPI.listProjects();
            setProjects(userProjects);
            setAvailableProjects(userProjects);

            console.log('📂 Loaded', userProjects.length, 'projects');

        } catch (error) {
            console.error('📂 Failed to load projects:', error);
        } finally {
            setIsLoadingProjects(false);
            isInitializingProjects.current = false;
        }
    }, [isLoggedIn, userId]);

    // Save current project
    const handleSaveProject = useCallback(async () => {
        if (!canSaveProject()) {
            console.warn('💾 Cannot save project - requirements not met');
            return;
        }

        if (!currentProject?.id) {
            console.warn('💾 No current project to save');
            return;
        }

        try {
            console.log('💾 Saving project:', currentProject.name);

            const currentState = getCurrentState();
            const success = await saveNamedProject(
                currentState,
                currentProject.name,
                templateBlob,
                userId || undefined
            );

            if (success) {
                console.log('💾 Project saved successfully');
            } else {
                console.error('💾 Failed to save project');
            }

        } catch (error) {
            console.error('💾 Failed to save project:', error);
        }
    }, [canSaveProject, currentProject, getCurrentState, templateBlob, userId]);

    // Delete a project
    const handleDeleteProject = useCallback(async (projectId: string): Promise<void> => {
        if (!isLoggedIn || !userId) {
            console.warn('🔒 Cannot delete project: User not logged in');
            return;
        }

        try {
            console.log('🗑️ Deleting project ID:', projectId);

            await projectAPI.deleteProject(projectId);

            // Remove from local state
            setProjects(prev => prev.filter(p => p.id !== projectId));
            setAvailableProjects(prev => prev.filter(p => p.id !== projectId));

            // If this was the current project, clear it
            if (currentProject?.id === projectId) {
                setCurrentProject(null);
            }

            console.log('🗑️ Project deleted successfully');

        } catch (error) {
            console.error('🗑️ Failed to delete project:', error);
            throw error;
        }
    }, [isLoggedIn, userId, currentProject?.id]);

    // Duplicate a project
    const duplicateProject = useCallback(async (projectId: string): Promise<void> => {
        if (!isLoggedIn || !userId) {
            console.warn('🔒 Cannot duplicate project: User not logged in');
            return;
        }

        try {
            console.log('📋 Duplicating project ID:', projectId);

            const originalProject = await projectAPI.getProject(projectId);
            if (!originalProject) {
                console.error('📋 Original project not found:', projectId);
                return;
            }

            // Create new project with "Copy" suffix
            const newProjectName = `${originalProject.name} (Copy)`;
            const initialState = createInitialState();

            const newProject = await projectAPI.createProject({
                name: newProjectName,
                description: originalProject.description || ''
            });

            // Save the original project's state to the new project
            await saveNamedProject(
                originalProject.state || initialState,
                newProjectName,
                null,
                userId
            );

            // Add to local state
            const newProjectSummary = {
                id: newProject.id,
                name: newProjectName,
                description: originalProject.description || '',
                createdBy: userId,
                lastModified: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                cardCount: 0
            };

            setProjects(prev => [newProjectSummary, ...prev]);
            setAvailableProjects(prev => [newProjectSummary, ...prev]);

            console.log('📋 Project duplicated successfully');

        } catch (error) {
            console.error('📋 Failed to duplicate project:', error);
            throw error;
        }
    }, [isLoggedIn, userId]);

    // Load project state
    const handleLoadProject = useCallback((state: CardGeneratorState, templateBlob: Blob | null) => {
        console.log('📂 Loading project state');

        // This function will be called by the parent component
        // to update the main state with loaded project data
        // The actual state updates will be handled by the parent
    }, []);

    return {
        // State
        currentProject,
        availableProjects,
        projects,
        isLoadingProjects,
        isCreateProjectModalOpen,

        // Actions
        setCurrentProject,
        setAvailableProjects,
        setProjects,
        setIsLoadingProjects,
        setIsCreateProjectModalOpen,

        // Project operations
        switchToProject,
        loadProjects,
        handleSaveProject,
        handleDeleteProject,
        duplicateProject,
        handleLoadProject,

        // Utilities
        canSaveProject,
        getCurrentState,
        getReliableItemName
    };
};