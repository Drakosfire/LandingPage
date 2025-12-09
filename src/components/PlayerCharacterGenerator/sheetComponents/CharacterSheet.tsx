/**
 * CharacterSheet Component
 * 
 * Complete PHB-styled character sheet that brings together all sections.
 * This is the main entry point for rendering a character sheet.
 * 
 * @module PlayerCharacterGenerator/sheetComponents
 */

import React from 'react';
import { CharacterSheetPage } from './CharacterSheetPage';
import { CharacterHeader } from './CharacterHeader';
import { AbilityScoresRow, AbilityScores } from './AbilityScoresRow';
import { MainContentGrid } from './MainContentGrid';
import { Column1Content } from './column1';
import { Column2Content, Attack, Currency } from './column2';
import { Column3Content, Feature } from './column3';

export interface CharacterSheetProps {
    // Header
    name: string;
    classAndLevel: string;
    race: string;
    background: string;
    playerName?: string;
    alignment?: string;
    xp?: number;
    portraitUrl?: string;

    // Ability Scores
    abilityScores: AbilityScores;

    // Proficiency
    proficiencyBonus: number;
    proficientSaves: string[];
    proficientSkills: string[];
    hasInspiration?: boolean;
    passivePerception?: number;

    // Languages & Proficiencies
    languages?: string[];
    armorProficiencies?: string[];
    weaponProficiencies?: string[];
    toolProficiencies?: string[];

    // Combat
    armorClass: number;
    initiative: number;
    speed: number;
    maxHP: number;
    currentHP?: number;
    tempHP?: number;
    hitDiceTotal: string;
    deathSaveSuccesses?: number;
    deathSaveFailures?: number;

    // Attacks & Equipment
    attacks?: Attack[];
    currency?: Currency;
    equipment?: string[];

    // Features
    features?: Feature[];

    // Edit Mode Callbacks
    /** Callback when currency changes */
    onCurrencyChange?: (currency: Currency) => void;
}

/**
 * CharacterSheet - Complete PHB-styled character sheet
 */
export const CharacterSheet: React.FC<CharacterSheetProps> = ({
    // Header
    name,
    classAndLevel,
    race,
    background,
    playerName,
    alignment,
    xp,
    portraitUrl,

    // Ability Scores
    abilityScores,

    // Proficiency
    proficiencyBonus,
    proficientSaves,
    proficientSkills,
    hasInspiration,
    passivePerception,

    // Languages & Proficiencies
    languages,
    armorProficiencies,
    weaponProficiencies,
    toolProficiencies,

    // Combat
    armorClass,
    initiative,
    speed,
    maxHP,
    currentHP,
    tempHP,
    hitDiceTotal,
    deathSaveSuccesses,
    deathSaveFailures,

    // Attacks & Equipment
    attacks,
    currency,
    equipment,

    // Features
    features,

    // Edit Mode Callbacks
    onCurrencyChange
}) => {
    return (
        <CharacterSheetPage>
            {/* Header with Portrait */}
            <CharacterHeader
                name={name}
                classAndLevel={classAndLevel}
                race={race}
                background={background}
                playerName={playerName}
                alignment={alignment}
                xp={xp}
                portraitUrl={portraitUrl}
            />

            {/* Ability Scores Row (with Combat Status + Meta Stats) */}
            <AbilityScoresRow
                scores={abilityScores}
                maxHP={maxHP}
                currentHP={currentHP}
                tempHP={tempHP}
                armorClass={armorClass}
                initiative={initiative}
                speed={speed}
                hasInspiration={hasInspiration}
                proficiencyBonus={proficiencyBonus}
                passivePerception={passivePerception}
                hitDice={hitDiceTotal}
                deathSaveSuccesses={deathSaveSuccesses}
                deathSaveFailures={deathSaveFailures}
            />

            {/* Main 3-Column Content */}
            <MainContentGrid
                column1={
                    <Column1Content
                        abilityScores={abilityScores}
                        proficiencyBonus={proficiencyBonus}
                        proficientSaves={proficientSaves}
                        proficientSkills={proficientSkills}
                        languages={languages}
                        armorProficiencies={armorProficiencies}
                        weaponProficiencies={weaponProficiencies}
                        toolProficiencies={toolProficiencies}
                    />
                }
                column2={
                    <Column2Content
                        attacks={attacks}
                        currency={currency}
                        equipment={equipment}
                        onCurrencyChange={onCurrencyChange}
                    />
                }
                column3={
                    <Column3Content
                        features={features}
                    />
                }
            />
        </CharacterSheetPage>
    );
};

export default CharacterSheet;

