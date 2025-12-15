/**
 * SavesSkillsSection Component
 * 
 * Combined saving throws and skills list with proficiency markers.
 * Uses CSS classes for PHB styling.
 * 
 * @module PlayerCharacterGenerator/canvasComponents/sections/SavesSkillsSection
 */

import React from 'react';
import type { AbilityScores, AbilityName } from '../../engine/RuleEngine.types';

export interface SavesSkillsSectionProps {
    /** Ability scores for calculating modifiers */
    abilityScores: AbilityScores;
    /** Proficiency bonus */
    proficiencyBonus: number;
    /** Proficient saving throws */
    proficientSaves: AbilityName[];
    /** Proficient skills */
    proficientSkills: string[];
}

/**
 * Calculate ability modifier
 */
function calculateModifier(score: number): number {
    return Math.floor((score - 10) / 2);
}

/**
 * Format modifier with sign
 */
function formatMod(mod: number): string {
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

/**
 * Saving throw labels
 */
const SAVES: Array<{ key: AbilityName; label: string }> = [
    { key: 'strength', label: 'Strength' },
    { key: 'dexterity', label: 'Dexterity' },
    { key: 'constitution', label: 'Constitution' },
    { key: 'intelligence', label: 'Intelligence' },
    { key: 'wisdom', label: 'Wisdom' },
    { key: 'charisma', label: 'Charisma' }
];

/**
 * Skills with their associated ability
 */
const SKILLS: Array<{ name: string; ability: AbilityName }> = [
    { name: 'Acrobatics', ability: 'dexterity' },
    { name: 'Animal Handling', ability: 'wisdom' },
    { name: 'Arcana', ability: 'intelligence' },
    { name: 'Athletics', ability: 'strength' },
    { name: 'Deception', ability: 'charisma' },
    { name: 'History', ability: 'intelligence' },
    { name: 'Insight', ability: 'wisdom' },
    { name: 'Intimidation', ability: 'charisma' },
    { name: 'Investigation', ability: 'intelligence' },
    { name: 'Medicine', ability: 'wisdom' },
    { name: 'Nature', ability: 'intelligence' },
    { name: 'Perception', ability: 'wisdom' },
    { name: 'Performance', ability: 'charisma' },
    { name: 'Persuasion', ability: 'charisma' },
    { name: 'Religion', ability: 'intelligence' },
    { name: 'Sleight of Hand', ability: 'dexterity' },
    { name: 'Stealth', ability: 'dexterity' },
    { name: 'Survival', ability: 'wisdom' }
];

/**
 * SavesSkillsSection - Combined saves + skills with proficiency markers
 */
export const SavesSkillsSection: React.FC<SavesSkillsSectionProps> = ({
    abilityScores,
    proficiencyBonus,
    proficientSaves,
    proficientSkills
}) => {
    return (
        <div className="block character frame" id="saves-skills">
            {/* Saving Throws */}
            <h4>Saving Throws</h4>
            <ul className="saves-list">
                {SAVES.map(({ key, label }) => {
                    const baseMod = calculateModifier(abilityScores[key] ?? 10);
                    const isProficient = proficientSaves.includes(key);
                    const totalMod = isProficient ? baseMod + proficiencyBonus : baseMod;

                    return (
                        <li key={key} className="save-item">
                            <span
                                className={`proficiency-marker ${isProficient ? 'proficient' : ''}`}
                            />
                            <span className="save-modifier">{formatMod(totalMod)}</span>
                            <span className="save-name">{label}</span>
                        </li>
                    );
                })}
            </ul>

            {/* Skills */}
            <h4>Skills</h4>
            <ul className="skills-list">
                {SKILLS.map(({ name, ability }) => {
                    const baseMod = calculateModifier(abilityScores[ability] ?? 10);
                    const isProficient = proficientSkills.includes(name.toLowerCase());
                    const totalMod = isProficient ? baseMod + proficiencyBonus : baseMod;

                    return (
                        <li key={name} className="skill-item">
                            <span
                                className={`proficiency-marker ${isProficient ? 'proficient' : ''}`}
                            />
                            <span className="skill-modifier">{formatMod(totalMod)}</span>
                            <span className="skill-name">
                                {name} <small>({ability.slice(0, 3).toUpperCase()})</small>
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default SavesSkillsSection;

