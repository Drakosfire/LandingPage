import React from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import { formatActionDetails, toRegionContent } from './utils';

const TraitList: React.FC<CanvasComponentProps> = ({ regionContent, regionOverflow }) => {
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

    return (
        <section className={`dm-trait-section${regionOverflow ? ' dm-section-overflow' : ''}`}>
            {startIndex === 0 ? (
                <h4 className="dm-section-heading" id="traits">{heading}</h4>
            ) : (
                <h4 className="dm-section-heading" id="traits">{heading}</h4>
            )}
            <dl className="dm-action-list">
                {items.map((trait, index) => {
                    const globalIndex = startIndex + index;
                    const isLast = globalIndex === totalCount - 1;
                    return (
                        <React.Fragment key={`${trait.name || 'trait'}-${globalIndex}`}>
                            <dt className="dm-action-term">
                                <strong>{trait.name || 'Unnamed Trait'}</strong>
                            </dt>
                            <dd className="dm-action-description">{formatActionDetails(trait)}</dd>
                            {!isLast ? <div className="dm-action-divider" /> : null}
                        </React.Fragment>
                    );
                })}
            </dl>
        </section>
    );
};

export default TraitList;



