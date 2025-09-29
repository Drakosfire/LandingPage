import type {
    LayoutPlan,
    CanvasLayoutEntry,
    LayoutColumn,
    PageLayout,
    OverflowWarning,
    RegionBuckets,
    RegionListContent,
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

interface PaginateArgs {
    buckets: RegionBuckets;
    columnCount: number;
    regionHeightPx: number;
    requestedPageCount: number;
}

const MAX_REGION_ITERATIONS = 400;

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

export const paginate = ({ buckets, columnCount, regionHeightPx, requestedPageCount }: PaginateArgs): LayoutPlan => {
    const pages: PageLayout[] = [];
    const overflowWarnings: OverflowWarning[] = [];
    const pendingQueues = new Map<string, CanvasLayoutEntry[]>();
    const routedInRegion = new Set<string>();

    const processedBuckets = new Map<string, CanvasLayoutEntry[]>(Array.from(buckets.entries(), ([key, entries]) => [key, entries]));

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
            const regionQueue: CanvasLayoutEntry[] = [...pendingEntries, ...sourceEntries];
            pendingQueues.set(key, []);

            const columnEntries: CanvasLayoutEntry[] = [];
            let yOffset = 0;
            let safetyCounter = 0;

            while (regionQueue.length > 0 && safetyCounter < MAX_REGION_ITERATIONS) {
                safetyCounter += 1;
                const entry = regionQueue.shift();
                if (!entry) {
                    break;
                }

                const estimatedHeight = entry.estimatedHeight ?? DEFAULT_COMPONENT_HEIGHT_PX;
                const fits = yOffset + estimatedHeight <= regionHeightPx;

                if (fits) {
                    const committedEntry: CanvasLayoutEntry = {
                        ...entry,
                        region: {
                            page: page.pageNumber,
                            column: column.columnNumber,
                            index: columnEntries.length,
                        },
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
                    yOffset += estimatedHeight + COMPONENT_VERTICAL_SPACING_PX;
                    continue;
                }

                overflowWarnings.push({ componentId: entry.instance.id, page: page.pageNumber, column: column.columnNumber });

                const nextRegion = findNextRegion(pages, key);

                if (!entry.regionContent || entry.regionContent.items.length <= 1) {
                    // For block entries we only want to enqueue a follow-up copy once; without this guard
                    // the overflow version gets re-enqueued forever and the paginator never advances.
                    // Keep this note because removing it caused an infinite loop earlier.
                    const routeOverflowToNextRegion = ({ allowOverflowReroute = false, forceAdvance = false }: { allowOverflowReroute?: boolean; forceAdvance?: boolean } = {}) => {
                        const alreadyRerouted = entry.overflowRouted ?? false;

                        if (alreadyRerouted && !allowOverflowReroute) {
                            return false;
                        }

                        let candidateRegion = findNextRegion(pages, key);

                        if (!candidateRegion && forceAdvance) {
                            const newPageNumber = pages.length + 1;
                            ensurePage(pages, newPageNumber, columnCount, pendingQueues);
                            candidateRegion = findNextRegion(pages, key);
                        }

                        if (!candidateRegion) {
                            return false;
                        }

                        ensurePage(pages, candidateRegion.pageNumber, columnCount, pendingQueues);

                        const previousRegion = entry.region ?? { page: page.pageNumber, column: page.columns[columnIndex].columnNumber };

                        if (!forceAdvance) {
                            if (candidateRegion.pageNumber < previousRegion.page) {
                                return false;
                            }

                            const sameRegion =
                                candidateRegion.pageNumber === previousRegion.page && candidateRegion.columnNumber === previousRegion.column;

                            if (sameRegion) {
                                return false;
                            }
                        }

                        const routeKey = `${entry.instance.id}:${candidateRegion.key}`;
                        if (routedInRegion.has(routeKey)) {
                            return false;
                        }

                        const followUp: CanvasLayoutEntry = {
                            ...entry,
                            region: {
                                page: candidateRegion.pageNumber,
                                column: candidateRegion.columnNumber,
                            },
                            overflow: true,
                            overflowRouted: true,
                            sourceRegionKey: candidateRegion.key,
                            orderIndex: entry.orderIndex,
                        };

                        const pendingQueue = getPendingQueue(candidateRegion.key);
                        pendingQueue.push(followUp);
                        routedInRegion.add(routeKey);
                        return true;
                    };

                    if (estimatedHeight > regionHeightPx) {
                        const columnHasOverflow = columnEntries.some((existing) => existing.overflow || existing.overflowRouted);
                        if (columnHasOverflow && routeOverflowToNextRegion({ allowOverflowReroute: true, forceAdvance: true })) {
                            continue;
                        }

                        const committedEntry: CanvasLayoutEntry = {
                            ...entry,
                            region: {
                                page: page.pageNumber,
                                column: column.columnNumber,
                                index: columnEntries.length,
                            },
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
                        yOffset = regionHeightPx + COMPONENT_VERTICAL_SPACING_PX;
                        routeOverflowToNextRegion({ forceAdvance: true });
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
                        continue;
                    }

                    ensurePage(pages, updatedNextRegion.pageNumber, columnCount, pendingQueues);
                    routeOverflowToNextRegion();
                    continue;
                }

                const items = entry.regionContent.items;
                const remainingItems: typeof items = [];
                const placedItems: typeof items = [];
                let cumulativeHeight = 0;
                const availableHeight = Math.max(regionHeightPx - yOffset, 0);

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
                yOffset += placedHeight + COMPONENT_VERTICAL_SPACING_PX;

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

    return { pages, overflowWarnings };
};



