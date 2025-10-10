/**
 * Demo StatBlocks for New Users
 * 
 * These are pre-generated, feature-rich statblocks that showcase the capabilities
 * of the StatBlock Generator. They rotate randomly for users with no projects.
 * 
 * Source: Extracted from /DungeonMind/static/demostatblocks/
 */

import { StatBlockDetails } from '../types/statblock.types';

/**
 * Dr. Jupiter - A whimsical canine doctor
 * CR 1 | Showcases: Spellcasting, healing abilities, reactions
 */
const drJupiter: StatBlockDetails = {
    name: "Dr. Jupiter",
    size: "Small",
    type: "humanoid",
    subtype: "dog",
    alignment: "neutral good",
    armorClass: 13,
    hitPoints: 27,
    hitDice: "5d6+10",
    speed: {
        walk: 30
    },
    abilities: {
        str: 8,
        dex: 16,
        con: 14,
        int: 14,
        wis: 12,
        cha: 10
    },
    skills: {
        perception: 3,
        medicine: 5
    },
    senses: {
        passivePerception: 13
    },
    languages: "Common, Canine",
    challengeRating: "1",
    xp: 200,
    proficiencyBonus: 2,
    description: "Dr. Jupiter is a peculiar creature, a mix of a Shiba Inu and an American Eskimo Dog, with pointy ears the color of a toasted marshmallow. Adorned with a lab coat and a stethoscope, this small canine is known for its medical prowess, often seen with a head mirror on its forehead. Dr. Jupiter roams the lands offering healing and medical assistance to those in need, always eager to help with a wagging tail and a cheerful bark.",
    sdPrompt: "A whimsical canine doctor, resembling a mix between a Shiba Inu and an American Eskimo Dog, wearing a lab coat and stethoscope, with pointy ears the color of toasted marshmallow, set against a fantasy background.",
    specialAbilities: [
        {
            id: "2626f55b-1554-41a2-a943-8ec88d385cbe",
            name: "Keen Hearing and Smell",
            desc: "Dr. Jupiter has advantage on Wisdom (Perception) checks that rely on hearing or smell.",
        }
    ],
    actions: [
        {
            id: "aca8de4e-51c5-489f-ad82-6ff29b386b29",
            name: "Bite",
            desc: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage.",
            damage: "1d6+2",
            range: "Melee",
        },
        {
            id: "d1d89c36-e24d-461c-b2a4-43c5af8dee96",
            name: "Healing Bark",
            desc: "Dr. Jupiter lets out a magical bark that heals an ally within 15 feet for 1d8 + 2 hit points.",
            range: "15 ft",
            recharge: "5-6"
        },
        {
            id: "1106d76c-b910-43db-8a8c-d77fd4205700",
            name: "Medic's Aid",
            desc: "Dr. Jupiter uses its medical knowledge to stabilize a dying creature or end one disease or condition affecting it.",
            range: "Touch",
        }
    ],
    bonusActions: [],
    reactions: [
        {
            id: "0f7e413c-6be6-496e-befb-f3b9cbec53bc",
            name: "Protective Bark",
            desc: "When an ally within 5 feet is attacked, Dr. Jupiter can impose disadvantage on the attack roll by barking loudly.",
            range: "5 ft",
        }
    ],
    spells: {
        level: 3,
        ability: "Wisdom",
        save: 12,
        attack: 4,
        cantrips: [
            {
                id: "2940dffb-489d-4617-8c52-0c53c08abcce",
                name: "Guidance",
                level: 0,
                school: "Divination",
                description: "You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice."
            },
            {
                id: "99b2353b-7457-4ba5-8726-935380adf5a8",
                name: "Spare the Dying",
                level: 0,
                school: "Necromancy",
                description: "You touch a living creature that has 0 hit points. The creature becomes stable."
            },
            {
                id: "42b7ab23-bf21-4226-9582-c0a8393958d1",
                name: "Thaumaturgy",
                level: 0,
                school: "Transmutation",
                description: "You manifest a minor wonder, a sign of supernatural power, within range."
            }
        ],
        knownSpells: [
            {
                id: "a0bd2606-2cc6-40ec-8603-5cc2b5ff6d42",
                name: "Cure Wounds",
                level: 1,
                school: "Evocation",
                description: "A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs."
            },
            {
                id: "09eb35cd-e42c-423b-bb41-a803265a46a5",
                name: "Healing Word",
                level: 1,
                school: "Evocation",
                description: "A creature of your choice that you can see within range regains hit points equal to 1d4 + your spellcasting ability modifier. This spell has no effect on undead or constructs."
            },
            {
                id: "b464ae68-0053-4633-a4f6-9b3b512eca63",
                name: "Lesser Restoration",
                level: 2,
                school: "Abjuration",
                description: "You touch a creature and can end either one disease or one condition afflicting it."
            },
            {
                id: "b8d1440b-8e6f-4af2-99df-4165dac2724c",
                name: "Calm Emotions",
                level: 2,
                school: "Enchantment",
                description: "You attempt to suppress strong emotions in a group of people."
            }
        ],
        spellSlots: {
            slot1: 4,
            slot2: 3
        }
    },
    legendaryActions: {
        actionsPerTurn: 3,
        description: "Dr. Jupiter can take 3 legendary actions, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature's turn. Dr. Jupiter regains spent legendary actions at the start of its turn.",
        actions: [
            {
                id: "c93b3338-0e09-413e-8253-5905e8fdee7b",
                name: "Medical Assessment",
                desc: "Dr. Jupiter examines a creature within 30 feet, diagnosing its condition. The target gains advantage on its next saving throw against disease or poison.",
                range: "30 ft",
            },
            {
                id: "face17e4-3c23-4d21-88ff-2c9eb4e51953",
                name: "Quick Step",
                desc: "Dr. Jupiter moves up to half its speed without provoking opportunity attacks.",
            },
            {
                id: "35a7a0db-12c7-4e18-9c97-59b657d65a2f",
                name: "Soothing Bark",
                desc: "Dr. Jupiter emits a soothing bark, allowing one ally within 30 feet to immediately make a saving throw against one effect that a saving throw can end.",
                range: "30 ft",
            }
        ]
    },
    lairActions: {
        lairName: "The Healing Sanctuary",
        lairDescription: "Dr. Jupiter's medical sanctuary is a warm, well-lit space filled with the scent of antiseptic and fresh bandages. Gentle chimes tinkle from crystalline medical instruments hanging from the ceiling, and soft padding covers the floors to prevent injury. Healing herbs grow in neat pots along the walls, their leaves glowing faintly with restorative magic.",
        description: "On initiative count 20 (losing initiative ties), Dr. Jupiter takes a lair action to cause one of the following effects. Dr. Jupiter can't use the same effect two rounds in a row.",
        actions: [
            {
                id: "565051cf-04f4-413c-8d85-9b734ae21388",
                name: "Healing Mist",
                desc: "A gentle mist envelops the area, allowing all friendly creatures within the lair to regain 1d4 hit points.",
            },
            {
                id: "f76b79cb-e6f9-4054-b060-179626e315d9",
                name: "Calming Aura",
                desc: "A calming aura fills the lair. Any hostile creature must succeed on a DC 12 Wisdom saving throw or be charmed until the end of their next turn.",
            },
            {
                id: "706528b1-ff6d-4e1a-98f9-376bdc962557",
                name: "Nurturing Ground",
                desc: "Vines and plants grow rapidly in a 20-foot radius area, making the ground difficult terrain and providing half cover to those within.",
            }
        ]
    }
};

