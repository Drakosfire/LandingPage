import React, { useEffect, useMemo, useRef, useState } from 'react';

import type {
    CanvasComponentProps,
    ComponentInstance,
    ComponentRegistryEntry,
    PageVariables,
    StatblockPageDocument,
    TemplateConfig,
    TemplateSlot
} from '../../types/statblockCanvas.types';
import { DND_CSS_BASE_URL } from '../../config';
import '../../styles/StatblockCanvas.css';

interface StatblockPageProps {
    page: StatblockPageDocument;
    template: TemplateConfig;
    componentRegistry: Record<string, ComponentRegistryEntry>;
}

const PX_PER_INCH = 96;
const MM_PER_INCH = 25.4;
const MIN_SCALE = 0.35;
const MAX_SCALE = 2.5;

const dimensionToPx = (value: number, unit: 'px' | 'mm' | 'in'): number => {
    switch (unit) {
        case 'px':
            return value;
        case 'in':
            return value * PX_PER_INCH;
        case 'mm':
            return (value / MM_PER_INCH) * PX_PER_INCH;
        default:
            return value;
    }
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const ColumnLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="columnWrapper">
        {children}
    </div>
);

const formatDimension = (value: number, unit: 'px' | 'mm' | 'in') => `${value}${unit}`;

const getSlotPosition = (instance: ComponentInstance, template: TemplateConfig): TemplateSlot['position'] | undefined => {
    if (instance.layout.position) return instance.layout.position;
    if (!instance.layout.slotId) return undefined;
    return template.slots.find((slot) => slot.id === instance.layout.slotId)?.position;
};

const renderComponent = (
    instance: ComponentInstance,
    registry: Record<string, ComponentRegistryEntry>,
    props: Omit<CanvasComponentProps, 'id' | 'dataRef' | 'variables' | 'layout'>
) => {
    const entry = registry[instance.type];
    if (!entry) {
        return null;
    }

    const Component = entry.component;
    return (
        <Component
            id={instance.id}
            dataRef={instance.dataRef}
            variables={instance.variables}
            layout={instance.layout}
            {...props}
        />
    );
};

const StatblockPage: React.FC<StatblockPageProps> = ({ page, template, componentRegistry }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        if (!DND_CSS_BASE_URL) {
            return undefined;
        }
        //TODO: Make configurable if that can be done securely.
        const cssFiles = ['all.css', 'bundle.css', 'style.css', '5ePHBstyle.css'];
        const appendedLinks: HTMLLinkElement[] = [];

        cssFiles.forEach((file) => {
            const existing = document.querySelector(`link[data-dnd-css="${file}"]`);
            if (existing) return;

            const linkEl = document.createElement('link');
            linkEl.rel = 'stylesheet';
            linkEl.href = `${DND_CSS_BASE_URL}/${file}`;
            linkEl.setAttribute('data-dnd-css', file);
            document.head.appendChild(linkEl);
            appendedLinks.push(linkEl);
        });

        return () => {
            appendedLinks.forEach((linkEl) => {
                if (document.head.contains(linkEl)) {
                    document.head.removeChild(linkEl);
                }
            });
        };
    }, [page.id]);

    const baseWidthPx = useMemo(
        () => dimensionToPx(page.pageVariables.dimensions.width, page.pageVariables.dimensions.unit),
        [page.pageVariables.dimensions.unit, page.pageVariables.dimensions.width]
    );
    const baseHeightPx = useMemo(
        () => dimensionToPx(page.pageVariables.dimensions.height, page.pageVariables.dimensions.unit),
        [page.pageVariables.dimensions.height, page.pageVariables.dimensions.unit]
    );
    const baseWidth = `${page.pageVariables.dimensions.width}${page.pageVariables.dimensions.unit}`;
    const baseHeight = `${page.pageVariables.dimensions.height}${page.pageVariables.dimensions.unit}`;

    React.useLayoutEffect(() => {
        if (typeof ResizeObserver === 'undefined') {
            return undefined;
        }

        const node = containerRef.current;
        if (!node || baseWidthPx === 0) {
            return undefined;
        }

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry || entry.contentRect.width === 0) {
                return;
            }

            const widthScale = entry.contentRect.width / baseWidthPx;
            const nextScale = clamp(widthScale, MIN_SCALE, MAX_SCALE);

            setScale((current) => (Math.abs(current - nextScale) > 0.01 ? nextScale : current));
        });

        observer.observe(node);

        return () => observer.disconnect();
    }, [baseWidthPx]);

    const scaledHeightPx = baseHeightPx * scale;

    const parchmentUrl = DND_CSS_BASE_URL
        ? `${DND_CSS_BASE_URL}/themes/assets/parchmentBackground.jpg`
        : undefined;

    const pageStyles: React.CSSProperties = {
        width: baseWidth,
        height: baseHeight,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        margin: '0 auto',
        position: 'relative',
        backgroundColor: parchmentUrl ? undefined : '#f8f2e4',
        backgroundImage: parchmentUrl ? `url(${parchmentUrl})` : undefined,
        backgroundSize: parchmentUrl ? 'cover' : undefined,
        backgroundRepeat: parchmentUrl ? 'no-repeat' : undefined,
        backgroundPosition: parchmentUrl ? 'center' : undefined,
    };

    const containerStyle: React.CSSProperties = {
        width: '100%',
        height: `${scaledHeightPx}px`,
        maxWidth: `${baseWidthPx * MAX_SCALE}px`,
        position: 'relative',
        overflow: 'hidden',
        margin: '0 auto',
    };

    const sharedProps: Omit<CanvasComponentProps, 'id' | 'dataRef' | 'variables' | 'layout'> = {
        mode: page.pageVariables.mode,
        pageVariables: page.pageVariables,
        dataSources: page.dataSources
    };

    return (
        <div className="dm-statblock-responsive" ref={containerRef} style={containerStyle}>
            <div className="brewRenderer">
                <div className="pages">
                    <div className="page phb" style={pageStyles}>
                        <div className="columnWrapper">
                            <div className="block monster frame wide">
                                {page.componentInstances.map((instance) => (
                                    <React.Fragment key={instance.id}>
                                        {renderComponent(instance, componentRegistry, sharedProps)}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatblockPage;

