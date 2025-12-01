/**
 * D&D 5e SRD Spells - Cantrips and Level 1-3
 * 
 * SRD spell data for character creation (levels 1-3).
 * Reference: RESEARCH-Spellcasting-System.md
 * 
 * @module CharacterGenerator/data/dnd5e/spells
 */

import { DnD5eSpell, SpellSchool } from '../../types/dnd5e/spell.types';

// ============================================================================
// CANTRIPS (Level 0)
// ============================================================================

export const ACID_SPLASH: DnD5eSpell = {
    id: 'acid-splash',
    name: 'Acid Splash',
    level: 0,
    school: 'conjuration',
    castingTime: '1 action',
    range: '60 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    description: 'You hurl a bubble of acid. Choose one creature within range, or choose two creatures within range that are within 5 feet of each other. A target must succeed on a Dexterity saving throw or take 1d6 acid damage.',
    damage: { type: 'acid', dice: '1d6' },
    classes: ['sorcerer', 'wizard'],
    source: 'SRD'
};

export const CHILL_TOUCH: DnD5eSpell = {
    id: 'chill-touch',
    name: 'Chill Touch',
    level: 0,
    school: 'necromancy',
    castingTime: '1 action',
    range: '120 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: '1 round',
    description: 'You create a ghostly, skeletal hand in the space of a creature within range. Make a ranged spell attack against the creature to assail it with the chill of the grave. On a hit, the target takes 1d8 necrotic damage, and it can\'t regain hit points until the start of your next turn.',
    damage: { type: 'necrotic', dice: '1d8' },
    classes: ['sorcerer', 'warlock', 'wizard'],
    source: 'SRD'
};

export const DANCING_LIGHTS: DnD5eSpell = {
    id: 'dancing-lights',
    name: 'Dancing Lights',
    level: 0,
    school: 'evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: { verbal: true, somatic: true, material: true, materialDescription: 'a bit of phosphorus or wychwood, or a glowworm' },
    duration: 'Concentration, up to 1 minute',
    concentration: true,
    description: 'You create up to four torch-sized lights within range, making them appear as torches, lanterns, or glowing orbs that hover in the air for the duration.',
    classes: ['bard', 'sorcerer', 'wizard'],
    source: 'SRD'
};

export const DRUIDCRAFT: DnD5eSpell = {
    id: 'druidcraft',
    name: 'Druidcraft',
    level: 0,
    school: 'transmutation',
    castingTime: '1 action',
    range: '30 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    description: 'Whispering to the spirits of nature, you create one of several minor effects: predict weather, make a flower bloom, create a sensory effect, or light/snuff a small flame.',
    classes: ['druid'],
    source: 'SRD'
};

export const ELDRITCH_BLAST: DnD5eSpell = {
    id: 'eldritch-blast',
    name: 'Eldritch Blast',
    level: 0,
    school: 'evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    description: 'A beam of crackling energy streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 force damage.',
    damage: { type: 'force', dice: '1d10' },
    classes: ['warlock'],
    source: 'SRD'
};

export const FIRE_BOLT: DnD5eSpell = {
    id: 'fire-bolt',
    name: 'Fire Bolt',
    level: 0,
    school: 'evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    description: 'You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage.',
    damage: { type: 'fire', dice: '1d10' },
    classes: ['sorcerer', 'wizard'],
    source: 'SRD'
};

export const GUIDANCE: DnD5eSpell = {
    id: 'guidance',
    name: 'Guidance',
    level: 0,
    school: 'divination',
    castingTime: '1 action',
    range: 'Touch',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Concentration, up to 1 minute',
    concentration: true,
    description: 'You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice.',
    classes: ['cleric', 'druid'],
    source: 'SRD'
};

export const LIGHT: DnD5eSpell = {
    id: 'light',
    name: 'Light',
    level: 0,
    school: 'evocation',
    castingTime: '1 action',
    range: 'Touch',
    components: { verbal: true, somatic: false, material: true, materialDescription: 'a firefly or phosphorescent moss' },
    duration: '1 hour',
    description: 'You touch one object that is no larger than 10 feet in any dimension. Until the spell ends, the object sheds bright light in a 20-foot radius and dim light for an additional 20 feet.',
    classes: ['bard', 'cleric', 'sorcerer', 'wizard'],
    source: 'SRD'
};

