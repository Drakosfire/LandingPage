import React, { useState, useEffect, useCallback } from 'react';
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import dungeonMindTheme from '../../config/mantineTheme';
import '../../styles/mantineOverrides.css';

import { ItemDetails, GeneratedImage, createTemplate, CardGeneratorState, RenderedCard, ProjectSummary } from '../../types/card.types';
import { useAuth } from '../../context/AuthContext';
import CreateProjectModal from './CreateProjectModal';
import ProjectsDrawerEnhanced from './ProjectsDrawerEnhanced';
import '../../styles/DesignSystem.css';
import '../../styles/CardGeneratorLayout.css';

// Import step navigation and individual step components
import FloatingHeader from './FloatingHeader';
import Step1TextGeneration from './steps/Step1TextGeneration';
import Step2CoreImage from './steps/Step2CoreImage';
import Step3BorderGeneration from './steps/Step3BorderGeneration';
import Step5FinalAssembly from './steps/Step5FinalAssembly';

// Import extracted hooks
import { useProjectManager } from './hooks/useProjectManager';
import { useSessionManager } from './hooks/useSessionManager';
import { useStepNavigation } from './hooks/useStepNavigation';
import { useGenerationLocks } from './hooks/useGenerationLocks';

export default function CardGeneratorRefactored() {
    // Main state management - core card data
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

    // Step 5 final card state
    const [finalCardWithText, setFinalCardWithText] = useState<string>('');

    // Additional state for persistence
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [renderedCards, setRenderedCards] = useState<RenderedCard[]>([]);

    // Authentication
    const { userId, isLoggedIn, authState } = useAuth();

    // State restoration function for session manager - DECLARE FIRST
    const restoreProjectState = useCallback((state: CardGeneratorState) => {
        console.log('🔄 Restoring project state from session');

        if (state.itemDetails) setItemDetails(state.itemDetails);
        if (state.selectedAssets.finalImage) setSelectedFinalImage(state.selectedAssets.finalImage);
        if (state.selectedAssets.border) setSelectedBorder(state.selectedAssets.border);
        if (state.selectedAssets.seedImage) setSelectedSeedImage(state.selectedAssets.seedImage);
        if (state.selectedAssets.templateBlob) setTemplateBlob(new Blob([state.selectedAssets.templateBlob]));
        if (state.selectedAssets.generatedCardImages) setGeneratedCardImages(state.selectedAssets.generatedCardImages);
        if (state.selectedAssets.selectedGeneratedCardImage) setSelectedGeneratedCardImage(state.selectedAssets.selectedGeneratedCardImage);
        if (state.selectedAssets.finalCardWithText) setFinalCardWithText(state.selectedAssets.finalCardWithText);
        if (state.generatedContent.images) setGeneratedImages(state.generatedContent.images);
        if (state.generatedContent.renderedCards) setRenderedCards(state.generatedContent.renderedCards);

        console.log('🔄 Project state restored successfully');
    }, []);

    // Use extracted hooks
    const generationLocks = useGenerationLocks();

    const projectManager = useProjectManager(
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
    );

    const sessionManager = useSessionManager(restoreProjectState);

    const stepNavigation = useStepNavigation(
        itemDetails,
        selectedFinalImage,
        selectedBorder,
        selectedSeedImage,
        generatedCardImages,
        selectedGeneratedCardImage,
        finalCardWithText,
        generationLocks.generationLocks as unknown as Record<string, boolean>
    );

    // Event handlers
    const handleItemDetailsChange = useCallback((data: Partial<ItemDetails>) => {
        setItemDetails(prev => ({ ...prev, ...data }));
    }, []);

    const handleImageSelect = useCallback((imageUrl: string) => {
        setSelectedFinalImage(imageUrl);
    }, []);

    const handleImagesGenerated = useCallback((images: GeneratedImage[]) => {
        setGeneratedImages(images);
    }, []);

    const handleCardRendered = useCallback((cardUrl: string, cardName: string) => {
        setFinalCardWithText(cardUrl);
        setRenderedCards(prev => [...prev, {
            url: cardUrl,
            name: cardName,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
        }]);
    }, []);

    const handleSdPromptChange = useCallback((newPrompt: string) => {
        setItemDetails(prev => ({ ...prev, sdPrompt: newPrompt }));
    }, []);

    const handleBorderSelect = useCallback((border: string) => {
        setSelectedBorder(border);
    }, []);

    const handleSeedImageSelect = useCallback((image: string) => {
        setSelectedSeedImage(image);
    }, []);

    const handleGenerateTemplate = useCallback((blob: Blob, url: string) => {
        setTemplateBlob(blob);
    }, []);

    const handleGeneratedCardImagesChange = useCallback((images: string[]) => {
        setGeneratedCardImages(images);
    }, []);

    const handleSelectedGeneratedCardImageChange = useCallback((image: string) => {
        setSelectedGeneratedCardImage(image);
    }, []);

    // Auto-save setup
    useEffect(() => {
        if (!isLoggedIn || !userId) return;

        const currentState: CardGeneratorState = {
            currentStepId: stepNavigation.currentStepId,
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

        sessionManager.setupAutoSave(currentState);
    }, [
        isLoggedIn,
        userId,
        stepNavigation.currentStepId,
        itemDetails,
        selectedFinalImage,
        selectedBorder,
        selectedSeedImage,
        templateBlob,
        generatedCardImages,
        selectedGeneratedCardImage,
        finalCardWithText,
        generatedImages,
        renderedCards,
        sessionManager
    ]);

    // Initialize session and projects on mount
    useEffect(() => {
        const initializeApp = async () => {
            if (!isLoggedIn || !userId) return;

            console.log('🚀 Initializing CardGenerator...');

            // Load session first
            const session = await sessionManager.loadSession();
            if (session) {
                restoreProjectState(session);
            }

            // Then load projects
            await projectManager.loadProjects();

            console.log('🚀 CardGenerator initialization complete');
        };

        initializeApp();
    }, [isLoggedIn, userId, sessionManager, projectManager, restoreProjectState]);

    // Create template for border generation step
    const template = createTemplate(selectedBorder, selectedSeedImage);

    return (
        <MantineProvider theme={dungeonMindTheme}>
            <div className="card-generator-page" style={{
                background: 'var(--parchment-base)',
                minHeight: 'calc(100vh - 60px)',
                paddingBottom: '60px',
                position: 'relative'
            }}>
                {/* Floating Header - Contains step navigation AND project management */}
                <FloatingHeader
                    steps={stepNavigation.steps as any}
                    currentStepId={stepNavigation.currentStepId}
                    onStepClick={stepNavigation.handleStepClick}
                    onPrevious={stepNavigation.handlePrevious}
                    onNext={stepNavigation.handleNext}
                    canGoNext={stepNavigation.canGoNext()}
                    canGoPrevious={stepNavigation.canGoPrevious()}
                    projectName={projectManager.currentProject?.name || 'New Project'}
                    currentItemName={projectManager.getReliableItemName()}
                    saveStatus={sessionManager.saveStatus}
                    isGenerationInProgress={generationLocks.isAnyGenerationInProgress}
                />

                {/* Main Content Area */}
                <main
                    className="main-content"
                    style={{
                        position: 'relative',
                        zIndex: 100,
                        marginLeft: '80px',
                        marginTop: '80px',
                        marginRight: '60px',
                        transition: 'margin-right 0.3s ease',
                        minHeight: 'calc(100vh - 80px)',
                        padding: 'var(--space-4)'
                    }}
                >
                    {/* Step 1: Describe Item */}
                    {stepNavigation.currentStepId === 'text-generation' && (
                        <Step1TextGeneration
                            itemDetails={itemDetails}
                            onItemDetailsChange={handleItemDetailsChange}
                            onGenerationLockChange={(isLocked) =>
                                generationLocks.setGenerationLock('textGeneration', isLocked)
                            }
                        />
                    )}

                    {/* Step 2: Choose Image */}
                    {stepNavigation.currentStepId === 'core-image' && (
                        <Step2CoreImage
                            itemDetails={itemDetails}
                            selectedFinalImage={selectedFinalImage}
                            onImageSelect={handleImageSelect}
                            onSdPromptChange={handleSdPromptChange}
                            onImagesGenerated={handleImagesGenerated}
                            persistedImages={generatedImages}
                            onGenerationLockChange={(isLocked) =>
                                generationLocks.setGenerationLock('coreImageGeneration', isLocked)
                            }
                        />
                    )}

                    {/* Step 3: Card Style */}
                    {stepNavigation.currentStepId === 'border-generation' && (
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
                            onGenerationLockChange={(isLocked) =>
                                generationLocks.setGenerationLock('borderGeneration', isLocked)
                            }
                        />
                    )}

                    {/* Step 4: Final Card */}
                    {stepNavigation.currentStepId === 'final-assembly' && (
                        <Step5FinalAssembly
                            itemDetails={itemDetails}
                            selectedGeneratedCardImage={selectedGeneratedCardImage}
                            onComplete={stepNavigation.handleComplete}
                            onItemDetailsChange={handleItemDetailsChange}
                            onCardRendered={handleCardRendered}
                            finalCardWithText={finalCardWithText}
                        />
                    )}
                </main>
            </div>

            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={projectManager.isCreateProjectModalOpen}
                onClose={() => projectManager.setIsCreateProjectModalOpen(false)}
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

                    projectManager.setProjects([newProjectSummary, ...projectManager.projects]);
                    projectManager.setAvailableProjects([newProjectSummary, ...projectManager.availableProjects]);

                    // Load the new project and switch to it
                    await projectManager.switchToProject(project.id);
                    projectManager.setIsCreateProjectModalOpen(false);

                    console.log('📂 CreateProjectModal: Project loaded and lists updated');
                }}
            />

            {/* Projects Drawer */}
            <ProjectsDrawerEnhanced
                projects={projectManager.projects}
                currentProjectId={projectManager.currentProject?.id}
                currentItemName={projectManager.getReliableItemName()}
                isLoadingProjects={projectManager.isLoadingProjects}
                canSaveProject={projectManager.canSaveProject()}
                onLoadProject={async (projectId: string) => {
                    try {
                        console.log('📂 ProjectsDrawer: Loading project ID:', projectId);
                        await projectManager.switchToProject(projectId);
                        console.log('📂 ProjectsDrawer: Project load completed for ID:', projectId);
                    } catch (error) {
                        console.error('📂 ProjectsDrawer: Failed to load project:', error);
                    }
                }}
                onCreateNewProject={() => projectManager.setIsCreateProjectModalOpen(true)}
                onSaveProject={projectManager.handleSaveProject}
                onDeleteProject={projectManager.handleDeleteProject}
                onDuplicateProject={projectManager.duplicateProject}
                onRefreshProjects={projectManager.loadProjects}
                currentProjectState={projectManager.getCurrentState()}
                isGenerationInProgress={generationLocks.isAnyGenerationInProgress}
            />
        </MantineProvider>
    );
}