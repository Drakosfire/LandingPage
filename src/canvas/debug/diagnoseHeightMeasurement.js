/**
 * Height Measurement Diagnostic
 * 
 * Determines how getBoundingClientRect() interacts with CSS transform scale
 * to calibrate the height measurement system correctly.
 * 
 * Usage: Copy/paste entire file into browser console after page loads
 * 
 * @date 2025-10-03
 */

window.diagnoseHeightMeasurement = function () {
    console.clear();
    console.log('🔍 HEIGHT MEASUREMENT DIAGNOSTIC\n');
    console.log('='.repeat(80));

    // Find transform wrapper and column
    const wrapper = document.querySelector('.brewRenderer-wrapper');
    const brewRenderer = document.querySelector('.brewRenderer');
    const column = document.querySelector('.brewRenderer .canvas-column');

    if (!wrapper || !column) {
        console.error('❌ Could not find wrapper or column elements');
        return;
    }

    console.log('\n📏 STEP 1: Element Hierarchy\n');

    const wrapperTransform = window.getComputedStyle(wrapper).transform;
    const brewTransform = window.getComputedStyle(brewRenderer).transform;
    const columnTransform = window.getComputedStyle(column).transform;

    console.table({
        'brewRenderer-wrapper': {
            transform: wrapperTransform.substring(0, 50),
            hasTransform: wrapperTransform !== 'none' ? '✅' : '❌',
        },
        'brewRenderer': {
            transform: brewTransform.substring(0, 50),
            hasTransform: brewTransform !== 'none' ? '✅' : '❌',
        },
        'canvas-column': {
            transform: columnTransform,
            hasTransform: columnTransform !== 'none' ? '✅' : '❌',
        }
    });

    // Extract scale
    let scale = 0.777476; // Default
    if (wrapperTransform !== 'none') {
        const matrix = wrapperTransform.match(/matrix\(([^)]+)\)/);
        if (matrix) {
            const values = matrix[1].split(',').map(parseFloat);
            scale = values[0];
        }
    }

    console.log('\n📐 STEP 2: Bounding Box Measurements\n');

    const wrapperRect = wrapper.getBoundingClientRect();
    const brewRect = brewRenderer.getBoundingClientRect();
    const columnRect = column.getBoundingClientRect();

    console.table({
        'brewRenderer-wrapper': {
            width: wrapperRect.width.toFixed(2),
            height: wrapperRect.height.toFixed(2),
        },
        'brewRenderer': {
            width: brewRect.width.toFixed(2),
            height: brewRect.height.toFixed(2),
        },
        'canvas-column': {
            width: columnRect.width.toFixed(2),
            height: columnRect.height.toFixed(2),
        }
    });

    console.log('\n🔢 STEP 3: Alternative Height Properties\n');

    console.table({
        'Method': {
            'getBoundingClientRect': columnRect.height.toFixed(2),
            'offsetHeight': column.offsetHeight,
            'scrollHeight': column.scrollHeight,
            'clientHeight': column.clientHeight,
        }
    });

    console.log('\n🧮 STEP 4: Scale Calculations\n');

    const calculations = {
        'Input': {
            'Scale factor': scale.toFixed(6),
            'Column height (measured)': columnRect.height.toFixed(2),
        },
        'If pre-transform (divide)': {
            'Scale factor': `1/${scale.toFixed(3)} = ${(1 / scale).toFixed(3)}`,
            'Column height (measured)': `${columnRect.height.toFixed(2)} / ${scale.toFixed(3)} = ${(columnRect.height / scale).toFixed(2)}`,
        },
        'If post-transform (multiply)': {
            'Scale factor': scale.toFixed(6),
            'Column height (measured)': `${columnRect.height.toFixed(2)} * ${scale.toFixed(3)} = ${(columnRect.height * scale).toFixed(2)}`,
        },
        'If already correct (as-is)': {
            'Scale factor': 'N/A',
            'Column height (measured)': columnRect.height.toFixed(2),
        }
    };

    console.table(calculations);

    console.log('\n🎯 STEP 5: Comparison with Console Logs\n');

    console.log('Check browser console for these recent logs:');
    console.log('1. Search: "[updateRegionHeight]"');
    console.log('   Look for: columnHeight value');
    console.log('2. Search: "[paginate] entry-overflow"');
    console.log('   Look for: regionHeightPx value\n');

    console.log('Expected values based on current measurement:');
    console.table({
        'Scenario': {
            'Current columnHeight': columnRect.height.toFixed(2),
            'Logged regionHeightPx': 'Check console logs',
            'Match?': '❓',
        }
    });

    console.log('\n📊 STEP 6: Visual Verification Instructions\n');

    console.log('To confirm visual height:');
    console.log('1. Right-click column element → Inspect');
    console.log('2. In DevTools, hover over .canvas-column');
    console.log('3. Note the blue highlight box height shown in tooltip');
    console.log('4. Record the height value\n');

    console.log('Or run this to get a measurement reference:');
    console.log('   const marker = column.getBoundingClientRect()');
    console.log('   console.log("Top:", marker.top, "Bottom:", marker.bottom, "Height:", marker.bottom - marker.top);\n');

    console.log('\n🎯 DIAGNOSIS:\n');

    // Make educated guess based on known issues
    if (columnRect.height > 900) {
        console.warn('⚠️  LIKELY PRE-TRANSFORM HEIGHT DETECTED');
        console.warn(`   Measured: ${columnRect.height.toFixed(2)}px`);
        console.warn(`   Expected visual: ~${(columnRect.height * scale).toFixed(2)}px`);
        console.warn(`   Ratio: ${(columnRect.height / (columnRect.height * scale)).toFixed(3)}x`);
        console.warn('\n   💡 RECOMMENDED FIX:');
        console.warn('   In StatblockPage.tsx line ~313, change:');
        console.warn('   FROM: const usableHeight = columnRect.height;');
        console.warn('   TO:   const usableHeight = columnRect.height * scale;');
        console.warn(`   TO:   const usableHeight = columnRect.height * ${scale.toFixed(6)};`);
        console.warn('\n   OR if pagination needs pre-transform height, use as-is.');
    } else if (columnRect.height > 700 && columnRect.height < 800) {
        console.log('✅ LIKELY POST-TRANSFORM HEIGHT DETECTED');
        console.log(`   Measured: ${columnRect.height.toFixed(2)}px`);
        console.log(`   This matches expected visual size (~764px)`);
        console.log('\n   💡 CURRENT CODE IS LIKELY CORRECT');
        console.log('   Check console logs to confirm regionHeightPx matches this value.');
        console.log('   If logs show ~983px instead, there\'s a propagation issue.');
    } else {
        console.warn('⚠️  UNEXPECTED HEIGHT VALUE');
        console.warn(`   Measured: ${columnRect.height.toFixed(2)}px`);
        console.warn('   This doesn\'t match either expected range:');
        console.warn(`   - Post-transform: ~764px (${(columnRect.height * scale).toFixed(2)}px)`);
        console.warn(`   - Pre-transform: ~983px (${(columnRect.height / scale).toFixed(2)}px)`);
        console.warn('\n   Check for:');
        console.warn('   - Multiple transforms stacking');
        console.warn('   - Timing issues (page not fully loaded)');
        console.warn('   - CSS affecting column height unexpectedly');
    }

    console.log('\n' + '='.repeat(80));
    console.log('📋 NEXT STEPS:\n');
    console.log('1. Record the "Column height (measured)" value above');
    console.log('2. Use DevTools to visually confirm column height');
    console.log('3. Check console logs for regionHeightPx value');
    console.log('4. Compare all three values');
    console.log('5. Apply recommended fix if needed');
    console.log('\n✅ Diagnostic complete\n');

    return {
        scale,
        columnHeight: columnRect.height,
        postTransform: columnRect.height * scale,
        preTransform: columnRect.height / scale,
        recommendation: columnRect.height > 900 ? 'multiply_by_scale' : 'use_as_is',
    };
};

// Run immediately and return results
const results = diagnoseHeightMeasurement();
console.log('\n📦 Results object saved to window.heightDiagnostic:');
console.log(results);
window.heightDiagnostic = results;

