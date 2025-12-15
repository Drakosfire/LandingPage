/**
 * useDetailModal Hook
 * 
 * Manages modal open/close state and data for detail modals.
 * 
 * @module PlayerCharacterGenerator/hooks
 */

import { useState, useCallback } from 'react';

/**
 * Generic hook for managing modal state with typed data
 */
export function useDetailModal<T>() {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<T | null>(null);

    const openModal = useCallback((modalData: T) => {
        setData(modalData);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        // Delay clearing data so close animation completes
        setTimeout(() => setData(null), 200);
    }, []);

    return { isOpen, data, openModal, closeModal };
}

export default useDetailModal;

