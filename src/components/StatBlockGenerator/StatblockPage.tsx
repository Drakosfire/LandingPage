import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

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
import type { CanvasLayoutEntry, BasePageDimensions, MeasurementEntry, MeasurementRecord } from 'dungeonmind-canvas';
import { CanvasLayoutProvider } from 'dungeonmind-canvas';
import { useCanvasLayout } from 'dungeonmind-canvas';
import { CanvasPage } from 'dungeonmind-canvas';
import { MeasurementLayer, MeasurementCoordinator } from 'dungeonmind-canvas';
import { COMPONENT_VERTICAL_SPACING_PX, isComponentDebugEnabled, isRegionHeightDebugEnabled } from 'dungeonmind-canvas';
import { createStatblockAdapters } from './canvasAdapters';
import {
    REGION_HEIGHT_MIN_ABS_DIFF_PX,
    shouldSkipRegionHeightUpdate,
} from './regionHeightUtils';

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
const COLUMN_WIDTH_EPSILON = 0.5;
const roundColumnWidth = (value: number) => Math.round(value * 100) / 100;

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

const CANONICAL_WIDTH_FORCED_LOCK_TIMEOUT_MS = 1500;

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

const parseBooleanPreference = (value?: string | null): boolean | undefined => {
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['1', 'true', 'yes', 'on', 'enable', 'enabled'].includes(normalized)) {
            return true;
        }
        if (['0', 'false', 'no', 'off', 'disable', 'disabled'].includes(normalized)) {
            return false;
        }
    }
    return undefined;
};

const CANONICAL_HEIGHT_STORAGE_KEY = 'canvas:forceCanonicalHeight';

const readForceCanonicalHeightPreference = (): boolean => {
    const envValue = parseBooleanPreference(process.env.REACT_APP_CANVAS_FORCE_CANONICAL_HEIGHT);
    if (envValue !== undefined) {
        return envValue;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(CANONICAL_HEIGHT_STORAGE_KEY);
        const parsedStored = parseBooleanPreference(stored);
        if (parsedStored !== undefined) {
            return parsedStored;
        }
    }
    return true;
};

const readMeasurementWidthDebugPreference = (): boolean =>
    parseBooleanPreference(process.env.REACT_APP_CANVAS_DEBUG_MEASUREMENT_WIDTH) === true;

