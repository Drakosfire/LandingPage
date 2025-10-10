import React, { useState, useRef, useEffect, useCallback } from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import type { Action } from '../../../types/statblock.types';
import { formatActionDetails, toRegionContent, getPrimaryStatblock } from './utils';
import EditableText from './EditableText';
import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';

const LairActionsSection: React.FC<CanvasComponentProps> = ({ regionContent, regionOverflow, dataSources, isEditMode = false, onUpdateData }) => {
    const statblock = getPrimaryStatblock(dataSources);
    const { requestComponentLock, releaseComponentLock } = useStatBlockGenerator();

    // Phase 2.5: Dynamic component locking state
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const editTimerRef = useRef<NodeJS.Timeout | null>(null);
    const componentId = 'lair-actions-section'; // Stable ID for this component

    // Phase 2.5: Edit handlers (must be defined before early return)
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
            // Data already saved to local state
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

    // Early return after all hooks
    if (!regionContent || regionContent.items.length === 0) {
        return null;
    }

    const { items, startIndex, totalCount, isContinuation } = toRegionContent(
        'lair-action-list',
        regionContent.items,
        regionContent.startIndex,
        regionContent.totalCount,
        regionContent.isContinuation
    );

    const heading = isContinuation ? 'Lair Actions (cont.)' : 'Lair Actions';
    const showSummary = startIndex === 0 && typeof regionContent.metadata?.lairSummary === 'string';

    const updateLairAction = (actionIndex: number, updates: Partial<Action>) => {
        if (!statblock?.lairActions?.actions) return;
        const newActions = [...statblock.lairActions.actions];
        newActions[actionIndex] = { ...newActions[actionIndex], ...updates };
        onUpdateData?.({
            lairActions: {
                ...statblock.lairActions,
                actions: newActions
            }
        });
    };

    const updateLairSummary = (summary: string) => {
        if (!statblock?.lairActions) return;
        onUpdateData?.({
            lairActions: {
                ...statblock.lairActions,
                description: summary
            }
        });
    };

    const updateLairName = (name: string) => {
        if (!statblock?.lairActions) return;
        onUpdateData?.({
            lairActions: {
                ...statblock.lairActions,
                lairName: name
            }
        });
    };

    const updateLairDescription = (description: string) => {
        if (!statblock?.lairActions) return;
        onUpdateData?.({
            lairActions: {
                ...statblock.lairActions,
                lairDescription: description
            }
        });
    };

    // Extract lair name and description from statblock
    const lairName = statblock?.lairActions?.lairName;
    const lairDescription = statblock?.lairActions?.lairDescription;

    return (
        <section className={`dm-lair-section${regionOverflow ? ' dm-section-overflow' : ''}`}>
            <h4 className="dm-section-heading" id="lair-actions">{heading}</h4>

            {/* Lair Name - Only show on first page */}
            {startIndex === 0 && lairName && (
                <p className="dm-lair-name" style={{ fontStyle: 'italic', fontWeight: 600, marginTop: '0.5em' }}>
                    <EditableText
                        value={lairName}
                        onChange={updateLairName}
                        isEditMode={isEditMode}
                        placeholder="Name of the lair"
                        onEditStart={handleEditStart}
                        onEditChange={handleEditChange}
                    />
                </p>
            )}

            {/* Lair Description (Sensory Flavor) - Only show on first page */}
            {startIndex === 0 && lairDescription && (
                <p className="dm-lair-flavor" style={{ fontStyle: 'italic', marginTop: '0.5em', marginBottom: '0.75em' }}>
                    <EditableText
                        value={lairDescription}
                        onChange={updateLairDescription}
                        isEditMode={isEditMode}
                        placeholder="Describe the lair atmosphere and environment..."
                        multiline
                        onEditStart={handleEditStart}
                        onEditChange={handleEditChange}
                    />
                </p>
            )}

            {/* Lair Mechanics Summary */}
            {showSummary ? (
                <p className="dm-lair-summary">
                    <EditableText
                        value={regionContent.metadata?.lairSummary as string}
                        onChange={updateLairSummary}
                        isEditMode={isEditMode}
                        placeholder="Lair actions mechanics (initiative count 20 rules)"
                        multiline
                        onEditStart={handleEditStart}
                        onEditChange={handleEditChange}
                    />
                </p>
            ) : null}
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
                                            value={action.name || 'Unnamed Lair Action'}
                                            onChange={(value) => updateLairAction(globalIndex, { name: value })}
                                            isEditMode={isEditMode}
                                            placeholder="Lair action name"
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
                                    onChange={(value) => updateLairAction(globalIndex, { desc: value })}
                                    isEditMode={isEditMode}
                                    placeholder="Lair action description"
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

export default LairActionsSection;


