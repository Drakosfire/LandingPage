/**
 * SubclassSelector Component
 * 
 * Displays inline radio buttons for selecting a subclass.
 * Used for classes that choose subclass at Level 1 (Cleric, Sorcerer, Warlock).
 * 
 * @module CharacterGenerator/components
 */

import React, { useCallback, useState } from 'react';
import { Stack, Radio, Text, Box, Group, Collapse, UnstyledButton, Badge, Divider } from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import type { DnD5eSubclass } from '../types';

interface SubclassSelectorProps {
    subclasses: DnD5eSubclass[];
    selectedSubclassId: string | null;
    onSelect: (subclass: DnD5eSubclass) => void;
    className: string; // Parent class name for context
}

const SubclassSelector: React.FC<SubclassSelectorProps> = ({
    subclasses,
    selectedSubclassId,
    onSelect,
    className
}) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleChange = useCallback((subclassId: string) => {
        const subclass = subclasses.find(s => s.id === subclassId);
        if (subclass) {
            onSelect(subclass);
        }
    }, [subclasses, onSelect]);

    const toggleExpand = useCallback((e: React.MouseEvent, subclassId: string) => {
        e.stopPropagation();
        setExpandedId(prev => prev === subclassId ? null : subclassId);
    }, []);

    // Get subclass type label based on class
    const subclassLabel = (() => {
        switch (className) {
            case 'Cleric': return 'Divine Domain';
            case 'Sorcerer': return 'Sorcerous Origin';
            case 'Warlock': return 'Otherworldly Patron';
            case 'Druid': return 'Druid Circle';
            case 'Fighter': return 'Martial Archetype';
            case 'Rogue': return 'Roguish Archetype';
            case 'Wizard': return 'Arcane Tradition';
            case 'Barbarian': return 'Primal Path';
            case 'Monk': return 'Monastic Tradition';
            case 'Paladin': return 'Sacred Oath';
            case 'Ranger': return 'Ranger Archetype';
            case 'Bard': return 'Bard College';
            default: return 'Subclass';
        }
    })();

    return (
        <Box>
            <Radio.Group
                value={selectedSubclassId || ''}
                onChange={handleChange}
            >
                <Stack gap="xs">
                    {subclasses.map(subclass => {
                        const isSelected = selectedSubclassId === subclass.id;
                        const isExpanded = expandedId === subclass.id;
                        
                        // Get level 1 features (or first available features)
                        const firstFeatureLevel = Object.keys(subclass.features)
                            .map(Number)
                            .sort((a, b) => a - b)[0];
                        const features = subclass.features[firstFeatureLevel] || [];
                        
                        // Check if subclass grants spells
                        const grantsSpells = subclass.spellsGranted && 
                            Object.keys(subclass.spellsGranted).length > 0;

                        return (
                            <Box
                                key={subclass.id}
                                p="sm"
                                style={{
                                    border: '1px solid',
                                    borderColor: isSelected 
                                        ? 'var(--mantine-color-blue-5)' 
                                        : 'var(--mantine-color-gray-3)',
                                    borderRadius: 'var(--mantine-radius-sm)',
                                    backgroundColor: isSelected 
                                        ? 'var(--mantine-color-blue-0)' 
                                        : undefined
                                }}
                            >
                                <Group justify="space-between" wrap="nowrap" mb={4}>
                                    <Radio
                                        value={subclass.id}
                                        label={
                                            <Group gap="xs" wrap="nowrap">
                                                <Text fw={500}>{subclass.name}</Text>
                                                {grantsSpells && (
                                                    <Badge size="xs" color="violet" variant="light">
                                                        Bonus Spells
                                                    </Badge>
                                                )}
                                            </Group>
                                        }
                                        styles={{
                                            radio: { cursor: 'pointer' },
                                            label: { cursor: 'pointer' }
                                        }}
                                    />
                                </Group>

                                {/* Brief description */}
                                <Text size="xs" c="dimmed" ml={28} lineClamp={2}>
                                    {subclass.description}
                                </Text>

                                {/* Expand/Collapse for features */}
                                <UnstyledButton
                                    onClick={(e) => toggleExpand(e, subclass.id)}
                                    ml={28}
                                    mt="xs"
                                >
                                    <Group gap={4}>
                                        {isExpanded ? (
                                            <IconChevronDown size={14} />
                                        ) : (
                                            <IconChevronRight size={14} />
                                        )}
                                        <Text size="xs" c="dimmed">
                                            {isExpanded ? 'Hide features' : 'Show features'}
                                        </Text>
                                    </Group>
                                </UnstyledButton>

                                {/* Expanded features */}
                                <Collapse in={isExpanded}>
                                    <Box ml={28} mt="xs">
                                        <Divider mb="xs" />
                                        
                                        {/* Subclass spells if any */}
                                        {subclass.spellsGranted && Object.keys(subclass.spellsGranted).length > 0 && (
                                            <Box mb="xs">
                                                <Text size="xs" fw={600} c="dimmed" mb={4}>
                                                    DOMAIN/OATH SPELLS
                                                </Text>
                                                <Stack gap={2}>
                                                    {Object.entries(subclass.spellsGranted).map(([level, spells]) => (
                                                        <Text key={level} size="xs">
                                                            Level {level}: {(spells as string[]).join(', ')}
                                                        </Text>
                                                    ))}
                                                </Stack>
                                            </Box>
                                        )}

                                        {/* Level features */}
                                        {features.length > 0 && (
                                            <Box>
                                                <Text size="xs" fw={600} c="dimmed" mb={4}>
                                                    LEVEL {firstFeatureLevel} FEATURES
                                                </Text>
                                                <Stack gap="xs">
                                                    {features.map(feature => (
                                                        <Box key={feature.id}>
                                                            <Text size="sm" fw={500}>{feature.name}</Text>
                                                            <Text size="xs" c="dimmed" lineClamp={4}>
                                                                {feature.description}
                                                            </Text>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </Box>
                                        )}
                                    </Box>
                                </Collapse>
                            </Box>
                        );
                    })}
                </Stack>
            </Radio.Group>

            {/* Selection summary */}
            {selectedSubclassId && (
                <Box
                    mt="sm"
                    p="xs"
                    style={{
                        backgroundColor: 'var(--mantine-color-gray-0)',
                        borderRadius: 4
                    }}
                >
                    <Text size="xs" c="dimmed">
                        Selected {subclassLabel}: <strong>
                            {subclasses.find(s => s.id === selectedSubclassId)?.name}
                        </strong>
                    </Text>
                </Box>
            )}
        </Box>
    );
};

export default SubclassSelector;



