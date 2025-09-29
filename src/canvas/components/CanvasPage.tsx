import React from 'react';

import type { CanvasLayoutEntry, LayoutPlan } from '../layout/types';

interface CanvasPageProps {
    layoutPlan: LayoutPlan | null | undefined;
    renderEntry: (entry: CanvasLayoutEntry) => React.ReactNode;
}

const CanvasPage: React.FC<CanvasPageProps> = ({ layoutPlan, renderEntry }) => {
    if (!layoutPlan || layoutPlan.pages.length === 0) {
        return null;
    }

    const showPaginationMarker = layoutPlan.pages.length > 1;

    return (
        <>
            {layoutPlan.pages.map((page) => (
                <div key={`page-${page.pageNumber}`} className="page phb" data-page-number={page.pageNumber}>
                    {showPaginationMarker && (
                        <div className="dm-pagination-marker" data-testid={`pagination-marker-${page.pageNumber}`}>
                            Page {page.pageNumber}
                        </div>
                    )}
                    <div className="columnWrapper">
                        {page.columns.map((column) => (
                            <div key={column.key} className="monster frame wide" data-column-key={column.key}>
                                {column.entries.map((entry) => (
                                    <div key={entry.instance.id} className="canvas-entry" data-entry-id={entry.instance.id}>
                                        {renderEntry(entry)}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </>
    );
};

export { CanvasPage };


