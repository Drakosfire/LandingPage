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
import { MeasurementCoordinator } from 'dungeonmind-canvas';
import { normalizeStatblock, createDefaultStatblock } from '../../utils/statblockNormalization';
import { getRandomDemo, findDemo, EMPTY_STATBLOCK } from '../../fixtures/demoStatblocks';
import { tutorialCookies } from '../../utils/tutorialCookies';
import { GenerateWithProjectGuard } from './GenerateWithProjectGuard';

// Context interface for StatBlockGenerator (Phase 5: Step navigation removed)
export interface StatBlockGeneratorContextType {
    // Core State
    isCanvasPreviewReady: boolean;
    selectedTemplateId: string;
    isCanvasEditMode: boolean;
    isDemo: boolean;  // Flag indicating if current statblock is a demo
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
    imagePrompt: string;  // Persistent image generation prompt
    imageStyle: string;   // Selected image style
    imageModel: string;   // Selected AI model

    // Generation Drawer Control
    generationDrawerState: {
        opened: boolean;
        initialTab?: 'text' | 'image';
        initialPrompt?: string;
        isTutorialMode?: boolean;
    };
    openGenerationDrawer: (options?: { tab?: 'text' | 'image'; prompt?: string; isTutorialMode?: boolean }) => void;
    closeGenerationDrawer: () => void;

