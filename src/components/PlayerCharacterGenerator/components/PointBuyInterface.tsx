/**
 * Point Buy Interface
 * 
 * UI for point buy ability score assignment.
 * 
 * @module CharacterGenerator/components
 */

import React from 'react';
import { Stack, Group, Text, NumberInput, ActionIcon, Badge } from '@mantine/core';
import { IconPlus, IconMinus } from '@tabler/icons-react';
import { DnD5eAbilityScores } from '../types';
import { 
    canIncrease, 
    canDecrease,
    getIncreaseCost,
    getDecreaseRefund
} from '../rules/dnd5e/pointBuy';
import { 
    POINT_BUY_MIN_SCORE,
    POINT_BUY_MAX_SCORE
} from '../types/dnd5e/abilityScores.types';

interface PointBuyInterfaceProps {
    scores: DnD5eAbilityScores;
    onScoreChange: (ability: keyof DnD5eAbilityScores, value: number) => void;
    pointsSpent: number;
    pointsRemaining: number;
}

const ABILITIES: Array<{key: keyof DnD5eAbilityScores, label: string, abbr: string}> = [
    { key: 'strength', label: 'Strength', abbr: 'STR' },
    { key: 'dexterity', label: 'Dexterity', abbr: 'DEX' },
    { key: 'constitution', label: 'Constitution', abbr: 'CON' },
    { key: 'intelligence', label: 'Intelligence', abbr: 'INT' },
    { key: 'wisdom', label: 'Wisdom', abbr: 'WIS' },
    { key: 'charisma', label: 'Charisma', abbr: 'CHA' }
];

export const PointBuyInterface: React.FC<PointBuyInterfaceProps> = ({
    scores,
    onScoreChange,
    pointsSpent,
    pointsRemaining
}) => {
    const handleIncrease = (ability: keyof DnD5eAbilityScores) => {
        const currentScore = scores[ability];
        if (canIncrease(currentScore, pointsRemaining)) {
            onScoreChange(ability, currentScore + 1);
        }
    };
    
    const handleDecrease = (ability: keyof DnD5eAbilityScores) => {
        const currentScore = scores[ability];
        if (canDecrease(currentScore)) {
            onScoreChange(ability, currentScore - 1);
        }
    };
    
    return (
        <Stack gap="md" data-testid="point-buy-interface">
            <Group justify="space-between">
                <Text size="lg" fw={600}>Point Buy</Text>
                <Badge 
                    size="xl" 
                    color={pointsRemaining === 0 ? 'green' : 'blue'}
                >
                    {pointsRemaining} / {pointsSpent + pointsRemaining} points
                </Badge>
            </Group>
            
            <Text size="sm" c="dimmed">
                Assign 27 points among your abilities. Scores range from 8 to 15 before racial bonuses.
            </Text>
            
            <Stack gap="sm">
                {ABILITIES.map(({ key, label, abbr }) => {
                    const score = scores[key];
                    const increaseCost = getIncreaseCost(score);
                    const decreaseRefund = getDecreaseRefund(score);
                    const canIncr = canIncrease(score, pointsRemaining);
                    const canDecr = canDecrease(score);
                    
                    return (
                        <Group key={key} justify="space-between" wrap="nowrap">
                            <Text size="sm" fw={500} style={{ minWidth: 100 }}>
                                {abbr}
                            </Text>
                            
                            <Group gap="xs" wrap="nowrap">
                                <ActionIcon
                                    onClick={() => handleDecrease(key)}
                                    disabled={!canDecr}
                                    variant="default"
                                    size="md"
                                    data-testid={`decrease-${key}`}
                                >
                                    <IconMinus size={16} />
                                </ActionIcon>
                                
                                <NumberInput
                                    value={score}
                                    onChange={(val) => onScoreChange(key, Number(val) || 8)}
                                    min={POINT_BUY_MIN_SCORE}
                                    max={POINT_BUY_MAX_SCORE}
                                    style={{ width: 80 }}
                                    size="sm"
                                    data-testid={`score-${key}`}
                                />
                                
                                <ActionIcon
                                    onClick={() => handleIncrease(key)}
                                    disabled={!canIncr}
                                    variant="default"
                                    size="md"
                                    data-testid={`increase-${key}`}
                                >
                                    <IconPlus size={16} />
                                </ActionIcon>
                                
                                {canIncr && increaseCost > 0 && (
                                    <Text size="xs" c="dimmed" style={{ minWidth: 60 }}>
                                        Cost: {increaseCost}
                                    </Text>
                                )}
                                
                                {canDecr && decreaseRefund > 0 && (
                                    <Text size="xs" c="dimmed" style={{ minWidth: 60 }}>
                                        Refund: +{decreaseRefund}
                                    </Text>
                                )}
                            </Group>
                        </Group>
                    );
                })}
            </Stack>
        </Stack>
    );
};



