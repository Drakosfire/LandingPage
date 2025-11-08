/**
 * Diagnose Component-12 (Spell List)
 * 
 * Region 2:2 has 220.16px overrun with component-12
 * Let's find what's missing from the measurement layer
 */

(() => {
    console.log('🔍 COMPONENT-12 (SPELL LIST) DIAGNOSIS\n');

    // Get scale
    const container = document.querySelector('.dm-canvas-wrapper');
    const transform = window.getComputedStyle(container).transform;
    const matrix = transform.match(/matrix\(([^)]+)\)/);
    const scale = matrix ? parseFloat(matrix[1].split(',')[0]) : 1;

    console.log('📐 Scale:', scale.toFixed(6));

    // From pagination logs, Region 2:2 has 10 spells (split 3:11:14, placed 10)
    // Find measurement entry for component-12 with 10 spells
    const measLayer = document.querySelector('.dm-canvas-measurement-layer');

    // The key should be for 10 items starting at index 3
    const targetKey = 'component-12:spell-list:3:10:14'; // 10 items, starting at spell 3
    let measEntry = measLayer.querySelector(`[data-measurement-key="${targetKey}"]`);

    if (!measEntry) {
        console.warn(`⚠️  Measurement entry "${targetKey}" not found`);
        console.log('\nSearching for all component-12 measurements:');
        const all12 = measLayer.querySelectorAll('[data-measurement-key*="component-12"]');
        all12.forEach(entry => {
            const key = entry.getAttribute('data-measurement-key');
            const height = entry.getBoundingClientRect().height;
            console.log(`  ${key}: ${height.toFixed(2)}px`);
        });

        // Try to find what pagination actually used
        console.log('\n💡 Check pagination logs for Region 2:2:');
        console.log('Search for: [paginate] split-using-measurements');
        console.log('           regionKey: "2:2", componentId: "component-12"');
        console.log('Look for the "placedCount" and measurement key used');
        return;
    }

    // Measure in measurement layer
    const measRect = measEntry.getBoundingClientRect();
    const measHeight = measRect.height;
    const measWidth = measRect.width;

    console.log(`\n📊 MEASUREMENT LAYER (component-12, continuation):`);
    console.table({
        'Rendered': {
            'Width': `${measWidth.toFixed(2)}px`,
            'Height': `${measHeight.toFixed(2)}px`,
            'Key': targetKey,
        }
    });

    // Find visible entry in Region 2:2
    const visColumn = document.querySelectorAll('.dm-canvas-renderer .canvas-column')[3]; // Page 2, Column 2 (0-indexed: 3)
    let visEntry = null;

    if (visColumn) {
        const entries = visColumn.querySelectorAll('.canvas-entry');
        entries.forEach(entry => {
            const spellSection = entry.querySelector('.dm-spellcasting-section');
            if (spellSection) {
                visEntry = entry; // Assume first spell section is component-12
            }
        });
    }

    if (!visEntry) {
        console.warn('\n⚠️  Could not find component-12 in visible Region 2:2');
        console.log('Checking all columns for spell sections:');
        const allCols = document.querySelectorAll('.dm-canvas-renderer .canvas-column');
        allCols.forEach((col, idx) => {
            const spellSections = col.querySelectorAll('.dm-spellcasting-section');
            if (spellSections.length > 0) {
                const pageNum = Math.floor(idx / 2) + 1;
                const colNum = (idx % 2) + 1;
                console.log(`  Region ${pageNum}:${colNum}: ${spellSections.length} spell section(s)`);
            }
        });
        return;
    }

    const visRect = visEntry.getBoundingClientRect();
    const visHeight = visRect.height;
    const visWidth = visRect.width;
    const preTransformHeight = visHeight / scale;
    const preTransformWidth = visWidth / scale;

    console.log(`\n📊 VISIBLE LAYER (component-12 in Region 2:2):`);
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

    // Calculate discrepancy
    const heightDiff = preTransformHeight - measHeight;
    const widthDiff = Math.abs(preTransformWidth - measWidth);

    console.log(`\n\n❌ DISCREPANCY ANALYSIS:`);
    console.table({
        'Height': {
            'Measurement layer': `${measHeight.toFixed(2)}px`,
            'Visible layer (pre-transform)': `${preTransformHeight.toFixed(2)}px`,
            'Difference': `${heightDiff.toFixed(2)}px`,
            'Percentage': `${((heightDiff / measHeight) * 100).toFixed(1)}%`,
        },
        'Width': {
            'Measurement layer': `${measWidth.toFixed(2)}px`,
            'Visible layer (pre-transform)': `${preTransformWidth.toFixed(2)}px`,
            'Difference': `${widthDiff.toFixed(2)}px`,
        }
    });

    // Check for spellcasting header/intro that might be missing
    const measSection = measEntry.querySelector('.dm-spellcasting-section');
    const visSection = visEntry.querySelector('.dm-spellcasting-section');

    if (measSection && visSection) {
        // Check for intro paragraph
        const measIntro = measSection.querySelector('.dm-spellcasting-intro, .dm-spell-intro, p');
        const visIntro = visSection.querySelector('.dm-spellcasting-intro, .dm-spell-intro, p');

        console.log('\n🔍 SPELLCASTING INTRO/HEADER:');
        if (measIntro && visIntro) {
            const measIntroH = measIntro.getBoundingClientRect().height;
            const visIntroH = visIntro.getBoundingClientRect().height / scale;
            console.log(`  Measurement: ${measIntroH.toFixed(2)}px`);
            console.log(`  Visible: ${visIntroH.toFixed(2)}px`);
            console.log(`  Match: ${Math.abs(visIntroH - measIntroH) < 1 ? '✅' : '❌'}`);
        } else {
            console.log(`  Measurement: ${measIntro ? 'EXISTS' : 'MISSING ❌'}`);
            console.log(`  Visible: ${visIntro ? 'EXISTS' : 'MISSING ❌'}`);
        }

        // Count spell items
        const measSpells = measSection.querySelectorAll('.dm-spell-item, .dm-spell, li');
        const visSpells = visSection.querySelectorAll('.dm-spell-item, .dm-spell, li');

        console.log('\n📝 SPELL COUNT:');
        console.log(`  Measurement: ${measSpells.length} spells`);
        console.log(`  Visible: ${visSpells.length} spells`);
        console.log(`  Match: ${measSpells.length === visSpells.length ? '✅' : '❌'}`);

        // Check for spell level headers
        const measHeaders = measSection.querySelectorAll('.dm-spell-level, h4, h5');
        const visHeaders = visSection.querySelectorAll('.dm-spell-level, h4, h5');

        console.log('\n📋 SPELL LEVEL HEADERS:');
        console.log(`  Measurement: ${measHeaders.length} headers`);
        console.log(`  Visible: ${visHeaders.length} headers`);
        console.log(`  Match: ${measHeaders.length === visHeaders.length ? '✅' : '❌'}`);

        if (measHeaders.length !== visHeaders.length) {
            console.warn('\n⚠️  HEADER MISMATCH - This could explain height difference!');
            console.log('Visible headers:');
            visHeaders.forEach((h, idx) => {
                const text = h.textContent?.trim().substring(0, 30) || '(empty)';
                const height = h.getBoundingClientRect().height / scale;
                console.log(`  ${idx + 1}. "${text}" - ${height.toFixed(1)}px`);
            });
        }
    }

    console.log('\n\n💡 NEXT STEPS:');
    if (Math.abs(heightDiff) > 10) {
        console.log('1. Check if spellcasting intro/header is missing from measurement');
        console.log('2. Check if spell level headers are included in measurement');
        console.log('3. Look for any wrapper divs or spacing elements in visible but not measurement');
        console.log('4. Compare individual spell heights item-by-item');
    } else {
        console.log('✅ Height difference is small - might just be spacing accumulation');
    }

    console.log('\n✅ Diagnostic complete');
})();

