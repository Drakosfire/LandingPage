/**
 * Demo Character: High Elf Wizard Level 20 - OVERFLOW TEST
 * 
 * High-level wizard with extensive spellbook to test spell sheet overflow.
 * Contains 50+ spells across all levels to trigger multi-page pagination.
 * 
 * @module PlayerCharacterGenerator/canvasComponents/demoData/DEMO_WIZARD_OVERFLOW
 */

import { Character } from '../../types/character.types';
import { DnD5eCharacter } from '../../types/dnd5e/character.types';
import type { DnD5eSpell } from '../../types/dnd5e/spell.types';

const NOW = new Date().toISOString();

// ============================================================================
// SPELL DATA - Full spellbook for overflow testing
// ============================================================================

// Helper to create spell entries
const spell = (
    id: string,
    name: string,
    level: number,
    school: DnD5eSpell['school'],
    options: Partial<DnD5eSpell> = {}
): DnD5eSpell => ({
    id,
    name,
    level,
    school,
    castingTime: options.castingTime ?? '1 action',
    range: options.range ?? '60 feet',
    components: options.components ?? { verbal: true, somatic: true, material: false },
    duration: options.duration ?? 'Instantaneous',
    concentration: options.concentration ?? false,
    ritual: options.ritual ?? false,
    description: options.description ?? `${name} spell description.`,
    classes: options.classes ?? ['wizard'],
    source: options.source ?? 'SRD',
    ...options
});

// CANTRIPS (5 - wizard max at level 20)
const CANTRIPS: DnD5eSpell[] = [
    spell('fire-bolt', 'Fire Bolt', 0, 'evocation', { damage: { type: 'fire', dice: '4d10' }, range: '120 feet' }),
    spell('light', 'Light', 0, 'evocation', { duration: '1 hour', range: 'Touch' }),
    spell('mage-hand', 'Mage Hand', 0, 'conjuration', { duration: '1 minute', range: '30 feet' }),
    spell('prestidigitation', 'Prestidigitation', 0, 'transmutation', { duration: 'Up to 1 hour', range: '10 feet' }),
    spell('ray-of-frost', 'Ray of Frost', 0, 'evocation', { damage: { type: 'cold', dice: '4d8' } }),
];

// 1ST LEVEL SPELLS (10)
const LEVEL_1_SPELLS: DnD5eSpell[] = [
    spell('alarm', 'Alarm', 1, 'abjuration', { ritual: true, duration: '8 hours', range: '30 feet' }),
    spell('burning-hands', 'Burning Hands', 1, 'evocation', { damage: { type: 'fire', dice: '3d6' }, range: 'Self (15-foot cone)' }),
    spell('charm-person', 'Charm Person', 1, 'enchantment', { duration: '1 hour', range: '30 feet' }),
    spell('detect-magic', 'Detect Magic', 1, 'divination', { ritual: true, concentration: true, duration: 'Concentration, up to 10 minutes', range: 'Self' }),
    spell('find-familiar', 'Find Familiar', 1, 'conjuration', { ritual: true, castingTime: '1 hour', range: '10 feet' }),
    spell('identify', 'Identify', 1, 'divination', { ritual: true, castingTime: '1 minute', range: 'Touch' }),
    spell('mage-armor', 'Mage Armor', 1, 'abjuration', { duration: '8 hours', range: 'Touch' }),
    spell('magic-missile', 'Magic Missile', 1, 'evocation', { damage: { type: 'force', dice: '3d4+3' }, range: '120 feet' }),
    spell('shield', 'Shield', 1, 'abjuration', { castingTime: '1 reaction', duration: '1 round', range: 'Self' }),
    spell('sleep', 'Sleep', 1, 'enchantment', { range: '90 feet', duration: '1 minute' }),
];

// 2ND LEVEL SPELLS (9)
const LEVEL_2_SPELLS: DnD5eSpell[] = [
    spell('blur', 'Blur', 2, 'illusion', { concentration: true, duration: 'Concentration, up to 1 minute', range: 'Self' }),
    spell('darkness', 'Darkness', 2, 'evocation', { concentration: true, duration: 'Concentration, up to 10 minutes' }),
    spell('hold-person', 'Hold Person', 2, 'enchantment', { concentration: true, duration: 'Concentration, up to 1 minute' }),
    spell('invisibility', 'Invisibility', 2, 'illusion', { concentration: true, duration: 'Concentration, up to 1 hour', range: 'Touch' }),
    spell('knock', 'Knock', 2, 'transmutation', { range: '60 feet' }),
    spell('levitate', 'Levitate', 2, 'transmutation', { concentration: true, duration: 'Concentration, up to 10 minutes' }),
    spell('misty-step', 'Misty Step', 2, 'conjuration', { castingTime: '1 bonus action', range: 'Self' }),
    spell('scorching-ray', 'Scorching Ray', 2, 'evocation', { damage: { type: 'fire', dice: '6d6' }, range: '120 feet' }),
    spell('web', 'Web', 2, 'conjuration', { concentration: true, duration: 'Concentration, up to 1 hour' }),
];

