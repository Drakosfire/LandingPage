/**
 * D&D 5e SRD Classes - Martial Classes
 * 
 * Phase 1: Barbarian, Fighter, Monk, Rogue (non-casters)
 * Caster classes will be added after spellcasting research completes.
 * 
 * Reference: https://www.dndbeyond.com/sources/dnd/basic-rules-2024
 *            https://github.com/foundryvtt/dnd5e/tree/5.2.x/packs/_source
 * 
 * @module CharacterGenerator/data/dnd5e/classes
 */

import { DnD5eClass, DnD5eSubclass, EquipmentOption } from '../../types';

// ============================================================================
// BARBARIAN
// ============================================================================

/**
 * Barbarian equipment options
 */
const BARBARIAN_EQUIPMENT: EquipmentOption[] = [
    {
        groupId: 'barbarian-weapon-1',
        choose: 1,
        options: [
            {
                id: 'greataxe',
                description: 'A greataxe',
                items: ['greataxe']
            },
            {
                id: 'martial-melee',
                description: 'Any martial melee weapon',
                items: ['martial-melee-choice']
            }
        ]
    },
    {
        groupId: 'barbarian-weapon-2',
        choose: 1,
        options: [
            {
                id: 'two-handaxes',
                description: 'Two handaxes',
                items: ['handaxe', 'handaxe']
            },
            {
                id: 'simple-weapon',
                description: 'Any simple weapon',
                items: ['simple-weapon-choice']
            }
        ]
    },
    {
        groupId: 'barbarian-pack',
        choose: 1,
        options: [
            {
                id: 'explorer-pack',
                description: "An explorer's pack",
                items: ['explorers-pack']
            }
        ]
    },
    {
        groupId: 'barbarian-javelins',
        choose: 1,
        options: [
            {
                id: 'four-javelins',
                description: 'Four javelins',
                items: ['javelin', 'javelin', 'javelin', 'javelin']
            }
        ]
    }
];

/**
 * Berserker subclass (SRD)
 */
const BERSERKER: DnD5eSubclass = {
    id: 'berserker',
    name: 'Path of the Berserker',
    className: 'barbarian',
    description: 'For some barbarians, rage is a means to an end—that end being violence. The Path of the Berserker is a path of untrammeled fury, slick with blood. As you enter the berserker\'s rage, you thrill in the chaos of battle, heedless of your own health or well-being.',
    features: {
        3: [
            {
                id: 'frenzy',
                name: 'Frenzy',
                description: 'Starting when you choose this path at 3rd level, you can go into a frenzy when you rage. If you do so, for the duration of your rage you can make a single melee weapon attack as a bonus action on each of your turns after this one. When your rage ends, you suffer one level of exhaustion.',
                source: 'class',
                sourceDetails: 'Path of the Berserker'
            }
        ]
    },
    source: 'SRD'
};

/**
 * Barbarian class
 */
export const BARBARIAN: DnD5eClass = {
    id: 'barbarian',
    name: 'Barbarian',
    hitDie: 12,
    primaryAbility: ['strength'],
    savingThrows: ['strength', 'constitution'],
    armorProficiencies: ['light armor', 'medium armor', 'shields'],
    weaponProficiencies: ['simple weapons', 'martial weapons'],
    skillChoices: {
        choose: 2,
        from: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival']
    },
    equipmentOptions: BARBARIAN_EQUIPMENT,
    startingGold: { dice: '2d4', multiplier: 10 },
    features: {
        1: [
            {
                id: 'rage',
                name: 'Rage',
                description: 'In battle, you fight with primal ferocity. On your turn, you can enter a rage as a bonus action. While raging, you gain the following benefits if you aren\'t wearing heavy armor: You have advantage on Strength checks and Strength saving throws. When you make a melee weapon attack using Strength, you gain a bonus to the damage roll that increases as you gain levels as a barbarian (+2 at 1st level, +3 at 9th, +4 at 16th). You have resistance to bludgeoning, piercing, and slashing damage. Your rage lasts for 1 minute. It ends early if you are knocked unconscious or if your turn ends and you haven\'t attacked a hostile creature since your last turn or taken damage since then. You can also end your rage on your turn as a bonus action. Once you have raged 2 times, you must finish a long rest before you can rage again. The number of rages increases at higher levels (3 at 3rd, 4 at 6th, 5 at 12th, 6 at 17th, unlimited at 20th).',
                source: 'class',
                sourceDetails: 'Barbarian Level 1',
                limitedUse: {
                    maxUses: 2,
                    currentUses: 2,
                    resetOn: 'long'
                }
            },
            {
                id: 'unarmored-defense-barbarian',
                name: 'Unarmored Defense',
                description: 'While you are not wearing any armor, your Armor Class equals 10 + your Dexterity modifier + your Constitution modifier. You can use a shield and still gain this benefit.',
                source: 'class',
                sourceDetails: 'Barbarian Level 1'
            }
        ],
        2: [
            {
                id: 'reckless-attack',
                name: 'Reckless Attack',
                description: 'Starting at 2nd level, you can throw aside all concern for defense to attack with fierce desperation. When you make your first attack on your turn, you can decide to attack recklessly. Doing so gives you advantage on melee weapon attack rolls using Strength during this turn, but attack rolls against you have advantage until your next turn.',
                source: 'class',
                sourceDetails: 'Barbarian Level 2'
            },
            {
                id: 'danger-sense',
                name: 'Danger Sense',
                description: 'At 2nd level, you gain an uncanny sense of when things nearby aren\'t as they should be, giving you an edge when you dodge away from danger. You have advantage on Dexterity saving throws against effects that you can see, such as traps and spells. To gain this benefit, you can\'t be blinded, deafened, or incapacitated.',
                source: 'class',
                sourceDetails: 'Barbarian Level 2'
            }
        ],
        3: [
            {
                id: 'primal-path',
                name: 'Primal Path',
                description: 'At 3rd level, you choose a path that shapes the nature of your rage. The Path of the Berserker is detailed at the end of the class description. Your choice grants you features at 3rd level and again at 6th, 10th, and 14th levels.',
                source: 'class',
                sourceDetails: 'Barbarian Level 3'
            }
        ]
    },
    subclasses: [BERSERKER],
    subclassLevel: 3,
    description: 'A fierce warrior of primitive background who can enter a battle rage. For some, their rage springs from a communion with fierce animal spirits. Others draw from a roiling reservoir of anger at a world full of pain. For every barbarian, rage is a power that fuels not just a battle frenzy but also uncanny reflexes, resilience, and feats of strength.',
    source: 'SRD'
};

// ============================================================================
// FIGHTER
// ============================================================================

/**
 * Fighter equipment options
 */
const FIGHTER_EQUIPMENT: EquipmentOption[] = [
    {
        groupId: 'fighter-armor',
        choose: 1,
        options: [
            {
                id: 'chain-mail',
                description: 'Chain mail',
                items: ['chain-mail']
            },
            {
                id: 'leather-longbow-arrows',
                description: 'Leather armor, longbow, and 20 arrows',
                items: ['leather-armor', 'longbow', 'arrows-20']
            }
        ]
    },
    {
        groupId: 'fighter-weapon-1',
        choose: 1,
        options: [
            {
                id: 'martial-weapon-shield',
                description: 'A martial weapon and a shield',
                items: ['martial-weapon-choice', 'shield']
            },
            {
                id: 'two-martial-weapons',
                description: 'Two martial weapons',
                items: ['martial-weapon-choice', 'martial-weapon-choice']
            }
        ]
    },
    {
        groupId: 'fighter-ranged',
        choose: 1,
        options: [
            {
                id: 'light-crossbow-bolts',
                description: 'A light crossbow and 20 bolts',
                items: ['light-crossbow', 'bolts-20']
            },
            {
                id: 'two-handaxes',
                description: 'Two handaxes',
                items: ['handaxe', 'handaxe']
            }
        ]
    },
    {
        groupId: 'fighter-pack',
        choose: 1,
        options: [
            {
                id: 'dungeoneers-pack',
                description: "A dungeoneer's pack",
                items: ['dungeoneers-pack']
            },
            {
                id: 'explorers-pack',
                description: "An explorer's pack",
                items: ['explorers-pack']
            }
        ]
    }
];

/**
 * Fighter Fighting Styles (Level 1 choice)
 */
export const FIGHTER_FIGHTING_STYLES = [
    {
        id: 'archery',
        name: 'Archery',
        description: 'You gain a +2 bonus to attack rolls you make with ranged weapons.'
    },
    {
        id: 'defense',
        name: 'Defense',
        description: 'While you are wearing armor, you gain a +1 bonus to AC.'
    },
    {
        id: 'dueling',
        name: 'Dueling',
        description: 'When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.'
    },
    {
        id: 'great-weapon-fighting',
        name: 'Great Weapon Fighting',
        description: 'When you roll a 1 or 2 on a damage die for an attack you make with a melee weapon that you are wielding with two hands, you can reroll the die and must use the new roll, even if the new roll is a 1 or a 2. The weapon must have the two-handed or versatile property for you to gain this benefit.'
    },
    {
        id: 'protection',
        name: 'Protection',
        description: 'When a creature you can see attacks a target other than you that is within 5 feet of you, you can use your reaction to impose disadvantage on the attack roll. You must be wielding a shield.'
    },
    {
        id: 'two-weapon-fighting',
        name: 'Two-Weapon Fighting',
        description: 'When you engage in two-weapon fighting, you can add your ability modifier to the damage of the second attack.'
    }
] as const;

/**
 * Champion subclass (SRD)
 */
const CHAMPION: DnD5eSubclass = {
    id: 'champion',
    name: 'Champion',
    className: 'fighter',
    description: 'The archetypal Champion focuses on the development of raw physical power honed to deadly perfection. Those who model themselves on this archetype combine rigorous training with physical excellence to deal devastating blows.',
    features: {
        3: [
            {
                id: 'improved-critical',
                name: 'Improved Critical',
                description: 'Beginning when you choose this archetype at 3rd level, your weapon attacks score a critical hit on a roll of 19 or 20.',
                source: 'class',
                sourceDetails: 'Champion'
            }
        ]
    },
    source: 'SRD'
};

/**
 * Fighter class
 */
export const FIGHTER: DnD5eClass = {
    id: 'fighter',
    name: 'Fighter',
    hitDie: 10,
    primaryAbility: ['strength', 'dexterity'],
    savingThrows: ['strength', 'constitution'],
    armorProficiencies: ['light armor', 'medium armor', 'heavy armor', 'shields'],
    weaponProficiencies: ['simple weapons', 'martial weapons'],
    skillChoices: {
        choose: 2,
        from: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival']
    },
    equipmentOptions: FIGHTER_EQUIPMENT,
    startingGold: { dice: '5d4', multiplier: 10 },
    features: {
        1: [
            {
                id: 'fighting-style-fighter',
                name: 'Fighting Style',
                description: 'You adopt a particular style of fighting as your specialty. Choose one of the following options. You can\'t take a Fighting Style option more than once, even if you later get to choose again.',
                source: 'class',
                sourceDetails: 'Fighter Level 1'
            },
            {
                id: 'second-wind',
                name: 'Second Wind',
                description: 'You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level. Once you use this feature, you must finish a short or long rest before you can use it again.',
                source: 'class',
                sourceDetails: 'Fighter Level 1',
                limitedUse: {
                    maxUses: 1,
                    currentUses: 1,
                    resetOn: 'short'
                }
            }
        ],
        2: [
            {
                id: 'action-surge',
                name: 'Action Surge',
                description: 'Starting at 2nd level, you can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action. Once you use this feature, you must finish a short or long rest before you can use it again. Starting at 17th level, you can use it twice before a rest, but only once on the same turn.',
                source: 'class',
                sourceDetails: 'Fighter Level 2',
                limitedUse: {
                    maxUses: 1,
                    currentUses: 1,
                    resetOn: 'short'
                }
            }
        ],
        3: [
            {
                id: 'martial-archetype',
                name: 'Martial Archetype',
                description: 'At 3rd level, you choose an archetype that you strive to emulate in your combat styles and techniques. The Champion archetype is detailed at the end of the class description. The archetype you choose grants you features at 3rd level and again at 7th, 10th, 15th, and 18th level.',
                source: 'class',
                sourceDetails: 'Fighter Level 3'
            }
        ]
    },
    subclasses: [CHAMPION],
    subclassLevel: 3,
    description: 'A master of martial combat, skilled with a variety of weapons and armor. Fighters learn the basics of all combat styles. Every fighter can swing an axe, fence with a rapier, wield a longsword or a greatsword, use a bow, and even trap foes in a net with some degree of skill. Likewise, a fighter is adept with shields and every form of armor.',
    source: 'SRD'
};

