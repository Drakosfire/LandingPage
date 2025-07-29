// Global Session API Service
import {
    EnhancedGlobalSession,
    CreateSessionRequest,
    CreateSessionResponse,
    RestoreSessionResponse,
    UpdateToolStateRequest,
    CardGeneratorSessionState,
    StoreGeneratorSessionState,
    RulesLawyerSessionState
} from '../types/globalSession.types';
import { DUNGEONMIND_API_URL } from '../config';

export class GlobalSessionAPI {
    private static baseUrl = `${DUNGEONMIND_API_URL}/api/session`;

    /**
     * Create a new global session
     */
    static async createSession(request: CreateSessionRequest = {}): Promise<CreateSessionResponse> {
        const response = await fetch(`${this.baseUrl}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include session cookies
            body: JSON.stringify({
                platform: request.platform || 'web',
                user_id: request.user_id
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to create session: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Restore existing session
     */
    static async restoreSession(sessionId?: string): Promise<RestoreSessionResponse> {
        const requestBody = {
            session_id: sessionId,
            fallback_to_new: true
        };

        const response = await fetch(`${this.baseUrl}/restore`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Failed to restore session: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Update tool-specific state in global session
     */
    static async updateToolState(
        toolName: 'cardgenerator' | 'storegenerator' | 'ruleslawyer',
        state: CardGeneratorSessionState | StoreGeneratorSessionState | RulesLawyerSessionState
    ): Promise<EnhancedGlobalSession> {
        const response = await fetch(`${this.baseUrl}/tools/${toolName}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ state })
        });

        if (!response.ok) {
            throw new Error(`Failed to update ${toolName} state: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Update CardGenerator state specifically
     */
    static async updateCardGeneratorState(state: CardGeneratorSessionState): Promise<EnhancedGlobalSession> {
        const response = await fetch(`${this.baseUrl}/cardgenerator/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ state })
        });

        if (!response.ok) {
            throw new Error(`Failed to update CardGenerator state: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get recently viewed objects across all tools
     */
    static async getRecentObjects(): Promise<string[]> {
        const response = await fetch(`${this.baseUrl}/recent-objects`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to get recent objects: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.recent_objects || [];
    }

    /**
     * Add object to cross-tool clipboard
     */
    static async addToClipboard(objectId: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/clipboard/add/${objectId}`, {
            method: 'POST',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to add to clipboard: ${response.status} ${response.statusText}`);
        }
    }

    /**
     * Remove object from cross-tool clipboard
     */
    static async removeFromClipboard(objectId: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/clipboard/remove/${objectId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to remove from clipboard: ${response.status} ${response.statusText}`);
        }
    }

    /**
     * Get current session state
     */
    static async getCurrentSession(): Promise<EnhancedGlobalSession | null> {
        try {
            const response = await this.restoreSession();
            return response.found ? response.session || null : null;
        } catch (error) {
            console.error('Failed to get current session:', error);
            return null;
        }
    }

    /**
     * Update session preferences
     */
    static async updatePreferences(preferences: Partial<EnhancedGlobalSession['preferences']>): Promise<EnhancedGlobalSession> {
        const response = await fetch(`${this.baseUrl}/preferences`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ preferences })
        });

        if (!response.ok) {
            throw new Error(`Failed to update preferences: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Set active world/campaign
     */
    static async setActiveWorld(worldId: string): Promise<EnhancedGlobalSession> {
        const response = await fetch(`${this.baseUrl}/active-world`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ world_id: worldId })
        });

        if (!response.ok) {
            throw new Error(`Failed to set active world: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Set active project
     */
    static async setActiveProject(projectId: string): Promise<EnhancedGlobalSession> {
        const response = await fetch(`${this.baseUrl}/active-project`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ project_id: projectId })
        });

        if (!response.ok) {
            throw new Error(`Failed to set active project: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }
} 