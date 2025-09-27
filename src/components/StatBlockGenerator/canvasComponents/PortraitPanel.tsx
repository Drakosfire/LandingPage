import React from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import { resolveDataReference } from './utils';

const PortraitPanel: React.FC<CanvasComponentProps> = ({ dataRef, dataSources }) => {
    const resolved = resolveDataReference(dataSources, dataRef);
    const src = typeof resolved === 'string' ? resolved : undefined;

    if (!src) {
        return null;
    }

    return (
        <p>
            <img
                src={src}
                alt="Creature portrait"
                style={{ width: '330px', mixBlendMode: 'multiply', border: '3px solid black' }}
            />
        </p>
    );
};

export default PortraitPanel;



