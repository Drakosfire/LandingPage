/**
 * Demo Character: High Elf Wizard Level 5
 * 
 * Spellcasting character for testing spell sheet rendering.
 * 
 * @module PlayerCharacterGenerator/canvasComponents/demoData/DEMO_WIZARD
 */

import { Character } from '../../types/character.types';
import { DnD5eCharacter } from '../../types/dnd5e/character.types';

const NOW = new Date().toISOString();

/**
 * Complete D&D 5e data for Elara Starweave
 * High Elf Wizard Level 5 with Sage background
 */
const dnd5eData: DnD5eCharacter = {
    // ===== ABILITY SCORES =====
    // Standard Array: 15, 14, 13, 12, 10, 8
    // INT 15+1(elf)=16, DEX 14+2(elf)=16, CON 13, WIS 12, CHA 10, STR 8
    abilityScores: {
        strength: 8,
        dexterity: 16,     // 14 + 2 high elf
        constitution: 13,
        intelligence: 16,  // 15 + 1 high elf
        wisdom: 12,
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
            {
                id: 'darkvision',
                name: 'Darkvision',
                description: 'You can see in dim light within 60 feet as if bright light, and darkness as dim light.'
            },
            {
                id: 'fey-ancestry',
                name: 'Fey Ancestry',
                description: 'Advantage on saves vs being charmed, magic can\'t put you to sleep.'
            },
            {
                id: 'trance',
                name: 'Trance',
                description: 'Elves don\'t need to sleep. 4 hours of meditation equals 8 hours of sleep.'
            },
            {
                id: 'cantrip',
                name: 'Cantrip',
                description: 'You know one cantrip of your choice from the wizard spell list (Fire Bolt).'
            }
        ],
        description: 'High elves are graceful and wise, with a natural affinity for magic.',
        source: 'SRD'
    },

    // ===== CLASS =====
    classes: [{
        name: 'Wizard',
        level: 5,
        subclass: 'School of Evocation',
        hitDie: 6,
        features: [
            {
                id: 'arcane-recovery',
                name: 'Arcane Recovery',
                description: 'Once per day during a short rest, you can recover spell slots with combined level up to half your wizard level (rounded up).',
                source: 'class',
                sourceDetails: 'Wizard Level 1',
                limitedUse: { maxUses: 1, currentUses: 1, resetOn: 'long' }
            },
            {
                id: 'evocation-savant',
                name: 'Evocation Savant',
                description: 'Gold and time to copy evocation spells into your spellbook is halved.',
                source: 'class',
                sourceDetails: 'School of Evocation Level 2'
            },
            {
                id: 'sculpt-spells',
                name: 'Sculpt Spells',
                description: 'When you cast an evocation spell affecting others, you can choose a number of creatures equal to 1 + spell level. Those creatures automatically succeed on their saves and take no damage.',
                source: 'class',
                sourceDetails: 'School of Evocation Level 2'
            }
        ]
    }],

    // ===== BACKGROUND =====
    background: {
        id: 'sage',
        name: 'Sage',
        description: 'You spent years learning the lore of the multiverse.',
        skillProficiencies: ['Arcana', 'History'],
        toolProficiencies: [],
        equipment: [
            'A bottle of black ink',
            'A quill',
            'A small knife',
            'A letter from a dead colleague',
            'Common clothes',
            '10 gp'
        ],
        startingGold: 10,
        feature: {
            id: 'researcher',
            name: 'Researcher',
            description: 'When you attempt to learn or recall a piece of lore, if you do not know that information, you often know where and from whom you can obtain it.',
            source: 'background'
        },
        suggestedCharacteristics: {
            traits: ['I use polysyllabic words to convey the impression of great erudition.'],
            ideals: ['Knowledge. The path to power and self-improvement is through knowledge.'],
            bonds: ['I have an ancient text that holds terrible secrets that must not fall into the wrong hands.'],
            flaws: ['Unlocking an ancient mystery is worth the price of a civilization.']
        },
        source: 'SRD'
    },

    // ===== DERIVED STATS =====
    derivedStats: {
        armorClass: 13,         // Mage Armor (13 + DEX mod when cast)
        initiative: 3,          // DEX modifier (+3)
        proficiencyBonus: 3,    // Level 5-8 = +3
        speed: { walk: 30 },
        maxHp: 27,              // 6 + 4*4 + 5*1 (CON mod) = 27
        currentHp: 27,
        tempHp: 0,
        hitDice: { total: 5, current: 5, size: 6 },
        passivePerception: 11,  // 10 + WIS mod (+1)
        passiveInvestigation: 16, // 10 + INT mod (+3) + proficiency (+3)
        passiveInsight: 11
    },

    // ===== PROFICIENCIES =====
    proficiencies: {
        skills: ['Arcana', 'History', 'Investigation', 'Insight'],
        savingThrows: ['intelligence', 'wisdom'],
        armor: [],
        weapons: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'],
        tools: [],
        languages: ['Common', 'Elvish', 'Draconic', 'Celestial']
    },

    // ===== EQUIPMENT =====
    equipment: [
        { id: 'component-pouch', name: 'Component Pouch', type: 'adventuring gear', quantity: 1, weight: 2, value: 25 },
        { id: 'spellbook', name: 'Spellbook', type: 'adventuring gear', quantity: 1, weight: 3, value: 50, description: 'Contains all known spells' },
        { id: 'scholars-pack', name: "Scholar's Pack", type: 'container', quantity: 1, weight: 10, value: 40 },
        { id: 'ink-bottle', name: 'Ink (1 oz bottle)', type: 'adventuring gear', quantity: 2, weight: 0, value: 10 },
        { id: 'quill', name: 'Quill', type: 'adventuring gear', quantity: 3, weight: 0, value: 0.02 },
        { id: 'parchment', name: 'Parchment (sheet)', type: 'adventuring gear', quantity: 20, weight: 0, value: 0.1 },
        { id: 'robes', name: 'Fine Robes', type: 'adventuring gear', quantity: 1, weight: 4, value: 15 },

        // Magic items
        { id: 'pearl-power', name: 'Pearl of Power', type: 'wondrous item', quantity: 1, weight: 0, isMagical: true, requiresAttunement: true, rarity: 'uncommon', description: 'Regain one 3rd-level or lower spell slot' },
        { id: 'wand-magic-missile', name: 'Wand of Magic Missiles', type: 'wondrous item', quantity: 1, weight: 1, isMagical: true, requiresAttunement: false, rarity: 'uncommon', description: '7 charges, regains 1d6+1 at dawn' },

        // Consumables
        { id: 'potion-healing', name: 'Potion of Healing', type: 'consumable', quantity: 2, weight: 0.5, value: 50, isMagical: true, rarity: 'common', description: '2d4+2 HP' },
        { id: 'scroll-identify', name: 'Spell Scroll (Identify)', type: 'consumable', quantity: 1, weight: 0, isMagical: true, rarity: 'common' },
        { id: 'scroll-comprehend', name: 'Spell Scroll (Comprehend Languages)', type: 'consumable', quantity: 1, weight: 0, isMagical: true, rarity: 'common' }
    ],

    weapons: [
        {
            id: 'quarterstaff',
            name: 'Quarterstaff',
            type: 'weapon',
            weaponCategory: 'simple',
            weaponType: 'melee',
            damage: '1d6',
            damageType: 'bludgeoning',
            properties: ['versatile'],
            weight: 4,
            quantity: 1,
            value: 0.2
        },
        {
            id: 'dagger',
            name: 'Dagger',
            type: 'weapon',
            weaponCategory: 'simple',
            weaponType: 'melee',
            damage: '1d4',
            damageType: 'piercing',
            properties: ['finesse', 'light', 'thrown'],
            range: { normal: 20, long: 60 },
            weight: 1,
            quantity: 2,
            value: 2
        }
    ],

    // No armor (relies on Mage Armor spell)
    armor: undefined,
    shield: false,

    // ===== ATTUNEMENT =====
    attunement: {
        maxSlots: 3,
        attunedItemIds: ['pearl-power']
    },

    // ===== SPELLCASTING =====
    spellcasting: {
        class: 'Wizard',
        ability: 'intelligence',
        spellSaveDC: 14,         // 8 + 3 (prof) + 3 (INT)
        spellAttackBonus: 6,     // 3 (prof) + 3 (INT)

        cantrips: [
            { id: 'fire-bolt', name: 'Fire Bolt', level: 0, school: 'evocation', castingTime: '1 action', range: '120 feet', components: { verbal: true, somatic: true, material: false }, duration: 'Instantaneous', concentration: false, ritual: false, description: 'You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 2d10 fire damage. A flammable object hit by this spell ignites if it isn\'t being worn or carried.', damage: { type: 'fire', dice: '2d10' }, classes: ['wizard'], source: 'SRD' },
            { id: 'light', name: 'Light', level: 0, school: 'evocation', castingTime: '1 action', range: 'Touch', components: { verbal: true, somatic: false, material: true, materialDescription: 'a firefly or phosphorescent moss' }, duration: '1 hour', concentration: false, ritual: false, description: 'You touch one object that is no larger than 10 feet in any dimension. Until the spell ends, the object sheds bright light in a 20-foot radius and dim light for an additional 20 feet.', classes: ['wizard', 'cleric'], source: 'SRD' },
            { id: 'mage-hand', name: 'Mage Hand', level: 0, school: 'conjuration', castingTime: '1 action', range: '30 feet', components: { verbal: true, somatic: true, material: false }, duration: '1 minute', concentration: false, ritual: false, description: 'A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration or until you dismiss it. The hand can\'t attack, activate magic items, or carry more than 10 pounds.', classes: ['wizard'], source: 'SRD' },
            { id: 'prestidigitation', name: 'Prestidigitation', level: 0, school: 'transmutation', castingTime: '1 action', range: '10 feet', components: { verbal: true, somatic: true, material: false }, duration: 'Up to 1 hour', concentration: false, ritual: false, description: 'This spell is a minor magical trick that novice spellcasters use for practice. You create one of the following magical effects: sensory effect, light/snuff candle, clean/soil object, chill/warm/flavor material, make symbol/mark, or create trinket.', classes: ['wizard'], source: 'SRD' },
            { id: 'ray-of-frost', name: 'Ray of Frost', level: 0, school: 'evocation', castingTime: '1 action', range: '60 feet', components: { verbal: true, somatic: true, material: false }, duration: 'Instantaneous', concentration: false, ritual: false, description: 'A frigid beam of blue-white light streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, it takes 2d8 cold damage, and its speed is reduced by 10 feet until the start of your next turn.', damage: { type: 'cold', dice: '2d8' }, classes: ['wizard'], source: 'SRD' }
        ],

        spellsKnown: [
            // 1st Level
            { id: 'detect-magic', name: 'Detect Magic', level: 1, school: 'divination', castingTime: '1 action', range: 'Self', components: { verbal: true, somatic: true, material: false }, duration: 'Concentration, up to 10 minutes', concentration: true, ritual: true, description: 'For the duration, you sense the presence of magic within 30 feet of you. If you sense magic in this way, you can use your action to see a faint aura around any visible creature or object in the area that bears magic, and you learn its school of magic, if any.', classes: ['wizard', 'cleric'], source: 'SRD' },
            { id: 'magic-missile', name: 'Magic Missile', level: 1, school: 'evocation', castingTime: '1 action', range: '120 feet', components: { verbal: true, somatic: true, material: false }, duration: 'Instantaneous', concentration: false, ritual: false, description: 'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range. A dart deals 1d4 + 1 force damage to its target. The darts all strike simultaneously.', damage: { type: 'force', dice: '3d4+3' }, higherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, the spell creates one more dart for each slot level above 1st.', classes: ['wizard'], source: 'SRD' },
            { id: 'shield', name: 'Shield', level: 1, school: 'abjuration', castingTime: '1 reaction', range: 'Self', components: { verbal: true, somatic: true, material: false }, duration: '1 round', concentration: false, ritual: false, description: 'An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile.', classes: ['wizard'], source: 'SRD' },
            { id: 'sleep', name: 'Sleep', level: 1, school: 'enchantment', castingTime: '1 action', range: '90 feet', components: { verbal: true, somatic: true, material: true, materialDescription: 'a pinch of sand, rose petals, or a cricket' }, duration: '1 minute', concentration: false, ritual: false, description: 'This spell sends creatures into a magical slumber. Roll 5d8; the total is how many hit points of creatures this spell can affect. Creatures within 20 feet of a point you choose within range are affected in ascending order of their current hit points.', higherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, roll an additional 2d8 for each slot level above 1st.', classes: ['wizard'], source: 'SRD' },
            { id: 'thunderwave', name: 'Thunderwave', level: 1, school: 'evocation', castingTime: '1 action', range: 'Self (15-foot cube)', components: { verbal: true, somatic: true, material: false }, duration: 'Instantaneous', concentration: false, ritual: false, description: 'A wave of thunderous force sweeps out from you. Each creature in a 15-foot cube originating from you must make a Constitution saving throw. On a failed save, a creature takes 2d8 thunder damage and is pushed 10 feet away from you.', damage: { type: 'thunder', dice: '2d8' }, higherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d8 for each slot level above 1st.', classes: ['wizard'], source: 'SRD' },
            { id: 'mage-armor', name: 'Mage Armor', level: 1, school: 'abjuration', castingTime: '1 action', range: 'Touch', components: { verbal: true, somatic: true, material: true, materialDescription: 'a piece of cured leather' }, duration: '8 hours', concentration: false, ritual: false, description: 'You touch a willing creature who isn\'t wearing armor, and a protective magical force surrounds it until the spell ends. The target\'s base AC becomes 13 + its Dexterity modifier. The spell ends if the target dons armor.', classes: ['wizard'], source: 'SRD' },
            { id: 'find-familiar', name: 'Find Familiar', level: 1, school: 'conjuration', castingTime: '1 hour', range: '10 feet', components: { verbal: true, somatic: true, material: true, materialDescription: '10 gp worth of charcoal, incense, and herbs that must be consumed', consumesMaterial: true }, duration: 'Instantaneous', concentration: false, ritual: true, description: 'You gain the service of a familiar, a spirit that takes an animal form you choose: bat, cat, crab, frog, hawk, lizard, octopus, owl, poisonous snake, fish, rat, raven, sea horse, spider, or weasel.', classes: ['wizard'], source: 'SRD' },

            // 2nd Level
            { id: 'hold-person', name: 'Hold Person', level: 2, school: 'enchantment', castingTime: '1 action', range: '60 feet', components: { verbal: true, somatic: true, material: true, materialDescription: 'a small, straight piece of iron' }, duration: 'Concentration, up to 1 minute', concentration: true, ritual: false, description: 'Choose a humanoid that you can see within range. The target must succeed on a Wisdom saving throw or be paralyzed for the duration. At the end of each of its turns, the target can make another Wisdom saving throw.', higherLevels: 'When you cast this spell using a spell slot of 3rd level or higher, you can target one additional humanoid for each slot level above 2nd.', classes: ['wizard', 'cleric'], source: 'SRD' },
            { id: 'invisibility', name: 'Invisibility', level: 2, school: 'illusion', castingTime: '1 action', range: 'Touch', components: { verbal: true, somatic: true, material: true, materialDescription: 'an eyelash encased in gum arabic' }, duration: 'Concentration, up to 1 hour', concentration: true, ritual: false, description: 'A creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible as long as it is on the target\'s person. The spell ends for a target that attacks or casts a spell.', higherLevels: 'When you cast this spell using a spell slot of 3rd level or higher, you can target one additional creature for each slot level above 2nd.', classes: ['wizard'], source: 'SRD' },
            { id: 'misty-step', name: 'Misty Step', level: 2, school: 'conjuration', castingTime: '1 bonus action', range: 'Self', components: { verbal: true, somatic: false, material: false }, duration: 'Instantaneous', concentration: false, ritual: false, description: 'Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see.', classes: ['wizard'], source: 'SRD' },
            { id: 'scorching-ray', name: 'Scorching Ray', level: 2, school: 'evocation', castingTime: '1 action', range: '120 feet', components: { verbal: true, somatic: true, material: false }, duration: 'Instantaneous', concentration: false, ritual: false, description: 'You create three rays of fire and hurl them at targets within range. You can hurl them at one target or several. Make a ranged spell attack for each ray. On a hit, the target takes 2d6 fire damage.', damage: { type: 'fire', dice: '6d6' }, higherLevels: 'When you cast this spell using a spell slot of 3rd level or higher, you create one additional ray for each slot level above 2nd.', classes: ['wizard'], source: 'SRD' },

            // 3rd Level
            { id: 'counterspell', name: 'Counterspell', level: 3, school: 'abjuration', castingTime: '1 reaction', range: '60 feet', components: { verbal: false, somatic: true, material: false }, duration: 'Instantaneous', concentration: false, ritual: false, description: 'You attempt to interrupt a creature in the process of casting a spell. If the creature is casting a spell of 3rd level or lower, its spell fails and has no effect. If it is casting a spell of 4th level or higher, make an ability check using your spellcasting ability.', higherLevels: 'When you cast this spell using a spell slot of 4th level or higher, the interrupted spell has no effect if its level is less than or equal to the level of the spell slot you used.', classes: ['wizard'], source: 'SRD' },
            { id: 'fireball', name: 'Fireball', level: 3, school: 'evocation', castingTime: '1 action', range: '150 feet', components: { verbal: true, somatic: true, material: true, materialDescription: 'a tiny ball of bat guano and sulfur' }, duration: 'Instantaneous', concentration: false, ritual: false, description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one.', damage: { type: 'fire', dice: '8d6' }, higherLevels: 'When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.', classes: ['wizard'], source: 'SRD' },
            { id: 'fly', name: 'Fly', level: 3, school: 'transmutation', castingTime: '1 action', range: 'Touch', components: { verbal: true, somatic: true, material: true, materialDescription: 'a wing feather from any bird' }, duration: 'Concentration, up to 10 minutes', concentration: true, ritual: false, description: 'You touch a willing creature. The target gains a flying speed of 60 feet for the duration. When the spell ends, the target falls if it is still aloft, unless it can stop the fall.', higherLevels: 'When you cast this spell using a spell slot of 4th level or higher, you can target one additional creature for each slot level above 3rd.', classes: ['wizard'], source: 'SRD' }
        ],

        spellsPrepared: [
            'detect-magic', 'magic-missile', 'shield', 'mage-armor',
            'hold-person', 'misty-step', 'scorching-ray',
            'counterspell', 'fireball'
        ],

        spellSlots: {
            1: { total: 4, used: 2 },
            2: { total: 3, used: 0 },
            3: { total: 2, used: 1 }
        }
    },

    // ===== FEATURES =====
    features: [
        {
            id: 'darkvision-elf',
            name: 'Darkvision',
            description: 'You can see in dim light within 60 feet as if bright light.',
            source: 'race',
            sourceDetails: 'High Elf'
        },
        {
            id: 'fey-ancestry',
            name: 'Fey Ancestry',
            description: 'Advantage on saves vs being charmed, magic can\'t put you to sleep.',
            source: 'race',
            sourceDetails: 'High Elf'
        },
        {
            id: 'researcher',
            name: 'Researcher',
            description: 'When you attempt to learn or recall a piece of lore, if you do not know that information, you often know where and from whom you can obtain it.',
            source: 'background',
            sourceDetails: 'Sage'
        }
    ],

    // ===== PERSONALITY =====
    personality: {
        traits: ['I use polysyllabic words to convey the impression of great erudition.', 'I am horribly awkward in social situations.'],
        ideals: ['Knowledge. The path to power and self-improvement is through knowledge.'],
        bonds: ['I have an ancient text that holds terrible secrets that must not fall into the wrong hands.'],
        flaws: ['Unlocking an ancient mystery is worth the price of a civilization.']
    },

    // ===== OPTIONAL DETAILS =====
    alignment: 'true neutral',
    age: 127,
    height: '5\'6"',
    weight: '118 lbs',
    eyes: 'Violet',
    skin: 'Pale',
    hair: 'Silver-white, worn long',
    appearance: 'A slender elven woman with sharp features and an ever-present look of distraction, as if listening to something only she can hear.',

    // ===== CURRENCY =====
    currency: { cp: 15, sp: 48, ep: 0, gp: 156, pp: 3 }
};

/**
 * Complete Character wrapper for canvas testing
 */
export const DEMO_WIZARD: Character = {
    id: 'demo-wizard-elara-starweave',
    name: 'Elara Starweave',
    level: 5,
    system: 'dnd5e',
    dnd5eData,
    createdAt: NOW,
    updatedAt: NOW,
    version: 1
};

export const DEMO_WIZARD_DATA = dnd5eData;

export function createDemoWizard(): Character {
    return JSON.parse(JSON.stringify(DEMO_WIZARD));
}

export default DEMO_WIZARD;

