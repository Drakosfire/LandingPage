/**
 * CharacterCanvas Component
 * 
 * Canvas-based character sheet display for CharacterGenerator.
 * Uses D&D 5e PHB parchment styling with two-column layout.
 * 
 * Refactored to use modular canvas components from componentRegistry.
 * 
 * @module PlayerCharacterGenerator/shared/CharacterCanvas
 */

import React, { useMemo } from 'react';
import '../../../styles/canvas/index.css';         // Shared canvas styles
import '../../../styles/CharacterComponents.css';  // Character-specific styles
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';

// Import modular canvas components
import {
    CharacterHeader,
    AbilityScoresBlock,
    CombatStatsBlock,
    SavingThrowsBlock,
    SkillsBlock,
    FeaturesBlock,
    EquipmentBlock,
    SpellcastingBlock
} from '../canvasComponents';

/**
 * Horizontal divider component
 */
const SectionDivider: React.FC = () => (
    <hr
        style={{
            border: 'none',
            borderTop: '2px solid #a11d18',
            margin: '0.75rem 0'
        }}
    />
);

/**
 * Canvas entry wrapper for consistent spacing
 */
const CanvasEntry: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="canvas-entry" style={{ marginBottom: '0.75rem' }}>
        {children}
    </div>
);

const CharacterCanvas: React.FC = () => {
    const { character } = usePlayerCharacterGenerator();

    const canvasContent = useMemo(() => {
        const dnd5e = character?.dnd5eData;
        const hasCharacter = character?.name && character.name.trim().length > 0;
        const hasAbilityScores = dnd5e?.abilityScores && 
            Object.values(dnd5e.abilityScores).some(v => v > 0);

        if (hasCharacter && hasAbilityScores && dnd5e) {
            // Full character sheet with modular components
            return (
                <div className="dm-canvas-responsive">
                    <div className="dm-canvas-renderer">
                        <div className="dm-canvas-pages">
                            <div
                                className="page phb"
                                style={{
                                    backgroundColor: '#EEE5CE',
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
                                        {/* ===== LEFT COLUMN ===== */}
                                        <div className="canvas-column">
                                            {/* Character Header */}
                                            <CanvasEntry>
                                                <CharacterHeader
                                                    name={character.name}
                                                    level={character.level}
                                                    dnd5eData={dnd5e}
                                                    portraitUrl={character.portrait}
                                                />
                                            </CanvasEntry>

                                            <SectionDivider />

                                            {/* Ability Scores */}
                                            <CanvasEntry>
                                                <AbilityScoresBlock
                                                    abilityScores={dnd5e.abilityScores}
                                                />
                                            </CanvasEntry>

                                            <SectionDivider />

                                            {/* Combat Stats */}
                                            {dnd5e.derivedStats && (
                                                <CanvasEntry>
                                                    <CombatStatsBlock
                                                        derivedStats={dnd5e.derivedStats}
                                                    />
                                                </CanvasEntry>
                                            )}

                                            {/* Saving Throws */}
                                            {dnd5e.proficiencies?.savingThrows && (
                                                <CanvasEntry>
                                                    <SavingThrowsBlock
                                                        abilityScores={dnd5e.abilityScores}
                                                        proficientSaves={dnd5e.proficiencies.savingThrows}
                                                        proficiencyBonus={dnd5e.derivedStats?.proficiencyBonus ?? 2}
                                                    />
                                                </CanvasEntry>
                                            )}

                                            {/* Skills */}
                                            {dnd5e.proficiencies?.skills && (
                                                <CanvasEntry>
                                                    <SkillsBlock
                                                        abilityScores={dnd5e.abilityScores}
                                                        proficientSkills={dnd5e.proficiencies.skills}
                                                        proficiencyBonus={dnd5e.derivedStats?.proficiencyBonus ?? 2}
                                                    />
                                                </CanvasEntry>
                                            )}
                                        </div>

                                        {/* ===== RIGHT COLUMN ===== */}
                                        <div className="canvas-column">
                                            {/* Features & Traits */}
                                            {(dnd5e.features?.length > 0 || dnd5e.classes?.length > 0) && (
                                                <CanvasEntry>
                                                    <FeaturesBlock
                                                        features={dnd5e.features || []}
                                                        classLevels={dnd5e.classes}
                                                        defaultCollapsed={true}
                                                    />
                                                </CanvasEntry>
                                            )}

                                            <SectionDivider />

                                            {/* Equipment */}
                                            {(dnd5e.weapons?.length > 0 || dnd5e.equipment?.length > 0 || dnd5e.armor) && (
                                                <CanvasEntry>
                                                    <EquipmentBlock
                                                        weapons={dnd5e.weapons || []}
                                                        armor={dnd5e.armor}
                                                        shield={dnd5e.shield}
                                                        equipment={dnd5e.equipment || []}
                                                        abilityScores={dnd5e.abilityScores}
                                                        proficiencyBonus={dnd5e.derivedStats?.proficiencyBonus ?? 2}
                                                        currency={dnd5e.currency}
                                                    />
                                                </CanvasEntry>
                                            )}

                                            {/* Spellcasting (only for casters) */}
                                            {dnd5e.spellcasting && (
                                                <>
                                                    <SectionDivider />
                                                    <CanvasEntry>
                                                        <SpellcastingBlock
                                                            spellcasting={dnd5e.spellcasting}
                                                            spellSaveDC={dnd5e.derivedStats?.spellSaveDC ?? dnd5e.spellcasting.spellSaveDC}
                                                            spellAttackBonus={dnd5e.derivedStats?.spellAttackBonus ?? dnd5e.spellcasting.spellAttackBonus}
                                                        />
                                                    </CanvasEntry>
                                                </>
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
                                backgroundColor: '#EEE5CE',
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
