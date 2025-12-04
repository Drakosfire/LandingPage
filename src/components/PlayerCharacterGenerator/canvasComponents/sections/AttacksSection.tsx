/**
 * AttacksSection Component
 * 
 * Weapon attacks table showing attack bonus and damage.
 * 
 * @module PlayerCharacterGenerator/canvasComponents/sections/AttacksSection
 */

import React from 'react';
import type { DnD5eWeapon } from '../../types/dnd5e/equipment.types';
import type { AbilityScores } from '../../engine/RuleEngine.types';

export interface AttacksSectionProps {
    /** Equipped weapons */
    weapons: DnD5eWeapon[];
    /** Ability scores for calculating modifiers */
    abilityScores: AbilityScores;
    /** Proficiency bonus */
    proficiencyBonus: number;
    /** Weapon proficiencies */
    weaponProficiencies?: string[];
}

/**
 * Calculate ability modifier
 */
function calculateModifier(score: number): number {
    return Math.floor((score - 10) / 2);
}

/**
 * Format attack bonus
 */
function formatAttackBonus(bonus: number): string {
    return bonus >= 0 ? `+${bonus}` : `${bonus}`;
}

/**
 * Determine if weapon uses STR or DEX
 */
function getWeaponAbility(weapon: DnD5eWeapon, abilityScores: AbilityScores): 'strength' | 'dexterity' {
    // Finesse weapons can use either
    if (weapon.properties?.includes('finesse')) {
        const strMod = calculateModifier(abilityScores.strength ?? 10);
        const dexMod = calculateModifier(abilityScores.dexterity ?? 10);
        return dexMod > strMod ? 'dexterity' : 'strength';
    }

    // Ranged weapons use DEX by default
    if (weapon.weaponType === 'ranged' || weapon.range) {
        return 'dexterity';
    }

    // Melee weapons use STR
    return 'strength';
}

/**
 * Calculate attack bonus for a weapon
 */
function calculateAttackBonus(
    weapon: DnD5eWeapon,
    abilityScores: AbilityScores,
    proficiencyBonus: number,
    weaponProficiencies: string[] = []
): number {
    const ability = getWeaponAbility(weapon, abilityScores);
    const abilityMod = calculateModifier(abilityScores[ability] ?? 10);

    // Check if proficient with this weapon type
    const isProficient =
        weaponProficiencies.includes('all') ||
        weaponProficiencies.includes(weapon.type || '') ||
        weaponProficiencies.some(p =>
            weapon.name.toLowerCase().includes(p.toLowerCase())
        );

    const profBonus = isProficient ? proficiencyBonus : 0;

    return abilityMod + profBonus;
}

/**
 * Format weapon damage
 */
function formatDamage(
    weapon: DnD5eWeapon,
    abilityScores: AbilityScores
): string {
    const ability = getWeaponAbility(weapon, abilityScores);
    const abilityMod = calculateModifier(abilityScores[ability] ?? 10);

    const damage = weapon.damage || '1d4';
    const damageType = weapon.damageType || 'bludgeoning';

    if (abilityMod === 0) {
        return `${damage} ${damageType}`;
    }

    const bonusStr = abilityMod > 0 ? `+${abilityMod}` : `${abilityMod}`;
    return `${damage}${bonusStr} ${damageType}`;
}

/**
 * AttacksSection - Weapon attacks table
 */
export const AttacksSection: React.FC<AttacksSectionProps> = ({
    weapons,
    abilityScores,
    proficiencyBonus,
    weaponProficiencies = []
}) => {
    if (weapons.length === 0) {
        return (
            <div className="block character frame" id="attacks">
                <h4>Attacks</h4>
                <p style={{ fontStyle: 'italic', color: '#666' }}>No weapons equipped</p>
            </div>
        );
    }

    return (
        <div className="block character frame" id="attacks">
            <h4>Attacks</h4>
            <table className="attacks-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Atk Bonus</th>
                        <th>Damage/Type</th>
                    </tr>
                </thead>
                <tbody>
                    {weapons.map((weapon, idx) => {
                        const attackBonus = calculateAttackBonus(
                            weapon,
                            abilityScores,
                            proficiencyBonus,
                            weaponProficiencies
                        );
                        const damage = formatDamage(weapon, abilityScores);

                        return (
                            <tr key={weapon.id || idx}>
                                <td className="attack-name">{weapon.name}</td>
                                <td className="attack-bonus">
                                    {formatAttackBonus(attackBonus)}
                                </td>
                                <td className="attack-damage">{damage}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default AttacksSection;

