import React, { useCallback, useEffect, useRef } from 'react';

import type { MeasurementEntry, MeasurementRecord } from './types';
import { MEASUREMENT_THROTTLE_MS, regionKey } from './utils';

/**
 * Measurement semantics
 *
 * Each entry in the measurement layer renders the full component at its canonical scale inside an
 * offscreen wrapper. We measure `node.getBoundingClientRect().height`, which returns the distance in
 * CSS pixels from the top border edge to the bottom border edge of the component’s margin box within
 * the measurement layer. Because the layer sits at the origin (0,0) and is not transformed, the
 * rect’s `height` corresponds to the true block height of the component as if it were placed at
 * (top-left) inside the unscaled statblock column.
 *
 * We do not track the component’s bottom-left absolute coordinates; pagination consumes these
 * heights as scalar magnitudes. The layout engine starts each region at `yOffset = 0` (top of the
 * column) and increments by `estimatedHeight + COMPONENT_VERTICAL_SPACING_PX` after placing each
 * component. This matches the top-down flow we get by measuring from the top-left reference frame.
 */
const shouldLogMeasurements = process.env.NODE_ENV !== 'production';
const MEASUREMENT_EPSILON = 0.25;

type MeasurementDispatcher = (updates: MeasurementRecord[]) => void;

/**
 * Extended measurement record that can signal deletion.
 * When deleted=true, the reducer should remove the measurement key entirely.
 */
interface InternalMeasurementRecord extends MeasurementRecord {
    deleted?: boolean;
}

const scheduleFlush = (
    flush: () => void,
    idleHandle: React.MutableRefObject<number | null>
) => {
    if (typeof window === 'undefined') {
        idleHandle.current = setTimeout(() => {
            idleHandle.current = null;
            flush();
        }, MEASUREMENT_THROTTLE_MS) as unknown as number;
        return;
    }

    if (typeof window.requestIdleCallback === 'function') {
        idleHandle.current = window.requestIdleCallback(() => {
            idleHandle.current = null;
            flush();
        });
        return;
    }

    idleHandle.current = window.setTimeout(() => {
        idleHandle.current = null;
        flush();
    }, MEASUREMENT_THROTTLE_MS);
};

export const useIdleMeasurementDispatcher = (
    dispatch: (entries: MeasurementRecord[]) => void
): ((key: string, height: number | null) => void) => {
    const pending = useRef(new Map<string, InternalMeasurementRecord>());
    const idleHandle = useRef<number | null>(null);

    const flush = useCallback(() => {
        if (pending.current.size === 0) {
            return;
        }
        const entries = Array.from(pending.current.values());
        pending.current.clear();

        // Filter and separate deletions from measurements
        const deletions: MeasurementRecord[] = [];
        const measurements: MeasurementRecord[] = [];

        entries.forEach((entry) => {
            if (entry.deleted) {
                deletions.push({ key: entry.key, height: 0, measuredAt: entry.measuredAt });
            } else if (entry.height > MEASUREMENT_EPSILON) {
                measurements.push(entry);
            }
        });

        const combined = [...deletions, ...measurements];
        if (combined.length === 0) {
            return;
        }

        if (shouldLogMeasurements) {
            // eslint-disable-next-line no-console
            console.debug('[measurement-flush]', {
                deletions: deletions.map(({ key }) => key),
                measurements: measurements.map(({ key, height }) => ({ key, height })),
            });
        }
        dispatch(combined);
    }, [dispatch]);

    return useCallback(
        (key: string, height: number | null) => {
            const measuredAt = Date.now();

            // null height signals deletion
            if (height === null || height <= 0) {
                pending.current.set(key, { key, height: 0, measuredAt, deleted: true });
            } else {
                const previous = pending.current.get(key);
                if (previous && !previous.deleted && Math.abs(previous.height - height) < MEASUREMENT_EPSILON) {
                    return;
                }
                pending.current.set(key, { key, height, measuredAt, deleted: false });
            }

            if (idleHandle.current != null) {
                return;
            }

            scheduleFlush(() => {
                flush();
            }, idleHandle);
        },
        [flush]
    );
};

/**
 * Encapsulates DOM observation for a single measurement entry.
 * Manages ResizeObserver, requestAnimationFrame, and image load listeners.
 */
class MeasurementObserver {
    private observer: ResizeObserver | null = null;
    private rafHandle: number | null = null;
    private imageCleanup: (() => void) | null = null;
    private hasLogged = false; // Track if we've logged this component

