/**
 * CombatStatsSection Component
 * 
 * AC, Initiative, Speed, HP, Hit Dice, and Death Saves.
 * Uses CSS grid for PHB-style layout.
 * 
 * @module PlayerCharacterGenerator/canvasComponents/sections/CombatStatsSection
 */

import React from 'react';
import type { SpeedObject } from '../../types/system.types';

export interface CombatStatsSectionProps {
    /** Armor Class */
    armorClass: number;
    /** Initiative bonus */
    initiative: number;
    /** Speed (can be number or SpeedObject) */
    speed: number | SpeedObject;
    /** Current HP */
    currentHP: number;
    /** Maximum HP */
    maxHP: number;
    /** Temporary HP */
    tempHP?: number;
    /** Hit dice (e.g., "1d10") */
    hitDice: string;
    /** Proficiency bonus */
    proficiencyBonus?: number;
    /** Death save successes (0-3) */
    deathSaveSuccesses?: number;
    /** Death save failures (0-3) */
    deathSaveFailures?: number;
}

/**
 * Format speed for display
 */
function formatSpeed(speed: number | SpeedObject): string {
    if (typeof speed === 'number') {
        return `${speed} ft.`;
    }

    const parts: string[] = [];
    if (speed.walk) parts.push(`${speed.walk} ft.`);
    if (speed.fly) parts.push(`fly ${speed.fly} ft.`);
    if (speed.swim) parts.push(`swim ${speed.swim} ft.`);
    if (speed.climb) parts.push(`climb ${speed.climb} ft.`);
    if (speed.burrow) parts.push(`burrow ${speed.burrow} ft.`);

    return parts.join(', ') || '30 ft.';
}

/**
 * Format initiative modifier
 */
function formatInit(init: number): string {
    return init >= 0 ? `+${init}` : `${init}`;
}

/**
 * CombatStatsSection - Combat stats grid + HP box + death saves
 */
export const CombatStatsSection: React.FC<CombatStatsSectionProps> = ({
    armorClass,
    initiative,
    speed,
    currentHP,
    maxHP,
    tempHP = 0,
    hitDice,
    proficiencyBonus = 2,
    deathSaveSuccesses = 0,
    deathSaveFailures = 0
}) => {
    return (
        <div className="block character frame" id="combat-stats">
            {/* Top row: AC, Initiative, Speed */}
            <div className="combat-stats-grid">
                <div className="combat-stat-box">
                    <div className="stat-label">Armor Class</div>
                    <div className="stat-value">{armorClass}</div>
                </div>
                <div className="combat-stat-box">
                    <div className="stat-label">Initiative</div>
                    <div className="stat-value">{formatInit(initiative)}</div>
                </div>
                <div className="combat-stat-box">
                    <div className="stat-label">Speed</div>
                    <div className="stat-value">{formatSpeed(speed)}</div>
                </div>
            </div>

            {/* HP Box */}
            <div className="combat-stat-box hp-box">
                <div className="stat-label">Hit Points</div>
                <div className="hp-current">{currentHP}</div>
                <div className="hp-max">/ {maxHP} max</div>
                {tempHP > 0 && (
                    <div className="hp-temp">+ {tempHP} temp</div>
                )}
            </div>

            {/* Hit Dice */}
            <div className="hit-dice-display">
                <strong>Hit Dice:</strong> <span className="hit-dice-value">{hitDice}</span>
            </div>

            {/* Death Saves */}
            <div className="death-saves">
                <div className="death-saves-group">
                    <span className="death-saves-label">Successes</span>
                    {[0, 1, 2].map(i => (
                        <span
                            key={`success-${i}`}
                            className={`death-save-box success ${i < deathSaveSuccesses ? 'filled' : ''}`}
                        />
                    ))}
                </div>
                <div className="death-saves-group">
                    <span className="death-saves-label">Failures</span>
                    {[0, 1, 2].map(i => (
                        <span
                            key={`failure-${i}`}
                            className={`death-save-box failure ${i < deathSaveFailures ? 'filled' : ''}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CombatStatsSection;

