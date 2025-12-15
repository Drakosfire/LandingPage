/**
 * EquipmentBlock Component
 * 
 * Displays weapons, armor, and general equipment.
 * Organized into sections for easy reference.
 * 
 * @module PlayerCharacterGenerator/canvasComponents/EquipmentBlock
 */

import React from 'react';
import type { DnD5eWeapon, DnD5eArmor, DnD5eEquipmentItem } from '../types/dnd5e/equipment.types';
import type { AbilityScores } from '../engine/RuleEngine.types';

export interface EquipmentBlockProps {
    /** Weapons array */
    weapons: DnD5eWeapon[];
    /** Equipped armor */
    armor?: DnD5eArmor;
    /** Has shield equipped */
    shield?: boolean;
    /** General equipment items */
    equipment: DnD5eEquipmentItem[];
    /** Ability scores (for attack/damage bonuses) */
    abilityScores?: AbilityScores;
    /** Proficiency bonus (for attack rolls) */
    proficiencyBonus?: number;
    /** Currency */
    currency?: { cp: number; sp: number; ep: number; gp: number; pp: number };
    /** Whether edit mode is enabled (Phase 2+) */
    isEditMode?: boolean;
}

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
 * Weapon row component
 */
interface WeaponRowProps {
    weapon: DnD5eWeapon;
    attackBonus: number;
    damageBonus: number;
}

const WeaponRow: React.FC<WeaponRowProps> = ({ weapon, attackBonus, damageBonus }) => {
    const damageString = damageBonus !== 0
        ? `${weapon.damage}${formatModifier(damageBonus)}`
        : weapon.damage;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.25rem 0',
                fontSize: '0.85rem',
                borderBottom: '1px solid rgba(88, 24, 13, 0.1)'
            }}
            data-testid={`weapon-${weapon.id}`}
        >
            {/* Weapon name */}
            <span style={{ fontWeight: 600, color: '#2b1d0f', flex: 1 }}>
                {weapon.name}
                {weapon.quantity > 1 && ` (×${weapon.quantity})`}
            </span>

            {/* Attack bonus */}
            <span
                style={{
                    fontSize: '0.8rem',
                    color: '#58180d',
                    fontWeight: 600,
                    width: '35px',
                    textAlign: 'center'
                }}
            >
                {formatModifier(attackBonus)}
            </span>

            {/* Damage */}
            <span
                style={{
                    fontSize: '0.8rem',
                    color: '#2b1d0f',
                    width: '70px',
                    textAlign: 'center'
                }}
            >
                {damageString} {weapon.damageType?.slice(0, 1).toUpperCase() || ''}
            </span>

            {/* Properties (compact) */}
            {weapon.properties && weapon.properties.length > 0 && (
                <span
                    style={{
                        fontSize: '0.7rem',
                        color: 'rgba(43, 29, 15, 0.6)',
                        fontStyle: 'italic'
                    }}
                >
                    {weapon.properties.slice(0, 2).join(', ')}
                </span>
            )}
        </div>
    );
};

/**
 * Equipment item row component
 */
const EquipmentItemRow: React.FC<{ item: DnD5eEquipmentItem }> = ({ item }) => (
    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.15rem 0',
            fontSize: '0.8rem'
        }}
        data-testid={`equipment-${item.id}`}
    >
        <span style={{ color: '#2b1d0f' }}>
            {item.name}
            {item.quantity > 1 && ` (×${item.quantity})`}
        </span>
    </div>
);

/**
 * Currency display component
 */
const CurrencyDisplay: React.FC<{ currency: { cp: number; sp: number; ep: number; gp: number; pp: number } }> = ({ currency }) => {
    const parts: string[] = [];
    if (currency.pp > 0) parts.push(`${currency.pp} pp`);
    if (currency.gp > 0) parts.push(`${currency.gp} gp`);
    if (currency.ep > 0) parts.push(`${currency.ep} ep`);
    if (currency.sp > 0) parts.push(`${currency.sp} sp`);
    if (currency.cp > 0) parts.push(`${currency.cp} cp`);

    if (parts.length === 0) return null;

    return (
        <div
            style={{
                marginTop: '0.5rem',
                padding: '0.3rem 0.5rem',
                background: 'rgba(247, 235, 215, 0.6)',
                borderRadius: '4px',
                fontSize: '0.8rem',
                color: '#58180d',
                fontWeight: 600
            }}
            data-testid="currency"
        >
            💰 {parts.join(', ')}
        </div>
    );
};

/**
 * EquipmentBlock - Weapons, armor, and gear display
 * 
 * Layout:
 * ┌─────────────────────────────────┐
 * │ Equipment                       │
 * │                                 │
 * │ WEAPONS           ATK    DMG    │
 * │ Longsword         +5   1d8+3 S  │
 * │ Handaxe (×2)      +5   1d6+3 S  │
 * │                                 │
 * │ ARMOR                           │
 * │ Chain Mail (AC 16)              │
 * │ Shield (+2 AC)                  │
 * │                                 │
 * │ GEAR                            │
 * │ Explorer's Pack                 │
 * │ ...                             │
 * │                                 │
 * │ 💰 10 gp                        │
 * └─────────────────────────────────┘
 */
