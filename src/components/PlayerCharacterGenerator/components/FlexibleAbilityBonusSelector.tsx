/**
 * FlexibleAbilityBonusSelector Component
 * 
 * Allows selection of ability score bonuses for races with flexible bonuses.
 * Used for Half-Elf (+1 to two abilities of choice, excluding Charisma).
 * 
 * @module CharacterGenerator/components
 */

import React, { useCallback, useMemo } from 'react';
import { Box, Text, Checkbox, Group, Alert, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import type { FlexibleBonusConfig, AbilityBonusChoice } from '../engine';

// All ability names
const ALL_ABILITIES = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;
type AbilityName = typeof ALL_ABILITIES[number];

// Display names for abilities
const ABILITY_DISPLAY: Record<AbilityName, string> = {
    strength: 'Strength',
    dexterity: 'Dexterity',
    constitution: 'Constitution',
    intelligence: 'Intelligence',
    wisdom: 'Wisdom',
    charisma: 'Charisma'
};

interface FlexibleAbilityBonusSelectorProps {
    config: FlexibleBonusConfig;
    currentChoices: AbilityBonusChoice[];
    onChange: (choices: AbilityBonusChoice[]) => void;
}

const FlexibleAbilityBonusSelector: React.FC<FlexibleAbilityBonusSelectorProps> = ({
    config,
    currentChoices,
    onChange
}) => {
    // Get available abilities (excluding already-bonused abilities)
    const availableAbilities = useMemo(() => {
        const excluded = new Set(config.excludedAbilities || []);
        return ALL_ABILITIES.filter(ability => !excluded.has(ability));
    }, [config.excludedAbilities]);
    
    // Currently selected abilities
    const selectedAbilities = useMemo(() => {
        return new Set(currentChoices.map(c => c.ability));
    }, [currentChoices]);
    
    // Whether we've reached the max selections
    const isMaxSelected = selectedAbilities.size >= config.choiceCount;
    
    // Handle checkbox toggle
    const handleToggle = useCallback((ability: AbilityName) => {
        const isSelected = selectedAbilities.has(ability);
        
        if (isSelected) {
            // Remove this ability from choices
            const newChoices = currentChoices.filter(c => c.ability !== ability);
            onChange(newChoices);
        } else if (!isMaxSelected) {
            // Add this ability to choices
            const newChoices = [
                ...currentChoices,
                { ability, bonus: config.bonusPerChoice }
            ];
            onChange(newChoices);
        }
    }, [selectedAbilities, currentChoices, isMaxSelected, config.bonusPerChoice, onChange]);
    
    return (
        <Box>
            <Text size="xs" fw={500} c="dimmed" mb="xs">
                {`Choose ${config.choiceCount} ability scores to increase by +${config.bonusPerChoice}`}
            </Text>
            
            {/* Selection Count */}
            <Text size="xs" c={isMaxSelected ? "green" : "yellow"} mb="sm">
                Selected: {selectedAbilities.size} / {config.choiceCount}
            </Text>
            
            {/* Ability Checkboxes */}
            <Stack gap="xs">
                {availableAbilities.map(ability => {
                    const isSelected = selectedAbilities.has(ability);
                    const isDisabled = !isSelected && isMaxSelected;
                    
                    return (
                        <Checkbox
                            key={ability}
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={() => handleToggle(ability)}
                            label={
                                <Group gap="xs">
                                    <Text size="sm">
                                        {ABILITY_DISPLAY[ability]}
                                    </Text>
                                    {isSelected && (
                                        <Text size="xs" c="green">
                                            +{config.bonusPerChoice}
                                        </Text>
                                    )}
                                </Group>
                            }
                            color="red"
                            size="sm"
                            data-testid={`flexible-bonus-${ability}`}
                        />
                    );
                })}
            </Stack>
            
            {/* Warning if not enough selected */}
            {selectedAbilities.size < config.choiceCount && (
                <Alert 
                    icon={<IconAlertCircle size={14} />}
                    color="yellow"
                    variant="light"
                    mt="sm"
                    p="xs"
                >
                    <Text size="xs">
                        Select {config.choiceCount - selectedAbilities.size} more {selectedAbilities.size === config.choiceCount - 1 ? 'ability' : 'abilities'}
                    </Text>
                </Alert>
            )}
        </Box>
    );
};

export default FlexibleAbilityBonusSelector;

