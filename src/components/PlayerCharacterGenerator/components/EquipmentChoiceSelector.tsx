/**
 * EquipmentChoiceSelector Component
 * 
 * Displays equipment choice groups with radio button selection.
 * Each group allows selecting one option from multiple choices.
 * 
 * @module CharacterGenerator/components
 */

import React, { useCallback } from 'react';
import { Box, Stack, Radio, Text, Paper, Group, Badge, Divider } from '@mantine/core';
import { IconSword, IconShield, IconBackpack, IconTool } from '@tabler/icons-react';
import type { EquipmentChoiceGroup, EquipmentItem } from '../engine';

interface EquipmentChoiceSelectorProps {
    equipmentGroups: EquipmentChoiceGroup[];
    selectedChoices: Record<string, number>;
    onChoiceSelect: (groupId: string, optionIndex: number) => void;
}

// Get icon for item type
const getItemIcon = (type: EquipmentItem['type']) => {
    switch (type) {
        case 'weapon': return <IconSword size={14} />;
        case 'armor': return <IconShield size={14} />;
        case 'pack': return <IconBackpack size={14} />;
        case 'tool': return <IconTool size={14} />;
        default: return null;
    }
};

// Get badge color for item type
const getItemColor = (type: EquipmentItem['type']) => {
    switch (type) {
        case 'weapon': return 'red';
        case 'armor': return 'blue';
        case 'pack': return 'green';
        case 'tool': return 'orange';
        default: return 'gray';
    }
};

// Format item list for display
const formatItems = (items: EquipmentItem[]): string => {
    return items.map(item => {
        if (item.quantity > 1) {
            return `${item.name} (×${item.quantity})`;
        }
        return item.name;
    }).join(', ');
};

const EquipmentChoiceSelector: React.FC<EquipmentChoiceSelectorProps> = ({
    equipmentGroups,
    selectedChoices,
    onChoiceSelect
}) => {
    const handleChange = useCallback((groupId: string, value: string) => {
        const optionIndex = parseInt(value, 10);
        onChoiceSelect(groupId, optionIndex);
    }, [onChoiceSelect]);

    // Count how many choices have been made
    const choicesMade = Object.keys(selectedChoices).length;
    const totalChoices = equipmentGroups.length;

    return (
        <Stack gap="md">
            {/* Progress indicator */}
            <Text size="sm" c="dimmed">
                {choicesMade} of {totalChoices} equipment choices made
            </Text>

            {/* Equipment choice groups */}
            {equipmentGroups.map((group, groupIndex) => {
                const selectedIndex = selectedChoices[group.id];
                const hasSelection = selectedIndex !== undefined;

                return (
                    <Paper
                        key={group.id}
                        p="sm"
                        withBorder
                        style={{
                            borderColor: hasSelection ? 'var(--mantine-color-green-4)' : undefined,
                            borderLeftWidth: 3,
                            borderLeftColor: hasSelection 
                                ? 'var(--mantine-color-green-5)' 
                                : 'var(--mantine-color-gray-3)'
                        }}
                    >
                        <Text size="sm" fw={600} mb="xs">
                            Choice {groupIndex + 1}
                        </Text>

                        <Radio.Group
                            value={selectedIndex?.toString() ?? ''}
                            onChange={(value) => handleChange(group.id, value)}
                        >
                            <Stack gap="xs">
                                {group.options.map((option, optionIndex) => {
                                    // Determine primary item type for badge
                                    const primaryType = option.items[0]?.type || 'gear';

                                    return (
                                        <Radio
                                            key={option.id}
                                            value={optionIndex.toString()}
                                            label={
                                                <Group gap="xs" wrap="nowrap">
                                                    <Badge
                                                        size="xs"
                                                        color={getItemColor(primaryType)}
                                                        variant="light"
                                                        leftSection={getItemIcon(primaryType)}
                                                    >
                                                        {primaryType}
                                                    </Badge>
                                                    <Text size="sm">
                                                        {option.description || formatItems(option.items)}
                                                    </Text>
                                                </Group>
                                            }
                                            styles={{
                                                radio: {
                                                    cursor: 'pointer'
                                                },
                                                label: {
                                                    cursor: 'pointer'
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </Stack>
                        </Radio.Group>

                        {/* Show selected items detail */}
                        {hasSelection && group.options[selectedIndex] && (
                            <>
                                <Divider my="xs" />
                                <Text size="xs" c="dimmed">
                                    Receiving: {formatItems(group.options[selectedIndex].items)}
                                </Text>
                            </>
                        )}
                    </Paper>
                );
            })}

            {/* Summary of all selections */}
            {choicesMade > 0 && (
                <Paper p="sm" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                    <Text size="xs" fw={600} c="dimmed" mb={4}>EQUIPMENT SUMMARY</Text>
                    <Stack gap={2}>
                        {equipmentGroups.map(group => {
                            const selectedIndex = selectedChoices[group.id];
                            if (selectedIndex === undefined) return null;
                            const option = group.options[selectedIndex];
                            if (!option) return null;

                            return (
                                <Text key={group.id} size="sm">
                                    • {formatItems(option.items)}
                                </Text>
                            );
                        })}
                    </Stack>
                </Paper>
            )}
        </Stack>
    );
};

export default EquipmentChoiceSelector;

