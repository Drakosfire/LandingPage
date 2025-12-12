/**
 * SkillsSection Component
 * 
 * Displays the 18 D&D 5e skills with proficiency markers.
 * In edit mode, clicking opens the Class wizard step (skills come from class/background).
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
    BASICS: 0,
    ABILITIES: 1,
    RACE: 2,
    CLASS: 3,
    SPELLS: 4,
    BACKGROUND: 5,
    EQUIPMENT: 6,
    REVIEW: 7
} as const;

export interface SkillsSectionProps {
    /** Ability scores for modifier calculation */
    abilityScores: AbilityScores;
    /** Proficiency bonus */
    proficiencyBonus: number;
    /** Array of proficient skills */
    proficientSkills: string[];
}

interface Skill {
    name: string;
    ability: keyof AbilityScores;
    abbrev: string;
}

const SKILLS: Skill[] = [
    { name: 'Acrobatics', ability: 'dexterity', abbrev: 'Dex' },
    { name: 'Animal Handling', ability: 'wisdom', abbrev: 'Wis' },
    { name: 'Arcana', ability: 'intelligence', abbrev: 'Int' },
    { name: 'Athletics', ability: 'strength', abbrev: 'Str' },
    { name: 'Deception', ability: 'charisma', abbrev: 'Cha' },
    { name: 'History', ability: 'intelligence', abbrev: 'Int' },
    { name: 'Insight', ability: 'wisdom', abbrev: 'Wis' },
    { name: 'Intimidation', ability: 'charisma', abbrev: 'Cha' },
    { name: 'Investigation', ability: 'intelligence', abbrev: 'Int' },
    { name: 'Medicine', ability: 'wisdom', abbrev: 'Wis' },
    { name: 'Nature', ability: 'intelligence', abbrev: 'Int' },
    { name: 'Perception', ability: 'wisdom', abbrev: 'Wis' },
    { name: 'Performance', ability: 'charisma', abbrev: 'Cha' },
    { name: 'Persuasion', ability: 'charisma', abbrev: 'Cha' },
    { name: 'Religion', ability: 'intelligence', abbrev: 'Int' },
    { name: 'Sleight of Hand', ability: 'dexterity', abbrev: 'Dex' },
    { name: 'Stealth', ability: 'dexterity', abbrev: 'Dex' },
    { name: 'Survival', ability: 'wisdom', abbrev: 'Wis' }
];

function calculateModifier(score: number): number {
    return Math.floor((score - 10) / 2);
}

function formatModifier(mod: number): string {
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
    abilityScores,
    proficiencyBonus,
    proficientSkills
}) => {
    const { isEditMode, openDrawerToStep } = usePlayerCharacterGenerator();

    const handleSectionClick = () => {
        if (isEditMode) {
            console.log('🔗 [SkillsSection] Opening Class step (skills from class/background)');
            openDrawerToStep(WIZARD_STEPS.CLASS);
        }
    };

    return (
        <div 
            className="phb-section skills-section" 
            data-testid="skills-section"
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
            title={isEditMode ? "Edit skill proficiencies (Class/Background)" : undefined}
        >
            {SKILLS.map((skill) => {
                const isProficient = proficientSkills.includes(skill.name);
                const baseMod = calculateModifier(abilityScores[skill.ability] ?? 10);
                const totalMod = isProficient ? baseMod + proficiencyBonus : baseMod;

                return (
                    <div key={skill.name} className="skill-item">
                        <div className={`prof-marker ${isProficient ? 'filled' : ''}`} />
                        <div className="modifier">{formatModifier(totalMod)}</div>
                        <div className="skill-name">
                            {skill.name} <span className="skill-ability">({skill.abbrev})</span>
                        </div>
                    </div>
                );
            })}
            <div className="section-title">Skills</div>
        </div>
    );
};

export default SkillsSection;