export const MAGE_HAND: DnD5eSpell = {
    id: 'mage-hand',
    name: 'Mage Hand',
    level: 0,
    school: 'conjuration',
    castingTime: '1 action',
    range: '30 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: '1 minute',
    description: 'A spectral, floating hand appears at a point you choose within range. The hand can manipulate an object, open an unlocked door or container, stow or retrieve an item from an open container, or pour the contents out of a vial.',
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    source: 'SRD'
};

export const MENDING: DnD5eSpell = {
    id: 'mending',
    name: 'Mending',
    level: 0,
    school: 'transmutation',
    castingTime: '1 minute',
    range: 'Touch',
    components: { verbal: true, somatic: true, material: true, materialDescription: 'two lodestones' },
    duration: 'Instantaneous',
    description: 'This spell repairs a single break or tear in an object you touch, such as a broken chain link, two halves of a broken key, a torn cloak, or a leaking wineskin.',
    classes: ['bard', 'cleric', 'druid', 'sorcerer', 'wizard'],
    source: 'SRD'
};

export const MESSAGE: DnD5eSpell = {
    id: 'message',
    name: 'Message',
    level: 0,
    school: 'transmutation',
    castingTime: '1 action',
    range: '120 feet',
    components: { verbal: true, somatic: true, material: true, materialDescription: 'a short piece of copper wire' },
    duration: '1 round',
    description: 'You point your finger toward a creature within range and whisper a message. The target (and only the target) hears the message and can reply in a whisper that only you can hear.',
    classes: ['bard', 'sorcerer', 'wizard'],
    source: 'SRD'
};

export const MINOR_ILLUSION: DnD5eSpell = {
    id: 'minor-illusion',
    name: 'Minor Illusion',
    level: 0,
    school: 'illusion',
    castingTime: '1 action',
    range: '30 feet',
    components: { verbal: false, somatic: true, material: true, materialDescription: 'a bit of fleece' },
    duration: '1 minute',
    description: 'You create a sound or an image of an object within range that lasts for the duration.',
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    source: 'SRD'
};

export const POISON_SPRAY: DnD5eSpell = {
    id: 'poison-spray',
    name: 'Poison Spray',
    level: 0,
    school: 'conjuration',
    castingTime: '1 action',
    range: '10 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    description: 'You extend your hand toward a creature you can see within range and project a puff of noxious gas from your palm. The creature must succeed on a Constitution saving throw or take 1d12 poison damage.',
    damage: { type: 'poison', dice: '1d12' },
    classes: ['druid', 'sorcerer', 'warlock', 'wizard'],
    source: 'SRD'
};

export const PRESTIDIGITATION: DnD5eSpell = {
    id: 'prestidigitation',
    name: 'Prestidigitation',
    level: 0,
    school: 'transmutation',
    castingTime: '1 action',
    range: '10 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Up to 1 hour',
    description: 'This spell is a minor magical trick that novice spellcasters use for practice. You create one of several minor sensory effects.',
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    source: 'SRD'
};

export const PRODUCE_FLAME: DnD5eSpell = {
    id: 'produce-flame',
    name: 'Produce Flame',
    level: 0,
    school: 'conjuration',
    castingTime: '1 action',
    range: 'Self',
    components: { verbal: true, somatic: true, material: false },
    duration: '10 minutes',
    description: 'A flickering flame appears in your hand. The flame remains there for the duration and harms neither you nor your equipment. You can also attack with the flame.',
    damage: { type: 'fire', dice: '1d8' },
    classes: ['druid'],
    source: 'SRD'
};

export const RAY_OF_FROST: DnD5eSpell = {
    id: 'ray-of-frost',
    name: 'Ray of Frost',
    level: 0,
    school: 'evocation',
    castingTime: '1 action',
    range: '60 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    description: 'A frigid beam of blue-white light streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, it takes 1d8 cold damage, and its speed is reduced by 10 feet until the start of your next turn.',
    damage: { type: 'cold', dice: '1d8' },
    classes: ['sorcerer', 'wizard'],
    source: 'SRD'
};

