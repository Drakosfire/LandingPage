/**
 * D&D 5e SRD Races
 * 
 * Complete race data from D&D 5e System Reference Document.
 * All 9 SRD base races with their subraces.
 * 
 * Reference: https://github.com/foundryvtt/dnd5e/tree/5.2.x/packs/_source
 * 
 * @module CharacterGenerator/data/dnd5e/races
 */

import { DnD5eRace } from '../../types';

// ============================================================================
// DWARF
// ============================================================================

/**
 * Shared Dwarf racial traits (common to all dwarf subraces)
 */
const DWARF_BASE_TRAITS: DnD5eRace['traits'] = [
        {
            id: 'darkvision',
            name: 'Darkvision',
            description: 'Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.',
            type: 'passive'
        },
        {
            id: 'dwarven-resilience',
            name: 'Dwarven Resilience',
            description: 'You have advantage on saving throws against poison, and you have resistance against poison damage.',
            type: 'passive'
        },
        {
            id: 'dwarven-combat-training',
            name: 'Dwarven Combat Training',
            description: 'You have proficiency with the battleaxe, handaxe, light hammer, and warhammer.',
            type: 'passive'
        },
        {
            id: 'tool-proficiency',
            name: 'Tool Proficiency',
            description: 'You gain proficiency with the artisan\'s tools of your choice: smith\'s tools, brewer\'s supplies, or mason\'s tools.',
            type: 'passive'
        },
        {
            id: 'stonecunning',
            name: 'Stonecunning',
            description: 'Whenever you make an Intelligence (History) check related to the origin of stonework, you are considered proficient in the History skill and add double your proficiency bonus to the check, instead of your normal proficiency bonus.',
            type: 'passive'
    }
];

/**
 * Hill Dwarf
 */
export const HILL_DWARF: DnD5eRace = {
    id: 'hill-dwarf',
    name: 'Hill Dwarf',
    baseRace: 'dwarf',
    size: 'medium',
    speed: { walk: 25 },
    abilityBonuses: [
        { ability: 'constitution', bonus: 2 },
        { ability: 'wisdom', bonus: 1 }
    ],
    traits: [
        ...DWARF_BASE_TRAITS,
        {
            id: 'dwarven-toughness',
            name: 'Dwarven Toughness',
            description: 'Your hit point maximum increases by 1, and it increases by 1 every time you gain a level.',
            type: 'passive'
        }
    ],
    languages: ['Common', 'Dwarvish'],
    languageChoices: 0,
    description: 'As a hill dwarf, you have keen senses, deep intuition, and remarkable resilience. The gold dwarves of Faerûn in their mighty southern kingdom are hill dwarves, as are the exiled Neidar and the debased Klar of Krynn in the Dragonlance setting.',
    source: 'SRD'
};

/**
 * Mountain Dwarf (T014)
 */
export const MOUNTAIN_DWARF: DnD5eRace = {
    id: 'mountain-dwarf',
    name: 'Mountain Dwarf',
    baseRace: 'dwarf',
    size: 'medium',
    speed: { walk: 25 },
    abilityBonuses: [
        { ability: 'constitution', bonus: 2 },
        { ability: 'strength', bonus: 2 }
    ],
    traits: [
        ...DWARF_BASE_TRAITS,
        {
            id: 'dwarven-armor-training',
            name: 'Dwarven Armor Training',
            description: 'You have proficiency with light and medium armor.',
            type: 'passive'
        }
    ],
    languages: ['Common', 'Dwarvish'],
    languageChoices: 0,
    description: 'As a mountain dwarf, you\'re strong and hardy, accustomed to a difficult life in rugged terrain. You\'re probably on the tall side (for a dwarf), and tend toward lighter coloration. The shield dwarves of northern Faerûn, as well as the ruling Hylar clan and the noble Daewar clan of Dragonlance, are mountain dwarves.',
    source: 'SRD'
};

// ============================================================================
// ELF
// ============================================================================

/**
 * Shared Elf racial traits (common to all elf subraces)
 */
