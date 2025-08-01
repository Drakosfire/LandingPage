// Project API Service
import { DUNGEONMIND_API_URL } from '../config';
import { Project, ProjectSummary, CardGeneratorState, CreateProjectData } from '../types/card.types';

// Backend data structure (what the API returns)
interface BackendCardSessionData {
    sessionId: string;
    userId?: string;
    currentStep: string;
    stepCompletion: Record<string, boolean>;
    itemDetails: Record<string, any>;
    selectedAssets: {
        finalImage?: string;
        border?: string;
        seedImage?: string;
        templateBlob?: string;
        generatedCardImages: string[];
        selectedGeneratedCardImage?: string;
        finalCardWithText?: string;
    };
    generatedContent: {
        images: any[];
        renderedCards: any[];
    };
    metadata: {
        lastSaved?: string;
        version?: string;
        platform?: string;
    };
}

// Transform backend data to frontend structure
export function transformBackendState(
    backendState: BackendCardSessionData,
    projectFallback?: { name?: string; description?: string }
): CardGeneratorState {
    // Safely transform itemDetails with proper type checking
    const itemDetails = backendState.itemDetails || {};

    // Use project-level data as fallback when itemDetails is empty
    const hasItemData = Object.keys(itemDetails).some(key =>
        itemDetails[key] && itemDetails[key].toString().trim()
    );

    const transformedItemDetails = {
        name: itemDetails.name || (hasItemData ? '' : projectFallback?.name || ''),
        type: itemDetails.type || '',
        rarity: itemDetails.rarity || '',
        value: itemDetails.value || '',
        properties: Array.isArray(itemDetails.properties) ? itemDetails.properties : [],
        damageFormula: itemDetails.damageFormula || '',
        damageType: itemDetails.damageType || '',
        weight: itemDetails.weight || '',
        description: itemDetails.description || (hasItemData ? '' : projectFallback?.description || ''),
        quote: itemDetails.quote || '',
        sdPrompt: itemDetails.sdPrompt || ''
    };

    return {
        currentStepId: backendState.currentStep,
        stepCompletion: backendState.stepCompletion || {},
        itemDetails: transformedItemDetails,
        selectedAssets: {
            finalImage: backendState.selectedAssets?.finalImage,
            border: backendState.selectedAssets?.border,
            seedImage: backendState.selectedAssets?.seedImage,
            generatedCardImages: backendState.selectedAssets?.generatedCardImages || [],
            selectedGeneratedCardImage: backendState.selectedAssets?.selectedGeneratedCardImage,
            finalCardWithText: backendState.selectedAssets?.finalCardWithText,
            templateBlob: backendState.selectedAssets?.templateBlob
        },
        generatedContent: {
            images: (backendState.generatedContent?.images || []).map((img: any) => ({
                url: typeof img === 'string' ? img : img.url || '',
                id: img.id || Date.now().toString()
            })),
            renderedCards: (backendState.generatedContent?.renderedCards || []).map((card: any) => ({
                url: typeof card === 'string' ? card : card.url || '',
                id: card.id || Date.now().toString(),
                name: card.name || 'Card',
                timestamp: card.timestamp || Date.now().toString()
            }))
        },
        autoSaveEnabled: true,
        lastSaved: backendState.metadata?.lastSaved
    };
}

// Transform frontend data to backend structure
export function transformFrontendState(frontendState: CardGeneratorState): BackendCardSessionData {
    return {
        sessionId: Date.now().toString(), // Generate new session ID for each save
        currentStep: frontendState.currentStepId,
        stepCompletion: frontendState.stepCompletion || {},
        itemDetails: frontendState.itemDetails,
        selectedAssets: {
            finalImage: frontendState.selectedAssets?.finalImage,
            border: frontendState.selectedAssets?.border,
            seedImage: frontendState.selectedAssets?.seedImage,
            generatedCardImages: frontendState.selectedAssets?.generatedCardImages || [],
            selectedGeneratedCardImage: frontendState.selectedAssets?.selectedGeneratedCardImage,
            finalCardWithText: frontendState.selectedAssets?.finalCardWithText,
            templateBlob: frontendState.selectedAssets?.templateBlob
        },
        generatedContent: {
            images: frontendState.generatedContent?.images || [],
            renderedCards: frontendState.generatedContent?.renderedCards || []
        },
        metadata: {
            lastSaved: frontendState.lastSaved || Date.now().toString(),
            version: '1.0.0',
            platform: 'web'
        }
    };
}

