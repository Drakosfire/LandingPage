/**
 * SavingThrowsSection Component
 * 
 * Displays the 6 saving throws with proficiency markers.
 * In edit mode, clicking opens the Class wizard step (saves come from class).
 * 
 * @module PlayerCharacterGenerator/sheetComponents/column1
 */

import React from 'react';
import type { AbilityScores } from '../AbilityScoresRow';
import { usePlayerCharacterGenerator } from '../../PlayerCharacterGeneratorProvider';

/**
 * Wizard step constants for navigation
 */
const WIZARD_STEPS = {
    ABILITIES: 0,
    RACE: 1,
    CLASS: 2,
    SPELLS: 3,
    BACKGROUND: 4,
    EQUIPMENT: 5,
    REVIEW: 6
} as const;

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
    const { isEditMode, openDrawerToStep } = usePlayerCharacterGenerator();

    const handleSectionClick = () => {
        if (isEditMode) {
            console.log('🔗 [SavingThrowsSection] Opening Class step (saves from class)');
            openDrawerToStep(WIZARD_STEPS.CLASS);
        }
    };

    return (
        <div 
            className="phb-section saves-section" 
            data-testid="saving-throws-section"
            data-editable={isEditMode ? "complex" : undefined}
            onClick={handleSectionClick}
            role={isEditMode ? 'button' : undefined}
            tabIndex={isEditMode ? 0 : undefined}
            onKeyDown={(e) => {
                if (isEditMode && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleSectionClick();
                }
            }}
            title={isEditMode ? "Edit saving throw proficiencies (Class)" : undefined}
        >
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

