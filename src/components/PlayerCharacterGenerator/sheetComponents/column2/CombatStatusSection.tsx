/**
 * CombatStatusSection Component
 * 
 * Unified combat status display with:
 * - Left column (narrow): HP Max, Current HP, Temp HP
 * - Right column: AC, Initiative, Speed (vertical)
 * 
 * @module PlayerCharacterGenerator/sheetComponents/column2
 */

import React from 'react';

export interface CombatStatusSectionProps {
    /** Maximum HP */
    maxHP: number;
    /** Current HP */
    currentHP?: number;
    /** Temporary HP */
    tempHP?: number;
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

export const CombatStatusSection: React.FC<CombatStatusSectionProps> = ({
    maxHP,
    currentHP,
    tempHP,
    armorClass,
    initiative,
    speed
}) => {
    return (
        <div className="phb-section combat-status-section" data-testid="combat-status-section">
            {/* HP Column (left, narrower) */}
            <div className="combat-hp-column">
                <div className="hp-stat">
                    <div className="hp-value">{maxHP}</div>
                    <div className="hp-label">HP Max</div>
                </div>
                <div className="hp-stat">
                    <div className="hp-input">{currentHP ?? ''}</div>
                    <div className="hp-label">Current</div>
                </div>
                <div className="hp-stat">
                    <div className="hp-input small">{tempHP ?? ''}</div>
                    <div className="hp-label">Temp</div>
                </div>
            </div>

            {/* Divider */}
            <div className="combat-divider" />

            {/* Combat Stats Column (right) */}
            <div className="combat-stats-column">
                <div className="combat-stat">
                    <div className="combat-value">{armorClass}</div>
                    <div className="combat-label">AC</div>
                </div>
                <div className="combat-stat">
                    <div className="combat-value">{formatModifier(initiative)}</div>
                    <div className="combat-label">Init</div>
                </div>
                <div className="combat-stat">
                    <div className="combat-value">{speed}<span className="speed-unit">ft</span></div>
                    <div className="combat-label">Speed</div>
                </div>
            </div>
        </div>
    );
};

export default CombatStatusSection;


