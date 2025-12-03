/**
 * AbilityScoresBlock Component
 * 
 * Displays the 6 ability scores with modifiers in a horizontal table.
 * Following the D&D 5e PHB character sheet style.
 * 
 * @module PlayerCharacterGenerator/canvasComponents/AbilityScoresBlock
 */

import React from 'react';
import type { AbilityScores } from '../engine/RuleEngine.types';

export interface AbilityScoresBlockProps {
    /** Ability scores object */
    abilityScores: AbilityScores;
    /** Whether edit mode is enabled (Phase 2+) */
    isEditMode?: boolean;
    /** Callback when scores change (Phase 2+) */
    onScoreChange?: (ability: keyof AbilityScores, value: number) => void;
}

/**
 * Calculate ability modifier from score
 */
function calculateModifier(score: number): number {
    return Math.floor((score - 10) / 2);
}

/**
 * Format modifier with +/- sign
 */
function formatModifier(score: number): string {
    const mod = calculateModifier(score);
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

/**
 * Ability score labels in standard D&D order
 */
const ABILITY_ORDER: Array<{ key: keyof AbilityScores; label: string }> = [
    { key: 'strength', label: 'STR' },
    { key: 'dexterity', label: 'DEX' },
    { key: 'constitution', label: 'CON' },
    { key: 'intelligence', label: 'INT' },
    { key: 'wisdom', label: 'WIS' },
    { key: 'charisma', label: 'CHA' }
];

/**
 * AbilityScoresBlock - Horizontal ability score display
 * 
 * Layout:
 * ┌───────┬───────┬───────┬───────┬───────┬───────┐
 * │  STR  │  DEX  │  CON  │  INT  │  WIS  │  CHA  │
 * ├───────┼───────┼───────┼───────┼───────┼───────┤
 * │  16   │  14   │  14   │  10   │  12   │   8   │
 * │ (+3)  │ (+2)  │ (+2)  │ (+0)  │ (+1)  │ (-1)  │
 * └───────┴───────┴───────┴───────┴───────┴───────┘
 */
const AbilityScoresBlock: React.FC<AbilityScoresBlockProps> = ({
    abilityScores,
    isEditMode = false,
    onScoreChange
}) => {
    return (
        <div
            className="dm-ability-table ability-scores-block"
            data-testid="ability-scores-block"
            data-tutorial="ability-scores"
        >
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'center'
                }}
            >
                <thead>
                    <tr>
                        {ABILITY_ORDER.map(({ label }) => (
                            <th
                                key={label}
                                style={{
                                    padding: '0.4rem 0',
                                    background: 'linear-gradient(180deg, rgba(143, 36, 28, 0.9) 0%, rgba(90, 22, 18, 0.9) 100%)',
                                    color: '#fdf6ea',
                                    fontWeight: 700,
                                    fontFamily: 'ScalySansRemake, "Open Sans", sans-serif',
                                    fontSize: '0.9rem',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                {label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {ABILITY_ORDER.map(({ key, label }) => {
                            const score = abilityScores[key] ?? 10;
                            return (
                                <td
                                    key={key}
                                    style={{
                                        padding: '0.5rem 0',
                                        background: 'rgba(247, 235, 215, 0.85)',
                                        borderLeft: key !== 'strength' ? '1px solid rgba(88, 24, 13, 0.2)' : 'none'
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.15rem'
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontWeight: 700,
                                                fontSize: '1.1rem',
                                                fontFamily: 'ScalySansRemake, "Open Sans", sans-serif',
                                                color: '#2b1d0f'
                                            }}
                                            data-testid={`ability-score-${key}`}
                                        >
                                            {score}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                color: '#58180d',
                                                fontFamily: 'ScalySansRemake, "Open Sans", sans-serif'
                                            }}
                                            data-testid={`ability-modifier-${key}`}
                                        >
                                            ({formatModifier(score)})
                                        </span>
                                    </div>
                                </td>
                            );
                        })}
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default AbilityScoresBlock;

// Export helpers for testing
export { calculateModifier, formatModifier, ABILITY_ORDER };

