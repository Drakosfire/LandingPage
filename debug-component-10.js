// Diagnostic script to check component-10 placement vs region boundaries
// Run this in browser console after page loads

console.log('='.repeat(60));
console.log('Component-10 Placement Diagnostic');
console.log('='.repeat(60));

// Find component-10
const comp10 = document.querySelector('[data-entry-id="component-10"]');
if (!comp10) {
    console.error('❌ Component-10 not found!');
} else {
    console.log('✅ Component-10 found');

    // Get column container
    const column = comp10.closest('.canvas-column');
    if (!column) {
        console.error('❌ Column not found!');
    } else {
        const columnRect = column.getBoundingClientRect();
        const comp10Rect = comp10.getBoundingClientRect();

        // Calculate relative positions
        const relativeTop = comp10Rect.top - columnRect.top;
        const relativeBottom = comp10Rect.bottom - columnRect.top;
        const componentHeight = comp10Rect.height;

        // Get column height
        const columnHeight = columnRect.height;

        // Find next component (should be on next page/column if split)
        const allEntries = Array.from(document.querySelectorAll('[data-entry-id^="component-10"]'));

        console.log('\n📊 Component-10 Measurements:');
        console.log({
            componentHeight: `${componentHeight.toFixed(2)}px`,
            relativeTop: `${relativeTop.toFixed(2)}px (${((relativeTop / columnHeight) * 100).toFixed(1)}%)`,
            relativeBottom: `${relativeBottom.toFixed(2)}px (${((relativeBottom / columnHeight) * 100).toFixed(1)}%)`,
            columnHeight: `${columnHeight.toFixed(2)}px`,
        });

        // Check for spacing after component
        const nextSibling = comp10.nextElementSibling;
        if (nextSibling && nextSibling.hasAttribute('data-entry-id')) {
            const nextRect = nextSibling.getBoundingClientRect();
            const gap = nextRect.top - comp10Rect.bottom;
            console.log(`\n📏 Gap to next component: ${gap.toFixed(2)}px`);
        }

        // Calculate cursor position after placement (with spacing)
        const cursorAfterPlacement = relativeBottom + 12; // +12px for COMPONENT_VERTICAL_SPACING_PX
        const overflow = cursorAfterPlacement - columnHeight;

        console.log('\n🎯 Fit Analysis:');
        console.log({
            componentBottom: `${relativeBottom.toFixed(2)}px`,
            cursorAfterSpacing: `${cursorAfterPlacement.toFixed(2)}px`,
            columnHeight: `${columnHeight.toFixed(2)}px`,
            overflow: overflow > 0 ? `${overflow.toFixed(2)}px OVERFLOW!` : `${Math.abs(overflow).toFixed(2)}px remaining`,
            fitsWithoutSpacing: relativeBottom <= columnHeight ? '✅ YES' : '❌ NO',
            fitsWithSpacing: cursorAfterPlacement <= columnHeight ? '✅ YES' : '❌ NO',
        });

        // Check all component-10 instances (might be split)
        console.log(`\n📋 Found ${allEntries.length} component-10 instance(s):`);
        allEntries.forEach((entry, idx) => {
            const entryRect = entry.getBoundingClientRect();
            const entryColumn = entry.closest('.canvas-column');
            const entryColumnRect = entryColumn.getBoundingClientRect();
            const entryRelativeTop = entryRect.top - entryColumnRect.top;

            console.log(`  ${idx + 1}. ${entry.getAttribute('data-entry-id')}: top=${entryRelativeTop.toFixed(2)}px, height=${entryRect.height.toFixed(2)}px`);
        });
    }
}

console.log('='.repeat(60));

