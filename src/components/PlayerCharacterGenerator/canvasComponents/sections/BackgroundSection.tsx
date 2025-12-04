/**
 * BackgroundSection Component
 * 
 * Personality traits, ideals, bonds, flaws, and backstory.
 * 
 * @module PlayerCharacterGenerator/canvasComponents/sections/BackgroundSection
 */

import React from 'react';
import type { DnD5eBackground } from '../../types/dnd5e/background.types';

export interface BackgroundSectionProps {
    /** Background data */
    background?: DnD5eBackground;
    /** Personality traits */
    personalityTraits?: string[];
    /** Ideals */
    ideals?: string;
    /** Bonds */
    bonds?: string;
    /** Flaws */
    flaws?: string;
    /** Additional backstory */
    backstory?: string;
}

/**
 * BackgroundSection - Personality & backstory
 */
export const BackgroundSection: React.FC<BackgroundSectionProps> = ({
    background,
    personalityTraits = [],
    ideals,
    bonds,
    flaws,
    backstory
}) => {
    const hasPersonality = personalityTraits.length > 0 || ideals || bonds || flaws;

    return (
        <div className="block character frame" id="background">
            <h4>Background & Personality</h4>

            {/* Background name */}
            {background && (
                <div className="personality-trait">
                    <span className="personality-label">Background: </span>
                    <span className="personality-text">{background.name}</span>
                </div>
            )}

            {/* Personality Traits */}
            {personalityTraits.length > 0 && (
                <div className="personality-trait">
                    <span className="personality-label">Personality Traits: </span>
                    <span className="personality-text">
                        {personalityTraits.join(' ')}
                    </span>
                </div>
            )}

            {/* Ideals */}
            {ideals && (
                <div className="personality-trait">
                    <span className="personality-label">Ideals: </span>
                    <span className="personality-text">{ideals}</span>
                </div>
            )}

            {/* Bonds */}
            {bonds && (
                <div className="personality-trait">
                    <span className="personality-label">Bonds: </span>
                    <span className="personality-text">{bonds}</span>
                </div>
            )}

            {/* Flaws */}
            {flaws && (
                <div className="personality-trait">
                    <span className="personality-label">Flaws: </span>
                    <span className="personality-text">{flaws}</span>
                </div>
            )}

            {/* Backstory */}
            {backstory && (
                <div className="personality-trait">
                    <span className="personality-label">Backstory: </span>
                    <span className="personality-text">{backstory}</span>
                </div>
            )}

            {!background && !hasPersonality && !backstory && (
                <p style={{ fontStyle: 'italic', color: '#666' }}>No background selected</p>
            )}
        </div>
    );
};

export default BackgroundSection;

