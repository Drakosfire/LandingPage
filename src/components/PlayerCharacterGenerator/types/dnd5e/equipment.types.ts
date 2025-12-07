/**
 * D&D 5e equipment types
 * 
 * Defines equipment, weapon, and armor structures for D&D 5th Edition.
 * 
 * @module CharacterGenerator/types/dnd5e/equipment
 */

import { DamageType } from '../system.types';

/**
 * Magic item rarity (DMG p. 135)
 */
export type MagicItemRarity =
    | 'common'
    | 'uncommon'
    | 'rare'
    | 'very rare'
    | 'legendary'
    | 'artifact';

/**
 * Equipment type categories
 * Used to classify items for inventory organization and filtering
 */
export type EquipmentType =
    | 'weapon'              // Swords, bows, etc. (extends to DnD5eWeapon)
    | 'armor'               // Body armor (extends to DnD5eArmor)
    | 'shield'              // Shields (extends to DnD5eShield)
    | 'tool'                // Tools requiring proficiency (extends to DnD5eTool)
    | 'gaming set'          // Dice, cards, dragonchess, etc. (tool subcategory)
    | 'musical instrument'  // Lute, flute, drum, etc. (tool subcategory)
    | 'adventuring gear'    // Rope, torches, backpacks, etc.
    | 'consumable'          // Potions, scrolls, ammunition, food/rations
    | 'treasure'            // Gems, art objects, trade goods, valuables
    | 'trinket'             // Background trinkets, keepsakes, mementos
    | 'container'           // Backpacks, pouches, bags of holding
    | 'mount'               // Horses, vehicles, exotic mounts
    | 'wondrous item'       // Magic items that don't fit other categories
    | 'other';              // Catch-all for uncategorized items

/**
 * Base equipment item
 */
export interface DnD5eEquipmentItem {
    id: string;                      // Unique item ID (e.g., 'rope-hempen-50ft')
    name: string;                    // Item name (e.g., 'Rope, hempen (50 feet)')
    type: EquipmentType;             // Item category (type-safe union)
    quantity: number;                // Number of items
    weight?: number;                 // Weight in pounds (per item)
    value?: number;                  // Value in gold pieces (per item)
    description?: string;            // Item description

    // Magic item properties (isMagical ≠ requiresAttunement)
    // e.g., Potion of Healing is magical but doesn't require attunement
    isMagical?: boolean;             // Whether this is a magic item
    requiresAttunement?: boolean;    // Whether attunement is required to use
    rarity?: MagicItemRarity;        // Magic item rarity tier

    // Optional visual
    imageUrl?: string;               // URL to item image
}

/**
 * Weapon
 */
export interface DnD5eWeapon extends DnD5eEquipmentItem {
    type: 'weapon';
    weaponCategory: 'simple' | 'martial';
    weaponType: 'melee' | 'ranged';

    // Damage
    damage: string;                  // Damage dice (e.g., '1d8', '2d6')
    damageType: DamageType;          // Type of damage

    // Properties
    properties: WeaponProperty[];    // Weapon properties

    // Range (for ranged weapons)
    range?: {
        normal: number;              // Normal range in feet
        long?: number;               // Long range in feet (with disadvantage)
    };
}

/**
 * Weapon properties
 */
export type WeaponProperty =
    | 'ammunition'
    | 'finesse'
    | 'heavy'
    | 'light'
    | 'loading'
    | 'range'
    | 'reach'
    | 'special'
    | 'thrown'
    | 'two-handed'
    | 'versatile';

/**
 * Armor
 */
export interface DnD5eArmor extends DnD5eEquipmentItem {
    type: 'armor';
    armorCategory: 'light' | 'medium' | 'heavy';

    // AC calculation
    armorClass: number;              // Base AC (e.g., 16 for chain mail)
    addDexMod?: boolean;             // Whether to add DEX modifier
    maxDexBonus?: number;            // Max DEX bonus (e.g., 2 for medium armor)

    // Requirements and penalties
    strengthRequirement?: number;    // Minimum STR required
    stealthDisadvantage?: boolean;   // Gives disadvantage on Stealth checks
}

/**
 * Shield (special armor item)
 */
export interface DnD5eShield extends DnD5eEquipmentItem {
    type: 'shield';
    acBonus: number;                 // AC bonus (usually +2)
}

/**
 * Tool
 */
export interface DnD5eTool extends DnD5eEquipmentItem {
    type: 'tool';
    toolCategory: 'artisan' | 'gaming' | 'musical' | 'other';
    requiresProficiency?: boolean;   // Whether proficiency is needed to use
}

/**
 * Helper: Calculate AC from armor
 */
export function calculateArmorClass(
    armor: DnD5eArmor | undefined,
    dexModifier: number,
    hasShield: boolean
): number {
    if (!armor) {
        // Unarmored: 10 + DEX modifier
        return 10 + dexModifier;
    }

    let ac = armor.armorClass;

    // Add DEX modifier if applicable
    if (armor.addDexMod) {
        const dexBonus = armor.maxDexBonus
            ? Math.min(dexModifier, armor.maxDexBonus)
            : dexModifier;
        ac += dexBonus;
    }

    // Add shield bonus
    if (hasShield) {
        ac += 2;
    }

    return ac;
}

/**
 * Helper: Check if character can wear armor (STR requirement)
 */
export function canWearArmor(armor: DnD5eArmor, strengthScore: number): boolean {
    if (!armor.strengthRequirement) {
        return true;
    }
    return strengthScore >= armor.strengthRequirement;
}

/**
 * Helper: Get weapon attack ability
 */
export function getWeaponAbility(weapon: DnD5eWeapon): 'strength' | 'dexterity' {
    // Finesse weapons can use STR or DEX (player chooses, default to DEX)
    if (weapon.properties.includes('finesse')) {
        return 'dexterity';
    }

    // Ranged weapons use DEX
    if (weapon.weaponType === 'ranged') {
        return 'dexterity';
    }

    // Melee weapons use STR
    return 'strength';
}

