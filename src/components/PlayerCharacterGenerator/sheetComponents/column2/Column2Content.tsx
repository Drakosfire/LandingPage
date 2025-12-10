/**
 * Column2Content Component
 * 
 * Aggregates all Column 2 content: Attacks, Equipment.
 * (Combat Status moved to AbilityScoresRow, Hit Dice & Death Saves in FooterBar)
 * 
 * **Unified Equipment Model:**
 * - All equipped items come from single InventoryItem[] source
 * - Attacks derived from equipped weapons
 * - Equipment section shows all equipped items
 * - No "+" button - users add items via Inventory Sheet
 * 
 * Edit Mode Support:
 * - Currency fields: Quick edit (inline number inputs)
 * - Attacks/Equipment: Click item to open ItemEditModal
 * 
 * @module PlayerCharacterGenerator/sheetComponents/column2
 */

import React, { useMemo } from 'react';
import { usePlayerCharacterGenerator } from '../../PlayerCharacterGeneratorProvider';
import { EditableText } from '../EditableText';
import type { InventoryItem } from '../inventory/InventoryBlock';

export interface Currency {
    cp?: number;
    sp?: number;
    ep?: number;
    gp?: number;
    pp?: number;
}

/** Attack display for Page 1 (derived from equipped weapons) */
export interface Attack {
    id?: string;
    name: string;
    attackBonus: string;
    damage: string;
}

/** Character stats needed for attack bonus calculation */
export interface CharacterCombatStats {
    /** Ability modifiers: { str: 2, dex: 3, ... } */
    abilityModifiers: {
        str: number;
        dex: number;
        con: number;
        int: number;
        wis: number;
        cha: number;
    };
    /** Proficiency bonus */
    proficiencyBonus: number;
}

export interface Column2ContentProps {
    /** All equipped items (source of truth) - filtered from full inventory */
    equippedItems?: InventoryItem[];
    /** Currency */
    currency?: Currency;
    /** Character combat stats for calculating attack bonuses */
    characterStats?: CharacterCombatStats;
    /** Callback when currency changes */
    onCurrencyChange?: (currency: Currency) => void;
    /** Callback when item is clicked for editing */
    onItemEdit?: (item: InventoryItem) => void;
    /** Callback to toggle equipped status (unequip from Page 1) */
    onItemUnequip?: (item: InventoryItem) => void;
}

/**
 * Compute attacks from equipped weapons
 */
const computeAttacksFromEquipment = (
    equippedItems: InventoryItem[],
    stats?: CharacterCombatStats
): Attack[] => {
    const weapons = equippedItems.filter(item => item.type === 'weapon');
    
    return weapons.map(weapon => {
        const profBonus = stats?.proficiencyBonus ?? 2;
        const strMod = stats?.abilityModifiers?.str ?? 0;
        const dexMod = stats?.abilityModifiers?.dex ?? 0;
        
        // Use DEX for finesse/ranged weapons, STR otherwise
        const isFinesse = weapon.properties?.includes('finesse');
        const isRanged = weapon.weaponType === 'ranged';
        const abilityMod = (isFinesse || isRanged) ? Math.max(strMod, dexMod) : strMod;
        
        const attackBonus = abilityMod + profBonus;
        const damageMod = abilityMod >= 0 ? `+${abilityMod}` : `${abilityMod}`;
        
        return {
            id: weapon.id,
            name: weapon.name,
            attackBonus: `+${attackBonus}`,
            damage: `${weapon.damage || '1d6'}${damageMod} ${weapon.damageType?.slice(0, 5) || ''}`
        };
    });
};

export const Column2Content: React.FC<Column2ContentProps> = ({
    equippedItems = [],
    currency = {},
    characterStats,
    onCurrencyChange,
    onItemEdit,
    onItemUnequip
}) => {
    const { isEditMode } = usePlayerCharacterGenerator();

    // Derive attacks from equipped weapons
    const attacks = useMemo(() => 
        computeAttacksFromEquipment(equippedItems, characterStats),
        [equippedItems, characterStats]
    );

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

    // Click handler for individual attack item (opens ItemEditModal)
    const handleAttackClick = (attack: Attack, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isEditMode && onItemEdit) {
            // Find the corresponding weapon item
            const weaponItem = equippedItems.find(item => item.id === attack.id);
            if (weaponItem) {
                console.log('✏️ [Column2Content] Editing weapon:', weaponItem.name);
                onItemEdit(weaponItem);
            }
        }
    };

    // Click handler for individual equipment item (opens ItemEditModal)
    const handleEquipmentItemClick = (item: InventoryItem, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isEditMode && onItemEdit) {
            console.log('✏️ [Column2Content] Editing item:', item.name);
            onItemEdit(item);
        }
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
                    attacks.map((attack) => (
                        <div 
                            key={attack.id || attack.name} 
                            className={`attack-row${isEditMode && onItemEdit ? ' clickable' : ''}`}
                            data-editable={isEditMode && onItemEdit ? "complex" : undefined}
                            onClick={(e) => handleAttackClick(attack, e)}
                            role={isEditMode && onItemEdit ? 'button' : undefined}
                            tabIndex={isEditMode && onItemEdit ? 0 : undefined}
                        >
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
                {/* Items grid at top */}
                <div className="equipment-grid">
                    {equippedItems.length > 0
                        ? equippedItems.map((item) => (
                            <div 
                                key={item.id} 
                                className={`equipment-item${isEditMode && onItemEdit ? ' clickable' : ''}`}
                                data-editable={isEditMode && onItemEdit ? "complex" : undefined}
                                onClick={(e) => handleEquipmentItemClick(item, e)}
                                role={isEditMode && onItemEdit ? 'button' : undefined}
                                tabIndex={isEditMode && onItemEdit ? 0 : undefined}
                            >
                                {item.name}{item.attuned ? ' ✦' : ''}
                            </div>
                        ))
                        : <div className="equipment-item" style={{ color: 'var(--text-muted)' }}>No equipment equipped</div>
                    }
                </div>
                
                {/* Bottom section: hint, currency, title - stays at bottom */}
                <div className="equipment-footer">
                    {/* Hint text in edit mode */}
                    {isEditMode && (
                        <div className="equipment-hint">
                            Add items in Inventory Sheet, then equip them
                        </div>
                    )}
                    {/* Currency Row */}
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
            </div>
        </>
    );
};

export default Column2Content;

