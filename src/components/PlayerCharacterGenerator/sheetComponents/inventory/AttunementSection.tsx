/**
 * AttunementSection Component
 * 
 * Attuned magic items list with filled/empty markers.
 * Supports clicking items to edit and info buttons for details.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/inventory
 */

import React from 'react';
import { IconInfoCircle } from '@tabler/icons-react';
import { usePlayerCharacterGenerator } from '../../PlayerCharacterGeneratorProvider';

export interface AttunedItem {
    /** Item ID for lookup */
    id?: string;
    name: string;
    active: boolean;
}

export interface AttunementSectionProps {
    /** Attuned items (max 3 for most characters) */
    attunedItems: AttunedItem[];
    /** Maximum attunement slots (default: 3) */
    maxSlots?: number;
    /** Callback when item is clicked (edit mode) */
    onItemClick?: (itemId: string) => void;
    /** Callback when info button is clicked */
    onItemInfo?: (itemId: string) => void;
}

/**
 * AttunementSection - Magic item attunement slots
 */
export const AttunementSection: React.FC<AttunementSectionProps> = ({
    attunedItems,
    maxSlots = 3,
    onItemClick,
    onItemInfo
}) => {
    const { isEditMode } = usePlayerCharacterGenerator();

    // Pad array to maxSlots
    const slots: AttunedItem[] = [...attunedItems];
    while (slots.length < maxSlots) {
        slots.push({ name: '', active: false });
    }

    const handleItemClick = (slot: AttunedItem) => {
        if (isEditMode && slot.active && slot.id && onItemClick) {
            onItemClick(slot.id);
        }
    };

    const handleInfoClick = (e: React.MouseEvent, slot: AttunedItem) => {
        e.stopPropagation(); // Don't trigger row click
        if (slot.active && slot.id && onItemInfo) {
            onItemInfo(slot.id);
        }
    };

    return (
        <div className="phb-section attunement-section">
            <div className="section-header">Attuned Items ({maxSlots} max)</div>
            <div className="attunement-slots">
                {slots.map((slot, idx) => (
                    <div 
                        key={slot.id || idx} 
                        className={`attunement-slot ${isEditMode && slot.active ? 'clickable' : ''}`}
                        onClick={() => handleItemClick(slot)}
                        onKeyDown={(e) => {
                            if (isEditMode && slot.active && (e.key === 'Enter' || e.key === ' ')) {
                                e.preventDefault();
                                handleItemClick(slot);
                            }
                        }}
                        role={isEditMode && slot.active ? 'button' : undefined}
                        tabIndex={isEditMode && slot.active ? 0 : undefined}
                    >
                        <div className={`attunement-marker ${slot.active ? 'active' : ''}`} />
                        <div className="attunement-item">{slot.name}</div>
                        {slot.active && slot.id && onItemInfo && (
                            <button
                                className="info-btn"
                                onClick={(e) => handleInfoClick(e, slot)}
                                title="View item details"
                                type="button"
                            >
                                <IconInfoCircle size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AttunementSection;

