import React from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import { resolveDataReference } from './utils';
import EditableText from './EditableText';

const FlavorSummary: React.FC<CanvasComponentProps> = ({ dataRef, dataSources, isEditMode = false, onUpdateData }) => {
    const resolved = resolveDataReference(dataSources, dataRef);
    const content = typeof resolved === 'string' ? resolved.trim() : '';

    if (!content && !isEditMode) {
        return null;
    }

    return (
        <>
            <div className="block descriptive">
                <h5 id="user-monster-description">
                    <EditableText
                        value={content}
                        onChange={(value) => onUpdateData?.({ description: value })}
                        isEditMode={isEditMode}
                        placeholder="Enter creature description..."
                        multiline
                    />
                </h5>
            </div>
            <hr />
        </>
    );
};

export default FlavorSummary;

