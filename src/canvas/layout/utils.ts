import type {
    ComponentInstance,
    RegionListContent,
    TemplateConfig,
    TemplateSlot,
    ComponentDataSource,
    PageVariables,
} from '../../types/statblockCanvas.types';
import type {
    CanvasEntriesResult,
    CanvasLayoutEntry,
    MeasurementKey,
    MeasurementRecord,
    MeasurementEntry,
    RegionBuckets,
    RegionAssignment,
    SlotAssignment,
} from './types';
import {
    getPrimaryStatblock,
    normalizeActionArray,
    resolveDataReference,
    toRegionContent,
} from '../../components/StatBlockGenerator/canvasComponents/utils';
import type { Action } from '../../types/statblock.types';

export const PX_PER_INCH = 96;
export const MM_PER_INCH = 25.4;
export const MEASUREMENT_TOLERANCE_PX = 0.5;
export const MEASUREMENT_THROTTLE_MS = 150;

export const DEFAULT_PAGE_TOP_MARGIN_MM = 18;
export const DEFAULT_PAGE_BOTTOM_MARGIN_MM = 18;
export const COMPONENT_VERTICAL_SPACING_PX = 12; // Reduced from 18px for tighter layout
export const LIST_ITEM_SPACING_PX = 8; // Reduced from 12px for tighter layout
export const ACTION_HEADER_HEIGHT_PX = 36;
export const ACTION_CONTINUATION_HEADER_HEIGHT_PX = 28;
export const ACTION_META_LINE_HEIGHT_PX = 16;
export const ACTION_DESC_LINE_HEIGHT_PX = 18;
export const ACTION_AVG_CHARS_PER_LINE = 75;
export const DEFAULT_COMPONENT_HEIGHT_PX = 200;
export const MIN_LIST_ITEM_HEIGHT_PX = ACTION_HEADER_HEIGHT_PX + ACTION_DESC_LINE_HEIGHT_PX;

export const regionKey = (page: number, column: number) => `${page}:${column}`;

export interface BasePageDimensions {
    widthPx: number;
    heightPx: number;
    contentHeightPx: number;
    topMarginPx: number;
    bottomMarginPx: number;
}

export const convertToPixels = (value: number, unit: 'px' | 'mm' | 'in'): number => {
    switch (unit) {
        case 'px':
            return value;
        case 'in':
            return value * PX_PER_INCH;
        case 'mm':
        default:
            return (value / MM_PER_INCH) * PX_PER_INCH;
    }
};

export const computeBasePageDimensions = (
    pageVariables: PageVariables,
    topMarginMm: number = DEFAULT_PAGE_TOP_MARGIN_MM,
    bottomMarginMm: number = DEFAULT_PAGE_BOTTOM_MARGIN_MM
): BasePageDimensions => {
    const widthPx = convertToPixels(pageVariables.dimensions.width, pageVariables.dimensions.unit);
    const heightPx = convertToPixels(pageVariables.dimensions.height, pageVariables.dimensions.unit);
    const topMarginPx = convertToPixels(topMarginMm, 'mm');
    const bottomMarginPx = convertToPixels(bottomMarginMm, 'mm');
    const contentHeightPx = Math.max(0, heightPx - (topMarginPx + bottomMarginPx));

    return {
        widthPx,
        heightPx,
        contentHeightPx,
        topMarginPx,
        bottomMarginPx,
    };
};

export const toColumnType = (column: number): 1 | 2 => (column <= 1 ? 1 : 2);

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const buildSlotOrder = (template: TemplateConfig): Map<string, number> => {
    const order = new Map<string, number>();
    template.slots.forEach((slot, index) => {
        order.set(slot.id, index);
    });
    return order;
};

export const computeMeasurementKey = (
    instanceId: string,
    regionContent?: RegionListContent
): MeasurementKey => {
    if (!regionContent) {
        return `${instanceId}:block`;
    }

    return `${instanceId}:${regionContent.kind}:${regionContent.startIndex}:${regionContent.items.length}:${regionContent.totalCount}`;
};

