/**
 * SpellHeader Component
 * 
 * Header row with spellcasting class, ability, save DC, and attack bonus.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/spells
 */

import React from 'react';

export interface SpellHeaderProps {
    /** Spellcasting class name */
    spellcastingClass: string;
    /** Spellcasting ability abbreviation (INT, WIS, CHA) */
    spellcastingAbility: string;
    /** Spell save DC */
    spellSaveDC: number;
    /** Spell attack bonus */
    spellAttackBonus: number;
}

/**
 * LabeledBox - Reusable labeled box pattern
 */
interface LabeledBoxProps {
    value: string | number;
    label: string;
    className?: string;
}

const LabeledBox: React.FC<LabeledBoxProps> = ({ value, label, className = '' }) => (
    <div className={`labeled-box ${className}`}>
        <div className="value">{value}</div>
        <div className="label">{label}</div>
    </div>
);

/**
 * SpellHeader - Spellcasting info header
 */
export const SpellHeader: React.FC<SpellHeaderProps> = ({
    spellcastingClass,
    spellcastingAbility,
    spellSaveDC,
    spellAttackBonus
}) => {
    const attackBonusStr = spellAttackBonus >= 0
        ? `+${spellAttackBonus}`
        : `${spellAttackBonus}`;

    return (
        <div className="spell-header">
            <div className="spell-header-info">
                <LabeledBox value={spellcastingClass} label="Spellcasting Class" />
                <LabeledBox value={spellcastingAbility} label="Ability" className="narrow" />
                <LabeledBox value={spellSaveDC} label="Spell Save DC" className="narrow" />
                <LabeledBox value={attackBonusStr} label="Spell Attack" className="narrow" />
            </div>
        </div>
    );
};

export default SpellHeader;

