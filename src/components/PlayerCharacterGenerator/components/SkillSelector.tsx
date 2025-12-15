/**
 * SkillSelector Component
 * 
 * Checkbox-based skill selection for class skill proficiencies.
 * Enforces the class's skill count limit.
 * 
 * @module CharacterGenerator/components
 */

import React, { useCallback, useMemo } from 'react';
import { Box, Checkbox, Group, Text, SimpleGrid, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import type { SkillChoice } from '../engine';

interface SkillSelectorProps {
    skillChoices: SkillChoice;
    onSelectionChange: (selectedSkills: string[]) => void;
}

// Skill display names (capitalize properly)
const SKILL_DISPLAY_NAMES: Record<string, string> = {
    'Acrobatics': 'Acrobatics (DEX)',
    'Animal Handling': 'Animal Handling (WIS)',
    'Arcana': 'Arcana (INT)',
    'Athletics': 'Athletics (STR)',
    'Deception': 'Deception (CHA)',
    'History': 'History (INT)',
    'Insight': 'Insight (WIS)',
    'Intimidation': 'Intimidation (CHA)',
    'Investigation': 'Investigation (INT)',
    'Medicine': 'Medicine (WIS)',
    'Nature': 'Nature (INT)',
    'Perception': 'Perception (WIS)',
    'Performance': 'Performance (CHA)',
    'Persuasion': 'Persuasion (CHA)',
    'Religion': 'Religion (INT)',
    'Sleight of Hand': 'Sleight of Hand (DEX)',
    'Stealth': 'Stealth (DEX)',
    'Survival': 'Survival (WIS)'
};

const SkillSelector: React.FC<SkillSelectorProps> = ({
    skillChoices,
    onSelectionChange
}) => {
    const { count, options, selected } = skillChoices;

    // Check if we've selected the maximum number of skills
    const maxReached = selected.length >= count;

    // Validation state
    const validationMessage = useMemo(() => {
        if (selected.length < count) {
            return `Select ${count - selected.length} more skill${count - selected.length !== 1 ? 's' : ''}`;
        }
        return null;
    }, [selected.length, count]);

    // Handle checkbox change
    const handleCheckboxChange = useCallback((skill: string, checked: boolean) => {
        if (checked) {
            // Add skill if under limit
            if (selected.length < count) {
                onSelectionChange([...selected, skill]);
            }
        } else {
            // Remove skill
            onSelectionChange(selected.filter(s => s !== skill));
        }
    }, [selected, count, onSelectionChange]);

    return (
        <Box>
            {/* Validation message */}
            {validationMessage && (
                <Alert
                    icon={<IconAlertCircle size={14} />}
                    color="orange"
                    variant="light"
                    mb="sm"
                    py="xs"
                >
                    <Text size="sm">{validationMessage}</Text>
                </Alert>
            )}

            {/* Counter */}
            <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                    {selected.length} of {count} selected
                </Text>
            </Group>

            {/* Skill checkboxes */}
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xs">
                {options.map(skill => {
                    const isSelected = selected.includes(skill);
                    const isDisabled = !isSelected && maxReached;

                    return (
                        <Checkbox
                            key={skill}
                            label={SKILL_DISPLAY_NAMES[skill] || skill}
                            checked={isSelected}
                            disabled={isDisabled}
                            color="red"
                            onChange={(event) => handleCheckboxChange(skill, event.currentTarget.checked)}
                            styles={{
                                label: {
                                    opacity: isDisabled ? 0.5 : 1
                                }
                            }}
                        />
                    );
                })}
            </SimpleGrid>

            {/* Selected skills summary */}
            {selected.length > 0 && (
                <Box mt="sm" p="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: 4 }}>
                    <Text size="xs" fw={600} c="dimmed">Selected Skills:</Text>
                    <Text size="sm">{selected.join(', ')}</Text>
                </Box>
            )}
        </Box>
    );
};

export default SkillSelector;



