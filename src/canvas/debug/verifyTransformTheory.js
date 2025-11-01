/**
 * Transform Theory Verification
 * 
 * Tests if the visible layer height discrepancy is due to measuring
 * POST-TRANSFORM bounding boxes instead of PRE-TRANSFORM layout.
 * 
 * @date 2025-10-03
 */

window.verifyTransformTheory = function () {
    console.clear();
    console.log('🔍 TRANSFORM THEORY VERIFICATION\n');
    console.log('='.repeat(80));

    const visActions = document.querySelector('.brewRenderer .dm-action-section');
    const measActions = document.querySelector('.dm-statblock-measurement-layer .dm-action-section');

    if (!visActions || !measActions) {
        console.error('❌ Could not find Actions in both layers');
        return;
    }

    // Get the transform scale from the wrapper
    const brewWrapper = document.querySelector('.brewRenderer-wrapper');
    const transform = window.getComputedStyle(brewWrapper).transform;

    let scale = 0.777; // default
    if (transform && transform !== 'none') {
        const matrix = transform.match(/matrix\(([^)]+)\)/);
        if (matrix) {
            const values = matrix[1].split(',').map(parseFloat);
            scale = values[0]; // scaleX
        }
    }

    console.log('\n📏 STEP 1: Extract Transform Scale\n');
    console.log(`   Transform: ${transform}`);
    console.log(`   Extracted scale: ${scale.toFixed(6)}\n`);

    // Measure visible Actions
    const visRect = visActions.getBoundingClientRect();
    const visActionCount = visActions.querySelectorAll('.dm-action-term').length;

    // Measure measurement Actions
    const measRect = measActions.getBoundingClientRect();
    const measActionCount = measActions.querySelectorAll('.dm-action-term').length;

    console.log('📊 STEP 2: Raw Measurements\n');
    console.table({
        'Visible Layer': {
            height: visRect.height.toFixed(2),
            actionCount: visActionCount,
            method: 'getBoundingClientRect (POST-transform)',
        },
        'Measurement Layer': {
            height: measRect.height.toFixed(2),
            actionCount: measActionCount,
            method: 'getBoundingClientRect (NO transform)',
        }
    });

    console.log('\n🧮 STEP 3: Apply Reverse Transform\n');

    const visHeightPreTransform = visRect.height / scale;
    const heightDiff = measRect.height - visHeightPreTransform;
    const errorPercent = (heightDiff / measRect.height) * 100;

    console.table({
        'Calculation': {
            'Visible (post-transform)': visRect.height.toFixed(2) + 'px',
            'Scale Factor': scale.toFixed(6),
            'Visible (PRE-transform)': visHeightPreTransform.toFixed(2) + 'px',
            'Measurement Layer': measRect.height.toFixed(2) + 'px',
            'Difference': heightDiff.toFixed(2) + 'px',
            'Error %': errorPercent.toFixed(2) + '%',
        }
    });

    console.log('\n🎯 DIAGNOSIS:\n');

    if (visActionCount !== measActionCount) {
        console.warn(`⚠️  ACTION COUNT MISMATCH!`);
        console.warn(`   Visible: ${visActionCount} action(s)`);
        console.warn(`   Measurement: ${measActionCount} action(s)`);
        console.warn('\n   This means the component has ALREADY SPLIT.');
        console.warn('   The visible layer is showing a partial component (split segment).');
        console.warn('   Cannot compare heights directly - they measure different content!\n');

        // Try to find the rest in Column 2
        const col2Actions = document.querySelectorAll('.brewRenderer .canvas-column')[1]
            ?.querySelector('.dm-action-section');

        if (col2Actions) {
            const col2Rect = col2Actions.getBoundingClientRect();
            const col2ActionCount = col2Actions.querySelectorAll('.dm-action-term').length;
            const col2HeightPreTransform = col2Rect.height / scale;

            const combinedVisibleHeight = visRect.height + col2Rect.height;
            const combinedPreTransform = visHeightPreTransform + col2HeightPreTransform;
            const combinedDiff = measRect.height - combinedPreTransform;

            console.log('   Found continuation in Column 2:\n');
            console.table({
                'Column 1': {
                    'Height (post-transform)': visRect.height.toFixed(2),
                    'Height (pre-transform)': visHeightPreTransform.toFixed(2),
                    'Actions': visActionCount,
                },
                'Column 2': {
                    'Height (post-transform)': col2Rect.height.toFixed(2),
                    'Height (pre-transform)': col2HeightPreTransform.toFixed(2),
                    'Actions': col2ActionCount,
                },
                'Combined': {
                    'Height (post-transform)': combinedVisibleHeight.toFixed(2),
                    'Height (pre-transform)': combinedPreTransform.toFixed(2),
                    'Actions': visActionCount + col2ActionCount,
                },
                'vs Measurement': {
                    'Height (post-transform)': 'N/A',
                    'Height (pre-transform)': measRect.height.toFixed(2),
                    'Actions': measActionCount,
                },
                'Accuracy': {
                    'Height (post-transform)': 'N/A',
                    'Height (pre-transform)': combinedDiff.toFixed(2) + 'px diff',
                    'Actions': (visActionCount + col2ActionCount === measActionCount) ? '✅ Match' : '❌ Mismatch',
                }
            });

            if (Math.abs(combinedDiff) < 5) {
                console.log('\n   ✅ MEASUREMENT IS ACCURATE!');
                console.log('      Combined visible height (pre-transform) matches measurement layer');
                console.log('      within <5px tolerance.\n');
                console.log('   💡 The split is happening for a DIFFERENT reason:');
                console.log('      - Check pagination logs for split decision rationale');
                console.log('      - Verify region height normalization is working');
                console.log('      - Check if there\'s a bottom-zone threshold rejecting placement');
            } else {
                console.warn(`\n   ⚠️  Still ${Math.abs(combinedDiff).toFixed(2)}px discrepancy`);
                console.warn('      after accounting for transform and split.');
            }
        }
    } else if (Math.abs(heightDiff) < 5) {
        console.log('✅ MEASUREMENTS ARE ACCURATE!');
        console.log(`   Pre-transform visible height: ${visHeightPreTransform.toFixed(2)}px`);
        console.log(`   Measurement layer height: ${measRect.height.toFixed(2)}px`);
        console.log(`   Difference: ${Math.abs(heightDiff).toFixed(2)}px (<5px tolerance)\n`);
        console.log('   The previous diagnostic was comparing POST-transform vs PRE-transform heights.');
        console.log('   When accounting for the scale factor, measurements are accurate!\n');
    } else {
        console.warn(`⚠️  ${Math.abs(heightDiff).toFixed(2)}px discrepancy remains`);
        console.warn(`   (${Math.abs(errorPercent).toFixed(1)}% error)`);
        console.warn('\n   Even after accounting for transform, there is still a measurement error.');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Transform theory verification complete\n');
};

// Run immediately
verifyTransformTheory();