// ============================================================================
// MONK
// ============================================================================

/**
 * Monk equipment options
 */
const MONK_EQUIPMENT: EquipmentOption[] = [
    {
        groupId: 'monk-weapon',
        choose: 1,
        options: [
            {
                id: 'shortsword',
                description: 'A shortsword',
                items: ['shortsword']
            },
            {
                id: 'simple-weapon',
                description: 'Any simple weapon',
                items: ['simple-weapon-choice']
            }
        ]
    },
    {
        groupId: 'monk-pack',
        choose: 1,
        options: [
            {
                id: 'dungeoneers-pack',
                description: "A dungeoneer's pack",
                items: ['dungeoneers-pack']
            },
            {
                id: 'explorers-pack',
                description: "An explorer's pack",
                items: ['explorers-pack']
            }
        ]
    },
    {
        groupId: 'monk-darts',
        choose: 1,
        options: [
            {
                id: 'ten-darts',
                description: '10 darts',
                items: ['dart', 'dart', 'dart', 'dart', 'dart', 'dart', 'dart', 'dart', 'dart', 'dart']
            }
        ]
    }
];

/**
 * Martial Arts die by monk level
 */
export const MONK_MARTIAL_ARTS_DIE: Record<number, number> = {
    1: 4,   // 1d4
    2: 4,
    3: 4,
    4: 4,
    5: 6,   // 1d6
    6: 6,
    7: 6,
    8: 6,
    9: 6,
    10: 6,
    11: 8,  // 1d8
    12: 8,
    13: 8,
    14: 8,
    15: 8,
    16: 8,
    17: 10, // 1d10
    18: 10,
    19: 10,
    20: 10
};

/**
 * Way of the Open Hand subclass (SRD)
 */
const WAY_OF_THE_OPEN_HAND: DnD5eSubclass = {
    id: 'way-of-the-open-hand',
    name: 'Way of the Open Hand',
    className: 'monk',
    description: 'Monks of the Way of the Open Hand are the ultimate masters of martial arts combat, whether armed or unarmed. They learn techniques to push and trip their opponents, manipulate ki to heal damage to their bodies, and practice advanced meditation that can protect them from harm.',
    features: {
        3: [
            {
                id: 'open-hand-technique',
                name: 'Open Hand Technique',
                description: 'Starting when you choose this tradition at 3rd level, you can manipulate your enemy\'s ki when you harness your own. Whenever you hit a creature with one of the attacks granted by your Flurry of Blows, you can impose one of the following effects on that target: It must succeed on a Dexterity saving throw or be knocked prone. It must make a Strength saving throw. If it fails, you can push it up to 15 feet away from you. It can\'t take reactions until the end of your next turn.',
                source: 'class',
                sourceDetails: 'Way of the Open Hand'
            }
        ]
    },
    source: 'SRD'
};

/**
 * Monk class
 */
export const MONK: DnD5eClass = {
    id: 'monk',
    name: 'Monk',
    hitDie: 8,
    primaryAbility: ['dexterity', 'wisdom'],
    savingThrows: ['strength', 'dexterity'],
    armorProficiencies: [],
    weaponProficiencies: ['simple weapons', 'shortswords'],
    skillChoices: {
        choose: 2,
        from: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth']
    },
    equipmentOptions: MONK_EQUIPMENT,
    startingGold: { dice: '5d4', multiplier: 1 },
    features: {
        1: [
            {
                id: 'unarmored-defense-monk',
                name: 'Unarmored Defense',
                description: 'Beginning at 1st level, while you are wearing no armor and not wielding a shield, your AC equals 10 + your Dexterity modifier + your Wisdom modifier.',
                source: 'class',
                sourceDetails: 'Monk Level 1'
            },
            {
                id: 'martial-arts',
                name: 'Martial Arts',
                description: 'At 1st level, your practice of martial arts gives you mastery of combat styles that use unarmed strikes and monk weapons, which are shortswords and any simple melee weapons that don\'t have the two-handed or heavy property. You gain the following benefits while you are unarmed or wielding only monk weapons and you aren\'t wearing armor or wielding a shield: You can use Dexterity instead of Strength for the attack and damage rolls of your unarmed strikes and monk weapons. You can roll a d4 in place of the normal damage of your unarmed strike or monk weapon. This die changes as you gain monk levels (d6 at 5th, d8 at 11th, d10 at 17th). When you use the Attack action with an unarmed strike or a monk weapon on your turn, you can make one unarmed strike as a bonus action.',
                source: 'class',
                sourceDetails: 'Monk Level 1'
            }
        ],
        2: [
            {
                id: 'ki',
                name: 'Ki',
                description: 'Starting at 2nd level, your training allows you to harness the mystic energy of ki. Your access to this energy is represented by a number of ki points. Your monk level determines the number of points you have. You can spend these points to fuel various ki features. You start knowing three such features: Flurry of Blows, Patient Defense, and Step of the Wind. When you spend a ki point, it is unavailable until you finish a short or long rest, at the end of which you draw all of your expended ki back into yourself. You must spend at least 30 minutes of the rest meditating to regain your ki points. Ki save DC = 8 + your proficiency bonus + your Wisdom modifier.',
                source: 'class',
                sourceDetails: 'Monk Level 2'
            },
            {
                id: 'flurry-of-blows',
                name: 'Flurry of Blows',
                description: 'Immediately after you take the Attack action on your turn, you can spend 1 ki point to make two unarmed strikes as a bonus action.',
                source: 'class',
                sourceDetails: 'Monk Level 2'
            },
            {
                id: 'patient-defense',
                name: 'Patient Defense',
                description: 'You can spend 1 ki point to take the Dodge action as a bonus action on your turn.',
                source: 'class',
                sourceDetails: 'Monk Level 2'
            },
            {
                id: 'step-of-the-wind',
                name: 'Step of the Wind',
                description: 'You can spend 1 ki point to take the Disengage or Dash action as a bonus action on your turn, and your jump distance is doubled for the turn.',
                source: 'class',
                sourceDetails: 'Monk Level 2'
            },
            {
                id: 'unarmored-movement',
                name: 'Unarmored Movement',
                description: 'Starting at 2nd level, your speed increases by 10 feet while you are not wearing armor or wielding a shield. This bonus increases when you reach certain monk levels (15 feet at 6th, 20 feet at 10th, 25 feet at 14th, 30 feet at 18th). At 9th level, you gain the ability to move along vertical surfaces and across liquids on your turn without falling during the move.',
                source: 'class',
                sourceDetails: 'Monk Level 2'
            }
        ],
        3: [
            {
                id: 'monastic-tradition',
                name: 'Monastic Tradition',
                description: 'When you reach 3rd level, you commit yourself to a monastic tradition. The Way of the Open Hand is detailed at the end of the class description. Your tradition grants you features at 3rd level and again at 6th, 11th, and 17th level.',
                source: 'class',
                sourceDetails: 'Monk Level 3'
            },
            {
                id: 'deflect-missiles',
                name: 'Deflect Missiles',
                description: 'Starting at 3rd level, you can use your reaction to deflect or catch the missile when you are hit by a ranged weapon attack. When you do so, the damage you take from the attack is reduced by 1d10 + your Dexterity modifier + your monk level. If you reduce the damage to 0, you can catch the missile if it is small enough for you to hold in one hand and you have at least one hand free. If you catch a missile in this way, you can spend 1 ki point to make a ranged attack with the weapon or piece of ammunition you just caught, as part of the same reaction. You make this attack with proficiency, regardless of your weapon proficiencies, and the missile counts as a monk weapon for the attack, which has a normal range of 20 feet and a long range of 60 feet.',
                source: 'class',
                sourceDetails: 'Monk Level 3'
            }
        ]
    },
    subclasses: [WAY_OF_THE_OPEN_HAND],
    subclassLevel: 3,
    description: 'A master of martial arts, harnessing the power of the body in pursuit of physical and spiritual perfection. Monks make careful study of a magical energy that most monastic traditions call ki. This energy is an element of the magic that suffuses the multiverse—specifically, the element that flows through living bodies.',
    source: 'SRD'
};

// ============================================================================
// ROGUE
// ============================================================================

/**
 * Rogue equipment options
 */
const ROGUE_EQUIPMENT: EquipmentOption[] = [
    {
        groupId: 'rogue-weapon-1',
        choose: 1,
        options: [
            {
                id: 'rapier',
                description: 'A rapier',
                items: ['rapier']
            },
            {
                id: 'shortsword',
                description: 'A shortsword',
                items: ['shortsword']
            }
        ]
    },
    {
        groupId: 'rogue-ranged',
        choose: 1,
        options: [
            {
                id: 'shortbow-quiver',
                description: 'A shortbow and quiver of 20 arrows',
                items: ['shortbow', 'quiver', 'arrows-20']
            },
            {
                id: 'shortsword',
                description: 'A shortsword',
                items: ['shortsword']
            }
        ]
    },
    {
        groupId: 'rogue-pack',
        choose: 1,
        options: [
            {
                id: 'burglars-pack',
                description: "A burglar's pack",
                items: ['burglars-pack']
            },
            {
                id: 'dungeoneers-pack',
                description: "A dungeoneer's pack",
                items: ['dungeoneers-pack']
            },
            {
                id: 'explorers-pack',
                description: "An explorer's pack",
                items: ['explorers-pack']
            }
        ]
    },
    {
        groupId: 'rogue-standard',
        choose: 1,
        options: [
            {
                id: 'leather-daggers-tools',
                description: 'Leather armor, two daggers, and thieves\' tools',
                items: ['leather-armor', 'dagger', 'dagger', 'thieves-tools']
            }
        ]
    }
];

/**
 * Sneak Attack dice by rogue level
 */
export const ROGUE_SNEAK_ATTACK_DICE: Record<number, number> = {
    1: 1,   // 1d6
    2: 1,
    3: 2,   // 2d6
    4: 2,
    5: 3,   // 3d6
    6: 3,
    7: 4,   // 4d6
    8: 4,
    9: 5,   // 5d6
    10: 5,
    11: 6,  // 6d6
    12: 6,
    13: 7,  // 7d6
    14: 7,
    15: 8,  // 8d6
    16: 8,
    17: 9,  // 9d6
    18: 9,
    19: 10, // 10d6
    20: 10
};

/**
 * Thief subclass (SRD)
 */
