/**
 * CharacterCanvas Component
 * 
 * Canvas-based character sheet display for CharacterGenerator.
 * Uses PHB-styled multi-page rendering via CharacterSheetRenderer.
 * 
 * @module PlayerCharacterGenerator/shared/CharacterCanvas
 */

import React, { useMemo } from 'react';
import '../../../styles/canvas/index.css';         // Shared canvas styles
import '../../../styles/CharacterComponents.css';  // Character-specific styles
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';

// Import the PHB-styled renderer
import { CharacterSheetRenderer, CharacterSheetContainer, CharacterSheetPage } from '../canvasComponents';

const CharacterCanvas: React.FC = () => {
    const { character } = usePlayerCharacterGenerator();

    const canvasContent = useMemo(() => {
        const dnd5e = character?.dnd5eData;
        const hasCharacter = character?.name && character.name.trim().length > 0;
        const hasAbilityScores = dnd5e?.abilityScores &&
            Object.values(dnd5e.abilityScores).some(v => v > 0);

        if (hasCharacter && hasAbilityScores && dnd5e) {
            // Full character sheet with PHB-styled multi-page renderer
            return (
                <CharacterSheetRenderer
                    character={dnd5e}
                    name={character.name}
                    level={character.level}
                />
            );
        }

        // Blank character sheet (empty state) - still uses PHB styling
        return (
            <CharacterSheetContainer>
                <CharacterSheetPage pageNumber={1} totalPages={1}>
                    <div className="block character frame wide">
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
                </CharacterSheetPage>
            </CharacterSheetContainer>
        );
    }, [character]);

    return (
        <div className="character-canvas-area" data-testid="character-canvas">
            {canvasContent}
        </div>
    );
};

export default CharacterCanvas;
