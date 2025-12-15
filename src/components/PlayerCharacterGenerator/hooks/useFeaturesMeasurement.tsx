/**
 * useFeaturesMeasurement Hook
 * 
 * DOM-based measurement for Features section overflow detection.
 * Uses an off-screen portal to render and measure actual feature heights,
 * providing accurate pagination rather than character-count estimation.
 * 
 * Leverages the same measurement principles as the Canvas system:
 * - Off-screen portal with correct CSS context
 * - getBoundingClientRect() for accurate heights
 * - ResizeObserver for dynamic content
 * 
 * @module PlayerCharacterGenerator/hooks
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { Feature } from '../sheetComponents';

// ============================================================================
// Types
// ============================================================================

export interface FeatureMeasurement {
    feature: Feature;
    index: number;
    height: number;
}

export interface UseFeaturesMeasurementOptions {
    /** Features to measure */
    features: Feature[];
    /** Width of the measurement container (matches overflow page content width) */
    containerWidthPx?: number;
    /** Whether measurement is enabled */
    enabled?: boolean;
    /** Callback when measurements complete */
    onMeasurementsComplete?: (measurements: FeatureMeasurement[]) => void;
}

export interface UseFeaturesMeasurementReturn {
    /** Measured heights for each feature */
    measurements: FeatureMeasurement[];
    /** Whether measurement is in progress */
    isMeasuring: boolean;
    /** Portal component to render (must be included in component tree) */
    MeasurementPortal: React.FC;
}

// ============================================================================
// Constants
// ============================================================================

/** Default content width for overflow pages (816px page - padding) */
const DEFAULT_CONTAINER_WIDTH_PX = 700;

