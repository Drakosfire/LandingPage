import type { Action, StatBlockDetails } from './statblock.types';
import type React from 'react';

export type PageMode = 'locked' | 'freeform';

export interface PageDimensions {
    width: number;
    height: number;
    unit: 'px' | 'mm' | 'in';
    bleed?: number;
}

export interface PageBackgroundConfig {
    type: 'parchment' | 'solid' | 'image';
    color?: string;
    textureUrl?: string;
    overlayOpacity?: number;
}

export interface ColumnConfig {
    enabled: boolean;
    columnCount: number;
    gutter: number;
    unit: 'px' | 'mm' | 'in';
}

export interface SnapConfig {
    enabled: boolean;
    gridSize: number;
    gridUnit: 'px' | 'mm' | 'in';
    snapToSlots: boolean;
    snapToEdges: boolean;
}

export interface PaginationConfig {
    pageCount: number;
    columnCount: 1 | 2;
}

export interface PageVariables {
    mode: PageMode;
    dimensions: PageDimensions;
    background: PageBackgroundConfig;
    columns: ColumnConfig;
    pagination: PaginationConfig;
    snap: SnapConfig;
    templateId?: string;
}

export type CanvasComponentType =
    | 'identity-header'
    | 'flavor-summary'
    | 'portrait-panel'
    | 'stat-summary'
    | 'ability-table'
    | 'quick-facts'
    | 'trait-list'
    | 'action-section'
    | 'bonus-action-section'
    | 'reaction-section'
    | 'legendary-actions'
    | 'lair-actions'
    | 'regional-effects'
    | 'spellcasting-block'
    | 'variant-rules'
    | 'encounter-notes'
    | 'loot-table'
    | 'appendix-callout'
    | 'section-divider'
    | 'block-quote'
    | 'markdown-block'
    | 'spacer';

export interface ComponentDimensions {
    width: number;
    height: number;
}

export interface LayoutPosition {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    zIndex?: number;
}

export interface ComponentLayoutConfig {
    slotId?: string;
    position?: LayoutPosition;
    minSize?: ComponentDimensions;
    maxSize?: ComponentDimensions;
    isVisible: boolean;
    isLocked?: boolean;
    location?: {
        page: number;
        column: 1 | 2;
    };
}

export type ComponentDataReference =
    | { type: 'statblock'; path: keyof StatBlockDetails | string; sourceId?: string }
    | { type: 'custom'; key: string; sourceId?: string };

export interface ComponentInstance {
    id: string;
    type: CanvasComponentType;
    dataRef: ComponentDataReference;
    layout: ComponentLayoutConfig;
    modeOverrides?: Partial<ComponentLayoutConfig>;
    variables?: Record<string, unknown>;
}

export interface RegionListContent {
    kind: 'action-list' | 'trait-list' | 'bonus-action-list' | 'reaction-list' | 'legendary-action-list' | 'lair-action-list' | 'spell-list';
    items: Action[];
    startIndex: number;
    totalCount: number;
    isContinuation: boolean;
    metadata?: Record<string, unknown>;
}

export interface TemplateSlot {
    id: string;
    name: string;
    position: LayoutPosition;
    allowedComponents: CanvasComponentType[];
    isRequired?: boolean;
}

export interface TemplateComponentPlacement {
    slotId: string;
    componentType: CanvasComponentType;
    defaultDataRef: ComponentDataReference;
    defaultVariables?: Record<string, unknown>;
}

export interface TemplateConfig {
    id: string;
    name: string;
    description?: string;
    defaultMode: PageMode;
    defaultPageVariables: Omit<PageVariables, 'mode' | 'templateId'>;
    slots: TemplateSlot[];
    defaultComponents: TemplateComponentPlacement[];
    allowedComponents: CanvasComponentType[];
    metadata?: Record<string, unknown>;
}

export interface PageHistoryEntry {
    id: string;
    createdAt: string;
    userId: string;
    summary: string;
}

export interface ComponentDataSource {
    id: string;
    type: 'statblock' | 'custom';
    payload: StatBlockDetails | Record<string, unknown>;
    updatedAt: string;
}

export interface StatblockPageDocument {
    id: string;
    projectId: string;
    ownerId: string;
    templateId: string;
    pageVariables: PageVariables;
    componentInstances: ComponentInstance[];
    dataSources: ComponentDataSource[];
    createdAt: string;
    updatedAt: string;
    history?: PageHistoryEntry[];
    metadata?: Record<string, unknown>;
}

export interface PageDocumentUpdate {
    pageVariables?: Partial<PageVariables>;
    componentInstances?: ComponentInstance[];
    dataSources?: ComponentDataSource[];
    metadata?: Record<string, unknown>;
}

export interface ComponentRegistryEntry {
    type: CanvasComponentType;
    displayName: string;
    icon?: string;
    description?: string;
    defaults: {
        dataRef: ComponentDataReference;
        layout: ComponentLayoutConfig;
        variables?: Record<string, unknown>;
    };
    component: React.ComponentType<CanvasComponentProps> | React.LazyExoticComponent<React.ComponentType<CanvasComponentProps>>;
}

export interface CanvasComponentProps {
    id: string;
    dataRef: ComponentDataReference;
    variables?: Record<string, unknown>;
    layout: ComponentLayoutConfig;
    mode: PageMode;
    pageVariables: PageVariables;
    dataSources: ComponentDataSource[];
    isEditMode?: boolean;
    onUpdateData?: (updates: Partial<import('./statblock.types').StatBlockDetails>) => void;
    region?: {
        page: number;
        column: 1 | 2;
        index: number;
    };
    regionContent?: RegionListContent;
    regionOverflow?: boolean;
}

export interface PageLoadResponse {
    page: StatblockPageDocument;
    template: TemplateConfig;
}

