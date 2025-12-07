/**
 * Sheet Components - PHB-Style Character Sheet
 * 
 * React components built from HTML prototypes.
 * See: specs/PlayerCharacterGenerator/prototypes/character-sheet.html
 * 
 * @module PlayerCharacterGenerator/sheetComponents
 */

// Main CharacterSheet (complete, ready-to-use)
export { CharacterSheet } from './CharacterSheet';
export type { CharacterSheetProps } from './CharacterSheet';

// Page structure
export { CharacterSheetPage, CharacterSheetContainer } from './CharacterSheetPage';
export type { CharacterSheetPageProps, CharacterSheetContainerProps } from './CharacterSheetPage';

// Header section
export { CharacterHeader } from './CharacterHeader';
export type { CharacterHeaderProps } from './CharacterHeader';

// Ability scores row
export { AbilityScoresRow } from './AbilityScoresRow';
export type { AbilityScoresRowProps, AbilityScores } from './AbilityScoresRow';

// Main content grid (3 columns)
export { MainContentGrid } from './MainContentGrid';
export type { MainContentGridProps } from './MainContentGrid';

// Column 1 components
export { SavingThrowsSection, SkillsSection, Column1Content } from './column1';
export type { SavingThrowsSectionProps, SkillsSectionProps, Column1ContentProps } from './column1';

// Column 2 components
export { CombatStatusSection, CombatStatsRow, HPSection, Column2Content } from './column2';
export type { CombatStatusSectionProps, CombatStatsRowProps, HPSectionProps, Column2ContentProps, Currency, Attack } from './column2';

// Column 3 components
export { PersonalitySection, FeaturesSection, Column3Content } from './column3';
export type { PersonalitySectionProps, FeaturesSectionProps, Feature, Column3ContentProps } from './column3';

// Footer Bar
export { FooterBar } from './FooterBar';
export type { FooterBarProps } from './FooterBar';

// Additional pages
export { BackgroundPersonalitySheet } from './BackgroundPersonalitySheet';
export type { BackgroundPersonalitySheetProps } from './BackgroundPersonalitySheet';
