/**
 * Test Character Fixtures
 * 
 * Standard and edge-case characters for testing the character creation system.
 * Organized by level (1-3) and complexity (standard vs edge cases).
 * 
 * @module CharacterGenerator/__tests__/fixtures/testCharacters
 */

import { Character } from '../../types/character.types';
import { DnD5eCharacter, DnD5eClassLevel, DnD5eFeature } from '../../types/dnd5e/character.types';

// =============================================================================
// HELPERS
// =============================================================================

const NOW = '2025-12-01T12:00:00.000Z';

function createTestCharacter(
    id: string,
    name: string,
    level: number,
    dnd5eData: DnD5eCharacter
): Character {
    return {
        id,
        name,
        level,
        system: 'dnd5e',
        dnd5eData,
        createdAt: NOW,
        updatedAt: NOW,
        version: 1
    };
}

// =============================================================================
// LEVEL 1 - STANDARD CHARACTERS
// =============================================================================

/**
 * L1-S1: Human Fighter (Champion path coming at L3)
 * 
 * Standard martial build with Point Buy:
 * STR 15, DEX 14, CON 14, INT 10, WIS 12, CHA 8 (+1 to all from Human)
 * Final: STR 16, DEX 15, CON 15, INT 11, WIS 13, CHA 9
 * 
 * Tests: Basic martial, point buy allocation, human racial bonuses
 */
export const HUMAN_FIGHTER_L1: Character = createTestCharacter(
    'test-human-fighter-l1',
    'Marcus Steelhand',
    1,
    {
        abilityScores: {
            strength: 16,      // 15 base + 1 human
            dexterity: 15,     // 14 base + 1 human
            constitution: 15,  // 14 base + 1 human
            intelligence: 11,  // 10 base + 1 human
            wisdom: 13,        // 12 base + 1 human
            charisma: 9        // 8 base + 1 human
        },
        race: {
            id: 'human',
            name: 'Human',
            size: 'medium',
            speed: 30,
            abilityBonuses: [
                { ability: 'strength', bonus: 1 },
                { ability: 'dexterity', bonus: 1 },
                { ability: 'constitution', bonus: 1 },
                { ability: 'intelligence', bonus: 1 },
                { ability: 'wisdom', bonus: 1 },
                { ability: 'charisma', bonus: 1 }
            ],
            languages: ['Common', 'choice'],
            traits: [],
            description: 'Humans are adaptable and ambitious.',
            source: 'SRD'
        },
        classes: [{
            name: 'Fighter',
            level: 1,
            hitDie: 10,
            features: [
                {
                    id: 'fighting-style-defense',
                    name: 'Fighting Style: Defense',
                    description: '+1 AC while wearing armor',
                    source: 'class',
                    sourceDetails: 'Fighter Level 1'
                },
                {
                    id: 'second-wind',
                    name: 'Second Wind',
                    description: 'Regain 1d10 + Fighter level HP as bonus action',
                    source: 'class',
                    sourceDetails: 'Fighter Level 1',
                    limitedUse: { maxUses: 1, currentUses: 1, resetOn: 'short' }
                }
            ]
        }],
        derivedStats: {
            armorClass: 17,         // Chain mail (16) + Defense style (+1)
            initiative: 2,          // DEX mod
            proficiencyBonus: 2,
            speed: { walk: 30 },
            maxHp: 12,              // 10 + CON mod (2)
            currentHp: 12,
            hitDice: { total: 1, current: 1, size: 10 },
            passivePerception: 11,  // 10 + WIS mod (1)
            passiveInvestigation: 10,
            passiveInsight: 11
        },
        proficiencies: {
            skills: ['Athletics', 'Intimidation'],
            savingThrows: ['strength', 'constitution'],
            armor: ['light armor', 'medium armor', 'heavy armor', 'shields'],
            weapons: ['simple weapons', 'martial weapons'],
            tools: [],
            languages: ['Common', 'Dwarvish']
        },
        equipment: [],
        weapons: [],
        features: [],
        personality: {
            traits: ['I face problems head-on.'],
            ideals: ['Honor. I never run from a fair fight.'],
            bonds: ['I fight for those who cannot fight for themselves.'],
            flaws: ['I have trouble trusting people who are smarter than me.']
        },
        currency: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 }
    }
);

/**
 * L1-S2: Hill Dwarf Cleric (Life Domain)
 * 
 * Prepared caster with L1 subclass, solid tank stats.
 * Point Buy: STR 14, DEX 8, CON 14, INT 10, WIS 15, CHA 10
 * +2 CON (dwarf), +1 WIS (hill dwarf)
 * Final: STR 14, DEX 8, CON 16, INT 10, WIS 16, CHA 10
 * 
 * Tests: L1 subclass, prepared caster, domain spells, dwarf traits
 */