    constructor(
        private key: string,
        private node: HTMLDivElement,
        private onMeasure: (key: string, height: number) => void
    ) { }

    attach(): void {
        this.measure();
        this.attachImageListeners();
        this.attachResizeObserver();
    }

    detach(): void {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        if (this.rafHandle !== null) {
            if (typeof cancelAnimationFrame === 'function') {
                cancelAnimationFrame(this.rafHandle);
            }
            this.rafHandle = null;
        }

        if (this.imageCleanup) {
            this.imageCleanup();
            this.imageCleanup = null;
        }
    }

    private measure = (): void => {
        const rect = this.node.getBoundingClientRect();
        const height = rect.height > 0 ? rect.height : 0;

        if (process.env.NODE_ENV !== 'production') {
            const componentId = this.key.split(':')[0];
            const REASONABLE_MAX = 4000; // ~4x page height - spellcasting blocks can be large
            const isAbnormal = height > REASONABLE_MAX;

            // Only log component-8 and component-10 ONCE
            const isTargetComponent = componentId === 'component-8' || componentId === 'component-10';
            const shouldLog = isTargetComponent && !this.hasLogged;

            if (shouldLog) {
                this.hasLogged = true;
                const computed = window.getComputedStyle(this.node);
                const parentComputed = this.node.parentElement ? window.getComputedStyle(this.node.parentElement) : null;

                console.warn(`🎯 [MeasurementObserver] ${componentId} MEASURED:`, {
                    key: this.key,
                    boundingHeight: rect.height,
                    scrollHeight: this.node.scrollHeight,
                    offsetHeight: this.node.offsetHeight,
                    clientHeight: this.node.clientHeight,
                    mismatch: Math.abs(rect.height - this.node.scrollHeight),
                    usingHeight: height,
                    isConstrained: rect.height < this.node.scrollHeight,
                    isAbnormal,
                    childCount: this.node.children.length,
                    computedStyle: {
                        height: computed.height,
                        minHeight: computed.minHeight,
                        maxHeight: computed.maxHeight,
                        display: computed.display,
                        flexGrow: computed.flexGrow,
                        flexShrink: computed.flexShrink,
                        position: computed.position,
                    },
                    parentStyle: parentComputed ? {
                        display: parentComputed.display,
                        height: parentComputed.height,
                        flexDirection: parentComputed.flexDirection,
                    } : null,
                });
            }

            // Warn about abnormal measurements with detailed diagnostics (not applicable for our targeted logging)
            if (isAbnormal && !isTargetComponent) {
                const computed = window.getComputedStyle(this.node);
                console.warn('[MeasurementObserver] ⚠️ ABNORMAL HEIGHT DETECTED:', {
                    key: this.key,
                    height,
                    scrollHeight: this.node.scrollHeight,
                    offsetHeight: this.node.offsetHeight,
                    reason: 'Component expanding beyond reasonable bounds',
                    likelyCauses: {
                        hasHeightPercent: computed.height.includes('%'),
                        hasFlexGrow: computed.flexGrow !== '0',
                        parentIsFlexColumn: this.node.parentElement &&
                            window.getComputedStyle(this.node.parentElement).flexDirection === 'column',
                        childrenCount: this.node.children.length,
                    },
                    suggestion: 'Check component CSS for height: 100% or flex-grow issues',
                });
            }
        }

        this.onMeasure(this.key, height);
    };

    private attachResizeObserver(): void {
        if (typeof window === 'undefined' || typeof window.ResizeObserver !== 'function') {
            return;
        }

        this.observer = new window.ResizeObserver(() => {
            this.scheduleRAF();
        });
        this.observer.observe(this.node);
    }

    private attachImageListeners(): void {
        const images = Array.from(this.node.querySelectorAll('img'));
        if (images.length === 0) {
            return;
        }

        const handleImageEvent = () => {
            this.scheduleRAF();
        };

        images.forEach((img) => {
            img.addEventListener('load', handleImageEvent);
            img.addEventListener('error', handleImageEvent);
            if (img.complete && img.naturalHeight > 0) {
                handleImageEvent();
            }
        });

        this.imageCleanup = () => {
            images.forEach((img) => {
                img.removeEventListener('load', handleImageEvent);
                img.removeEventListener('error', handleImageEvent);
            });
        };
    }

    private scheduleRAF(): void {
        if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
            setTimeout(() => {
                this.measure();
            }, MEASUREMENT_THROTTLE_MS);
            return;
        }

        if (this.rafHandle !== null) {
            return; // Already scheduled
        }