/**
 * Empress Hermione, The All Cat - A celestial judge
 * CR 1 | Showcases: Celestial type, legendary actions, lair actions, resistances
 */
const empressHermione: StatBlockDetails = {
    name: "Empress Hermione, The All Cat",
    size: "Small",
    type: "celestial",
    alignment: "chaotic neutral",
    armorClass: 14,
    hitPoints: 27,
    hitDice: "5d8",
    speed: {
        walk: 40,
        climb: 30
    },
    abilities: {
        str: 8,
        dex: 18,
        con: 12,
        int: 14,
        wis: 16,
        cha: 20
    },
    skills: {
        perception: 5,
        stealth: 6
    },
    damageResistance: "radiant; bludgeoning, piercing, and slashing from nonmagical attacks",
    conditionImmunity: "charmed, frightened",
    senses: {
        darkvision: 60,
        passivePerception: 15
    },
    languages: "Common, Celestial, telepathy 60 ft.",
    challengeRating: 1,
    xp: 200,
    proficiencyBonus: 2,
    description: "Empress Hermione, The All Cat, is a celestial entity of immense wisdom and enigmatic power, residing within the form of a grumpy yet adorable British Shorthair. Her stormy grey fur and regal demeanor command both respect and affection. Known as 'She who Judges', Empress Hermione looks into the hearts of those who cross her path, offering guidance or disdain as she sees fit. Her presence bends the fabric of time and space, manifesting her celestial authority in subtle yet profound ways.",
    sdPrompt: "A celestial British Shorthair cat with stormy grey fur, exuding a regal and grumpy demeanor, surrounded by an aura of mystical energy. Its eyes gleam with wisdom and power, as it stands in an ethereal, cosmic setting.",
    specialAbilities: [
        {
            id: "ba325e9a-3ff2-44a1-b5ca-70938968a84d",
            name: "Purr of Comfort",
            desc: "Empress Hermione can heal herself or an adjacent ally for 1d8 + 2 hit points as a bonus action.",
            recharge: "1/Day"
        }
    ],
    actions: [
        {
            id: "963a291b-4b11-4035-b16f-fba91dbd7342",
            name: "Multiattack",
            desc: "Empress Hermione makes two Claw attacks.",
        },
        {
            id: "e87e376d-a3f5-44c1-940d-6a0d559775f7",
            name: "Claw",
            desc: "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 7 (1d6 + 4) slashing damage.",
            damage: "1d6+4",
            range: "5 ft.",
        },
        {
            id: "847674b0-d37a-4eac-8178-573bb70c4630",
            name: "Judgment Glare",
            desc: "Empress Hermione targets one creature she can see within 30 feet. The target must succeed on a DC 15 Wisdom saving throw or be frightened until the end of its next turn.",
            range: "30 ft.",
        }
    ],
    bonusActions: [],
    reactions: [],
    spells: {
        level: 5,
        ability: "Charisma",
        save: 15,
        attack: 7,
        cantrips: [
            {
                id: "1d9b3143-5112-4373-94a9-18052ade06c8",
                name: "Mage Hand",
                level: 0,
                school: "Conjuration",
                description: "Conjure a spectral hand to manipulate objects within 30 feet."
            },
            {
                id: "d30a4d79-3389-4ac3-9705-c4ab4d792bd8",
                name: "Prestidigitation",
                level: 0,
                school: "Transmutation",
                description: "Minor magical trick or effect."
            },
            {
                id: "93247797-6dea-478a-a3e2-47aea3c0eaac",
                name: "Minor Illusion",
                level: 0,
                school: "Illusion",
                description: "Create a sound or image of an object within range."
            },
            {
                id: "25db7ce0-3fab-48d3-87ae-828e0a435491",
                name: "Guidance",
                level: 0,
                school: "Divination",
                description: "The target adds 1d4 to one ability check of its choice."
            },
            {
                id: "7eb9331f-bd71-4ef2-93e1-1e9ccc5a1b15",
                name: "Thaumaturgy",
                level: 0,
                school: "Transmutation",
                description: "Manifest a minor wonder, a sign of supernatural power."
            }
        ],
        knownSpells: [
            {
                id: "9d14a5f2-dd8f-42a8-9337-c7729e4087f2",
                name: "Cure Wounds",
                level: 1,
                school: "Evocation",
                description: "A creature you touch regains hit points equal to 1d8 + your spellcasting ability modifier."
            },
            {
                id: "e218329e-447f-4355-b3eb-7d476e430828",
                name: "Detect Magic",
                level: 1,
                school: "Divination",
                description: "For the duration, you sense the presence of magic within 30 feet of you."
            },
            {
                id: "e9e09b22-f4e0-423e-a880-c59d8e89b7d2",
                name: "Bless",
                level: 1,
                school: "Enchantment",
                description: "You bless up to three creatures of your choice within range. Whenever a target makes an attack roll or a saving throw before the spell ends, the target can roll a d4 and add the number rolled to the attack roll or saving throw."
            },
            {
                id: "09f10c0f-6aab-49d2-a34c-62f66cdcd5f6",
                name: "Calm Emotions",
                level: 2,
                school: "Enchantment",
                description: "Suppress strong emotions in a group of people."
            },
            {
                id: "8c4ca12d-5eb5-4a1e-a6c6-929f20a26f84",
                name: "Mirror Image",
                level: 2,
                school: "Illusion",
                description: "Create illusory duplicates of yourself to confuse attackers."
            }
        ],
        spellSlots: {
            slot1: 4,
            slot2: 3
        }
    },
    legendaryActions: {
        actionsPerTurn: 3,
        description: "Empress Hermione can take 3 legendary actions, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature's turn. She regains spent legendary actions at the start of her turn.",
        actions: [
            {
                id: "dc721034-7782-4583-9dba-45ef8bd8d315",
                name: "Arcane Awareness",
                desc: "Empress Hermione's magical senses flare. She knows the location of all creatures within 30 feet until the end of her next turn, including invisible creatures.",
                range: "30 ft",
            },
            {
                id: "adf729f4-187c-46ae-8167-90b55a9e4efa",
                name: "Groom",
                desc: "Empress Hermione grooms herself, revitalizing her form. She regains 5 hit points.",
            },
            {
                id: "1ac93c24-a50c-44a0-b06d-e0925fddb4a4",
                name: "Dimensional Leap",
                desc: "Empress Hermione magically teleports, along with any equipment she is wearing or carrying, up to 20 feet to an unoccupied space she can see.",
            }
        ]
    },
    lairActions: {
        lairName: "The Temporal Throne Room",
        lairDescription: "The throne room exists slightly out of sync with normal time, causing the walls to shimmer and shift between different decorative eras. Floating timepieces of various designs tick at different rates, their chimes creating an otherworldly symphony. The air tastes of ozone and possibility, and visitors often experience brief glimpses of past and future moments overlapping with the present.",
        description: "On initiative count 20 (losing initiative ties), Empress Hermione takes a lair action to cause one of the following effects. She can't use the same effect two rounds in a row.",
        actions: [
            {
                id: "b41413f4-c454-4405-9396-e87679451818",
                name: "Temporal Ripple",
                desc: "Empress Hermione causes a ripple in time. Each creature in the lair must succeed on a DC 15 Wisdom saving throw or have disadvantage on its next attack roll, ability check, or saving throw.",
            },
            {
                id: "04ce5264-310f-4e5b-9262-651e91d4185a",
                name: "Gravitational Anomaly",
                desc: "The lair's gravitational pull intensifies momentarily. Each creature in the lair must succeed on a DC 15 Strength saving throw or be knocked prone.",
            },
            {
                id: "d28580af-794f-450c-b49c-d336a3977f86",
                name: "Astral Glimpse",
                desc: "Empress Hermione briefly glimpses into the astral plane. She gains advantage on her next attack roll or saving throw.",
            }
        ]
    }
};

