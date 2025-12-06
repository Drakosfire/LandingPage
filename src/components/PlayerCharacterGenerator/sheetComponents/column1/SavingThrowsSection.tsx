/**
 * SavingThrowsSection Component
 * 
 * Displays the 6 saving throws with proficiency markers.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/column1
 */

import React from 'react';
import type { AbilityScores } from '../AbilityScoresRow';

export interface SavingThrowsSectionProps {
    /** Ability scores for modifier calculation */
    abilityScores: AbilityScores;
    /** Proficiency bonus */
    proficiencyBonus: number;
    /** Array of proficient saving throws (e.g., ['strength', 'constitution']) */
    proficientSaves: string[];
}

const SAVES: Array<{ key: keyof AbilityScores; name: string }> = [
    { key: 'strength', name: 'Strength' },
    { key: 'dexterity', name: 'Dexterity' },
    { key: 'constitution', name: 'Constitution' },
    { key: 'intelligence', name: 'Intelligence' },
    { key: 'wisdom', name: 'Wisdom' },
    { key: 'charisma', name: 'Charisma' }
];

function calculateModifier(score: number): number {
    return Math.floor((score - 10) / 2);
}

function formatModifier(mod: number): string {
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

export const SavingThrowsSection: React.FC<SavingThrowsSectionProps> = ({
    abilityScores,
    proficiencyBonus,
    proficientSaves
}) => {
    return (
        <div className="phb-section saves-section" data-testid="saving-throws-section">
            {SAVES.map(({ key, name }) => {
                const isProficient = proficientSaves.includes(key);
                const baseMod = calculateModifier(abilityScores[key] ?? 10);
                const totalMod = isProficient ? baseMod + proficiencyBonus : baseMod;

                return (
                    <div key={key} className="save-item">
                        <div className={`prof-marker ${isProficient ? 'filled' : ''}`} />
                        <div className="modifier">{formatModifier(totalMod)}</div>
                        <div className="skill-name">{name}</div>
                    </div>
                );
            })}
            <div className="section-title">Saving Throws</div>
        </div>
    );
};

export default SavingThrowsSection;

