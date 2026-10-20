import type { ComponentDataReference as CanvasComponentDataReference } from 'dungeonmind-canvas/layout';
import type { ComponentDataReference } from '../../types/statblockCanvas.types';

/**
 * Narrow Canvas's generic persisted reference at the statblock rendering boundary.
 * Statblock components only understand statblock, character, and custom sources.
 */
export const isStatblockComponentDataReference = (
    dataRef: CanvasComponentDataReference
): dataRef is ComponentDataReference => {
    if (dataRef.type === 'statblock' || dataRef.type === 'character') {
        return typeof dataRef.path === 'string';
    }

    if (dataRef.type === 'custom') {
        return dataRef.key === undefined || typeof dataRef.key === 'string';
    }

    return false;
};
