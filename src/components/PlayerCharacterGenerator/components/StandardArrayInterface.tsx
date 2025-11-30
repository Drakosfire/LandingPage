/**
 * Standard Array Interface
 * 
 * UI for standard array ability score assignment.
 * User assigns each of [15, 14, 13, 12, 10, 8] to an ability.
 * 
 * @module CharacterGenerator/components
 */

import React from 'react';
import { Stack, Group, Text, Select, Button } from '@mantine/core';
import { DnD5eAbilityScores } from '../types';
import { STANDARD_ARRAY_VALUES, getRemainingStandardArrayValues } from '../rules/dnd5e/standardArray';

interface StandardArrayInterfaceProps {
    scores: DnD5eAbilityScores;
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

export const StandardArrayInterface: React.FC<StandardArrayInterfaceProps> = ({
    scores,
    onScoresChange
}) => {
    const handleScoreChange = (ability: keyof DnD5eAbilityScores, value: string | null) => {
        if (!value) return;

        const newScore = parseInt(value, 10);
        console.log(`📝 [StandardArray] ${ability} set to ${newScore}`);

        onScoresChange({
            ...scores,
            [ability]: newScore
        });
    };

    const handleQuickAssign = (preset: 'fighter' | 'wizard' | 'rogue') => {
        let newScores: DnD5eAbilityScores;

        switch (preset) {
            case 'fighter':
                newScores = {
                    strength: 15,
                    dexterity: 13,
                    constitution: 14,
                    intelligence: 8,
                    wisdom: 12,
                    charisma: 10
                };
                break;
            case 'wizard':
                newScores = {
                    strength: 8,
                    dexterity: 14,
                    constitution: 13,
                    intelligence: 15,
                    wisdom: 12,
                    charisma: 10
                };
                break;
            case 'rogue':
                newScores = {
                    strength: 10,
                    dexterity: 15,
                    constitution: 13,
                    intelligence: 12,
                    wisdom: 8,
                    charisma: 14
                };
                break;
        }

        console.log(`🎯 [StandardArray] Quick assign: ${preset}`);
        onScoresChange(newScores);
    };

    // Get available options for each ability
    const getAvailableOptions = (currentAbility: keyof DnD5eAbilityScores): string[] => {
        const remaining = getRemainingStandardArrayValues(scores);
        const currentValue = scores[currentAbility];

        // Include current value + all remaining values
        const available = [...remaining];
        if (!available.includes(currentValue)) {
            available.push(currentValue);
        }

        return available.sort((a, b) => b - a).map(String);
    };

    return (
        <Stack gap="md" data-testid="standard-array-interface">
            <Group justify="space-between">
                <Text size="lg" fw={600}>Standard Array</Text>
            </Group>

            <Text size="sm" c="dimmed">
                Assign each value from the standard array to an ability: {STANDARD_ARRAY_VALUES.join(', ')}
            </Text>

            {/* Quick Assign Presets */}
            <Group gap="xs">
                <Text size="xs" c="dimmed">Quick Assign:</Text>
                <Button
                    size="xs"
                    variant="light"
                    onClick={() => handleQuickAssign('fighter')}
                >
                    Fighter
                </Button>
                <Button
                    size="xs"
                    variant="light"
                    onClick={() => handleQuickAssign('wizard')}
                >
                    Wizard
                </Button>
                <Button
                    size="xs"
                    variant="light"
                    onClick={() => handleQuickAssign('rogue')}
                >
                    Rogue
                </Button>
            </Group>

            <Stack gap="sm">
                {ABILITIES.map(({ key, label, abbr }) => {
                    const availableOptions = getAvailableOptions(key);

                    return (
                        <Group key={key} justify="space-between" wrap="nowrap">
                            <Text size="sm" fw={500} style={{ minWidth: 100 }}>
                                {abbr}
                            </Text>

                            <Select
                                value={String(scores[key])}
                                onChange={(val) => handleScoreChange(key, val)}
                                data={availableOptions}
                                style={{ width: 120 }}
                                data-testid={`select-${key}`}
                            />
                        </Group>
                    );
                })}
            </Stack>
        </Stack>
    );
};



