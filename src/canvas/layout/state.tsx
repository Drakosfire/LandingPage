import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';

import type {
    ComponentDataSource,
    ComponentInstance,
    ComponentRegistryEntry,
    PageVariables,
    TemplateConfig,
} from '../../types/statblockCanvas.types';
import type {
    CanvasLayoutState,
    LayoutPlan,
    MeasurementEntry,
    MeasurementKey,
    MeasurementRecord,
} from './types';
import { paginate } from './paginate';
import { buildCanvasEntries, computeBasePageDimensions } from './utils';

type CanvasLayoutAction =
    | { type: 'INITIALIZE'; payload: { template: TemplateConfig; pageVariables: PageVariables; columnCount: number; regionHeightPx: number; pageWidthPx: number; pageHeightPx: number; baseDimensions: ReturnType<typeof computeBasePageDimensions> } }
    | { type: 'SET_COMPONENTS'; payload: { instances: ComponentInstance[] } }
    | { type: 'SET_TEMPLATE'; payload: { template: TemplateConfig } }
    | { type: 'SET_DATA_SOURCES'; payload: { dataSources: ComponentDataSource[] } }
    | { type: 'SET_REGISTRY'; payload: { registry: Record<string, ComponentRegistryEntry> } }
    | { type: 'SET_PAGE_VARIABLES'; payload: { pageVariables: PageVariables; columnCount: number; regionHeightPx: number; pageWidthPx: number; pageHeightPx: number; baseDimensions: ReturnType<typeof computeBasePageDimensions> } }
    | { type: 'MEASUREMENTS_UPDATED'; payload: { measurements: MeasurementRecord[] } }
    | { type: 'RECALCULATE_LAYOUT' }
    | { type: 'COMMIT_LAYOUT' };

const CanvasLayoutStateContext = createContext<CanvasLayoutState | undefined>(undefined);
const CanvasLayoutDispatchContext = createContext<React.Dispatch<CanvasLayoutAction> | undefined>(undefined);

const initialPlan: LayoutPlan = { pages: [], overflowWarnings: [] };

export const createInitialState = (): CanvasLayoutState => ({
    components: [],
    template: null,
    dataSources: [],
    componentRegistry: {},
    pageVariables: null,
    columnCount: 1,
    regionHeightPx: 0,
    pageWidthPx: 0,
    pageHeightPx: 0,
    baseDimensions: null,
    measurements: new Map(),
    measurementVersion: 0,
    layoutPlan: initialPlan,
    pendingLayout: null,
    measurementEntries: [],
    buckets: new Map(),
    isLayoutDirty: false,
});

export const layoutReducer = (state: CanvasLayoutState, action: CanvasLayoutAction): CanvasLayoutState => {
    const recomputeEntries = (base: CanvasLayoutState): CanvasLayoutState => {
        if (!base.template) {
            return {
                ...base,
                buckets: new Map(),
                measurementEntries: [],
            };
        }

        const { buckets, measurementEntries } = buildCanvasEntries({
            instances: base.components,
            template: base.template,
            columnCount: base.columnCount,
            pageWidthPx: base.pageWidthPx,
            dataSources: base.dataSources,
            measurements: base.measurements,
        });

        return { ...base, buckets, measurementEntries };
    };

    switch (action.type) {
        case 'INITIALIZE':
            return recomputeEntries({
                ...state,
                template: action.payload.template,
                pageVariables: action.payload.pageVariables,
                columnCount: action.payload.columnCount,
                regionHeightPx: action.payload.regionHeightPx,
                pageWidthPx: action.payload.pageWidthPx,
                pageHeightPx: action.payload.pageHeightPx,
                baseDimensions: action.payload.baseDimensions,
                layoutPlan: initialPlan,
                pendingLayout: null,
                isLayoutDirty: true,
            });
        case 'SET_COMPONENTS':
            return recomputeEntries({ ...state, components: action.payload.instances, isLayoutDirty: true });
        case 'SET_TEMPLATE':
            return recomputeEntries({ ...state, template: action.payload.template, isLayoutDirty: true });
        case 'SET_DATA_SOURCES':
            return recomputeEntries({ ...state, dataSources: action.payload.dataSources, isLayoutDirty: true });
        case 'SET_REGISTRY':
            return { ...state, componentRegistry: action.payload.registry };
        case 'SET_PAGE_VARIABLES':
            return recomputeEntries({
                ...state,
                pageVariables: action.payload.pageVariables,
                columnCount: action.payload.columnCount,
                regionHeightPx: action.payload.regionHeightPx,
                pageWidthPx: action.payload.pageWidthPx,
                pageHeightPx: action.payload.pageHeightPx,
                baseDimensions: action.payload.baseDimensions,
                isLayoutDirty: true,
            });
        case 'MEASUREMENTS_UPDATED': {
            const measurements = new Map(state.measurements);
            action.payload.measurements.forEach(({ key, height, measuredAt }) => {
                if (height <= 0) {
                    measurements.delete(key);
                } else {
                    measurements.set(key, { key, height, measuredAt });
                }
            });
            return recomputeEntries({
                ...state,
                measurements,
                measurementVersion: state.measurementVersion + 1,
                isLayoutDirty: true,
            });
        }
        case 'RECALCULATE_LAYOUT': {
            if (!state.template || !state.pageVariables) {
                return state;
            }

            if (state.regionHeightPx <= 0) {
                return state;
            }

            const requestedPageCount = state.pageVariables.pagination?.pageCount ?? 1;

            const pendingLayout = paginate({
                buckets: state.buckets,
                columnCount: state.columnCount,
                regionHeightPx: state.regionHeightPx,
                requestedPageCount,
            });
            return { ...state, pendingLayout };
        }
        case 'COMMIT_LAYOUT':
            return {
                ...state,
                layoutPlan: state.pendingLayout ?? state.layoutPlan,
                pendingLayout: null,
                isLayoutDirty: false,
            };
        default:
            return state;
    }
};

