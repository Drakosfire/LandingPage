/**
 * ItemRow Component
 * 
 * Single row for inventory item display.
 * Follows the prototype grid: qty | name | wt | value/notes
 * 
 * @module PlayerCharacterGenerator/sheetComponents/inventory
 */

import React from 'react';
import { InfoButton } from '../common';

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
    /** Callback for info button click */
    onInfoClick?: () => void;
    /** Whether the entire row is clickable (edit mode) */
    isClickable?: boolean;
}

/**
 * ItemRow - Single inventory item row
 * 
 * Grid layout: 30px qty | 1fr name | 40px wt | 35px value
 * 
 * In edit mode with isClickable=true:
 * - Entire row becomes clickable (not just info button)
 * - Cursor changes to pointer
 * - Hover highlight shows edit affordance
 */
export const ItemRow: React.FC<ItemRowProps> = ({
    quantity,
    name = '',
    weight = '',
    value = '',
    isEmpty = false,
    isHeader = false,
    headers = ['Qty', 'Item', 'Wt.', 'Value'],
    onInfoClick,
    isClickable = false
}) => {
    const rowClasses = [
        'item-row',
        isHeader && 'header',
        isEmpty && 'empty',
        isClickable && 'clickable'
    ].filter(Boolean).join(' ');

    // Handle row click for edit mode
    const handleRowClick = () => {
        if (isClickable && onInfoClick) {
            onInfoClick();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleRowClick();
        }
    };

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
        <div 
            className={rowClasses}
            onClick={isClickable ? handleRowClick : undefined}
            onKeyDown={isClickable ? handleKeyDown : undefined}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
        >
            <span className="item-qty">{isEmpty ? '' : quantity}</span>
            <span className="item-name">
                {name}
                {/* Show info button only when NOT in clickable mode (row handles click) */}
                {onInfoClick && !isEmpty && !isClickable && <InfoButton onClick={onInfoClick} size="sm" />}
            </span>
            <span className="item-weight">{weight}</span>
            <span className="item-value">{value}</span>
        </div>
    );
};

export default ItemRow;

