import type { Action } from '../../../types/statblock.types';
import type { CanvasLayoutEntry, LayoutPlan } from '../../layout/types';
import type { ComponentInstance } from '../../../types/statblockCanvas.types';
import { paginate } from '../paginate';

const createInstance = (id: string, overrides: Partial<ComponentInstance> = {}): ComponentInstance => ({
    id,
    type: 'trait-list',
    dataRef: { type: 'statblock', path: 'specialAbilities' },
    layout: { isVisible: true, slotId: undefined },
    ...overrides,
});

const createEntry = (id: string, estimatedHeight: number, overrides: Partial<CanvasLayoutEntry> = {}): CanvasLayoutEntry => ({
    instance: createInstance(id),
    slotIndex: 0,
    orderIndex: 0,
    sourceRegionKey: '1:1',
    region: { page: 1, column: 1 },
    estimatedHeight,
    measurementKey: `${id}:block`,
    needsMeasurement: false,
    ...overrides,
});

const createListEntry = (id: string, items: Action[], estimatedHeight: number, overrides: Partial<CanvasLayoutEntry> = {}): CanvasLayoutEntry =>
    createEntry(id, estimatedHeight, {
        regionContent: {
            kind: 'trait-list',
            items,
            startIndex: 0,
            totalCount: items.length,
            isContinuation: false,
        },
        measurementKey: `${id}:trait-list:0:${items.length}:${items.length}`,
        ...overrides,
    });

const runPaginate = (entries: CanvasLayoutEntry[], columnCount = 1, regionHeightPx = 800, requestedPageCount = 1): LayoutPlan => {
    const buckets = new Map<string, CanvasLayoutEntry[]>();
    entries.forEach((entry) => {
        const key = entry.sourceRegionKey;
        if (!buckets.has(key)) {
            buckets.set(key, []);
        }
        buckets.get(key)!.push(entry);
    });

    return paginate({
        buckets,
        columnCount,
        regionHeightPx,
        requestedPageCount,
    });
};

const createAction = (name: string): Action => ({ name, desc: `${name} description` });

describe('paginate', () => {
    it('keeps components on a single page when heights fit', () => {
        const plan = runPaginate(
            [createEntry('first', 200, { orderIndex: 0 }), createEntry('second', 300, { orderIndex: 1 })],
            1,
            800,
            1
        );
        expect(plan.pages).toHaveLength(1);
        expect(plan.pages[0].columns[0].entries.map((entry) => entry.instance.id)).toEqual(['first', 'second']);
    });

    it('routes block entries to the next column when they overflow', () => {
        const tallEntry = createEntry('tall', 900);
        const plan = runPaginate([tallEntry], 2, 600, 1);
        expect(plan.pages).toHaveLength(1);
        expect(plan.pages[0].columns[0].entries[0].overflow).toBe(true);
        expect(plan.pages[0].columns[1].entries[0].instance.id).toBe('tall');
        expect(plan.pages[0].columns[1].entries[0].overflow).toBe(true);
    });

    it('appends a new page when both columns overflow on the first page', () => {
        const entryA = createEntry('A', 700, { orderIndex: 0 });
        const entryB = createEntry('B', 700, { orderIndex: 1 });
        const plan = runPaginate([entryA, entryB], 2, 600, 1);
        expect(plan.pages).toHaveLength(2);
        expect(plan.pages[0].columns[0].entries[0].instance.id).toBe('A');
        const secondPageFirstEntry = plan.pages[1].columns[0].entries[0];
        expect(secondPageFirstEntry.instance.id).toBe('B');
        expect(secondPageFirstEntry.overflow).toBe(true);
    });

    it('splits list entries across pages and marks continuation metadata', () => {
        const items = Array.from({ length: 5 }, (_, index) => createAction(`Trait ${index + 1}`));
        const listEntry = createListEntry('list', items, 900);
        const plan = runPaginate([listEntry], 1, 250, 1);

        expect(plan.pages.length).toBeGreaterThan(1);

        const firstEntry = plan.pages[0].columns[0].entries[0];
        const continuationEntry = plan.pages[1].columns[0].entries[0];

        expect(firstEntry.listContinuation?.isContinuation).toBe(false);
        expect(firstEntry.listContinuation?.startIndex).toBe(0);
        expect(firstEntry.listContinuation?.totalCount).toBe(items.length);

        expect(continuationEntry.listContinuation?.isContinuation).toBe(true);
        expect(continuationEntry.listContinuation?.startIndex).toBeGreaterThan(0);
        expect(continuationEntry.listContinuation?.totalCount).toBe(items.length);
    });

    it('uses requested page count when greater than the computed layout', () => {
        const plan = runPaginate([createEntry('only', 200)], 1, 800, 3);
        expect(plan.pages).toHaveLength(3);
    });
});
