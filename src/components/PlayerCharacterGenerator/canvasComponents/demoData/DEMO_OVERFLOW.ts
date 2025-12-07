/**
 * Demo Character: Overflow Test Character
 * 
 * A high-level multiclass character designed to trigger overflow in all
 * pagination-capable sections:
 * - Features (15+ features from multiclass + race + background)
 * - Spells (full wizard spellbook with all levels)
 * - Inventory (extensive equipment in every category)
 * 
 * Use this character to test pagination and overflow handling.
 * 
 * @module PlayerCharacterGenerator/canvasComponents/demoData/DEMO_OVERFLOW
 */

import { Character } from '../../types/character.types';
import { DnD5eCharacter } from '../../types/dnd5e/character.types';

const NOW = new Date().toISOString();

/**
 * Complete D&D 5e data for Valdris the Collector
 * Half-Elf Fighter 5 / Wizard 5 / Warlock 2 (Level 12)
 * 
 * This multiclass build generates MANY features to test overflow.
 */
const dnd5eData: DnD5eCharacter = {
    // ===== ABILITY SCORES =====
    abilityScores: {
        strength: 14,
        dexterity: 14,
        constitution: 14,
        intelligence: 16,
        wisdom: 10,
        charisma: 14
    },

    // ===== RACE =====
    race: {
        id: 'half-elf',
        name: 'Half-Elf',
        size: 'medium',
        speed: { walk: 30 },
        abilityBonuses: [
            { ability: 'charisma', bonus: 2 },
            { ability: 'intelligence', bonus: 1 },
            { ability: 'constitution', bonus: 1 }
        ],
        languages: ['Common', 'Elvish', 'Dwarvish'],
        traits: [
            {
                id: 'darkvision',
                name: 'Darkvision',
                description: 'Thanks to your elf blood, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light.'
            },
            {
                id: 'fey-ancestry',
                name: 'Fey Ancestry',
                description: 'You have advantage on saving throws against being charmed, and magic can\'t put you to sleep.'
            },
            {
                id: 'skill-versatility',
                name: 'Skill Versatility',
                description: 'You gain proficiency in two skills of your choice.'
            }
        ],
        description: 'Half-elves combine what some say are the best qualities of their elf and human parents.',
        source: 'SRD'
    },

    // ===== CLASSES (Multiclass for MANY features) =====
    classes: [
        {
            name: 'Fighter',
            level: 5,
            subclass: 'Champion',
            hitDie: 10,
            features: [
                {
                    id: 'fighting-style-defense',
                    name: 'Fighting Style: Defense',
                    description: 'While you are wearing armor, you gain a +1 bonus to AC.',
                    source: 'class',
                    sourceDetails: 'Fighter Level 1'
                },
                {
                    id: 'second-wind',
                    name: 'Second Wind',
                    description: 'You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level. Once you use this feature, you must finish a short or long rest before you can use it again.',
                    source: 'class',
                    sourceDetails: 'Fighter Level 1',
                    limitedUse: { maxUses: 1, currentUses: 1, resetOn: 'short' }
                },
                {
                    id: 'action-surge',
                    name: 'Action Surge',
                    description: 'Starting at 2nd level, you can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action. Once you use this feature, you must finish a short or long rest before you can use it again.',
                    source: 'class',
                    sourceDetails: 'Fighter Level 2',
                    limitedUse: { maxUses: 1, currentUses: 1, resetOn: 'short' }
                },
                {
                    id: 'improved-critical',
                    name: 'Improved Critical',
                    description: 'Beginning when you choose this archetype at 3rd level, your weapon attacks score a critical hit on a roll of 19 or 20.',
                    source: 'class',
                    sourceDetails: 'Champion Level 3'
                },
                {
                    id: 'extra-attack',
                    name: 'Extra Attack',
                    description: 'Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn.',
                    source: 'class',
                    sourceDetails: 'Fighter Level 5'
                }
            ]
        },
        {
            name: 'Wizard',
            level: 5,
            subclass: 'School of Divination',
            hitDie: 6,
            features: [
                {
                    id: 'arcane-recovery',
                    name: 'Arcane Recovery',
                    description: 'You have learned to regain some of your magical energy by studying your spellbook. Once per day when you finish a short rest, you can choose expended spell slots to recover. The spell slots can have a combined level equal to or less than half your wizard level (rounded up).',
                    source: 'class',
                    sourceDetails: 'Wizard Level 1',
                    limitedUse: { maxUses: 1, currentUses: 1, resetOn: 'long' }
                },
                {
                    id: 'divination-savant',
                    name: 'Divination Savant',
                    description: 'Beginning when you select this school at 2nd level, the gold and time you must spend to copy a divination spell into your spellbook is halved.',
                    source: 'class',
                    sourceDetails: 'School of Divination Level 2'
                },
                {
                    id: 'portent',
                    name: 'Portent',
                    description: 'Starting at 2nd level when you choose this school, glimpses of the future begin to press in on your awareness. When you finish a long rest, roll two d20s and record the numbers rolled. You can replace any attack roll, saving throw, or ability check made by you or a creature that you can see with one of these foretelling rolls.',
                    source: 'class',
                    sourceDetails: 'School of Divination Level 2',
                    limitedUse: { maxUses: 2, currentUses: 2, resetOn: 'long' }
                },
                {
                    id: 'expert-divination',
                    name: 'Expert Divination',
                    description: 'Beginning at 6th level, casting divination spells comes so easily to you that it expends only a fraction of your spellcasting efforts. When you cast a divination spell of 2nd level or higher using a spell slot, you regain one expended spell slot of a level lower than the spell you cast.',
                    source: 'class',
                    sourceDetails: 'School of Divination Level 6'
                }
            ]
        },
        {
            name: 'Warlock',
            level: 2,
            subclass: 'The Hexblade',
            hitDie: 8,
            features: [
                {
                    id: 'hexblades-curse',
                    name: "Hexblade's Curse",
                    description: 'Starting at 1st level, you gain the ability to place a baleful curse on someone. As a bonus action, choose one creature you can see within 30 feet of you. The target is cursed for 1 minute. The curse ends early if the target dies, you die, or you are incapacitated. Until the curse ends, you gain bonuses against the cursed target.',
                    source: 'class',
                    sourceDetails: 'Hexblade Level 1',
                    limitedUse: { maxUses: 1, currentUses: 1, resetOn: 'short' }
                },
                {
                    id: 'hex-warrior',
                    name: 'Hex Warrior',
                    description: 'At 1st level, you acquire the training necessary to effectively arm yourself for battle. You gain proficiency with medium armor, shields, and martial weapons. When you attack with a weapon that you are proficient with and lacks the two-handed property, you can use your Charisma modifier instead of Strength or Dexterity.',
                    source: 'class',
                    sourceDetails: 'Hexblade Level 1'
                },
                {
                    id: 'eldritch-invocations',
                    name: 'Eldritch Invocations',
                    description: 'In your study of occult lore, you have unearthed eldritch invocations, fragments of forbidden knowledge that imbue you with an abiding magical ability. You gain two invocations: Agonizing Blast and Devil\'s Sight.',
                    source: 'class',
                    sourceDetails: 'Warlock Level 2'
                },
                {
                    id: 'agonizing-blast',
                    name: 'Agonizing Blast',
                    description: 'When you cast eldritch blast, add your Charisma modifier to the damage it deals on a hit.',
                    source: 'class',
                    sourceDetails: 'Eldritch Invocation'
                },
                {
                    id: 'devils-sight',
                    name: "Devil's Sight",
                    description: 'You can see normally in darkness, both magical and nonmagical, to a distance of 120 feet.',
                    source: 'class',
                    sourceDetails: 'Eldritch Invocation'
                }
            ]
        }
    ],

    // ===== BACKGROUND =====
    background: {
        id: 'archaeologist',
        name: 'Archaeologist',
        description: 'An archaeologist learns about the long-lost and fallen cultures of the past by studying their remains.',
        skillProficiencies: ['History', 'Survival'],
        toolProficiencies: ['Cartographer\'s tools'],
        equipment: ['Wooden case with maps', 'Bullseye lantern', 'Miner\'s pick', 'Traveler\'s clothes', 'Trinket from dig site'],
        startingGold: 25,
        feature: {
            id: 'historical-knowledge',
            name: 'Historical Knowledge',
            description: 'When you enter a ruin or dungeon, you can correctly ascertain its original purpose and determine its builders. You can determine the monetary value of art objects more than a century old.',
            source: 'background'
        },
        suggestedCharacteristics: {
            traits: ['I love a good puzzle or mystery.'],
            ideals: ['Preservation. Artifacts belong in museums.'],
            bonds: ['I have a trinket I must return to its rightful owner.'],
            flaws: ['I sometimes take risks to uncover artifacts.']
        },
        source: 'Homebrew'
    },

    // ===== DERIVED STATS =====
    derivedStats: {
        armorClass: 18,
        initiative: 2,
        proficiencyBonus: 4,
        speed: { walk: 30 },
        maxHp: 89,
        currentHp: 89,
        tempHp: 0,
        hitDice: { total: 12, current: 12, size: 10 },
        passivePerception: 10,
        passiveInvestigation: 17,
        passiveInsight: 10
    },

    // ===== PROFICIENCIES =====
    proficiencies: {
        skills: ['Arcana', 'History', 'Investigation', 'Perception', 'Survival', 'Athletics', 'Intimidation'],
        savingThrows: ['strength', 'constitution', 'intelligence', 'wisdom'],
        armor: ['Light', 'Medium', 'Heavy', 'Shields'],
        weapons: ['Simple', 'Martial'],
        tools: ['Cartographer\'s tools', 'Smith\'s tools'],
        languages: ['Common', 'Elvish', 'Dwarvish', 'Infernal', 'Abyssal', 'Draconic']
    },

    // ===== EXTENSIVE EQUIPMENT (for inventory overflow) =====
    equipment: [
        // Adventuring Gear
        { id: 'backpack', name: 'Backpack', type: 'container', quantity: 1, weight: 5, value: 2 },
        { id: 'bedroll', name: 'Bedroll', type: 'adventuring gear', quantity: 1, weight: 7, value: 1 },
        { id: 'mess-kit', name: 'Mess Kit', type: 'adventuring gear', quantity: 1, weight: 1, value: 0.2 },
        { id: 'tinderbox', name: 'Tinderbox', type: 'adventuring gear', quantity: 1, weight: 1, value: 0.5 },
        { id: 'torches', name: 'Torches', type: 'adventuring gear', quantity: 10, weight: 1, value: 0.01 },
        { id: 'rations', name: 'Rations (1 day)', type: 'adventuring gear', quantity: 10, weight: 2, value: 0.5 },
        { id: 'waterskin', name: 'Waterskin', type: 'adventuring gear', quantity: 1, weight: 5, value: 0.2 },
        { id: 'rope-50', name: 'Hempen Rope (50 ft)', type: 'adventuring gear', quantity: 1, weight: 10, value: 1 },
        { id: 'pitons', name: 'Pitons', type: 'adventuring gear', quantity: 10, weight: 0.25, value: 0.05 },
        { id: 'grappling-hook', name: 'Grappling Hook', type: 'adventuring gear', quantity: 1, weight: 4, value: 2 },
        { id: 'crowbar', name: 'Crowbar', type: 'adventuring gear', quantity: 1, weight: 5, value: 2 },
        { id: 'hammer', name: 'Hammer', type: 'adventuring gear', quantity: 1, weight: 3, value: 1 },
        { id: 'miners-pick', name: 'Miner\'s Pick', type: 'adventuring gear', quantity: 1, weight: 10, value: 2 },
        { id: 'bullseye-lantern', name: 'Bullseye Lantern', type: 'adventuring gear', quantity: 1, weight: 2, value: 10 },
        { id: 'oil-flask', name: 'Oil (flask)', type: 'adventuring gear', quantity: 5, weight: 1, value: 0.1 },
        { id: 'spellbook', name: 'Spellbook', type: 'adventuring gear', quantity: 1, weight: 3, value: 50 },
        { id: 'component-pouch', name: 'Component Pouch', type: 'adventuring gear', quantity: 1, weight: 2, value: 25 },
        { id: 'explorers-pack', name: 'Explorer\'s Pack', type: 'container', quantity: 1, weight: 10, value: 10 },
        { id: 'scholars-pack', name: 'Scholar\'s Pack', type: 'container', quantity: 1, weight: 5, value: 40 },

        // Magic Items (many for attunement/overflow)
        { id: 'cloak-protection', name: 'Cloak of Protection', type: 'wondrous item', quantity: 1, weight: 1, isMagical: true, requiresAttunement: true, rarity: 'uncommon', description: '+1 bonus to AC and saving throws' },
        { id: 'ring-protection', name: 'Ring of Protection', type: 'wondrous item', quantity: 1, weight: 0, isMagical: true, requiresAttunement: true, rarity: 'rare', description: '+1 bonus to AC and saving throws' },
        { id: 'bag-holding', name: 'Bag of Holding', type: 'wondrous item', quantity: 1, weight: 15, isMagical: true, requiresAttunement: false, rarity: 'uncommon', description: 'Interior space is 64 cubic feet. Bag weighs 15 pounds regardless of contents.' },
        { id: 'boots-elvenkind', name: 'Boots of Elvenkind', type: 'wondrous item', quantity: 1, weight: 1, isMagical: true, requiresAttunement: false, rarity: 'uncommon', description: 'Advantage on Stealth checks to move silently' },
        { id: 'cloak-elvenkind', name: 'Cloak of Elvenkind', type: 'wondrous item', quantity: 1, weight: 1, isMagical: true, requiresAttunement: true, rarity: 'uncommon', description: 'Advantage on Stealth checks to hide. Disadvantage on Perception to see you.' },
        { id: 'pearl-power', name: 'Pearl of Power', type: 'wondrous item', quantity: 1, weight: 0, isMagical: true, requiresAttunement: true, rarity: 'uncommon', description: 'Regain one spell slot of 3rd level or lower' },
        { id: 'wand-magic-missiles', name: 'Wand of Magic Missiles', type: 'wondrous item', quantity: 1, weight: 1, isMagical: true, requiresAttunement: false, rarity: 'uncommon', description: '7 charges. Expend charges to cast magic missile.' },
        { id: 'hat-disguise', name: 'Hat of Disguise', type: 'wondrous item', quantity: 1, weight: 0, isMagical: true, requiresAttunement: true, rarity: 'uncommon', description: 'Cast disguise self at will' },
        { id: 'immovable-rod', name: 'Immovable Rod', type: 'wondrous item', quantity: 1, weight: 2, isMagical: true, requiresAttunement: false, rarity: 'uncommon', description: 'Press button to fix in place, holds up to 8,000 pounds' },
        { id: 'deck-illusions', name: 'Deck of Illusions', type: 'wondrous item', quantity: 1, weight: 0, isMagical: true, requiresAttunement: false, rarity: 'uncommon', description: '34 cards that create illusions when drawn' },

        // Consumables
        { id: 'potion-healing', name: 'Potion of Healing', type: 'consumable', quantity: 5, weight: 0.5, value: 50, isMagical: true, rarity: 'common', description: '2d4+2 HP' },
        { id: 'potion-greater-healing', name: 'Potion of Greater Healing', type: 'consumable', quantity: 2, weight: 0.5, value: 150, isMagical: true, rarity: 'uncommon', description: '4d4+4 HP' },
        { id: 'potion-fire-breath', name: 'Potion of Fire Breath', type: 'consumable', quantity: 1, weight: 0.5, value: 150, isMagical: true, rarity: 'uncommon', description: 'Exhale fire 3 times as bonus action' },
        { id: 'potion-invisibility', name: 'Potion of Invisibility', type: 'consumable', quantity: 1, weight: 0.5, value: 180, isMagical: true, rarity: 'very rare', description: 'Invisible for 1 hour' },
        { id: 'scroll-fireball', name: 'Spell Scroll (Fireball)', type: 'consumable', quantity: 2, weight: 0, isMagical: true, rarity: 'uncommon' },
        { id: 'scroll-dispel', name: 'Spell Scroll (Dispel Magic)', type: 'consumable', quantity: 1, weight: 0, isMagical: true, rarity: 'uncommon' },
        { id: 'scroll-haste', name: 'Spell Scroll (Haste)', type: 'consumable', quantity: 1, weight: 0, isMagical: true, rarity: 'uncommon' },
        { id: 'antitoxin', name: 'Antitoxin', type: 'consumable', quantity: 3, weight: 0, value: 50, description: 'Advantage on saves vs poison for 1 hour' },

        // Treasure
        { id: 'ruby-necklace', name: 'Ruby Necklace', type: 'treasure', quantity: 1, weight: 0, value: 750 },
        { id: 'gold-bracelet', name: 'Gold Bracelet', type: 'treasure', quantity: 2, weight: 0, value: 250 },
        { id: 'ancient-coin', name: 'Ancient Netherese Coin', type: 'treasure', quantity: 5, weight: 0, value: 100, description: 'Collector\'s item from fallen empire' },
        { id: 'gemstones', name: 'Assorted Gemstones', type: 'treasure', quantity: 12, weight: 0, value: 50, description: 'Various gems collected from adventures' },
        { id: 'art-object', name: 'Elven Statuette', type: 'treasure', quantity: 1, weight: 1, value: 250, description: 'Carved jade figurine of an elven deity' }
    ],

    // ===== WEAPONS =====
    weapons: [
        {
            id: 'longsword-1',
            name: '+1 Longsword',
            type: 'weapon',
            weaponCategory: 'martial',
            weaponType: 'melee',
            damage: '1d8+1',
            damageType: 'slashing',
            properties: ['versatile'],
            weight: 3,
            quantity: 1,
            value: 500,
            isMagical: true,
            rarity: 'uncommon',
            description: 'A finely crafted blade that hums with arcane energy.'
        },
        {
            id: 'hand-crossbow',
            name: 'Hand Crossbow',
            type: 'weapon',
            weaponCategory: 'martial',
            weaponType: 'ranged',
            damage: '1d6',
            damageType: 'piercing',
            properties: ['ammunition', 'light', 'loading'],
            range: { normal: 30, long: 120 },
            weight: 3,
            quantity: 1,
            value: 75
        },
        {
            id: 'dagger-silver',
            name: 'Silvered Dagger',
            type: 'weapon',
            weaponCategory: 'simple',
            weaponType: 'melee',
            damage: '1d4',
            damageType: 'piercing',
            properties: ['finesse', 'light', 'thrown'],
            range: { normal: 20, long: 60 },
            weight: 1,
            quantity: 2,
            value: 102,
            description: 'Dagger coated in silver to harm certain creatures.'
        },
        {
            id: 'javelin',
            name: 'Javelin',
            type: 'weapon',
            weaponCategory: 'simple',
            weaponType: 'melee',
            damage: '1d6',
            damageType: 'piercing',
            properties: ['thrown'],
            range: { normal: 30, long: 120 },
            weight: 2,
            quantity: 4,
            value: 0.5
        }
    ],

    // ===== ARMOR =====
    armor: {
        id: 'half-plate-1',
        name: '+1 Half Plate',
        type: 'armor',
        armorCategory: 'medium',
        armorClass: 16,
        maxDexBonus: 2,
        stealthDisadvantage: true,
        weight: 40,
        quantity: 1,
        value: 1250,
        isMagical: true,
        rarity: 'uncommon',
        description: 'Masterwork half plate enchanted for protection.'
    },
    shield: true,

    // ===== ATTUNEMENT =====
    attunement: {
        maxSlots: 3,
        attunedItemIds: ['cloak-protection', 'ring-protection', 'pearl-power']
    },

    // ===== SPELLCASTING (Full wizard spellbook for overflow) =====
    spellcasting: {
        class: 'Wizard',
        ability: 'intelligence',
        spellSaveDC: 15,
        spellAttackBonus: 7,

        cantrips: [
            { id: 'fire-bolt', name: 'Fire Bolt', level: 0, school: 'evocation', castingTime: '1 action', range: '120 feet', components: { verbal: true, somatic: true, material: false }, duration: 'Instantaneous', concentration: false, ritual: false, description: 'Ranged spell attack. 2d10 fire damage.', damage: { type: 'fire', dice: '2d10' }, classes: ['wizard'], source: 'SRD' },
            { id: 'prestidigitation', name: 'Prestidigitation', level: 0, school: 'transmutation', castingTime: '1 action', range: '10 feet', components: { verbal: true, somatic: true, material: false }, duration: '1 hour', concentration: false, ritual: false, description: 'Minor magical tricks.', classes: ['wizard'], source: 'SRD' },
            { id: 'mage-hand', name: 'Mage Hand', level: 0, school: 'conjuration', castingTime: '1 action', range: '30 feet', components: { verbal: true, somatic: true, material: false }, duration: '1 minute', concentration: false, ritual: false, description: 'Spectral floating hand.', classes: ['wizard'], source: 'SRD' },
            { id: 'light', name: 'Light', level: 0, school: 'evocation', castingTime: '1 action', range: 'Touch', components: { verbal: true, somatic: false, material: true }, duration: '1 hour', concentration: false, ritual: false, description: 'Object sheds bright light 20 ft.', classes: ['wizard'], source: 'SRD' },
            { id: 'minor-illusion', name: 'Minor Illusion', level: 0, school: 'illusion', castingTime: '1 action', range: '30 feet', components: { verbal: false, somatic: true, material: true }, duration: '1 minute', concentration: false, ritual: false, description: 'Create sound or image.', classes: ['wizard'], source: 'SRD' },
            { id: 'eldritch-blast', name: 'Eldritch Blast', level: 0, school: 'evocation', castingTime: '1 action', range: '120 feet', components: { verbal: true, somatic: true, material: false }, duration: 'Instantaneous', concentration: false, ritual: false, description: 'Beam of crackling energy. 1d10 force damage.', damage: { type: 'force', dice: '2d10' }, classes: ['warlock'], source: 'SRD' }
        ],

        spellsKnown: [
            // 1st Level (10 spells)
            { id: 'magic-missile', name: 'Magic Missile', level: 1, school: 'evocation', castingTime: '1 action', range: '120 feet', components: { verbal: true, somatic: true, material: false }, duration: 'Instantaneous', concentration: false, ritual: false, description: 'Three darts of force, 1d4+1 each.', damage: { type: 'force', dice: '3d4+3' }, classes: ['wizard'], source: 'SRD' },
            { id: 'shield', name: 'Shield', level: 1, school: 'abjuration', castingTime: '1 reaction', range: 'Self', components: { verbal: true, somatic: true, material: false }, duration: '1 round', concentration: false, ritual: false, description: '+5 AC until start of next turn.', classes: ['wizard'], source: 'SRD' },
            { id: 'mage-armor', name: 'Mage Armor', level: 1, school: 'abjuration', castingTime: '1 action', range: 'Touch', components: { verbal: true, somatic: true, material: true }, duration: '8 hours', concentration: false, ritual: false, description: 'Base AC becomes 13 + DEX.', classes: ['wizard'], source: 'SRD' },
            { id: 'detect-magic', name: 'Detect Magic', level: 1, school: 'divination', castingTime: '1 action', range: 'Self', components: { verbal: true, somatic: true, material: false }, duration: 'Concentration, 10 min', concentration: true, ritual: true, description: 'Sense magic within 30 feet.', classes: ['wizard'], source: 'SRD' },
            { id: 'identify', name: 'Identify', level: 1, school: 'divination', castingTime: '1 minute', range: 'Touch', components: { verbal: true, somatic: true, material: true }, duration: 'Instantaneous', concentration: false, ritual: true, description: 'Learn properties of magic item.', classes: ['wizard'], source: 'SRD' },
            { id: 'find-familiar', name: 'Find Familiar', level: 1, school: 'conjuration', castingTime: '1 hour', range: '10 feet', components: { verbal: true, somatic: true, material: true, consumesMaterial: true }, duration: 'Instantaneous', concentration: false, ritual: true, description: 'Summon a familiar spirit.', classes: ['wizard'], source: 'SRD' },
            { id: 'sleep', name: 'Sleep', level: 1, school: 'enchantment', castingTime: '1 action', range: '90 feet', components: { verbal: true, somatic: true, material: true }, duration: '1 minute', concentration: false, ritual: false, description: 'Roll 5d8, creatures fall asleep.', classes: ['wizard'], source: 'SRD' },
            { id: 'thunderwave', name: 'Thunderwave', level: 1, school: 'evocation', castingTime: '1 action', range: 'Self (15-ft cube)', components: { verbal: true, somatic: true, material: false }, duration: 'Instantaneous', concentration: false, ritual: false, description: '2d8 thunder, push 10 ft.', damage: { type: 'thunder', dice: '2d8' }, classes: ['wizard'], source: 'SRD' },
            { id: 'feather-fall', name: 'Feather Fall', level: 1, school: 'transmutation', castingTime: '1 reaction', range: '60 feet', components: { verbal: true, somatic: false, material: true }, duration: '1 minute', concentration: false, ritual: false, description: 'Slow falling rate to 60 ft/round.', classes: ['wizard'], source: 'SRD' },
            { id: 'comprehend-languages', name: 'Comprehend Languages', level: 1, school: 'divination', castingTime: '1 action', range: 'Self', components: { verbal: true, somatic: true, material: true }, duration: '1 hour', concentration: false, ritual: true, description: 'Understand any language.', classes: ['wizard'], source: 'SRD' },

            // 2nd Level (8 spells)
            { id: 'misty-step', name: 'Misty Step', level: 2, school: 'conjuration', castingTime: '1 bonus action', range: 'Self', components: { verbal: true, somatic: false, material: false }, duration: 'Instantaneous', concentration: false, ritual: false, description: 'Teleport up to 30 feet.', classes: ['wizard'], source: 'SRD' },
            { id: 'invisibility', name: 'Invisibility', level: 2, school: 'illusion', castingTime: '1 action', range: 'Touch', components: { verbal: true, somatic: true, material: true }, duration: 'Concentration, 1 hour', concentration: true, ritual: false, description: 'Target becomes invisible.', classes: ['wizard'], source: 'SRD' },
            { id: 'scorching-ray', name: 'Scorching Ray', level: 2, school: 'evocation', castingTime: '1 action', range: '120 feet', components: { verbal: true, somatic: true, material: false }, duration: 'Instantaneous', concentration: false, ritual: false, description: 'Three rays, 2d6 fire each.', damage: { type: 'fire', dice: '6d6' }, classes: ['wizard'], source: 'SRD' },
            { id: 'hold-person', name: 'Hold Person', level: 2, school: 'enchantment', castingTime: '1 action', range: '60 feet', components: { verbal: true, somatic: true, material: true }, duration: 'Concentration, 1 min', concentration: true, ritual: false, description: 'Paralyze a humanoid.', classes: ['wizard'], source: 'SRD' },
            { id: 'mirror-image', name: 'Mirror Image', level: 2, school: 'illusion', castingTime: '1 action', range: 'Self', components: { verbal: true, somatic: true, material: false }, duration: '1 minute', concentration: false, ritual: false, description: 'Create three illusory duplicates.', classes: ['wizard'], source: 'SRD' },
            { id: 'see-invisibility', name: 'See Invisibility', level: 2, school: 'divination', castingTime: '1 action', range: 'Self', components: { verbal: true, somatic: true, material: true }, duration: '1 hour', concentration: false, ritual: false, description: 'See invisible creatures/objects.', classes: ['wizard'], source: 'SRD' },
            { id: 'web', name: 'Web', level: 2, school: 'conjuration', castingTime: '1 action', range: '60 feet', components: { verbal: true, somatic: true, material: true }, duration: 'Concentration, 1 hour', concentration: true, ritual: false, description: 'Restrain creatures in sticky webs.', classes: ['wizard'], source: 'SRD' },
            { id: 'suggestion', name: 'Suggestion', level: 2, school: 'enchantment', castingTime: '1 action', range: '30 feet', components: { verbal: true, somatic: false, material: true }, duration: 'Concentration, 8 hours', concentration: true, ritual: false, description: 'Suggest a course of action.', classes: ['wizard'], source: 'SRD' },

            // 3rd Level (6 spells)
            { id: 'fireball', name: 'Fireball', level: 3, school: 'evocation', castingTime: '1 action', range: '150 feet', components: { verbal: true, somatic: true, material: true }, duration: 'Instantaneous', concentration: false, ritual: false, description: '20-ft radius, 8d6 fire damage.', damage: { type: 'fire', dice: '8d6' }, classes: ['wizard'], source: 'SRD' },
            { id: 'counterspell', name: 'Counterspell', level: 3, school: 'abjuration', castingTime: '1 reaction', range: '60 feet', components: { verbal: false, somatic: true, material: false }, duration: 'Instantaneous', concentration: false, ritual: false, description: 'Interrupt a spell being cast.', classes: ['wizard'], source: 'SRD' },
            { id: 'dispel-magic', name: 'Dispel Magic', level: 3, school: 'abjuration', castingTime: '1 action', range: '120 feet', components: { verbal: true, somatic: true, material: false }, duration: 'Instantaneous', concentration: false, ritual: false, description: 'End spells on target.', classes: ['wizard'], source: 'SRD' },
            { id: 'fly', name: 'Fly', level: 3, school: 'transmutation', castingTime: '1 action', range: 'Touch', components: { verbal: true, somatic: true, material: true }, duration: 'Concentration, 10 min', concentration: true, ritual: false, description: 'Target gains 60 ft flying speed.', classes: ['wizard'], source: 'SRD' },
            { id: 'haste', name: 'Haste', level: 3, school: 'transmutation', castingTime: '1 action', range: '30 feet', components: { verbal: true, somatic: true, material: true }, duration: 'Concentration, 1 min', concentration: true, ritual: false, description: 'Double speed, +2 AC, extra action.', classes: ['wizard'], source: 'SRD' },
            { id: 'lightning-bolt', name: 'Lightning Bolt', level: 3, school: 'evocation', castingTime: '1 action', range: 'Self (100-ft line)', components: { verbal: true, somatic: true, material: true }, duration: 'Instantaneous', concentration: false, ritual: false, description: '100-ft line, 8d6 lightning.', damage: { type: 'lightning', dice: '8d6' }, classes: ['wizard'], source: 'SRD' }
        ],

        spellsPrepared: [
            'magic-missile', 'shield', 'detect-magic', 'misty-step',
            'invisibility', 'scorching-ray', 'fireball', 'counterspell',
            'dispel-magic', 'fly'
        ],

        spellSlots: {
            1: { total: 4, used: 1 },
            2: { total: 3, used: 0 },
            3: { total: 2, used: 0 }
        }
    },

    // ===== FEATURES (from race + background, class features are in classes array) =====
    features: [
        {
            id: 'darkvision-halfelf',
            name: 'Darkvision',
            description: 'Thanks to your elf blood, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.',
            source: 'race',
            sourceDetails: 'Half-Elf'
        },
        {
            id: 'fey-ancestry-halfelf',
            name: 'Fey Ancestry',
            description: 'You have advantage on saving throws against being charmed, and magic can\'t put you to sleep.',
            source: 'race',
            sourceDetails: 'Half-Elf'
        },
        {
            id: 'skill-versatility-halfelf',
            name: 'Skill Versatility',
            description: 'You gain proficiency in two skills of your choice. (Perception, Intimidation)',
            source: 'race',
            sourceDetails: 'Half-Elf'
        },
        {
            id: 'historical-knowledge',
            name: 'Historical Knowledge',
            description: 'When you enter a ruin or dungeon, you can correctly ascertain its original purpose and determine its builders, whether those be dwarves, elves, humans, yuan-ti, or some other known race. In addition, you can determine the monetary value of art objects more than a century old.',
            source: 'background',
            sourceDetails: 'Archaeologist'
        }
    ],

    // ===== PERSONALITY =====
    personality: {
        traits: [
            'I love a good puzzle or mystery.',
            'I\'m convinced that people are always trying to steal my secrets.'
        ],
        ideals: ['Preservation. That which has been lost should be found and protected, not exploited.'],
        bonds: ['I\'ve been searching my whole life for the answer to a certain question about an ancient empire.'],
        flaws: ['I have trouble keeping my true feelings hidden. My sharp tongue lands me in trouble.']
    },

    // ===== OPTIONAL DETAILS =====
    alignment: 'true neutral',
    age: 45,
    height: '5\'10"',
    weight: '165 lbs',
    eyes: 'Amber',
    skin: 'Olive',
    hair: 'Dark brown with silver streaks',
    appearance: 'A weathered half-elf with the bearing of a scholar and the scars of an adventurer.',

    // ===== CURRENCY =====
    currency: { cp: 45, sp: 120, ep: 15, gp: 892, pp: 12 }
};

/**
 * Complete Character wrapper for overflow testing
 */
export const DEMO_OVERFLOW: Character = {
    id: 'demo-overflow-valdris-collector',
    name: 'Valdris the Collector',
    level: 12,
    system: 'dnd5e',
    dnd5eData,
    createdAt: NOW,
    updatedAt: NOW,
    version: 1
};

export const DEMO_OVERFLOW_DATA = dnd5eData;

export function createDemoOverflow(): Character {
    return JSON.parse(JSON.stringify(DEMO_OVERFLOW));
}

export default DEMO_OVERFLOW;

