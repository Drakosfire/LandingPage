import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MeasurementLayer, createMeasurementEntry } from '../measurement';

describe('MeasurementLayer cleanup', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should dispatch deletion when entry unmounts', async () => {
        const onMeasurements = vi.fn();
        const entry = createMeasurementEntry({ measurementKey: 'test-key' });

        const { rerender } = render(
            <MeasurementLayer
                entries={[entry]}
                renderComponent={() => <div>Test</div>}
                onMeasurements={onMeasurements}
            />
        );

        // Unmount the entry
        rerender(
            <MeasurementLayer
                entries={[]}
                renderComponent={() => <div>Test</div>}
                onMeasurements={onMeasurements}
            />
        );

        // Advance timers to trigger flush
        vi.runAllTimers();

        await waitFor(() => {
            expect(onMeasurements).toHaveBeenCalled();
            const calls = onMeasurements.mock.calls;
            const lastCall = calls[calls.length - 1][0];
            const deletions = lastCall.filter((m: { height: number }) => m.height === 0);
            expect(deletions.length).toBeGreaterThan(0);
            expect(deletions.some((m: { key: string }) => m.key === 'test-key')).toBe(true);
        });
    });

    it('should not dispatch deletion for entries that never mounted', () => {
        const onMeasurements = vi.fn();

        render(
            <MeasurementLayer
                entries={[]}
                renderComponent={() => <div>Test</div>}
                onMeasurements={onMeasurements}
            />
        );

        vi.runAllTimers();

        expect(onMeasurements).not.toHaveBeenCalled();
    });

    it('should handle multiple deletions in a single flush', async () => {
        const onMeasurements = vi.fn();
        const entry1 = createMeasurementEntry({ measurementKey: 'test-key-1' });
        const entry2 = createMeasurementEntry({ measurementKey: 'test-key-2' });

        const { rerender } = render(
            <MeasurementLayer
                entries={[entry1, entry2]}
                renderComponent={() => <div>Test</div>}
                onMeasurements={onMeasurements}
            />
        );

        // Unmount both entries
        rerender(
            <MeasurementLayer
                entries={[]}
                renderComponent={() => <div>Test</div>}
                onMeasurements={onMeasurements}
            />
        );

        vi.runAllTimers();

        await waitFor(() => {
            expect(onMeasurements).toHaveBeenCalled();
            const calls = onMeasurements.mock.calls;
            const lastCall = calls[calls.length - 1][0];
            const deletions = lastCall.filter((m: { height: number }) => m.height === 0);
            expect(deletions.length).toBeGreaterThanOrEqual(2);
        });
    });
});


