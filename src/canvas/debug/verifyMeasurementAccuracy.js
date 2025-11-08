/**
 * Measurement Accuracy Verification Script
 * 
 * Verifies that measurement layer measurements match visible layer reality.
 * Breaks down exactly what's being measured and where discrepancies come from.
 * 
 * Usage: Copy/paste into browser console after loading a statblock
 * 
 * @date 2025-10-03
 */

window.verifyMeasurementAccuracy = function () {
    console.clear();
    console.log('🔍 MEASUREMENT ACCURACY VERIFICATION\n');
    console.log('='.repeat(80));

    // Find both layers
    const measLayer = document.querySelector('.dm-canvas-measurement-layer');
    const visLayer = document.querySelector('.dm-canvas-renderer');

    if (!measLayer || !visLayer) {
        console.error('❌ Missing measurement or visible layer');
        return;
    }

    // Find Actions in both
    const measActions = measLayer.querySelector('.dm-action-section');
    const visActions = visLayer.querySelector('.dm-action-section');

    if (!measActions) {
        console.error('❌ No Actions component in measurement layer');
        return;
    }

    if (!visActions) {
        console.warn('⚠️  No Actions component in visible layer (might be split across columns)');
        console.log('   Checking all columns for Actions segments...\n');

        const allVisibleSegments = visLayer.querySelectorAll('.dm-action-section');
        if (allVisibleSegments.length === 0) {
            console.error('❌ No Actions found in any column');
            return;
        }

        console.log(`   Found ${allVisibleSegments.length} Actions segment(s) in visible layer`);
    }

    // Get parent column widths
    const measColumn = measActions.closest('.canvas-column');
    const visColumn = visActions?.closest('.canvas-column');

    const measColWidth = measColumn ? measColumn.getBoundingClientRect().width : 0;
    const visColWidth = visColumn ? visColumn.getBoundingClientRect().width : 0;

    console.log('\n📐 STEP 1: Column Width Verification\n');
    console.table({
        'Measurement Layer': {
            columnWidth: measColWidth.toFixed(2) + 'px',
            expectedWidth: '300px (pre-transform)',
        },
        'Visible Layer': {
            columnWidth: visColWidth.toFixed(2) + 'px',
            expectedWidth: '233px (post-transform at 0.777x)',
        },
        'Relationship': {
            columnWidth: (measColWidth / visColWidth).toFixed(4),
            expectedWidth: '1.2862 (1/0.777)',
        }
    });

    if (Math.abs((measColWidth / visColWidth) - (1 / 0.777)) > 0.01) {
        console.warn('⚠️  Width relationship is OFF! Should be ~1.286x');
        console.warn('   This will cause text wrapping differences and height errors');
    } else {
        console.log('✅ Column width relationship is correct\n');
    }

    // Measure the section container
    const measRect = measActions.getBoundingClientRect();
    const measStyles = window.getComputedStyle(measActions);

    console.log('\n📦 STEP 2: Measurement Layer Component Breakdown\n');

    // Parse padding values
    const measPaddingTop = parseFloat(measStyles.paddingTop) || 0;
    const measPaddingBottom = parseFloat(measStyles.paddingBottom) || 0;
    const measPaddingTotal = measPaddingTop + measPaddingBottom;

    // Get heading height
    const measHeading = measActions.querySelector('.dm-section-heading');
    const measHeadingHeight = measHeading ? measHeading.getBoundingClientRect().height : 0;

    // Get action items
    const measActionItems = measActions.querySelectorAll('.dm-action-term');
    const measDescItems = measActions.querySelectorAll('.dm-action-description');
    const measDividers = measActions.querySelectorAll('.dm-action-divider');

    let measActionContentHeight = 0;
    const measActionHeights = [];

    measActionItems.forEach((term, idx) => {
        const termHeight = term.getBoundingClientRect().height;
        const descHeight = measDescItems[idx] ? measDescItems[idx].getBoundingClientRect().height : 0;
        const dividerHeight = measDividers[idx] ? measDividers[idx].getBoundingClientRect().height : 0;

        const totalItemHeight = termHeight + descHeight + dividerHeight;
        measActionContentHeight += totalItemHeight;

        measActionHeights.push({
            action: `Action ${idx + 1}`,
            term: termHeight.toFixed(2),
            desc: descHeight.toFixed(2),
            divider: dividerHeight.toFixed(2),
            total: totalItemHeight.toFixed(2),
        });
    });

    const measExpectedTotal = measPaddingTotal + measHeadingHeight + measActionContentHeight;
    const measUnaccounted = measRect.height - measExpectedTotal;

    console.table({
        'Component Part': {
            'Total (getBoundingClientRect)': measRect.height.toFixed(2),
            'Padding (top + bottom)': measPaddingTotal.toFixed(2),
            'Heading': measHeadingHeight.toFixed(2),
            'Action Items (all)': measActionContentHeight.toFixed(2),
            'Expected Sum': measExpectedTotal.toFixed(2),
            'Unaccounted Space': measUnaccounted.toFixed(2),
        }
    });

    console.log('\nIndividual Action Breakdown (Measurement Layer):\n');
    console.table(measActionHeights);

    // Now measure visible layer if it exists as a single component
    if (visActions) {
        const visRect = visActions.getBoundingClientRect();
        const visStyles = window.getComputedStyle(visActions);

        console.log('\n📦 STEP 3: Visible Layer Component Breakdown\n');

        const visPaddingTop = parseFloat(visStyles.paddingTop) || 0;
        const visPaddingBottom = parseFloat(visStyles.paddingBottom) || 0;
        const visPaddingTotal = visPaddingTop + visPaddingBottom;

        const visHeading = visActions.querySelector('.dm-section-heading');
        const visHeadingHeight = visHeading ? visHeading.getBoundingClientRect().height : 0;

        const visActionItems = visActions.querySelectorAll('.dm-action-term');
        const visDescItems = visActions.querySelectorAll('.dm-action-description');
        const visDividers = visActions.querySelectorAll('.dm-action-divider');

        let visActionContentHeight = 0;
        const visActionHeights = [];

        visActionItems.forEach((term, idx) => {
            const termHeight = term.getBoundingClientRect().height;
            const descHeight = visDescItems[idx] ? visDescItems[idx].getBoundingClientRect().height : 0;
            const dividerHeight = visDividers[idx] ? visDividers[idx].getBoundingClientRect().height : 0;

            const totalItemHeight = termHeight + descHeight + dividerHeight;
            visActionContentHeight += totalItemHeight;

            visActionHeights.push({
                action: `Action ${idx + 1}`,
                term: termHeight.toFixed(2),
                desc: descHeight.toFixed(2),
                divider: dividerHeight.toFixed(2),
                total: totalItemHeight.toFixed(2),
            });
        });

        const visExpectedTotal = visPaddingTotal + visHeadingHeight + visActionContentHeight;
        const visUnaccounted = visRect.height - visExpectedTotal;

        console.table({
            'Component Part': {
                'Total (getBoundingClientRect)': visRect.height.toFixed(2),
                'Padding (top + bottom)': visPaddingTotal.toFixed(2),
                'Heading': visHeadingHeight.toFixed(2),
                'Action Items (all)': visActionContentHeight.toFixed(2),
                'Expected Sum': visExpectedTotal.toFixed(2),
                'Unaccounted Space': visUnaccounted.toFixed(2),
            }
        });

        console.log('\nIndividual Action Breakdown (Visible Layer):\n');
        console.table(visActionHeights);

        // Direct comparison
        console.log('\n📊 STEP 4: Layer Comparison\n');

        const heightDiff = measRect.height - visRect.height;
        const paddingDiff = measPaddingTotal - visPaddingTotal;
        const headingDiff = measHeadingHeight - visHeadingHeight;
        const contentDiff = measActionContentHeight - visActionContentHeight;
        const unaccountedDiff = measUnaccounted - visUnaccounted;

        console.table({
            'Measurement': {
                total: measRect.height.toFixed(2),
                padding: measPaddingTotal.toFixed(2),
                heading: measHeadingHeight.toFixed(2),
                content: measActionContentHeight.toFixed(2),
                unaccounted: measUnaccounted.toFixed(2),
            },
            'Visible': {
                total: visRect.height.toFixed(2),
                padding: visPaddingTotal.toFixed(2),
                heading: visHeadingHeight.toFixed(2),
                content: visActionContentHeight.toFixed(2),
                unaccounted: visUnaccounted.toFixed(2),
            },
            'Difference': {
                total: heightDiff.toFixed(2) + ' px',
                padding: paddingDiff.toFixed(2) + ' px',
                heading: headingDiff.toFixed(2) + ' px',
                content: contentDiff.toFixed(2) + ' px',
                unaccounted: unaccountedDiff.toFixed(2) + ' px',
            },
            'Contribution': {
                total: '100%',
                padding: ((paddingDiff / heightDiff) * 100).toFixed(1) + '%',
                heading: ((headingDiff / heightDiff) * 100).toFixed(1) + '%',
                content: ((contentDiff / heightDiff) * 100).toFixed(1) + '%',
                unaccounted: ((unaccountedDiff / heightDiff) * 100).toFixed(1) + '%',
            }
        });

        console.log('\n🎯 DIAGNOSIS:\n');

        if (Math.abs(heightDiff) < 5) {
            console.log('✅ Excellent accuracy (<5px difference)');
        } else {
            console.warn(`⚠️  Measurement is ${heightDiff > 0 ? 'OVER' : 'UNDER'}estimating by ${Math.abs(heightDiff).toFixed(2)}px\n`);

            // Identify the biggest contributor
            const contributions = [
                { name: 'Padding', value: Math.abs(paddingDiff) },
                { name: 'Heading', value: Math.abs(headingDiff) },
                { name: 'Content', value: Math.abs(contentDiff) },
                { name: 'Unaccounted', value: Math.abs(unaccountedDiff) },
            ].sort((a, b) => b.value - a.value);

            console.log('   Biggest contributors to error:');
            contributions.forEach((contrib, idx) => {
                if (contrib.value > 1) {
                    const icon = idx === 0 ? '🔴' : idx === 1 ? '🟡' : '⚪';
                    console.log(`   ${icon} ${contrib.name}: ${contrib.value.toFixed(2)}px (${((contrib.value / Math.abs(heightDiff)) * 100).toFixed(1)}%)`);
                }
            });

            if (Math.abs(contentDiff) > Math.abs(heightDiff) * 0.5) {
                console.log('\n   💡 Content height is the main issue - likely text reflow or spacing differences');
                console.log('   ➜ Check line-height, font-size, word-spacing, letter-spacing');
                console.log('   ➜ Verify both layers use same font (check font loading timing)');
            }

            if (Math.abs(paddingDiff) > 5) {
                console.log('\n   💡 Padding difference detected');
                console.log('   ➜ Check if measurement layer has different CSS specificity');
            }

            if (Math.abs(unaccountedDiff) > 5) {
                console.log('\n   💡 Unaccounted space difference (margins, gaps, or browser rounding)');
                console.log('   ➜ Check margin-top, margin-bottom on child elements');
                console.log('   ➜ Check gap property on parent containers');
            }
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Verification complete\n');
};

// Auto-run
verifyMeasurementAccuracy();

