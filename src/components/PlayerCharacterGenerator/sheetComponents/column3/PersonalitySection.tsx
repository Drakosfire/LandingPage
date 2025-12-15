/**
 * PersonalitySection Component
 * 
 * Displays personality traits, ideals, bonds, and flaws.
 * 
 * @module PlayerCharacterGenerator/sheetComponents/column3
 */

import React from 'react';

export interface PersonalitySectionProps {
    /** Personality traits */
    traits?: string;
    /** Ideals */
    ideals?: string;
    /** Bonds */
    bonds?: string;
    /** Flaws */
    flaws?: string;
}

interface PersonalityBoxProps {
    label: string;
    content: string;
}

const PersonalityBox: React.FC<PersonalityBoxProps> = ({ label, content }) => (
    <div className="phb-section personality-box">
        <div className="text-area">{content || '—'}</div>
        <div className="box-label">{label}</div>
    </div>
);

export const PersonalitySection: React.FC<PersonalitySectionProps> = ({
    traits = '',
    ideals = '',
    bonds = '',
    flaws = ''
}) => {
    return (
        <>
            <PersonalityBox label="Personality Traits" content={traits} />
            <PersonalityBox label="Ideals" content={ideals} />
            <PersonalityBox label="Bonds" content={bonds} />
            <PersonalityBox label="Flaws" content={flaws} />
        </>
    );
};

export default PersonalitySection;