const THIEF: DnD5eSubclass = {
    id: 'thief',
    name: 'Thief',
    className: 'rogue',
    description: 'You hone your skills in the larcenous arts. Burglars, bandits, cutpurses, and other criminals typically follow this archetype, but so do rogues who prefer to think of themselves as professional treasure seekers, explorers, delvers, and investigators.',
    features: {
        3: [
            {
                id: 'fast-hands',
                name: 'Fast Hands',
                description: 'Starting at 3rd level, you can use the bonus action granted by your Cunning Action to make a Dexterity (Sleight of Hand) check, use your thieves\' tools to disarm a trap or open a lock, or take the Use an Object action.',
                source: 'class',
                sourceDetails: 'Thief'
            },
            {
                id: 'second-story-work',
                name: 'Second-Story Work',
                description: 'When you choose this archetype at 3rd level, you gain the ability to climb faster than normal; climbing no longer costs you extra movement. In addition, when you make a running jump, the distance you cover increases by a number of feet equal to your Dexterity modifier.',
                source: 'class',
                sourceDetails: 'Thief'
            }
        ]
    },
    source: 'SRD'
};

/**
 * Rogue class
 */
export const ROGUE: DnD5eClass = {
    id: 'rogue',
    name: 'Rogue',
    hitDie: 8,
    primaryAbility: ['dexterity'],
    savingThrows: ['dexterity', 'intelligence'],
    armorProficiencies: ['light armor'],
    weaponProficiencies: ['simple weapons', 'hand crossbows', 'longswords', 'rapiers', 'shortswords'],
    toolProficiencies: ['thieves\' tools'],
    skillChoices: {
        choose: 4,
        from: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth']
    },
    equipmentOptions: ROGUE_EQUIPMENT,
    startingGold: { dice: '4d4', multiplier: 10 },
    features: {
        1: [
            {
                id: 'expertise-rogue',
                name: 'Expertise',
                description: 'At 1st level, choose two of your skill proficiencies, or one of your skill proficiencies and your proficiency with thieves\' tools. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies. At 6th level, you can choose two more of your proficiencies (in skills or with thieves\' tools) to gain this benefit.',
                source: 'class',
                sourceDetails: 'Rogue Level 1'
            },
            {
                id: 'sneak-attack',
                name: 'Sneak Attack',
                description: 'Beginning at 1st level, you know how to strike subtly and exploit a foe\'s distraction. Once per turn, you can deal an extra 1d6 damage to one creature you hit with an attack if you have advantage on the attack roll. The attack must use a finesse or a ranged weapon. You don\'t need advantage on the attack roll if another enemy of the target is within 5 feet of it, that enemy isn\'t incapacitated, and you don\'t have disadvantage on the attack roll. The amount of the extra damage increases as you gain levels in this class.',
                source: 'class',
                sourceDetails: 'Rogue Level 1'
            },
            {
                id: 'thieves-cant',
                name: 'Thieves\' Cant',
                description: 'During your rogue training you learned thieves\' cant, a secret mix of dialect, jargon, and code that allows you to hide messages in seemingly normal conversation. Only another creature that knows thieves\' cant understands such messages. It takes four times longer to convey such a message than it does to speak the same idea plainly. In addition, you understand a set of secret signs and symbols used to convey short, simple messages, such as whether an area is dangerous or the territory of a thieves\' guild, whether loot is nearby, or whether the people in an area are easy marks or will provide a safe house for thieves on the run.',
                source: 'class',
                sourceDetails: 'Rogue Level 1'
            }
        ],
        2: [
            {
                id: 'cunning-action',
                name: 'Cunning Action',
                description: 'Starting at 2nd level, your quick thinking and agility allow you to move and act quickly. You can take a bonus action on each of your turns in combat. This action can be used only to take the Dash, Disengage, or Hide action.',
                source: 'class',
                sourceDetails: 'Rogue Level 2'
            }
        ],
        3: [
            {
                id: 'roguish-archetype',
                name: 'Roguish Archetype',
                description: 'At 3rd level, you choose an archetype that you emulate in the exercise of your rogue abilities. The Thief archetype is detailed at the end of the class description. Your archetype choice grants you features at 3rd level and then again at 9th, 13th, and 17th level.',
                source: 'class',
                sourceDetails: 'Rogue Level 3'
            }
        ]
    },
    subclasses: [THIEF],
    subclassLevel: 3,
    description: 'A scoundrel who uses stealth and trickery to overcome obstacles and enemies. Rogues rely on skill, stealth, and their foes\' vulnerabilities to get the upper hand in any situation. They have a knack for finding the solution to just about any problem, demonstrating a resourcefulness and versatility that is the cornerstone of any successful adventuring party.',
    source: 'SRD'
};

// ============================================================================
// BARD (Full Caster - Known Spells)
// ============================================================================

/**
 * Full caster spell slot progression (levels 1-20)
 * Shared by Bard, Cleric, Druid, Sorcerer, Wizard
 */
export const FULL_CASTER_SPELL_SLOTS: Record<number, number[]> = {
    1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
    2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
    3: [4, 2, 0, 0, 0, 0, 0, 0, 0],
    4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
    5: [4, 3, 2, 0, 0, 0, 0, 0, 0],
    6: [4, 3, 3, 0, 0, 0, 0, 0, 0],
    7: [4, 3, 3, 1, 0, 0, 0, 0, 0],
    8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
    9: [4, 3, 3, 3, 1, 0, 0, 0, 0],
    10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
    11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
    12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
    13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
    14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
    15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
    16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
    17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
    18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
    19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
    20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
};

/**
 * Bard equipment options
 */
const BARD_EQUIPMENT: EquipmentOption[] = [
    {
        groupId: 'bard-weapon',
        choose: 1,
        options: [
            {
                id: 'rapier',
                description: 'A rapier',
                items: ['rapier']
            },
            {
                id: 'longsword',
                description: 'A longsword',
                items: ['longsword']
            },
            {
                id: 'simple-weapon',
                description: 'Any simple weapon',
                items: ['simple-weapon-choice']
            }
        ]
    },
    {
        groupId: 'bard-pack',
        choose: 1,
        options: [
            {
                id: 'diplomats-pack',
                description: "A diplomat's pack",
                items: ['diplomats-pack']
            },
            {
                id: 'entertainers-pack',
                description: "An entertainer's pack",
                items: ['entertainers-pack']
            }
        ]
    },
    {
        groupId: 'bard-instrument',
        choose: 1,
        options: [
            {
                id: 'lute',
                description: 'A lute',
                items: ['lute']
            },
            {
                id: 'musical-instrument',
                description: 'Any musical instrument',
                items: ['musical-instrument-choice']
            }
        ]
    },
    {
        groupId: 'bard-standard',
        choose: 1,
        options: [
            {
                id: 'leather-dagger',
                description: 'Leather armor and a dagger',
                items: ['leather-armor', 'dagger']
            }
        ]
    }
];

/**
 * Bard spells known progression (levels 1-20)
 */
export const BARD_SPELLS_KNOWN: Record<number, number> = {
    1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 14,
    11: 15, 12: 15, 13: 16, 14: 18, 15: 19, 16: 19, 17: 20, 18: 22, 19: 22, 20: 22
};

/**
 * Bard cantrips known progression
 */
export const BARD_CANTRIPS_KNOWN: Record<number, number> = {
    1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4
};

/**
 * College of Lore subclass (SRD)
 */
const COLLEGE_OF_LORE: DnD5eSubclass = {
    id: 'college-of-lore',
    name: 'College of Lore',
    className: 'bard',
    description: 'Bards of the College of Lore know something about most things, collecting bits of knowledge from sources as diverse as scholarly tomes and peasant tales. Whether singing folk ballads in taverns or elaborate compositions in royal courts, these bards use their gifts to hold audiences spellbound.',
    features: {
        3: [
            {
                id: 'bonus-proficiencies-lore',
                name: 'Bonus Proficiencies',
                description: 'When you join the College of Lore at 3rd level, you gain proficiency with three skills of your choice.',
                source: 'class',
                sourceDetails: 'College of Lore'
            },
            {
                id: 'cutting-words',
                name: 'Cutting Words',
                description: 'Also at 3rd level, you learn how to use your wit to distract, confuse, and otherwise sap the confidence and competence of others. When a creature that you can see within 60 feet of you makes an attack roll, an ability check, or a damage roll, you can use your reaction to expend one of your uses of Bardic Inspiration, rolling a Bardic Inspiration die and subtracting the number rolled from the creature\'s roll. You can choose to use this feature after the creature makes its roll, but before the DM determines whether the attack roll or ability check succeeds or fails, or before the creature deals its damage. The creature is immune if it can\'t hear you or if it\'s immune to being charmed.',
                source: 'class',
                sourceDetails: 'College of Lore'
            }
        ]
    },
    source: 'SRD'
};

/**
 * Bard class (Full Caster - Known Spells)
 */
export const BARD: DnD5eClass = {
    id: 'bard',
    name: 'Bard',
    hitDie: 8,
    primaryAbility: ['charisma'],
    savingThrows: ['dexterity', 'charisma'],
    armorProficiencies: ['light armor'],
    weaponProficiencies: ['simple weapons', 'hand crossbows', 'longswords', 'rapiers', 'shortswords'],
    toolProficiencies: ['three musical instruments of your choice'],
    skillChoices: {
        choose: 3,
        from: ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival']
    },
    equipmentOptions: BARD_EQUIPMENT,
    startingGold: { dice: '5d4', multiplier: 10 },
    features: {
        1: [
            {
                id: 'spellcasting-bard',
                name: 'Spellcasting',
                description: 'You have learned to untangle and reshape the fabric of reality in harmony with your wishes and music. Your spells are part of your vast repertoire, magic that you can tune to different situations. Charisma is your spellcasting ability for your bard spells.',
                source: 'class',
                sourceDetails: 'Bard Level 1'
            },
            {
                id: 'bardic-inspiration',
                name: 'Bardic Inspiration',
                description: 'You can inspire others through stirring words or music. To do so, you use a bonus action on your turn to choose one creature other than yourself within 60 feet of you who can hear you. That creature gains one Bardic Inspiration die, a d6. Once within the next 10 minutes, the creature can roll the die and add the number rolled to one ability check, attack roll, or saving throw it makes. The creature can wait until after it rolls the d20 before deciding to use the Bardic Inspiration die, but must decide before the DM says whether the roll succeeds or fails. Once the Bardic Inspiration die is rolled, it is lost. A creature can have only one Bardic Inspiration die at a time. You can use this feature a number of times equal to your Charisma modifier (a minimum of once). You regain any expended uses when you finish a long rest. Your Bardic Inspiration die changes when you reach certain levels in this class. The die becomes a d8 at 5th level, a d10 at 10th level, and a d12 at 15th level.',
                source: 'class',
                sourceDetails: 'Bard Level 1'
            }
        ],
        2: [
            {
                id: 'jack-of-all-trades',
                name: 'Jack of All Trades',
                description: 'Starting at 2nd level, you can add half your proficiency bonus, rounded down, to any ability check you make that doesn\'t already include your proficiency bonus.',
                source: 'class',
                sourceDetails: 'Bard Level 2'
            },
            {
                id: 'song-of-rest',
                name: 'Song of Rest',
                description: 'Beginning at 2nd level, you can use soothing music or oration to help revitalize your wounded allies during a short rest. If you or any friendly creatures who can hear your performance regain hit points at the end of the short rest by spending one or more Hit Dice, each of those creatures regains an extra 1d6 hit points. The extra hit points increase when you reach certain levels in this class: to 1d8 at 9th level, to 1d10 at 13th level, and to 1d12 at 17th level.',
                source: 'class',
                sourceDetails: 'Bard Level 2'
            }
        ],
        3: [
            {
                id: 'bard-college',
                name: 'Bard College',
                description: 'At 3rd level, you delve into the advanced techniques of a bard college of your choice. The College of Lore is detailed at the end of the class description. Your choice grants you features at 3rd level and again at 6th and 14th level.',
                source: 'class',
                sourceDetails: 'Bard Level 3'
            },
            {
                id: 'expertise-bard',
                name: 'Expertise',
                description: 'At 3rd level, choose two of your skill proficiencies. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies. At 10th level, you can choose another two skill proficiencies to gain this benefit.',
                source: 'class',
                sourceDetails: 'Bard Level 3'
            }
        ]
    },
    subclasses: [COLLEGE_OF_LORE],
    subclassLevel: 3,
    spellcasting: {
        ability: 'charisma',
        cantripsKnown: BARD_CANTRIPS_KNOWN,
        spellsKnown: BARD_SPELLS_KNOWN,
        spellSlots: FULL_CASTER_SPELL_SLOTS,
        spellListId: 'bard',
        ritualCasting: true
    },
    description: 'An inspiring magician whose power echoes the music of creation. In the worlds of D&D, words and music are not just vibrations of air, but vocalizations with power all their own. The bard is a master of song, speech, and the magic they contain. Bards say that the multiverse was spoken into existence, that the words of the gods gave it shape, and that echoes of these primordial Words of Creation still resound throughout the cosmos.',
    source: 'SRD'
};

