import React, { useState, useEffect, useCallback, useRef } from 'react';
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import dungeonMindTheme from '../../config/mantineTheme';
import '../../styles/mantineOverrides.css';

import { ItemDetails, GeneratedImage, createTemplate, CardGeneratorState, RenderedCard, Project, ProjectSummary } from '../../types/card.types';
import {
    saveCardSession,
    loadCardSession,
    createInitialState,
    saveNamedProject,
    debounce
} from '../../utils/firestorePersistence';
import { projectAPI } from '../../services/projectAPI';
import { useAuth } from '../../context/AuthContext';
import CreateProjectModal from './CreateProjectModal';
import ProjectsDrawer from './ProjectsDrawer';
import Footer from '../Footer';
import '../../styles/DesignSystem.css';
import '../../styles/CardGeneratorLayout.css';
import '../../styles/CardGeneratorPolish.css';

// Import step navigation and individual step components
import { Step, StepStatus } from './StepNavigation';
// import FloatingHeader from './FloatingHeader'; // Removed - navigation now integrated into steps
import Step1TextGeneration from './steps/Step1TextGeneration';
import Step2CoreImage from './steps/Step2CoreImage';
import Step3BorderGeneration from './steps/Step3BorderGeneration';
import Step5FinalAssembly from './steps/Step5FinalAssembly';

// Import enhanced components
import FunGenerationFeedback from './shared/FunGenerationFeedback';
import SuccessCelebration from './shared/SuccessCelebration';

import ProjectsDrawerEnhanced from './ProjectsDrawerEnhanced';

