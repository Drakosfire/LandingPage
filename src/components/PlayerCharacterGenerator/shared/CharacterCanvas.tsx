/**
 * CharacterCanvas Component
 * 
 * Canvas-based character sheet display for CharacterGenerator.
 * Uses D&D 5e PHB parchment styling with two-column layout.
 * 
 * Phase 1: Parchment background with ability scores display
 * Phase 2+: Full character sheet with dungeonmind-canvas integration
 */

import React, { useMemo } from 'react';
import '../../../styles/canvas/index.css';         // Shared canvas styles
import '../../../styles/CharacterComponents.css';  // Character-specific styles
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';

// Helper to calculate ability modifier
const abilityModifier = (score: number): string => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

const CharacterCanvas: React.FC = () => {
    const { character } = usePlayerCharacterGenerator();

    const canvasContent = useMemo(() => {
        const hasCharacter = character?.name && character.name.trim().length > 0;
        const abilities = character?.dnd5eData?.abilityScores;
        const classLabel = character?.dnd5eData?.classes?.length
            ? character.dnd5eData.classes
                .filter(cls => Boolean(cls?.name))
                .map(cls => {
                    const name = cls.name;
                    const subclass = cls.subclass ? ` (${cls.subclass})` : '';
                    return `${name}${subclass}`;
                })
                .join(' / ')
            : undefined;

        if (hasCharacter && abilities) {
            // Character sheet with data
            return (
                <div className="dm-canvas-responsive">
                    <div className="dm-canvas-renderer">
                        <div className="dm-canvas-pages">
                            <div
                                className="page phb"
                                style={{
                                    backgroundColor: '#EEE5CE', // Parchment
                                    padding: '1.4cm 1.9cm 1.7cm',
                                    minHeight: '279.4mm',
                                    fontFamily: 'ScalySansRemake, "Open Sans", sans-serif',
                                    fontSize: '13.5px',
                                    color: '#2b1d0f'
                                }}
                                data-testid="character-sheet-page"
                            >
                                <div className="columnWrapper">
                                    <div className="monster frame wide">
                                        <div className="canvas-column">
                                            <div className="canvas-entry">
                                                <div className="dm-identity-header" style={{ marginBottom: '1rem' }}>
                                                    <h2 className="dm-monster-name" contentEditable="false">
                                                        {character.name || 'New Character'}
                                                    </h2>
                                                    <p className="dm-monster-meta" contentEditable="false">
                                                        Level {character.level || 1} {character.dnd5eData?.race?.name || 'Character'}
                                                        {classLabel && ` ${classLabel}`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="canvas-entry">
                                                <hr
                                                    style={{
                                                        border: 'none',
                                                        borderTop: '2px solid #a11d18',
                                                        margin: '0.5rem 0 1rem'
                                                    }}
                                                />
                                            </div>


                                            <div className="canvas-entry">
                                                <div className="dm-ability-table" style={{ marginBottom: '1rem' }}>
                                                    <table
                                                        style={{
                                                            width: '100%',
                                                            borderCollapse: 'collapse',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        <thead>
                                                            <tr>
                                                                {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((label) => (
                                                                    <th
                                                                        key={label}
                                                                        style={{
                                                                            padding: '0.4rem 0',
                                                                            background:
                                                                                'linear-gradient(180deg, rgba(143, 36, 28, 0.9) 0%, rgba(90, 22, 18, 0.9) 100%)',
                                                                            color: '#fdf6ea',
                                                                            fontWeight: 700
                                                                        }}
                                                                    >
                                                                        {label}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                {[
                                                                    { key: 'strength', score: abilities.strength },
                                                                    { key: 'dexterity', score: abilities.dexterity },
                                                                    { key: 'constitution', score: abilities.constitution },
                                                                    { key: 'intelligence', score: abilities.intelligence },
                                                                    { key: 'wisdom', score: abilities.wisdom },
                                                                    { key: 'charisma', score: abilities.charisma }
                                                                ].map(({ key, score }) => (
                                                                    <td
                                                                        key={key}
                                                                        style={{
                                                                            padding: '0.5rem 0',
                                                                            background: 'rgba(247, 235, 215, 0.85)'
                                                                        }}
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                display: 'flex',
                                                                                flexDirection: 'column',
                                                                                alignItems: 'center',
                                                                                gap: '0.2rem'
                                                                            }}
                                                                        >
                                                                            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{score}</span>
                                                                            <span
                                                                                style={{
                                                                                    fontSize: '0.85rem',
                                                                                    fontWeight: 600,
                                                                                    color: '#58180d'
                                                                                }}
                                                                            >
                                                                                ({abilityModifier(score)})
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            <div className="canvas-entry">
                                                <hr
                                                    style={{
                                                        border: 'none',
                                                        borderTop: '2px solid #a11d18',
                                                        margin: '0.5rem 0 1rem'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="canvas-column">
                                            <div className="canvas-entry">
                                                <div className="dm-stat-summary" style={{ marginBottom: '1rem' }}>
                                                    <h3
                                                        style={{
                                                            fontFamily: 'BookInsanityRemake, serif',
                                                            color: '#a11d18',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em',
                                                            margin: '0 0 0.6rem',
                                                            fontSize: '1.1rem'
                                                        }}
                                                    >
                                                        Character Statistics
                                                    </h3>
                                                    <p
                                                        style={{
                                                            margin: '0.5rem 0',
                                                            fontStyle: 'italic',
                                                            color: 'rgba(43, 29, 15, 0.7)'
                                                        }}
                                                    >
                                                        Phase 1: Basic character sheet display
                                                        <br />
                                                        Phase 2 will add: Skills, Proficiencies, Features, Equipment, Spells
                                                    </p>
                                                </div>
                                            </div>


                                            {character.dnd5eData?.race && (
                                                <div className="canvas-entry">
                                                    <div className="dm-trait-section" style={{ marginBottom: '1rem' }}>
                                                        <h3
                                                            style={{
                                                                fontFamily: 'BookInsanityRemake, serif',
                                                                color: '#a11d18',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.05em',
                                                                margin: '0 0 0.6rem',
                                                                fontSize: '1.1rem'
                                                            }}
                                                        >
                                                            Racial Traits
                                                        </h3>
                                                        <dl style={{ margin: 0 }}>
                                                            <dt
                                                                style={{
                                                                    fontFamily: 'BookInsanityRemake, serif',
                                                                    fontSize: '1.05rem',
                                                                    color: '#58180d',
                                                                    fontWeight: 700,
                                                                    margin: '0 0 0.25rem'
                                                                }}
                                                            >
                                                                {character.dnd5eData.race.name}
                                                            </dt>
                                                            <dd
                                                                style={{
                                                                    margin: '0 0 0.5rem',
                                                                    lineHeight: 1.35
                                                                }}
                                                            >
                                                                {character.dnd5eData.race.description || 'Racial traits coming in Phase 2'}
                                                            </dd>
                                                        </dl>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Blank character sheet (empty state)
        return (
            <div className="dm-canvas-responsive">
                <div className="dm-canvas-renderer">
                    <div className="dm-canvas-pages">
                        <div
                            className="page phb"
                            style={{
                                backgroundColor: '#EEE5CE', // Parchment
                                padding: '1.4cm 1.9cm 1.7cm',
                                minHeight: '279.4mm',
                                fontFamily: 'ScalySansRemake, "Open Sans", sans-serif',
                                fontSize: '13.5px',
                                color: '#2b1d0f'
                            }}
                            data-testid="character-sheet-blank"
                        >
                            <div className="columnWrapper">
                                <div className="monster frame wide">
                                    <div className="canvas-column">
                                        <div className="canvas-entry">
                                            <div
                                                style={{
                                                    textAlign: 'center',
                                                    maxWidth: '500px',
                                                    padding: '2rem',
                                                    margin: '0 auto'
                                                }}
                                            >
                                                <h2
                                                    style={{
                                                        fontFamily: 'BookInsanityRemake, serif',
                                                        fontSize: '2.2rem',
                                                        color: '#58180d',
                                                        margin: '0 0 1rem',
                                                        letterSpacing: '0.02em'
                                                    }}
                                                >
                                                    📜 Character Sheet
                                                </h2>
                                                <p
                                                    style={{
                                                        fontFamily: 'ScalySansRemake, "Open Sans", sans-serif',
                                                        fontSize: '1.1rem',
                                                        color: 'rgba(43, 29, 15, 0.8)',
                                                        lineHeight: 1.5,
                                                        margin: 0
                                                    }}
                                                >
                                                    Create a new character to see the character sheet preview.
                                                    <br />
                                                    <br />
                                                    Click <strong style={{ color: '#a11d18' }}>&quot;Generate&quot;</strong> to start building your character.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }, [character]);

    return (
        <div className="character-canvas-area" data-testid="character-canvas">
            {canvasContent}
        </div>
    );
};

export default CharacterCanvas;