// ============================================================================
// CLERIC (Full Caster - Prepared Spells)
// ============================================================================

/**
 * Cleric equipment options
 */
const CLERIC_EQUIPMENT: EquipmentOption[] = [
    {
        groupId: 'cleric-weapon',
        choose: 1,
        options: [
            {
                id: 'mace',
                description: 'A mace',
                items: ['mace']
            },
            {
                id: 'warhammer',
                description: 'A warhammer (if proficient)',
                items: ['warhammer']
            }
        ]
    },
    {
        groupId: 'cleric-armor',
        choose: 1,
        options: [
            {
                id: 'scale-mail',
                description: 'Scale mail',
                items: ['scale-mail']
            },
            {
                id: 'leather-armor',
                description: 'Leather armor',
                items: ['leather-armor']
            },
            {
                id: 'chain-mail',
                description: 'Chain mail (if proficient)',
                items: ['chain-mail']
            }
        ]
    },
    {
        groupId: 'cleric-weapon-2',
        choose: 1,
        options: [
            {
                id: 'light-crossbow-bolts',
                description: 'A light crossbow and 20 bolts',
                items: ['light-crossbow', 'bolts-20']
            },
            {
                id: 'simple-weapon',
                description: 'Any simple weapon',
                items: ['simple-weapon-choice']
            }
        ]
    },
    {
        groupId: 'cleric-pack',
        choose: 1,
        options: [
            {
                id: 'priests-pack',
                description: "A priest's pack",
                items: ['priests-pack']
            },
            {
                id: 'explorers-pack',
                description: "An explorer's pack",
                items: ['explorers-pack']
            }
        ]
    },
    {
        groupId: 'cleric-standard',
        choose: 1,
        options: [
            {
                id: 'shield-holy-symbol',
                description: 'A shield and a holy symbol',
                items: ['shield', 'holy-symbol']
            }
        ]
    }
];

/**
 * Cleric cantrips known progression
 */
export const CLERIC_CANTRIPS_KNOWN: Record<number, number> = {
    1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 5,
    11: 5, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 17: 5, 18: 5, 19: 5, 20: 5
};

/**
 * Life Domain subclass (SRD) - Chosen at Level 1
 */
const LIFE_DOMAIN: DnD5eSubclass = {
    id: 'life-domain',
    name: 'Life Domain',
    className: 'cleric',
    description: 'The Life domain focuses on the vibrant positive energy—one of the fundamental forces of the universe—that sustains all life. The gods of life promote vitality and health through healing the sick and wounded, caring for those in need, and driving away the forces of death and undeath.',
    features: {
        1: [
            {
                id: 'domain-spells-life',
                name: 'Life Domain Spells',
                description: 'You gain domain spells at the cleric levels listed. At 1st level: Bless, Cure Wounds. At 3rd level: Lesser Restoration, Spiritual Weapon. At 5th level: Beacon of Hope, Revivify. At 7th level: Death Ward, Guardian of Faith. At 9th level: Mass Cure Wounds, Raise Dead. Once you gain a domain spell, you always have it prepared, and it doesn\'t count against the number of spells you can prepare each day.',
                source: 'class',
                sourceDetails: 'Life Domain'
            },
            {
                id: 'bonus-proficiency-life',
                name: 'Bonus Proficiency',
                description: 'When you choose this domain at 1st level, you gain proficiency with heavy armor.',
                source: 'class',
                sourceDetails: 'Life Domain'
            },
            {
                id: 'disciple-of-life',
                name: 'Disciple of Life',
                description: 'Also starting at 1st level, your healing spells are more effective. Whenever you use a spell of 1st level or higher to restore hit points to a creature, the creature regains additional hit points equal to 2 + the spell\'s level.',
                source: 'class',
                sourceDetails: 'Life Domain'
            }
        ]
    },
    source: 'SRD'
};

/**
 * Cleric class (Full Caster - Prepared Spells)
 */
export const CLERIC: DnD5eClass = {
    id: 'cleric',
    name: 'Cleric',
    hitDie: 8,
    primaryAbility: ['wisdom'],
    savingThrows: ['wisdom', 'charisma'],
    armorProficiencies: ['light armor', 'medium armor', 'shields'],
    weaponProficiencies: ['simple weapons'],
    skillChoices: {
        choose: 2,
        from: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion']
    },
    equipmentOptions: CLERIC_EQUIPMENT,
    startingGold: { dice: '5d4', multiplier: 10 },
    features: {
        1: [
            {
                id: 'spellcasting-cleric',
                name: 'Spellcasting',
                description: 'As a conduit for divine power, you can cast cleric spells. Wisdom is your spellcasting ability for your cleric spells. The power of your spells comes from your devotion to your deity. You prepare the list of cleric spells that are available for you to cast, choosing from the cleric spell list. When you do so, choose a number of cleric spells equal to your Wisdom modifier + your cleric level (minimum of one spell).',
                source: 'class',
                sourceDetails: 'Cleric Level 1'
            },
            {
                id: 'divine-domain',
                name: 'Divine Domain',
                description: 'Choose one domain related to your deity: Knowledge, Life, Light, Nature, Tempest, Trickery, or War. The Life domain is detailed at the end of the class description and provides examples of gods associated with it. Your choice grants you domain spells and other features when you choose it at 1st level. It also grants you additional ways to use Channel Divinity when you gain that feature at 2nd level, and additional benefits at 6th, 8th, and 17th levels.',
                source: 'class',
                sourceDetails: 'Cleric Level 1'
            }
        ],
        2: [
            {
                id: 'channel-divinity-cleric',
                name: 'Channel Divinity',
                description: 'At 2nd level, you gain the ability to channel divine energy directly from your deity, using that energy to fuel magical effects. You start with two such effects: Turn Undead and an effect determined by your domain. Some domains grant you additional effects as you advance in levels, as noted in the domain description. When you use your Channel Divinity, you choose which effect to create. You must then finish a short or long rest to use your Channel Divinity again. Some Channel Divinity effects require saving throws. When you use such an effect from this class, the DC equals your cleric spell save DC.',
                source: 'class',
                sourceDetails: 'Cleric Level 2',
                limitedUse: {
                    maxUses: 1,
                    currentUses: 1,
                    resetOn: 'short'
                }
            },
            {
                id: 'turn-undead',
                name: 'Channel Divinity: Turn Undead',
                description: 'As an action, you present your holy symbol and speak a prayer censuring the undead. Each undead that can see or hear you within 30 feet of you must make a Wisdom saving throw. If the creature fails its saving throw, it is turned for 1 minute or until it takes any damage. A turned creature must spend its turns trying to move as far away from you as it can, and it can\'t willingly move to a space within 30 feet of you. It also can\'t take reactions. For its action, it can use only the Dash action or try to escape from an effect that prevents it from moving. If there\'s nowhere to move, the creature can use the Dodge action.',
                source: 'class',
                sourceDetails: 'Cleric Level 2'
            }
        ],
        3: [] // Features come from subclass
    },
    subclasses: [LIFE_DOMAIN],
    subclassLevel: 1, // Cleric chooses domain at level 1!
    spellcasting: {
        ability: 'wisdom',
        cantripsKnown: CLERIC_CANTRIPS_KNOWN,
        preparedSpells: {
            formula: 'WIS_MOD + LEVEL'
        },
        spellSlots: FULL_CASTER_SPELL_SLOTS,
        spellListId: 'cleric',
        ritualCasting: true
    },
    description: 'A priestly champion who wields divine magic in service of a higher power. Clerics are intermediaries between the mortal world and the distant planes of the gods. As varied as the gods they serve, clerics strive to embody the handiwork of their deities. No ordinary priest, a cleric is imbued with divine magic.',
    source: 'SRD'
};

// ============================================================================
// DRUID (Full Caster - Prepared Spells)
// ============================================================================

/**
 * Druid equipment options
 */
const DRUID_EQUIPMENT: EquipmentOption[] = [
    {
        groupId: 'druid-shield',
        choose: 1,
        options: [
            {
                id: 'wooden-shield',
                description: 'A wooden shield',
                items: ['shield-wooden']
            },
            {
                id: 'simple-weapon',
                description: 'Any simple weapon',
                items: ['simple-weapon-choice']
            }
        ]
    },
    {
        groupId: 'druid-weapon',
        choose: 1,
        options: [
            {
                id: 'scimitar',
                description: 'A scimitar',
                items: ['scimitar']
            },
            {
                id: 'simple-melee',
                description: 'Any simple melee weapon',
                items: ['simple-melee-choice']
            }
        ]
    },
    {
        groupId: 'druid-standard',
        choose: 1,
        options: [
            {
                id: 'leather-explorer-focus',
                description: 'Leather armor, an explorer\'s pack, and a druidic focus',
                items: ['leather-armor', 'explorers-pack', 'druidic-focus']
            }
        ]
    }
];

/**
 * Druid cantrips known progression
 */
export const DRUID_CANTRIPS_KNOWN: Record<number, number> = {
    1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4
};

/**
 * Circle of the Land subclass (SRD)
 */
const CIRCLE_OF_THE_LAND: DnD5eSubclass = {
    id: 'circle-of-the-land',
    name: 'Circle of the Land',
    className: 'druid',
    description: 'The Circle of the Land is made up of mystics and sages who safeguard ancient knowledge and rites through a vast oral tradition. These druids meet within sacred circles of trees or standing stones to whisper primal secrets in Druidic. The circle\'s wisest members preside as the chief priests of communities that hold to the Old Faith and serve as advisors to the rulers of those folk.',
    features: {
        2: [
            {
                id: 'bonus-cantrip-land',
                name: 'Bonus Cantrip',
                description: 'When you choose this circle at 2nd level, you learn one additional druid cantrip of your choice.',
                source: 'class',
                sourceDetails: 'Circle of the Land'
            },
            {
                id: 'natural-recovery',
                name: 'Natural Recovery',
                description: 'Starting at 2nd level, you can regain some of your magical energy by sitting in meditation and communing with nature. During a short rest, you choose expended spell slots to recover. The spell slots can have a combined level that is equal to or less than half your druid level (rounded up), and none of the slots can be 6th level or higher. You can\'t use this feature again until you finish a long rest. For example, when you are a 4th-level druid, you can recover up to two levels worth of spell slots. You can recover either a 2nd-level slot or two 1st-level slots.',
                source: 'class',
                sourceDetails: 'Circle of the Land',
                limitedUse: {
                    maxUses: 1,
                    currentUses: 1,
                    resetOn: 'long'
                }
            },
            {
                id: 'circle-spells-land',
                name: 'Circle Spells',
                description: 'Your mystical connection to the land infuses you with the ability to cast certain spells. At 3rd, 5th, 7th, and 9th level you gain access to circle spells connected to the land where you became a druid. Choose that land—arctic, coast, desert, forest, grassland, mountain, swamp, or Underdark—and consult the associated list of spells. Once you gain access to a circle spell, you always have it prepared, and it doesn\'t count against the number of spells you can prepare each day.',
                source: 'class',
                sourceDetails: 'Circle of the Land'
            }
        ],
        3: [] // Circle spells expand at 3rd level
    },
    source: 'SRD'
};