const ELF_BASE_TRAITS: DnD5eRace['traits'] = [
    {
        id: 'darkvision',
        name: 'Darkvision',
        description: 'Accustomed to twilit forests and the night sky, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.',
        type: 'passive'
    },
    {
        id: 'keen-senses',
        name: 'Keen Senses',
        description: 'You have proficiency in the Perception skill.',
        type: 'passive'
    },
    {
        id: 'fey-ancestry',
        name: 'Fey Ancestry',
        description: 'You have advantage on saving throws against being charmed, and magic can\'t put you to sleep.',
        type: 'passive'
    },
    {
        id: 'trance',
        name: 'Trance',
        description: 'Elves don\'t need to sleep. Instead, they meditate deeply, remaining semiconscious, for 4 hours a day. (The Common word for such meditation is "trance.") While meditating, you can dream after a fashion; such dreams are actually mental exercises that have become reflexive through years of practice. After resting in this way, you gain the same benefit that a human does from 8 hours of sleep.',
        type: 'passive'
    }
];

/**
 * High Elf (T015)
 */
export const HIGH_ELF: DnD5eRace = {
    id: 'high-elf',
    name: 'High Elf',
    baseRace: 'elf',
    size: 'medium',
    speed: { walk: 30 },
    abilityBonuses: [
        { ability: 'dexterity', bonus: 2 },
        { ability: 'intelligence', bonus: 1 }
    ],
    traits: [
        ...ELF_BASE_TRAITS,
        {
            id: 'elf-weapon-training',
            name: 'Elf Weapon Training',
            description: 'You have proficiency with the longsword, shortsword, shortbow, and longbow.',
            type: 'passive'
        },
        {
            id: 'cantrip',
            name: 'Cantrip',
            description: 'You know one cantrip of your choice from the wizard spell list. Intelligence is your spellcasting ability for it.',
            type: 'passive'
        },
        {
            id: 'extra-language',
            name: 'Extra Language',
            description: 'You can speak, read, and write one extra language of your choice.',
            type: 'passive'
        }
    ],
    languages: ['Common', 'Elvish'],
    languageChoices: 1,
    description: 'As a high elf, you have a keen mind and a mastery of at least the basics of magic. In many of the worlds of D&D, there are two kinds of high elves. One type is haughty and reclusive, believing themselves to be superior to non-elves and even other elves. The other type is more common and more friendly, and often encountered among humans and other races.',
    source: 'SRD'
};

/**
 * Wood Elf (T015)
 */
export const WOOD_ELF: DnD5eRace = {
    id: 'wood-elf',
    name: 'Wood Elf',
    baseRace: 'elf',
    size: 'medium',
    speed: { walk: 35 },
    abilityBonuses: [
        { ability: 'dexterity', bonus: 2 },
        { ability: 'wisdom', bonus: 1 }
    ],
    traits: [
        ...ELF_BASE_TRAITS,
        {
            id: 'elf-weapon-training',
            name: 'Elf Weapon Training',
            description: 'You have proficiency with the longsword, shortsword, shortbow, and longbow.',
            type: 'passive'
        },
        {
            id: 'fleet-of-foot',
            name: 'Fleet of Foot',
            description: 'Your base walking speed increases to 35 feet.',
            type: 'passive'
        },
        {
            id: 'mask-of-the-wild',
            name: 'Mask of the Wild',
            description: 'You can attempt to hide even when you are only lightly obscured by foliage, heavy rain, falling snow, mist, and other natural phenomena.',
            type: 'passive'
        }
    ],
    languages: ['Common', 'Elvish'],
    languageChoices: 0,
    description: 'As a wood elf, you have keen senses and intuition, and your fleet feet carry you quickly and stealthily through your native forests. This category includes the wild elves (grugach) of Greyhawk and the Kagonesti of Dragonlance, as well as the races called wood elves in Greyhawk and the Forgotten Realms.',
    source: 'SRD'
};

// ============================================================================
// HALFLING
// ============================================================================

/**
 * Shared Halfling racial traits (common to all halfling subraces)
 */
const HALFLING_BASE_TRAITS: DnD5eRace['traits'] = [
    {
        id: 'lucky',
        name: 'Lucky',
        description: 'When you roll a 1 on the d20 for an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll.',
        type: 'passive'
    },
    {
        id: 'brave',
        name: 'Brave',
        description: 'You have advantage on saving throws against being frightened.',
        type: 'passive'
    },
    {
        id: 'halfling-nimbleness',
        name: 'Halfling Nimbleness',
        description: 'You can move through the space of any creature that is of a size larger than yours.',
        type: 'passive'
    }
];