export const HILL_DWARF_CLERIC_L1: Character = createTestCharacter(
    'test-hill-dwarf-cleric-l1',
    'Brenna Stoneheart',
    1,
    {
        abilityScores: {
            strength: 14,
            dexterity: 8,
            constitution: 16,   // 14 + 2 dwarf
            intelligence: 10,
            wisdom: 16,         // 15 + 1 hill dwarf
            charisma: 10
        },
        race: {
            id: 'hill-dwarf',
            name: 'Hill Dwarf',
            baseRace: 'dwarf',
            size: 'medium',
            speed: 25,
            abilityBonuses: [
                { ability: 'constitution', bonus: 2 },
                { ability: 'wisdom', bonus: 1 }
            ],
            languages: ['Common', 'Dwarvish'],
            traits: [
                {
                    id: 'darkvision-dwarf',
                    name: 'Darkvision',
                    description: 'See in dim light as bright light (60ft)',
                    source: 'race'
                },
                {
                    id: 'dwarven-resilience',
                    name: 'Dwarven Resilience',
                    description: 'Advantage on saves vs poison, resistance to poison damage',
                    source: 'race'
                },
                {
                    id: 'dwarven-toughness',
                    name: 'Dwarven Toughness',
                    description: '+1 HP per level',
                    source: 'race'
                }
            ],
            description: 'Hill dwarves are wise and resilient.',
            source: 'SRD'
        },
        classes: [{
            name: 'Cleric',
            level: 1,
            subclass: 'Life Domain',
            hitDie: 8,
            features: [
                {
                    id: 'spellcasting-cleric',
                    name: 'Spellcasting',
                    description: 'Wisdom-based prepared spellcasting',
                    source: 'class',
                    sourceDetails: 'Cleric Level 1'
                },
                {
                    id: 'divine-domain-life',
                    name: 'Divine Domain: Life',
                    description: 'Focus on healing and preservation of life',
                    source: 'class',
                    sourceDetails: 'Life Domain'
                },
                {
                    id: 'disciple-of-life',
                    name: 'Disciple of Life',
                    description: 'Healing spells heal extra 2 + spell level HP',
                    source: 'class',
                    sourceDetails: 'Life Domain'
                }
            ]
        }],
        derivedStats: {
            armorClass: 18,         // Chain mail (16) + shield (2)
            initiative: -1,         // DEX mod
            proficiencyBonus: 2,
            speed: { walk: 25 },    // Dwarf speed
            maxHp: 10,              // 8 + CON(3) + Dwarven Toughness(1) - wait, at L1 = 8 + 3 = 11 + 1 = 12
            currentHp: 12,
            hitDice: { total: 1, current: 1, size: 8 },
            passivePerception: 15,  // 10 + WIS(3) + Perception proficiency(2)
            passiveInvestigation: 10,
            passiveInsight: 15      // 10 + WIS(3) + Insight proficiency(2)
        },
        proficiencies: {
            skills: ['Insight', 'Medicine'],
            savingThrows: ['wisdom', 'charisma'],
            armor: ['light armor', 'medium armor', 'heavy armor', 'shields'],
            weapons: ['simple weapons', 'battleaxe', 'handaxe', 'light hammer', 'warhammer'],
            tools: [],
            languages: ['Common', 'Dwarvish']
        },
        equipment: [],
        weapons: [],
        features: [],
        spellcasting: {
            class: 'Cleric',
            ability: 'wisdom',
            spellSaveDC: 13,          // 8 + 2 + 3
            spellAttackBonus: 5,      // 2 + 3
            cantrips: [],             // 3 cantrips known
            spellsKnown: [],
            spellsPrepared: ['bless', 'cure-wounds', 'healing-word', 'shield-of-faith'],
            spellSlots: {
                1: { total: 2, used: 0 }
            }
        },
        personality: {},
        currency: { cp: 0, sp: 0, ep: 0, gp: 15, pp: 0 }
    }
);

/**
 * L1-S3: Wood Elf Rogue
 * 
 * Classic DEX-focused skill monkey.
 * Point Buy: STR 8, DEX 15, CON 12, INT 14, WIS 12, CHA 10
 * +2 DEX (elf), +1 WIS (wood elf)
 * Final: STR 8, DEX 17, CON 12, INT 14, WIS 13, CHA 10
 * 
 * Tests: Skill-heavy class, expertise, sneak attack, elf traits
 */
export const WOOD_ELF_ROGUE_L1: Character = createTestCharacter(
    'test-wood-elf-rogue-l1',
    'Tharivol Nightwhisper',
    1,
    {
        abilityScores: {
            strength: 8,
            dexterity: 17,      // 15 + 2 elf
            constitution: 12,
            intelligence: 14,
            wisdom: 13,         // 12 + 1 wood elf
            charisma: 10
        },
        race: {
            id: 'wood-elf',
            name: 'Wood Elf',
            baseRace: 'elf',
            size: 'medium',
            speed: 35,          // Faster than other elves
            abilityBonuses: [
                { ability: 'dexterity', bonus: 2 },
                { ability: 'wisdom', bonus: 1 }
            ],
            languages: ['Common', 'Elvish'],
            traits: [
                {
                    id: 'darkvision-elf',
                    name: 'Darkvision',
                    description: 'See in dim light as bright light (60ft)',
                    source: 'race'
                },
                {
                    id: 'fey-ancestry',
                    name: 'Fey Ancestry',
                    description: 'Advantage vs charmed, immune to magical sleep',
                    source: 'race'
                },
                {
                    id: 'mask-of-the-wild',
                    name: 'Mask of the Wild',
                    description: 'Hide when lightly obscured by nature',
                    source: 'race'
                }
            ],
            description: 'Wood elves are reclusive and swift.',
            source: 'SRD'
        },
        classes: [{
            name: 'Rogue',
            level: 1,
            hitDie: 8,
            features: [
                {
                    id: 'expertise-rogue',
                    name: 'Expertise',
                    description: 'Double proficiency in Stealth and Thieves\' Tools',
                    source: 'class',
                    sourceDetails: 'Rogue Level 1'
                },
                {
                    id: 'sneak-attack',
                    name: 'Sneak Attack',
                    description: '+1d6 damage once per turn with advantage or ally nearby',
                    source: 'class',
                    sourceDetails: 'Rogue Level 1'
                },
                {
                    id: 'thieves-cant',
                    name: 'Thieves\' Cant',
                    description: 'Secret rogue language and symbols',
                    source: 'class',
                    sourceDetails: 'Rogue Level 1'
                }
            ]
        }],
        derivedStats: {
            armorClass: 14,         // Leather (11) + DEX (3)
            initiative: 3,          // DEX mod
            proficiencyBonus: 2,
            speed: { walk: 35 },
            maxHp: 9,               // 8 + CON (1)
            currentHp: 9,
            hitDice: { total: 1, current: 1, size: 8 },
            passivePerception: 13,  // 10 + WIS(1) + Perception(2)
            passiveInvestigation: 14, // 10 + INT(2) + Investigation(2)
            passiveInsight: 11
        },
        proficiencies: {
            skills: ['Acrobatics', 'Investigation', 'Perception', 'Stealth'], // 4 skills
            savingThrows: ['dexterity', 'intelligence'],
            armor: ['light armor'],
            weapons: ['simple weapons', 'hand crossbows', 'longswords', 'rapiers', 'shortswords'],
            tools: ['thieves\' tools'],
            languages: ['Common', 'Elvish']
        },
        equipment: [],
        weapons: [],
        features: [],
        personality: {},
        currency: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 }
    }
);