/**
 * Druid class (Full Caster - Prepared Spells)
 */
export const DRUID: DnD5eClass = {
    id: 'druid',
    name: 'Druid',
    hitDie: 8,
    primaryAbility: ['wisdom'],
    savingThrows: ['intelligence', 'wisdom'],
    armorProficiencies: ['light armor', 'medium armor', 'shields'],
    weaponProficiencies: ['clubs', 'daggers', 'darts', 'javelins', 'maces', 'quarterstaffs', 'scimitars', 'sickles', 'slings', 'spears'],
    toolProficiencies: ['herbalism kit'],
    skillChoices: {
        choose: 2,
        from: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival']
    },
    equipmentOptions: DRUID_EQUIPMENT,
    startingGold: { dice: '2d4', multiplier: 10 },
    features: {
        1: [
            {
                id: 'druidic',
                name: 'Druidic',
                description: 'You know Druidic, the secret language of druids. You can speak the language and use it to leave hidden messages. You and others who know this language automatically spot such a message. Others spot the message\'s presence with a successful DC 15 Wisdom (Perception) check but can\'t decipher it without magic.',
                source: 'class',
                sourceDetails: 'Druid Level 1'
            },
            {
                id: 'spellcasting-druid',
                name: 'Spellcasting',
                description: 'Drawing on the divine essence of nature itself, you can cast spells to shape that essence to your will. Wisdom is your spellcasting ability for your druid spells, since your magic draws upon your devotion and attunement to nature. You prepare the list of druid spells that are available for you to cast, choosing from the druid spell list. When you do so, choose a number of druid spells equal to your Wisdom modifier + your druid level (minimum of one spell).',
                source: 'class',
                sourceDetails: 'Druid Level 1'
            }
        ],
        2: [
            {
                id: 'wild-shape',
                name: 'Wild Shape',
                description: 'Starting at 2nd level, you can use your action to magically assume the shape of a beast that you have seen before. You can use this feature twice. You regain expended uses when you finish a short or long rest. Your druid level determines the beasts you can transform into. At 2nd level, you can transform into any beast that has a challenge rating of 1/4 or lower that doesn\'t have a flying or swimming speed. At 4th level, CR 1/2, no flying speed. At 8th level, CR 1.',
                source: 'class',
                sourceDetails: 'Druid Level 2',
                limitedUse: {
                    maxUses: 2,
                    currentUses: 2,
                    resetOn: 'short'
                }
            },
            {
                id: 'druid-circle',
                name: 'Druid Circle',
                description: 'At 2nd level, you choose to identify with a circle of druids. The Circle of the Land is detailed at the end of the class description. Your choice grants you features at 2nd level and again at 6th, 10th, and 14th level.',
                source: 'class',
                sourceDetails: 'Druid Level 2'
            }
        ],
        3: [] // Features come from subclass
    },
    subclasses: [CIRCLE_OF_THE_LAND],
    subclassLevel: 2,
    spellcasting: {
        ability: 'wisdom',
        cantripsKnown: DRUID_CANTRIPS_KNOWN,
        preparedSpells: {
            formula: 'WIS_MOD + LEVEL'
        },
        spellSlots: FULL_CASTER_SPELL_SLOTS,
        spellListId: 'druid',
        ritualCasting: true
    },
    description: 'A priest of the Old Faith, wielding the powers of nature and adopting animal forms. Whether calling on the elemental forces of nature or emulating the creatures of the animal world, druids are an embodiment of nature\'s resilience, cunning, and fury. They claim no mastery over nature. Instead, they see themselves as extensions of nature\'s indomitable will.',
    source: 'SRD'
};

// ============================================================================
// PALADIN
// ============================================================================

/**
 * Half-caster spell slots (Paladin, Ranger)
 * No slots at L1, gain spellcasting at L2
 * Levels 1-20 shown, indices [0] = 1st-level slots, [1] = 2nd-level, etc.
 */
const HALF_CASTER_SPELL_SLOTS: Record<number, number[]> = {
    1: [0, 0, 0, 0, 0, 0, 0, 0, 0],  // No spellcasting
    2: [2, 0, 0, 0, 0, 0, 0, 0, 0],  // 2 1st-level
    3: [3, 0, 0, 0, 0, 0, 0, 0, 0],  // 3 1st-level
    // Levels 4-20 for future expansion
};

/**
 * Paladin equipment options
 */
const PALADIN_EQUIPMENT: EquipmentOption[] = [
    {
        groupId: 'paladin-weapon-1',
        choose: 1,
        options: [
            {
                id: 'martial-weapon-shield',
                description: 'A martial weapon and a shield',
                items: ['martial-weapon-choice', 'shield']
            },
            {
                id: 'two-martial-weapons',
                description: 'Two martial weapons',
                items: ['martial-weapon-choice', 'martial-weapon-choice']
            }
        ]
    },
    {
        groupId: 'paladin-weapon-2',
        choose: 1,
        options: [
            {
                id: 'five-javelins',
                description: 'Five javelins',
                items: ['javelin', 'javelin', 'javelin', 'javelin', 'javelin']
            },
            {
                id: 'simple-melee',
                description: 'Any simple melee weapon',
                items: ['simple-melee-choice']
            }
        ]
    },
    {
        groupId: 'paladin-pack',
        choose: 1,
        options: [
            {
                id: 'priests-pack',
                description: "A priest's pack",
                items: ['priests-pack']
            },
            {
                id: 'explorer-pack',
                description: "An explorer's pack",
                items: ['explorers-pack']
            }
        ]
    },
    {
        groupId: 'paladin-armor',
        choose: 1,
        options: [
            {
                id: 'chain-mail-symbol',
                description: 'Chain mail and a holy symbol',
                items: ['chain-mail', 'holy-symbol']
            }
        ]
    }
];

/**
 * Oath of Devotion subclass (SRD)
 */
const OATH_OF_DEVOTION: DnD5eSubclass = {
    id: 'oath-of-devotion',
    name: 'Oath of Devotion',
    className: 'paladin',
    description: 'The Oath of Devotion binds a paladin to the loftiest ideals of justice, virtue, and order. Sometimes called cavaliers, white knights, or holy warriors, these paladins meet the ideal of the knight in shining armor, acting with honor in pursuit of justice and the greater good.',
    features: {
        3: [
            {
                id: 'oath-spells-devotion',
                name: 'Oath Spells',
                description: 'You gain oath spells at the paladin levels listed. Protection from Evil and Good and Sanctuary are always prepared and don\'t count against your prepared spells.',
                source: 'class',
                sourceDetails: 'Oath of Devotion'
            },
            {
                id: 'channel-divinity-devotion',
                name: 'Channel Divinity',
                description: 'When you take this oath at 3rd level, you gain the following two Channel Divinity options.\n\n**Sacred Weapon.** As an action, you can imbue one weapon that you are holding with positive energy, using your Channel Divinity. For 1 minute, you add your Charisma modifier to attack rolls made with that weapon (with a minimum bonus of +1). The weapon also emits bright light in a 20-foot radius and dim light 20 feet beyond that. If the weapon is not already magical, it becomes magical for the duration.\n\n**Turn the Unholy.** As an action, you present your holy symbol and speak a prayer censuring fiends and undead, using your Channel Divinity. Each fiend or undead that can see or hear you within 30 feet of you must make a Wisdom saving throw. If the creature fails its saving throw, it is turned for 1 minute or until it takes damage.',
                source: 'class',
                sourceDetails: 'Oath of Devotion',
                limitedUse: {
                    maxUses: 1,
                    currentUses: 1,
                    resetOn: 'short'
                }
            }
        ]
    },
    spellsGranted: {
        3: ['protection-from-evil-and-good', 'sanctuary']
    },
    source: 'SRD'
};

/**
 * Paladin class - Half Caster (CHA, Prepared)
 */
export const PALADIN: DnD5eClass = {
    id: 'paladin',
    name: 'Paladin',
    hitDie: 10,
    primaryAbility: ['strength', 'charisma'],
    savingThrows: ['wisdom', 'charisma'],
    armorProficiencies: ['light armor', 'medium armor', 'heavy armor', 'shields'],
    weaponProficiencies: ['simple weapons', 'martial weapons'],
    skillChoices: {
        choose: 2,
        from: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion']
    },
    equipmentOptions: PALADIN_EQUIPMENT,
    startingGold: { dice: '5d4', multiplier: 10 },
    features: {
        1: [
            {
                id: 'divine-sense',
                name: 'Divine Sense',
                description: 'The presence of strong evil registers on your senses like a noxious odor, and powerful good rings like heavenly music in your ears. As an action, you can open your awareness to detect such forces. Until the end of your next turn, you know the location of any celestial, fiend, or undead within 60 feet of you that is not behind total cover. You know the type (celestial, fiend, or undead) of any being whose presence you sense, but not its identity. Within the same radius, you also detect the presence of any place or object that has been consecrated or desecrated.\n\nYou can use this feature a number of times equal to 1 + your Charisma modifier. When you finish a long rest, you regain all expended uses.',
                source: 'class',
                sourceDetails: 'Paladin Level 1',
                limitedUse: {
                    maxUses: 1, // Placeholder - depends on CHA mod + 1
                    currentUses: 1,
                    resetOn: 'long'
                }
            },
            {
                id: 'lay-on-hands',
                name: 'Lay on Hands',
                description: 'Your blessed touch can heal wounds. You have a pool of healing power that replenishes when you take a long rest. With that pool, you can restore a total number of hit points equal to your paladin level × 5.\n\nAs an action, you can touch a creature and draw power from the pool to restore a number of hit points to that creature, up to the maximum amount remaining in your pool.\n\nAlternatively, you can expend 5 hit points from your pool of healing to cure the target of one disease or neutralize one poison affecting it. You can cure multiple diseases and neutralize multiple poisons with a single use of Lay on Hands, expending hit points separately for each one.',
                source: 'class',
                sourceDetails: 'Paladin Level 1',
                limitedUse: {
                    maxUses: 5, // Level * 5 at L1
                    currentUses: 5,
                    resetOn: 'long'
                }
            }
        ],
        2: [
            {
                id: 'fighting-style-paladin',
                name: 'Fighting Style',
                description: 'At 2nd level, you adopt a style of fighting as your specialty. Choose one of the following options. You can\'t take a Fighting Style option more than once, even if you later get to choose again.\n\n**Defense.** While you are wearing armor, you gain a +1 bonus to AC.\n\n**Dueling.** When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.\n\n**Great Weapon Fighting.** When you roll a 1 or 2 on a damage die for an attack you make with a melee weapon that you are wielding with two hands, you can reroll the die and must use the new roll. The weapon must have the two-handed or versatile property for you to gain this benefit.\n\n**Protection.** When a creature you can see attacks a target other than you that is within 5 feet of you, you can use your reaction to impose disadvantage on the attack roll. You must be wielding a shield.',
                source: 'class',
                sourceDetails: 'Paladin Level 2'
            },
            {
                id: 'spellcasting-paladin',
                name: 'Spellcasting',
                description: 'By 2nd level, you have learned to draw on divine magic through meditation and prayer to cast spells as a cleric does.',
                source: 'class',
                sourceDetails: 'Paladin Level 2'
            },
            {
                id: 'divine-smite',
                name: 'Divine Smite',
                description: 'Starting at 2nd level, when you hit a creature with a melee weapon attack, you can expend one spell slot to deal radiant damage to the target, in addition to the weapon\'s damage. The extra damage is 2d8 for a 1st-level spell slot, plus 1d8 for each spell level higher than 1st, to a maximum of 5d8. The damage increases by 1d8 if the target is an undead or a fiend, to a maximum of 6d8.',
                source: 'class',
                sourceDetails: 'Paladin Level 2'
            }
        ],
        3: [
            {
                id: 'divine-health',
                name: 'Divine Health',
                description: 'By 3rd level, the divine magic flowing through you makes you immune to disease.',
                source: 'class',
                sourceDetails: 'Paladin Level 3'
            },
            {
                id: 'sacred-oath',
                name: 'Sacred Oath',
                description: 'When you reach 3rd level, you swear the oath that binds you as a paladin forever. Up to this time you have been in a preparatory stage, committed to the path but not yet sworn to it. The Oath of Devotion is detailed at the end of the class description.\n\nYour oath grants you features at 3rd level and again at 7th, 15th, and 20th level. Those features include oath spells and the Channel Divinity feature.',
                source: 'class',
                sourceDetails: 'Paladin Level 3'
            }
        ]
    },
    subclasses: [OATH_OF_DEVOTION],
    subclassLevel: 3,
    spellcasting: {
        ability: 'charisma',
        cantripsKnown: { 1: 0, 2: 0, 3: 0 }, // No cantrips
        preparedSpells: {
            formula: 'CHA_MOD + HALF_LEVEL' // Half paladin level (rounded down) + CHA mod
        },
        spellSlots: HALF_CASTER_SPELL_SLOTS,
        spellListId: 'paladin',
        ritualCasting: false // Paladins cannot ritual cast
    },
    description: 'A holy warrior bound to a sacred oath. Whether sworn before a god\'s altar and the witness of a priest, in a sacred glade before nature spirits and fey beings, or in a moment of desperation and grief with the dead as the only witness, a paladin\'s oath is a powerful bond.',
    source: 'SRD'
};

