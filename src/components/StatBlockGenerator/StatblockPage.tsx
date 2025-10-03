import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type {
    CanvasComponentProps,
    ComponentRegistryEntry,
    PageVariables,
    StatblockPageDocument,
    TemplateConfig,
} from '../../types/statblockCanvas.types';
import { DND_CSS_BASE_URL } from '../../config';
import '../../styles/StatblockCanvas.css';
import type { CanvasLayoutEntry } from '../../canvas/layout/types';
import { CanvasLayoutProvider } from '../../canvas/layout/state';
import { useCanvasLayout } from '../../canvas/hooks/useCanvasLayout';
import { CanvasPage } from '../../canvas/components/CanvasPage';
import { MeasurementLayer } from '../../canvas/layout/measurement';
import type { BasePageDimensions } from '../../canvas/layout/utils';
import { COMPONENT_VERTICAL_SPACING_PX } from '../../canvas/layout/utils';

interface StatblockPageProps {
    page: StatblockPageDocument;
    template: TemplateConfig;
    componentRegistry: Record<string, ComponentRegistryEntry>;
    isEditMode?: boolean;
    onUpdateData?: (updates: Partial<import('../../types/statblock.types').StatBlockDetails>) => void;
}

const MIN_SCALE = 0.35;
const MAX_SCALE = 2.5;
const PAGE_GAP_PX = 48;

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
            regionContent={entry.regionContent}
            regionOverflow={Boolean(entry.overflow)}
            isEditMode={isEditMode}
            onUpdateData={onUpdateData}
            {...props}
        />
    );
};

