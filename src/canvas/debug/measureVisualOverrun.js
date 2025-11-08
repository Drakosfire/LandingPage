/**
 * Visual Overrun Diagnostic
 * 
 * Measures actual visual heights vs pagination calculations to understand
 * why components appear to overrun despite pagination saying they fit.
 * 
 * Run in browser console after page load.
 */

(() => {
    console.log('🔍 VISUAL OVERRUN DIAGNOSTIC\n');

    // Get scale from CSS variable
    const container = document.querySelector('.dm-canvas-wrapper');
    if (!container) {
        console.error('❌ Could not find .dm-canvas-wrapper');
        return;
    }

    const transform = window.getComputedStyle(container).transform;
    const matrix = transform.match(/matrix\(([^)]+)\)/);
    const scale = matrix ? parseFloat(matrix[1].split(',')[0]) : 1;

    console.log('📐 Transform scale:', scale.toFixed(6));
    console.log('');

    // Measure all columns
    const columns = document.querySelectorAll('.canvas-column');
    const results = [];

    columns.forEach((column, index) => {
        const pageNum = Math.floor(index / 2) + 1;
        const colNum = (index % 2) + 1;
        const regionKey = `${pageNum}:${colNum}`;

        // Get column dimensions
        const columnRect = column.getBoundingClientRect();
        const visualHeight = columnRect.height;
        const preTransformHeight = visualHeight / scale;

        // Get all components in this column
        const components = column.querySelectorAll('[data-component-id]');

        let maxBottom = 0;
        let lastComponent = null;

        components.forEach(comp => {
            const compRect = comp.getBoundingClientRect();
            const relativeTop = compRect.top - columnRect.top;
            const relativeBottom = compRect.bottom - columnRect.top;

            if (relativeBottom > maxBottom) {
                maxBottom = relativeBottom;
                lastComponent = {
                    id: comp.getAttribute('data-component-id'),
                    visualTop: relativeTop,
                    visualBottom: relativeBottom,
                    visualHeight: compRect.height,
                    preTransformBottom: relativeBottom / scale,
                };
            }
        });

        const overrun = maxBottom - visualHeight;
        const hasOverrun = overrun > 1; // Allow 1px tolerance

        results.push({
            regionKey,
            columnVisualHeight: visualHeight,
            columnPreTransformHeight: preTransformHeight,
            contentVisualBottom: maxBottom,
            contentPreTransformBottom: maxBottom / scale,
            overrun,
            hasOverrun,
            lastComponent,
        });
    });

    // Display results
    console.log('📊 COLUMN MEASUREMENTS:\n');

    results.forEach(result => {
        const emoji = result.hasOverrun ? '🔴' : '✅';

        console.log(`${emoji} Region ${result.regionKey}:`);
        console.table({
            'Column': {
                'Visual height': `${result.columnVisualHeight.toFixed(2)}px`,
                'Pre-transform height': `${result.columnPreTransformHeight.toFixed(2)}px`,
            },
            'Content': {
                'Visual bottom': `${result.contentVisualBottom.toFixed(2)}px`,
                'Pre-transform bottom': `${result.contentPreTransformBottom.toFixed(2)}px`,
            },
            'Overrun': {
                'Visual overrun': `${result.overrun.toFixed(2)}px`,
                'Status': result.hasOverrun ? '❌ OVERFLOW' : '✅ OK',
            }
        });

        if (result.lastComponent) {
            console.log(`  Last component: ${result.lastComponent.id}`);
            console.log(`  Component visual: ${result.lastComponent.visualTop.toFixed(2)}px → ${result.lastComponent.visualBottom.toFixed(2)}px`);
            console.log(`  Component pre-transform: ${(result.lastComponent.visualTop / scale).toFixed(2)}px → ${result.lastComponent.preTransformBottom.toFixed(2)}px`);
        }
        console.log('');
    });

    // Look for specific problem components
    console.log('🎯 PROBLEM COMPONENTS:\n');

    const problemRegions = results.filter(r => r.hasOverrun);
    if (problemRegions.length === 0) {
        console.log('✅ No overruns detected!');
        return;
    }

    problemRegions.forEach(region => {
        console.log(`❌ Region ${region.regionKey} overruns by ${region.overrun.toFixed(2)}px visual`);

        // Check pagination logs for this region
        console.log(`\n💡 To investigate, search console for:`);
        console.log(`   "[paginate] ${region.lastComponent?.id}" AND "regionKey: '${region.regionKey}'"`);
        console.log(`   Look for "placedBottom" value and compare to regionHeight\n`);
    });

    // Summary
    const totalOverruns = problemRegions.length;
    const totalColumns = results.length;

    console.log('\n📋 SUMMARY:');
    console.table({
        'Results': {
            'Total columns': totalColumns,
            'Columns with overrun': totalOverruns,
            'Success rate': `${((totalColumns - totalOverruns) / totalColumns * 100).toFixed(1)}%`,
        }
    });

    // Hypothesis checker
    console.log('\n🔬 HYPOTHESIS CHECK:');

    const avgOverrun = problemRegions.reduce((sum, r) => sum + r.overrun, 0) / problemRegions.length;
    const avgOverrunPercent = (avgOverrun / results[0].columnVisualHeight) * 100;

    if (totalOverruns > 0) {
        console.log(`Average overrun: ${avgOverrun.toFixed(2)}px (${avgOverrunPercent.toFixed(1)}% of column)`);

        // Check if it's a spacing issue
        const SPACING = 12; // COMPONENT_VERTICAL_SPACING_PX
        if (Math.abs(avgOverrun - SPACING) < 2) {
            console.log(`\n💡 Hypothesis: Missing COMPONENT_VERTICAL_SPACING_PX (${SPACING}px)`);
            console.log(`   Pagination may not be accounting for spacing after last component`);
        }

        // Check if it's a scale issue
        const scaleFactor = scale;
        const scaleError = avgOverrun / scaleFactor;
        console.log(`\n💡 If scale error: ${scaleError.toFixed(2)}px pre-transform discrepancy`);

        // Check if it's a percentage issue
        console.log(`\n💡 Check if pagination calculates percentages correctly:`);
        console.log(`   Expected: bottom / regionHeight <= 1.0 (100%)`);
        console.log(`   Actual may be > 1.0 due to spacing or measurement error`);
    }

    console.log('\n✅ Diagnostic complete. Review results above.');
})();

