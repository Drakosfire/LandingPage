/**
 * D&D 5e Dice Roller
 * 
 * Implementation of 4d6 drop lowest dice rolling for ability scores.
 * Rules from Player's Handbook (PHB).
 * 
 * @module CharacterGenerator/rules/dnd5e/diceRoller
 */

import { getAbilityModifier } from '../../types/dnd5e/character.types';

/**
 * Result of rolling 4d6 and dropping the lowest
 */
export interface DiceRollResult {
    rolls: number[];      // All 4 dice rolled
    dropped: number;      // Which die was dropped (lowest)
    total: number;        // Sum of 3 highest dice
}

/**
 * Result of rolling all 6 ability scores
 */
export interface AbilityScoreRollResult {
    scores: number[];     // 6 ability scores
    rollHistory: DiceRollResult[];  // History of each roll
}

/**
 * Roll 4d6 and drop the lowest die
 * 
 * @returns Roll result with total and history
 */
export function roll4d6DropLowest(): DiceRollResult {
    // Roll 4d6
    const rolls = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
    ];

    // Find lowest die
    const sortedRolls = [...rolls].sort((a, b) => a - b);
    const dropped = sortedRolls[0];

    // Sum the 3 highest
    const total = sortedRolls[1] + sortedRolls[2] + sortedRolls[3];

    console.log(`🎲 [DiceRoller] Rolled: [${rolls.join(', ')}], dropped: ${dropped}, total: ${total}`);

    return {
        rolls,
        dropped,
        total
    };
}

/**
 * Roll 6 ability scores using 4d6 drop lowest
 * 
 * @returns Array of 6 scores with roll history
 */
export function rollAbilityScores(): AbilityScoreRollResult {
    const scores: number[] = [];
    const rollHistory: DiceRollResult[] = [];

    console.log('🎲 [DiceRoller] Rolling 6 ability scores...');

    for (let i = 0; i < 6; i++) {
        const roll = roll4d6DropLowest();
        scores.push(roll.total);
        rollHistory.push(roll);
    }

    const totalModifiers = scores.reduce(
        (sum, score) => sum + getAbilityModifier(score),
        0
    );

    console.log(`🎲 [DiceRoller] Scores: [${scores.join(', ')}], total modifiers: ${totalModifiers}`);

    return {
        scores,
        rollHistory
    };
}

/**
 * Check if ability scores should be rerolled
 * 
 * D&D 5e PHB suggests rerolling if:
 * 1. Total modifiers are less than +1
 * 2. No score is 15 or higher
 * 
 * @param scores - Array of 6 ability scores
 * @returns True if should reroll
 */
export function shouldRerollScores(scores: number[]): boolean {
    // Calculate total modifiers
    const totalModifiers = scores.reduce(
        (sum, score) => sum + getAbilityModifier(score),
        0
    );

    // Check if any score is 15+
    const hasHighScore = scores.some(score => score >= 15);

    // Recommend reroll if total mods < 1 OR no high score
    const shouldReroll = totalModifiers < 1 || !hasHighScore;

    if (shouldReroll) {
        console.log('⏭️ [DiceRoller] Recommending reroll:', {
            totalModifiers,
            hasHighScore,
            reason: totalModifiers < 1 ? 'low modifiers' : 'no high score'
        });
    }

    return shouldReroll;
}

/**
 * Roll ability scores with automatic reroll if too weak
 * 
 * Continues rolling until scores meet minimum standards:
 * - Total modifiers >= +1
 * - At least one score is 15+
 * 
 * Note: This can loop indefinitely in theory, but probability is low.
 * Average of 1-2 rolls needed.
 * 
 * @param maxAttempts - Maximum reroll attempts (default 10)
 * @returns Roll result that meets minimum standards
 */
export function rollAbilityScoresWithReroll(maxAttempts: number = 10): AbilityScoreRollResult {
    let attempts = 0;
    let result = rollAbilityScores();

    while (shouldRerollScores(result.scores) && attempts < maxAttempts) {
        attempts++;
        console.log(`🔄 [DiceRoller] Rerolling (attempt ${attempts})...`);
        result = rollAbilityScores();
    }

    if (attempts > 0) {
        console.log(`✅ [DiceRoller] Acceptable scores after ${attempts} reroll(s)`);
    }

    return result;
}

/**
 * Manually assign rolled scores to abilities
 * User chooses which score goes to which ability
 * 
 * @param rolledScores - Array of 6 rolled scores
 * @param assignment - Object mapping ability names to indices in rolledScores
 * @returns Ability scores object
 */
export function assignRolledScores(
    rolledScores: number[],
    assignment: {
        strength: number;
        dexterity: number;
        constitution: number;
        intelligence: number;
        wisdom: number;
        charisma: number;
    }
): {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
} {
    return {
        strength: rolledScores[assignment.strength],
        dexterity: rolledScores[assignment.dexterity],
        constitution: rolledScores[assignment.constitution],
        intelligence: rolledScores[assignment.intelligence],
        wisdom: rolledScores[assignment.wisdom],
        charisma: rolledScores[assignment.charisma]
    };
}



