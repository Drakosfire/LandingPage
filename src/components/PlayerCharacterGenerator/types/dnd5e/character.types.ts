/**
 * D&D 5e-specific character structure
 * 
 * This module contains ONLY D&D 5th Edition character data.
 * Other systems (Pathfinder, OSR) will have their own parallel type files.
 * 
 * @module CharacterGenerator/types/dnd5e/character
 */

import { CreatureSize, SpeedObject, Alignment } from '../system.types';
import { DnD5eRace } from './race.types';
import { DnD5eClass } from './class.types';
import { DnD5eBackground } from './background.types';
import { DnD5eSpell } from './spell.types';
import { DnD5eEquipmentItem, DnD5eWeapon, DnD5eArmor } from './equipment.types';
import { AbilityBonusChoice } from '../../engine/RuleEngine.types';

/**
 * Complete D&D 5e character
 * Used in Character.dnd5eData field
 */
export interface DnD5eCharacter {
    // ===== ABILITY SCORES (D&D 5e uses 6 standard abilities) =====
    abilityScores: DnD5eAbilityScores;

    // ===== RACE (D&D 5e race/subrace paradigm) =====
    race?: DnD5eRace;

    // ===== FLEXIBLE ABILITY BONUS CHOICES (Half-Elf +1/+1 choice) =====
    flexibleAbilityBonusChoices?: AbilityBonusChoice[];

    // ===== CLASS (array for future multiclassing support) =====
    classes: DnD5eClassLevel[];

    // ===== BACKGROUND (D&D 5e specific concept) =====
    background?: DnD5eBackground;

    // ===== DERIVED STATS (calculated from above) =====
    derivedStats: DnD5eDerivedStats;

    // ===== PROFICIENCIES (D&D 5e skill/save system) =====
    proficiencies: DnD5eProficiencies;

    // ===== EQUIPMENT =====
    equipment: DnD5eEquipmentItem[];
    weapons: DnD5eWeapon[];
    armor?: DnD5eArmor;
    shield?: boolean;

    // ===== ATTUNEMENT (DMG p. 136) =====
    // Most characters can attune to at most 3 magic items
    // Some class features (e.g., Artificer) can increase this
    attunement?: DnD5eAttunement;

    // ===== FEATURES & TRAITS =====
    features: DnD5eFeature[];

    // ===== SPELLCASTING (if applicable) =====
    spellcasting?: DnD5eSpellcasting;

    // ===== PERSONALITY (D&D 5e background system) =====
    personality: DnD5ePersonality;

    // ===== OPTIONAL DETAILS =====
    alignment?: Alignment;
    age?: number;
    height?: string;
    weight?: string;
    eyes?: string;
    skin?: string;
    hair?: string;
    appearance?: string;

    // ===== CURRENCY (D&D 5e uses 5-coin system) =====
    currency: DnD5eCurrency;

    // ===== WIZARD STATE (temporary state during character creation) =====
    /** Equipment choices made during character creation (before finalization) */
    equipmentChoices?: Record<string, number>;
    /** Selected cantrip IDs during character creation */
    selectedCantrips?: string[];
    /** Selected spell IDs during character creation */
    selectedSpells?: string[];
}

/**
 * D&D 5e ability scores
 * Standard 6 abilities (STR, DEX, CON, INT, WIS, CHA)
 * Scores range from 1-20 (rarely exceed 20)
 */
export interface DnD5eAbilityScores {
    strength: number;       // Physical power, melee attacks, athletics
    dexterity: number;      // Agility, AC, initiative, ranged attacks
    constitution: number;   // Health, hit points, stamina
    intelligence: number;   // Reasoning, memory, wizard spellcasting
    wisdom: number;         // Awareness, insight, cleric/druid spellcasting
    charisma: number;       // Force of personality, sorcerer/bard/warlock spellcasting
}

/**
 * D&D 5e derived stats
 * Calculated from ability scores, race, class, and equipment
 */
export interface DnD5eDerivedStats {
    // Combat stats
    armorClass: number;         // AC = armor + DEX mod + shield + bonuses
    initiative: number;          // Initiative = DEX modifier
    proficiencyBonus: number;   // +2 at levels 1-4, +3 at 5-8, etc.
    speed: SpeedObject;          // Movement speeds in feet

    // Hit points
    maxHp: number;               // Max HP = (hit die average + CON mod) per level
    currentHp: number;           // Current HP (for tracking damage)
    tempHp?: number;             // Temporary HP (separate pool)

    // Hit dice (for short rests)
    hitDice: {
        total: number;           // Total hit dice (equals character level)
        current: number;         // Remaining hit dice
        size: number;            // Die size (6, 8, 10, 12) from class
    };

    // Death saves (PHB p. 197)
    // At 0 HP, make a death save each turn
    // 3 successes = stabilize, 3 failures = death
    deathSaves?: {
        successes: number;       // 0-3 successes
        failures: number;        // 0-3 failures
    };

    // Inspiration (PHB p. 125)
    // Granted by DM for good roleplay, can be spent for advantage
    hasInspiration?: boolean;

    // Passive scores
    passivePerception: number;   // 10 + Perception skill modifier
    passiveInvestigation: number; // 10 + Investigation skill modifier
    passiveInsight: number;      // 10 + Insight skill modifier
}

/**
 * D&D 5e proficiencies
 * Skills, saves, armor, weapons, tools, languages
 */
export interface DnD5eProficiencies {
    // Skills (18 total in D&D 5e)
    skills: string[];            // List of proficient skill names

