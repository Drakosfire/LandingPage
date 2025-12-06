/**
 * Column1Content Component
 * 
 * Aggregates all Column 1 content: Inspiration, Prof Bonus, Saves, Skills, Passive, Proficiencies.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/column1
 */

import React from 'react';
import { SavingThrowsSection } from './SavingThrowsSection';
import { SkillsSection } from './SkillsSection';
import type { AbilityScores } from '../AbilityScoresRow';

export interface Column1ContentProps {
    /** Ability scores */
    abilityScores: AbilityScores;
    /** Proficiency bonus */
    proficiencyBonus: number;
    /** Proficient saving throws */
    proficientSaves: string[];
    /** Proficient skills */
    proficientSkills: string[];
    /** Whether character has inspiration */
    hasInspiration?: boolean;
    /** Passive perception */
    passivePerception?: number;
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
    hasInspiration = false,
    passivePerception = 10,
    languages = ['Common'],
    armorProficiencies = [],
    weaponProficiencies = [],
    toolProficiencies = []
}) => {
    return (
        <>
            {/* Inspiration & Prof Bonus */}
            <div className="phb-section top-stats-box">
                <div className="stat-group">
                    <div className={`stat-circle ${hasInspiration ? 'filled' : ''}`}>
                        {hasInspiration ? '✓' : ''}
                    </div>
                    <div className="stat-label">Inspiration</div>
                </div>
                <div className="stat-group">
                    <div className="stat-circle">+{proficiencyBonus}</div>
                    <div className="stat-label">Prof Bonus</div>
                </div>
            </div>

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

            {/* Passive Perception */}
            <div className="phb-section passive-box">
                <div className="passive-value">{passivePerception}</div>
                <div className="passive-label">Passive Wisdom (Perception)</div>
            </div>

            {/* Proficiencies & Languages */}
            <div className="phb-section proficiencies-box">
                <div className="text-area">
                    <strong>Languages:</strong> {languages.join(', ')}<br />
                    <strong>Armor:</strong> {armorProficiencies.length > 0 ? armorProficiencies.join(', ') : 'None'}<br />
                    <strong>Weapons:</strong> {weaponProficiencies.length > 0 ? weaponProficiencies.join(', ') : 'None'}<br />
                    {toolProficiencies.length > 0 && (
                        <><strong>Tools:</strong> {toolProficiencies.join(', ')}</>
                    )}
                </div>
            </div>
        </>
    );
};

export default Column1Content;

