/**
 * FooterBar Component
 * 
 * Compact footer bar containing reference stats:
 * - Inspiration (checkbox)
 * - Proficiency Bonus
 * - Passive Perception
 * - Hit Dice
 * - Death Saves
 * 
 * @module PlayerCharacterGenerator/sheetComponents
 */

import React from 'react';

export interface FooterBarProps {
    /** Whether character has inspiration */
    hasInspiration?: boolean;
    /** Proficiency bonus */
    proficiencyBonus: number;
    /** Passive perception value */
    passivePerception: number;
    /** Hit dice (e.g., "1d10") */
    hitDice: string;
    /** Death save successes (0-3) */
    deathSaveSuccesses?: number;
    /** Death save failures (0-3) */
    deathSaveFailures?: number;
}

/**
 * FooterBar - Compact reference stats bar at bottom of character sheet
 */
export const FooterBar: React.FC<FooterBarProps> = ({
    hasInspiration = false,
    proficiencyBonus,
    passivePerception,
    hitDice,
    deathSaveSuccesses = 0,
    deathSaveFailures = 0
}) => {
    return (
        <div className="sheet-footer-bar" data-testid="footer-bar">
            {/* Inspiration */}
            <div className="footer-stat">
                <div className={`footer-circle ${hasInspiration ? 'filled' : ''}`}>
                    {hasInspiration ? '✓' : ''}
                </div>
                <span className="footer-label">Insp</span>
            </div>

            <div className="footer-divider" />

            {/* Proficiency Bonus */}
            <div className="footer-stat">
                <span className="footer-value">+{proficiencyBonus}</span>
                <span className="footer-label">Prof</span>
            </div>

            <div className="footer-divider" />

            {/* Passive Perception */}
            <div className="footer-stat">
                <span className="footer-value">{passivePerception}</span>
                <span className="footer-label">Passive</span>
            </div>

            <div className="footer-divider" />

            {/* Hit Dice */}
            <div className="footer-stat">
                <span className="footer-value">{hitDice}</span>
                <span className="footer-label">Hit Dice</span>
            </div>

            <div className="footer-divider" />

            {/* Death Saves */}
            <div className="footer-stat death-saves">
                <span className="footer-label">Death</span>
                <div className="death-circles">
                    {[0, 1, 2].map(i => (
                        <div
                            key={`success-${i}`}
                            className={`death-dot success ${i < deathSaveSuccesses ? 'filled' : ''}`}
                        />
                    ))}
                    <span className="death-separator">/</span>
                    {[0, 1, 2].map(i => (
                        <div
                            key={`failure-${i}`}
                            className={`death-dot failure ${i < deathSaveFailures ? 'filled' : ''}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FooterBar;


