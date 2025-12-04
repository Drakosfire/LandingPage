/**
 * FeaturesSection Component
 * 
 * Class and racial features with descriptions.
 * 
 * @module PlayerCharacterGenerator/canvasComponents/sections/FeaturesSection
 */

import React from 'react';
import type { DnD5eFeature } from '../../types/dnd5e/character.types';

export interface FeaturesSectionProps {
    /** Features to display */
    features: DnD5eFeature[];
    /** Optional section title */
    title?: string;
}

/**
 * Get feature source label
 */
function getSourceLabel(source: DnD5eFeature['source']): string {
    switch (source) {
        case 'race': return 'Racial';
        case 'class': return 'Class';
        case 'background': return 'Background';
        case 'feat': return 'Feat';
        default: return '';
    }
}

/**
 * FeaturesSection - Features & Traits list
 */
export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
    features,
    title = 'Features & Traits'
}) => {
    if (features.length === 0) {
        return (
            <div className="block character frame" id="features">
                <h4>{title}</h4>
                <p style={{ fontStyle: 'italic', color: '#666' }}>No features</p>
            </div>
        );
    }

    // Group features by source
    const groupedFeatures = features.reduce((acc, feature) => {
        const source = feature.source || 'other';
        if (!acc[source]) acc[source] = [];
        acc[source].push(feature);
        return acc;
    }, {} as Record<string, DnD5eFeature[]>);

    const sourceOrder = ['race', 'class', 'background', 'feat'];

    return (
        <div className="block character frame" id="features">
            <h4>{title}</h4>

            {sourceOrder.map(source => {
                const sourceFeatures = groupedFeatures[source];
                if (!sourceFeatures || sourceFeatures.length === 0) return null;

                return (
                    <div key={source} className="feature-source-group">
                        <h5>{getSourceLabel(source as DnD5eFeature['source'])} Features</h5>
                        {sourceFeatures.map((feature, idx) => (
                            <div key={feature.id || idx} className="feature-item">
                                <span className="feature-name">{feature.name}.</span>
                                {' '}
                                <span className="feature-description">
                                    {feature.description}
                                </span>
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export default FeaturesSection;