export const inferColumnFromPosition = (
    position: TemplateSlot['position'] | ComponentInstance['layout']['position'] | undefined,
    columnCount: number,
    pageWidthPx: number
): 1 | 2 => {
    if (!position || columnCount <= 1 || pageWidthPx <= 0) {
        return 1;
    }

    const columnWidth = pageWidthPx / columnCount;
    const x = position.x ?? 0;
    const width = position.width ?? columnWidth;
    const midpoint = x + width / 2;
    const columnIndex = Math.ceil(midpoint / columnWidth);
    const clampedColumn = clamp(columnIndex, 1, columnCount);
    return (clampedColumn === 1 ? 1 : 2) as 1 | 2;
};

export const resolveLocation = (
    instance: ComponentInstance,
    template: TemplateConfig,
    columnCount: number,
    pageWidthPx: number
) => {
    const explicit = instance.layout.location;
    if (explicit) {
        return {
            page: Math.max(1, explicit.page),
            column: columnCount === 1 ? 1 : (clamp(explicit.column, 1, columnCount) as 1 | 2),
        };
    }

    const slot = template.slots.find((slotEntry) => slotEntry.id === instance.layout.slotId);
    const inferredColumn = inferColumnFromPosition(
        instance.layout.position ?? slot?.position,
        columnCount,
        pageWidthPx
    );

    return { page: 1, column: columnCount === 1 ? 1 : inferredColumn };
};

const lineCountFromText = (text: string | undefined, avgCharsPerLine: number) => {
    if (!text) return 0;
    const length = text.length;
    if (length <= 0) return 0;
    return Math.ceil(length / avgCharsPerLine);
};

export const estimateActionHeight = (action: Action) => {
    const nameHeight = ACTION_HEADER_HEIGHT_PX;
    const metaKeys: Array<keyof Action> = ['usage', 'recharge', 'range', 'damageType', 'damage', 'attackBonus'];
    const metaLines = metaKeys.filter((key) => Boolean(action[key])).length;
    const metaHeight = metaLines > 0 ? metaLines * ACTION_META_LINE_HEIGHT_PX : 0;
    const descLines = lineCountFromText(action.desc, ACTION_AVG_CHARS_PER_LINE);
    const descHeight = descLines * ACTION_DESC_LINE_HEIGHT_PX;
    const total = nameHeight + metaHeight + descHeight;
    return Math.max(total, MIN_LIST_ITEM_HEIGHT_PX);
};

export const estimateListHeight = (items: Action[], isContinuation: boolean = false) => {
    if (items.length === 0) return 0;
    const itemsHeight = items.reduce((acc, action) => acc + estimateActionHeight(action), 0);
    const spacingHeight = (items.length - 1) * LIST_ITEM_SPACING_PX;

    // TODO: Investigate actual header heights - old formula was closer
    // For now, don't add extra header (estimates already include some overhead)
    return itemsHeight + spacingHeight;
};

const REGION_KIND_MAP: Partial<Record<ComponentInstance['type'], RegionListContent['kind']>> = {
    'action-section': 'action-list',
    'trait-list': 'trait-list',
    'bonus-action-section': 'bonus-action-list',
    'reaction-section': 'reaction-list',
    'legendary-actions': 'legendary-action-list',
    'lair-actions': 'lair-action-list',
    'spellcasting-block': 'spell-list',
};

interface BuildBucketsArgs {
    instances: ComponentInstance[];
    template: TemplateConfig;
    columnCount: number;
    pageWidthPx: number;
    dataSources: ComponentDataSource[];
    measurements: Map<MeasurementKey, MeasurementRecord>;
    assignedRegions?: Map<string, SlotAssignment>;
}

