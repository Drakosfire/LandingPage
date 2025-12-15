/**
 * useFeaturesOverflow Hook
 * 
 * Overflow detection for Features section using actual DOM measurements.
 * Uses useMeasureItems hook for accurate height calculation.
 * Supports multi-page overflow when content exceeds a single overflow page.
 * 
 * Desktop only - mobile uses natural scroll.
 * 
 * @module PlayerCharacterGenerator/hooks
 */

import React, { useMemo, useCallback } from 'react';
import type { Feature } from '../sheetComponents';
import { useMeasureItems } from './useMeasureItems';

// ============================================================================
// Constants
// ============================================================================

/** Gap between feature items in the overflow page (matches CSS) */
const FEATURE_GAP_PX = 12;

/** Overflow page content width (page width minus padding) */
const OVERFLOW_PAGE_CONTENT_WIDTH_PX = 720; // 816 - ~96px padding

/** Available height per overflow page (US Letter minus margins and header/footer) */
const OVERFLOW_PAGE_AVAILABLE_HEIGHT_PX = 900;

/** Section overhead for main Column 3 (header, padding) */
const MAIN_SECTION_OVERHEAD_PX = 40;

/** Section overhead for overflow pages (header + footer) */
const OVERFLOW_PAGE_OVERHEAD_PX = 100;

/** CSS context for measurement portal */
const OVERFLOW_CSS_CONTEXT = {
    className: 'page phb character-sheet overflow-page features-overflow-page',
    contentWidthPx: OVERFLOW_PAGE_CONTENT_WIDTH_PX,
    style: {
        // Match overflow page CSS
        padding: '0 14px',
    } as React.CSSProperties,
};

// ============================================================================
// Types
// ============================================================================

export interface FeaturesOverflowState {
    /** Features that fit in the main sheet's available space */
    visibleFeatures: Feature[];
    /** Array of overflow pages, each containing features for that page */
    overflowPages: Feature[][];
    /** Whether there's any overflow */
    hasOverflow: boolean;
    /** Total number of overflow pages needed */
    overflowPageCount: number;
    /** Whether measurement is complete */
    isMeasurementComplete: boolean;
    /** The measurement portal element (must be rendered for measurements to work) */
    measurementPortal: React.ReactNode;
}

export interface UseFeaturesOverflowOptions {
    /** All features to display */
    features: Feature[];
    /** Maximum available height in main section (default: 580px - approx Column 3 height) */
    maxHeightPx?: number;
    /** Height available per overflow page (default: 900px) */
    overflowPageHeightPx?: number;
    /** Whether overflow detection is enabled (desktop only) */
    enabled?: boolean;
}

// ============================================================================
// Feature Item Renderer (for measurement)
// ============================================================================

/**
 * Renders a feature item for measurement.
 * Matches the structure in FeaturesOverflowPage.
 */
const FeatureMeasureItem: React.FC<{ feature: Feature }> = ({ feature }) => (
    <div className="overflow-feature-item">
        <h3 className="overflow-feature-name">{feature.name}</h3>
        <p className="overflow-feature-description">{feature.description}</p>
    </div>
);

// ============================================================================
// Pagination Logic
// ============================================================================

/**
 * Split features into pages based on measured heights.
 */
const splitFeaturesIntoPages = (
    features: Feature[],
    heights: Map<number, number>,
    startIndex: number,
    availableHeight: number,
    gapPx: number,
    overheadPx: number
): Feature[][] => {
    if (features.length === 0) return [];
    
    const pages: Feature[][] = [];
    let currentPage: Feature[] = [];
    let currentHeight = 0;
    const maxHeight = availableHeight - overheadPx;
    
    for (let i = 0; i < features.length; i++) {
        const globalIndex = startIndex + i;
        const feature = features[i];
        
        // Get measured height or use fallback estimate
        const itemHeight = heights.get(globalIndex) ?? estimateFallbackHeight(feature);
        const heightWithGap = currentPage.length > 0 ? itemHeight + gapPx : itemHeight;
        
        if (currentHeight + heightWithGap > maxHeight && currentPage.length > 0) {
            // Current page is full, start new page
            pages.push(currentPage);
            currentPage = [feature];
            currentHeight = itemHeight;
        } else {
            // Add to current page
            currentPage.push(feature);
            currentHeight += heightWithGap;
        }
    }
    
    // Don't forget the last page
    if (currentPage.length > 0) {
        pages.push(currentPage);
    }
    
    return pages;
};