export const CanvasLayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(layoutReducer, undefined, createInitialState);

    const value = useMemo(() => state, [state]);

    return (
        <CanvasLayoutDispatchContext.Provider value={dispatch} >
            <CanvasLayoutStateContext.Provider value={value}>
                {children}
            </CanvasLayoutStateContext.Provider>
        </CanvasLayoutDispatchContext.Provider>
    );
};

export const useCanvasLayoutState = () => {
    const context = useContext(CanvasLayoutStateContext);
    if (!context) {
        throw new Error('useCanvasLayoutState must be used within a CanvasLayoutProvider');
    }
    return context;
};

export const useCanvasLayoutDispatch = () => {
    const context = useContext(CanvasLayoutDispatchContext);
    if (!context) {
        throw new Error('useCanvasLayoutDispatch must be used within a CanvasLayoutProvider');
    }
    return context;
};

export const useCanvasLayoutActions = () => {
    const dispatch = useCanvasLayoutDispatch();

    const initialize = useCallback(
        (
            template: TemplateConfig,
            pageVariables: PageVariables,
            instances: ComponentInstance[],
            dataSources: ComponentDataSource[],
            registry: Record<string, ComponentRegistryEntry>
        ) => {
            const baseDimensions = computeBasePageDimensions(pageVariables);
            const columnCount = pageVariables.columns.columnCount;

            dispatch({
                type: 'INITIALIZE',
                payload: {
                    template,
                    pageVariables,
                    columnCount,
                    regionHeightPx: baseDimensions.contentHeightPx,
                    pageWidthPx: baseDimensions.widthPx,
                    pageHeightPx: baseDimensions.heightPx,
                    baseDimensions,
                },
            });

            dispatch({ type: 'SET_COMPONENTS', payload: { instances } });
            dispatch({ type: 'SET_DATA_SOURCES', payload: { dataSources } });
            dispatch({ type: 'SET_REGISTRY', payload: { registry } });
        },
        [dispatch]
    );

    const setPageVariables = useCallback(
        (pageVariables: PageVariables) => {
            const baseDimensions = computeBasePageDimensions(pageVariables);
            const columnCount = pageVariables.columns.columnCount;

            dispatch({
                type: 'SET_PAGE_VARIABLES',
                payload: {
                    pageVariables,
                    columnCount,
                    regionHeightPx: baseDimensions.contentHeightPx,
                    pageWidthPx: baseDimensions.widthPx,
                    pageHeightPx: baseDimensions.heightPx,
                    baseDimensions,
                },
            });
        },
        [dispatch]
    );

    const setTemplate = useCallback(
        (template: TemplateConfig) => {
            dispatch({ type: 'SET_TEMPLATE', payload: { template } });
        },
        [dispatch]
    );

    const setComponents = useCallback(
        (instances: ComponentInstance[]) => {
            dispatch({ type: 'SET_COMPONENTS', payload: { instances } });
        },
        [dispatch]
    );

    const setDataSources = useCallback(
        (dataSources: ComponentDataSource[]) => {
            dispatch({ type: 'SET_DATA_SOURCES', payload: { dataSources } });
        },
        [dispatch]
    );

    const setRegistry = useCallback(
        (registry: Record<string, ComponentRegistryEntry>) => {
            dispatch({ type: 'SET_REGISTRY', payload: { registry } });
        },
        [dispatch]
    );

    const updateMeasurements = useCallback(
        (updates: MeasurementRecord[]) => {
            dispatch({ type: 'MEASUREMENTS_UPDATED', payload: { measurements: updates } });
        },
        [dispatch]
    );

    const recalculateLayout = useCallback(() => {
        dispatch({ type: 'RECALCULATE_LAYOUT' });
    }, [dispatch]);

    const commitLayout = useCallback(() => {
        dispatch({ type: 'COMMIT_LAYOUT' });
    }, [dispatch]);

    return {
        initialize,
        setPageVariables,
        setTemplate,
        setComponents,
        setDataSources,
        setRegistry,
        updateMeasurements,
        recalculateLayout,
        commitLayout,
    };
};


