/**
 * InventoryBlock Component
 * 
 * Reusable inventory category block with header and item list.
 * Used for Weapons, Armor, Magic Items, etc.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/inventory
 */

import React from 'react';
import { ItemRow } from './ItemRow';

export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    weight?: number;
    value?: string;
    notes?: string;
    attuned?: boolean;
    containerId?: string;
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
 */
export const InventoryBlock: React.FC<InventoryBlockProps> = ({
    title,
    totalWeight,
    items,
    headers = ['Qty', 'Item', 'Wt.', 'Value'],
    emptyRows = 1,
    flexGrow = false,
    formatValue = defaultFormatValue,
    formatWeight = defaultFormatWeight
}) => {
    const blockClasses = [
        'phb-section',
        'inventory-block',
        flexGrow && 'flex-grow'
    ].filter(Boolean).join(' ');

    return (
        <div className={blockClasses}>
            <div className="block-header">
                <span className="block-title">{title}</span>
                {totalWeight && <span className="block-weight">{totalWeight}</span>}
            </div>
            <div className="item-list">
                <ItemRow isHeader headers={headers} />
                {items.map((item) => (
                    <ItemRow
                        key={item.id}
                        quantity={item.quantity}
                        name={item.attuned ? `${item.name} ✦` : item.name}
                        weight={formatWeight(item)}
                        value={formatValue(item)}
                    />
                ))}
                {Array.from({ length: emptyRows }).map((_, idx) => (
                    <ItemRow key={`empty-${idx}`} isEmpty />
                ))}
            </div>
        </div>
    );
};

export default InventoryBlock;

