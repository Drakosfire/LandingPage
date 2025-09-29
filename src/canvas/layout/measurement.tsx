import React, { useCallback, useRef } from 'react';

import type { MeasurementEntry, MeasurementRecord } from './types';
import { MEASUREMENT_THROTTLE_MS } from './utils';

type MeasurementDispatcher = (updates: MeasurementRecord[]) => void;

const scheduleFlush = (
    flush: () => void,
    idleHandle: React.MutableRefObject<number | null>
) => {
    if (typeof window === 'undefined') {
        idleHandle.current = setTimeout(() => {
            idleHandle.current = null;
            flush();
        }, MEASUREMENT_THROTTLE_MS) as unknown as number;
        return;
    }

    if (typeof window.requestIdleCallback === 'function') {
        idleHandle.current = window.requestIdleCallback(() => {
            idleHandle.current = null;
            flush();
        });
        return;
    }

    idleHandle.current = window.setTimeout(() => {
        idleHandle.current = null;
        flush();
    }, MEASUREMENT_THROTTLE_MS);
};

export const useIdleMeasurementDispatcher = (
    dispatch: (entries: MeasurementRecord[]) => void
): ((key: string, height: number) => void) => {
    const pending = useRef(new Map<string, MeasurementRecord>());
    const idleHandle = useRef<number | null>(null);

    const flush = useCallback(() => {
        if (pending.current.size === 0) {
            return;
        }
        const entries = Array.from(pending.current.values());
        pending.current.clear();
        dispatch(entries);
    }, [dispatch]);

    return useCallback(
        (key: string, height: number) => {
            const measuredAt = Date.now();
            pending.current.set(key, { key, height, measuredAt });

            if (idleHandle.current != null) {
                return;
            }

            scheduleFlush(() => {
                flush();
            }, idleHandle);
        },
        [flush]
    );
};

export const createMeasurementEntry = (overrides: Partial<MeasurementEntry> = {}): MeasurementEntry => ({
    instance: {
        id: 'mock-component',
        type: 'trait-list',
        dataRef: { type: 'statblock', path: 'specialAbilities' },
        layout: { isVisible: true },
    } as MeasurementEntry['instance'],
    slotIndex: 0,
    orderIndex: 0,
    sourceRegionKey: '1:1',
    region: { page: 1, column: 1 },
    estimatedHeight: 100,
    measurementKey: 'mock-component:block',
    needsMeasurement: true,
    ...overrides,
});

interface MeasurementLayerProps {
    entries: MeasurementEntry[];
    renderComponent: (entry: MeasurementEntry) => React.ReactNode;
    onMeasurements: MeasurementDispatcher;
}

export const MeasurementLayer: React.FC<MeasurementLayerProps> = ({ entries, renderComponent, onMeasurements }) => {
    const dispatcher = useIdleMeasurementDispatcher((updates) => {
        onMeasurements(updates);
    });

    const handleRef = useCallback(
        (entry: MeasurementEntry) => (node: HTMLDivElement | null) => {
            if (!node) {
                dispatcher(entry.measurementKey, 0);
                return;
            }
            const rect = node.getBoundingClientRect();
            if (rect.height > 0) {
                dispatcher(entry.measurementKey, rect.height);
            } else {
                dispatcher(entry.measurementKey, 0);
            }
        },
        [dispatcher]
    );

    return (
        <div className="dm-measurement-layer" aria-hidden>
            {entries.map((entry) => (
                <div
                    key={entry.measurementKey}
                    ref={handleRef(entry)}
                    className="dm-measurement-entry"
                    data-measurement-key={entry.measurementKey}
                >
                    {renderComponent(entry)}
                </div>
            ))}
        </div>
    );
};


