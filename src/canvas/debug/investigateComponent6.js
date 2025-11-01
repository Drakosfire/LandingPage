/**
 * Component-6 Placement Investigation Script
 * 
 * Purpose: Diagnose why component-6 is placed in column 2 despite
 * having visual space in column 1:1.
 * 
 * Usage: Copy/paste into browser console
 * 
 * Based on ROOT_DEBUGGING_RULES.md methodology:
 * - Observe actual placement
 * - Measure available space
 * - Compare with component requirements
 * - Identify decision point
 * 
 * @date 2025-10-03
 */

(function investigateComponent6() {
    console.clear();
    console.log('🔍 Component-6 Placement Investigation\n');
    console.log('='.repeat(80));

    // ============================================================================
    // STEP 1: Locate Component-6
    // ============================================================================
    console.log('\n📍 STEP 1: Locating component-6\n');

    const comp6 = document.querySelector('[data-component-id="component-6"]');

    if (!comp6) {
        console.error('❌ component-6 not found in DOM');
        console.log('   Available components:');
        document.querySelectorAll('[data-component-id]').forEach(c => {
            console.log(`   - ${c.getAttribute('data-component-id')}`);
        });
        return;
    }

    const comp6Column = comp6.closest('.canvas-column');
    const comp6Page = comp6.closest('.page');

    if (!comp6Column || !comp6Page) {
        console.error('❌ Could not find parent column/page for component-6');
        return;
    }

    // Determine which column this is
    const allColumns = document.querySelectorAll('.canvas-column');
    let columnIndex = -1;
    allColumns.forEach((col, idx) => {
        if (col === comp6Column) {
            columnIndex = idx;
        }
    });

    const comp6Rect = comp6.getBoundingClientRect();
    const columnRect = comp6Column.getBoundingClientRect();
    const topInColumn = comp6Rect.top - columnRect.top;

    console.log(`✅ Found component-6 in Column ${columnIndex + 1}`);
    console.table({
        'component-6': {
            'Height': `${comp6Rect.height.toFixed(2)}px`,
            'Top in Column': `${topInColumn.toFixed(2)}px`,
            'Bottom in Column': `${(topInColumn + comp6Rect.height).toFixed(2)}px`,
            'Column Height': `${columnRect.height.toFixed(2)}px`,
        }
    });

    // ============================================================================
    // STEP 2: Analyze Column 1 Space
    // ============================================================================
    console.log('\n' + '='.repeat(80));
    console.log('\n📐 STEP 2: Analyzing Column 1 Available Space\n');

    const column1 = allColumns[0];
    if (!column1) {
        console.error('❌ Column 1 not found');
        return;
    }

    const col1Rect = column1.getBoundingClientRect();
    const col1Components = column1.querySelectorAll('[data-component-id]');

    console.log(`Column 1 contains ${col1Components.length} component(s):`);

    let lastComponentBottom = 0;
    const col1Layout = [];

    col1Components.forEach(comp => {
        const compRect = comp.getBoundingClientRect();
        const topInCol = compRect.top - col1Rect.top;
        const bottomInCol = compRect.bottom - col1Rect.top;
        const compId = comp.getAttribute('data-component-id');

        col1Layout.push({
            'Component': compId,
            'Top': `${topInCol.toFixed(2)}px`,
            'Bottom': `${bottomInCol.toFixed(2)}px`,
            'Height': `${compRect.height.toFixed(2)}px`,
        });

        lastComponentBottom = Math.max(lastComponentBottom, bottomInCol);
    });

    console.table(col1Layout);

    const availableSpaceInCol1 = col1Rect.height - lastComponentBottom;
    const utilizationPercent = ((lastComponentBottom / col1Rect.height) * 100).toFixed(1);

    console.log('\n📊 Column 1 Space Analysis:');
    console.table({
        'Column 1': {
            'Total Height': `${col1Rect.height.toFixed(2)}px`,
            'Used Space': `${lastComponentBottom.toFixed(2)}px (${utilizationPercent}%)`,
            'Available Space': `${availableSpaceInCol1.toFixed(2)}px`,
            'Remaining %': `${((availableSpaceInCol1 / col1Rect.height) * 100).toFixed(1)}%`,
        }
    });

    // ============================================================================
    // STEP 3: Check if component-6 Would Fit
    // ============================================================================
    console.log('\n' + '='.repeat(80));
    console.log('\n🎯 STEP 3: Would component-6 Fit in Column 1?\n');

    const comp6Height = comp6Rect.height;
    const COMPONENT_VERTICAL_SPACING = 12; // From utils.ts
    const spaceNeeded = comp6Height + COMPONENT_VERTICAL_SPACING;
    const wouldFit = spaceNeeded <= availableSpaceInCol1;

    console.table({
        'Requirements': {
            'Component Height': `${comp6Height.toFixed(2)}px`,
            'Spacing Buffer': `${COMPONENT_VERTICAL_SPACING}px`,
            'Total Needed': `${spaceNeeded.toFixed(2)}px`,
        },
        'Available': {
            'Space in Column 1': `${availableSpaceInCol1.toFixed(2)}px`,
            'Would Fit?': wouldFit ? '✅ YES' : '❌ NO',
            'Excess/Deficit': wouldFit
                ? `+${(availableSpaceInCol1 - spaceNeeded).toFixed(2)}px excess`
                : `${(spaceNeeded - availableSpaceInCol1).toFixed(2)}px short`,
        }
    });

    if (wouldFit && columnIndex !== 0) {
        console.warn('\n⚠️  PLACEMENT ISSUE DETECTED:');
        console.warn('   component-6 would fit in Column 1 but was placed in Column ' + (columnIndex + 1));
    } else if (!wouldFit && columnIndex !== 0) {
        console.log('\n✅ Placement is correct: component-6 too large for Column 1');
    } else if (wouldFit && columnIndex === 0) {
        console.log('\n✅ Component placed correctly in Column 1');
    }

    // ============================================================================
    // STEP 4: Investigate Bottom Zone Threshold
    // ============================================================================
    console.log('\n' + '='.repeat(80));
    console.log('\n🚫 STEP 4: Bottom Zone Threshold Check\n');

    const BOTTOM_THRESHOLD = 1.0; // User set this
    const whereComp6WouldStart = lastComponentBottom + COMPONENT_VERTICAL_SPACING;
    const thresholdLine = col1Rect.height * BOTTOM_THRESHOLD;
    const startsInBottomZone = whereComp6WouldStart > thresholdLine;

    console.table({
        'Threshold Config': {
            'BOTTOM_THRESHOLD': `${(BOTTOM_THRESHOLD * 100).toFixed(0)}%`,
            'Threshold Line': `${thresholdLine.toFixed(2)}px`,
            'component-6 Would Start At': `${whereComp6WouldStart.toFixed(2)}px`,
            'Starts in Bottom Zone?': startsInBottomZone ? '🚫 YES (blocked)' : '✅ NO (allowed)',
        }
    });

    if (BOTTOM_THRESHOLD < 1.0 && startsInBottomZone) {
        console.warn(`\n⚠️  THRESHOLD BLOCKING PLACEMENT:`);
        console.warn(`   component-6 would start at ${((whereComp6WouldStart / col1Rect.height) * 100).toFixed(1)}%`);
        console.warn(`   Threshold only allows placement up to ${(BOTTOM_THRESHOLD * 100).toFixed(0)}%`);
        console.warn(`   This is why it was routed to Column ${columnIndex + 1}`);
    } else if (BOTTOM_THRESHOLD === 1.0) {
        console.log(`\n✅ Bottom zone threshold disabled (set to 100%)`);
        console.log(`   Threshold is NOT the reason for routing to Column ${columnIndex + 1}`);
    }

    // ============================================================================
    // STEP 5: Check Pagination Logs
    // ============================================================================
    console.log('\n' + '='.repeat(80));
    console.log('\n📋 STEP 5: Pagination Decision Analysis\n');

    console.log('To understand the routing decision, check console logs for:');
    console.log('');
    console.log('  1. Search for "component-6" in console logs');
    console.log('  2. Look for "entry-check" logs showing:');
    console.log('     - estimatedHeight');
    console.log('     - fits: true/false');
    console.log('     - availableSpace vs spaceNeeded');
    console.log('');
    console.log('  3. Look for "route-entry" logs showing:');
    console.log('     - from: "1:1" (Column 1)');
    console.log('     - to: "2:1" (Column 2)');
    console.log('     - Reason for routing');
    console.log('');
    console.log('  4. Look for "avoid-start-in-bottom" if threshold is active');
    console.log('');

    // ============================================================================
    // STEP 6: Measurement Layer Comparison
    // ============================================================================
    console.log('\n' + '='.repeat(80));
    console.log('\n📏 STEP 6: Measurement vs Actual Height\n');

    const measLayer = document.querySelector('.dm-statblock-measurement-layer');
    if (measLayer) {
        const measComp6 = measLayer.querySelector('[data-component-id="component-6"]');

        if (measComp6) {
            const measRect = measComp6.getBoundingClientRect();
            const error = comp6Rect.height - measRect.height;
            const errorPct = ((error / comp6Rect.height) * 100).toFixed(1);

            console.table({
                'Measurement Layer': {
                    'Height': `${measRect.height.toFixed(2)}px`,
                },
                'Visible Layer': {
                    'Height': `${comp6Rect.height.toFixed(2)}px`,
                },
                'Difference': {
                    'Error': `${error.toFixed(2)}px (${errorPct}%)`,
                    'Status': Math.abs(error) < 5 ? '✅ Accurate' : '⚠️ Significant',
                }
            });

            if (Math.abs(error) > 5) {
                console.warn('\n⚠️  Measurement discrepancy detected');
                console.warn('   This may cause pagination to underestimate/overestimate fit');
            }
        } else {
            console.log('ℹ️  component-6 not found in measurement layer (may be hidden)');
        }
    } else {
        console.log('ℹ️  Measurement layer not found');
    }

    // ============================================================================
    // STEP 7: Root Cause Hypothesis
    // ============================================================================
    console.log('\n' + '='.repeat(80));
    console.log('\n🎯 STEP 7: Root Cause Hypothesis\n');

    const hypotheses = [];

    if (!wouldFit) {
        hypotheses.push({
            hypothesis: 'Component too large for available space',
            likelihood: '⭐⭐⭐ High',
            evidence: `Needs ${spaceNeeded.toFixed(2)}px, only ${availableSpaceInCol1.toFixed(2)}px available`,
            action: 'This is correct behavior - no fix needed',
        });
    }

    if (wouldFit && BOTTOM_THRESHOLD < 1.0 && startsInBottomZone) {
        hypotheses.push({
            hypothesis: 'Bottom zone threshold blocking placement',
            likelihood: '⭐⭐⭐ High',
            evidence: `Would start at ${((whereComp6WouldStart / col1Rect.height) * 100).toFixed(1)}%, threshold is ${(BOTTOM_THRESHOLD * 100)}%`,
            action: 'Increase BOTTOM_THRESHOLD to 0.85-0.90 or remove check entirely',
        });
    }

    if (wouldFit && BOTTOM_THRESHOLD === 1.0 && columnIndex !== 0) {
        hypotheses.push({
            hypothesis: 'Incorrect estimated height in pagination',
            likelihood: '⭐⭐ Medium',
            evidence: 'Fits visually but pagination thinks it doesn\'t',
            action: 'Check console logs for "estimatedHeight" vs actual height',
        });
    }

    if (wouldFit && BOTTOM_THRESHOLD === 1.0 && columnIndex !== 0) {
        hypotheses.push({
            hypothesis: 'Cursor position drift from previous components',
            likelihood: '⭐⭐ Medium',
            evidence: 'Cumulative measurement errors cause cursor to be ahead of actual position',
            action: 'Run layoutDiagnostic.js to check cumulative error',
        });
    }

    if (hypotheses.length > 0) {
        console.log('Possible root causes (ordered by likelihood):\n');
        hypotheses.forEach((h, idx) => {
            console.log(`${idx + 1}. ${h.hypothesis}`);
            console.log(`   Likelihood: ${h.likelihood}`);
            console.log(`   Evidence: ${h.evidence}`);
            console.log(`   Action: ${h.action}`);
            console.log('');
        });
    } else {
        console.log('✅ Placement appears correct based on measurements');
    }

    // ============================================================================
    // STEP 8: Summary & Next Steps
    // ============================================================================
    console.log('\n' + '='.repeat(80));
    console.log('\n📋 SUMMARY\n');

    console.log(`Component-6 Status:`);
    console.log(`  • Currently in: Column ${columnIndex + 1}`);
    console.log(`  • Height: ${comp6Height.toFixed(2)}px`);
    console.log(`  • Would fit in Column 1: ${wouldFit ? '✅ YES' : '❌ NO'}`);
    console.log(`  • Bottom threshold: ${(BOTTOM_THRESHOLD * 100).toFixed(0)}%`);
    console.log('');

    console.log('Next Steps:');
    if (wouldFit && columnIndex !== 0) {
        console.log('  1. Search console for "component-6" to find pagination decisions');
        console.log('  2. Look for "entry-overflow" or "route-entry" logs');
        console.log('  3. Compare "estimatedHeight" in logs with actual height above');
        console.log('  4. Check "availableSpace" vs "spaceNeeded" in entry-check logs');
        console.log('  5. If cursor drift suspected, run layoutDiagnostic.js');
    } else {
        console.log('  ✅ Placement appears correct based on space constraints');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Investigation complete\n');
})();

