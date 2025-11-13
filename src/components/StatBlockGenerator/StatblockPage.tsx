import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type {
    CanvasComponentProps,
    ComponentRegistryEntry,
    PageVariables,
    StatblockPageDocument,
    TemplateConfig,
} from '../../types/statblockCanvas.types';
import type { StatBlockDetails } from '../../types/statblock.types';
import { DND_CSS_BASE_URL } from '../../config';
import '../../styles/canvas/index.css';         // Shared canvas styles
import '../../styles/StatblockComponents.css';  // StatBlock-specific styles
import type { CanvasLayoutEntry, BasePageDimensions, MeasurementEntry, MeasurementRecord } from 'dungeonmind-canvas';
import { CanvasLayoutProvider } from 'dungeonmind-canvas';
import { useCanvasLayout } from 'dungeonmind-canvas';
import { CanvasPage } from 'dungeonmind-canvas';
import { MeasurementLayer, MeasurementCoordinator } from 'dungeonmind-canvas';
import { COMPONENT_VERTICAL_SPACING_PX, isComponentDebugEnabled } from 'dungeonmind-canvas';
import { createStatblockAdapters } from './canvasAdapters';

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
    const [measuredColumnWidth, setMeasuredColumnWidth] = useState<number | null>(null);

    // Create statblock adapters (memoized)
    const adapters = useMemo(() => createStatblockAdapters(), []);

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
        componentInstances: fontsReady ? page.componentInstances : [],
        template,
        dataSources: fontsReady ? (page.dataSources ?? []) : [],
        componentRegistry: componentRegistry as any,
        pageVariables: pageVariablesWithMargins,
        adapters,
    });

    // Debug: Log layout state
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production' && layout.plan) {
            console.log('[StatblockPage] Layout state:', {
                fontsReady,
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
    }, [fontsReady, page.componentInstances.length, layout.plan, layout.baseDimensions]);

    const {
        widthPx: baseWidthPx,
        heightPx: baseHeightPx,
        contentHeightPx: baseContentHeightPx,
        topMarginPx: baseTopMarginPx,
        bottomMarginPx: baseBottomMarginPx,
    }: BasePageDimensions = layout.baseDimensions;

    const leftMarginPx = (pageVariablesWithMargins.margins?.leftMm ?? FALLBACK_MARGIN_MM) * MM_TO_PX;
    const rightMarginPx = (pageVariablesWithMargins.margins?.rightMm ?? FALLBACK_MARGIN_MM) * MM_TO_PX;

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
            // CRITICAL: Divide by scale to get pre-transform width
            // The visible layer is scaled down (e.g., 0.777x), so we measure 233px
            // But measurement layer needs to lay out at PRE-TRANSFORM width (300px)
            // to match the text wrapping and get accurate heights
            setMeasuredColumnWidth(colWidth / scale);
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.debug('[StatblockPage] Measured visible column width:', {
                    postTransform: colWidth,
                    scale,
                    preTransform: colWidth / scale,
                });
            }
        }

        const updateRegionHeight = () => {
            // Measure the COLUMN, not the frame
            const column = visibleFrame.querySelector('.canvas-column');
            if (!column) {
                return;
            }

            const columnRect = column.getBoundingClientRect();
            // Cast to HTMLElement to access scrollHeight, clientHeight, offsetHeight
            const columnElement = column as HTMLElement;
            const columnScrollHeight = columnElement.scrollHeight;
            const columnClientHeight = columnElement.clientHeight;
            const columnOffsetHeight = columnElement.offsetHeight;

            // FIXED: Measure the FRAME container, not the column
            // The column grows with content, but the frame defines available space
            // If frame is constrained by viewport/container, measure that constraint
            const frameElement = visibleFrame as HTMLElement;
            const frameRect = frameElement.getBoundingClientRect();
            const frameScrollHeight = frameElement.scrollHeight;
            const frameClientHeight = frameElement.clientHeight;
            const frameOffsetHeight = frameElement.offsetHeight;

            // Also check parent container for constraints
            const parentContainer = visibleFrame.parentElement;
            const parentRect = parentContainer?.getBoundingClientRect();
            const parentScrollHeight = parentContainer ? (parentContainer as HTMLElement).scrollHeight : 0;
            const parentClientHeight = parentContainer ? (parentContainer as HTMLElement).clientHeight : 0;

            // FIXED: Prioritize parent container measurements over column measurements
            // The parent container defines the available space, column just contains content
            // Priority: parentScrollHeight > parentClientHeight > frameScrollHeight > frameClientHeight > columnScrollHeight
            let fullColumnHeight: number;
            let measurementSource: string;

            if (parentScrollHeight > 0) {
                fullColumnHeight = parentScrollHeight;
                measurementSource = 'parentScrollHeight';
            } else if (parentClientHeight > 0) {
                fullColumnHeight = parentClientHeight;
                measurementSource = 'parentClientHeight';
            } else if (frameScrollHeight > 0) {
                fullColumnHeight = frameScrollHeight;
                measurementSource = 'frameScrollHeight';
            } else if (frameClientHeight > 0) {
                fullColumnHeight = frameClientHeight;
                measurementSource = 'frameClientHeight';
            } else if (columnScrollHeight > 0) {
                fullColumnHeight = columnScrollHeight;
                measurementSource = 'columnScrollHeight';
            } else {
                // Fallback to largest available measurement
                const measurements = [
                    frameScrollHeight,
                    frameClientHeight,
                    frameOffsetHeight,
                    frameRect.height,
                    columnScrollHeight,
                    columnOffsetHeight,
                    columnRect.height,
                    parentScrollHeight,
                    parentClientHeight,
                    parentRect?.height || 0,
                ].filter(h => h > 0);

                fullColumnHeight = Math.max(...measurements);
                measurementSource = 'Math.max(fallback)';
            }

            const usableHeight = fullColumnHeight / scale;
            const heightCeiling = Math.max(baseContentHeightPx, 0);
            const cappedHeight = Math.min(usableHeight, heightCeiling);

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
                    parentMeasurements: parentContainer ? {
                        getBoundingClientRect: parentRect?.height,
                        scrollHeight: parentScrollHeight,
                        clientHeight: parentClientHeight,
                    } : null,
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

            // FIXED: Only call setRegionHeight if value actually changed (>1px difference)
            // This prevents excessive calls while ensuring measurement changes propagate
            // The reducer also has a heightDiff < 1 guard as a safety net
            const heightDiff = Math.abs(cappedHeight - lastSentHeightRef.current);

            if (cappedHeight > 0 && heightDiff > 1) {
                const previousSentHeight = lastSentHeightRef.current;
                lastSentHeightRef.current = cappedHeight;
                if (process.env.NODE_ENV !== 'production') {
                    console.log('📏 [StatblockPage] Setting region height', {
                        cappedHeight,
                        usableHeight,
                        fullColumnHeight,
                        measurementSource,
                        scale,
                        previousSentHeight,
                        heightDiff: Number(heightDiff.toFixed(2)),
                        timestamp: Date.now(),
                    });
                }
                layout.setRegionHeight(cappedHeight);
            } else if (process.env.NODE_ENV !== 'production' && cappedHeight > 0 && heightDiff <= 1) {
                // Log when we skip calling setRegionHeight due to small change
                console.log('📏 [StatblockPage] Skipping region height update (change too small)', {
                    cappedHeight,
                    lastSentHeight: lastSentHeightRef.current,
                    heightDiff: Number(heightDiff.toFixed(2)),
                    timestamp: Date.now(),
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
    }, [layout.setRegionHeight, layout.plan, baseContentHeightPx, scale]); // Re-measure when layout plan is created

    const spellcastingMeasurementLogRef = React.useRef(
        new Map<string, { height: number; loggedAt: number }>()
    );

    const handleMeasurements = React.useCallback(
        (updates: MeasurementRecord[]) => {
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
        [layout]
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

    useEffect(() => {
        if (!DND_CSS_BASE_URL) {
            return;
        }

        const cssFiles = ['all.css', 'bundle.css', 'style.css', '5ePHBstyle.css'];
        const appendedLinks: HTMLLinkElement[] = [];

        cssFiles.forEach((file) => {
            const existing = document.querySelector(`link[data-dnd-css="${file}"]`);
            if (existing) return;

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `${DND_CSS_BASE_URL}/${file}`;
            link.setAttribute('data-dnd-css', file);
            document.head.appendChild(link);
            appendedLinks.push(link);
        });

        return () => {
            appendedLinks.forEach((link) => {
                if (document.head.contains(link)) {
                    document.head.removeChild(link);
                }
            });
        };
    }, [page.id]);

    const scaledHeightPx = baseHeightPx * scale;
    const pageCount = Math.max(1, layout.plan?.pages.length ?? 1);

    const columnCount = pageVariablesWithMargins.columns.columnCount;
    // Use the same spacing constant as pagination to ensure CSS and layout logic match
    const columnGapPx = COMPONENT_VERTICAL_SPACING_PX;

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
    }), [baseContentHeightPx, baseHeightPx, baseWidthPx, baseTopMarginPx, baseBottomMarginPx, columnCount, pageCount, totalScaledHeightPx, scale, leftMarginPx, rightMarginPx]);

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
        <div className="dm-canvas-responsive" ref={containerRef} style={containerStyle}>
            <div className="dm-canvas-wrapper" style={transformWrapperStyle}>
                <div className="dm-canvas-renderer" style={canvasRendererStyle}>
                    <div className="dm-canvas-pages">
                        <div className="dm-canvas-pages-content">
                            <CanvasPage layoutPlan={layout.plan} renderEntry={renderWithProps} />
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="dm-canvas-measurement-layer"
                aria-hidden
                style={{
                    position: 'absolute',
                    top: '-9999px', // Move offscreen instead of collapsing
                    left: '-9999px',
                    width: `${baseWidthPx}px`, // Match page width to allow proper measurement
                    height: `${baseHeightPx}px`, // Match page height
                    overflow: 'visible', // Allow measurement of full content
                    pointerEvents: 'none',
                    visibility: 'hidden', // Hide from screen readers and visual
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
                        <div className="monster frame wide" style={{ height: 'auto' }}>
                            <div
                                className="canvas-column"
                                style={{
                                    // CRITICAL: Use measured visible column width for accurate measurements
                                    // Fallback to calculated width if measurement not available yet
                                    width: measuredColumnWidth
                                        ? `${measuredColumnWidth}px`
                                        : `${(baseWidthPx - (columnCount - 1) * columnGapPx) / columnCount}px`,
                                    flex: 'none', // Prevent flex from overriding explicit width
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
                                    coordinator={measurementCoordinator}
                                    measuredColumnWidth={measuredColumnWidth}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatblockPage: React.FC<StatblockPageProps> = (props) => (
    <CanvasLayoutProvider>
        <StatblockCanvasInner {...props} />
    </CanvasLayoutProvider>
);

export default StatblockPage;
