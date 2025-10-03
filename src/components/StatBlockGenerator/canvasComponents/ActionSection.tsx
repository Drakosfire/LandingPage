import React from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import type { Action } from '../../../types/statblock.types';
import { formatActionDetails, toRegionContent, getPrimaryStatblock } from './utils';
import EditableText from './EditableText';

const ActionSection: React.FC<CanvasComponentProps> = ({ regionContent, regionOverflow, dataSources, isEditMode = false, onUpdateData }) => {
    const statblock = getPrimaryStatblock(dataSources);

    if (!regionContent || regionContent.items.length === 0) {
        return null;
    }

    const { items, startIndex, totalCount, isContinuation } = toRegionContent('action-list', regionContent.items, regionContent.startIndex, regionContent.totalCount, regionContent.isContinuation);

    const showHeading = startIndex === 0;
    const headingText = isContinuation ? 'Actions (cont.)' : 'Actions';

    const updateAction = (actionIndex: number, updates: Partial<Action>) => {
        if (!statblock?.actions) return;
        const newActions = [...statblock.actions];
        newActions[actionIndex] = { ...newActions[actionIndex], ...updates };
        onUpdateData?.({ actions: newActions });
    };

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
                        <React.Fragment key={`${action.name || 'action'}-${globalIndex}`}>
                            <dt className="dm-action-term">
                                <em>
                                    <strong>
                                        <EditableText
                                            value={action.name}
                                            onChange={(value) => updateAction(globalIndex, { name: value })}
                                            isEditMode={isEditMode}
                                            placeholder="Action name"
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
