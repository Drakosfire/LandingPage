/**
 * EquipmentStep Component
 * 
 * Step 6 of character creation wizard - Equipment Review.
 * Shows summary of equipment choices and allows final adjustments.
 * 
 * Note: Most equipment choices are made in the Class step (T053).
 * This step provides a summary and allows adding starting gold purchases.
 * 
 * @module CharacterGenerator/creationDrawerComponents
 */

import React, { useMemo } from 'react';
import { Stack, Text, Box, Title, Paper, Group, Badge, Divider, Alert } from '@mantine/core';
import { IconSword, IconShield, IconBackpack, IconCoins, IconCheck } from '@tabler/icons-react';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';
import type { DnD5eClass } from '../types';

const EquipmentStep: React.FC = () => {
    const { character, ruleEngine } = usePlayerCharacterGenerator();

    const dnd5eData = character?.dnd5eData;

    // Get selected class data
    const selectedClass = useMemo(() => {
        if (!dnd5eData?.classes?.length) return null;
        const classId = dnd5eData.classes[0]?.name?.toLowerCase();
        return ruleEngine.getAvailableClasses().find(c => c.id === classId) || null;
    }, [dnd5eData?.classes, ruleEngine]);

    // Get equipment choices for the class
    const equipmentChoices = useMemo(() => {
        if (!selectedClass) return [];
        return ruleEngine.getEquipmentChoices(selectedClass.id);
    }, [selectedClass, ruleEngine]);

    // Get what was chosen in class step
    const selectedEquipment = dnd5eData?.equipmentChoices || {};

    // Get background equipment
    const backgroundEquipment = dnd5eData?.background?.equipment || [];

    // Calculate starting gold
    const startingGold = useMemo(() => {
        // For now, return starting gold from class if available
        if (selectedClass?.startingGold) {
            // Average of dice roll
            const diceMatch = selectedClass.startingGold.dice.match(/(\d+)d(\d+)/);
            if (diceMatch) {
                const numDice = parseInt(diceMatch[1]);
                const dieSize = parseInt(diceMatch[2]);
                const average = numDice * ((dieSize + 1) / 2);
                return Math.floor(average * selectedClass.startingGold.multiplier);
            }
        }
        return 0;
    }, [selectedClass]);

    // Compile all selected equipment
    const compiledEquipment = useMemo(() => {
        const equipment: { name: string; source: string; type: string }[] = [];

        // Add equipment from class choices
        equipmentChoices.forEach(group => {
            const chosenIndex = selectedEquipment[group.id];
            if (chosenIndex !== undefined && group.options[chosenIndex]) {
                const option = group.options[chosenIndex];
                option.items.forEach(item => {
                    equipment.push({
                        name: item.quantity > 1 ? `${item.name} (×${item.quantity})` : item.name,
                        source: 'Class',
                        type: item.type
                    });
                });
            }
        });

        // Add equipment from background
        backgroundEquipment.forEach(item => {
            equipment.push({
                name: item,
                source: 'Background',
                type: 'gear'
            });
        });

        return equipment;
    }, [equipmentChoices, selectedEquipment, backgroundEquipment]);

    // Group equipment by type
    const groupedEquipment = useMemo(() => {
        const groups: Record<string, typeof compiledEquipment> = {
            weapon: [],
            armor: [],
            gear: [],
            tool: [],
            pack: []
        };

        compiledEquipment.forEach(item => {
            const type = item.type as keyof typeof groups;
            if (groups[type]) {
                groups[type].push(item);
            } else {
                groups.gear.push(item);
            }
        });

        return groups;
    }, [compiledEquipment]);

    // Check if all equipment choices are made
    const allChoicesMade = useMemo(() => {
        return equipmentChoices.every(group => selectedEquipment[group.id] !== undefined);
    }, [equipmentChoices, selectedEquipment]);

    if (!dnd5eData) {
        return <Text c="dimmed">Loading character data...</Text>;
    }

    return (
        <Stack gap="md">
            {/* Header */}
            <Box>
                <Title order={4}>Equipment Summary</Title>
                <Text size="sm" c="dimmed">
                    Review your starting equipment from class and background choices.
                </Text>
            </Box>

            {/* Warning if choices not complete */}
            {!allChoicesMade && (
                <Alert color="orange" variant="light">
                    <Text size="sm">
                        Some equipment choices haven't been made. Go back to the Class step to complete your selections.
                    </Text>
                </Alert>
            )}

            {/* Equipment by Category */}
            <Stack gap="sm">
                {/* Weapons */}
                {groupedEquipment.weapon.length > 0 && (
                    <Paper p="sm" withBorder>
                        <Group gap="xs" mb="xs">
                            <IconSword size={16} />
                            <Text size="sm" fw={600}>Weapons</Text>
                        </Group>
                        <Stack gap={4}>
                            {groupedEquipment.weapon.map((item, idx) => (
                                <Group key={idx} justify="space-between">
                                    <Text size="sm">{item.name}</Text>
                                    <Badge size="xs" variant="light">{item.source}</Badge>
                                </Group>
                            ))}
                        </Stack>
                    </Paper>
                )}

                {/* Armor */}
                {groupedEquipment.armor.length > 0 && (
                    <Paper p="sm" withBorder>
                        <Group gap="xs" mb="xs">
                            <IconShield size={16} />
                            <Text size="sm" fw={600}>Armor</Text>
                        </Group>
                        <Stack gap={4}>
                            {groupedEquipment.armor.map((item, idx) => (
                                <Group key={idx} justify="space-between">
                                    <Text size="sm">{item.name}</Text>
                                    <Badge size="xs" variant="light">{item.source}</Badge>
                                </Group>
                            ))}
                        </Stack>
                    </Paper>
                )}

                {/* Gear & Packs */}
                {(groupedEquipment.gear.length > 0 || groupedEquipment.pack.length > 0) && (
                    <Paper p="sm" withBorder>
                        <Group gap="xs" mb="xs">
                            <IconBackpack size={16} />
                            <Text size="sm" fw={600}>Gear & Supplies</Text>
                        </Group>
                        <Stack gap={4}>
                            {[...groupedEquipment.gear, ...groupedEquipment.pack].map((item, idx) => (
                                <Group key={idx} justify="space-between">
                                    <Text size="sm">{item.name}</Text>
                                    <Badge size="xs" variant="light">{item.source}</Badge>
                                </Group>
                            ))}
                        </Stack>
                    </Paper>
                )}

                {/* Tools */}
                {groupedEquipment.tool.length > 0 && (
                    <Paper p="sm" withBorder>
                        <Group gap="xs" mb="xs">
                            <Text size="sm" fw={600}>Tools</Text>
                        </Group>
                        <Stack gap={4}>
                            {groupedEquipment.tool.map((item, idx) => (
                                <Group key={idx} justify="space-between">
                                    <Text size="sm">{item.name}</Text>
                                    <Badge size="xs" variant="light">{item.source}</Badge>
                                </Group>
                            ))}
                        </Stack>
                    </Paper>
                )}
            </Stack>

            {/* Starting Gold */}
            <Divider />
            <Paper p="sm" withBorder>
                <Group gap="xs" mb="xs">
                    <IconCoins size={16} />
                    <Text size="sm" fw={600}>Starting Currency</Text>
                </Group>
                <Text size="sm">
                    {startingGold > 0
                        ? `${startingGold} gp (average from class)`
                        : 'Starting gold varies based on equipment choices'}
                </Text>
                <Text size="xs" c="dimmed" mt="xs">
                    Note: You may choose to take starting gold instead of equipment.
                    This is handled in the final character sheet.
                </Text>
            </Paper>

            {/* Summary */}
            <Box
                p="sm"
                style={{
                    backgroundColor: 'var(--mantine-color-gray-1)',
                    borderRadius: 'var(--mantine-radius-sm)'
                }}
            >
                <Group gap="xs">
                    {allChoicesMade && <IconCheck size={16} color="green" />}
                    <Text size="sm" fw={600}>
                        {compiledEquipment.length} items from class and background
                    </Text>
                </Group>
            </Box>

            {/* Live preview note */}
            <Text size="xs" c="dimmed" ta="center">
                Changes are saved automatically and shown on the character sheet.
            </Text>
        </Stack>
    );
};

export default EquipmentStep;



