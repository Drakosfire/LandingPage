/**
 * Compare Measurement Layer vs Visible Layer
 * 
 * Directly compares how component-10 (legendary actions) renders in both layers
 * to understand why measurements are 55px off.
 * 
 * Usage: Paste into browser console after page load
 */

(() => {
    console.log('🔍 MEASUREMENT vs VISIBLE COMPARISON\n');

    // Find measurement layer
    const measLayer = document.querySelector('.dm-canvas-measurement-layer');
    if (!measLayer) {
        console.error('❌ Measurement layer not found');
        return;
    }

    // Find visible layer
    const visibleLayer = document.querySelector('.dm-canvas-renderer');
    if (!visibleLayer) {
        console.error('❌ Visible layer not found');
        return;
    }

    // Get scale
    const container = document.querySelector('.dm-canvas-wrapper');
    const transform = window.getComputedStyle(container).transform;
    const matrix = transform.match(/matrix\(([^)]+)\)/);
    const scale = matrix ? parseFloat(matrix[1].split(',')[0]) : 1;

    console.log('📐 Scale:', scale.toFixed(6));
    console.log('');

    // Find component-10 in measurement layer
    const measEntry = measLayer.querySelector('[data-measurement-key*="component-10:legendary-action-list:0:2:3"]');
    if (!measEntry) {
        console.error('❌ component-10:legendary-action-list:0:2:3 not found in measurement layer');
        console.log('Available measurements:');
        const allMeas = measLayer.querySelectorAll('[data-measurement-key*="component-10"]');
        allMeas.forEach(m => {
            console.log('  -', m.getAttribute('data-measurement-key'));
        });
        return;
    }

    // Find component-10 (2 items) in visible layer
    const visibleColumns = visibleLayer.querySelectorAll('.canvas-column');
    let visibleEntry = null;

    // Region 1:2 should have the 2-item split
    if (visibleColumns.length >= 2) {
        const column1_2 = visibleColumns[1]; // Second column of page 1
        const entries = column1_2.querySelectorAll('.canvas-entry');

        // Find the legendary actions entry
        entries.forEach(entry => {
            const legendarySection = entry.querySelector('.dm-legendary-section');
            if (legendarySection) {
                // Count action terms (dt tags) - each represents one legendary action
                const items = legendarySection.querySelectorAll('dt.dm-action-term');
                if (items.length === 2) {
                    visibleEntry = entry;
                }
            }
        });
    }

    if (!visibleEntry) {
        console.warn('⚠️  Could not find 2-item legendary actions in visible layer');
        console.log('Checking all columns for legendary actions...');

        visibleColumns.forEach((col, idx) => {
            const legendaryEntries = col.querySelectorAll('.dm-legendary-section');
            legendaryEntries.forEach(leg => {
                const items = leg.querySelectorAll('dt.dm-action-term');
                console.log(`  Column ${idx}: ${items.length} legendary action items`);
            });
        });
        return;
    }

    // Compare measurements
    const measRect = measEntry.getBoundingClientRect();
    const visRect = visibleEntry.getBoundingClientRect();

    console.log('📊 MEASUREMENT LAYER (2 legendary actions):');
    console.table({
        'Dimensions': {
            'Width': `${measRect.width.toFixed(2)}px`,
            'Height': `${measRect.height.toFixed(2)}px`,
            'Pre-transform height': `${(measRect.height / scale).toFixed(2)}px`,
        }
    });

    console.log('\n📊 VISIBLE LAYER (2 legendary actions):');
    console.table({
        'Dimensions': {
            'Width (visual)': `${visRect.width.toFixed(2)}px`,
            'Height (visual)': `${visRect.height.toFixed(2)}px`,
            'Pre-transform height': `${(visRect.height / scale).toFixed(2)}px`,
        }
    });

    const heightError = visRect.height - measRect.height;
    const heightErrorPretransform = heightError / scale;

    console.log('\n❌ HEIGHT DISCREPANCY:');
    console.table({
        'Error': {
            'Visual space': `${heightError.toFixed(2)}px`,
            'Pre-transform': `${heightErrorPretransform.toFixed(2)}px`,
            'Percentage': `${((heightError / measRect.height) * 100).toFixed(1)}%`,
        }
    });

    // Compare widths
    const widthDiff = Math.abs(measRect.width - visRect.width);
    if (widthDiff > 1) {
        console.warn('\n⚠️  WIDTH MISMATCH DETECTED!');
        console.log(`Measurement: ${measRect.width.toFixed(2)}px`);
        console.log(`Visible: ${visRect.width.toFixed(2)}px`);
        console.log(`Difference: ${widthDiff.toFixed(2)}px`);
        console.log('\n💡 Width mismatch causes different text wrapping → wrong height measurements');
    }

    // Check column widths
    const measColumn = measEntry.closest('.canvas-column');
    const visColumn = visibleEntry.closest('.canvas-column');

    if (measColumn && visColumn) {
        const measColWidth = measColumn.getBoundingClientRect().width;
        const visColWidth = visColumn.getBoundingClientRect().width;
        const colWidthDiff = Math.abs(measColWidth - visColWidth);

        console.log('\n📏 COLUMN WIDTHS:');
        console.table({
            'Measurement Layer': { width: `${measColWidth.toFixed(2)}px` },
            'Visible Layer': { width: `${visColWidth.toFixed(2)}px` },
            'Difference': { width: `${colWidthDiff.toFixed(2)}px` },
        });

        if (colWidthDiff > 1) {
            console.warn('⚠️  COLUMN WIDTH MISMATCH - This is the root cause!');
        }
    }

    // Compare styles
    const measStyles = window.getComputedStyle(measEntry);
    const visStyles = window.getComputedStyle(visibleEntry);

    const stylesToCheck = [
        'fontSize',
        'fontFamily',
        'lineHeight',
        'padding',
        'margin',
        'boxSizing',
        'width',
    ];

    console.log('\n🎨 STYLE COMPARISON:');
    const styleComparison = {};
    stylesToCheck.forEach(prop => {
        const measVal = measStyles[prop];
        const visVal = visStyles[prop];
        const match = measVal === visVal ? '✓' : '❌';
        styleComparison[prop] = {
            Measurement: measVal,
            Visible: visVal,
            Match: match,
        };
    });
    console.table(styleComparison);

    console.log('\n✅ Diagnostic complete');
})();

