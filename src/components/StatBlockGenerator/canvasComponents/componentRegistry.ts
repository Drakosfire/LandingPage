/**
 * Component Registry - Central registry for all canvas components
 * 
 * This registry maps component type strings to their React components and metadata.
 * It provides a single source of truth for component configuration and makes it easy
 * to add new components or modify existing ones.
 */

import type { ComponentRegistryEntry } from '../../../types/statblockCanvas.types';
import type React from 'react';

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

// Type helper to cast components to the expected registry type
const asRegistryComponent = <T extends React.ComponentType<any>>(
    component: T
): React.ComponentType<any> => component as any;

/**
 * Central component registry mapping component type IDs to their implementations.
 * 
 * Each entry contains:
 * - type: The unique identifier for this component type
 * - displayName: Human-readable name for UI/debugging
 * - component: The React component to render
 * - defaults: Default configuration for new instances
 */
export const CANVAS_COMPONENT_REGISTRY: Record<string, ComponentRegistryEntry> = {
    'identity-header': {
        type: 'identity-header',
        displayName: 'Identity Header',
        component: asRegistryComponent(IdentityHeader),
        defaults: {
            dataRef: { type: 'statblock', path: 'name' },
            layout: { isVisible: true },
        },
    },
    'stat-summary': {
        type: 'stat-summary',
        displayName: 'Stat Summary',
        component: asRegistryComponent(StatSummary),
        defaults: {
            dataRef: { type: 'statblock', path: 'armorClass' },
            layout: { isVisible: true },
        },
    },
    'ability-table': {
        type: 'ability-table',
        displayName: 'Ability Scores',
        component: asRegistryComponent(AbilityScoresTable),
        defaults: {
            dataRef: { type: 'statblock', path: 'abilities' },
            layout: { isVisible: true },
        },
    },
    'portrait-panel': {
        type: 'portrait-panel',
        displayName: 'Portrait',
        component: asRegistryComponent(PortraitPanel),
        defaults: {
            dataRef: { type: 'custom', key: 'portraitUrl' },
            layout: { isVisible: true },
        },
    },
    'quick-facts': {
        type: 'quick-facts',
        displayName: 'Quick Facts',
        component: asRegistryComponent(QuickFacts),
        defaults: {
            dataRef: { type: 'statblock', path: 'savingThrows' },
            layout: { isVisible: true },
        },
    },
    'action-section': {
        type: 'action-section',
        displayName: 'Actions',
        component: asRegistryComponent(ActionSection),
        defaults: {
            dataRef: { type: 'statblock', path: 'actions' },
            layout: { isVisible: true },
        },
    },
    'flavor-summary': {
        type: 'flavor-summary',
        displayName: 'Flavor Summary',
        component: asRegistryComponent(FlavorSummary),
        defaults: {
            dataRef: { type: 'statblock', path: 'description' },
            layout: { isVisible: true },
        },
    },
    'trait-list': {
        type: 'trait-list',
        displayName: 'Traits',
        component: asRegistryComponent(TraitList),
        defaults: {
            dataRef: { type: 'statblock', path: 'specialAbilities' },
            layout: { isVisible: true },
        },
    },
    'bonus-action-section': {
        type: 'bonus-action-section',
        displayName: 'Bonus Actions',
        component: asRegistryComponent(BonusActionSection),
        defaults: {
            dataRef: { type: 'statblock', path: 'bonusActions' },
            layout: { isVisible: true },
        },
    },
    'reaction-section': {
        type: 'reaction-section',
        displayName: 'Reactions',
        component: asRegistryComponent(ReactionSection),
        defaults: {
            dataRef: { type: 'statblock', path: 'reactions' },
            layout: { isVisible: true },
        },
    },
    'legendary-actions': {
        type: 'legendary-actions',
        displayName: 'Legendary Actions',
        component: asRegistryComponent(LegendaryActionsSection),
        defaults: {
            dataRef: { type: 'statblock', path: 'legendaryActions' },
            layout: { isVisible: true },
        },
    },
    'lair-actions': {
        type: 'lair-actions',
        displayName: 'Lair Actions',
        component: asRegistryComponent(LairActionsSection),
        defaults: {
            dataRef: { type: 'statblock', path: 'lairActions' },
            layout: { isVisible: true },
        },
    },
    'spellcasting-block': {
        type: 'spellcasting-block',
        displayName: 'Spellcasting',
        component: asRegistryComponent(SpellcastingBlock),
        defaults: {
            dataRef: { type: 'statblock', path: 'spells' },
            layout: { isVisible: true },
        },
    },
};

// Helper functions that work with this registry
export const getComponentEntry = (type: string) => {
    return CANVAS_COMPONENT_REGISTRY[type];
};

export const getAllComponentTypes = (): string[] => {
    return Object.keys(CANVAS_COMPONENT_REGISTRY);
};

export const isComponentRegistered = (type: string): boolean => {
    return type in CANVAS_COMPONENT_REGISTRY;
};

// Export the registry as default for backward compatibility
export default CANVAS_COMPONENT_REGISTRY;