const EquipmentBlock: React.FC<EquipmentBlockProps> = ({
    weapons,
    armor,
    shield,
    equipment,
    abilityScores,
    proficiencyBonus = 2,
    currency,
    isEditMode = false
}) => {
    // Calculate attack/damage bonuses (simplified - assumes proficiency)
    const strMod = abilityScores ? calculateModifier(abilityScores.strength) : 0;
    const dexMod = abilityScores ? calculateModifier(abilityScores.dexterity) : 0;

    const getWeaponBonuses = (weapon: DnD5eWeapon): { attack: number; damage: number } => {
        const isFinesse = weapon.properties?.includes('finesse');
        const isRanged = weapon.weaponType === 'ranged';

        // Use DEX for finesse and ranged, STR otherwise
        const abilityMod = (isFinesse || isRanged) ? Math.max(strMod, dexMod) : strMod;

        return {
            attack: abilityMod + proficiencyBonus,
            damage: abilityMod
        };
    };

    return (
        <div
            className="dm-equipment-block equipment-block"
            data-testid="equipment-block"
            data-tutorial="equipment"
        >
            {/* Section Header */}
            <h3
                style={{
                    fontFamily: 'BookInsanityRemake, serif',
                    color: '#a11d18',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 0.6rem',
                    fontSize: '0.95rem',
                    borderBottom: '1px solid rgba(161, 29, 24, 0.3)',
                    paddingBottom: '0.3rem'
                }}
            >
                Equipment
            </h3>

            {/* Weapons Section */}
            {weapons.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                    <h4
                        style={{
                            fontFamily: 'BookInsanityRemake, serif',
                            color: '#58180d',
                            fontSize: '0.85rem',
                            margin: '0 0 0.3rem',
                            textTransform: 'uppercase'
                        }}
                    >
                        Weapons
                    </h4>
                    {/* Header row */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '0.5rem',
                            fontSize: '0.7rem',
                            color: 'rgba(43, 29, 15, 0.6)',
                            textTransform: 'uppercase',
                            borderBottom: '1px solid rgba(88, 24, 13, 0.2)',
                            paddingBottom: '0.2rem',
                            marginBottom: '0.2rem'
                        }}
                    >
                        <span style={{ flex: 1 }}>Name</span>
                        <span style={{ width: '35px', textAlign: 'center' }}>Atk</span>
                        <span style={{ width: '70px', textAlign: 'center' }}>Damage</span>
                        <span>Properties</span>
                    </div>
                    {weapons.map(weapon => {
                        const bonuses = getWeaponBonuses(weapon);
                        return (
                            <WeaponRow
                                key={weapon.id}
                                weapon={weapon}
                                attackBonus={bonuses.attack}
                                damageBonus={bonuses.damage}
                            />
                        );
                    })}
                </div>
            )}

            {/* Armor Section */}
            {(armor || shield) && (
                <div style={{ marginBottom: '0.75rem' }}>
                    <h4
                        style={{
                            fontFamily: 'BookInsanityRemake, serif',
                            color: '#58180d',
                            fontSize: '0.85rem',
                            margin: '0 0 0.3rem',
                            textTransform: 'uppercase'
                        }}
                    >
                        Armor
                    </h4>
                    {armor && (
                        <div
                            style={{
                                fontSize: '0.85rem',
                                color: '#2b1d0f',
                                padding: '0.15rem 0'
                            }}
                            data-testid="equipped-armor"
                        >
                            {armor.name} (AC {armor.armorClass})
                            {armor.stealthDisadvantage && (
                                <span style={{ color: '#a11d18', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                                    Stealth disadvantage
                                </span>
                            )}
                        </div>
                    )}
                    {shield && (
                        <div
                            style={{
                                fontSize: '0.85rem',
                                color: '#2b1d0f',
                                padding: '0.15rem 0'
                            }}
                            data-testid="equipped-shield"
                        >
                            Shield (+2 AC)
                        </div>
                    )}
                </div>
            )}

            {/* General Equipment */}
            {equipment.length > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                    <h4
                        style={{
                            fontFamily: 'BookInsanityRemake, serif',
                            color: '#58180d',
                            fontSize: '0.85rem',
                            margin: '0 0 0.3rem',
                            textTransform: 'uppercase'
                        }}
                    >
                        Gear
                    </h4>
                    {equipment.map(item => (
                        <EquipmentItemRow key={item.id} item={item} />
                    ))}
                </div>
            )}

            {/* Currency */}
            {currency && <CurrencyDisplay currency={currency} />}
        </div>
    );
};

export default EquipmentBlock;

// Export helpers for testing
export { calculateModifier, formatModifier };

