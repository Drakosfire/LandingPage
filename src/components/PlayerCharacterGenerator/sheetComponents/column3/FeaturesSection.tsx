/**
 * FeaturesSection Component
 * 
 * Displays Features & Traits (class features, racial traits, etc.)
 * In edit mode, clicking opens the Class wizard step.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/column3
 */

import React from 'react';
import { usePlayerCharacterGenerator } from '../../PlayerCharacterGeneratorProvider';

/**
 * Wizard step constants for navigation
 */
const WIZARD_STEPS = {
    BASICS: 0,
    ABILITIES: 1,
    RACE: 2,
    CLASS: 3,
    SPELLS: 4,
    BACKGROUND: 5,
    EQUIPMENT: 6,
    REVIEW: 7
} as const;

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
    const { isEditMode, openDrawerToStep } = usePlayerCharacterGenerator();

    const handleSectionClick = () => {
        if (isEditMode) {
            console.log('🔗 [FeaturesSection] Opening Class step (features from class/race)');
            openDrawerToStep(WIZARD_STEPS.CLASS);
        }
    };

    return (
        <div 
            className="phb-section features-box"
            data-editable={isEditMode ? "complex" : undefined}
            onClick={handleSectionClick}
            role={isEditMode ? 'button' : undefined}
            tabIndex={isEditMode ? 0 : undefined}
            onKeyDown={(e) => {
                if (isEditMode && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleSectionClick();
                }
            }}
            title={isEditMode ? "Edit features (Class/Race)" : undefined}
        >
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

