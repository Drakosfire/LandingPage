/**
 * EquipmentChoiceSelector Component
 * 
 * Displays equipment choice groups with radio button selection.
 * Each group allows selecting one option from multiple choices.
 * 
 * @module CharacterGenerator/components
 */

import React, { useCallback, useState, useMemo } from 'react';
import { Box, Stack, Radio, Text, Paper, Group, Badge, Divider, Popover, ActionIcon, Select } from '@mantine/core';
import { IconSword, IconShield, IconBackpack, IconTool, IconInfoCircle, IconCheck } from '@tabler/icons-react';
import type { EquipmentChoiceGroup, EquipmentItem } from '../engine';

interface EquipmentChoiceSelectorProps {
    equipmentGroups: EquipmentChoiceGroup[];
    selectedChoices: Record<string, number>;
    onChoiceSelect: (groupId: string, optionIndex: number) => void;
    /** Track specific weapon sub-selections for "any simple weapon" type choices */
    weaponSubSelections?: Record<string, string>;
    onWeaponSubSelect?: (groupId: string, weaponName: string) => void;
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
    'club': { damage: '1d4 bludgeoning', properties: ['Light'] },
    'greatclub': { damage: '1d8 bludgeoning', properties: ['Two-handed'] },
    'light hammer': { damage: '1d4 bludgeoning', properties: ['Light', 'Thrown (20/60)'] },
    'sickle': { damage: '1d4 slashing', properties: ['Light'] },
    'spear': { damage: '1d6 piercing', properties: ['Thrown (20/60)', 'Versatile (1d8)'] },
    'crossbow, light': { damage: '1d8 piercing', properties: ['Ammunition', 'Loading', 'Two-handed'] },
    'dart': { damage: '1d4 piercing', properties: ['Finesse', 'Thrown (20/60)'] },
    'sling': { damage: '1d4 bludgeoning', properties: ['Ammunition'] },
    'flail': { damage: '1d8 bludgeoning', properties: [] },
    'glaive': { damage: '1d10 slashing', properties: ['Heavy', 'Reach', 'Two-handed'] },
    'halberd': { damage: '1d10 slashing', properties: ['Heavy', 'Reach', 'Two-handed'] },
    'lance': { damage: '1d12 piercing', properties: ['Reach', 'Special'] },
    'maul': { damage: '2d6 bludgeoning', properties: ['Heavy', 'Two-handed'] },
    'morningstar': { damage: '1d8 piercing', properties: [] },
    'pike': { damage: '1d10 piercing', properties: ['Heavy', 'Reach', 'Two-handed'] },
    'trident': { damage: '1d6 piercing', properties: ['Thrown (20/60)', 'Versatile (1d8)'] },
    'war pick': { damage: '1d8 piercing', properties: [] },
    'whip': { damage: '1d4 slashing', properties: ['Finesse', 'Reach'] },
    'crossbow, hand': { damage: '1d6 piercing', properties: ['Ammunition', 'Light', 'Loading'] },
    'crossbow, heavy': { damage: '1d10 piercing', properties: ['Ammunition', 'Heavy', 'Loading', 'Two-handed'] },
    'net': { damage: '-', properties: ['Special', 'Thrown (5/15)'] },
    'blowgun': { damage: '1 piercing', properties: ['Ammunition', 'Loading'] },
};

// Weapon category lists - TODO: Move to rule engine data files
const SIMPLE_MELEE_WEAPONS = [
    'Club', 'Dagger', 'Greatclub', 'Handaxe', 'Javelin', 'Light Hammer', 
    'Mace', 'Quarterstaff', 'Sickle', 'Spear'
];

const SIMPLE_RANGED_WEAPONS = [
    'Crossbow, light', 'Dart', 'Shortbow', 'Sling'
];

const SIMPLE_WEAPONS = [...SIMPLE_MELEE_WEAPONS, ...SIMPLE_RANGED_WEAPONS];

const MARTIAL_MELEE_WEAPONS = [
    'Battleaxe', 'Flail', 'Glaive', 'Greataxe', 'Greatsword', 'Halberd',
    'Lance', 'Longsword', 'Maul', 'Morningstar', 'Pike', 'Rapier',
    'Scimitar', 'Shortsword', 'Trident', 'War Pick', 'Warhammer', 'Whip'
];

const MARTIAL_RANGED_WEAPONS = [
    'Blowgun', 'Crossbow, hand', 'Crossbow, heavy', 'Longbow', 'Net'
];

const MARTIAL_WEAPONS = [...MARTIAL_MELEE_WEAPONS, ...MARTIAL_RANGED_WEAPONS];

// Map choice item IDs to weapon lists
const WEAPON_CHOICE_LISTS: Record<string, string[]> = {
    'simple-weapon-choice': SIMPLE_WEAPONS,
    'simple-melee-choice': SIMPLE_MELEE_WEAPONS,
    'simple-ranged-choice': SIMPLE_RANGED_WEAPONS,
    'martial-weapon-choice': MARTIAL_WEAPONS,
    'martial-melee-choice': MARTIAL_MELEE_WEAPONS,
    'martial-ranged-choice': MARTIAL_RANGED_WEAPONS,
};

