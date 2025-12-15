/**
 * InventoryBlock Component
 * 
 * Reusable inventory category block with header and item list.
 * Used for Weapons, Armor, Magic Items, etc.
 * 
 * Edit Mode Support:
 * - Items become clickable to open edit modal
 * - "Add Item" row appears at bottom of list
 * 
 * @module PlayerCharacterGenerator/sheetComponents/inventory
 */

import React from 'react';
import { usePlayerCharacterGenerator } from '../../PlayerCharacterGeneratorProvider';
import { ItemRow } from './ItemRow';
import { AddItemRow } from './AddItemRow';
import type { EquipmentType, MagicItemRarity, WeaponProperty } from '../../types/dnd5e/equipment.types';
import type { DamageType } from '../../types/system.types';

export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    weight?: number;
    value?: string;
    notes?: string;
    attuned?: boolean;
    containerId?: string;

    /** Is this item currently equipped? Shows on Page 1 Equipment section */
    equipped?: boolean;

    // Extended fields for detail modal (optional)
    type?: EquipmentType;
    description?: string;
    imageUrl?: string;
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

    // Numeric value for modal
    valueNumber?: number;
}

export interface InventoryBlockProps {
    /** Block title (e.g., "Weapons", "Armor & Shields") */
    title: string;
    /** Total weight of items in this category */
    totalWeight?: string;
    /** Items in this block */
    items: InventoryItem[];
    /** Column headers (default: Qty, Item, Wt., Value) */
    headers?: [string, string, string, string];
    /** Number of empty rows to add */
    emptyRows?: number;
    /** Whether this block should flex-grow to fill space */
    flexGrow?: boolean;
    /** Format function for the fourth column value */
    formatValue?: (item: InventoryItem) => string;
    /** Format function for weight display */
    formatWeight?: (item: InventoryItem) => string;
    /** Additional CSS class for block-specific styling (e.g., 'consumables-block') */
    className?: string;
    /** Callback when info button is clicked on an item (view mode) */
    onItemInfoClick?: (item: InventoryItem) => void;
    /** Callback when add item button is clicked (edit mode) */
    onAddItem?: () => void;
    /** Callback when existing item is clicked for editing (edit mode) */
    onItemEdit?: (item: InventoryItem) => void;
}

/**
 * Default weight formatter
 */
const defaultFormatWeight = (item: InventoryItem): string => {
    if (item.weight === undefined || item.weight === 0) return '—';
    return `${item.weight} lb`;
};

/**
 * Default value formatter
 */
const defaultFormatValue = (item: InventoryItem): string => {
    return item.value || item.notes || '—';
};

/**
 * InventoryBlock - Category block with header and items
 * 
 * In edit mode:
 * - Clicking an existing item opens edit modal (if onItemEdit provided)
 * - "Add Item" row appears at bottom (if onAddItem provided)
 */
export const InventoryBlock: React.FC<InventoryBlockProps> = ({
    title,
    totalWeight,
    items,
    headers = ['Qty', 'Item', 'Wt.', 'Value'],
    emptyRows = 1,
    flexGrow = false,
    formatValue = defaultFormatValue,
    formatWeight = defaultFormatWeight,
    className,
    onItemInfoClick,
    onAddItem,
    onItemEdit
}) => {
    const { isEditMode } = usePlayerCharacterGenerator();

    const blockClasses = [
        'phb-section',
        'inventory-block',
        flexGrow && 'flex-grow',
        className
    ].filter(Boolean).join(' ');

    // Determine click handler for items based on mode
    const handleItemClick = (item: InventoryItem) => {
        if (isEditMode && onItemEdit) {
            console.log('✏️ [InventoryBlock] Edit item:', item.name);
            onItemEdit(item);
        } else if (onItemInfoClick) {
            onItemInfoClick(item);
        }
    };

    return (
        <div className={blockClasses}>
            <div className="block-header">
                <span className="block-title">{title}</span>
                {totalWeight && <span className="block-weight">{totalWeight}</span>}
            </div>
            <div className="item-list">
                <ItemRow isHeader headers={headers} />
                {items.map((item) => {
                    // Build display name with indicators
                    let displayName = item.name;
                    if (item.equipped) displayName = `⚔️ ${displayName}`;
                    if (item.attuned) displayName = `${displayName} ✦`;
                    
                    return (
                        <ItemRow
                            key={item.id}
                            quantity={item.quantity}
                            name={displayName}
                            weight={formatWeight(item)}
                            value={formatValue(item)}
                            onInfoClick={(onItemInfoClick || (isEditMode && onItemEdit)) ? () => handleItemClick(item) : undefined}
                            isClickable={isEditMode && !!onItemEdit}
                        />
                    );
                })}
                {/* Show Add Item row in edit mode when callback provided */}
                {isEditMode && onAddItem && (
                    <AddItemRow onAddItem={onAddItem} />
                )}
                {/* Only show empty rows when NOT in edit mode (replaced by AddItemRow) */}
                {!isEditMode && Array.from({ length: emptyRows }).map((_, idx) => (
                    <ItemRow key={`empty-${idx}`} isEmpty />
                ))}
            </div>
        </div>
    );
};

export default InventoryBlock;

