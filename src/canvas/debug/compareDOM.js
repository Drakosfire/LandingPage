/**
 * Compare DOM Structure & CSS
 * 
 * Deep comparison of measurement vs visible layer to find why
 * identical content at identical width renders at different heights
 */

(() => {
    console.log('🔍 DOM & CSS COMPARISON\n');

    // Get scale
    const container = document.querySelector('.dm-canvas-wrapper');
    const transform = window.getComputedStyle(container).transform;
    const matrix = transform.match(/matrix\(([^)]+)\)/);
    const scale = matrix ? parseFloat(matrix[1].split(',')[0]) : 1;

    // Find measurement entry
    const measLayer = document.querySelector('.dm-canvas-measurement-layer');
    const targetKey = 'component-10:legendary-action-list:0:2:3';
    const measEntry = measLayer.querySelector(`[data-measurement-key="${targetKey}"]`);

    // Find visible entry
    const visColumn = document.querySelectorAll('.dm-canvas-renderer .canvas-column')[1];
    let visEntry = null;
    visColumn.querySelectorAll('.canvas-entry').forEach(entry => {
        const leg = entry.querySelector('.dm-legendary-section');
        if (leg && leg.querySelectorAll('dt.dm-action-term').length === 2) {
            visEntry = entry;
        }
    });

    if (!measEntry || !visEntry) {
        console.error('❌ Could not find entries to compare');
        return;
    }

    // Get the legendary sections
    const measSection = measEntry.querySelector('.dm-legendary-section');
    const visSection = visEntry.querySelector('.dm-legendary-section');

    // Compare computed styles
    const measStyles = window.getComputedStyle(measSection);
    const visStyles = window.getComputedStyle(visSection);

    const criticalStyles = [
        'fontSize', 'fontFamily', 'fontWeight',
        'lineHeight', 'letterSpacing', 'wordSpacing',
        'padding', 'paddingTop', 'paddingBottom',
        'margin', 'marginTop', 'marginBottom',
        'boxSizing', 'display',
        'width', 'maxWidth', 'minWidth',
    ];

    console.log('🎨 CSS COMPARISON (.dm-legendary-section):\n');
    const differences = [];

    criticalStyles.forEach(prop => {
        const measVal = measStyles[prop];
        const visVal = visStyles[prop];
        const match = measVal === visVal;

        if (!match) {
            differences.push({
                Property: prop,
                Measurement: measVal,
                Visible: visVal,
            });
        }
    });

    if (differences.length > 0) {
        console.log('❌ STYLE DIFFERENCES FOUND:');
        console.table(differences);
    } else {
        console.log('✅ All styles match');
    }

    // Count DOM children
    console.log('\n📦 DOM STRUCTURE:\n');

    const measItems = measSection.querySelectorAll('dt.dm-action-term');
    const visItems = visSection.querySelectorAll('dt.dm-action-term');

    const measDesc = measSection.querySelectorAll('dd.dm-action-description');
    const visDesc = visSection.querySelectorAll('dd.dm-action-description');

    const measDividers = measSection.querySelectorAll('.dm-action-divider');
    const visDividers = visSection.querySelectorAll('.dm-action-divider');

    console.table({
        'Action Terms (dt)': {
            Measurement: measItems.length,
            Visible: visItems.length,
            Match: measItems.length === visItems.length ? '✓' : '❌'
        },
        'Descriptions (dd)': {
            Measurement: measDesc.length,
            Visible: visDesc.length,
            Match: measDesc.length === visDesc.length ? '✓' : '❌'
        },
        'Dividers': {
            Measurement: measDividers.length,
            Visible: visDividers.length,
            Match: measDividers.length === visDividers.length ? '✓' : '❌'
        }
    });

    // Compare individual item heights
    console.log('\n📏 INDIVIDUAL ITEM HEIGHTS:\n');

    const itemComparison = [];

    for (let i = 0; i < Math.max(measItems.length, visItems.length); i++) {
        const measItem = measItems[i];
        const visItem = visItems[i];

        if (measItem && visItem) {
            const measH = measItem.getBoundingClientRect().height;
            const visH = visItem.getBoundingClientRect().height / scale;
            const diff = visH - measH;

            itemComparison.push({
                Item: `Action ${i + 1} (dt)`,
                Measurement: `${measH.toFixed(1)}px`,
                Visible: `${visH.toFixed(1)}px`,
                Difference: `${diff.toFixed(1)}px`,
            });
        }
    }

    for (let i = 0; i < Math.max(measDesc.length, visDesc.length); i++) {
        const measItem = measDesc[i];
        const visItem = visDesc[i];

        if (measItem && visItem) {
            const measH = measItem.getBoundingClientRect().height;
            const visH = visItem.getBoundingClientRect().height / scale;
            const diff = visH - measH;

            itemComparison.push({
                Item: `Description ${i + 1} (dd)`,
                Measurement: `${measH.toFixed(1)}px`,
                Visible: `${visH.toFixed(1)}px`,
                Difference: `${diff.toFixed(1)}px`,
            });
        }
    }

    console.table(itemComparison);

    // Check for summary paragraph (legendary actions intro)
    const measSummary = measSection.querySelector('.dm-legendary-summary');
    const visSummary = visSection.querySelector('.dm-legendary-summary');

    if (measSummary && visSummary) {
        const measH = measSummary.getBoundingClientRect().height;
        const visH = visSummary.getBoundingClientRect().height / scale;

        console.log('\n📝 LEGENDARY SUMMARY PARAGRAPH:');
        console.table({
            'Height': {
                Measurement: `${measH.toFixed(1)}px`,
                Visible: `${visH.toFixed(1)}px`,
                Difference: `${(visH - measH).toFixed(1)}px`,
            }
        });
    }

    // Check heading
    const measHeading = measSection.querySelector('.dm-section-heading');
    const visHeading = visSection.querySelector('.dm-section-heading');

    if (measHeading && visHeading) {
        const measH = measHeading.getBoundingClientRect().height;
        const visH = visHeading.getBoundingClientRect().height / scale;

        console.log('\n📋 SECTION HEADING:');
        console.table({
            'Height': {
                Measurement: `${measH.toFixed(1)}px`,
                Visible: `${visH.toFixed(1)}px`,
                Difference: `${(visH - measH).toFixed(1)}px`,
            }
        });
    }

    // Total breakdown
    console.log('\n\n📊 TOTAL HEIGHT BREAKDOWN:');
    console.log(`Measurement layer total: ${measEntry.getBoundingClientRect().height.toFixed(1)}px`);
    console.log(`Visible layer total: ${(visEntry.getBoundingClientRect().height / scale).toFixed(1)}px`);
    console.log(`Difference: ${((visEntry.getBoundingClientRect().height / scale) - measEntry.getBoundingClientRect().height).toFixed(1)}px`);

    console.log('\n✅ Diagnostic complete');
})();