// 3RD LEVEL SPELLS (9)
const LEVEL_3_SPELLS: DnD5eSpell[] = [
    spell('counterspell', 'Counterspell', 3, 'abjuration', { castingTime: '1 reaction', range: '60 feet' }),
    spell('dispel-magic', 'Dispel Magic', 3, 'abjuration', { range: '120 feet' }),
    spell('fireball', 'Fireball', 3, 'evocation', { damage: { type: 'fire', dice: '8d6' }, range: '150 feet' }),
    spell('fly', 'Fly', 3, 'transmutation', { concentration: true, duration: 'Concentration, up to 10 minutes', range: 'Touch' }),
    spell('haste', 'Haste', 3, 'transmutation', { concentration: true, duration: 'Concentration, up to 1 minute', range: '30 feet' }),
    spell('hypnotic-pattern', 'Hypnotic Pattern', 3, 'illusion', { concentration: true, duration: 'Concentration, up to 1 minute', range: '120 feet' }),
    spell('lightning-bolt', 'Lightning Bolt', 3, 'evocation', { damage: { type: 'lightning', dice: '8d6' }, range: 'Self (100-foot line)' }),
    spell('slow', 'Slow', 3, 'transmutation', { concentration: true, duration: 'Concentration, up to 1 minute', range: '120 feet' }),
    spell('tongues', 'Tongues', 3, 'divination', { duration: '1 hour', range: 'Touch' }),
];

// 4TH LEVEL SPELLS (8)
const LEVEL_4_SPELLS: DnD5eSpell[] = [
    spell('arcane-eye', 'Arcane Eye', 4, 'divination', { concentration: true, duration: 'Concentration, up to 1 hour', range: '30 feet' }),
    spell('banishment', 'Banishment', 4, 'abjuration', { concentration: true, duration: 'Concentration, up to 1 minute', range: '60 feet' }),
    spell('dimension-door', 'Dimension Door', 4, 'conjuration', { range: '500 feet' }),
    spell('fire-shield', 'Fire Shield', 4, 'evocation', { duration: '10 minutes', range: 'Self' }),
    spell('greater-invisibility', 'Greater Invisibility', 4, 'illusion', { concentration: true, duration: 'Concentration, up to 1 minute', range: 'Touch' }),
    spell('ice-storm', 'Ice Storm', 4, 'evocation', { damage: { type: 'cold', dice: '2d8' }, range: '300 feet' }),
    spell('polymorph', 'Polymorph', 4, 'transmutation', { concentration: true, duration: 'Concentration, up to 1 hour', range: '60 feet' }),
    spell('wall-of-fire', 'Wall of Fire', 4, 'evocation', { concentration: true, duration: 'Concentration, up to 1 minute', range: '120 feet' }),
];

// 5TH LEVEL SPELLS (7)
const LEVEL_5_SPELLS: DnD5eSpell[] = [
    spell('animate-objects', 'Animate Objects', 5, 'transmutation', { concentration: true, duration: 'Concentration, up to 1 minute', range: '120 feet' }),
    spell('cloudkill', 'Cloudkill', 5, 'conjuration', { concentration: true, duration: 'Concentration, up to 10 minutes', range: '120 feet' }),
    spell('cone-of-cold', 'Cone of Cold', 5, 'evocation', { damage: { type: 'cold', dice: '8d8' }, range: 'Self (60-foot cone)' }),
    spell('dominate-person', 'Dominate Person', 5, 'enchantment', { concentration: true, duration: 'Concentration, up to 1 minute', range: '60 feet' }),
    spell('hold-monster', 'Hold Monster', 5, 'enchantment', { concentration: true, duration: 'Concentration, up to 1 minute', range: '90 feet' }),
    spell('telekinesis', 'Telekinesis', 5, 'transmutation', { concentration: true, duration: 'Concentration, up to 10 minutes', range: '60 feet' }),
    spell('wall-of-force', 'Wall of Force', 5, 'evocation', { concentration: true, duration: 'Concentration, up to 10 minutes', range: '120 feet' }),
];

