/**
 * SpellSelector Component
 * 
 * Allows selection of cantrips and spells for spellcasting classes.
 * Handles both "known" casters (Bard, Sorcerer, Warlock) and 
 * "prepared" casters (Cleric, Druid, Wizard).
 * 
 * @module CharacterGenerator/components
 */

import React, { useCallback, useState, useMemo } from 'react';
import { Box, Stack, Checkbox, Text, Paper, Group, Badge, Collapse, UnstyledButton, Tabs, Alert, ScrollArea, Divider } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconWand, IconAlertCircle, IconBook } from '@tabler/icons-react';
import type { DnD5eSpell } from '../types';
import type { SpellcastingInfo } from '../engine';

interface SpellSelectorProps {
    spellcastingInfo: SpellcastingInfo;
    availableCantrips: DnD5eSpell[];
    availableSpells: DnD5eSpell[]; // Level 1 spells
    selectedCantrips: string[];
    selectedSpells: string[];
    onCantripsChange: (cantrips: string[]) => void;
    onSpellsChange: (spells: string[]) => void;
}

// Spell school colors
const SCHOOL_COLORS: Record<string, string> = {
    abjuration: 'blue',
    conjuration: 'yellow',
    divination: 'cyan',
    enchantment: 'pink',
    evocation: 'red',
    illusion: 'violet',
    necromancy: 'dark',
    transmutation: 'orange'
};

// Format casting time/duration for display
const formatSpellProperty = (value: string): string => {
    return value.charAt(0).toUpperCase() + value.slice(1);
};

// Single spell card component
const SpellCard: React.FC<{
    spell: DnD5eSpell;
    isSelected: boolean;
    isDisabled: boolean;
    onChange: (spellId: string, checked: boolean) => void;
}> = ({ spell, isSelected, isDisabled, onChange }) => {
    const [expanded, setExpanded] = useState(false);

    const handleToggle = useCallback(() => {
        if (!isDisabled || isSelected) {
            onChange(spell.id, !isSelected);
        }
    }, [spell.id, isSelected, isDisabled, onChange]);

    const toggleExpand = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(prev => !prev);
    }, []);

    return (
        <Paper
            p="xs"
            withBorder
            style={{
                cursor: isDisabled && !isSelected ? 'not-allowed' : 'pointer',
                opacity: isDisabled && !isSelected ? 0.6 : 1,
                borderColor: isSelected ? 'var(--mantine-color-violet-5)' : undefined,
                backgroundColor: isSelected ? 'var(--mantine-color-violet-0)' : undefined
            }}
            onClick={handleToggle}
        >
            <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                    <Checkbox
                        checked={isSelected}
                        disabled={isDisabled && !isSelected}
                        onChange={() => {}}
                        styles={{ input: { cursor: isDisabled && !isSelected ? 'not-allowed' : 'pointer' } }}
                    />
                    <div>
                        <Group gap="xs">
                            <Text size="sm" fw={500}>{spell.name}</Text>
                            <Badge
                                size="xs"
                                color={SCHOOL_COLORS[spell.school] || 'gray'}
                                variant="light"
                            >
                                {spell.school}
                            </Badge>
                            {spell.concentration && (
                                <Badge size="xs" color="orange" variant="light">C</Badge>
                            )}
                            {spell.ritual && (
                                <Badge size="xs" color="green" variant="light">R</Badge>
                            )}
                        </Group>
                        <Text size="xs" c="dimmed">
                            {spell.castingTime} | {spell.range}
                        </Text>
                    </div>
                </Group>

                <UnstyledButton onClick={toggleExpand}>
                    {expanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                </UnstyledButton>
            </Group>

            <Collapse in={expanded}>
                <Box mt="xs" pt="xs" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                    <Text size="xs" c="dimmed" mb={4}>
                        <strong>Duration:</strong> {formatSpellProperty(spell.duration)}
                    </Text>
                    <Text size="xs" c="dimmed" mb={4}>
                        <strong>Components:</strong> {[
                            spell.components.verbal && 'V',
                            spell.components.somatic && 'S',
                            spell.components.material && 'M'
                        ].filter(Boolean).join(', ')}
                        {spell.components.materialDescription && ` (${spell.components.materialDescription})`}
                    </Text>
                    <Text size="xs">{spell.description}</Text>
                </Box>
            </Collapse>
        </Paper>
    );
};