// ============================================================================
// RANGER
// ============================================================================

/**
 * Ranger spells known progression (L2+)
 */
const RANGER_SPELLS_KNOWN: Record<number, number> = {
    1: 0,  // No spells at L1
    2: 2,  // Gain spellcasting
    3: 3
    // Levels 4+ for future expansion
};

/**
 * Ranger equipment options
 */
const RANGER_EQUIPMENT: EquipmentOption[] = [
    {
        groupId: 'ranger-armor',
        choose: 1,
        options: [
            {
                id: 'scale-mail',
                description: 'Scale mail',
                items: ['scale-mail']
            },
            {
                id: 'leather-armor',
                description: 'Leather armor',
                items: ['leather-armor']
            }
        ]
    },
    {
        groupId: 'ranger-weapon-1',
        choose: 1,
        options: [
            {
                id: 'two-shortswords',
                description: 'Two shortswords',
                items: ['shortsword', 'shortsword']
            },
            {
                id: 'two-simple-melee',
                description: 'Two simple melee weapons',
                items: ['simple-melee-choice', 'simple-melee-choice']
            }
        ]
    },
    {
        groupId: 'ranger-pack',
        choose: 1,
        options: [
            {
                id: 'dungeoneer-pack',
                description: "A dungeoneer's pack",
                items: ['dungeoneers-pack']
            },
            {
                id: 'explorer-pack',
                description: "An explorer's pack",
                items: ['explorers-pack']
            }
        ]
    },
    {
        groupId: 'ranger-ranged',
        choose: 1,
        options: [
            {
                id: 'longbow-arrows',
                description: 'A longbow and a quiver of 20 arrows',
                items: ['longbow', 'arrows-20']
            }
        ]
    }
];

/**
 * Hunter subclass (SRD)
 */
const HUNTER: DnD5eSubclass = {
    id: 'hunter',
    name: 'Hunter',
    className: 'ranger',
    description: 'Emulating the Hunter archetype means accepting your place as a bulwark between civilization and the terrors of the wilderness. As you walk the Hunter\'s path, you learn specialized techniques for fighting the threats you face, from rampaging ogres and hordes of orcs to towering giants and terrifying dragons.',
    features: {
        3: [
            {
                id: 'hunters-prey',
                name: "Hunter's Prey",
                description: 'At 3rd level, you gain one of the following features of your choice.\n\n**Colossus Slayer.** Your tenacity can wear down the most potent foes. When you hit a creature with a weapon attack, the creature takes an extra 1d8 damage if it\'s below its hit point maximum. You can deal this extra damage only once per turn.\n\n**Giant Killer.** When a Large or larger creature within 5 feet of you hits or misses you with an attack, you can use your reaction to attack that creature immediately after its attack, provided that you can see the creature.\n\n**Horde Breaker.** Once on each of your turns when you make a weapon attack, you can make another attack with the same weapon against a different creature that is within 5 feet of the original target and within range of your weapon.',
                source: 'class',
                sourceDetails: 'Hunter'
            }
        ]
    },
    source: 'SRD'
};

/**
 * Ranger class - Half Caster (WIS, Known Spells)
 */
export const RANGER: DnD5eClass = {
    id: 'ranger',
    name: 'Ranger',
    hitDie: 10,
    primaryAbility: ['dexterity', 'wisdom'],
    savingThrows: ['strength', 'dexterity'],
    armorProficiencies: ['light armor', 'medium armor', 'shields'],
    weaponProficiencies: ['simple weapons', 'martial weapons'],
    skillChoices: {
        choose: 3,
        from: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival']
    },
    equipmentOptions: RANGER_EQUIPMENT,
    startingGold: { dice: '5d4', multiplier: 10 },
    features: {
        1: [
            {
                id: 'favored-enemy',
                name: 'Favored Enemy',
                description: 'Beginning at 1st level, you have significant experience studying, tracking, hunting, and even talking to a certain type of enemy.\n\nChoose a type of favored enemy: aberrations, beasts, celestials, constructs, dragons, elementals, fey, fiends, giants, monstrosities, oozes, plants, or undead. Alternatively, you can select two races of humanoid (such as gnolls and orcs) as favored enemies.\n\nYou have advantage on Wisdom (Survival) checks to track your favored enemies, as well as on Intelligence checks to recall information about them.\n\nWhen you gain this feature, you also learn one language of your choice that is spoken by your favored enemies, if they speak one at all.\n\nYou choose one additional favored enemy, as well as an associated language, at 6th and 14th level.',
                source: 'class',
                sourceDetails: 'Ranger Level 1'
            },
            {
                id: 'natural-explorer',
                name: 'Natural Explorer',
                description: 'You are particularly familiar with one type of natural environment and are adept at traveling and surviving in such regions. Choose one type of favored terrain: arctic, coast, desert, forest, grassland, mountain, swamp, or the Underdark.\n\nWhen you make an Intelligence or Wisdom check related to your favored terrain, your proficiency bonus is doubled if you are using a skill that you\'re proficient in.\n\nWhile traveling for an hour or more in your favored terrain, you gain the following benefits:\n• Difficult terrain doesn\'t slow your group\'s travel.\n• Your group can\'t become lost except by magical means.\n• Even when you are engaged in another activity while traveling (such as foraging, navigating, or tracking), you remain alert to danger.\n• If you are traveling alone, you can move stealthily at a normal pace.\n• When you forage, you find twice as much food as you normally would.\n• While tracking other creatures, you also learn their exact number, their sizes, and how long ago they passed through the area.',
                source: 'class',
                sourceDetails: 'Ranger Level 1'
            }
        ],
        2: [
            {
                id: 'fighting-style-ranger',
                name: 'Fighting Style',
                description: 'At 2nd level, you adopt a particular style of fighting as your specialty. Choose one of the following options. You can\'t take a Fighting Style option more than once, even if you later get to choose again.\n\n**Archery.** You gain a +2 bonus to attack rolls you make with ranged weapons.\n\n**Defense.** While you are wearing armor, you gain a +1 bonus to AC.\n\n**Dueling.** When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.\n\n**Two-Weapon Fighting.** When you engage in two-weapon fighting, you can add your ability modifier to the damage of the second attack.',
                source: 'class',
                sourceDetails: 'Ranger Level 2'
            },
            {
                id: 'spellcasting-ranger',
                name: 'Spellcasting',
                description: 'By the time you reach 2nd level, you have learned to use the magical essence of nature to cast spells, much as a druid does.',
                source: 'class',
                sourceDetails: 'Ranger Level 2'
            }
        ],
        3: [
            {
                id: 'ranger-archetype',
                name: 'Ranger Archetype',
                description: 'At 3rd level, you choose an archetype that you strive to emulate. The Hunter archetype is detailed at the end of the class description. Your choice grants you features at 3rd level and again at 7th, 11th, and 15th level.',
                source: 'class',
                sourceDetails: 'Ranger Level 3'
            },
            {
                id: 'primeval-awareness',
                name: 'Primeval Awareness',
                description: 'Beginning at 3rd level, you can use your action and expend one ranger spell slot to focus your awareness on the region around you. For 1 minute per level of the spell slot you expend, you can sense whether the following types of creatures are present within 1 mile of you (or within up to 6 miles if you are in your favored terrain): aberrations, celestials, dragons, elementals, fey, fiends, and undead. This feature doesn\'t reveal the creatures\' location or number.',
                source: 'class',
                sourceDetails: 'Ranger Level 3'
            }
        ]
    },
    subclasses: [HUNTER],
    subclassLevel: 3,
    spellcasting: {
        ability: 'wisdom',
        cantripsKnown: { 1: 0, 2: 0, 3: 0 }, // No cantrips
        spellsKnown: RANGER_SPELLS_KNOWN,
        spellSlots: HALF_CASTER_SPELL_SLOTS,
        spellListId: 'ranger',
        ritualCasting: false // Rangers cannot ritual cast
    },
    description: 'A warrior who uses martial prowess and nature magic to combat threats on the edges of civilization. Far from the bustle of cities and towns, past the hedges that shelter the most distant farms from the terrors of the wild, amid the dense-packed trees of trackless forests and across wide and empty plains, rangers keep their unending watch.',
    source: 'SRD'
};

// ============================================================================
// SORCERER
// ============================================================================

/**
 * Sorcerer cantrips known (4 at all levels 1-3)
 */
const SORCERER_CANTRIPS_KNOWN: Record<number, number> = {
    1: 4,
    2: 4,
    3: 4
};

/**
 * Sorcerer spells known progression
 */
const SORCERER_SPELLS_KNOWN: Record<number, number> = {
    1: 2,
    2: 3,
    3: 4
};

/**
 * Sorcerer equipment options
 */
