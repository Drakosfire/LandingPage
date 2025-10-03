import type { ComponentDataReference, ComponentDataSource, RegionListContent } from '../../../types/statblockCanvas.types';
import type { Action, StatBlockDetails } from '../../../types/statblock.types';

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

export const hasData = (value: unknown): boolean => {
    if (value === null || value === undefined) {
        return false;
    }

    if (typeof value === 'string') {
        return value.trim().length > 0;
    }

    if (Array.isArray(value)) {
        return value.length > 0;
    }

    if (typeof value === 'object') {
        return Object.keys(value as Record<string, unknown>).length > 0;
    }

    return true;
};

export const isActionEntry = (entry: unknown): entry is Action => {
    if (!entry || typeof entry !== 'object') {
        return false;
    }

    const candidate = entry as Record<string, unknown>;
    return typeof candidate.name === 'string' && typeof candidate.desc === 'string';
};

export const normalizeActionArray = (value: unknown): Action[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter(isActionEntry);
};

export const toRegionContent = (
    kind: RegionListContent['kind'],
    items: Action[],
    startIndex = 0,
    totalCount?: number,
    isContinuation = false,
    metadata?: Record<string, unknown>
): RegionListContent => ({
    kind,
    items,
    startIndex,
    totalCount: totalCount ?? items.length,
    isContinuation,
    metadata,
});

export const formatActionDetails = (action: Action): string => {
    const parts: string[] = [];

    if (action.desc) {
        parts.push(action.desc);
    }

    if (action.attackBonus !== undefined) {
        const bonus = action.attackBonus >= 0 ? `+${action.attackBonus}` : `${action.attackBonus}`;
        parts.push(`Attack Bonus: ${bonus}`);
    }

    if (action.damage) {
        parts.push(`Damage: ${action.damage}`);
    }

    if (action.recharge) {
        parts.push(`Recharge ${action.recharge}`);
    }

    if (action.range) {
        parts.push(`Range: ${action.range}`);
    }

    if (action.damageType) {
        parts.push(`Type: ${action.damageType}`);
    }

    return parts.join(' ');
};


