/**
 * useMeasureItems Hook
 * 
 * Lightweight measurement hook for overflow detection.
 * Borrows patterns from Canvas MeasurementPortal but simplified for PCG.
 * 
 * Key features:
 * - Creates offscreen measurement portal with correct CSS context
 * - Uses ResizeObserver for accurate DOM height measurement
 * - Throttles updates to prevent layout thrashing
 * - Returns actual heights instead of estimates
 * 
 * @module PlayerCharacterGenerator/hooks
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';

// ============================================================================
// Constants
// ============================================================================

/** Throttle measurement updates to prevent thrashing */
const MEASUREMENT_THROTTLE_MS = 100;

/** Minimum height change to trigger update (prevents sub-pixel noise) */
const MEASUREMENT_EPSILON = 0.5;

// ============================================================================
// Types
// ============================================================================

export interface MeasureItemsCSSContext {
    /** CSS class names for the measurement container (e.g., "page phb character-sheet") */
    className: string;
    /** Inline styles for the measurement container */
    style?: React.CSSProperties;
    /** Width of the content area in pixels */
    contentWidthPx: number;
}

export interface UseMeasureItemsOptions<T> {
    /** Items to measure */
    items: T[];
    /** Render function for each item */
    renderItem: (item: T, index: number) => React.ReactNode;
    /** CSS context for accurate measurement */
    cssContext: MeasureItemsCSSContext;
    /** Whether measurement is enabled (disable for mobile, etc.) */
    enabled?: boolean;
    /** Optional key extractor for stable identity */
    getKey?: (item: T, index: number) => string | number;
}

export interface MeasureItemsResult {
    /** Map of item index → measured height in pixels */
    heights: Map<number, number>;
    /** Whether all items have been measured */
    isComplete: boolean;
    /** Total measured height of all items */
    totalHeight: number;
    /** The measurement portal element (render this in your component) */
    measurementPortal: React.ReactNode;
}

// ============================================================================
// Internal Measurement Item Component
// ============================================================================

interface MeasurementItemProps {
    index: number;
    children: React.ReactNode;
    onMeasure: (index: number, height: number) => void;
}

/**
 * Individual measurement wrapper - uses ResizeObserver to track height
 */
const MeasurementItem: React.FC<MeasurementItemProps> = React.memo(({ 
    index, 
    children, 
    onMeasure 
}) => {
    const ref = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        
        // Initial measurement
        const rect = node.getBoundingClientRect();
        if (rect.height > 0) {
            onMeasure(index, rect.height);
        }
        
        // Set up ResizeObserver for changes
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry && entry.contentRect.height > 0) {
                onMeasure(index, entry.contentRect.height);
            }
        });
        
        observer.observe(node);
        return () => observer.disconnect();
    }, [index, onMeasure]);
    
    return (
        <div ref={ref} data-measure-index={index}>
            {children}
        </div>
    );
});

MeasurementItem.displayName = 'MeasurementItem';

// ============================================================================
// Internal Portal Component
// ============================================================================

interface MeasurementPortalContentProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    cssContext: MeasureItemsCSSContext;
    getKey?: (item: T, index: number) => string | number;
    onMeasure: (index: number, height: number) => void;
    portalNode: HTMLDivElement;
}

/**
 * Portal content component - stable identity, won't cause remounts
 */
