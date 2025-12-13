/**
 * PlayerCharacterGenerator Context Provider
 * 
 * Centralized state management for player character creation and editing.
 * Follows the proven StatBlockGeneratorProvider pattern.
 * 
 * @module PlayerCharacterGenerator
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef, ReactNode } from 'react';
import { Character, createEmptyCharacter, DnD5eCharacter, createEmptyDnD5eCharacter } from './types';
import { DnD5eRuleEngine, createDnD5eRuleEngine } from './engine';
import type { ValidationResult } from './engine';
import { DEMO_CHARACTERS, getDemoCharacter, DEMO_CHARACTER_OPTIONS } from './canvasComponents/demoData';
import { useAuth } from '../../context/AuthContext';
import { DUNGEONMIND_API_URL } from '../../config';

// ============================================================================
// PROJECT TYPES (Phase 4)
// ============================================================================

/**
 * Character project for cloud persistence
 */
export interface CharacterProject {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    lastModified: string;
    state: {
        character: Character;
        wizardStep: number;
        autoSaveEnabled: boolean;
        lastSaved: string;
    };
    metadata: {
        version: string;
        platform: string;
        // Character-specific metadata for quick display
        race?: string;
        class?: string;
        level?: number;
    };
}

/**
 * Summary for project list display (Character Roster)
 * Includes character-specific fields for thematic display
 */
export interface CharacterProjectSummary {
    id: string;
    name: string;               // Character name
    description: string;
    race: string;               // e.g., "Dwarf", "Elf"
    className: string;          // e.g., "Fighter", "Wizard" (renamed from 'class' to avoid keyword)
    level: number;              // Character level
    updatedAt: string;
    createdAt: string;
}

/**
 * Player Character Generator context type
 */
interface PlayerCharacterGeneratorContextType {
    // ===== CHARACTER STATE =====
    character: Character | null;

    // ===== CHARACTER MUTATIONS =====
    setCharacter: (character: Character) => void;
    updateCharacter: (updates: Partial<Character>) => void;
    resetCharacter: () => void;
    loadDemoCharacter: (key?: string) => void;
    demoCharacterOptions: typeof DEMO_CHARACTER_OPTIONS;

    // ===== D&D 5E SPECIFIC =====
    updateDnD5eData: (updates: Partial<DnD5eCharacter>) => void;

    // ===== RULE ENGINE =====
    ruleEngine: DnD5eRuleEngine;

    // ===== VALIDATION (from Rule Engine) =====
    validation: ValidationResult;
    isCharacterValid: boolean;

    // ===== EDIT MODE =====
    isEditMode: boolean;
    setIsEditMode: (enabled: boolean) => void;
    isHomebrewMode: boolean;
    setIsHomebrewMode: (enabled: boolean) => void;

    // ===== DRAWER/WIZARD CONTROL =====
    /** Current wizard step (0-6) */
    wizardStep: number;
    /** Set wizard step directly */
    setWizardStep: (step: number) => void;
    /** Is creation drawer open */
    isDrawerOpen: boolean;
    /** Set drawer open state */
    setDrawerOpen: (open: boolean) => void;
    /** Open drawer to a specific wizard step (convenience function for edit mode) */
    openDrawerToStep: (step: number) => void;

    // ===== PROJECT MANAGEMENT (Phase 4) =====
    currentProject: CharacterProject | null;
    saveStatus: 'idle' | 'saving' | 'saved' | 'error';
    isLoadingProjects: boolean;

    // Project CRUD
    createProject: (name: string, description?: string) => Promise<string>;
    saveProject: () => Promise<void>;
    loadProject: (projectId: string) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    listProjects: () => Promise<CharacterProjectSummary[]>;

    // Project state management
    clearCurrentProject: () => void;  // Clears project ID (for "New Character")
    isUnsavedNewCharacter: boolean;   // True when character exists but no project ID
}

/**
 * Context
 */
const PlayerCharacterGeneratorContext = createContext<PlayerCharacterGeneratorContextType | undefined>(undefined);

/**
 * Provider Props
 */
interface PlayerCharacterGeneratorProviderProps {
    children: ReactNode;
}

/**
 * PlayerCharacterGenerator Provider Component
 * 
 * Provides character state and mutations to all child components.
 */
