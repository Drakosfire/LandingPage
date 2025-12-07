/**
 * InventoryNotes Component
 * 
 * 2-column notes section at bottom of inventory sheet.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/inventory
 */

import React from 'react';

export interface InventoryNotesProps {
    /** Notes content (can include newlines) */
    notes?: string;
    /** Left column title */
    leftTitle?: string;
    /** Right column title */
    rightTitle?: string;
}

/**
 * InventoryNotes - 2-column notes section
 */
export const InventoryNotes: React.FC<InventoryNotesProps> = ({
    notes = '',
    leftTitle = 'Storage Locations:',
    rightTitle = 'Owed / Debts:'
}) => {
    // Split notes by double newline into columns
    const parts = notes.split('\n\n');
    const leftContent = parts[0] || '';
    const rightContent = parts[1] || '';

    return (
        <div className="notes-section">
            <div className="phb-section notes-box">
                <div className="notes-content">
                    <div className="notes-column">
                        <strong>{leftTitle}</strong><br />
                        {leftContent.split('\n').map((line, idx) => (
                            <React.Fragment key={idx}>
                                {line}
                                {idx < leftContent.split('\n').length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="notes-column">
                        <strong>{rightTitle}</strong><br />
                        {rightContent.split('\n').map((line, idx) => (
                            <React.Fragment key={idx}>
                                {line}
                                {idx < rightContent.split('\n').length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                <div className="box-label">Inventory Notes</div>
            </div>
        </div>
    );
};

export default InventoryNotes;

