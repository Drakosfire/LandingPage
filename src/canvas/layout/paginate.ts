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
        if (process.env.NODE_ENV !== 'production') {
            console.debug('[normalizeRegionHeight] No baseDimensions, using raw regionHeightPx:', regionHeightPx);
        }
        return regionHeightPx;
    }

    const headerAllowance = Math.max(baseDimensions.topMarginPx - COMPONENT_VERTICAL_SPACING_PX, 0);
    const adjusted = Math.max(regionHeightPx - headerAllowance, regionHeightPx * 0.9);

    if (process.env.NODE_ENV !== 'production') {
        console.debug('[normalizeRegionHeight] 🎯 HEIGHT CALCULATION:', {
            inputRegionHeightPx: regionHeightPx,
            baseContentHeightPx: baseDimensions.contentHeightPx,
            topMarginPx: baseDimensions.topMarginPx,
            headerAllowance,
            calculatedOptions: {
                minusAllowance: regionHeightPx - headerAllowance,
                times90Percent: regionHeightPx * 0.9
            },
            finalAdjustedHeight: adjusted,
            message: regionHeightPx < 850 ? '✅ Using MEASURED frame height' : '❌ Using THEORETICAL page height'
        });
    }

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
const MAX_PAGES = 10; // Circuit breaker to prevent infinite pagination loops

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
): boolean => {
    while (pages.length < pageNumber) {
        const nextPageNumber = pages.length + 1;

        // Circuit breaker: prevent infinite pagination
        if (nextPageNumber > MAX_PAGES) {
            console.error('[paginate] ⚠️ MAX_PAGES LIMIT REACHED:', {
                currentPages: pages.length,
                requestedPage: pageNumber,
                maxPages: MAX_PAGES,
                reason: 'Pagination stopped to prevent infinite loop',
                suggestion: 'Check for components with abnormal heights (>1500px) that never fit on a page',
            });
            return false; // Signal that we hit the limit
        }

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
    return true; // Successfully created pages
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

// Track previous regionHeight to detect feedback loops
let lastRegionHeightPx: number | null = null;
let lastNormalizedHeight: number | null = null;

/**
 * Split decision result for list components
 */
interface SplitDecision {
    canPlace: boolean;              // Can we place any items?
    placedItems: unknown[];         // Items to place in current region
    remainingItems: unknown[];      // Items to move to next region
    placedHeight: number;           // Height of placed segment
    placedTop: number;              // Top position in region
    placedBottom: number;           // Bottom position in region
    willOverflow: boolean;          // Will placed segment exceed region boundary?
    reason: string;                 // Why this decision was made
}

/**
 * Find best split point for list component using measurement-based evaluation.
 * 
 * Algorithm:
 * 1. Try splits from largest to smallest (greedy: maximize items in current region)
 * 2. For each split option, MEASURE where it would be placed
 * 3. Check constraints:
 *    - Top: Does it start in bottom 20%? (invalid except minimum-1-item rule)
 *    - Bottom: Does it exceed region boundary? (try fewer items)
 * 4. Return first split that satisfies constraints
 * 
 * @param entry - Layout entry with regionContent
 * @param cursor - Current position in region
 * @param regionHeight - Total region height
 * @returns Split decision with placement details
 */
const findBestListSplit = (
    entry: CanvasLayoutEntry,
    cursor: RegionCursor,
    regionHeight: number
): SplitDecision => {
    const items = entry.regionContent!.items;
    const BOTTOM_THRESHOLD = 0.80; // Cannot start in bottom 20%
    const currentOffset = cursor.currentOffset;

    // Try splits from largest to smallest (greedy: maximize items in current region)
    for (let splitAt = items.length; splitAt > 0; splitAt--) {
        const firstSegment = items.slice(0, splitAt);
        const secondSegment = items.slice(splitAt);

        // MEASURE where this split would place
        const firstSegmentHeight = estimateListHeight(firstSegment);
        const firstSegmentTop = currentOffset;
        const firstSegmentBottom = firstSegmentTop + firstSegmentHeight;

        // CHECK constraint: Does it start in bottom 20%?
        const startsInBottomZone = firstSegmentTop > (regionHeight * BOTTOM_THRESHOLD);

        if (startsInBottomZone) {
            // Invalid start position
            if (splitAt === 1) {
                // Minimum rule: Always place at least 1 item, even if in bottom zone
                return {
                    canPlace: true,
                    placedItems: firstSegment,
                    remainingItems: secondSegment,
                    placedHeight: firstSegmentHeight,
                    placedTop: firstSegmentTop,
                    placedBottom: firstSegmentBottom,
                    willOverflow: firstSegmentBottom > regionHeight,
                    reason: `Minimum rule: Place 1 item despite starting at ${((firstSegmentTop / regionHeight) * 100).toFixed(1)}% (in bottom 20%)`,
                };
            }
            // Try fewer items
            continue;
        }

        // CHECK constraint: Does it exceed region boundary?
        const exceedsRegion = firstSegmentBottom > regionHeight;

        if (!exceedsRegion) {
            // Fits completely - this is our best split
            return {
                canPlace: true,
                placedItems: firstSegment,
                remainingItems: secondSegment,
                placedHeight: firstSegmentHeight,
                placedTop: firstSegmentTop,
                placedBottom: firstSegmentBottom,
                willOverflow: false,
                reason: `Fits completely: ${splitAt} item(s) at ${((firstSegmentTop / regionHeight) * 100).toFixed(1)}%-${((firstSegmentBottom / regionHeight) * 100).toFixed(1)}%`,
            };
        }

        // Overflows but starts in valid zone - try fewer items
        // (continue loop)
    }

    // Should never reach here due to minimum-1-item rule
    return {
        canPlace: false,
        placedItems: [],
        remainingItems: items,
        placedHeight: 0,
        placedTop: currentOffset,
        placedBottom: currentOffset,
        willOverflow: false,
        reason: 'No valid split found (should not reach here)',
    };
};

export const paginate = ({ buckets, columnCount, regionHeightPx, requestedPageCount, baseDimensions, measurementVersion }: PaginateArgs): LayoutPlan => {
    const runId = ++debugRunId;

    const normalizedRegionHeight = normalizeRegionHeight(regionHeightPx, baseDimensions ?? null);

    // Detect regionHeight changes (feedback loop indicator)
    const regionHeightChanged = lastRegionHeightPx !== null && Math.abs(lastRegionHeightPx - regionHeightPx) > 1;
    const normalizedHeightChanged = lastNormalizedHeight !== null && Math.abs(lastNormalizedHeight - normalizedRegionHeight) > 1;

    logPaginationDecision(runId, 'run-start', {
        columnCount,
        regionHeightPx,
        normalizedRegionHeight,
        requestedPageCount,
        bucketCount: buckets.size,
        measurementVersion: measurementVersion ?? 'unknown',
        heightChanges: regionHeightChanged ? {
            previousRaw: lastRegionHeightPx,
            currentRaw: regionHeightPx,
            rawDelta: regionHeightPx - (lastRegionHeightPx ?? 0),
            previousNormalized: lastNormalizedHeight,
            currentNormalized: normalizedRegionHeight,
            normalizedDelta: normalizedRegionHeight - (lastNormalizedHeight ?? 0),
            warningFeedbackLoop: normalizedHeightChanged,
        } : null,
    });

    lastRegionHeightPx = regionHeightPx;
    lastNormalizedHeight = normalizedRegionHeight;

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
    if (!ensurePage(pages, initialPageCount, columnCount, pendingQueues)) {
        // Hit MAX_PAGES limit during initial setup
        return { pages, overflowWarnings: [] };
    }

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

            if (process.env.NODE_ENV !== 'production') {
                logPaginationDecision(runId, 'region-start', {
                    regionKey: key,
                    page: page.pageNumber,
                    column: column.columnNumber,
                    normalizedRegionHeight,
                    queueLength: regionQueue.length,
                    queueComponents: regionQueue.map(e => e.instance.id),
                });
            }

            while (regionQueue.length > 0 && safetyCounter < MAX_REGION_ITERATIONS) {
                safetyCounter += 1;
                const entry = regionQueue.shift();
                if (!entry) {
                    break;
                }

                // Track component-12 processing
                if (process.env.NODE_ENV !== 'production' && entry.instance.id === 'component-12') {
                    console.warn('[paginate] 📦 PROCESSING component-12 from queue:', {
                        runId,
                        regionKey: key,
                        queueRemaining: regionQueue.length,
                        estimatedHeight: entry.estimatedHeight,
                        overflow: entry.overflow,
                        overflowRouted: entry.overflowRouted,
                        hasSpan: !!entry.span,
                        spanHeight: entry.span?.height,
                        safetyCounter,
                    });
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

                // Calculate available space for debugging
                const availableSpace = cursor.maxHeight - cursor.currentOffset;
                const spaceNeeded = estimatedHeight;
                const spaceDeficit = fits ? 0 : spaceNeeded - availableSpace;
                const utilizationPercent = ((cursor.currentOffset / cursor.maxHeight) * 100).toFixed(1);

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
                    spaceAnalysis: {
                        cursorOffset: cursor.currentOffset,
                        availableSpace,
                        spaceNeeded,
                        spaceDeficit,
                        utilizationPercent: `${utilizationPercent}%`,
                        willOverflow: !fits,
                    },
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
                    const prevOffset = cursor.currentOffset;
                    advanceCursor(cursor, span);

                    logPaginationDecision(runId, 'entry-placed', {
                        componentId: entry.instance.id,
                        regionKey: key,
                        spanTop: span.top,
                        spanBottom: span.bottom,
                        spanHeight: span.height,
                        cursorBefore: prevOffset,
                        cursorAfter: cursor.currentOffset,
                        cursorAdvance: cursor.currentOffset - prevOffset,
                        remainingSpace: cursor.maxHeight - cursor.currentOffset,
                    });
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
                    hasRegionContent: !!entry.regionContent,
                    itemCount: entry.regionContent?.items.length ?? 0,
                });

                // Measurement-based split evaluation for list components
                // For list components with multiple items, use concrete measurements to determine
                // the best split point. For block components, use simple threshold check.
                const startsInBottomFifth = span.top > (normalizedRegionHeight * 0.8);
                let shouldAvoidSplit = startsInBottomFifth; // Default: simple threshold for blocks
                let splitDecision: SplitDecision | null = null;

                // For list components with multiple items, use measurement-based evaluation
                if (entry.regionContent && entry.regionContent.items.length > 1) {
                    console.log(`🔍 [paginate] Evaluating list split for ${entry.instance.id} with ${entry.regionContent.items.length} items`);

                    splitDecision = findBestListSplit(entry, cursor, normalizedRegionHeight);

                    // If split evaluation says we can't place, treat like shouldAvoidSplit
                    if (!splitDecision.canPlace) {
                        shouldAvoidSplit = true;
                    }

                    // Direct console logging for visibility
                    console.log(`📊 [paginate] Split decision for ${entry.instance.id}:`, {
                        canPlace: splitDecision.canPlace,
                        placedItems: splitDecision.placedItems.length,
                        remainingItems: splitDecision.remainingItems.length,
                        placedTop: `${splitDecision.placedTop}px (${((splitDecision.placedTop / normalizedRegionHeight) * 100).toFixed(1)}%)`,
                        placedBottom: `${splitDecision.placedBottom}px (${((splitDecision.placedBottom / normalizedRegionHeight) * 100).toFixed(1)}%)`,
                        willOverflow: splitDecision.willOverflow,
                        reason: splitDecision.reason,
                    });

                    logPaginationDecision(runId, 'measured-split-decision', {
                        componentId: entry.instance.id,
                        regionKey: key,
                        currentOffset: cursor.currentOffset,
                        regionHeight: normalizedRegionHeight,
                        splitDecision: {
                            canPlace: splitDecision.canPlace,
                            placedItems: splitDecision.placedItems.length,
                            remainingItems: splitDecision.remainingItems.length,
                            placedTop: splitDecision.placedTop,
                            placedBottom: splitDecision.placedBottom,
                            placedTopPercent: `${((splitDecision.placedTop / normalizedRegionHeight) * 100).toFixed(1)}%`,
                            placedBottomPercent: `${((splitDecision.placedBottom / normalizedRegionHeight) * 100).toFixed(1)}%`,
                            willOverflow: splitDecision.willOverflow,
                            reason: splitDecision.reason,
                        },
                    });
                } else {
                    // Block component or single-item list: use simple threshold check
                    if (shouldAvoidSplit) {
                        logPaginationDecision(runId, 'avoid-start-in-bottom', {
                            componentId: entry.instance.id,
                            regionKey: key,
                            spanTop: span.top,
                            threshold: normalizedRegionHeight * 0.8,
                            regionHeight: normalizedRegionHeight,
                            componentType: entry.regionContent ? 'single-item-list' : 'block',
                        });
                    }
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
                            if (!ensurePage(pages, newPageNumber, columnCount, pendingQueues)) {
                                // Hit MAX_PAGES limit, stop pagination
                                return null;
                            }
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

                        if (!ensurePage(pages, candidateRegion.pageNumber, columnCount, pendingQueues)) {
                            // Hit MAX_PAGES limit, stop pagination
                            return null;
                        }

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

                        // Track component-12 specifically to detect duplicates
                        if (process.env.NODE_ENV !== 'production' && entry.instance.id === 'component-12') {
                            console.warn('[paginate] 🔄 CREATING FOLLOW-UP for component-12:', {
                                runId,
                                from: key,
                                to: candidateRegion.key,
                                alreadyRerouted: entry.overflowRouted,
                                currentQueueSize: pendingQueue.length,
                                estimatedHeight: entry.estimatedHeight,
                                hasSpan: !!entry.span,
                                spanHeight: entry.span?.height,
                            });
                        }

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
                        if (!ensurePage(pages, newPageNumber, columnCount, pendingQueues)) {
                            // Hit MAX_PAGES limit, stop pagination
                            break;
                        }
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

                    if (!ensurePage(pages, updatedNextRegion.pageNumber, columnCount, pendingQueues)) {
                        // Hit MAX_PAGES limit, stop pagination
                        break;
                    }
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
                        if (!ensurePage(pages, newPageNumber, columnCount, pendingQueues)) {
                            // Hit MAX_PAGES limit, mark as overflow and stop
                            columnEntries[columnEntries.length - 1] = {
                                ...columnEntries[columnEntries.length - 1],
                                overflow: true,
                            };
                            continue;
                        }
                    }

                    const updatedNextRegion = findNextRegion(pages, key);

                    if (!updatedNextRegion) {
                        columnEntries[columnEntries.length - 1] = {
                            ...columnEntries[columnEntries.length - 1],
                            overflow: true,
                        };
                        continue;
                    }

                    if (!ensurePage(pages, updatedNextRegion.pageNumber, columnCount, pendingQueues)) {
                        // Hit MAX_PAGES limit, mark as overflow and stop
                        columnEntries[columnEntries.length - 1] = {
                            ...columnEntries[columnEntries.length - 1],
                            overflow: true,
                        };
                        continue;
                    }

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

            // Track component-12 duplicates in final column
            if (process.env.NODE_ENV !== 'production') {
                const component12Entries = columnEntries.filter(e => e.instance.id === 'component-12');
                if (component12Entries.length > 0) {
                    console.warn('[paginate] 📋 Component-12 in final column:', {
                        runId,
                        regionKey: key,
                        count: component12Entries.length,
                        isDuplicate: component12Entries.length > 1,
                        entries: component12Entries.map(e => ({
                            estimatedHeight: e.estimatedHeight,
                            overflow: e.overflow,
                            overflowRouted: e.overflowRouted,
                            spanHeight: e.span?.height,
                        })),
                    });
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



