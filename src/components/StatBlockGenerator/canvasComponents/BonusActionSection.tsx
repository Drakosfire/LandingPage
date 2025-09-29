import React from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import { formatActionDetails, toRegionContent } from './utils';

const BonusActionSection: React.FC<CanvasComponentProps> = ({ regionContent, regionOverflow }) => {
    if (!regionContent || regionContent.items.length === 0) {
        return null;
    }

    const { items, startIndex, totalCount, isContinuation } = toRegionContent(
        'bonus-action-list',
        regionContent.items,
        regionContent.startIndex,
        regionContent.totalCount,
        regionContent.isContinuation
    );

    const heading = isContinuation ? 'Bonus Actions (cont.)' : 'Bonus Actions';

    return (
        <section className={`dm-bonus-action-section${regionOverflow ? ' dm-section-overflow' : ''}`}>
            <h4 className="dm-section-heading" id="bonus-actions">{heading}</h4>
            <dl className="dm-action-list">
                {items.map((action, index) => {
                    const globalIndex = startIndex + index;
                    const isLast = globalIndex === totalCount - 1;
                    return (
                        <React.Fragment key={`${action.name || 'bonus-action'}-${globalIndex}`}>
                            <dt className="dm-action-term">
                                <em>
                                    <strong>{action.name || 'Unnamed Bonus Action'}</strong>
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

export default BonusActionSection;