/**
 * Lightfoot Halfling (T016)
 */
export const LIGHTFOOT_HALFLING: DnD5eRace = {
    id: 'lightfoot-halfling',
    name: 'Lightfoot Halfling',
    baseRace: 'halfling',
    size: 'small',
    speed: { walk: 25 },
    abilityBonuses: [
        { ability: 'dexterity', bonus: 2 },
        { ability: 'charisma', bonus: 1 }
    ],
    traits: [
        ...HALFLING_BASE_TRAITS,
        {
            id: 'naturally-stealthy',
            name: 'Naturally Stealthy',
            description: 'You can attempt to hide even when you are obscured only by a creature that is at least one size larger than you.',
            type: 'passive'
        }
    ],
    languages: ['Common', 'Halfling'],
    languageChoices: 0,
    description: 'As a lightfoot halfling, you can easily hide from notice, even using other people as cover. You\'re inclined to be affable and get along well with others. Lightfoots are more prone to wanderlust than other halflings, and often dwell alongside other races or take up a nomadic life.',
    source: 'SRD'
};

/**
 * Stout Halfling (T016)
 */
export const STOUT_HALFLING: DnD5eRace = {
    id: 'stout-halfling',
    name: 'Stout Halfling',
    baseRace: 'halfling',
    size: 'small',
    speed: { walk: 25 },
    abilityBonuses: [
        { ability: 'dexterity', bonus: 2 },
        { ability: 'constitution', bonus: 1 }
    ],
    traits: [
        ...HALFLING_BASE_TRAITS,
        {
            id: 'stout-resilience',
            name: 'Stout Resilience',
            description: 'You have advantage on saving throws against poison, and you have resistance against poison damage.',
            type: 'passive'
        }
    ],
    languages: ['Common', 'Halfling'],
    languageChoices: 0,
    description: 'As a stout halfling, you\'re hardier than average and have some resistance to poison. Some say that stouts have dwarven blood. In the Forgotten Realms, these halflings are called stronghearts, and they\'re most common in the south.',
    source: 'SRD'
};

// ============================================================================
// HUMAN
// ============================================================================

/**
 * Human (T017)
 */
export const HUMAN: DnD5eRace = {
    id: 'human',
    name: 'Human',
    // No baseRace - Human has no subraces in SRD
    size: 'medium',
    speed: { walk: 30 },
    abilityBonuses: [
        { ability: 'strength', bonus: 1 },
        { ability: 'dexterity', bonus: 1 },
        { ability: 'constitution', bonus: 1 },
        { ability: 'intelligence', bonus: 1 },
        { ability: 'wisdom', bonus: 1 },
        { ability: 'charisma', bonus: 1 }
    ],
    traits: [],  // Humans have no special racial traits in SRD
    languages: ['Common'],
    languageChoices: 1,
    description: 'In the reckonings of most worlds, humans are the youngest of the common races, late to arrive on the world scene and short-lived in comparison to dwarves, elves, and dragons. Perhaps it is because of their shorter lives that they strive to achieve as much as they can in the years they are given.',
    source: 'SRD'
};

// ============================================================================
// DRAGONBORN
// ============================================================================

/**
 * Dragonborn (T018)
 * Note: Ancestry choice (breath weapon type) is handled at character creation
 */
