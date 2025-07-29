// Global Objects API Service
import {
    DungeonMindObject,
    CreateObjectRequest,
    ObjectSearchRequest
} from '../types/globalSession.types';
import { DUNGEONMIND_API_URL } from '../config';

export class GlobalObjectsAPI {
    private static baseUrl = `${DUNGEONMIND_API_URL}/api/objects`;

    /**
     * Create a new global object
     */
    static async createObject(request: CreateObjectRequest): Promise<DungeonMindObject> {
        const response = await fetch(`${this.baseUrl}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include session cookies
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            throw new Error(`Failed to create object: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get a specific object by ID
     */
    static async getObject(objectId: string): Promise<DungeonMindObject> {
        const response = await fetch(`${this.baseUrl}/${objectId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include session cookies
        });

        if (!response.ok) {
            throw new Error(`Failed to get object: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Search for objects
     */
    static async searchObjects(request: ObjectSearchRequest = {}): Promise<DungeonMindObject[]> {
        const params = new URLSearchParams();

        if (request.query) params.append('query', request.query);
        if (request.type) params.append('type', request.type);
        if (request.worldId) params.append('worldId', request.worldId);
        if (request.projectId) params.append('projectId', request.projectId);
        if (request.visibility) params.append('visibility', request.visibility);
        if (request.limit) params.append('limit', request.limit.toString());
        if (request.offset) params.append('offset', request.offset.toString());

        if (request.tags && request.tags.length > 0) {
            request.tags.forEach(tag => params.append('tags', tag));
        }

        const response = await fetch(`${this.baseUrl}/search?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include session cookies
        });

        if (!response.ok) {
            throw new Error(`Failed to search objects: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Update an existing object
     */
    static async updateObject(objectId: string, updates: Partial<DungeonMindObject>): Promise<DungeonMindObject> {
        const response = await fetch(`${this.baseUrl}/${objectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include session cookies
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            throw new Error(`Failed to update object: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Delete an object
     */
    static async deleteObject(objectId: string): Promise<boolean> {
        const response = await fetch(`${this.baseUrl}/${objectId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include session cookies
        });

        if (!response.ok) {
            throw new Error(`Failed to delete object: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }
} 