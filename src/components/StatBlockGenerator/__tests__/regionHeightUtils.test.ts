import {
    REGION_HEIGHT_ABSOLUTE_NOISE_PX,
    REGION_HEIGHT_MIN_ABS_DIFF_PX,
    REGION_HEIGHT_RELATIVE_NOISE,
    shouldSkipRegionHeightUpdate,
} from '../regionHeightUtils';

describe('regionHeightUtils', () => {
    it('allows first measurement to pass through', () => {
        expect(shouldSkipRegionHeightUpdate(0, 980)).toBe(false);
    });

    it('skips changes below minimum absolute diff', () => {
        const prev = 980;
        const next = prev - REGION_HEIGHT_MIN_ABS_DIFF_PX / 2;
        expect(shouldSkipRegionHeightUpdate(prev, next)).toBe(true);
    });

    it('skips changes within noise band (absolute + relative)', () => {
        const prev = 980;
        const next = prev - (REGION_HEIGHT_ABSOLUTE_NOISE_PX / 2);
        expect(shouldSkipRegionHeightUpdate(prev, next)).toBe(true);
    });

    it('applies changes beyond absolute noise threshold', () => {
        const prev = 980;
        const next = prev - (REGION_HEIGHT_ABSOLUTE_NOISE_PX + 5);
        expect(shouldSkipRegionHeightUpdate(prev, next)).toBe(false);
    });

    it('applies changes that exceed relative threshold even if absolute diff is small', () => {
        const prev = 100; // small base height to trigger relative threshold
        const next = prev - (prev * (REGION_HEIGHT_RELATIVE_NOISE + 0.01));
        expect(shouldSkipRegionHeightUpdate(prev, next)).toBe(false);
    });
});