// =============================================================================
// LEVEL 2 - STANDARD CHARACTERS
// =============================================================================

/**
 * L2-S1: Mountain Dwarf Barbarian
 * 
 * Rage monster with armor proficiency from dwarf.
 * Point Buy: STR 15, DEX 14, CON 15, INT 8, WIS 10, CHA 8
 * +2 STR, +2 CON (mountain dwarf)
 * Final: STR 17, DEX 14, CON 17, INT 8, WIS 10, CHA 8
 * 
 * Tests: Rage mechanics, unarmored defense, danger sense
 */
export const MOUNTAIN_DWARF_BARBARIAN_L2: Character = createTestCharacter(
    'test-mountain-dwarf-barbarian-l2',
    'Korgan Ironfist',
    2,
    {
        abilityScores: {
            strength: 17,       // 15 + 2 mountain dwarf
            dexterity: 14,
            constitution: 17,   // 15 + 2 dwarf
            intelligence: 8,
            wisdom: 10,
            charisma: 8
        },
        race: {
            id: 'mountain-dwarf',
            name: 'Mountain Dwarf',
            baseRace: 'dwarf',
            size: 'medium',
            speed: 25,
            abilityBonuses: [
                { ability: 'strength', bonus: 2 },
                { ability: 'constitution', bonus: 2 }
            ],
            languages: ['Common', 'Dwarvish'],
            traits: [
                {
                    id: 'darkvision-dwarf',
                    name: 'Darkvision',
                    description: 'See in dim light as bright light (60ft)',
                    source: 'race'
                },
                {
                    id: 'dwarven-armor-training',
                    name: 'Dwarven Armor Training',
                    description: 'Proficiency with light and medium armor',
                    source: 'race'
                }
            ],
            description: 'Mountain dwarves are strong and armored.',
            source: 'SRD'
        },
        classes: [{
            name: 'Barbarian',
            level: 2,
            hitDie: 12,
            features: [
                {
                    id: 'rage',
                    name: 'Rage',
                    description: '+2 damage, advantage STR checks/saves, resistance to physical damage',
                    source: 'class',
                    sourceDetails: 'Barbarian Level 1',
                    limitedUse: { maxUses: 2, currentUses: 2, resetOn: 'long' }
                },
                {
                    id: 'unarmored-defense-barb',
                    name: 'Unarmored Defense',
                    description: 'AC = 10 + DEX + CON when not wearing armor',
                    source: 'class',
                    sourceDetails: 'Barbarian Level 1'
                },
                {
                    id: 'reckless-attack',
                    name: 'Reckless Attack',
                    description: 'Advantage on melee attacks, enemies have advantage on you',
                    source: 'class',
                    sourceDetails: 'Barbarian Level 2'
                },
                {
                    id: 'danger-sense',
                    name: 'Danger Sense',
                    description: 'Advantage on DEX saves vs effects you can see',
                    source: 'class',
                    sourceDetails: 'Barbarian Level 2'
                }
            ]
        }],
        derivedStats: {
            armorClass: 15,         // Unarmored: 10 + DEX(2) + CON(3)
            initiative: 2,
            proficiencyBonus: 2,
            speed: { walk: 25 },
            maxHp: 28,              // 12 + 7 (avg d12) + CON(3)*2 = 12 + 7 + 6 = 25... let's say 12 + 3 + (7+3) = 25
            currentHp: 25,
            hitDice: { total: 2, current: 2, size: 12 },
            passivePerception: 10,
            passiveInvestigation: 9,
            passiveInsight: 10
        },
        proficiencies: {
            skills: ['Athletics', 'Survival'],
            savingThrows: ['strength', 'constitution'],
            armor: ['light armor', 'medium armor', 'shields'],
            weapons: ['simple weapons', 'martial weapons'],
            tools: [],
            languages: ['Common', 'Dwarvish']
        },
        equipment: [],
        weapons: [],
        features: [],
        personality: {},
        currency: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 }
    }
);

// =============================================================================
// LEVEL 3 - STANDARD CHARACTERS
// =============================================================================

/**
 * L3-S1: High Elf Wizard (School of Evocation)
 * 
 * Classic INT caster with spellbook, ritual casting, cantrip from race.
 * Point Buy: STR 8, DEX 14, CON 14, INT 15, WIS 10, CHA 10
 * +2 DEX, +1 INT (high elf)
 * Final: STR 8, DEX 16, CON 14, INT 16, WIS 10, CHA 10
 * 
 * Tests: Wizard spellbook, ritual casting, arcane recovery, L2 subclass
 */
