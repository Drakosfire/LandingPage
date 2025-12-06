/**
 * Character Sheet Templates
 * 
 * Template configurations for PlayerCharacterGenerator canvas rendering.
 * Follows the Canvas package's TemplateConfig structure.
 * 
 * @module PlayerCharacterGenerator/characterTemplates
 */

import type { TemplateConfig, PageVariables } from 'dungeonmind-canvas';

/**
 * Default page variables for character sheets
 * US Letter size, two-column layout
 */
const DEFAULT_CHARACTER_PAGE_VARIABLES: Omit<PageVariables, 'mode' | 'templateId'> = {
    dimensions: { width: 215.9, height: 279.4, unit: 'mm' }, // US Letter
    background: {
        type: 'parchment',
        color: '#f8f2e4',
        textureUrl: '',
        overlayOpacity: 0.15,
    },
    columns: {
        enabled: true,
        columnCount: 2,
        gutter: 12, // px
        unit: 'px',
    },
    pagination: {
        pageCount: 2, // Character sheets typically need 2-3 pages
        columnCount: 2,
    },
    snap: {
        enabled: true,
        gridSize: 8,
        gridUnit: 'px',
        snapToEdges: true,
        snapToSlots: true,
    },
    margins: {
        topMm: 10,
        bottomMm: 10,
        leftMm: 10,
        rightMm: 10,
    },
};

/**
 * PHB-Style Character Sheet Template
 * 
 * Mimics the official D&D 5e character sheet layout:
 * - Page 1: Core stats (abilities, saves, skills, combat)
 * - Page 2: Features, equipment, proficiencies, background
 * - Page 3: Spellcasting (if applicable)
 */
export const phbCharacterTemplate: TemplateConfig = {
    id: 'phb-character-sheet',
    name: 'PHB Character Sheet',
    description: 'Classic Player\'s Handbook style character sheet layout',
    defaultMode: 'locked',
    defaultPageVariables: DEFAULT_CHARACTER_PAGE_VARIABLES,
    slots: [
        // === PAGE 1 SLOTS ===
        {
            id: 'slot-header',
            name: 'Character Header',
            position: { x: 16, y: 16, width: 178, height: 48 },
            allowedComponents: ['character-header'],
            isRequired: true,
        },
        {
            id: 'slot-ability-scores',
            name: 'Ability Scores',
            position: { x: 16, y: 68, width: 80, height: 160 },
            allowedComponents: ['ability-scores'],
            isRequired: true,
        },
        {
            id: 'slot-saves-skills',
            name: 'Saves & Skills',
            position: { x: 100, y: 68, width: 94, height: 280 },
            allowedComponents: ['saves-skills'],
        },
        {
            id: 'slot-combat-stats',
            name: 'Combat Stats',
            position: { x: 16, y: 232, width: 178, height: 140 },
            allowedComponents: ['combat-stats'],
        },
        {
            id: 'slot-attacks',
            name: 'Attacks',
            position: { x: 16, y: 376, width: 178, height: 120 },
            allowedComponents: ['attacks'],
        },

        // === PAGE 2 SLOTS ===
        {
            id: 'slot-proficiencies',
            name: 'Proficiencies & Languages',
            position: { x: 16, y: 16, width: 178, height: 100 },
            allowedComponents: ['proficiencies'],
        },
        {
            id: 'slot-features',
            name: 'Features & Traits',
            position: { x: 16, y: 120, width: 178, height: 200 },
            allowedComponents: ['features'],
        },
        {
            id: 'slot-equipment',
            name: 'Equipment',
            position: { x: 16, y: 324, width: 178, height: 160 },
            allowedComponents: ['equipment'],
        },
        {
            id: 'slot-background',
            name: 'Background & Personality',
            position: { x: 16, y: 488, width: 178, height: 160 },
            allowedComponents: ['background'],
        },

        // === PAGE 3 SLOTS (Spellcasting) ===
        {
            id: 'slot-spellcasting',
            name: 'Spellcasting',
            position: { x: 16, y: 16, width: 178, height: 600 },
            allowedComponents: ['spellcasting'],
        },
    ],
    defaultComponents: [
        // Page 1
        { slotId: 'slot-header', componentType: 'character-header', defaultDataRef: { type: 'statblock', path: 'name' } },
        { slotId: 'slot-ability-scores', componentType: 'ability-scores', defaultDataRef: { type: 'statblock', path: 'abilityScores' } },
        { slotId: 'slot-saves-skills', componentType: 'saves-skills', defaultDataRef: { type: 'statblock', path: 'proficiencies' } },
        { slotId: 'slot-combat-stats', componentType: 'combat-stats', defaultDataRef: { type: 'statblock', path: 'derivedStats' } },
        { slotId: 'slot-attacks', componentType: 'attacks', defaultDataRef: { type: 'statblock', path: 'weapons' } },
        // Page 2
        { slotId: 'slot-proficiencies', componentType: 'proficiencies', defaultDataRef: { type: 'statblock', path: 'proficiencies' } },
        { slotId: 'slot-features', componentType: 'features', defaultDataRef: { type: 'statblock', path: 'features' } },
        { slotId: 'slot-equipment', componentType: 'equipment', defaultDataRef: { type: 'statblock', path: 'equipment' } },
        { slotId: 'slot-background', componentType: 'background', defaultDataRef: { type: 'statblock', path: 'background' } },
        // Page 3 (conditional)
        { slotId: 'slot-spellcasting', componentType: 'spellcasting', defaultDataRef: { type: 'statblock', path: 'spellcasting' } },
    ],
    allowedComponents: [
        'character-header',
        'ability-scores',
        'saves-skills',
        'combat-stats',
        'attacks',
        'proficiencies',
        'features',
        'equipment',
        'background',
        'spellcasting',
    ],
    metadata: {
        version: 1,
        author: 'DungeonMind',
        category: 'official-style',
    },
};

