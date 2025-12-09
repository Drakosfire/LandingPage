/**
 * Column2Content Component
 * 
 * Aggregates all Column 2 content: Attacks, Equipment.
 * (Combat Status moved to AbilityScoresRow, Hit Dice & Death Saves in FooterBar)
 * 
 * Edit Mode Support:
 * - Currency fields: Quick edit (inline number inputs)
 * - Attacks: Complex edit (opens Equipment step)
 * - Equipment list: Complex edit (opens Equipment step)
 * 
 * @module PlayerCharacterGenerator/sheetComponents/column2
 */

import React from 'react';
import { usePlayerCharacterGenerator } from '../../PlayerCharacterGeneratorProvider';
import { EditableText } from '../EditableText';

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

export interface Column2ContentProps {
    /** Attacks list */
    attacks?: Attack[];
    /** Currency */
    currency?: Currency;
    /** Equipment list */
    equipment?: string[];
    /** Callback when currency changes */
    onCurrencyChange?: (currency: Currency) => void;
}

export const Column2Content: React.FC<Column2ContentProps> = ({
    attacks = [],
    currency = {},
    equipment = [],
    onCurrencyChange
}) => {
    const { isEditMode, openDrawerToStep } = usePlayerCharacterGenerator();

    // Currency coin definitions for display
    const coinTypes: Array<{ key: keyof Currency; label: string }> = [
        { key: 'cp', label: 'CP' },
        { key: 'sp', label: 'SP' },
        { key: 'ep', label: 'EP' },
        { key: 'gp', label: 'GP' },
        { key: 'pp', label: 'PP' }
    ];

    // Handler for currency changes
    const handleCurrencyChange = (key: keyof Currency, value: number) => {
        if (onCurrencyChange) {
            console.log(`✏️ [Column2Content] Currency ${key} changed:`, value);
            onCurrencyChange({
                cp: currency.cp ?? 0,
                sp: currency.sp ?? 0,
                ep: currency.ep ?? 0,
                gp: currency.gp ?? 0,
                pp: currency.pp ?? 0,
                [key]: value
            });
        }
    };

    // Click handler for attacks (opens Equipment step)
    const handleAttacksClick = () => {
        if (isEditMode) {
            console.log('🔗 [Column2Content] Opening Equipment step (Attacks)');
            openDrawerToStep(WIZARD_STEPS.EQUIPMENT);
        }
    };

    // Click handler for equipment list (opens Equipment step)
    const handleEquipmentClick = () => {
        if (isEditMode) {
            console.log('🔗 [Column2Content] Opening Equipment step');
            openDrawerToStep(WIZARD_STEPS.EQUIPMENT);
        }
    };

    return (
        <>
            {/* Attacks Section */}
            <div 
                className="phb-section attacks-section"
                data-editable={isEditMode ? "complex" : undefined}
                onClick={handleAttacksClick}
                role={isEditMode ? 'button' : undefined}
                tabIndex={isEditMode ? 0 : undefined}
            >
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
                <div 
                    className="equipment-grid"
                    data-editable={isEditMode ? "complex" : undefined}
                    onClick={handleEquipmentClick}
                    role={isEditMode ? 'button' : undefined}
                    tabIndex={isEditMode ? 0 : undefined}
                >
                    {equipment.length > 0
                        ? equipment.map((item, idx) => (
                            <div key={idx} className="equipment-item">{item}</div>
                        ))
                        : <div className="equipment-item" style={{ color: 'var(--text-muted)' }}>No equipment</div>
                    }
                </div>
                {/* Currency Row at bottom - Quick edit */}
                <div className="currency-row" data-editable={onCurrencyChange ? "quick" : undefined}>
                    {coinTypes.map(({ key, label }) => (
                        <div key={key} className="currency-item">
                            {onCurrencyChange ? (
                                <>
                                    <span className="currency-label">{label}</span>
                                    <EditableText
                                        value={currency[key] ?? 0}
                                        onChange={(v) => handleCurrencyChange(key, Number(v))}
                                        type="number"
                                        min={0}
                                        placeholder="0"
                                        className="currency-input"
                                    />
                                </>
                            ) : (
                                <span className="currency-value">
                                    {(currency[key] ?? 0) > 0 ? `${currency[key]} ${label}` : ''}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
                <div className="equipment-title">Equipment</div>
            </div>
        </>
    );
};

export default Column2Content;