export const RESISTANCE: DnD5eSpell = {
    id: 'resistance',
    name: 'Resistance',
    level: 0,
    school: 'abjuration',
    castingTime: '1 action',
    range: 'Touch',
    components: { verbal: true, somatic: true, material: true, materialDescription: 'a miniature cloak' },
    duration: 'Concentration, up to 1 minute',
    concentration: true,
    description: 'You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one saving throw of its choice.',
    classes: ['cleric', 'druid'],
    source: 'SRD'
};

export const SACRED_FLAME: DnD5eSpell = {
    id: 'sacred-flame',
    name: 'Sacred Flame',
    level: 0,
    school: 'evocation',
    castingTime: '1 action',
    range: '60 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    description: 'Flame-like radiance descends on a creature that you can see within range. The target must succeed on a Dexterity saving throw or take 1d8 radiant damage.',
    damage: { type: 'radiant', dice: '1d8' },
    classes: ['cleric'],
    source: 'SRD'
};

export const SHOCKING_GRASP: DnD5eSpell = {
    id: 'shocking-grasp',
    name: 'Shocking Grasp',
    level: 0,
    school: 'evocation',
    castingTime: '1 action',
    range: 'Touch',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    description: 'Lightning springs from your hand to deliver a shock to a creature you try to touch. Make a melee spell attack against the target. On a hit, the target takes 1d8 lightning damage.',
    damage: { type: 'lightning', dice: '1d8' },
    classes: ['sorcerer', 'wizard'],
    source: 'SRD'
};

export const SPARE_THE_DYING: DnD5eSpell = {
    id: 'spare-the-dying',
    name: 'Spare the Dying',
    level: 0,
    school: 'necromancy',
    castingTime: '1 action',
    range: 'Touch',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    description: 'You touch a living creature that has 0 hit points. The creature becomes stable.',
    classes: ['cleric'],
    source: 'SRD'
};

export const THAUMATURGY: DnD5eSpell = {
    id: 'thaumaturgy',
    name: 'Thaumaturgy',
    level: 0,
    school: 'transmutation',
    castingTime: '1 action',
    range: '30 feet',
    components: { verbal: true, somatic: false, material: false },
    duration: 'Up to 1 minute',
    description: 'You manifest a minor wonder, a sign of supernatural power, within range.',
    classes: ['cleric'],
    source: 'SRD'
};

export const TRUE_STRIKE: DnD5eSpell = {
    id: 'true-strike',
    name: 'True Strike',
    level: 0,
    school: 'divination',
    castingTime: '1 action',
    range: '30 feet',
    components: { verbal: false, somatic: true, material: false },
    duration: 'Concentration, up to 1 round',
    concentration: true,
    description: 'You extend your hand and point a finger at a target in range. Your magic grants you a brief insight into the target\'s defenses. On your next turn, you gain advantage on your first attack roll against the target.',
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    source: 'SRD'
};

export const VICIOUS_MOCKERY: DnD5eSpell = {
    id: 'vicious-mockery',
    name: 'Vicious Mockery',
    level: 0,
    school: 'enchantment',
    castingTime: '1 action',
    range: '60 feet',
    components: { verbal: true, somatic: false, material: false },
    duration: 'Instantaneous',
    description: 'You unleash a string of insults laced with subtle enchantments at a creature you can see within range. If the target can hear you (though it need not understand you), it must succeed on a Wisdom saving throw or take 1d4 psychic damage and have disadvantage on the next attack roll it makes before the end of its next turn.',
    damage: { type: 'psychic', dice: '1d4' },
    classes: ['bard'],
    source: 'SRD'
};

// ============================================================================
// 1ST-LEVEL SPELLS
// ============================================================================

