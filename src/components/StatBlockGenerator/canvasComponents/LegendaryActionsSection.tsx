import React from 'react';

import type { CanvasComponentProps } from '../../../types/statblockCanvas.types';
import { formatActionDetails, toRegionContent } from './utils';

const LegendaryActionsSection: React.FC<CanvasComponentProps> = ({ regionContent, regionOverflow }) => {
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

    return (
        <section className={`dm-legendary-section${regionOverflow ? ' dm-section-overflow' : ''}`}>
            <h4 className="dm-section-heading" id="legendary-actions">{heading}</h4>
            {showSummary ? (
                <p className="dm-legendary-summary">{summaryText}</p>
            ) : null}
            <dl className="dm-action-list">
                {items.map((action, index) => {
                    const globalIndex = startIndex + index;
                    const isLast = globalIndex === totalCount - 1;
                    return (
                        <React.Fragment key={`${action.name || 'legendary-action'}-${globalIndex}`}>
                            <dt className="dm-action-term">
                                <em>
                                    <strong>{action.name || 'Unnamed Legendary Action'}</strong>
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

export default LegendaryActionsSection;


