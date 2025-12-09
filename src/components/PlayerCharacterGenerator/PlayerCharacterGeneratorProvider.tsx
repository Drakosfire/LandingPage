/**
 * PlayerCharacterGenerator Context Provider
 * 
 * Centralized state management for player character creation and editing.
 * Follows the proven StatBlockGeneratorProvider pattern.
 * 
 * @module PlayerCharacterGenerator
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { Character, createEmptyCharacter, DnD5eCharacter, createEmptyDnD5eCharacter } from './types';
import { DnD5eRuleEngine, createDnD5eRuleEngine } from './engine';
import type { ValidationResult } from './engine';
import { DEMO_CHARACTERS, getDemoCharacter, DEMO_CHARACTER_OPTIONS } from './canvasComponents/demoData';

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
    // currentProject: CharacterProject | null;
    // saveProject: () => Promise<void>;
    // loadProject: (id: string) => Promise<void>;
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
        openDrawerToStep
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
