/**
 * AddItemRow Component
 * 
 * "Add Item" button row that appears in edit mode at the end of inventory blocks.
 * Clicking triggers onAddItem callback to open ItemEditModal in add mode.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/inventory
 */

import React, { useCallback } from 'react';
import { IconPlus } from '@tabler/icons-react';

export interface AddItemRowProps {
    /** Callback when add button is clicked */
    onAddItem: () => void;
    /** Placeholder text shown next to + button */
    placeholder?: string;
}

/**
 * AddItemRow - Clickable "+" row for adding new items
 * 
 * Follows PHB parchment styling with blue edit-mode accent.
 * Keyboard accessible (Enter/Space to activate).
 */
export const AddItemRow: React.FC<AddItemRowProps> = ({
    onAddItem,
    placeholder = 'Add item...'
}) => {
    const handleClick = useCallback(() => {
        console.log('➕ [AddItemRow] Add item clicked');
        onAddItem();
    }, [onAddItem]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    }, [handleClick]);

    return (
        <div
            className="item-row add-item-row"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={placeholder}
        >
            <span className="add-item-icon">
                <IconPlus size={14} stroke={2} />
            </span>
            <span className="add-item-text">{placeholder}</span>
        </div>
    );
};

export default AddItemRow;



