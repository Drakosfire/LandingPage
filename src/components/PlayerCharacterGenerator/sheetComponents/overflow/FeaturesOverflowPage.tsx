/**
 * FeaturesOverflowPage Component
 * 
 * Continuation page for features that overflow from the main sheet.
 * Uses the same PHB parchment styling as other character sheet pages.
 * Supports multi-page overflow with page indicators.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/overflow
 */

import React from 'react';
import type { Feature } from '../column3/FeaturesSection';
import './FeaturesOverflowPage.css';

export interface FeaturesOverflowPageProps {
    /** Features for this overflow page */
    features: Feature[];
    /** Character name for header */
    characterName?: string;
    /** Overall page number in the character sheet */
    pageNumber?: number;
    /** Current overflow page (1-indexed) within features overflow */
    currentOverflowPage?: number;
    /** Total number of features overflow pages */
    totalOverflowPages?: number;
}

/**
 * FeaturesOverflowPage - Continuation page with PHB parchment styling
 * 
 * Uses the same .page.phb classes as CharacterSheetPage to get:
 * - Parchment background texture
 * - Fancy decorative border
 * - Footer accent decoration
 */
export const FeaturesOverflowPage: React.FC<FeaturesOverflowPageProps> = ({
    features,
    characterName = 'Character',
    pageNumber,
    currentOverflowPage = 1,
    totalOverflowPages = 1
}) => {
    if (features.length === 0) return null;
    
    // Build header text with page indicator for multi-page overflow
    const headerText = totalOverflowPages > 1
        ? `${characterName} — Features & Traits (Continued ${currentOverflowPage}/${totalOverflowPages})`
        : `${characterName} — Features & Traits (Continued)`;
    
    return (
        <div className="page phb character-sheet overflow-page features-overflow-page">
            {/* Header */}
            <header className="overflow-page-header">
                <h2 className="overflow-page-title">{headerText}</h2>
                {pageNumber && (
                    <span className="overflow-page-number">Page {pageNumber}</span>
                )}
            </header>
            
            {/* Features List */}
            <div className="overflow-features-list">
                {features.map((feature, idx) => (
                    <div key={feature.name || idx} className="overflow-feature-item">
                        <h3 className="overflow-feature-name">{feature.name}</h3>
                        <p className="overflow-feature-description">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
            
            {/* Footer */}
            <footer className="overflow-page-footer">
                <span className="overflow-page-count">
                    {features.length} feature{features.length !== 1 ? 's' : ''} on this page
                    {totalOverflowPages > 1 && ` • Overflow page ${currentOverflowPage} of ${totalOverflowPages}`}
                </span>
            </footer>
        </div>
    );
};

export default FeaturesOverflowPage;

