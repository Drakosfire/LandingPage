/**
 * TreasureBlock Component
 * 
 * Special inventory block for treasure/valuables with 2-column layout.
 * Only shows Item | Value (no qty or weight columns).
 * 
 * @module PlayerCharacterGenerator/sheetComponents/inventory
 */

import React from 'react';
import { InventoryItem } from './InventoryBlock';

export interface TreasureBlockProps {
    /** Block title */
    title: string;
    /** Total weight */
    totalWeight?: string;
    /** Treasure items */
    items: InventoryItem[];
    /** Number of empty rows */
    emptyRows?: number;
}

/**
 * TreasureBlock - 2-column treasure list (Item | Value)
 */
export const TreasureBlock: React.FC<TreasureBlockProps> = ({
    title,
    totalWeight,
    items,
    emptyRows = 2
}) => {
    return (
        <div className="phb-section inventory-block treasure-block">
            <div className="block-header">
                <span className="block-title">{title}</span>
                {totalWeight && <span className="block-weight">{totalWeight}</span>}
            </div>
            <div className="item-list">
                <div className="item-row header">
                    <span>Item</span>
                    <span>Value</span>
                </div>
                {items.map((item) => (
                    <div key={item.id} className="item-row">
                        <span className="item-name">{item.name}</span>
                        <span className="item-value">{item.value || '—'}</span>
                    </div>
                ))}
                {Array.from({ length: emptyRows }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="item-row empty">
                        <span className="item-name"></span>
                        <span className="item-value"></span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TreasureBlock;

