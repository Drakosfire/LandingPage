/**
 * Comprehensive Split Decision Diagnostic
 * 
 * Simulates pagination split logic to understand why Actions component
 * is being split when there appears to be enough space.
 * 
 * Usage: Copy/paste into browser console
 * 
 * @date 2025-10-03
 */

window.diagnoseSplit = function () {
    console.clear();
    console.log('🔍 SPLIT DECISION DIAGNOSTIC\n');
    console.log('='.repeat(80));

    // Get the actual layout state
    const col1 = document.querySelectorAll('.canvas-column')[0];
    if (!col1) {
        console.error('❌ Column 1 not found');
        return;
    }

    const col1Rect = col1.getBoundingClientRect();
    const col1Components = col1.querySelectorAll('.canvas-entry');

    // Find where Actions starts
    let cursorBeforeActions = 0;
    let actionsIndex = -1;

    col1Components.forEach((comp, idx) => {
        const rect = comp.getBoundingClientRect();
        const heading = comp.querySelector('h4, h3, h2')?.textContent;

        if (heading && heading.includes('Actions')) {
            actionsIndex = idx;
            // Calculate cursor position before Actions
            if (idx > 0) {
                const prevComp = col1Components[idx - 1];
                const prevRect = prevComp.getBoundingClientRect();
                const prevBottom = prevRect.bottom - col1Rect.top;
                cursorBeforeActions = prevBottom + 12; // + COMPONENT_VERTICAL_SPACING_PX
            }
        }
    });

    if (actionsIndex === -1) {
        console.error('❌ Actions component not found in Column 1');
        console.log('   Checking Column 2...');

        const col2 = document.querySelectorAll('.canvas-column')[1];
        if (col2) {
            const col2Components = col2.querySelectorAll('.canvas-entry');
            col2Components.forEach((comp, idx) => {
                const heading = comp.querySelector('h4, h3, h2')?.textContent;
                if (heading && heading.includes('Actions')) {
                    console.log(`   ✅ Found "${heading}" in Column 2 (index ${idx})`);
                }
            });
        }

        console.log('\n   Using cursor position from Column 1 end for simulation...');
        // Get last component in Column 1
        if (col1Components.length > 0) {
            const lastComp = col1Components[col1Components.length - 1];
            const lastRect = lastComp.getBoundingClientRect();
            const lastBottom = lastRect.bottom - col1Rect.top;
            cursorBeforeActions = lastBottom + 12;
        }
    }

    console.log('\n📍 STEP 1: Current State\n');
    console.table({
        'Column 1': {
            'Height': `${col1Rect.height.toFixed(2)}px`,
            'Cursor Position': `${cursorBeforeActions.toFixed(2)}px`,
            'Available Space': `${(col1Rect.height - cursorBeforeActions).toFixed(2)}px`,
            'Utilization': `${((cursorBeforeActions / col1Rect.height) * 100).toFixed(1)}%`,
        }
    });

    // Get measurement layer data
    const measLayer = document.querySelector('.dm-statblock-measurement-layer');
    const measActions = measLayer?.querySelector('.dm-action-section');

    if (!measActions) {
        console.error('❌ Actions not found in measurement layer');
        return;
    }

    const measRect = measActions.getBoundingClientRect();
    const measActionTerms = measActions.querySelectorAll('.dm-action-term');

    console.log('\n📏 STEP 2: Measurement Layer Data\n');
    console.table({
        'Full Component': {
            'Height': `${measRect.height.toFixed(2)}px`,
            'Action Count': measActionTerms.length,
            'Per Action (proportional)': `${(measRect.height / measActionTerms.length).toFixed(2)}px`,
        }
    });

    // Simulate split logic
    const SPACING = 12;
    const BOTTOM_THRESHOLD = 1.0; // 100% = disabled
    const regionHeight = col1Rect.height;
    const currentOffset = cursorBeforeActions;
    const availableSpace = regionHeight - currentOffset;
    const fullHeight = measRect.height;
    const itemCount = measActionTerms.length;

    console.log('\n🎯 STEP 3: Split Decision Simulation\n');
    console.log('Trying splits from largest to smallest (greedy algorithm):\n');

    const splitResults = [];

    for (let splitAt = itemCount; splitAt > 0; splitAt--) {
        // Proportional calculation (what paginate.ts does)
        const proportionalHeight = (fullHeight / itemCount) * splitAt;
        const segmentTop = currentOffset;
        const segmentBottom = segmentTop + proportionalHeight + SPACING;

        // Check constraints
        const startsInBottomZone = segmentTop > (regionHeight * BOTTOM_THRESHOLD);
        const exceedsRegion = segmentBottom > regionHeight;
        const fits = !exceedsRegion && !startsInBottomZone;

        splitResults.push({
            'Split': `${splitAt}/${itemCount} actions`,
            'Height': `${proportionalHeight.toFixed(2)}px`,
            'Top': `${segmentTop.toFixed(2)}px (${((segmentTop / regionHeight) * 100).toFixed(1)}%)`,
            'Bottom': `${segmentBottom.toFixed(2)}px (${((segmentBottom / regionHeight) * 100).toFixed(1)}%)`,
            'Fits': fits ? '✅ YES' : startsInBottomZone ? '🚫 Bottom zone' : '❌ Overflow',
            'Decision': fits ? '⭐ PLACE HERE' : 'Try fewer',
        });

        if (fits) {
            console.log(`\n✅ Algorithm should choose: ${splitAt} action(s)`);
            console.log(`   Height: ${proportionalHeight.toFixed(2)}px`);
            console.log(`   Bottom: ${segmentBottom.toFixed(2)}px / ${regionHeight.toFixed(2)}px`);
            console.log(`   Excess space: ${(regionHeight - segmentBottom).toFixed(2)}px`);
            break;
        }
    }

    console.table(splitResults);

    // Get actual visible result
    console.log('\n📊 STEP 4: Actual vs Expected\n');

    const allComponents = document.querySelectorAll('.canvas-entry');
    const actualActionSegments = [];

    allComponents.forEach((comp, idx) => {
        const heading = comp.querySelector('h4, h3, h2')?.textContent;
        if (heading && heading.includes('Actions')) {
            const rect = comp.getBoundingClientRect();
            const actionCount = comp.querySelectorAll('.dm-action-term').length;
            const column = comp.closest('.canvas-column');
            const allCols = document.querySelectorAll('.canvas-column');
            let colIdx = -1;
            allCols.forEach((c, i) => { if (c === column) colIdx = i; });

            actualActionSegments.push({
                'Segment': heading,
                'Column': colIdx + 1,
                'Actions': actionCount,
                'Height': rect.height.toFixed(2),
            });
        }
    });

    console.table(actualActionSegments);

    console.log('\n🎯 DIAGNOSIS:\n');

    const expectedSplit = splitResults.find(r => r.Decision === '⭐ PLACE HERE');
    const expectedActions = expectedSplit ? parseInt(expectedSplit.Split.split('/')[0]) : 0;
    const actualFirstSegment = actualActionSegments[0];
    const actualActions = actualFirstSegment ? actualFirstSegment.Actions : 0;

    if (expectedActions === actualActions) {
        console.log(`✅ Algorithm working correctly!`);
        console.log(`   Expected: ${expectedActions} action(s) in Column 1`);
        console.log(`   Actual: ${actualActions} action(s) in Column 1`);
    } else {
        console.warn(`⚠️  MISMATCH DETECTED!`);
        console.warn(`   Expected: ${expectedActions} action(s) in Column 1`);
        console.warn(`   Actual: ${actualActions} action(s) in Column 1`);
        console.warn(`\n   Possible causes:`);
        console.warn(`   1. Cursor position drift (pagination thinks it's at ${currentOffset.toFixed(2)}px)`);
        console.warn(`   2. Different height calculation (proportional vs estimate)`);
        console.warn(`   3. Split logic has additional constraints not simulated here`);
        console.warn(`\n   Next steps:`);
        console.warn(`   - Check browser console for pagination logs (📐, ✅, 📊)`);
        console.warn(`   - Look for "splitAt" value in logs for Actions component`);
        console.warn(`   - Verify BOTTOM_THRESHOLD value in paginate.ts line 235`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Diagnostic complete\n');
};

// Run immediately
diagnoseSplit();

