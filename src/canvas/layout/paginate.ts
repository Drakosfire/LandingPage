import type {
    LayoutPlan,
    CanvasLayoutEntry,
    LayoutColumn,
    PageLayout,
    OverflowWarning,
    RegionBuckets,
    RegionListContent,
    RegionCursor,
    RegionSpan,
} from './types';
import { toRegionContent } from '../../components/StatBlockGenerator/canvasComponents/utils';
import {
    COMPONENT_VERTICAL_SPACING_PX,
    LIST_ITEM_SPACING_PX,
    computeMeasurementKey,
    estimateActionHeight,
    estimateListHeight,
    regionKey,
    toColumnType,
    DEFAULT_COMPONENT_HEIGHT_PX,
} from './utils';

interface RegionPosition {
    pageNumber: number;
    columnNumber: 1 | 2;
    key: string;
}

const normalizeRegionHeight = (
    regionHeightPx: number,
    baseDimensions: { contentHeightPx: number; topMarginPx: number } | null
): number => {
    if (!baseDimensions) {
        return regionHeightPx;
    }

    const headerAllowance = Math.max(baseDimensions.topMarginPx - COMPONENT_VERTICAL_SPACING_PX, 0);
    const adjusted = Math.max(regionHeightPx - headerAllowance, regionHeightPx * 0.9);
    return adjusted;
};

interface PaginateArgs {
    buckets: RegionBuckets;
    columnCount: number;
    regionHeightPx: number;
    requestedPageCount: number;
    baseDimensions?: { contentHeightPx: number; topMarginPx: number } | null;
    measurementVersion?: number;
}

const MAX_REGION_ITERATIONS = 400;

let debugRunId = 0;

const shouldLogPaginationDecisions = process.env.NODE_ENV !== 'production';

const logPaginationDecision = (...args: unknown[]) => {
    if (!shouldLogPaginationDecisions) {
        return;
    }
    // eslint-disable-next-line no-console
    console.debug('[paginate]', ...args);
};

const ensurePage = (
    pages: PageLayout[],
    pageNumber: number,
    columnCount: number,
    pendingQueues: Map<string, CanvasLayoutEntry[]>
) => {
    while (pages.length < pageNumber) {
        const nextPageNumber = pages.length + 1;
        const columns: LayoutColumn[] = [];
        for (let columnIndex = 1; columnIndex <= columnCount; columnIndex += 1) {
            const key = regionKey(nextPageNumber, columnIndex);
            columns.push({ columnNumber: toColumnType(columnIndex), key, entries: [] });
            if (!pendingQueues.has(key)) {
                pendingQueues.set(key, []);
            }
        }
        pages.push({ pageNumber: nextPageNumber, columns });
    }
};

const computeRegionSequence = (pages: PageLayout[]): RegionPosition[] =>
    pages.flatMap((page) =>
        page.columns.map((column) => ({
            pageNumber: page.pageNumber,
            columnNumber: column.columnNumber,
            key: column.key,
        }))
    );

const findNextRegion = (pages: PageLayout[], currentKey: string): RegionPosition | null => {
    const sequence = computeRegionSequence(pages);
    const currentIndex = sequence.findIndex((region) => region.key === currentKey);
    if (currentIndex === -1) {
        return null;
    }
    return sequence[currentIndex + 1] ?? null;
};

const createCursor = (regionKey: string, maxHeight: number): RegionCursor => ({
    regionKey,
    currentOffset: 0,
    maxHeight,
});

const computeSpan = (cursor: RegionCursor, estimatedHeight: number): RegionSpan => ({
    top: cursor.currentOffset,
    bottom: cursor.currentOffset + estimatedHeight,
    height: estimatedHeight,
});

const fitsInRegion = (span: RegionSpan, cursor: RegionCursor): boolean => span.bottom <= cursor.maxHeight;

const advanceCursor = (cursor: RegionCursor, span: RegionSpan) => {
    cursor.currentOffset = span.bottom + COMPONENT_VERTICAL_SPACING_PX;
};

