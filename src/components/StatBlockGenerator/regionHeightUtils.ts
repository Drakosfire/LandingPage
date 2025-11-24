export const REGION_HEIGHT_MIN_ABS_DIFF_PX = 1;
export const REGION_HEIGHT_ABSOLUTE_NOISE_PX = 32;
export const REGION_HEIGHT_RELATIVE_NOISE = 0.05;

/**
 * Returns true when a region height update should be skipped because
 * the change is within the configured noise band (absolute + relative).
 *
 * @param previousHeight - Last applied region height
 * @param nextHeight - Incoming region height
 */
export const shouldSkipRegionHeightUpdate = (
    previousHeight: number,
    nextHeight: number
): boolean => {
    if (previousHeight <= 0) {
        return false;
    }

    const diff = Math.abs(nextHeight - previousHeight);
    if (diff <= REGION_HEIGHT_MIN_ABS_DIFF_PX) {
        return true;
    }

    const relativeChange = diff / previousHeight;
    return (
        diff < REGION_HEIGHT_ABSOLUTE_NOISE_PX &&
        relativeChange < REGION_HEIGHT_RELATIVE_NOISE
    );
};

