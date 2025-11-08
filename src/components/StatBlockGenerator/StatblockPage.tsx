import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type {
    CanvasComponentProps,
    ComponentRegistryEntry,
    PageVariables,
    StatblockPageDocument,
    TemplateConfig,
} from '../../types/statblockCanvas.types';
import { DND_CSS_BASE_URL } from '../../config';
import '../../styles/canvas/index.css';         // Shared canvas styles
import '../../styles/StatblockComponents.css';  // StatBlock-specific styles
import type { CanvasLayoutEntry, BasePageDimensions } from 'dungeonmind-canvas';
import { CanvasLayoutProvider } from 'dungeonmind-canvas';
import { useCanvasLayout } from 'dungeonmind-canvas';
import { CanvasPage } from 'dungeonmind-canvas';
import { MeasurementLayer, MeasurementCoordinator } from 'dungeonmind-canvas';
import { COMPONENT_VERTICAL_SPACING_PX } from 'dungeonmind-canvas';
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

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const renderEntry = (
    entry: CanvasLayoutEntry,
    registry: Record<string, ComponentRegistryEntry>,
    props: Omit<CanvasComponentProps, 'id' | 'dataRef' | 'layout'>,
    isEditMode?: boolean,
    onUpdateData?: (updates: Partial<import('../../types/statblock.types').StatBlockDetails>) => void
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
            onUpdateData={onUpdateData}
            {...props}
        />
    );
};

const StatblockCanvasInner: React.FC<StatblockPageProps> = ({ page, template, componentRegistry, isEditMode, onUpdateData, measurementCoordinator }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [fontsReady, setFontsReady] = useState(false);
    const [measuredColumnWidth, setMeasuredColumnWidth] = useState<number | null>(null);

    // Create statblock adapters (memoized)
    const adapters = useMemo(() => createStatblockAdapters(), []);

    // DEBUG: Log edit mode prop
    console.log('📄 [StatblockPage] Received isEditMode prop:', isEditMode);

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
            leftMm: page.pageVariables.margins?.leftMm,
            rightMm: page.pageVariables.margins?.rightMm,
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

    const baseDimensions: BasePageDimensions = layout.baseDimensions;
    const baseWidthPx = baseDimensions.widthPx;
    const baseHeightPx = baseDimensions.heightPx;
    const baseContentHeightPx = baseDimensions.contentHeightPx;

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

        let lastMeasuredHeight = 0;

        const updateRegionHeight = () => {
            // Measure the COLUMN, not the frame
            const column = visibleFrame.querySelector('.canvas-column');
            if (!column) {
                return;
            }

            const columnRect = column.getBoundingClientRect();

            // CRITICAL: Divide by scale to get pre-transform height
            // The visible layer is scaled down (e.g., 0.777x), so we measure 764px
            // But pagination needs PRE-TRANSFORM height (983px) to match measurement layer
            const usableHeight = columnRect.height / scale;

            if (usableHeight > 0 && Math.abs(usableHeight - lastMeasuredHeight) > 1) {
                lastMeasuredHeight = usableHeight;
                layout.setRegionHeight(usableHeight);
            }
        };

        const observer = new ResizeObserver(() => {
            updateRegionHeight();
        });

        observer.observe(visibleFrame);
        // Measure immediately
        updateRegionHeight();

        return () => observer.disconnect();
    }, [layout.setRegionHeight, layout.plan]); // Re-measure when layout plan is created

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
    }), [baseContentHeightPx, baseHeightPx, baseWidthPx, columnCount, pageCount, totalScaledHeightPx, scale]);

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
                                    renderComponent={(entry) =>
                                        renderEntry(entry, componentRegistry, {
                                            mode: pageVariablesWithMargins.mode,
                                            pageVariables: pageVariablesWithPagination,
                                            dataSources: page.dataSources ?? [],
                                        }, isEditMode, onUpdateData)
                                    }
                                    onMeasurements={layout.onMeasurements}
                                    coordinator={measurementCoordinator}
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
