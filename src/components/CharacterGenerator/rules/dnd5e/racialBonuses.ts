/**
 * D&D 5e Racial Bonuses
 * 
 * Functions for applying racial ability score bonuses.
 * 
 * @module CharacterGenerator/rules/dnd5e/racialBonuses
 */

import { DnD5eAbilityScores } from '../../types/dnd5e/character.types';
import { DnD5eRace } from '../../types/dnd5e/race.types';

/**
 * Apply racial ability score bonuses to base scores
 * 
 * Takes base ability scores and applies all racial bonuses from the selected race.
 * Returns a new object without modifying the original.
 * 
 * @param baseScores - Base ability scores (before racial bonuses)
 * @param race - Character's race
 * @returns Final ability scores (after racial bonuses)
 */
export function applyRacialBonuses(
    baseScores: DnD5eAbilityScores,
    race: DnD5eRace
): DnD5eAbilityScores {
    // Start with a copy of base scores
    const finalScores: DnD5eAbilityScores = { ...baseScores };

    // Apply each racial bonus
    for (const bonus of race.abilityBonuses) {
        const ability = bonus.ability as keyof DnD5eAbilityScores;

        // Validate ability name
        if (ability in finalScores) {
            finalScores[ability] += bonus.bonus;
            console.log(
                `📈 [RacialBonuses] Applying ${race.name} bonus: ` +
                `${ability} +${bonus.bonus} (${baseScores[ability]} → ${finalScores[ability]})`
            );
        } else {
            console.warn(
                `⚠️ [RacialBonuses] Unknown ability: ${bonus.ability} from ${race.name}`
            );
        }
    }

    return finalScores;
}

/**
 * Get the racial bonus for a specific ability
 * 
 * @param race - Character's race
 * @param ability - Ability name
 * @returns Bonus for that ability (0 if none)
 */
export function getRacialBonusForAbility(
    race: DnD5eRace,
    ability: keyof DnD5eAbilityScores
): number {
    const bonus = race.abilityBonuses.find(b => b.ability === ability);
    return bonus?.bonus || 0;
}

/**
 * Get total of all racial ability score bonuses
 * 
 * Useful for displaying "Total bonuses: +3" etc.
 * 
 * @param race - Character's race
 * @returns Total of all bonuses
 */
export function getTotalRacialBonuses(race: DnD5eRace): number {
    return race.abilityBonuses.reduce((sum, bonus) => sum + bonus.bonus, 0);
}

/**
 * Get a map of all racial bonuses by ability
 * 
 * @param race - Character's race
 * @returns Object mapping ability names to bonuses
 */
export function getRacialBonusMap(race: DnD5eRace): Record<string, number> {
    const bonusMap: Record<string, number> = {};

    for (const bonus of race.abilityBonuses) {
        bonusMap[bonus.ability] = (bonusMap[bonus.ability] || 0) + bonus.bonus;
    }

    return bonusMap;
}

/**
 * Check if a race provides a bonus to a specific ability
 * 
 * @param race - Character's race
 * @param ability - Ability name
 * @returns True if race provides a bonus to that ability
 */
export function hasRacialBonusFor(
    race: DnD5eRace,
    ability: keyof DnD5eAbilityScores
): boolean {
    return race.abilityBonuses.some(b => b.ability === ability);
}



