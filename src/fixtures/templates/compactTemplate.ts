/**
 * Compact Stat Block Template
 * 
 * Space-efficient layout for quick reference sheets.
 * Minimal whitespace, densely packed information.
 */

import type { TemplateConfig } from '../../types/statblockCanvas.types';

export const compactTemplate: TemplateConfig = {
    id: 'compact-reference',
    name: 'Compact Reference',
    description: 'Space-efficient layout for quick reference sheets with minimal whitespace',
    defaultMode: 'locked',
    defaultPageVariables: {
        dimensions: { width: 215.9, height: 279.4, unit: 'mm' }, // US Letter
        background: {
            type: 'solid',
            color: '#ffffff',
            overlayOpacity: 0,
        },
        columns: {
            enabled: true,
            columnCount: 2,
            gutter: 12,
            unit: 'px',
        },
        pagination: {
            pageCount: 1,
            columnCount: 2,
        },
        snap: {
            enabled: true,
            gridSize: 4,
            gridUnit: 'px',
            snapToEdges: true,
            snapToSlots: true,
        },
    },
    slots: [
        {
            id: 'slot-header',
            name: 'Header',
            position: { x: 8, y: 8, width: 186, height: 20 },
            allowedComponents: ['identity-header'],
            isRequired: true,
        },
        {
            id: 'slot-stats',
            name: 'Core Stats',
            position: { x: 8, y: 32, width: 186, height: 60 },
            allowedComponents: ['stat-summary', 'ability-table'],
        },
        {
            id: 'slot-details',
            name: 'Details',
            position: { x: 8, y: 96, width: 186, height: 32 },
            allowedComponents: ['quick-facts'],
        },
        {
            id: 'slot-main',
            name: 'Main Content',
            position: { x: 8, y: 132, width: 186, height: 600 },
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
        { slotId: 'slot-header', componentType: 'identity-header', defaultDataRef: { type: 'statblock', path: 'name' } },
        { slotId: 'slot-stats', componentType: 'stat-summary', defaultDataRef: { type: 'statblock', path: 'armorClass' } },
        { slotId: 'slot-stats', componentType: 'ability-table', defaultDataRef: { type: 'statblock', path: 'abilities' } },
        { slotId: 'slot-details', componentType: 'quick-facts', defaultDataRef: { type: 'statblock', path: '.' } },
        { slotId: 'slot-main', componentType: 'trait-list', defaultDataRef: { type: 'statblock', path: 'specialAbilities' } },
        { slotId: 'slot-main', componentType: 'action-section', defaultDataRef: { type: 'statblock', path: 'actions' } },
        { slotId: 'slot-main', componentType: 'bonus-action-section', defaultDataRef: { type: 'statblock', path: 'bonusActions' } },
        { slotId: 'slot-main', componentType: 'reaction-section', defaultDataRef: { type: 'statblock', path: 'reactions' } },
        { slotId: 'slot-main', componentType: 'legendary-actions', defaultDataRef: { type: 'statblock', path: 'legendaryActions' } },
        { slotId: 'slot-main', componentType: 'lair-actions', defaultDataRef: { type: 'statblock', path: 'lairActions' } },
        { slotId: 'slot-main', componentType: 'spellcasting-block', defaultDataRef: { type: 'statblock', path: 'spells' } },
    ],
    allowedComponents: [
        'identity-header',
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
        category: 'utility',
    },
};

