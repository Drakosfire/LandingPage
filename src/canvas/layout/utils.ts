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
export const COMPONENT_VERTICAL_SPACING_PX = 18;
export const LIST_ITEM_SPACING_PX = 12;
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

export const estimateListHeight = (items: Action[]) => {
    if (items.length === 0) return 0;
    return items.reduce((acc, action) => acc + estimateActionHeight(action), 0) + (items.length - 1) * LIST_ITEM_SPACING_PX;
};

const REGION_KIND_MAP: Partial<Record<ComponentInstance['type'], RegionListContent['kind']>> = {
    'action-section': 'action-list',
    'trait-list': 'trait-list',
    'bonus-action-section': 'bonus-action-list',
    'reaction-section': 'reaction-list',
    'legendary-actions': 'legendary-action-list',
    'lair-actions': 'lair-action-list',
};

interface BuildBucketsArgs {
    instances: ComponentInstance[];
    template: TemplateConfig;
    columnCount: number;
    pageWidthPx: number;
    dataSources: ComponentDataSource[];
    measurements: Map<MeasurementKey, MeasurementRecord>;
}

const buildBuckets = ({
    instances,
    template,
    columnCount,
    pageWidthPx,
    dataSources,
    measurements,
}: BuildBucketsArgs): RegionBuckets => {
    const slotOrder = buildSlotOrder(template);
    const buckets: RegionBuckets = new Map();

    instances.forEach((instance, index) => {
        const baseLocation = resolveLocation(instance, template, columnCount, pageWidthPx);
        const slotIndex = instance.layout.slotId ? slotOrder.get(instance.layout.slotId) ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
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
                    measurementKey,
                    estimatedHeight: record?.height ?? DEFAULT_COMPONENT_HEIGHT_PX,
                    needsMeasurement: !record,
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
                    regionContent,
                    estimatedHeight: record?.height ?? estimateListHeight(segment.items),
                    measurementKey,
                    needsMeasurement: !record,
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
        const entry: CanvasLayoutEntry = {
            instance,
            slotIndex,
            orderIndex: index,
            sourceRegionKey: key,
            region: baseLocation,
            estimatedHeight: record?.height ?? DEFAULT_COMPONENT_HEIGHT_PX,
            measurementKey,
            needsMeasurement: !record,
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

const collectMeasurementEntries = (buckets: RegionBuckets): MeasurementEntry[] => {
    const unique = new Map<MeasurementKey, CanvasLayoutEntry>();
    buckets.forEach((entries) => {
        entries.forEach((entry) => {
            if (!entry.needsMeasurement) return;
            if (!unique.has(entry.measurementKey)) {
                unique.set(entry.measurementKey, entry);
            }
        });
    });
    return Array.from(unique.values());
};

export interface BuildCanvasEntriesArgs {
    instances: ComponentInstance[];
    template: TemplateConfig;
    columnCount: number;
    pageWidthPx: number;
    dataSources: ComponentDataSource[];
    measurements: Map<MeasurementKey, MeasurementRecord>;
}

export const buildCanvasEntries = ({
    instances,
    template,
    columnCount,
    pageWidthPx,
    dataSources,
    measurements,
}: BuildCanvasEntriesArgs): CanvasEntriesResult => {
    const buckets = buildBuckets({ instances, template, columnCount, pageWidthPx, dataSources, measurements });
    const measurementEntries = collectMeasurementEntries(buckets);
    return { buckets, measurementEntries };
};

