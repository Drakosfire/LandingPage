/**
 * Unit tests for useImageLibrary hook
 */

// Mock useAuth BEFORE importing the hook
jest.mock('../../../context/AuthContext', () => ({
    useAuth: jest.fn()
}));

import { renderHook, waitFor, act } from '@testing-library/react';
import { useImageLibrary } from '../hooks/useImageLibrary';
import { useAuth } from '../../../context/AuthContext';
import { DUNGEONMIND_API_URL } from '../../../config';

// Mock fetch
global.fetch = jest.fn();

// Type the mock
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('useImageLibrary', () => {
    const mockConfig = {
        libraryEndpoint: '/api/test/library',
        uploadEndpoint: '/api/test/upload',
        deleteEndpoint: '/api/test/delete',
        sessionId: 'test-session-123',
        service: 'test'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockClear();
        // Setup default mock return value
        mockUseAuth.mockReturnValue({
            isLoggedIn: true,
            userId: 'test-user-123',
            authState: {
                isAuthenticated: true,
                user: { sub: 'test-user-123', email: 'test@example.com', name: 'Test User' },
                isLoading: false,
                error: null
            },
            login: jest.fn(),
            logout: jest.fn(),
            refreshAuth: jest.fn(),
            clearError: jest.fn()
        } as any);
    });

    describe('Fetch Library', () => {
        it('fetches library images on mount', async () => {
            const mockImages = [
                {
                    id: '1',
                    url: 'https://example.com/img1.jpg',
                    prompt: 'Test prompt',
                    createdAt: '2024-01-01T00:00:00Z',
                    sessionId: 'session1',
                    service: 'test'
                }
            ];

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    images: mockImages,
                    total: 1,
                    page: 1,
                    totalPages: 1
                })
            });

            const { result } = renderHook(() => useImageLibrary(mockConfig));

            await waitFor(() => {
                expect(result.current.images).toHaveLength(1);
            });

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/test/library'),
                expect.objectContaining({
                    credentials: 'include'
                })
            );
        });

        it('handles pagination', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    images: [],
                    total: 50,
                    page: 1,
                    totalPages: 5
                })
            });

            const { result } = renderHook(() => useImageLibrary(mockConfig));

            await waitFor(() => {
                expect(result.current.totalPages).toBe(5);
            });
        });

        it('filters by session when sessionId provided', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    images: [],
                    total: 0,
                    page: 1,
                    totalPages: 1
                })
            });

            renderHook(() => useImageLibrary(mockConfig));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalled();
            });

            const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
            expect(fetchCall).toContain('sessionId=test-session-123');
        });
    });

    describe('Upload', () => {
        it('uploads file and adds to library', async () => {
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const mockUploadedImage = {
                id: 'new-1',
                url: 'https://example.com/new.jpg',
                prompt: 'Uploaded',
                createdAt: '2024-01-01T00:00:00Z',
                sessionId: 'test-session-123',
                service: 'test'
            };

            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        images: [],
                        total: 0,
                        page: 1,
                        totalPages: 1
                    })
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockUploadedImage
                });

            const { result } = renderHook(() => useImageLibrary(mockConfig));

            await waitFor(() => {
                expect(result.current.images).toBeDefined();
            });

            await act(async () => {
                await result.current.uploadFile(mockFile);
            });

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/test/upload'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.any(FormData)
                })
            );
        });

        it('handles upload errors', async () => {
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ images: [], total: 0, page: 1, totalPages: 1 })
                })
                .mockResolvedValueOnce({
                    ok: false,
                    status: 400,
                    json: async () => ({ error: 'File too large' })
                });

            const { result } = renderHook(() => useImageLibrary(mockConfig));

            await waitFor(() => {
                expect(result.current.images).toBeDefined();
            });

            await act(async () => {
                await result.current.uploadFile(mockFile);
            });

            expect(result.current.error).toBeTruthy();
        });
    });

    describe('Delete', () => {
        it('deletes image and removes from library', async () => {
            const mockImages = [
                {
                    id: '1',
                    url: 'https://example.com/img1.jpg',
                    prompt: 'Test',
                    createdAt: '2024-01-01T00:00:00Z',
                    sessionId: 'session1',
                    service: 'test'
                }
            ];

            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        images: mockImages,
                        total: 1,
                        page: 1,
                        totalPages: 1
                    })
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true })
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        images: [],
                        total: 0,
                        page: 1,
                        totalPages: 1
                    })
                });

            const { result } = renderHook(() => useImageLibrary(mockConfig));

            await waitFor(() => {
                expect(result.current.images).toHaveLength(1);
            });

            await act(async () => {
                await result.current.deleteImage('1');
            });

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/test/delete'),
                expect.objectContaining({
                    method: 'DELETE'
                })
            );
        });
    });

    describe('Loading States', () => {
        it('tracks loading state during fetch', async () => {
            let resolveFetch: (value: any) => void;
            const fetchPromise = new Promise((resolve) => {
                resolveFetch = resolve;
            });

            (global.fetch as jest.Mock).mockReturnValueOnce(fetchPromise);

            const { result } = renderHook(() => useImageLibrary(mockConfig));

            expect(result.current.isLoading).toBe(true);

            act(() => {
                resolveFetch!({
                    ok: true,
                    json: async () => ({ images: [], total: 0, page: 1, totalPages: 1 })
                });
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
        });
    });
});

