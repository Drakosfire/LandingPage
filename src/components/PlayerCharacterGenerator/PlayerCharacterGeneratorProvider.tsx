/**
 * PlayerCharacterGenerator Context Provider
 * 
 * Centralized state management for player character creation and editing.
 * Follows the proven StatBlockGeneratorProvider pattern.
 * 
 * @module PlayerCharacterGenerator
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Character, createEmptyCharacter, DnD5eCharacter, createEmptyDnD5eCharacter } from './types';

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
    
    // ===== VALIDATION =====
    validationErrors: ValidationError[];
    setValidationErrors: (errors: ValidationError[]) => void;
    
    // ===== PROJECT MANAGEMENT (Phase 7) =====
    // currentProject: CharacterProject | null;
    // saveProject: () => Promise<void>;
    // loadProject: (id: string) => Promise<void>;
}

/**
 * Validation error type (temporary - will move to types/)
 */
interface ValidationError {
    level: 'error' | 'warning' | 'info';
    step: number;
    field?: string;
    message: string;
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
    // ===== STATE =====
    const [character, setCharacter] = useState<Character | null>(() => {
        // Phase 0: Just create empty D&D 5e character
        // Phase 1+: Try to restore from localStorage
        const empty = createEmptyCharacter();
        empty.dnd5eData = createEmptyDnD5eCharacter();
        return empty;
    });
    
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    
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
        setValidationErrors([]);
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
        character,
        setCharacter: handleSetCharacter,
        updateCharacter,
        resetCharacter,
        updateDnD5eData,
        validationErrors,
        setValidationErrors
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

// Alias for backward compatibility during migration
export const useCharacterGenerator = usePlayerCharacterGenerator;

