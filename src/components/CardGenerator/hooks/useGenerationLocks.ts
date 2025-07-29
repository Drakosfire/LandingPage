import { useState, useCallback } from 'react';

export interface GenerationLocks {
    textGeneration: boolean;
    coreImageGeneration: boolean;
    borderGeneration: boolean;
    finalCardGeneration: boolean;
}

export interface UseGenerationLocksReturn {
    // State
    generationLocks: GenerationLocks;
    isAnyGenerationInProgress: boolean;

    // Actions
    setGenerationLock: (lockType: keyof GenerationLocks, isLocked: boolean) => void;
    setAllLocks: (locks: GenerationLocks) => void;
    clearAllLocks: () => void;

    // Utilities
    getLockStatus: (lockType: keyof GenerationLocks) => boolean;
    getActiveLocks: () => (keyof GenerationLocks)[];
}

export const useGenerationLocks = (): UseGenerationLocksReturn => {
    // GENERATION LOCK SYSTEM - Prevent navigation during async operations
    const [generationLocks, setGenerationLocks] = useState<GenerationLocks>({
        textGeneration: false,      // Step 1: ItemForm text generation
        coreImageGeneration: false, // Step 2: CoreImageGallery image generation  
        borderGeneration: false,    // Step 3: Step3BorderGeneration card generation
        finalCardGeneration: false  // Step 5: CardWithTextGallery final card generation
    });

    // Computed lock state - true if ANY generation is in progress
    const isAnyGenerationInProgress = Object.values(generationLocks).some(lock => lock);

    // Lock management functions
    const setGenerationLock = useCallback((lockType: keyof GenerationLocks, isLocked: boolean) => {
        setGenerationLocks(prev => ({
            ...prev,
            [lockType]: isLocked
        }));
    }, []);

    // Set all locks at once
    const setAllLocks = useCallback((locks: GenerationLocks) => {
        setGenerationLocks(locks);
    }, []);

    // Clear all locks
    const clearAllLocks = useCallback(() => {
        setGenerationLocks({
            textGeneration: false,
            coreImageGeneration: false,
            borderGeneration: false,
            finalCardGeneration: false
        });
    }, []);

    // Get status of specific lock
    const getLockStatus = useCallback((lockType: keyof GenerationLocks): boolean => {
        return generationLocks[lockType];
    }, [generationLocks]);

    // Get list of active locks
    const getActiveLocks = useCallback((): (keyof GenerationLocks)[] => {
        return Object.entries(generationLocks)
            .filter(([_, isLocked]) => isLocked)
            .map(([lockType, _]) => lockType as keyof GenerationLocks);
    }, [generationLocks]);

    return {
        // State
        generationLocks,
        isAnyGenerationInProgress,

        // Actions
        setGenerationLock,
        setAllLocks,
        clearAllLocks,

        // Utilities
        getLockStatus,
        getActiveLocks
    };
};