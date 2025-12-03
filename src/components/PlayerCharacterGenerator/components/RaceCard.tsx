/**
 * RaceCard Component
 * 
 * Displays a single race option in the race selection list.
 * Features collapsible trait details and inline subrace selection.
 * 
 * @module CharacterGenerator/components
 */

import React, { useState, useCallback } from 'react';
import { Paper, Stack, Group, Text, Collapse, UnstyledButton, Radio, Badge, Box, Divider } from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import SubraceSelector from './SubraceSelector';
import FlexibleAbilityBonusSelector from './FlexibleAbilityBonusSelector';
import type { DnD5eRace } from '../types';
import type { FlexibleBonusConfig, AbilityBonusChoice } from '../engine';

interface RaceCardProps {
    race: DnD5eRace;
    isSelected: boolean;
    onSelect?: (race: DnD5eRace) => void;  // Optional - undefined for races with subraces
    subraces?: DnD5eRace[];
    selectedSubraceId?: string | null;
    onSubraceSelect?: (subrace: DnD5eRace) => void;
    bonusesDisplay: string;
    hasFlexibleBonuses?: boolean;
    flexibleBonusOptions?: FlexibleBonusConfig | null;
    currentFlexibleChoices?: AbilityBonusChoice[];
    onFlexibleBonusChange?: (choices: AbilityBonusChoice[]) => void;
}

const RaceCard: React.FC<RaceCardProps> = ({
    race,
    isSelected,
    onSelect,
    subraces,
    selectedSubraceId,
    onSubraceSelect,
    bonusesDisplay,
    hasFlexibleBonuses,
    flexibleBonusOptions,
    currentFlexibleChoices,
    onFlexibleBonusChange
}) => {
    const [traitsExpanded, setTraitsExpanded] = useState(false);

    const handleSelect = useCallback(() => {
        // If race has subraces, don't select the base race directly
        if (subraces && subraces.length > 0) {
            // Just expand to show subraces
            if (!isSelected) {
                // Select first subrace by default
                onSubraceSelect?.(subraces[0]);
            }
        } else if (onSelect) {
            onSelect(race);
        }
    }, [race, subraces, isSelected, onSelect, onSubraceSelect]);

    const toggleTraits = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setTraitsExpanded(prev => !prev);
    }, []);

    // Get speed display
    const speedDisplay = `${race.speed.walk} ft.`;

    // Get base race traits (not subrace-specific)
    const displayTraits = race.traits || [];

    return (
        <Paper
            p="sm"
            withBorder
            style={{
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--mantine-color-red-6)' : undefined,
                backgroundColor: isSelected ? 'var(--mantine-color-dark-6)' : undefined,
                transition: 'all 0.15s ease'
            }}
            onClick={handleSelect}
            data-testid={`race-card-${race.id}`}
        >
            <Stack gap="xs">
                {/* Header Row */}
                <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                        <Radio
                            checked={isSelected}
                            onChange={() => { }}
                            size="md"
                            color="red"
                            style={{ cursor: 'pointer' }}
                        />
                        <Box>
                            <Text fw={600} size="md">{race.name}</Text>
                            <Text size="xs" c="dimmed">
                                Speed: {speedDisplay} | Size: {race.size}
                            </Text>
                        </Box>
                    </Group>

                    <Badge
                        color="red"
                        variant="light"
                        size="sm"
                    >
                        {bonusesDisplay}
                    </Badge>
                </Group>

                {/* Traits Toggle */}
                <UnstyledButton
                    onClick={toggleTraits}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--mantine-color-dimmed)'
                    }}
                >
                    {traitsExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                    <Text size="xs">
                        {traitsExpanded ? 'Hide traits' : `Show ${displayTraits.length} traits`}
                    </Text>
                </UnstyledButton>

                {/* Collapsible Traits */}
                <Collapse in={traitsExpanded}>
                    <Box
                        p="xs"
                        style={{
                            backgroundColor: 'var(--mantine-color-dark-7)',
                            borderRadius: 'var(--mantine-radius-sm)'
                        }}
                    >
                        <Stack gap="xs">
                            {displayTraits.map(trait => (
                                <Box key={trait.id}>
                                    <Text size="sm" fw={500} c="red.4">• {trait.name}</Text>
                                    <Text size="xs" c="dimmed" ml="md">
                                        {trait.description.length > 150
                                            ? `${trait.description.substring(0, 150)}...`
                                            : trait.description
                                        }
                                    </Text>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                </Collapse>

                {/* Subrace Selector (if race has subraces and is selected) */}
                {isSelected && subraces && subraces.length > 0 && (
                    <>
                        <Divider my="xs" />
                        <SubraceSelector
                            subraces={subraces}
                            selectedSubraceId={selectedSubraceId || null}
                            onSelect={onSubraceSelect!}
                        />
                    </>
                )}

                {/* Flexible Ability Bonus Selector (Half-Elf) */}
                {isSelected && hasFlexibleBonuses && flexibleBonusOptions && onFlexibleBonusChange && (
                    <>
                        <Divider my="xs" />
                        <FlexibleAbilityBonusSelector
                            config={flexibleBonusOptions}
                            currentChoices={currentFlexibleChoices || []}
                            onChange={onFlexibleBonusChange}
                        />
                    </>
                )}
            </Stack>
        </Paper>
    );
};

export default RaceCard;

