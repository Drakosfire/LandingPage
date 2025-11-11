import type { Action, StatBlockDetails } from './statblock.types';
import type React from 'react';
import type {
    PageMode,
    PageDimensions,
    ColumnConfig,
    PaginationConfig,
    PageVariables,
    ComponentLayoutConfig as BaseComponentLayoutConfig,
    ComponentDataReference as BaseComponentDataReference,
    ComponentInstance as BaseComponentInstance,
    ComponentDataSource as BaseComponentDataSource,
    RegionListContent as BaseRegionListContent,
    TemplateSlot,
    TemplateComponentPlacement,
    TemplateConfig as BaseTemplateConfig,
    PageDocument as BasePageDocument,
    CanvasComponentProps as BaseCanvasComponentProps,
} from 'dungeonmind-canvas';

export type { PageMode, PageDimensions, ColumnConfig, PaginationConfig, PageVariables, TemplateSlot, TemplateComponentPlacement };

export type PageBackgroundConfig = PageVariables['background'];
export type SnapConfig = PageVariables['snap'];
export type PageMargins = NonNullable<PageVariables['margins']>;
type BaseHistoryArray = BasePageDocument['history'];
export type PageHistoryEntry = BaseHistoryArray extends Array<infer H> ? H : never;

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

export type ComponentLayoutConfig = BaseComponentLayoutConfig;

type BaseStatblockDataRef = Extract<BaseComponentDataReference, { type: 'statblock' }>;
type BaseCustomDataRef = Extract<BaseComponentDataReference, { type: 'custom' }>;

export type ComponentDataReference =
    | (BaseStatblockDataRef & { path: keyof StatBlockDetails | string })
    | BaseCustomDataRef;

export interface ComponentInstance extends Omit<BaseComponentInstance, 'type' | 'dataRef'> {
    type: CanvasComponentType;
    dataRef: ComponentDataReference;
}

type BaseDataSource<T> = BaseComponentDataSource<T>;

export type ComponentDataSource =
    | (BaseDataSource<StatBlockDetails> & { type: 'statblock'; payload: StatBlockDetails })
    | (BaseDataSource<Record<string, unknown>> & { type: 'custom'; payload: Record<string, unknown> });

export interface RegionListContent extends Omit<BaseRegionListContent, 'kind' | 'items'> {
    kind:
    | 'action-list'
    | 'trait-list'
    | 'bonus-action-list'
    | 'reaction-list'
    | 'legendary-action-list'
    | 'lair-action-list'
    | 'spell-list'
    | 'spell-list-metadata';
    items: Action[];
}

export interface TemplateConfig extends Omit<BaseTemplateConfig, 'slots' | 'defaultComponents' | 'allowedComponents'> {
    slots: Array<
        Omit<TemplateSlot, 'allowedComponents'> & {
            allowedComponents: CanvasComponentType[];
        }
    >;
    defaultComponents: Array<
        Omit<TemplateComponentPlacement, 'componentType' | 'defaultDataRef'> & {
            componentType: CanvasComponentType;
            defaultDataRef: ComponentDataReference;
        }
    >;
    allowedComponents: CanvasComponentType[];
}

export interface StatblockPageDocument extends Omit<BasePageDocument, 'componentInstances' | 'dataSources'> {
    componentInstances: ComponentInstance[];
    dataSources: ComponentDataSource[];
}

export interface PageDocumentUpdate {
    pageVariables?: Partial<PageVariables>;
    componentInstances?: ComponentInstance[];
    dataSources?: ComponentDataSource[];
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

export interface CanvasComponentProps extends Omit<BaseCanvasComponentProps, 'dataRef' | 'dataSources' | 'pageVariables' | 'regionContent'> {
    dataRef: ComponentDataReference;
    dataSources: ComponentDataSource[];
    pageVariables: PageVariables;
    regionContent?: RegionListContent;
}

export interface PageLoadResponse {
    page: StatblockPageDocument;
    template: TemplateConfig;
}

