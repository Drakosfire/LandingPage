/**
 * PlayerCharacterGenerator Provider Tests
 * 
 * Tests for Phase 4 CRUD functions with mocked API calls.
 * 
 * @module PlayerCharacterGenerator/__tests__/provider
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
    PlayerCharacterGeneratorProvider,
    usePlayerCharacterGenerator
} from '../../PlayerCharacterGeneratorProvider';

// ============================================================================
// MOCKS
// ============================================================================

// Mock AuthContext
const mockAuthState = {
    isLoggedIn: true,
    userId: 'test-user-123'
};

jest.mock('../../../../context/AuthContext', () => ({
    useAuth: () => mockAuthState
}));

// Mock config
jest.mock('../../../../config', () => ({
    DUNGEONMIND_API_URL: 'http://test-api.local'
}));

// Mock fetch
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

// ============================================================================
// TEST UTILITIES
// ============================================================================

function TestWrapper(props: { children: React.ReactNode }) {
    return React.createElement(PlayerCharacterGeneratorProvider, null, props.children);
}

function mockSuccessResponse(data: any) {
    return {
        ok: true,
        json: () => Promise.resolve(data)
    };
}

function mockErrorResponse(statusText: string) {
    return {
        ok: false,
        statusText
    };
}

// ============================================================================
// TESTS
// ============================================================================

describe('PlayerCharacterGeneratorProvider', () => {
    beforeEach(() => {
        mockFetch.mockClear();
        mockAuthState.isLoggedIn = true;
        mockAuthState.userId = 'test-user-123';
        localStorage.clear();
    });

    describe('Initial State', () => {
        it('should have null currentProject initially', () => {
            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            expect(result.current.currentProject).toBeNull();
        });

        it('should have idle saveStatus initially', () => {
            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            expect(result.current.saveStatus).toBe('idle');
        });

        it('should have isLoadingProjects as false initially', () => {
            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            expect(result.current.isLoadingProjects).toBe(false);
        });

        it('should provide all CRUD functions', () => {
            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            expect(typeof result.current.createProject).toBe('function');
            expect(typeof result.current.loadProject).toBe('function');
            expect(typeof result.current.deleteProject).toBe('function');
            expect(typeof result.current.listProjects).toBe('function');
            expect(typeof result.current.saveProject).toBe('function');
        });
    });

    describe('createProject', () => {
        it('should throw error when not logged in', async () => {
            mockAuthState.isLoggedIn = false;
            mockAuthState.userId = '';

            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            await expect(result.current.createProject('New Character'))
                .rejects.toThrow('Authentication required');
        });

        it('should call API with correct parameters', async () => {
            mockFetch.mockResolvedValueOnce(mockSuccessResponse({
                projectId: 'new-proj-123',
                createdAt: '2025-12-11T10:00:00.000Z',
                updatedAt: '2025-12-11T10:00:00.000Z'
            }));

            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            await act(async () => {
                await result.current.createProject('New Character', 'A test character');
            });

            expect(mockFetch).toHaveBeenCalledWith(
                'http://test-api.local/api/playercharactergenerator/save-project',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                })
            );

            const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(callBody.projectId).toBeNull();
            expect(callBody.userId).toBe('test-user-123');
            expect(callBody.character.name).toBe('New Character');
        });

        it('should return projectId on success', async () => {
            mockFetch.mockResolvedValueOnce(mockSuccessResponse({
                projectId: 'new-proj-123'
            }));

            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            let projectId = '';
            await act(async () => {
                projectId = await result.current.createProject('New Character');
            });

            expect(projectId).toBe('new-proj-123');
        });

        it('should update currentProject on success', async () => {
            mockFetch.mockResolvedValueOnce(mockSuccessResponse({
                projectId: 'new-proj-123'
            }));

            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            await act(async () => {
                await result.current.createProject('New Character');
            });

            expect(result.current.currentProject).not.toBeNull();
            expect(result.current.currentProject?.id).toBe('new-proj-123');
        });

        it('should throw on API error', async () => {
            mockFetch.mockResolvedValueOnce(mockErrorResponse('Internal Server Error'));

            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            await expect(result.current.createProject('New Character'))
                .rejects.toThrow('Create project failed');
        });
    });

    describe('loadProject', () => {
        it('should throw error when not logged in', async () => {
            mockAuthState.isLoggedIn = false;
            mockAuthState.userId = '';

            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            await expect(result.current.loadProject('proj-123'))
                .rejects.toThrow('Authentication required');
        });

        it('should call API with correct URL', async () => {
            mockFetch.mockResolvedValueOnce(mockSuccessResponse({
                data: {
                    project: {
                        id: 'proj-123',
                        name: 'Loaded Character',
                        state: {
                            character: { id: 'c1', name: 'Loaded Character', level: 1 },
                            wizardStep: 2
                        },
                        metadata: {}
                    }
                }
            }));

            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            await act(async () => {
                await result.current.loadProject('proj-123');
            });

            expect(mockFetch).toHaveBeenCalledWith(
                'http://test-api.local/api/playercharactergenerator/project/proj-123',
                expect.objectContaining({
                    method: 'GET',
                    credentials: 'include'
                })
            );
        });

        it('should throw on API error', async () => {
            mockFetch.mockResolvedValueOnce(mockErrorResponse('Not Found'));

            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            await expect(result.current.loadProject('proj-123'))
                .rejects.toThrow('Load project failed');
        });
    });

    describe('deleteProject', () => {
        it('should throw error when not logged in', async () => {
            mockAuthState.isLoggedIn = false;
            mockAuthState.userId = '';

            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            await expect(result.current.deleteProject('proj-123'))
                .rejects.toThrow('Authentication required');
        });

        it('should call DELETE API with correct URL', async () => {
            mockFetch.mockResolvedValueOnce(mockSuccessResponse({ success: true }));

            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            await act(async () => {
                await result.current.deleteProject('proj-123');
            });

            expect(mockFetch).toHaveBeenCalledWith(
                'http://test-api.local/api/playercharactergenerator/project/proj-123',
                expect.objectContaining({
                    method: 'DELETE',
                    credentials: 'include'
                })
            );
        });

        it('should throw on API error', async () => {
            mockFetch.mockResolvedValueOnce(mockErrorResponse('Forbidden'));

            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            await expect(result.current.deleteProject('proj-123'))
                .rejects.toThrow('Delete project failed');
        });
    });

    describe('listProjects', () => {
        it('should return empty array when not logged in', async () => {
            mockAuthState.isLoggedIn = false;
            mockAuthState.userId = '';

            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            let projects: any[] = [];
            await act(async () => {
                projects = await result.current.listProjects();
            });

            expect(projects).toEqual([]);
            expect(mockFetch).not.toHaveBeenCalled();
        });

        it('should call API and return transformed projects', async () => {
            mockFetch.mockResolvedValueOnce(mockSuccessResponse({
                data: {
                    projects: [
                        {
                            id: 'proj-1',
                            name: 'Thorin Ironforge',
                            description: 'A dwarf fighter',
                            updatedAt: '2025-12-11T10:00:00.000Z',
                            createdAt: '2025-12-10T10:00:00.000Z',
                            metadata: { race: 'Dwarf', class: 'Fighter', level: 5 }
                        }
                    ]
                }
            }));

            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            let projects: any[] = [];
            await act(async () => {
                projects = await result.current.listProjects();
            });

            expect(projects).toHaveLength(1);
            expect(projects[0].name).toBe('Thorin Ironforge');
            expect(projects[0].race).toBe('Dwarf');
            expect(projects[0].className).toBe('Fighter');
            expect(projects[0].level).toBe(5);
        });

        it('should return empty array on API error', async () => {
            mockFetch.mockResolvedValueOnce(mockErrorResponse('Internal Server Error'));

            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            let projects: any[] = [];
            await act(async () => {
                projects = await result.current.listProjects();
            });

            expect(projects).toEqual([]);
        });
    });

    describe('saveProject', () => {
        it('should throw error when not logged in', async () => {
            mockAuthState.isLoggedIn = false;
            mockAuthState.userId = '';

            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            await expect(result.current.saveProject())
                .rejects.toThrow('Authentication required');
        });

        it('should call API with current character data', async () => {
            mockFetch.mockResolvedValueOnce(mockSuccessResponse({
                projectId: 'saved-proj-123',
                updatedAt: '2025-12-11T10:00:00.000Z'
            }));

            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            // Update character name first
            act(() => {
                result.current.updateCharacter({ name: 'Saved Character' });
            });

            await act(async () => {
                await result.current.saveProject();
            });

            expect(mockFetch).toHaveBeenCalledWith(
                'http://test-api.local/api/playercharactergenerator/save-project',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                })
            );

            const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(callBody.character.name).toBe('Saved Character');
            expect(callBody.userId).toBe('test-user-123');
        });

        it('should update saveStatus to error on failure', async () => {
            mockFetch.mockResolvedValueOnce(mockErrorResponse('Internal Server Error'));

            const { result } = renderHook(() => usePlayerCharacterGenerator(), {
                wrapper: TestWrapper
            });

            await act(async () => {
                try {
                    await result.current.saveProject();
                } catch {
                    // Expected to throw
                }
            });

            expect(result.current.saveStatus).toBe('error');
        });
    });
});
