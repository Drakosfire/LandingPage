/**
 * CharacterSheet Component
 * 
 * Complete PHB-styled character sheet that brings together all sections.
 * This is the main entry point for rendering a character sheet.
 * 
 * **Unified Equipment Model:**
 * - Uses single `equippedItems: InventoryItem[]` as source of truth
 * - Attacks derived from equipped weapons
 * - Equipment section shows all equipped items
 * 
 * @module PlayerCharacterGenerator/sheetComponents
 */

import React from 'react';
import { CharacterSheetPage } from './CharacterSheetPage';
import { CharacterHeader } from './CharacterHeader';
import { AbilityScoresRow, AbilityScores } from './AbilityScoresRow';
import { MainContentGrid } from './MainContentGrid';
import { Column1Content } from './column1';
import { Column2Content, Currency, CharacterCombatStats } from './column2';
import { Column3Content, Feature } from './column3';
import type { InventoryItem } from './inventory/InventoryBlock';

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

    // Equipment (Unified Model)
    /** All equipped items (source of truth) - attacks derived from equipped weapons */
    equippedItems?: InventoryItem[];
    /** Currency */
    currency?: Currency;
    /** Character combat stats for attack bonus calculations */
    characterStats?: CharacterCombatStats;

    // Features
    features?: Feature[];

    // Edit Mode Callbacks
    /** Callback when currency changes */
    onCurrencyChange?: (currency: Currency) => void;
    /** Callback when item is clicked for editing */
    onItemEdit?: (item: InventoryItem) => void;
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

    // Equipment (Unified Model)
    equippedItems,
    currency,
    characterStats,

    // Features
    features,

    // Edit Mode Callbacks
    onCurrencyChange,
    onItemEdit
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
                        equippedItems={equippedItems}
                        currency={currency}
                        characterStats={characterStats}
                        onCurrencyChange={onCurrencyChange}
                        onItemEdit={onItemEdit}
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

