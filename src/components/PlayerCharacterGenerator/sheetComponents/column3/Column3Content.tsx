/**
 * Column3Content Component
 * 
 * Aggregates Column 3 content: Features & Traits.
 * Personality content has moved to BackgroundPersonalitySheet.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/column3
 */

import React from 'react';
import { FeaturesSection, Feature } from './FeaturesSection';

export interface Column3ContentProps {
    /** Features & Traits */
    features?: Feature[];
}

export const Column3Content: React.FC<Column3ContentProps> = ({
    features = []
}) => {
    return <FeaturesSection features={features} />;
};

export default Column3Content;

