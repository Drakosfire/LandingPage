/**
 * Column3Content Component
 * 
 * Aggregates all Column 3 content: Personality (traits, ideals, bonds, flaws) and Features.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/column3
 */

import React from 'react';
import { PersonalitySection } from './PersonalitySection';
import { FeaturesSection, Feature } from './FeaturesSection';

export interface Column3ContentProps {
    /** Personality traits */
    traits?: string;
    /** Ideals */
    ideals?: string;
    /** Bonds */
    bonds?: string;
    /** Flaws */
    flaws?: string;
    /** Features & Traits */
    features?: Feature[];
}

export const Column3Content: React.FC<Column3ContentProps> = ({
    traits,
    ideals,
    bonds,
    flaws,
    features = []
}) => {
    return (
        <>
            <PersonalitySection
                traits={traits}
                ideals={ideals}
                bonds={bonds}
                flaws={flaws}
            />
            <FeaturesSection features={features} />
        </>
    );
};

export default Column3Content;

