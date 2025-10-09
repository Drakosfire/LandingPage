import React, { useState, useRef, useEffect, useCallback } from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import type { Action } from '../../../types/statblock.types';
import { formatActionDetails, toRegionContent, getPrimaryStatblock } from './utils';
import EditableText from './EditableText';
import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';

const ActionSection: React.FC<CanvasComponentProps> = ({ regionContent, regionOverflow, dataSources, isEditMode = false, onUpdateData }) => {
    const statblock = getPrimaryStatblock(dataSources);
    const { requestComponentLock, releaseComponentLock } = useStatBlockGenerator();

    // Phase 1: Dynamic component locking state
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const editTimerRef = useRef<NodeJS.Timeout | null>(null);
    const componentId = 'action-section'; // Stable ID for this component

    const updateAction = useCallback((actionIndex: number, updates: Partial<Action>) => {
        if (!statblock?.actions) return;
        const newActions = [...statblock.actions];
        newActions[actionIndex] = { ...newActions[actionIndex], ...updates };
        onUpdateData?.({ actions: newActions });
    }, [statblock?.actions, onUpdateData]);

    // Phase 1: Edit handlers
    const handleEditComplete = useCallback(() => {
        if (hasChanges) {
            // Data already saved to local state via updateAction
            // Now release lock to trigger measurements
            releaseComponentLock(componentId);
            setIsEditing(false);
            setHasChanges(false);
        }
    }, [hasChanges, releaseComponentLock]);

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
    }, [handleEditComplete]);

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

    if (!regionContent || regionContent.items.length === 0) {
        return null;
    }

    const { items, startIndex, totalCount, isContinuation } = toRegionContent('action-list', regionContent.items, regionContent.startIndex, regionContent.totalCount, regionContent.isContinuation);

    const showHeading = startIndex === 0;
    const headingText = isContinuation ? 'Actions (cont.)' : 'Actions';

    return (
        <section className={`dm-action-section${regionOverflow ? ' dm-section-overflow' : ''}`}>
            {showHeading ? (
                <h4 className="dm-section-heading" id="actions">{headingText}</h4>
            ) : (
                <h4 className="dm-section-heading" id="actions">{headingText}</h4>
            )}
            <dl className="dm-action-list">
                {items.map((action, index) => {
                    const globalIndex = startIndex + index;
                    const isLast = globalIndex === totalCount - 1;
                    return (
                        <React.Fragment key={action.id}>
                            <dt className="dm-action-term">
                                <em>
                                    <strong>
                                        <EditableText
                                            value={action.name}
                                            onChange={(value) => updateAction(globalIndex, { name: value })}
                                            isEditMode={isEditMode}
                                            placeholder="Action name"
                                            onEditStart={handleEditStart}
                                            onEditChange={handleEditChange}
                                        />
                                    </strong>
                                </em>
                                {action.usage ? ` (${action.usage})` : ''}
                            </dt>
                            <dd className="dm-action-description">
                                <EditableText
                                    value={formatActionDetails(action)}
                                    onChange={(value) => updateAction(globalIndex, { desc: value })}
                                    isEditMode={isEditMode}
                                    placeholder="Action description"
                                    multiline
                                    onEditStart={handleEditStart}
                                    onEditChange={handleEditChange}
                                />
                            </dd>
                            {!isLast ? <div className="dm-action-divider" /> : null}
                        </React.Fragment>
                    );
                })}
            </dl>
        </section>
    );
};

export default ActionSection;
