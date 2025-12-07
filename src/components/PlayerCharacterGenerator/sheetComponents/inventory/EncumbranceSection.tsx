/**
 * EncumbranceSection Component
 * 
 * Weight tracking with visual progress bar.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/inventory
 */

import React from 'react';

export interface Encumbrance {
    currentWeight: number;
    carryingCapacity: number;
    pushDragLift: number;
}

export interface EncumbranceSectionProps {
    /** Current weight */
    currentWeight: number;
    /** Strength score (used to calculate capacity if not provided) */
    strength: number;
    /** Override carrying capacity (default: STR * 15) */
    carryingCapacity?: number;
    /** Override push/drag/lift (default: STR * 30) */
    pushDragLift?: number;
}

/**
 * EncumbranceSection - Weight tracking with bar
 */
export const EncumbranceSection: React.FC<EncumbranceSectionProps> = ({
    currentWeight,
    strength,
    carryingCapacity,
    pushDragLift
}) => {
    // Calculate defaults from strength
    const capacity = carryingCapacity ?? strength * 15;
    const pushLimit = pushDragLift ?? strength * 30;

    // Calculate fill percentage (capped at 100%)
    const fillPercent = Math.min((currentWeight / capacity) * 100, 100);

    return (
        <div className="phb-section encumbrance-section">
            <div className="section-header">Encumbrance</div>
            <div className="encumbrance-stats">
                <div className="encumbrance-row">
                    <span className="stat-label">Current Weight</span>
                    <span className="stat-value">{currentWeight} lb</span>
                </div>
                <div className="encumbrance-row">
                    <span className="stat-label">Carrying Capacity</span>
                    <span className="stat-value">{capacity} lb</span>
                </div>
                <div className="encumbrance-row">
                    <span className="stat-label">Push/Drag/Lift</span>
                    <span className="stat-value">{pushLimit} lb</span>
                </div>
            </div>
            <div className="encumbrance-bar">
                <div
                    className="encumbrance-fill"
                    style={{ width: `${fillPercent}%` }}
                />
            </div>
        </div>
    );
};

export default EncumbranceSection;