        this.rafHandle = window.requestAnimationFrame(() => {
            this.rafHandle = null;
            this.measure();
        });
    }
}

export const createMeasurementEntry = (overrides: Partial<MeasurementEntry> = {}): MeasurementEntry => ({
    instance: {
        id: 'mock-component',
        type: 'trait-list',
        dataRef: { type: 'statblock', path: 'specialAbilities' },
        layout: { isVisible: true },
    } as MeasurementEntry['instance'],
    slotIndex: 0,
    orderIndex: 0,
    sourceRegionKey: '1:1',
    region: { page: 1, column: 1 },
    homeRegion: { page: 1, column: 1 },
    homeRegionKey: regionKey(1, 1),
    estimatedHeight: 100,
    measurementKey: 'mock-component:block',
    needsMeasurement: true,
    ...overrides,
});

interface MeasurementLayerProps {
    entries: MeasurementEntry[];
    renderComponent: (entry: MeasurementEntry) => React.ReactNode;
    onMeasurements: MeasurementDispatcher;
}

export const MeasurementLayer: React.FC<MeasurementLayerProps> = ({ entries, renderComponent, onMeasurements }) => {
    const dispatcher = useIdleMeasurementDispatcher((updates) => {
        onMeasurements(updates);
    });

    const observers = useRef(new Map<string, MeasurementObserver>());

    // DEBUG: Log ALL measurement entry keys to see what we have
    const loggedRef = useRef(false);
    if (process.env.NODE_ENV !== 'production' && !loggedRef.current) {
        loggedRef.current = true;
        console.warn('=== ALL MEASUREMENT ENTRIES ===');
        console.warn('Total entries:', entries.length);
        console.warn('Entry keys:', entries.map(e => e.measurementKey));

        const component8 = entries.filter(e => e.measurementKey.startsWith('component-8'));
        const component10 = entries.filter(e => e.measurementKey.startsWith('component-10'));

        console.warn('Component-8 count:', component8.length, 'keys:', component8.map(e => e.measurementKey));
        console.warn('Component-10 count:', component10.length, 'keys:', component10.map(e => e.measurementKey));
    }

    const handleRef = useCallback(
        (entry: MeasurementEntry) => (node: HTMLDivElement | null) => {
            const key = entry.measurementKey;
            const existingObserver = observers.current.get(key);

            if (!node) {
                // Only signal deletion if there was actually an observer to remove
                // This prevents false deletions when entry objects are recreated with same keys
                if (existingObserver) {
                    existingObserver.detach();
                    observers.current.delete(key);
                    dispatcher(key, null);
                }
                return;
            }

            // Reuse existing observer if one exists for this key
            // This prevents unnecessary detach/reattach cycles when entry objects are recreated
            if (existingObserver) {
                return;
            }

            const observer = new MeasurementObserver(key, node, dispatcher);
            observer.attach();
            observers.current.set(key, observer);
        },
        [dispatcher]
    );

    useEffect(() => () => {
        observers.current.forEach((observer) => {
            observer.detach();
        });
        observers.current.clear();
    }, []);

    return (
        <>
            {entries.map((entry) => {
                // Debug component-12 wrapper specifically
                const isComponent12 = entry.measurementKey.startsWith('component-12');
                if (process.env.NODE_ENV !== 'production' && isComponent12) {
                    console.debug('[MeasurementLayer] Rendering component-12 wrapper:', {
                        measurementKey: entry.measurementKey,
                        slotDimensions: entry.slotDimensions,
                        estimatedHeight: entry.estimatedHeight,
                        instanceType: entry.instance.type,
                    });
                }

                return (
                    <div
                        key={entry.measurementKey}
                        ref={handleRef(entry)}
                        className="dm-measurement-entry"
                        data-measurement-key={entry.measurementKey}
                        style={{
                            // CRITICAL: Render in flex context to match visible layout
                            // Parent container is already positioned offscreen, so no need for absolute positioning
                            // Let column width naturally constrain - DO NOT use template slotDimensions.widthPx
                            // as it may not match actual rendered column width, causing incorrect text wrapping
                            width: 'auto',
                            // Natural height - let content determine height
                            // Infinite expansion is detected via computed style checks (flexGrow, height: 100%)
                            height: 'auto',
                            minHeight: 0,
                            // Prevent flex/grid expansion
                            flexShrink: 0,
                            flexGrow: 0,
                            overflow: 'hidden', // Prevent visual bleed during measurement
                            transform: 'none',
                        }}
                    >
                        {renderComponent(entry)}
                    </div>
                );
            })}
        </>
    );
};


