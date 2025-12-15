/**
 * CombatStatsBlock Component
 * 
 * Displays combat statistics: HP, AC, Initiative, Speed, Proficiency Bonus.
 * Following the D&D 5e PHB character sheet style.
 * 
 * @module PlayerCharacterGenerator/canvasComponents/CombatStatsBlock
 */

import React from 'react';
import type { DnD5eDerivedStats } from '../types/dnd5e/character.types';
import type { SpeedObject } from '../types/system.types';

export interface CombatStatsBlockProps {
    /** Derived stats from character data */
    derivedStats: DnD5eDerivedStats;
    /** Optional current HP (if different from max) */
    currentHp?: number;
    /** Optional temp HP */
    tempHp?: number;
    /** Whether edit mode is enabled (Phase 2+) */
    isEditMode?: boolean;
    /** Callback when HP changes (Phase 2+) */
    onHpChange?: (current: number, temp?: number) => void;
}

/**
 * Format speed for display
 */
function formatSpeed(speed: SpeedObject | number | undefined): string {
    if (!speed) return '30 ft.';

    if (typeof speed === 'number') {
        return `${speed} ft.`;
    }

    const parts: string[] = [];

    if (speed.walk) parts.push(`${speed.walk} ft.`);
    if (speed.fly) parts.push(`fly ${speed.fly} ft.`);
    if (speed.swim) parts.push(`swim ${speed.swim} ft.`);
    if (speed.climb) parts.push(`climb ${speed.climb} ft.`);
    if (speed.burrow) parts.push(`burrow ${speed.burrow} ft.`);

    return parts.length > 0 ? parts.join(', ') : '30 ft.';
}

/**
 * Format modifier with +/- sign
 */
function formatModifier(value: number): string {
    return value >= 0 ? `+${value}` : `${value}`;
}

/**
 * Single stat box component
 */
interface StatBoxProps {
    label: string;
    value: string | number;
    subValue?: string;
    testId: string;
    highlight?: boolean;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, subValue, testId, highlight = false }) => (
    <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0.5rem 0.75rem',
            background: highlight ? 'rgba(161, 29, 24, 0.1)' : 'rgba(247, 235, 215, 0.6)',
            borderRadius: '4px',
            minWidth: '60px'
        }}
    >
        <span
            style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#58180d',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.2rem'
            }}
        >
            {label}
        </span>
        <span
            style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: '#2b1d0f',
                fontFamily: 'ScalySansRemake, "Open Sans", sans-serif'
            }}
            data-testid={testId}
        >
            {value}
        </span>
        {subValue && (
            <span
                style={{
                    fontSize: '0.75rem',
                    color: 'rgba(43, 29, 15, 0.7)'
                }}
            >
                {subValue}
            </span>
        )}
    </div>
);

/**
 * CombatStatsBlock - Combat statistics display
 * 
 * Layout:
 * ┌─────────────────────────────────────────────────────┐
 * │   AC    │   HP    │  INIT  │  SPEED  │   PROF     │
 * │   17    │  12/12  │   +2   │  30 ft. │    +2      │
 * └─────────────────────────────────────────────────────┘
 */
const CombatStatsBlock: React.FC<CombatStatsBlockProps> = ({
    derivedStats,
    currentHp,
    tempHp,
    isEditMode = false,
    onHpChange
}) => {
    const {
        armorClass = 10,
        maxHp = 1,
        initiative = 0,
        speed = { walk: 30 },
        proficiencyBonus = 2,
        currentHp: statCurrentHp
    } = derivedStats;

    const displayCurrentHp = currentHp ?? statCurrentHp ?? maxHp;
    const hpDisplay = tempHp && tempHp > 0
        ? `${displayCurrentHp}+${tempHp}/${maxHp}`
        : `${displayCurrentHp}/${maxHp}`;

    return (
        <div
            className="dm-stat-summary combat-stats-block"
            data-testid="combat-stats-block"
            data-tutorial="combat-stats"
        >
            {/* Section Header */}
            <h3
                style={{
                    fontFamily: 'BookInsanityRemake, serif',
                    color: '#a11d18',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 0.6rem',
                    fontSize: '0.95rem',
                    borderBottom: '1px solid rgba(161, 29, 24, 0.3)',
                    paddingBottom: '0.3rem'
                }}
            >
                Combat
            </h3>

            {/* Stats Row */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    justifyContent: 'flex-start'
                }}
            >
                <StatBox
                    label="AC"
                    value={armorClass}
                    testId="combat-ac"
                    highlight
                />
                <StatBox
                    label="HP"
                    value={hpDisplay}
                    testId="combat-hp"
                    highlight
                />
                <StatBox
                    label="Initiative"
                    value={formatModifier(initiative)}
                    testId="combat-initiative"
                />
                <StatBox
                    label="Speed"
                    value={formatSpeed(speed)}
                    testId="combat-speed"
                />
                <StatBox
                    label="Prof. Bonus"
                    value={formatModifier(proficiencyBonus)}
                    testId="combat-proficiency"
                />
            </div>

            {/* Hit Dice (optional display) */}
            {derivedStats.hitDice && (
                <div
                    style={{
                        marginTop: '0.5rem',
                        fontSize: '0.8rem',
                        color: 'rgba(43, 29, 15, 0.7)'
                    }}
                    data-testid="combat-hit-dice"
                >
                    Hit Dice: {derivedStats.hitDice.current}/{derivedStats.hitDice.total}d{derivedStats.hitDice.size}
                </div>
            )}
        </div>
    );
};

export default CombatStatsBlock;

// Export helpers for testing
export { formatSpeed, formatModifier, StatBox };

