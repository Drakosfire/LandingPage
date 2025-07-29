// CardGeneratorProvider.tsx - Context Provider for Global Session Integration
import React, { createContext, useContext, useCallback, useEffect, useMemo } from 'react';
import { useGlobalSession, GlobalSessionHook } from '../../hooks/useGlobalSession';
import { useAuth } from '../../context/AuthContext';
import {
    ItemDetails,
    GeneratedImage,
    RenderedCard,
    CardGeneratorState,
    Project,
    ProjectSummary
} from '../../types/card.types';
import {
    CardGeneratorSessionState,
    DungeonMindObject
} from '../../types/globalSession.types';

// Context interface for CardGenerator
export interface CardGeneratorContextType {
    // Core State (migrated from component state)
    currentStepId: string;
    itemDetails: ItemDetails;
    selectedFinalImage: string;
    selectedBorder: string;
    selectedSeedImage: string;
    generatedCardImages: string[];
    selectedGeneratedCardImage: string;
    finalCardWithText: string;
    generatedImages: GeneratedImage[];
    renderedCards: RenderedCard[];

    // Step Management
    stepCompletion: Record<string, boolean>;
    canGoNext: () => boolean;
    canGoPrevious: () => boolean;
    nextStep: () => void;
    previousStep: () => void;
    goToStep: (stepId: string) => void;

    // State Updates
    updateItemDetails: (updates: Partial<ItemDetails>) => void;
    setSelectedFinalImage: (image: string) => void;
    setSelectedBorder: (border: string) => void;
    setSelectedSeedImage: (image: string) => void;
    setGeneratedCardImages: (images: string[]) => void;
    setSelectedGeneratedCardImage: (image: string) => void;
    setFinalCardWithText: (card: string) => void;
    addGeneratedImage: (image: GeneratedImage) => void;
    addRenderedCard: (card: RenderedCard) => void;

    // Global Session Integration
    saveAsGlobalObject: () => Promise<string>;
    loadFromGlobalObject: (objectId: string) => Promise<void>;

    // Cross-tool Features
    recentObjects: DungeonMindObject[];
    clipboard: string[];
    addToClipboard: (objectId: string) => Promise<void>;

    // Session Management
    isLoading: boolean;
    saveStatus: 'idle' | 'saving' | 'saved' | 'error';
    error: string | null;
    lastSaved: string | null;
    saveSession: () => Promise<void>;

    // Legacy Project Support (for backward compatibility)
    currentProject: Project | null;
    setCurrentProject: (project: Project | null) => void;
}

const CardGeneratorContext = createContext<CardGeneratorContextType | undefined>(undefined);

// Step definitions
const STEPS = [
    { id: 'text-generation', label: 'Text & Description', order: 1 },
    { id: 'core-image', label: 'Core Image', order: 2 },
    { id: 'border-generation', label: 'Border & Card', order: 3 },
    { id: 'final-assembly', label: 'Final Assembly', order: 4 }
];

interface CardGeneratorProviderProps {
    children: React.ReactNode;
}

