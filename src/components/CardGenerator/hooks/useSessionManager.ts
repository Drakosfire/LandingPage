import { useState, useCallback, useRef, useEffect } from 'react';
import { CardGeneratorState } from '../../../types/card.types';
import { saveCardSession, loadCardSession, debounce } from '../../../utils/firestorePersistence';
import { useAuth } from '../../../context/AuthContext';

export interface UseSessionManagerReturn {
    // State
    lastSaved: number;
    saveStatus: 'idle' | 'saving' | 'saved' | 'error';

    // Actions
    setLastSaved: (timestamp: number) => void;
    setSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void;

    // Session operations
    saveSession: (state: CardGeneratorState) => Promise<void>;
    loadSession: () => Promise<CardGeneratorState | null>;
    restoreProjectState: (state: CardGeneratorState) => void;

    // Auto-save
    setupAutoSave: (state: CardGeneratorState) => void;
    clearAutoSave: () => void;
}

export const useSessionManager = (
    onStateRestore: (state: CardGeneratorState) => void
): UseSessionManagerReturn => {
    // Session state
    const [lastSaved, setLastSaved] = useState<number>(0);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    // Refs for session management
    const isRestoringState = useRef(false);
    const initialLoadComplete = useRef(false);
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Authentication
    const { userId, isLoggedIn, authState } = useAuth();

    // Save session to Firestore
    const saveSession = useCallback(async (state: CardGeneratorState) => {
        if (!isLoggedIn || !userId) {
            console.warn('🔒 Cannot save session: User not logged in');
            return;
        }

        try {
            setSaveStatus('saving');
            console.log('💾 Auto-saving session...');

            await saveCardSession(state);
            setLastSaved(Date.now());
            setSaveStatus('saved');

            console.log('💾 Session saved successfully');

            // Reset save status after 2 seconds
            setTimeout(() => setSaveStatus('idle'), 2000);

        } catch (error) {
            console.error('💾 Failed to save session:', error);
            setSaveStatus('error');

            // Reset error status after 5 seconds
            setTimeout(() => setSaveStatus('idle'), 5000);
        }
    }, [isLoggedIn, userId]);

    // Load session from Firestore
    const loadSession = useCallback(async (): Promise<CardGeneratorState | null> => {
        if (!isLoggedIn || !userId) {
            console.warn('🔒 Cannot load session: User not logged in');
            return null;
        }

        if (isRestoringState.current) {
            console.log('🔄 Session restore already in progress, skipping...');
            return null;
        }

        isRestoringState.current = true;

        try {
            console.log('📂 Loading session from Firestore...');

            const sessionResult = await loadCardSession();

            if (sessionResult && sessionResult.state) {
                console.log('📂 Session loaded successfully');
                return sessionResult.state;
            } else {
                console.log('📂 No saved session found');
                return null;
            }

        } catch (error) {
            console.error('📂 Failed to load session:', error);
            return null;
        } finally {
            isRestoringState.current = false;
        }
    }, [isLoggedIn, userId]);

    // Restore project state from loaded data
    const restoreProjectState = useCallback((state: CardGeneratorState) => {
        if (isRestoringState.current) {
            console.log('🔄 State restore already in progress, skipping...');
            return;
        }

        console.log('🔄 Restoring project state from session');

        // Call the parent's state restore function
        onStateRestore(state);

        console.log('🔄 Project state restored successfully');
    }, [onStateRestore]);

    // Setup auto-save with debouncing
    const setupAutoSave = useCallback((state: CardGeneratorState) => {
        if (!isLoggedIn || !userId) {
            return;
        }

        // Clear existing timeout
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        // Set up new auto-save with 2 second debounce
        const debouncedSave = debounce(() => {
            saveSession(state);
        }, 2000);

        // Store the timeout ID for cleanup
        autoSaveTimeoutRef.current = setTimeout(() => {
            debouncedSave();
        }, 2000);
    }, [isLoggedIn, userId, saveSession]);

    // Clear auto-save timeout
    const clearAutoSave = useCallback(() => {
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
            autoSaveTimeoutRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearAutoSave();
        };
    }, [clearAutoSave]);

    return {
        // State
        lastSaved,
        saveStatus,

        // Actions
        setLastSaved,
        setSaveStatus,

        // Session operations
        saveSession,
        loadSession,
        restoreProjectState,

        // Auto-save
        setupAutoSave,
        clearAutoSave
    };
};