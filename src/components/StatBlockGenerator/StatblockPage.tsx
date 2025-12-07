import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type {
    CanvasComponentProps,
    ComponentRegistryEntry,
    PageVariables,
    StatblockPageDocument,
    TemplateConfig,
} from '../../types/statblockCanvas.types';
import type { StatBlockDetails } from '../../types/statblock.types';
import { DND_CSS_BASE_URL } from '../../config';
import { usePHBTheme } from '../../hooks/useTheme';
import '../../styles/canvas/index.css';         // Shared canvas styles
import '../../styles/StatblockComponents.css';  // StatBlock-specific styles
import type {
    CanvasLayoutEntry,
    BasePageDimensions,
    MeasurementEntry,
    MeasurementRecord,
    CanvasConfig,
    FrameConfig,
} from 'dungeonmind-canvas';
import { CanvasLayoutProvider } from 'dungeonmind-canvas';
import { useCanvasLayout } from 'dungeonmind-canvas';
import { CanvasPage } from 'dungeonmind-canvas';
import { MeasurementCoordinator, MeasurementPortal } from 'dungeonmind-canvas';
import { COMPONENT_VERTICAL_SPACING_PX, isComponentDebugEnabled, isRegionHeightDebugEnabled } from 'dungeonmind-canvas';
import { createStatblockAdapters } from './canvasAdapters';
import {
    REGION_HEIGHT_MIN_ABS_DIFF_PX,
    shouldSkipRegionHeightUpdate,
} from './regionHeightUtils';

/**
 * PHB Theme Frame Configuration.
 * These values describe the CSS dimensions of the PHB theme containers.
 * Canvas uses these to calculate accurate dimensions without consumer calculations.
 */
const PHB_FRAME_CONFIG: FrameConfig = {
    verticalBorderPx: 12.5,       // CSS: border: 6.25px 5px (top + bottom = 12.5px)
    horizontalBorderPx: 10,       // CSS: border: 6.25px 5px (left + right = 10px)
    columnPaddingPx: 10,          // CSS: padding: 8px 5px (left + right = 10px)
    columnVerticalPaddingPx: 16,  // CSS: padding: 8px 5px (top + bottom = 16px)
    componentGapPx: 12,           // CSS: gap: 12px
    pageFontSizePx: 12.8504,      // .page.phb computed font-size
    frameFontSizePx: 12.0189,     // .monster.frame computed font-size
};

interface StatblockPageProps {
    page: StatblockPageDocument;
    template: TemplateConfig;
    componentRegistry: Record<string, ComponentRegistryEntry>;
    isEditMode?: boolean;
    onUpdateData?: (updates: Partial<import('../../types/statblock.types').StatBlockDetails>) => void;
    measurementCoordinator?: MeasurementCoordinator; // Phase 1: Optional coordinator for dynamic locking
}

const MIN_SCALE = 0.35;
const MAX_SCALE = 2.5;
const PAGE_GAP_PX = 48;
const FALLBACK_MARGIN_MM = 10;
const MM_TO_PX = 96 / 25.4;
const PX_PER_INCH = 96;
const MM_PER_INCH = 25.4;

type LengthUnit = 'px' | 'mm' | 'in';

const convertToPixels = (value: number, unit: LengthUnit): number => {
    if (unit === 'px') {
        return value;
    }
    if (unit === 'in') {
        return value * PX_PER_INCH;
    }
    return (value / MM_PER_INCH) * PX_PER_INCH;
};