/** Portal container styles - off-screen, invisible */
const PORTAL_CONTAINER_STYLE: React.CSSProperties = {
    position: 'absolute',
    left: '-9999px',
    top: '0px',
    width: '0px',
    height: '0px',
    overflow: 'hidden',
    visibility: 'hidden',
    pointerEvents: 'none',
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for DOM-based feature height measurement.
 * 
 * Usage:
 * ```tsx
 * const { measurements, isMeasuring, MeasurementPortal } = useFeaturesMeasurement({
 *     features: allFeatures,
 *     containerWidthPx: 700,
 *     enabled: !isMobile,
 *     onMeasurementsComplete: (m) => console.log('Measured:', m)
 * });
 * 
 * // Must render the portal somewhere in the component tree
 * return (
 *     <>
 *         <MeasurementPortal />
 *         {// ... rest of component}
 *     </>
 * );
 * ```
 */
export const useFeaturesMeasurement = ({
    features,
    containerWidthPx = DEFAULT_CONTAINER_WIDTH_PX,
    enabled = true,
    onMeasurementsComplete,
}: UseFeaturesMeasurementOptions): UseFeaturesMeasurementReturn => {
    const [measurements, setMeasurements] = useState<FeatureMeasurement[]>([]);
    const [isMeasuring, setIsMeasuring] = useState(false);
    const portalNodeRef = useRef<HTMLDivElement | null>(null);
    const measurementRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const featuresSignatureRef = useRef<string>('');

    // Create stable features signature for change detection
    const featuresSignature = features.map(f => `${f.name}:${f.description?.length ?? 0}`).join('|');

    // Create/cleanup portal node
    useEffect(() => {
        if (!enabled) return;

        const portalNode = document.createElement('div');
        portalNode.className = 'pcg-features-measurement-portal';
        portalNode.setAttribute('data-measurement-portal', 'features');
        document.body.appendChild(portalNode);
        portalNodeRef.current = portalNode;

        return () => {
            if (portalNodeRef.current && document.body.contains(portalNodeRef.current)) {
                document.body.removeChild(portalNodeRef.current);
            }
            portalNodeRef.current = null;
        };
    }, [enabled]);

    // Perform measurements when features change
    useEffect(() => {
        if (!enabled || features.length === 0) {
            setMeasurements([]);
            setIsMeasuring(false);
            return;
        }

        // Skip if features haven't changed
        if (featuresSignatureRef.current === featuresSignature) {
            return;
        }
        featuresSignatureRef.current = featuresSignature;

        setIsMeasuring(true);
        measurementRefs.current.clear();

        // Wait for next frame to ensure DOM is rendered
        const timeoutId = setTimeout(() => {
            requestAnimationFrame(() => {
                const newMeasurements: FeatureMeasurement[] = [];

                measurementRefs.current.forEach((node, index) => {
                    if (node) {
                        const rect = node.getBoundingClientRect();
                        newMeasurements.push({
                            feature: features[index],
                            index,
                            height: rect.height,
                        });
                    }
                });

                // Sort by index
                newMeasurements.sort((a, b) => a.index - b.index);

                setMeasurements(newMeasurements);
                setIsMeasuring(false);

                if (onMeasurementsComplete) {
                    onMeasurementsComplete(newMeasurements);
                }

                if (process.env.NODE_ENV !== 'production') {
                    console.log('📏 [FeaturesMeasurement] Complete:', {
                        featureCount: features.length,
                        measurements: newMeasurements.map(m => ({
                            name: m.feature.name.substring(0, 20),
                            height: m.height.toFixed(1),
                        })),
                        totalHeight: newMeasurements.reduce((sum, m) => sum + m.height, 0).toFixed(1),
                    });
                }
            });
        }, 50); // Small delay to ensure fonts are loaded

        return () => clearTimeout(timeoutId);
    }, [features, featuresSignature, enabled, onMeasurementsComplete]);

    // Ref callback for measurement entries
    const setMeasurementRef = useCallback((index: number, node: HTMLDivElement | null) => {
        if (node) {
            measurementRefs.current.set(index, node);
        } else {
            measurementRefs.current.delete(index);
        }
    }, []);

    // Portal component - memoized to prevent unnecessary re-renders
    const MeasurementPortal: React.FC = useMemo(() => {
        // Return a component function
        const PortalComponent: React.FC = () => {
            if (!enabled || !portalNodeRef.current || features.length === 0) {
                return null;
            }

            const portalContent = (
                <div style={PORTAL_CONTAINER_STYLE}>
                    {/* PHB CSS context wrapper */}
                    <div 
                        className="page phb character-sheet overflow-page"
                        style={{ 
                            width: '816px',
                            padding: '1.4cm 1.9cm 1.7cm',
                        }}
                    >
                        {/* Content area matching overflow page layout */}
                        <div 
                            className="overflow-features-list"
                            style={{ 
                                width: `${containerWidthPx}px`,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px', // Matches CSS
                            }}
                        >
                            {features.map((feature, idx) => (
                                <div
                                    key={`measure-${idx}`}
                                    ref={(node) => setMeasurementRef(idx, node)}
                                    className="overflow-feature-item"
                                    style={{
                                        padding: '10px 14px',
                                        background: 'rgba(255, 255, 255, 0.5)',
                                        borderLeft: '3px solid #58180D',
                                        borderRadius: '0 4px 4px 0',
                                    }}
                                >
                                    <h3 
                                        className="overflow-feature-name"
                                        style={{
                                            fontFamily: "'ScalySansRemake', 'Scaly Sans Remake', sans-serif",
                                            fontSize: '0.85rem',
                                            fontWeight: 700,
                                            color: '#58180D',
                                            margin: '0 0 3px 0',
                                        }}
                                    >
                                        {feature.name}
                                    </h3>
                                    <p 
                                        className="overflow-feature-description"
                                        style={{
                                            fontFamily: "'BookInsanityRemake', 'Book Insanity Remake', serif",
                                            fontSize: '0.8rem',
                                            lineHeight: 1.4,
                                            color: '#2b1d0f',
                                            margin: 0,
                                        }}
                                    >
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );

            return createPortal(portalContent, portalNodeRef.current);
        };
        
        return PortalComponent;
    }, [enabled, features, containerWidthPx, setMeasurementRef]);

    return {
        measurements,
        isMeasuring,
        MeasurementPortal,
    };
};

export default useFeaturesMeasurement;

