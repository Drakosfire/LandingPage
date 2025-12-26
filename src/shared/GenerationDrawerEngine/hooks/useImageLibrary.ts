/**
 * useImageLibrary - Hook for managing image library operations
 * 
 * Handles fetching, uploading, and deleting images from the user's library.
 * Supports pagination and session filtering.
 */

import { useState, useEffect, useCallback } from 'react';
import { DUNGEONMIND_API_URL } from '../../../config';
import { useAuth } from '../../../context/AuthContext';
import type { SessionImage } from '../components/ProjectGallery';

export interface UseImageLibraryConfig {
    /** API endpoint for fetching library images */
    libraryEndpoint: string;
    /** API endpoint for uploading images */
    uploadEndpoint: string;
    /** API endpoint for deleting images */
    deleteEndpoint: string;
    /** Current session ID for filtering */
    sessionId?: string;
    /** Service identifier */
    service: string;
    /** Items per page for pagination */
    itemsPerPage?: number;
    /** Skip API calls (for tutorial mode) */
    disabled?: boolean;
}

export interface UseImageLibraryReturn {
    /** Library images */
    images: SessionImage[];
    /** Whether library is loading */
    isLoading: boolean;
    /** Error message if any */
    error: string | null;
    /** Current page number */
    currentPage: number;
    /** Total number of pages */
    totalPages: number;
    /** Total number of images */
    total: number;
    /** Upload a file */
    uploadFile: (file: File) => Promise<SessionImage | null>;
    /** Add images to local state (for generated images) */
    addImages: (newImages: SessionImage[]) => void;
    /** Delete an image */
    deleteImage: (imageId: string) => Promise<void>;
    /** Change page */
    changePage: (page: number) => void;
    /** Refresh library */
    refresh: () => Promise<void>;
}

/**
 * Hook for managing image library operations
 */
export function useImageLibrary(
    config: UseImageLibraryConfig
): UseImageLibraryReturn {
    const { isLoggedIn } = useAuth();
    const {
        libraryEndpoint,
        uploadEndpoint,
        deleteEndpoint,
        sessionId,
        service,
        itemsPerPage = 20,
        disabled = false
    } = config;

    const [images, setImages] = useState<SessionImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    /**
     * Fetch library images
     */
    const fetchLibrary = useCallback(async (page: number = 1) => {
        // Skip API calls if disabled (tutorial mode) or not logged in
        if (disabled || !isLoggedIn) {
            setImages([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: itemsPerPage.toString(),
                service
            });

            if (sessionId) {
                params.append('sessionId', sessionId);
            }

            const url = `${DUNGEONMIND_API_URL}${libraryEndpoint}?${params.toString()}`;
            const response = await fetch(url, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch library: ${response.statusText}`);
            }

            const data = await response.json();

            // Transform API response to SessionImage format
            const transformedImages: SessionImage[] = (data.images || []).map((img: any) => ({
                id: img.id,
                url: img.url,
                prompt: img.prompt || img.description || '',
                createdAt: img.createdAt || img.timestamp || new Date().toISOString(),
                sessionId: img.sessionId || sessionId || '',
                service: img.service || service
            }));

            setImages(transformedImages);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
            setCurrentPage(page);
        } catch (err) {
            console.error('❌ [ImageLibrary] Fetch failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch library');
            setImages([]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoggedIn, libraryEndpoint, sessionId, service, itemsPerPage, disabled]);

    /**
     * Upload a file
     */
    const uploadFile = useCallback(async (file: File): Promise<SessionImage | null> => {
        // Skip API calls if disabled (tutorial mode)
        if (disabled) {
            console.log('📸 [ImageLibrary] Upload skipped (tutorial mode)');
            return null;
        }
        
        if (!isLoggedIn) {
            setError('Authentication required to upload images');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            if (sessionId) {
                formData.append('sessionId', sessionId);
            }
            formData.append('service', service);

            const url = `${DUNGEONMIND_API_URL}${uploadEndpoint}`;
            const response = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
            }

            const uploadedImage = await response.json();

            // Transform to SessionImage format
            const sessionImage: SessionImage = {
                id: uploadedImage.id || uploadedImage.imageId,
                url: uploadedImage.url || uploadedImage.imageUrl,
                prompt: uploadedImage.prompt || uploadedImage.description || '',
                createdAt: uploadedImage.createdAt || uploadedImage.timestamp || new Date().toISOString(),
                sessionId: uploadedImage.sessionId || sessionId || '',
                service: uploadedImage.service || service
            };

            // Refresh library to include new image
            await fetchLibrary(currentPage);

            return sessionImage;
        } catch (err) {
            console.error('❌ [ImageLibrary] Upload failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to upload image');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [disabled, isLoggedIn, uploadEndpoint, sessionId, service, fetchLibrary, currentPage]);

    /**
     * Delete an image
     */
    const deleteImage = useCallback(async (imageId: string): Promise<void> => {
        // Always remove from local state immediately (optimistic update)
        setImages(prev => prev.filter(img => img.id !== imageId));
        setTotal(prev => Math.max(0, prev - 1));
        console.log('🗑️ [ImageLibrary] Removed from local state:', imageId);
        
        // Skip API calls if disabled (tutorial mode)
        if (disabled) {
            console.log('🗑️ [ImageLibrary] Delete simulated (tutorial mode)');
            return;
        }
        
        if (!isLoggedIn) {
            // Already removed from local state, just log
            console.log('🗑️ [ImageLibrary] Not logged in, skipping backend delete');
            return;
        }

        // Try to delete from backend (best effort, don't block UI)
        try {
            const url = `${DUNGEONMIND_API_URL}${deleteEndpoint}/${imageId}`;
            const response = await fetch(url, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                // Image might not exist on backend (was only local), that's OK
                console.warn('🗑️ [ImageLibrary] Backend delete returned:', response.status);
            } else {
                console.log('🗑️ [ImageLibrary] Deleted from backend:', imageId);
            }
            // Don't refresh - we already updated local state optimistically
        } catch (err) {
            // Log but don't restore - image is already gone from UI
            console.error('❌ [ImageLibrary] Backend delete failed:', err);
        }
    }, [disabled, isLoggedIn, deleteEndpoint]);

    /**
     * Change page
     */
    const changePage = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) {
            fetchLibrary(page);
        }
    }, [fetchLibrary, totalPages]);

    /**
     * Refresh library
     */
    const refresh = useCallback(async () => {
        await fetchLibrary(currentPage);
    }, [fetchLibrary, currentPage]);

    /**
     * Add images to local state (for generated images)
     * Adds to the beginning of the list (most recent first)
     */
    const addImages = useCallback((newImages: SessionImage[]) => {
        setImages(prev => {
            // Deduplicate by id
            const existingIds = new Set(prev.map(img => img.id));
            const uniqueNew = newImages.filter(img => !existingIds.has(img.id));
            console.log('📸 [ImageLibrary] Adding', uniqueNew.length, 'new images to library');
            return [...uniqueNew, ...prev];
        });
        setTotal(prev => prev + newImages.length);
    }, []);

    // Fetch on mount and when dependencies change
    useEffect(() => {
        fetchLibrary(1);
    }, [fetchLibrary]);

    return {
        images,
        isLoading,
        error,
        currentPage,
        totalPages,
        total,
        uploadFile,
        addImages,
        deleteImage,
        changePage,
        refresh
    };
}

