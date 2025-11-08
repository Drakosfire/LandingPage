/**
 * Analyze Measurement Accumulation
 * 
 * Compares measured heights vs actual rendered heights for ALL components
 * in a column to see if small errors accumulate into large overruns.
 * 
 * Usage: Paste into browser console after page load
 */

(() => {
    console.log('🔍 MEASUREMENT ACCUMULATION ANALYSIS\n');

    // Get scale
    const container = document.querySelector('.dm-canvas-wrapper');
    if (!container) {
        console.error('❌ Could not find .dm-canvas-wrapper');
        return;
    }

    const transform = window.getComputedStyle(container).transform;
    const matrix = transform.match(/matrix\(([^)]+)\)/);
    const scale = matrix ? parseFloat(matrix[1].split(',')[0]) : 1;

    console.log('📐 Scale:', scale.toFixed(6));
    console.log('');

    // Find visible columns
    const visibleLayer = document.querySelector('.dm-canvas-renderer');
    if (!visibleLayer) {
        console.error('❌ Visible layer not found');
        return;
    }

    const columns = visibleLayer.querySelectorAll('.canvas-column');

    // Analyze each column
    columns.forEach((column, colIndex) => {
        const pageNum = Math.floor(colIndex / 2) + 1;
        const colNum = (colIndex % 2) + 1;
        const regionKey = `${pageNum}:${colNum}`;

        console.log(`\n${'='.repeat(80)}`);
        console.log(`📋 REGION ${regionKey}`);
        console.log('='.repeat(80));

        const columnRect = column.getBoundingClientRect();
        const columnHeight = columnRect.height / scale; // Pre-transform

        console.log(`\nColumn height: ${columnHeight.toFixed(2)}px (pre-transform)\n`);

        // Get all entries in this column
        const entries = column.querySelectorAll('.canvas-entry');

        if (entries.length === 0) {
            console.log('  (empty column)\n');
            return;
        }

        let cumulativeMeasured = 0;
        let cumulativeActual = 0;
        let cumulativeError = 0;
        const componentDetails = [];

        entries.forEach((entry, entryIndex) => {
            const entryId = entry.getAttribute('data-entry-id') || `entry-${entryIndex}`;
            const entryRect = entry.getBoundingClientRect();

            // Calculate position relative to column
            const relativeTop = (entryRect.top - columnRect.top) / scale;
            const relativeBottom = (entryRect.bottom - columnRect.top) / scale;
            const actualHeight = entryRect.height / scale;

            // Try to extract measured height from pagination logs
            // This would need to be captured from the logs, for now we'll use actual
            const measuredHeight = actualHeight; // Placeholder - ideally from logs

            // Calculate cumulative positions
            const expectedTop = cumulativeMeasured;
            const expectedBottom = expectedTop + measuredHeight;

            cumulativeMeasured += measuredHeight + 12; // Add spacing
            cumulativeActual = relativeBottom + 12; // Add spacing after this component
            cumulativeError = cumulativeActual - cumulativeMeasured;

            const positionError = relativeTop - expectedTop;
            const heightOk = Math.abs(actualHeight - measuredHeight) < 1;
            const positionOk = Math.abs(positionError) < 2;

            componentDetails.push({
                'Entry': entryId,
                'Expected Top': `${expectedTop.toFixed(1)}px`,
                'Actual Top': `${relativeTop.toFixed(1)}px`,
                'Position Error': `${positionError.toFixed(1)}px ${positionOk ? '✓' : '❌'}`,
                'Measured H': `${measuredHeight.toFixed(1)}px`,
                'Actual H': `${actualHeight.toFixed(1)}px`,
                'Height Error': `${(actualHeight - measuredHeight).toFixed(1)}px ${heightOk ? '✓' : '❌'}`,
                'Cumulative Error': `${cumulativeError.toFixed(1)}px`,
            });
        });

        // Display table
        console.table(componentDetails);

        // Summary
        const finalBottom = cumulativeActual - 12; // Remove trailing spacing
        const overrun = finalBottom - columnHeight;
        const hasOverrun = overrun > 1;

        console.log('\n📊 SUMMARY:');
        console.table({
            'Column Metrics': {
                'Column height': `${columnHeight.toFixed(2)}px`,
                'Final content bottom': `${finalBottom.toFixed(2)}px`,
                'Overrun': `${overrun.toFixed(2)}px ${hasOverrun ? '❌' : '✅'}`,
                'Components placed': entries.length,
                'Average error per component': `${(cumulativeError / entries.length).toFixed(2)}px`,
            }
        });

        if (hasOverrun) {
            console.warn(`⚠️  This column overruns by ${overrun.toFixed(2)}px!`);

            // Analyze error sources
            const errorSources = [];

            componentDetails.forEach((detail, idx) => {
                const heightError = parseFloat(detail['Height Error']);
                const posError = parseFloat(detail['Position Error']);

                if (Math.abs(heightError) > 2 || Math.abs(posError) > 2) {
                    errorSources.push({
                        Entry: detail.Entry,
                        Issue: Math.abs(heightError) > 2 ? `Height off by ${heightError.toFixed(1)}px` : `Position off by ${posError.toFixed(1)}px`,
                    });
                }
            });

            if (errorSources.length > 0) {
                console.log('\n🎯 Error Sources:');
                console.table(errorSources);
            } else {
                console.log('\n💡 No individual component has large error - likely spacing accumulation');
            }
        }
    });

    console.log('\n\n' + '='.repeat(80));
    console.log('✅ Analysis complete');
    console.log('='.repeat(80));

    // Now try to extract actual measured heights from pagination logs
    console.log('\n\n💡 To get actual measured heights, search console for:');
    console.log('   [paginate] entry-placed');
    console.log('   Look at "spanHeight" field for each component');
})();

