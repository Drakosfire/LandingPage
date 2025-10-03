/**
 * Canvas Component Registry
 * 
 * Centralized registry for all canvas components with their metadata and defaults.
 * This is the single source of truth for component configuration.
 */

import type { ComponentRegistryEntry, CanvasComponentType } from '../../types/statblockCanvas.types';
import {
    IdentityHeader,
    StatSummary,
    AbilityScoresTable,
    PortraitPanel,
    QuickFacts,
    ActionSection,
    FlavorSummary,
    TraitList,
    BonusActionSection,
    ReactionSection,
    LegendaryActionsSection,
    LairActionsSection,
    SpellcastingBlock,
} from '../../components/StatBlockGenerator/canvasComponents';

/**
 * Component registry mapping component types to their implementations
 */
export const CANVAS_COMPONENT_REGISTRY: Record<CanvasComponentType, ComponentRegistryEntry> = {
    'identity-header': {
        type: 'identity-header',
        displayName: 'Identity Header',
        description: 'Creature name, size, type, and alignment',
        component: IdentityHeader,
        defaults: {
            dataRef: { type: 'statblock', path: 'name' },
            layout: { isVisible: true },
        },
    },
    'stat-summary': {
        type: 'stat-summary',
        displayName: 'Stat Summary',
        description: 'AC, HP, and Speed',
        component: StatSummary,
        defaults: {
            dataRef: { type: 'statblock', path: 'armorClass' },
            layout: { isVisible: true },
        },
    },
    'ability-table': {
        type: 'ability-table',
        displayName: 'Ability Scores',
        description: 'STR, DEX, CON, INT, WIS, CHA',
        component: AbilityScoresTable,
        defaults: {
            dataRef: { type: 'statblock', path: 'abilities' },
            layout: { isVisible: true },
        },
    },
    'portrait-panel': {
        type: 'portrait-panel',
        displayName: 'Portrait',
        description: 'Creature portrait image',
        component: PortraitPanel,
        defaults: {
            dataRef: { type: 'custom', key: 'portraitUrl' },
            layout: { isVisible: true },
        },
    },
    'quick-facts': {
        type: 'quick-facts',
        displayName: 'Quick Facts',
        description: 'Saves, skills, resistances, senses, languages, CR',
        component: QuickFacts,
        defaults: {
            dataRef: { type: 'statblock', path: 'savingThrows' },
            layout: { isVisible: true },
        },
    },
    'action-section': {
        type: 'action-section',
        displayName: 'Actions',
        description: 'Standard creature actions',
        component: ActionSection,
        defaults: {
            dataRef: { type: 'statblock', path: 'actions' },
            layout: { isVisible: true },
        },
    },
    'flavor-summary': {
        type: 'flavor-summary',
        displayName: 'Flavor Text',
        description: 'Creature description and flavor',
        component: FlavorSummary,
        defaults: {
            dataRef: { type: 'statblock', path: 'description' },
            layout: { isVisible: true },
        },
    },
    'trait-list': {
        type: 'trait-list',
        displayName: 'Special Abilities',
        description: 'Special traits and abilities',
        component: TraitList,
        defaults: {
            dataRef: { type: 'statblock', path: 'specialAbilities' },
            layout: { isVisible: true },
        },
    },
    'bonus-action-section': {
        type: 'bonus-action-section',
        displayName: 'Bonus Actions',
        description: 'Bonus action abilities',
        component: BonusActionSection,
        defaults: {
            dataRef: { type: 'statblock', path: 'bonusActions' },
            layout: { isVisible: true },
        },
    },
    'reaction-section': {
        type: 'reaction-section',
        displayName: 'Reactions',
        description: 'Reaction abilities',
        component: ReactionSection,
        defaults: {
            dataRef: { type: 'statblock', path: 'reactions' },
            layout: { isVisible: true },
        },
    },
    'legendary-actions': {
        type: 'legendary-actions',
        displayName: 'Legendary Actions',
        description: 'Legendary creature actions',
        component: LegendaryActionsSection,
        defaults: {
            dataRef: { type: 'statblock', path: 'legendaryActions' },
            layout: { isVisible: true },
        },
    },
    'lair-actions': {
        type: 'lair-actions',
        displayName: 'Lair Actions',
        description: 'Lair-specific actions',
        component: LairActionsSection,
        defaults: {
            dataRef: { type: 'statblock', path: 'lairActions' },
            layout: { isVisible: true },
        },
    },
    'spellcasting-block': {
        type: 'spellcasting-block',
        displayName: 'Spellcasting',
        description: 'Spellcasting abilities and spell list',
        component: SpellcastingBlock,
        defaults: {
            dataRef: { type: 'statblock', path: 'spells' },
            layout: { isVisible: true },
        },
    },
    // Placeholder components for future implementation
    'regional-effects': {
        type: 'regional-effects',
        displayName: 'Regional Effects',
        description: 'Environmental effects around the creature',
        component: FlavorSummary, // Temporary placeholder
        defaults: {
            dataRef: { type: 'statblock', path: 'regionalEffects' },
            layout: { isVisible: true },
        },
    },
    'variant-rules': {
        type: 'variant-rules',
        displayName: 'Variant Rules',
        description: 'Alternative rules or variations',
        component: FlavorSummary, // Temporary placeholder
        defaults: {
            dataRef: { type: 'statblock', path: 'variantRules' },
            layout: { isVisible: true },
        },
    },
    'encounter-notes': {
        type: 'encounter-notes',
        displayName: 'Encounter Notes',
        description: 'DM notes for running encounters',
        component: FlavorSummary, // Temporary placeholder
        defaults: {
            dataRef: { type: 'statblock', path: 'encounterNotes' },
            layout: { isVisible: true },
        },
    },
    'loot-table': {
        type: 'loot-table',
        displayName: 'Loot Table',
        description: 'Treasure and loot drops',
        component: FlavorSummary, // Temporary placeholder
        defaults: {
            dataRef: { type: 'statblock', path: 'lootTable' },
            layout: { isVisible: true },
        },
    },
    'appendix-callout': {
        type: 'appendix-callout',
        displayName: 'Callout Box',
        description: 'Highlighted information box',
        component: FlavorSummary, // Temporary placeholder
        defaults: {
            dataRef: { type: 'custom', key: 'calloutText' },
            layout: { isVisible: true },
        },
    },
    'section-divider': {
        type: 'section-divider',
        displayName: 'Section Divider',
        description: 'Visual separator between sections',
        component: FlavorSummary, // Temporary placeholder
        defaults: {
            dataRef: { type: 'custom', key: 'dividerStyle' },
            layout: { isVisible: true },
        },
    },
    'block-quote': {
        type: 'block-quote',
        displayName: 'Block Quote',
        description: 'Styled quote or flavor text box',
        component: FlavorSummary, // Temporary placeholder
        defaults: {
            dataRef: { type: 'custom', key: 'quoteText' },
            layout: { isVisible: true },
        },
    },
    'markdown-block': {
        type: 'markdown-block',
        displayName: 'Markdown Block',
        description: 'Custom markdown content',
        component: FlavorSummary, // Temporary placeholder
        defaults: {
            dataRef: { type: 'custom', key: 'markdownContent' },
            layout: { isVisible: true },
        },
    },
    'spacer': {
        type: 'spacer',
        displayName: 'Spacer',
        description: 'Empty space for layout control',
        component: FlavorSummary, // Temporary placeholder
        defaults: {
            dataRef: { type: 'custom', key: 'spacerHeight' },
            layout: { isVisible: true },
        },
    },
};

/**
 * Get a component registry entry by type
 */
export function getComponentEntry(type: CanvasComponentType): ComponentRegistryEntry | undefined {
    return CANVAS_COMPONENT_REGISTRY[type];
}

/**
 * Get all available component types
 */
export function getAllComponentTypes(): CanvasComponentType[] {
    return Object.keys(CANVAS_COMPONENT_REGISTRY) as CanvasComponentType[];
}

/**
 * Get core statblock components (commonly used)
 */
export function getCoreComponents(): CanvasComponentType[] {
    return [
        'identity-header',
        'portrait-panel',
        'flavor-summary',
        'stat-summary',
        'ability-table',
        'quick-facts',
        'trait-list',
        'action-section',
        'bonus-action-section',
        'reaction-section',
        'legendary-actions',
        'lair-actions',
        'spellcasting-block',
    ];
}

/**
 * Get utility components (layout helpers)
 */
export function getUtilityComponents(): CanvasComponentType[] {
    return [
        'section-divider',
        'block-quote',
        'markdown-block',
        'spacer',
    ];
}

/**
 * Check if a component type exists in the registry
 */
export function isValidComponentType(type: string): type is CanvasComponentType {
    return type in CANVAS_COMPONENT_REGISTRY;
}



