/**
 * ItemRow Component
 * 
 * Single row for inventory item display.
 * Follows the prototype grid: qty | name | wt | value/notes
 * 
 * @module PlayerCharacterGenerator/sheetComponents/inventory
 */

import React from 'react';

export interface ItemRowProps {
    /** Item quantity */
    quantity?: number;
    /** Item name */
    name?: string;
    /** Item weight (e.g., "3 lb", "—") */
    weight?: string;
    /** Fourth column value (varies by section: value, AC, rarity, uses, notes) */
    value?: string;
    /** Whether this is an empty placeholder row */
    isEmpty?: boolean;
    /** Whether this is a header row */
    isHeader?: boolean;
    /** Custom column headers (for header rows) */
    headers?: [string, string, string, string];
}

/**
 * ItemRow - Single inventory item row
 * 
 * Grid layout: 30px qty | 1fr name | 40px wt | 35px value
 */
export const ItemRow: React.FC<ItemRowProps> = ({
    quantity,
    name = '',
    weight = '',
    value = '',
    isEmpty = false,
    isHeader = false,
    headers = ['Qty', 'Item', 'Wt.', 'Value']
}) => {
    const rowClasses = [
        'item-row',
        isHeader && 'header',
        isEmpty && 'empty'
    ].filter(Boolean).join(' ');

    if (isHeader) {
        return (
            <div className={rowClasses}>
                <span>{headers[0]}</span>
                <span>{headers[1]}</span>
                <span>{headers[2]}</span>
                <span>{headers[3]}</span>
            </div>
        );
    }

    return (
        <div className={rowClasses}>
            <span className="item-qty">{isEmpty ? '' : quantity}</span>
            <span className="item-name">{name}</span>
            <span className="item-weight">{weight}</span>
            <span className="item-value">{value}</span>
        </div>
    );
};

export default ItemRow;

