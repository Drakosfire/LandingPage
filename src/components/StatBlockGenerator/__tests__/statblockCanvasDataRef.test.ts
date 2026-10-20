import type { ComponentDataReference as CanvasComponentDataReference } from 'dungeonmind-canvas/layout';
import { isStatblockComponentDataReference } from '../statblockCanvasDataRef';

describe('isStatblockComponentDataReference', () => {
    it.each([
        { type: 'statblock', path: 'name' },
        { type: 'character', path: 'name' },
        { type: 'custom', key: 'portraitUrl' },
        { type: 'custom' },
    ])('accepts supported reference %#', (dataRef) => {
        expect(isStatblockComponentDataReference(dataRef)).toBe(true);
    });

    it.each([
        { type: 'statblock' },
        { type: 'character' },
        { type: 'other-source', path: 'name' },
        { type: 'custom', key: 42 },
    ])('rejects unsupported or malformed reference %#', (dataRef) => {
        expect(isStatblockComponentDataReference(dataRef as CanvasComponentDataReference)).toBe(false);
    });
});