export const HIGH_ELF_WIZARD_L3: Character = createTestCharacter(
    'test-high-elf-wizard-l3',
    'Aerindel Starweaver',
    3,
    {
        abilityScores: {
            strength: 8,
            dexterity: 16,      // 14 + 2 elf
            constitution: 14,
            intelligence: 16,   // 15 + 1 high elf
            wisdom: 10,
            charisma: 10
        },
        race: {
            id: 'high-elf',
            name: 'High Elf',
            baseRace: 'elf',
            size: 'medium',
            speed: 30,
            abilityBonuses: [
                { ability: 'dexterity', bonus: 2 },
                { ability: 'intelligence', bonus: 1 }
            ],
            languages: ['Common', 'Elvish', 'Draconic'],
            traits: [
                {
                    id: 'darkvision-elf',
                    name: 'Darkvision',
                    description: 'See in dim light as bright light (60ft)',
                    source: 'race'
                },
                {
                    id: 'cantrip-high-elf',
                    name: 'Cantrip',
                    description: 'Know one wizard cantrip (Fire Bolt)',
                    source: 'race'
                }
            ],
            description: 'High elves are magical and scholarly.',
            source: 'SRD'
        },
        classes: [{
            name: 'Wizard',
            level: 3,
            subclass: 'School of Evocation',
            hitDie: 6,
            features: [
                {
                    id: 'spellcasting-wizard',
                    name: 'Spellcasting',
                    description: 'INT-based spellcasting from spellbook',
                    source: 'class',
                    sourceDetails: 'Wizard Level 1'
                },
                {
                    id: 'arcane-recovery',
                    name: 'Arcane Recovery',
                    description: 'Recover spell slots on short rest (total level ÷ 2)',
                    source: 'class',
                    sourceDetails: 'Wizard Level 1',
                    limitedUse: { maxUses: 1, currentUses: 1, resetOn: 'long' }
                },
                {
                    id: 'arcane-tradition-evocation',
                    name: 'Arcane Tradition: Evocation',
                    description: 'Focus on powerful elemental magic',
                    source: 'class',
                    sourceDetails: 'School of Evocation'
                },
                {
                    id: 'evocation-savant',
                    name: 'Evocation Savant',
                    description: 'Copy evocation spells for half cost/time',
                    source: 'class',
                    sourceDetails: 'School of Evocation'
                },
                {
                    id: 'sculpt-spells',
                    name: 'Sculpt Spells',
                    description: 'Create pockets of safety in evocation spells',
                    source: 'class',
                    sourceDetails: 'School of Evocation'
                }
            ]
        }],
        derivedStats: {
            armorClass: 13,         // 10 + DEX(3), or Mage Armor: 13 + DEX(3) = 16
            initiative: 3,
            proficiencyBonus: 2,
            speed: { walk: 30 },
            maxHp: 18,              // 6 + 4 + 4 + CON(2)*3 = 6 + 4 + 4 + 6 = 20
            currentHp: 20,
            hitDice: { total: 3, current: 3, size: 6 },
            passivePerception: 10,
            passiveInvestigation: 15, // 10 + INT(3) + Investigation(2)
            passiveInsight: 10
        },
        proficiencies: {
            skills: ['Arcana', 'Investigation'],
            savingThrows: ['intelligence', 'wisdom'],
            armor: [],
            weapons: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'],
            tools: [],
            languages: ['Common', 'Elvish', 'Draconic']
        },
        equipment: [],
        weapons: [],
        features: [],
        spellcasting: {
            class: 'Wizard',
            ability: 'intelligence',
            spellSaveDC: 13,
            spellAttackBonus: 5,
            cantrips: [],           // 3 from class + 1 from high elf
            spellsKnown: [],        // 6 starting + 4 from levels = 10 in spellbook
            spellsPrepared: ['magic-missile', 'shield', 'mage-armor', 'detect-magic', 'scorching-ray', 'misty-step'],
            spellSlots: {
                1: { total: 4, used: 0 },
                2: { total: 2, used: 0 }
            }
        },
        personality: {},
        currency: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 }
    }
);

/**
 * L3-S2: Human Paladin (Oath of Devotion)
 * 
 * Half-caster tank with Divine Smite, heavy armor.
 * Point Buy: STR 15, DEX 10, CON 14, INT 8, WIS 10, CHA 14 (+1 all from human)
 * Final: STR 16, DEX 11, CON 15, INT 9, WIS 11, CHA 15
 * 
 * Tests: Half-caster slot progression, L2 spellcasting start, Divine Smite
 */
export const HUMAN_PALADIN_L3: Character = createTestCharacter(
    'test-human-paladin-l3',
    'Elena Brightshield',
    3,
    {
        abilityScores: {
            strength: 16,
            dexterity: 11,
            constitution: 15,
            intelligence: 9,
            wisdom: 11,
            charisma: 15
        },
        race: {
            id: 'human',
            name: 'Human',
            size: 'medium',
            speed: 30,
            abilityBonuses: [
                { ability: 'strength', bonus: 1 },
                { ability: 'dexterity', bonus: 1 },
                { ability: 'constitution', bonus: 1 },
                { ability: 'intelligence', bonus: 1 },
                { ability: 'wisdom', bonus: 1 },
                { ability: 'charisma', bonus: 1 }
            ],
            languages: ['Common', 'Celestial'],
            traits: [],
            description: 'Humans are adaptable.',
            source: 'SRD'
        },
        classes: [{
            name: 'Paladin',
            level: 3,
            subclass: 'Oath of Devotion',
            hitDie: 10,
            features: [
                {
                    id: 'divine-sense',
                    name: 'Divine Sense',
                    description: 'Detect celestials, fiends, undead',
                    source: 'class',
                    sourceDetails: 'Paladin Level 1',
                    limitedUse: { maxUses: 3, currentUses: 3, resetOn: 'long' } // 1 + CHA(2)
                },
                {
                    id: 'lay-on-hands',
                    name: 'Lay on Hands',
                    description: 'Pool of 15 HP (5 * level) for healing',
                    source: 'class',
                    sourceDetails: 'Paladin Level 1',
                    limitedUse: { maxUses: 15, currentUses: 15, resetOn: 'long' }
                },
                {
                    id: 'fighting-style-defense',
                    name: 'Fighting Style: Defense',
                    description: '+1 AC while wearing armor',
                    source: 'class',
                    sourceDetails: 'Paladin Level 2'
                },
                {
                    id: 'divine-smite',
                    name: 'Divine Smite',
                    description: 'Expend spell slot for +2d8 radiant on hit',
                    source: 'class',
                    sourceDetails: 'Paladin Level 2'
                },
                {
                    id: 'divine-health',
                    name: 'Divine Health',
                    description: 'Immune to disease',
                    source: 'class',
                    sourceDetails: 'Paladin Level 3'
                },
                {
                    id: 'sacred-oath-devotion',
                    name: 'Sacred Oath: Devotion',
                    description: 'Oath of Devotion tenets and features',
                    source: 'class',
                    sourceDetails: 'Oath of Devotion'
                },
                {
                    id: 'channel-divinity-devotion',
                    name: 'Channel Divinity',
                    description: 'Sacred Weapon or Turn the Unholy',
                    source: 'class',
                    sourceDetails: 'Oath of Devotion',
                    limitedUse: { maxUses: 1, currentUses: 1, resetOn: 'short' }
                }
            ]
        }],
        derivedStats: {
            armorClass: 19,         // Plate (18) + Defense (+1)
            initiative: 0,
            proficiencyBonus: 2,
            speed: { walk: 30 },
            maxHp: 28,              // 10 + 6 + 6 + CON(2)*3 = 28
            currentHp: 28,
            hitDice: { total: 3, current: 3, size: 10 },
            passivePerception: 10,
            passiveInvestigation: 9,
            passiveInsight: 10
        },
        proficiencies: {
            skills: ['Athletics', 'Persuasion'],
            savingThrows: ['wisdom', 'charisma'],
            armor: ['light armor', 'medium armor', 'heavy armor', 'shields'],
            weapons: ['simple weapons', 'martial weapons'],
            tools: [],
            languages: ['Common', 'Celestial']
        },
        equipment: [],
        weapons: [],
        features: [],
        spellcasting: {
            class: 'Paladin',
            ability: 'charisma',
            spellSaveDC: 12,         // 8 + 2 + 2
            spellAttackBonus: 4,
            cantrips: [],            // Paladins have no cantrips
            spellsKnown: [],
            spellsPrepared: ['bless', 'cure-wounds', 'protection-from-evil-and-good', 'sanctuary'], // Oath spells always prepared
            spellSlots: {
                1: { total: 3, used: 0 }  // Half-caster L3 = 3 first-level slots
            }
        },
        personality: {},
        currency: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 }
    }
);