export const PlayerCharacterGeneratorProvider: React.FC<PlayerCharacterGeneratorProviderProps> = ({ children }) => {
    // ===== RULE ENGINE (singleton instance) =====
    const ruleEngine = useMemo(() => {
        console.log('🎲 [PlayerCharacterGenerator] Creating D&D 5e Rule Engine');
        return createDnD5eRuleEngine();
    }, []);

    // ===== LOCALSTORAGE =====
    const CHARACTER_STORAGE_KEY = 'pcg_character_state';

    // ===== STATE =====
    const [character, setCharacter] = useState<Character | null>(() => {
        // Try to restore from localStorage
        try {
            const saved = localStorage.getItem(CHARACTER_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                console.log('📦 [PCG] Restored from localStorage:', parsed.name || '(unnamed)');
                return parsed;
            }
        } catch (err) {
            console.warn('⚠️ [PCG] Failed to restore from localStorage:', err);
        }

        // Fallback: create empty character
        const empty = createEmptyCharacter();
        empty.dnd5eData = createEmptyDnD5eCharacter();
        return empty;
    });

    // Debounced save to localStorage
    useEffect(() => {
        if (!character) return;

        const timer = setTimeout(() => {
            try {
                localStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(character));
                console.log('💾 [PCG] Saved to localStorage');
            } catch (err) {
                console.error('❌ [PCG] localStorage save failed:', err);
            }
        }, 500); // 500ms debounce (reduced from 2s for better responsiveness)

        return () => clearTimeout(timer);
    }, [character]);

    // Save immediately on page unload (catches refresh/close before debounce fires)
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (character) {
                try {
                    localStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(character));
                    console.log('💾 [PCG] Saved on unload');
                } catch {
                    // Ignore errors on unload
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [character]);

    // ===== EDIT MODE STATE =====
    const [isEditMode, setIsEditMode] = useState(false);
    const [isHomebrewMode, setIsHomebrewMode] = useState(false);

    // Log edit mode changes
    useEffect(() => {
        console.log(`✏️ [PlayerCharacterGenerator] Edit mode: ${isEditMode ? 'ON' : 'OFF'}`);
    }, [isEditMode]);

    useEffect(() => {
        console.log(`🍺 [PlayerCharacterGenerator] Homebrew mode: ${isHomebrewMode ? 'ON' : 'OFF'}`);
    }, [isHomebrewMode]);

    // ===== AUTH (for cloud persistence) =====
    const { isLoggedIn, userId } = useAuth();

    // ===== PROJECT MANAGEMENT STATE (Phase 4) =====
    const [currentProject, setCurrentProject] = useState<CharacterProject | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);

    // Refs for debounced cloud save
    const skipAutoSaveRef = useRef(false);
    const lastSavedContentHashRef = useRef<string>('');
    const debouncedSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ===== DRAWER/WIZARD STATE =====
    const WIZARD_STEP_KEY = 'charactergen_wizard_step';

    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [wizardStep, setWizardStepInternal] = useState<number>(() => {
        // Restore from localStorage on mount
        try {
            const saved = localStorage.getItem(WIZARD_STEP_KEY);
            return saved ? parseInt(saved) : 0;
        } catch {
            return 0;
        }
    });

    // Persist wizard step to localStorage
    const setWizardStep = useCallback((step: number) => {
        setWizardStepInternal(step);
        try {
            localStorage.setItem(WIZARD_STEP_KEY, step.toString());
        } catch {
            // Ignore localStorage errors
        }
    }, []);

    // Open drawer to a specific step (for edit mode complex field clicks)
    const openDrawerToStep = useCallback((step: number) => {
        console.log(`📂 [PlayerCharacterGenerator] Opening drawer to step ${step}`);
        setWizardStep(step);
        setDrawerOpen(true);
    }, [setWizardStep]);

    // ===== DEBOUNCED CLOUD SAVE (Phase 4c) =====
    // Auto-save to Firestore for logged-in users with 2s debounce
    // IMPORTANT: Only auto-save if we have a project ID (Option 1: Standard pattern)
    useEffect(() => {
        // Don't save if not logged in
        if (!isLoggedIn || !userId) {
            return;
        }

        // Don't save empty characters (no name)
        if (!character?.name?.trim()) {
            return;
        }

        // OPTION 1 (STANDARD): Only auto-save if we have a project ID
        // User must manually save once to create a project, then auto-save kicks in
        if (!currentProject?.id) {
            console.log('☁️ [PCG] Skipping cloud save: no project ID (new character, use Save button)');
            return;
        }

        // Don't auto-save if explicitly disabled (e.g., right after deleting a project)
        if (skipAutoSaveRef.current) {
            console.log('☁️ [PCG] Skipping cloud save: auto-save temporarily disabled');
            return;
        }

        // Content hash deduplication: Create hash from key character fields
        const contentToHash = JSON.stringify({
            projectId: currentProject?.id,
            name: character.name,
            level: character.level,
            race: character.dnd5eData?.race?.name,
            class: character.dnd5eData?.classes?.[0]?.name,
            // Key fields that indicate meaningful changes
            abilityScores: character.dnd5eData?.abilityScores,
            background: character.dnd5eData?.background?.name,
            spellCount: character.dnd5eData?.spellcasting?.spellsKnown?.length || 0
        });

        // Skip if content hasn't changed since last save
        if (contentToHash === lastSavedContentHashRef.current) {
            return;
        }

        // Clear existing timer
        if (debouncedSaveTimerRef.current) {
            clearTimeout(debouncedSaveTimerRef.current);
        }

        // Set up new debounced save (2 seconds)
        debouncedSaveTimerRef.current = setTimeout(async () => {
            setSaveStatus('saving');
            console.log('☁️ [PCG] Debounced cloud save triggered');

            try {
                const response = await fetch(`${DUNGEONMIND_API_URL}/api/playercharactergenerator/save-project`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        projectId: currentProject?.id,
                        character: character,
                        userId: userId,
                        wizardStep: wizardStep
                    })
                });

                if (!response.ok) {
                    throw new Error(`Save failed: ${response.statusText}`);
                }

                const result = await response.json();
                console.log('☁️ [PCG] Cloud save successful:', result.projectId);

                // Update last saved content hash to prevent duplicate saves
                lastSavedContentHashRef.current = contentToHash;

                // Update current project with server response
                if (result.projectId) {
                    setCurrentProject(prev => ({
                        id: result.projectId,
                        name: character.name || 'Unnamed Character',
                        description: character.description || '',
                        createdBy: userId,
                        createdAt: prev?.createdAt || result.createdAt,
                        updatedAt: result.updatedAt,
                        lastModified: result.updatedAt,
                        state: {
                            character,
                            wizardStep,
                            autoSaveEnabled: true,
                            lastSaved: new Date().toISOString()
                        },
                        metadata: {
                            version: '1.0.0',
                            platform: 'web',
                            race: character.dnd5eData?.race?.name,
                            class: character.dnd5eData?.classes?.[0]?.name,
                            level: character.level
                        }
                    }));
                }

                setSaveStatus('saved');

                // Reset to idle after 2 seconds
                setTimeout(() => setSaveStatus('idle'), 2000);

            } catch (err) {
                console.error('☁️ [PCG] Cloud save failed:', err);
                setSaveStatus('error');

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
    }, [character, currentProject?.id, isLoggedIn, userId, wizardStep]);

    // ===== DERIVED VALIDATION (from Rule Engine) =====
    const validation = useMemo<ValidationResult>(() => {
        if (!character?.dnd5eData) {
            return { isValid: false, errors: [], warnings: [], info: [] };
        }
        return ruleEngine.validateCharacter(character.dnd5eData);
    }, [character?.dnd5eData, ruleEngine]);

    const isCharacterValid = useMemo(() => {
        if (!character?.dnd5eData) return false;
        return ruleEngine.isCharacterComplete(character.dnd5eData);
    }, [character?.dnd5eData, ruleEngine]);

    // Log validation changes in development
    useEffect(() => {
        if (validation.errors.length > 0) {
            console.log('⚠️ [PlayerCharacterGenerator] Validation errors:', validation.errors.length);
        } else if (isCharacterValid) {
            console.log('✅ [PlayerCharacterGenerator] Character is valid');
        }
    }, [validation, isCharacterValid]);

    // ===== CHARACTER MUTATIONS =====

    /**
     * Update entire character
     */
    const handleSetCharacter = useCallback((newCharacter: Character) => {
        console.log('📝 [PlayerCharacterGenerator] Setting character:', newCharacter.name);
        setCharacter(newCharacter);
    }, []);

    /**
     * Update character fields (shallow merge)
     */
    const updateCharacter = useCallback((updates: Partial<Character>) => {
        setCharacter(prev => {
            if (!prev) return prev;
            const updated = { ...prev, ...updates };
            console.log('📝 [PlayerCharacterGenerator] Updated character:', updated.name);
            return updated;
        });
    }, []);

    /**
     * Reset to empty character
     */
    const resetCharacter = useCallback(() => {
        console.log('🔄 [PlayerCharacterGenerator] Resetting character');
        const empty = createEmptyCharacter();
        empty.dnd5eData = createEmptyDnD5eCharacter();
        setCharacter(empty);
        // Clear persisted state
        try {
            localStorage.removeItem(CHARACTER_STORAGE_KEY);
            console.log('🗑️ [PCG] Cleared localStorage');
        } catch {
            // Ignore localStorage errors
        }
    }, []);

    /**
     * Clear current project (for "New Character" flow)
     * This ensures auto-save won't overwrite an existing project.
     * User must manually save to create a new project.
     */
    const clearCurrentProject = useCallback(() => {
        console.log('🔄 [PCG] Clearing current project (new character mode)');
        setCurrentProject(null);
        lastSavedContentHashRef.current = ''; // Reset hash so first save works
        setSaveStatus('idle');
    }, []);

    /**
     * Check if current character is unsaved (has content but no project ID)
     * Used to show "Unsaved" indicator in header
     */
    const isUnsavedNewCharacter = useMemo(() => {
        const hasContent = character?.name?.trim();
        const hasNoProject = !currentProject?.id;
        return !!(hasContent && hasNoProject);
    }, [character?.name, currentProject?.id]);

    /**
     * Load demo character by key
     * Defaults to 'fighter' if no key provided
     */
    const loadDemoCharacter = useCallback((key: string = 'fighter') => {
        const demoChar = getDemoCharacter(key);
        if (demoChar) {
            console.log(`🎲 [PlayerCharacterGenerator] Loading demo character: ${demoChar.name}`);
            setCharacter(demoChar);
        } else {
            console.warn(`⚠️ [PlayerCharacterGenerator] Unknown demo character key: ${key}`);
        }
    }, []);

    /**
     * Update D&D 5e-specific data
     */
    const updateDnD5eData = useCallback((updates: Partial<DnD5eCharacter>) => {
        setCharacter(prev => {
            if (!prev || !prev.dnd5eData) {
                console.warn('⚠️ [PlayerCharacterGenerator] Cannot update D&D 5e data: character not initialized');
                return prev;
            }

            const updated = {
                ...prev,
                dnd5eData: {
                    ...prev.dnd5eData,
                    ...updates
                },
                updatedAt: new Date().toISOString()
            };

            console.log('📝 [PlayerCharacterGenerator] Updated D&D 5e data');
            return updated;
        });
    }, []);

    // ===== PROJECT MANAGEMENT FUNCTIONS (Phase 4) =====

    /**
     * Create a new character project (cloud save)
     * Returns the project ID on success
     */
    const createProject = useCallback(async (name: string, description?: string): Promise<string> => {
        if (!isLoggedIn || !userId) {
            throw new Error('Authentication required to create projects');
        }

        console.log('📁 [PCG] Creating new project:', name);

        // Re-enable auto-save (in case it was disabled after deletion)
        skipAutoSaveRef.current = false;
        lastSavedContentHashRef.current = '';

        // Create empty character for new project
        const initialCharacter = createEmptyCharacter();
        initialCharacter.dnd5eData = createEmptyDnD5eCharacter();
        initialCharacter.name = name;

        const newProject: CharacterProject = {
            id: '', // Will be generated by backend
            name,
            description: description || '',
            createdBy: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            state: {
                character: initialCharacter,
                wizardStep: 0,
                autoSaveEnabled: true,
                lastSaved: new Date().toISOString()
            },
            metadata: {
                version: '1.0.0',
                platform: 'web'
            }
        };

        try {
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/playercharactergenerator/save-project`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    projectId: null, // New project
                    character: initialCharacter,
                    userId: userId
                })
            });

            if (!response.ok) {
                throw new Error(`Create project failed: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('📁 [PCG] Project created:', result.projectId);

            // Update current project state
            newProject.id = result.projectId;
            newProject.createdAt = result.createdAt;
            newProject.updatedAt = result.updatedAt;
            setCurrentProject(newProject);

            // Set the new character
            setCharacter(initialCharacter);

            // Reset wizard to step 0
            setWizardStep(0);

            // Open the wizard drawer
            setDrawerOpen(true);

            return result.projectId;
        } catch (err) {
            console.error('📁 [PCG] Failed to create project:', err);
            throw err;
        }
    }, [isLoggedIn, userId, setWizardStep, setDrawerOpen]);

    /**
     * Load a character project from cloud
     */
    const loadProject = useCallback(async (projectId: string): Promise<void> => {
        if (!isLoggedIn || !userId) {
            throw new Error('Authentication required to load projects');
        }

        console.log('📁 [PCG] Loading project:', projectId);
        setIsLoadingProjects(true);

        // Re-enable auto-save
        skipAutoSaveRef.current = false;
        lastSavedContentHashRef.current = '';

        try {
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/playercharactergenerator/project/${projectId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Load project failed: ${response.statusText}`);
            }

            const result = await response.json();
            const projectData = result.data.project;

            console.log('📁 [PCG] Project loaded:', projectData.name);

            // Update current project state
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

            // Load the character
            const loadedCharacter = projectData.state?.character;
            if (loadedCharacter) {
                setCharacter(loadedCharacter);
            }

            // Restore wizard step
            if (typeof projectData.state?.wizardStep === 'number') {
                setWizardStep(projectData.state.wizardStep);
            }

        } catch (err) {
            console.error('📁 [PCG] Failed to load project:', err);
            throw err;
        } finally {
            setIsLoadingProjects(false);
        }
    }, [isLoggedIn, userId, setWizardStep]);

    /**
     * Delete a character project
     */
    const deleteProject = useCallback(async (projectId: string): Promise<void> => {
        if (!isLoggedIn || !userId) {
            throw new Error('Authentication required to delete projects');
        }

        console.log('📁 [PCG] Deleting project:', projectId);

        try {
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/playercharactergenerator/project/${projectId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Delete project failed: ${response.statusText}`);
            }

            console.log('📁 [PCG] Project deleted:', projectId);

            // If deleting current project, reset to empty character
            if (currentProject?.id === projectId) {
                setCurrentProject(null);
                // Disable auto-save temporarily
                skipAutoSaveRef.current = true;
                lastSavedContentHashRef.current = '';

                // Reset to empty character
                const empty = createEmptyCharacter();
                empty.dnd5eData = createEmptyDnD5eCharacter();
                setCharacter(empty);
                setWizardStep(0);

                // Re-enable auto-save after 5 seconds
                setTimeout(() => {
                    skipAutoSaveRef.current = false;
                    console.log('📁 [PCG] Auto-save re-enabled after deletion cooldown');
                }, 5000);
            }
        } catch (err) {
            console.error('📁 [PCG] Failed to delete project:', err);
            throw err;
        }
    }, [isLoggedIn, userId, currentProject, setWizardStep]);

    /**
     * List all character projects for current user
     */
    const listProjects = useCallback(async (): Promise<CharacterProjectSummary[]> => {
        if (!isLoggedIn || !userId) {
            console.log('📁 [PCG] Not logged in, returning empty project list');
            return [];
        }

        console.log('📁 [PCG] Fetching project list');
        setIsLoadingProjects(true);

        try {
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/playercharactergenerator/list-projects`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`List projects failed: ${response.statusText}`);
            }

            const result = await response.json();
            const projects = result.data.projects;

            console.log('📁 [PCG] Projects fetched:', projects.length);

            // Transform to CharacterProjectSummary format
            return projects.map((p: any) => ({
                id: p.id,
                name: p.name || 'Unnamed Character',
                description: p.description || '',
                race: p.metadata?.race || p.state?.character?.dnd5eData?.race?.name || 'Unknown',
                className: p.metadata?.class || p.state?.character?.dnd5eData?.classes?.[0]?.name || 'Unknown',
                level: p.metadata?.level || p.state?.character?.level || 1,
                updatedAt: p.updatedAt || p.lastModified,
                createdAt: p.createdAt
            }));
        } catch (err) {
            console.error('📁 [PCG] Failed to list projects:', err);
            return [];
        } finally {
            setIsLoadingProjects(false);
        }
    }, [isLoggedIn, userId]);

    /**
     * Manual save current character to cloud
     */
    const saveProject = useCallback(async (): Promise<void> => {
        if (!isLoggedIn || !userId) {
            throw new Error('Authentication required to save projects');
        }

        if (!character) {
            throw new Error('No character to save');
        }

        console.log('📁 [PCG] Manual save triggered');
        setSaveStatus('saving');

        try {
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/playercharactergenerator/save-project`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    projectId: currentProject?.id,
                    character: character,
                    userId: userId,
                    wizardStep: wizardStep
                })
            });

            if (!response.ok) {
                throw new Error(`Save failed: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('📁 [PCG] Save successful:', result);

            // Update content hash to prevent duplicate saves
            const contentHash = JSON.stringify({
                projectId: result.projectId,
                name: character.name,
                level: character.level
            });
            lastSavedContentHashRef.current = contentHash;

            // Update current project
            if (result.projectId) {
                setCurrentProject(prev => ({
                    id: result.projectId,
                    name: character.name || 'Unnamed Character',
                    description: character.description || '',
                    createdBy: userId,
                    createdAt: prev?.createdAt || result.createdAt,
                    updatedAt: result.updatedAt,
                    lastModified: result.updatedAt,
                    state: {
                        character,
                        wizardStep,
                        autoSaveEnabled: true,
                        lastSaved: new Date().toISOString()
                    },
                    metadata: {
                        version: '1.0.0',
                        platform: 'web',
                        race: character.dnd5eData?.race?.name,
                        class: character.dnd5eData?.classes?.[0]?.name,
                        level: character.level
                    }
                }));
            }

            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);

        } catch (err) {
            console.error('📁 [PCG] Save failed:', err);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 5000);
            throw err;
        }
    }, [isLoggedIn, userId, character, currentProject?.id, wizardStep]);

    // ===== DEBUG HELPERS (development only) =====
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Expose debug helpers on window for console testing
            (window as any).__PCG_DEBUG__ = {
                loadDemoCharacter,
                resetCharacter,
                getCharacter: () => character,
                getValidation: () => validation,
                demoOptions: DEMO_CHARACTER_OPTIONS,
                // Edit mode helpers
                toggleEditMode: () => setIsEditMode(prev => !prev),
                toggleHomebrewMode: () => setIsHomebrewMode(prev => !prev),
                getEditMode: () => ({ isEditMode, isHomebrewMode }),
                // Drawer/wizard helpers
                openDrawerToStep,
                getWizardStep: () => wizardStep,
                setWizardStep
            };
            console.log('🛠️ [PCG Debug] Helpers available: window.__PCG_DEBUG__');
            console.log('  - loadDemoCharacter(key): Load demo character (fighter, wizard)');
            console.log('  - resetCharacter(): Reset to empty character');
            console.log('  - getCharacter(): Get current character state');
            console.log('  - toggleEditMode(): Toggle edit mode');
            console.log('  - openDrawerToStep(n): Open drawer to wizard step n');
        }
    }, [loadDemoCharacter, resetCharacter, character, validation, isEditMode, isHomebrewMode, openDrawerToStep, wizardStep, setWizardStep]);

    // ===== CONTEXT VALUE =====
    const contextValue: PlayerCharacterGeneratorContextType = {
        // Character state
        character,
        setCharacter: handleSetCharacter,
        updateCharacter,
        resetCharacter,
        loadDemoCharacter,
        demoCharacterOptions: DEMO_CHARACTER_OPTIONS,
        updateDnD5eData,

        // Rule Engine
        ruleEngine,

        // Validation (from engine)
        validation,
        isCharacterValid,

        // Edit mode
        isEditMode,
        setIsEditMode,
        isHomebrewMode,
        setIsHomebrewMode,

        // Drawer/wizard control
        wizardStep,
        setWizardStep,
        isDrawerOpen,
        setDrawerOpen,
        openDrawerToStep,

        // Project management (Phase 4)
        currentProject,
        saveStatus,
        isLoadingProjects,
        createProject,
        saveProject,
        loadProject,
        deleteProject,
        listProjects,

        // Project state management
        clearCurrentProject,
        isUnsavedNewCharacter
    };

    return (
        <PlayerCharacterGeneratorContext.Provider value={contextValue}>
            {children}
        </PlayerCharacterGeneratorContext.Provider>
    );
};

/**
 * Hook to use PlayerCharacterGenerator context
 * 
 * @throws {Error} if used outside PlayerCharacterGeneratorProvider
 */
export const usePlayerCharacterGenerator = (): PlayerCharacterGeneratorContextType => {
    const context = useContext(PlayerCharacterGeneratorContext);
    if (!context) {
        throw new Error('usePlayerCharacterGenerator must be used within PlayerCharacterGeneratorProvider');
    }
    return context;
};
