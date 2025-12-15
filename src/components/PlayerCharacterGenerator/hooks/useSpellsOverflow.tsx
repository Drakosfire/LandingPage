/**
 * useSpellsOverflow Hook
 * 
 * Overflow detection for SpellSheet using actual DOM measurements.
 * Implements per-spell overflow (Option B) - spells flow continuously
 * regardless of level, with "(continued)" labels when levels span pages.
 * 
 * Desktop only - mobile uses natural scroll.
 * 
 * @module PlayerCharacterGenerator/hooks
 */

import React, { useMemo, useCallback } from 'react';
import type { SpellEntry } from '../sheetComponents/spells';
import { useMeasureItems } from './useMeasureItems';

// ============================================================================
// Constants
// ============================================================================

/** Gap between spell items in the overflow page (matches CSS) */
const SPELL_GAP_PX = 4;

/** Gap between spell level sections */
const LEVEL_SECTION_GAP_PX = 16;

/** Height of a spell level header */
const LEVEL_HEADER_HEIGHT_PX = 28;

/** Overflow page content width (page width minus padding) */
const OVERFLOW_PAGE_CONTENT_WIDTH_PX = 720;

/** Available height per overflow page (US Letter minus margins and header/footer) */
const OVERFLOW_PAGE_AVAILABLE_HEIGHT_PX = 900;

/** Section overhead for main SpellSheet (header, slot tracker, etc.) */
const MAIN_SHEET_OVERHEAD_PX = 200;

/** Section overhead for overflow pages (header + footer) */
const OVERFLOW_PAGE_OVERHEAD_PX = 100;

/** CSS context for measurement portal */
const OVERFLOW_CSS_CONTEXT = {
    className: 'page phb character-sheet overflow-page spells-overflow-page',
    contentWidthPx: OVERFLOW_PAGE_CONTENT_WIDTH_PX,
    style: {
        padding: '0 14px',
    } as React.CSSProperties,
};

// ============================================================================
// Types
// ============================================================================

/** Spell with its level for organizing overflow */
export interface SpellWithLevel extends SpellEntry {
    spellLevel: number;
}

/** An overflow page containing spells grouped by level */
export interface SpellOverflowPageData {
    /** Spells for this page, grouped by level */
    spellsByLevel: Map<number, SpellEntry[]>;
    /** Levels that continue from previous page */
    continuedLevels: number[];
    /** Levels that continue to next page */
    continuesOnNextPage: number[];
}

export interface SpellsOverflowState {
    /** Spells that fit in the main sheet's available space, by level */
    visibleSpellsByLevel: Map<number, SpellEntry[]>;
    /** Which levels are fully visible on main sheet */
    visibleLevels: number[];
    /** Which levels are truncated on main sheet (continue to overflow) */
    truncatedLevels: number[];
    /** Array of overflow pages with spell data */
    overflowPages: SpellOverflowPageData[];
    /** Whether there's any overflow */
    hasOverflow: boolean;
    /** Total number of overflow pages needed */
    overflowPageCount: number;
    /** Whether measurement is complete */
    isMeasurementComplete: boolean;
    /** The measurement portal element (must be rendered for measurements to work) */
    measurementPortal: React.ReactNode;
}

export interface UseSpellsOverflowOptions {
    /** Cantrips (level 0) */
    cantrips?: SpellEntry[];
    /** 1st level spells */
    level1Spells?: SpellEntry[];
    /** 2nd level spells */
    level2Spells?: SpellEntry[];
    /** 3rd level spells */
    level3Spells?: SpellEntry[];
    /** 4th level spells */
    level4Spells?: SpellEntry[];
    /** 5th level spells */
    level5Spells?: SpellEntry[];
    /** 6th level spells */
    level6Spells?: SpellEntry[];
    /** 7th level spells */
    level7Spells?: SpellEntry[];
    /** 8th level spells */
    level8Spells?: SpellEntry[];
    /** 9th level spells */
    level9Spells?: SpellEntry[];
    /** Maximum available height in main sheet (default: calculated from page height) */
    maxHeightPx?: number;
    /** Height available per overflow page (default: 900px) */
    overflowPageHeightPx?: number;
    /** Whether overflow detection is enabled (desktop only) */
    enabled?: boolean;
}

// ============================================================================
// Spell Item Renderer (for measurement)
// ============================================================================

/**
 * Renders a spell item for measurement.
 * Matches the structure in SpellsOverflowPage.
 */
