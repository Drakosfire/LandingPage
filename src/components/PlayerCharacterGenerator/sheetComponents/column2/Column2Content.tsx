/**
 * Column2Content Component
 * 
 * Aggregates all Column 2 content: Attacks, Equipment.
 * (Combat Status moved to AbilityScoresRow, Hit Dice & Death Saves in FooterBar)
 * 
 * @module PlayerCharacterGenerator/sheetComponents/column2
 */

import React from 'react';

export interface Currency {
    cp?: number;
    sp?: number;
    ep?: number;
    gp?: number;
    pp?: number;
}

export interface Attack {
    name: string;
    attackBonus: string;
    damage: string;
}

export interface Column2ContentProps {
    /** Attacks list */
    attacks?: Attack[];
    /** Currency */
    currency?: Currency;
    /** Equipment list */
    equipment?: string[];
}

export const Column2Content: React.FC<Column2ContentProps> = ({
    attacks = [],
    currency = {},
    equipment = []
}) => {
    // Format currency display - only show non-zero values, prioritize GP
    const formatCurrency = () => {
        const parts: string[] = [];
        if (currency.gp) parts.push(`${currency.gp} GP`);
        if (currency.sp) parts.push(`${currency.sp} SP`);
        if (currency.cp) parts.push(`${currency.cp} CP`);
        if (currency.ep) parts.push(`${currency.ep} EP`);
        if (currency.pp) parts.push(`${currency.pp} PP`);
        return parts.length > 0 ? parts : ['0 GP'];
    };

    return (
        <>
            {/* Attacks Section */}
            <div className="phb-section attacks-section">
                <div className="attacks-title">Attacks & Spellcasting</div>
                <div className="attacks-header">
                    <div>Name</div>
                    <div>Atk</div>
                    <div>Damage/Type</div>
                </div>
                {attacks.length > 0 ? (
                    attacks.map((attack, idx) => (
                        <div key={idx} className="attack-row">
                            <div className="attack-field">{attack.name}</div>
                            <div className="attack-field">{attack.attackBonus}</div>
                            <div className="attack-field">{attack.damage}</div>
                        </div>
                    ))
                ) : (
                    <div className="attack-row">
                        <div className="attack-field">—</div>
                        <div className="attack-field">—</div>
                        <div className="attack-field">—</div>
                    </div>
                )}
            </div>

            {/* Equipment Section - 2 Column Layout */}
            <div className="phb-section equipment-section">
                <div className="equipment-grid">
                    {equipment.length > 0
                        ? equipment.map((item, idx) => (
                            <div key={idx} className="equipment-item">{item}</div>
                        ))
                        : <div className="equipment-item" style={{ color: 'var(--text-muted)' }}>No equipment</div>
                    }
                </div>
                {/* Currency Row at bottom */}
                <div className="currency-row">
                    {formatCurrency().map((coin, idx) => (
                        <div key={idx} className="currency-item">
                            <span className="currency-value">{coin}</span>
                        </div>
                    ))}
                </div>
                <div className="equipment-title">Equipment</div>
            </div>
        </>
    );
};

export default Column2Content;

