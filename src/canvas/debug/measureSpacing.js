/**
 * Browser Console Script: Measure Actual Component Spacing
 * 
 * Usage:
 * 1. Open browser DevTools (F12)
 * 2. Navigate to Console tab
 * 3. Copy/paste this entire file and press Enter
 * 4. Review the spacing analysis output
 * 
 * Purpose:
 * Measure actual rendered spacing between canvas components to verify
 * COMPONENT_VERTICAL_SPACING_PX constant accuracy.
 */

(function measureComponentSpacing() {
    console.log('🔍 Measuring component spacing...\n');

    // Find all canvas entry elements
    const entries = document.querySelectorAll('[data-component-id]');

    if (entries.length === 0) {
        console.warn('⚠️ No components found. Make sure:');
        console.warn('  1. You\'re on the StatBlock Generator page');
        console.warn('  2. A statblock is loaded and rendered');
        console.warn('  3. Components have data-component-id attributes');
        return;
    }

    console.log(`Found ${entries.length} components\n`);

    const gaps = [];
    const componentData = [];

    entries.forEach((entry, idx) => {
        const rect = entry.getBoundingClientRect();
        const componentId = entry.getAttribute('data-component-id');

        componentData.push({
            index: idx,
            id: componentId,
            top: rect.top,
            bottom: rect.bottom,
            height: rect.height,
        });

        if (idx > 0) {
            const prev = entries[idx - 1];
            const prevRect = prev.getBoundingClientRect();
            const gap = rect.top - prevRect.bottom;

            gaps.push({
                between: `${prev.getAttribute('data-component-id')} → ${componentId}`,
                gap: gap,
            });
        }
    });

    // Calculate statistics
    const gapValues = gaps.map(g => g.gap);
    const min = Math.min(...gapValues);
    const max = Math.max(...gapValues);
    const avg = gapValues.reduce((a, b) => a + b, 0) / gapValues.length;
    const median = gapValues.sort((a, b) => a - b)[Math.floor(gapValues.length / 2)];

    console.log('📊 SPACING STATISTICS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Min gap:     ${min.toFixed(2)}px`);
    console.log(`  Max gap:     ${max.toFixed(2)}px`);
    console.log(`  Average:     ${avg.toFixed(2)}px`);
    console.log(`  Median:      ${median.toFixed(2)}px`);
    console.log(`  Total gaps:  ${gaps.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔧 CURRENT CONSTANT:');
    console.log('  COMPONENT_VERTICAL_SPACING_PX = 12\n');

    console.log('💡 RECOMMENDATION:');
    if (Math.abs(avg - 12) < 2) {
        console.log('  ✅ Current constant (12px) is accurate');
    } else if (avg < 10) {
        console.log(`  ⚠️  Consider reducing to ${Math.round(avg)}px`);
    } else if (avg > 14) {
        console.log(`  ⚠️  Consider increasing to ${Math.round(avg)}px`);
    } else {
        console.log(`  ℹ️  Average is ${avg.toFixed(2)}px - close to current 12px`);
    }

    console.log('\n📋 DETAILED GAP MEASUREMENTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    gaps.forEach((g, idx) => {
        const symbol = g.gap < avg - 2 ? '📉' : g.gap > avg + 2 ? '📈' : '➡️';
        console.log(`  ${symbol} Gap ${idx + 1}: ${g.gap.toFixed(2)}px`);
        console.log(`     ${g.between}`);
    });

    console.log('\n📐 COMPONENT POSITIONS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    componentData.forEach(c => {
        console.log(`  ${c.id}:`);
        console.log(`     Top: ${c.top.toFixed(2)}px, Bottom: ${c.bottom.toFixed(2)}px, Height: ${c.height.toFixed(2)}px`);
    });

    console.log('\n✅ Measurement complete!\n');

    // Return data for further analysis
    return {
        gaps,
        componentData,
        statistics: { min, max, avg, median, count: gaps.length },
    };
})();

