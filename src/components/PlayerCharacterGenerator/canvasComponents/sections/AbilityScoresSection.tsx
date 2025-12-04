/**
 * AbilityScoresSection Component
 * 
 * PHB-styled 6-box ability score layout using CSS classes.
 * 
 * @module PlayerCharacterGenerator/canvasComponents/sections/AbilityScoresSection
 */

import React from 'react';
import type { AbilityScores } from '../../engine/RuleEngine.types';

export interface AbilityScoresSectionProps {
    /** Ability scores object */
    abilityScores: AbilityScores;
    /** Vertical layout (for narrow columns) */
    vertical?: boolean;
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
const ABILITY_ORDER: Array<{ key: keyof AbilityScores; label: string }> = [
    { key: 'strength', label: 'STR' },
    { key: 'dexterity', label: 'DEX' },
    { key: 'constitution', label: 'CON' },
    { key: 'intelligence', label: 'INT' },
    { key: 'wisdom', label: 'WIS' },
    { key: 'charisma', label: 'CHA' }
];

/**
 * AbilityScoresSection - PHB-styled 6-box grid
 */
export const AbilityScoresSection: React.FC<AbilityScoresSectionProps> = ({
    abilityScores,
    vertical = false
}) => {
    const gridClassName = vertical
        ? 'ability-scores-grid vertical'
        : 'ability-scores-grid';

    return (
        <div className="block character frame" id="abilities">
            <div className={gridClassName}>
                {ABILITY_ORDER.map(({ key, label }) => {
                    const score = abilityScores[key] ?? 10;
                    return (
                        <div
                            key={key}
                            className="ability-box"
                            data-testid={`ability-box-${key}`}
                        >
                            <div className="ability-label">{label}</div>
                            <div className="ability-score">{score}</div>
                            <div className="ability-modifier">
                                {formatModifier(score)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AbilityScoresSection;

