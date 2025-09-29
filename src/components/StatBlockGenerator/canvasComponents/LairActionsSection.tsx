import React from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import { formatActionDetails, toRegionContent } from './utils';

const LairActionsSection: React.FC<CanvasComponentProps> = ({ regionContent, regionOverflow }) => {
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

    return (
        <section className={`dm-lair-section${regionOverflow ? ' dm-section-overflow' : ''}`}>
            <h4 className="dm-section-heading" id="lair-actions">{heading}</h4>
            {showSummary ? <p className="dm-lair-summary">{regionContent.metadata?.lairSummary as string}</p> : null}
            <dl className="dm-action-list">
                {items.map((action, index) => {
                    const globalIndex = startIndex + index;
                    const isLast = globalIndex === totalCount - 1;
                    return (
                        <React.Fragment key={`${action.name || 'lair-action'}-${globalIndex}`}>
                            <dt className="dm-action-term">
                                <em>
                                    <strong>{action.name || 'Unnamed Lair Action'}</strong>
                                </em>
                                {action.usage ? ` (${action.usage})` : ''}
                            </dt>
                            <dd className="dm-action-description">{formatActionDetails(action)}</dd>
                            {!isLast ? <div className="dm-action-divider" /> : null}
                        </React.Fragment>
                    );
                })}
            </dl>
        </section>
    );
};

export default LairActionsSection;


