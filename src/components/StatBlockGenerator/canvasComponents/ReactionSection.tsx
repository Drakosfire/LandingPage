import React from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import { formatActionDetails, toRegionContent } from './utils';

const ReactionSection: React.FC<CanvasComponentProps> = ({ regionContent, regionOverflow }) => {
    if (!regionContent || regionContent.items.length === 0) {
        return null;
    }

    const { items, startIndex, totalCount, isContinuation } = toRegionContent(
        'reaction-list',
        regionContent.items,
        regionContent.startIndex,
        regionContent.totalCount,
        regionContent.isContinuation
    );

    const heading = isContinuation ? 'Reactions (cont.)' : 'Reactions';

    return (
        <section className={`dm-reaction-section${regionOverflow ? ' dm-section-overflow' : ''}`}>
            <h4 className="dm-section-heading" id="reactions">{heading}</h4>
            <dl className="dm-action-list">
                {items.map((reaction, index) => {
                    const globalIndex = startIndex + index;
                    const isLast = globalIndex === totalCount - 1;
                    return (
                        <React.Fragment key={`${reaction.name || 'reaction'}-${globalIndex}`}>
                            <dt className="dm-action-term">
                                <em>
                                    <strong>{reaction.name || 'Unnamed Reaction'}</strong>
                                </em>
                                {reaction.usage ? ` (${reaction.usage})` : ''}
                            </dt>
                            <dd className="dm-action-description">{formatActionDetails(reaction)}</dd>
                            {!isLast ? <div className="dm-action-divider" /> : null}
                        </React.Fragment>
                    );
                })}
            </dl>
        </section>
    );
};

export default ReactionSection;


