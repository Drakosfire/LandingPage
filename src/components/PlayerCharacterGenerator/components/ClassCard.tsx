/**
 * ClassCard Component
 * 
 * Displays a single class option in the class selection list.
 * Features collapsible details showing proficiencies and features.
 * 
 * @module CharacterGenerator/components
 */

import React, { useState, useCallback } from 'react';
import { Paper, Stack, Group, Text, Collapse, UnstyledButton, Badge, Box, Divider } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconAlertTriangle } from '@tabler/icons-react';
import type { DnD5eClass } from '../types';

interface ClassCardProps {
    classData: DnD5eClass;
    isSelected: boolean;
    onSelect: (classData: DnD5eClass) => void;
    requiresL1Subclass?: boolean;
}

const ClassCard: React.FC<ClassCardProps> = ({
    classData,
    isSelected,
    onSelect,
    requiresL1Subclass = false
}) => {
    const [detailsExpanded, setDetailsExpanded] = useState(false);

    const handleSelect = useCallback(() => {
        onSelect(classData);
    }, [classData, onSelect]);

    const toggleDetails = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setDetailsExpanded(prev => !prev);
    }, []);

    // Get key features for this class at level 1
    const level1Features = classData.features[1] || [];

    // Determine if class is a spellcaster
    const isSpellcaster = classData.spellcasting !== undefined;

    return (
        <Paper
            p="sm"
            withBorder
            style={{
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--mantine-color-blue-5)' : undefined,
                borderWidth: isSelected ? 2 : 1,
                backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined
            }}
            onClick={handleSelect}
        >
            <Stack gap="xs">
                {/* Header Row */}
                <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                        {/* Selection indicator */}
                        <Box
                            style={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                border: '2px solid var(--mantine-color-gray-4)',
                                backgroundColor: isSelected ? 'var(--mantine-color-blue-5)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {isSelected && (
                                <Box
                                    style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        backgroundColor: 'white'
                                    }}
                                />
                            )}
                        </Box>

                        {/* Class name and hit die */}
                        <div>
                            <Group gap="xs">
                                <Text fw={600}>{classData.name}</Text>
                                {requiresL1Subclass && (
                                    <Badge
                                        size="xs"
                                        color="orange"
                                        variant="light"
                                        leftSection={<IconAlertTriangle size={10} />}
                                    >
                                        L1 Subclass
                                    </Badge>
                                )}
                                {isSpellcaster && (
                                    <Badge size="xs" color="violet" variant="light">
                                        Spellcaster
                                    </Badge>
                                )}
                            </Group>
                        </div>
                    </Group>

                    {/* Hit Die Badge */}
                    <Badge variant="light" color="gray">
                        d{classData.hitDie} HP
                    </Badge>
                </Group>

                {/* Quick summary */}
                <Text size="sm" c="dimmed" lineClamp={1}>
                    {level1Features.slice(0, 2).map(f => f.name).join(', ')}
                    {level1Features.length > 2 && `, +${level1Features.length - 2} more`}
                </Text>

                {/* Expand/Collapse Button */}
                <UnstyledButton onClick={toggleDetails}>
                    <Group gap={4}>
                        {detailsExpanded ? (
                            <IconChevronDown size={14} />
                        ) : (
                            <IconChevronRight size={14} />
                        )}
                        <Text size="xs" c="dimmed">
                            {detailsExpanded ? 'Hide details' : 'Show details'}
                        </Text>
                    </Group>
                </UnstyledButton>

                {/* Collapsible Details */}
                <Collapse in={detailsExpanded}>
                    <Stack gap="xs" pt="xs">
                        <Divider />
                        
                        {/* Proficiencies */}
                        <Box>
                            <Text size="xs" fw={600} c="dimmed" mb={4}>PROFICIENCIES</Text>
                            <Text size="sm">
                                <strong>Saving Throws:</strong> {classData.savingThrows.map(s => 
                                    s.charAt(0).toUpperCase() + s.slice(1)
                                ).join(', ')}
                            </Text>
                            <Text size="sm">
                                <strong>Armor:</strong> {classData.armorProficiencies.length > 0 
                                    ? classData.armorProficiencies.join(', ')
                                    : 'None'}
                            </Text>
                            <Text size="sm">
                                <strong>Weapons:</strong> {classData.weaponProficiencies.join(', ')}
                            </Text>
                            {classData.toolProficiencies && classData.toolProficiencies.length > 0 && (
                                <Text size="sm">
                                    <strong>Tools:</strong> {classData.toolProficiencies.join(', ')}
                                </Text>
                            )}
                        </Box>

                        {/* Skills */}
                        <Box>
                            <Text size="xs" fw={600} c="dimmed" mb={4}>SKILL CHOICES</Text>
                            <Text size="sm">
                                Choose {classData.skillChoices.choose} from: {classData.skillChoices.from.join(', ')}
                            </Text>
                        </Box>

                        {/* Spellcasting */}
                        {isSpellcaster && classData.spellcasting && (
                            <Box>
                                <Text size="xs" fw={600} c="dimmed" mb={4}>SPELLCASTING</Text>
                                <Text size="sm">
                                    <strong>Ability:</strong> {classData.spellcasting.ability.charAt(0).toUpperCase() + 
                                        classData.spellcasting.ability.slice(1)}
                                </Text>
                                {classData.spellcasting.cantripsKnown[1] > 0 && (
                                    <Text size="sm">
                                        <strong>Cantrips at L1:</strong> {classData.spellcasting.cantripsKnown[1]}
                                    </Text>
                                )}
                                {classData.spellcasting.spellsKnown && classData.spellcasting.spellsKnown[1] > 0 && (
                                    <Text size="sm">
                                        <strong>Spells Known at L1:</strong> {classData.spellcasting.spellsKnown[1]}
                                    </Text>
                                )}
                                {classData.spellcasting.preparedSpells && (
                                    <Text size="sm">
                                        <strong>Prepared Spells:</strong> {classData.spellcasting.preparedSpells.formula}
                                    </Text>
                                )}
                                {classData.spellcasting.ritualCasting && (
                                    <Text size="sm">
                                        <strong>Ritual Casting:</strong> Yes
                                    </Text>
                                )}
                            </Box>
                        )}

                        {/* Level 1 Features */}
                        {level1Features.length > 0 && (
                            <Box>
                                <Text size="xs" fw={600} c="dimmed" mb={4}>LEVEL 1 FEATURES</Text>
                                <Stack gap={4}>
                                    {level1Features.map(feature => (
                                        <Box key={feature.id}>
                                            <Text size="sm" fw={500}>{feature.name}</Text>
                                            <Text size="xs" c="dimmed" lineClamp={3}>
                                                {feature.description}
                                            </Text>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}

                        {/* Subclasses */}
                        {classData.subclasses.length > 0 && (
                            <Box>
                                <Text size="xs" fw={600} c="dimmed" mb={4}>
                                    SUBCLASS (Level {classData.subclassLevel})
                                </Text>
                                <Text size="sm">
                                    {classData.subclasses.map(s => s.name).join(', ')}
                                </Text>
                            </Box>
                        )}
                    </Stack>
                </Collapse>
            </Stack>
        </Paper>
    );
};

export default ClassCard;