const SpellMeasureItem: React.FC<{ spell: SpellWithLevel }> = ({ spell }) => (
    <div className="overflow-spell-item">
        <span className="spell-name">
            {spell.isPrepared !== undefined && (
                <span className="prepared-indicator">{spell.isPrepared ? '●' : '○'}</span>
            )}
            {spell.name}
            {spell.isConcentration && <span className="spell-tag concentration">C</span>}
            {spell.isRitual && <span className="spell-tag ritual">R</span>}
        </span>
    </div>
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Flatten all spells into a single array with level metadata.
 */
const flattenSpells = (options: UseSpellsOverflowOptions): SpellWithLevel[] => {
    const spells: SpellWithLevel[] = [];

    const addSpells = (level: number, levelSpells?: SpellEntry[]) => {
        if (levelSpells) {
            levelSpells.forEach(spell => {
                spells.push({ ...spell, spellLevel: level });
            });
        }
    };

    addSpells(0, options.cantrips);
    addSpells(1, options.level1Spells);
    addSpells(2, options.level2Spells);
    addSpells(3, options.level3Spells);
    addSpells(4, options.level4Spells);
    addSpells(5, options.level5Spells);
    addSpells(6, options.level6Spells);
    addSpells(7, options.level7Spells);
    addSpells(8, options.level8Spells);
    addSpells(9, options.level9Spells);

    return spells;
};

/**
 * Fallback height estimate when measurement isn't available yet.
 */
const estimateFallbackHeight = (spell: SpellWithLevel): number => {
    const baseHeight = 24; // Single line spell item
    const tagPadding = (spell.isConcentration ? 20 : 0) + (spell.isRitual ? 20 : 0);
    return baseHeight + tagPadding;
};

/**
 * Calculate height needed for a level section header.
 */
const getLevelHeaderHeight = (level: number, isContinued: boolean): number => {
    // Continued sections have slightly smaller headers
    return isContinued ? LEVEL_HEADER_HEIGHT_PX * 0.8 : LEVEL_HEADER_HEIGHT_PX;
};

/**
 * Split spells into pages based on measured heights.
 * Returns visible spells for main sheet and overflow page data.
 */
const paginateSpells = (
    allSpells: SpellWithLevel[],
    heights: Map<number, number>,
    mainSheetMaxHeight: number,
    overflowPageMaxHeight: number
): {
    visibleSpellsByLevel: Map<number, SpellEntry[]>;
    visibleLevels: number[];
    truncatedLevels: number[];
    overflowPages: SpellOverflowPageData[];
} => {
    const visibleSpellsByLevel = new Map<number, SpellEntry[]>();
    const visibleLevels: number[] = [];
    const truncatedLevels: number[] = [];
    const overflowPages: SpellOverflowPageData[] = [];

    if (allSpells.length === 0) {
        return { visibleSpellsByLevel, visibleLevels, truncatedLevels, overflowPages };
    }

    // Track state as we iterate through spells
    let currentHeight = MAIN_SHEET_OVERHEAD_PX;
    let currentLevel = -1;
    let isMainSheet = true;
    let currentPage: SpellOverflowPageData | null = null;
    const maxHeight = () => isMainSheet ? mainSheetMaxHeight : overflowPageMaxHeight;

    // Process each spell
    for (let i = 0; i < allSpells.length; i++) {
        const spell = allSpells[i];
        const spellHeight = heights.get(i) ?? estimateFallbackHeight(spell);

        // Check if we're starting a new level
        const isNewLevel = spell.spellLevel !== currentLevel;
        const levelHeaderHeight = isNewLevel ? getLevelHeaderHeight(spell.spellLevel, !isMainSheet && currentPage !== null) : 0;
        const levelGap = isNewLevel && currentLevel !== -1 ? LEVEL_SECTION_GAP_PX : 0;

        const totalHeightNeeded = levelHeaderHeight + levelGap + spellHeight + SPELL_GAP_PX;

        // Check if this spell fits on current page/sheet
        if (currentHeight + totalHeightNeeded > maxHeight()) {
            if (isMainSheet) {
                // Transition from main sheet to first overflow page
                if (currentLevel !== -1 && currentLevel === spell.spellLevel) {
                    // Current level is being truncated
                    truncatedLevels.push(currentLevel);
                }
                isMainSheet = false;

                // Start first overflow page
                currentPage = {
                    spellsByLevel: new Map(),
                    continuedLevels: spell.spellLevel === currentLevel ? [spell.spellLevel] : [],
                    continuesOnNextPage: []
                };
                overflowPages.push(currentPage);
                currentHeight = OVERFLOW_PAGE_OVERHEAD_PX;
            } else {
                // Need a new overflow page
                if (currentPage && currentLevel === spell.spellLevel) {
                    currentPage.continuesOnNextPage.push(currentLevel);
                }

                currentPage = {
                    spellsByLevel: new Map(),
                    continuedLevels: spell.spellLevel === currentLevel ? [spell.spellLevel] : [],
                    continuesOnNextPage: []
                };
                overflowPages.push(currentPage);
                currentHeight = OVERFLOW_PAGE_OVERHEAD_PX;
            }
        }

        // Add level header height if starting new level
        if (isNewLevel) {
            currentHeight += levelHeaderHeight + levelGap;
            currentLevel = spell.spellLevel;

            if (isMainSheet && !visibleLevels.includes(spell.spellLevel)) {
                visibleLevels.push(spell.spellLevel);
            }
        }

        // Add spell to appropriate collection
        if (isMainSheet) {
            if (!visibleSpellsByLevel.has(spell.spellLevel)) {
                visibleSpellsByLevel.set(spell.spellLevel, []);
            }
            visibleSpellsByLevel.get(spell.spellLevel)!.push(spell);
        } else if (currentPage) {
            if (!currentPage.spellsByLevel.has(spell.spellLevel)) {
                currentPage.spellsByLevel.set(spell.spellLevel, []);
            }
            currentPage.spellsByLevel.get(spell.spellLevel)!.push(spell);
        }

        currentHeight += spellHeight + SPELL_GAP_PX;
    }

    return { visibleSpellsByLevel, visibleLevels, truncatedLevels, overflowPages };
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to detect and split spells that overflow available space.
 * Uses actual DOM measurements for accurate pagination.
 * 
 * Implements per-spell overflow - spells flow continuously, with
 * "(continued)" labels when levels span pages.
 * 
 * Usage:
 * ```tsx
 * const { 
 *     visibleSpellsByLevel, 
 *     overflowPages, 
 *     hasOverflow, 
 *     measurementPortal 
 * } = useSpellsOverflow({
 *     cantrips,
 *     level1Spells,
 *     // ... etc
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
export const useSpellsOverflow = (options: UseSpellsOverflowOptions): SpellsOverflowState => {
    const {
        maxHeightPx = 800, // Approximate height for 3-column spell area
        overflowPageHeightPx = OVERFLOW_PAGE_AVAILABLE_HEIGHT_PX,
        enabled = true
    } = options;

    // Flatten all spells into single array for measurement
    const allSpells = useMemo(() => flattenSpells(options), [
        options.cantrips,
        options.level1Spells,
        options.level2Spells,
        options.level3Spells,
        options.level4Spells,
        options.level5Spells,
        options.level6Spells,
        options.level7Spells,
        options.level8Spells,
        options.level9Spells
    ]);

    // Render function for measurement - stable reference
    const renderSpell = useCallback((spell: SpellWithLevel, _index: number) => (
        <SpellMeasureItem spell={spell} />
    ), []);

    // Key extractor for stable identity
    const getSpellKey = useCallback((spell: SpellWithLevel, index: number) =>
        spell.id || `spell-${spell.spellLevel}-${index}`,
        []);

    // Get actual measurements from DOM
    const {
        heights,
        isComplete: isMeasurementComplete,
        measurementPortal
    } = useMeasureItems({
        items: allSpells,
        renderItem: renderSpell,
        cssContext: OVERFLOW_CSS_CONTEXT,
        enabled,
        getKey: getSpellKey,
    });

    // Calculate overflow based on measured heights
    const result = useMemo(() => {
        if (!enabled || allSpells.length === 0) {
            return {
                visibleSpellsByLevel: new Map<number, SpellEntry[]>(),
                visibleLevels: [] as number[],
                truncatedLevels: [] as number[],
                overflowPages: [] as SpellOverflowPageData[],
                hasOverflow: false,
                overflowPageCount: 0,
            };
        }

        const { visibleSpellsByLevel, visibleLevels, truncatedLevels, overflowPages } = paginateSpells(
            allSpells,
            heights,
            maxHeightPx,
            overflowPageHeightPx - OVERFLOW_PAGE_OVERHEAD_PX
        );

        // Log split decision (development only)
        if (process.env.NODE_ENV !== 'production' && overflowPages.length > 0 && isMeasurementComplete) {
            console.log('📐 [SpellsOverflow] Split decision:', {
                totalSpells: allSpells.length,
                visibleLevels,
                truncatedLevels,
                overflowPages: overflowPages.length,
                spellsPerPage: overflowPages.map(p =>
                    Array.from(p.spellsByLevel.values()).reduce((sum, spells) => sum + spells.length, 0)
                ),
                measurementsComplete: isMeasurementComplete,
            });
        }

        return {
            visibleSpellsByLevel,
            visibleLevels,
            truncatedLevels,
            overflowPages,
            hasOverflow: overflowPages.length > 0,
            overflowPageCount: overflowPages.length,
        };
    }, [allSpells, heights, maxHeightPx, overflowPageHeightPx, enabled, isMeasurementComplete]);

    return {
        ...result,
        isMeasurementComplete,
        measurementPortal,
    };
};

export default useSpellsOverflow;

