/**
 * BackgroundCard Component
 * 
 * Displays a single background option in the background selection list.
 * Features collapsible details showing feature and suggested characteristics.
 * 
 * @module CharacterGenerator/components
 */

import React, { useState, useCallback } from 'react';
import { Paper, Stack, Group, Text, Collapse, UnstyledButton, Badge, Box, Divider } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconAlertTriangle } from '@tabler/icons-react';
import type { DnD5eBackground } from '../types';

interface BackgroundCardProps {
    background: DnD5eBackground;
    isSelected: boolean;
    onSelect: (background: DnD5eBackground) => void;
    hasSkillOverlap?: boolean;
}

const BackgroundCard: React.FC<BackgroundCardProps> = ({
    background,
    isSelected,
    onSelect,
    hasSkillOverlap = false
}) => {
    const [detailsExpanded, setDetailsExpanded] = useState(false);

    const handleSelect = useCallback(() => {
        onSelect(background);
    }, [background, onSelect]);

    const toggleDetails = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setDetailsExpanded(prev => !prev);
    }, []);

    // Format skill name for display
    const formatSkillName = (skill: string): string => {
        return skill.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

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

                        <div>
                            <Group gap="xs">
                                <Text fw={600}>{background.name}</Text>
                                {hasSkillOverlap && (
                                    <Badge
                                        size="xs"
                                        color="orange"
                                        variant="light"
                                        leftSection={<IconAlertTriangle size={10} />}
                                    >
                                        Skill Overlap
                                    </Badge>
                                )}
                            </Group>
                        </div>
                    </Group>
                </Group>

                {/* Quick summary */}
                <Text size="sm" c="dimmed">
                    Skills: {background.skillProficiencies.map(formatSkillName).join(', ')}
                    {background.toolProficiencies && background.toolProficiencies.length > 0 && (
                        <> | Tools: {background.toolProficiencies.join(', ')}</>
                    )}
                    {background.languageChoices && background.languageChoices > 0 && (
                        <> | Languages: {background.languageChoices} of choice</>
                    )}
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

                        {/* Description */}
                        <Box>
                            <Text size="sm">{background.description}</Text>
                        </Box>

                        {/* Feature */}
                        <Box>
                            <Text size="xs" fw={600} c="dimmed" mb={4}>FEATURE</Text>
                            <Text size="sm" fw={500}>{background.feature.name}</Text>
                            <Text size="xs" c="dimmed">
                                {background.feature.description}
                            </Text>
                        </Box>

                        {/* Equipment */}
                        <Box>
                            <Text size="xs" fw={600} c="dimmed" mb={4}>EQUIPMENT</Text>
                            <Text size="sm">
                                {background.equipment.join(', ')}
                            </Text>
                        </Box>

                        {/* Suggested Traits (sample) */}
                        {background.suggestedCharacteristics && (
                            <Box>
                                <Text size="xs" fw={600} c="dimmed" mb={4}>SAMPLE PERSONALITY TRAIT</Text>
                                <Text size="xs" fs="italic" c="dimmed">
                                    "{background.suggestedCharacteristics.traits[0]}"
                                </Text>
                            </Box>
                        )}
                    </Stack>
                </Collapse>
            </Stack>
        </Paper>
    );
};

export default BackgroundCard;



