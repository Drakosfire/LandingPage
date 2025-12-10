/**
 * TreasureBlock Component
 * 
 * Special inventory block for treasure/valuables with 2-column layout.
 * Only shows Item | Value (no qty or weight columns).
 * 
 * Edit Mode Support:
 * - Items become clickable to open edit modal
 * - "Add Item" row appears at bottom of list
 * 
 * @module PlayerCharacterGenerator/sheetComponents/inventory
 */

import React from 'react';
import { IconPlus } from '@tabler/icons-react';
import { usePlayerCharacterGenerator } from '../../PlayerCharacterGeneratorProvider';
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
    /** Callback when add item button is clicked (edit mode) */
    onAddItem?: () => void;
    /** Callback when existing item is clicked for editing (edit mode) */
    onItemEdit?: (item: InventoryItem) => void;
}

/**
 * TreasureBlock - 2-column treasure list (Item | Value)
 */
export const TreasureBlock: React.FC<TreasureBlockProps> = ({
    title,
    totalWeight,
    items,
    emptyRows = 2,
    onAddItem,
    onItemEdit
}) => {
    const { isEditMode } = usePlayerCharacterGenerator();

    const handleItemClick = (item: InventoryItem) => {
        if (isEditMode && onItemEdit) {
            console.log('✏️ [TreasureBlock] Edit item:', item.name);
            onItemEdit(item);
        }
    };

    const handleAddClick = () => {
        if (onAddItem) {
            console.log('➕ [TreasureBlock] Add item clicked');
            onAddItem();
        }
    };

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
                    <div
                        key={item.id}
                        className={`item-row ${isEditMode && onItemEdit ? 'clickable' : ''}`}
                        onClick={isEditMode && onItemEdit ? () => handleItemClick(item) : undefined}
                        onKeyDown={isEditMode && onItemEdit ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleItemClick(item);
                            }
                        } : undefined}
                        role={isEditMode && onItemEdit ? 'button' : undefined}
                        tabIndex={isEditMode && onItemEdit ? 0 : undefined}
                    >
                        <span className="item-name">{item.name}</span>
                        <span className="item-value">{item.value || '—'}</span>
                    </div>
                ))}
                {/* Show Add Item row in edit mode when callback provided */}
                {isEditMode && onAddItem && (
                    <div
                        className="item-row add-item-row"
                        onClick={handleAddClick}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleAddClick();
                            }
                        }}
                        role="button"
                        tabIndex={0}
                    >
                        <span className="add-item-icon">
                            <IconPlus size={14} stroke={2} />
                        </span>
                        <span className="add-item-text">Add treasure...</span>
                    </div>
                )}
                {/* Only show empty rows when NOT in edit mode */}
                {!isEditMode && Array.from({ length: emptyRows }).map((_, idx) => (
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

