/**
 * DungeonMind Canvas Layout Diagnostic Script
 * 
 * Purpose: Diagnose layout and pagination issues by comparing measurement layer
 * vs visible layer and detecting discrepancies.
 * 
 * Usage:
 * 1. Copy this entire file content
 * 2. Paste into browser console while viewing a statblock
 * 3. Press Enter to execute
 * 
 * OR use from DevTools Snippets:
 * 1. Open DevTools → Sources → Snippets
 * 2. Create new snippet with this code
 * 3. Run whenever layout issues occur
 * 
 * What it checks:
 * - Measurement layer width matches visible layer
 * - Component height measurements vs actual rendering
 * - Overflow detection across all columns
 * - Cursor position accuracy
 * 
 * @date 2025-10-03
 * @author DungeonMind Development Team
 */

(function dungeonMindLayoutDiagnostic() {
    console.clear();
    console.log('🔍 DungeonMind Canvas Layout Diagnostics\n');
    console.log('='.repeat(80));

    // ============================================================================
    // SECTION 1: Layer Detection & Width Comparison
    // ============================================================================
    console.log('\n📐 SECTION 1: Measurement Layer Configuration\n');

    const measurementLayer = document.querySelector('.dm-canvas-measurement-layer');
    const visibleColumn = document.querySelector('.canvas-column');

    if (!measurementLayer) {
        console.error('❌ Measurement layer not found!');
        return;
    }

    if (!visibleColumn) {
        console.error('❌ Visible column not found!');
        return;
    }

    const measLayerStyles = window.getComputedStyle(measurementLayer);
    const visColStyles = window.getComputedStyle(visibleColumn);
    const measLayerRect = measurementLayer.getBoundingClientRect();
    const visColRect = visibleColumn.getBoundingClientRect();

    console.table({
        'Measurement Layer': {
            width: measLayerStyles.width,
            actualWidth: `${measLayerRect.width.toFixed(2)}px`,
            position: measLayerStyles.position,
            visibility: measLayerStyles.visibility,
            overflow: measLayerStyles.overflow,
        },
        'Visible Column': {
            width: visColStyles.width,
            actualWidth: `${visColRect.width.toFixed(2)}px`,
            position: visColStyles.position,
            visibility: visColStyles.visibility,
            overflow: visColStyles.overflow,
        },
    });

    const widthDiff = Math.abs(measLayerRect.width - visColRect.width);
    if (widthDiff > 1) {
        console.warn(`⚠️  WIDTH MISMATCH: ${widthDiff.toFixed(2)}px difference!`);
        console.warn('   This will cause incorrect text wrapping and height measurements.');
        console.warn('   Fix: Ensure measurement layer .canvas-column width matches visible layer.');
    } else {
        console.log('✅ Widths match - measurements should be accurate');
    }

    // ============================================================================
    // SECTION 2: Component Measurement vs Actual Rendering
    // ============================================================================
    console.log('\n' + '='.repeat(80));
    console.log('\n📏 SECTION 2: Component Measurements vs Actual Rendering\n');

    const componentTypes = [
        { selector: '.dm-bonus-action-section', name: 'Bonus Actions' },
        { selector: '.dm-reaction-section', name: 'Reactions' },
        { selector: '.dm-trait-section', name: 'Traits' },
        { selector: '.dm-legendary-section', name: 'Legendary Actions' },
        { selector: '.dm-action-section', name: 'Actions' },
        { selector: '.dm-lair-action-section', name: 'Lair Actions' },
        { selector: '.dm-spellcasting-section', name: 'Spellcasting' },
    ];

    const measurements = [];
    let totalError = 0;

    componentTypes.forEach(({ selector, name }) => {
        const measured = measurementLayer.querySelector(selector);
        const visible = visibleColumn.querySelector(selector);

        if (measured && visible) {
            const measRect = measured.getBoundingClientRect();
            const visRect = visible.getBoundingClientRect();
            const error = visRect.height - measRect.height;
            const errorPct = ((error / visRect.height) * 100).toFixed(1);

            totalError += error;

            measurements.push({
                Component: name,
                Measured: `${measRect.height.toFixed(2)}px`,
                Actual: `${visRect.height.toFixed(2)}px`,
                Error: `${error.toFixed(2)}px (${errorPct}%)`,
            });
        }
    });

    if (measurements.length > 0) {
        console.table(measurements);
        console.log(`\n📊 Cumulative Error: ${totalError.toFixed(2)}px`);

        if (Math.abs(totalError) > 10) {
            console.warn(`⚠️  Large cumulative error detected!`);
            console.warn('   This will cause cursor position drift and overflow issues.');
            console.warn('   Check: Width mismatch, font loading, or CSS differences between layers.');
        } else {
            console.log('✅ Cumulative error is acceptable');
        }
    } else {
        console.warn('⚠️  No matching components found for comparison');
    }

    // ============================================================================
    // SECTION 3: Overflow Detection & Position Analysis
    // ============================================================================
    console.log('\n' + '='.repeat(80));
    console.log('\n🎯 SECTION 3: Overflow Detection\n');

    const columns = document.querySelectorAll('.canvas-column');

    columns.forEach((col, colIdx) => {
        const colRect = col.getBoundingClientRect();
        const colHeight = colRect.height;
        const components = col.querySelectorAll('.canvas-entry');

        console.log(`\n📄 Column ${colIdx + 1} (Height: ${colHeight.toFixed(2)}px):`);

        const overflows = [];

        components.forEach((comp, idx) => {
            const rect = comp.getBoundingClientRect();
            const topInCol = rect.top - colRect.top;
            const bottomInCol = rect.bottom - colRect.top;
            const className = comp.firstElementChild?.className || 'unknown';
            const overflow = Math.max(0, bottomInCol - colHeight);

            if (overflow > 0) {
                overflows.push({
                    Index: idx + 1,
                    Class: className.slice(0, 30),
                    Top: `${topInCol.toFixed(2)}px`,
                    Bottom: `${bottomInCol.toFixed(2)}px`,
                    Height: `${rect.height.toFixed(2)}px`,
                    Overflow: `${overflow.toFixed(2)}px`,
                    'Overflow %': `${((overflow / colHeight) * 100).toFixed(1)}%`,
                });
            }
        });

        if (overflows.length > 0) {
            console.warn(`   ⚠️  ${overflows.length} component(s) overflowing:`);
            console.table(overflows);
        } else {
            console.log(`   ✅ No overflows detected`);
        }
    });

    // ============================================================================
    // SECTION 4: Cursor Position Verification
    // ============================================================================
    console.log('\n' + '='.repeat(80));
    console.log('\n🧭 SECTION 4: Cursor Position Verification\n');

    console.log('📋 To verify cursor positions:');
    console.log('   1. Look for [paginate] logs in console');
    console.log('   2. Compare "cursorAfter" values with actual component positions');
    console.log('   3. Cumulative error should be < 10px');

    // Try to find a specific problematic component for example
    const legendary = document.querySelector('.dm-legendary-section');
    if (legendary) {
        const col = legendary.closest('.canvas-column');
        if (col) {
            const colRect = col.getBoundingClientRect();
            const legRect = legendary.getBoundingClientRect();
            const topInCol = legRect.top - colRect.top;
            const bottomInCol = legRect.bottom - colRect.top;

            console.log('\n📍 Example: Legendary Actions Position:');
            console.table({
                'Actual': {
                    Top: `${topInCol.toFixed(2)}px`,
                    Bottom: `${bottomInCol.toFixed(2)}px`,
                    Height: `${legRect.height.toFixed(2)}px`,
                },
                'Check Logs For': {
                    Top: 'Look for "top:" in entry-check',
                    Bottom: 'Look for "bottom:" in entry-check',
                    Height: 'Look for "estimatedHeight"',
                },
            });

            // Count items
            const items = legendary.querySelectorAll('[class*="action"], [class*="item"], li');
            console.log(`\n   Items rendered: ${items.length}`);
            console.log('   (Compare with "placedItems" in split decision logs)');
        }
    }

    // ============================================================================
    // SECTION 5: Column Width Analysis
    // ============================================================================
    console.log('\n' + '='.repeat(80));
    console.log('\n📐 SECTION 5: Column Width Analysis\n');

    const visiblePage = document.querySelector('.dm-canvas-renderer .page.phb');
    const measPage = document.querySelector('.dm-canvas-measurement-layer .page.phb');

    if (visiblePage && measPage) {
        const visPageRect = visiblePage.getBoundingClientRect();
        const measPageRect = measPage.getBoundingClientRect();

        const visCol = document.querySelector('.dm-canvas-renderer .canvas-column');
        const measCol = document.querySelector('.dm-canvas-measurement-layer .canvas-column');

        if (visCol && measCol) {
            const visColRect = visCol.getBoundingClientRect();
            const measColRect = measCol.getBoundingClientRect();

            console.table({
                'Visible': {
                    'Page Width': `${visPageRect.width.toFixed(2)}px`,
                    'Column Width': `${visColRect.width.toFixed(2)}px`,
                },
                'Measurement': {
                    'Page Width': `${measPageRect.width.toFixed(2)}px`,
                    'Column Width': `${measColRect.width.toFixed(2)}px`,
                },
                'Difference': {
                    'Page Width': `${Math.abs(visPageRect.width - measPageRect.width).toFixed(2)}px`,
                    'Column Width': `${Math.abs(visColRect.width - measColRect.width).toFixed(2)}px`,
                },
            });

            const colDiff = Math.abs(visColRect.width - measColRect.width);
            if (colDiff > 1) {
                console.warn(`⚠️  Column width mismatch: ${colDiff.toFixed(2)}px`);
                console.warn('   This is the root cause of measurement errors!');
            }
        }
    }

    // ============================================================================
    // SECTION 6: Summary & Recommendations
    // ============================================================================
    console.log('\n' + '='.repeat(80));
    console.log('\n📋 SECTION 6: Summary\n');

    const issues = [];
    const passes = [];

    if (widthDiff > 1) {
        issues.push('❌ Measurement layer width mismatch');
    } else {
        passes.push('✅ Measurement layer width correct');
    }

    if (Math.abs(totalError) > 10) {
        issues.push(`❌ Large cumulative measurement error (${totalError.toFixed(2)}px)`);
    } else {
        passes.push('✅ Measurement accuracy acceptable');
    }

    // Check for any overflows
    let hasOverflow = false;
    columns.forEach(col => {
        const colRect = col.getBoundingClientRect();
        const entries = col.querySelectorAll('.canvas-entry');
        entries.forEach(entry => {
            const rect = entry.getBoundingClientRect();
            if (rect.bottom - colRect.top > colRect.height) {
                hasOverflow = true;
            }
        });
    });

    if (hasOverflow) {
        issues.push('❌ Component overflow detected');
    } else {
        passes.push('✅ No component overflow');
    }

    console.log('✅ Passing Checks:');
    passes.forEach(p => console.log(`   ${p}`));

    if (issues.length > 0) {
        console.log('\n❌ Issues Found:');
        issues.forEach(i => console.log(`   ${i}`));
        console.log('\n💡 Recommendations:');
        if (widthDiff > 1) {
            console.log('   • Fix measurement layer .canvas-column width to match visible layer');
            console.log('   • Check StatblockPage.tsx measurement layer column style');
        }
        if (Math.abs(totalError) > 10) {
            console.log('   • Verify proportional calculation is being used in paginate.ts');
            console.log('   • Check if fonts have loaded before measurement');
            console.log('   • Compare CSS contexts between measurement and visible layers');
        }
        if (hasOverflow) {
            console.log('   • Review pagination split decisions in console logs');
            console.log('   • Check if split logic is using measurements vs estimates');
        }
    } else {
        console.log('\n🎉 All checks passed! Layout system is healthy.');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Diagnostic complete');
    console.log('\n💡 TIP: Keep this script in DevTools → Sources → Snippets for quick access\n');
})();

