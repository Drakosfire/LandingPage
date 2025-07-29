// useGlobalSession Hook - Global Session Integration for CardGenerator
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { GlobalSessionAPI } from '../services/globalSessionAPI';
import { GlobalObjectsAPI } from '../services/globalObjectsAPI';
import {
    EnhancedGlobalSession,
    CardGeneratorSessionState,
    DungeonMindObject
} from '../types/globalSession.types';

export interface GlobalSessionHook {
    // Session Management
    session: EnhancedGlobalSession | null;
    isLoading: boolean;
    error: string | null;

    // Tool State Management
    cardGeneratorState: CardGeneratorSessionState | null;
    updateToolState: (updates: Partial<CardGeneratorSessionState>) => Promise<void>;

    // Cross-Tool Features
    clipboard: string[]; // Object IDs
    recentObjects: DungeonMindObject[];
    addToClipboard: (objectId: string) => Promise<void>;
    removeFromClipboard: (objectId: string) => Promise<void>;

    // Session Lifecycle
    createSession: () => Promise<void>;
    restoreSession: () => Promise<void>;
    saveSession: () => Promise<void>;

    // Object Management
    saveAsGlobalObject: (objectData: Partial<DungeonMindObject>) => Promise<string>;
    loadGlobalObject: (objectId: string) => Promise<DungeonMindObject | null>;
    searchObjects: (query: string, type?: DungeonMindObject['type']) => Promise<DungeonMindObject[]>;
}

const DEFAULT_CARD_GENERATOR_STATE: CardGeneratorSessionState = {
    currentStepId: 'text-generation',
    stepCompletion: {},
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
        generatedCardImages: []
    },
    generatedContent: {
        images: [],
        renderedCards: []
    },
    autoSaveEnabled: true
};

