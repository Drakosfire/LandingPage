/**
 * Canvas Components - PCG Character Sheet Display
 * 
 * Export all canvas components and the registry.
 * 
 * @module PlayerCharacterGenerator/canvasComponents
 */

// Page structure components
export {
    CharacterSheetPage,
    CharacterSheetContainer,
    CharacterFrame
} from './CharacterSheetPage';
export type {
    CharacterSheetPageProps,
    CharacterSheetContainerProps,
    CharacterFrameProps
} from './CharacterSheetPage';

// Multi-page renderer
export { CharacterSheetRenderer } from './CharacterSheetRenderer';
export type { CharacterSheetRendererProps } from './CharacterSheetRenderer';

// Individual block components
export { default as CharacterHeader } from './CharacterHeader';
export { default as AbilityScoresBlock } from './AbilityScoresBlock';
export { default as CombatStatsBlock } from './CombatStatsBlock';
export { default as SkillsBlock } from './SkillsBlock';
export { default as SavingThrowsBlock } from './SavingThrowsBlock';
export { default as FeaturesBlock } from './FeaturesBlock';
export { default as EquipmentBlock } from './EquipmentBlock';
export { default as SpellcastingBlock } from './SpellcastingBlock';

// Component registry (original)
export {
    PCG_COMPONENT_REGISTRY,
    getComponentEntry,
    getAllComponentTypes,
    isComponentRegistered,
    CANVAS_RENDER_ORDER
} from './componentRegistry';
export type { PCGComponentRegistryEntry } from './componentRegistry';

// Canvas-compatible registry (new)
// Note: canvasRegistry.tsx contains JSX wrapper components
export {
    CHARACTER_CANVAS_REGISTRY,
    getCanvasComponentEntry,
    getAllCanvasComponentTypes,
    isCanvasComponentRegistered,
} from './canvasRegistry';

// Demo data
export { DEMO_FIGHTER, DEMO_FIGHTER_DATA, createDemoFighter } from './demoData';

// Section components (PHB-styled)
export * from './sections';

// Re-export component prop types
export type { CharacterHeaderProps } from './CharacterHeader';
export type { AbilityScoresBlockProps } from './AbilityScoresBlock';
export type { CombatStatsBlockProps } from './CombatStatsBlock';
export type { SkillsBlockProps } from './SkillsBlock';
export type { SavingThrowsBlockProps } from './SavingThrowsBlock';
export type { FeaturesBlockProps } from './FeaturesBlock';
export type { EquipmentBlockProps } from './EquipmentBlock';
export type { SpellcastingBlockProps } from './SpellcastingBlock';

