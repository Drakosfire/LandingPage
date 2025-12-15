/**
 * Ability Score Display
 * 
 * Displays ability scores with base values, racial bonuses, and modifiers.
 * 
 * @module CharacterGenerator/components
 */

import React from 'react';
import { Stack, Group, Text, Table, Paper, Badge } from '@mantine/core';
import { DnD5eAbilityScores } from '../types';
import { DnD5eRace } from '../types/dnd5e/race.types';
import { getAbilityModifier } from '../types/dnd5e/character.types';
import { getRacialBonusForAbility } from '../rules/dnd5e/racialBonuses';

interface AbilityScoreDisplayProps {
    baseScores: DnD5eAbilityScores;
    finalScores: DnD5eAbilityScores;
    race?: DnD5eRace;
    showRacialBonuses?: boolean;
}

const ABILITIES: Array<{ key: keyof DnD5eAbilityScores, label: string }> = [
    { key: 'strength', label: 'Strength' },
    { key: 'dexterity', label: 'Dexterity' },
    { key: 'constitution', label: 'Constitution' },
    { key: 'intelligence', label: 'Intelligence' },
    { key: 'wisdom', label: 'Wisdom' },
    { key: 'charisma', label: 'Charisma' }
];

export const AbilityScoreDisplay: React.FC<AbilityScoreDisplayProps> = ({
    baseScores,
    finalScores,
    race,
    showRacialBonuses = false
}) => {
    return (
        <Paper p="md" withBorder data-testid="ability-score-display">
            <Stack gap="sm">
                <Text size="lg" fw={600}>Ability Scores Summary</Text>

                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Ability</Table.Th>
                            <Table.Th>Base</Table.Th>
                            {showRacialBonuses && race && (
                                <Table.Th>Racial</Table.Th>
                            )}
                            <Table.Th>Final</Table.Th>
                            <Table.Th>Modifier</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {ABILITIES.map(({ key, label }) => {
                            const base = baseScores[key];
                            const final = finalScores[key];
                            const modifier = getAbilityModifier(final);
                            const racialBonus = (race && race.abilityBonuses)
                                ? getRacialBonusForAbility(race, key)
                                : 0;

                            return (
                                <Table.Tr key={key}>
                                    <Table.Td>
                                        <Text size="sm" fw={500}>{label}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm">{base}</Text>
                                    </Table.Td>
                                    {showRacialBonuses && race && (
                                        <Table.Td>
                                            {racialBonus > 0 ? (
                                                <Badge color="green" size="sm">
                                                    +{racialBonus}
                                                </Badge>
                                            ) : (
                                                <Text size="sm" c="dimmed">—</Text>
                                            )}
                                        </Table.Td>
                                    )}
                                    <Table.Td>
                                        <Text
                                            size="sm"
                                            fw={600}
                                            c={final !== base ? 'green' : undefined}
                                        >
                                            {final}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge
                                            color={modifier > 0 ? 'blue' : modifier < 0 ? 'red' : 'gray'}
                                            variant="light"
                                        >
                                            {modifier >= 0 ? '+' : ''}{modifier}
                                        </Badge>
                                    </Table.Td>
                                </Table.Tr>
                            );
                        })}
                    </Table.Tbody>
                </Table>

                {showRacialBonuses && race && (
                    <Text size="xs" c="dimmed">
                        Racial bonuses from {race.name} applied
                    </Text>
                )}
            </Stack>
        </Paper>
    );
};