export default function CardGenerator() {
    // Main state management
    const [currentStepId, setCurrentStepId] = useState<string>('text-generation');

    // Item details state
    const [itemDetails, setItemDetails] = useState<ItemDetails>({
        name: '',
        type: '',
        rarity: '',
        value: '',
        properties: [],
        damageFormula: '',
        damageType: '',
        weight: '',
        description: '',
        quote: '',
        sdPrompt: ''
    });

    // Image and template state
    const [selectedFinalImage, setSelectedFinalImage] = useState<string>('');
    const [selectedBorder, setSelectedBorder] = useState<string>('');
    const [selectedSeedImage, setSelectedSeedImage] = useState<string>('');
    const [templateBlob, setTemplateBlob] = useState<Blob | null>(null);

    // Step 3 generated images state
    const [generatedCardImages, setGeneratedCardImages] = useState<string[]>([]);
    const [selectedGeneratedCardImage, setSelectedGeneratedCardImage] = useState<string>('');

    // Step 5 final card state - NEW for persistence
    const [finalCardWithText, setFinalCardWithText] = useState<string>('');

    // Additional state for persistence
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [renderedCards, setRenderedCards] = useState<RenderedCard[]>([]);
    const [lastSaved, setLastSaved] = useState<number>(0);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    // Projects drawer control
    const [forceExpandDrawer, setForceExpandDrawer] = useState(false);

    // GENERATION LOCK SYSTEM - Prevent navigation during async operations
    const [generationLocks, setGenerationLocks] = useState({
        textGeneration: false,      // Step 1: ItemForm text generation
        coreImageGeneration: false, // Step 2: CoreImageGallery image generation  
        borderGeneration: false,    // Step 3: Step3BorderGeneration card generation
        finalCardGeneration: false  // Step 5: CardWithTextGallery final card generation
    });

    // Computed lock state - true if ANY generation is in progress
    const isAnyGenerationInProgress = Object.values(generationLocks).some(lock => lock);

    // Lock management functions
    const setGenerationLock = useCallback((lockType: keyof typeof generationLocks, isLocked: boolean) => {
        setGenerationLocks(prev => ({
            ...prev,
            [lockType]: isLocked
        }));
    }, []);

    // Refs for persistence
    const isRestoringState = useRef(false);
    const initialLoadComplete = useRef(false);
    const isInitializingProjects = useRef(false);
    const lastSavedProjectId = useRef<string | null>(null); // Track which project was last saved
    const lastProjectSwitchTime = useRef<number>(0); // Track when last project switch occurred

    // Authentication
    const { userId, isLoggedIn, authState } = useAuth();

    // Project Management State
    const [currentProject, setCurrentProject] = useState<Project | null>(null);

    // Enhanced UX State
    const [showSuccessCelebration, setShowSuccessCelebration] = useState(false);
    const [successCelebrationType, setSuccessCelebrationType] = useState<'text' | 'image' | 'border' | 'assembly'>('text');
    const [showFunGenerationFeedback, setShowFunGenerationFeedback] = useState(false);
    const [generationStage, setGenerationStage] = useState<'text' | 'image' | 'border' | 'assembly'>('text');
    const [generationProgress, setGenerationProgress] = useState(0);
    const [availableProjects, setAvailableProjects] = useState<ProjectSummary[]>([]);
    const [projectLoading, setProjectLoading] = useState(false);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

    // Track currentProject changes for debugging
    useEffect(() => {
        if (currentProject) {
            console.log('🔄 currentProject CHANGED to:', currentProject.name, 'ID:', currentProject.id, 'at timestamp:', Date.now());
        } else {
            console.log('🔄 currentProject CHANGED to: null at timestamp:', Date.now());
        }
    }, [currentProject?.id]);

    // Clear all data on logout
    useEffect(() => {
        // When user becomes unauthenticated, clear all state
        if (!authState.isLoading && !authState.isAuthenticated && userId === null) {
            console.log('🚪 User logged out - clearing all CardGenerator data');

            // Clear all state
            setCurrentProject(null);
            setAvailableProjects([]);
            setProjects([]);
            setItemDetails({
                name: '',
                type: '',
                rarity: '',
                value: '',
                properties: [],
                damageFormula: '',
                damageType: '',
                weight: '',
                description: '',
                quote: '',
                sdPrompt: ''
            });
            setSelectedFinalImage('');
            setSelectedBorder('');
            setSelectedSeedImage('');
            setTemplateBlob(null);
            setGeneratedImages([]);
            setGeneratedCardImages([]);
            setSelectedGeneratedCardImage('');
            setRenderedCards([]);
            setFinalCardWithText('');
            setCurrentStepId('text-generation');

            // Clear localStorage backup
            localStorage.removeItem('cardGenerator_sessionBackup');
            localStorage.removeItem('cardGenerator_state');

            // Reset refs
            lastSavedProjectId.current = null;
            lastProjectSwitchTime.current = 0;

            // Create new session
            const initialState = createInitialState();
            // setSessionId(initialState.sessionId); // Removed as per edit hint

            console.log('🚪 CardGenerator data cleared on logout');
        }
    }, [authState.isLoading, authState.isAuthenticated, userId]);



    // Authentication state is handled by AuthContext

    // Project management state (for FloatingHeader)
    const [projects, setProjects] = useState<ProjectSummary[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    // Track screen size for responsive layout
    useEffect(() => {
        const checkScreenSize = () => {
            setIsDesktop(window.innerWidth >= 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Project Management Functions (defined early to avoid dependency issues)
    const getCurrentState = useCallback((): CardGeneratorState => {
        const state: CardGeneratorState = {
            currentStepId,
            stepCompletion: {
                'text-generation': !!(itemDetails.name?.trim()),
                'core-image': !!selectedFinalImage,
                'border-generation': !!selectedBorder && !!selectedFinalImage,
                'final-assembly': !!finalCardWithText // Updated completion logic
            },
            itemDetails,
            selectedAssets: {
                finalImage: selectedFinalImage,
                border: selectedBorder,
                seedImage: selectedSeedImage,
                generatedCardImages,
                selectedGeneratedCardImage,
                finalCardWithText // NEW: Include final card for persistence
            },
            generatedContent: {
                images: generatedImages,
                renderedCards
            },
            autoSaveEnabled: true,
            lastSaved: Date.now().toString()
        };

        // Debug logging removed to prevent loops

        return state;
    }, [currentStepId, itemDetails, selectedFinalImage,
        selectedBorder, selectedSeedImage, generatedImages, renderedCards,
        generatedCardImages, selectedGeneratedCardImage, finalCardWithText]);

    const saveCurrentProject = useCallback(async (overrideItemName?: string, stateSnapshot?: CardGeneratorState) => {
        if (!currentProject || !userId) {
            console.log('💾 saveCurrentProject SKIPPED: { currentProject:', !!currentProject, 'userId:', !!userId, '}');
            return;
        }

        // Prevent rapid saves to different projects
        if (lastSavedProjectId.current && lastSavedProjectId.current !== currentProject.id) {
            const timeSinceLastSave = Date.now() - (lastSaved || 0);
            if (timeSinceLastSave < 2000) { // 2 second cooldown
                console.log('💾 saveCurrentProject SKIPPED: Rapid project switch detected. Last saved:', lastSavedProjectId.current, 'Current:', currentProject.id, 'Time since last save:', timeSinceLastSave, 'ms');
                return;
            }
        }

        console.log('💾 saveCurrentProject STARTED for project:', currentProject.name, 'ID:', currentProject.id);
        setSaveStatus('saving');
        try {
            // Use provided snapshot or capture current state
            const currentState = stateSnapshot || getCurrentState();

            // Debug: Log Step 3 data being saved
            if (currentState.selectedAssets.generatedCardImages?.length > 0 || currentState.selectedAssets.selectedGeneratedCardImage) {
                console.log('💾 SAVING Step 3 data:', {
                    generatedCardImages: currentState.selectedAssets.generatedCardImages?.length || 0,
                    selectedCard: !!currentState.selectedAssets.selectedGeneratedCardImage,
                    firstImagePreview: currentState.selectedAssets.generatedCardImages?.[0]?.substring(0, 50) + '...'
                });
            } else {
                console.log('💾 NO Step 3 data to save:', {
                    generatedCardImages: currentState.selectedAssets.generatedCardImages?.length || 0,
                    selectedCard: !!currentState.selectedAssets.selectedGeneratedCardImage,
                    stateGeneratedCardImages: generatedCardImages.length,
                    stateSelectedCard: !!selectedGeneratedCardImage
                });
            }

            // Use the provided name, or compute from itemDetails, or fallback to current project name
            const itemName = overrideItemName || itemDetails.name?.trim();
            const projectName = itemName || currentProject.name;

            const updatedProject: Project = {
                ...currentProject,
                name: projectName,
                state: currentState,
                updatedAt: new Date().toISOString()
            };

            await projectAPI.updateProject(updatedProject);

            setCurrentProject(updatedProject);
            setLastSaved(Date.now());
            setSaveStatus('saved');

            // Track which project was last saved
            lastSavedProjectId.current = updatedProject.id;

            console.log('💾 saveCurrentProject SUCCESS for project:', updatedProject.name, 'ID:', updatedProject.id);

            // Clear 'saved' status after 3 seconds
            setTimeout(() => setSaveStatus('idle'), 3000);

            // Update available projects list
            setAvailableProjects(prev =>
                prev.map(p =>
                    p.id === updatedProject.id
                        ? { ...p, updatedAt: updatedProject.updatedAt }
                        : p
                )
            );
        } catch (error) {
            console.error('💾 saveCurrentProject FAILED for project:', currentProject.name, 'ID:', currentProject.id, 'Error:', error);
            setSaveStatus('error');

            // Clear error status after 5 seconds
            setTimeout(() => setSaveStatus('idle'), 5000);

            // Fallback to localStorage save
            const currentState = getCurrentState();
            if (templateBlob && userId) {
                await saveCardSession(currentState, templateBlob, userId);
            }
        }
    }, [currentProject?.id, userId]);

    const loadAvailableProjects = useCallback(async () => {
        if (!userId) return;

        try {
            const projects = await projectAPI.listProjects();
            setAvailableProjects(projects);
            setProjects(projects); // Keep both in sync
        } catch (error) {
            console.error('Failed to load projects:', error);
        }
    }, [userId]);

    const createNewProject = useCallback(async (name: string, description?: string) => {
        if (!userId) return;

        try {
            setProjectLoading(true);
            const newProject = await projectAPI.createProject({ name, description });

            // Update available projects list
            const newProjectSummary: ProjectSummary = {
                id: newProject.id,
                name: newProject.name,
                description: newProject.description,
                createdBy: newProject.createdBy,
                lastModified: newProject.lastModified,
                updatedAt: new Date().toISOString(),
                cardCount: 0
            };
            setAvailableProjects(prev => [newProjectSummary, ...prev]);
            setProjects(prev => [newProjectSummary, ...prev]); // Keep both in sync

            // Set the new project directly (avoid dependency cycle)
            setCurrentProject(newProject);

            console.info(`Created new project: ${newProject.name}`);
        } catch (error) {
            console.error('Failed to create project:', error);
        } finally {
            setProjectLoading(false);
        }
    }, [userId]);

    const switchToProject = useCallback(async (projectId: string) => {
        if (!userId) return;

        // 🔒 GENERATION LOCK: Prevent project switching during async operations
        if (isAnyGenerationInProgress) {
            console.log('🔒 Project switch blocked - generation in progress:', generationLocks);
            return;
        }

        // Prevent rapid project switching (debounce project switches)
        const now = Date.now();
        const timeSinceLastSwitch = now - lastProjectSwitchTime.current;
        if (timeSinceLastSwitch < 1000) { // 1 second minimum between switches
            console.log('🔄 switchToProject BLOCKED: Rapid switching detected. Time since last switch:', timeSinceLastSwitch, 'ms');
            return;
        }

        // If already switching to the same project, skip
        if (currentProject?.id === projectId && projectLoading) {
            console.log('🔄 switchToProject SKIPPED: Already loading this project:', projectId);
            return;
        }

        lastProjectSwitchTime.current = now;
        console.log('🔄 switchToProject STARTED for project ID:', projectId);
        let loadedProject: any = null;

        try {
            setProjectLoading(true);
            isRestoringState.current = true;

            const project = await projectAPI.getProject(projectId);
            loadedProject = project; // Store for use in finally block

            console.log('🔄 switchToProject: Setting currentProject to:', project.name, 'ID:', project.id);
            console.log('🔍 DEBUG switchToProject project.state.itemDetails:', project.state.itemDetails);

            // Cancel any pending auto-saves to prevent saving to wrong project
            debouncedSave.cancel();

            setCurrentProject(project);

            // Update the last saved project ID to prevent saves to other projects
            lastSavedProjectId.current = project.id;

            // Restore project state
            restoreProjectState(project.state);

            console.log('🔄 switchToProject SUCCESS for project:', project.name, 'ID:', project.id);
        } catch (error) {
            console.error('🔄 switchToProject FAILED for project ID:', projectId, 'Error:', error);
        } finally {
            setProjectLoading(false);
            // Re-enable auto-save after a longer delay to prevent race conditions
            setTimeout(() => {
                isRestoringState.current = false;
                console.log('🔄 switchToProject: Auto-save re-enabled for project:', loadedProject?.name);

                // Don't trigger immediate saves after project switching
                // Let the normal auto-save system handle any necessary saves
            }, 1000); // Increased from 500ms to 1000ms to prevent race conditions
        }
    }, [userId, currentProject?.id, projectLoading, isAnyGenerationInProgress, generationLocks]);

    const restoreProjectState = (state: CardGeneratorState) => {
        console.log('🔄 restoreProjectState called with:', {
            coreImages: state.generatedContent?.images?.length || 0,
            cardImages: state.selectedAssets?.generatedCardImages?.length || 0,
            selectedCard: !!state.selectedAssets?.selectedGeneratedCardImage,
            finalCardWithText: !!state.selectedAssets?.finalCardWithText,
            step: state.currentStepId
        });

        // DEBUG: Log itemDetails to see what we're actually restoring
        console.log('🔍 DEBUG restoreProjectState itemDetails:', state.itemDetails);

        // Restore all state from project
        setCurrentStepId(state.currentStepId);
        setItemDetails(state.itemDetails);
        setSelectedFinalImage(state.selectedAssets.finalImage || '');
        setSelectedBorder(state.selectedAssets.border || '');
        setSelectedSeedImage(state.selectedAssets.seedImage || '');
        setGeneratedImages(state.generatedContent.images || []);
        setRenderedCards(state.generatedContent.renderedCards || []);
        setLastSaved(parseInt(state.lastSaved || '0'));

        // Load Step 3 state
        setGeneratedCardImages(state.selectedAssets.generatedCardImages || []);
        setSelectedGeneratedCardImage(state.selectedAssets.selectedGeneratedCardImage || '');

        // Load Step 5 state - NEW
        setFinalCardWithText(state.selectedAssets.finalCardWithText || '');
    };

    // Immediate localStorage backup for session recovery
    const saveToLocalStorage = useCallback(() => {
        if (isRestoringState.current || !initialLoadComplete.current) {
            return;
        }

        try {
            const currentState = getCurrentState();
            const sessionBackup = {
                state: currentState,
                projectId: currentProject?.id, // Include projectId for proper recovery
                timestamp: Date.now(),
                userId: userId || 'anonymous'
            };

            localStorage.setItem('cardGenerator_sessionBackup', JSON.stringify(sessionBackup));
        } catch (error) {
            // Session backup failed silently
        }
    }, [getCurrentState, userId, currentProject?.id]);

    // Auto-save function with debouncing (now project-aware)
    const saveCurrentState = useCallback(async () => {
        if (isRestoringState.current || !initialLoadComplete.current) {
            console.log('💾 Auto-save SKIPPED: { isRestoringState:', isRestoringState.current, 'initialLoadComplete:', initialLoadComplete.current, '}');
            return; // Don't save during restoration or initial load
        }

        // Prevent auto-save during session recovery to avoid duplicate projects
        const recoveredState = recoverFromLocalStorage();
        const hasRecentSession = recoveredState && recoveredState.itemDetails?.name?.trim();
        if (hasRecentSession && !currentProject?.id) {
            console.log('💾 Auto-save SKIPPED: Session recovery in progress, preventing duplicate project creation');
            return;
        }

        // Skip during project initialization ONLY if we don't have meaningful user content
        if (isInitializingProjects.current) {
            const hasUserContent = generatedImages.length > 0 ||
                generatedCardImages.length > 0 ||
                itemDetails.name?.trim() ||
                selectedFinalImage;

            if (!hasUserContent) {
                console.log('💾 Auto-save SKIPPED: { isInitializingProjects: true, hasUserContent: false }');
                return;
            }
        }

        // Only save if user is authenticated and has a project
        if (currentProject && userId) {
            // CRITICAL FIX: Check if this project was recently switched to (prevent saves during project switching)
            const timeSinceLastSave = Date.now() - (lastSaved || 0);
            if (lastSavedProjectId.current && lastSavedProjectId.current !== currentProject.id) {
                console.log('💾 Auto-save SKIPPED: Project mismatch detected. Last saved project:', lastSavedProjectId.current, 'Current project:', currentProject.id, 'Time since last save:', timeSinceLastSave, 'ms');
                // Clear the debounced save to prevent stale saves
                debouncedSave.cancel();
                return;
            }

            console.log('💾 Auto-save TRIGGERED for project:', currentProject.name, 'ID:', currentProject.id, 'at timestamp:', Date.now());

            // Capture state snapshot AT THE TIME OF SAVE to ensure consistency
            const stateSnapshot = getCurrentState();

            // Verify the project hasn't changed while we were preparing the save
            if (currentProject.id === lastSavedProjectId.current || !lastSavedProjectId.current) {
                await saveCurrentProject(undefined, stateSnapshot);
            } else {
                console.log('💾 Auto-save CANCELLED: Project changed during save preparation');
            }
        } else if (userId) {
            console.log('💾 Auto-save SKIPPED: { userId:', userId, 'currentProject:', !!currentProject, '}');
            // User is authenticated but no project yet - skip auto-save until project initialization completes
            return;
        } else {
            console.log('💾 Auto-save SKIPPED: { userId:', userId, '}');
            // Anonymous users: no auto-save (they need to authenticate to use the system)
            return;
        }
    }, [currentStepId, itemDetails, selectedFinalImage, selectedBorder,
        selectedSeedImage, templateBlob, generatedImages, renderedCards, userId,
        generatedCardImages, selectedGeneratedCardImage, currentProject?.id, saveCurrentProject]);

    // Debounced auto-save (saves 2 seconds after last change to reduce server load)
    const debouncedSave = useCallback(debounce(saveCurrentState, 2000), [saveCurrentState]);

    // Session recovery from localStorage backup
    const recoverFromLocalStorage = useCallback(() => {
        try {
            const backup = localStorage.getItem('cardGenerator_sessionBackup');
            if (!backup) return null;

            const sessionBackup = JSON.parse(backup);
            const backupAge = Date.now() - sessionBackup.timestamp;

            // Only recover if backup is less than 24 hours old
            if (backupAge > 24 * 60 * 60 * 1000) {
                localStorage.removeItem('cardGenerator_sessionBackup');
                return null;
            }

            console.info('Found recent session backup, recovering...');
            return sessionBackup.state;
        } catch (error) {
            localStorage.removeItem('cardGenerator_sessionBackup');
            return null;
        }
    }, []);

    // Simple initialization - just mark as complete when auth is ready
    useEffect(() => {
        if (initialLoadComplete.current) return;

        if (userId !== null || (!authState.isLoading && !authState.isAuthenticated)) {
            // Try to recover from localStorage backup first
            const recoveredState = recoverFromLocalStorage();

            if (recoveredState && recoveredState.itemDetails?.name?.trim()) {
                console.info('Recovering session from localStorage backup');
                isRestoringState.current = true;
                restoreProjectState(recoveredState);

                // IMPORTANT: Restore currentProject if projectId exists in session backup
                if (recoveredState.projectId && userId) {
                    console.info('Restoring currentProject from session backup:', recoveredState.projectId);
                    // Load the project to restore currentProject state
                    projectAPI.getProject(recoveredState.projectId)
                        .then(project => {
                            setCurrentProject(project);
                            lastSavedProjectId.current = project.id;
                            console.info('✅ currentProject restored from session:', project.name);
                        })
                        .catch(error => {
                            console.warn('⚠️ Failed to restore currentProject from session:', error);
                            // If project doesn't exist, create a new one with the recovered data
                            createNewProject(recoveredState.itemDetails?.name || 'Recovered Project', 'Project recovered from session backup');
                        });
                } else {
                    // No projectId in session backup, but we have recovered data
                    // Try to find an existing project with the same name first
                    if (recoveredState.itemDetails?.name?.trim()) {
                        console.info('No projectId in session backup, searching for existing project with same name');

                        // Load available projects and search for matching name
                        projectAPI.listProjects()
                            .then(projects => {
                                const matchingProject = projects.find(p =>
                                    p.name.toLowerCase() === recoveredState.itemDetails.name.toLowerCase()
                                );

                                if (matchingProject) {
                                    console.info('Found existing project with matching name:', matchingProject.name);
                                    switchToProject(matchingProject.id);
                                } else {
                                    console.info('No matching project found, creating new project from recovered session data');
                                    createNewProject(recoveredState.itemDetails.name, 'Project recovered from session backup');
                                }
                            })
                            .catch(error => {
                                console.warn('Failed to search for existing projects, creating new project:', error);
                                createNewProject(recoveredState.itemDetails.name, 'Project recovered from session backup');
                            });
                    }
                }

                isRestoringState.current = false;
            } else {
                // Create a new session ID for this session
                const initialState = createInitialState();
                // setSessionId(initialState.sessionId); // Removed as per edit hint
            }

            initialLoadComplete.current = true;
        }
    }, [userId, authState.isLoading, authState.isAuthenticated, recoverFromLocalStorage, restoreProjectState]);

    // Auto-save effect - triggers on any state change
    useEffect(() => {
        if (initialLoadComplete.current && !isRestoringState.current) {
            // Immediate localStorage backup for session recovery
            saveToLocalStorage();

            // Debounced server save for persistence
            debouncedSave();
        }
    }, [currentStepId, itemDetails, selectedFinalImage, selectedBorder,
        selectedSeedImage, templateBlob, generatedImages, renderedCards,
        generatedCardImages, selectedGeneratedCardImage, finalCardWithText,
        saveToLocalStorage, debouncedSave]);

    // Project initialization - load projects and set up default project for authenticated users
    useEffect(() => {
        const initializeProjects = async () => {
            if (!userId || !initialLoadComplete.current || isInitializingProjects.current) return;

            isInitializingProjects.current = true;

            try {
                console.info('Initializing projects for user:', userId);

                // Load available projects
                await loadAvailableProjects();

                // If no current project is set, initialize one
                if (!currentProject) {
                    const projects = await projectAPI.listProjects();

                    if (projects.length > 0) {
                        // Check if we have a recent session backup that should take precedence
                        const recoveredState = recoverFromLocalStorage();
                        const hasRecentSession = recoveredState && recoveredState.itemDetails?.name?.trim();

                        if (hasRecentSession) {
                            // Session recovery takes precedence over server state to preserve unsaved changes
                            // Don't create a new project here - let the session recovery handle it
                            console.info('Session recovery in progress, skipping project initialization');
                        } else {
                            // Load the most recently updated project
                            const sortedProjects = projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                            const mostRecent = sortedProjects[0];
                            await switchToProject(mostRecent.id);
                        }
                    } else {
                        // Create a default project for new users
                        await createNewProject('Untitled Project', 'Welcome to CardGenerator! Start creating your cards here.');
                    }
                }
            } catch (error) {
                // Project initialization failed silently
            } finally {
                isInitializingProjects.current = false;
            }
        };

        // Only initialize projects for authenticated users after auth and initial load are complete
        if (userId && initialLoadComplete.current && !currentProject && !isInitializingProjects.current) {
            initializeProjects();
        }
    }, [userId, currentProject, loadAvailableProjects, createNewProject, switchToProject]);

    // Image persistence handled by parent components

    // Define the 5-step workflow
    const [steps, setSteps] = useState<Step[]>([
        {
            id: 'text-generation',
            label: 'Describe Item',
            shortLabel: 'Text',
            icon: '📝',
            status: 'active'
        },
        {
            id: 'core-image',
            label: 'Choose Image',
            shortLabel: 'Image',
            icon: '🖼️',
            status: 'pending'
        },
        {
            id: 'border-generation',
            label: 'Card Style',
            shortLabel: 'Style',
            icon: '🎨',
            status: 'pending'
        },
        {
            id: 'final-assembly',
            label: 'Assemble Card',
            shortLabel: 'Assemble',
            icon: '✨',
            status: 'pending'
        }
    ]);

    // Update step status based on completion criteria
    useEffect(() => {
        setSteps(prevSteps => prevSteps.map(step => {
            let newStatus: StepStatus = step.status;

            switch (step.id) {
                case 'text-generation':
                    if (currentStepId === step.id) {
                        newStatus = 'active';
                    } else if (itemDetails.name?.trim() && itemDetails.type?.trim() && itemDetails.description?.trim()) {
                        newStatus = 'completed';
                    } else {
                        newStatus = 'pending';
                    }
                    break;

                case 'core-image':
                    if (currentStepId === step.id) {
                        newStatus = 'active';
                    } else if (selectedFinalImage) {
                        newStatus = 'completed';
                    } else {
                        newStatus = 'pending';
                    }
                    break;

                case 'border-generation':
                    if (currentStepId === step.id) {
                        newStatus = 'active';
                    } else if (selectedBorder && selectedFinalImage) {
                        newStatus = 'completed';
                    } else {
                        newStatus = 'pending';
                    }
                    break;

                case 'final-assembly':
                    if (currentStepId === step.id) {
                        newStatus = 'active';
                    } else {
                        newStatus = 'pending';
                    }
                    break;
            }

            return { ...step, status: newStatus };
        }));
    }, [currentStepId, itemDetails, selectedFinalImage, selectedBorder, selectedSeedImage]);

    // Get reliable item name (same logic used in FloatingHeader)
    const getReliableItemName = useCallback(() => {
        const itemName = itemDetails.name?.trim();
        if (itemName && itemName !== 'Untitled Project') {
            return itemName;
        }
        return currentProject?.name || 'Untitled Project';
    }, [itemDetails.name, currentProject?.name]);

    // Event handlers
    const handleItemDetailsChange = (data: Partial<ItemDetails>) => {
        setItemDetails(prev => ({ ...prev, ...data }));
    };

    const handleImageSelect = (imageUrl: string) => {
        setSelectedFinalImage(imageUrl);
    };

    const handleImagesGenerated = (images: GeneratedImage[]) => {
        setGeneratedImages(prevImages => {
            // Check if this is a deletion (fewer images than before)
            const isDeletion = images.length < prevImages.length;

            if (isDeletion) {
                // For deletions, replace the entire array with the filtered list
                return images;
            } else {
                // For additions, merge new images with existing ones, avoiding duplicates
                const existingUrls = new Set(prevImages.map(img => img.url));
                const newImages = images.filter(img => !existingUrls.has(img.url));
                const updatedImages = [...newImages, ...prevImages];
                return updatedImages;
            }
        });
    };

    const handleCardRendered = (cardUrl: string, cardName: string) => {
        const newCard: RenderedCard = {
            url: cardUrl,
            id: Date.now().toString(),
            name: cardName,
            timestamp: Date.now().toString()
        };
        setRenderedCards(prevCards => [newCard, ...prevCards]);

        // Also update the final card state for Step 5 persistence
        setFinalCardWithText(cardUrl);
    };

    // Project management functions
    const canSaveProject = () => {
        // TEMP FIX: Don't require type field since backend isn't persisting it properly
        return itemDetails.name?.trim() !== '' ||
            itemDetails.description?.trim() !== '';
    };

    const handleSaveProject = async () => {
        if (!canSaveProject() || !userId) {
            return;
        }

        try {
            const reliableName = getReliableItemName();

            if (currentProject) {
                const currentName = currentProject.name;

                // Special case: Update "Untitled Project" in place when user adds content
                if (currentName === 'Untitled Project' && reliableName !== 'Untitled Project') {
                    console.info(`Updating Untitled Project with new name: "${reliableName}"`);
                    await saveCurrentProject(reliableName);
                }
                // Check if this is a significantly different item (should create new project)
                else {
                    const shouldCreateNew = (
                        currentName !== 'Untitled Project' &&
                        reliableName !== 'Untitled Project' &&
                        reliableName !== currentName &&
                        !reliableName.toLowerCase().includes(currentName.toLowerCase().split(' ')[0]) &&
                        !currentName.toLowerCase().includes(reliableName.toLowerCase().split(' ')[0])
                    );

                    if (shouldCreateNew) {
                        console.info(`Creating new project for different item: "${currentName}" -> "${reliableName}"`);
                        await createNewProject(reliableName, itemDetails.description);
                    } else {
                        await saveCurrentProject(reliableName);
                    }
                }
            } else {
                // Create new project
                await createNewProject(reliableName, itemDetails.description);
            }

            // Refresh the projects list to show the updated/new project
            await loadAvailableProjects();

            // Also refresh the projects dropdown in FloatingHeader
            await loadProjects();

        } catch (error) {
            console.error('Error saving project:', error);
        }
    };

    const handleLoadProject = (state: CardGeneratorState, templateBlob: Blob | null) => {
        // Set restoration flag to prevent auto-save during load
        isRestoringState.current = true;

        // Restore all state
        // setSessionId(state.sessionId); // Removed as per edit hint
        setCurrentStepId(state.currentStepId);
        setItemDetails(state.itemDetails);
        setSelectedFinalImage(state.selectedAssets.finalImage || '');
        setSelectedBorder(state.selectedAssets.border || '');
        setSelectedSeedImage(state.selectedAssets.seedImage || '');
        setGeneratedImages(state.generatedContent.images || []);
        setRenderedCards(state.generatedContent.renderedCards || []);
        setLastSaved(parseInt(state.lastSaved || '0'));

        // Load Step 3 state
        setGeneratedCardImages(state.selectedAssets.generatedCardImages || []);
        setSelectedGeneratedCardImage(state.selectedAssets.selectedGeneratedCardImage || '');

        if (templateBlob) {
            setTemplateBlob(templateBlob);
        }

        // Re-enable auto-save after a short delay
        setTimeout(() => {
            isRestoringState.current = false;
        }, 1000);

        console.info(`Project "${state.itemDetails.name}" loaded successfully`);
    };



    const handleDeleteProject = async (projectId: string): Promise<void> => {
        if (!userId) return;

        try {
            await projectAPI.deleteProject(projectId);

            // Update available projects list
            setAvailableProjects(prev => prev.filter(p => p.id !== projectId));
            setProjects(prev => prev.filter(p => p.id !== projectId)); // Keep both in sync

            // If we're deleting the current project, switch to another or create new
            if (currentProject?.id === projectId) {
                const remainingProjects = availableProjects.filter(p => p.id !== projectId);
                if (remainingProjects.length > 0) {
                    await switchToProject(remainingProjects[0].id);
                } else {
                    // Create a new default project
                    await createNewProject('Untitled Project');
                }
            }

            console.info(`Deleted project: ${projectId}`);
        } catch (error) {
            console.error('Failed to delete project:', error);
            throw error; // Re-throw so ProjectsDrawer can handle the error
        }
    };

    const duplicateProject = async (projectId: string): Promise<void> => {
        if (!userId) return;

        try {
            const originalProject = availableProjects.find(p => p.id === projectId);
            const newName = `${originalProject?.name || 'Project'} Copy`;

            const duplicatedProject = await projectAPI.duplicateProject(projectId, newName);

            // Update available projects list
            const duplicatedProjectSummary: ProjectSummary = {
                id: duplicatedProject.id,
                name: duplicatedProject.name,
                description: duplicatedProject.description,
                createdBy: duplicatedProject.createdBy,
                lastModified: duplicatedProject.lastModified,
                updatedAt: duplicatedProject.updatedAt,
                cardCount: 0
            };
            setAvailableProjects(prev => [duplicatedProjectSummary, ...prev]);
            setProjects(prev => [duplicatedProjectSummary, ...prev]); // Keep both in sync

            console.info(`Duplicated project: ${duplicatedProject.name}`);
        } catch (error) {
            console.error('Failed to duplicate project:', error);
        }
    };

    // Load projects list for FloatingHeader dropdown
    const loadProjects = useCallback(async () => {
        if (!userId) return;

        setIsLoadingProjects(true);
        try {
            const projectList = await projectAPI.listProjects();
            setProjects(projectList);
            setAvailableProjects(projectList); // Keep both in sync
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setIsLoadingProjects(false);
        }
    }, [userId]);

    // Load projects when user changes
    useEffect(() => {
        if (userId) {
            loadProjects();
        } else {
            setProjects([]);
            setAvailableProjects([]);
        }
    }, [userId, loadProjects]);

    const handleSdPromptChange = (newPrompt: string) => {
        setItemDetails(prev => ({ ...prev, sdPrompt: newPrompt }));
    };

    const handleBorderSelect = (border: string) => setSelectedBorder(border);
    const handleSeedImageSelect = (image: string) => setSelectedSeedImage(image);
    const handleGenerateTemplate = (blob: Blob, url: string) => setTemplateBlob(blob);

    // Step 3 handlers
    const handleGeneratedCardImagesChange = (images: string[]) => {
        console.log('🎯 handleGeneratedCardImagesChange called with:', images.length, 'images');

        setGeneratedCardImages(prevImages => {
            // Check if this is a deletion (fewer images than before)
            const isDeletion = images.length < prevImages.length;

            if (isDeletion) {
                console.log('🎯 Step3: Deleting images. From:', prevImages.length, 'to:', images.length);
                // For deletions, replace the entire array with the filtered list
                return images;
            } else {
                // For additions, merge new images with existing ones, avoiding duplicates
                const existingUrls = new Set(prevImages);
                const newImages = images.filter(img => !existingUrls.has(img));
                const updatedImages = [...newImages, ...prevImages];
                console.log('🎯 Step3: Adding images. Previous:', prevImages.length, 'New:', newImages.length, 'Total:', updatedImages.length);
                return updatedImages;
            }
        });

        // Let the normal debounced auto-save handle this
        // Removed immediate save to prevent race conditions
    };
    const handleSelectedGeneratedCardImageChange = (image: string) => {
        setSelectedGeneratedCardImage(image);

        // Let the normal debounced auto-save handle this
        // Removed immediate save to prevent race conditions
    };

    // Navigation handlers
    const handleStepClick = (stepId: string) => {
        // 🔒 GENERATION LOCK: Prevent navigation during async operations
        if (isAnyGenerationInProgress) {
            console.log('🔒 Navigation blocked - generation in progress:', generationLocks);
            return;
        }
        setCurrentStepId(stepId);
    };

    const handleNext = () => {
        const currentIndex = steps.findIndex(step => step.id === currentStepId);
        if (currentIndex < steps.length - 1) {
            setCurrentStepId(steps[currentIndex + 1].id);
        }
    };

    const handlePrevious = () => {
        const currentIndex = steps.findIndex(step => step.id === currentStepId);
        if (currentIndex > 0) {
            setCurrentStepId(steps[currentIndex - 1].id);
        }
    };

    const handleComplete = () => {
        // Reset the entire form to start a new card
        setCurrentStepId('text-generation');
        setItemDetails({
            name: '',
            type: '',
            rarity: '',
            value: '',
            properties: [],
            damageFormula: '',
            damageType: '',
            weight: '',
            description: '',
            quote: '',
            sdPrompt: ''
        });
        setSelectedFinalImage('');
        setSelectedBorder('');
        setSelectedSeedImage('');
        setTemplateBlob(null);
    };

    // Allow free navigation for exploration - users can move between steps freely
    const canGoNext = () => {
        switch (currentStepId) {
            case 'final-assembly':
                return false; // Last step, can't go next
            default:
                return true; // Allow exploration of all other steps
        }
    };

    const canGoPrevious = () => {
        const currentIndex = steps.findIndex(step => step.id === currentStepId);
        return currentIndex > 0;
    };

    // Create template for border generation step
    const template = createTemplate(selectedBorder, selectedSeedImage);

    return (
        <MantineProvider theme={dungeonMindTheme}>
            <div className="card-generator-page" style={{
                background: 'var(--parchment-base)',
                minHeight: '100vh',
                position: 'relative' // Ensure it doesn't interfere with fixed nav
            }}>
                {/* 
              SIMPLIFIED NAVIGATION ARCHITECTURE:
              - Primary Navigation: Left sidebar (NavBar.tsx) - site-wide navigation (80px width, fixed)
              - Step Navigation: Integrated into each step component
              - Content: Respects main layout margins (margin-left: 80px on desktop)
            */}

                {/* Main Content Area - Account for nav bar and footer only */}
                <main
                    className="main-content"
                    style={{
                        position: 'relative',
                        zIndex: 100,
                        marginLeft: '80px', // Account for nav bar width on desktop
                        marginRight: '60px', // Account for collapsed drawer width
                        marginBottom: '60px', // Account for footer height
                        transition: 'margin-right 0.3s ease',
                        minHeight: 'calc(100vh - 60px)', // Full height minus footer
                        padding: 'var(--space-4)'
                    }}
                >
                    {/* Step 1: Describe Item */}
                    {currentStepId === 'text-generation' && (
                        <Step1TextGeneration
                            itemDetails={itemDetails}
                            onItemDetailsChange={handleItemDetailsChange}
                            onGenerationLockChange={(isLocked) => setGenerationLock('textGeneration', isLocked)}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            canGoNext={canGoNext()}
                            canGoPrevious={canGoPrevious()}
                            currentStepIndex={0}
                            totalSteps={steps.length}
                        />
                    )}

                    {/* Step 2: Choose Image */}
                    {currentStepId === 'core-image' && (
                        <Step2CoreImage
                            itemDetails={itemDetails}
                            selectedFinalImage={selectedFinalImage}
                            onImageSelect={handleImageSelect}
                            onSdPromptChange={handleSdPromptChange}
                            onImagesGenerated={handleImagesGenerated}
                            persistedImages={generatedImages}
                            onGenerationLockChange={(isLocked) => setGenerationLock('coreImageGeneration', isLocked)}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            canGoNext={canGoNext()}
                            canGoPrevious={canGoPrevious()}
                            currentStepIndex={1}
                            totalSteps={steps.length}
                        />
                    )}

                    {/* Step 3: Card Style */}
                    {currentStepId === 'border-generation' && (() => {
                        return (
                            <Step3BorderGeneration
                                selectedBorder={selectedBorder}
                                selectedFinalImage={selectedFinalImage}
                                onBorderSelect={handleBorderSelect}
                                onGenerateTemplate={handleGenerateTemplate}
                                onFinalImageChange={handleImageSelect}
                                sdPrompt={itemDetails.sdPrompt}
                                onSdPromptChange={handleSdPromptChange}
                                onGeneratedImagesChange={handleGeneratedCardImagesChange}
                                persistedGeneratedImages={generatedCardImages}
                                selectedGeneratedImage={selectedGeneratedCardImage}
                                onSelectedGeneratedImageChange={handleSelectedGeneratedCardImageChange}
                                onGenerationLockChange={(isLocked) => setGenerationLock('borderGeneration', isLocked)}
                                onNext={handleNext}
                                onPrevious={handlePrevious}
                                canGoNext={canGoNext()}
                                canGoPrevious={canGoPrevious()}
                                currentStepIndex={2}
                                totalSteps={steps.length}
                            />
                        );
                    })()}

                    {/* Step 4: Final Card */}
                    {currentStepId === 'final-assembly' && (
                        <Step5FinalAssembly
                            itemDetails={itemDetails}
                            selectedGeneratedCardImage={selectedGeneratedCardImage}
                            onComplete={() => {
                                // Open the Projects drawer instead of navigating away
                                setForceExpandDrawer(true);
                                // Reset the force expand after a short delay to allow normal drawer behavior
                                setTimeout(() => setForceExpandDrawer(false), 100);
                            }}
                            onItemDetailsChange={handleItemDetailsChange}
                            onCardRendered={handleCardRendered}
                            finalCardWithText={finalCardWithText}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            canGoNext={canGoNext()}
                            canGoPrevious={canGoPrevious()}
                            currentStepIndex={3}
                            totalSteps={steps.length}
                        />
                    )}
                </main>
            </div>



            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={isCreateProjectModalOpen}
                onClose={() => setIsCreateProjectModalOpen(false)}
                onProjectCreated={async (project) => {
                    console.log('📂 CreateProjectModal: New project created:', project.name, 'ID:', project.id);

                    // Add the new project to the projects lists immediately
                    const newProjectSummary = {
                        id: project.id,
                        name: project.name,
                        description: project.description,
                        createdBy: project.createdBy,
                        lastModified: project.lastModified,
                        updatedAt: new Date().toISOString(),
                        cardCount: 0
                    };

                    setProjects(prev => [newProjectSummary, ...prev]);
                    setAvailableProjects(prev => [newProjectSummary, ...prev]);

                    // Load the new project and switch to it
                    await switchToProject(project.id);
                    setIsCreateProjectModalOpen(false);

                    console.log('📂 CreateProjectModal: Project loaded and lists updated');
                }}
            />

            {/* Enhanced Projects Drawer */}
            <ProjectsDrawerEnhanced
                projects={projects}
                currentProjectId={currentProject?.id}
                currentItemName={getReliableItemName()}
                isLoadingProjects={isLoadingProjects}
                canSaveProject={canSaveProject()}
                onLoadProject={async (projectId: string) => {
                    try {
                        console.log('📂 ProjectsDrawer: Loading project ID:', projectId);
                        // Use the existing switchToProject function which properly handles project switching
                        await switchToProject(projectId);
                        console.log('📂 ProjectsDrawer: Project load completed for ID:', projectId);
                    } catch (error) {
                        console.error('📂 ProjectsDrawer: Failed to load project:', error);
                    }
                }}
                onCreateNewProject={() => setIsCreateProjectModalOpen(true)}
                onSaveProject={handleSaveProject}
                onDeleteProject={handleDeleteProject}
                onDuplicateProject={duplicateProject}
                onRefreshProjects={loadProjects}
                currentProjectState={getCurrentState()}
                isGenerationInProgress={isAnyGenerationInProgress}
                forceExpanded={forceExpandDrawer}
            />

            {/* Enhanced UX Components */}
            {showFunGenerationFeedback && (
                <FunGenerationFeedback
                    stage={generationStage}
                    progress={generationProgress}
                    itemName={itemDetails.name}
                />
            )}

            {showSuccessCelebration && (
                <SuccessCelebration
                    type={successCelebrationType}
                    itemName={itemDetails.name}
                    onComplete={() => setShowSuccessCelebration(false)}
                />
            )}



            {/* Footer */}
            <Footer />
        </MantineProvider>
    );
}