/**
 * Madame Loaf - A fey empress in cat form
 * CR 1 | Showcases: Fey type, charm effects, lair actions, control magic
 */
const madameLoaf: StatBlockDetails = {
    name: "Madame Loaf",
    size: "Small",
    type: "fey",
    alignment: "chaotic neutral",
    armorClass: 13,
    hitPoints: 27,
    hitDice: "5d6+10",
    speed: {
        walk: 30,
        climb: 20
    },
    abilities: {
        str: 8,
        dex: 16,
        con: 14,
        int: 12,
        wis: 14,
        cha: 18
    },
    skills: {
        perception: 4,
        arcana: 3,
        stealth: 5
    },
    damageResistance: "psychic",
    senses: {
        darkvision: 60,
        passivePerception: 14
    },
    languages: "Common, Sylvan",
    challengeRating: "1",
    xp: 200,
    proficiencyBonus: 2,
    description: "Madame Loaf, the alternate identity of Hermione the Stormy Grey British shorthair, is the empress of the universe and the platonic ideal of grumpy. This fey creature represents her chill persona, lounging in laps and basking in warm windows. Despite her relaxed demeanor, Madame Loaf commands respect and admiration from those around her, using her magical prowess to maintain her reign.",
    sdPrompt: "A regal British shorthair cat with a stormy grey coat, lounging in a sunlit window, exuding an aura of majesty and grumpiness. Emphasize her fey-like presence and mystical elements surrounding her.",
    specialAbilities: [
        {
            id: "ec8bf4da-9225-4560-a38a-2ff688f63559",
            name: "Empress Aura",
            desc: "All creatures within 10 feet of Madame Loaf have disadvantage on saving throws against being charmed or frightened.",
        }
    ],
    actions: [
        {
            id: "e41e3736-00d3-4817-8209-5800a61d51de",
            name: "Claw Swipe",
            desc: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) slashing damage.",
            damage: "1d6 + 3",
            range: "5 ft.",
        },
        {
            id: "128c6c10-3b69-4141-8daf-a7e7f20c26f5",
            name: "Chill Purr",
            desc: "Madame Loaf purrs soothingly. Each creature within 10 feet must succeed on a DC 13 Wisdom saving throw or be charmed until the end of Madame Loaf's next turn.",
            range: "10 ft.",
        }
    ],
    bonusActions: [],
    reactions: [],
    spells: {
        level: 3,
        ability: "Charisma",
        save: 13,
        attack: 5,
        cantrips: [
            {
                id: "301a5067-6af8-4c9e-813e-03f432bf2ca7",
                name: "Eldritch Blast",
                level: 0,
                school: "Evocation",
                description: "Ranged spell attack. Hit: 1d10 force damage."
            },
            {
                id: "281e14c3-26d7-4970-8dad-ed817728c0f6",
                name: "Minor Illusion",
                level: 0,
                school: "Illusion",
                description: "Create a sound or an image of an object within range that lasts for 1 minute."
            },
            {
                id: "80c08a45-e223-4b04-9902-b5c106052394",
                name: "Thaumaturgy",
                level: 0,
                school: "Transmutation",
                description: "Create one of several minor magical effects within range."
            }
        ],
        knownSpells: [
            {
                id: "daea38e1-6ee1-43b7-ad5e-9118a74ecb3f",
                name: "Charm Person",
                level: 1,
                school: "Enchantment",
                description: "A humanoid you can see must succeed on a Wisdom saving throw or be charmed by you for 1 hour."
            },
            {
                id: "c2329743-c1dc-4510-8702-55d7fd5baa23",
                name: "Faerie Fire",
                level: 1,
                school: "Evocation",
                description: "Each object in a 20-foot cube is outlined in blue, green, or violet light. Any creature in the area must succeed on a Dexterity saving throw or be outlined as well."
            },
            {
                id: "aad62892-c157-4e16-b132-53cf27ed8a5e",
                name: "Sleep",
                level: 1,
                school: "Enchantment",
                description: "This spell sends creatures into a magical slumber. Roll 5d8; the total is how many hit points of creatures this spell can affect."
            },
            {
                id: "5538e7f6-3442-44ad-ae99-b8118eb6c9f4",
                name: "Calm Emotions",
                level: 2,
                school: "Enchantment",
                description: "Suppress strong emotions in a group of people, charming or frightening effects are suppressed."
            },
            {
                id: "34bd8045-e6df-4b6d-8995-df5a700eb596",
                name: "Misty Step",
                level: 2,
                school: "Conjuration",
                description: "Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see."
            }
        ],
        spellSlots: {
            slot1: 4,
            slot2: 3
        }
    },
    legendaryActions: {
        actionsPerTurn: 3,
        description: "Madame Loaf can take 3 legendary actions, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature's turn. Madame Loaf regains spent legendary actions at the start of her turn.",
        actions: [
            {
                id: "f4c309de-9ad0-4238-8d75-6bcec61f8e60",
                name: "Lap Leap",
                desc: "Madame Loaf moves up to half her speed and can jump onto any creature's lap within range. This movement does not provoke opportunity attacks.",
            },
            {
                id: "464442a3-933c-4af2-b59c-9f3fbbdf3232",
                name: "Grumpy Glare",
                desc: "Madame Loaf gives a grumpy glare at a creature she can see within 30 feet. The target must succeed on a DC 13 Wisdom saving throw or become frightened until the end of its next turn.",
                range: "30 ft.",
            },
            {
                id: "988026df-a6c4-4fe0-b430-9a332070b211",
                name: "Paw Bat",
                desc: "Madame Loaf makes a claw attack against a creature within 5 feet.",
                damage: "1d6 + 3",
                range: "5 ft.",
            }
        ]
    },
    lairActions: {
        lairName: "The Supreme Napping Chambers",
        lairDescription: "Madame Loaf's domain is an impossibly cozy space with sunbeams that seem to follow the softest cushions throughout the day. The air is heavy with the scent of catnip and contentment, and every surface is padded with plush fabrics in various states of cat-hair coverage. A throne of stacked pillows dominates the center, radiating an aura of supreme laziness that makes visitors want to curl up and nap.",
        description: "On initiative count 20 (losing initiative ties), Madame Loaf takes a lair action to cause one of the following effects. She can't use the same effect two rounds in a row.",
        actions: [
            {
                id: "0b457af1-f7e5-4065-84d6-7c6180fc6197",
                name: "Sunbeam Shift",
                desc: "A beam of sunlight shifts across the lair. Each creature in a 10-foot line must make a DC 13 Dexterity saving throw or be blinded until the end of its next turn.",
            },
            {
                id: "3abd7f2d-1719-4346-b5cc-2af03cddd505",
                name: "Snooze Aura",
                desc: "The scent of relaxation fills the air. All creatures within the lair must make a DC 13 Wisdom saving throw or fall asleep for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success.",
            },
            {
                id: "6074b38c-da0a-4128-8577-e37d023d5d19",
                name: "Warm Window",
                desc: "A section of the lair becomes particularly warm and inviting. Any creature that ends its turn in this area must succeed on a DC 13 Wisdom saving throw or be charmed until the end of its next turn.",
            }
        ]
    }
};

/**
 * Array of all demo statblocks for random selection
 */
export const DEMO_STATBLOCKS: StatBlockDetails[] = [
    drJupiter,
    empressHermione,
    madameLoaf
];

/**
 * Get a random demo statblock
 */
export const getRandomDemo = (): StatBlockDetails => {
    const randomIndex = Math.floor(Math.random() * DEMO_STATBLOCKS.length);
    return DEMO_STATBLOCKS[randomIndex];
};

/**
 * Check if a statblock is one of the demos (by name comparison)
 */
export const isDemoStatblock = (name: string): boolean => {
    return DEMO_STATBLOCKS.some(demo => demo.name === name);
};