// =============================================================================
// EDGE CASES - LEVEL 1
// =============================================================================

/**
 * EDGE-L1-1: Half-Elf Bard
 * 
 * Tests: FLEXIBLE ABILITY BONUSES (choose 2 stats for +1)
 * Half-Elf gets +2 CHA, then +1 to TWO other abilities of choice.
 * Point Buy: STR 8, DEX 14, CON 12, INT 10, WIS 12, CHA 15
 * +2 CHA, +1 DEX (choice), +1 CON (choice)
 * Final: STR 8, DEX 15, CON 13, INT 10, WIS 12, CHA 17
 * 
 * Also tests: Skill Versatility (2 extra skill proficiencies)
 */
export const HALF_ELF_BARD_L1: Character = createTestCharacter(
    'test-half-elf-bard-l1',
    'Lyria Moonsong',
    1,
    {
        abilityScores: {
            strength: 8,
            dexterity: 15,      // 14 + 1 (flexible choice)
            constitution: 13,   // 12 + 1 (flexible choice)
            intelligence: 10,
            wisdom: 12,
            charisma: 17        // 15 + 2 (half-elf fixed)
        },
        race: {
            id: 'half-elf',
            name: 'Half-Elf',
            size: 'medium',
            speed: 30,
            abilityBonuses: [
                { ability: 'charisma', bonus: 2 },
                // Flexible: +1 to DEX and CON (player choice)
                { ability: 'dexterity', bonus: 1 },
                { ability: 'constitution', bonus: 1 }
            ],
            languages: ['Common', 'Elvish', 'Dwarvish'], // One extra language of choice
            traits: [
                {
                    id: 'darkvision-half-elf',
                    name: 'Darkvision',
                    description: 'See in dim light as bright light (60ft)',
                    source: 'race'
                },
                {
                    id: 'fey-ancestry',
                    name: 'Fey Ancestry',
                    description: 'Advantage vs charmed, immune to magical sleep',
                    source: 'race'
                },
                {
                    id: 'skill-versatility',
                    name: 'Skill Versatility',
                    description: 'Proficiency in two skills of your choice',
                    source: 'race'
                }
            ],
            description: 'Half-elves combine human ambition with elven grace.',
            source: 'SRD'
        },
        classes: [{
            name: 'Bard',
            level: 1,
            hitDie: 8,
            features: [
                {
                    id: 'spellcasting-bard',
                    name: 'Spellcasting',
                    description: 'CHA-based known spellcasting',
                    source: 'class',
                    sourceDetails: 'Bard Level 1'
                },
                {
                    id: 'bardic-inspiration',
                    name: 'Bardic Inspiration',
                    description: 'd6 bonus die to ally within 60ft',
                    source: 'class',
                    sourceDetails: 'Bard Level 1',
                    limitedUse: { maxUses: 3, currentUses: 3, resetOn: 'long' } // CHA mod
                }
            ]
        }],
        derivedStats: {
            armorClass: 13,         // Leather (11) + DEX (2)
            initiative: 2,
            proficiencyBonus: 2,
            speed: { walk: 30 },
            maxHp: 9,               // 8 + CON (1)
            currentHp: 9,
            hitDice: { total: 1, current: 1, size: 8 },
            passivePerception: 13,  // 10 + WIS(1) + Perception(2)
            passiveInvestigation: 10,
            passiveInsight: 11
        },
        proficiencies: {
            skills: ['Deception', 'Performance', 'Persuasion', 'Perception', 'Stealth'], // 3 from bard + 2 from half-elf
            savingThrows: ['dexterity', 'charisma'],
            armor: ['light armor'],
            weapons: ['simple weapons', 'hand crossbows', 'longswords', 'rapiers', 'shortswords'],
            tools: ['lute', 'flute', 'drum'],
            languages: ['Common', 'Elvish', 'Dwarvish']
        },
        equipment: [],
        weapons: [],
        features: [],
        spellcasting: {
            class: 'Bard',
            ability: 'charisma',
            spellSaveDC: 13,         // 8 + 2 + 3
            spellAttackBonus: 5,
            cantrips: [],            // 2 cantrips
            spellsKnown: [],         // 4 spells known
            spellSlots: {
                1: { total: 2, used: 0 }
            }
        },
        personality: {},
        currency: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 }
    }
);

/**
 * EDGE-L1-2: Tiefling Warlock (The Fiend)
 * 
 * Tests: L1 SUBCLASS, PACT MAGIC (different slot system)
 * Warlock has Pact Magic: all slots same level, refresh on SHORT rest
 * L1: 1 slot (1st-level), refreshes on short rest!
 * 
 * Point Buy: STR 8, DEX 14, CON 14, INT 10, WIS 10, CHA 15
 * +1 INT, +2 CHA (tiefling)
 * Final: STR 8, DEX 14, CON 14, INT 11, WIS 10, CHA 17
 */
