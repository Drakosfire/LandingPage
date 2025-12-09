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

import React, { useRef } from 'react';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';
import { EditableText, EditableTextRef } from './EditableText';
import type { Alignment } from '../types/system.types';

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
 * Supports inline editing for quick fields
 */
interface LabeledBoxProps {
    value: string | number;
    label: string;
    className?: string;
    /** Edit mode: 'quick' for inline edit, 'complex' for drawer, undefined for read-only */
    editable?: 'quick' | 'complex';
    /** Click handler for complex editable fields */
    onClick?: () => void;
    /** Change handler for quick editable fields */
    onChange?: (value: string | number) => void;
    /** Input type for quick edit (default: 'text') */
    inputType?: 'text' | 'number';
    /** Placeholder for empty values */
    placeholder?: string;
}

const LabeledBox: React.FC<LabeledBoxProps> = ({ 
    value, 
    label, 
    className = '',
    editable,
    onClick,
    onChange,
    inputType = 'text',
    placeholder = ''
}) => {
    const editableTextRef = useRef<EditableTextRef>(null);
    
    const handleContainerClick = () => {
        if (editable === 'complex') {
            onClick?.();
        } else if (editable === 'quick') {
            // Forward click to EditableText to start editing
            editableTextRef.current?.startEditing();
        }
    };
    
    return (
        <div 
            className={`labeled-box ${className}`}
            data-editable={editable}
            onClick={handleContainerClick}
            role={editable ? 'button' : undefined}
            tabIndex={editable ? 0 : undefined}
        >
            <div className="value">
                {editable === 'quick' && onChange ? (
                    <EditableText
                        ref={editableTextRef}
                        value={value}
                        onChange={onChange}
                        type={inputType}
                        placeholder={placeholder}
                    />
                ) : (
                    value
                )}
            </div>
            <div className="label">{label}</div>
        </div>
    );
};

/**
 * Wizard step constants for navigation
 */
const WIZARD_STEPS = {
    ABILITIES: 0,
    RACE: 1,
    CLASS: 2,
    SPELLS: 3,
    BACKGROUND: 4,
    EQUIPMENT: 5,
    REVIEW: 6
} as const;

/**
 * CharacterHeader - Portrait + Info boxes
 * 
 * In Edit Mode:
 * - Character Name: quick edit (inline)
 * - Player Name: quick edit (inline)
 * - XP: quick edit (inline)
 * - Class, Race, Background: complex edit (opens drawer to relevant step)
 * - Alignment: quick edit (inline)
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
    const { isEditMode, openDrawerToStep, updateCharacter, updateDnD5eData } = usePlayerCharacterGenerator();

    // Click handlers for complex fields (only active in edit mode)
    const handleClassClick = () => {
        if (isEditMode) {
            console.log('🔗 [CharacterHeader] Opening Class step');
            openDrawerToStep(WIZARD_STEPS.CLASS);
        }
    };

    const handleRaceClick = () => {
        if (isEditMode) {
            console.log('🔗 [CharacterHeader] Opening Race step');
            openDrawerToStep(WIZARD_STEPS.RACE);
        }
    };

    const handleBackgroundClick = () => {
        if (isEditMode) {
            console.log('🔗 [CharacterHeader] Opening Background step');
            openDrawerToStep(WIZARD_STEPS.BACKGROUND);
        }
    };

    // Change handlers for quick edit fields
    const handleNameChange = (value: string | number) => {
        console.log('✏️ [CharacterHeader] Name changed:', value);
        updateCharacter({ name: String(value) });
    };

    const handlePlayerNameChange = (value: string | number) => {
        console.log('✏️ [CharacterHeader] Player name changed:', value);
        updateCharacter({ playerName: String(value) });
    };

    const handleXPChange = (value: string | number) => {
        console.log('✏️ [CharacterHeader] XP changed:', value);
        updateCharacter({ xp: typeof value === 'number' ? value : parseInt(String(value)) || 0 });
    };

    const handleAlignmentChange = (value: string | number) => {
        console.log('✏️ [CharacterHeader] Alignment changed:', value);
        // Cast to Alignment type - user enters short form, we store full form
        const alignmentMap: Record<string, Alignment> = {
            'LG': 'lawful good', 'NG': 'neutral good', 'CG': 'chaotic good',
            'LN': 'lawful neutral', 'N': 'true neutral', 'TN': 'true neutral', 'CN': 'chaotic neutral',
            'LE': 'lawful evil', 'NE': 'neutral evil', 'CE': 'chaotic evil',
            // Also accept full names
            'lawful good': 'lawful good', 'neutral good': 'neutral good', 'chaotic good': 'chaotic good',
            'lawful neutral': 'lawful neutral', 'true neutral': 'true neutral', 'chaotic neutral': 'chaotic neutral',
            'lawful evil': 'lawful evil', 'neutral evil': 'neutral evil', 'chaotic evil': 'chaotic evil'
        };
        const alignmentValue = alignmentMap[String(value).toUpperCase()] || alignmentMap[String(value).toLowerCase()];
        if (alignmentValue) {
            updateDnD5eData({ alignment: alignmentValue });
        }
    };

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
                        value={name || ''} 
                        label="Character Name" 
                        editable="quick"
                        onChange={handleNameChange}
                        placeholder="Enter name"
                    />
                    <LabeledBox 
                        value={playerName} 
                        label="Player Name" 
                        editable="quick"
                        onChange={handlePlayerNameChange}
                        placeholder="Player"
                    />
                    <LabeledBox 
                        value={xp} 
                        label="XP" 
                        className="narrow" 
                        editable="quick"
                        onChange={handleXPChange}
                        inputType="number"
                        placeholder="0"
                    />
                </div>

                {/* Info Row */}
                <div className="header-info">
                    <LabeledBox
                        value={classAndLevel}
                        label="Class & Level"
                        editable="complex"
                        onClick={handleClassClick}
                    />
                    <LabeledBox
                        value={race}
                        label="Race"
                        className="wide"
                        editable="complex"
                        onClick={handleRaceClick}
                    />
                    <LabeledBox
                        value={background}
                        label="Background"
                        className="medium"
                        editable="complex"
                        onClick={handleBackgroundClick}
                    />
                    <LabeledBox
                        value={alignment}
                        label="Alignment"
                        className="narrow"
                        editable="quick"
                        onChange={handleAlignmentChange}
                        placeholder="N"
                    />
                </div>
            </div>
        </div>
    );
};

export default CharacterHeader;

