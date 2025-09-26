// StatBlockGeneratorProvider.tsx - Context Provider for StatBlock Generator
// Following CardGeneratorProvider patterns adapted for StatBlock workflow

import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DUNGEONMIND_API_URL } from '../../config';
import {
    StatBlockDetails,
    GeneratedImage,
    Generated3DModel,
    GeneratedExport,
    StatBlockProject,
    StatBlockProjectSummary,
    createInitialStatBlockDetails,
    ValidationResult,
    CRCalculationResult
} from '../../types/statblock.types';

// Context interface for StatBlockGenerator
export interface StatBlockGeneratorContextType {
    // Core State
    currentStepId: string;
    isCanvasPreviewReady: boolean;
    creatureDetails: StatBlockDetails;
    selectedAssets: {
        creatureImage?: string;
        selectedImageIndex?: number;
        generatedImages: string[];
        modelFile?: string;
    };
    generatedContent: {
        images: GeneratedImage[];
        models: Generated3DModel[];
        exports: GeneratedExport[];
    };

    // Step Management
    stepCompletion: Record<string, boolean>;
    canGoNext: () => boolean;
    canGoPrevious: () => boolean;
    nextStep: () => void;
    previousStep: () => void;
    goToStep: (stepId: string) => void;

    // Generation Lock System (prevent navigation during async operations)
    generationLocks: {
        creatureGeneration: boolean;
        imageGeneration: boolean;
        modelGeneration: boolean;
        exportGeneration: boolean;
    };
    setGenerationLock: (lockType: keyof StatBlockGeneratorContextType['generationLocks'], isLocked: boolean) => void;
    isAnyGenerationInProgress: boolean;

    // State Updates
    updateCreatureDetails: (updates: Partial<StatBlockDetails>) => void;
    replaceCreatureDetails: (next: StatBlockDetails) => void;
    setSelectedCreatureImage: (image: string, index?: number) => void;
    addGeneratedImage: (image: GeneratedImage) => void;
    addGenerated3DModel: (model: Generated3DModel) => void;
    addGeneratedExport: (exportItem: GeneratedExport) => void;

    // Validation & CR Calculation
    validateStatBlock: () => Promise<ValidationResult>;
    calculateCR: () => Promise<CRCalculationResult>;
    validationResult: ValidationResult | null;
    crCalculationResult: CRCalculationResult | null;

    // Project Management
    currentProject: StatBlockProject | null;
    setCurrentProject: (project: StatBlockProject | null) => void;
    createProject: (name: string, description?: string) => Promise<string>;
    saveProject: () => Promise<void>;
    loadProject: (projectId: string) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    listProjects: () => Promise<StatBlockProjectSummary[]>;

    // Session Management
    isLoading: boolean;
    saveStatus: 'idle' | 'saving' | 'saved' | 'error';
    error: string | null;
    lastSaved: string | null;
    autoSaveEnabled: boolean;
    saveSession: () => Promise<void>;
    loadSession: () => Promise<void>;

    // Export Functions
    exportAsHTML: () => Promise<string>;
    exportAsPDF: () => Promise<Blob>;
    exportAsJSON: () => string;
}

const StatBlockGeneratorContext = createContext<StatBlockGeneratorContextType | undefined>(undefined);

// Step definitions for 5-step workflow
const STEPS = [
    { id: 'creature-description', label: 'Creature Description', order: 1 },
    { id: 'creature-image', label: 'Creature Image', order: 2 },
    { id: 'statblock-customization', label: 'Statblock Customization', order: 3 },
    { id: 'model-generation', label: '3D Model Generation', order: 4 },
    { id: 'export-finalization', label: 'Export & Finalization', order: 5 }
];

interface StatBlockGeneratorProviderProps {
    children: React.ReactNode;
}

