// StatBlockGeneratorProvider.tsx - Context Provider for StatBlock Generator
// Following CardGeneratorProvider patterns adapted for StatBlock workflow

import React, { createContext, useContext, useCallback, useMemo, useState, useRef, useEffect } from 'react';
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
import { defaultStatblockDetails } from '../../fixtures/statblockTemplates';
import { MeasurementCoordinator } from '../../canvas/layout/measurement';
import { normalizeStatblock } from '../../utils/statblockNormalization';

// Context interface for StatBlockGenerator
export interface StatBlockGeneratorContextType {
    // Core State
    currentStepId: string;
    isCanvasPreviewReady: boolean;
    selectedTemplateId: string;
    isCanvasEditMode: boolean;
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

    // Phase 3: Generation flag to prevent auto-save race condition
    isGenerating: boolean;
    setIsGenerating: (isGenerating: boolean) => void;

    // Component Edit Lock System (Phase 1: Dynamic locking during editing)
    componentLocks: Set<string>;
    requestComponentLock: (componentId: string) => void;
    releaseComponentLock: (componentId: string) => void;
    isAnyComponentLocked: boolean;
    measurementCoordinator: MeasurementCoordinator;

    // State Updates
    updateCreatureDetails: (updates: Partial<StatBlockDetails>) => void;
    replaceCreatureDetails: (next: StatBlockDetails) => void;
    setSelectedTemplateId: (templateId: string) => void;
    setIsCanvasEditMode: (isEditMode: boolean) => void;
    setSelectedCreatureImage: (image: string, index?: number) => void;
    addGeneratedImage: (image: GeneratedImage) => void;
    addGenerated3DModel: (model: Generated3DModel) => void;
    addGeneratedExport: (exportItem: GeneratedExport) => void;
    loadDemoData: () => void;

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
    saveNow: () => Promise<void>; // Phase 3: Manual save function

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
    const { userId, isLoggedIn } = useAuth();

    // Phase 1: Create measurement coordinator (singleton per provider instance)
    const measurementCoordinator = useRef(new MeasurementCoordinator()).current;

    // Phase 3: Debounced save timer ref
    const debouncedSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Core state
    const [currentStepId, setCurrentStepId] = useState<string>('creature-description');
    const [stepCompletion, setStepCompletion] = useState<Record<string, boolean>>({});
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('demo-monster-template');
    const [isCanvasEditMode, setIsCanvasEditMode] = useState<boolean>(false);

    // DEBUG: Log when edit mode changes
    useEffect(() => {
        console.log('🔧 [Provider] isCanvasEditMode state changed to:', isCanvasEditMode);
    }, [isCanvasEditMode]);