// Check if an item ID is a weapon choice placeholder
const isWeaponChoice = (itemId: string): boolean => {
    return itemId in WEAPON_CHOICE_LISTS;
};

// Get weapon options for a choice item ID
const getWeaponOptions = (itemId: string): { value: string; label: string }[] => {
    const weapons = WEAPON_CHOICE_LISTS[itemId] || [];
    return weapons.map(w => ({ value: w.toLowerCase(), label: w }));
};

const EquipmentChoiceSelector: React.FC<EquipmentChoiceSelectorProps> = ({
    equipmentGroups,
    selectedChoices,
    onChoiceSelect,
    weaponSubSelections: externalWeaponSubSelections,
    onWeaponSubSelect
}) => {
    // Local state for weapon sub-selections (fallback if not controlled externally)
    const [localWeaponSubSelections, setLocalWeaponSubSelections] = useState<Record<string, string>>({});
    
    // Use external state if provided, otherwise use local
    const weaponSubSelections = externalWeaponSubSelections ?? localWeaponSubSelections;
    
    const handleChange = useCallback((groupId: string, value: string) => {
        const optionIndex = parseInt(value, 10);
        onChoiceSelect(groupId, optionIndex);
    }, [onChoiceSelect]);

    const handleWeaponSubSelect = useCallback((groupId: string, weaponName: string | null) => {
        if (onWeaponSubSelect && weaponName) {
            onWeaponSubSelect(groupId, weaponName);
        } else if (weaponName) {
            setLocalWeaponSubSelections(prev => ({ ...prev, [groupId]: weaponName }));
        }
    }, [onWeaponSubSelect]);

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

                        {/* Show selected items detail and weapon sub-selector if needed */}
                        {hasSelection && group.options[selectedIndex] && (() => {
                            const selectedOption = group.options[selectedIndex];
                            // Check if any items are weapon choice placeholders (check by id)
                            const weaponChoiceItem = selectedOption.items.find(item => 
                                isWeaponChoice(item.id)
                            );
                            const weaponOptions = weaponChoiceItem ? getWeaponOptions(weaponChoiceItem.id) : [];
                            const selectedWeapon = weaponSubSelections[group.id];
                            
                            return (
                            <>
                                <Divider my="xs" />
                                    {weaponOptions.length > 0 ? (
                                        // Show weapon sub-selector
                                        <Box>
                                            {selectedWeapon ? (
                                                // Show confirmation when weapon selected
                                                <Box
                                                    p="xs"
                                                    style={{
                                                        backgroundColor: 'var(--mantine-color-green-0)',
                                                        borderRadius: 'var(--mantine-radius-sm)',
                                                        border: '1px solid var(--mantine-color-green-4)'
                                                    }}
                                                >
                                                    <Group justify="space-between" align="center">
                                                        <Group gap="xs">
                                                            <IconCheck size={14} color="var(--mantine-color-green-6)" />
                                                            <Text size="sm" fw={500}>
                                                                {weaponOptions.find(w => w.value === selectedWeapon)?.label || selectedWeapon}
                                                            </Text>
                                                        </Group>
                                                        <Text
                                                            size="xs"
                                                            c="blue"
                                                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                                            onClick={() => handleWeaponSubSelect(group.id, '')}
                                                        >
                                                            Change
                                                        </Text>
                                                    </Group>
                                                </Box>
                                            ) : (
                                                // Show dropdown to select weapon
                                                <Select
                                                    placeholder="Choose your weapon..."
                                                    data={weaponOptions}
                                                    value={selectedWeapon || null}
                                                    onChange={(value) => handleWeaponSubSelect(group.id, value)}
                                                    size="sm"
                                                    searchable
                                                    comboboxProps={{ withinPortal: true, zIndex: 500 }}
                                                />
                                            )}
                                        </Box>
                                    ) : (
                                        // Regular items display
                                <Text size="xs" c="dimmed">
                                            Receiving: {formatItems(selectedOption.items)}
                                </Text>
                                    )}
                            </>
                            );
                        })()}
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

                            // Check for weapon sub-selection (check by id)
                            const weaponChoiceItem = option.items.find(item => 
                                isWeaponChoice(item.id)
                            );
                            const selectedWeapon = weaponSubSelections[group.id];

                            // If there's a weapon choice, show the specific selection
                            if (weaponChoiceItem && selectedWeapon) {
                                const otherItems = option.items.filter(item => 
                                    !isWeaponChoice(item.id)
                                );
                                const weaponLabel = WEAPON_CHOICE_LISTS[weaponChoiceItem.id]
                                    ?.find(w => w.toLowerCase() === selectedWeapon) || selectedWeapon;
                                return (
                                    <Text key={group.id} size="sm">
                                        • {weaponLabel}{otherItems.length > 0 ? `, ${formatItems(otherItems)}` : ''}
                                    </Text>
                                );
                            }

                            // If weapon choice but not yet selected, show placeholder
                            if (weaponChoiceItem && !selectedWeapon) {
                                return (
                                    <Text key={group.id} size="sm" c="orange">
                                        • {option.description} <Text span size="xs">(choose weapon above)</Text>
                                    </Text>
                                );
                            }

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