export const buildBuckets = ({
    instances,
    template,
    columnCount,
    pageWidthPx,
    dataSources,
    measurements,
    assignedRegions,
}: BuildBucketsArgs): RegionBuckets => {
    const slotOrder = buildSlotOrder(template);
    const buckets: RegionBuckets = new Map();

    instances.forEach((instance, index) => {
        const persisted = assignedRegions?.get(instance.id);
        const resolvedHomeRaw = resolveLocation(instance, template, columnCount, pageWidthPx);
        const resolvedHome: RegionAssignment = {
            page: Math.max(1, resolvedHomeRaw.page),
            column: columnCount === 1 ? 1 : (clamp(resolvedHomeRaw.column, 1, columnCount) as 1 | 2),
        };
        const baseLocation = persisted ? persisted.homeRegion : resolvedHome;
        const slotIndex = instance.layout.slotId ? slotOrder.get(instance.layout.slotId) ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
        const slotDimensions = slotDimensionLookup(template, instance.layout.slotId);
        const homeKey = regionKey(resolvedHome.page, resolvedHome.column);
        const listKind = REGION_KIND_MAP[instance.type];

        if (listKind) {
            const statblock = getPrimaryStatblock(dataSources);
            const resolved = resolveDataReference(dataSources, instance.dataRef);

            const itemsSource: Action[] = (() => {
                switch (instance.type) {
                    case 'action-section':
                        return normalizeActionArray(resolved ?? statblock?.actions);
                    case 'trait-list':
                        return normalizeActionArray(resolved ?? statblock?.specialAbilities);
                    case 'bonus-action-section':
                        return normalizeActionArray(resolved ?? statblock?.bonusActions);
                    case 'reaction-section':
                        return normalizeActionArray(resolved ?? statblock?.reactions);
                    case 'legendary-actions': {
                        const legendary = (resolved as { actions?: Action[] }) ?? statblock?.legendaryActions;
                        return normalizeActionArray(legendary?.actions);
                    }
                    case 'lair-actions': {
                        const lair = (resolved as { actions?: Action[] }) ?? statblock?.lairActions;
                        return normalizeActionArray(lair?.actions);
                    }
                    case 'spellcasting-block': {
                        const spellcasting = (resolved as { cantrips?: unknown[]; knownSpells?: unknown[] }) ?? statblock?.spells;
                        // Combine cantrips and known spells into a single list for splitting
                        // Preserve ALL spell properties (level, school, usage) for proper rendering
                        const cantrips = (spellcasting?.cantrips ?? []).map((spell: any) => ({
                            name: spell.name,
                            desc: spell.description ?? '',
                            level: spell.level ?? 0,
                            school: spell.school,
                            usage: spell.usage,
                        }));
                        const knownSpells = (spellcasting?.knownSpells ?? []).map((spell: any) => ({
                            name: spell.name,
                            desc: spell.description ?? '',
                            level: spell.level,
                            school: spell.school,
                            usage: spell.usage,
                        }));
                        return normalizeActionArray([...cantrips, ...knownSpells] as Action[]);
                    }
                    default:
                        return [];
                }
            })();

            if (itemsSource.length === 0) {
                const key = regionKey(baseLocation.page, baseLocation.column);
                const measurementKey = computeMeasurementKey(instance.id);
                const record = measurements.get(measurementKey);
                const entry: CanvasLayoutEntry = {
                    instance,
                    slotIndex,
                    orderIndex: index,
                    sourceRegionKey: key,
                    region: baseLocation,
                    homeRegion: resolvedHome,
                    homeRegionKey: homeKey,
                    measurementKey,
                    estimatedHeight: record?.height ?? DEFAULT_COMPONENT_HEIGHT_PX,
                    needsMeasurement: !record,
                    span: record ? { top: 0, bottom: record.height, height: record.height } : undefined,
                    slotDimensions,
                };
                if (!buckets.has(key)) {
                    buckets.set(key, []);
                }
                buckets.get(key)!.push(entry);
                return;
            }

            const totalCount = itemsSource.length;
            const segments = new Map<string, { items: Action[]; startIndex: number }>();

            itemsSource.forEach((item, itemIndex) => {
                const itemLocation = item.location;
                const location = itemLocation
                    ? {
                        page: Math.max(1, itemLocation.page),
                        column: columnCount === 1 ? 1 : (clamp(itemLocation.column, 1, columnCount) as 1 | 2),
                    }
                    : baseLocation;

                const key = regionKey(location.page, location.column);
                if (!segments.has(key)) {
                    segments.set(key, { items: [], startIndex: itemIndex });
                }
                segments.get(key)!.items.push(item);
            });

            const summaryMetadata = (() => {
                switch (instance.type) {
                    case 'legendary-actions':
                        return {
                            legendarySummary:
                                (resolved as { description?: string; actionsPerTurn?: number })?.description ??
                                statblock?.legendaryActions?.description ??
                                'The creature can take the following legendary actions, choosing from the options below.',
                            legendaryFrequency:
                                (resolved as { actionsPerTurn?: number })?.actionsPerTurn ??
                                statblock?.legendaryActions?.actionsPerTurn,
                        };
                    case 'lair-actions':
                        return {
                            lairSummary:
                                (resolved as { description?: string })?.description ??
                                statblock?.lairActions?.description ??
                                'On initiative count 20 (losing initiative ties), the creature uses one of the following lair actions.',
                        };
                    default:
                        return undefined;
                }
            })();

            segments.forEach((segment, key) => {
                const [pagePart, columnPart] = key.split(':');
                const parsedPage = Number.parseInt(pagePart, 10);
                const parsedColumn = Number.parseInt(columnPart, 10);
                const pageNumber = Number.isNaN(parsedPage) ? baseLocation.page : parsedPage;
                const columnNumber = Number.isNaN(parsedColumn) ? baseLocation.column : toColumnType(parsedColumn);
                const regionContent = toRegionContent(
                    listKind,
                    segment.items,
                    segment.startIndex,
                    totalCount,
                    segment.startIndex > 0,
                    segment.startIndex === 0 ? summaryMetadata : undefined
                );
                const measurementKey = computeMeasurementKey(instance.id, regionContent);
                const record = measurements.get(measurementKey);
                const entry: CanvasLayoutEntry = {
                    instance,
                    slotIndex,
                    orderIndex: index,
                    sourceRegionKey: key,
                    region: {
                        page: pageNumber,
                        column: columnNumber,
                    },
                    homeRegion: resolvedHome,
                    homeRegionKey: homeKey,
                    regionContent,
                    estimatedHeight: record?.height ?? estimateListHeight(segment.items, segment.startIndex > 0),
                    measurementKey,
                    needsMeasurement: !record,
                    span: record ? { top: 0, bottom: record.height, height: record.height } : undefined,
                    slotDimensions,
                    listContinuation: {
                        isContinuation: segment.startIndex > 0,
                        startIndex: segment.startIndex,
                        totalCount,
                    },
                };
                if (!buckets.has(key)) {
                    buckets.set(key, []);
                }
                buckets.get(key)!.push(entry);
            });
            return;
        }

        const key = regionKey(baseLocation.page, baseLocation.column);
        const measurementKey = computeMeasurementKey(instance.id);
        const record = measurements.get(measurementKey);

        // Add debug logging for first few components and component-12
        if (process.env.NODE_ENV !== 'production' &&
            (instance.id === 'component-0' || instance.id === 'component-1' ||
                instance.id === 'component-2' || instance.id === 'component-12')) {
            console.debug('[buildBuckets] Template vs Measurement:', {
                instanceId: instance.id,
                componentType: instance.type,
                dataRef: instance.dataRef,
                slotId: instance.layout.slotId,
                templateSlotHeight: slotDimensions?.heightPx,
                templateSlotWidth: slotDimensions?.widthPx,
                measuredHeight: record?.height,
                fallbackHeight: DEFAULT_COMPONENT_HEIGHT_PX,
                finalEstimatedHeight: record?.height ?? DEFAULT_COMPONENT_HEIGHT_PX,
                conflict: slotDimensions?.heightPx && record?.height &&
                    Math.abs(slotDimensions.heightPx - record.height) > 5 ?
                    `Template wants ${slotDimensions.heightPx}px, content measured ${record.height}px` :
                    'No conflict',
                isAbnormal: record?.height && record.height > 1500 ?
                    `⚠️ Abnormally large: ${record.height}px` : false,
            });
        }

        const entry: CanvasLayoutEntry = {
            instance,
            slotIndex,
            orderIndex: index,
            sourceRegionKey: key,
            region: baseLocation,
            homeRegion: resolvedHome,
            homeRegionKey: homeKey,
            measurementKey,
            estimatedHeight: record?.height ?? DEFAULT_COMPONENT_HEIGHT_PX,
            needsMeasurement: !record,
            span: record ? { top: 0, bottom: record.height, height: record.height } : undefined,
            slotDimensions,
        };
        if (!buckets.has(key)) {
            buckets.set(key, []);
        }
        buckets.get(key)!.push(entry);
    });

    buckets.forEach((entries) => {
        entries.sort((a, b) => {
            if (a.slotIndex !== b.slotIndex) return a.slotIndex - b.slotIndex;
            return a.orderIndex - b.orderIndex;
        });
    });

    return buckets;
};

