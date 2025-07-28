import { DUNGEONMIND_API_URL } from '../config';
import { Project, ProjectSummary, CreateProjectData } from '../types/card.types';

export interface ProjectListResponse {
    projects: ProjectSummary[];
    total: number;
}

class ProjectAPI {
    private baseUrl = `${DUNGEONMIND_API_URL}/api/cardgenerator`;

    async createProject(data: CreateProjectData): Promise<Project> {
        const response = await fetch(`${this.baseUrl}/create-project`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create project');
        }

        return response.json();
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

        return project;
    }

    async updateProject(project: Project): Promise<void> {
        const requestBody = {
            name: project.name,
            description: project.description,
            state: project.state,
            metadata: project.metadata
        };

        console.log(`🚀 projectAPI.updateProject - Updating project ${project.id} with name: "${requestBody.name}"`);
        console.log('🚀 projectAPI.updateProject - State being sent:', {
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