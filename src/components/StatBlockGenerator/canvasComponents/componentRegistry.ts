/**
 * Component Registry - Central registry for all canvas components
 * 
 * This registry maps component type strings to their React components and metadata.
 * It provides a single source of truth for component configuration and makes it easy
 * to add new components or modify existing ones.
 */

import type { ComponentRegistryEntry } from '../../../types/statblockCanvas.types';

import IdentityHeader from './IdentityHeader';
import StatSummary from './StatSummary';
import AbilityScoresTable from './AbilityScoresTable';
import PortraitPanel from './PortraitPanel';
import QuickFacts from './QuickFacts';
import ActionSection from './ActionSection';
import FlavorSummary from './FlavorSummary';
import TraitList from './TraitList';
import BonusActionSection from './BonusActionSection';
import ReactionSection from './ReactionSection';
import LegendaryActionsSection from './LegendaryActionsSection';
import LairActionsSection from './LairActionsSection';
import SpellcastingBlock from './SpellcastingBlock';

/**
 * Central component registry mapping component type IDs to their implementations.
 * 
 * Each entry contains:
 * - type: The unique identifier for this component type
 * - displayName: Human-readable name for UI/debugging
 * - component: The React component to render
 * - defaults: Default configuration for new instances
 */
export const componentRegistry: Record<string, ComponentRegistryEntry> = {
    'identity-header': {
        type: 'identity-header',
        displayName: 'Identity Header',
        component: IdentityHeader,
        defaults: {
            dataRef: { type: 'statblock', path: 'name' },
            layout: { isVisible: true },
        },
    },
    'stat-summary': {
        type: 'stat-summary',
        displayName: 'Stat Summary',
        component: StatSummary,
        defaults: {
            dataRef: { type: 'statblock', path: 'armorClass' },
            layout: { isVisible: true },
        },
    },
    'ability-table': {
        type: 'ability-table',
        displayName: 'Ability Scores',
        component: AbilityScoresTable,
        defaults: {
            dataRef: { type: 'statblock', path: 'abilities' },
            layout: { isVisible: true },
        },
    },
    'portrait-panel': {
        type: 'portrait-panel',
        displayName: 'Portrait',
        component: PortraitPanel,
        defaults: {
            dataRef: { type: 'custom', key: 'portraitUrl' },
            layout: { isVisible: true },
        },
    },
    'quick-facts': {
        type: 'quick-facts',
        displayName: 'Quick Facts',
        component: QuickFacts,
        defaults: {
            dataRef: { type: 'statblock', path: 'savingThrows' },
            layout: { isVisible: true },
        },
    },
    'action-section': {
        type: 'action-section',
        displayName: 'Actions',
        component: ActionSection,
        defaults: {
            dataRef: { type: 'statblock', path: 'actions' },
            layout: { isVisible: true },
        },
    },
    'flavor-summary': {
        type: 'flavor-summary',
        displayName: 'Flavor Summary',
        component: FlavorSummary,
        defaults: {
            dataRef: { type: 'statblock', path: 'description' },
            layout: { isVisible: true },
        },
    },
    'trait-list': {
        type: 'trait-list',
        displayName: 'Traits',
        component: TraitList,
        defaults: {
            dataRef: { type: 'statblock', path: 'specialAbilities' },
            layout: { isVisible: true },
        },
    },
    'bonus-action-section': {
        type: 'bonus-action-section',
        displayName: 'Bonus Actions',
        component: BonusActionSection,
        defaults: {
            dataRef: { type: 'statblock', path: 'bonusActions' },
            layout: { isVisible: true },
        },
    },
    'reaction-section': {
        type: 'reaction-section',
        displayName: 'Reactions',
        component: ReactionSection,
        defaults: {
            dataRef: { type: 'statblock', path: 'reactions' },
            layout: { isVisible: true },
        },
    },
    'legendary-actions': {
        type: 'legendary-actions',
        displayName: 'Legendary Actions',
        component: LegendaryActionsSection,
        defaults: {
            dataRef: { type: 'statblock', path: 'legendaryActions' },
            layout: { isVisible: true },
        },
    },
    'lair-actions': {
        type: 'lair-actions',
        displayName: 'Lair Actions',
        component: LairActionsSection,
        defaults: {
            dataRef: { type: 'statblock', path: 'lairActions' },
            layout: { isVisible: true },
        },
    },
    'spellcasting-block': {
        type: 'spellcasting-block',
        displayName: 'Spellcasting',
        component: SpellcastingBlock,
        defaults: {
            dataRef: { type: 'statblock', path: 'spells' },
            layout: { isVisible: true },
        },
    },
};

/**
 * Helper function to get a component registry entry by type.
 * Returns undefined if the component type is not registered.
 */
export const getComponentEntry = (type: string): ComponentRegistryEntry | undefined => {
    return componentRegistry[type];
};

/**
 * Helper function to get all available component types.
 */
export const getAllComponentTypes = (): string[] => {
    return Object.keys(componentRegistry);
};

/**
 * Helper function to check if a component type is registered.
 */
export const isComponentRegistered = (type: string): boolean => {
    return type in componentRegistry;
};

export default componentRegistry;