export const DRAGONBORN: DnD5eRace = {
    id: 'dragonborn',
    name: 'Dragonborn',
    // No baseRace - Dragonborn has ancestry choice but no subraces
    size: 'medium',
    speed: { walk: 30 },
    abilityBonuses: [
        { ability: 'strength', bonus: 2 },
        { ability: 'charisma', bonus: 1 }
    ],
    traits: [
        {
            id: 'draconic-ancestry',
            name: 'Draconic Ancestry',
            description: 'You have draconic ancestry. Choose one type of dragon from the Draconic Ancestry table. Your breath weapon and damage resistance are determined by the dragon type.',
            type: 'passive'
        },
        {
            id: 'breath-weapon',
            name: 'Breath Weapon',
            description: 'You can use your action to exhale destructive energy. Your draconic ancestry determines the size, shape, and damage type of the exhalation. When you use your breath weapon, each creature in the area of the exhalation must make a saving throw, the type of which is determined by your draconic ancestry. The DC for this saving throw equals 8 + your Constitution modifier + your proficiency bonus. A creature takes 2d6 damage on a failed save, and half as much damage on a successful one. The damage increases to 3d6 at 6th level, 4d6 at 11th level, and 5d6 at 16th level. After you use your breath weapon, you can\'t use it again until you complete a short or long rest.',
            type: 'active'
        },
        {
            id: 'damage-resistance',
            name: 'Damage Resistance',
            description: 'You have resistance to the damage type associated with your draconic ancestry.',
            type: 'passive'
        }
    ],
    languages: ['Common', 'Draconic'],
    languageChoices: 0,
    description: 'Born of dragons, as their name proclaims, the dragonborn walk proudly through a world that greets them with fearful incomprehension. Shaped by draconic gods or the dragons themselves, dragonborn originally hatched from dragon eggs as a unique race, combining the best attributes of dragons and humanoids.',
    source: 'SRD'
};

/**
 * Draconic Ancestry options for Dragonborn
 */
export const DRACONIC_ANCESTRIES = [
    { dragon: 'Black', damageType: 'acid', breathWeapon: '5 by 30 ft. line (Dex. save)' },
    { dragon: 'Blue', damageType: 'lightning', breathWeapon: '5 by 30 ft. line (Dex. save)' },
    { dragon: 'Brass', damageType: 'fire', breathWeapon: '5 by 30 ft. line (Dex. save)' },
    { dragon: 'Bronze', damageType: 'lightning', breathWeapon: '5 by 30 ft. line (Dex. save)' },
    { dragon: 'Copper', damageType: 'acid', breathWeapon: '5 by 30 ft. line (Dex. save)' },
    { dragon: 'Gold', damageType: 'fire', breathWeapon: '15 ft. cone (Dex. save)' },
    { dragon: 'Green', damageType: 'poison', breathWeapon: '15 ft. cone (Con. save)' },
    { dragon: 'Red', damageType: 'fire', breathWeapon: '15 ft. cone (Dex. save)' },
    { dragon: 'Silver', damageType: 'cold', breathWeapon: '15 ft. cone (Con. save)' },
    { dragon: 'White', damageType: 'cold', breathWeapon: '15 ft. cone (Con. save)' }
] as const;

// ============================================================================
// GNOME
// ============================================================================

/**
 * Shared Gnome racial traits (common to all gnome subraces)
 */
const GNOME_BASE_TRAITS: DnD5eRace['traits'] = [
    {
        id: 'darkvision',
        name: 'Darkvision',
        description: 'Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.',
        type: 'passive'
    },
    {
        id: 'gnome-cunning',
        name: 'Gnome Cunning',
        description: 'You have advantage on all Intelligence, Wisdom, and Charisma saving throws against magic.',
        type: 'passive'
    }
];

/**
 * Forest Gnome (T019)
 */
export const FOREST_GNOME: DnD5eRace = {
    id: 'forest-gnome',
    name: 'Forest Gnome',
    baseRace: 'gnome',
    size: 'small',
    speed: { walk: 25 },
    abilityBonuses: [
        { ability: 'intelligence', bonus: 2 },
        { ability: 'dexterity', bonus: 1 }
    ],
    traits: [
        ...GNOME_BASE_TRAITS,
        {
            id: 'natural-illusionist',
            name: 'Natural Illusionist',
            description: 'You know the minor illusion cantrip. Intelligence is your spellcasting ability for it.',
            type: 'passive'
        },
        {
            id: 'speak-with-small-beasts',
            name: 'Speak with Small Beasts',
            description: 'Through sounds and gestures, you can communicate simple ideas with Small or smaller beasts. Forest gnomes love animals and often keep squirrels, badgers, rabbits, moles, woodpeckers, and other creatures as beloved pets.',
            type: 'passive'
        }
    ],
    languages: ['Common', 'Gnomish'],
    languageChoices: 0,
    description: 'As a forest gnome, you have a natural knack for illusion and inherent quickness and stealth. In the worlds of D&D, forest gnomes are rare and secretive. They gather in hidden communities in sylvan forests, using illusions and trickery to conceal themselves from threats or to mask their escape should they be detected.',
    source: 'SRD'
};