// 6TH LEVEL SPELLS (6)
const LEVEL_6_SPELLS: DnD5eSpell[] = [
    spell('chain-lightning', 'Chain Lightning', 6, 'evocation', { damage: { type: 'lightning', dice: '10d8' }, range: '150 feet' }),
    spell('contingency', 'Contingency', 6, 'evocation', { duration: '10 days', castingTime: '10 minutes', range: 'Self' }),
    spell('disintegrate', 'Disintegrate', 6, 'transmutation', { damage: { type: 'force', dice: '10d6+40' }, range: '60 feet' }),
    spell('globe-of-invulnerability', 'Globe of Invulnerability', 6, 'abjuration', { concentration: true, duration: 'Concentration, up to 1 minute', range: 'Self (10-foot radius)' }),
    spell('mass-suggestion', 'Mass Suggestion', 6, 'enchantment', { duration: '24 hours', range: '60 feet' }),
    spell('true-seeing', 'True Seeing', 6, 'divination', { duration: '1 hour', range: 'Touch' }),
];

// 7TH LEVEL SPELLS (5)
const LEVEL_7_SPELLS: DnD5eSpell[] = [
    spell('delayed-blast-fireball', 'Delayed Blast Fireball', 7, 'evocation', { concentration: true, damage: { type: 'fire', dice: '12d6' }, range: '150 feet' }),
    spell('finger-of-death', 'Finger of Death', 7, 'necromancy', { damage: { type: 'necrotic', dice: '7d8+30' }, range: '60 feet' }),
    spell('forcecage', 'Forcecage', 7, 'evocation', { duration: '1 hour', range: '100 feet' }),
    spell('plane-shift', 'Plane Shift', 7, 'conjuration', { range: 'Touch' }),
    spell('teleport', 'Teleport', 7, 'conjuration', { range: '10 feet' }),
];

// 8TH LEVEL SPELLS (4)
const LEVEL_8_SPELLS: DnD5eSpell[] = [
    spell('antimagic-field', 'Antimagic Field', 8, 'abjuration', { concentration: true, duration: 'Concentration, up to 1 hour', range: 'Self (10-foot sphere)' }),
    spell('dominate-monster', 'Dominate Monster', 8, 'enchantment', { concentration: true, duration: 'Concentration, up to 1 hour', range: '60 feet' }),
    spell('maze', 'Maze', 8, 'conjuration', { concentration: true, duration: 'Concentration, up to 10 minutes', range: '60 feet' }),
    spell('power-word-stun', 'Power Word Stun', 8, 'enchantment', { range: '60 feet' }),
];

// 9TH LEVEL SPELLS (4)
const LEVEL_9_SPELLS: DnD5eSpell[] = [
    spell('gate', 'Gate', 9, 'conjuration', { concentration: true, duration: 'Concentration, up to 1 minute', range: '60 feet' }),
    spell('meteor-swarm', 'Meteor Swarm', 9, 'evocation', { damage: { type: 'fire', dice: '40d6' }, range: '1 mile' }),
    spell('power-word-kill', 'Power Word Kill', 9, 'enchantment', { range: '60 feet' }),
    spell('wish', 'Wish', 9, 'conjuration', { range: 'Self' }),
];

// All spells combined
const ALL_SPELLS = [
    ...LEVEL_1_SPELLS,
    ...LEVEL_2_SPELLS,
    ...LEVEL_3_SPELLS,
    ...LEVEL_4_SPELLS,
    ...LEVEL_5_SPELLS,
    ...LEVEL_6_SPELLS,
    ...LEVEL_7_SPELLS,
    ...LEVEL_8_SPELLS,
    ...LEVEL_9_SPELLS,
];

// ============================================================================
// CHARACTER DATA
// ============================================================================

/**
 * Complete D&D 5e data for Archmage Valdris
 * High Elf Wizard Level 20 with massive spellbook
 */
