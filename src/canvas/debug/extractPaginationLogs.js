/**
 * Extract Pagination Logs for Component-6
 * 
 * Searches console history for component-6 pagination decisions.
 * Since we can't access console history programmatically, this script
 * provides instructions and format for manual extraction.
 * 
 * @date 2025-10-03
 */

console.clear();
console.log('📋 PAGINATION LOG EXTRACTION GUIDE\n');
console.log('='.repeat(80));
console.log('\n🔍 MANUAL STEPS:\n');
console.log('1. Open browser DevTools Console');
console.log('2. Use Ctrl+F (or Cmd+F) to search for: "component-6"');
console.log('3. Look for these log entries:\n');

console.log('   a) [paginate] entry-check');
console.log('      - Shows initial fit calculation');
console.log('      - Key fields: estimatedHeight, regionHeightPx, availableSpace, fits\n');

console.log('   b) [paginate] entry-overflow');
console.log('      - Confirms component overflowed');
console.log('      - Key fields: span, estimatedHeight, hasRegionContent\n');

console.log('   c) [paginate] measured-split-decision');
console.log('      - Shows split calculation with measurements');
console.log('      - Key fields: splitDecision.placedItems, placedTop, placedBottom\n');

console.log('   d) [paginate] entry-placed');
console.log('      - Shows where segments were actually placed');
console.log('      - Look for multiple entries (one per split segment)\n');

console.log('\n📊 WHAT TO LOOK FOR:\n');
console.log('   ❌ BAD: fits: false, availableSpace > estimatedHeight');
console.log('       → Pagination thinks it doesn\'t fit when it should\n');
console.log('   ❌ BAD: regionHeightPx: 708.5 for column 1:1');
console.log('       → Region height normalization not applied correctly\n');
console.log('   ❌ BAD: estimatedHeight: 300+ when measurement shows 280');
console.log('       → Using estimate instead of measurement\n');

console.log('\n🎯 QUICK CHECK - Run this now:\n');

// Check current state
const col1 = document.querySelector('.brewRenderer .canvas-column:nth-child(1)');
const col2 = document.querySelector('.brewRenderer .canvas-column:nth-child(2)');

if (col1 && col2) {
    const col1Height = col1.getBoundingClientRect().height;
    const col2Height = col2.getBoundingClientRect().height;

    // Find where Actions starts in Column 1
    const col1Components = col1.querySelectorAll('.dm-action-section, .dm-trait-section, .dm-quickfacts, .dm-stat-summary, .dm-ability-table, .dm-identity-header');
    let cursorBeforeActions = 0;
    let foundActions = false;

    col1Components.forEach(comp => {
        if (comp.classList.contains('dm-action-section')) {
            foundActions = true;
        } else if (!foundActions) {
            const rect = comp.getBoundingClientRect();
            const col1Rect = col1.getBoundingClientRect();
            const compBottom = rect.bottom - col1Rect.top;
            cursorBeforeActions = compBottom + 12; // + COMPONENT_VERTICAL_SPACING_PX
        }
    });

    console.log('📐 CURRENT LAYOUT STATE:\n');
    console.table({
        'Column 1': {
            height: col1Height.toFixed(2) + 'px',
            cursorBeforeActions: cursorBeforeActions.toFixed(2) + 'px',
            availableSpace: (col1Height - cursorBeforeActions).toFixed(2) + 'px',
            utilization: ((cursorBeforeActions / col1Height) * 100).toFixed(1) + '%',
        }
    });

    const measLayer = document.querySelector('.dm-statblock-measurement-layer');
    const measActions = measLayer?.querySelector('.dm-action-section');
    const measHeight = measActions ? measActions.getBoundingClientRect().height : 0;

    console.log('📏 MEASUREMENT vs AVAILABLE:\n');
    console.table({
        'Space Analysis': {
            'Actions needs (measured)': measHeight.toFixed(2) + 'px',
            'Available in Column 1': (col1Height - cursorBeforeActions).toFixed(2) + 'px',
            'Should fit?': (measHeight < (col1Height - cursorBeforeActions)) ? '✅ YES' : '❌ NO',
            'Margin': ((col1Height - cursorBeforeActions) - measHeight).toFixed(2) + 'px',
        }
    });

    const shouldFit = measHeight < (col1Height - cursorBeforeActions);
    const actuallyFit = col1.querySelector('.dm-action-section')?.querySelectorAll('.dm-action-term').length === 2;

    console.log('\n🎯 VERDICT:\n');
    if (shouldFit && !actuallyFit) {
        console.error('❌ PAGINATION BUG CONFIRMED!');
        console.error('   Component SHOULD fit but was split anyway.\n');
        console.error('   Next: Search console logs for "component-6" to find why.');
    } else if (shouldFit && actuallyFit) {
        console.log('✅ Working correctly - component fit as expected.');
    } else if (!shouldFit && !actuallyFit) {
        console.log('✅ Working correctly - component correctly split (not enough space).');
    } else {
        console.warn('⚠️  Unexpected state - should NOT fit but DID fit?');
    }
} else {
    console.warn('⚠️  Could not find columns - is statblock loaded?');
}

console.log('\n' + '='.repeat(80));
console.log('📋 Now search console for "component-6" and copy relevant logs\n');