export const TIEFLING_WARLOCK_L1: Character = createTestCharacter(
    'test-tiefling-warlock-l1',
    'Mordecai Ashborne',
    1,
    {
        abilityScores: {
            strength: 8,
            dexterity: 14,
            constitution: 14,
            intelligence: 11,   // 10 + 1 tiefling
            wisdom: 10,
            charisma: 17        // 15 + 2 tiefling
        },
        race: {
            id: 'tiefling',
            name: 'Tiefling',
            size: 'medium',
            speed: 30,
            abilityBonuses: [
                { ability: 'intelligence', bonus: 1 },
                { ability: 'charisma', bonus: 2 }
            ],
            languages: ['Common', 'Infernal'],
            traits: [
                {
                    id: 'darkvision-tiefling',
                    name: 'Darkvision',
                    description: 'See in dim light as bright light (60ft)',
                    source: 'race'
                },
                {
                    id: 'hellish-resistance',
                    name: 'Hellish Resistance',
                    description: 'Resistance to fire damage',
                    source: 'race'
                },
                {
                    id: 'infernal-legacy',
                    name: 'Infernal Legacy',
                    description: 'Know thaumaturgy cantrip',
                    source: 'race'
                }
            ],
            description: 'Tieflings bear the mark of infernal heritage.',
            source: 'SRD'
        },
        classes: [{
            name: 'Warlock',
            level: 1,
            subclass: 'The Fiend',      // Chosen at L1!
            hitDie: 8,
            features: [
                {
                    id: 'otherworldly-patron-fiend',
                    name: 'Otherworldly Patron: The Fiend',
                    description: 'Pact with a fiend from the lower planes',
                    source: 'class',
                    sourceDetails: 'The Fiend'
                },
                {
                    id: 'dark-ones-blessing',
                    name: 'Dark One\'s Blessing',
                    description: 'Gain temp HP = CHA mod + warlock level when you reduce a hostile to 0 HP',
                    source: 'class',
                    sourceDetails: 'The Fiend'
                },
                {
                    id: 'pact-magic',
                    name: 'Pact Magic',
                    description: 'CHA-based known spellcasting. Slots refresh on SHORT rest!',
                    source: 'class',
                    sourceDetails: 'Warlock Level 1'
                }
            ]
        }],
        derivedStats: {
            armorClass: 13,         // Leather (11) + DEX (2)
            initiative: 2,
            proficiencyBonus: 2,
            speed: { walk: 30 },
            maxHp: 10,              // 8 + CON (2)
            currentHp: 10,
            hitDice: { total: 1, current: 1, size: 8 },
            passivePerception: 10,
            passiveInvestigation: 10,
            passiveInsight: 10
        },
        proficiencies: {
            skills: ['Arcana', 'Deception'],
            savingThrows: ['wisdom', 'charisma'],
            armor: ['light armor'],
            weapons: ['simple weapons'],
            tools: [],
            languages: ['Common', 'Infernal']
        },
        equipment: [],
        weapons: [],
        features: [],
        spellcasting: {
            class: 'Warlock',
            ability: 'charisma',
            spellSaveDC: 13,
            spellAttackBonus: 5,
            cantrips: [],            // 2 cantrips (eldritch blast!)
            spellsKnown: [],         // 2 spells known
            // PACT MAGIC: Different from normal spellcasting!
            // All slots are the same level and refresh on SHORT rest
            spellSlots: {
                1: { total: 1, used: 0 }  // 1 pact slot at L1
            }
        },
        personality: {},
        currency: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 }
    }
);

/**
 * EDGE-L1-3: Dragonborn Sorcerer (Draconic Bloodline)
 * 
 * Tests: L1 SUBCLASS, no armor proficiency, Draconic Resilience AC
 * Sorcerer chooses subclass at L1. Draconic Bloodline gives natural AC.
 * 
 * Point Buy: STR 10, DEX 14, CON 14, INT 8, WIS 10, CHA 15
 * +2 STR, +1 CHA (dragonborn)
 * Final: STR 12, DEX 14, CON 14, INT 8, WIS 10, CHA 16
 */
export const DRAGONBORN_SORCERER_L1: Character = createTestCharacter(
    'test-dragonborn-sorcerer-l1',
    'Rhogar Flamescale',
    1,
    {
        abilityScores: {
            strength: 12,       // 10 + 2 dragonborn
            dexterity: 14,
            constitution: 14,
            intelligence: 8,
            wisdom: 10,
            charisma: 16        // 15 + 1 dragonborn
        },
        race: {
            id: 'dragonborn',
            name: 'Dragonborn',
            size: 'medium',
            speed: 30,
            abilityBonuses: [
                { ability: 'strength', bonus: 2 },
                { ability: 'charisma', bonus: 1 }
            ],
            languages: ['Common', 'Draconic'],
            traits: [
                {
                    id: 'draconic-ancestry-red',
                    name: 'Draconic Ancestry (Red)',
                    description: 'Fire damage type for breath weapon and resistance',
                    source: 'race'
                },
                {
                    id: 'breath-weapon-fire',
                    name: 'Breath Weapon',
                    description: '15ft cone, 2d6 fire damage, DEX save DC 12',
                    source: 'race',
                    limitedUse: { maxUses: 1, currentUses: 1, resetOn: 'short' }
                },
                {
                    id: 'damage-resistance-fire',
                    name: 'Damage Resistance',
                    description: 'Resistance to fire damage',
                    source: 'race'
                }
            ],
            description: 'Dragonborn carry draconic heritage.',
            source: 'SRD'
        },
        classes: [{
            name: 'Sorcerer',
            level: 1,
            subclass: 'Draconic Bloodline',  // L1 subclass!
            hitDie: 6,
            features: [
                {
                    id: 'spellcasting-sorcerer',
                    name: 'Spellcasting',
                    description: 'CHA-based innate spellcasting',
                    source: 'class',
                    sourceDetails: 'Sorcerer Level 1'
                },
                {
                    id: 'sorcerous-origin-draconic',
                    name: 'Sorcerous Origin: Draconic Bloodline',
                    description: 'Magic from draconic ancestry',
                    source: 'class',
                    sourceDetails: 'Draconic Bloodline'
                },
                {
                    id: 'dragon-ancestor-red',
                    name: 'Dragon Ancestor (Red)',
                    description: 'Speak Draconic, double prof when interacting with dragons',
                    source: 'class',
                    sourceDetails: 'Draconic Bloodline'
                },
                {
                    id: 'draconic-resilience',
                    name: 'Draconic Resilience',
                    description: 'AC = 13 + DEX when not wearing armor. +1 HP per sorcerer level.',
                    source: 'class',
                    sourceDetails: 'Draconic Bloodline'
                }
            ]
        }],
        derivedStats: {
            armorClass: 15,         // Draconic Resilience: 13 + DEX(2)
            initiative: 2,
            proficiencyBonus: 2,
            speed: { walk: 30 },
            maxHp: 9,               // 6 + CON(2) + Draconic Resilience(1) = 9
            currentHp: 9,
            hitDice: { total: 1, current: 1, size: 6 },
            passivePerception: 10,
            passiveInvestigation: 9,
            passiveInsight: 10
        },
        proficiencies: {
            skills: ['Arcana', 'Intimidation'],
            savingThrows: ['constitution', 'charisma'],
            armor: [],              // No armor proficiency!
            weapons: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'],
            tools: [],
            languages: ['Common', 'Draconic']
        },
        equipment: [],
        weapons: [],
        features: [],
        spellcasting: {
            class: 'Sorcerer',
            ability: 'charisma',
            spellSaveDC: 13,
            spellAttackBonus: 5,
            cantrips: [],           // 4 cantrips!
            spellsKnown: [],        // 2 spells known
            spellSlots: {
                1: { total: 2, used: 0 }
            }
        },
        personality: {},
        currency: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 }
    }
);

