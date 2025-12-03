/**
 * SkillsBlock Component
 * 
 * Displays all 18 D&D 5e skills with proficiency markers and modifiers.
 * Shows ● for proficient, ○ for non-proficient.
 * 
 * @module PlayerCharacterGenerator/canvasComponents/SkillsBlock
 */

import React from 'react';
import type { AbilityScores } from '../engine/RuleEngine.types';

export interface SkillsBlockProps {
    /** Ability scores for calculating modifiers */
    abilityScores: AbilityScores;
    /** List of proficient skill names */
    proficientSkills: string[];
    /** Proficiency bonus to add for proficient skills */
    proficiencyBonus: number;
    /** Skills with expertise (double proficiency) */
    expertiseSkills?: string[];
    /** Whether edit mode is enabled (Phase 2+) */
    isEditMode?: boolean;
}

/**
 * Skill definitions with ability mapping
 */
type AbilityName = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';

interface SkillDef {
    name: string;
    displayName: string;
    ability: AbilityName;
}

const SKILLS: SkillDef[] = [
    { name: 'Acrobatics', displayName: 'Acrobatics', ability: 'dexterity' },
    { name: 'Animal Handling', displayName: 'Animal Handling', ability: 'wisdom' },
    { name: 'Arcana', displayName: 'Arcana', ability: 'intelligence' },
    { name: 'Athletics', displayName: 'Athletics', ability: 'strength' },
    { name: 'Deception', displayName: 'Deception', ability: 'charisma' },
    { name: 'History', displayName: 'History', ability: 'intelligence' },
    { name: 'Insight', displayName: 'Insight', ability: 'wisdom' },
    { name: 'Intimidation', displayName: 'Intimidation', ability: 'charisma' },
    { name: 'Investigation', displayName: 'Investigation', ability: 'intelligence' },
    { name: 'Medicine', displayName: 'Medicine', ability: 'wisdom' },
    { name: 'Nature', displayName: 'Nature', ability: 'intelligence' },
    { name: 'Perception', displayName: 'Perception', ability: 'wisdom' },
    { name: 'Performance', displayName: 'Performance', ability: 'charisma' },
    { name: 'Persuasion', displayName: 'Persuasion', ability: 'charisma' },
    { name: 'Religion', displayName: 'Religion', ability: 'intelligence' },
    { name: 'Sleight of Hand', displayName: 'Sleight of Hand', ability: 'dexterity' },
    { name: 'Stealth', displayName: 'Stealth', ability: 'dexterity' },
    { name: 'Survival', displayName: 'Survival', ability: 'wisdom' }
];

/**
 * Calculate ability modifier
 */
function calculateModifier(score: number): number {
    return Math.floor((score - 10) / 2);
}

/**
 * Format modifier with +/- sign
 */
function formatModifier(value: number): string {
    return value >= 0 ? `+${value}` : `${value}`;
}

/**
 * Normalize skill name for comparison
 */
function normalizeSkillName(name: string): string {
    return name.toLowerCase().replace(/[\s-]/g, '');
}

/**
 * Check if skill is proficient (handles various naming formats)
 */
function isProficient(skillName: string, proficientSkills: string[]): boolean {
    const normalized = normalizeSkillName(skillName);
    return proficientSkills.some(s => normalizeSkillName(s) === normalized);
}

/**
 * Single skill row component
 */
interface SkillRowProps {
    skill: SkillDef;
    modifier: number;
    isProficient: boolean;
    hasExpertise: boolean;
}

const SkillRow: React.FC<SkillRowProps> = ({ skill, modifier, isProficient, hasExpertise }) => (
    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.15rem 0',
            fontSize: '0.85rem',
            borderBottom: '1px solid rgba(88, 24, 13, 0.1)'
        }}
        data-testid={`skill-${normalizeSkillName(skill.name)}`}
    >
        {/* Proficiency marker */}
        <span
            style={{
                width: '12px',
                fontWeight: 700,
                color: isProficient ? '#58180d' : 'rgba(43, 29, 15, 0.4)'
            }}
            title={hasExpertise ? 'Expertise' : isProficient ? 'Proficient' : 'Not proficient'}
        >
            {hasExpertise ? '◆' : isProficient ? '●' : '○'}
        </span>

        {/* Modifier */}
        <span
            style={{
                width: '28px',
                fontWeight: 600,
                color: '#2b1d0f',
                textAlign: 'right'
            }}
        >
            {formatModifier(modifier)}
        </span>

        {/* Skill name */}
        <span style={{ color: '#2b1d0f' }}>
            {skill.displayName}
        </span>

        {/* Ability abbreviation */}
        <span
            style={{
                marginLeft: 'auto',
                fontSize: '0.7rem',
                color: 'rgba(43, 29, 15, 0.5)',
                textTransform: 'uppercase'
            }}
        >
            ({skill.ability.slice(0, 3)})
        </span>
    </div>
);

/**
 * SkillsBlock - All 18 skills display
 * 
 * Layout:
 * ┌─────────────────────────────────┐
 * │ Skills                          │
 * │ ● +5  Athletics         (STR)   │
 * │ ○ +2  Acrobatics        (DEX)   │
 * │ ...                             │
 * └─────────────────────────────────┘
 */
const SkillsBlock: React.FC<SkillsBlockProps> = ({
    abilityScores,
    proficientSkills,
    proficiencyBonus,
    expertiseSkills = [],
    isEditMode = false
}) => {
    return (
        <div
            className="dm-skills-block skills-block"
            data-testid="skills-block"
            data-tutorial="skills"
        >
            {/* Section Header */}
            <h3
                style={{
                    fontFamily: 'BookInsanityRemake, serif',
                    color: '#a11d18',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 0.5rem',
                    fontSize: '0.95rem',
                    borderBottom: '1px solid rgba(161, 29, 24, 0.3)',
                    paddingBottom: '0.3rem'
                }}
            >
                Skills
            </h3>

            {/* Skills List */}
            <div>
                {SKILLS.map(skill => {
                    const baseMod = calculateModifier(abilityScores[skill.ability]);
                    const proficient = isProficient(skill.name, proficientSkills);
                    const hasExpertise = isProficient(skill.name, expertiseSkills);

                    let modifier = baseMod;
                    if (hasExpertise) {
                        modifier += proficiencyBonus * 2;
                    } else if (proficient) {
                        modifier += proficiencyBonus;
                    }

                    return (
                        <SkillRow
                            key={skill.name}
                            skill={skill}
                            modifier={modifier}
                            isProficient={proficient}
                            hasExpertise={hasExpertise}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default SkillsBlock;

// Export for testing
export { SKILLS, calculateModifier, formatModifier, normalizeSkillName, isProficient };

