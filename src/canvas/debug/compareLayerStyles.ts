/**
 * Debugging utility to compare computed styles between measurement layer and visible layer
 * 
 * Usage: Call from browser console after page loads:
 * ```
 * import { compareComponentStyles } from './canvas/debug/compareLayerStyles';
 * compareComponentStyles('component-0');
 * ```
 */

export function compareComponentStyles(componentId: string = 'component-0') {
    // Find measurement layer component
    const measurementLayer = document.querySelector('.dm-canvas-measurement-layer');
    const measurementEntry = measurementLayer?.querySelector(`[data-measurement-key="${componentId}:0"]`);
    const measurementComponent = measurementEntry?.firstElementChild;

    // Find visible layer component  
    const visibleEntry = document.querySelector(`.canvas-entry[data-entry-id="${componentId}"]`);
    const visibleComponent = visibleEntry?.firstElementChild;

    if (!measurementComponent || !visibleComponent) {
        console.error('Could not find components to compare', {
            measurementComponent: !!measurementComponent,
            visibleComponent: !!visibleComponent,
            measurementEntry,
            visibleEntry,
        });
        return;
    }

    // Get computed styles for key properties
    const measurementStyles = window.getComputedStyle(measurementComponent);
    const visibleStyles = window.getComputedStyle(visibleComponent);

    // Get parent container styles
    const measurementContainer = measurementEntry;
    const visibleContainer = visibleEntry;
    const measurementContainerStyles = measurementContainer ? window.getComputedStyle(measurementContainer) : null;
    const visibleContainerStyles = visibleContainer ? window.getComputedStyle(visibleContainer) : null;

    // Get .page.phb styles for both layers
    const measurementPage = measurementComponent.closest('.page.phb');
    const visiblePage = visibleComponent.closest('.page.phb');
    const measurementPageStyles = measurementPage ? window.getComputedStyle(measurementPage) : null;
    const visiblePageStyles = visiblePage ? window.getComputedStyle(visiblePage) : null;

    // Get actual heights
    const measurementRect = measurementComponent.getBoundingClientRect();
    const visibleRect = visibleComponent.getBoundingClientRect();

    console.group(`🔍 Style Comparison: ${componentId}`);

    console.group('📏 Actual Dimensions');
    console.table({
        'Measurement Layer': {
            width: `${measurementRect.width}px`,
            height: `${measurementRect.height}px`,
        },
        'Visible Layer': {
            width: `${visibleRect.width}px`,
            height: `${visibleRect.height}px`,
        },
        'Ratio (Measurement/Visible)': {
            width: (measurementRect.width / visibleRect.width).toFixed(3),
            height: (measurementRect.height / visibleRect.height).toFixed(3),
        },
    });
    console.groupEnd();

    console.group('🎨 Component Styles');
    const styleProps = ['fontSize', 'fontFamily', 'lineHeight', 'transform', 'width', 'height'];
    const componentComparison: Record<string, any> = {};
    styleProps.forEach(prop => {
        componentComparison[prop] = {
            measurement: measurementStyles.getPropertyValue(prop) || measurementStyles[prop as any],
            visible: visibleStyles.getPropertyValue(prop) || visibleStyles[prop as any],
        };
    });
    console.table(componentComparison);
    console.groupEnd();

    console.group('📦 Container Styles');
    if (measurementContainerStyles && visibleContainerStyles) {
        const containerComparison: Record<string, any> = {};
        styleProps.forEach(prop => {
            containerComparison[prop] = {
                measurement: measurementContainerStyles.getPropertyValue(prop) || measurementContainerStyles[prop as any],
                visible: visibleContainerStyles.getPropertyValue(prop) || visibleContainerStyles[prop as any],
            };
        });
        console.table(containerComparison);
    }
    console.groupEnd();

    console.group('📄 Page (.page.phb) Styles');
    if (measurementPageStyles && visiblePageStyles) {
        const pageComparison: Record<string, any> = {};
        styleProps.forEach(prop => {
            pageComparison[prop] = {
                measurement: measurementPageStyles.getPropertyValue(prop) || measurementPageStyles[prop as any],
                visible: visiblePageStyles.getPropertyValue(prop) || visiblePageStyles[prop as any],
            };
        });
        console.table(pageComparison);
    }
    console.groupEnd();

    console.group('🌳 DOM Hierarchy');
    console.log('Measurement Layer:', {
        component: measurementComponent.tagName,
        classes: Array.from(measurementComponent.classList),
        parentChain: getParentChain(measurementComponent),
    });
    console.log('Visible Layer:', {
        component: visibleComponent.tagName,
        classes: Array.from(visibleComponent.classList),
        parentChain: getParentChain(visibleComponent),
    });
    console.groupEnd();

    console.group('⚡ Transform Chain');
    console.log('Measurement Layer Transforms:', getTransformChain(measurementComponent));
    console.log('Visible Layer Transforms:', getTransformChain(visibleComponent));
    console.groupEnd();

    console.groupEnd();
}

function getParentChain(element: Element): string[] {
    const chain: string[] = [];
    let current: Element | null = element;

    while (current && current !== document.body) {
        const classes = Array.from(current.classList).join('.');
        chain.push(classes || current.tagName.toLowerCase());
        current = current.parentElement;
    }

    return chain;
}

function getTransformChain(element: Element): Array<{ element: string; transform: string }> {
    const chain: Array<{ element: string; transform: string }> = [];
    let current: Element | null = element;

    while (current && current !== document.body) {
        const styles = window.getComputedStyle(current);
        const transform = styles.transform;
        if (transform && transform !== 'none') {
            const classes = Array.from(current.classList).join('.');
            chain.push({
                element: classes || current.tagName.toLowerCase(),
                transform,
            });
        }
        current = current.parentElement;
    }

    return chain;
}

// Make it available in window for console access
if (typeof window !== 'undefined') {
    (window as any).compareComponentStyles = compareComponentStyles;
}


