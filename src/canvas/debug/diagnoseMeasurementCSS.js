/**
 * Measurement Layer CSS Diagnostic
 * 
 * Compares CSS properties between measurement and visible layers to identify
 * style differences that could cause height discrepancies.
 * 
 * Usage: Copy/paste into browser console
 * 
 * @date 2025-10-03
 */

window.diagnoseMeasurementCSS = function () {
    console.clear();
    console.log('🔍 MEASUREMENT LAYER CSS DIAGNOSTIC\n');
    console.log('='.repeat(80));

    const measLayer = document.querySelector('.dm-statblock-measurement-layer');
    const visLayer = document.querySelector('.brewRenderer');

    if (!measLayer || !visLayer) {
        console.error('❌ Could not find measurement or visible layer');
        return;
    }

    const measActions = measLayer.querySelector('.dm-action-section');
    const visActions = visLayer.querySelector('.dm-action-section');

    if (!measActions || !visActions) {
        console.error('❌ Could not find Actions component in both layers');
        return;
    }

    console.log('\n📏 STEP 1: Overall Component Comparison\n');

    const measRect = measActions.getBoundingClientRect();
    const visRect = visActions.getBoundingClientRect();

    console.table({
        'Measurement Layer': {
            width: measRect.width.toFixed(2),
            height: measRect.height.toFixed(2),
            actionCount: measActions.querySelectorAll('.dm-action-term').length,
        },
        'Visible Layer': {
            width: visRect.width.toFixed(2),
            height: visRect.height.toFixed(2),
            actionCount: visActions.querySelectorAll('.dm-action-term').length,
        },
        'Difference': {
            width: (measRect.width - visRect.width).toFixed(2),
            height: (measRect.height - visRect.height).toFixed(2),
            actionCount: 0,
        }
    });

    console.log('\n🎨 STEP 2: CSS Property Comparison\n');

    const measStyles = window.getComputedStyle(measActions);
    const visStyles = window.getComputedStyle(visActions);

    const properties = [
        // Box model
        'width', 'height', 'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
        'border', 'borderWidth', 'boxSizing',
        // Typography
        'fontSize', 'lineHeight', 'fontFamily', 'fontWeight', 'letterSpacing', 'wordSpacing',
        // Layout
        'display', 'flexDirection', 'gap', 'justifyContent', 'alignItems',
        'columnCount', 'columnGap', 'columnWidth',
        // Visual
        'background', 'backgroundColor', 'borderRadius', 'boxShadow',
        // Transform
        'transform', 'transformOrigin', 'scale',
    ];

    const differences = [];

    properties.forEach(prop => {
        const measValue = measStyles[prop];
        const visValue = visStyles[prop];
        const match = measValue === visValue;

        if (!match) {
            differences.push({
                property: prop,
                measurement: measValue,
                visible: visValue,
                match: '❌'
            });
        }
    });

    if (differences.length > 0) {
        console.warn(`⚠️  Found ${differences.length} CSS differences:\n`);
        console.table(differences);
    } else {
        console.log('✅ All compared CSS properties match!\n');
    }

    console.log('\n📐 STEP 3: Individual Action Item Analysis\n');

    const measActionItems = measActions.querySelectorAll('.dm-action-term');
    const visActionItems = visActions.querySelectorAll('.dm-action-term');

    const measDescItems = measActions.querySelectorAll('.dm-action-description');
    const visDescItems = visActions.querySelectorAll('.dm-action-description');

    const actionComparison = [];

    measActionItems.forEach((measItem, idx) => {
        const visItem = visActionItems[idx];
        if (!visItem) return;

        const measItemRect = measItem.getBoundingClientRect();
        const visItemRect = visItem.getBoundingClientRect();

        const measDesc = measDescItems[idx];
        const visDesc = visDescItems[idx];

        const measDescRect = measDesc ? measDesc.getBoundingClientRect() : { height: 0 };
        const visDescRect = visDesc ? visDesc.getBoundingClientRect() : { height: 0 };

        const totalMeasHeight = measItemRect.height + measDescRect.height;
        const totalVisHeight = visItemRect.height + visDescRect.height;

        actionComparison.push({
            action: `Action ${idx + 1}`,
            measName: measItemRect.height.toFixed(2),
            visName: visItemRect.height.toFixed(2),
            measDesc: measDescRect.height.toFixed(2),
            visDesc: visDescRect.height.toFixed(2),
            measTotal: totalMeasHeight.toFixed(2),
            visTotal: totalVisHeight.toFixed(2),
            diff: (totalMeasHeight - totalVisHeight).toFixed(2),
        });
    });

    console.table(actionComparison);

    console.log('\n📊 STEP 4: Spacing and Padding Analysis\n');

    // Measure actual spacing between elements
    const measDividers = measActions.querySelectorAll('.dm-action-divider');
    const visDividers = visActions.querySelectorAll('.dm-action-divider');

    const spacingComparison = [];

    measDividers.forEach((measDiv, idx) => {
        const visDiv = visDividers[idx];
        if (!visDiv) return;

        const measStyles = window.getComputedStyle(measDiv);
        const visStyles = window.getComputedStyle(visDiv);

        spacingComparison.push({
            element: `Divider ${idx + 1}`,
            measHeight: measDiv.getBoundingClientRect().height.toFixed(2),
            visHeight: visDiv.getBoundingClientRect().height.toFixed(2),
            measMarginTop: measStyles.marginTop,
            visMarginTop: visStyles.marginTop,
            measMarginBottom: measStyles.marginBottom,
            visMarginBottom: visStyles.marginBottom,
        });
    });

    if (spacingComparison.length > 0) {
        console.table(spacingComparison);
    } else {
        console.log('No dividers found (single action component)');
    }

    // Check section-level padding/margin
    console.log('\n📦 Section Container Styles:\n');

    const containerStyles = {
        'Measurement Layer': {
            padding: measStyles.padding,
            paddingTop: measStyles.paddingTop,
            paddingBottom: measStyles.paddingBottom,
            margin: measStyles.margin,
            marginTop: measStyles.marginTop,
            marginBottom: measStyles.marginBottom,
            borderTop: measStyles.borderTopWidth,
            borderBottom: measStyles.borderBottomWidth,
        },
        'Visible Layer': {
            padding: visStyles.padding,
            paddingTop: visStyles.paddingTop,
            paddingBottom: visStyles.paddingBottom,
            margin: visStyles.margin,
            marginTop: visStyles.marginTop,
            marginBottom: visStyles.marginBottom,
            borderTop: visStyles.borderTopWidth,
            borderBottom: visStyles.borderBottomWidth,
        }
    };

    console.table(containerStyles);

    console.log('\n🔍 STEP 5: Box Model Breakdown\n');

    // Calculate actual content height vs box height
    const measPaddingTop = parseFloat(measStyles.paddingTop) || 0;
    const measPaddingBottom = parseFloat(measStyles.paddingBottom) || 0;
    const measBorderTop = parseFloat(measStyles.borderTopWidth) || 0;
    const measBorderBottom = parseFloat(measStyles.borderBottomWidth) || 0;
    const measContentHeight = measRect.height - measPaddingTop - measPaddingBottom - measBorderTop - measBorderBottom;

    const visPaddingTop = parseFloat(visStyles.paddingTop) || 0;
    const visPaddingBottom = parseFloat(visStyles.paddingBottom) || 0;
    const visBorderTop = parseFloat(visStyles.borderTopWidth) || 0;
    const visBorderBottom = parseFloat(visStyles.borderBottomWidth) || 0;
    const visContentHeight = visRect.height - visPaddingTop - visPaddingBottom - visBorderTop - visBorderBottom;

    console.table({
        'Measurement Layer': {
            totalHeight: measRect.height.toFixed(2),
            paddingTop: measPaddingTop.toFixed(2),
            paddingBottom: measPaddingBottom.toFixed(2),
            borderTop: measBorderTop.toFixed(2),
            borderBottom: measBorderBottom.toFixed(2),
            contentHeight: measContentHeight.toFixed(2),
        },
        'Visible Layer': {
            totalHeight: visRect.height.toFixed(2),
            paddingTop: visPaddingTop.toFixed(2),
            paddingBottom: visPaddingBottom.toFixed(2),
            borderTop: visBorderTop.toFixed(2),
            borderBottom: visBorderBottom.toFixed(2),
            contentHeight: visContentHeight.toFixed(2),
        },
        'Difference': {
            totalHeight: (measRect.height - visRect.height).toFixed(2),
            paddingTop: (measPaddingTop - visPaddingTop).toFixed(2),
            paddingBottom: (measPaddingBottom - visPaddingBottom).toFixed(2),
            borderTop: (measBorderTop - visBorderTop).toFixed(2),
            borderBottom: (measBorderBottom - visBorderBottom).toFixed(2),
            contentHeight: (measContentHeight - visContentHeight).toFixed(2),
        }
    });

    console.log('\n🎯 DIAGNOSIS:\n');

    const heightDiff = measRect.height - visRect.height;

    if (Math.abs(heightDiff) < 5) {
        console.log('✅ Measurement accuracy is within acceptable range (<5px difference)');
    } else if (Math.abs(heightDiff) < 15) {
        console.warn(`⚠️  Moderate discrepancy (${heightDiff.toFixed(2)}px)`);
        console.warn('   This may cause occasional split decisions but is usually acceptable.');
    } else {
        console.error(`❌ SIGNIFICANT discrepancy (${heightDiff.toFixed(2)}px)`);
        console.error('\n   Likely causes based on analysis above:');

        // Analyze differences
        if (differences.some(d => d.property === 'lineHeight')) {
            console.error('   1. ❌ Line height mismatch - check font loading timing');
        }
        if (differences.some(d => d.property.includes('padding') || d.property.includes('margin'))) {
            console.error('   2. ❌ Box model spacing mismatch - check CSS specificity');
        }
        if (differences.some(d => d.property.includes('font'))) {
            console.error('   3. ❌ Font properties differ - may cause text reflow');
        }
        if (Math.abs(measRect.width - visRect.width) > 5) {
            console.error('   4. ❌ Width mismatch still present - check scale calculation');
        }

        const contentDiff = measContentHeight - visContentHeight;
        const boxModelDiff = heightDiff - contentDiff;

        if (Math.abs(boxModelDiff) > Math.abs(contentDiff)) {
            console.error(`   5. ❌ Most error (${boxModelDiff.toFixed(2)}px) is box model (padding/border)`);
        } else {
            console.error(`   6. ❌ Most error (${contentDiff.toFixed(2)}px) is content height (text reflow)`);
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ CSS diagnostic complete\n');
};

// Run immediately
diagnoseMeasurementCSS();