function MeasurementPortalContent<T>({
    items,
    renderItem,
    cssContext,
    getKey,
    onMeasure,
    portalNode,
}: MeasurementPortalContentProps<T>): React.ReactElement | null {
    // Container styles for offscreen rendering
    const containerStyle = useMemo<React.CSSProperties>(() => ({
        position: 'absolute',
        left: '-9999px',
        top: '0px',
        width: '0px',
        height: '0px',
        overflow: 'hidden',
        visibility: 'hidden',
        pointerEvents: 'none',
    }), []);
    
    // Content area styles
    const contentStyle = useMemo<React.CSSProperties>(() => ({
        width: `${cssContext.contentWidthPx}px`,
        ...cssContext.style,
    }), [cssContext.contentWidthPx, cssContext.style]);
    
    if (items.length === 0) {
        return null;
    }
    
    return createPortal(
        <div className="dm-pcg-measurement-layer" style={containerStyle}>
            <div className={cssContext.className} style={contentStyle}>
                {items.map((item, index) => {
                    const key = getKey ? getKey(item, index) : index;
                    return (
                        <MeasurementItem
                            key={key}
                            index={index}
                            onMeasure={onMeasure}
                        >
                            {renderItem(item, index)}
                        </MeasurementItem>
                    );
                })}
            </div>
        </div>,
        portalNode
    );
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Lightweight measurement hook for overflow detection.
 * 
 * Usage:
 * ```tsx
 * const { heights, isComplete, measurementPortal } = useMeasureItems({
 *     items: features,
 *     renderItem: (feature, idx) => (
 *         <div className="overflow-feature-item">
 *             <h3>{feature.name}</h3>
 *             <p>{feature.description}</p>
 *         </div>
 *     ),
 *     cssContext: {
 *         className: 'page phb character-sheet overflow-page',
 *         contentWidthPx: 720,
 *     },
 *     enabled: !isMobile,
 * });
 * 
 * // Render the portal element (required for measurement to work)
 * return (
 *     <>
 *         {measurementPortal}
 *         ...rest of component...
 *     </>
 * );
 * ```
 */
export function useMeasureItems<T>({
    items,
    renderItem,
    cssContext,
    enabled = true,
    getKey,
}: UseMeasureItemsOptions<T>): MeasureItemsResult {
    // Height measurements: index → height
    const [heights, setHeights] = useState<Map<number, number>>(() => new Map());
    
    // Portal DOM node - created once on mount
    const [portalNode, setPortalNode] = useState<HTMLDivElement | null>(null);
    
    // Pending measurements for batching
    const pendingRef = useRef<Map<number, number>>(new Map());
    const flushTimeoutRef = useRef<number | null>(null);
    
    // Create portal node on mount
    useEffect(() => {
        if (!enabled) return;
        
        const node = document.createElement('div');
        node.className = 'dm-pcg-measurement-portal';
        node.setAttribute('data-pcg-portal', 'measurement');
        document.body.appendChild(node);
        setPortalNode(node);
        
        return () => {
            if (document.body.contains(node)) {
                document.body.removeChild(node);
            }
            setPortalNode(null);
        };
    }, [enabled]);
    
    // Flush pending measurements
    const flushMeasurements = useCallback(() => {
        if (pendingRef.current.size === 0) return;
        
        setHeights(prev => {
            const next = new Map(prev);
            let changed = false;
            
            pendingRef.current.forEach((height, index) => {
                const prevHeight = prev.get(index) ?? 0;
                // Only update if change exceeds epsilon
                if (Math.abs(height - prevHeight) > MEASUREMENT_EPSILON) {
                    next.set(index, height);
                    changed = true;
                }
            });
            
            pendingRef.current.clear();
            return changed ? next : prev;
        });
        
        flushTimeoutRef.current = null;
    }, []);
    
    // Queue a measurement update (throttled)
    const queueMeasurement = useCallback((index: number, height: number) => {
        pendingRef.current.set(index, height);
        
        if (flushTimeoutRef.current === null) {
            flushTimeoutRef.current = window.setTimeout(flushMeasurements, MEASUREMENT_THROTTLE_MS);
        }
    }, [flushMeasurements]);
    
    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (flushTimeoutRef.current !== null) {
                clearTimeout(flushTimeoutRef.current);
            }
        };
    }, []);
    
    // Clear heights when item count changes significantly
    useEffect(() => {
        setHeights(prev => {
            if (prev.size === 0 && items.length === 0) return prev;
            // Keep heights for indices that still exist
            const next = new Map<number, number>();
            for (let i = 0; i < items.length; i++) {
                const existing = prev.get(i);
                if (existing !== undefined) {
                    next.set(i, existing);
                }
            }
            return next;
        });
    }, [items.length]);
    
    // Calculate derived values
    const isComplete = useMemo(() => {
        if (!enabled || items.length === 0) return true;
        return heights.size >= items.length;
    }, [enabled, items.length, heights.size]);
    
    const totalHeight = useMemo(() => {
        let total = 0;
        heights.forEach(h => total += h);
        return total;
    }, [heights]);
    
    // Create the portal element - only recreate when necessary
    const measurementPortal = useMemo<React.ReactNode>(() => {
        if (!enabled || !portalNode || items.length === 0) {
            return null;
        }
        
        return (
            <MeasurementPortalContent
                items={items}
                renderItem={renderItem}
                cssContext={cssContext}
                getKey={getKey}
                onMeasure={queueMeasurement}
                portalNode={portalNode}
            />
        );
    }, [enabled, portalNode, items, renderItem, cssContext, getKey, queueMeasurement]);
    
    // Return disabled state
    if (!enabled) {
        return {
            heights: new Map(),
            isComplete: true,
            totalHeight: 0,
            measurementPortal: null,
        };
    }
    
    return {
        heights,
        isComplete,
        totalHeight,
        measurementPortal,
    };
}

export default useMeasureItems;
