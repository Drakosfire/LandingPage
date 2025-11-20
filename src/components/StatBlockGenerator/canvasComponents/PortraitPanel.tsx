import React, { useState } from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import { resolveDataReference } from './utils';

// Placeholder image for missing or failed portrait loads (served from Cloudflare CDN)
const PLACEHOLDER_IMAGE = 'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/1778cee9-f500-4476-7f30-ac7fd991f700/public';

const PortraitPanel: React.FC<CanvasComponentProps> = ({ dataRef, dataSources, layout }) => {
    const resolved = resolveDataReference(dataSources, dataRef);
    const resolvedSrc = typeof resolved === 'string' ? resolved : undefined;

    // Track if the image failed to load
    const [imageError, setImageError] = useState(false);

    // Use placeholder if no src provided or if image failed to load
    const src = (resolvedSrc && !imageError) ? resolvedSrc : PLACEHOLDER_IMAGE;
    const isPlaceholder = !resolvedSrc || imageError;

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <figure className="monster-portrait">
            <div className="monster-portrait__frame" data-tutorial="creature-portrait">
                <img
                    className="monster-portrait__image"
                    src={src}
                    alt={isPlaceholder ? 'Portrait placeholder' : 'Creature portrait'}
                    onError={handleImageError}
                />
            </div>
        </figure>
    );
};

export default PortraitPanel;



