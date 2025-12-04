/**
 * CharacterSheetRenderer Component
 * 
 * Multi-page PHB-styled character sheet renderer.
 * Uses section components with CSS classes from CharacterComponents.css.
 * 
 * Page Layout:
 * - Page 1: Core Stats (Abilities, Saves, Skills, Combat)
 * - Page 2: Features & Equipment
 * - Page 3: Spellcasting (if applicable)
 * 
 * @module PlayerCharacterGenerator/canvasComponents/CharacterSheetRenderer
 */

import React from 'react';
import type { DnD5eCharacter } from '../types/dnd5e/character.types';
import type { AbilityName } from '../engine/RuleEngine.types';

// Page structure components
import {
    CharacterSheetContainer,
    CharacterSheetPage,
} from './CharacterSheetPage';

// Section components (PHB-styled)
import {
    AbilityScoresSection,
    SavesSkillsSection,
    CombatStatsSection,
    AttacksSection,
    FeaturesSection,
    EquipmentSection,
    ProficienciesSection,
    BackgroundSection,
    SpellcastingSection,
} from './sections';

export interface CharacterSheetRendererProps {
    /** Character data */
    character: DnD5eCharacter;
    /** Character name */
    name: string;
    /** Character level */
    level: number;
    /** Show spellcasting page even if no spells */
    forceSpellPage?: boolean;
}

/**
 * CharacterSheetRenderer - Multi-page PHB-styled character sheet
 */
export const CharacterSheetRenderer: React.FC<CharacterSheetRendererProps> = ({
    character,
    name,
    level,
    forceSpellPage = false,
}) => {
    const hasSpellcasting = character.spellcasting || forceSpellPage;
    const totalPages = hasSpellcasting ? 3 : 2;

    // Extract data for convenience
    const {
        abilityScores,
        proficiencies,
        derivedStats,
        classes = [],
        race,
        background,
        features = [],
        weapons = [],
        armor,
        equipment = [],
        spellcasting,
        currency,
    } = character;

    // Calculate hit dice from class levels
    const hitDice = classes.length > 0
        ? classes.map(c => `${c.level}d${c.hitDie || 10}`).join(' + ')
        : '1d10';

    // Determine weapons from equipment
    const weaponsList = weapons.length > 0 ? weapons : [];

    return (
        <CharacterSheetContainer>
            {/* ===== PAGE 1: Core Stats ===== */}
            <CharacterSheetPage pageNumber={1} totalPages={totalPages}>
                {/* Character Name Header */}
                <div className="character-name-header wide">
                    <h1>{name || 'Unnamed Character'}</h1>
                    <p className="character-subtitle">
                        Level {level} {race?.name || ''} {classes[0]?.name || ''}
                    </p>
                </div>

                {/* Ability Scores (6-box grid) */}
                <AbilityScoresSection abilityScores={abilityScores} />

                {/* Saves & Skills */}
                <SavesSkillsSection
                    abilityScores={abilityScores}
                    proficiencyBonus={derivedStats?.proficiencyBonus ?? 2}
                    proficientSaves={(proficiencies?.savingThrows || []) as AbilityName[]}
                    proficientSkills={proficiencies?.skills || []}
                />

                {/* Combat Stats */}
                <CombatStatsSection
                    armorClass={derivedStats?.armorClass ?? 10}
                    initiative={derivedStats?.initiative ?? 0}
                    speed={derivedStats?.speed || { walk: 30 }}
                    currentHP={derivedStats?.currentHp ?? derivedStats?.maxHp ?? 1}
                    maxHP={derivedStats?.maxHp ?? 1}
                    tempHP={derivedStats?.tempHp}
                    hitDice={hitDice}
                    proficiencyBonus={derivedStats?.proficiencyBonus ?? 2}
                />

                {/* Attacks */}
                {weaponsList.length > 0 && (
                    <AttacksSection
                        weapons={weaponsList}
                        abilityScores={abilityScores}
                        proficiencyBonus={derivedStats?.proficiencyBonus ?? 2}
                        weaponProficiencies={proficiencies?.weapons || []}
                    />
                )}
            </CharacterSheetPage>

            {/* ===== PAGE 2: Features & Equipment ===== */}
            <CharacterSheetPage pageNumber={2} totalPages={totalPages}>
                {/* Proficiencies & Languages */}
                <ProficienciesSection
                    languages={proficiencies?.languages || ['Common']}
                    armorProficiencies={proficiencies?.armor || []}
                    weaponProficiencies={proficiencies?.weapons || []}
                    toolProficiencies={proficiencies?.tools || []}
                />

                {/* Features & Traits */}
                <FeaturesSection features={features} />

                {/* Equipment */}
                <EquipmentSection
                    equipment={equipment}
                    weapons={weaponsList}
                    armor={armor ? [armor] : undefined}
                    gold={currency?.gp}
                />

                {/* Background & Personality */}
                <BackgroundSection
                    background={background}
                    personalityTraits={character.personality?.traits}
                    ideals={character.personality?.ideals?.join(' ')}
                    bonds={character.personality?.bonds?.join(' ')}
                    flaws={character.personality?.flaws?.join(' ')}
                />
            </CharacterSheetPage>

            {/* ===== PAGE 3: Spellcasting (if applicable) ===== */}
            {hasSpellcasting && spellcasting && (
                <CharacterSheetPage pageNumber={3} totalPages={totalPages}>
                    <SpellcastingSection
                        spellcasting={spellcasting}
                        spellcastingAbility={spellcasting.ability}
                        spellSaveDC={spellcasting.spellSaveDC}
                        spellAttackBonus={spellcasting.spellAttackBonus}
                        spells={spellcasting.spellsKnown}
                        cantrips={spellcasting.cantrips}
                    />
                </CharacterSheetPage>
            )}
        </CharacterSheetContainer>
    );
};

export default CharacterSheetRenderer;

