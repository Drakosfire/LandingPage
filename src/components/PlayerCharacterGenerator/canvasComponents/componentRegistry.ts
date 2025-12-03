/**
 * Component Registry - Central registry for PCG canvas components
 * 
 * Maps component type strings to their React components.
 * Follows StatblockGenerator's registry pattern for consistency.
 * 
 * @module PlayerCharacterGenerator/canvasComponents/componentRegistry
 */

import type React from 'react';

// Import canvas components
import CharacterHeader from './CharacterHeader';
import AbilityScoresBlock from './AbilityScoresBlock';
import CombatStatsBlock from './CombatStatsBlock';
import SkillsBlock from './SkillsBlock';
import SavingThrowsBlock from './SavingThrowsBlock';
import FeaturesBlock from './FeaturesBlock';
import EquipmentBlock from './EquipmentBlock';
import SpellcastingBlock from './SpellcastingBlock';

/**
 * Registry entry interface
 */
export interface PCGComponentRegistryEntry {
    type: string;
    displayName: string;
    component: React.ComponentType<any>;
    defaults?: Record<string, any>;
}

/**
 * Type helper to cast components to the expected registry type
 */
const asRegistryComponent = <T extends React.ComponentType<any>>(
    component: T
): React.ComponentType<any> => component as React.ComponentType<any>;

/**
 * Central component registry mapping component type IDs to their implementations.
 * 
 * Each entry contains:
 * - type: The unique identifier for this component type
 * - displayName: Human-readable name for UI/debugging
 * - component: The React component to render
 * - defaults: Default props for new instances
 */
export const PCG_COMPONENT_REGISTRY: Record<string, PCGComponentRegistryEntry> = {
    'character-header': {
        type: 'character-header',
        displayName: 'Character Header',
        component: asRegistryComponent(CharacterHeader),
        defaults: {
            name: 'New Character',
            level: 1
        }
    },
    'ability-scores': {
        type: 'ability-scores',
        displayName: 'Ability Scores',
        component: asRegistryComponent(AbilityScoresBlock),
        defaults: {}
    },
    'combat-stats': {
        type: 'combat-stats',
        displayName: 'Combat Stats',
        component: asRegistryComponent(CombatStatsBlock),
        defaults: {}
    },
    'skills': {
        type: 'skills',
        displayName: 'Skills',
        component: asRegistryComponent(SkillsBlock),
        defaults: {
            proficientSkills: [],
            proficiencyBonus: 2
        }
    },
    'saving-throws': {
        type: 'saving-throws',
        displayName: 'Saving Throws',
        component: asRegistryComponent(SavingThrowsBlock),
        defaults: {
            proficientSaves: [],
            proficiencyBonus: 2
        }
    },
    'features': {
        type: 'features',
        displayName: 'Features & Traits',
        component: asRegistryComponent(FeaturesBlock),
        defaults: {
            features: [],
            defaultCollapsed: true
        }
    },
    'equipment': {
        type: 'equipment',
        displayName: 'Equipment',
        component: asRegistryComponent(EquipmentBlock),
        defaults: {
            weapons: [],
            equipment: []
        }
    },
    'spellcasting': {
        type: 'spellcasting',
        displayName: 'Spellcasting',
        component: asRegistryComponent(SpellcastingBlock),
        defaults: {}
    }
};

/**
 * Get a component entry by type
 */
export const getComponentEntry = (type: string): PCGComponentRegistryEntry | undefined => {
    return PCG_COMPONENT_REGISTRY[type];
};

/**
 * Get all registered component types
 */
export const getAllComponentTypes = (): string[] => {
    return Object.keys(PCG_COMPONENT_REGISTRY);
};

/**
 * Check if a component type is registered
 */
export const isComponentRegistered = (type: string): boolean => {
    return type in PCG_COMPONENT_REGISTRY;
};

/**
 * Render order for canvas layout
 * Components are rendered in this order from top to bottom
 */
export const CANVAS_RENDER_ORDER: string[] = [
    'character-header',
    'ability-scores',
    'combat-stats',
    'saving-throws',
    'skills',
    'features',
    'equipment',
    'spellcasting'
];

export default PCG_COMPONENT_REGISTRY;

