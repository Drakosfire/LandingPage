/**
 * Canvas Components - PCG Character Sheet Display
 * 
 * Export all canvas components and the registry.
 * 
 * @module PlayerCharacterGenerator/canvasComponents
 */

// Individual components
export { default as CharacterHeader } from './CharacterHeader';
export { default as AbilityScoresBlock } from './AbilityScoresBlock';
export { default as CombatStatsBlock } from './CombatStatsBlock';
export { default as SkillsBlock } from './SkillsBlock';
export { default as SavingThrowsBlock } from './SavingThrowsBlock';
export { default as FeaturesBlock } from './FeaturesBlock';
export { default as EquipmentBlock } from './EquipmentBlock';
export { default as SpellcastingBlock } from './SpellcastingBlock';

// Component registry
export {
    PCG_COMPONENT_REGISTRY,
    getComponentEntry,
    getAllComponentTypes,
    isComponentRegistered,
    CANVAS_RENDER_ORDER
} from './componentRegistry';
export type { PCGComponentRegistryEntry } from './componentRegistry';

// Demo data
export { DEMO_FIGHTER, DEMO_FIGHTER_DATA, createDemoFighter } from './demoData';

// Re-export component prop types
export type { CharacterHeaderProps } from './CharacterHeader';
export type { AbilityScoresBlockProps } from './AbilityScoresBlock';
export type { CombatStatsBlockProps } from './CombatStatsBlock';
export type { SkillsBlockProps } from './SkillsBlock';
export type { SavingThrowsBlockProps } from './SavingThrowsBlock';
export type { FeaturesBlockProps } from './FeaturesBlock';
export type { EquipmentBlockProps } from './EquipmentBlock';
export type { SpellcastingBlockProps } from './SpellcastingBlock';

