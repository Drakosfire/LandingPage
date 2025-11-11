/**
 * Dice Roller Interface
 * 
 * UI for rolling ability scores with 4d6 drop lowest.
 * 
 * @module CharacterGenerator/components
 */

import React, { useState } from 'react';
import { Stack, Group, Text, Button, Paper, NumberInput } from '@mantine/core';
import { IconDice } from '@tabler/icons-react';
import { DnD5eAbilityScores } from '../types';
import { rollAbilityScores, shouldRerollScores, DiceRollResult } from '../rules/dnd5e/diceRoller';
import { getAbilityModifier } from '../types/dnd5e/character.types';

interface DiceRollerInterfaceProps {
    scores: DnD5eAbilityScores;
    onRoll: () => void;
    onScoresChange: (scores: DnD5eAbilityScores) => void;
}

const ABILITIES: Array<{ key: keyof DnD5eAbilityScores, label: string, abbr: string }> = [
    { key: 'strength', label: 'Strength', abbr: 'STR' },
    { key: 'dexterity', label: 'Dexterity', abbr: 'DEX' },
    { key: 'constitution', label: 'Constitution', abbr: 'CON' },
    { key: 'intelligence', label: 'Intelligence', abbr: 'INT' },
    { key: 'wisdom', label: 'Wisdom', abbr: 'WIS' },
    { key: 'charisma', label: 'Charisma', abbr: 'CHA' }
];

export const DiceRollerInterface: React.FC<DiceRollerInterfaceProps> = ({
    scores,
    onRoll,
    onScoresChange
}) => {
    const [lastRollHistory, setLastRollHistory] = useState<DiceRollResult[] | null>(null);
    const [hasRolled, setHasRolled] = useState(false);

    const handleRoll = () => {
        const result = rollAbilityScores();
        const [str, dex, con, int, wis, cha] = result.scores;

        onScoresChange({
            strength: str,
            dexterity: dex,
            constitution: con,
            intelligence: int,
            wisdom: wis,
            charisma: cha
        });

        setLastRollHistory(result.rollHistory);
        setHasRolled(true);

        console.log('🎲 [DiceRoller] Rolled:', result.scores);
    };

    const handleReroll = () => {
        handleRoll();
    };

    const handleManualChange = (ability: keyof DnD5eAbilityScores, value: number | string) => {
        onScoresChange({
            ...scores,
            [ability]: Number(value)
        });
    };

    // Check if current scores should be rerolled
    const scoresArray = Object.values(scores);
    const recommendReroll = hasRolled && shouldRerollScores(scoresArray);

    // Calculate total modifiers
    const totalModifiers = scoresArray.reduce(
        (sum, score) => sum + getAbilityModifier(score),
        0
    );

    return (
        <Stack gap="md" data-testid="dice-roller-interface">
            <Group justify="space-between">
                <Text size="lg" fw={600}>Roll for Ability Scores</Text>
            </Group>

            <Text size="sm" c="dimmed">
                Roll 4d6 and drop the lowest die, six times (once for each ability).
            </Text>

            {!hasRolled && (
                <Button
                    onClick={handleRoll}
                    leftSection={<IconDice size={18} />}
                    size="lg"
                    data-testid="roll-button"
                >
                    Roll Ability Scores
                </Button>
            )}

            {hasRolled && (
                <>
                    <Stack gap="xs">
                        <Text size="sm" fw={500}>Your Rolls:</Text>
                        {ABILITIES.map(({ key, label, abbr }, idx) => {
                            const score = scores[key];
                            const rollHist = lastRollHistory?.[idx];

                            return (
                                <Group key={key} justify="space-between" wrap="nowrap">
                                    <Text size="sm" fw={500} style={{ minWidth: 100 }}>
                                        {abbr}
                                    </Text>

                                    <Group gap="xs">
                                        <NumberInput
                                            value={score}
                                            onChange={(val) => handleManualChange(key, val || 3)}
                                            min={3}
                                            max={18}
                                            style={{ width: 80 }}
                                            size="sm"
                                            data-testid={`rolled-${key}`}
                                        />

                                        {rollHist && (
                                            <Text size="xs" c="dimmed">
                                                [{rollHist.rolls.map((die, i) =>
                                                    die === rollHist.dropped
                                                        ? <s key={i}>{die}</s>
                                                        : die
                                                ).reduce((acc, curr, i) =>
                                                    i === 0 ? [curr] : [...acc, ', ', curr],
                                                    [] as any[]
                                                )}]
                                            </Text>
                                        )}
                                    </Group>
                                </Group>
                            );
                        })}
                    </Stack>

                    {recommendReroll && (
                        <Paper p="sm" withBorder bg="yellow.0">
                            <Text size="sm" c="orange">
                                ⚠️ These rolls are below recommended minimums (total modifiers: {totalModifiers >= 0 ? '+' : ''}{totalModifiers}).
                                You may want to reroll.
                            </Text>
                        </Paper>
                    )}

                    <Button
                        onClick={handleReroll}
                        leftSection={<IconDice size={18} />}
                        variant="light"
                        data-testid="reroll-button"
                    >
                        Reroll All
                    </Button>
                </>
            )}
        </Stack>
    );
};