    // Generation Lock System (prevent concurrent async operations)
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
    checkBeforeGenerate: () => Promise<'proceed' | 'create-new' | 'cancel'>;  // Guard against overwriting saved projects
    setSelectedTemplateId: (templateId: string) => void;
    setIsCanvasEditMode: (isEditMode: boolean) => void;
    setSelectedCreatureImage: (image: string, index?: number) => void;
    addGeneratedImage: (image: GeneratedImage) => void;
    removeGeneratedImage: (imageId: string) => Promise<void>;
    clearTutorialImages: () => void;  // Clear tutorial images when tutorial completes
    addGenerated3DModel: (model: Generated3DModel) => void;
    addGeneratedExport: (exportItem: GeneratedExport) => void;
    setImagePrompt: (prompt: string) => void;  // Update image prompt
    setImageStyle: (style: string) => void;    // Update image style
    setImageModel: (model: string) => void;    // Update AI model
    loadDemoData: (demoName?: string) => void;

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

interface StatBlockGeneratorProviderProps {
    children: React.ReactNode;
}

export const StatBlockGeneratorProvider: React.FC<StatBlockGeneratorProviderProps> = ({ children }) => {
    const { userId, isLoggedIn } = useAuth();

    // DEBUG: Instance tracking
    const instanceIdRef = useRef(`Provider-${Math.random().toString(36).substr(2, 9)}`);
    const instanceId = instanceIdRef.current;

    // Phase 1: Create measurement coordinator (singleton per provider instance)
    const measurementCoordinator = useRef(new MeasurementCoordinator()).current;

    // Phase 3: Debounced save timer ref
    const debouncedSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Core state (step navigation removed in Phase 5)
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('demo-monster-template');
    const [isCanvasEditMode, setIsCanvasEditMode] = useState<boolean>(false);
    const [isDemo, setIsDemo] = useState<boolean>(false);

    // DEBUG: Log when edit mode changes
    useEffect(() => {
        console.log('🔧 [Provider] isCanvasEditMode state changed to:', isCanvasEditMode);
    }, [isCanvasEditMode]);

    // DEBUG: Lifecycle tracking
    useEffect(() => {
        console.log(`🟢 [${instanceId}] MOUNTED at ${new Date().toISOString()}`);
        console.trace(`🔍 [${instanceId}] Mount stack trace`);

        return () => {
            console.log(`🔴 [${instanceId}] UNMOUNTED at ${new Date().toISOString()}`);
            // Cleanup timers
            if (debouncedSaveTimerRef.current) {
                clearTimeout(debouncedSaveTimerRef.current);
                debouncedSaveTimerRef.current = null;
            }
        };
    }, [instanceId]);

    // Ref to hold latest state for beforeunload handler (prevents state loss on OAuth redirect)
    const latestStateRef = useRef<{
        creatureDetails: StatBlockDetails;
        selectedAssets: StatBlockGeneratorContextType['selectedAssets'];
        generatedContent: StatBlockGeneratorContextType['generatedContent'];
        imagePrompt: string;
        imageStyle: string;
        imageModel: string;
        currentProjectId: string | null;
        isGenerating: boolean;
    } | null>(null);

    // NOTE: latestStateRef gets updated in useEffect after state declarations (search for "UPDATE latestStateRef")

    // Auto-load demo if no saved data exists
    useEffect(() => {
        // Only run once on mount
        const hasInitialState = initialState !== null;
        const hasTutorialCompleted = tutorialCookies.hasCompletedTutorial();

        if (!hasInitialState) {
            // For first-time users (tutorial not completed), don't load a demo
            // Let the tutorial control what loads on the canvas
            if (!hasTutorialCompleted) {
                console.log('🎓 [Provider] First-time user - starting with empty canvas for tutorial');
                // Already initialized with empty/demo statblock, no action needed
            } else {
                console.log('🎲 [Provider] No saved state found - loading random demo');
                loadDemoData();
            }
        } else {
            console.log('🎲 [Provider] Saved state found - skipping demo load');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    // Phase 3: Initialize state from localStorage (lazy initialization)
    // This runs ONCE on mount, before any effects
    type InitialStateType = {
        creatureDetails: StatBlockDetails;
        generatedContent: {
            images: GeneratedImage[];
            models: Generated3DModel[];
            exports: GeneratedExport[];
        };
        selectedAssets: {
            creatureImage?: string;
            selectedImageIndex?: number;
            generatedImages: string[];
            modelFile?: string;
        };
        currentProject: string | null;
        imagePrompt: string;
        imageStyle: string;
        imageModel: string;
    } | null;

    const getInitialStateFromLocalStorage = (): InitialStateType => {
        // CRITICAL: Don't restore saved state for first-time users
        // This ensures tutorial starts with a blank canvas
        const hasTutorialCompleted = tutorialCookies.hasCompletedTutorial();
        if (!hasTutorialCompleted) {
            console.log('🎓 [Provider] Tutorial not completed - skipping localStorage restore, will start with empty canvas');
            return null;
        }

        try {
            const saved = localStorage.getItem('statblockGenerator_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                const ageMinutes = (Date.now() - parsed.timestamp) / 1000 / 60;

                // Only restore if recent (within last 24 hours)
                if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                    console.log(`🔄 [Provider] Lazy init: Restoring "${parsed.creatureDetails?.name}" (${ageMinutes.toFixed(1)}m old)`);
                    console.log(`🔄 [Provider] Restored ${parsed.generatedContent?.images?.length || 0} images from localStorage`);

                    // Fallback to creature's sdPrompt if no imagePrompt was saved
                    const normalizedCreature = normalizeStatblock(parsed.creatureDetails);
                    const restoredPrompt = parsed.imagePrompt || normalizedCreature.sdPrompt || '';

                    console.log(`📝 [Provider] Restored image prompt: ${restoredPrompt ? restoredPrompt.substring(0, 50) + '...' : '(empty)'}`);

                    return {
                        creatureDetails: normalizedCreature,
                        generatedContent: parsed.generatedContent || { images: [], models: [], exports: [] },
                        selectedAssets: parsed.selectedAssets || { creatureImage: undefined, selectedImageIndex: undefined, generatedImages: [], modelFile: undefined },
                        currentProject: parsed.currentProject,
                        imagePrompt: restoredPrompt,
                        imageStyle: parsed.imageStyle || 'classic_dnd',
                        imageModel: parsed.imageModel || 'flux-pro'
                    };
                } else {
                    console.log('🔄 [Provider] Lazy init: Data too old, will load demo');
                }
            } else {
                console.log('🔄 [Provider] Lazy init: No saved data, will load demo');
            }
        } catch (err) {
            console.error('🔄 [Provider] Lazy init failed:', err);
        }
        return null;
    };

    // CRITICAL FIX: Use ref to ensure getInitialStateFromLocalStorage only runs ONCE
    // Previously this was called outside useState, causing it to run on EVERY RENDER
    const initialStateRef = useRef<ReturnType<typeof getInitialStateFromLocalStorage> | undefined>(undefined);
    if (initialStateRef.current === undefined) {
        initialStateRef.current = getInitialStateFromLocalStorage();
    }
    const initialState = initialStateRef.current;

    const [creatureDetails, setCreatureDetails] = useState<StatBlockDetails>(() => {
        if (initialState?.creatureDetails) {
            return initialState.creatureDetails;
        }

        // For first-time users (tutorial not completed), start with empty canvas
        // For returning users, load a random demo
        const hasTutorialCompleted = tutorialCookies.hasCompletedTutorial();
        if (!hasTutorialCompleted) {
            console.log('🎓 [Provider] Initializing with empty canvas for first-time user');
            return EMPTY_STATBLOCK;
        }

        // Fallback to random demo (will be loaded in useEffect for returning users)
        return getRandomDemo();
    });

    // Assets and generated content
    const [selectedAssets, setSelectedAssets] = useState(() => {
        if (initialState?.selectedAssets) {
            return initialState.selectedAssets;
        }
        return {
            creatureImage: undefined as string | undefined,
            selectedImageIndex: undefined as number | undefined,
            generatedImages: [] as string[],
            modelFile: undefined as string | undefined,
        };
    });

    const [generatedContent, setGeneratedContent] = useState(() => {
        if (initialState?.generatedContent) {
            return initialState.generatedContent;
        }
        return {
            images: [] as GeneratedImage[],
            models: [] as Generated3DModel[],
            exports: [] as GeneratedExport[],
        };
    });

    // Image generation settings (persistent across sessions)
    const [imagePrompt, setImagePrompt] = useState<string>(() => {
        if (initialState?.imagePrompt) {
            return initialState.imagePrompt;
        }
        return '';
    });

    const [imageStyle, setImageStyle] = useState<string>(() => {
        if (initialState?.imageStyle) {
            return initialState.imageStyle;
        }
        return 'classic_dnd'; // Default style
    });

    const [imageModel, setImageModel] = useState<string>(() => {
        if (initialState?.imageModel) {
            return initialState.imageModel;
        }
        return 'flux-pro'; // Default model
    });

    // Generation Drawer Control
    const [generationDrawerState, setGenerationDrawerState] = useState<{
        opened: boolean;
        initialTab?: 'text' | 'image';
        initialPrompt?: string;
        isTutorialMode?: boolean;
    }>({
        opened: false,
        initialTab: 'text',
        initialPrompt: '',
        isTutorialMode: false
    });

    const openGenerationDrawer = useCallback((options?: { tab?: 'text' | 'image'; prompt?: string; isTutorialMode?: boolean }) => {
        setGenerationDrawerState({
            opened: true,
            initialTab: options?.tab || 'text',
            initialPrompt: options?.prompt || '',
            isTutorialMode: options?.isTutorialMode || false
        });
    }, []);

    const closeGenerationDrawer = useCallback(() => {
        setGenerationDrawerState(prev => ({ ...prev, opened: false }));
    }, []);

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

    // Phase 4: Flag to prevent auto-save after deletion (prevents unwanted project creation)
    const skipAutoSaveRef = useRef(false);

    // Phase 4: Track last saved content to prevent duplicate saves
    const lastSavedContentHashRef = useRef<string>('');

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

    // Guard modal for preventing accidental overwrites
    const [guardModalOpen, setGuardModalOpen] = useState(false);
    const guardResolveRef = useRef<((result: 'proceed' | 'create-new' | 'cancel') => void) | null>(null);

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
        // Canvas is always ready in single-page mode (Phase 5)
        return true;
    }, []);

    // Phase 4: Initialize content hash on mount to prevent duplicate save after page load
    // This runs once after initial render to set hash matching restored/initial content
    useEffect(() => {
        // Get project ID from localStorage if it was restored
        let restoredProjectId: string | undefined;
        try {
            const saved = localStorage.getItem('statblockGenerator_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                restoredProjectId = parsed.currentProject;
            }
        } catch (err) {
            // Ignore errors
        }

        // Set initial hash to match current state (prevents first auto-save on mount)
        const initialHash = JSON.stringify({
            projectId: restoredProjectId,
            name: creatureDetails.name,
            type: creatureDetails.type,
            actions: creatureDetails.actions?.length,
            traits: creatureDetails.specialAbilities?.length,
            challengeRating: creatureDetails.challengeRating,
            hp: creatureDetails.hitPoints
        });
        lastSavedContentHashRef.current = initialHash;
        console.log('🔒 [Provider] Initial content hash set on mount for:', creatureDetails.name);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    // Note: Empty deps array is intentional - this should only run once on mount
    // We access creatureDetails in the initial state, which is fine

    // Step navigation logic removed in Phase 5 (single-page drawer architecture)

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

    // Guard check before generation - prevents accidental overwrite of saved projects
    const checkBeforeGenerate = useCallback((): Promise<'proceed' | 'create-new' | 'cancel'> => {
        return new Promise((resolve) => {
            // If no saved project is loaded, proceed immediately
            if (!currentProject?.id) {
                console.log('✅ [Guard] No saved project, proceeding with generation');
                resolve('proceed');
                return;
            }

            // Saved project exists - show guard modal
            console.log('⚠️ [Guard] Saved project detected:', currentProject.name, '- showing guard modal');
            guardResolveRef.current = resolve;
            setGuardModalOpen(true);
        });
    }, [currentProject]);

    const handleGuardCreateNew = useCallback(async () => {
        console.log('📁 [Guard] User chose: Create New Project');
        setGuardModalOpen(false);

        // Clear current project (will trigger new project creation on save)
        setCurrentProject(null);

        guardResolveRef.current?.('create-new');
        guardResolveRef.current = null;
    }, []);

    const handleGuardOverwrite = useCallback(() => {
        console.log('⚠️ [Guard] User chose: Overwrite Current Project');
        setGuardModalOpen(false);

        guardResolveRef.current?.('proceed');
        guardResolveRef.current = null;
    }, []);

    const handleGuardCancel = useCallback(() => {
        console.log('❌ [Guard] User cancelled generation');
        setGuardModalOpen(false);

        guardResolveRef.current?.('cancel');
        guardResolveRef.current = null;
    }, []);

    const loadDemoData = useCallback((demoName?: string) => {
        console.log('🎲 [Provider] Loading demo statblock...', demoName ? `(specific: ${demoName})` : '(random)');

        // Get specific demo by name, or random if not specified
        let demoStatblock: StatBlockDetails;
        if (demoName) {
            const specific = findDemo(demoName);
            if (specific) {
                demoStatblock = specific;
                console.log(`🎯 [Provider] Found demo: "${specific.name}"`);
            } else {
                console.warn(`⚠️ [Provider] Demo "${demoName}" not found, using random`);
                demoStatblock = getRandomDemo();
            }
        } else {
            demoStatblock = getRandomDemo();
        }

        console.log(`🎲 [Provider] Selected demo: "${demoStatblock.name}"`);

        // CRITICAL: Clear ALL state when loading demo (prevents mixing with previous data)
        replaceCreatureDetails(demoStatblock);
        setSelectedAssets({
            creatureImage: undefined,
            selectedImageIndex: undefined,
            generatedImages: [],
            modelFile: undefined
        });
        setGeneratedContent({
            images: [],
            models: [],
            exports: []
        });

        // Extract image prompt from demo statblock
        if (demoStatblock.sdPrompt) {
            console.log('🎲 [Provider] Setting image prompt from demo:', demoStatblock.sdPrompt);
            setImagePrompt(demoStatblock.sdPrompt);
        } else {
            setImagePrompt('');
        }
        setIsDemo(true);  // Mark as demo
        setCurrentProject(null);  // Clear current project

        console.log('✅ [Provider] Demo loaded successfully');
    }, [replaceCreatureDetails]);

    useEffect(() => {
        if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') {
            return;
        }

        const debugApi = {
            loadDemoData,
            markTutorialCompleted: () => tutorialCookies.markTutorialCompleted(),
            resetTutorial: () => tutorialCookies.resetTutorial(),
            getState: () => ({
                creatureName: creatureDetails.name,
                isDemo,
                currentProjectId: currentProject?.id ?? null,
            }),
            // Measurement accuracy diagnostic tools
            checkOverflow: (componentId: string) => {
                const element = document.querySelector(`[data-entry-id="${componentId}"]`);
                if (!element) {
                    console.error('❌ Component not found:', componentId);
                    return null;
                }

                // Get scale from CSS variable (visible canvas scale)
                const container = document.querySelector('.dm-canvas-responsive');
                const scale = container ? parseFloat(getComputedStyle(container).getPropertyValue('--dm-page-scale') || '1') : 1;

                const rect = element.getBoundingClientRect();
                const column = element.closest('.canvas-column');
                const columnRect = column ? column.getBoundingClientRect() : null;

                const spanTop = parseFloat(element.getAttribute('data-span-top') || '0');
                const spanBottom = parseFloat(element.getAttribute('data-span-bottom') || '0');
                const measuredHeight = spanBottom - spanTop;
                const visualHeightScaled = rect.height;
                const visualHeightUnscaled = visualHeightScaled / scale; // Convert back to base dimensions
                const heightDiff = visualHeightUnscaled - measuredHeight;

                const overflowAmount = columnRect ? (rect.bottom - columnRect.bottom) : 0;

                console.log('═══════════════════════════════════════');
                console.log('📊 OVERFLOW CHECK:', componentId);
                console.log('═══════════════════════════════════════');
                console.log('Scale factor:', scale.toFixed(3) + 'x');
                console.log('Measured (base):', measuredHeight.toFixed(2) + 'px');
                console.log('Visual (scaled):', visualHeightScaled.toFixed(2) + 'px');
                console.log('Visual (unscaled):', visualHeightUnscaled.toFixed(2) + 'px');
                console.log('Gap (unscaled):', heightDiff.toFixed(2) + 'px (' + (measuredHeight > 0 ? (heightDiff / measuredHeight * 100).toFixed(1) : '0') + '%)');
                console.log('');
                if (overflowAmount > 5) {
                    console.log('❌ VISUAL OVERFLOW:', overflowAmount.toFixed(2) + 'px');
                } else {
                    console.log('✅ No visual overflow');
                }
                console.log('═══════════════════════════════════════');

                return { measuredHeight, visualHeightScaled, visualHeightUnscaled, heightDiff, overflowAmount, scale };
            },

            validateAllMeasurements: () => {
                const entries = Array.from(document.querySelectorAll('[data-entry-id]'));

                // Get scale from CSS variable (visible canvas scale)
                const container = document.querySelector('.dm-canvas-responsive');
                const scale = container ? parseFloat(getComputedStyle(container).getPropertyValue('--dm-page-scale') || '1') : 1;

                console.log('═══════════════════════════════════════');
                console.log('📊 ALL COMPONENTS MEASUREMENT VALIDATION');
                console.log('═══════════════════════════════════════');
                console.log('Scale factor:', scale.toFixed(3) + 'x');
                console.log('Checking', entries.length, 'components...');
                console.log('');

                const results = entries.map(el => {
                    const id = el.getAttribute('data-entry-id');
                    const rect = el.getBoundingClientRect();
                    const spanTop = parseFloat(el.getAttribute('data-span-top') || '0');
                    const spanBottom = parseFloat(el.getAttribute('data-span-bottom') || '0');
                    const measuredHeight = spanBottom - spanTop;
                    const visualHeightScaled = rect.height;
                    const visualHeightUnscaled = visualHeightScaled / scale; // Convert back to base dimensions
                    const gap = visualHeightUnscaled - measuredHeight;
                    const gapPercent = measuredHeight > 0 ? (gap / measuredHeight * 100) : 0;

                    return {
                        id,
                        measured: measuredHeight.toFixed(2),
                        visualScaled: visualHeightScaled.toFixed(2),
                        visualUnscaled: visualHeightUnscaled.toFixed(2),
                        gap: gap.toFixed(2),
                        gapPercent: gapPercent.toFixed(1) + '%',
                        problem: Math.abs(gap) > 2 ? '❌' : '✅', // 2px tolerance after accounting for scale
                    };
                }).filter(r => parseFloat(r.measured) > 0); // Skip zero-height metadata

                console.table(results);

                const problems = results.filter(r => r.problem === '❌');

                console.log('');
                console.log('📊 SUMMARY:');
                console.log('   Scale factor:', scale.toFixed(3) + 'x');
                console.log('   Total components:', results.length);
                console.log('   With measurement gaps > 2px (after scale correction):', problems.length);
                console.log('');

                if (problems.length > 0) {
                    console.log('⚠️ COMPONENTS WITH MEASUREMENT ISSUES:');
                    problems.forEach(p => {
                        console.log('   ' + p.id + ': measured ' + p.measured + 'px, visual (unscaled) ' + p.visualUnscaled + 'px (gap: ' + p.gap + 'px)');
                    });
                } else {
                    console.log('✅ All components measure accurately (after accounting for scale)!');
                }

                console.log('═══════════════════════════════════════');

                return { results, scale };
            },

            inspectScale: (componentId: string = 'component-5') => {
                const element = document.querySelector(`[data-entry-id="${componentId}"]`);
                if (!element) {
                    console.error('❌ Component not found:', componentId);
                    return null;
                }

                // Walk up parent chain checking for transforms
                let current: Element | null = element;
                const transforms: Array<{ depth: number; element: string; transform: string; scale: string }> = [];
                let depth = 0;

                while (current && depth < 10) {
                    const computed = window.getComputedStyle(current);
                    const transform = computed.transform;
                    const scale = computed.scale;

                    if (transform !== 'none' || scale !== 'none') {
                        transforms.push({
                            depth,
                            element: current.tagName + '.' + (current.className ? current.className.split(' ')[0] : ''),
                            transform,
                            scale,
                        });
                    }

                    current = current.parentElement;
                    depth++;
                }

                // Check container scale
                const container = document.querySelector('.dm-canvas-responsive');
                const containerStyle = container ? window.getComputedStyle(container) : null;
                const pageScale = containerStyle ? containerStyle.getPropertyValue('--dm-page-scale') : null;

                console.log('═══════════════════════════════════════');
                console.log('🔍 SCALE/TRANSFORM INSPECTION');
                console.log('═══════════════════════════════════════');
                console.log('');
                console.log('Page scale variable:', pageScale || 'not set');
                console.log('');
                console.log('Transforms found:', transforms.length);
                if (transforms.length > 0) {
                    console.table(transforms);
                } else {
                    console.log('   None');
                }
                console.log('═══════════════════════════════════════');

                return { pageScale, transforms };
            },

            compareCSS: (componentId: string) => {
                // Try both formats: component-5 and component-05
                const normalizedId = componentId.replace(/^component-(\d+)$/, (_, n) => `component-${parseInt(n, 10)}`);
                const normalizedIdPadded = componentId.replace(/^component-(\d+)$/, (_, n) => `component-${parseInt(n, 10).toString().padStart(2, '0')}`);

                // Find all instances (list components can have multiple entries)
                const allInstances = Array.from(document.querySelectorAll(`[data-entry-id="${normalizedId}"], [data-entry-id="${normalizedIdPadded}"]`));

                if (allInstances.length === 0) {
                    console.error('❌ Component not found in visible canvas:', componentId);
                    return null;
                }

                // Filter to visible instances with actual height
                const visibleInstances = allInstances.filter(el => {
                    const rect = el.getBoundingClientRect();
                    return rect.height > 0 && rect.width > 0;
                });

                if (visibleInstances.length === 0) {
                    console.warn('⚠️ Component found but has 0px height - may be collapsed or not rendered');
                    console.log('   Found', allInstances.length, 'instance(s) with 0px height');
                    console.log('   Using first instance for analysis anyway...');
                }

                // Use first visible instance, or first instance if all are 0px
                const visibleElement = visibleInstances.length > 0 ? visibleInstances[0] : allInstances[0];

                if (allInstances.length > 1) {
                    console.log(`ℹ️ Found ${allInstances.length} instance(s) of ${componentId}, analyzing first visible one`);
                }

                // Get the actual component content (inside .canvas-entry wrapper)
                const componentContent = visibleElement.firstElementChild || visibleElement;

                // Check if component has actual content/height
                const rect = visibleElement.getBoundingClientRect();
                const contentRect = componentContent.getBoundingClientRect();

                // Get scale factor
                const container = document.querySelector('.dm-canvas-responsive');
                const scale = container ? parseFloat(getComputedStyle(container).getPropertyValue('--dm-page-scale') || '1') : 1;

                // Get canonical column width
                const column = visibleElement.closest('.canvas-column');
                const columnWidth = column ? parseFloat(getComputedStyle(column).width) / scale : null;

                const visibleComputed = window.getComputedStyle(visibleElement);
                const contentComputed = window.getComputedStyle(componentContent);

                // Get span data
                const spanTop = parseFloat(visibleElement.getAttribute('data-span-top') || '0');
                const spanBottom = parseFloat(visibleElement.getAttribute('data-span-bottom') || '0');
                const measuredHeight = spanBottom - spanTop;

                // Get parent container styles
                const columnComputed = column ? window.getComputedStyle(column) : null;

                // Analyze CSS properties that could affect height
                const analysis = {
                    // Container wrapper (.canvas-entry)
                    wrapper: {
                        width: visibleComputed.width,
                        height: visibleComputed.height,
                        paddingTop: visibleComputed.paddingTop,
                        paddingBottom: visibleComputed.paddingBottom,
                        marginTop: visibleComputed.marginTop,
                        marginBottom: visibleComputed.marginBottom,
                        boxSizing: visibleComputed.boxSizing,
                    },
                    // Component content (actual component)
                    content: {
                        width: contentComputed.width,
                        height: contentComputed.height,
                        paddingTop: contentComputed.paddingTop,
                        paddingBottom: contentComputed.paddingBottom,
                        marginTop: contentComputed.marginTop,
                        marginBottom: contentComputed.marginBottom,
                        fontFamily: contentComputed.fontFamily.substring(0, 50),
                        fontSize: contentComputed.fontSize,
                        lineHeight: contentComputed.lineHeight,
                        boxSizing: contentComputed.boxSizing,
                    },
                    // Parent column
                    column: columnComputed ? {
                        width: columnComputed.width,
                        gap: columnComputed.gap,
                        display: columnComputed.display,
                        flexDirection: columnComputed.flexDirection,
                    } : null,
                    // Scale and dimensions
                    dimensions: {
                        scale: scale.toFixed(3),
                        columnWidthUnscaled: columnWidth ? columnWidth.toFixed(2) + 'px' : 'unknown',
                        columnWidthScaled: column ? parseFloat(columnComputed?.width || '0').toFixed(2) + 'px' : 'unknown',
                        measuredHeight: measuredHeight.toFixed(2) + 'px',
                        visualHeightScaled: rect.height.toFixed(2) + 'px',
                        visualHeightUnscaled: (rect.height / scale).toFixed(2) + 'px',
                        contentHeightScaled: contentRect.height.toFixed(2) + 'px',
                        contentHeightUnscaled: (contentRect.height / scale).toFixed(2) + 'px',
                        gap: measuredHeight > 0 ? ((rect.height / scale) - measuredHeight).toFixed(2) + 'px' : 'N/A',
                        regionKey: visibleElement.getAttribute('data-region-key') || 'unknown',
                    },
                };

                console.log('═══════════════════════════════════════');
                console.log('🔍 CSS ANALYSIS:', componentId);
                console.log('═══════════════════════════════════════');
                console.log('');
                console.log('📐 DIMENSIONS:');
                console.table(analysis.dimensions);
                console.log('');
                console.log('📦 WRAPPER (.canvas-entry):');
                console.table(analysis.wrapper);
                console.log('');
                console.log('🎨 CONTENT (component):');
                console.table(analysis.content);
                if (analysis.column) {
                    console.log('');
                    console.log('📋 COLUMN (.canvas-column):');
                    console.table(analysis.column);
                }
                console.log('');
                console.log('💡 EXPECTED MEASUREMENT LAYER STYLES:');
                console.log('   width: ' + (columnWidth ? `${columnWidth.toFixed(2)}px` : 'measuredColumnWidth') + ' (canonical)');
                console.log('   maxWidth: ' + (columnWidth ? `${columnWidth.toFixed(2)}px` : 'measuredColumnWidth') + ' (canonical)');
                console.log('   boxSizing: border-box');
                console.log('   height: auto');
                console.log('   overflow: hidden');
                console.log('   transform: none');
                console.log('   padding/margin: 0 (on wrapper)');
                console.log('');
                console.log('⚠️ GAP MISMATCH INVESTIGATION:');
                const cssVarGap = container ? getComputedStyle(container).getPropertyValue('--dm-column-gap') : null;
                const computedGap = columnComputed?.gap || 'unknown';
                console.log('   CSS Variable (--dm-column-gap):', cssVarGap || 'not set');
                console.log('   Computed gap:', computedGap);
                console.log('   Expected (COMPONENT_VERTICAL_SPACING_PX): 12px');
                if (computedGap !== '12px' && computedGap !== 'unknown') {
                    console.log('   ❌ MISMATCH: Gap is', computedGap, 'but pagination uses 12px');
                    console.log('   This 4px difference per component accumulates!');
                }
                console.log('═══════════════════════════════════════');

                return analysis;
            },
        };

        const target = window as unknown as { __STATBLOCK_DEBUG__?: Record<string, unknown> };
        target.__STATBLOCK_DEBUG__ = {
            ...(target.__STATBLOCK_DEBUG__ ?? {}),
            ...debugApi,
        };

        console.log('🛠️ [StatBlockDebug] helpers registered:', Object.keys(debugApi));

        return () => {
            if (target.__STATBLOCK_DEBUG__) {
                Object.entries(debugApi).forEach(([key, handler]) => {
                    if (target.__STATBLOCK_DEBUG__?.[key] === handler) {
                        delete target.__STATBLOCK_DEBUG__[key];
                    }
                });
            }
        };
    }, [loadDemoData, creatureDetails.name, isDemo, currentProject?.id]);

    const setSelectedCreatureImage = useCallback((image: string, index?: number) => {
        setSelectedAssets((prev: typeof selectedAssets) => ({
            ...prev,
            creatureImage: image,
            selectedImageIndex: index
        }));
    }, []);

    const addGeneratedImage = useCallback((image: GeneratedImage) => {
        setGeneratedContent((prev: typeof generatedContent) => ({
            ...prev,
            images: [...prev.images, image]
        }));
        setSelectedAssets((prev: typeof selectedAssets) => ({
            ...prev,
            generatedImages: [...prev.generatedImages, image.url]
        }));
    }, []);

    const removeGeneratedImage = useCallback(async (imageId: string): Promise<void> => {
        // Remove from local state immediately (optimistic update)
        setGeneratedContent((prev: typeof generatedContent) => ({
            ...prev,
            images: prev.images.filter((img: GeneratedImage) => img.id !== imageId)
        }));

        const imageToRemove = generatedContent.images.find((img: GeneratedImage) => img.id === imageId);
        if (imageToRemove) {
            setSelectedAssets((prev: typeof selectedAssets) => ({
                ...prev,
                generatedImages: prev.generatedImages.filter((url: string) => url !== imageToRemove.url),
                // Clear selected image if it was the one being deleted
                creatureImage: prev.creatureImage === imageToRemove.url ? undefined : prev.creatureImage
            }));
        }

        // If logged in and have a project, sync to backend
        if (isLoggedIn && userId && currentProject?.id) {
            try {
                const response = await fetch(
                    `${DUNGEONMIND_API_URL}/api/statblockgenerator/project/${currentProject.id}/image/${imageId}`,
                    {
                        method: 'DELETE',
                        credentials: 'include'
                    }
                );

                if (!response.ok) {
                    console.error('Failed to delete image from backend:', response.statusText);
                    // Optimistic update already applied, don't revert
                }
            } catch (error) {
                console.error('Error deleting image:', error);
            }
        }
    }, [isLoggedIn, userId, currentProject?.id, generatedContent.images]);

    const clearTutorialImages = useCallback(() => {
        console.log('🧹 [Provider] Clearing tutorial images');
        const tutorialImageCount = generatedContent.images.filter(img => img.isTutorial).length;

        if (tutorialImageCount === 0) {
            console.log('✅ [Provider] No tutorial images to clear');
            return;
        }

        // Remove all images with isTutorial flag
        setGeneratedContent((prev: typeof generatedContent) => ({
            ...prev,
            images: prev.images.filter((img: GeneratedImage) => !img.isTutorial)
        }));

        // Also clear from selectedAssets if any tutorial images were selected
        const tutorialUrls = generatedContent.images
            .filter(img => img.isTutorial)
            .map(img => img.url);

        setSelectedAssets((prev: typeof selectedAssets) => ({
            ...prev,
            generatedImages: prev.generatedImages.filter(url => !tutorialUrls.includes(url)),
            // Clear selected image if it was a tutorial image
            creatureImage: tutorialUrls.includes(prev.creatureImage || '') ? undefined : prev.creatureImage
        }));

        console.log(`✅ [Provider] Cleared ${tutorialImageCount} tutorial images`);
    }, [generatedContent.images]);

    const addGenerated3DModel = useCallback((model: Generated3DModel) => {
        setGeneratedContent((prev: typeof generatedContent) => ({
            ...prev,
            models: [...prev.models, model]
        }));
    }, []);

    const addGeneratedExport = useCallback((exportItem: GeneratedExport) => {
        setGeneratedContent((prev: typeof generatedContent) => ({
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

    // ============================================================================
    // Phase 3: Manual "Save Now" function
    // ============================================================================
    // NOTE: Defined here (before Phase 4) because saveProject() depends on it

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
                    userId: userId,
                    selectedAssets: selectedAssets,
                    generatedContent: generatedContent,
                    imagePrompt: imagePrompt,
                    imageStyle: imageStyle,
                    imageModel: imageModel
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
    }, [isLoggedIn, userId, currentProject?.id, creatureDetails, selectedAssets, generatedContent]);

    // ============================================================================
    // Phase 4: Project Management Functions
    // ============================================================================

    const createProject = useCallback(async (name: string, description?: string): Promise<string> => {
        if (!isLoggedIn || !userId) {
            throw new Error('Authentication required to create projects');
        }

        console.log('📁 [Provider] Creating new project:', name, description ? `with description: ${description}` : '');

        // Re-enable auto-save (in case it was disabled after deletion)
        skipAutoSaveRef.current = false;
        // Clear saved content hash to allow first save of new project
        lastSavedContentHashRef.current = '';

        // Create a new empty project with default statblock (no demo template)
        const initialCreature = createDefaultStatblock();
        const newProject: StatBlockProject = {
            id: '', // Will be generated by backend
            name,
            description: description || '',
            createdBy: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            state: {
                creatureDetails: initialCreature,
                selectedAssets: {
                    generatedImages: []
                },
                generatedContent: {
                    images: [],
                    models: [],
                    exports: []
                },
                autoSaveEnabled: true,
                lastSaved: new Date().toISOString()
            },
            metadata: {
                version: '1.0.0',
                platform: 'web'
            }
        };

        try {
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/statblockgenerator/save-project`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    projectId: null, // New project
                    statblock: initialCreature,
                    userId: userId
                })
            });

            if (!response.ok) {
                throw new Error(`Create project failed: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('📁 [Provider] Project created:', result.projectId);

            // Update current project state
            newProject.id = result.projectId;
            newProject.createdAt = result.createdAt;
            newProject.updatedAt = result.updatedAt;
            setCurrentProject(newProject);

            // Keep the initial creature (already set above)
            replaceCreatureDetails(initialCreature);

            // CRITICAL FIX: Clear all state to prevent carryover from previous project
            console.log('🧹 [Provider] Clearing state for new project');

            // Clear selected assets (images, models)
            setSelectedAssets({
                creatureImage: undefined,
                selectedImageIndex: undefined,
                generatedImages: [],
                modelFile: undefined
            });

            // Clear generated content library
            setGeneratedContent({
                images: [],
                models: [],
                exports: []
            });

            // Clear image prompt (or use creature's sdPrompt if available)
            const newPrompt = initialCreature.sdPrompt || '';
            setImagePrompt(newPrompt);
            console.log('📝 [Provider] Image prompt reset:', newPrompt ? newPrompt.substring(0, 50) + '...' : '(empty)');

            // CRITICAL FIX: Update content hash to prevent duplicate save
            const contentToHash = JSON.stringify({
                creatureDetails: initialCreature,
                selectedAssets: {
                    creatureImage: undefined,
                    selectedImageIndex: undefined,
                    generatedImages: [],
                    modelFile: undefined
                },
                generatedContent: {
                    images: [],
                    models: [],
                    exports: []
                },
                imagePrompt: newPrompt
            });
            lastSavedContentHashRef.current = contentToHash;
            console.log('🔒 [Provider] Content hash updated after project creation');

            // Clear demo flag when creating new project
            setIsDemo(false);

            // FEATURE: Open generation drawer with text tab and project description
            console.log('🎨 [Provider] Opening generation drawer with project description');
            openGenerationDrawer({
                tab: 'text',
                prompt: description || ''
            });

            return result.projectId;
        } catch (err) {
            console.error('📁 [Provider] Failed to create project:', err);
            throw err;
        }
    }, [isLoggedIn, userId, replaceCreatureDetails, openGenerationDrawer]);

    const saveProject = useCallback(async (): Promise<void> => {
        // Redirect to manual save (already implemented)
        await saveNow();
    }, [saveNow]);

    const loadProject = useCallback(async (projectId: string): Promise<void> => {
        if (!isLoggedIn || !userId) {
            throw new Error('Authentication required to load projects');
        }

        console.log('📁 [Provider] Loading project:', projectId);
        setIsLoading(true);

        // Re-enable auto-save (in case it was disabled after deletion)
        skipAutoSaveRef.current = false;
        // Clear saved content hash to allow first save after load
        lastSavedContentHashRef.current = '';

        try {
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/statblockgenerator/project/${projectId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Load project failed: ${response.statusText}`);
            }

            const result = await response.json();
            const projectData = result.data.project;

            console.log('📁 [Provider] Project loaded:', projectData.name);

            // Update all state from loaded project
            setCurrentProject({
                id: projectData.id,
                name: projectData.name,
                description: projectData.description || '',
                createdBy: projectData.createdBy,
                createdAt: projectData.createdAt,
                updatedAt: projectData.updatedAt,
                lastModified: projectData.lastModified,
                state: projectData.state,
                metadata: projectData.metadata
            });

            // CRITICAL: Always replace ALL state to prevent mixing with previous data
            // Use random demo if project doesn't have data (prevents old state from persisting)
            const loadedCreature = normalizeStatblock(projectData.state?.creatureDetails || getRandomDemo());
            replaceCreatureDetails(loadedCreature);

            setSelectedAssets(projectData.state?.selectedAssets || {
                creatureImage: undefined,
                selectedImageIndex: undefined,
                generatedImages: [],
                modelFile: undefined
            });

            setGeneratedContent(projectData.state?.generatedContent || {
                images: [],
                models: [],
                exports: []
            });

            // Use saved imagePrompt, or fallback to creature's sdPrompt
            const promptToLoad = projectData.state?.imagePrompt || loadedCreature.sdPrompt || '';
            setImagePrompt(promptToLoad);
            console.log('📝 [Provider] Image prompt loaded:', promptToLoad ? promptToLoad.substring(0, 50) + '...' : '(empty)');

            // Clear demo flag when loading existing project
            setIsDemo(false);

            setError(null);
        } catch (err) {
            console.error('📁 [Provider] Failed to load project:', err);
            setError(err instanceof Error ? err.message : 'Failed to load project');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [isLoggedIn, userId, replaceCreatureDetails]);

    const deleteProject = useCallback(async (projectId: string): Promise<void> => {
        if (!isLoggedIn || !userId) {
            throw new Error('Authentication required to delete projects');
        }

        console.log('📁 [Provider] Deleting project:', projectId);

        try {
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/statblockgenerator/project/${projectId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Delete project failed: ${response.statusText}`);
            }

            console.log('📁 [Provider] Project deleted:', projectId);

            // If deleting current project, reset to random demo
            if (currentProject?.id === projectId) {
                setCurrentProject(null);
                // Disable auto-save temporarily to prevent creating a new project from demo
                skipAutoSaveRef.current = true;
                // Clear saved content hash
                lastSavedContentHashRef.current = '';
                // Load a new random demo
                loadDemoData();

                // Re-enable auto-save after 5 seconds (in case user wants to start editing)
                setTimeout(() => {
                    skipAutoSaveRef.current = false;
                    console.log('📁 [Provider] Auto-save re-enabled after deletion cooldown');
                }, 5000);
            }
        } catch (err) {
            console.error('📁 [Provider] Failed to delete project:', err);
            throw err;
        }
    }, [isLoggedIn, userId, currentProject, replaceCreatureDetails]);

    const listProjects = useCallback(async (): Promise<StatBlockProjectSummary[]> => {
        if (!isLoggedIn || !userId) {
            console.log('📁 [Provider] Not logged in, returning empty project list');
            return [];
        }

        console.log('📁 [Provider] Fetching project list');

        try {
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/statblockgenerator/list-projects`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`List projects failed: ${response.statusText}`);
            }

            const result = await response.json();
            const projects = result.data.projects;

            console.log('📁 [Provider] Projects fetched:', projects.length);

            // Transform to StatBlockProjectSummary format
            return projects.map((p: any) => ({
                id: p.id,
                name: p.name || 'Untitled Creature',
                description: p.description || '',
                creatureType: p.metadata?.creatureType || p.state?.creatureDetails?.type || 'Unknown',
                challengeRating: p.metadata?.challengeRating || p.state?.creatureDetails?.challengeRating || 'N/A',
                updatedAt: p.updatedAt || p.lastModified,
                createdAt: p.createdAt
            }));
        } catch (err) {
            console.error('📁 [Provider] Failed to list projects:', err);
            return [];
        }
    }, [isLoggedIn, userId]);

    // Session management functions
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
    // Auto-sync image prompt with creature's sdPrompt when creature changes
    useEffect(() => {
        // Only sync if imagePrompt is empty and creature has sdPrompt
        if (!imagePrompt && creatureDetails.sdPrompt) {
            console.log('🔄 [Provider] Auto-syncing image prompt from creature sdPrompt');
            setImagePrompt(creatureDetails.sdPrompt);
        }
    }, [creatureDetails.sdPrompt, imagePrompt]);

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

            // Filter out tutorial images before saving (they shouldn't persist)
            const imagesToSave = generatedContent.images.filter(img => !img.isTutorial);

            const stateSnapshot = {
                creatureDetails,
                selectedAssets,
                generatedContent: {
                    ...generatedContent,
                    images: imagesToSave
                },
                imagePrompt,
                imageStyle,
                imageModel,
                currentProject: currentProject?.id,
                timestamp: Date.now()
            };
            const serialized = JSON.stringify(stateSnapshot);
            localStorage.setItem('statblockGenerator_state', serialized);
            console.log(`💾 [Provider] ✅ Auto-saved to localStorage (${(serialized.length / 1024).toFixed(2)} KB, ${imagesToSave.length} images, filtered ${generatedContent.images.length - imagesToSave.length} tutorial images)`);
        } catch (err) {
            console.error('💾 [Provider] ❌ Failed to save to localStorage:', err);
        }
        // CRITICAL: Only depend on currentProject?.id, not the whole object
        // Otherwise setCurrentProject() creates new object reference → triggers this effect again → loop!
    }, [creatureDetails, selectedAssets, generatedContent, imagePrompt, imageStyle, imageModel, currentProject?.id, isGenerating]);

    // UPDATE latestStateRef - keep in sync with current state for beforeunload handler
    useEffect(() => {
        latestStateRef.current = {
            creatureDetails,
            selectedAssets,
            generatedContent,
            imagePrompt,
            imageStyle,
            imageModel,
            currentProjectId: currentProject?.id || null,
            isGenerating
        };
    }, [creatureDetails, selectedAssets, generatedContent, imagePrompt, imageStyle, imageModel, currentProject?.id, isGenerating]);

    // beforeunload handler - saves state before page unload (e.g., OAuth redirect)
    // This prevents losing unsaved work when clicking Login
    useEffect(() => {
        const handleBeforeUnload = () => {
            const state = latestStateRef.current;
            if (!state || state.isGenerating) {
                console.log('🚪 [Provider] beforeunload: Skipping save (no state or generating)');
                return;
            }

            try {
                // Filter out tutorial images
                const imagesToSave = state.generatedContent.images.filter(img => !img.isTutorial);

                const stateSnapshot = {
                    creatureDetails: state.creatureDetails,
                    selectedAssets: state.selectedAssets,
                    generatedContent: {
                        ...state.generatedContent,
                        images: imagesToSave
                    },
                    imagePrompt: state.imagePrompt,
                    imageStyle: state.imageStyle,
                    imageModel: state.imageModel,
                    currentProject: state.currentProjectId,
                    timestamp: Date.now()
                };
                const serialized = JSON.stringify(stateSnapshot);
                localStorage.setItem('statblockGenerator_state', serialized);
                console.log(`🚪 [Provider] beforeunload: Saved state to localStorage (${(serialized.length / 1024).toFixed(2)} KB)`);
            } catch (err) {
                console.error('🚪 [Provider] beforeunload: Failed to save:', err);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []); // Empty deps - handler reads from ref

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

        // Don't auto-save if explicitly disabled (e.g., right after deleting a project)
        if (skipAutoSaveRef.current) {
            console.log('💾 [Provider] Skipping Firestore save: auto-save temporarily disabled');
            return;
        }

        // Deduplication: Create content hash from statblock + project ID + images
        const contentToHash = JSON.stringify({
            projectId: currentProject?.id,
            name: creatureDetails.name,
            type: creatureDetails.type,
            actions: creatureDetails.actions?.length,
            traits: creatureDetails.specialAbilities?.length,
            // Add key fields that indicate meaningful changes
            challengeRating: creatureDetails.challengeRating,
            hp: creatureDetails.hitPoints,
            // Include image count so new images trigger saves
            imagesCount: generatedContent.images.length
        });

        // Skip if content hasn't changed since last save
        if (contentToHash === lastSavedContentHashRef.current) {
            console.log('💾 [Provider] Skipping Firestore save: content unchanged since last save');
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

                // Call backend save endpoint with full project state
                const response = await fetch(`${DUNGEONMIND_API_URL}/api/statblockgenerator/save-project`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        projectId: currentProject?.id,
                        statblock: creatureDetails,
                        userId: userId,
                        selectedAssets: selectedAssets,
                        generatedContent: generatedContent,
                        imagePrompt: imagePrompt
                    })
                });

                if (!response.ok) {
                    throw new Error(`Save failed: ${response.statusText}`);
                }

                const result = await response.json();
                console.log('💾 [Provider] Firestore save successful:', result);

                // Update last saved content hash to prevent duplicate saves
                lastSavedContentHashRef.current = contentToHash;

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
    }, [creatureDetails, currentProject?.id, isLoggedIn, userId, selectedAssets, generatedContent, imagePrompt, isGenerating]);

    // Context value
    const contextValue: StatBlockGeneratorContextType = {
        // Core State
        isCanvasPreviewReady,
        selectedTemplateId,
        isCanvasEditMode,
        isDemo,
        creatureDetails,
        selectedAssets,
        generatedContent,
        imagePrompt,
        imageStyle,
        imageModel,

        // Generation Drawer Control
        generationDrawerState,
        openGenerationDrawer,
        closeGenerationDrawer,

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
        checkBeforeGenerate,
        setSelectedTemplateId,
        setIsCanvasEditMode,
        setSelectedCreatureImage,
        addGeneratedImage,
        removeGeneratedImage,
        clearTutorialImages,
        addGenerated3DModel,
        addGeneratedExport,
        setImagePrompt,
        setImageStyle,
        setImageModel,
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

            {/* Guard Modal - Prevent accidental overwrite of saved projects */}
            <GenerateWithProjectGuard
                opened={guardModalOpen}
                onClose={handleGuardCancel}
                projectName={currentProject?.name || 'Untitled Project'}
                onCreateNew={handleGuardCreateNew}
                onOverwrite={handleGuardOverwrite}
            />
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
