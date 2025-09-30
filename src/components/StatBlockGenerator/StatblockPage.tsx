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

interface StatblockPageProps {
    page: StatblockPageDocument;
    template: TemplateConfig;
    componentRegistry: Record<string, ComponentRegistryEntry>;
}

const MIN_SCALE = 0.35;
const MAX_SCALE = 2.5;
const PAGE_GAP_PX = 48;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const renderEntry = (
    entry: CanvasLayoutEntry,
    registry: Record<string, ComponentRegistryEntry>,
    props: Omit<CanvasComponentProps, 'id' | 'dataRef' | 'layout'>
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
            {...props}
        />
    );
};

const StatblockCanvasInner: React.FC<StatblockPageProps> = ({ page, template, componentRegistry }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    const layout = useCanvasLayout({
        componentInstances: page.componentInstances,
        template,
        dataSources: page.dataSources ?? [],
        componentRegistry,
        pageVariables: page.pageVariables,
    });

    const baseDimensions: BasePageDimensions = layout.baseDimensions;
    const baseWidthPx = baseDimensions.widthPx;
    const baseHeightPx = baseDimensions.heightPx;
    const baseContentHeightPx = baseDimensions.contentHeightPx;

    useLayoutEffect(() => {
        if (typeof ResizeObserver === 'undefined') {
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

            const widthScale = entry.contentRect.width / baseWidthPx;
            const nextScale = clamp(widthScale, MIN_SCALE, MAX_SCALE);
            setScale((current) => (Math.abs(current - nextScale) > 0.01 ? nextScale : current));
        });

        observer.observe(node);

        return () => observer.disconnect();
    }, [baseWidthPx]);

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
            const rect = visibleFrame.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(visibleFrame);

            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.debug('[StatblockPage] Measuring visible monster frame:', {
                    boundingHeight: rect.height,
                    computedHeight: computedStyle.height,
                    offsetHeight: (visibleFrame as HTMLElement).offsetHeight,
                    clientHeight: (visibleFrame as HTMLElement).clientHeight,
                    scrollHeight: (visibleFrame as HTMLElement).scrollHeight,
                    lastMeasured: lastMeasuredHeight,
                });
            }

            if (rect.height > 0 && Math.abs(rect.height - lastMeasuredHeight) > 1) {
                lastMeasuredHeight = rect.height;
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('[StatblockPage] SET_REGION_HEIGHT will be called with:', rect.height);
                }
                layout.setRegionHeight(rect.height);
            }
        };

        const observer = new ResizeObserver(() => {
            updateRegionHeight();
        });

        observer.observe(visibleFrame);
        // Measure immediately
        updateRegionHeight();

        return () => observer.disconnect();
    }, [layout.plan, layout.setRegionHeight]); // Wait for layout plan, then measure visible frame

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
    const columnGapPx = 24;

    const totalScaledHeightPx = pageCount * scaledHeightPx + (pageCount - 1) * PAGE_GAP_PX * scale;

    const containerStyle = useMemo<React.CSSProperties>(() => ({
        width: '100%',
        height: `${totalScaledHeightPx}px`,
        maxWidth: `${baseWidthPx * MAX_SCALE}px`,
        position: 'relative',
        overflow: 'visible',
        margin: '0 auto',
        '--dm-page-width': `${baseWidthPx}px`,
        '--dm-page-height': `${baseHeightPx}px`,
        '--dm-page-content-height': `${baseContentHeightPx}px`,
        '--dm-page-count': `${pageCount}`,
        '--dm-page-scale': `${scale}`,
        '--dm-column-count': `${columnCount}`,
        '--dm-column-gap': `${columnGapPx}px`,
    }), [baseContentHeightPx, baseHeightPx, baseWidthPx, columnCount, pageCount, totalScaledHeightPx, scale]);

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
        });

    return (
        <div className="dm-statblock-responsive" ref={containerRef} style={containerStyle}>
            <div className="brewRenderer">
                <div className="pages">
                    <div className="pages-content">
                        <CanvasPage layoutPlan={layout.plan} renderEntry={renderWithProps} />
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
                        <div className="monster frame wide">
                            <MeasurementLayer
                                entries={layout.measurementEntries}
                                renderComponent={(entry) =>
                                    renderEntry(entry, componentRegistry, {
                                        mode: page.pageVariables.mode,
                                        pageVariables: pageVariablesWithPagination,
                                        dataSources: page.dataSources ?? [],
                                    })
                                }
                                onMeasurements={layout.onMeasurements}
                            />
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