    // Saving throws (2 from class)
    savingThrows: string[];      // Proficient save abilities (e.g., ['strength', 'constitution'])

    // Armor proficiencies
    armor: string[];             // ['light armor', 'medium armor', 'shields']

    // Weapon proficiencies
    weapons: string[];           // ['simple weapons', 'longsword', 'martial weapons']

    // Tool proficiencies
    tools: string[];             // ['smith's tools', 'thieves' tools']

    // Languages
    languages: string[];         // ['Common', 'Dwarvish', 'Elvish']
}

/**
 * Class level entry
 * Supports multiclassing (multiple entries with different class names)
 */
export interface DnD5eClassLevel {
    name: string;                // Class name (e.g., 'Fighter')
    level: number;               // Levels in this class (1-20)
    subclass?: string;           // Subclass/archetype (e.g., 'Champion')
    hitDie: number;              // Hit die size (6, 8, 10, 12)
    features: DnD5eFeature[];    // Features from this class
}

/**
 * Feature/trait
 * From race, class, background, or feats
 */
export interface DnD5eFeature {
    id: string;                  // Unique feature ID
    name: string;                // Feature name
    description: string;         // Full description
    source: 'race' | 'class' | 'background' | 'feat';
    sourceDetails?: string;      // e.g., "Fighter Level 2"
    limitedUse?: {
        maxUses: number;         // Total uses per rest
        currentUses: number;     // Remaining uses
        resetOn: 'short' | 'long' | 'dawn';
    };
}

/**
 * Spellcasting info
 * Only present for spellcasting classes
 */
export interface DnD5eSpellcasting {
    class: string;                // Which class provides spellcasting
    ability: string;              // Spellcasting ability ('intelligence', 'wisdom', 'charisma')
    spellSaveDC: number;          // Spell save DC = 8 + prof + ability mod
    spellAttackBonus: number;     // Spell attack = prof + ability mod

    // Cantrips (unlimited use)
    cantrips: DnD5eSpell[];

    // Spells known/prepared
    spellsKnown: DnD5eSpell[];    // All spells known by character
    spellsPrepared?: string[];    // Spell IDs prepared (for prepared casters)

    // Spell slots
    spellSlots: {
        1: { total: number; used: number };
        2?: { total: number; used: number };
        3?: { total: number; used: number };
        4?: { total: number; used: number };
        5?: { total: number; used: number };
        6?: { total: number; used: number };
        7?: { total: number; used: number };
        8?: { total: number; used: number };
        9?: { total: number; used: number };
    };
}

/**
 * Personality traits from background
 * D&D 5e uses 4-trait system
 */
export interface DnD5ePersonality {
    traits?: string[];    // Personality traits (usually 2)
    ideals?: string[];    // Ideals (usually 1)
    bonds?: string[];     // Bonds (usually 1)
    flaws?: string[];     // Flaws (usually 1)
}

/**
 * D&D 5e currency
 * Standard 5-coin system
 */
export interface DnD5eCurrency {
    cp: number;  // Copper pieces (1 cp)
    sp: number;  // Silver pieces (10 cp = 1 sp)
    ep: number;  // Electrum pieces (50 cp = 5 sp = 1 ep) - rarely used
    gp: number;  // Gold pieces (100 cp = 10 sp = 2 ep = 1 gp)
    pp: number;  // Platinum pieces (1000 cp = 100 sp = 10 gp = 1 pp)
}

/**
 * D&D 5e attunement tracking (DMG p. 136)
 * 
 * Rules:
 * - Most characters can attune to max 3 items
 * - Attunement requires a short rest spent focusing on the item
 * - Only items with requiresAttunement=true count toward the limit
 * - Some class features can increase maxSlots (e.g., Artificer at level 10)
 */
export interface DnD5eAttunement {
    maxSlots: number;           // Usually 3, can be modified by class features
    attunedItemIds: string[];   // Item IDs currently attuned (equipment[].id or weapons[].id)
}

/**
 * Helper: Calculate ability modifier from score
 * Modifier = floor((score - 10) / 2)
 */
export function getAbilityModifier(score: number): number {
    return Math.floor((score - 10) / 2);
}

/**
 * Helper: Get total level from multiclass character
 */
export function getTotalLevel(classes: DnD5eClassLevel[]): number {
    return classes.reduce((total, cls) => total + cls.level, 0);
}

/**
 * Helper: Get proficiency bonus by total level
 */
export function getProficiencyBonus(level: number): number {
    return Math.floor((level - 1) / 4) + 2;
}

/**
 * Empty D&D 5e character template
 */
export function createEmptyDnD5eCharacter(): DnD5eCharacter {
    return {
        abilityScores: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
        },
        race: undefined,  // Will be set in Step 2
        classes: [],
        background: undefined,  // Will be set in Step 4
        derivedStats: {
            armorClass: 10,
            initiative: 0,
            proficiencyBonus: 2,
            speed: { walk: 30 },
            maxHp: 1,
            currentHp: 1,
            hitDice: { total: 1, current: 1, size: 6 },
            deathSaves: { successes: 0, failures: 0 },
            hasInspiration: false,
            passivePerception: 10,
            passiveInvestigation: 10,
            passiveInsight: 10
        },
        proficiencies: {
            skills: [],
            savingThrows: [],
            armor: [],
            weapons: [],
            tools: [],
            languages: []
        },
        equipment: [],
        weapons: [],
        attunement: { maxSlots: 3, attunedItemIds: [] },
        features: [],
        personality: {},
        currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }
    };
}

