/**
 * CharacterGenerator Context Provider
 * 
 * Centralized state management for character creation and editing.
 * Follows the proven StatBlockGeneratorProvider pattern.
 * 
 * @module CharacterGenerator
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Character, createEmptyCharacter, DnD5eCharacter, createEmptyDnD5eCharacter } from './types';

/**
 * Character Generator context type
 */
interface CharacterGeneratorContextType {
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
const CharacterGeneratorContext = createContext<CharacterGeneratorContextType | undefined>(undefined);

/**
 * Provider Props
 */
interface CharacterGeneratorProviderProps {
    children: ReactNode;
}

/**
 * CharacterGenerator Provider Component
 * 
 * Provides character state and mutations to all child components.
 */
export const CharacterGeneratorProvider: React.FC<CharacterGeneratorProviderProps> = ({ children }) => {
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
        console.log('📝 [CharacterGenerator] Setting character:', newCharacter.name);
        setCharacter(newCharacter);
    }, []);
    
    /**
     * Update character fields (shallow merge)
     */
    const updateCharacter = useCallback((updates: Partial<Character>) => {
        setCharacter(prev => {
            if (!prev) return prev;
            const updated = { ...prev, ...updates };
            console.log('📝 [CharacterGenerator] Updated character:', updated.name);
            return updated;
        });
    }, []);
    
    /**
     * Reset to empty character
     */
    const resetCharacter = useCallback(() => {
        console.log('🔄 [CharacterGenerator] Resetting character');
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
                console.warn('⚠️ [CharacterGenerator] Cannot update D&D 5e data: character not initialized');
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
            
            console.log('📝 [CharacterGenerator] Updated D&D 5e data');
            return updated;
        });
    }, []);
    
    // ===== CONTEXT VALUE =====
    const contextValue: CharacterGeneratorContextType = {
        character,
        setCharacter: handleSetCharacter,
        updateCharacter,
        resetCharacter,
        updateDnD5eData,
        validationErrors,
        setValidationErrors
    };
    
    return (
        <CharacterGeneratorContext.Provider value={contextValue}>
            {children}
        </CharacterGeneratorContext.Provider>
    );
};

/**
 * Hook to use CharacterGenerator context
 * 
 * @throws {Error} if used outside CharacterGeneratorProvider
 */
export const useCharacterGenerator = (): CharacterGeneratorContextType => {
    const context = useContext(CharacterGeneratorContext);
    if (!context) {
        throw new Error('useCharacterGenerator must be used within CharacterGeneratorProvider');
    }
    return context;
};