// Cache to preserve measurement entry object identity across pagination cycles
// This prevents React from unmounting/remounting measurement components unnecessarily
const measurementEntryCache = new Map<MeasurementKey, CanvasLayoutEntry>();

const collectMeasurementEntries = (buckets: RegionBuckets): MeasurementEntry[] => {
    const unique = new Map<MeasurementKey, CanvasLayoutEntry>();
    const duplicateCheck = new Map<MeasurementKey, number>();

    buckets.forEach((entries) => {
        entries.forEach((entry) => {
            // Track how many times we see each key
            if (process.env.NODE_ENV !== 'production') {
                const count = duplicateCheck.get(entry.measurementKey) || 0;
                duplicateCheck.set(entry.measurementKey, count + 1);
            }

            // Always include entries in measurement layer, even if they already have measurements
            // This allows re-measuring if component content changes
            if (!unique.has(entry.measurementKey)) {
                // Reuse cached entry if measurement key exists
                const cached = measurementEntryCache.get(entry.measurementKey);
                if (cached) {
                    // IMPORTANT: Merge new measurement data into cached entry
                    const merged = {
                        ...cached,
                        estimatedHeight: entry.estimatedHeight, // Use new measurement
                        span: entry.span,                       // Update span if changed
                        needsMeasurement: entry.needsMeasurement,
                    };
                    unique.set(entry.measurementKey, merged);
                    measurementEntryCache.set(entry.measurementKey, merged);
                } else {
                    unique.set(entry.measurementKey, entry);
                    measurementEntryCache.set(entry.measurementKey, entry);
                }
            }
        });
    });

    // Log duplicates
    if (process.env.NODE_ENV !== 'production') {
        const duplicates = Array.from(duplicateCheck.entries()).filter(([_, count]) => count > 1);
        if (duplicates.length > 0) {
            console.warn('[collectMeasurementEntries] Found duplicate keys in buckets:', duplicates);
        }
    }

    // Clean up cache entries that are no longer needed
    const currentKeys = new Set(unique.keys());
    measurementEntryCache.forEach((_, key) => {
        if (!currentKeys.has(key)) {
            measurementEntryCache.delete(key);
        }
    });

    return Array.from(unique.values());
};