const SpellSelector: React.FC<SpellSelectorProps> = ({
    spellcastingInfo,
    availableCantrips,
    availableSpells,
    selectedCantrips,
    selectedSpells,
    onCantripsChange,
    onSpellsChange
}) => {
    // Calculate limits
    const maxCantrips = spellcastingInfo.cantripsKnown;
    const maxSpells = spellcastingInfo.maxSpellsKnown ?? spellcastingInfo.maxPreparedSpells ?? 0;
    const isPreparedCaster = spellcastingInfo.maxPreparedSpells !== undefined;
    const hasSpellbook = spellcastingInfo.spellListId === 'wizard';

    // Handle cantrip selection
    const handleCantripChange = useCallback((spellId: string, checked: boolean) => {
        if (checked && selectedCantrips.length < maxCantrips) {
            onCantripsChange([...selectedCantrips, spellId]);
        } else if (!checked) {
            onCantripsChange(selectedCantrips.filter(id => id !== spellId));
        }
    }, [selectedCantrips, maxCantrips, onCantripsChange]);

    // Handle spell selection
    const handleSpellChange = useCallback((spellId: string, checked: boolean) => {
        if (checked && selectedSpells.length < maxSpells) {
            onSpellsChange([...selectedSpells, spellId]);
        } else if (!checked) {
            onSpellsChange(selectedSpells.filter(id => id !== spellId));
        }
    }, [selectedSpells, maxSpells, onSpellsChange]);

    // Validation messages
    const cantripMessage = useMemo(() => {
        const remaining = maxCantrips - selectedCantrips.length;
        if (remaining > 0) {
            return `Select ${remaining} more cantrip${remaining !== 1 ? 's' : ''}`;
        }
        return null;
    }, [maxCantrips, selectedCantrips.length]);

    const spellMessage = useMemo(() => {
        const remaining = maxSpells - selectedSpells.length;
        if (remaining > 0) {
            if (hasSpellbook) {
                return `Choose ${remaining} more spell${remaining !== 1 ? 's' : ''} for your spellbook`;
            }
            return `${isPreparedCaster ? 'Prepare' : 'Learn'} ${remaining} more spell${remaining !== 1 ? 's' : ''}`;
        }
        return null;
    }, [maxSpells, selectedSpells.length, isPreparedCaster, hasSpellbook]);

    // No spellcasting
    if (!spellcastingInfo.isSpellcaster) {
        return (
            <Alert icon={<IconWand size={16} />} color="gray">
                This class is not a spellcaster.
            </Alert>
        );
    }

    // Handle half-casters with no L1 spells
    const noLevel1Spells = availableSpells.length === 0 && maxCantrips === 0;

    return (
        <Stack gap="md">
            {/* Spellcasting summary */}
            <Paper p="sm" withBorder>
                <Group gap="lg">
                    <div>
                        <Text size="xs" c="dimmed">Spellcasting Ability</Text>
                        <Text size="sm" fw={500}>
                            {spellcastingInfo.spellcastingAbility?.charAt(0).toUpperCase()}
                            {spellcastingInfo.spellcastingAbility?.slice(1)}
                        </Text>
                    </div>
                    <div>
                        <Text size="xs" c="dimmed">Spell Save DC</Text>
                        <Text size="sm" fw={500}>{spellcastingInfo.spellSaveDC ?? '—'}</Text>
                    </div>
                    <div>
                        <Text size="xs" c="dimmed">Spell Attack</Text>
                        <Text size="sm" fw={500}>
                            {spellcastingInfo.spellAttackBonus !== undefined 
                                ? `+${spellcastingInfo.spellAttackBonus}` 
                                : '—'}
                        </Text>
                    </div>
                </Group>
            </Paper>

            {/* Bonus spells from subclass */}
            {spellcastingInfo.bonusSpells.length > 0 && (
                <Alert icon={<IconBook size={16} />} color="violet" variant="light">
                    <Text size="sm" fw={500} mb={4}>Domain/Oath Spells (Always Prepared)</Text>
                    <Text size="sm">{spellcastingInfo.bonusSpells.join(', ')}</Text>
                </Alert>
            )}

            {/* Half-caster with no L1 spells message */}
            {noLevel1Spells && (
                <Alert icon={<IconWand size={16} />} color="blue" variant="light">
                    <Text size="sm">
                        Half-casters (Paladin, Ranger) don't gain spellcasting until Level 2.
                        Continue to the next step.
                    </Text>
                </Alert>
            )}

            {/* Tabs for Cantrips and Spells */}
            {!noLevel1Spells && (
                <Tabs defaultValue="cantrips">
                    <Tabs.List>
                        <Tabs.Tab value="cantrips" leftSection={<IconWand size={14} />}>
                            Cantrips ({selectedCantrips.length}/{maxCantrips})
                        </Tabs.Tab>
                        {maxSpells > 0 && (
                            <Tabs.Tab value="spells" leftSection={<IconBook size={14} />}>
                                {hasSpellbook ? 'Spellbook' : isPreparedCaster ? 'Prepared' : 'Known'} ({selectedSpells.length}/{maxSpells})
                            </Tabs.Tab>
                        )}
                    </Tabs.List>

                    {/* Cantrips Tab */}
                    <Tabs.Panel value="cantrips" pt="md">
                        {cantripMessage && (
                            <Alert
                                icon={<IconAlertCircle size={14} />}
                                color="orange"
                                variant="light"
                                mb="sm"
                            >
                                {cantripMessage}
                            </Alert>
                        )}

                        {availableCantrips.length === 0 ? (
                            <Text size="sm" c="dimmed">No cantrips available for this class.</Text>
                        ) : (
                            <ScrollArea h={300}>
                                <Stack gap="xs">
                                    {availableCantrips.map(spell => (
                                        <SpellCard
                                            key={spell.id}
                                            spell={spell}
                                            isSelected={selectedCantrips.includes(spell.id)}
                                            isDisabled={selectedCantrips.length >= maxCantrips}
                                            onChange={handleCantripChange}
                                        />
                                    ))}
                                </Stack>
                            </ScrollArea>
                        )}
                    </Tabs.Panel>

                    {/* Spells Tab */}
                    {maxSpells > 0 && (
                        <Tabs.Panel value="spells" pt="md">
                            {spellMessage && (
                                <Alert
                                    icon={<IconAlertCircle size={14} />}
                                    color="orange"
                                    variant="light"
                                    mb="sm"
                                >
                                    {spellMessage}
                                </Alert>
                            )}

                            {hasSpellbook && (
                                <Alert color="blue" variant="light" mb="sm">
                                    <Text size="sm">
                                        As a Wizard, you have a spellbook with 6 spells at Level 1.
                                        You prepare a number of spells each day equal to INT modifier + level.
                                    </Text>
                                </Alert>
                            )}

                            {availableSpells.length === 0 ? (
                                <Text size="sm" c="dimmed">No 1st-level spells available.</Text>
                            ) : (
                                <ScrollArea h={300}>
                                    <Stack gap="xs">
                                        {availableSpells.map(spell => (
                                            <SpellCard
                                                key={spell.id}
                                                spell={spell}
                                                isSelected={selectedSpells.includes(spell.id)}
                                                isDisabled={selectedSpells.length >= maxSpells}
                                                onChange={handleSpellChange}
                                            />
                                        ))}
                                    </Stack>
                                </ScrollArea>
                            )}
                        </Tabs.Panel>
                    )}
                </Tabs>
            )}

            {/* Selection summary */}
            {(selectedCantrips.length > 0 || selectedSpells.length > 0) && (
                <Paper p="sm" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                    <Text size="xs" fw={600} c="dimmed" mb={4}>SPELL SELECTION SUMMARY</Text>
                    {selectedCantrips.length > 0 && (
                        <>
                            <Text size="xs" fw={500}>Cantrips:</Text>
                            <Text size="sm" mb="xs">
                                {availableCantrips
                                    .filter(s => selectedCantrips.includes(s.id))
                                    .map(s => s.name)
                                    .join(', ')}
                            </Text>
                        </>
                    )}
                    {selectedSpells.length > 0 && (
                        <>
                            <Text size="xs" fw={500}>
                                {hasSpellbook ? 'Spellbook' : isPreparedCaster ? 'Prepared Spells' : 'Spells Known'}:
                            </Text>
                            <Text size="sm">
                                {availableSpells
                                    .filter(s => selectedSpells.includes(s.id))
                                    .map(s => s.name)
                                    .join(', ')}
                            </Text>
                        </>
                    )}
                </Paper>
            )}
        </Stack>
    );
};

export default SpellSelector;