const StatblockCanvasInner: React.FC<StatblockPageProps> = ({ page, template, componentRegistry, isEditMode, onUpdateData, measurementCoordinator }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    // FIXED: Track last sent height to prevent redundant setRegionHeight calls
    // This ref persists across effect re-runs, preventing excessive state updates
    const lastSentHeightRef = useRef<number>(0);
    const canonicalWidthLockRef = useRef<boolean>(false);
    const [scale, setScale] = useState(1);
    const [fontsReady, setFontsReady] = useState(false);
    
    // Phase 4 A2: Load theme CSS early so we can pass ready signal to MeasurementLayer
    const { isLoaded: themeLoaded, error: themeError } = usePHBTheme(DND_CSS_BASE_URL, {
        debug: process.env.NODE_ENV !== 'production',
    });
    
    const [measuredColumnWidth, setMeasuredColumnWidth] = useState<number | null>(null);
    const [hasCanonicalWidthLock, setHasCanonicalWidthLock] = useState(false);
    // Spike branch: fully eliminate live DOM scrollHeight; always use canonical height
    const [forceCanonicalHeight, setForceCanonicalHeight] = useState<boolean>(true);
    const REGION_HEIGHT_HOLD_TIMEOUT_MS = 400;
    const [regionHeightHoldActive, setRegionHeightHoldActive] = useState(true);
    const regionHeightHoldTimerRef = useRef<number | null>(null);
    const pendingRegionHeightRef = useRef<number | null>(null);
    const pendingRegionLatestHeightRef = useRef<number | null>(null);
    const [measurementPortalNode, setMeasurementPortalNode] = useState<HTMLDivElement | null>(null);
    const previousMeasurementStatusRef = useRef<string | undefined>(undefined);
    const measurementAttachLoggedRef = useRef(false);
    const measurementWidthLoggedRef = useRef(false);
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

    useEffect(() => {
        if (typeof document === 'undefined') {
            return undefined;
        }
        const node = document.createElement('div');
        node.className = 'dm-measurement-staging-root';
        node.setAttribute('aria-hidden', 'true');
        Object.assign(node.style, {
            position: 'fixed',
            top: '0px',
            left: '0px',
            width: '0px',
            height: '0px',
            pointerEvents: 'none',
            zIndex: '-1',
        });
        document.body.appendChild(node);
        setMeasurementPortalNode(node);
        return () => {
            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }
        };
    }, []);


    // DEBUG: Log edit mode prop
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

    const layout = useCanvasLayout({
        // Phase 4 A2: Always pass components - MeasurementLayer gates via `ready` prop
        componentInstances: page.componentInstances,
        template,
        dataSources: page.dataSources ?? [],
        componentRegistry: componentRegistry as any,
        pageVariables: pageVariablesWithMargins,
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
    const canonicalRegionHeightPx = Math.max(baseContentHeightPx, 0);

    const leftMarginPx = (pageVariablesWithMargins.margins?.leftMm ?? FALLBACK_MARGIN_MM) * MM_TO_PX;
    const rightMarginPx = (pageVariablesWithMargins.margins?.rightMm ?? FALLBACK_MARGIN_MM) * MM_TO_PX;

    const columnConfig = pageVariablesWithMargins.columns;
    const columnCount = columnConfig.columnCount;
    const columnGapPx = useMemo(
        () => resolveColumnGapPx(columnConfig),
        [columnConfig]
    );

    const canonicalColumnWidthPx = useMemo(() => {
        if (!columnCount || columnCount <= 0) {
            return null;
        }

        const availableWidth = baseWidthPx - leftMarginPx - rightMarginPx;
        const totalGap = columnGapPx * Math.max(0, columnCount - 1);
        const usableWidth = Math.max(0, availableWidth - totalGap);

        if (usableWidth <= 0) {
            return null;
        }

        return usableWidth / columnCount;
    }, [baseWidthPx, leftMarginPx, rightMarginPx, columnGapPx, columnCount]);

    useEffect(() => {
        setMeasuredColumnWidth(null);
        if (canonicalWidthLockRef.current) {
            canonicalWidthLockRef.current = false;
            setHasCanonicalWidthLock(false);
        }
    }, [canonicalColumnWidthPx]);

    const effectiveColumnWidthPx = measuredColumnWidth ?? canonicalColumnWidthPx ?? null;

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
    useEffect(() => {
        if (!fontsReady || !layout.plan) {
            activateRegionHeightHold('awaiting-fonts-or-plan');
            return clearRegionHeightHoldTimer;
        }

        if (hasCanonicalWidthLock) {
            releaseRegionHeightHold('canonical-width-lock');
            return clearRegionHeightHoldTimer;
        }

        activateRegionHeightHold('awaiting-canonical-lock');
        regionHeightHoldTimerRef.current = window.setTimeout(() => {
            regionHeightHoldTimerRef.current = null;
            releaseRegionHeightHold('hold-timeout');
        }, REGION_HEIGHT_HOLD_TIMEOUT_MS);

        return clearRegionHeightHoldTimer;
    }, [
        activateRegionHeightHold,
        clearRegionHeightHoldTimer,
        fontsReady,
        hasCanonicalWidthLock,
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

        // Measure the visible column width for accurate measurement layer sizing
        const visibleColumn = visibleFrame.querySelector('.canvas-column');
        if (visibleColumn) {
            const colWidth = visibleColumn.getBoundingClientRect().width;
            const preTransformWidth = colWidth / scale;
            const canonicalWidth = canonicalColumnWidthPx;
            const canonicalRounded = canonicalWidth != null ? roundColumnWidth(canonicalWidth) : null;
            const roundedPreTransform = roundColumnWidth(preTransformWidth);
            const widthMatchesCanonical = canonicalRounded != null
                ? Math.abs(roundedPreTransform - canonicalRounded) <= COLUMN_WIDTH_EPSILON
                : false;

            if (canonicalRounded != null) {
                if (widthMatchesCanonical) {
                    if (!canonicalWidthLockRef.current) {
                        canonicalWidthLockRef.current = true;
                        setHasCanonicalWidthLock(true);
                        releaseRegionHeightHold('canonical-width-lock');
                    }
                    canonicalWidthMismatchStartRef.current = null;
                    canonicalWidthForcedLockRef.current = false;
                    if (canonicalWidthMismatchTimeoutRef.current != null) {
                        window.clearTimeout(canonicalWidthMismatchTimeoutRef.current);
                        canonicalWidthMismatchTimeoutRef.current = null;
                    }
                    if (measuredColumnWidth !== null) {
                        setMeasuredColumnWidth(null);
                    }
                } else {
                    if (canonicalWidthMismatchStartRef.current == null) {
                        canonicalWidthMismatchStartRef.current = Date.now();
                    }
                    if (canonicalWidthLockRef.current && !canonicalWidthForcedLockRef.current) {
                        canonicalWidthLockRef.current = false;
                        setHasCanonicalWidthLock(false);
                        activateRegionHeightHold('canonical-width-mismatch');
                    } else if (!canonicalWidthForcedLockRef.current) {
                        activateRegionHeightHold('canonical-width-mismatch');
                    }

                    if (!canonicalWidthForcedLockRef.current && canonicalWidthMismatchTimeoutRef.current == null) {
                        const diffSnapshot = Number(Math.abs(roundedPreTransform - canonicalRounded).toFixed(2));
                        canonicalWidthMismatchTimeoutRef.current = window.setTimeout(() => {
                            canonicalWidthMismatchTimeoutRef.current = null;
                            canonicalWidthMismatchStartRef.current = null;
                            canonicalWidthForcedLockRef.current = true;
                            canonicalWidthLockRef.current = true;
                            setHasCanonicalWidthLock(true);
                            releaseRegionHeightHold('canonical-width-lock-forced');
                            console.warn('[StatblockPage] Forced canonical width lock after timeout', {
                                timeoutMs: CANONICAL_WIDTH_FORCED_LOCK_TIMEOUT_MS,
                                postTransform: colWidth,
                                scale,
                                roundedPreTransform,
                                canonicalRounded,
                                diff: diffSnapshot,
                            });
                        }, CANONICAL_WIDTH_FORCED_LOCK_TIMEOUT_MS);
                    }

                    if (process.env.NODE_ENV !== 'production') {
                        console.debug('[StatblockPage] Canonical width clamp active, ignoring mismatched measurement', {
                            postTransform: colWidth,
                            scale,
                            roundedPreTransform,
                            canonicalRounded,
                            diff: Number(Math.abs(roundedPreTransform - canonicalRounded).toFixed(2)),
                            mismatchDuration: canonicalWidthMismatchStartRef.current
                                ? Date.now() - canonicalWidthMismatchStartRef.current
                                : null,
                        });
                    }
                }
            } else if (
                measuredColumnWidth == null ||
                Math.abs(preTransformWidth - measuredColumnWidth) > COLUMN_WIDTH_EPSILON
            ) {
                setMeasuredColumnWidth(preTransformWidth);
            }

            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.debug('[StatblockPage] Measured visible column width:', {
                    postTransform: colWidth,
                    scale,
                    preTransform: preTransformWidth,
                    canonical: canonicalRounded ?? 'n/a',
                    source: canonicalRounded != null
                        ? (widthMatchesCanonical ? 'canonical' : 'canonical (clamped)')
                        : 'measured',
                });
            }
        }

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
                    canonicalWidthLocked: hasCanonicalWidthLock,
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
                            canonicalLock: hasCanonicalWidthLock,
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
                // Always use canonical height when forceCanonicalHeight is enabled
                applyRegionHeightTarget(canonicalRegionHeightPx, 'canonical', {
                    measurementSource: 'canonical-base-content',
                    fullColumnHeight: canonicalRegionHeightPx,
                    usableHeight: canonicalRegionHeightPx,
                    heightCeiling: canonicalRegionHeightPx,
                    scaleSnapshot: scale,
                });
                return;
            }

            const usableHeight = fullColumnHeight / scale;
            const heightCeiling = Math.max(baseContentHeightPx, 0);
            const cappedHeight = Math.min(usableHeight, heightCeiling);
            const shouldHoldCanonicalHeight = regionHeightHoldActive || !hasCanonicalWidthLock;
            const targetHeight = shouldHoldCanonicalHeight ? heightCeiling : cappedHeight;

            // DEBUG: Log detailed measurement info to diagnose height discrepancy
            if (process.env.NODE_ENV !== 'production') {
                console.log('📏 [StatblockPage] Column height measurement details', {
                    scale,
                    columnMeasurements: {
                        getBoundingClientRect: columnRect.height,
                        scrollHeight: columnScrollHeight,
                        clientHeight: columnClientHeight,
                        offsetHeight: columnOffsetHeight,
                    },
                    frameMeasurements: {
                        getBoundingClientRect: frameRect.height,
                        scrollHeight: frameScrollHeight,
                        clientHeight: frameClientHeight,
                        offsetHeight: frameOffsetHeight,
                    },
                    selected: {
                        fullColumnHeight,
                        source: measurementSource,
                    },
                    calculated: {
                        usableHeight,
                        heightCeiling,
                        cappedHeight,
                    },
                    note: 'usableHeight = fullColumnHeight / scale (pre-transform height for pagination)',
                });
            }

            if (isSpellcastingDebugEnabled() && Math.abs(usableHeight - cappedHeight) > 0.5) {
                console.log('📏 [Spellcasting Debug] Region height measurement', {
                    usableHeight,
                    heightCeiling,
                    cappedHeight,
                    scale,
                    columnRect: {
                        height: columnRect.height,
                        top: columnRect.top,
                        bottom: columnRect.bottom,
                    },
                });
            }

            applyRegionHeightTarget(targetHeight, 'measurement', {
                measurementSource,
                fullColumnHeight,
                usableHeight,
                heightCeiling,
                scaleSnapshot: scale,
            });
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
        measuredColumnWidth,
        hasCanonicalWidthLock,
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
    const measurementWidthDebugEnabled = readMeasurementWidthDebugPreference();

    // Track completion of first measurement cycle to distinguish fresh mount from refresh
    useEffect(() => {
        if (measurementStatus === 'complete' && !hasCompletedMeasurementCycleRef.current) {
            hasCompletedMeasurementCycleRef.current = true;
            if (process.env.NODE_ENV !== 'production') {
                console.log('📏 [StatblockPage] First measurement cycle completed', {
                    planPageCount,
                    hasCanonicalWidthLock,
                    measurementEntryCount,
                });
            }
        }
    }, [measurementStatus, planPageCount, hasCanonicalWidthLock, measurementEntryCount]);

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
                willRequireCanonicalLock: mountTimeIsLikelyRefresh && !hasCanonicalWidthLock,
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
    // Phase 4 A2: MeasurementLayer now handles CSS/font readiness via `ready` prop
    const measurementHostReady = fontsReady && (canonicalColumnWidthPx != null || (!isLikelyRefresh && isFreshMount && planPageCount === 0));
    const canonicalWidthMismatchStartRef = useRef<number | null>(null);
    const canonicalWidthMismatchTimeoutRef = useRef<number | null>(null);
    const canonicalWidthForcedLockRef = useRef(false);

    useEffect(() => {
        if (measurementStatus !== 'measuring') {
            measurementWidthLoggedRef.current = false;
        }

        if (
            !measurementWidthDebugEnabled ||
            !measurementPortalNode ||
            !measurementHostReady ||
            !fontsReady ||
            measurementStatus !== 'measuring' ||
            measurementWidthLoggedRef.current
        ) {
            return undefined;
        }

        measurementWidthLoggedRef.current = true;

        const logWidths = () => {
            const visibleColumn = document.querySelector<HTMLDivElement>('.dm-canvas-responsive .canvas-column');
            const measurementColumn = measurementPortalNode.querySelector<HTMLDivElement>(
                '.dm-canvas-measurement-layer .canvas-column'
            );

            const visibleWidth = visibleColumn ? visibleColumn.getBoundingClientRect().width : null;
            const measurementWidth = measurementColumn ? measurementColumn.getBoundingClientRect().width : null;
            const unscaledVisibleWidth = visibleWidth != null ? visibleWidth / scale : null;

            console.log('📏 [MeasurementWidthDebug] Column widths', {
                measurementStatus,
                visibleWidthScaled: visibleWidth != null ? Number(visibleWidth.toFixed(2)) : 'N/A',
                visibleWidthUnscaled: unscaledVisibleWidth != null ? Number(unscaledVisibleWidth.toFixed(2)) : 'N/A',
                measurementWidth: measurementWidth != null ? Number(measurementWidth.toFixed(2)) : 'N/A',
                scale,
                portalReady: !!measurementPortalNode,
            });
        };

        const rafId = requestAnimationFrame(() => {
            requestAnimationFrame(logWidths);
        });

        return () => cancelAnimationFrame(rafId);
    }, [
        measurementWidthDebugEnabled,
        measurementPortalNode,
        measurementHostReady,
        fontsReady,
        measurementStatus,
        scale,
    ]);

    useEffect(() => {
        return () => {
            if (canonicalWidthMismatchTimeoutRef.current != null) {
                window.clearTimeout(canonicalWidthMismatchTimeoutRef.current);
                canonicalWidthMismatchTimeoutRef.current = null;
            }
        };
    }, []);

    // CRITICAL: Verify fonts are actually rendered in measurement layer DOM before allowing measurement.
    // On refresh, fonts may be cached and load() resolves immediately, but the measurement layer DOM
    // might not have applied fonts yet. We need to verify fonts are actually used, not just loaded.
    const [measurementLayerFontsReady, setMeasurementLayerFontsReady] = useState(false);

    const handleMeasurements = React.useCallback(
        (updates: MeasurementRecord[]) => {
            if (!measurementHostReady) {
                const componentCount = page.componentInstances.length;
                const isLikelyRefresh = fontsReady && componentCount > 0 && planPageCount === 0 && !hasCompletedMeasurementCycleRef.current;

                if (process.env.NODE_ENV !== 'production') {
                    console.log('📏 [StatblockPage] Ignoring measurement batch until canonical width lock', {
                        batchSize: updates.length,
                        measurementStatus,
                        hasCanonicalWidthLock,
                        planPageCount,
                        fontsReady,
                        componentCount,
                        isLikelyRefresh,
                        reason: isLikelyRefresh ? 'refresh-detected-require-lock' : 'waiting-for-canonical-lock',
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
        [fontsReady, themeLoaded, hasCanonicalWidthLock, layout, measurementHostReady, measurementStatus, planPageCount, measurementLayerFontsReady]
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
                console.log('📏 [StatblockPage] Deferring measurement staging until canonical width lock', {
                    measurementEntryCount,
                    measurementStatus,
                    hasCanonicalWidthLock,
                    measurementHostReady,
                });
            }
        }
    }, [measurementEntryCount, measurementHostReady, measurementStatus]);

    useEffect(() => {
        if (measurementStatus === 'idle' || measurementStatus === 'complete') {
            measurementAttachLoggedRef.current = false;
        }
    }, [measurementStatus]);

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

    const safeColumnCount = Math.max(columnCount, 1);
    const fallbackColumnWidthPx = Math.max(
        0,
        (baseWidthPx - (safeColumnCount - 1) * columnGapPx) / safeColumnCount
    );
    // CRITICAL: Measurement layer MUST use canonical width, not measured width.
    // The measurement layer renders at a known ratio (canonical width), independent of visible DOM width.
    // Using measuredColumnWidth would cause wrong-width measurements on refresh when DOM is clamped.
    const measurementColumnWidthPx = canonicalColumnWidthPx ?? fallbackColumnWidthPx;

    // DIAGNOSTIC: Log width selection to debug measurement width mismatch
    if (process.env.NODE_ENV !== 'production' && measurementStatus === 'measuring') {
        console.log('📐 [StatblockPage] Measurement width selection', {
            canonicalColumnWidthPx,
            fallbackColumnWidthPx,
            measurementColumnWidthPx,
            usingFallback: canonicalColumnWidthPx == null,
            baseWidthPx,
            columnGapPx,
            columnCount,
            leftMarginPx,
            rightMarginPx,
        });
    }

    useEffect(() => {
        // Only verify fonts if portal exists, fonts are loaded, and we're ready to render (but fonts not yet verified)
        // Phase 4 A2: MeasurementLayer now handles CSS/font readiness via `ready` prop
        if (!measurementPortalNode || !measurementHostReady || !fontsReady || measurementStatus === 'complete') {
            setMeasurementLayerFontsReady(false);
            return;
        }

        // Wait for measurement layer DOM to render, then verify fonts are actually applied
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const verifyFontsInMeasurementLayer = (): void => {
            // Find a test element in the measurement layer
            const testElement = measurementPortalNode.querySelector('.dm-measurement-entry');
            if (!testElement) {
                // Measurement layer not rendered yet, wait a bit more
                timeoutId = setTimeout(verifyFontsInMeasurementLayer, 50);
                return;
            }

            // Verify fonts are actually applied (not fallback fonts)
            const computedStyle = window.getComputedStyle(testElement);
            const fontFamily = computedStyle.fontFamily;

            // Check if D&D fonts are actually being used (not fallback like Arial, sans-serif)
            const hasDndFonts = fontFamily.includes('ScalySansRemake') ||
                fontFamily.includes('NodestoCapsCondensed') ||
                fontFamily.includes('BookInsanity');

            if (!hasDndFonts) {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn('📏 [StatblockPage] Fonts not yet applied in measurement layer, retrying...', {
                        fontFamily,
                        testElement: testElement.className,
                    });
                }
                // Fonts not applied yet, wait a bit more
                timeoutId = setTimeout(verifyFontsInMeasurementLayer, 50);
                return;
            }

            // Fonts are applied - allow measurement to proceed
            if (process.env.NODE_ENV !== 'production') {
                console.log('✅ [StatblockPage] Fonts verified in measurement layer', {
                    fontFamily,
                });
            }
            setMeasurementLayerFontsReady(true);
        };

        // Start verification after a brief delay to allow DOM to render
        timeoutId = setTimeout(verifyFontsInMeasurementLayer, 0);
        return () => {
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
            }
            setMeasurementLayerFontsReady(false);
        };
    }, [measurementPortalNode, measurementHostReady, fontsReady, measurementStatus]);

    // Block measurement callbacks until fonts are verified in the measurement layer DOM
    // This prevents wrong-height measurements on refresh when fonts aren't applied yet
    const shouldAcceptMeasurements = measurementLayerFontsReady;

    // CRITICAL: Only render measurement portal components AFTER fonts are ready
    // fontsReady already includes waiting for fonts to be rendered (document.fonts.ready + double RAF)
    // This prevents ResizeObserver from firing before fonts are applied
    const shouldRenderMeasurementPortal =
        Boolean(measurementPortalNode) &&
        measurementHostReady &&
        fontsReady &&
        measurementStatus !== 'complete' &&
        measurementEntryCount > 0;

    useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            return;
        }
        if (!fontsReady) {
            return;
        }
        if (!measurementHostReady) {
            return;
        }
        if (measurementAttachLoggedRef.current) {
            return;
        }
        if (!layout.plan || layout.plan.pages.length === 0) {
            return;
        }
        if (typeof document === 'undefined' || typeof window === 'undefined') {
            return;
        }

        measurementAttachLoggedRef.current = true;
        let mutationObserver: MutationObserver | null = null;
        let timeoutId: number | null = null;
        let loggedSuccessfully = false;
        const maxWaitMs = 2000; // 2 seconds max wait
        const startTime = Date.now();

        // Get all measurement keys for diagnostic purposes
        const allMeasurementKeys = Array.from(layout.measurementEntries.map(e => e.measurementKey));

        const findComponent05 = (): { element: Element | null; location: 'visible' | 'measurement-portal' | null; actualId?: string } => {
            // Check visible canvas first (where entries should be after measurement completes)
            // Try both ID formats: component-05 (zero-padded) and component-5 (non-padded)
            const visibleElement05 = document.querySelector('.dm-canvas-renderer .canvas-entry[data-entry-id="component-05"]');
            if (visibleElement05) {
                return { element: visibleElement05, location: 'visible', actualId: 'component-05' };
            }
            const visibleElement5 = document.querySelector('.dm-canvas-renderer .canvas-entry[data-entry-id="component-5"]');
            if (visibleElement5) {
                return { element: visibleElement5, location: 'visible', actualId: 'component-5' };
            }

            // Check measurement portal (entries might still be measuring)
            // Measurement keys use format: component-5:block (non-padded)
            const measurementElement5 = document.querySelector('[data-measurement-key^="component-5:"]');
            if (measurementElement5) {
                return { element: measurementElement5, location: 'measurement-portal', actualId: 'component-5' };
            }
            const measurementElement05 = document.querySelector('[data-measurement-key^="component-05:"]');
            if (measurementElement05) {
                return { element: measurementElement05, location: 'measurement-portal', actualId: 'component-05' };
            }

            return { element: null, location: null };
        };

        const logEntryBounds = (result: { element: Element | null; location: 'visible' | 'measurement-portal' | null; actualId?: string }) => {
            const elapsedMs = Date.now() - startTime;

            if (!result.element) {
                // Diagnostic: check what entries DO exist
                const allVisibleEntries = Array.from(document.querySelectorAll('.canvas-entry')).map(el => ({
                    id: el.getAttribute('data-entry-id'),
                    className: el.className,
                    spanTop: el.getAttribute('data-span-top'),
                }));
                const allMeasurementEntries = Array.from(document.querySelectorAll('[data-measurement-key]')).map(el => ({
                    key: el.getAttribute('data-measurement-key'),
                    className: el.className,
                }));

                // Find component-05/component-5 entries in plan
                const planComponent05Entries = layout.plan?.pages.flatMap(page =>
                    page.columns.flatMap(col =>
                        col.entries
                            .filter(e => e.instance.id === 'component-05' || e.instance.id === 'component-5')
                            .map(e => ({
                                id: e.instance.id,
                                page: page.pageNumber,
                                column: col.columnNumber,
                                spanTop: e.span?.top,
                                spanBottom: e.span?.bottom,
                            }))
                    )
                ) ?? [];

                console.log('📐 [MeasurementDebug] Entry bounds', {
                    id: 'component-05',
                    missing: true,
                    elapsedMs,
                    measurementStatus,
                    measurementHostReady,
                    hasCanonicalWidthLock,
                    planPageCount,
                    canonicalColumnWidthPx,
                    measurementColumnWidthPx,
                    visibleEntryCount: allVisibleEntries.length,
                    measurementEntryCount: allMeasurementEntries.length,
                    visibleEntryIds: allVisibleEntries.map(e => e.id).filter(Boolean),
                    visibleEntryIdsWithSpans: allVisibleEntries
                        .filter(e => e.id && (e.id.includes('component-0') || e.id.includes('component-5')))
                        .map(e => ({ id: e.id, spanTop: e.spanTop })),
                    measurementKeys: allMeasurementKeys.filter(k => k.startsWith('component-5') || k.startsWith('component-05')).slice(0, 10),
                    planComponent05Entries,
                    diagnostic: {
                        hasCanvasRenderer: !!document.querySelector('.dm-canvas-renderer'),
                        hasMeasurementLayer: !!document.querySelector('.dm-canvas-measurement-layer'),
                        planHasComponent05: planComponent05Entries.length > 0,
                    },
                });
                return;
            }

            const rect = result.element.getBoundingClientRect();
            const measurementKey = result.element.getAttribute('data-measurement-key');
            const entryId = result.element.getAttribute('data-entry-id');
            const spanTop = result.element.getAttribute('data-span-top');
            const spanBottom = result.element.getAttribute('data-span-bottom');

            console.log('📐 [MeasurementDebug] Entry bounds', {
                id: 'component-05',
                actualId: result.actualId,
                location: result.location,
                width: Number(rect.width.toFixed(2)),
                height: Number(rect.height.toFixed(2)),
                top: Number(rect.top.toFixed(2)),
                left: Number(rect.left.toFixed(2)),
                measurementKey,
                entryId,
                spanTop,
                spanBottom,
                elapsedMs,
                measurementStatus,
                measurementHostReady,
                hasCanonicalWidthLock,
                planPageCount,
                canonicalColumnWidthPx,
                measurementColumnWidthPx,
                scale,
            });
        };

        const checkAndLog = () => {
            const result = findComponent05();
            if (result.element) {
                loggedSuccessfully = true;
                logEntryBounds(result);
                if (mutationObserver) {
                    mutationObserver.disconnect();
                    mutationObserver = null;
                }
                if (timeoutId != null) {
                    window.clearTimeout(timeoutId);
                    timeoutId = null;
                }
                return;
            }

            // Check timeout
            if (Date.now() - startTime >= maxWaitMs) {
                logEntryBounds(result);
                if (mutationObserver) {
                    mutationObserver.disconnect();
                    mutationObserver = null;
                }
                measurementAttachLoggedRef.current = false;
                return;
            }
        };

        // Initial check
        checkAndLog();
        if (loggedSuccessfully) {
            return;
        }

        // Set up MutationObserver to watch for DOM changes
        const targetNode = document.querySelector('.dm-canvas-renderer') || document.body;
        if (targetNode) {
            mutationObserver = new MutationObserver(() => {
                checkAndLog();
            });

            mutationObserver.observe(targetNode, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['data-entry-id', 'data-measurement-key'],
            });
        }

        // Fallback timeout
        timeoutId = window.setTimeout(() => {
            checkAndLog();
        }, maxWaitMs);

        return () => {
            if (mutationObserver) {
                mutationObserver.disconnect();
            }
            if (timeoutId != null) {
                window.clearTimeout(timeoutId);
            }
            if (!loggedSuccessfully) {
                measurementAttachLoggedRef.current = false;
            }
        };
    }, [
        canonicalColumnWidthPx,
        measurementColumnWidthPx,
        measurementHostReady,
        measurementStatus,
        measurementEntryCount,
        planPageCount,
        scale,
        shouldRenderMeasurementPortal,
        hasCanonicalWidthLock,
        fontsReady,
        layout.plan,
        layout.measurementEntries,
    ]);

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

    const measurementPortal = measurementPortalNode && shouldRenderMeasurementPortal
        ? createPortal(
            <div
                className="dm-canvas-measurement-layer"
                aria-hidden
                data-measurement-status={measurementStatus}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${baseWidthPx}px`,
                    height: `${baseHeightPx}px`,
                    overflow: 'visible',
                    pointerEvents: 'none',
                    visibility: 'hidden',
                }}
            >
                <div
                    className="page phb"
                    style={{
                        width: `${baseWidthPx}px`,
                        height: `${baseHeightPx}px`,
                        margin: 0,
                        transform: undefined,
                        transformOrigin: 'top left',
                    }}
                >
                    <div className="columnWrapper">
                        <div className="monster frame wide" style={{ height: 'auto', width: measurementColumnWidthPx != null ? `${measurementColumnWidthPx}px` : `${fallbackColumnWidthPx}px`, maxWidth: measurementColumnWidthPx != null ? `${measurementColumnWidthPx}px` : `${fallbackColumnWidthPx}px` }}>
                            <div
                                className="canvas-column"
                                style={{
                                    // Phase 1: Use IDENTICAL structural styles as visible layer
                                    // to guarantee measurement width === visible width
                                    width: `${measurementColumnWidthPx ?? fallbackColumnWidthPx}px`,
                                    boxSizing: 'border-box',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flex: 'none',
                                    flexShrink: 0,
                                    flexGrow: 0,
                                    minWidth: 0,
                                    overflow: 'hidden',
                                }}
                            >
                                <MeasurementLayer
                                    entries={layout.measurementEntries}
                                    renderComponent={(entry: MeasurementEntry) =>
                                        renderEntry(entry, componentRegistry, {
                                            mode: pageVariablesWithMargins.mode,
                                            pageVariables: pageVariablesWithPagination,
                                            dataSources: page.dataSources ?? [],
                                        }, isEditMode, onUpdateData)
                                    }
                                    onMeasurements={handleMeasurements}
                                    onMeasurementComplete={layout.onMeasurementComplete}
                                    coordinator={measurementCoordinator}
                                    measuredColumnWidth={measurementColumnWidthPx}
                                    stagingMode="embedded"
                                    ready={fontsReady && themeLoaded}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>,
            measurementPortalNode
        )
        : null;

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
            {measurementPortal}
        </>
    );
};

const StatblockPage: React.FC<StatblockPageProps> = (props) => (
    <CanvasLayoutProvider>
        <StatblockCanvasInner {...props} />
    </CanvasLayoutProvider>
);

export default StatblockPage;
