/**
 * AddSpellRow Component
 * 
 * "Add Spell" button row that appears in edit mode at the end of spell level blocks.
 * Clicking triggers onAddSpell callback to open SpellEditModal in add mode.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/spells
 */

import React, { useCallback } from 'react';
import { IconPlus } from '@tabler/icons-react';

export interface AddSpellRowProps {
    /** Callback when add button is clicked */
    onAddSpell: () => void;
    /** Placeholder text shown next to + button */
    placeholder?: string;
}

/**
 * AddSpellRow - Clickable "+" row for adding new spells
 * 
 * Follows PHB parchment styling with blue edit-mode accent.
 * Keyboard accessible (Enter/Space to activate).
 */
export const AddSpellRow: React.FC<AddSpellRowProps> = ({
    onAddSpell,
    placeholder = 'Add spell...'
}) => {
    const handleClick = useCallback(() => {
        console.log('➕ [AddSpellRow] Add spell clicked');
        onAddSpell();
    }, [onAddSpell]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    }, [handleClick]);

    return (
        <div
            className="spell-item add-spell-row"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={placeholder}
        >
            <span className="add-spell-icon">
                <IconPlus size={14} stroke={2} />
            </span>
            <span className="add-spell-text">{placeholder}</span>
        </div>
    );
};

export default AddSpellRow;

