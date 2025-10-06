import React, { useState, useRef, useEffect, useCallback } from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import { resolveDataReference } from './utils';
import EditableText from './EditableText';
import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';

const FlavorSummary: React.FC<CanvasComponentProps> = ({ dataRef, dataSources, isEditMode = false, onUpdateData }) => {
    const resolved = resolveDataReference(dataSources, dataRef);
    const content = typeof resolved === 'string' ? resolved.trim() : '';
    const { requestComponentLock, releaseComponentLock } = useStatBlockGenerator();

    // Phase 1: Dynamic component locking state
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const editTimerRef = useRef<NodeJS.Timeout | null>(null);
    const componentId = 'flavor-summary';

    // Phase 1: Edit handlers
    const handleEditStart = useCallback(() => {
        if (!isEditing && isEditMode) {
            setIsEditing(true);
            requestComponentLock(componentId);
        }
    }, [isEditing, isEditMode, requestComponentLock]);

    const handleEditChange = useCallback(() => {
        setHasChanges(true);

        // Reset the 2-second idle timer
        if (editTimerRef.current) {
            clearTimeout(editTimerRef.current);
        }

        // Set new timer for 2 seconds after last edit
        editTimerRef.current = setTimeout(() => {
            handleEditComplete();
        }, 2000);
    }, []);

    const handleEditComplete = useCallback(() => {
        if (hasChanges) {
            // Data already saved to local state via onChange handlers
            // Now release lock to trigger measurements
            releaseComponentLock(componentId);
            setIsEditing(false);
            setHasChanges(false);
        }
    }, [hasChanges, releaseComponentLock]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (editTimerRef.current) {
                clearTimeout(editTimerRef.current);
            }
            if (isEditing) {
                releaseComponentLock(componentId);
            }
        };
    }, [isEditing, releaseComponentLock]);

    if (!content && !isEditMode) {
        return null;
    }

    return (
        <div className="block descriptive">
            <h5 id="user-monster-description">
                <EditableText
                    value={content}
                    onChange={(value) => onUpdateData?.({ description: value })}
                    isEditMode={isEditMode}
                    placeholder="Enter creature description..."
                    multiline
                    onEditStart={handleEditStart}
                    onEditChange={handleEditChange}
                />
            </h5>
            <hr />
        </div>
    );
};

export default FlavorSummary;

