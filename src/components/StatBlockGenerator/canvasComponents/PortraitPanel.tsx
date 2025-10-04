import React, { useMemo, useState } from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import { resolveDataReference } from './utils';

// Placeholder image for missing or failed portrait loads
const PLACEHOLDER_IMAGE = '/images/portrait_placeholder.png';

const PortraitPanel: React.FC<CanvasComponentProps> = ({ dataRef, dataSources, layout }) => {
    const resolved = resolveDataReference(dataSources, dataRef);
    const resolvedSrc = typeof resolved === 'string' ? resolved : undefined;

    // Track if the image failed to load
    const [imageError, setImageError] = useState(false);

    // Use placeholder if no src provided or if image failed to load
    const src = (resolvedSrc && !imageError) ? resolvedSrc : PLACEHOLDER_IMAGE;
    const isPlaceholder = !resolvedSrc || imageError;

    const imageStyle = useMemo<React.CSSProperties>(() => ({
        width: '100%',
        height: 'auto',
        display: 'block',
        objectFit: 'contain',
    }), []);

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <p className="monster-portrait" style={{ margin: 0, padding: 0 }}>
            <img
                className="monster-portrait__image"
                src={src}
                alt={isPlaceholder ? "Portrait placeholder" : "Creature portrait"}
                onError={handleImageError}
                style={imageStyle}
            />
        </p>
    );
};

export default PortraitPanel;



