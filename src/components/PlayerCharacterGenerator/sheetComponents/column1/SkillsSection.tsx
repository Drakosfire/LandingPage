/**
 * SkillsSection Component
 * 
 * Displays the 18 D&D 5e skills with proficiency markers.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/column1
 */

import React from 'react';
import type { AbilityScores } from '../AbilityScoresRow';

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
    return (
        <div className="phb-section skills-section" data-testid="skills-section">
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