    // Phase 3: Initialize state from localStorage (lazy initialization)
    // This runs ONCE on mount, before any effects
    const [creatureDetails, setCreatureDetails] = useState<StatBlockDetails>(() => {
        try {
            const saved = localStorage.getItem('statblockGenerator_state');
            if (saved) {
                const { creatureDetails: savedDetails, timestamp } = JSON.parse(saved);
                const ageMinutes = (Date.now() - timestamp) / 1000 / 60;

                // Only restore if recent (within last 24 hours)
                if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                    console.log(`🔄 [Provider] Lazy init: Restoring "${savedDetails.name}" (${ageMinutes.toFixed(1)}m old)`);
                    return normalizeStatblock(savedDetails);
                } else {
                    console.log('🔄 [Provider] Lazy init: Data too old, using template');
                }
            } else {
                console.log('🔄 [Provider] Lazy init: No saved data, using template');
            }
        } catch (err) {
            console.error('🔄 [Provider] Lazy init failed:', err);
        }

        // Fallback to default template
        return defaultStatblockDetails;
    });

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

    // Component edit lock system (Phase 1: Dynamic Component Locking)
    const [componentLocks, setComponentLocks] = useState<Set<string>>(new Set());
    const [isMeasurementInProgress, setIsMeasurementInProgress] = useState(false);

    // Phase 3: Flag to prevent auto-save during generation (fix race condition)
    const [isGenerating, setIsGenerating] = useState(false);

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

    const isAnyComponentLocked = useMemo(() =>
        componentLocks.size > 0 || isMeasurementInProgress,
        [componentLocks, isMeasurementInProgress]
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

    // Component lock management (Phase 1: Dynamic Component Locking)
    const requestComponentLock = useCallback((componentId: string) => {
        setComponentLocks(prev => {
            const next = new Set(prev);
            next.add(componentId);
            return next;
        });
        // Phase 1: Lock measurements for this component
        measurementCoordinator.lockComponent(componentId);
    }, [measurementCoordinator]);

    const releaseComponentLock = useCallback((componentId: string) => {
        setComponentLocks(prev => {
            const next = new Set(prev);
            next.delete(componentId);
            return next;
        });
        // Phase 1: Unlock measurements (will trigger deferred measurement if changed)
        measurementCoordinator.unlockComponent(componentId);
    }, [measurementCoordinator]);

    // State update functions
    const updateCreatureDetails = useCallback((updates: Partial<StatBlockDetails>) => {
        console.log('🔄 [Provider] updateCreatureDetails called with:', Object.keys(updates));
        setCreatureDetails(prev => {
            const next = { ...prev, ...updates };
            console.log('🔄 [Provider] New creature name:', next.name);
            return next;
        });
        // Auto-save will be triggered by useEffect watching creatureDetails
    }, []);

    const replaceCreatureDetails = useCallback((next: StatBlockDetails) => {
        console.log('🔄 [Provider] replaceCreatureDetails called with:', next.name);
        console.log('🔄 [Provider] New creature data:', {
            name: next.name,
            actions: next.actions?.map(a => a.name),
            bonusActions: next.bonusActions?.map(a => a.name),
            traits: next.specialAbilities?.map(a => a.name),
            legendary: next.legendaryActions?.actions?.map(a => a.name),
            lair: next.lairActions?.actions?.map(a => a.name),
            spells: next.spells?.knownSpells?.map(s => s.name)
        });

        // CRITICAL: Deep clone to ensure NO object references are shared with old state
        // This prevents React from thinking it's the same object and skipping re-renders
        const deepClone = JSON.parse(JSON.stringify(next));
        setCreatureDetails(deepClone);
        console.log('✅ [Provider] setCreatureDetails called with DEEP CLONED object');
        // Auto-save will be triggered by useEffect watching creatureDetails
    }, []);

    const loadDemoData = useCallback(() => {
        // Import demo data dynamically to avoid circular deps
        import('../../fixtures/statblockTemplates').then(({ defaultStatblockDetails }) => {
            replaceCreatureDetails(defaultStatblockDetails);
        });
    }, [replaceCreatureDetails]);

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

    // Phase 3: Manual "Save Now" function
    const saveNow = useCallback(async (): Promise<void> => {
        if (!isLoggedIn || !userId) {
            console.warn('💾 [Provider] Cannot save: User not logged in');
            setError('Please log in to save to cloud');
            return;
        }

        // Clear any pending debounced save
        if (debouncedSaveTimerRef.current) {
            clearTimeout(debouncedSaveTimerRef.current);
            debouncedSaveTimerRef.current = null;
        }

        setSaveStatus('saving');
        try {
            console.log('💾 [Provider] Manual save triggered');

            const response = await fetch(`${DUNGEONMIND_API_URL}/api/statblockgenerator/save-project`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    projectId: currentProject?.id,
                    statblock: creatureDetails,
                    userId: userId
                })
            });

            if (!response.ok) {
                throw new Error(`Save failed: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('💾 [Provider] Manual save successful:', result);

            // Update current project with server response
            if (result.projectId) {
                setCurrentProject({
                    id: result.projectId,
                    name: creatureDetails.name || 'Untitled Creature',
                    description: creatureDetails.description || '',
                    createdBy: userId,
                    createdAt: result.createdAt,
                    updatedAt: result.updatedAt,
                    lastModified: result.updatedAt,
                    state: {
                        currentStepId,
                        stepCompletion,
                        creatureDetails,
                        selectedAssets,
                        generatedContent,
                        autoSaveEnabled: true,
                        lastSaved: new Date().toISOString()
                    },
                    metadata: {
                        version: '1.0.0',
                        platform: 'web'
                    }
                });
            }

            setLastSaved(new Date().toISOString());
            setSaveStatus('saved');

            // Reset to idle after 2 seconds
            setTimeout(() => setSaveStatus('idle'), 2000);

        } catch (err) {
            console.error('💾 [Provider] Manual save failed:', err);
            setSaveStatus('error');
            setError(err instanceof Error ? err.message : 'Save failed');

            // Reset to idle after 5 seconds
            setTimeout(() => setSaveStatus('idle'), 5000);
        }
    }, [isLoggedIn, userId, currentProject?.id, creatureDetails, currentStepId, stepCompletion, selectedAssets, generatedContent]);

    // Session management functions (stubs - to be implemented)
    const saveSession = useCallback(async (): Promise<void> => {
        // Redirect to manual save
        await saveNow();
    }, [saveNow]);

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

    // ============================================================================
    // Phase 3: localStorage Auto-Save
    // ============================================================================
    // NOTE: Restore is handled in lazy state initialization above (lines 144-169)

    // Auto-save to localStorage on every change (immediate)
    useEffect(() => {
        // Skip auto-save during generation to prevent race condition
        if (isGenerating) {
            console.log('⏸️ [Provider] Skipping auto-save during generation');
            return;
        }

        try {
            console.log('💾 [Provider] localStorage save triggered - Creature:', creatureDetails.name);
            const stateSnapshot = {
                creatureDetails,
                currentProject: currentProject?.id,
                timestamp: Date.now()
            };
            const serialized = JSON.stringify(stateSnapshot);
            localStorage.setItem('statblockGenerator_state', serialized);
            console.log('💾 [Provider] ✅ Auto-saved to localStorage (' + (serialized.length / 1024).toFixed(2) + ' KB)');
        } catch (err) {
            console.error('💾 [Provider] ❌ Failed to save to localStorage:', err);
        }
    }, [creatureDetails, currentProject, isGenerating]);

    // Debounced save to Firestore (auth required, 2 second delay)
    useEffect(() => {
        // Skip auto-save during generation to prevent race condition
        if (isGenerating) {
            console.log('⏸️ [Provider] Skipping Firestore save during generation');
            return;
        }

        // Don't save to Firestore if not logged in
        if (!isLoggedIn || !userId) {
            console.log('💾 [Provider] Skipping Firestore save: not logged in');
            return;
        }

        // Don't save empty creatures
        if (!creatureDetails.name?.trim()) {
            console.log('💾 [Provider] Skipping Firestore save: no creature name');
            return;
        }

        // Clear existing timer
        if (debouncedSaveTimerRef.current) {
            clearTimeout(debouncedSaveTimerRef.current);
        }

        // Set up new debounced save (2 seconds)
        debouncedSaveTimerRef.current = setTimeout(async () => {
            setSaveStatus('saving');
            try {
                console.log('💾 [Provider] Debounced Firestore save triggered');

                // TODO: Call backend save endpoint (Phase 3, task 6)
                const response = await fetch(`${DUNGEONMIND_API_URL}/api/statblockgenerator/save-project`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        projectId: currentProject?.id,
                        statblock: creatureDetails,
                        userId: userId
                    })
                });

                if (!response.ok) {
                    throw new Error(`Save failed: ${response.statusText}`);
                }

                const result = await response.json();
                console.log('💾 [Provider] Firestore save successful:', result);

                // Update current project with server response
                if (result.projectId) {
                    setCurrentProject({
                        id: result.projectId,
                        name: creatureDetails.name || 'Untitled Creature',
                        description: creatureDetails.description || '',
                        createdBy: userId,
                        createdAt: result.createdAt,
                        updatedAt: result.updatedAt,
                        lastModified: result.updatedAt,
                        state: {
                            currentStepId,
                            stepCompletion,
                            creatureDetails,
                            selectedAssets,
                            generatedContent,
                            autoSaveEnabled: true,
                            lastSaved: new Date().toISOString()
                        },
                        metadata: {
                            version: '1.0.0',
                            platform: 'web'
                        }
                    });
                }

                setLastSaved(new Date().toISOString());
                setSaveStatus('saved');

                // Reset to idle after 2 seconds
                setTimeout(() => setSaveStatus('idle'), 2000);

            } catch (err) {
                console.error('💾 [Provider] Firestore save failed:', err);
                setSaveStatus('error');
                setError(err instanceof Error ? err.message : 'Save failed');

                // Reset to idle after 5 seconds
                setTimeout(() => setSaveStatus('idle'), 5000);
            }
        }, 2000);

        // Cleanup function
        return () => {
            if (debouncedSaveTimerRef.current) {
                clearTimeout(debouncedSaveTimerRef.current);
            }
        };
    }, [creatureDetails, currentProject?.id, isLoggedIn, userId, currentStepId, stepCompletion, selectedAssets, generatedContent, isGenerating]);

    // Context value
    const contextValue: StatBlockGeneratorContextType = {
        // Core State
        currentStepId,
        isCanvasPreviewReady,
        selectedTemplateId,
        isCanvasEditMode,
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

        // Phase 3: Generation flag to prevent auto-save race condition
        isGenerating,
        setIsGenerating,

        // Component Edit Lock System
        componentLocks,
        requestComponentLock,
        releaseComponentLock,
        isAnyComponentLocked,
        measurementCoordinator,

        // State Updates
        updateCreatureDetails,
        replaceCreatureDetails,
        setSelectedTemplateId,
        setIsCanvasEditMode,
        setSelectedCreatureImage,
        addGeneratedImage,
        addGenerated3DModel,
        addGeneratedExport,
        loadDemoData,

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
        saveNow, // Phase 3: Manual save function

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