export const CardGeneratorProvider: React.FC<CardGeneratorProviderProps> = ({ children }) => {
    const { userId } = useAuth();
    const globalSession = useGlobalSession();

    // Extract current state from global session or use defaults
    const currentState = useMemo(() => {
        const sessionState = globalSession.cardGeneratorState;
        if (!sessionState) {
            // Return default state
            return {
                currentStepId: 'text-generation',
                stepCompletion: {} as Record<string, boolean>,
                itemDetails: {
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
                },
                selectedAssets: {
                    finalImage: '',
                    border: '',
                    seedImage: '',
                    generatedCardImages: [],
                    selectedGeneratedCardImage: '',
                    finalCardWithText: ''
                },
                generatedContent: {
                    images: [],
                    renderedCards: []
                },
                autoSaveEnabled: true,
                lastSaved: null
            };
        }
        return sessionState;
    }, [globalSession.cardGeneratorState]);

    // State update helper
    const updateState = useCallback(async (updates: Partial<CardGeneratorSessionState>) => {
        await globalSession.updateToolState(updates);
    }, [globalSession]);

    // Individual state updaters
    const updateItemDetails = useCallback(async (updates: Partial<ItemDetails>) => {
        const newItemDetails = { ...currentState.itemDetails, ...updates };
        await updateState({
            itemDetails: newItemDetails,
            stepCompletion: {
                ...currentState.stepCompletion,
                'text-generation': !!(newItemDetails.name?.trim())
            }
        });
    }, [currentState, updateState]);

    const setSelectedFinalImage = useCallback(async (image: string) => {
        await updateState({
            selectedAssets: {
                ...currentState.selectedAssets,
                finalImage: image
            },
            stepCompletion: {
                ...currentState.stepCompletion,
                'core-image': !!image
            }
        });
    }, [currentState, updateState]);

    const setSelectedBorder = useCallback(async (border: string) => {
        await updateState({
            selectedAssets: {
                ...currentState.selectedAssets,
                border
            },
            stepCompletion: {
                ...currentState.stepCompletion,
                'border-generation': !!(border && currentState.selectedAssets.finalImage)
            }
        });
    }, [currentState, updateState]);

    const setSelectedSeedImage = useCallback(async (image: string) => {
        await updateState({
            selectedAssets: {
                ...currentState.selectedAssets,
                seedImage: image
            }
        });
    }, [currentState, updateState]);

    const setGeneratedCardImages = useCallback(async (images: string[]) => {
        await updateState({
            selectedAssets: {
                ...currentState.selectedAssets,
                generatedCardImages: images
            }
        });
    }, [currentState, updateState]);

    const setSelectedGeneratedCardImage = useCallback(async (image: string) => {
        await updateState({
            selectedAssets: {
                ...currentState.selectedAssets,
                selectedGeneratedCardImage: image
            }
        });
    }, [currentState, updateState]);

    const setFinalCardWithText = useCallback(async (card: string) => {
        await updateState({
            selectedAssets: {
                ...currentState.selectedAssets,
                finalCardWithText: card
            },
            stepCompletion: {
                ...currentState.stepCompletion,
                'final-assembly': !!card
            }
        });
    }, [currentState, updateState]);

    // Step navigation
    const goToStep = useCallback(async (stepId: string) => {
        await updateState({ currentStepId: stepId });
    }, [updateState]);

    const nextStep = useCallback(() => {
        const currentIndex = STEPS.findIndex(step => step.id === currentState.currentStepId);
        if (currentIndex < STEPS.length - 1) {
            goToStep(STEPS[currentIndex + 1].id);
        }
    }, [currentState.currentStepId, goToStep]);

    const previousStep = useCallback(() => {
        const currentIndex = STEPS.findIndex(step => step.id === currentState.currentStepId);
        if (currentIndex > 0) {
            goToStep(STEPS[currentIndex - 1].id);
        }
    }, [currentState.currentStepId, goToStep]);

    // Step validation
    const canGoNext = useCallback(() => {
        const currentIndex = STEPS.findIndex(step => step.id === currentState.currentStepId);
        if (currentIndex >= STEPS.length - 1) return false;

        // Check if current step is completed
        const stepCompletion = currentState.stepCompletion || {};
        return stepCompletion[currentState.currentStepId] || false;
    }, [currentState.currentStepId, currentState.stepCompletion]);

    const canGoPrevious = useCallback(() => {
        const currentIndex = STEPS.findIndex(step => step.id === currentState.currentStepId);
        return currentIndex > 0;
    }, [currentState.currentStepId]);

    // Content management
    const addGeneratedImage = useCallback(async (image: GeneratedImage) => {
        const newImages = [...(currentState.generatedContent.images || []), image.url];
        await updateState({
            generatedContent: {
                ...currentState.generatedContent,
                images: newImages
            }
        });
    }, [currentState, updateState]);

    const addRenderedCard = useCallback(async (card: RenderedCard) => {
        const newCards = [...(currentState.generatedContent.renderedCards || []), card.url];
        await updateState({
            generatedContent: {
                ...currentState.generatedContent,
                renderedCards: newCards
            }
        });
    }, [currentState, updateState]);

    // Global object integration
    const saveAsGlobalObject = useCallback(async (): Promise<string> => {
        const objectData: Partial<DungeonMindObject> = {
            type: 'item',
            name: currentState.itemDetails.name || 'Untitled Item',
            description: currentState.itemDetails.description || '',
            itemData: {
                itemType: currentState.itemDetails.type,
                rarity: currentState.itemDetails.rarity,
                value: currentState.itemDetails.value,
                weight: currentState.itemDetails.weight,
                properties: currentState.itemDetails.properties,
                damageFormula: currentState.itemDetails.damageFormula,
                damageType: currentState.itemDetails.damageType
            },
            tags: [currentState.itemDetails.type, currentState.itemDetails.rarity].filter(Boolean)
        };

        return await globalSession.saveAsGlobalObject(objectData);
    }, [currentState, globalSession]);

    const loadFromGlobalObject = useCallback(async (objectId: string) => {
        const object = await globalSession.loadGlobalObject(objectId);
        if (!object || !object.itemData) return;

        // Convert global object back to CardGenerator state
        const itemDetails: ItemDetails = {
            name: object.name,
            type: object.itemData.itemType,
            rarity: object.itemData.rarity || '',
            value: object.itemData.value || '',
            properties: object.itemData.properties || [],
            damageFormula: object.itemData.damageFormula || '',
            damageType: object.itemData.damageType || '',
            weight: object.itemData.weight || '',
            description: object.description,
            quote: '',
            sdPrompt: ''
        };

        await updateState({
            itemDetails,
            stepCompletion: {
                'text-generation': !!(itemDetails.name?.trim()),
                'core-image': false,
                'border-generation': false,
                'final-assembly': false
            },
            currentStepId: 'text-generation'
        });
    }, [globalSession, updateState]);

    // Legacy project support (for backward compatibility)
    const [currentProject, setCurrentProject] = React.useState<Project | null>(null);

    // Derived state
    const saveStatus = globalSession.isLoading ? 'saving' : 'saved';

    const contextValue: CardGeneratorContextType = {
        // Core State
        currentStepId: currentState.currentStepId,
        itemDetails: currentState.itemDetails,
        selectedFinalImage: currentState.selectedAssets.finalImage || '',
        selectedBorder: currentState.selectedAssets.border || '',
        selectedSeedImage: currentState.selectedAssets.seedImage || '',
        generatedCardImages: currentState.selectedAssets.generatedCardImages,
        selectedGeneratedCardImage: currentState.selectedAssets.selectedGeneratedCardImage || '',
        finalCardWithText: currentState.selectedAssets.finalCardWithText || '',
        generatedImages: (currentState.generatedContent.images || []).map(url => ({ url, id: Date.now().toString() })),
        renderedCards: (currentState.generatedContent.renderedCards || []).map(url => ({ url, id: Date.now().toString(), name: 'Card', timestamp: Date.now().toString() })),

        // Step Management
        stepCompletion: currentState.stepCompletion || {},
        canGoNext,
        canGoPrevious,
        nextStep,
        previousStep,
        goToStep,

        // State Updates
        updateItemDetails,
        setSelectedFinalImage,
        setSelectedBorder,
        setSelectedSeedImage,
        setGeneratedCardImages,
        setSelectedGeneratedCardImage,
        setFinalCardWithText,
        addGeneratedImage,
        addRenderedCard,

        // Global Session Integration
        saveAsGlobalObject,
        loadFromGlobalObject,

        // Cross-tool Features
        recentObjects: globalSession.recentObjects,
        clipboard: globalSession.clipboard,
        addToClipboard: globalSession.addToClipboard,

        // Session Management
        isLoading: globalSession.isLoading,
        saveStatus,
        error: globalSession.error,
        lastSaved: currentState.lastSaved || null,
        saveSession: globalSession.saveSession,

        // Legacy Project Support
        currentProject,
        setCurrentProject
    };

    return (
        <CardGeneratorContext.Provider value={contextValue}>
            {children}
        </CardGeneratorContext.Provider>
    );
};

// Hook to use CardGenerator context
export const useCardGenerator = (): CardGeneratorContextType => {
    const context = useContext(CardGeneratorContext);
    if (context === undefined) {
        throw new Error('useCardGenerator must be used within a CardGeneratorProvider');
    }
    return context;
}; 