import React, { useState, useRef, useEffect, useCallback } from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import type { Action } from '../../../types/statblock.types';
import { formatActionDetails, toRegionContent, getPrimaryStatblock } from './utils';
import EditableText from './EditableText';
import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';

const LegendaryActionsSection: React.FC<CanvasComponentProps> = ({ regionContent, regionOverflow, dataSources, isEditMode = false, onUpdateData }) => {
    const statblock = getPrimaryStatblock(dataSources);
    const { requestComponentLock, releaseComponentLock } = useStatBlockGenerator();

    // Phase 2.5: Dynamic component locking state
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const editTimerRef = useRef<NodeJS.Timeout | null>(null);
    const componentId = 'legendary-actions-section'; // Stable ID for this component

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
        'legendary-action-list',
        regionContent.items,
        regionContent.startIndex,
        regionContent.totalCount,
        regionContent.isContinuation
    );

    const heading = startIndex === 0 ? 'Legendary Actions' : 'Legendary Actions (cont.)';
    const summaryText = regionContent.metadata?.legendarySummary;
    const showSummary = startIndex === 0 && typeof summaryText === 'string' && summaryText.length > 0;

    const updateLegendaryAction = (actionIndex: number, updates: Partial<Action>) => {
        if (!statblock?.legendaryActions?.actions) return;
        const newActions = [...statblock.legendaryActions.actions];
        newActions[actionIndex] = { ...newActions[actionIndex], ...updates };
        onUpdateData?.({
            legendaryActions: {
                ...statblock.legendaryActions,
                actions: newActions
            }
        });
    };

    const updateLegendarySummary = (summary: string) => {
        if (!statblock?.legendaryActions) return;
        onUpdateData?.({
            legendaryActions: {
                ...statblock.legendaryActions,
                description: summary
            }
        });
    };

    return (
        <section className={`dm-legendary-section${regionOverflow ? ' dm-section-overflow' : ''}`}>
            <h4 className="dm-section-heading" id="legendary-actions">{heading}</h4>
            {showSummary ? (
                <p className="dm-legendary-summary">
                    <EditableText
                        value={summaryText}
                        onChange={updateLegendarySummary}
                        isEditMode={isEditMode}
                        placeholder="Legendary actions summary"
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
                                            value={action.name || 'Unnamed Legendary Action'}
                                            onChange={(value) => updateLegendaryAction(globalIndex, { name: value })}
                                            isEditMode={isEditMode}
                                            placeholder="Legendary action name"
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
                                    onChange={(value) => updateLegendaryAction(globalIndex, { desc: value })}
                                    isEditMode={isEditMode}
                                    placeholder="Legendary action description"
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

export default LegendaryActionsSection;


