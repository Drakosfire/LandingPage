import type {
    ComponentDataSource,
    ComponentInstance,
    TemplateConfig,
    StatblockPageDocument
} from '../types/statblockCanvas.types';
import type { StatBlockDetails } from '../types/statblock.types';

const defaultStatblockDetails: StatBlockDetails = {
    name: 'Dustwalker, Cult Bard of the Shepherd’s Flock',
    size: 'Medium',
    type: 'humanoid',
    alignment: 'chaotic evil',
    subtype: 'cultist',
    armorClass: 15,
    hitPoints: 110,
    hitDice: '13d8 + 52',
    speed: { walk: 30 },
    abilities: {
        str: 12,
        dex: 16,
        con: 18,
        int: 14,
        wis: 13,
        cha: 19,
    },
    senses: {
        passivePerception: 13,
        darkvision: 60,
    },
    languages: 'Common, Abyssal, telepathy 60 ft.',
    challengeRating: '9',
    xp: 5000,
    actions: [],
    specialAbilities: [
        {
            name: 'Whispers of the Flock',
            desc: 'Dustwalker can telepathically communicate with any creature charmed by its magic within 120 feet.',
        },
    ],
    actions: [
        {
            name: 'Conductor’s Baton',
            desc: 'Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 11 (1d8 + 7) bludgeoning damage plus 7 (2d6) psychic damage.',
        },
        {
            name: 'Discordant Hymn',
            desc: 'Each creature of Dustwalker’s choice within 30 feet must succeed on a DC 16 Wisdom saving throw or take 13 (3d8) psychic damage and be deafened until the start of Dustwalker’s next turn.',
            recharge: '5-6',
        },
    ],
    description: 'A sinister minstrel whose hymns twist the will of listeners into fanatical devotion.',
    sdPrompt: 'An otherworldly bard shrouded in crimson robes and shadowed notes.',
    savingThrows: {
        wis: 6,
        cha: 8,
    },
    skills: {
        deception: 9,
        performance: 9,
        persuasion: 8,
    },
    damageResistance: 'psychic; bludgeoning, piercing, and slashing from nonmagical attacks',
    spells: undefined,
    legendaryActions: undefined,
    bonusActions: [],
    reactions: [],
    specialAbilities: [],
    lairActions: undefined,
    damageImmunity: undefined,
    conditionImmunity: undefined,
    damageVulnerability: undefined,
    projectId: 'demo-project',
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    tags: ['demo', 'statblock'],
    proficiencyBonus: 4,
};

export const demoTemplate: TemplateConfig = {
    id: 'demo-monster-template',
    name: 'Demo Monster Manual Layout',
    description: 'Simplified Monster Manual-inspired layout for prototyping.',
    defaultMode: 'locked',
    defaultPageVariables: {
        dimensions: { width: 210, height: 297, unit: 'mm' },
        background: {
            type: 'parchment',
            color: '#f8f2e4',
            textureUrl: '',
            overlayOpacity: 0.2,
        },
        columns: {
            enabled: true,
            columnCount: 2,
            gutter: 16,
            unit: 'px',
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
            id: 'slot-stat-summary',
            name: 'Stat Summary',
            position: { x: 100, y: 48, width: 94, height: 80 },
            allowedComponents: ['stat-summary'],
            isRequired: true,
        },
        {
            id: 'slot-ability-table',
            name: 'Ability Scores',
            position: { x: 16, y: 132, width: 178, height: 40 },
            allowedComponents: ['ability-table'],
        },
        {
            id: 'slot-quick-facts',
            name: 'Quick Facts',
            position: { x: 16, y: 176, width: 178, height: 44 },
            allowedComponents: ['quick-facts'],
        },
        {
            id: 'slot-actions',
            name: 'Actions',
            position: { x: 16, y: 224, width: 178, height: 120 },
            allowedComponents: ['action-section', 'trait-list'],
        },
    ],
    defaultComponents: [
        {
            slotId: 'slot-identity',
            componentType: 'identity-header',
            defaultDataRef: { type: 'statblock', path: 'name' },
        },
        {
            slotId: 'slot-portrait',
            componentType: 'portrait-panel',
            defaultDataRef: { type: 'custom', key: 'portraitUrl' },
        },
        {
            slotId: 'slot-stat-summary',
            componentType: 'stat-summary',
            defaultDataRef: { type: 'statblock', path: 'armorClass' },
        },
        {
            slotId: 'slot-ability-table',
            componentType: 'ability-table',
            defaultDataRef: { type: 'statblock', path: 'abilities' },
        },
        {
            slotId: 'slot-quick-facts',
            componentType: 'quick-facts',
            defaultDataRef: { type: 'statblock', path: '.' },
        },
        {
            slotId: 'slot-actions',
            componentType: 'action-section',
            defaultDataRef: { type: 'statblock', path: 'actions' },
        },
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
    ],
    metadata: {
        version: 1,
        author: 'Drakosfire',
    },
};

const defaultDataSource: ComponentDataSource = {
    id: 'statblock-main',
    type: 'statblock',
    payload: defaultStatblockDetails,
    updatedAt: new Date().toISOString(),
};

const customDataSource: ComponentDataSource = {
    id: 'custom-main',
    type: 'custom',
    payload: {
        portraitUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80',
    },
    updatedAt: new Date().toISOString(),
};

const buildComponentInstances = (template: TemplateConfig): ComponentInstance[] =>
    template.defaultComponents.map((placement, index) => ({
        id: `component-${index}`,
        type: placement.componentType,
        dataRef: placement.defaultDataRef,
        layout: {
            slotId: placement.slotId,
            position: template.slots.find((slot) => slot.id === placement.slotId)?.position,
            isVisible: true,
        },
    }));

export const buildDemoPageDocument = (): StatblockPageDocument => ({
    id: 'demo-page',
    projectId: 'demo-project',
    ownerId: 'demo-user',
    templateId: demoTemplate.id,
    pageVariables: {
        mode: demoTemplate.defaultMode,
        ...demoTemplate.defaultPageVariables,
        templateId: demoTemplate.id,
    },
    componentInstances: buildComponentInstances(demoTemplate),
    dataSources: [defaultDataSource, customDataSource],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [],
    metadata: { isDemo: true },
});