const dnd5eData: DnD5eCharacter = {
    // ===== ABILITY SCORES =====
    // Point buy + racial + ASIs
    abilityScores: {
        strength: 8,
        dexterity: 16,     // 14 + 2 high elf
        constitution: 16,  // Maximized for survival
        intelligence: 20,  // 15 + 1 high elf + 4 ASIs = 20
        wisdom: 14,
        charisma: 10
    },

    // ===== RACE =====
    race: {
        id: 'high-elf',
        name: 'High Elf',
        size: 'medium',
        speed: { walk: 30 },
        abilityBonuses: [
            { ability: 'dexterity', bonus: 2 },
            { ability: 'intelligence', bonus: 1 }
        ],
        languages: ['Common', 'Elvish', 'Draconic'],
        traits: [
            { id: 'darkvision', name: 'Darkvision', description: 'You can see in dim light within 60 feet.' },
            { id: 'fey-ancestry', name: 'Fey Ancestry', description: 'Advantage on saves vs charmed, magic can\'t put you to sleep.' },
            { id: 'trance', name: 'Trance', description: '4 hours of meditation equals 8 hours of sleep.' }
        ],
        description: 'A high elf who has devoted centuries to the arcane arts.',
        source: 'SRD'
    },

    // ===== CLASS =====
    classes: [{
        name: 'Wizard',
        level: 20,
        subclass: 'School of Evocation',
        hitDie: 6,
        features: [
            { id: 'arcane-recovery', name: 'Arcane Recovery', description: 'Recover spell slots during short rest.', source: 'class' },
            { id: 'evocation-savant', name: 'Evocation Savant', description: 'Half gold/time to copy evocation spells.', source: 'class' },
            { id: 'sculpt-spells', name: 'Sculpt Spells', description: 'Protect allies from your evocation spells.', source: 'class' },
            { id: 'potent-cantrip', name: 'Potent Cantrip', description: 'Cantrips deal half damage on successful save.', source: 'class' },
            { id: 'empowered-evocation', name: 'Empowered Evocation', description: 'Add INT to evocation damage.', source: 'class' },
            { id: 'overchannel', name: 'Overchannel', description: 'Maximize damage of 5th level or lower spell.', source: 'class' },
            { id: 'spell-mastery', name: 'Spell Mastery', description: 'Cast Shield and Misty Step at will.', source: 'class' },
            { id: 'signature-spells', name: 'Signature Spells', description: 'Cast Fireball and Counterspell once per short rest without slots.', source: 'class' }
        ]
    }],

    // ===== BACKGROUND =====
    background: {
        id: 'sage',
        name: 'Sage',
        description: 'Spent years learning the lore of the multiverse.',
        skillProficiencies: ['Arcana', 'History'],
        toolProficiencies: [],
        equipment: ['Spellbook', 'Component pouch', 'Scholar\'s robes'],
        startingGold: 10,
        feature: { id: 'researcher', name: 'Researcher', description: 'Know where to find obscure information.', source: 'background' },
        suggestedCharacteristics: {
            traits: ['I speak in riddles and metaphors.'],
            ideals: ['Knowledge is the ultimate power.'],
            bonds: ['My spellbook contains secrets that could reshape reality.'],
            flaws: ['I sometimes forget that mortals have such short lives.']
        },
        source: 'SRD'
    },

    // ===== DERIVED STATS =====
    derivedStats: {
        armorClass: 17,            // Robe of the Archmagi
        initiative: 3,             // DEX modifier
        proficiencyBonus: 6,       // Level 20
        speed: { walk: 30 },
        maxHp: 102,                // 6 + 19*4 + 20*3 (CON)
        currentHp: 102,
        tempHp: 0,
        hitDice: { total: 20, current: 20, size: 6 },
        passivePerception: 12,
        passiveInvestigation: 21,
        passiveInsight: 12
    },

    // ===== PROFICIENCIES =====
    proficiencies: {
        skills: ['Arcana', 'History', 'Investigation', 'Insight'],
        savingThrows: ['intelligence', 'wisdom'],
        armor: [],
        weapons: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'],
        tools: [],
        languages: ['Common', 'Elvish', 'Draconic', 'Celestial', 'Infernal', 'Primordial']
    },

    // ===== EQUIPMENT =====
    equipment: [
        { id: 'robe-archmagi', name: 'Robe of the Archmagi', type: 'wondrous item', quantity: 1, isMagical: true, rarity: 'legendary', requiresAttunement: true },
        { id: 'staff-power', name: 'Staff of Power', type: 'wondrous item', quantity: 1, isMagical: true, rarity: 'very rare', requiresAttunement: true },
        { id: 'ring-protection', name: 'Ring of Protection', type: 'wondrous item', quantity: 1, isMagical: true, rarity: 'rare', requiresAttunement: true },
        { id: 'spellbook', name: 'Spellbook', type: 'adventuring gear', quantity: 1, weight: 3 },
        { id: 'component-pouch', name: 'Component Pouch', type: 'adventuring gear', quantity: 1, weight: 2 }
    ],

    weapons: [
        { id: 'staff-power-weapon', name: 'Staff of Power', type: 'weapon', weaponCategory: 'simple', weaponType: 'melee', damage: '1d6+3', damageType: 'bludgeoning', properties: ['versatile'], weight: 4, quantity: 1, isMagical: true }
    ],

    armor: undefined,
    shield: false,

    // ===== ATTUNEMENT =====
    attunement: {
        maxSlots: 3,
        attunedItemIds: ['robe-archmagi', 'staff-power', 'ring-protection']
    },

    // ===== SPELLCASTING - THE BIG ONE =====
    spellcasting: {
        class: 'Wizard',
        ability: 'intelligence',
        spellSaveDC: 19,           // 8 + 6 (prof) + 5 (INT)
        spellAttackBonus: 11,      // 6 (prof) + 5 (INT)

        cantrips: CANTRIPS,
        spellsKnown: ALL_SPELLS,

        // Prepared spells (INT mod + wizard level = 25)
        spellsPrepared: [
            'shield', 'magic-missile', 'mage-armor', 'detect-magic',
            'misty-step', 'scorching-ray', 'hold-person',
            'counterspell', 'fireball', 'fly', 'haste',
            'dimension-door', 'polymorph', 'greater-invisibility',
            'wall-of-force', 'hold-monster', 'telekinesis',
            'disintegrate', 'chain-lightning',
            'teleport', 'forcecage',
            'maze', 'power-word-stun',
            'wish', 'meteor-swarm'
        ],

        // Level 20 wizard spell slots
        spellSlots: {
            1: { total: 4, used: 1 },
            2: { total: 3, used: 0 },
            3: { total: 3, used: 1 },
            4: { total: 3, used: 0 },
            5: { total: 3, used: 0 },
            6: { total: 2, used: 0 },
            7: { total: 2, used: 0 },
            8: { total: 1, used: 0 },
            9: { total: 1, used: 0 }
        }
    },

    // ===== FEATURES =====
    features: [
        { id: 'darkvision-elf', name: 'Darkvision', description: 'See in dim light within 60 feet.', source: 'race' },
        { id: 'fey-ancestry', name: 'Fey Ancestry', description: 'Advantage on saves vs charmed.', source: 'race' },
        { id: 'trance', name: 'Trance', description: '4 hours of meditation.', source: 'race' },
        { id: 'researcher', name: 'Researcher', description: 'Know where to find obscure lore.', source: 'background' }
    ],

    // ===== PERSONALITY =====
    personality: {
        traits: ['I speak in riddles and metaphors.', 'I\'ve seen civilizations rise and fall.'],
        ideals: ['Knowledge is the ultimate power.'],
        bonds: ['My spellbook contains secrets that could reshape reality.'],
        flaws: ['I sometimes forget that mortals have such short lives.']
    },

    alignment: 'true neutral',
    age: 750,
    height: '5\'10"',
    weight: '145 lbs',
    eyes: 'Silver',
    skin: 'Pale',
    hair: 'White',

    currency: { cp: 0, sp: 0, ep: 0, gp: 50000, pp: 500 }
};

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Complete Character wrapper for overflow testing
 * 
 * This character has:
 * - 5 cantrips
 * - 62 known spells across levels 1-9
 * - 25 prepared spells
 * 
 * This should DEFINITELY trigger spell sheet overflow!
 */