const SORCERER_EQUIPMENT: EquipmentOption[] = [
    {
        groupId: 'sorcerer-weapon',
        choose: 1,
        options: [
            {
                id: 'light-crossbow-bolts',
                description: 'A light crossbow and 20 bolts',
                items: ['light-crossbow', 'crossbow-bolts-20']
            },
            {
                id: 'simple-weapon',
                description: 'Any simple weapon',
                items: ['simple-weapon-choice']
            }
        ]
    },
    {
        groupId: 'sorcerer-focus',
        choose: 1,
        options: [
            {
                id: 'component-pouch',
                description: 'A component pouch',
                items: ['component-pouch']
            },
            {
                id: 'arcane-focus',
                description: 'An arcane focus',
                items: ['arcane-focus']
            }
        ]
    },
    {
        groupId: 'sorcerer-pack',
        choose: 1,
        options: [
            {
                id: 'dungeoneer-pack',
                description: "A dungeoneer's pack",
                items: ['dungeoneers-pack']
            },
            {
                id: 'explorer-pack',
                description: "An explorer's pack",
                items: ['explorers-pack']
            }
        ]
    },
    {
        groupId: 'sorcerer-daggers',
        choose: 1,
        options: [
            {
                id: 'two-daggers',
                description: 'Two daggers',
                items: ['dagger', 'dagger']
            }
        ]
    }
];

/**
 * Draconic Bloodline subclass (SRD) - Chosen at Level 1!
 */
const DRACONIC_BLOODLINE: DnD5eSubclass = {
    id: 'draconic-bloodline',
    name: 'Draconic Bloodline',
    className: 'sorcerer',
    description: 'Your innate magic comes from draconic magic that was mingled with your blood or that of your ancestors. Most often, sorcerers with this origin trace their descent back to a mighty sorcerer of ancient times who made a bargain with a dragon or who might even have claimed a dragon parent.',
    features: {
        1: [
            {
                id: 'dragon-ancestor',
                name: 'Dragon Ancestor',
                description: 'At 1st level, you choose one type of dragon as your ancestor. The damage type associated with each dragon is used by features you gain later.\n\n**Draconic Ancestry:**\nBlack - Acid | Blue - Lightning | Brass - Fire | Bronze - Lightning | Copper - Acid | Gold - Fire | Green - Poison | Red - Fire | Silver - Cold | White - Cold\n\nYou can speak, read, and write Draconic. Additionally, whenever you make a Charisma check when interacting with dragons, your proficiency bonus is doubled if it applies to the check.',
                source: 'class',
                sourceDetails: 'Draconic Bloodline'
            },
            {
                id: 'draconic-resilience',
                name: 'Draconic Resilience',
                description: 'As magic flows through your body, it causes physical traits of your dragon ancestors to emerge. At 1st level, your hit point maximum increases by 1 and increases by 1 again whenever you gain a level in this class.\n\nAdditionally, parts of your skin are covered by a thin sheen of dragon-like scales. When you aren\'t wearing armor, your AC equals 13 + your Dexterity modifier.',
                source: 'class',
                sourceDetails: 'Draconic Bloodline'
            }
        ]
    },
    source: 'SRD'
};

/**
 * Sorcerer class - Full Caster (CHA, Known Spells)
 * NOTE: Subclass chosen at Level 1!
 */
export const SORCERER: DnD5eClass = {
    id: 'sorcerer',
    name: 'Sorcerer',
    hitDie: 6,
    primaryAbility: ['charisma'],
    savingThrows: ['constitution', 'charisma'],
    armorProficiencies: [],
    weaponProficiencies: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'],
    skillChoices: {
        choose: 2,
        from: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion']
    },
    equipmentOptions: SORCERER_EQUIPMENT,
    startingGold: { dice: '3d4', multiplier: 10 },
    features: {
        1: [
            {
                id: 'spellcasting-sorcerer',
                name: 'Spellcasting',
                description: 'An event in your past, or in the life of a parent or ancestor, left an indelible mark on you, infusing you with arcane magic. This font of magic, whatever its origin, fuels your spells.',
                source: 'class',
                sourceDetails: 'Sorcerer Level 1'
            },
            {
                id: 'sorcerous-origin',
                name: 'Sorcerous Origin',
                description: 'Choose a sorcerous origin, which describes the source of your innate magical power. The Draconic Bloodline is detailed at the end of the class description. Your choice grants you features when you choose it at 1st level and again at 6th, 14th, and 18th level.',
                source: 'class',
                sourceDetails: 'Sorcerer Level 1'
            }
        ],
        2: [
            {
                id: 'font-of-magic',
                name: 'Font of Magic',
                description: 'At 2nd level, you tap into a deep wellspring of magic within yourself. This wellspring is represented by sorcery points, which allow you to create a variety of magical effects.\n\n**Sorcery Points.** You have 2 sorcery points, and you gain more as you reach higher levels. You can never have more sorcery points than shown on the table for your level. You regain all spent sorcery points when you finish a long rest.\n\n**Flexible Casting.** You can use your sorcery points to gain additional spell slots, or sacrifice spell slots to gain additional sorcery points.',
                source: 'class',
                sourceDetails: 'Sorcerer Level 2',
                limitedUse: {
                    maxUses: 2, // Equal to sorcerer level
                    currentUses: 2,
                    resetOn: 'long'
                }
            }
        ],
        3: [
            {
                id: 'metamagic',
                name: 'Metamagic',
                description: 'At 3rd level, you gain the ability to twist your spells to suit your needs. You gain two of the following Metamagic options of your choice. You gain another one at 10th and 17th level.\n\nYou can use only one Metamagic option on a spell when you cast it, unless otherwise noted.\n\n**Careful Spell, Distant Spell, Empowered Spell, Extended Spell, Heightened Spell, Quickened Spell, Subtle Spell, Twinned Spell**',
                source: 'class',
                sourceDetails: 'Sorcerer Level 3'
            }
        ]
    },
    subclasses: [DRACONIC_BLOODLINE],
    subclassLevel: 1, // Sorcerer chooses subclass at Level 1!
    spellcasting: {
        ability: 'charisma',
        cantripsKnown: SORCERER_CANTRIPS_KNOWN,
        spellsKnown: SORCERER_SPELLS_KNOWN,
        spellSlots: FULL_CASTER_SPELL_SLOTS,
        spellListId: 'sorcerer',
        ritualCasting: false // Sorcerers cannot ritual cast
    },
    description: 'A spellcaster who draws on inherent magic from a gift or bloodline. Sorcerers carry a magical birthright conferred upon them by an exotic bloodline, some otherworldly influence, or exposure to unknown cosmic forces.',
    source: 'SRD'
};

// ============================================================================
// WARLOCK
// ============================================================================

/**
 * Warlock cantrips known (2 at all levels 1-3)
 */
const WARLOCK_CANTRIPS_KNOWN: Record<number, number> = {
    1: 2,
    2: 2,
    3: 2
};

/**
 * Warlock spells known progression
 */
const WARLOCK_SPELLS_KNOWN: Record<number, number> = {
    1: 2,
    2: 3,
    3: 4
};

/**
 * Warlock Pact Magic slots - DIFFERENT from regular spell slots!
 * All slots are the SAME level, and refresh on SHORT REST.
 * Format: { slotCount: number, slotLevel: number }
 */
export const PACT_MAGIC_SLOTS: Record<number, { slotCount: number; slotLevel: number }> = {
    1: { slotCount: 1, slotLevel: 1 },  // 1 slot at 1st-level
    2: { slotCount: 2, slotLevel: 1 },  // 2 slots at 1st-level
    3: { slotCount: 2, slotLevel: 2 },  // 2 slots at 2nd-level (slots UPGRADE!)
    // Higher levels: slots continue to upgrade
    // L5: 2 slots at 3rd-level
    // L7: 2 slots at 4th-level
    // L9: 2 slots at 5th-level
    // L11+: 3 slots at 5th-level
};

/**
 * Warlock equipment options
 */
const WARLOCK_EQUIPMENT: EquipmentOption[] = [
    {
        groupId: 'warlock-weapon',
        choose: 1,
        options: [
            {
                id: 'light-crossbow-bolts',
                description: 'A light crossbow and 20 bolts',
                items: ['light-crossbow', 'crossbow-bolts-20']
            },
            {
                id: 'simple-weapon',
                description: 'Any simple weapon',
                items: ['simple-weapon-choice']
            }
        ]
    },
    {
        groupId: 'warlock-focus',
        choose: 1,
        options: [
            {
                id: 'component-pouch',
                description: 'A component pouch',
                items: ['component-pouch']
            },
            {
                id: 'arcane-focus',
                description: 'An arcane focus',
                items: ['arcane-focus']
            }
        ]
    },
    {
        groupId: 'warlock-pack',
        choose: 1,
        options: [
            {
                id: 'scholars-pack',
                description: "A scholar's pack",
                items: ['scholars-pack']
            },
            {
                id: 'dungeoneer-pack',
                description: "A dungeoneer's pack",
                items: ['dungeoneers-pack']
            }
        ]
    },
    {
        groupId: 'warlock-armor',
        choose: 1,
        options: [
            {
                id: 'leather-daggers',
                description: 'Leather armor, any simple weapon, and two daggers',
                items: ['leather-armor', 'simple-weapon-choice', 'dagger', 'dagger']
            }
        ]
    }
];

/**
 * The Fiend patron subclass (SRD) - Chosen at Level 1!
 */
const THE_FIEND: DnD5eSubclass = {
    id: 'the-fiend',
    name: 'The Fiend',
    className: 'warlock',
    description: 'You have made a pact with a fiend from the lower planes of existence, a being whose aims are evil, even if you strive against those aims. Such beings desire the corruption or destruction of all things, ultimately including you.',
    features: {
        1: [
            {
                id: 'dark-ones-blessing',
                name: "Dark One's Blessing",
                description: 'Starting at 1st level, when you reduce a hostile creature to 0 hit points, you gain temporary hit points equal to your Charisma modifier + your warlock level (minimum of 1).',
                source: 'class',
                sourceDetails: 'The Fiend'
            }
        ]
    },
    // Expanded spell list - these become available to learn, not auto-known
    expandedSpellList: {
        1: ['burning-hands', 'command'],
        2: ['blindness-deafness', 'scorching-ray']
        // 3: ['fireball', 'stinking-cloud'] // 3rd-level spells at warlock level 5
    },
    source: 'SRD'
};

/**
 * Warlock class - Pact Magic (CHA, Known Spells)
 * NOTE: Subclass chosen at Level 1!
 * NOTE: Uses Pact Magic, NOT regular spell slots!
 */
