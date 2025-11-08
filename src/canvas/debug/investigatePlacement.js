/**
 * Generic Component Placement Investigation Script
 * 
 * Purpose: Diagnose why a component is placed in a specific column
 * when visual space suggests it could fit elsewhere.
 * 
 * Usage: 
 * 1. Copy/paste into browser console
 * 2. Script will list all components
 * 3. Re-run with specific component (see instructions at end)
 * 
 * Based on ROOT_DEBUGGING_RULES.md methodology
 * 
 * @date 2025-10-03
 */

window.investigateComponentPlacement = function (targetSelector) {
    console.clear();
    console.log('🔍 Component Placement Investigation\n');
    console.log('='.repeat(80));

    // ============================================================================
    // STEP 0: Discovery Mode - Find All Components
    // ============================================================================
    if (!targetSelector) {
        console.log('\n📋 DISCOVERY MODE: Listing all components\n');

        const allComponents = document.querySelectorAll('.canvas-entry');

        if (allComponents.length === 0) {
            console.error('❌ No .canvas-entry elements found');
            console.log('   Make sure StatBlock is loaded and rendered');
            return;
        }

        console.log(`Found ${allComponents.length} components:\n`);

        const componentList = [];
        allComponents.forEach((comp, idx) => {
            const column = comp.closest('.canvas-column');
            const allColumns = document.querySelectorAll('.canvas-column');
            let colIndex = -1;
            allColumns.forEach((col, i) => {
                if (col === column) colIndex = i;
            });

            const firstChild = comp.firstElementChild;
            const classes = firstChild?.className || 'unknown';
            const heading = comp.querySelector('h4, h3, h2');
            const headingText = heading?.textContent || 'No heading';

            // Try to get component ID from data attribute
            const componentId = comp.getAttribute('data-component-id') ||
                firstChild?.getAttribute('data-component-id') ||
                'no-id';

            componentList.push({
                '#': idx,
                'Column': colIndex + 1,
                'Heading': headingText.slice(0, 30),
                'Class': classes.slice(0, 40),
                'Height': `${comp.getBoundingClientRect().height.toFixed(0)}px`,
            });
        });

        console.table(componentList);

        console.log('\n📝 To investigate a specific component, run:\n');
        console.log('   investigateComponentPlacement(".dm-action-section")');
        console.log('   investigateComponentPlacement(".dm-legendary-section")');
        console.log('   investigateComponentPlacement(".dm-trait-section")');
        console.log('\nOr use component index:');
        console.log('   investigateComponentPlacement(5)  // Investigates component #5\n');

        return;
    }

    // ============================================================================
    // STEP 1: Locate Target Component
    // ============================================================================
    console.log('\n📍 STEP 1: Locating target component\n');

    let targetComp;

    // Handle numeric index
    if (typeof targetSelector === 'number') {
        const allComponents = document.querySelectorAll('.canvas-entry');
        targetComp = allComponents[targetSelector];
        if (!targetComp) {
            console.error(`❌ Component index ${targetSelector} not found (max: ${allComponents.length - 1})`);
            return;
        }
    } else {
        // Handle CSS selector
        targetComp = document.querySelector(targetSelector);
        if (!targetComp) {
            // Try finding it inside canvas-entry
            const entries = document.querySelectorAll('.canvas-entry');
            for (const entry of entries) {
                if (entry.querySelector(targetSelector)) {
                    targetComp = entry;
                    break;
                }
            }
        }

        if (!targetComp) {
            console.error(`❌ Component not found: ${targetSelector}`);
            console.log('\n   Run without arguments to see available components:');
            console.log('   investigateComponentPlacement()\n');
            return;
        }
    }

    const targetColumn = targetComp.closest('.canvas-column');
    const targetPage = targetComp.closest('.page');

    if (!targetColumn || !targetPage) {
        console.error('❌ Could not find parent column/page');
        return;
    }

    // Determine column index
    const allColumns = document.querySelectorAll('.canvas-column');
    let columnIndex = -1;
    allColumns.forEach((col, idx) => {
        if (col === targetColumn) {
            columnIndex = idx;
        }
    });

    const targetRect = targetComp.getBoundingClientRect();
    const columnRect = targetColumn.getBoundingClientRect();
    const topInColumn = targetRect.top - columnRect.top;

    const heading = targetComp.querySelector('h4, h3, h2');
    const headingText = heading?.textContent || 'Unknown';
    const firstChild = targetComp.firstElementChild;
    const componentClass = firstChild?.className || 'unknown';

    console.log(`✅ Found component: "${headingText}" in Column ${columnIndex + 1}`);
    console.table({
        'Target Component': {
            'Heading': headingText,
            'Class': componentClass.slice(0, 50),
            'Height': `${targetRect.height.toFixed(2)}px`,
            'Top in Column': `${topInColumn.toFixed(2)}px`,
            'Bottom in Column': `${(topInColumn + targetRect.height).toFixed(2)}px`,
            'Column Height': `${columnRect.height.toFixed(2)}px`,
        }
    });

    // Check for overflow indicator
    const hasOverflow = firstChild?.classList.contains('dm-section-overflow');
    if (hasOverflow) {
        console.warn('⚠️  Component has .dm-section-overflow class');
    }

    // ============================================================================
    // STEP 2: Analyze Previous Column Space (if not in first column)
    // ============================================================================
    if (columnIndex > 0) {
        console.log('\n' + '='.repeat(80));
        console.log(`\n📐 STEP 2: Analyzing Column ${columnIndex} Available Space\n`);

        const prevColumn = allColumns[columnIndex - 1];
        const prevColRect = prevColumn.getBoundingClientRect();
        const prevColComponents = prevColumn.querySelectorAll('.canvas-entry');

        console.log(`Column ${columnIndex} contains ${prevColComponents.length} component(s):`);

        let lastComponentBottom = 0;
        const prevColLayout = [];

        prevColComponents.forEach(comp => {
            const compRect = comp.getBoundingClientRect();
            const topInCol = compRect.top - prevColRect.top;
            const bottomInCol = compRect.bottom - prevColRect.top;
            const compHeading = comp.querySelector('h4, h3, h2')?.textContent || 'Unknown';

            prevColLayout.push({
                'Component': compHeading.slice(0, 30),
                'Top': `${topInCol.toFixed(2)}px`,
                'Bottom': `${bottomInCol.toFixed(2)}px`,
                'Height': `${compRect.height.toFixed(2)}px`,
            });

            lastComponentBottom = Math.max(lastComponentBottom, bottomInCol);
        });

        console.table(prevColLayout);

        const availableSpace = prevColRect.height - lastComponentBottom;
        const utilizationPercent = ((lastComponentBottom / prevColRect.height) * 100).toFixed(1);

        console.log(`\n📊 Column ${columnIndex} Space Analysis:`);
        console.table({
            [`Column ${columnIndex}`]: {
                'Total Height': `${prevColRect.height.toFixed(2)}px`,
                'Used Space': `${lastComponentBottom.toFixed(2)}px (${utilizationPercent}%)`,
                'Available Space': `${availableSpace.toFixed(2)}px`,
                'Remaining %': `${((availableSpace / prevColRect.height) * 100).toFixed(1)}%`,
            }
        });

        // ============================================================================
        // STEP 3: Check if Component Would Fit
        // ============================================================================
        console.log('\n' + '='.repeat(80));
        console.log(`\n🎯 STEP 3: Would "${headingText}" Fit in Column ${columnIndex}?\n`);

        const targetHeight = targetRect.height;
        const COMPONENT_VERTICAL_SPACING = 12; // From utils.ts
        const spaceNeeded = targetHeight + COMPONENT_VERTICAL_SPACING;
        const wouldFit = spaceNeeded <= availableSpace;

        console.table({
            'Requirements': {
                'Component Height': `${targetHeight.toFixed(2)}px`,
                'Spacing Buffer': `${COMPONENT_VERTICAL_SPACING}px`,
                'Total Needed': `${spaceNeeded.toFixed(2)}px`,
            },
            'Available': {
                [`Space in Column ${columnIndex}`]: `${availableSpace.toFixed(2)}px`,
                'Would Fit?': wouldFit ? '✅ YES' : '❌ NO',
                'Excess/Deficit': wouldFit
                    ? `+${(availableSpace - spaceNeeded).toFixed(2)}px excess`
                    : `${(spaceNeeded - availableSpace).toFixed(2)}px short`,
            }
        });

        if (wouldFit) {
            console.warn(`\n⚠️  PLACEMENT ISSUE DETECTED:`);
            console.warn(`   "${headingText}" would fit in Column ${columnIndex} but was placed in Column ${columnIndex + 1}`);
        } else {
            console.log(`\n✅ Placement is correct: component too large for Column ${columnIndex}`);
        }

        // ============================================================================
        // STEP 4: Bottom Zone Threshold Analysis
        // ============================================================================
        console.log('\n' + '='.repeat(80));
        console.log('\n🚫 STEP 4: Bottom Zone Threshold Check\n');

        const BOTTOM_THRESHOLD = 1.0; // Check paginate.ts for actual value
        const whereWouldStart = lastComponentBottom + COMPONENT_VERTICAL_SPACING;
        const thresholdLine = prevColRect.height * BOTTOM_THRESHOLD;
        const startsInBottomZone = whereWouldStart > thresholdLine;

        console.table({
            'Threshold Analysis': {
                'BOTTOM_THRESHOLD': `${(BOTTOM_THRESHOLD * 100).toFixed(0)}%`,
                'Threshold Line': `${thresholdLine.toFixed(2)}px`,
                'Component Would Start At': `${whereWouldStart.toFixed(2)}px (${((whereWouldStart / prevColRect.height) * 100).toFixed(1)}%)`,
                'In Bottom Zone?': startsInBottomZone ? '🚫 YES' : '✅ NO',
            }
        });

        if (BOTTOM_THRESHOLD < 1.0 && startsInBottomZone && wouldFit) {
            console.warn(`\n⚠️  THRESHOLD MAY BE BLOCKING PLACEMENT:`);
            console.warn(`   Component would start at ${((whereWouldStart / prevColRect.height) * 100).toFixed(1)}% of column height`);
            console.warn(`   Threshold only allows placement up to ${(BOTTOM_THRESHOLD * 100).toFixed(0)}%`);
            console.warn(`   This might be why it was routed to Column ${columnIndex + 1}`);
            console.warn(`\n   ACTION: Check line ~220 in paginate.ts for BOTTOM_THRESHOLD value`);
        } else if (BOTTOM_THRESHOLD === 1.0) {
            console.log(`\n✅ Bottom zone threshold disabled (set to 100%)`);
            console.log(`   Threshold is NOT the reason for routing`);
        }

        // ============================================================================
        // STEP 5: Measurement Accuracy Check
        // ============================================================================
        console.log('\n' + '='.repeat(80));
        console.log('\n📏 STEP 5: Measurement Accuracy\n');

        const measLayer = document.querySelector('.dm-canvas-measurement-layer');
        if (measLayer) {
            // Find matching component in measurement layer by class
            const measComp = measLayer.querySelector(`.${componentClass.split(' ')[0]}`);

            if (measComp) {
                const measRect = measComp.getBoundingClientRect();
                const error = targetRect.height - measRect.height;
                const errorPct = ((error / targetRect.height) * 100).toFixed(1);

                console.table({
                    'Measurement Layer': {
                        'Height': `${measRect.height.toFixed(2)}px`,
                    },
                    'Visible Layer': {
                        'Height': `${targetRect.height.toFixed(2)}px`,
                    },
                    'Difference': {
                        'Error': `${error.toFixed(2)}px (${errorPct}%)`,
                        'Status': Math.abs(error) < 5 ? '✅ Accurate' : '⚠️ Significant',
                    }
                });

                if (Math.abs(error) > 5) {
                    console.warn('\n⚠️  Measurement discrepancy detected');
                    console.warn('   Pagination may have used incorrect height estimate');
                    console.warn('   This could cause routing to wrong column');
                }
            } else {
                console.log('ℹ️  Component not found in measurement layer (may not have been measured yet)');
            }
        } else {
            console.log('ℹ️  Measurement layer not found');
        }

        // ============================================================================
        // STEP 6: Root Cause Analysis
        // ============================================================================
        console.log('\n' + '='.repeat(80));
        console.log('\n🎯 STEP 6: Root Cause Hypothesis\n');

        if (wouldFit) {
            console.log('⚠️  PROBLEM CONFIRMED: Component should fit but was routed to next column\n');

            console.log('Most likely causes:\n');

            if (BOTTOM_THRESHOLD < 1.0 && startsInBottomZone) {
                console.log('1. ⭐⭐⭐ Bottom zone threshold blocking placement');
                console.log(`   • Would start at ${((whereWouldStart / prevColRect.height) * 100).toFixed(1)}%`);
                console.log(`   • Threshold is ${(BOTTOM_THRESHOLD * 100)}%`);
                console.log(`   • FIX: Increase BOTTOM_THRESHOLD to 0.85-0.90 or set to 1.0`);
                console.log('');
            }

            console.log('2. ⭐⭐ Incorrect estimated height during pagination');
            console.log(`   • Pagination may have overestimated component height`);
            console.log(`   • Check console logs for "estimatedHeight" vs actual ${targetHeight.toFixed(2)}px`);
            console.log(`   • FIX: Ensure measurements are used instead of estimates`);
            console.log('');

            console.log('3. ⭐⭐ Cursor position drift from cumulative errors');
            console.log(`   • Previous components may have caused cursor to drift`);
            console.log(`   • Pagination thinks less space available than actually is`);
            console.log(`   • FIX: Run layoutDiagnostic.js to check cumulative error`);
            console.log('');

            console.log('4. ⭐ Spacing calculation issue');
            console.log(`   • ${COMPONENT_VERTICAL_SPACING}px spacing may be applied incorrectly`);
            console.log(`   • Check cursor advance logic in paginate.ts`);

        } else {
            console.log('✅ Placement appears correct based on space constraints');
            console.log(`   Component needs ${spaceNeeded.toFixed(2)}px but only ${availableSpace.toFixed(2)}px available`);
        }

    } else {
        console.log('\n✅ Component is in first column (Column 1)');
        console.log('   No placement issue - this is the starting column');
    }

    // ============================================================================
    // SUMMARY
    // ============================================================================
    console.log('\n' + '='.repeat(80));
    console.log('\n📋 SUMMARY & NEXT STEPS\n');

    console.log(`Component: "${headingText}"`);
    console.log(`Current Column: ${columnIndex + 1}`);
    console.log(`Height: ${targetRect.height.toFixed(2)}px`);
    console.log('');

    if (columnIndex > 0) {
        const prevColumn = allColumns[columnIndex - 1];
        const prevColRect = prevColumn.getBoundingClientRect();
        const prevColComponents = prevColumn.querySelectorAll('.canvas-entry');
        let lastBottom = 0;
        prevColComponents.forEach(comp => {
            const rect = comp.getBoundingClientRect();
            lastBottom = Math.max(lastBottom, rect.bottom - prevColRect.top);
        });
        const available = prevColRect.height - lastBottom;
        const needed = targetRect.height + 12;
        const fits = needed <= available;

        console.log('Next Steps:');
        if (fits) {
            console.log('  1. Search console for component name or class to find pagination logs');
            console.log('  2. Look for "entry-overflow" or "route-entry" events');
            console.log('  3. Check "estimatedHeight" vs actual height in logs');
            console.log('  4. Verify BOTTOM_THRESHOLD value in paginate.ts line ~220');
            console.log('  5. Run layoutDiagnostic.js to check for cumulative cursor error');
        } else {
            console.log('  ✅ Placement is correct - component too large for previous column');
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Investigation complete\n');
};

// Run in discovery mode on initial load
investigateComponentPlacement();