const detachFromSource = (entry: CanvasLayoutEntry, key: string, buckets: Map<string, CanvasLayoutEntry[]>) => {
    if (entry.sourceRegionKey === key) {
        return;
    }
    const original = buckets.get(entry.sourceRegionKey);
    if (!original) {
        return;
    }
    const index = original.indexOf(entry);
    if (index !== -1) {
        original.splice(index, 1);
    }
};

export const paginate = ({ buckets, columnCount, regionHeightPx, requestedPageCount, baseDimensions, measurementVersion }: PaginateArgs): LayoutPlan => {
    const runId = ++debugRunId;

    const normalizedRegionHeight = normalizeRegionHeight(regionHeightPx, baseDimensions ?? null);

    logPaginationDecision(runId, 'run-start', {
        columnCount,
        regionHeightPx,
        normalizedRegionHeight,
        requestedPageCount,
        bucketCount: buckets.size,
        measurementVersion: measurementVersion ?? 'unknown',
    });

    const pages: PageLayout[] = [];
    const overflowWarnings: OverflowWarning[] = [];
    const pendingQueues = new Map<string, CanvasLayoutEntry[]>();
    const routedInRegion = new Set<string>();

    const processedBuckets = new Map<string, CanvasLayoutEntry[]>(Array.from(buckets.entries(), ([key, entries]) => [key, entries]));
    const homeBuckets = new Map<string, CanvasLayoutEntry[]>();

    processedBuckets.forEach((entries, key) => {
        entries.forEach((entry) => {
            if (!homeBuckets.has(entry.homeRegionKey)) {
                homeBuckets.set(entry.homeRegionKey, []);
            }
            homeBuckets.get(entry.homeRegionKey)!.push(entry);
        });
        entries.sort((a, b) => {
            if (a.slotIndex !== b.slotIndex) return a.slotIndex - b.slotIndex;
            return a.orderIndex - b.orderIndex;
        });
    });

    homeBuckets.forEach((entries) => {
        entries.sort((a, b) => {
            if (a.slotIndex !== b.slotIndex) return a.slotIndex - b.slotIndex;
            return a.orderIndex - b.orderIndex;
        });
    });

    const maxBucketPage = Array.from(buckets.keys()).reduce((max, key) => {
        const [pagePart] = key.split(':');
        const parsed = Number.parseInt(pagePart, 10);
        return Number.isNaN(parsed) ? max : Math.max(max, parsed);
    }, 1);

    const initialPageCount = Math.max(1, requestedPageCount, maxBucketPage);
    ensurePage(pages, initialPageCount, columnCount, pendingQueues);

    const getPendingQueue = (key: string) => {
        if (!pendingQueues.has(key)) {
            pendingQueues.set(key, []);
        }
        return pendingQueues.get(key)!;
    };

    pages.forEach((page) => {
        page.columns.forEach((column) => {
            if (!processedBuckets.has(column.key)) {
                processedBuckets.set(column.key, []);
            }
        });
    });

    const allPages = () => pages; // helper to use latest pages within closures

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
        const page = pages[pageIndex];
        for (let columnIndex = 0; columnIndex < page.columns.length; columnIndex += 1) {
            const column = page.columns[columnIndex];
            const key = column.key;
            const sourceEntries = processedBuckets.get(key) ?? [];
            const pendingEntries = getPendingQueue(key);
            const homeEntries = (homeBuckets.get(key) ?? []).filter((entry) => entry.sourceRegionKey !== key);
            const regionQueue: CanvasLayoutEntry[] = [...pendingEntries, ...sourceEntries];

            homeEntries.forEach((candidate) => {
                if (!regionQueue.includes(candidate)) {
                    regionQueue.push(candidate);
                }
            });

            regionQueue.sort((a, b) => {
                if (a.slotIndex !== b.slotIndex) return a.slotIndex - b.slotIndex;
                return a.orderIndex - b.orderIndex;
            });

            pendingQueues.set(key, []);

            const columnEntries: CanvasLayoutEntry[] = [];
            const cursor = createCursor(key, normalizedRegionHeight);
            let safetyCounter = 0;

            while (regionQueue.length > 0 && safetyCounter < MAX_REGION_ITERATIONS) {
                safetyCounter += 1;
                const entry = regionQueue.shift();
                if (!entry) {
                    break;
                }
                if (safetyCounter >= MAX_REGION_ITERATIONS) {
                    logPaginationDecision(runId, 'safety-cap-hit', {
                        regionKey: key,
                        regionQueueLength: regionQueue.length,
                    });
                }

                detachFromSource(entry, key, processedBuckets);

                const estimatedHeight = entry.estimatedHeight ?? DEFAULT_COMPONENT_HEIGHT_PX;
                const span = computeSpan(cursor, estimatedHeight);
                const fits = fitsInRegion(span, cursor);

                logPaginationDecision(runId, 'entry-check', {
                    componentId: entry.instance.id,
                    regionKey: key,
                    page: page.pageNumber,
                    column: column.columnNumber,
                    top: span.top,
                    bottom: span.bottom,
                    estimatedHeight,
                    measurementKey: entry.measurementKey,
                    needsMeasurement: entry.needsMeasurement,
                    hasEstimateOnly: estimatedHeight === DEFAULT_COMPONENT_HEIGHT_PX,
                    regionHeightPx: normalizedRegionHeight,
                    fits,
                });

                if (fits) {
                    const committedEntry: CanvasLayoutEntry = {
                        ...entry,
                        region: {
                            page: page.pageNumber,
                            column: column.columnNumber,
                            index: columnEntries.length,
                        },
                        span,
                        overflow: entry.overflow ?? false,
                        listContinuation: entry.regionContent
                            ? {
                                isContinuation: entry.regionContent.isContinuation,
                                startIndex: entry.regionContent.startIndex,
                                totalCount: entry.regionContent.totalCount,
                            }
                            : undefined,
                        sourceRegionKey: column.key,
                    };

                    columnEntries.push(committedEntry);
                    advanceCursor(cursor, span);
                    continue;
                }

                overflowWarnings.push({ componentId: entry.instance.id, page: page.pageNumber, column: column.columnNumber });

                logPaginationDecision(runId, 'entry-overflow', {
                    componentId: entry.instance.id,
                    regionKey: key,
                    page: page.pageNumber,
                    column: column.columnNumber,
                    span,
                    estimatedHeight,
                    regionHeightPx: normalizedRegionHeight,
                });

                // If component starts in the bottom 20% of available space, don't split it
                // This prevents awkward tiny fragments at the bottom of a page
                const startsInBottomFifth = span.top > (normalizedRegionHeight * 0.8);
                const shouldAvoidSplit = startsInBottomFifth && entry.regionContent && entry.regionContent.items.length > 1;

                if (shouldAvoidSplit) {
                    logPaginationDecision(runId, 'avoid-split-bottom-fifth', {
                        componentId: entry.instance.id,
                        regionKey: key,
                        spanTop: span.top,
                        threshold: normalizedRegionHeight * 0.8,
                        regionHeight: normalizedRegionHeight,
                    });
                }

                const nextRegion = findNextRegion(pages, key);

                const moveRemainingToRegion = (targetKey: string | null): boolean => {
                    if (!targetKey) {
                        return false;
                    }
                    const pendingQueue = getPendingQueue(targetKey);
                    if (regionQueue.length > 0) {
                        pendingQueue.push(...regionQueue);
                        regionQueue.length = 0;
                    }
                    return true;
                };

                if (!entry.regionContent || entry.regionContent.items.length <= 1 || shouldAvoidSplit) {
                    // For block entries we only want to enqueue a follow-up copy once; without this guard
                    // the overflow version gets re-enqueued forever and the paginator never advances.
                    // Keep this note because removing it caused an infinite loop earlier.
                    const routeOverflowToNextRegion = ({ allowOverflowReroute = false, forceAdvance = false }: { allowOverflowReroute?: boolean; forceAdvance?: boolean } = {}): string | null => {
                        const alreadyRerouted = entry.overflowRouted ?? false;

                        if (alreadyRerouted && !allowOverflowReroute) {
                            logPaginationDecision(runId, 'route-blocked-already-rerouted', {
                                componentId: entry.instance.id,
                                regionKey: key,
                                allowOverflowReroute,
                            });
                            return null;
                        }

                        let candidateRegion = findNextRegion(pages, key);

                        if (!candidateRegion && forceAdvance) {
                            const newPageNumber = pages.length + 1;
                            ensurePage(pages, newPageNumber, columnCount, pendingQueues);
                            candidateRegion = findNextRegion(pages, key);
                        }

                        if (!candidateRegion) {
                            logPaginationDecision(runId, 'route-blocked-no-candidate', {
                                componentId: entry.instance.id,
                                regionKey: key,
                                pagesCount: pages.length,
                            });
                            return null;
                        }

                        ensurePage(pages, candidateRegion.pageNumber, columnCount, pendingQueues);

                        const previousRegion = entry.region ?? { page: page.pageNumber, column: page.columns[columnIndex].columnNumber };

                        if (!forceAdvance) {
                            if (candidateRegion.pageNumber < previousRegion.page) {
                                logPaginationDecision(runId, 'route-blocked-backwards', {
                                    componentId: entry.instance.id,
                                    candidatePage: candidateRegion.pageNumber,
                                    previousPage: previousRegion.page,
                                });
                                return null;
                            }

                            const sameRegion =
                                candidateRegion.pageNumber === previousRegion.page && candidateRegion.columnNumber === previousRegion.column;

                            if (sameRegion) {
                                logPaginationDecision(runId, 'route-blocked-same-region', {
                                    componentId: entry.instance.id,
                                    regionKey: key,
                                    candidateKey: candidateRegion.key,
                                    previousRegion,
                                    candidateRegion,
                                });
                                return null;
                            }
                        }

                        const routeKey = `${entry.instance.id}:${candidateRegion.key}`;
                        if (routedInRegion.has(routeKey)) {
                            logPaginationDecision(runId, 'route-blocked-already-routed-to-region', {
                                componentId: entry.instance.id,
                                routeKey,
                            });
                            return null;
                        }

                        const followUp: CanvasLayoutEntry = {
                            ...entry,
                            region: {
                                page: candidateRegion.pageNumber,
                                column: candidateRegion.columnNumber,
                            },
                            span: undefined,
                            overflow: true,
                            overflowRouted: true,
                            sourceRegionKey: candidateRegion.key,
                            orderIndex: entry.orderIndex,
                        };

                        const pendingQueue = getPendingQueue(candidateRegion.key);
                        pendingQueue.push(followUp);
                        routedInRegion.add(routeKey);
                        logPaginationDecision(runId, 'route-entry', {
                            componentId: entry.instance.id,
                            from: key,
                            to: candidateRegion.key,
                            targetPage: candidateRegion.pageNumber,
                            targetColumn: candidateRegion.columnNumber,
                        });
                        return candidateRegion.key;
                    };

                    if (estimatedHeight > normalizedRegionHeight) {
                        const columnHasOverflow = columnEntries.some((existing) => existing.overflow || existing.overflowRouted);
                        const rerouteKey = routeOverflowToNextRegion({ allowOverflowReroute: true, forceAdvance: true });
                        if (columnHasOverflow && rerouteKey) {
                            moveRemainingToRegion(rerouteKey);
                            logPaginationDecision(runId, 'move-remaining-after-reroute', {
                                componentId: entry.instance.id,
                                from: key,
                                to: rerouteKey,
                                pendingCount: regionQueue.length,
                            });
                            break;
                        }

                        const committedEntry: CanvasLayoutEntry = {
                            ...entry,
                            region: {
                                page: page.pageNumber,
                                column: column.columnNumber,
                                index: columnEntries.length,
                            },
                            span,
                            overflow: true,
                            listContinuation: entry.regionContent
                                ? {
                                    isContinuation: entry.regionContent.isContinuation,
                                    startIndex: entry.regionContent.startIndex,
                                    totalCount: entry.regionContent.totalCount,
                                }
                                : undefined,
                            sourceRegionKey: column.key,
                        };

                        columnEntries.push(committedEntry);

                        // Mark the column as full so subsequent entries route elsewhere
                        cursor.currentOffset = normalizedRegionHeight + COMPONENT_VERTICAL_SPACING_PX;
                        const forcedRouteKey = routeOverflowToNextRegion({ forceAdvance: true });
                        const movedRemainingToRegion = moveRemainingToRegion(forcedRouteKey ?? null);
                        logPaginationDecision(runId, 'force-route', {
                            componentId: entry.instance.id,
                            from: key,
                            to: forcedRouteKey,
                            movedRemaining: movedRemainingToRegion,
                        });
                        if (movedRemainingToRegion) {
                            break;
                        }
                        continue;
                    }

                    if (!nextRegion) {
                        const newPageNumber = pages.length + 1;
                        ensurePage(pages, newPageNumber, columnCount, pendingQueues);
                    }

                    const updatedNextRegion = findNextRegion(pages, key);
                    if (!updatedNextRegion) {
                        const committedEntry: CanvasLayoutEntry = {
                            ...entry,
                            region: {
                                page: page.pageNumber,
                                column: column.columnNumber,
                                index: columnEntries.length,
                            },
                            span,
                            overflow: true,
                            listContinuation: entry.regionContent
                                ? {
                                    isContinuation: entry.regionContent.isContinuation,
                                    startIndex: entry.regionContent.startIndex,
                                    totalCount: entry.regionContent.totalCount,
                                }
                                : undefined,
                            sourceRegionKey: column.key,
                        };

                        columnEntries.push(committedEntry);
                        // Mark region as full to prevent subsequent entries from overlapping
                        cursor.currentOffset = normalizedRegionHeight + COMPONENT_VERTICAL_SPACING_PX;
                        logPaginationDecision(runId, 'region-full-no-next', {
                            componentId: entry.instance.id,
                            regionKey: key,
                        });
                        continue;
                    }

                    ensurePage(pages, updatedNextRegion.pageNumber, columnCount, pendingQueues);
                    const routedNextKey = routeOverflowToNextRegion();
                    const movedRemaining = moveRemainingToRegion(routedNextKey ?? null);
                    logPaginationDecision(runId, 'route-remaining', {
                        componentId: entry.instance.id,
                        from: key,
                        to: routedNextKey,
                        movedRemaining,
                    });
                    if (movedRemaining) {
                        break;
                    }
                    continue;
                }

                const items = entry.regionContent.items;
                const remainingItems: typeof items = [];
                const placedItems: typeof items = [];
                let cumulativeHeight = 0;
                const availableHeight = Math.max(normalizedRegionHeight - cursor.currentOffset, 0);

                items.forEach((item, itemIndex) => {
                    const itemHeight = estimateActionHeight(item) + (itemIndex > 0 ? LIST_ITEM_SPACING_PX : 0);
                    if (cumulativeHeight + itemHeight <= availableHeight || placedItems.length === 0) {
                        placedItems.push(item);
                        cumulativeHeight += itemHeight;
                    } else {
                        remainingItems.push(item);
                    }
                });

                if (placedItems.length === 0) {
                    const committedEntry: CanvasLayoutEntry = {
                        ...entry,
                        region: {
                            page: page.pageNumber,
                            column: column.columnNumber,
                            index: columnEntries.length,
                        },
                        span,
                        overflow: true,
                        listContinuation: entry.regionContent
                            ? {
                                isContinuation: entry.regionContent.isContinuation,
                                startIndex: entry.regionContent.startIndex,
                                totalCount: entry.regionContent.totalCount,
                            }
                            : undefined,
                    };

                    columnEntries.push(committedEntry);
                    // Mark region as full since even a single list item won't fit
                    cursor.currentOffset = normalizedRegionHeight + COMPONENT_VERTICAL_SPACING_PX;
                    logPaginationDecision(runId, 'region-full-no-space-for-list', {
                        componentId: entry.instance.id,
                        regionKey: key,
                        availableHeight,
                        estimatedItemHeight: items.length > 0 ? estimateActionHeight(items[0]) : 0,
                    });
                    continue;
                }

                const placedContent = toRegionContent(
                    entry.regionContent.kind,
                    placedItems,
                    entry.regionContent.startIndex,
                    entry.regionContent.totalCount,
                    entry.regionContent.isContinuation,
                    entry.regionContent.metadata
                );

                const placedHeight = cumulativeHeight;
                const placedEntry: CanvasLayoutEntry = {
                    ...entry,
                    regionContent: placedContent,
                    measurementKey: computeMeasurementKey(entry.instance.id, placedContent),
                    region: {
                        page: page.pageNumber,
                        column: column.columnNumber,
                        index: columnEntries.length,
                    },
                    estimatedHeight: placedHeight,
                    span: computeSpan(cursor, placedHeight),
                    overflow: entry.overflow ?? false,
                    overflowRouted: false,
                    listContinuation: {
                        isContinuation: placedContent.isContinuation,
                        startIndex: placedContent.startIndex,
                        totalCount: placedContent.totalCount,
                    },
                    sourceRegionKey: column.key,
                };

                columnEntries.push(placedEntry);
                advanceCursor(cursor, placedEntry.span!);

                if (remainingItems.length > 0) {
                    if (!nextRegion) {
                        const newPageNumber = pages.length + 1;
                        ensurePage(pages, newPageNumber, columnCount, pendingQueues);
                    }

                    const updatedNextRegion = findNextRegion(pages, key);

                    if (!updatedNextRegion) {
                        columnEntries[columnEntries.length - 1] = {
                            ...columnEntries[columnEntries.length - 1],
                            overflow: true,
                        };
                        continue;
                    }

                    ensurePage(pages, updatedNextRegion.pageNumber, columnCount, pendingQueues);

                    const followUpContent = toRegionContent(
                        entry.regionContent.kind,
                        remainingItems,
                        entry.regionContent.startIndex + placedItems.length,
                        entry.regionContent.totalCount,
                        true,
                        entry.regionContent.metadata
                    );

                    const followUpEntry: CanvasLayoutEntry = {
                        ...entry,
                        regionContent: followUpContent,
                        measurementKey: computeMeasurementKey(entry.instance.id, followUpContent),
                        estimatedHeight: estimateListHeight(remainingItems),
                        span: undefined,
                        overflow: true,
                        overflowRouted: true,
                        region: {
                            page: updatedNextRegion.pageNumber,
                            column: updatedNextRegion.columnNumber,
                        },
                        sourceRegionKey: updatedNextRegion.key,
                        listContinuation: {
                            isContinuation: followUpContent.isContinuation,
                            startIndex: followUpContent.startIndex,
                            totalCount: followUpContent.totalCount,
                        },
                    };

                    const pendingQueue = getPendingQueue(updatedNextRegion.key);
                    pendingQueue.push(followUpEntry);
                }
            }

            column.entries = columnEntries;
            processedBuckets.set(key, columnEntries);
        }
    }

    logPaginationDecision(runId, 'run-finish', {
        pageCount: pages.length,
        overflowCount: overflowWarnings.length,
        normalizedRegionHeight,
    });

    return { pages, overflowWarnings };
};



