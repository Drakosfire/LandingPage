import { useEffect } from 'react';

import type {
    ComponentDataSource,
    ComponentInstance,
    ComponentRegistryEntry,
    PageVariables,
    TemplateConfig,
} from '../../types/statblockCanvas.types';
import type { MeasurementEntry } from '../layout/types';
import { MeasurementLayer } from '../layout/measurement';
import { useCanvasLayoutActions, useCanvasLayoutState } from '../layout/state';
import { computeBasePageDimensions } from '../layout/utils';

interface UseCanvasLayoutArgs {
    componentInstances: ComponentInstance[];
    template: TemplateConfig;
    dataSources: ComponentDataSource[];
    componentRegistry: Record<string, ComponentRegistryEntry>;
    pageVariables: PageVariables;
}

export const useCanvasLayout = ({
    componentInstances,
    template,
    dataSources,
    componentRegistry,
    pageVariables,
}: UseCanvasLayoutArgs) => {
    const state = useCanvasLayoutState();
    const actions = useCanvasLayoutActions();

    useEffect(() => {
        actions.initialize(template, pageVariables, componentInstances, dataSources, componentRegistry);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        actions.setTemplate(template);
    }, [actions, template]);

    useEffect(() => {
        actions.setComponents(componentInstances);
    }, [actions, componentInstances]);

    useEffect(() => {
        actions.setDataSources(dataSources);
    }, [actions, dataSources]);

    useEffect(() => {
        actions.setRegistry(componentRegistry);
    }, [actions, componentRegistry]);

    useEffect(() => {
        actions.setPageVariables(pageVariables);
    }, [actions, pageVariables]);

    useEffect(() => {
        if (!state.isLayoutDirty) return;
        actions.recalculateLayout();
    }, [actions, state.isLayoutDirty]);

    useEffect(() => {
        if (state.pendingLayout) {
            actions.commitLayout();
        }
    }, [actions, state.pendingLayout]);

    const measurementEntries = state.measurementEntries;
    const baseDimensions = state.baseDimensions ?? computeBasePageDimensions(pageVariables);

    return {
        plan: state.layoutPlan,
        measurementEntries,
        onMeasurements: actions.updateMeasurements,
        MeasurementLayer,
        baseDimensions,
    };
};



