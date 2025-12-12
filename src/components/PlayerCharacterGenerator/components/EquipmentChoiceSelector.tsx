/**
 * EquipmentChoiceSelector Component
 * 
 * Displays equipment choice groups with radio button selection.
 * Each group allows selecting one option from multiple choices.
 * 
 * @module CharacterGenerator/components
 */

import React, { useCallback, useState } from 'react';
import { Box, Stack, Radio, Text, Paper, Group, Badge, Divider, Popover, ActionIcon } from '@mantine/core';
import { IconSword, IconShield, IconBackpack, IconTool, IconInfoCircle } from '@tabler/icons-react';
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

// Pack contents data - TODO: Move to rule engine data files
const PACK_CONTENTS: Record<string, string[]> = {
    "explorer's pack": ['Backpack', 'Bedroll', 'Mess kit', 'Tinderbox', '10 torches', '10 days rations', 'Waterskin', '50 ft hempen rope'],
    "dungeoneer's pack": ['Backpack', 'Crowbar', 'Hammer', '10 pitons', '10 torches', 'Tinderbox', '10 days rations', 'Waterskin', '50 ft hempen rope'],
    "priest's pack": ['Backpack', 'Blanket', '10 candles', 'Tinderbox', 'Alms box', '2 blocks incense', 'Censer', 'Vestments', '2 days rations', 'Waterskin'],
    "scholar's pack": ['Backpack', 'Book of lore', 'Ink & pen', '10 sheets parchment', 'Little bag of sand', 'Small knife'],
    "burglar's pack": ['Backpack', '1000 ball bearings', '10 ft string', 'Bell', '5 candles', 'Crowbar', 'Hammer', '10 pitons', 'Hooded lantern', '2 flasks oil', '5 days rations', 'Tinderbox', 'Waterskin', '50 ft hempen rope'],
    "entertainer's pack": ['Backpack', 'Bedroll', '2 costumes', '5 candles', '5 days rations', 'Waterskin', 'Disguise kit'],
    "diplomat's pack": ['Chest', '2 cases for maps/scrolls', 'Fine clothes', 'Ink & pen', 'Lamp', '2 flasks oil', '5 sheets paper', 'Vial perfume', 'Sealing wax', 'Soap'],
};

// Weapon damage data - TODO: Move to rule engine data files  
const WEAPON_DATA: Record<string, { damage: string; properties: string[] }> = {
    'longsword': { damage: '1d8 slashing', properties: ['Versatile (1d10)'] },
    'shortsword': { damage: '1d6 piercing', properties: ['Finesse', 'Light'] },
    'greatsword': { damage: '2d6 slashing', properties: ['Heavy', 'Two-handed'] },
    'rapier': { damage: '1d8 piercing', properties: ['Finesse'] },
    'handaxe': { damage: '1d6 slashing', properties: ['Light', 'Thrown (20/60)'] },
    'javelin': { damage: '1d6 piercing', properties: ['Thrown (30/120)'] },
    'light crossbow': { damage: '1d8 piercing', properties: ['Ammunition', 'Loading', 'Two-handed'] },
    'shortbow': { damage: '1d6 piercing', properties: ['Ammunition', 'Two-handed'] },
    'longbow': { damage: '1d8 piercing', properties: ['Ammunition', 'Heavy', 'Two-handed'] },
    'mace': { damage: '1d6 bludgeoning', properties: [] },
    'warhammer': { damage: '1d8 bludgeoning', properties: ['Versatile (1d10)'] },
    'battleaxe': { damage: '1d8 slashing', properties: ['Versatile (1d10)'] },
    'greataxe': { damage: '1d12 slashing', properties: ['Heavy', 'Two-handed'] },
    'dagger': { damage: '1d4 piercing', properties: ['Finesse', 'Light', 'Thrown (20/60)'] },
    'quarterstaff': { damage: '1d6 bludgeoning', properties: ['Versatile (1d8)'] },
    'scimitar': { damage: '1d6 slashing', properties: ['Finesse', 'Light'] },
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

    // Get info content for an item
    const getItemInfo = (item: EquipmentItem) => {
        const itemNameLower = item.name.toLowerCase();
        
        if (item.type === 'pack') {
            const contents = PACK_CONTENTS[itemNameLower];
            return contents ? { type: 'pack', contents } : null;
        }
        
        if (item.type === 'weapon') {
            const data = WEAPON_DATA[itemNameLower];
            return data ? { type: 'weapon', ...data } : null;
        }
        
        return null;
    };

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

                                    // Check if any items have info available
                                    const itemsWithInfo = option.items.filter(item => getItemInfo(item));
                                    const hasInfo = itemsWithInfo.length > 0;

                                    return (
                                        <Group key={option.id} gap="xs" wrap="nowrap" align="center">
                                            <Radio
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
                                            {hasInfo && (
                                                <Popover 
                                                    position="right" 
                                                    withArrow 
                                                    shadow="md"
                                                    zIndex={500}
                                                >
                                                    <Popover.Target>
                                                        <ActionIcon
                                                            size="xs"
                                                            variant="subtle"
                                                            color="gray"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <IconInfoCircle size={14} />
                                                        </ActionIcon>
                                                    </Popover.Target>
                                                    <Popover.Dropdown>
                                                        {(() => {
                                                            const info = getItemInfo(itemsWithInfo[0]);
                                                            if (!info) return null;

                                                            if (info.type === 'pack' && 'contents' in info && info.contents) {
                                                                return (
                                                                    <Stack gap="xs" maw={250}>
                                                                        <Text size="sm" fw={600}>{itemsWithInfo[0].name}</Text>
                                                                        <Divider />
                                                                        <Text size="xs" fw={500}>Contents:</Text>
                                                                        <Stack gap={2}>
                                                                            {info.contents.map((item, i) => (
                                                                                <Text key={i} size="xs">• {item}</Text>
                                                                            ))}
                                                                        </Stack>
                                                                    </Stack>
                                                                );
                                                            }

                                                            if (info.type === 'weapon' && 'damage' in info) {
                                                                return (
                                                                    <Stack gap="xs" maw={200}>
                                                                        <Text size="sm" fw={600}>{itemsWithInfo[0].name}</Text>
                                                                        <Divider />
                                                                        <Group gap="xs">
                                                                            <Text size="xs" fw={500}>Damage:</Text>
                                                                            <Text size="xs">{info.damage}</Text>
                                                                        </Group>
                                                                        {info.properties.length > 0 && (
                                                                            <Box>
                                                                                <Text size="xs" fw={500}>Properties:</Text>
                                                                                <Text size="xs" c="dimmed">{info.properties.join(', ')}</Text>
                                                                            </Box>
                                                                        )}
                                                                    </Stack>
                                                                );
                                                            }

                                                            return null;
                                                        })()}
                                                    </Popover.Dropdown>
                                                </Popover>
                                            )}
                                        </Group>
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