/**
 * Fallback height estimate when measurement isn't available yet.
 * Used only during initial render before measurements complete.
 */
const estimateFallbackHeight = (feature: Feature): number => {
    const nameHeight = 16;
    const lineHeight = 14;
    const charsPerLine = 50;
    const padding = 20;
    
    const descChars = feature.description?.length ?? 0;
    const descLines = Math.max(1, Math.ceil(descChars / charsPerLine));
    
    return nameHeight + (descLines * lineHeight) + padding;
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to detect and split features that overflow available space.
 * Uses actual DOM measurements for accurate pagination.
 * 
 * Usage:
 * ```tsx
 * const { 
 *     visibleFeatures, 
 *     overflowPages, 
 *     hasOverflow, 
 *     measurementPortal 
 * } = useFeaturesOverflow({
 *     features,
 *     maxHeightPx: 580,
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
export const useFeaturesOverflow = ({
    features,
    maxHeightPx = 580,
    overflowPageHeightPx = OVERFLOW_PAGE_AVAILABLE_HEIGHT_PX,
    enabled = true
}: UseFeaturesOverflowOptions): FeaturesOverflowState => {
    
    // Render function for measurement - stable reference
    const renderFeature = useCallback((feature: Feature, _index: number) => (
        <FeatureMeasureItem feature={feature} />
    ), []);
    
    // Key extractor for stable identity - stable reference
    const getFeatureKey = useCallback((feature: Feature, index: number) => 
        feature.name || `feature-${index}`, 
    []);
    
    // Get actual measurements from DOM
    const { 
        heights, 
        isComplete: isMeasurementComplete, 
        measurementPortal 
    } = useMeasureItems({
        items: features,
        renderItem: renderFeature,
        cssContext: OVERFLOW_CSS_CONTEXT,
        enabled,
        getKey: getFeatureKey,
    });
    
    // Calculate overflow based on measured heights
    const result = useMemo(() => {
        if (!enabled || features.length === 0) {
            return {
                visibleFeatures: features,
                overflowPages: [] as Feature[][],
                hasOverflow: false,
                overflowPageCount: 0,
            };
        }
        
        // Step 1: Find split point for main section
        let cumulativeHeight = 0;
        let splitIndex = features.length;
        const availableMainHeight = maxHeightPx - MAIN_SECTION_OVERHEAD_PX;
        
        for (let i = 0; i < features.length; i++) {
            const itemHeight = heights.get(i) ?? estimateFallbackHeight(features[i]);
            const heightWithGap = i > 0 ? itemHeight + FEATURE_GAP_PX : itemHeight;
            
            if (cumulativeHeight + heightWithGap > availableMainHeight) {
                splitIndex = i;
                break;
            }
            
            cumulativeHeight += heightWithGap;
        }
        
        const visibleFeatures = features.slice(0, splitIndex);
        const allOverflowFeatures = features.slice(splitIndex);
        
        // Step 2: Split overflow features into pages
        const overflowPages = splitFeaturesIntoPages(
            allOverflowFeatures,
            heights,
            splitIndex, // Pass the starting index for correct height lookup
            overflowPageHeightPx,
            FEATURE_GAP_PX,
            OVERFLOW_PAGE_OVERHEAD_PX
        );
        
        // Log split decision (development only) - but only when measurements are complete
        // to avoid spamming during measurement phase
        if (process.env.NODE_ENV !== 'production' && overflowPages.length > 0 && isMeasurementComplete) {
            console.log('📐 [FeaturesOverflow] Split decision:', {
                total: features.length,
                visible: visibleFeatures.length,
                overflowFeatures: allOverflowFeatures.length,
                overflowPages: overflowPages.length,
                featuresPerPage: overflowPages.map(p => p.length),
                measurementsComplete: isMeasurementComplete,
                measuredCount: heights.size,
            });
        }
        
        return {
            visibleFeatures,
            overflowPages,
            hasOverflow: overflowPages.length > 0,
            overflowPageCount: overflowPages.length,
        };
    }, [features, heights, maxHeightPx, overflowPageHeightPx, enabled, isMeasurementComplete]);
    
    return {
        ...result,
        isMeasurementComplete,
        measurementPortal,
    };
};

export default useFeaturesOverflow;
