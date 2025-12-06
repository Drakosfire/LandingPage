/**
 * FeaturesSection Component
 * 
 * Displays Features & Traits (class features, racial traits, etc.)
 * 
 * @module PlayerCharacterGenerator/sheetComponents/column3
 */

import React from 'react';

export interface Feature {
    name: string;
    description: string;
}

export interface FeaturesSectionProps {
    /** Array of features to display */
    features: Feature[];
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
    features
}) => {
    return (
        <div className="phb-section features-box">
            <div className="text-area">
                {features.length > 0 ? (
                    features.map((feature, idx) => (
                        <React.Fragment key={idx}>
                            <strong>{feature.name}</strong><br />
                            {feature.description}
                            {idx < features.length - 1 && <><br /><br /></>}
                        </React.Fragment>
                    ))
                ) : (
                    <span style={{ color: 'var(--text-muted)' }}>No features</span>
                )}
            </div>
            <div className="box-label">Features & Traits</div>
        </div>
    );
};

export default FeaturesSection;

