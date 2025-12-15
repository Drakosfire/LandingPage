/**
 * EquipmentSection Component
 * 
 * Inventory organized by category (weapons, armor, gear).
 * 
 * @module PlayerCharacterGenerator/canvasComponents/sections/EquipmentSection
 */

import React from 'react';
import type { DnD5eEquipmentItem, DnD5eWeapon, DnD5eArmor } from '../../types/dnd5e/equipment.types';

export interface EquipmentSectionProps {
    /** All equipment items */
    equipment: DnD5eEquipmentItem[];
    /** Weapons (subset of equipment) */
    weapons?: DnD5eWeapon[];
    /** Armor (subset of equipment) */
    armor?: DnD5eArmor[];
    /** Gold pieces */
    gold?: number;
}

/**
 * Check if item is a weapon
 */
function isWeapon(item: DnD5eEquipmentItem): item is DnD5eWeapon {
    return item.type === 'weapon' || 'damage' in item;
}

/**
 * Check if item is armor
 */
function isArmor(item: DnD5eEquipmentItem): item is DnD5eArmor {
    return item.type === 'armor' || item.type === 'shield' || 'armorClass' in item;
}

/**
 * EquipmentSection - Categorized inventory
 */
export const EquipmentSection: React.FC<EquipmentSectionProps> = ({
    equipment,
    weapons: providedWeapons,
    armor: providedArmor,
    gold = 0
}) => {
    // Separate equipment by category
    const weapons = providedWeapons || equipment.filter(isWeapon);
    const armorItems = providedArmor || equipment.filter(isArmor);
    const otherGear = equipment.filter(
        item => !isWeapon(item) && !isArmor(item)
    );

    return (
        <div className="block character frame" id="equipment">
            <h4>Equipment</h4>

            {/* Weapons */}
            {weapons.length > 0 && (
                <div className="equipment-category">
                    <div className="equipment-category-label">Weapons</div>
                    <ul className="equipment-list">
                        {weapons.map((weapon, idx) => (
                            <li key={weapon.id || idx} className="equipment-item">
                                <span className="item-name">{weapon.name}</span>
                                {weapon.quantity && weapon.quantity > 1 && (
                                    <span className="item-quantity"> (×{weapon.quantity})</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Armor & Shields */}
            {armorItems.length > 0 && (
                <div className="equipment-category">
                    <div className="equipment-category-label">Armor</div>
                    <ul className="equipment-list">
                        {armorItems.map((item, idx) => (
                            <li key={item.id || idx} className="equipment-item">
                                <span className="item-name">{item.name}</span>
                                {'armorClass' in item && (
                                    <span className="item-ac"> (AC {item.armorClass})</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Other Gear */}
            {otherGear.length > 0 && (
                <div className="equipment-category">
                    <div className="equipment-category-label">Adventuring Gear</div>
                    <ul className="equipment-list">
                        {otherGear.map((item, idx) => (
                            <li key={item.id || idx} className="equipment-item">
                                <span className="item-name">{item.name}</span>
                                {item.quantity && item.quantity > 1 && (
                                    <span className="item-quantity"> (×{item.quantity})</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Currency */}
            {gold > 0 && (
                <div className="equipment-category">
                    <div className="equipment-category-label">Currency</div>
                    <p><strong>{gold} gp</strong></p>
                </div>
            )}

            {equipment.length === 0 && gold === 0 && (
                <p style={{ fontStyle: 'italic', color: '#666' }}>No equipment</p>
            )}
        </div>
    );
};

export default EquipmentSection;