export const useGlobalSession = (): GlobalSessionHook => {
    const { userId, isLoggedIn } = useAuth();
    const [session, setSession] = useState<EnhancedGlobalSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [recentObjects, setRecentObjects] = useState<DungeonMindObject[]>([]);

    // Auto-save timer ref
    const autoSaveTimerRef = useRef<NodeJS.Timeout>();
    const hasUnsavedChanges = useRef(false);

    // Clear error helper
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Create new session
    const createSession = useCallback(async () => {
        try {
            setIsLoading(true);
            clearError();

            const response = await GlobalSessionAPI.createSession({
                platform: 'web',
                user_id: userId || undefined
            });

            setSession(response.session);
            console.log('Global session created:', response.session_id);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
            setError(errorMessage);
            console.error('Failed to create session:', err);
        } finally {
            setIsLoading(false);
        }
    }, [userId, clearError]);

    // Restore existing session
    const restoreSession = useCallback(async () => {
        try {
            setIsLoading(true);
            clearError();

            const response = await GlobalSessionAPI.restoreSession();

            if (response.found && response.session) {
                setSession(response.session);
                console.log('Global session restored:', response.session.session_id);

                // Load recent objects
                try {
                    const recentObjectIds = await GlobalSessionAPI.getRecentObjects();
                    if (recentObjectIds.length > 0) {
                        // Fetch object details for recent objects
                        const objects = await Promise.allSettled(
                            recentObjectIds.map(id => GlobalObjectsAPI.getObject(id))
                        );

                        const validObjects = objects
                            .filter((result): result is PromiseFulfilledResult<DungeonMindObject> =>
                                result.status === 'fulfilled')
                            .map(result => result.value);

                        setRecentObjects(validObjects);
                    }
                } catch (recentErr) {
                    console.warn('Failed to load recent objects:', recentErr);
                }
            } else {
                // No existing session, create new one
                await createSession();
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to restore session';
            setError(errorMessage);
            console.error('Failed to restore session:', err);

            // Try to create new session as fallback
            try {
                await createSession();
            } catch (createErr) {
                console.error('Failed to create fallback session:', createErr);
            }
        } finally {
            setIsLoading(false);
        }
    }, [createSession, clearError]);

    // Update CardGenerator tool state
    const updateToolState = useCallback(async (updates: Partial<CardGeneratorSessionState>) => {
        if (!session) return;

        try {
            const currentState = session.cardgenerator || DEFAULT_CARD_GENERATOR_STATE;
            const newState: CardGeneratorSessionState = {
                ...currentState,
                ...updates,
                lastSaved: new Date().toISOString()
            };

            // Update local state immediately for responsiveness
            setSession(prev => prev ? {
                ...prev,
                cardgenerator: newState
            } : null);

            // Mark as having unsaved changes
            hasUnsavedChanges.current = true;

            // Auto-save after a delay
            if (newState.autoSaveEnabled) {
                if (autoSaveTimerRef.current) {
                    clearTimeout(autoSaveTimerRef.current);
                }

                autoSaveTimerRef.current = setTimeout(async () => {
                    try {
                        await GlobalSessionAPI.updateCardGeneratorState(newState);
                        hasUnsavedChanges.current = false;
                        console.log('Auto-saved CardGenerator state');
                    } catch (autoSaveErr) {
                        console.warn('Auto-save failed:', autoSaveErr);
                    }
                }, 2000); // 2 second delay
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update tool state';
            setError(errorMessage);
            console.error('Failed to update tool state:', err);
        }
    }, [session]);

    // Manual save session
    const saveSession = useCallback(async () => {
        if (!session?.cardgenerator || !hasUnsavedChanges.current) return;

        try {
            await GlobalSessionAPI.updateCardGeneratorState(session.cardgenerator);
            hasUnsavedChanges.current = false;
            console.log('Manually saved CardGenerator state');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save session';
            setError(errorMessage);
            console.error('Failed to save session:', err);
            throw err; // Re-throw for caller to handle
        }
    }, [session]);

    // Add to clipboard
    const addToClipboard = useCallback(async (objectId: string) => {
        try {
            await GlobalSessionAPI.addToClipboard(objectId);

            // Update local session state
            setSession(prev => prev ? {
                ...prev,
                clipboard: [...prev.clipboard.filter(id => id !== objectId), objectId]
            } : null);
        } catch (err) {
            console.error('Failed to add to clipboard:', err);
            throw err;
        }
    }, []);

    // Remove from clipboard
    const removeFromClipboard = useCallback(async (objectId: string) => {
        try {
            await GlobalSessionAPI.removeFromClipboard(objectId);

            // Update local session state
            setSession(prev => prev ? {
                ...prev,
                clipboard: prev.clipboard.filter(id => id !== objectId)
            } : null);
        } catch (err) {
            console.error('Failed to remove from clipboard:', err);
            throw err;
        }
    }, []);

    // Save object to global database
    const saveAsGlobalObject = useCallback(async (objectData: Partial<DungeonMindObject>): Promise<string> => {
        try {
            const createRequest = {
                type: objectData.type || 'item',
                name: objectData.name || 'Untitled',
                description: objectData.description || '',
                itemData: objectData.itemData,
                worldId: session?.active_world_id,
                projectId: session?.active_project_id,
                visibility: objectData.visibility || session?.preferences.defaultVisibility || 'private',
                tags: objectData.tags || []
            };

            const result = await GlobalObjectsAPI.createObject(createRequest);

            // Add to recent objects
            setRecentObjects(prev => [result, ...prev.slice(0, 9)]);

            return result.id;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save object';
            setError(errorMessage);
            console.error('Failed to save object:', err);
            throw err;
        }
    }, [session]);

    // Load global object
    const loadGlobalObject = useCallback(async (objectId: string): Promise<DungeonMindObject | null> => {
        try {
            const object = await GlobalObjectsAPI.getObject(objectId);

            // Add to recent objects if not already there
            setRecentObjects(prev => {
                const filtered = prev.filter(obj => obj.id !== objectId);
                return [object, ...filtered.slice(0, 9)];
            });

            return object;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load object';
            setError(errorMessage);
            console.error('Failed to load object:', err);
            return null;
        }
    }, []);

    // Search objects
    const searchObjects = useCallback(async (
        query: string,
        type?: DungeonMindObject['type']
    ): Promise<DungeonMindObject[]> => {
        try {
            return await GlobalObjectsAPI.searchObjects({
                query,
                type,
                worldId: session?.active_world_id,
                projectId: session?.active_project_id,
                limit: 20
            });
        } catch (err) {
            console.error('Failed to search objects:', err);
            return [];
        }
    }, [session]);

    // Initialize session on mount or auth change
    useEffect(() => {
        if (isLoggedIn) {
            restoreSession();
        } else {
            // Create anonymous session for non-logged-in users
            createSession();
        }

        // Cleanup auto-save timer on unmount
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [isLoggedIn, restoreSession, createSession]);

    // Save before page unload
    useEffect(() => {
        const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
            if (hasUnsavedChanges.current) {
                event.preventDefault();
                event.returnValue = '';

                // Try to save quickly
                try {
                    await saveSession();
                } catch (err) {
                    console.warn('Failed to save on page unload:', err);
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [saveSession]);

    // Extract CardGenerator state
    const cardGeneratorState = session?.cardgenerator || null;
    const clipboard = session?.clipboard || [];

    return {
        // Session Management
        session,
        isLoading,
        error,

        // Tool State Management
        cardGeneratorState,
        updateToolState,

        // Cross-Tool Features
        clipboard,
        recentObjects,
        addToClipboard,
        removeFromClipboard,

        // Session Lifecycle
        createSession,
        restoreSession,
        saveSession,

        // Object Management
        saveAsGlobalObject,
        loadGlobalObject,
        searchObjects
    };
}; 