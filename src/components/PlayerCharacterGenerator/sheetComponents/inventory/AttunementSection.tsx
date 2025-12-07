/**
 * AttunementSection Component
 * 
 * Attuned magic items list with filled/empty markers.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/inventory
 */

import React from 'react';

export interface AttunedItem {
    name: string;
    active: boolean;
}

export interface AttunementSectionProps {
    /** Attuned items (max 3 for most characters) */
    attunedItems: AttunedItem[];
    /** Maximum attunement slots (default: 3) */
    maxSlots?: number;
}

/**
 * AttunementSection - Magic item attunement slots
 */
export const AttunementSection: React.FC<AttunementSectionProps> = ({
    attunedItems,
    maxSlots = 3
}) => {
    // Pad array to maxSlots
    const slots: AttunedItem[] = [...attunedItems];
    while (slots.length < maxSlots) {
        slots.push({ name: '', active: false });
    }

    return (
        <div className="phb-section attunement-section">
            <div className="section-header">Attuned Items ({maxSlots} max)</div>
            <div className="attunement-slots">
                {slots.map((slot, idx) => (
                    <div key={idx} className="attunement-slot">
                        <div className={`attunement-marker ${slot.active ? 'active' : ''}`} />
                        <div className="attunement-item">{slot.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AttunementSection;

