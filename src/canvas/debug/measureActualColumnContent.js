/**
 * Measure Actual Column Content
 * 
 * Finds the ACTUAL rendered content in columns regardless of attribute selectors.
 * Uses scrollHeight and direct child measurements.
 */

(() => {
    console.log('🔍 ACTUAL COLUMN CONTENT MEASUREMENT\n');

    // Get scale
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

    // Find all columns
    const columns = document.querySelectorAll('.canvas-column');
    console.log(`📋 Found ${columns.length} columns\n`);

    const results = [];

    columns.forEach((column, index) => {
        const pageNum = Math.floor(index / 2) + 1;
        const colNum = (index % 2) + 1;
        const regionKey = `${pageNum}:${colNum}`;

        // Get column dimensions
        const columnRect = column.getBoundingClientRect();
        const visualHeight = columnRect.height;
        const preTransformHeight = visualHeight / scale;

        // Try multiple methods to find content height
        const scrollHeight = column.scrollHeight;
        const scrollHeightPreTransform = scrollHeight / scale;

        // Get all direct children
        const children = Array.from(column.children);
        console.log(`📦 Region ${regionKey}: Found ${children.length} direct children`);

        // Measure each child
        let maxBottom = 0;
        let lastChild = null;

        children.forEach((child, childIndex) => {
            const childRect = child.getBoundingClientRect();
            const relativeTop = childRect.top - columnRect.top;
            const relativeBottom = childRect.bottom - columnRect.top;

            const childClasses = child.className || '(no class)';
            const childTag = child.tagName.toLowerCase();

            console.log(`  Child ${childIndex}: ${childTag}.${childClasses}`);
            console.log(`    Visual: ${relativeTop.toFixed(2)}px → ${relativeBottom.toFixed(2)}px (${childRect.height.toFixed(2)}px)`);
            console.log(`    Pre-transform: ${(relativeTop / scale).toFixed(2)}px → ${(relativeBottom / scale).toFixed(2)}px (${(childRect.height / scale).toFixed(2)}px)`);

            if (relativeBottom > maxBottom) {
                maxBottom = relativeBottom;
                lastChild = {
                    index: childIndex,
                    tag: childTag,
                    classes: childClasses,
                    visualTop: relativeTop,
                    visualBottom: relativeBottom,
                    visualHeight: childRect.height,
                    preTransformBottom: relativeBottom / scale,
                };
            }
        });

        const overrun = maxBottom - visualHeight;
        const hasOverrun = overrun > 1;

        results.push({
            regionKey,
            columnVisualHeight: visualHeight,
            columnPreTransformHeight: preTransformHeight,
            scrollHeight,
            scrollHeightPreTransform,
            contentVisualBottom: maxBottom,
            contentPreTransformBottom: maxBottom / scale,
            overrun,
            overrunPreTransform: overrun / scale,
            hasOverrun,
            lastChild,
            childCount: children.length,
        });

        console.log('');
    });

    // Display summary
    console.log('📊 OVERRUN SUMMARY:\n');

    results.forEach(result => {
        const emoji = result.hasOverrun ? '🔴' : '✅';

        console.log(`${emoji} Region ${result.regionKey}:`);
        console.table({
            'Column Dimensions': {
                'Visual height': `${result.columnVisualHeight.toFixed(2)}px`,
                'Pre-transform height': `${result.columnPreTransformHeight.toFixed(2)}px`,
                'Scroll height': `${result.scrollHeight}px`,
                'Scroll pre-transform': `${result.scrollHeightPreTransform.toFixed(2)}px`,
            },
            'Content Extent': {
                'Visual bottom': `${result.contentVisualBottom.toFixed(2)}px`,
                'Pre-transform bottom': `${result.contentPreTransformBottom.toFixed(2)}px`,
            },
            'Overrun': {
                'Visual overrun': `${result.overrun.toFixed(2)}px`,
                'Pre-transform overrun': `${result.overrunPreTransform.toFixed(2)}px`,
                'Status': result.hasOverrun ? '❌ OVERFLOW' : '✅ OK',
            }
        });

        if (result.lastChild) {
            console.log(`  Last child: ${result.lastChild.tag}.${result.lastChild.classes}`);
            console.log(`  Visual bottom: ${result.lastChild.visualBottom.toFixed(2)}px`);
            console.log(`  Pre-transform bottom: ${result.lastChild.preTransformBottom.toFixed(2)}px`);
        }
        console.log('');
    });

    // Look for problem regions
    const problemRegions = results.filter(r => r.hasOverrun);

    if (problemRegions.length === 0) {
        console.log('✅ No overruns detected!');
        console.log('\n💡 If you SEE visual overrun but diagnostic shows none:');
        console.log('   - Components may be positioned absolutely/fixed');
        console.log('   - Content may be in nested containers not measured');
        console.log('   - Visual issue may be margin/padding outside measured bounds');
        return;
    }

    console.log('🎯 PROBLEM REGIONS:\n');

    problemRegions.forEach(region => {
        console.log(`❌ Region ${region.regionKey}:`);
        console.log(`   Visual overrun: ${region.overrun.toFixed(2)}px`);
        console.log(`   Pre-transform overrun: ${region.overrunPreTransform.toFixed(2)}px`);

        // Check if overrun matches spacing constant
        const SPACING = 12;
        const visualSpacing = SPACING * scale;

        if (Math.abs(region.overrun - visualSpacing) < 2) {
            console.log(`   💡 Overrun ≈ ${visualSpacing.toFixed(2)}px (12px spacing * scale)`);
            console.log(`   → Likely COMPONENT_VERTICAL_SPACING_PX double-counting!`);
        } else if (Math.abs(region.overrunPreTransform - SPACING) < 2) {
            console.log(`   💡 Pre-transform overrun ≈ 12px`);
            console.log(`   → Likely COMPONENT_VERTICAL_SPACING_PX double-counting!`);
        }

        console.log('');
    });

    // Final summary
    console.log('📋 OVERALL SUMMARY:');
    console.table({
        'Statistics': {
            'Total columns': results.length,
            'Columns with overrun': problemRegions.length,
            'Success rate': `${((results.length - problemRegions.length) / results.length * 100).toFixed(1)}%`,
        }
    });

    if (problemRegions.length > 0) {
        const avgOverrun = problemRegions.reduce((sum, r) => sum + r.overrun, 0) / problemRegions.length;
        const avgOverrunPreTransform = problemRegions.reduce((sum, r) => sum + r.overrunPreTransform, 0) / problemRegions.length;

        console.log('\n🔬 AVERAGE OVERRUN:');
        console.log(`   Visual: ${avgOverrun.toFixed(2)}px`);
        console.log(`   Pre-transform: ${avgOverrunPreTransform.toFixed(2)}px`);
    }

    console.log('\n✅ Diagnostic complete.');
})();

