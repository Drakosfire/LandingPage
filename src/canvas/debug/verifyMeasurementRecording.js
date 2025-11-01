/**
 * Verify Measurement Recording
 * 
 * Checks if measurements are being recorded correctly by comparing:
 * 1. What the measurement layer actually renders
 * 2. What gets stored in the measurement map
 * 3. What pagination uses
 * 
 * Usage: Paste into browser console after measurements complete
 */

(() => {
    console.log('🔍 MEASUREMENT RECORDING VERIFICATION\n');

    // Find measurement layer
    const measLayer = document.querySelector('.dm-statblock-measurement-layer');
    if (!measLayer) {
        console.error('❌ Measurement layer not found');
        return;
    }

    // Get scale
    const container = document.querySelector('.brewRenderer-wrapper');
    const transform = window.getComputedStyle(container).transform;
    const matrix = transform.match(/matrix\(([^)]+)\)/);
    const scale = matrix ? parseFloat(matrix[1].split(',')[0]) : 1;

    console.log('📐 Scale:', scale.toFixed(6));

    // Check measurement layer column width
    const measColumn = measLayer.querySelector('.canvas-column');
    if (measColumn) {
        const colWidth = measColumn.getBoundingClientRect().width;
        const colStyles = window.getComputedStyle(measColumn);

        console.log('\n📏 MEASUREMENT LAYER COLUMN:');
        console.table({
            'Properties': {
                'Rendered width': `${colWidth.toFixed(2)}px`,
                'CSS width': colStyles.width,
                'Flex': colStyles.flex,
                'Position': colStyles.position,
            }
        });
    }

    // Check visible layer column width
    const visColumn = document.querySelectorAll('.brewRenderer .canvas-column')[1];
    if (visColumn) {
        const colWidth = visColumn.getBoundingClientRect().width;
        const preTransformWidth = colWidth / scale;
        const colStyles = window.getComputedStyle(visColumn);

        console.log('\n📏 VISIBLE LAYER COLUMN (Region 1:2):');
        console.table({
            'Properties': {
                'Rendered width': `${colWidth.toFixed(2)}px`,
                'Pre-transform width': `${preTransformWidth.toFixed(2)}px`,
                'CSS width': colStyles.width,
                'Flex': colStyles.flex,
            }
        });
    }

    // Find the specific measurement entry for component-10 (2 items)
    const targetKey = 'component-10:legendary-action-list:0:2:3';
    const measEntry = measLayer.querySelector(`[data-measurement-key="${targetKey}"]`);

    if (!measEntry) {
        console.warn(`\n⚠️  Measurement entry "${targetKey}" not found in DOM`);
        console.log('\nAvailable component-10 measurements:');
        const comp10Entries = measLayer.querySelectorAll('[data-measurement-key*="component-10"]');
        comp10Entries.forEach(entry => {
            const key = entry.getAttribute('data-measurement-key');
            const height = entry.getBoundingClientRect().height;
            console.log(`  ${key}: ${height.toFixed(2)}px`);
        });
        return;
    }

    // Measure the entry in measurement layer
    const measRect = measEntry.getBoundingClientRect();
    const measHeight = measRect.height;
    const measWidth = measRect.width;

    console.log(`\n\n📊 COMPONENT-10 (2 legendary actions) MEASUREMENT LAYER:`);
    console.table({
        'Rendered': {
            'Width': `${measWidth.toFixed(2)}px`,
            'Height': `${measHeight.toFixed(2)}px`,
            'Key': targetKey,
        }
    });

    // Find the same component in visible layer (Region 1:2)
    const visLayerColumn = document.querySelectorAll('.brewRenderer .canvas-column')[1];
    let visEntry = null;

    if (visLayerColumn) {
        const entries = visLayerColumn.querySelectorAll('.canvas-entry');
        entries.forEach(entry => {
            const legendarySection = entry.querySelector('.dm-legendary-section');
            if (legendarySection) {
                const items = legendarySection.querySelectorAll('dt.dm-action-term');
                if (items.length === 2) {
                    visEntry = entry;
                }
            }
        });
    }

    if (!visEntry) {
        console.warn('\n⚠️  Could not find component-10 (2 items) in visible layer');
    } else {
        const visRect = visEntry.getBoundingClientRect();
        const visHeight = visRect.height;
        const visWidth = visRect.width;
        const preTransformHeight = visHeight / scale;
        const preTransformWidth = visWidth / scale;

        console.log(`\n📊 COMPONENT-10 (2 legendary actions) VISIBLE LAYER:`);
        console.table({
            'Rendered (scaled)': {
                'Width': `${visWidth.toFixed(2)}px`,
                'Height': `${visHeight.toFixed(2)}px`,
            },
            'Pre-transform': {
                'Width': `${preTransformWidth.toFixed(2)}px`,
                'Height': `${preTransformHeight.toFixed(2)}px`,
            }
        });
    }

    // Compare
    if (visEntry) {
        const visHeight = visEntry.getBoundingClientRect().height / scale;
        const heightDiff = visHeight - measHeight;
        const widthDiff = Math.abs((visEntry.getBoundingClientRect().width / scale) - measWidth);

        console.log(`\n\n❌ DISCREPANCY ANALYSIS:`);
        console.table({
            'Height': {
                'Measurement layer': `${measHeight.toFixed(2)}px`,
                'Visible layer (pre-transform)': `${visHeight.toFixed(2)}px`,
                'Difference': `${heightDiff.toFixed(2)}px`,
                'Percentage': `${((heightDiff / measHeight) * 100).toFixed(1)}%`,
            },
            'Width': {
                'Measurement layer': `${measWidth.toFixed(2)}px`,
                'Visible layer (pre-transform)': `${(visEntry.getBoundingClientRect().width / scale).toFixed(2)}px`,
                'Difference': `${widthDiff.toFixed(2)}px`,
            }
        });

        if (Math.abs(widthDiff) > 5) {
            console.warn('\n⚠️  WIDTH MISMATCH DETECTED!');
            console.log('This causes different text wrapping → wrong heights');
            console.log('\n🔍 Root Cause: Measurement layer column width ≠ Visible layer effective width');
        } else if (Math.abs(heightDiff) > 10) {
            console.warn('\n⚠️  HEIGHT MISMATCH WITHOUT WIDTH ISSUE!');
            console.log('Possible causes:');
            console.log('  - CSS differences between layers');
            console.log('  - Font rendering differences');
            console.log('  - Transform affecting layout calculation');
            console.log('  - Measurement recorded before images/fonts loaded');
        }
    }

    // Check what pagination actually used
    console.log('\n\n💡 WHAT PAGINATION USED:');
    console.log('Search console logs for:');
    console.log('  [paginate] split-using-measurements');
    console.log('  regionKey: "1:2", componentId: "component-10"');
    console.log('');
    console.log('Look for "placedHeight" value - this is what pagination thinks the height is.');
    console.log('Compare to measurement layer actual render:', `${measHeight.toFixed(2)}px`);

    console.log('\n✅ Diagnostic complete');
})();

