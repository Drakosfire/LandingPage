/**
 * HPSection Component
 * 
 * Displays HP maximum, current HP, and temp HP.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/column2
 */

import React from 'react';

export interface HPSectionProps {
    /** Maximum HP */
    maxHP: number;
    /** Current HP (optional - for display purposes, may be editable later) */
    currentHP?: number;
    /** Temporary HP (optional) */
    tempHP?: number;
}

export const HPSection: React.FC<HPSectionProps> = ({
    maxHP,
    currentHP,
    tempHP
}) => {
    return (
        <div className="phb-section hp-section" data-testid="hp-section">
            <div className="hp-max-row">
                <span className="hp-max-label">Hit Point Maximum</span>
                <span className="hp-max-value">{maxHP}</span>
            </div>
            <div className="hp-current">{currentHP ?? ''}</div>
            <div className="hp-current-label">Current Hit Points</div>
            <div className="hp-temp">{tempHP ?? ''}</div>
            <div className="hp-temp-label">Temporary Hit Points</div>
        </div>
    );
};

export default HPSection;

