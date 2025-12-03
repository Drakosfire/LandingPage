/**
 * Demo Character: Human Fighter Level 1
 * 
 * Complete character data for canvas component testing.
 * This is the canonical "test the pipes" character - if the canvas can render
 * this character correctly, the data model is validated.
 * 
 * Based on: HUMAN_FIGHTER_L1 test fixture
 * Purpose: Canvas development and visual testing
 * 
 * @module PlayerCharacterGenerator/canvasComponents/demoData/DEMO_FIGHTER
 */

import { Character } from '../../types/character.types';
import { DnD5eCharacter } from '../../types/dnd5e/character.types';

const NOW = new Date().toISOString();

/**
 * Complete D&D 5e data for Marcus Steelhand
 * Human Fighter Level 1 with Soldier background
 */
const dnd5eData: DnD5eCharacter = {
    // ===== ABILITY SCORES =====
    // Point Buy: STR 15, DEX 14, CON 14, INT 10, WIS 12, CHA 8
    // +1 to all from Human
    abilityScores: {
        strength: 16,      // 15 + 1 human
        dexterity: 15,     // 14 + 1 human  
        constitution: 15,  // 14 + 1 human
        intelligence: 11,  // 10 + 1 human
        wisdom: 13,        // 12 + 1 human
        charisma: 9        // 8 + 1 human
    },

    // ===== RACE =====
    race: {
        id: 'human',
        name: 'Human',
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
        languages: ['Common', 'Dwarvish'],
        traits: [],
        description: 'Humans are the most adaptable and ambitious people among the common races.',
        source: 'SRD'
    },

    // ===== CLASS =====
    classes: [{
        name: 'Fighter',
        level: 1,
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
                description: 'On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level. Once you use this feature, you must finish a short or long rest before you can use it again.',
                source: 'class',
                sourceDetails: 'Fighter Level 1',
                limitedUse: { maxUses: 1, currentUses: 1, resetOn: 'short' }
            }
        ]
    }],

    // ===== BACKGROUND =====
    background: {
        id: 'soldier',
        name: 'Soldier',
        description: 'War has been your life for as long as you care to remember.',
        skillProficiencies: ['Athletics', 'Intimidation'],
        toolProficiencies: ['Gaming set', 'Vehicles (land)'],
        equipment: [
            'An insignia of rank',
            'A trophy taken from a fallen enemy',
            'A set of bone dice or deck of cards',
            'A set of common clothes',
            '10 gp'
        ],
        startingGold: 10,
        feature: {
            id: 'military-rank',
            name: 'Military Rank',
            description: 'You have a military rank from your career as a soldier. Soldiers loyal to your former military organization still recognize your authority and influence.',
            source: 'background'
        },
        suggestedCharacteristics: {
            traits: [
                'I face problems head-on. A simple, direct solution is the best path to success.',
                'I can stare down a hell hound without flinching.'
            ],
            ideals: ['Honor. I never run from a fair fight.'],
            bonds: ['I fight for those who cannot fight for themselves.'],
            flaws: ['I have trouble trusting people who are smarter than me.']
        },
        source: 'SRD'
    },

    // ===== DERIVED STATS =====
    derivedStats: {
        armorClass: 17,         // Chain mail (16) + Defense style (+1)
        initiative: 2,          // DEX modifier (+2)
        proficiencyBonus: 2,    // Level 1-4 = +2
        speed: { walk: 30 },
        maxHp: 12,              // 10 (hit die max) + 2 (CON mod)
        currentHp: 12,
        hitDice: { total: 1, current: 1, size: 10 },
        passivePerception: 11,  // 10 + WIS mod (+1)
        passiveInvestigation: 10, // 10 + INT mod (+0)
        passiveInsight: 11      // 10 + WIS mod (+1)
    },

    // ===== PROFICIENCIES =====
    proficiencies: {
        skills: ['Athletics', 'Intimidation'],  // Fighter: 2 from list + Soldier background
        savingThrows: ['strength', 'constitution'],
        armor: ['Light armor', 'Medium armor', 'Heavy armor', 'Shields'],
        weapons: ['Simple weapons', 'Martial weapons'],
        tools: ['Gaming set', 'Vehicles (land)'],
        languages: ['Common', 'Dwarvish']
    },

    // ===== EQUIPMENT =====
    equipment: [
        { id: 'explorers-pack', name: "Explorer's Pack", type: 'adventuring gear', quantity: 1, weight: 59 },
        { id: 'insignia-of-rank', name: 'Insignia of Rank', type: 'trinket', quantity: 1, weight: 0 },
        { id: 'trophy', name: 'Trophy from fallen enemy', type: 'trinket', quantity: 1, weight: 0 },
        { id: 'bone-dice', name: 'Set of bone dice', type: 'gaming set', quantity: 1, weight: 0 },
        { id: 'common-clothes', name: 'Common Clothes', type: 'adventuring gear', quantity: 1, weight: 3 }
    ],

    weapons: [
        {
            id: 'longsword',
            name: 'Longsword',
            type: 'weapon',
            weaponCategory: 'martial',
            weaponType: 'melee',
            damage: '1d8',
            damageType: 'slashing',
            properties: ['versatile'],
            weight: 3,
            quantity: 1
        },
        {
            id: 'handaxe-1',
            name: 'Handaxe',
            type: 'weapon',
            weaponCategory: 'simple',
            weaponType: 'melee',
            damage: '1d6',
            damageType: 'slashing',
            properties: ['light', 'thrown'],
            range: { normal: 20, long: 60 },
            weight: 2,
            quantity: 1
        },
        {
            id: 'handaxe-2',
            name: 'Handaxe',
            type: 'weapon',
            weaponCategory: 'simple',
            weaponType: 'melee',
            damage: '1d6',
            damageType: 'slashing',
            properties: ['light', 'thrown'],
            range: { normal: 20, long: 60 },
            weight: 2,
            quantity: 1
        }
    ],

    armor: {
        id: 'chain-mail',
        name: 'Chain Mail',
        type: 'armor',
        armorCategory: 'heavy',
        armorClass: 16,
        addDexMod: false,
        stealthDisadvantage: true,
        strengthRequirement: 13,
        weight: 55,
        quantity: 1
    },

    shield: true,

    // ===== FEATURES =====
    // Class features are in classes[].features, these are collected racial/background features
    features: [
        {
            id: 'military-rank',
            name: 'Military Rank',
            description: 'You have a military rank from your career as a soldier. Soldiers loyal to your former military organization still recognize your authority and influence.',
            source: 'background',
            sourceDetails: 'Soldier'
        }
    ],

    // ===== PERSONALITY =====
    personality: {
        traits: [
            'I face problems head-on. A simple, direct solution is the best path to success.',
            'I can stare down a hell hound without flinching.'
        ],
        ideals: ['Honor. I never run from a fair fight.'],
        bonds: ['I fight for those who cannot fight for themselves.'],
        flaws: ['I have trouble trusting people who are smarter than me.']
    },

    // ===== OPTIONAL DETAILS =====
    alignment: 'lawful good',
    age: 28,
    height: '6\'1"',
    weight: '195 lbs',
    eyes: 'Brown',
    skin: 'Tan',
    hair: 'Black, cropped short',
    appearance: 'A tall, broad-shouldered man with the bearing of a soldier. His arms bear the scars of many battles.',

    // ===== CURRENCY =====
    currency: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 }
};

/**
 * Complete Character wrapper for canvas testing
 */
export const DEMO_FIGHTER: Character = {
    id: 'demo-fighter-marcus-steelhand',
    name: 'Marcus Steelhand',
    level: 1,
    system: 'dnd5e',
    dnd5eData,
    createdAt: NOW,
    updatedAt: NOW,
    version: 1
};

/**
 * Export just the D&D 5e data for components that only need that
 */
export const DEMO_FIGHTER_DATA = dnd5eData;

/**
 * Export a function to get a fresh copy (useful for tests that mutate)
 */
export function createDemoFighter(): Character {
    return JSON.parse(JSON.stringify(DEMO_FIGHTER));
}

export default DEMO_FIGHTER;

