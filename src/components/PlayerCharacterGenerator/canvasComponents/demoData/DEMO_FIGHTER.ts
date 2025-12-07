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
        armorClass: 19,         // Chain mail (16) + Shield (+2) + Defense style (+1) + Cloak of Protection (+1) = 20, but let's say 19 without shield equipped
        initiative: 2,          // DEX modifier (+2)
        proficiencyBonus: 2,    // Level 1-4 = +2
        speed: { walk: 30 },
        maxHp: 12,              // 10 (hit die max) + 2 (CON mod)
        currentHp: 9,           // Took some damage for realism
        tempHp: 0,
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
    // Adventuring Gear
    equipment: [
        // Adventuring Gear (from Explorer's Pack, detailed)
        { id: 'backpack', name: 'Backpack', type: 'container', quantity: 1, weight: 5, value: 2 },
        { id: 'bedroll', name: 'Bedroll', type: 'adventuring gear', quantity: 1, weight: 7, value: 1 },
        { id: 'mess-kit', name: 'Mess Kit', type: 'adventuring gear', quantity: 1, weight: 1, value: 0.2 },
        { id: 'tinderbox', name: 'Tinderbox', type: 'adventuring gear', quantity: 1, weight: 1, value: 0.5 },
        { id: 'torches', name: 'Torch', type: 'adventuring gear', quantity: 10, weight: 1, value: 0.01 },
        { id: 'rations', name: 'Rations (1 day)', type: 'consumable', quantity: 10, weight: 2, value: 0.5 },
        { id: 'waterskin', name: 'Waterskin', type: 'adventuring gear', quantity: 1, weight: 5, value: 0.2 },
        { id: 'rope-hempen', name: 'Rope, hempen (50 feet)', type: 'adventuring gear', quantity: 1, weight: 10, value: 1 },
        { id: 'grappling-hook', name: 'Grappling Hook', type: 'adventuring gear', quantity: 1, weight: 4, value: 2 },
        { id: 'crowbar', name: 'Crowbar', type: 'adventuring gear', quantity: 1, weight: 5, value: 2 },
        { id: 'hammer', name: 'Hammer', type: 'adventuring gear', quantity: 1, weight: 3, value: 1 },
        { id: 'pitons', name: 'Piton', type: 'adventuring gear', quantity: 10, weight: 0.25, value: 0.05 },

        // Trinkets & Background Items
        { id: 'insignia-of-rank', name: 'Insignia of Rank', type: 'trinket', quantity: 1, weight: 0 },
        { id: 'trophy', name: 'Trophy from fallen enemy (broken blade)', type: 'trinket', quantity: 1, weight: 1 },
        { id: 'bone-dice', name: 'Set of bone dice', type: 'gaming set', quantity: 1, weight: 0 },
        { id: 'common-clothes', name: 'Common Clothes', type: 'adventuring gear', quantity: 1, weight: 3, value: 0.5 },
        { id: 'letter-commendation', name: 'Letter of Commendation', type: 'trinket', quantity: 1, weight: 0 },

        // Consumables
        { id: 'potion-healing-1', name: 'Potion of Healing', type: 'consumable', quantity: 1, weight: 0.5, value: 50, isMagical: true, rarity: 'common', description: 'Regain 2d4+2 HP' },
        { id: 'potion-healing-2', name: 'Potion of Healing', type: 'consumable', quantity: 1, weight: 0.5, value: 50, isMagical: true, rarity: 'common', description: 'Regain 2d4+2 HP' },
        { id: 'antitoxin', name: 'Antitoxin (vial)', type: 'consumable', quantity: 2, weight: 0, value: 50, description: 'Advantage vs poison for 1 hour' },
        { id: 'holy-water', name: 'Holy Water (flask)', type: 'consumable', quantity: 3, weight: 1, value: 25, description: '2d6 radiant to fiends/undead' },
        { id: 'healers-kit', name: "Healer's Kit", type: 'consumable', quantity: 1, weight: 3, value: 5, description: '10 uses remaining' },
        { id: 'oil-flask', name: 'Oil (flask)', type: 'consumable', quantity: 2, weight: 1, value: 0.1 },

        // Treasure & Valuables
        { id: 'gold-ring-ruby', name: 'Gold Ring with Ruby', type: 'treasure', quantity: 1, weight: 0, value: 250, description: 'Taken from bandit leader' },
        { id: 'silver-candlesticks', name: 'Silver Candlesticks (pair)', type: 'treasure', quantity: 1, weight: 2, value: 50, description: 'Salvaged from ruins' },
        { id: 'pearl', name: 'Pearl', type: 'treasure', quantity: 1, weight: 0, value: 100 },
        { id: 'deed-tower', name: 'Deed to Abandoned Tower', type: 'treasure', quantity: 1, weight: 0, description: 'Legal ownership unclear' },

        // Magic Items (non-weapon/armor)
        { id: 'cloak-protection', name: 'Cloak of Protection', type: 'wondrous item', quantity: 1, weight: 1, isMagical: true, requiresAttunement: true, rarity: 'uncommon', description: '+1 to AC and saving throws while attuned' },
        { id: 'scroll-revivify', name: 'Spell Scroll (Revivify)', type: 'consumable', quantity: 1, weight: 0, isMagical: true, rarity: 'uncommon', description: '3rd level cleric spell' },
        { id: 'potion-climbing', name: 'Potion of Climbing', type: 'consumable', quantity: 1, weight: 0.5, value: 180, isMagical: true, rarity: 'common', description: 'Climbing speed = walking speed for 1 hour' },

        // Other/Miscellaneous
        { id: 'whetstone', name: 'Whetstone', type: 'adventuring gear', quantity: 1, weight: 1, value: 0.01 },
        { id: 'map-region', name: 'Map of the Region', type: 'other', quantity: 1, weight: 0, description: 'Shows local villages and roads' },
        { id: 'wanted-poster', name: 'Wanted Poster (Bandit King)', type: 'other', quantity: 1, weight: 0, description: 'Reward: 500gp' }
    ],

    weapons: [
        // Magic weapon (attuned)
        {
            id: 'longsword-plus1',
            name: '+1 Longsword',
            type: 'weapon',
            weaponCategory: 'martial',
            weaponType: 'melee',
            damage: '1d8+1',
            damageType: 'slashing',
            properties: ['versatile'],
            weight: 3,
            quantity: 1,
            isMagical: true,
            requiresAttunement: true,
            rarity: 'uncommon',
            description: '+1 to attack and damage rolls'
        },
        // Regular weapons
        {
            id: 'javelin-1',
            name: 'Javelin',
            type: 'weapon',
            weaponCategory: 'simple',
            weaponType: 'melee',
            damage: '1d6',
            damageType: 'piercing',
            properties: ['thrown'],
            range: { normal: 30, long: 120 },
            weight: 2,
            quantity: 1,
            value: 0.5
        },
        {
            id: 'javelin-2',
            name: 'Javelin',
            type: 'weapon',
            weaponCategory: 'simple',
            weaponType: 'melee',
            damage: '1d6',
            damageType: 'piercing',
            properties: ['thrown'],
            range: { normal: 30, long: 120 },
            weight: 2,
            quantity: 1,
            value: 0.5
        },
        {
            id: 'javelin-3',
            name: 'Javelin',
            type: 'weapon',
            weaponCategory: 'simple',
            weaponType: 'melee',
            damage: '1d6',
            damageType: 'piercing',
            properties: ['thrown'],
            range: { normal: 30, long: 120 },
            weight: 2,
            quantity: 1,
            value: 0.5
        },
        {
            id: 'handaxe',
            name: 'Handaxe',
            type: 'weapon',
            weaponCategory: 'simple',
            weaponType: 'melee',
            damage: '1d6',
            damageType: 'slashing',
            properties: ['light', 'thrown'],
            range: { normal: 20, long: 60 },
            weight: 2,
            quantity: 2,
            value: 5
        },
        {
            id: 'light-crossbow',
            name: 'Light Crossbow',
            type: 'weapon',
            weaponCategory: 'simple',
            weaponType: 'ranged',
            damage: '1d8',
            damageType: 'piercing',
            properties: ['ammunition', 'loading', 'two-handed'],
            range: { normal: 80, long: 320 },
            weight: 5,
            quantity: 1,
            value: 25
        },
        {
            id: 'crossbow-bolts',
            name: 'Crossbow Bolts',
            type: 'weapon',
            weaponCategory: 'simple',
            weaponType: 'ranged',
            damage: '',
            damageType: 'piercing',
            properties: ['ammunition'],
            weight: 1.5,
            quantity: 20,
            value: 1,
            description: 'Ammunition for crossbow'
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
        quantity: 1,
        value: 75
    },

    shield: true,

    // ===== ATTUNEMENT =====
    attunement: {
        maxSlots: 3,
        attunedItemIds: ['longsword-plus1', 'cloak-protection']  // 2 of 3 slots used
    },

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
    // More realistic adventurer wealth for testing
    currency: { cp: 45, sp: 120, ep: 5, gp: 347, pp: 12 }
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

