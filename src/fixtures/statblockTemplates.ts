import type {
    ComponentDataSource,
    ComponentInstance,
    TemplateConfig,
    StatblockPageDocument
} from '../types/statblockCanvas.types';
import type { StatBlockDetails } from '../types/statblock.types';

export const defaultStatblockDetails: StatBlockDetails = {
    name: "Dustwalker, Cult Bard of the Shepherd's Flock",
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
    specialAbilities: [
        {
            name: 'Whispers of the Flock',
            desc: 'Dustwalker can telepathically communicate with any creature charmed by its magic within 120 feet.',
        },
        {
            name: 'Abyssal Echo Mic',
            desc: 'A magical device wired into Dustwalker’s throat gives him advantage on Performance checks and allows him to cast Thaumaturgy and Message cantrips at will, requiring no components.',
        },
        {
            name: 'Escape Artist',
            desc: 'Dustwalker has advantage on checks to Disengage, escape grapples, or use Stealth while retreating. Once per day, he can cast Misty Step as a bonus action without using a spell slot.',
        },
    ],
    actions: [
        {
            name: 'Cultist’s Blade',
            desc: 'Melee or Ranged Weapon Attack: +6 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 5 (1d4 + 3) piercing damage plus 4 (1d4) necrotic damage. The blade is a magical weapon.',
        },
        {
            name: 'Unsettling Hymn',
            desc: 'Dustwalker performs a haunting song for 1 minute. Up to 6 humanoids of Dustwalker’s choice within 60 feet who can hear him must each succeed on a DC 15 Wisdom saving throw or be charmed for 1 hour or until they take damage. While charmed, creatures view Dustwalker as a prophetic messenger and are disinclined to harm him.',
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
    spells: {
        level: 10,
        ability: 'Charisma',
        save: 15,
        attack: 7,
        cantrips: [
            {
                name: 'Vicious Mockery',
                level: 0,
                description:
                    'You unleash a string of insults laced with subtle enchantments at a creature within range. If the target can hear you, it must succeed on a DC 15 Wisdom saving throw or take 2d4 psychic damage and have disadvantage on the next attack roll it makes before the end of its next turn.',
            },
            {
                name: 'Thaumaturgy',
                level: 0,
                description:
                    'You manifest a minor wonder, creating one of several magical effects such as thunderous voice amplification, flickering lights, or harmless tremors, all driven through Dustwalker’s reverb-laced voice.',
            },
            {
                name: 'Prestidigitation',
                level: 0,
                description:
                    'You create minor magical tricks, cleaning objects, chilling or warming small items, or conjuring faint musical notes—a favorite for Dustwalker’s performance flourishes.',
            },
            {
                name: 'Message',
                level: 0,
                description:
                    'You point your finger toward a creature within range and whisper a message that only they can hear, receiving a whispered reply if they choose.',
            },
        ],
        knownSpells: [
            {
                name: 'Charm Person',
                level: 1,
                description: 'You attempt to charm a humanoid you can see within range. They must make a DC 15 Wisdom saving throw or be charmed for 1 hour or until harmed.',
            },
            {
                name: 'Dissonant Whispers',
                level: 1,
                description:
                    'You whisper a discordant melody to one creature within range, forcing a DC 15 Wisdom save. On a failure, it takes 3d6 psychic damage and must immediately use its reaction to move away from you.',
            },
            {
                name: 'Sleep',
                level: 1,
                description:
                    'This spell sends creatures into a magical slumber. Roll 7d8 to determine hit points affected, starting with the lowest HP creature within 20 feet of a point you choose.',
            },
            {
                name: 'Hold Person',
                level: 2,
                description:
                    'You attempt to paralyze a humanoid you can see within 60 feet. The target must succeed on a DC 15 Wisdom saving throw or be paralyzed for up to 1 minute (save ends at the end of each of its turns).',
            },
            {
                name: 'Suggestion',
                level: 2,
                description:
                    'You magically influence a creature that can hear and understand you, issuing a reasonable-sounding course of action. The creature must succeed on a DC 15 Wisdom saving throw or follow the suggestion.',
            },
            {
                name: 'Mirror Image',
                level: 2,
                description:
                    'Three illusory duplicates of yourself appear in your space, confusing attackers for 1 minute or until destroyed.',
            },
            {
                name: 'Major Image',
                level: 3,
                description:
                    'You create the image of an object, creature, or other visible phenomenon within range that lasts up to 10 minutes. Sound, smell, and temperature components can also be depicted.',
            },
            {
                name: 'Hypnotic Pattern',
                level: 3,
                description:
                    'You create a twisting pattern of colors in a 30-foot cube. Each creature who sees the pattern must make a DC 15 Wisdom saving throw or become charmed and incapacitated until the spell ends or they take damage.',
            },
            {
                name: 'Greater Invisibility',
                level: 4,
                description: 'You or a creature you touch becomes invisible for up to 1 minute (concentration).',
            },
            {
                name: 'Misty Step',
                level: 2,
                usage: '1/day',
                description:
                    'Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space you can see. Dustwalker uses this as a bonus action, once per day.',
            },
        ],
        spellSlots: {
            slot1: 4,
            slot2: 3,
            slot3: 3,
            slot4: 2,
        },
    },
    legendaryActions: {
        actionsPerTurn: 3,
        description: 'Dustwalker can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature’s turn.',
        actions: [
            {
                name: 'Haunting Echo',
                desc: 'Dustwalker causes spectral notes to reverberate around a creature it can see within 60 feet. The target must succeed on a DC 16 Wisdom saving throw or take 9 (2d8) psychic damage and be frightened until the end of its next turn.',
            },
            {
                name: 'Command Encore',
                desc: 'Dustwalker commands a charmed creature within 30 feet to make a weapon attack or cast a cantrip of Dustwalker’s choice.',
            },
            {
                name: 'Resonant Shield',
                desc: 'Dustwalker envelops himself in a shimmering sound barrier, gaining 10 temporary hit points until the start of his next turn.',
            },
        ],
    },
    bonusActions: [
        {
            name: 'Words of the Shepherd',
            desc: 'Dustwalker targets one creature within 60 feet that can hear him. The target must make a DC 15 Charisma saving throw or be charmed until the start of Dustwalker’s next turn. While charmed, the creature must immediately use its reaction (if available) to move up to 15 feet toward Dustwalker by the safest route possible.',
            usage: 'Bonus Action, 2/day',
        },
        {
            name: 'Misty Step',
            desc: 'Briefly surrounded by silvery mist, Dustwalker teleports up to 30 feet to an unoccupied space he can see.',
            usage: 'Bonus Action, 1/day',
        },
    ],
    reactions: [
        {
            name: 'Counterpoint',
            desc: 'When Dustwalker is hit by an attack, he can impose disadvantage on the attack roll. On a miss, the attacker takes 5 (1d10) psychic damage.',
        },
    ],
    lairActions: {
        description: 'On initiative count 20 (losing initiative ties), Dustwalker takes a lair action to cause one of the following effects; Dustwalker can’t use the same effect two rounds in a row.',
        actions: [
            {
                name: 'Shadow Chorus',
                desc: 'Spectral voices erupt from the lair. Each creature of Dustwalker’s choice within 60 feet must succeed on a DC 15 Wisdom saving throw or take 10 (3d6) psychic damage and have disadvantage on Wisdom saves until the next round.',
            },
            {
                name: 'Echoing Steps',
                desc: 'Dustwalker and up to two allies can teleport up to 20 feet to an unoccupied space they can see.',
            },
        ],
    },
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
            id: 'slot-actions',
            name: 'Actions',
            position: { x: 16, y: 276, width: 178, height: 120 },
            allowedComponents: [
                'action-section',
                'trait-list',
                'bonus-action-section',
                'reaction-section',
                'legendary-actions',
                'lair-actions',
                'spellcasting-block',
            ],
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
            slotId: 'slot-flavor',
            componentType: 'flavor-summary',
            defaultDataRef: { type: 'statblock', path: 'description' },
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
        {
            slotId: 'slot-actions',
            componentType: 'bonus-action-section',
            defaultDataRef: { type: 'statblock', path: 'bonusActions' },
        },
        {
            slotId: 'slot-actions',
            componentType: 'reaction-section',
            defaultDataRef: { type: 'statblock', path: 'reactions' },
        },
        {
            slotId: 'slot-actions',
            componentType: 'trait-list',
            defaultDataRef: { type: 'statblock', path: 'specialAbilities' },
        },
        {
            slotId: 'slot-actions',
            componentType: 'legendary-actions',
            defaultDataRef: { type: 'statblock', path: 'legendaryActions' },
        },
        {
            slotId: 'slot-actions',
            componentType: 'lair-actions',
            defaultDataRef: { type: 'statblock', path: 'lairActions' },
        },
        {
            slotId: 'slot-actions',
            componentType: 'spellcasting-block',
            defaultDataRef: { type: 'statblock', path: 'spells' },
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
        'bonus-action-section',
        'reaction-section',
        'legendary-actions',
        'lair-actions',
        'spellcasting-block',
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