/**
 * Create measurement entries from raw components BEFORE buckets are built.
 * This enables measure-first flow where we measure all components upfront.
 * Only creates essential measurements (block components + full lists), not all possible splits.
 */
export const createInitialMeasurementEntries = ({
    instances,
    template,
    columnCount,
    pageWidthPx,
    dataSources,
}: {
    instances: ComponentInstance[];
    template: TemplateConfig;
    columnCount: number;
    pageWidthPx: number;
    dataSources: ComponentDataSource[];
}): MeasurementEntry[] => {
    const entries: MeasurementEntry[] = [];
    const slotOrder = buildSlotOrder(template);

    instances.forEach((instance, index) => {
        const slotDimensions = slotDimensionLookup(template, instance.layout.slotId);
        const slotIndex = instance.layout.slotId
            ? slotOrder.get(instance.layout.slotId) ?? Number.MAX_SAFE_INTEGER
            : Number.MAX_SAFE_INTEGER;

        // Determine home region for this component
        const resolvedHomeRaw = resolveLocation(instance, template, columnCount, pageWidthPx);
        const homeRegion: RegionAssignment = {
            page: Math.max(1, resolvedHomeRaw.page),
            column: toColumnType(resolvedHomeRaw.column),
        };

        // Create basic measurement entry for block component
        // We'll measure all components as blocks first
        const measurementKey = computeMeasurementKey(instance.id);

        entries.push({
            instance,
            slotIndex,
            orderIndex: index,
            sourceRegionKey: regionKey(homeRegion.page, homeRegion.column),
            region: homeRegion,
            homeRegion,
            homeRegionKey: regionKey(homeRegion.page, homeRegion.column),
            estimatedHeight: DEFAULT_COMPONENT_HEIGHT_PX,
            measurementKey,
            needsMeasurement: true,
            slotDimensions,
        });
    });

    return entries;
};