/**
 * Rock Gnome (T019)
 */
export const ROCK_GNOME: DnD5eRace = {
    id: 'rock-gnome',
    name: 'Rock Gnome',
    baseRace: 'gnome',
    size: 'small',
    speed: { walk: 25 },
    abilityBonuses: [
        { ability: 'intelligence', bonus: 2 },
        { ability: 'constitution', bonus: 1 }
    ],
    traits: [
        ...GNOME_BASE_TRAITS,
        {
            id: 'artificers-lore',
            name: 'Artificer\'s Lore',
            description: 'Whenever you make an Intelligence (History) check related to magic items, alchemical objects, or technological devices, you can add twice your proficiency bonus, instead of any proficiency bonus you normally apply.',
            type: 'passive'
        },
        {
            id: 'tinker',
            name: 'Tinker',
            description: 'You have proficiency with artisan\'s tools (tinker\'s tools). Using those tools, you can spend 1 hour and 10 gp worth of materials to construct a Tiny clockwork device (AC 5, 1 hp). The device ceases to function after 24 hours (unless you spend 1 hour repairing it to keep the device functioning), or when you use your action to dismantle it; at that time, you can reclaim the materials used to create it. You can have up to three such devices active at a time.',
            type: 'passive'
        }
    ],
    languages: ['Common', 'Gnomish'],
    languageChoices: 0,
    description: 'As a rock gnome, you have a natural inventiveness and hardiness beyond that of other gnomes. Most gnomes in the worlds of D&D are rock gnomes, including the tinker gnomes of the Dragonlance setting.',
    source: 'SRD'
};

// ============================================================================
// HALF-ELF
// ============================================================================

/**
 * Half-Elf (T020)
 * Note: +2 CHA, +1 to two other abilities of your choice (handled at creation)
 */
export const HALF_ELF: DnD5eRace = {
    id: 'half-elf',
    name: 'Half-Elf',
    // No baseRace - Half-Elf has no subraces in SRD
    size: 'medium',
    speed: { walk: 30 },
    abilityBonuses: [
        { ability: 'charisma', bonus: 2 }
        // +1 to two other abilities chosen at character creation
    ],
    traits: [
        {
            id: 'darkvision',
            name: 'Darkvision',
            description: 'Thanks to your elf blood, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.',
            type: 'passive'
        },
        {
            id: 'fey-ancestry',
            name: 'Fey Ancestry',
            description: 'You have advantage on saving throws against being charmed, and magic can\'t put you to sleep.',
            type: 'passive'
        },
        {
            id: 'skill-versatility',
            name: 'Skill Versatility',
            description: 'You gain proficiency in two skills of your choice.',
            type: 'passive'
        },
        {
            id: 'ability-score-increase-choice',
            name: 'Ability Score Increase',
            description: 'Two different ability scores of your choice increase by 1 (in addition to +2 Charisma).',
            type: 'passive'
        }
    ],
    languages: ['Common', 'Elvish'],
    languageChoices: 1,
    description: 'Walking in two worlds but truly belonging to neither, half-elves combine what some say are the best qualities of their elf and human parents: human curiosity, inventiveness, and ambition tempered by the refined senses, love of nature, and artistic tastes of the elves.',
    source: 'SRD'
};

// ============================================================================
// HALF-ORC
// ============================================================================

/**
 * Half-Orc (T021)
 */