export const BLESS: DnD5eSpell = {
    id: 'bless',
    name: 'Bless',
    level: 1,
    school: 'enchantment',
    castingTime: '1 action',
    range: '30 feet',
    components: { verbal: true, somatic: true, material: true, materialDescription: 'a sprinkling of holy water' },
    duration: 'Concentration, up to 1 minute',
    concentration: true,
    description: 'You bless up to three creatures of your choice within range. Whenever a target makes an attack roll or a saving throw before the spell ends, the target can roll a d4 and add the number rolled to the attack roll or saving throw.',
    classes: ['cleric', 'paladin'],
    source: 'SRD'
};

export const BURNING_HANDS: DnD5eSpell = {
    id: 'burning-hands',
    name: 'Burning Hands',
    level: 1,
    school: 'evocation',
    castingTime: '1 action',
    range: 'Self (15-foot cone)',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    description: 'As you hold your hands with thumbs touching and fingers spread, a thin sheet of flames shoots forth from your outstretched fingertips. Each creature in a 15-foot cone must make a Dexterity saving throw. A creature takes 3d6 fire damage on a failed save, or half as much damage on a successful one.',
    damage: { type: 'fire', dice: '3d6' },
    higherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d6 for each slot level above 1st.',
    classes: ['sorcerer', 'wizard'],
    source: 'SRD'
};

export const CHARM_PERSON: DnD5eSpell = {
    id: 'charm-person',
    name: 'Charm Person',
    level: 1,
    school: 'enchantment',
    castingTime: '1 action',
    range: '30 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: '1 hour',
    description: 'You attempt to charm a humanoid you can see within range. It must make a Wisdom saving throw, and does so with advantage if you or your companions are fighting it. If it fails the saving throw, it is charmed by you until the spell ends or until you or your companions do anything harmful to it.',
    classes: ['bard', 'druid', 'sorcerer', 'warlock', 'wizard'],
    source: 'SRD'
};

export const CURE_WOUNDS: DnD5eSpell = {
    id: 'cure-wounds',
    name: 'Cure Wounds',
    level: 1,
    school: 'evocation',
    castingTime: '1 action',
    range: 'Touch',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    description: 'A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs.',
    healing: { dice: '1d8' },
    higherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d8 for each slot level above 1st.',
    classes: ['bard', 'cleric', 'druid', 'paladin', 'ranger'],
    source: 'SRD'
};

export const DETECT_MAGIC: DnD5eSpell = {
    id: 'detect-magic',
    name: 'Detect Magic',
    level: 1,
    school: 'divination',
    castingTime: '1 action',
    range: 'Self',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Concentration, up to 10 minutes',
    concentration: true,
    ritual: true,
    description: 'For the duration, you sense the presence of magic within 30 feet of you. If you sense magic in this way, you can use your action to see a faint aura around any visible creature or object in the area that bears magic.',
    classes: ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'wizard'],
    source: 'SRD'
};

export const DISGUISE_SELF: DnD5eSpell = {
    id: 'disguise-self',
    name: 'Disguise Self',
    level: 1,
    school: 'illusion',
    castingTime: '1 action',
    range: 'Self',
    components: { verbal: true, somatic: true, material: false },
    duration: '1 hour',
    description: 'You make yourself—including your clothing, armor, weapons, and other belongings on your person—look different until the spell ends or until you use your action to dismiss it.',
    classes: ['bard', 'sorcerer', 'wizard'],
    source: 'SRD'
};

export const FAERIE_FIRE: DnD5eSpell = {
    id: 'faerie-fire',
    name: 'Faerie Fire',
    level: 1,
    school: 'evocation',
    castingTime: '1 action',
    range: '60 feet',
    components: { verbal: true, somatic: false, material: false },
    duration: 'Concentration, up to 1 minute',
    concentration: true,
    description: 'Each object in a 20-foot cube within range is outlined in blue, green, or violet light (your choice). Any creature in the area when the spell is cast is also outlined in light if it fails a Dexterity saving throw. For the duration, objects and affected creatures shed dim light in a 10-foot radius. Any attack roll against an affected creature or object has advantage if the attacker can see it, and the affected creature or object can\'t benefit from being invisible.',
    classes: ['bard', 'druid'],
    source: 'SRD'
};

