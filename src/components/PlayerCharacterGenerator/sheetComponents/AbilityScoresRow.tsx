/**
 * AbilityScoresRow Component
 * 
 * Horizontal row of 6 ability score boxes (STR, DEX, CON, INT, WIS, CHA).
 * Matches the HTML prototype structure.
 * 
 * Layout:
 * ┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
 * │ STRENGTH│DEXTERITY│CONSTITU.│INTELLIG.│ WISDOM  │CHARISMA │
 * │   14    │   10    │   14    │   10    │   12    │   16    │
 * │  (+2)   │  (+0)   │  (+2)   │  (+0)   │  (+1)   │  (+3)   │
 * └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
 * 
 * @module PlayerCharacterGenerator/sheetComponents
 */

import React from 'react';

export interface AbilityScores {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
}

export interface AbilityScoresRowProps {
    /** Ability scores object */
    scores: AbilityScores;
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
 * Ability labels in standard D&D order
 */
const ABILITIES: Array<{ key: keyof AbilityScores; name: string }> = [
    { key: 'strength', name: 'Strength' },
    { key: 'dexterity', name: 'Dexterity' },
    { key: 'constitution', name: 'Constitution' },
    { key: 'intelligence', name: 'Intelligence' },
    { key: 'wisdom', name: 'Wisdom' },
    { key: 'charisma', name: 'Charisma' }
];

/**
 * AbilityBox - Single ability score display
 */
interface AbilityBoxProps {
    name: string;
    score: number;
}

const AbilityBox: React.FC<AbilityBoxProps> = ({ name, score }) => (
    <div className="phb-section ability-box" data-testid={`ability-${name.toLowerCase()}`}>
        <div className="ability-name">{name}</div>
        <div className="ability-score">{score}</div>
        <div className="ability-modifier">{formatModifier(score)}</div>
    </div>
);

/**
 * AbilityScoresRow - Horizontal row of 6 ability boxes
 */
export const AbilityScoresRow: React.FC<AbilityScoresRowProps> = ({ scores }) => {
    return (
        <div className="ability-scores-row" data-testid="ability-scores-row">
            {ABILITIES.map(({ key, name }) => (
                <AbilityBox
                    key={key}
                    name={name}
                    score={scores[key] ?? 10}
                />
            ))}
        </div>
    );
};

export default AbilityScoresRow;