export const HALF_ORC: DnD5eRace = {
    id: 'half-orc',
    name: 'Half-Orc',
    // No baseRace - Half-Orc has no subraces in SRD
    size: 'medium',
    speed: { walk: 30 },
    abilityBonuses: [
        { ability: 'strength', bonus: 2 },
        { ability: 'constitution', bonus: 1 }
    ],
    traits: [
        {
            id: 'darkvision',
            name: 'Darkvision',
            description: 'Thanks to your orc blood, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.',
            type: 'passive'
        },
        {
            id: 'menacing',
            name: 'Menacing',
            description: 'You gain proficiency in the Intimidation skill.',
            type: 'passive'
        },
        {
            id: 'relentless-endurance',
            name: 'Relentless Endurance',
            description: 'When you are reduced to 0 hit points but not killed outright, you can drop to 1 hit point instead. You can\'t use this feature again until you finish a long rest.',
            type: 'active'
        },
        {
            id: 'savage-attacks',
            name: 'Savage Attacks',
            description: 'When you score a critical hit with a melee weapon attack, you can roll one of the weapon\'s damage dice one additional time and add it to the extra damage of the critical hit.',
            type: 'passive'
        }
    ],
    languages: ['Common', 'Orc'],
    languageChoices: 0,
    description: 'Whether united under the leadership of a mighty warlock or having fought to a standstill after years of conflict, orc and human tribes sometimes form alliances, joining forces into a larger horde to the terror of civilized lands nearby. When these alliances are sealed by marriages, half-orcs are born.',
    source: 'SRD'
};

// ============================================================================
// TIEFLING
// ============================================================================

/**
 * Tiefling (T022)
 */
export const TIEFLING: DnD5eRace = {
    id: 'tiefling',
    name: 'Tiefling',
    // No baseRace - Tiefling has no subraces in SRD
    size: 'medium',
    speed: { walk: 30 },
    abilityBonuses: [
        { ability: 'charisma', bonus: 2 },
        { ability: 'intelligence', bonus: 1 }
    ],
    traits: [
        {
            id: 'darkvision',
            name: 'Darkvision',
            description: 'Thanks to your infernal heritage, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.',
            type: 'passive'
        },
        {
            id: 'hellish-resistance',
            name: 'Hellish Resistance',
            description: 'You have resistance to fire damage.',
            type: 'passive'
        },
        {
            id: 'infernal-legacy',
            name: 'Infernal Legacy',
            description: 'You know the thaumaturgy cantrip. When you reach 3rd level, you can cast the hellish rebuke spell as a 2nd-level spell once with this trait and regain the ability to do so when you finish a long rest. When you reach 5th level, you can cast the darkness spell once with this trait and regain the ability to do so when you finish a long rest. Charisma is your spellcasting ability for these spells.',
            type: 'passive'
        }
    ],
    languages: ['Common', 'Infernal'],
    languageChoices: 0,
    description: 'To be greeted with stares and whispers, to suffer violence and insult on the street, to see mistrust and fear in every eye: this is the lot of the tiefling. And to twist the knife, tieflings know that this is because a pact struck generations ago infused the essence of Asmodeus—overlord of the Nine Hells—into their bloodline.',
    source: 'SRD'
};

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * All SRD races
 */
export const SRD_RACES: DnD5eRace[] = [
    // Dwarves
    HILL_DWARF,
    MOUNTAIN_DWARF,
    // Elves
    HIGH_ELF,
    WOOD_ELF,
    // Halflings
    LIGHTFOOT_HALFLING,
    STOUT_HALFLING,
    // Human
    HUMAN,
    // Dragonborn
    DRAGONBORN,
    // Gnomes
    FOREST_GNOME,
    ROCK_GNOME,
    // Half-Elf
    HALF_ELF,
    // Half-Orc
    HALF_ORC,
    // Tiefling
    TIEFLING
];

/**
 * Helper: Get race by ID
 */
export function getRaceById(id: string): DnD5eRace | undefined {
    return SRD_RACES.find(race => race.id === id);
}

/**
 * Helper: Get all base races (no subraces)
 */
export function getBaseRaces(): DnD5eRace[] {
    return SRD_RACES.filter(race => !race.baseRace);
}

/**
 * Helper: Get subraces for a base race
 */
export function getSubraces(baseRaceName: string): DnD5eRace[] {
    return SRD_RACES.filter(race => 
        race.baseRace?.toLowerCase() === baseRaceName.toLowerCase()
    );
}

/**
 * Helper: Get all unique base race names
 */
export function getUniqueBaseRaceNames(): string[] {
    const baseRaceNames = new Set<string>();
    
    SRD_RACES.forEach(race => {
        if (race.baseRace) {
            baseRaceNames.add(race.baseRace);
        } else {
            // For races without subraces, the race name is the base
            baseRaceNames.add(race.name.toLowerCase());
        }
    });
    
    return Array.from(baseRaceNames);
}
