/**
 * CombatStatsRow Component
 * 
 * Displays AC, Initiative, and Speed in a horizontal row.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/column2
 */

import React from 'react';

export interface CombatStatsRowProps {
    /** Armor Class */
    armorClass: number;
    /** Initiative modifier */
    initiative: number;
    /** Speed (walking) in feet */
    speed: number;
}

function formatModifier(mod: number): string {
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

export const CombatStatsRow: React.FC<CombatStatsRowProps> = ({
    armorClass,
    initiative,
    speed
}) => {
    return (
        <div className="combat-stats-row" data-testid="combat-stats-row">
            <div className="phb-section combat-stat-box">
                <div className="stat-value">{armorClass}</div>
                <div className="stat-label">Armor Class</div>
            </div>
            <div className="phb-section combat-stat-box">
                <div className="stat-value">{formatModifier(initiative)}</div>
                <div className="stat-label">Initiative</div>
            </div>
            <div className="phb-section combat-stat-box">
                <div className="stat-value">{speed}</div>
                <div className="stat-label">Speed</div>
            </div>
        </div>
    );
};

export default CombatStatsRow;

