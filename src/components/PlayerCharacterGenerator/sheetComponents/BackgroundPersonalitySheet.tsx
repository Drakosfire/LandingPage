/**
 * BackgroundPersonalitySheet Component
 * 
 * Second page of the character sheet focused on roleplay content.
 * Contains personality traits, ideals, bonds, flaws, and notes.
 * 
 * @module PlayerCharacterGenerator/sheetComponents
 */

import React from 'react';
import { CharacterSheetPage } from './CharacterSheetPage';
import './CharacterSheet.css';

export interface BackgroundPersonalitySheetProps {
    /** Personality traits */
    traits?: string;
    /** Character ideals */
    ideals?: string;
    /** Character bonds */
    bonds?: string;
    /** Character flaws */
    flaws?: string;
    /** Notes content */
    notes?: string;
    /** Character name (for header) */
    characterName?: string;
    /** Background name */
    backgroundName?: string;
}

interface PersonalityBoxProps {
    label: string;
    content: string;
}

const PersonalityBox: React.FC<PersonalityBoxProps> = ({ label, content }) => (
    <div className="phb-section personality-box personality-grid-item">
        <div className="text-area">{content || '—'}</div>
        <div className="box-label">{label}</div>
    </div>
);

/**
 * BackgroundPersonalitySheet - PHB-styled page for roleplay content
 * 
 * Layout:
 * - Title header
 * - 2x2 grid for personality traits, ideals, bonds, flaws
 * - Full-width notes section with 3-column layout
 */
export const BackgroundPersonalitySheet: React.FC<BackgroundPersonalitySheetProps> = ({
    traits = '',
    ideals = '',
    bonds = '',
    flaws = '',
    notes = '',
    characterName = '',
    backgroundName = ''
}) => {
    return (
        <CharacterSheetPage
            className="background-personality-sheet"
            testId="background-personality-sheet"
        >
            {/* Page Title */}
            <div className="sheet-header">
                <h1 className="sheet-title">Background & Personality</h1>
                {(characterName || backgroundName) && (
                    <div className="sheet-subtitle">
                        {characterName && <span className="character-name">{characterName}</span>}
                        {characterName && backgroundName && <span className="separator">—</span>}
                        {backgroundName && <span className="background-name">{backgroundName}</span>}
                    </div>
                )}
            </div>

            {/* Personality Grid - 2x2 layout */}
            <div className="personality-grid">
                <PersonalityBox label="Personality Traits" content={traits} />
                <PersonalityBox label="Ideals" content={ideals} />
                <PersonalityBox label="Bonds" content={bonds} />
                <PersonalityBox label="Flaws" content={flaws} />
            </div>

            {/* Notes Section */}
            <div className="notes-section">
                <div className="phb-section notes-box">
                    <div className="notes-content">
                        <div className="notes-column">{notes}</div>
                        <div className="notes-column"></div>
                        <div className="notes-column"></div>
                    </div>
                    <div className="box-label">Notes</div>
                </div>
            </div>
        </CharacterSheetPage>
    );
};

export default BackgroundPersonalitySheet;


