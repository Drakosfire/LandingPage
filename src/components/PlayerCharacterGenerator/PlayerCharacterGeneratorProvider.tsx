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

    // ===== D&D 5E SPECIFIC =====
    updateDnD5eData: (updates: Partial<DnD5eCharacter>) => void;

    // ===== RULE ENGINE =====
    ruleEngine: DnD5eRuleEngine;

    // ===== VALIDATION (from Rule Engine) =====
    validation: ValidationResult;
    isCharacterValid: boolean;

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

    // ===== STATE =====
    const [character, setCharacter] = useState<Character | null>(() => {
        // Phase 0: Just create empty D&D 5e character
        // Phase 4+: Try to restore from localStorage
        const empty = createEmptyCharacter();
        empty.dnd5eData = createEmptyDnD5eCharacter();
        return empty;
    });

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

    // ===== CONTEXT VALUE =====
    const contextValue: PlayerCharacterGeneratorContextType = {
        // Character state
        character,
        setCharacter: handleSetCharacter,
        updateCharacter,
        resetCharacter,
        updateDnD5eData,

        // Rule Engine
        ruleEngine,

        // Validation (from engine)
        validation,
        isCharacterValid
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
