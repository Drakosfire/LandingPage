// Demo Statblock - Hermione the All Cat
// Used in tutorial to demonstrate creature generation

import { StatBlockDetails } from '../types/statblock.types';

export const HERMIONE_DEMO_STATBLOCK: StatBlockDetails = {
    // Basic Information
    name: "Hermione the All Cat",
    size: "Medium",
    type: "celestial",
    subtype: "divine feline",
    alignment: "lawful good",

    // Combat Statistics
    armorClass: 16,
    hitPoints: 120,
    hitDice: "16d8+48",
    speed: {
        walk: 40,
        climb: 30,
    },

    // Ability Scores
    abilities: {
        str: 12,
        dex: 18,
        con: 16,
        int: 20,
        wis: 22,
        cha: 20,
    },
    savingThrows: {
        dex: 8,
        wis: 10,
        cha: 9,
    },
    skills: {
        perception: 10,
        insight: 10,
        arcana: 9,
        stealth: 8,
    },

    // Resistances and Senses
    damageResistance: "radiant; bludgeoning, piercing, and slashing from nonmagical attacks",
    damageImmunity: "poison, psychic",
    conditionImmunity: "charmed, exhaustion, frightened, poisoned",
    senses: {
        darkvision: 120,
        truesight: 60,
        passivePerception: 20,
    },
    languages: "All, telepathy 120 ft.",

    // Challenge and Experience
    challengeRating: 12,
    xp: 8400,
    proficiencyBonus: 4,

    // Special Abilities
    specialAbilities: [
        {
            id: "hermione-magic-resistance",
            name: "Magic Resistance",
            desc: "Hermione has advantage on saving throws against spells and other magical effects.",
        },
        {
            id: "hermione-divine-awareness",
            name: "Divine Awareness",
            desc: "Hermione knows the location of all creatures within 60 feet of her and can't be surprised.",
        },
        {
            id: "hermione-nine-lives",
            name: "Nine Lives (3/Day)",
            desc: "If Hermione would be reduced to 0 hit points, she instead drops to 1 hit point. Her fur glows with divine energy as one of her lives is consumed.",
        },
    ],

    // Actions
    actions: [
        {
            id: "hermione-multiattack",
            name: "Multiattack",
            desc: "Hermione makes two attacks: one with her Divine Claws and one with her Radiant Bite.",
        },
        {
            id: "hermione-divine-claws",
            name: "Divine Claws",
            desc: "Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage plus 7 (2d6) radiant damage.",
            attackBonus: 8,
            damage: "2d6+4 slashing + 2d6 radiant",
            damageType: "slashing, radiant",
            range: "5 ft.",
        },
        {
            id: "hermione-radiant-bite",
            name: "Radiant Bite",
            desc: "Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 9 (2d4 + 4) piercing damage plus 10 (3d6) radiant damage.",
            attackBonus: 8,
            damage: "2d4+4 piercing + 3d6 radiant",
            damageType: "piercing, radiant",
            range: "5 ft.",
        },
        {
            id: "hermione-purr-of-serenity",
            name: "Purr of Serenity (Recharge 5-6)",
            desc: "Hermione emits a deep, resonating purr. Each creature of her choice within 30 feet must succeed on a DC 18 Wisdom saving throw or be charmed for 1 minute. While charmed, the creature is incapacitated and has a speed of 0. The creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success.",
            recharge: "5-6",
        },
    ],

    // Bonus Actions
    bonusActions: [
        {
            id: "hermione-ethereal-leap",
            name: "Ethereal Leap",
            desc: "Hermione magically teleports up to 60 feet to an unoccupied space she can see. Silver-gray mist swirls in her wake.",
        },
    ],

    // Reactions
    reactions: [
        {
            id: "hermione-divine-deflection",
            name: "Divine Deflection",
            desc: "When Hermione or an ally within 30 feet is hit by an attack, she can add her Charisma modifier (+5) to the target's AC against that attack. If this causes the attack to miss, divine light briefly surrounds the protected creature.",
        },
    ],

    // Spellcasting
    spells: {
        level: 16,
        ability: "Wisdom",
        save: 18,
        attack: 10,
        cantrips: [
            {
                id: "hermione-sacred-flame",
                name: "Sacred Flame",
                level: 0,
                school: "evocation",
            },
            {
                id: "hermione-light",
                name: "Light",
                level: 0,
                school: "evocation",
            },
            {
                id: "hermione-thaumaturgy",
                name: "Thaumaturgy",
                level: 0,
                school: "transmutation",
            },
        ],
        knownSpells: [
            {
                id: "hermione-cure-wounds",
                name: "Cure Wounds",
                level: 1,
                school: "evocation",
            },
            {
                id: "hermione-detect-evil",
                name: "Detect Evil and Good",
                level: 1,
                school: "divination",
            },
            {
                id: "hermione-lesser-restoration",
                name: "Lesser Restoration",
                level: 2,
                school: "abjuration",
            },
            {
                id: "hermione-hold-person",
                name: "Hold Person",
                level: 2,
                school: "enchantment",
            },
            {
                id: "hermione-dispel-magic",
                name: "Dispel Magic",
                level: 3,
                school: "abjuration",
            },
            {
                id: "hermione-revivify",
                name: "Revivify",
                level: 3,
                school: "necromancy",
            },
            {
                id: "hermione-banishment",
                name: "Banishment",
                level: 4,
                school: "abjuration",
            },
            {
                id: "hermione-greater-restoration",
                name: "Greater Restoration",
                level: 5,
                school: "abjuration",
            },
            {
                id: "hermione-heal",
                name: "Heal",
                level: 6,
                school: "evocation",
            },
        ],
        spellSlots: {
            slot1: 4,
            slot2: 3,
            slot3: 3,
            slot4: 3,
            slot5: 2,
            slot6: 1,
        },
    },

    // Legendary Actions
    legendaryActions: {
        actionsPerTurn: 3,
        description: "Hermione can take 3 legendary actions, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature's turn. Hermione regains spent legendary actions at the start of her turn.",
        actions: [
            {
                id: "hermione-detect",
                name: "Detect",
                desc: "Hermione makes a Wisdom (Perception) check.",
            },
            {
                id: "hermione-divine-step",
                name: "Divine Step (Costs 2 Actions)",
                desc: "Hermione uses Ethereal Leap without expending her bonus action.",
            },
            {
                id: "hermione-radiant-burst",
                name: "Radiant Burst (Costs 3 Actions)",
                desc: "Hermione releases a burst of divine energy. Each creature within 15 feet must make a DC 18 Dexterity saving throw, taking 21 (6d6) radiant damage on a failed save, or half as much on a successful one.",
            },
        ],
    },

    // Lair Actions
    lairActions: {
        lairName: "The Celestial Study",
        lairDescription: "A cozy chamber filled with glowing orbs of light, plush cushions, and ancient tomes. The air shimmers with divine magic and smells faintly of lavender and sandalwood.",
        description: "On initiative count 20 (losing initiative ties), Hermione can take one lair action to cause one of the following effects. She can't use the same effect two rounds in a row.",
        actions: [
            {
                id: "hermione-lair-healing-light",
                name: "Healing Light",
                desc: "Hermione causes divine light to illuminate the lair. Each creature of her choice within the lair regains 10 (3d6) hit points.",
            },
            {
                id: "hermione-lair-mystic-fog",
                name: "Mystic Fog",
                desc: "Swirling silver fog fills a 20-foot-radius sphere centered on a point Hermione can see within the lair. The fog spreads around corners and is heavily obscured. It lasts until initiative count 20 on the next round.",
            },
            {
                id: "hermione-lair-guardian-spirits",
                name: "Guardian Spirits",
                desc: "Spectral cats materialize and attack. Hermione chooses up to three creatures she can see within the lair. Each target must succeed on a DC 18 Dexterity saving throw or take 10 (3d6) force damage.",
            },
        ],
        initiative: 20,
    },

    // Descriptive Content
    description: "A mystical storm grey British Shorthair cat with divine powers, known as Hermione the All Cat. She has glowing amber eyes and a regal presence, her fur shimmering with an otherworldly radiance. Once a familiar to a powerful wizard, she ascended to become a celestial guardian of magical knowledge.",
    sdPrompt: "A majestic grey British Shorthair cat with divine celestial powers, glowing amber eyes, storm grey fur with divine radiance, regal pose, fantasy art, mystical atmosphere, divine light emanating from fur, elegant and powerful",

    // Project Integration
    projectId: "demo-hermione-tutorial",
    tags: ["tutorial", "demo", "celestial", "divine", "cat"],
};

// Empty statblock for clearing canvas
export const EMPTY_STATBLOCK: StatBlockDetails = {
    name: "",
    size: "Medium",
    type: "beast",
    alignment: "unaligned",
    armorClass: 10,
    hitPoints: 1,
    hitDice: "1d8",
    speed: {
        walk: 30,
    },
    abilities: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
    },
    senses: {
        passivePerception: 10,
    },
    languages: "",
    challengeRating: 0,
    xp: 0,
    actions: [],
    description: "",
    sdPrompt: "",
};

