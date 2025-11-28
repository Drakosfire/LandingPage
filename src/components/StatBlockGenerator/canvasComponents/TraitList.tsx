import React, { useState, useRef, useEffect, useCallback } from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import type { Action } from '../../../types/statblock.types';
import { formatActionDetails, toRegionContent, getPrimaryStatblock } from './utils';
import EditableText from './EditableText';
import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';

const TraitList: React.FC<CanvasComponentProps> = ({ regionContent, regionOverflow, dataSources, isEditMode = false, onUpdateData }) => {
    const statblock = getPrimaryStatblock(dataSources);
    const { requestComponentLock, releaseComponentLock } = useStatBlockGenerator();

    // Phase 2.5: Dynamic component locking state
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const editTimerRef = useRef<NodeJS.Timeout | null>(null);
    const componentId = 'trait-list'; // Stable ID for this component

    // Phase 2.5: Edit handlers (must be defined before early return)
    const handleEditComplete = useCallback(() => {
        if (hasChanges) {
            // Data already saved to local state via updateTrait
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

    // Early return after all hooks
    if (!regionContent || regionContent.items.length === 0) {
        return null;
    }

    const { items, startIndex, totalCount, isContinuation } = toRegionContent(
        'trait-list',
        regionContent.items,
        regionContent.startIndex,
        regionContent.totalCount,
        regionContent.isContinuation
    );

    const heading = isContinuation ? 'Traits (cont.)' : 'Traits';

    const updateTrait = (traitIndex: number, updates: Partial<Action>) => {
        if (!statblock?.specialAbilities) return;
        const newTraits = [...statblock.specialAbilities];
        newTraits[traitIndex] = { ...newTraits[traitIndex], ...updates };
        onUpdateData?.({ specialAbilities: newTraits });
    };

    return (
        <section className={`dm-trait-section${regionOverflow ? ' dm-section-overflow' : ''}`}>
            {/* Heading always shows but text changes for continuations */}
            <h4 className="dm-section-heading" id="traits">{heading}</h4>
            <dl className="dm-action-list">
                {items.map((trait, index) => {
                    const globalIndex = startIndex + index;
                    const isLast = globalIndex === totalCount - 1;
                    return (
                        <React.Fragment key={trait.id}>
                            <dt className="dm-action-term">
                                <strong>
                                    <EditableText
                                        value={trait.name || 'Unnamed Trait'}
                                        onChange={(value) => updateTrait(globalIndex, { name: value })}
                                        isEditMode={isEditMode}
                                        placeholder="Trait name"
                                        onEditStart={handleEditStart}
                                        onEditChange={handleEditChange}
                                    />
                                </strong>
                            </dt>
                            <dd className="dm-action-description">
                                <EditableText
                                    value={formatActionDetails(trait)}
                                    onChange={(value) => updateTrait(globalIndex, { desc: value })}
                                    isEditMode={isEditMode}
                                    placeholder="Trait description"
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

export default TraitList;



