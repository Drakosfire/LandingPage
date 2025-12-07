/**
 * useInventoryOverflow Hook
 * 
 * Overflow detection for Inventory section using actual DOM measurements.
 * Uses useMeasureItems hook for accurate height calculation.
 * Supports multi-page overflow when content exceeds a single overflow page.
 * 
 * Desktop only - mobile uses natural scroll.
 * 
 * @module PlayerCharacterGenerator/hooks
 */

import React, { useMemo, useCallback } from 'react';
import type { InventoryItem } from '../sheetComponents/inventory';
import { useMeasureItems } from './useMeasureItems';

// ============================================================================
// Constants
// ============================================================================

/** Gap between inventory items in the overflow page (matches CSS) */
const ITEM_GAP_PX = 4;

/** Height of a category header row */
const CATEGORY_HEADER_HEIGHT_PX = 28;

/** Height of a single item row */
const ITEM_ROW_HEIGHT_PX = 24;

/** Overflow page content width (page width minus padding) */
const OVERFLOW_PAGE_CONTENT_WIDTH_PX = 720;

/** Available height per overflow page (US Letter minus margins and header/footer) */
const OVERFLOW_PAGE_AVAILABLE_HEIGHT_PX = 900;

/** Section overhead for main Inventory page (header, currency, encumbrance, attunement) */
const MAIN_SECTION_OVERHEAD_PX = 200;

/** Section overhead for overflow pages (header + footer) */
const OVERFLOW_PAGE_OVERHEAD_PX = 100;

/** CSS context for measurement portal */
const OVERFLOW_CSS_CONTEXT = {
    className: 'page phb character-sheet overflow-page inventory-overflow-page',
    contentWidthPx: OVERFLOW_PAGE_CONTENT_WIDTH_PX,
    style: {
        padding: '0 14px',
    } as React.CSSProperties,
};

// ============================================================================
// Types
// ============================================================================

/** Categories of inventory items */
export type InventoryCategory = 
    | 'weapons'
    | 'armor'
    | 'magicItems'
    | 'adventuringGear'
    | 'treasure'
    | 'consumables'
    | 'otherItems';

/** Categorized inventory for a single page */
export interface InventoryPageData {
    /** Items grouped by category for this page */
    categories: {
        category: InventoryCategory;
        title: string;
        items: InventoryItem[];
        isContinued: boolean;
    }[];
}

export interface InventoryOverflowState {
    /** Categories/items that fit in the main sheet */
    visibleInventory: InventoryPageData;
    /** Array of overflow pages, each containing categorized items */
    overflowPages: InventoryPageData[];
    /** Whether there's any overflow */
    hasOverflow: boolean;
    /** Total number of overflow pages needed */
    overflowPageCount: number;
    /** Whether measurement is complete */
    isMeasurementComplete: boolean;
    /** The measurement portal element (must be rendered for measurements to work) */
    measurementPortal: React.ReactNode;
}

export interface InventoryInput {
    weapons: InventoryItem[];
    armor: InventoryItem[];
    magicItems: InventoryItem[];
    adventuringGear: InventoryItem[];
    treasure: InventoryItem[];
    consumables: InventoryItem[];
    otherItems: InventoryItem[];
}

export interface UseInventoryOverflowOptions {
    /** All inventory items by category */
    inventory: InventoryInput;
    /** Maximum available height in main section (default: 700px) */
    maxHeightPx?: number;
    /** Height available per overflow page (default: 900px) */
    overflowPageHeightPx?: number;
    /** Whether overflow detection is enabled (desktop only) */
    enabled?: boolean;
}

// ============================================================================
// Category Configuration
// ============================================================================

const CATEGORY_CONFIG: { key: InventoryCategory; title: string }[] = [
    { key: 'weapons', title: 'Weapons' },
    { key: 'armor', title: 'Armor & Shields' },
    { key: 'magicItems', title: 'Magic Items' },
    { key: 'adventuringGear', title: 'Adventuring Gear' },
    { key: 'treasure', title: 'Treasure & Valuables' },
    { key: 'consumables', title: 'Consumables' },
    { key: 'otherItems', title: 'Other Items' },
];

// ============================================================================
// Inventory Item Renderer (for measurement)
// ============================================================================

/**
 * Renders an inventory item row for measurement.
 * Matches the structure in InventoryOverflowPage.
 */