/**
 * Compact Character Sheet Template
 * 
 * Single-page layout for quick reference during play.
 * Excludes some detail sections.
 */
export const compactCharacterTemplate: TemplateConfig = {
    id: 'compact-character-sheet',
    name: 'Compact Character Sheet',
    description: 'Single-page quick reference character sheet',
    defaultMode: 'locked',
    defaultPageVariables: {
        ...DEFAULT_CHARACTER_PAGE_VARIABLES,
        pagination: {
            pageCount: 1,
            columnCount: 2,
        },
    },
    slots: [
        {
            id: 'slot-header',
            name: 'Character Header',
            position: { x: 16, y: 16, width: 178, height: 36 },
            allowedComponents: ['character-header'],
            isRequired: true,
        },
        {
            id: 'slot-ability-scores',
            name: 'Ability Scores',
            position: { x: 16, y: 56, width: 178, height: 80 },
            allowedComponents: ['ability-scores'],
        },
        {
            id: 'slot-combat-stats',
            name: 'Combat Stats',
            position: { x: 16, y: 140, width: 178, height: 100 },
            allowedComponents: ['combat-stats'],
        },
        {
            id: 'slot-content',
            name: 'Content Area',
            position: { x: 16, y: 244, width: 178, height: 400 },
            allowedComponents: ['saves-skills', 'features', 'attacks', 'spellcasting'],
        },
    ],
    defaultComponents: [
        { slotId: 'slot-header', componentType: 'character-header', defaultDataRef: { type: 'statblock', path: 'name' } },
        { slotId: 'slot-ability-scores', componentType: 'ability-scores', defaultDataRef: { type: 'statblock', path: 'abilityScores' } },
        { slotId: 'slot-combat-stats', componentType: 'combat-stats', defaultDataRef: { type: 'statblock', path: 'derivedStats' } },
        { slotId: 'slot-content', componentType: 'saves-skills', defaultDataRef: { type: 'statblock', path: 'proficiencies' } },
    ],
    allowedComponents: [
        'character-header',
        'ability-scores',
        'combat-stats',
        'saves-skills',
        'features',
        'attacks',
        'spellcasting',
    ],
    metadata: {
        version: 1,
        author: 'DungeonMind',
        category: 'utility',
    },
};

/**
 * Default character template
 */
export const DEFAULT_CHARACTER_TEMPLATE = phbCharacterTemplate;

/**
 * Get character template by ID
 */
export function getCharacterTemplate(id: string): TemplateConfig | undefined {
    switch (id) {
        case 'phb-character-sheet':
            return phbCharacterTemplate;
        case 'compact-character-sheet':
            return compactCharacterTemplate;
        default:
            return undefined;
    }
}

/**
 * Get all available character template IDs
 */
export function getAllCharacterTemplateIds(): string[] {
    return ['phb-character-sheet', 'compact-character-sheet'];
}

