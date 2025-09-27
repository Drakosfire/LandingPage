import type { ComponentDataReference, ComponentDataSource } from '../../../types/statblockCanvas.types';
import type { StatBlockDetails } from '../../../types/statblock.types';

const getSource = (dataSources: ComponentDataSource[], dataRef: ComponentDataReference): ComponentDataSource | undefined => {
    if (dataRef.sourceId) {
        return dataSources.find((source) => source.id === dataRef.sourceId);
    }

    return dataSources.find((source) => {
        if (dataRef.type === 'statblock') {
            return source.type === 'statblock';
        }
        return source.type === 'custom';
    });
};

const resolvePath = (payload: unknown, path: string | undefined) => {
    if (!path || path === '.' || path === 'self') {
        return payload;
    }

    const segments = path.split('.');
    return segments.reduce<unknown>((acc, segment) => {
        if (acc && typeof acc === 'object' && segment in (acc as Record<string, unknown>)) {
            return (acc as Record<string, unknown>)[segment];
        }
        return undefined;
    }, payload);
};

export const resolveDataReference = (
    dataSources: ComponentDataSource[],
    dataRef: ComponentDataReference
): unknown => {
    const source = getSource(dataSources, dataRef);
    if (!source) return undefined;

    const payload = source.payload;
    if (dataRef.type === 'statblock') {
        return resolvePath(payload as StatBlockDetails, dataRef.path);
    }

    return resolvePath(payload as Record<string, unknown>, dataRef.key);
};

export const getPrimaryStatblock = (dataSources: ComponentDataSource[]): StatBlockDetails | null => {
    const source = dataSources.find((item) => item.type === 'statblock');
    return source ? (source.payload as StatBlockDetails) : null;
};

export const abilityModifier = (score: number | undefined): string => {
    if (score === undefined || Number.isNaN(score)) {
        return '—';
    }
    const modifier = Math.floor((Number(score) - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};