export const WARLOCK: DnD5eClass = {
    id: 'warlock',
    name: 'Warlock',
    hitDie: 8,
    primaryAbility: ['charisma'],
    savingThrows: ['wisdom', 'charisma'],
    armorProficiencies: ['light armor'],
    weaponProficiencies: ['simple weapons'],
    skillChoices: {
        choose: 2,
        from: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion']
    },
    equipmentOptions: WARLOCK_EQUIPMENT,
    startingGold: { dice: '4d4', multiplier: 10 },
    features: {
        1: [
            {
                id: 'otherworldly-patron',
                name: 'Otherworldly Patron',
                description: 'At 1st level, you have struck a bargain with an otherworldly being of your choice. The Fiend is detailed at the end of the class description. Your choice grants you features at 1st level and again at 6th, 10th, and 14th level.',
                source: 'class',
                sourceDetails: 'Warlock Level 1'
            },
            {
                id: 'pact-magic',
                name: 'Pact Magic',
                description: 'Your arcane research and the magic bestowed on you by your patron have given you facility with spells.\n\n**Spell Slots.** The Warlock table shows how many spell slots you have. The table also shows what the level of those slots is; all of your spell slots are the same level. To cast one of your warlock spells of 1st level or higher, you must expend a spell slot. You regain all expended spell slots when you finish a short or long rest.\n\nFor example, when you are 5th level, you have two 3rd-level spell slots. To cast the 1st-level spell witch bolt, you must spend one of those slots, and you cast it as a 3rd-level spell.',
                source: 'class',
                sourceDetails: 'Warlock Level 1'
            }
        ],
        2: [
            {
                id: 'eldritch-invocations',
                name: 'Eldritch Invocations',
                description: 'In your study of occult lore, you have unearthed eldritch invocations, fragments of forbidden knowledge that imbue you with an abiding magical ability.\n\nAt 2nd level, you gain two eldritch invocations of your choice. When you gain certain warlock levels, you gain additional invocations of your choice.\n\nAdditionally, when you gain a level in this class, you can choose one of the invocations you know and replace it with another invocation that you could learn at that level.\n\n**Example Invocations:** Agonizing Blast, Armor of Shadows, Beast Speech, Devil\'s Sight, Eldritch Sight, Eyes of the Rune Keeper, Fiendish Vigor, Mask of Many Faces, Misty Visions, Thief of Five Fates',
                source: 'class',
                sourceDetails: 'Warlock Level 2'
            }
        ],
        3: [
            {
                id: 'pact-boon',
                name: 'Pact Boon',
                description: 'At 3rd level, your otherworldly patron bestows a gift upon you for your loyal service. You gain one of the following features of your choice:\n\n**Pact of the Chain.** You learn the find familiar spell and can cast it as a ritual. The spell doesn\'t count against your number of spells known. When you cast the spell, you can choose one of the normal forms for your familiar or one of the following special forms: imp, pseudodragon, quasit, or sprite.\n\n**Pact of the Blade.** You can use your action to create a pact weapon in your empty hand. You can choose the form that this melee weapon takes each time you create it. You are proficient with it while you wield it.\n\n**Pact of the Tome.** Your patron gives you a grimoire called a Book of Shadows. When you gain this feature, choose three cantrips from any class\'s spell list. While the book is on your person, you can cast those cantrips at will.',
                source: 'class',
                sourceDetails: 'Warlock Level 3'
            }
        ]
    },
    subclasses: [THE_FIEND],
    subclassLevel: 1, // Warlock chooses patron at Level 1!
    spellcasting: {
        ability: 'charisma',
        cantripsKnown: WARLOCK_CANTRIPS_KNOWN,
        spellsKnown: WARLOCK_SPELLS_KNOWN,
        // Warlock uses Pact Magic, not regular slots!
        // The spellSlots field here is a placeholder - actual slots come from PACT_MAGIC_SLOTS
        spellSlots: {
            1: [1, 0, 0, 0, 0, 0, 0, 0, 0],  // 1 1st-level slot
            2: [2, 0, 0, 0, 0, 0, 0, 0, 0],  // 2 1st-level slots
            3: [0, 2, 0, 0, 0, 0, 0, 0, 0]   // 2 2nd-level slots (all upgrade!)
        },
        spellListId: 'warlock',
        ritualCasting: false, // Warlocks cannot ritual cast (unless Pact of the Tome + Book of Ancient Secrets)
        pactMagic: true // Flag to indicate this uses Pact Magic system
    },
    description: 'A wielder of magic that is derived from a bargain with an extraplanar entity. Warlocks are seekers of the knowledge that lies hidden in the fabric of the multiverse. Through pacts made with mysterious beings of supernatural power, warlocks unlock magical effects both subtle and spectacular.',
    source: 'SRD'
};

// ============================================================================
// WIZARD
// ============================================================================

/**
 * Wizard cantrips known (3 at all levels 1-3)
 */
const WIZARD_CANTRIPS_KNOWN: Record<number, number> = {
    1: 3,
    2: 3,
    3: 3
};

/**
 * Wizard equipment options
 */
const WIZARD_EQUIPMENT: EquipmentOption[] = [
    {
        groupId: 'wizard-weapon',
        choose: 1,
        options: [
            {
                id: 'quarterstaff',
                description: 'A quarterstaff',
                items: ['quarterstaff']
            },
            {
                id: 'dagger',
                description: 'A dagger',
                items: ['dagger']
            }
        ]
    },
    {
        groupId: 'wizard-focus',
        choose: 1,
        options: [
            {
                id: 'component-pouch',
                description: 'A component pouch',
                items: ['component-pouch']
            },
            {
                id: 'arcane-focus',
                description: 'An arcane focus',
                items: ['arcane-focus']
            }
        ]
    },
    {
        groupId: 'wizard-pack',
        choose: 1,
        options: [
            {
                id: 'scholars-pack',
                description: "A scholar's pack",
                items: ['scholars-pack']
            },
            {
                id: 'explorer-pack',
                description: "An explorer's pack",
                items: ['explorers-pack']
            }
        ]
    },
    {
        groupId: 'wizard-spellbook',
        choose: 1,
        options: [
            {
                id: 'spellbook',
                description: 'A spellbook',
                items: ['spellbook']
            }
        ]
    }
];

/**
 * School of Evocation subclass (SRD) - Chosen at Level 2
 */
const SCHOOL_OF_EVOCATION: DnD5eSubclass = {
    id: 'school-of-evocation',
    name: 'School of Evocation',
    className: 'wizard',
    description: 'You focus your study on magic that creates powerful elemental effects such as bitter cold, searing flame, rolling thunder, crackling lightning, and burning acid. Some evokers find employment in military forces, serving as artillery to blast enemy armies from afar.',
    features: {
        2: [
            {
                id: 'evocation-savant',
                name: 'Evocation Savant',
                description: 'Beginning when you select this school at 2nd level, the gold and time you must spend to copy an evocation spell into your spellbook is halved.',
                source: 'class',
                sourceDetails: 'School of Evocation'
            },
            {
                id: 'sculpt-spells',
                name: 'Sculpt Spells',
                description: 'Beginning at 2nd level, you can create pockets of relative safety within the effects of your evocation spells. When you cast an evocation spell that affects other creatures that you can see, you can choose a number of them equal to 1 + the spell\'s level. The chosen creatures automatically succeed on their saving throws against the spell, and they take no damage if they would normally take half damage on a successful save.',
                source: 'class',
                sourceDetails: 'School of Evocation'
            }
        ]
    },
    source: 'SRD'
};

/**
 * Wizard class - Full Caster (INT, Prepared from Spellbook)
 * NOTE: Unique spellbook mechanic - starts with 6 spells, gains 2 per level
 */
export const WIZARD: DnD5eClass = {
    id: 'wizard',
    name: 'Wizard',
    hitDie: 6,
    primaryAbility: ['intelligence'],
    savingThrows: ['intelligence', 'wisdom'],
    armorProficiencies: [],
    weaponProficiencies: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'],
    skillChoices: {
        choose: 2,
        from: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion']
    },
    equipmentOptions: WIZARD_EQUIPMENT,
    startingGold: { dice: '4d4', multiplier: 10 },
    features: {
        1: [
            {
                id: 'spellcasting-wizard',
                name: 'Spellcasting',
                description: 'As a student of arcane magic, you have a spellbook containing spells that show the first glimmerings of your true power.\n\n**Spellbook.** At 1st level, you have a spellbook containing six 1st-level wizard spells of your choice. Your spellbook is the repository of the wizard spells you know, except your cantrips, which are fixed in your mind.',
                source: 'class',
                sourceDetails: 'Wizard Level 1'
            },
            {
                id: 'arcane-recovery',
                name: 'Arcane Recovery',
                description: 'You have learned to regain some of your magical energy by studying your spellbook. Once per day when you finish a short rest, you can choose expended spell slots to recover. The spell slots can have a combined level that is equal to or less than half your wizard level (rounded up), and none of the slots can be 6th level or higher.\n\nFor example, if you\'re a 4th-level wizard, you can recover up to two levels worth of spell slots. You can recover either a 2nd-level spell slot or two 1st-level spell slots.',
                source: 'class',
                sourceDetails: 'Wizard Level 1',
                limitedUse: {
                    maxUses: 1,
                    currentUses: 1,
                    resetOn: 'long'
                }
            }
        ],
        2: [
            {
                id: 'arcane-tradition',
                name: 'Arcane Tradition',
                description: 'When you reach 2nd level, you choose an arcane tradition, shaping your practice of magic through one of eight schools. The School of Evocation is detailed at the end of the class description. Your choice grants you features at 2nd level and again at 6th, 10th, and 14th level.',
                source: 'class',
                sourceDetails: 'Wizard Level 2'
            }
        ],
        3: [] // Features come from subclass
    },
    subclasses: [SCHOOL_OF_EVOCATION],
    subclassLevel: 2,
    spellcasting: {
        ability: 'intelligence',
        cantripsKnown: WIZARD_CANTRIPS_KNOWN,
        preparedSpells: {
            formula: 'INT_MOD + LEVEL' // Prepares from spellbook
        },
        spellSlots: FULL_CASTER_SPELL_SLOTS,
        spellListId: 'wizard',
        ritualCasting: true, // Wizards can ritual cast from spellbook WITHOUT preparing!
        spellbook: {
            startingSpells: 6, // 6 1st-level spells at creation
            spellsPerLevel: 2  // Gain 2 spells per level
        }
    },
    description: 'A scholarly magic-user capable of manipulating the structures of reality. Wizards are supreme magic-users, defined and united as a class by the spells they cast. Drawing on the subtle weave of magic that permeates the cosmos, wizards cast spells of explosive fire, arcing lightning, subtle deception, and brute-force mind control.',
    source: 'SRD'
};

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * All SRD martial classes (non-spellcasters)
 */
export const SRD_MARTIAL_CLASSES: DnD5eClass[] = [
    BARBARIAN,
    FIGHTER,
    MONK,
    ROGUE
];

/**
 * All SRD half-caster classes (Paladin, Ranger)
 */
export const SRD_HALF_CASTER_CLASSES: DnD5eClass[] = [
    PALADIN,
    RANGER
];

/**
 * All SRD full caster classes
 */
export const SRD_FULL_CASTER_CLASSES: DnD5eClass[] = [
    BARD,
    CLERIC,
    DRUID,
    SORCERER,
    WARLOCK,
    WIZARD
];

/**
 * All SRD caster classes (full + half casters)
 */
export const SRD_CASTER_CLASSES: DnD5eClass[] = [
    ...SRD_FULL_CASTER_CLASSES,
    ...SRD_HALF_CASTER_CLASSES
];

/**
 * All SRD classes (martial + casters)
 */
export const SRD_CLASSES: DnD5eClass[] = [
    ...SRD_MARTIAL_CLASSES,
    ...SRD_CASTER_CLASSES
];

/**
 * Helper: Get class by ID
 */
export function getClassById(id: string): DnD5eClass | undefined {
    return SRD_CLASSES.find(cls => cls.id === id);
}

/**
 * Helper: Get subclass by ID and class ID
 */
export function getSubclassById(classId: string, subclassId: string): DnD5eSubclass | undefined {
    const classData = getClassById(classId);
    if (!classData) return undefined;
    return classData.subclasses.find(sub => sub.id === subclassId);
}

/**
 * Helper: Check if class has spellcasting
 */
export function isSpellcaster(classId: string): boolean {
    const classData = getClassById(classId);
    return classData?.spellcasting !== undefined;
}

/**
 * Helper: Get all martial (non-spellcasting) classes
 */
export function getMartialClasses(): DnD5eClass[] {
    return SRD_CLASSES.filter(cls => !cls.spellcasting);
}

/**
 * Helper: Get all spellcasting classes
 */
export function getSpellcasterClasses(): DnD5eClass[] {
    return SRD_CLASSES.filter(cls => cls.spellcasting !== undefined);
}