const StatblockCanvasInner: React.FC<StatblockPageProps> = ({ page, template, componentRegistry, isEditMode, onUpdateData }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [fontsReady, setFontsReady] = useState(false);

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

                if (process.env.NODE_ENV !== 'production') {
                    console.debug('[StatblockPage] Custom fonts loaded');
                }
                setFontsReady(true);
            } catch (error) {
                console.warn('[StatblockPage] Font loading failed, proceeding anyway:', error);
                setFontsReady(true); // Proceed even if font loading fails
            }
        };

        checkFonts();
    }, []);

    const layout = useCanvasLayout({
        componentInstances: fontsReady ? page.componentInstances : [],
        template,
        dataSources: fontsReady ? (page.dataSources ?? []) : [],
        componentRegistry,
        pageVariables: page.pageVariables,
    });

    const baseDimensions: BasePageDimensions = layout.baseDimensions;
    const baseWidthPx = baseDimensions.widthPx;
    const baseHeightPx = baseDimensions.heightPx;
    const baseContentHeightPx = baseDimensions.contentHeightPx;

    console.log('[StatblockPage] Base dimensions:', { baseWidthPx, baseHeightPx, baseContentHeightPx });
    console.log('[StatblockPage] About to declare ResizeObserver useLayoutEffect');

    useLayoutEffect(() => {
        console.log('[StatblockPage] ✨ INSIDE ResizeObserver useLayoutEffect callback', { baseWidthPx, hasContainer: !!containerRef.current });

        if (typeof ResizeObserver === 'undefined') {
            console.warn('[StatblockPage] ResizeObserver not available');
            return undefined;
        }

        const node = containerRef.current;
        if (!node || baseWidthPx === 0) {
            console.warn('[StatblockPage] Cannot setup ResizeObserver:', { hasNode: !!node, baseWidthPx });
            return undefined;
        }

        console.log('[StatblockPage] Setting up ResizeObserver...');

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

            // Measure the actual brewRenderer after scale is applied
            const brewWrapper = node.querySelector('.brewRenderer-wrapper');
            const brewRect = brewWrapper?.getBoundingClientRect();

            console.log('[SCALE MEASUREMENT]', {
                container: {
                    totalWidth: entry.contentRect.width,
                    paddingLeft,
                    paddingRight,
                    availableWidth,
                },
                page: {
                    baseWidthPx,
                    baseHeightPx,
                },
                scale: {
                    calculatedScale: widthScale,
                    clampedScale: nextScale,
                    MIN_SCALE,
                    MAX_SCALE,
                },
                brewWrapper: brewRect ? {
                    renderedWidth: brewRect.width,
                    renderedHeight: brewRect.height,
                    fitsInAvailable: brewRect.width <= availableWidth,
                    overflow: brewRect.width > availableWidth ? (brewRect.width - availableWidth) : 0,
                } : { status: 'not yet rendered' },
            });

            setScale((current) => (Math.abs(current - nextScale) > 0.01 ? nextScale : current));
        });

        observer.observe(node);
        console.log('[StatblockPage] ResizeObserver active');

        return () => observer.disconnect();
    }, [baseWidthPx, baseHeightPx, layout.plan?.pages.length]); // Re-run when page count changes

    // Measure the VISIBLE monster frame (not the measurement layer) for accurate pagination
    useLayoutEffect(() => {
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.debug('[StatblockPage] useLayoutEffect for monster frame measurement triggered', {
                hasLayoutPlan: !!layout.plan,
                pageCount: layout.plan?.pages.length ?? 0,
            });
        }

        // Wait for layout to render before measuring
        if (!layout.plan || layout.plan.pages.length === 0) {
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.debug('[StatblockPage] No layout plan yet, skipping frame measurement');
            }
            return undefined;
        }

        if (typeof ResizeObserver === 'undefined') {
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.warn('[StatblockPage] ResizeObserver not available');
            }
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
                brewRenderer: container.querySelector('.brewRenderer'),
                allMonsterFrames: container.querySelectorAll('.monster.frame.wide').length,
            });
        }

        // Query for the visible monster frame (NOT in the measurement layer)
        // Use a more specific selector to avoid the measurement layer
        const visibleFrame = container.querySelector('.brewRenderer .pages .monster.frame.wide');
        if (!visibleFrame) {
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.warn('[StatblockPage] Could not find visible monster frame for measurement', {
                    containerClassName: container.className,
                    hasBrewRenderer: !!container.querySelector('.brewRenderer'),
                    hasPages: !!container.querySelector('.brewRenderer .pages'),
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

        let lastMeasuredHeight = 0;

        const updateRegionHeight = () => {
            // NEW: Measure the COLUMN, not the frame!
            const column = visibleFrame.querySelector('.canvas-column');
            if (!column) {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn('[updateRegionHeight] ⚠️ canvas-column not found inside frame');
                }
                return;
            }

            const rect = visibleFrame.getBoundingClientRect();
            const columnRect = column.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(visibleFrame);
            const columnStyle = window.getComputedStyle(column);

            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.debug('[updateRegionHeight] 🔍 Measuring frame AND column:', {
                    frameHeight: rect.height,
                    columnHeight: columnRect.height,
                    framePadding: {
                        top: computedStyle.paddingTop,
                        bottom: computedStyle.paddingBottom
                    },
                    columnGap: columnStyle.gap,
                    scrollHeight: (visibleFrame as HTMLElement).scrollHeight,
                    lastMeasured: lastMeasuredHeight,
                    heightDiff: Math.abs(columnRect.height - lastMeasuredHeight),
                    willUpdate: columnRect.height > 0 && Math.abs(columnRect.height - lastMeasuredHeight) > 1,
                });
            }

            // Use COLUMN height, not frame height!
            const usableHeight = columnRect.height;

            if (usableHeight > 0 && Math.abs(usableHeight - lastMeasuredHeight) > 1) {
                lastMeasuredHeight = usableHeight;
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('[updateRegionHeight] ✅ ACTUAL COLUMN HEIGHT MEASURED:', {
                        actualColumnHeight: usableHeight,
                        frameHeight: rect.height,
                        overhead: rect.height - usableHeight,
                        previousHeight: lastMeasuredHeight,
                        message: '🎯 Using COLUMN height (actual usable area) - calling setRegionHeight()'
                    });
                }
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

    const columnCount = page.pageVariables.columns.columnCount;
    // Use the same spacing constant as pagination to ensure CSS and layout logic match
    const columnGapPx = COMPONENT_VERTICAL_SPACING_PX;

    const totalScaledHeightPx = pageCount * scaledHeightPx + (pageCount - 1) * PAGE_GAP_PX * scale;

    // Debug height calculations
    if (process.env.NODE_ENV !== 'production') {
        // Use effect to measure after render
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            const brewWrapper = containerRef.current?.querySelector('.brewRenderer-wrapper');
            if (brewWrapper) {
                const actualHeight = brewWrapper.getBoundingClientRect().height;
                console.log('[HEIGHT CALC]', {
                    baseHeightPx,
                    scale,
                    scaledHeightPx,
                    pageCount,
                    gapContribution: (pageCount - 1) * PAGE_GAP_PX * scale,
                    calculatedTotalHeight: totalScaledHeightPx,
                    actualWrapperHeight: actualHeight,
                    heightDifference: Math.abs(totalScaledHeightPx - actualHeight),
                    isWithinTolerance: Math.abs(totalScaledHeightPx - actualHeight) < 5,
                });
            }
        }, [totalScaledHeightPx, scale, pageCount]);
    }

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

    const brewRendererStyle = useMemo<React.CSSProperties>(() => ({
        width: `${baseWidthPx}px`,
        height: `${baseHeightPx * pageCount + (pageCount - 1) * PAGE_GAP_PX}px`,
    }), [baseWidthPx, baseHeightPx, pageCount]);

    const pageVariablesWithPagination: PageVariables = useMemo(() => {
        if (!layout.plan) {
            return page.pageVariables;
        }

        const requestedPageCount = page.pageVariables.pagination?.pageCount ?? 1;
        if (layout.plan.pages.length === requestedPageCount) {
            return page.pageVariables;
        }

        return {
            ...page.pageVariables,
            pagination: {
                ...(page.pageVariables.pagination ?? {
                    columnCount: page.pageVariables.columns.columnCount,
                    pageCount: requestedPageCount,
                }),
                pageCount: layout.plan.pages.length,
            },
        };
    }, [layout.plan, page.pageVariables]);

    const renderWithProps = (entry: CanvasLayoutEntry) =>
        renderEntry(entry, componentRegistry, {
            mode: page.pageVariables.mode,
            pageVariables: pageVariablesWithPagination,
            dataSources: page.dataSources ?? [],
        }, isEditMode, onUpdateData);

    // Show loading state while fonts load
    if (!fontsReady) {
        return (
            <div className="dm-statblock-responsive" style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center', color: '#666' }}>
                    <p>Loading fonts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dm-statblock-responsive" ref={containerRef} style={containerStyle}>
            <div className="brewRenderer-wrapper" style={transformWrapperStyle}>
                <div className="brewRenderer" style={brewRendererStyle}>
                    <div className="pages">
                        <div className="pages-content">
                            <CanvasPage layoutPlan={layout.plan} renderEntry={renderWithProps} />
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="dm-statblock-measurement-layer"
                aria-hidden
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 0,
                    height: 0,
                    overflow: 'hidden',
                    pointerEvents: 'none',
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
                            <div className="canvas-column">
                                <MeasurementLayer
                                    entries={layout.measurementEntries}
                                    renderComponent={(entry) =>
                                        renderEntry(entry, componentRegistry, {
                                            mode: page.pageVariables.mode,
                                            pageVariables: pageVariablesWithPagination,
                                            dataSources: page.dataSources ?? [],
                                        }, isEditMode, onUpdateData)
                                    }
                                    onMeasurements={layout.onMeasurements}
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
