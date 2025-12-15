/**
 * InventoryHeader Component
 * 
 * Character info row for inventory sheet.
 * Shows character name, class/level, and strength.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/inventory
 */

import React from 'react';

export interface InventoryHeaderProps {
    /** Character name */
    characterName: string;
    /** Class and level (e.g., "Paladin 5") */
    classAndLevel: string;
    /** Strength score */
    strength: number;
}

/**
 * LabeledBox - Reusable labeled input box pattern
 */
interface LabeledBoxProps {
    value: string | number;
    label: string;
    className?: string;
}

const LabeledBox: React.FC<LabeledBoxProps> = ({ value, label, className = '' }) => (
    <div className={`labeled-box ${className}`}>
        <div className="value">{value}</div>
        <div className="label">{label}</div>
    </div>
);

/**
 * InventoryHeader - Character info for inventory sheet
 */
export const InventoryHeader: React.FC<InventoryHeaderProps> = ({
    characterName,
    classAndLevel,
    strength
}) => {
    return (
        <div className="inventory-header">
            <div className="character-info">
                <LabeledBox value={characterName || 'Unnamed'} label="Character Name" />
                <LabeledBox value={classAndLevel} label="Class & Level" className="narrow" />
                <LabeledBox value={strength} label="Strength" className="narrow" />
            </div>
        </div>
    );
};

export default InventoryHeader;

