/**
 * CharacterHeader Component
 * 
 * Displays character name and subtitle (Level X Race Class (Subclass))
 * Following StatblockGenerator's IdentityHeader pattern.
 * 
 * Phase 1: Display-only (no edit mode)
 * Phase 2+: Add edit mode support
 * 
 * @module PlayerCharacterGenerator/canvasComponents/CharacterHeader
 */

import React from 'react';
import type { DnD5eCharacter } from '../types/dnd5e/character.types';

export interface CharacterHeaderProps {
    /** Character name to display */
    name: string;
    /** Character level */
    level: number;
    /** D&D 5e character data (optional - for extracting race/class) */
    dnd5eData?: DnD5eCharacter;
    /** Optional portrait URL */
    portraitUrl?: string;
    /** Whether edit mode is enabled (Phase 2+) */
    isEditMode?: boolean;
    /** Callback when name changes (Phase 2+) */
    onNameChange?: (name: string) => void;
}

/**
 * Build the subtitle string: "Level X Race Class (Subclass)"
 */
function buildSubtitle(level: number, dnd5eData?: DnD5eCharacter): string {
    const parts: string[] = [`Level ${level}`];

    // Add race
    if (dnd5eData?.race?.name) {
        parts.push(dnd5eData.race.name);
    }

    // Add class(es) with subclass
    if (dnd5eData?.classes && dnd5eData.classes.length > 0) {
        const classStrings = dnd5eData.classes
            .filter(cls => cls?.name)
            .map(cls => {
                const subclass = cls.subclass ? ` (${cls.subclass})` : '';
                return `${cls.name}${subclass}`;
            });

        if (classStrings.length > 0) {
            parts.push(classStrings.join(' / '));
        }
    }

    return parts.join(' ');
}

/**
 * CharacterHeader - Name and subtitle display
 * 
 * Layout:
 * ┌─────────────────────────────────────┐
 * │  Character Name                     │
 * │  Level 1 Human Fighter              │
 * └─────────────────────────────────────┘
 */
const CharacterHeader: React.FC<CharacterHeaderProps> = ({
    name,
    level,
    dnd5eData,
    portraitUrl,
    isEditMode = false,
    onNameChange
}) => {
    const subtitle = buildSubtitle(level, dnd5eData);
    const displayName = name?.trim() || 'Unnamed Character';

    return (
        <div
            className="dm-identity-header character-header"
            data-testid="character-header"
            data-tutorial="character-name"
        >
            {/* Portrait placeholder (Phase 6) */}
            {portraitUrl && (
                <div
                    className="character-portrait"
                    style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid #58180d',
                        marginRight: '1rem',
                        float: 'left'
                    }}
                >
                    <img
                        src={portraitUrl}
                        alt={`${displayName} portrait`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            )}

            {/* Character Name */}
            <h2
                className="dm-monster-name character-name"
                style={{
                    fontFamily: 'BookInsanityRemake, serif',
                    fontSize: '1.8rem',
                    color: '#58180d',
                    margin: '0 0 0.25rem',
                    letterSpacing: '0.02em'
                }}
            >
                {displayName}
            </h2>

            {/* Subtitle: Level X Race Class (Subclass) */}
            <p
                className="dm-monster-meta character-subtitle"
                style={{
                    fontFamily: 'ScalySansRemake, "Open Sans", sans-serif',
                    fontStyle: 'italic',
                    fontSize: '1rem',
                    color: 'rgba(43, 29, 15, 0.85)',
                    margin: 0
                }}
            >
                {subtitle}
            </p>

            {/* Clear float */}
            {portraitUrl && <div style={{ clear: 'both' }} />}
        </div>
    );
};

export default CharacterHeader;

