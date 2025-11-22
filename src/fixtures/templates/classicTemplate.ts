/**
 * Classic Monster Manual Template
 * 
 * Traditional two-column layout matching official D&D 5e Monster Manual style.
 * Portrait on left, stats on right, abilities and actions below.
 */

import type { TemplateConfig } from '../../types/statblockCanvas.types';

export const classicTemplate: TemplateConfig = {
    id: 'classic-monster-manual',
    name: 'Classic Monster Manual',
    description: 'Traditional two-column layout matching official D&D 5e Monster Manual style',
    defaultMode: 'locked',
    defaultPageVariables: {
        dimensions: { width: 215.9, height: 279.4, unit: 'mm' }, // US Letter
        background: {
            type: 'parchment',
            color: '#f8f2e4',
            textureUrl: '',
            overlayOpacity: 0.2,
        },
        columns: {
            enabled: true,
            columnCount: 2,
            gutter: 12, // Must match COMPONENT_VERTICAL_SPACING_PX (12px) for accurate pagination
            unit: 'px',
        },
        pagination: {
            pageCount: 1,
            columnCount: 2,
        },
        snap: {
            enabled: true,
            gridSize: 8,
            gridUnit: 'px',
            snapToEdges: true,
            snapToSlots: true,
        },
    },
    slots: [
        {
            id: 'slot-identity',
            name: 'Identity Header',
            position: { x: 16, y: 16, width: 178, height: 24 },
            allowedComponents: ['identity-header'],
            isRequired: true,
        },
        {
            id: 'slot-portrait',
            name: 'Portrait',
            position: { x: 16, y: 48, width: 80, height: 80 },
            allowedComponents: ['portrait-panel'],
        },
        {
            id: 'slot-flavor',
            name: 'Flavor Summary',
            position: { x: 16, y: 132, width: 80, height: 48 },
            allowedComponents: ['flavor-summary'],
        },
        {
            id: 'slot-stat-summary',
            name: 'Stat Summary',
            position: { x: 100, y: 48, width: 94, height: 80 },
            allowedComponents: ['stat-summary'],
            isRequired: true,
        },
        {
            id: 'slot-ability-table',
            name: 'Ability Scores',
            position: { x: 16, y: 184, width: 178, height: 40 },
            allowedComponents: ['ability-table'],
        },
        {
            id: 'slot-quick-facts',
            name: 'Quick Facts',
            position: { x: 16, y: 228, width: 178, height: 44 },
            allowedComponents: ['quick-facts'],
        },
        {
            id: 'slot-content',
            name: 'Main Content',
            position: { x: 16, y: 276, width: 178, height: 500 },
            allowedComponents: [
                'trait-list',
                'action-section',
                'bonus-action-section',
                'reaction-section',
                'legendary-actions',
                'lair-actions',
                'spellcasting-block',
            ],
        },
    ],
    defaultComponents: [
        { slotId: 'slot-identity', componentType: 'identity-header', defaultDataRef: { type: 'statblock', path: 'name' } },
        { slotId: 'slot-portrait', componentType: 'portrait-panel', defaultDataRef: { type: 'custom', key: 'portraitUrl' } },
        { slotId: 'slot-flavor', componentType: 'flavor-summary', defaultDataRef: { type: 'statblock', path: 'description' } },
        { slotId: 'slot-stat-summary', componentType: 'stat-summary', defaultDataRef: { type: 'statblock', path: 'armorClass' } },
        { slotId: 'slot-ability-table', componentType: 'ability-table', defaultDataRef: { type: 'statblock', path: 'abilities' } },
        { slotId: 'slot-quick-facts', componentType: 'quick-facts', defaultDataRef: { type: 'statblock', path: '.' } },
        { slotId: 'slot-content', componentType: 'trait-list', defaultDataRef: { type: 'statblock', path: 'specialAbilities' } },
        { slotId: 'slot-content', componentType: 'action-section', defaultDataRef: { type: 'statblock', path: 'actions' } },
        { slotId: 'slot-content', componentType: 'bonus-action-section', defaultDataRef: { type: 'statblock', path: 'bonusActions' } },
        { slotId: 'slot-content', componentType: 'reaction-section', defaultDataRef: { type: 'statblock', path: 'reactions' } },
        { slotId: 'slot-content', componentType: 'legendary-actions', defaultDataRef: { type: 'statblock', path: 'legendaryActions' } },
        { slotId: 'slot-content', componentType: 'lair-actions', defaultDataRef: { type: 'statblock', path: 'lairActions' } },
        { slotId: 'slot-content', componentType: 'spellcasting-block', defaultDataRef: { type: 'statblock', path: 'spells' } },
    ],
    allowedComponents: [
        'identity-header',
        'flavor-summary',
        'portrait-panel',
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
    ],
    metadata: {
        version: 1,
        author: 'DungeonMind',
        category: 'official-style',
    },
};

