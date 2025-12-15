/**
 * InventoryOverflowPage Component
 * 
 * Continuation page for inventory items that overflow from the main sheet.
 * Uses 3-column PHB styling matching the main InventorySheet layout.
 * Supports multi-page overflow with page indicators.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/overflow
 */

import React from 'react';
import type { InventoryItem } from '../inventory';
import type { InventoryPageData } from '../../hooks/useInventoryOverflow';
import './InventoryOverflowPage.css';

export interface InventoryOverflowPageProps {
    /** Inventory data for this overflow page */
    pageData: InventoryPageData;
    /** Character name for header */
    characterName?: string;
    /** Overall page number in the character sheet */
    pageNumber?: number;
    /** Current overflow page (1-indexed) within inventory overflow */
    currentOverflowPage?: number;
    /** Total number of inventory overflow pages */
    totalOverflowPages?: number;
}

/**
 * Render a single inventory item row
 */
const InventoryRow: React.FC<{ item: InventoryItem }> = ({ item }) => (
    <div className="overflow-inventory-row">
        <span className="overflow-inventory-qty">{item.quantity}</span>
        <span className="overflow-inventory-name">
            {item.name}
            {item.attuned && <span className="attuned-marker">✦</span>}
        </span>
        <span className="overflow-inventory-weight">
            {item.weight ? `${item.weight} lb` : '—'}
        </span>
        <span className="overflow-inventory-value">
            {item.value || item.notes || '—'}
        </span>
    </div>
);

/**
 * Render a category block with header and items
 */
const CategoryBlock: React.FC<{
    title: string;
    items: InventoryItem[];
    isContinued: boolean;
}> = ({ title, items, isContinued }) => {
    if (items.length === 0) return null;

    const displayTitle = isContinued ? `${title} (Continued)` : title;

    return (
        <div className="overflow-inventory-category">
            <div className="overflow-inventory-category-header">
                <span className="overflow-inventory-category-title">{displayTitle}</span>
            </div>
            <div className="overflow-inventory-category-items">
                {/* Column headers */}
                <div className="overflow-inventory-row header-row">
                    <span className="overflow-inventory-qty">Qty</span>
                    <span className="overflow-inventory-name">Item</span>
                    <span className="overflow-inventory-weight">Wt.</span>
                    <span className="overflow-inventory-value">Value</span>
                </div>
                {items.map((item, idx) => (
                    <InventoryRow key={item.id || `item-${idx}`} item={item} />
                ))}
            </div>
        </div>
    );
};

/**
 * InventoryOverflowPage - Continuation page with 3-column PHB styling
 * 
 * Uses the same .page.phb classes as CharacterSheetPage to get:
 * - Parchment background texture
 * - Fancy decorative border
 * - Footer accent decoration
 */
export const InventoryOverflowPage: React.FC<InventoryOverflowPageProps> = ({
    pageData,
    characterName = 'Character',
    pageNumber,
    currentOverflowPage = 1,
    totalOverflowPages = 1
}) => {
    if (pageData.categories.length === 0) return null;

    // Build header text with page indicator for multi-page overflow
    const headerText = totalOverflowPages > 1
        ? `${characterName} — Inventory (Continued ${currentOverflowPage}/${totalOverflowPages})`
        : `${characterName} — Inventory (Continued)`;

    // Count total items on this page
    const totalItems = pageData.categories.reduce((sum, cat) => sum + cat.items.length, 0);

    // Distribute categories across 3 columns
    // Strategy: Fill columns left-to-right, trying to balance item counts
    const columns: typeof pageData.categories[] = [[], [], []];
    const columnHeights = [0, 0, 0];

    for (const category of pageData.categories) {
        // Find shortest column
        const shortestIdx = columnHeights.indexOf(Math.min(...columnHeights));
        columns[shortestIdx].push(category);
        // Estimate height: header + items
        columnHeights[shortestIdx] += 28 + (category.items.length * 24);
    }

    return (
        <div className="page phb character-sheet overflow-page inventory-overflow-page">
            {/* Page Title */}
            <div className="phb-page-title">Inventory (Continued)</div>

            {/* Header */}
            <header className="overflow-page-header">
                <h2 className="overflow-page-title">{headerText}</h2>
                {pageNumber && (
                    <span className="overflow-page-number">Page {pageNumber}</span>
                )}
            </header>

            {/* 3-Column Layout */}
            <div className="overflow-inventory-columns">
                {columns.map((columnCategories, colIdx) => (
                    <div key={`col-${colIdx}`} className="overflow-inventory-column">
                        {columnCategories.map((cat, catIdx) => (
                            <CategoryBlock
                                key={`${cat.category}-${catIdx}`}
                                title={cat.title}
                                items={cat.items}
                                isContinued={cat.isContinued}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <footer className="overflow-page-footer">
                <span className="overflow-page-count">
                    {totalItems} item{totalItems !== 1 ? 's' : ''} on this page
                    {totalOverflowPages > 1 && ` • Overflow page ${currentOverflowPage} of ${totalOverflowPages}`}
                </span>
            </footer>
        </div>
    );
};

export default InventoryOverflowPage;