export const DEMO_WIZARD_OVERFLOW: Character = {
    id: 'demo-wizard-overflow-valdris',
    name: 'Archmage Valdris',
    level: 20,
    system: 'dnd5e',
    dnd5eData,
    createdAt: NOW,
    updatedAt: NOW,
    version: 1
};

export const DEMO_WIZARD_OVERFLOW_DATA = dnd5eData;

export function createDemoWizardOverflow(): Character {
    return JSON.parse(JSON.stringify(DEMO_WIZARD_OVERFLOW));
}

/**
 * Spell count summary for reference:
 * - Cantrips: 5
 * - 1st Level: 10
 * - 2nd Level: 9
 * - 3rd Level: 9
 * - 4th Level: 8
 * - 5th Level: 7
 * - 6th Level: 6
 * - 7th Level: 5
 * - 8th Level: 4
 * - 9th Level: 4
 * - TOTAL: 67 spells (5 cantrips + 62 leveled)
 */
export const SPELL_COUNT_SUMMARY = {
    cantrips: CANTRIPS.length,
    level1: LEVEL_1_SPELLS.length,
    level2: LEVEL_2_SPELLS.length,
    level3: LEVEL_3_SPELLS.length,
    level4: LEVEL_4_SPELLS.length,
    level5: LEVEL_5_SPELLS.length,
    level6: LEVEL_6_SPELLS.length,
    level7: LEVEL_7_SPELLS.length,
    level8: LEVEL_8_SPELLS.length,
    level9: LEVEL_9_SPELLS.length,
    total: CANTRIPS.length + ALL_SPELLS.length
};

export default DEMO_WIZARD_OVERFLOW;

