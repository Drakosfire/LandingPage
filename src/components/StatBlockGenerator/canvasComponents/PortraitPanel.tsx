import React, { useMemo } from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import { resolveDataReference } from './utils';

const PortraitPanel: React.FC<CanvasComponentProps> = ({ dataRef, dataSources, layout }) => {
    const resolved = resolveDataReference(dataSources, dataRef);
    const src = typeof resolved === 'string' ? resolved : undefined;

    const wrapperStyle = useMemo<React.CSSProperties>(() => {
        if (!layout?.position) {
            return {};
        }
        return {
            width: `${layout.position.width}px`,
            height: `${layout.position.height}px`,
        };
    }, [layout?.position]);

    const wrapperClassName = useMemo(() => {
        if (!layout?.position) {
            return 'portrait-wrapper';
        }
        return 'portrait-wrapper portrait-wrapper--sized';
    }, [layout?.position]);

    return (
        <p className="monster-portrait">
            {src ? (
                <span className={wrapperClassName} style={wrapperStyle}>
                    <img className="monster-portrait__image" src={src} alt="Creature portrait" />
                </span>
            ) : (
                <span className="monster-portrait__placeholder">No portrait available</span>
            )}
        </p>
    );
};

export default PortraitPanel;