export const GUIDING_BOLT: DnD5eSpell = {
    id: 'guiding-bolt',
    name: 'Guiding Bolt',
    level: 1,
    school: 'evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: '1 round',
    description: 'A flash of light streaks toward a creature of your choice within range. Make a ranged spell attack against the target. On a hit, the target takes 4d6 radiant damage, and the next attack roll made against this target before the end of your next turn has advantage.',
    damage: { type: 'radiant', dice: '4d6' },
    higherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d6 for each slot level above 1st.',
    classes: ['cleric'],
    source: 'SRD'
};

export const HEALING_WORD: DnD5eSpell = {
    id: 'healing-word',
    name: 'Healing Word',
    level: 1,
    school: 'evocation',
    castingTime: '1 bonus action',
    range: '60 feet',
    components: { verbal: true, somatic: false, material: false },
    duration: 'Instantaneous',
    description: 'A creature of your choice that you can see within range regains hit points equal to 1d4 + your spellcasting ability modifier. This spell has no effect on undead or constructs.',
    healing: { dice: '1d4' },
    higherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d4 for each slot level above 1st.',
    classes: ['bard', 'cleric', 'druid'],
    source: 'SRD'
};

export const HELLISH_REBUKE: DnD5eSpell = {
    id: 'hellish-rebuke',
    name: 'Hellish Rebuke',
    level: 1,
    school: 'evocation',
    castingTime: '1 reaction',
    range: '60 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    description: 'You point your finger, and the creature that damaged you is momentarily surrounded by hellish flames. The creature must make a Dexterity saving throw. It takes 2d10 fire damage on a failed save, or half as much damage on a successful one.',
    damage: { type: 'fire', dice: '2d10' },
    higherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d10 for each slot level above 1st.',
    classes: ['warlock'],
    source: 'SRD'
};

export const HEROISM: DnD5eSpell = {
    id: 'heroism',
    name: 'Heroism',
    level: 1,
    school: 'enchantment',
    castingTime: '1 action',
    range: 'Touch',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Concentration, up to 1 minute',
    concentration: true,
    description: 'A willing creature you touch is imbued with bravery. Until the spell ends, the creature is immune to being frightened and gains temporary hit points equal to your spellcasting ability modifier at the start of each of its turns.',
    classes: ['bard', 'paladin'],
    source: 'SRD'
};

export const IDENTIFY: DnD5eSpell = {
    id: 'identify',
    name: 'Identify',
    level: 1,
    school: 'divination',
    castingTime: '1 minute',
    range: 'Touch',
    components: { verbal: true, somatic: true, material: true, materialDescription: 'a pearl worth at least 100 gp and an owl feather' },
    duration: 'Instantaneous',
    ritual: true,
    description: 'You choose one object that you must touch throughout the casting of the spell. If it is a magic item or some other magic-imbued object, you learn its properties and how to use them.',
    classes: ['bard', 'wizard'],
    source: 'SRD'
};

export const INFLICT_WOUNDS: DnD5eSpell = {
    id: 'inflict-wounds',
    name: 'Inflict Wounds',
    level: 1,
    school: 'necromancy',
    castingTime: '1 action',
    range: 'Touch',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    description: 'Make a melee spell attack against a creature you can reach. On a hit, the target takes 3d10 necrotic damage.',
    damage: { type: 'necrotic', dice: '3d10' },
    higherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d10 for each slot level above 1st.',
    classes: ['cleric'],
    source: 'SRD'
};

export const MAGE_ARMOR: DnD5eSpell = {
    id: 'mage-armor',
    name: 'Mage Armor',
    level: 1,
    school: 'abjuration',
    castingTime: '1 action',
    range: 'Touch',
    components: { verbal: true, somatic: true, material: true, materialDescription: 'a piece of cured leather' },
    duration: '8 hours',
    description: 'You touch a willing creature who isn\'t wearing armor, and a protective magical force surrounds it until the spell ends. The target\'s base AC becomes 13 + its Dexterity modifier. The spell ends if the target dons armor or if you dismiss the spell as an action.',
    classes: ['sorcerer', 'wizard'],
    source: 'SRD'
};

