/**
 * ItemDetailModal Component
 * 
 * Rich detail modal for equipment items showing full metadata,
 * damage/properties for weapons, AC for armor, and optional image.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/modals
 */

import React from 'react';
import { Modal } from '@mantine/core';
import {
    IconSword,
    IconRuler2,
    IconTag,
    IconWeight,
    IconCoin,
    IconSparkles,
    IconShield
} from '@tabler/icons-react';
import type { EquipmentType, MagicItemRarity, WeaponProperty } from '../../types/dnd5e/equipment.types';
import type { DamageType } from '../../types/system.types';

export interface ItemDetailModalProps {
    isOpen: boolean;
    onClose: () => void;

    // Core item data
    name: string;
    type: EquipmentType;
    description?: string;
    imageUrl?: string;

    // Equipment stats
    weight?: number;
    value?: number;
    quantity?: number;

    // Magic item properties
    isMagical?: boolean;
    rarity?: MagicItemRarity;
    requiresAttunement?: boolean;

    // Weapon-specific
    damage?: string;
    damageType?: DamageType;
    properties?: WeaponProperty[];
    range?: { normal: number; long?: number };
    weaponCategory?: 'simple' | 'martial';
    weaponType?: 'melee' | 'ranged';

    // Armor-specific
    armorClass?: number;
    armorCategory?: 'light' | 'medium' | 'heavy';
    stealthDisadvantage?: boolean;

    // Shield-specific
    acBonus?: number;
}

/**
 * Get rarity CSS class
 */
const getRarityClass = (rarity?: MagicItemRarity): string => {
    if (!rarity) return '';
    return `rarity-${rarity.replace(' ', '-')}`;
};

/**
 * Format equipment type for display
 */
const formatType = (type: EquipmentType, weaponCategory?: string, weaponType?: string, armorCategory?: string): string => {
    if (type === 'weapon' && weaponCategory && weaponType) {
        return `${weaponCategory} Weapon (${weaponType})`;
    }
    if (type === 'armor' && armorCategory) {
        return `${armorCategory} Armor`;
    }
    // Capitalize first letter
    return type.charAt(0).toUpperCase() + type.slice(1);
};

/**
 * Format properties for display
 */
const formatProperties = (properties?: WeaponProperty[]): string => {
    if (!properties || properties.length === 0) return '—';
    return properties.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');
};

/**
 * Format range for display
 */
const formatRange = (range?: { normal: number; long?: number }, weaponType?: string): string => {
    if (!range) {
        return weaponType === 'melee' ? 'Melee (5 ft)' : '—';
    }
    if (range.long) {
        return `${range.normal}/${range.long} ft`;
    }
    return `${range.normal} ft`;
};

/**
 * Format value as gold pieces
 */
const formatValue = (value?: number): string => {
    if (value === undefined || value === 0) return '—';
    if (value >= 1) return `${value} gp`;
    // Handle silver/copper
    const sp = value * 10;
    if (sp >= 1) return `${Math.floor(sp)} sp`;
    return `${Math.floor(value * 100)} cp`;
};

/**
 * ItemDetailModal - Rich item detail modal
 */
export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
    isOpen,
    onClose,
    name,
    type,
    description,
    imageUrl,
    weight,
    value,
    isMagical,
    rarity,
    requiresAttunement,
    damage,
    damageType,
    properties,
    range,
    weaponCategory,
    weaponType,
    armorClass,
    armorCategory,
    stealthDisadvantage,
    acBonus
}) => {
    const isWeapon = type === 'weapon';
    const isArmor = type === 'armor';
    const isShield = type === 'shield';

    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            title={null}
            size="md"
            centered
            className="detail-modal item-detail-modal"
            classNames={{
                body: 'detail-modal-body'
            }}
        >
            {/* Header with image and title */}
            <div className="detail-modal-header">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="detail-modal-image"
                    />
                ) : (
                    <div className="detail-modal-image-placeholder">
                        {isWeapon ? <IconSword size={40} /> : 
                         isArmor ? <IconShield size={40} /> :
                         <IconTag size={40} />}
                    </div>
                )}
                <div className="detail-modal-title-block">
                    <h2 className="detail-modal-title">{name}</h2>
                    <p className="detail-modal-subtitle">
                        {formatType(type, weaponCategory, weaponType, armorCategory)}
                    </p>
                    {isMagical && (
                        <div className="detail-modal-badges">
                            {rarity && (
                                <span className={`rarity-badge ${getRarityClass(rarity)}`}>
                                    {rarity}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Weapon stats */}
            {isWeapon && (
                <div className="detail-modal-stats">
                    <span className="detail-modal-stat-label">
                        <IconSword size={14} /> Damage
                    </span>
                    <span className="detail-modal-stat-value">
                        {damage || '—'} {damageType || ''}
                    </span>

                    <span className="detail-modal-stat-label">
                        <IconRuler2 size={14} /> Range
                    </span>
                    <span className="detail-modal-stat-value">
                        {formatRange(range, weaponType)}
                    </span>

                    <span className="detail-modal-stat-label">
                        <IconTag size={14} /> Properties
                    </span>
                    <span className="detail-modal-stat-value">
                        {formatProperties(properties)}
                    </span>
                </div>
            )}

            {/* Armor stats */}
            {isArmor && (
                <div className="detail-modal-stats">
                    <span className="detail-modal-stat-label">
                        <IconShield size={14} /> Armor Class
                    </span>
                    <span className="detail-modal-stat-value">
                        {armorClass || '—'}
                    </span>

                    <span className="detail-modal-stat-label">
                        <IconTag size={14} /> Category
                    </span>
                    <span className="detail-modal-stat-value">
                        {armorCategory ? armorCategory.charAt(0).toUpperCase() + armorCategory.slice(1) : '—'}
                    </span>

                    {stealthDisadvantage && (
                        <>
                            <span className="detail-modal-stat-label">
                                ⚠️ Stealth
                            </span>
                            <span className="detail-modal-stat-value">
                                Disadvantage
                            </span>
                        </>
                    )}
                </div>
            )}

            {/* Shield stats */}
            {isShield && (
                <div className="detail-modal-stats">
                    <span className="detail-modal-stat-label">
                        <IconShield size={14} /> AC Bonus
                    </span>
                    <span className="detail-modal-stat-value">
                        +{acBonus || 2}
                    </span>
                </div>
            )}

            {/* Description */}
            {description && (
                <div className="detail-modal-description">
                    {description}
                </div>
            )}

            {/* Damage dice box for weapons */}
            {isWeapon && damage && (
                <div className="detail-modal-dice-box">
                    <div className="detail-modal-dice-label">Damage</div>
                    <div className="detail-modal-dice-value">
                        {damage} {damageType}
                    </div>
                </div>
            )}

            {/* Footer with weight, value, attunement */}
            <div className="detail-modal-footer">
                <span>
                    <IconWeight size={14} /> {weight ? `${weight} lb` : '—'}
                </span>
                <span>
                    <IconCoin size={14} /> {formatValue(value)}
                </span>
                {requiresAttunement && (
                    <span>
                        <IconSparkles size={14} /> Requires Attunement
                    </span>
                )}
            </div>
        </Modal>
    );
};

export default ItemDetailModal;