export interface BuildCanvasEntriesArgs {
    instances: ComponentInstance[];
    template: TemplateConfig;
    columnCount: number;
    pageWidthPx: number;
    dataSources: ComponentDataSource[];
    measurements: Map<MeasurementKey, MeasurementRecord>;
    assignedRegions?: Map<string, SlotAssignment>;
}

export const buildCanvasEntries = ({
    instances,
    template,
    columnCount,
    pageWidthPx,
    dataSources,
    measurements,
    assignedRegions,
}: BuildCanvasEntriesArgs): CanvasEntriesResult => {
    const buckets = buildBuckets({ instances, template, columnCount, pageWidthPx, dataSources, measurements, assignedRegions });
    const measurementEntries = collectMeasurementEntries(buckets);
    return { buckets, measurementEntries };
};

const slotDimensionLookup = (template: TemplateConfig, slotId: string | undefined) => {
    if (!slotId) {
        return undefined;
    }
    const slot = template.slots.find((item) => item.id === slotId);
    if (!slot) {
        return undefined;
    }
    return {
        widthPx: slot.position.width,
        heightPx: slot.position.height,
    };
};

/**
 * Computes canonical home regions for all component instances based on their template slots
 * and explicit layout.location settings. This map should be recomputed only when components
 * or the template change, not when measurements or reroutes occur.
 */
export const computeHomeRegions = ({
    instances,
    template,
    columnCount,
    pageWidthPx,
}: {
    instances: ComponentInstance[];
    template: TemplateConfig;
    columnCount: number;
    pageWidthPx: number;
}): Map<string, { homeRegion: RegionAssignment; slotIndex: number; orderIndex: number }> => {
    const slotOrder = buildSlotOrder(template);
    const homeRegions = new Map<string, { homeRegion: RegionAssignment; slotIndex: number; orderIndex: number }>();

    instances.forEach((instance, index) => {
        const resolvedHomeRaw = resolveLocation(instance, template, columnCount, pageWidthPx);
        const homeRegion: RegionAssignment = {
            page: Math.max(1, resolvedHomeRaw.page),
            column: columnCount === 1 ? 1 : (clamp(resolvedHomeRaw.column, 1, columnCount) as 1 | 2),
        };
        const slotIndex = instance.layout.slotId
            ? slotOrder.get(instance.layout.slotId) ?? Number.MAX_SAFE_INTEGER
            : Number.MAX_SAFE_INTEGER;

        homeRegions.set(instance.id, {
            homeRegion,
            slotIndex,
            orderIndex: index,
        });
    });

    return homeRegions;
};

