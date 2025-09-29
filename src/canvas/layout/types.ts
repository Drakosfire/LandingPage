import type {
    ComponentDataSource,
    ComponentInstance,
    ComponentRegistryEntry,
    PageVariables,
    TemplateConfig,
    RegionListContent,
} from '../../types/statblockCanvas.types';
import type { Action } from '../../types/statblock.types';

export type MeasurementKey = string;

export interface MeasurementRecord {
    key: MeasurementKey;
    height: number;
    measuredAt: number;
}

export interface LayoutRegion {
    page: number;
    column: 1 | 2;
    index?: number;
}

export interface CanvasLayoutEntry {
    instance: ComponentInstance;
    slotIndex: number;
    orderIndex: number;
    sourceRegionKey: string;
    region: LayoutRegion;
    regionContent?: RegionListContent;
    estimatedHeight: number;
    measurementKey: MeasurementKey;
    needsMeasurement: boolean;
    overflow?: boolean;
    overflowRouted?: boolean;
    splitRemainder?: Action[];
    listContinuation?: {
        isContinuation: boolean;
        startIndex: number;
        totalCount: number;
    };
}

export type RegionBuckets = Map<string, CanvasLayoutEntry[]>;

export type MeasurementEntry = CanvasLayoutEntry;

export { RegionListContent };

export interface LayoutColumn {
    columnNumber: 1 | 2;
    key: string;
    entries: CanvasLayoutEntry[];
}

export interface PageLayout {
    pageNumber: number;
    columns: LayoutColumn[];
}

export interface OverflowWarning {
    componentId: string;
    page: number;
    column: number;
}

export interface LayoutPlan {
    pages: PageLayout[];
    overflowWarnings: OverflowWarning[];
}

export interface CanvasEntriesResult {
    buckets: RegionBuckets;
    measurementEntries: MeasurementEntry[];
}

export interface CanvasLayoutState {
    components: ComponentInstance[];
    template: TemplateConfig | null;
    dataSources: ComponentDataSource[];
    componentRegistry: Record<string, ComponentRegistryEntry>;
    pageVariables: PageVariables | null;
    columnCount: number;
    regionHeightPx: number;
    pageWidthPx: number;
    pageHeightPx: number;
    baseDimensions: {
        widthPx: number;
        heightPx: number;
        contentHeightPx: number;
        topMarginPx: number;
        bottomMarginPx: number;
    } | null;
    measurements: Map<MeasurementKey, MeasurementRecord>;
    measurementVersion: number;
    layoutPlan: LayoutPlan | null;
    pendingLayout: LayoutPlan | null;
    measurementEntries: MeasurementEntry[];
    buckets: RegionBuckets;
    isLayoutDirty: boolean;
}