export interface ProjectListResponse {
    projects: ProjectSummary[];
    total: number;
}

class ProjectAPI {
    private baseUrl = `${DUNGEONMIND_API_URL}/api/cardgenerator`;

    async createProject(data: CreateProjectData): Promise<Project> {
        console.log(`🔄 projectAPI.createProject - Creating project: ${data.name}`);

        const response = await fetch(`${this.baseUrl}/create-project`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('🔄 projectAPI.createProject - Error response:', error);
            throw new Error(error.detail || 'Failed to create project');
        }

        const project = await response.json();
        console.log('🔄 projectAPI.createProject - Created project:', project.name, 'ID:', project.id);

        // Transform the backend state to frontend structure
        return {
            ...project,
            state: transformBackendState(project.state, {
                name: project.name,
                description: project.description
            })
        };
    }

    async listProjects(includeTemplates = false): Promise<ProjectSummary[]> {
        const response = await fetch(
            `${this.baseUrl}/list-projects?includeTemplates=${includeTemplates}`,
            { credentials: 'include' }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to list projects');
        }

        const data: ProjectListResponse = await response.json();
        return data.projects;
    }

    async getProject(id: string): Promise<Project> {
        console.log(`🔄 projectAPI.getProject - Loading project ${id}`);

        const response = await fetch(`${this.baseUrl}/project/${id}`, {
            credentials: 'include'
        });

        console.log(`🔄 projectAPI.getProject - Response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const error = await response.json();
            console.error('🔄 projectAPI.getProject - Error response:', error);
            throw new Error(error.detail || 'Failed to get project');
        }

        const project = await response.json();
        console.log('🔄 projectAPI.getProject - Received project state:', {
            coreImages: project.state?.generatedContent?.images?.length || 0,
            cardImages: project.state?.selectedAssets?.generatedCardImages?.length || 0,
            step: project.state?.currentStep,
            stateSize: project.state ? JSON.stringify(project.state).length : 0
        });

        console.log('🔍 DEBUG getProject - Raw backend itemDetails received:', {
            name: project.state?.itemDetails?.name,
            type: project.state?.itemDetails?.type,
            rarity: project.state?.itemDetails?.rarity,
            value: project.state?.itemDetails?.value,
            description: project.state?.itemDetails?.description?.substring(0, 50) + '...'
        });

        // Transform the backend state to frontend structure
        return {
            ...project,
            state: transformBackendState(project.state, {
                name: project.name,
                description: project.description
            })
        };
    }

    async updateProject(project: Project): Promise<void> {
        // Transform frontend state to backend format
        const backendState = transformFrontendState(project.state);

        console.log('💾 DEBUG updateProject - Frontend itemDetails being saved:', {
            name: project.state.itemDetails.name,
            type: project.state.itemDetails.type,
            rarity: project.state.itemDetails.rarity,
            value: project.state.itemDetails.value,
            description: project.state.itemDetails.description?.substring(0, 50) + '...'
        });

        console.log('💾 DEBUG updateProject - Backend itemDetails being sent:', {
            name: backendState.itemDetails.name,
            type: backendState.itemDetails.type,
            rarity: backendState.itemDetails.rarity,
            value: backendState.itemDetails.value,
            description: backendState.itemDetails.description?.substring(0, 50) + '...'
        });

        const requestBody = {
            name: project.name,
            description: project.description,
            state: backendState,
            metadata: project.metadata
        };

        console.log(`💾 Project API: Saving project state`, {
            projectId: project.id,
            projectName: requestBody.name,
            coreImages: requestBody.state?.generatedContent?.images?.length || 0,
            cardImages: requestBody.state?.selectedAssets?.generatedCardImages?.length || 0,
            step: requestBody.state?.currentStep,
            stateSize: JSON.stringify(requestBody.state).length
        });

        const response = await fetch(`${this.baseUrl}/project/${project.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(requestBody)
        });

        console.log(`🚀 projectAPI.updateProject - Response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const error = await response.json();
            console.error('🚀 projectAPI.updateProject - Error response:', error);
            throw new Error(error.detail || 'Failed to update project');
        } else {
            console.log('🚀 projectAPI.updateProject - Success!');
        }
    }

    async deleteProject(id: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/project/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to delete project');
        }
    }

    async duplicateProject(id: string, newName: string): Promise<Project> {
        const response = await fetch(`${this.baseUrl}/project/${id}/duplicate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ new_name: newName })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to duplicate project');
        }

        return response.json();
    }
}

export const projectAPI = new ProjectAPI(); 