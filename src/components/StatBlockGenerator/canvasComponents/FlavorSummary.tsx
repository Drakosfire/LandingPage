import React from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import { resolveDataReference } from './utils';

const FlavorSummary: React.FC<CanvasComponentProps> = ({ dataRef, dataSources }) => {
    const resolved = resolveDataReference(dataSources, dataRef);
    const content = typeof resolved === 'string' ? resolved.trim() : '';

    if (!content) {
        return null;
    }

    return (
        <>
            <div className="block descriptive">
                <h5 id="user-monster-description">{content}</h5>
            </div>
            <hr />
        </>
    );
};

export default FlavorSummary;

