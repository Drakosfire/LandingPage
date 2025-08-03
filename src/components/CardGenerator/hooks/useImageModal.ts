import { useState, useCallback } from 'react';

interface ImageModalState {
    opened: boolean;
    imageUrl: string;
    altText?: string;
    title?: string;
    description?: string;
    downloadFilename?: string;
}

interface UseImageModalReturn {
    modalState: ImageModalState;
    openModal: (imageUrl: string, options?: Partial<Omit<ImageModalState, 'opened'>>) => void;
    closeModal: () => void;
}

export const useImageModal = (): UseImageModalReturn => {
    const [modalState, setModalState] = useState<ImageModalState>({
        opened: false,
        imageUrl: '',
        altText: 'Image',
        title: undefined,
        description: undefined,
        downloadFilename: undefined
    });

    const openModal = useCallback((
        imageUrl: string,
        options?: Partial<Omit<ImageModalState, 'opened'>>
    ) => {
        setModalState({
            opened: true,
            imageUrl,
            altText: 'Image',
            ...options
        });
    }, []);

    const closeModal = useCallback(() => {
        setModalState(prev => ({
            ...prev,
            opened: false
        }));
    }, []);

    return {
        modalState,
        openModal,
        closeModal
    };
}; 