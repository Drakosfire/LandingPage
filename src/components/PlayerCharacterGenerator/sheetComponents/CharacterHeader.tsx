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
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';

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
    /** Edit mode: 'quick' for inline edit, 'complex' for drawer, undefined for read-only */
    editable?: 'quick' | 'complex';
    /** Click handler for complex editable fields */
    onClick?: () => void;
}

const LabeledBox: React.FC<LabeledBoxProps> = ({ 
    value, 
    label, 
    className = '',
    editable,
    onClick
}) => (
    <div 
        className={`labeled-box ${className}`}
        data-editable={editable}
        onClick={editable === 'complex' ? onClick : undefined}
        role={editable === 'complex' ? 'button' : undefined}
        tabIndex={editable === 'complex' ? 0 : undefined}
    >
        <div className="value">{value}</div>
        <div className="label">{label}</div>
    </div>
);

/**
 * CharacterHeader - Portrait + Info boxes
 * 
 * In Edit Mode:
 * - Character Name: quick edit (inline)
 * - Player Name: quick edit (inline)
 * - XP: quick edit (inline)
 * - Class, Race, Background, Alignment: complex edit (opens drawer)
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
                    <LabeledBox 
                        value={name || 'Unnamed'} 
                        label="Character Name" 
                        editable="quick"
                    />
                    <LabeledBox 
                        value={playerName} 
                        label="Player Name" 
                        editable="quick"
                    />
                    <LabeledBox 
                        value={xp} 
                        label="XP" 
                        className="narrow" 
                        editable="quick"
                    />
                </div>

                {/* Info Row */}
                <div className="header-info">
                    <LabeledBox
                        value={classAndLevel}
                        label="Class & Level"
                        editable="complex"
                    />
                    <LabeledBox
                        value={race}
                        label="Race"
                        className="wide"
                        editable="complex"
                    />
                    <LabeledBox
                        value={background}
                        label="Background"
                        className="medium"
                        editable="complex"
                    />
                    <LabeledBox
                        value={alignment}
                        label="Alignment"
                        className="narrow"
                        editable="quick"
                    />
                </div>
            </div>
        </div>
    );
};

export default CharacterHeader;

