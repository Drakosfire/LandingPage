/**
 * SavingThrowsBlock Component
 * 
 * Displays the 6 saving throws with proficiency markers and modifiers.
 * Shows ● for proficient, ○ for non-proficient.
 * 
 * @module PlayerCharacterGenerator/canvasComponents/SavingThrowsBlock
 */

import React from 'react';
import type { AbilityScores, AbilityName } from '../engine/RuleEngine.types';

export interface SavingThrowsBlockProps {
    /** Ability scores for calculating modifiers */
    abilityScores: AbilityScores;
    /** List of proficient saving throw abilities */
    proficientSaves: AbilityName[];
    /** Proficiency bonus to add for proficient saves */
    proficiencyBonus: number;
    /** Whether edit mode is enabled (Phase 2+) */
    isEditMode?: boolean;
}

/**
 * Saving throw definitions
 */
interface SaveDef {
    ability: AbilityName;
    label: string;
    abbrev: string;
}

const SAVES: SaveDef[] = [
    { ability: 'strength', label: 'Strength', abbrev: 'STR' },
    { ability: 'dexterity', label: 'Dexterity', abbrev: 'DEX' },
    { ability: 'constitution', label: 'Constitution', abbrev: 'CON' },
    { ability: 'intelligence', label: 'Intelligence', abbrev: 'INT' },
    { ability: 'wisdom', label: 'Wisdom', abbrev: 'WIS' },
    { ability: 'charisma', label: 'Charisma', abbrev: 'CHA' }
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
 * Single save row component
 */
interface SaveRowProps {
    save: SaveDef;
    modifier: number;
    isProficient: boolean;
}

const SaveRow: React.FC<SaveRowProps> = ({ save, modifier, isProficient }) => (
    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.15rem 0',
            fontSize: '0.85rem'
        }}
        data-testid={`save-${save.ability}`}
    >
        {/* Proficiency marker */}
        <span
            style={{
                width: '12px',
                fontWeight: 700,
                color: isProficient ? '#58180d' : 'rgba(43, 29, 15, 0.4)'
            }}
            title={isProficient ? 'Proficient' : 'Not proficient'}
        >
            {isProficient ? '●' : '○'}
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

        {/* Save name */}
        <span style={{ color: '#2b1d0f' }}>
            {save.label}
        </span>
    </div>
);

/**
 * SavingThrowsBlock - All 6 saving throws display
 * 
 * Layout:
 * ┌─────────────────────────────────┐
 * │ Saving Throws                   │
 * │ ● +5  Strength                  │
 * │ ○ +2  Dexterity                 │
 * │ ● +4  Constitution              │
 * │ ...                             │
 * └─────────────────────────────────┘
 */
const SavingThrowsBlock: React.FC<SavingThrowsBlockProps> = ({
    abilityScores,
    proficientSaves,
    proficiencyBonus,
    isEditMode = false
}) => {
    return (
        <div
            className="dm-saves-block saving-throws-block"
            data-testid="saving-throws-block"
            data-tutorial="saving-throws"
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
                Saving Throws
            </h3>

            {/* Saves List */}
            <div>
                {SAVES.map(save => {
                    const baseMod = calculateModifier(abilityScores[save.ability]);
                    const isProficient = proficientSaves.includes(save.ability);
                    const modifier = isProficient ? baseMod + proficiencyBonus : baseMod;

                    return (
                        <SaveRow
                            key={save.ability}
                            save={save}
                            modifier={modifier}
                            isProficient={isProficient}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default SavingThrowsBlock;

// Export for testing
export { SAVES, calculateModifier, formatModifier };