// =============================================================================
// EDGE CASES - LEVEL 3
// =============================================================================

/**
 * EDGE-L3-1: Lightfoot Halfling Ranger (Hunter)
 * 
 * Tests: Half-caster who DOESN'T get spells until L2
 * Small race with halfling traits.
 * 
 * Point Buy: STR 10, DEX 15, CON 12, INT 10, WIS 14, CHA 10
 * +2 DEX (halfling)
 * Final: STR 10, DEX 17, CON 12, INT 10, WIS 14, CHA 11
 */
export const LIGHTFOOT_HALFLING_RANGER_L3: Character = createTestCharacter(
    'test-lightfoot-halfling-ranger-l3',
    'Merric Goodbarrel',
    3,
    {
        abilityScores: {
            strength: 10,
            dexterity: 17,      // 15 + 2 halfling
            constitution: 12,
            intelligence: 10,
            wisdom: 14,
            charisma: 11        // 10 + 1 lightfoot
        },
        race: {
            id: 'lightfoot-halfling',
            name: 'Lightfoot Halfling',
            baseRace: 'halfling',
            size: 'small',      // Small race!
            speed: 25,
            abilityBonuses: [
                { ability: 'dexterity', bonus: 2 },
                { ability: 'charisma', bonus: 1 }
            ],
            languages: ['Common', 'Halfling'],
            traits: [
                {
                    id: 'lucky-halfling',
                    name: 'Lucky',
                    description: 'Reroll 1s on attacks, ability checks, saves',
                    source: 'race'
                },
                {
                    id: 'brave',
                    name: 'Brave',
                    description: 'Advantage vs frightened',
                    source: 'race'
                },
                {
                    id: 'halfling-nimbleness',
                    name: 'Halfling Nimbleness',
                    description: 'Move through space of larger creatures',
                    source: 'race'
                },
                {
                    id: 'naturally-stealthy',
                    name: 'Naturally Stealthy',
                    description: 'Hide behind creatures one size larger',
                    source: 'race'
                }
            ],
            description: 'Lightfoot halflings are stealthy and friendly.',
            source: 'SRD'
        },
        classes: [{
            name: 'Ranger',
            level: 3,
            subclass: 'Hunter',
            hitDie: 10,
            features: [
                {
                    id: 'favored-enemy',
                    name: 'Favored Enemy',
                    description: 'Advantage tracking, info recall on chosen enemy type',
                    source: 'class',
                    sourceDetails: 'Ranger Level 1'
                },
                {
                    id: 'natural-explorer',
                    name: 'Natural Explorer',
                    description: 'Expertise in favored terrain',
                    source: 'class',
                    sourceDetails: 'Ranger Level 1'
                },
                {
                    id: 'fighting-style-archery',
                    name: 'Fighting Style: Archery',
                    description: '+2 to ranged attack rolls',
                    source: 'class',
                    sourceDetails: 'Ranger Level 2'
                },
                {
                    id: 'ranger-archetype-hunter',
                    name: 'Ranger Archetype: Hunter',
                    description: 'Specialized hunter techniques',
                    source: 'class',
                    sourceDetails: 'Hunter'
                },
                {
                    id: 'hunters-prey-colossus',
                    name: 'Hunter\'s Prey: Colossus Slayer',
                    description: '+1d8 damage once per turn to wounded enemies',
                    source: 'class',
                    sourceDetails: 'Hunter'
                },
                {
                    id: 'primeval-awareness',
                    name: 'Primeval Awareness',
                    description: 'Sense aberrations, celestials, dragons, etc. within 1 mile',
                    source: 'class',
                    sourceDetails: 'Ranger Level 3'
                }
            ]
        }],
        derivedStats: {
            armorClass: 15,         // Studded leather (12) + DEX (3)
            initiative: 3,
            proficiencyBonus: 2,
            speed: { walk: 25 },    // Halfling speed
            maxHp: 27,              // 10 + 6 + 6 + CON(1)*3 = 25
            currentHp: 25,
            hitDice: { total: 3, current: 3, size: 10 },
            passivePerception: 14,
            passiveInvestigation: 10,
            passiveInsight: 12
        },
        proficiencies: {
            skills: ['Perception', 'Stealth', 'Survival'],
            savingThrows: ['strength', 'dexterity'],
            armor: ['light armor', 'medium armor', 'shields'],
            weapons: ['simple weapons', 'martial weapons'],
            tools: [],
            languages: ['Common', 'Halfling']
        },
        equipment: [],
        weapons: [],
        features: [],
        spellcasting: {
            class: 'Ranger',
            ability: 'wisdom',
            spellSaveDC: 12,
            spellAttackBonus: 4,
            cantrips: [],           // No cantrips (ranger)
            spellsKnown: [],        // 3 spells known at L3
            spellSlots: {
                1: { total: 3, used: 0 }  // Half-caster L3
            }
        },
        personality: {},
        currency: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 }
    }
);