const resolveColumnGapPx = (columns: PageVariables['columns']): number => {
    if (!columns) {
        return COMPONENT_VERTICAL_SPACING_PX;
    }
    const { gutter, unit } = columns;
    if (typeof gutter !== 'number' || Number.isNaN(gutter)) {
        return COMPONENT_VERTICAL_SPACING_PX;
    }
    return convertToPixels(gutter, unit);
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const renderEntry = (
    entry: CanvasLayoutEntry,
    registry: Record<string, ComponentRegistryEntry>,
    props: Omit<CanvasComponentProps, 'id' | 'dataRef' | 'layout'>,
    isEditMode?: boolean,
    onUpdateData?: (updates: Partial<StatBlockDetails>) => void
) => {
    const registryEntry = registry[entry.instance.type];
    if (!registryEntry) {
        return null;
    }

    const Component = registryEntry.component;
    const region = entry.region
        ? {
            ...entry.region,
            index: entry.region.index ?? 0,
        }
        : undefined;

    const onUpdateDataProp: CanvasComponentProps['onUpdateData'] = onUpdateData
        ? ((updates) => {
            onUpdateData(updates as Partial<StatBlockDetails>);
        })
        : undefined;

    return (
        <Component
            id={entry.instance.id}
            dataRef={entry.instance.dataRef}
            variables={entry.instance.variables}
            layout={entry.instance.layout}
            region={region}
            regionContent={entry.regionContent as any}
            regionOverflow={Boolean(entry.overflow)}
            isEditMode={isEditMode}
            onUpdateData={onUpdateDataProp}
            {...props}
        />
    );
};

const isSpellcastingMeasurementKey = (key: string): boolean =>
    key.includes('spellcasting-block') ||
    key.includes(':spell-list');

// Check if component-12 (spellcasting) is in debug set via CLI/env vars
const isSpellcastingDebugEnabled = (): boolean => isComponentDebugEnabled('component-12');

const SPELLCASTING_HEIGHT_EPSILON = 0.5;
const SPELLCASTING_HEIGHT_LOG_COOLDOWN_MS = 1500;

const isSpellcastingVerboseLoggingEnabled = (): boolean =>
    typeof window !== 'undefined' && Boolean((window as any).__SPELLCASTING_LOG_VERBOSE__);

const StatblockCanvasInner: React.FC<StatblockPageProps> = ({ page, template, componentRegistry, isEditMode, onUpdateData, measurementCoordinator }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    // FIXED: Track last sent height to prevent redundant setRegionHeight calls
    // This ref persists across effect re-runs, preventing excessive state updates
    const lastSentHeightRef = useRef<number>(0);
    const [scale, setScale] = useState(1);
    const [fontsReady, setFontsReady] = useState(false);

    // Load theme CSS early so we can pass ready signal to Canvas
    const { isLoaded: themeLoaded, error: themeError } = usePHBTheme(DND_CSS_BASE_URL, {
        debug: process.env.NODE_ENV !== 'production',
    });
    // Phase 5: Always use canonical height - no live DOM measurement feedback loops
    const forceCanonicalHeight = true;
    const REGION_HEIGHT_HOLD_TIMEOUT_MS = 400;
    const [regionHeightHoldActive, setRegionHeightHoldActive] = useState(true);
    const regionHeightHoldTimerRef = useRef<number | null>(null);
    const pendingRegionHeightRef = useRef<number | null>(null);
    const pendingRegionLatestHeightRef = useRef<number | null>(null);
    const previousMeasurementStatusRef = useRef<string | undefined>(undefined);
    // Track if we've completed at least one measurement cycle to distinguish fresh mount from refresh
    const hasCompletedMeasurementCycleRef = useRef(false);

    const logRegionHeightMeasurement = useCallback(
        (event: string, payload: Record<string, unknown>) => {
            if (!isRegionHeightDebugEnabled()) {
                return;
            }
            console.log('📊 [RegionHeight]', event, {
                component: 'StatblockPage',
                timestamp: new Date().toISOString(),
                ...payload,
            });
        },
        []
    );

    // No storage syncing in spike branch; canonical-only mode remains enabled

    const clearRegionHeightHoldTimer = useCallback(() => {
        if (regionHeightHoldTimerRef.current != null) {
            window.clearTimeout(regionHeightHoldTimerRef.current);
            regionHeightHoldTimerRef.current = null;
        }
    }, []);

    const activateRegionHeightHold = useCallback(
        (reason: string) => {
            clearRegionHeightHoldTimer();
            setRegionHeightHoldActive((prev) => {
                if (!prev && process.env.NODE_ENV !== 'production') {
                    console.log('🔒 [StatblockPage] Region height hold activated', { reason });
                }
                return true;
            });
        },
        [clearRegionHeightHoldTimer]
    );

    const releaseRegionHeightHold = useCallback(
        (reason: string) => {
            clearRegionHeightHoldTimer();
            setRegionHeightHoldActive((prev) => {
                if (!prev) {
                    return prev;
                }
                if (process.env.NODE_ENV !== 'production') {
                    console.log('🔓 [StatblockPage] Region height hold released', { reason });
                }
                return false;
            });
        },
        [clearRegionHeightHoldTimer]
    );

    // Create statblock adapters (memoized)
    const adapters = useMemo(() => createStatblockAdapters(), []);

    // Wait for custom fonts to load before measuring
    useLayoutEffect(() => {
        if (typeof document === 'undefined' || !document.fonts) {
            // No Font Loading API, assume ready
            setFontsReady(true);
            return;
        }

        const checkFonts = async () => {
            try {
                // Wait for the D&D fonts used in statblocks
                await Promise.all([
                    document.fonts.load('700 24px NodestoCapsCondensed'),
                    document.fonts.load('400 14px ScalySansRemake'),
                    document.fonts.load('700 14px ScalySansRemake'),
                ]);

                // CRITICAL: On refresh, fonts may be cached and load() resolves immediately,
                // but the DOM might not have applied them yet. Wait for fonts.ready to ensure
                // fonts are actually rendered, not just loaded.
                await document.fonts.ready;

                // Additional safety: Small delay to ensure measurement layer DOM has applied fonts
                // This prevents race condition where fonts are loaded but not yet rendered
                await new Promise(resolve => {
                    // Use requestAnimationFrame to wait for next paint cycle
                    requestAnimationFrame(() => {
                        requestAnimationFrame(resolve);
                    });
                });

                setFontsReady(true);
            } catch (error) {
                console.warn('[StatblockPage] Font loading failed:', error);
                setFontsReady(true); // Proceed even if font loading fails
            }
        };

        checkFonts();
    }, []);

    const pageVariablesWithMargins = useMemo(() => ({
        ...page.pageVariables,
        margins: {
            ...page.pageVariables.margins,
            topMm: page.pageVariables.margins?.topMm ?? FALLBACK_MARGIN_MM,
            bottomMm: page.pageVariables.margins?.bottomMm ?? FALLBACK_MARGIN_MM,
            leftMm: page.pageVariables.margins?.leftMm ?? FALLBACK_MARGIN_MM,
            rightMm: page.pageVariables.margins?.rightMm ?? FALLBACK_MARGIN_MM,
        },
    }), [page.pageVariables]);

    // Phase 5: Create unified Canvas config
    // Consumer provides config, Canvas calculates all dimensions internally
    const canvasConfig = useMemo<CanvasConfig>(() => ({
        pageVariables: pageVariablesWithMargins,
        frameConfig: PHB_FRAME_CONFIG,
        ready: fontsReady && themeLoaded,
    }), [pageVariablesWithMargins, fontsReady, themeLoaded]);

    const layout = useCanvasLayout({
        // Phase 5: Use new config API - Canvas owns all dimension calculations
        // Type assertions needed until Canvas package is rebuilt with 'character' type support
        // The Canvas source (Canvas/src/types/canvas.types.ts) has 'character', but dist/ doesn't yet
        componentInstances: page.componentInstances as any,
        template: template as any,
        dataSources: page.dataSources ?? [],
        componentRegistry: componentRegistry as any,
        config: canvasConfig,
        adapters,
    });

    useEffect(() => {
        if (previousMeasurementStatusRef.current === layout.measurementStatus) {
            return;
        }
        if (process.env.NODE_ENV !== 'production') {
            console.log('🛰️ [StatblockPage] measurementStatus transition', {
                previousStatus: previousMeasurementStatusRef.current ?? 'none',
                nextStatus: layout.measurementStatus ?? 'undefined',
            });
        }
        previousMeasurementStatusRef.current = layout.measurementStatus;
    }, [layout.measurementStatus]);

    // Debug: Log layout state
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production' && layout.plan) {
            console.log('[StatblockPage] Layout state:', {
                fontsReady,
                themeLoaded,
                componentCount: page.componentInstances.length,
                layoutPlanExists: !!layout.plan,
                pageCount: layout.plan?.pages.length ?? 0,
                firstPageColumns: layout.plan?.pages[0]?.columns.length ?? 0,
                firstColumnEntries: layout.plan?.pages[0]?.columns[0]?.entries.length ?? 0,
                secondColumnEntries: layout.plan?.pages[0]?.columns[1]?.entries.length ?? 0,
                firstColumnEntryIds: layout.plan?.pages[0]?.columns[0]?.entries.map(e => e.instance.id) ?? [],
                secondColumnEntryIds: layout.plan?.pages[0]?.columns[1]?.entries.map(e => e.instance.id) ?? [],
                baseDimensions: layout.baseDimensions,
            });

            // Log component home regions
            if (page.componentInstances.length > 0) {
                console.log('[StatblockPage] Component home regions:',
                    page.componentInstances.slice(0, 5).map(inst => ({
                        id: inst.id,
                        type: inst.type,
                        slotId: inst.layout.slotId,
                        position: inst.layout.position,
                    }))
                );
            }
        }
    }, [fontsReady, themeLoaded, page.componentInstances.length, layout.plan, layout.baseDimensions]);

    const {
        widthPx: baseWidthPx,
        heightPx: baseHeightPx,
        contentHeightPx: baseContentHeightPx,
        topMarginPx: baseTopMarginPx,
        bottomMarginPx: baseBottomMarginPx,
    }: BasePageDimensions = layout.baseDimensions;

    // Phase 5: Get region height from Canvas-calculated dimensions
    // Canvas now owns this calculation via config.frameConfig.verticalBorderPx
    const canonicalRegionHeightPx = layout.dimensions?.regionHeightPx ?? 0;

    const leftMarginPx = (pageVariablesWithMargins.margins?.leftMm ?? FALLBACK_MARGIN_MM) * MM_TO_PX;
    const rightMarginPx = (pageVariablesWithMargins.margins?.rightMm ?? FALLBACK_MARGIN_MM) * MM_TO_PX;

    const columnConfig = pageVariablesWithMargins.columns;
    const columnCount = columnConfig.columnCount;
    const columnGapPx = useMemo(
        () => resolveColumnGapPx(columnConfig),
        [columnConfig]
    );

    // Phase 5: Get column width from Canvas-calculated dimensions
    // Consumer no longer calculates widths - Canvas owns this via pageVariables + margins
    const canonicalColumnWidthPx = layout.dimensions?.columnWidthPx ?? null;

    useLayoutEffect(() => {
        if (typeof ResizeObserver === 'undefined') {
            console.warn('[StatblockPage] ResizeObserver not available');
            return undefined;
        }

        const node = containerRef.current;
        if (!node || baseWidthPx === 0) {
            return undefined;
        }

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry || entry.contentRect.width === 0) {
                return;
            }

            // Account for container padding (0 1rem = ~16px per side)
            const computedStyle = window.getComputedStyle(node);
            const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
            const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
            const availableWidth = entry.contentRect.width - paddingLeft - paddingRight;

            const widthScale = availableWidth / baseWidthPx;
            const nextScale = clamp(widthScale, MIN_SCALE, MAX_SCALE);

            setScale((current) => (Math.abs(current - nextScale) > 0.01 ? nextScale : current));
        });

        observer.observe(node);
        return () => observer.disconnect();
    }, [baseWidthPx, baseHeightPx, layout.plan?.pages.length]); // Re-run when page count changes
    // Phase 5: Simplified - release hold when fonts and plan are ready
    // Canvas MeasurementPortal handles width synchronization internally
    useEffect(() => {
        if (!fontsReady || !layout.plan) {
            activateRegionHeightHold('awaiting-fonts-or-plan');
            return clearRegionHeightHoldTimer;
        }

        // Fonts and plan ready - release hold after brief timeout for stability
        regionHeightHoldTimerRef.current = window.setTimeout(() => {
            regionHeightHoldTimerRef.current = null;
            releaseRegionHeightHold('fonts-and-plan-ready');
        }, REGION_HEIGHT_HOLD_TIMEOUT_MS);

        return clearRegionHeightHoldTimer;
    }, [
        activateRegionHeightHold,
        clearRegionHeightHoldTimer,
        fontsReady,
        layout.plan,
        releaseRegionHeightHold,
        REGION_HEIGHT_HOLD_TIMEOUT_MS,
    ]);

    useEffect(() => {
        if (layout.hasPendingLayout) {
            return;
        }

        const queuedDrop = pendingRegionHeightRef.current;
        const latestWhilePending = pendingRegionLatestHeightRef.current;
        const deferredHeight = queuedDrop ?? latestWhilePending;

        if (deferredHeight == null) {
            return;
        }

        pendingRegionHeightRef.current = null;
        pendingRegionLatestHeightRef.current = null;

        const heightDiff = Math.abs(deferredHeight - lastSentHeightRef.current);
        const appliedSource = queuedDrop != null ? 'queued-min' : 'latest-pending';

        if (deferredHeight > 0 && heightDiff > 1) {
            if (process.env.NODE_ENV !== 'production') {
                console.log('📏 [StatblockPage] Applying deferred region height after pending layout resolved', {
                    deferredHeight,
                    previousSentHeight: lastSentHeightRef.current,
                    heightDiff: Number(heightDiff.toFixed(2)),
                    appliedSource,
                });
            }
            lastSentHeightRef.current = deferredHeight;
            layout.setRegionHeight(deferredHeight);
        } else if (process.env.NODE_ENV !== 'production') {
            console.log('📏 [StatblockPage] Deferred region height within noise, skipping apply', {
                deferredHeight,
                previousSentHeight: lastSentHeightRef.current,
                heightDiff: Number(heightDiff.toFixed(2)),
                appliedSource,
            });
        }
    }, [layout.hasPendingLayout, layout.setRegionHeight]);

    // Measure the VISIBLE monster frame (not the measurement layer) for accurate pagination
    useLayoutEffect(() => {
        // Wait for layout to render before measuring
        if (!layout.plan || layout.plan.pages.length === 0) {
            return undefined;
        }

        if (typeof ResizeObserver === 'undefined') {
            return undefined;
        }

        const container = containerRef.current;
        if (!container) {
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.warn('[StatblockPage] containerRef.current is null');
            }
            return undefined;
        }

        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.debug('[StatblockPage] Container found, searching for monster frame...', {
                canvasRenderer: container.querySelector('.dm-canvas-renderer'),
                allMonsterFrames: container.querySelectorAll('.monster.frame.wide').length,
            });
        }

        // Query for the visible monster frame (NOT in the measurement layer)
        // Use a more specific selector to avoid the measurement layer
        const visibleFrame = container.querySelector('.dm-canvas-renderer .dm-canvas-pages .monster.frame.wide');
        if (!visibleFrame) {
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.warn('[StatblockPage] Could not find visible monster frame for measurement', {
                    containerClassName: container.className,
                    hasCanvasRenderer: !!container.querySelector('.dm-canvas-renderer'),
                    hasPages: !!container.querySelector('.dm-canvas-renderer .dm-canvas-pages'),
                    hasAnyMonsterFrame: !!container.querySelector('.monster.frame.wide'),
                });
            }
            return undefined;
        }

        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.debug('[StatblockPage] Found visible monster frame:', {
                className: visibleFrame.className,
                parentClassName: visibleFrame.parentElement?.className,
            });
        }

        // Phase 5: Width lock removed - Canvas MeasurementPortal uses canonical widths directly
        // No need to compare visible column width to canonical anymore

        const updateRegionHeight = () => {
            // Measure the COLUMN, not the frame
            const column = visibleFrame.querySelector('.canvas-column');
            if (!column) {
                return;
            }

            const applyRegionHeightTarget = (
                targetHeight: number,
                mode: 'measurement' | 'canonical',
                metadata: {
                    measurementSource: string;
                    fullColumnHeight?: number;
                    usableHeight?: number;
                    heightCeiling?: number;
                    scaleSnapshot?: number;
                }
            ) => {
                const previousSentHeight = lastSentHeightRef.current;
                const heightDiff = Math.abs(targetHeight - previousSentHeight);
                const isHeightDecrease =
                    previousSentHeight > 0 &&
                    targetHeight < previousSentHeight - REGION_HEIGHT_MIN_ABS_DIFF_PX;
                const skipForNoise = shouldSkipRegionHeightUpdate(previousSentHeight, targetHeight);
                const logBase = {
                    targetHeight,
                    measurementSource: metadata.measurementSource,
                    fullColumnHeight: metadata.fullColumnHeight,
                    usableHeight: metadata.usableHeight,
                    heightCeiling: metadata.heightCeiling,
                    scale: metadata.scaleSnapshot ?? scale,
                    previousSentHeight,
                    heightDiff: Number(heightDiff.toFixed(2)),
                    layoutHasPending: layout.hasPendingLayout,
                    fontsReady,
                    holdActive: regionHeightHoldActive,
                    // Phase 5: Width lock removed - Canvas owns widths
                    pendingQueuedHeight: pendingRegionHeightRef.current,
                    pendingLatestMeasurement: pendingRegionLatestHeightRef.current,
                    forceCanonicalHeight,
                };
                const readyEvent = mode === 'canonical' ? 'canonical-target-ready' : 'measurement-ready';
                logRegionHeightMeasurement(readyEvent, logBase);

                if (skipForNoise) {
                    const noiseEvent = mode === 'canonical' ? 'canonical-skipped-noise' : 'measurement-skipped-noise';
                    logRegionHeightMeasurement(noiseEvent, logBase);
                    if (process.env.NODE_ENV !== 'production') {
                        console.log('📏 [StatblockPage] Skipping region height update (within noise band)', {
                            mode,
                            ...logBase,
                        });
                    }
                    return;
                }

                if (layout.hasPendingLayout) {
                    pendingRegionLatestHeightRef.current = targetHeight;

                    if (isHeightDecrease) {
                        const previousQueuedHeight = pendingRegionHeightRef.current;
                        const nextQueuedHeight =
                            previousQueuedHeight == null
                                ? targetHeight
                                : Math.min(previousQueuedHeight, targetHeight);
                        pendingRegionHeightRef.current = nextQueuedHeight;

                        if (process.env.NODE_ENV !== 'production') {
                            console.log('📏 [StatblockPage] Deferred region height update (pending layout in progress)', {
                                queuedHeight: nextQueuedHeight,
                                previousQueuedHeight,
                                incomingMeasurement: targetHeight,
                                previousSentHeight,
                                heightDiff: Number(heightDiff.toFixed(2)),
                                measurementSource: metadata.measurementSource,
                                mode,
                            });
                        }
                        logRegionHeightMeasurement(mode === 'canonical' ? 'canonical-deferred' : 'measurement-deferred', {
                            ...logBase,
                            queuedHeight: nextQueuedHeight,
                            previousQueuedHeight,
                            reason: 'height-decrease-while-pending',
                        });
                    } else {
                        if (process.env.NODE_ENV !== 'production') {
                            console.log('📏 [StatblockPage] Pending layout active, captured measurement without update', {
                                incomingHeight: targetHeight,
                                previousSentHeight,
                                heightDiff: Number(heightDiff.toFixed(2)),
                                measurementSource: metadata.measurementSource,
                                mode,
                            });
                        }
                        logRegionHeightMeasurement('measurement-captured-during-pending-layout', {
                            ...logBase,
                            reason: 'layout-pending',
                        });
                    }
                    return;
                }

                if (targetHeight > 0 && !skipForNoise) {
                    pendingRegionHeightRef.current = null;
                    pendingRegionLatestHeightRef.current = null;
                    lastSentHeightRef.current = targetHeight;
                    const sentEvent = mode === 'canonical' ? 'canonical-sent' : 'measurement-sent';
                    logRegionHeightMeasurement(sentEvent, logBase);
                    if (process.env.NODE_ENV !== 'production') {
                        console.log('📏 [StatblockPage] Setting region height', {
                            cappedHeight: targetHeight,
                            usableHeight: metadata.usableHeight ?? targetHeight,
                            fullColumnHeight: metadata.fullColumnHeight ?? targetHeight,
                            measurementSource: metadata.measurementSource,
                            scale: metadata.scaleSnapshot ?? scale,
                            previousSentHeight,
                            heightDiff: Number(heightDiff.toFixed(2)),
                            // Phase 5: Width lock removed
                            holdActive: regionHeightHoldActive,
                            timestamp: Date.now(),
                            mode,
                        });
                    }
                    layout.setRegionHeight(targetHeight);
                }
            };

            const columnRect = column.getBoundingClientRect();
            // Cast to HTMLElement to access scrollHeight, clientHeight, offsetHeight
            const columnElement = column as HTMLElement;
            const columnScrollHeight = columnElement.scrollHeight;
            const columnClientHeight = columnElement.clientHeight;
            const columnOffsetHeight = columnElement.offsetHeight;

            // CRITICAL: Measure the FRAME container (monster.frame.wide), not page.phb or columnWrapper
            // The cursor moves within monster.frame.wide, so regionHeightPx must match that container
            const frameElement = visibleFrame as HTMLElement;
            const frameRect = frameElement.getBoundingClientRect();
            const frameScrollHeight = frameElement.scrollHeight;
            const frameClientHeight = frameElement.clientHeight;
            const frameOffsetHeight = frameElement.offsetHeight;

            // CRITICAL FIX: Measure the AVAILABLE SPACE, not the content height
            // The cursor moves within the column (inside monster.frame.wide), so regionHeightPx must match the AVAILABLE space
            // Priority: columnClientHeight > frameClientHeight > columnScrollHeight (scrollHeight = content height, not available space)
            // DO NOT use parentScrollHeight/parentClientHeight (page.phb/columnWrapper) as they may have different dimensions
            let fullColumnHeight: number;
            let measurementSource: string;

            // Prefer clientHeight (available/visible space) over scrollHeight (total content height)
            // scrollHeight reflects content that's been placed, creating a feedback loop
            // clientHeight reflects the actual available space for placing content
            if (columnClientHeight > 0) {
                fullColumnHeight = columnClientHeight;
                measurementSource = 'columnClientHeight';
            } else if (frameClientHeight > 0) {
                fullColumnHeight = frameClientHeight;
                measurementSource = 'frameClientHeight';
            } else if (columnScrollHeight > 0) {
                // Fallback to scrollHeight if clientHeight not available (less ideal, reflects content not space)
                fullColumnHeight = columnScrollHeight;
                measurementSource = 'columnScrollHeight-fallback';
            } else if (frameScrollHeight > 0) {
                // Fallback to frame scrollHeight (frame may include padding, less accurate)
                fullColumnHeight = frameScrollHeight;
                measurementSource = 'frameScrollHeight-fallback';
            } else {
                // Fallback to largest available measurement from column/frame only
                // DO NOT include parent measurements (page.phb/columnWrapper)
                const measurements = [
                    columnClientHeight,
                    columnOffsetHeight,
                    columnRect.height,
                    frameClientHeight,
                    frameOffsetHeight,
                    frameRect.height,
                    columnScrollHeight,
                    frameScrollHeight,
                ].filter(h => h > 0);

                fullColumnHeight = measurements.length > 0 ? Math.max(...measurements) : canonicalRegionHeightPx;
                measurementSource = measurements.length > 0 ? 'Math.max(fallback-column-frame)' : 'canonical-fallback';
            }

            // If forceCanonicalHeight is enabled, ALWAYS use canonical height (fixed, stable, no feedback loop)
            // CRITICAL: Measuring column/frame creates feedback loops because:
            // - columnClientHeight is viewport-dependent (changes with zoom/scale)
            // - columnScrollHeight reflects content that's been placed (creates oscillation)
            // - frame measurements may include padding/margins that vary
            // Canonical height is the fixed, predetermined page content height that doesn't change
            if (forceCanonicalHeight && canonicalRegionHeightPx > 0) {
                // Log measurement for debugging, but don't use it (prevents feedback loop)
                const measuredHeightPx = fullColumnHeight / scale;
                const heightDiff = Math.abs(measuredHeightPx - canonicalRegionHeightPx);
                if (heightDiff > 10 && process.env.NODE_ENV !== 'production') {
                    console.warn('📏 [StatblockPage] Canonical height differs from measurement (using canonical)', {
                        canonicalHeight: canonicalRegionHeightPx,
                        measuredHeight: measuredHeightPx,
                        heightDiff: Number(heightDiff.toFixed(2)),
                        measurementSource,
                        scale,
                        note: 'Using canonical height to prevent feedback loop - measurement ignored',
                    });
                }
                // Always use canonical height (prevents feedback loops from live DOM measurement)
                applyRegionHeightTarget(canonicalRegionHeightPx, 'canonical', {
                    measurementSource: 'canonical-base-content',
                    fullColumnHeight: canonicalRegionHeightPx,
                    usableHeight: canonicalRegionHeightPx,
                    heightCeiling: canonicalRegionHeightPx,
                    scaleSnapshot: scale,
                });
            }
        };

        const observer = new ResizeObserver(() => {
            updateRegionHeight();
        });

        observer.observe(visibleFrame);
        // Measure immediately
        updateRegionHeight();

        return () => observer.disconnect();
    }, [
        layout.setRegionHeight,
        layout.plan,
        baseContentHeightPx,
        canonicalRegionHeightPx,
        scale,
        canonicalColumnWidthPx,
        regionHeightHoldActive,
        layout.hasPendingLayout,
        forceCanonicalHeight,
        activateRegionHeightHold,
        releaseRegionHeightHold,
    ]); // Re-measure when layout plan or canonical height mode changes

    const spellcastingMeasurementLogRef = React.useRef(
        new Map<string, { height: number; loggedAt: number }>()
    );

    const measurementStatus = layout.measurementStatus ?? 'idle';
    const measurementEntryCount = layout.measurementEntries.length;
    const planPageCount = layout.plan?.pages.length ?? 0;

    // Track completion of first measurement cycle to distinguish fresh mount from refresh
    useEffect(() => {
        if (measurementStatus === 'complete' && !hasCompletedMeasurementCycleRef.current) {
            hasCompletedMeasurementCycleRef.current = true;
            if (process.env.NODE_ENV !== 'production') {
                console.log('📏 [StatblockPage] First measurement cycle completed', {
                    planPageCount,
                    measurementEntryCount,
                });
            }
        }
    }, [measurementStatus, planPageCount, measurementEntryCount]);

    // Reset on mount/remount (handles refresh case)
    // This ensures each mount/refresh is treated as fresh until first measurement completes
    useEffect(() => {
        hasCompletedMeasurementCycleRef.current = false;
        // Capture values at mount time for logging (don't add to deps to keep this mount-only)
        const mountTimeComponentCount = page.componentInstances.length;
        const mountTimePlanPageCount = layout.plan?.pages.length ?? 0;
        const mountTimeHasComponentsButNoPlan = mountTimeComponentCount > 0 && mountTimePlanPageCount === 0;
        const mountTimeIsLikelyRefresh = fontsReady && mountTimeHasComponentsButNoPlan;

        if (process.env.NODE_ENV !== 'production') {
            console.log('📏 [StatblockPage] Mount/refresh detected, resetting measurement cycle tracking', {
                planPageCount: mountTimePlanPageCount,
                measurementEntryCount: layout.measurementEntries.length,
                componentCount: mountTimeComponentCount,
                fontsReady,
                hasComponentsButNoPlan: mountTimeHasComponentsButNoPlan,
                isLikelyRefresh: mountTimeIsLikelyRefresh,
                // Phase 5: Width lock removed - Canvas owns widths
            });
        }
        return () => {
            // On unmount, reset so next mount is treated as fresh
            hasCompletedMeasurementCycleRef.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps - only run on mount/unmount

    // Detect refresh vs fresh mount: on refresh, fonts are typically already loaded from cache,
    // components exist, but plan is empty (reset by INITIALIZE). On true fresh mount, fonts load async.
    // Signal: if fonts are ready AND components exist BUT plan is empty AND we haven't completed a cycle,
    // it's likely a refresh scenario - require canonical width to be available (not necessarily locked).
    const isFreshMount = !hasCompletedMeasurementCycleRef.current;
    const componentCount = page.componentInstances.length;
    const hasComponentsButNoPlan = componentCount > 0 && planPageCount === 0 && isFreshMount;
    const isLikelyRefresh = fontsReady && hasComponentsButNoPlan;

    // Allow measurement when:
    // 1. Fonts are ready AND canonical width is available (canonicalColumnWidthPx is not null)
    // 2. OR truly fresh mount (fonts not ready yet, will wait anyway)
    // The measurement layer uses canonicalColumnWidthPx directly, so as long as it's available, measurement is safe.
    // Phase 5: Simplified - measurement is ready when fonts loaded and Canvas has calculated dimensions
    const measurementHostReady = fontsReady && canonicalColumnWidthPx != null;

    const handleMeasurements = React.useCallback(
        (updates: MeasurementRecord[]) => {
            if (!measurementHostReady) {
                const componentCount = page.componentInstances.length;
                const isLikelyRefresh = fontsReady && componentCount > 0 && planPageCount === 0 && !hasCompletedMeasurementCycleRef.current;

                if (process.env.NODE_ENV !== 'production') {
                    console.log('📏 [StatblockPage] Ignoring measurement batch - host not ready', {
                        batchSize: updates.length,
                        measurementStatus,
                        planPageCount,
                        fontsReady,
                        componentCount,
                        isLikelyRefresh,
                    });
                }
                return;
            }

            // REMOVED: Duplicate font check causes race condition
            // MeasurementObserver already verifies fonts before measuring (via verifyWidthAndMeasure)
            // Checking fonts AGAIN here on the DOM causes a timing issue:
            // - Measurements dispatched with correct fonts
            // - Component re-renders (DOM recreated)
            // - This callback checks DOM before fonts re-apply to new elements
            // - Measurements incorrectly rejected
            // - Infinite loop ensues
            //
            // Trust MeasurementObserver's font verification instead.

            // LEGACY CODE (removed to fix infinite loop):
            // The Canvas MeasurementObserver already verifies fonts before measuring.
            // Duplicate verification here caused race conditions and infinite measurement loops.

            if (isSpellcastingDebugEnabled()) {
                const now = Date.now();
                const verbose = isSpellcastingVerboseLoggingEnabled();
                const interesting: MeasurementRecord[] = [];

                updates.forEach((update) => {
                    if (!isSpellcastingMeasurementKey(update.key)) {
                        return;
                    }

                    const cache = spellcastingMeasurementLogRef.current;

                    if (update.height == null || update.height <= 0) {
                        if (cache.delete(update.key)) {
                            interesting.push(update);
                        }
                        return;
                    }

                    const previous = cache.get(update.key);
                    const hasSignificantChange =
                        verbose &&
                        previous != null &&
                        (Math.abs(previous.height - update.height) > SPELLCASTING_HEIGHT_EPSILON ||
                            now - previous.loggedAt >= SPELLCASTING_HEIGHT_LOG_COOLDOWN_MS);

                    if (!previous || hasSignificantChange) {
                        cache.set(update.key, { height: update.height, loggedAt: now });
                        // Only emit subsequent measurements when verbose mode is enabled
                        if (!previous || verbose) {
                            interesting.push(update);
                        }
                    }
                });

                if (interesting.length > 0) {
                    console.log('🧮 [Spellcasting Debug] Measurement batch', {
                        count: interesting.length,
                        entries: interesting.map(({ key, height, measuredAt }) => ({
                            key,
                            height,
                            measuredAt,
                        })),
                        mode: verbose ? 'verbose' : 'initial-only',
                    });
                }
            }
            layout.onMeasurements(updates);
        },
        [fontsReady, themeLoaded, layout, measurementHostReady, measurementStatus, planPageCount]
    );

    useEffect(() => {
        if (!layout.plan || !isSpellcastingDebugEnabled()) {
            return;
        }

        layout.plan.pages.forEach((pageLayout) => {
            pageLayout.columns.forEach((columnLayout) => {
                columnLayout.entries.forEach((entry) => {
                    if (isComponentDebugEnabled(entry.instance.id)) {
                        console.log('🧭 [Spellcasting Debug] Pagination placement', {
                            page: pageLayout.pageNumber,
                            column: columnLayout.columnNumber,
                            span: entry.span,
                            overflow: entry.overflow,
                            listContinuation: entry.listContinuation,
                            measurementKey: entry.measurementKey,
                            estimatedHeight: entry.estimatedHeight,
                            regionContent: entry.regionContent,
                        });
                    }
                });
            });
        });
    }, [layout.plan]);

    // Theme hook moved to top of component (before useCanvasLayout) to gate measurements
    // Log theme loading status in development
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') {
            if (themeLoaded) {
                console.log('🎨 [StatblockPage] PHB theme loaded via @layer theme');
            }
            if (themeError) {
                console.error('❌ [StatblockPage] PHB theme error:', themeError);
            }
        }
    }, [themeLoaded, themeError]);

    useEffect(() => {
        if (!measurementHostReady && measurementEntryCount > 0 && measurementStatus !== 'complete') {
            if (process.env.NODE_ENV !== 'production') {
                console.log('📏 [StatblockPage] Deferring measurement staging - host not ready', {
                    measurementEntryCount,
                    measurementStatus,
                    measurementHostReady,
                });
            }
        }
    }, [measurementEntryCount, measurementHostReady, measurementStatus]);

    const scaledHeightPx = baseHeightPx * scale;
    const pageCount = Math.max(1, layout.plan?.pages.length ?? 1);

    const totalScaledHeightPx = pageCount * scaledHeightPx + (pageCount - 1) * PAGE_GAP_PX * scale;

    const containerStyle = useMemo<React.CSSProperties>(() => ({
        width: '100%',
        height: `${totalScaledHeightPx}px`,
        maxWidth: '100%',
        position: 'relative',
        overflow: 'hidden',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
        '--dm-page-width': `${baseWidthPx}px`,
        '--dm-page-height': `${baseHeightPx}px`,
        '--dm-page-content-height': `${baseContentHeightPx}px`,
        '--dm-page-count': `${pageCount}`,
        '--dm-page-scale': `${scale}`,
        '--dm-column-count': `${columnCount}`,
        '--dm-column-gap': `${columnGapPx}px`,
        '--dm-page-top-margin': `${baseTopMarginPx}px`,
        '--dm-page-bottom-margin': `${baseBottomMarginPx}px`,
        '--dm-page-left-margin': `${leftMarginPx}px`,
        '--dm-page-right-margin': `${rightMarginPx}px`,
    }), [baseContentHeightPx, baseHeightPx, baseWidthPx, baseTopMarginPx, baseBottomMarginPx, columnCount, pageCount, totalScaledHeightPx, scale, leftMarginPx, rightMarginPx, columnGapPx]);

    useLayoutEffect(() => {
        const node = containerRef.current;
        if (!node) {
            return;
        }

        node.style.setProperty('--dm-page-width', `${baseWidthPx}px`);
        node.style.setProperty('--dm-page-height', `${baseHeightPx}px`);
        node.style.setProperty('--dm-page-content-height', `${baseContentHeightPx}px`);
        node.style.setProperty('--dm-page-count', `${pageCount}`);
        node.style.setProperty('--dm-page-scale', `${scale}`);
        node.style.setProperty('--dm-column-count', `${columnCount}`);
        node.style.setProperty('--dm-column-gap', `${columnGapPx}px`);
        node.style.setProperty('--dm-page-top-margin', `${baseTopMarginPx}px`);
        node.style.setProperty('--dm-page-bottom-margin', `${baseBottomMarginPx}px`);
        node.style.setProperty('--dm-page-left-margin', `${leftMarginPx}px`);
        node.style.setProperty('--dm-page-right-margin', `${rightMarginPx}px`);
    }, [
        baseWidthPx,
        baseHeightPx,
        baseContentHeightPx,
        baseTopMarginPx,
        baseBottomMarginPx,
        pageCount,
        scale,
        columnCount,
        columnGapPx,
        leftMarginPx,
        rightMarginPx,
    ]);

    // Wrapper handles the transform, inner renderer handles content structure
    const transformWrapperStyle = useMemo<React.CSSProperties>(() => ({
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
    }), [scale]);

    const canvasRendererStyle = useMemo<React.CSSProperties>(() => ({
        width: `${baseWidthPx}px`,
        height: `${baseHeightPx * pageCount + (pageCount - 1) * PAGE_GAP_PX}px`,
    }), [baseWidthPx, baseHeightPx, pageCount]);

    const pageVariablesWithPagination: PageVariables = useMemo(() => {
        if (!layout.plan) {
            return pageVariablesWithMargins;
        }

        const requestedPageCount = pageVariablesWithMargins.pagination?.pageCount ?? 1;
        if (layout.plan.pages.length === requestedPageCount) {
            return pageVariablesWithMargins;
        }

        return {
            ...pageVariablesWithMargins,
            pagination: {
                ...(pageVariablesWithMargins.pagination ?? {
                    columnCount: pageVariablesWithMargins.columns.columnCount,
                    pageCount: requestedPageCount,
                }),
                pageCount: layout.plan.pages.length,
            },
        };
    }, [layout.plan, pageVariablesWithMargins]);

    const renderWithProps = (entry: CanvasLayoutEntry) =>
        renderEntry(entry, componentRegistry, {
            mode: pageVariablesWithMargins.mode,
            pageVariables: pageVariablesWithPagination,
            dataSources: page.dataSources ?? [],
        }, isEditMode, onUpdateData);

    useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            return;
        }
        if (typeof document === 'undefined') {
            return;
        }
        if (!layout?.plan || !fontsReady) {
            return;
        }

        const plannedIds = layout.plan.pages.flatMap((pagePlan) =>
            pagePlan.columns.flatMap((column) =>
                column.entries.map((entry) => entry.instance.id)
            )
        );

        const domIds = Array.from(document.querySelectorAll('.canvas-entry'))
            .map((node) => node.getAttribute('data-entry-id'))
            .filter((id): id is string => Boolean(id));

        const missingInDom = plannedIds.filter((id) => !domIds.includes(id));
        const extraInDom = domIds.filter((id) => !plannedIds.includes(id));

        if (missingInDom.length === 0 && extraInDom.length === 0) {
            console.log('🧩 [CanvasDiff] Plan matches DOM', {
                runId: (layout.plan as any).runId ?? 'unknown',
                plannedCount: plannedIds.length,
                domCount: domIds.length,
            });
            return;
        }

        console.warn('🧩 [CanvasDiff] Plan / DOM mismatch detected', {
            runId: (layout.plan as any).runId ?? 'unknown',
            plannedCount: plannedIds.length,
            domCount: domIds.length,
            missingInDom,
            extraInDom,
        });
    }, [layout?.plan, fontsReady]);

    // Phase 5: Canvas owns width calculations - use layout.dimensions
    // No more fallback/canonical/measured width juggling in consumer
    const measurementColumnWidthPx = layout.dimensions?.columnWidthPx;

    // Phase 5: Render function for MeasurementPortal
    // CRITICAL: Must be before any early returns to maintain hook order
    const renderMeasurementComponent = useCallback((entry: MeasurementEntry) =>
        renderEntry(entry, componentRegistry, {
            mode: pageVariablesWithMargins.mode,
            pageVariables: pageVariablesWithPagination,
            dataSources: page.dataSources ?? [],
        }, isEditMode, onUpdateData),
        [componentRegistry, pageVariablesWithMargins.mode, pageVariablesWithPagination, page.dataSources, isEditMode, onUpdateData]
    );

    // Show loading state while fonts load
    if (!fontsReady) {
        return (
            <div className="dm-canvas-responsive" style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center', color: '#666' }}>
                    <p>Loading fonts...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="dm-canvas-responsive" ref={containerRef} style={containerStyle}>
                <div className="dm-canvas-wrapper" style={transformWrapperStyle}>
                    <div className="dm-canvas-renderer" style={canvasRendererStyle}>
                        <div className="dm-canvas-pages">
                            <div className="dm-canvas-pages-content">
                                <CanvasPage
                                    layoutPlan={layout.plan}
                                    renderEntry={renderWithProps}
                                    columnWidthPx={measurementColumnWidthPx}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Phase 5: Canvas-owned MeasurementPortal - one line! */}
            {layout.dimensions && (
                <MeasurementPortal
                    config={canvasConfig}
                    dimensions={layout.dimensions}
                    entries={layout.measurementEntries}
                    renderComponent={renderMeasurementComponent}
                    onMeasurements={handleMeasurements}
                    onMeasurementComplete={layout.onMeasurementComplete}
                />
            )}
        </>
    );
};

const StatblockPage: React.FC<StatblockPageProps> = (props) => (
    <CanvasLayoutProvider>
        <StatblockCanvasInner {...props} />
    </CanvasLayoutProvider>
);

export default StatblockPage;
