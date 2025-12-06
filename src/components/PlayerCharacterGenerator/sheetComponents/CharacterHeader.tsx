/**
 * CharacterHeader Component
 * 
 * Header section with portrait and character info boxes.
 * Matches the HTML prototype structure.
 * 
 * Layout:
 * ┌─────────────────────────────────────────────────────────┐
 * │ ┌─────────┐  ┌──────────────────┬──────────────────────┐│
 * │ │         │  │ Character Name   │ Player Name          ││
 * │ │ Portrait│  ├──────────────────┴──────────────────────┤│
 * │ │         │  │ Class | Race | Background | AL | XP     ││
 * │ └─────────┘  └─────────────────────────────────────────┘│
 * └─────────────────────────────────────────────────────────┘
 * 
 * @module PlayerCharacterGenerator/sheetComponents
 */

import React from 'react';

export interface CharacterHeaderProps {
    /** Character name */
    name: string;
    /** Class and level (e.g., "Paladin 2") */
    classAndLevel: string;
    /** Race name */
    race: string;
    /** Background name */
    background: string;
    /** Player name (optional) */
    playerName?: string;
    /** Alignment (e.g., "LG", "NG") */
    alignment?: string;
    /** Experience points */
    xp?: number;
    /** Portrait image URL (optional) */
    portraitUrl?: string;
}

/**
 * LabeledBox - Reusable labeled input box pattern
 */
interface LabeledBoxProps {
    value: string | number;
    label: string;
    className?: string;
}

const LabeledBox: React.FC<LabeledBoxProps> = ({ value, label, className = '' }) => (
    <div className={`labeled-box ${className}`}>
        <div className="value">{value}</div>
        <div className="label">{label}</div>
    </div>
);

/**
 * CharacterHeader - Portrait + Info boxes
 */
export const CharacterHeader: React.FC<CharacterHeaderProps> = ({
    name,
    classAndLevel,
    race,
    background,
    playerName = '',
    alignment = '',
    xp = 0,
    portraitUrl
}) => {
    return (
        <div className="header" data-testid="character-header">
            {/* Portrait Box */}
            <div className="portrait-box">
                {portraitUrl ? (
                    <img src={portraitUrl} alt={`Portrait of ${name}`} />
                ) : (
                    <span className="portrait-placeholder">Portrait</span>
                )}
            </div>

            {/* Header Content */}
            <div className="header-content">
                {/* Character Name + Player Name + XP Row */}
                <div className="header-name-row">
                    <LabeledBox value={name || 'Unnamed'} label="Character Name" />
                    <LabeledBox value={playerName} label="Player Name" />
                    <LabeledBox value={xp} label="XP" className="narrow" />
                </div>

                {/* Info Row */}
                <div className="header-info">
                    <LabeledBox
                        value={classAndLevel}
                        label="Class & Level"
                    />
                    <LabeledBox
                        value={race}
                        label="Race"
                        className="wide"
                    />
                    <LabeledBox
                        value={background}
                        label="Background"
                        className="medium"
                    />
                    <LabeledBox
                        value={alignment}
                        label="Alignment"
                        className="narrow"
                    />
                </div>
            </div>
        </div>
    );
};

export default CharacterHeader;