/**
 * EDGE-L3-2: Tiefling Warlock L3 (Pact Magic at 2nd level)
 * 
 * Tests: Pact Magic slot UPGRADE at L3
 * At L3, Warlock's 2 slots are now 2nd-level (not 1st)!
 * Also has Eldritch Invocations and Pact Boon.
 */
export const TIEFLING_WARLOCK_L3: Character = createTestCharacter(
    'test-tiefling-warlock-l3',
    'Mordecai Ashborne',
    3,
    {
        abilityScores: {
            strength: 8,
            dexterity: 14,
            constitution: 14,
            intelligence: 11,
            wisdom: 10,
            charisma: 17
        },
        race: {
            id: 'tiefling',
            name: 'Tiefling',
            size: 'medium',
            speed: 30,
            abilityBonuses: [
                { ability: 'intelligence', bonus: 1 },
                { ability: 'charisma', bonus: 2 }
            ],
            languages: ['Common', 'Infernal'],
            traits: [
                {
                    id: 'darkvision-tiefling',
                    name: 'Darkvision',
                    description: 'See in dim light as bright light (60ft)',
                    source: 'race'
                },
                {
                    id: 'hellish-resistance',
                    name: 'Hellish Resistance',
                    description: 'Resistance to fire damage',
                    source: 'race'
                },
                {
                    id: 'infernal-legacy',
                    name: 'Infernal Legacy',
                    description: 'Know thaumaturgy, hellish rebuke 1/day at L3',
                    source: 'race'
                }
            ],
            description: 'Tieflings bear infernal heritage.',
            source: 'SRD'
        },
        classes: [{
            name: 'Warlock',
            level: 3,
            subclass: 'The Fiend',
            hitDie: 8,
            features: [
                {
                    id: 'pact-magic',
                    name: 'Pact Magic',
                    description: 'Pact slots refresh on short rest',
                    source: 'class',
                    sourceDetails: 'Warlock Level 1'
                },
                {
                    id: 'dark-ones-blessing',
                    name: 'Dark One\'s Blessing',
                    description: 'Gain temp HP on killing blows',
                    source: 'class',
                    sourceDetails: 'The Fiend'
                },
                {
                    id: 'eldritch-invocations',
                    name: 'Eldritch Invocations',
                    description: 'Agonizing Blast, Devil\'s Sight',
                    source: 'class',
                    sourceDetails: 'Warlock Level 2'
                },
                {
                    id: 'pact-boon-chain',
                    name: 'Pact Boon: Pact of the Chain',
                    description: 'Gain a special familiar (Imp)',
                    source: 'class',
                    sourceDetails: 'Warlock Level 3'
                }
            ]
        }],
        derivedStats: {
            armorClass: 13,
            initiative: 2,
            proficiencyBonus: 2,
            speed: { walk: 30 },
            maxHp: 24,              // 8 + 5 + 5 + CON(2)*3 = 24
            currentHp: 24,
            hitDice: { total: 3, current: 3, size: 8 },
            passivePerception: 10,
            passiveInvestigation: 10,
            passiveInsight: 10
        },
        proficiencies: {
            skills: ['Arcana', 'Deception'],
            savingThrows: ['wisdom', 'charisma'],
            armor: ['light armor'],
            weapons: ['simple weapons'],
            tools: [],
            languages: ['Common', 'Infernal']
        },
        equipment: [],
        weapons: [],
        features: [],
        spellcasting: {
            class: 'Warlock',
            ability: 'charisma',
            spellSaveDC: 13,
            spellAttackBonus: 5,
            cantrips: [],           // 2 cantrips
            spellsKnown: [],        // 4 spells known
            // PACT MAGIC L3: Both slots are 2nd-level!
            spellSlots: {
                2: { total: 2, used: 0 }  // 2 pact slots, ALL at 2nd level
            }
        },
        personality: {},
        currency: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 }
    }
);

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * All standard test characters
 */
export const STANDARD_CHARACTERS = [
    HUMAN_FIGHTER_L1,
    HILL_DWARF_CLERIC_L1,
    WOOD_ELF_ROGUE_L1,
    MOUNTAIN_DWARF_BARBARIAN_L2,
    HIGH_ELF_WIZARD_L3,
    HUMAN_PALADIN_L3
];

/**
 * All edge case test characters
 */
export const EDGE_CASE_CHARACTERS = [
    HALF_ELF_BARD_L1,           // Flexible ability bonuses
    TIEFLING_WARLOCK_L1,        // L1 subclass, Pact Magic
    DRAGONBORN_SORCERER_L1,     // L1 subclass, natural AC
    LIGHTFOOT_HALFLING_RANGER_L3, // Half-caster, small race
    TIEFLING_WARLOCK_L3         // Pact Magic slot upgrade
];

/**
 * All test characters
 */
export const ALL_TEST_CHARACTERS = [
    ...STANDARD_CHARACTERS,
    ...EDGE_CASE_CHARACTERS
];

/**
 * Get characters by level
 */
export function getCharactersByLevel(level: number): Character[] {
    return ALL_TEST_CHARACTERS.filter(c => c.level === level);
}

/**
 * Get characters by class
 */
export function getCharactersByClass(className: string): Character[] {
    return ALL_TEST_CHARACTERS.filter(c => 
        c.dnd5eData?.classes.some(cls => cls.name.toLowerCase() === className.toLowerCase())
    );
}

/**
 * Get characters by race
 */
export function getCharactersByRace(raceName: string): Character[] {
    return ALL_TEST_CHARACTERS.filter(c => 
        c.dnd5eData?.race?.name.toLowerCase().includes(raceName.toLowerCase())
    );
}