export const StatBlockGeneratorProvider: React.FC<StatBlockGeneratorProviderProps> = ({ children }) => {
    useAuth(); // Will use this later for user-specific functionality

    // Core state
    const [currentStepId, setCurrentStepId] = useState<string>('creature-description');
    const [stepCompletion, setStepCompletion] = useState<Record<string, boolean>>({});
    const [creatureDetails, setCreatureDetails] = useState<StatBlockDetails>(createInitialStatBlockDetails());

    // Assets and generated content
    const [selectedAssets, setSelectedAssets] = useState({
        creatureImage: undefined as string | undefined,
        selectedImageIndex: undefined as number | undefined,
        generatedImages: [] as string[],
        modelFile: undefined as string | undefined,
    });

    const [generatedContent, setGeneratedContent] = useState({
        images: [] as GeneratedImage[],
        models: [] as Generated3DModel[],
        exports: [] as GeneratedExport[],
    });

    // Generation lock system
    const [generationLocks, setGenerationLocksState] = useState({
        creatureGeneration: false,
        imageGeneration: false,
        modelGeneration: false,
        exportGeneration: false,
    });

    // Validation and CR calculation state
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [crCalculationResult, setCRCalculationResult] = useState<CRCalculationResult | null>(null);

    // Project and session management
    const [currentProject, setCurrentProject] = useState<StatBlockProject | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [autoSaveEnabled] = useState(true);

    // Computed values
    const isAnyGenerationInProgress = useMemo(() =>
        Object.values(generationLocks).some(lock => lock),
        [generationLocks]
    );

    const isCanvasPreviewReady = useMemo(() => {
        return ['creature-description', 'statblock-customization', 'export-finalization'].includes(currentStepId);
    }, [currentStepId]);

    // Step navigation logic
    const canGoNext = useCallback(() => {
        if (isAnyGenerationInProgress) return false;

        const currentStep = STEPS.find(step => step.id === currentStepId);
        if (!currentStep || currentStep.order >= STEPS.length) return false;

        // Add step-specific validation logic here
        return true;
    }, [currentStepId, isAnyGenerationInProgress]);

    const canGoPrevious = useCallback(() => {
        if (isAnyGenerationInProgress) return false;

        const currentStep = STEPS.find(step => step.id === currentStepId);
        return currentStep ? currentStep.order > 1 : false;
    }, [currentStepId, isAnyGenerationInProgress]);

    const nextStep = useCallback(() => {
        if (!canGoNext()) return;

        const currentStep = STEPS.find(step => step.id === currentStepId);
        if (currentStep && currentStep.order < STEPS.length) {
            const nextStepData = STEPS.find(step => step.order === currentStep.order + 1);
            if (nextStepData) {
                setCurrentStepId(nextStepData.id);
                setStepCompletion(prev => ({ ...prev, [currentStepId]: true }));
            }
        }
    }, [currentStepId, canGoNext]);

    const previousStep = useCallback(() => {
        if (!canGoPrevious()) return;

        const currentStep = STEPS.find(step => step.id === currentStepId);
        if (currentStep && currentStep.order > 1) {
            const prevStepData = STEPS.find(step => step.order === currentStep.order - 1);
            if (prevStepData) {
                setCurrentStepId(prevStepData.id);
            }
        }
    }, [currentStepId, canGoPrevious]);

    const goToStep = useCallback((stepId: string) => {
        if (isAnyGenerationInProgress) return;

        const targetStep = STEPS.find(step => step.id === stepId);
        if (targetStep) {
            setCurrentStepId(stepId);
        }
    }, [isAnyGenerationInProgress]);

    // Generation lock management
    const setGenerationLock = useCallback((lockType: keyof typeof generationLocks, isLocked: boolean) => {
        setGenerationLocksState(prev => ({
            ...prev,
            [lockType]: isLocked
        }));
    }, []);

    // State update functions
    const updateCreatureDetails = useCallback((updates: Partial<StatBlockDetails>) => {
        setCreatureDetails(prev => ({ ...prev, ...updates }));
        if (autoSaveEnabled) {
            // Debounced save will be implemented here
        }
    }, [autoSaveEnabled]);

    const replaceCreatureDetails = useCallback((next: StatBlockDetails) => {
        setCreatureDetails(next);
        // Trigger auto-save if enabled
        if (autoSaveEnabled) {
            // Debounced save will be implemented here
        }
    }, [autoSaveEnabled]);

    const setSelectedCreatureImage = useCallback((image: string, index?: number) => {
        setSelectedAssets(prev => ({
            ...prev,
            creatureImage: image,
            selectedImageIndex: index
        }));
    }, []);

    const addGeneratedImage = useCallback((image: GeneratedImage) => {
        setGeneratedContent(prev => ({
            ...prev,
            images: [...prev.images, image]
        }));
        setSelectedAssets(prev => ({
            ...prev,
            generatedImages: [...prev.generatedImages, image.url]
        }));
    }, []);

    const addGenerated3DModel = useCallback((model: Generated3DModel) => {
        setGeneratedContent(prev => ({
            ...prev,
            models: [...prev.models, model]
        }));
    }, []);

    const addGeneratedExport = useCallback((exportItem: GeneratedExport) => {
        setGeneratedContent(prev => ({
            ...prev,
            exports: [...prev.exports, exportItem]
        }));
    }, []);

    // API functions (to be implemented)
    const validateStatBlock = useCallback(async (): Promise<ValidationResult> => {
        setIsLoading(true);
        try {
            // TODO: Implement API call to backend validation endpoint
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/statblockgenerator/validate-statblock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include session cookies for authentication
                body: JSON.stringify(creatureDetails)
            });
            const result = await response.json();
            setValidationResult(result);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Validation failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [creatureDetails]);

    const calculateCR = useCallback(async (): Promise<CRCalculationResult> => {
        setIsLoading(true);
        try {
            // TODO: Implement API call to backend CR calculation endpoint
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/statblockgenerator/calculate-cr`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include session cookies for authentication
                body: JSON.stringify(creatureDetails)
            });
            const result = await response.json();
            setCRCalculationResult(result);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'CR calculation failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [creatureDetails]);

    // Project management functions (stubs - to be implemented)
    const createProject = useCallback(async (name: string, description?: string): Promise<string> => {
        // TODO: Implement project creation
        return 'project-id';
    }, []);

    const saveProject = useCallback(async (): Promise<void> => {
        // TODO: Implement project saving
    }, []);

    const loadProject = useCallback(async (projectId: string): Promise<void> => {
        // TODO: Implement project loading
    }, []);

    const deleteProject = useCallback(async (projectId: string): Promise<void> => {
        // TODO: Implement project deletion
    }, []);

    const listProjects = useCallback(async (): Promise<StatBlockProjectSummary[]> => {
        // TODO: Implement project listing
        return [];
    }, []);

    // Session management functions (stubs - to be implemented)
    const saveSession = useCallback(async (): Promise<void> => {
        setSaveStatus('saving');
        try {
            // TODO: Implement session saving
            setSaveStatus('saved');
            setLastSaved(new Date().toISOString());
        } catch (err) {
            setSaveStatus('error');
            setError(err instanceof Error ? err.message : 'Save failed');
        }
    }, []);

    const loadSession = useCallback(async (): Promise<void> => {
        // TODO: Implement session loading
    }, []);

    // Export functions (stubs - to be implemented)
    const exportAsHTML = useCallback(async (): Promise<string> => {
        // TODO: Implement HTML export
        return '<html></html>';
    }, []);

    const exportAsPDF = useCallback(async (): Promise<Blob> => {
        // TODO: Implement PDF export
        return new Blob();
    }, []);

    const exportAsJSON = useCallback((): string => {
        return JSON.stringify(creatureDetails, null, 2);
    }, [creatureDetails]);

    // Context value
    const contextValue: StatBlockGeneratorContextType = {
        // Core State
        currentStepId,
        isCanvasPreviewReady,
        creatureDetails,
        selectedAssets,
        generatedContent,

        // Step Management
        stepCompletion,
        canGoNext,
        canGoPrevious,
        nextStep,
        previousStep,
        goToStep,

        // Generation Lock System
        generationLocks,
        setGenerationLock,
        isAnyGenerationInProgress,

        // State Updates
        updateCreatureDetails,
        replaceCreatureDetails,
        setSelectedCreatureImage,
        addGeneratedImage,
        addGenerated3DModel,
        addGeneratedExport,

        // Validation & CR Calculation
        validateStatBlock,
        calculateCR,
        validationResult,
        crCalculationResult,

        // Project Management
        currentProject,
        setCurrentProject,
        createProject,
        saveProject,
        loadProject,
        deleteProject,
        listProjects,

        // Session Management
        isLoading,
        saveStatus,
        error,
        lastSaved,
        autoSaveEnabled,
        saveSession,
        loadSession,

        // Export Functions
        exportAsHTML,
        exportAsPDF,
        exportAsJSON,
    };

    return (
        <StatBlockGeneratorContext.Provider value={contextValue}>
            {children}
        </StatBlockGeneratorContext.Provider>
    );
};

// Custom hook to use the StatBlockGenerator context
export const useStatBlockGenerator = (): StatBlockGeneratorContextType => {
    const context = useContext(StatBlockGeneratorContext);
    if (context === undefined) {
        throw new Error('useStatBlockGenerator must be used within a StatBlockGeneratorProvider');
    }
    return context;
};

export default StatBlockGeneratorProvider;
