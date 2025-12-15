/**
 * Column1Content Component
 * 
 * Aggregates all Column 1 content: Saves, Skills, Proficiencies.
 * (Inspiration, Prof Bonus, Passive Perception moved to FooterBar)
 * 
 * @module PlayerCharacterGenerator/sheetComponents/column1
 */

import React from 'react';
import { SavingThrowsSection } from './SavingThrowsSection';
import { SkillsSection } from './SkillsSection';
import type { AbilityScores } from '../AbilityScoresRow';
import { usePlayerCharacterGenerator } from '../../PlayerCharacterGeneratorProvider';

/**
 * Wizard step constants for navigation
 */
const WIZARD_STEPS = {
    BASICS: 0,
    ABILITIES: 1,
    RACE: 2,
    CLASS: 3,
    SPELLS: 4,
    BACKGROUND: 5,
    EQUIPMENT: 6,
    REVIEW: 7
} as const;

export interface Column1ContentProps {
    /** Ability scores */
    abilityScores: AbilityScores;
    /** Proficiency bonus */
    proficiencyBonus: number;
    /** Proficient saving throws */
    proficientSaves: string[];
    /** Proficient skills */
    proficientSkills: string[];
    /** Languages */
    languages?: string[];
    /** Armor proficiencies */
    armorProficiencies?: string[];
    /** Weapon proficiencies */
    weaponProficiencies?: string[];
    /** Tool proficiencies */
    toolProficiencies?: string[];
}

export const Column1Content: React.FC<Column1ContentProps> = ({
    abilityScores,
    proficiencyBonus,
    proficientSaves,
    proficientSkills,
    languages = ['Common'],
    armorProficiencies = [],
    weaponProficiencies = [],
    toolProficiencies = []
}) => {
    const { isEditMode, openDrawerToStep } = usePlayerCharacterGenerator();

    const handleProficienciesClick = () => {
        if (isEditMode) {
            console.log('🔗 [Column1Content] Opening Class step (proficiencies from class/race)');
            openDrawerToStep(WIZARD_STEPS.CLASS);
        }
    };

    return (
        <>
            {/* Saving Throws */}
            <SavingThrowsSection
                abilityScores={abilityScores}
                proficiencyBonus={proficiencyBonus}
                proficientSaves={proficientSaves}
            />

            {/* Skills */}
            <SkillsSection
                abilityScores={abilityScores}
                proficiencyBonus={proficiencyBonus}
                proficientSkills={proficientSkills}
            />

            {/* Proficiencies & Languages */}
            <div 
                className="phb-section proficiencies-box"
                data-editable={isEditMode ? "complex" : undefined}
                onClick={handleProficienciesClick}
                role={isEditMode ? 'button' : undefined}
                tabIndex={isEditMode ? 0 : undefined}
                onKeyDown={(e) => {
                    if (isEditMode && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleProficienciesClick();
                    }
                }}
                title={isEditMode ? "Edit proficiencies (Class/Race)" : undefined}
            >
                <div className="text-area">
                    <strong>Lang:</strong> {languages.join(', ')}<br />
                    <strong>Armor:</strong> {armorProficiencies.length > 0 ? armorProficiencies.join(', ') : 'None'}<br />
                    <strong>Weap:</strong> {weaponProficiencies.length > 0 ? weaponProficiencies.join(', ') : 'None'}<br />
                    {toolProficiencies.length > 0 && (
                        <><strong>Tools:</strong> {toolProficiencies.join(', ')}</>
                    )}
                </div>
            </div>
        </>
    );
};

export default Column1Content;