const InventoryMeasureItem: React.FC<{ item: InventoryItem }> = ({ item }) => (
    <div className="overflow-inventory-row">
        <span className="overflow-inventory-qty">{item.quantity}</span>
        <span className="overflow-inventory-name">{item.name}</span>
        <span className="overflow-inventory-weight">{item.weight ? `${item.weight} lb` : '—'}</span>
        <span className="overflow-inventory-value">{item.value || item.notes || '—'}</span>
    </div>
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Flatten all inventory items into a single array for measurement
 */
const flattenInventory = (inventory: InventoryInput): InventoryItem[] => {
    return [
        ...inventory.weapons,
        ...inventory.armor,
        ...inventory.magicItems,
        ...inventory.adventuringGear,
        ...inventory.treasure,
        ...inventory.consumables,
        ...inventory.otherItems,
    ];
};

/**
 * Estimate height for a single category block
 */
const estimateCategoryHeight = (itemCount: number): number => {
    if (itemCount === 0) return 0;
    return CATEGORY_HEADER_HEIGHT_PX + (itemCount * ITEM_ROW_HEIGHT_PX) + (itemCount - 1) * ITEM_GAP_PX;
};

/**
 * Split inventory into pages based on available height.
 * Accounts for 3-column layout on overflow pages.
 */
const splitInventoryIntoPages = (
    inventory: InventoryInput,
    mainMaxHeight: number,
    overflowMaxHeight: number
): { visible: InventoryPageData; overflow: InventoryPageData[] } => {
    const visible: InventoryPageData = { categories: [] };
    const overflowPages: InventoryPageData[] = [];
    
    // Track current heights
    let mainHeight = 0;
    
    // For overflow pages, track height per column (3-column layout)
    let currentOverflowPage: InventoryPageData = { categories: [] };
    let columnHeights = [0, 0, 0]; // Track each column's height
    
    // Helper to find the shortest column
    const getShortestColumnIdx = () => columnHeights.indexOf(Math.min(...columnHeights));
    const getShortestColumnHeight = () => Math.min(...columnHeights);
    
    // Helper to start a new overflow page
    const startNewOverflowPage = () => {
        if (currentOverflowPage.categories.length > 0) {
            overflowPages.push(currentOverflowPage);
        }
        currentOverflowPage = { categories: [] };
        columnHeights = [0, 0, 0];
    };
    
    // Process each category
    for (const { key, title } of CATEGORY_CONFIG) {
        const items = inventory[key];
        if (items.length === 0) continue;
        
        const categoryHeight = estimateCategoryHeight(items.length);
        
        // Try to fit entire category in main section
        if (mainHeight + categoryHeight <= mainMaxHeight) {
            visible.categories.push({
                category: key,
                title,
                items: [...items],
                isContinued: false,
            });
            mainHeight += categoryHeight;
            continue;
        }
        
        // Category doesn't fit entirely in main - need to split
        let remainingItems = [...items];
        let isFirstChunkOfCategory = true;
        
        // First, try to fit some items in main section
        if (mainHeight < mainMaxHeight) {
            const availableInMain = mainMaxHeight - mainHeight - CATEGORY_HEADER_HEIGHT_PX;
            const itemsThatFit = Math.floor(availableInMain / ITEM_ROW_HEIGHT_PX);
            
            if (itemsThatFit > 0) {
                const mainItems = remainingItems.slice(0, itemsThatFit);
                remainingItems = remainingItems.slice(itemsThatFit);
                
                visible.categories.push({
                    category: key,
                    title,
                    items: mainItems,
                    isContinued: false,
                });
                mainHeight = mainMaxHeight; // Mark main as full
                isFirstChunkOfCategory = false;
            }
        }
        
        // Put remaining items in overflow pages (3-column layout)
        while (remainingItems.length > 0) {
            const headerHeight = CATEGORY_HEADER_HEIGHT_PX;
            const minHeightNeeded = headerHeight + ITEM_ROW_HEIGHT_PX;
            
            // Check if ANY column has space for at least header + 1 item
            const shortestHeight = getShortestColumnHeight();
            if (shortestHeight + minHeightNeeded > overflowMaxHeight) {
                // All columns are full, start new page
                startNewOverflowPage();
            }
            
            // Find shortest column and calculate available space
            const targetColumnIdx = getShortestColumnIdx();
            const availableHeight = overflowMaxHeight - columnHeights[targetColumnIdx] - headerHeight;
            const itemsThatFit = Math.max(1, Math.floor(availableHeight / ITEM_ROW_HEIGHT_PX));
            
            // Take items for this chunk
            const chunkItems = remainingItems.slice(0, itemsThatFit);
            remainingItems = remainingItems.slice(itemsThatFit);
            
            // Add to current overflow page
            currentOverflowPage.categories.push({
                category: key,
                title,
                items: chunkItems,
                isContinued: !isFirstChunkOfCategory,
            });
            
            // Update the target column's height
            columnHeights[targetColumnIdx] += headerHeight + (chunkItems.length * ITEM_ROW_HEIGHT_PX);
            isFirstChunkOfCategory = false;
        }
    }
    
    // Don't forget the last overflow page
    if (currentOverflowPage.categories.length > 0) {
        overflowPages.push(currentOverflowPage);
    }
    
    return { visible, overflow: overflowPages };
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to detect and split inventory items that overflow available space.
 * Uses actual DOM measurements for accurate pagination.
 * 
 * Usage:
 * ```tsx
 * const { 
 *     visibleInventory, 
 *     overflowPages, 
 *     hasOverflow, 
 *     measurementPortal 
 * } = useInventoryOverflow({
 *     inventory: { weapons, armor, magicItems, ... },
 *     maxHeightPx: 700,
 *     enabled: !isMobile
 * });
 * 
 * // IMPORTANT: Render the portal for measurements to work
 * return (
 *     <>
 *         {measurementPortal}
 *         ...rest of component...
 *     </>
 * );
 * ```
 */
export const useInventoryOverflow = ({
    inventory,
    maxHeightPx = 700,
    overflowPageHeightPx = OVERFLOW_PAGE_AVAILABLE_HEIGHT_PX,
    enabled = true
}: UseInventoryOverflowOptions): InventoryOverflowState => {
    
    // Flatten all items for measurement
    const allItems = useMemo(() => flattenInventory(inventory), [inventory]);
    
    // Render function for measurement - stable reference
    const renderItem = useCallback((item: InventoryItem, _index: number) => (
        <InventoryMeasureItem item={item} />
    ), []);
    
    // Key extractor for stable identity - stable reference
    const getItemKey = useCallback((item: InventoryItem, index: number) => 
        item.id || `item-${index}`, 
    []);
    
    // Get actual measurements from DOM
    const { 
        heights, 
        isComplete: isMeasurementComplete, 
        measurementPortal 
    } = useMeasureItems({
        items: allItems,
        renderItem,
        cssContext: OVERFLOW_CSS_CONTEXT,
        enabled,
        getKey: getItemKey,
    });
    
    // Calculate overflow based on inventory structure
    const result = useMemo(() => {
        if (!enabled || allItems.length === 0) {
            return {
                visibleInventory: { categories: [] } as InventoryPageData,
                overflowPages: [] as InventoryPageData[],
                hasOverflow: false,
                overflowPageCount: 0,
            };
        }
        
        const availableMainHeight = maxHeightPx - MAIN_SECTION_OVERHEAD_PX;
        const availableOverflowHeight = overflowPageHeightPx - OVERFLOW_PAGE_OVERHEAD_PX;
        
        const { visible, overflow } = splitInventoryIntoPages(
            inventory,
            availableMainHeight,
            availableOverflowHeight
        );
        
        // Log split decision (development only)
        if (process.env.NODE_ENV !== 'production' && overflow.length > 0 && isMeasurementComplete) {
            console.log('📦 [InventoryOverflow] Split decision:', {
                totalItems: allItems.length,
                visibleCategories: visible.categories.length,
                overflowPages: overflow.length,
                measurementsComplete: isMeasurementComplete,
                measuredCount: heights.size,
            });
        }
        
        return {
            visibleInventory: visible,
            overflowPages: overflow,
            hasOverflow: overflow.length > 0,
            overflowPageCount: overflow.length,
        };
    }, [inventory, allItems, heights, maxHeightPx, overflowPageHeightPx, enabled, isMeasurementComplete]);
    
    return {
        ...result,
        isMeasurementComplete,
        measurementPortal,
    };
};

export default useInventoryOverflow;