export const MAGIC_MISSILE: DnD5eSpell = {
    id: 'magic-missile',
    name: 'Magic Missile',
    level: 1,
    school: 'evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    description: 'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range. A dart deals 1d4 + 1 force damage to its target. The darts all strike simultaneously.',
    damage: { type: 'force', dice: '1d4+1' },
    higherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, the spell creates one more dart for each slot level above 1st.',
    classes: ['sorcerer', 'wizard'],
    source: 'SRD'
};

export const PROTECTION_FROM_EVIL_AND_GOOD: DnD5eSpell = {
    id: 'protection-from-evil-and-good',
    name: 'Protection from Evil and Good',
    level: 1,
    school: 'abjuration',
    castingTime: '1 action',
    range: 'Touch',
    components: { verbal: true, somatic: true, material: true, materialDescription: 'holy water or powdered silver and iron, which the spell consumes', consumesMaterial: true },
    duration: 'Concentration, up to 10 minutes',
    concentration: true,
    description: 'Until the spell ends, one willing creature you touch is protected against certain types of creatures: aberrations, celestials, elementals, fey, fiends, and undead.',
    classes: ['cleric', 'paladin', 'warlock', 'wizard'],
    source: 'SRD'
};

export const SANCTUARY: DnD5eSpell = {
    id: 'sanctuary',
    name: 'Sanctuary',
    level: 1,
    school: 'abjuration',
    castingTime: '1 bonus action',
    range: '30 feet',
    components: { verbal: true, somatic: true, material: true, materialDescription: 'a small silver mirror' },
    duration: '1 minute',
    description: 'You ward a creature within range against attack. Until the spell ends, any creature who targets the warded creature with an attack or a harmful spell must first make a Wisdom saving throw.',
    classes: ['cleric'],
    source: 'SRD'
};

export const SHIELD: DnD5eSpell = {
    id: 'shield',
    name: 'Shield',
    level: 1,
    school: 'abjuration',
    castingTime: '1 reaction',
    range: 'Self',
    components: { verbal: true, somatic: true, material: false },
    duration: '1 round',
    description: 'An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile.',
    classes: ['sorcerer', 'wizard'],
    source: 'SRD'
};

export const SHIELD_OF_FAITH: DnD5eSpell = {
    id: 'shield-of-faith',
    name: 'Shield of Faith',
    level: 1,
    school: 'abjuration',
    castingTime: '1 bonus action',
    range: '60 feet',
    components: { verbal: true, somatic: true, material: true, materialDescription: 'a small parchment with a bit of holy text written on it' },
    duration: 'Concentration, up to 10 minutes',
    concentration: true,
    description: 'A shimmering field appears and surrounds a creature of your choice within range, granting it a +2 bonus to AC for the duration.',
    classes: ['cleric', 'paladin'],
    source: 'SRD'
};

export const SLEEP: DnD5eSpell = {
    id: 'sleep',
    name: 'Sleep',
    level: 1,
    school: 'enchantment',
    castingTime: '1 action',
    range: '90 feet',
    components: { verbal: true, somatic: true, material: true, materialDescription: 'a pinch of fine sand, rose petals, or a cricket' },
    duration: '1 minute',
    description: 'This spell sends creatures into a magical slumber. Roll 5d8; the total is how many hit points of creatures this spell can affect. Creatures within 20 feet of a point you choose within range are affected in ascending order of their current hit points.',
    higherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, roll an additional 2d8 for each slot level above 1st.',
    classes: ['bard', 'sorcerer', 'wizard'],
    source: 'SRD'
};

export const SPEAK_WITH_ANIMALS: DnD5eSpell = {
    id: 'speak-with-animals',
    name: 'Speak with Animals',
    level: 1,
    school: 'divination',
    castingTime: '1 action',
    range: 'Self',
    components: { verbal: true, somatic: true, material: false },
    duration: '10 minutes',
    ritual: true,
    description: 'You gain the ability to comprehend and verbally communicate with beasts for the duration. The knowledge and awareness of many beasts is limited by their intelligence.',
    classes: ['bard', 'druid', 'ranger'],
    source: 'SRD'
};

