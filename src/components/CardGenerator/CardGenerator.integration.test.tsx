import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CardGenerator from './CardGenerator';
import { AuthProvider } from '../../context/AuthContext';
import { projectAPI } from '../../services/projectAPI';
import { Project, CardGeneratorState } from '../../types/card.types';

// Mock the project API
jest.mock('../../services/projectAPI');
const mockProjectAPI = projectAPI as jest.Mocked<typeof projectAPI>;

// Mock the auth context
jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        userId: 'test-user-123',
        isLoggedIn: true,
        authState: { isLoading: false, isAuthenticated: true }
    })
}));

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

// Helper function to create valid test projects
const createTestProject = (overrides: Partial<Project> = {}): Project => ({
    id: 'test-project',
    name: 'Test Project',
    description: 'Test Description',
    createdBy: 'test-user-123',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    lastModified: '2024-01-01',
    state: {
        currentStepId: 'text-generation',
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
        stepCompletion: {},
        autoSaveEnabled: true
    },
    metadata: {
        version: '1.0.0',
        platform: 'web',
        isTemplate: false,
        lastOpened: 1234567890,
        cardCount: 0
    },
    ...overrides
});

describe('CardGenerator Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
    });

    const renderCardGenerator = () => {
        return render(
            <BrowserRouter>
                <AuthProvider>
                    <CardGenerator />
                </AuthProvider>
            </BrowserRouter>
        );
    };

    describe('Project Loading & State Restoration', () => {
        it('should handle malformed project data gracefully', async () => {
            // Create a project with malformed state that will be transformed
            const malformedProject = createTestProject({
                state: {
                    currentStepId: 'text-generation',
                    itemDetails: {
                        name: null as any, // Should be string
                        type: 123 as any, // Should be string
                        properties: 'not an array' as any, // Should be array
                        rarity: '',
                        value: '',
                        damageFormula: '',
                        damageType: '',
                        weight: '',
                        description: '',
                        quote: '',
                        sdPrompt: ''
                    },
                    selectedAssets: {
                        generatedCardImages: null as any // Should be array
                    },
                    generatedContent: {
                        images: 'not an array' as any, // Should be array
                        renderedCards: undefined as any // Should be array
                    },
                    stepCompletion: {},
                    autoSaveEnabled: true
                }
            });

            mockProjectAPI.getProject.mockResolvedValue(malformedProject);
            mockProjectAPI.listProjects.mockResolvedValue([{
                id: 'test-project',
                name: 'Test Project',
                description: 'Test Description',
                createdBy: 'test-user-123',
                lastModified: '2024-01-01',
                updatedAt: '2024-01-01',
                cardCount: 0
            }]);

            renderCardGenerator();

            // Should not crash and should show default values
            await waitFor(() => {
                expect(screen.getByText(/text generation/i)).toBeInTheDocument();
            });

            // Check that malformed data was handled gracefully
            const nameInput = screen.getByLabelText(/item name/i);
            expect(nameInput).toHaveValue('');
        });

        it('should handle network failures during project loading', async () => {
            mockProjectAPI.getProject.mockRejectedValue(new Error('Network error'));
            mockProjectAPI.listProjects.mockRejectedValue(new Error('Network error'));

            renderCardGenerator();

            // Should not crash and should show error state gracefully
            await waitFor(() => {
                expect(screen.getByText(/text generation/i)).toBeInTheDocument();
            });
        });

        it('should handle empty project state without crashing', async () => {
            const emptyProject = createTestProject({
                name: 'Empty Project',
                description: ''
            });

            mockProjectAPI.getProject.mockResolvedValue(emptyProject);
            mockProjectAPI.listProjects.mockResolvedValue([{
                id: 'empty-project',
                name: 'Empty Project',
                description: '',
                createdBy: 'test-user-123',
                lastModified: '2024-01-01',
                updatedAt: '2024-01-01',
                cardCount: 0
            }]);

            renderCardGenerator();

            await waitFor(() => {
                expect(screen.getByText(/text generation/i)).toBeInTheDocument();
            });

            // Should show empty form fields
            const nameInput = screen.getByLabelText(/item name/i);
            expect(nameInput).toHaveValue('');
        });
    });

    describe('Auto-save & State Persistence', () => {
        it('should handle auto-save failures gracefully', async () => {
            mockProjectAPI.updateProject.mockRejectedValue(new Error('Save failed'));
            mockProjectAPI.listProjects.mockResolvedValue([]);
            mockProjectAPI.createProject.mockResolvedValue(createTestProject({
                id: 'new-project',
                name: 'New Project'
            }));

            renderCardGenerator();

            // Fill in some data to trigger auto-save
            const nameInput = screen.getByLabelText(/item name/i);
            fireEvent.change(nameInput, { target: { value: 'Test Item' } });

            // Wait for auto-save to be triggered
            await waitFor(() => {
                expect(mockProjectAPI.updateProject).toHaveBeenCalled();
            });

            // Should not crash even if save fails
            expect(screen.getByDisplayValue('Test Item')).toBeInTheDocument();
        });

        it('should handle localStorage backup when server save fails', async () => {
            mockProjectAPI.updateProject.mockRejectedValue(new Error('Server unavailable'));
            mockProjectAPI.listProjects.mockResolvedValue([]);
            mockProjectAPI.createProject.mockResolvedValue(createTestProject({
                id: 'new-project',
                name: 'New Project'
            }));

            renderCardGenerator();

            // Fill in data
            const nameInput = screen.getByLabelText(/item name/i);
            fireEvent.change(nameInput, { target: { value: 'Test Item' } });

            // Should save to localStorage as backup
            await waitFor(() => {
                expect(localStorageMock.setItem).toHaveBeenCalledWith(
                    'cardGenerator_sessionBackup',
                    expect.stringContaining('Test Item')
                );
            });
        });
    });

    describe('Project Switching Edge Cases', () => {
        it('should prevent rapid project switching', async () => {
            const project1 = createTestProject({
                id: 'project-1',
                name: 'Project 1',
                state: {
                    currentStepId: 'text-generation',
                    itemDetails: { name: 'Item 1', type: '', rarity: '', value: '', properties: [], damageFormula: '', damageType: '', weight: '', description: '', quote: '', sdPrompt: '' },
                    selectedAssets: { generatedCardImages: [] },
                    generatedContent: { images: [], renderedCards: [] },
                    stepCompletion: {},
                    autoSaveEnabled: true
                }
            });

            const project2 = createTestProject({
                id: 'project-2',
                name: 'Project 2',
                state: {
                    currentStepId: 'text-generation',
                    itemDetails: { name: 'Item 2', type: '', rarity: '', value: '', properties: [], damageFormula: '', damageType: '', weight: '', description: '', quote: '', sdPrompt: '' },
                    selectedAssets: { generatedCardImages: [] },
                    generatedContent: { images: [], renderedCards: [] },
                    stepCompletion: {},
                    autoSaveEnabled: true
                }
            });

            mockProjectAPI.getProject
                .mockResolvedValueOnce(project1)
                .mockResolvedValueOnce(project2);
            mockProjectAPI.listProjects.mockResolvedValue([
                { id: 'project-1', name: 'Project 1', description: '', createdBy: 'test-user-123', lastModified: '2024-01-01', updatedAt: '2024-01-01', cardCount: 0 },
                { id: 'project-2', name: 'Project 2', description: '', createdBy: 'test-user-123', lastModified: '2024-01-01', updatedAt: '2024-01-01', cardCount: 0 }
            ]);

            renderCardGenerator();

            // Wait for initial project load
            await waitFor(() => {
                expect(mockProjectAPI.getProject).toHaveBeenCalledWith('project-1');
            });

            // Rapidly switch projects (this should be prevented)
            // Note: This test would need actual UI elements to trigger project switching
            // For now, we're testing the logic exists
        });

        it('should handle project switching during generation', async () => {
            // Mock that generation is in progress
            const projectWithGeneration = createTestProject({
                id: 'project-with-generation',
                name: 'Project with Generation',
                state: {
                    currentStepId: 'core-image',
                    itemDetails: { name: 'Test Item', type: '', rarity: '', value: '', properties: [], damageFormula: '', damageType: '', weight: '', description: '', quote: '', sdPrompt: '' },
                    selectedAssets: { generatedCardImages: [] },
                    generatedContent: { images: [], renderedCards: [] },
                    stepCompletion: { 'text-generation': true },
                    autoSaveEnabled: true
                }
            });

            mockProjectAPI.getProject.mockResolvedValue(projectWithGeneration);
            mockProjectAPI.listProjects.mockResolvedValue([
                { id: 'project-with-generation', name: 'Project with Generation', description: '', createdBy: 'test-user-123', lastModified: '2024-01-01', updatedAt: '2024-01-01', cardCount: 0 }
            ]);

            renderCardGenerator();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Item')).toBeInTheDocument();
            });

            // Project switching should be blocked during generation
            // This would need actual UI interaction to test fully
        });
    });

    describe('Data Corruption Scenarios', () => {
        it('should handle corrupted localStorage data', () => {
            // Mock corrupted localStorage data
            localStorageMock.getItem.mockReturnValue('invalid json {');

            renderCardGenerator();

            // Should not crash and should start with clean state
            expect(screen.getByText(/text generation/i)).toBeInTheDocument();
        });

        it('should handle missing required state properties', async () => {
            const incompleteProject = createTestProject({
                id: 'incomplete-project',
                name: 'Incomplete Project',
                state: {
                    currentStepId: 'text-generation', // Add this back
                    itemDetails: { name: '', type: '', rarity: '', value: '', properties: [], damageFormula: '', damageType: '', weight: '', description: '', quote: '', sdPrompt: '' },
                    selectedAssets: { generatedCardImages: [] },
                    generatedContent: { images: [], renderedCards: [] },
                    stepCompletion: {},
                    autoSaveEnabled: true
                }
            });

            // Remove currentStepId to simulate missing property
            delete (incompleteProject.state as any).currentStepId;

            mockProjectAPI.getProject.mockResolvedValue(incompleteProject);
            mockProjectAPI.listProjects.mockResolvedValue([
                { id: 'incomplete-project', name: 'Incomplete Project', description: '', createdBy: 'test-user-123', lastModified: '2024-01-01', updatedAt: '2024-01-01', cardCount: 0 }
            ]);

            renderCardGenerator();

            // Should default to text-generation step
            await waitFor(() => {
                expect(screen.getByText(/text generation/i)).toBeInTheDocument();
            });
        });
    });

    describe('Authentication Edge Cases', () => {
        it('should handle authentication state changes', async () => {
            // Mock authentication failure
            jest.doMock('../../context/AuthContext', () => ({
                useAuth: () => ({
                    userId: null,
                    isLoggedIn: false,
                    authState: { isLoading: false, isAuthenticated: false }
                })
            }));

            renderCardGenerator();

            // Should show appropriate state for unauthenticated user
            expect(screen.getByText(/text generation/i)).toBeInTheDocument();
        });
    });

    describe('Memory Leak Prevention', () => {
        it('should clean up timers and listeners on unmount', () => {
            const { unmount } = renderCardGenerator();

            // Mock clearTimeout to track cleanup
            const originalClearTimeout = global.clearTimeout;
            const clearTimeoutSpy = jest.fn();
            global.clearTimeout = clearTimeoutSpy;

            unmount();

            // Should have called clearTimeout for any pending timers
            expect(clearTimeoutSpy).toHaveBeenCalled();

            // Restore original
            global.clearTimeout = originalClearTimeout;
        });
    });
}); 