/**
 * Showcase Template
 * 
 * Visually striking layout with prominent portrait and flavor text.
 * Ideal for important NPCs and signature monsters.
 */

import type { TemplateConfig } from '../../types/statblockCanvas.types';

export const showcaseTemplate: TemplateConfig = {
    id: 'showcase-hero',
    name: 'Showcase Hero',
    description: 'Visually striking layout with prominent portrait for important creatures',
    defaultMode: 'locked',
    defaultPageVariables: {
        dimensions: { width: 210, height: 297, unit: 'mm' },
        background: {
            type: 'parchment',
            color: '#2a2520',
            textureUrl: '',
            overlayOpacity: 0.3,
        },
        columns: {
            enabled: true,
            columnCount: 2,
            gutter: 20,
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
            id: 'slot-portrait-hero',
            name: 'Hero Portrait',
            position: { x: 16, y: 16, width: 178, height: 140 },
            allowedComponents: ['portrait-panel'],
        },
        {
            id: 'slot-identity',
            name: 'Identity',
            position: { x: 16, y: 160, width: 178, height: 28 },
            allowedComponents: ['identity-header'],
            isRequired: true,
        },
        {
            id: 'slot-flavor',
            name: 'Flavor Text',
            position: { x: 16, y: 192, width: 178, height: 60 },
            allowedComponents: ['flavor-summary'],
        },
        {
            id: 'slot-stats',
            name: 'Stats',
            position: { x: 16, y: 256, width: 178, height: 100 },
            allowedComponents: ['stat-summary', 'ability-table', 'quick-facts'],
        },
        {
            id: 'slot-abilities',
            name: 'Abilities',
            position: { x: 16, y: 360, width: 178, height: 400 },
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
        { slotId: 'slot-portrait-hero', componentType: 'portrait-panel', defaultDataRef: { type: 'custom', key: 'portraitUrl' } },
        { slotId: 'slot-identity', componentType: 'identity-header', defaultDataRef: { type: 'statblock', path: 'name' } },
        { slotId: 'slot-flavor', componentType: 'flavor-summary', defaultDataRef: { type: 'statblock', path: 'description' } },
        { slotId: 'slot-stats', componentType: 'stat-summary', defaultDataRef: { type: 'statblock', path: 'armorClass' } },
        { slotId: 'slot-stats', componentType: 'ability-table', defaultDataRef: { type: 'statblock', path: 'abilities' } },
        { slotId: 'slot-stats', componentType: 'quick-facts', defaultDataRef: { type: 'statblock', path: '.' } },
        { slotId: 'slot-abilities', componentType: 'trait-list', defaultDataRef: { type: 'statblock', path: 'specialAbilities' } },
        { slotId: 'slot-abilities', componentType: 'action-section', defaultDataRef: { type: 'statblock', path: 'actions' } },
        { slotId: 'slot-abilities', componentType: 'bonus-action-section', defaultDataRef: { type: 'statblock', path: 'bonusActions' } },
        { slotId: 'slot-abilities', componentType: 'reaction-section', defaultDataRef: { type: 'statblock', path: 'reactions' } },
        { slotId: 'slot-abilities', componentType: 'legendary-actions', defaultDataRef: { type: 'statblock', path: 'legendaryActions' } },
        { slotId: 'slot-abilities', componentType: 'lair-actions', defaultDataRef: { type: 'statblock', path: 'lairActions' } },
        { slotId: 'slot-abilities', componentType: 'spellcasting-block', defaultDataRef: { type: 'statblock', path: 'spells' } },
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
        category: 'showcase',
    },
};