export const THUNDERWAVE: DnD5eSpell = {
    id: 'thunderwave',
    name: 'Thunderwave',
    level: 1,
    school: 'evocation',
    castingTime: '1 action',
    range: 'Self (15-foot cube)',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    description: 'A wave of thunderous force sweeps out from you. Each creature in a 15-foot cube originating from you must make a Constitution saving throw. On a failed save, a creature takes 2d8 thunder damage and is pushed 10 feet away from you. On a successful save, the creature takes half as much damage and isn\'t pushed.',
    damage: { type: 'thunder', dice: '2d8' },
    higherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d8 for each slot level above 1st.',
    classes: ['bard', 'druid', 'sorcerer', 'wizard'],
    source: 'SRD'
};

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * All SRD cantrips (level 0)
 */
export const SRD_CANTRIPS: DnD5eSpell[] = [
    ACID_SPLASH,
    CHILL_TOUCH,
    DANCING_LIGHTS,
    DRUIDCRAFT,
    ELDRITCH_BLAST,
    FIRE_BOLT,
    GUIDANCE,
    LIGHT,
    MAGE_HAND,
    MENDING,
    MESSAGE,
    MINOR_ILLUSION,
    POISON_SPRAY,
    PRESTIDIGITATION,
    PRODUCE_FLAME,
    RAY_OF_FROST,
    RESISTANCE,
    SACRED_FLAME,
    SHOCKING_GRASP,
    SPARE_THE_DYING,
    THAUMATURGY,
    TRUE_STRIKE,
    VICIOUS_MOCKERY
];

/**
 * All SRD 1st-level spells
 */
export const SRD_LEVEL_1_SPELLS: DnD5eSpell[] = [
    BLESS,
    BURNING_HANDS,
    CHARM_PERSON,
    CURE_WOUNDS,
    DETECT_MAGIC,
    DISGUISE_SELF,
    FAERIE_FIRE,
    GUIDING_BOLT,
    HEALING_WORD,
    HELLISH_REBUKE,
    HEROISM,
    IDENTIFY,
    INFLICT_WOUNDS,
    MAGE_ARMOR,
    MAGIC_MISSILE,
    PROTECTION_FROM_EVIL_AND_GOOD,
    SANCTUARY,
    SHIELD,
    SHIELD_OF_FAITH,
    SLEEP,
    SPEAK_WITH_ANIMALS,
    THUNDERWAVE
];

/**
 * All SRD spells (cantrips + level 1)
 */
export const SRD_SPELLS: DnD5eSpell[] = [
    ...SRD_CANTRIPS,
    ...SRD_LEVEL_1_SPELLS
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get spell by ID
 */
export function getSpellById(id: string): DnD5eSpell | undefined {
    return SRD_SPELLS.find(spell => spell.id === id);
}

/**
 * Get spells by class
 */
export function getSpellsByClass(className: string): DnD5eSpell[] {
    const normalizedClass = className.toLowerCase();
    return SRD_SPELLS.filter(spell => spell.classes.includes(normalizedClass));
}

/**
 * Get spells by level
 */
export function getSpellsByLevel(level: number): DnD5eSpell[] {
    return SRD_SPELLS.filter(spell => spell.level === level);
}

/**
 * Get cantrips by class
 */
export function getCantripsByClass(className: string): DnD5eSpell[] {
    const normalizedClass = className.toLowerCase();
    return SRD_CANTRIPS.filter(spell => spell.classes.includes(normalizedClass));
}

/**
 * Get 1st-level spells by class
 */
export function getLevel1SpellsByClass(className: string): DnD5eSpell[] {
    const normalizedClass = className.toLowerCase();
    return SRD_LEVEL_1_SPELLS.filter(spell => spell.classes.includes(normalizedClass));
}

/**
 * Get ritual spells by class
 */
export function getRitualSpellsByClass(className: string): DnD5eSpell[] {
    const normalizedClass = className.toLowerCase();
    return SRD_SPELLS.filter(spell =>
        spell.ritual === true && spell.classes.includes(normalizedClass)
    );
}

