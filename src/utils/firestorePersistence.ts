import { CardGeneratorState, RenderedCard, GeneratedImage } from '../types/card.types';
import { DUNGEONMIND_API_URL } from '../config';

const STORAGE_VERSION = '1.0.0';

// Generate unique session ID
export const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create initial state
export const createInitialState = (): CardGeneratorState => ({
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
});

// Convert Blob to base64 string for serialization
export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1]; // Remove data URL prefix
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// Convert base64 string back to Blob
export const base64ToBlob = (base64: string, mimeType: string = 'image/png'): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

// Save state to Firestore (primary) with localStorage fallback
export const saveCardSession = async (
    state: CardGeneratorState,
    templateBlob?: Blob | null,
    userId?: string,
    cardName?: string,
    isAutoSave: boolean = true
): Promise<boolean> => {
    try {
        // Prepare state for Firestore (exclude templateBlob to avoid size limits)
        const firestoreState = { ...state };

        // Remove templateBlob from Firestore state to avoid 1MB document size limit
        // templateBlob will only be stored in localStorage
        delete firestoreState.selectedAssets.templateBlob;

        // Update metadata - convert timestamp to string as expected by backend
        firestoreState.lastSaved = Date.now().toString();

        // Prepare Firestore request with camelCase format to match backend
        const sessionData = {
            userId: userId || null,
            currentStepId: firestoreState.currentStepId,
            stepCompletion: firestoreState.stepCompletion,
            itemDetails: firestoreState.itemDetails,
            selectedAssets: firestoreState.selectedAssets,
            generatedContent: firestoreState.generatedContent,
            autoSaveEnabled: firestoreState.autoSaveEnabled,
            lastSaved: firestoreState.lastSaved
        };

        const requestBody = {
            sessionData: sessionData,
            cardName: cardName || null,
            isAutoSave: isAutoSave
        };

        // Save to Firestore
        const response = await fetch(`${DUNGEONMIND_API_URL}/api/cardgenerator/save-card-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',  // Include session cookies
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Saved to Firestore:', result.message);

            // Save complete state (including templateBlob) to localStorage
            const localStorageState = { ...state };
            if (templateBlob) {
                localStorageState.selectedAssets.templateBlob = await blobToBase64(templateBlob);
            }

            try {
                localStorage.setItem('cardGenerator_state', JSON.stringify(localStorageState));
                console.log('Cached in localStorage with templateBlob');
            } catch (localError) {
                console.warn('Failed to cache in localStorage:', localError);
            }

            return true;
        } else {
            console.error('Failed to save to Firestore:', response.status);
            // Fallback to localStorage only
            return await saveToLocalStorageOnly(state, templateBlob);
        }

    } catch (error) {
        console.error('Error saving to Firestore:', error);
        // Fallback to localStorage only
        return await saveToLocalStorageOnly(state, templateBlob);
    }
};

// localStorage fallback function
const saveToLocalStorageOnly = async (state: CardGeneratorState, templateBlob?: Blob | null): Promise<boolean> => {
    try {
        const localStorageState = { ...state };
        if (templateBlob) {
            localStorageState.selectedAssets.templateBlob = await blobToBase64(templateBlob);
        }
        localStorage.setItem('cardGenerator_state', JSON.stringify(localStorageState));
        console.log('Saved to localStorage (fallback)');
        return true;
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
        return false;
    }
};

// Load state from Firestore (primary) with localStorage fallback
export const loadCardSession = async (
    sessionId?: string,
    userId?: string
): Promise<{ state: CardGeneratorState | null; templateBlob: Blob | null }> => {
    try {
        // Validate parameters to prevent API calls with both undefined/null
        const hasSessionId = sessionId && sessionId.trim() !== '';
        const hasUserId = userId && userId.trim() !== '';

        console.log('loadCardSession called with:', {
            sessionId: sessionId || 'undefined',
            userId: userId || 'undefined',
            hasSessionId,
            hasUserId
        });

        // If neither parameter is valid, skip Firestore and go directly to localStorage
        if (!hasSessionId && !hasUserId) {
            console.log('No valid sessionId or userId provided, skipping Firestore call');
            return loadFromLocalStorageOnly();
        }

        // Try to load from Firestore first
        const params = new URLSearchParams();
        if (hasSessionId) params.append('sessionId', sessionId!);
        if (hasUserId) params.append('userId', userId!);

        console.log('Making Firestore request with params:', params.toString());

        const response = await fetch(`${DUNGEONMIND_API_URL}/api/cardgenerator/load-card-session?${params}`, {
            credentials: 'include' // Include session cookies
        });

        if (response.ok) {
            const result = await response.json();

            if (result.found && result.sessionData) {
                console.log('Loaded from Firestore');

                // Restore blob if present
                let templateBlob: Blob | null = null;
                if (result.sessionData.selectedAssets?.templateBlob) {
                    try {
                        templateBlob = base64ToBlob(result.sessionData.selectedAssets.templateBlob);
                        // Remove base64 from state to keep it clean
                        delete result.sessionData.selectedAssets.templateBlob;
                    } catch (blobError) {
                        console.warn('Failed to restore template blob:', blobError);
                    }
                }

                // Cache in localStorage for immediate access
                try {
                    localStorage.setItem('cardGenerator_state', JSON.stringify(result.sessionData));
                } catch (localError) {
                    console.warn('Failed to cache in localStorage:', localError);
                }

                return { state: result.sessionData, templateBlob };
            }
        } else {
            console.log(`Firestore request failed with status: ${response.status}`);
        }

        console.log('No Firestore data found, trying localStorage...');

    } catch (error) {
        console.error('Error loading from Firestore:', error);
    }

    // Fallback to localStorage
    return loadFromLocalStorageOnly();
};

// localStorage fallback function
const loadFromLocalStorageOnly = (): { state: CardGeneratorState | null; templateBlob: Blob | null } => {
    try {
        const savedData = localStorage.getItem('cardGenerator_state');
        if (!savedData) {
            return { state: null, templateBlob: null };
        }

        // Check if saved state is compatible with current version
        // Note: Version checking removed as new CardGeneratorState doesn't include metadata
        const savedState: CardGeneratorState = JSON.parse(savedData);

        // Restore blob if present
        let templateBlob: Blob | null = null;
        if (savedState.selectedAssets.templateBlob && typeof savedState.selectedAssets.templateBlob === 'string') {
            try {
                templateBlob = base64ToBlob(savedState.selectedAssets.templateBlob);
                // Remove base64 from state to keep it clean
                delete savedState.selectedAssets.templateBlob;
            } catch (blobError) {
                console.warn('Failed to restore template blob:', blobError);
            }
        }

        console.log('Loaded from localStorage (fallback)');
        return { state: savedState, templateBlob };

    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        localStorage.removeItem('cardGenerator_state');
        return { state: null, templateBlob: null };
    }
};

// List user sessions from Firestore
export const listUserSessions = async (userId: string, includeAutoSaves: boolean = false) => {
    try {
        const params = new URLSearchParams({
            userId: userId,
            includeAutoSaves: includeAutoSaves.toString()
        });

        const response = await fetch(`${DUNGEONMIND_API_URL}/api/cardgenerator/list-user-sessions?${params}`, {
            credentials: 'include' // Include session cookies
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.error('Failed to list user sessions:', response.status);
            return { success: false, namedSaves: [], totalNamed: 0 };
        }

    } catch (error) {
        console.error('Error listing user sessions:', error);
        return { success: false, namedSaves: [], totalNamed: 0 };
    }
};

// Delete session from Firestore
export const deleteCardSession = async (sessionId: string, userId?: string): Promise<boolean> => {
    try {
        const params = new URLSearchParams({ sessionId: sessionId });
        if (userId) params.append('userId', userId);

        const response = await fetch(`${DUNGEONMIND_API_URL}/api/cardgenerator/delete-card-session?${params}`, {
            method: 'DELETE',
            credentials: 'include' // Include session cookies
        });

        if (response.ok) {
            console.log('Session deleted from Firestore');
            return true;
        } else {
            console.error('Failed to delete session:', response.status);
            return false;
        }

    } catch (error) {
        console.error('Error deleting session:', error);
        return false;
    }
};

// Clear local cache
export const clearLocalCache = (): void => {
    try {
        localStorage.removeItem('cardGenerator_state');
        console.log('Cleared localStorage cache');
    } catch (error) {
        console.warn('Failed to clear localStorage:', error);
    }
};

// Save project with custom name (not auto-save)
export const saveNamedProject = async (
    state: CardGeneratorState,
    projectName: string,
    templateBlob?: Blob | null,
    userId?: string
): Promise<boolean> => {
    console.log(`Saving project "${projectName}" for user ${userId}`);
    return await saveCardSession(state, templateBlob, userId, projectName, false);
};

// Debounce utility for auto-save with cancel method
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } => {
    let timeoutId: NodeJS.Timeout;

    const debouncedFunc = (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };

    debouncedFunc.cancel = () => {
        clearTimeout(timeoutId);
    };

    return debouncedFunc;
}; 