/**
 * RaceSelectionStep Component
 * 
 * Step 2 of character creation wizard - Race Selection.
 * Displays a scrollable list of races with collapsible details.
 * 
 * Features:
 * - Scrollable list of race cards (not grid)
 * - Inline radio buttons for subrace selection
 * - Collapsible trait previews (collapsed by default)
 * - Flexible ability bonus selector for Half-Elf
 * - Validation feedback from rule engine
 * 
 * @module CharacterGenerator/creationDrawerComponents
 */

import React, { useMemo, useCallback } from 'react';
import { Stack, Text, Box, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';
import RaceCard from '../components/RaceCard';
import type { DnD5eRace } from '../types';
import type { AbilityBonusChoice } from '../engine';

const RaceSelectionStep: React.FC = () => {
    const { character, updateDnD5eData, ruleEngine, validation } = usePlayerCharacterGenerator();

    // Get all available races from the rule engine
    const allRaces = useMemo(() => {
        return ruleEngine.getAvailableRaces();
    }, [ruleEngine]);

    // Get base race options (for display - excludes subraces)
    const baseRaceOptions = useMemo(() => {
        return ruleEngine.getBaseRaceOptions();
    }, [ruleEngine]);

    // Get current selected race ID
    const selectedRaceId = character?.dnd5eData?.race?.id || null;

    // Get the selected base race (for subrace lookup)
    const selectedBaseRace = useMemo(() => {
        if (!selectedRaceId) return null;
        const selectedRace = allRaces.find(r => r.id === selectedRaceId);
        return selectedRace?.baseRace || selectedRace?.id.split('-')[0] || null;
    }, [selectedRaceId, allRaces]);

    // Check if selected race has flexible ability bonuses (Half-Elf)
    const hasFlexibleBonuses = useMemo(() => {
        if (!selectedRaceId) return false;
        return ruleEngine.hasFlexibleAbilityBonuses(selectedRaceId);
    }, [selectedRaceId, ruleEngine]);

    // Get flexible bonus options if applicable
    const flexibleBonusOptions = useMemo(() => {
        if (!hasFlexibleBonuses || !selectedRaceId) return null;
        return ruleEngine.getFlexibleAbilityBonusOptions(selectedRaceId);
    }, [hasFlexibleBonuses, selectedRaceId, ruleEngine]);

    // Handle race selection
    const handleRaceSelect = useCallback((race: DnD5eRace) => {
        console.log(`🧝 [RaceSelection] Selected race: ${race.name}`);

        updateDnD5eData({
            race: race,
            // Clear flexible bonus choices when switching races
            flexibleAbilityBonusChoices: undefined
        });
    }, [updateDnD5eData]);

    // Handle subrace selection
    const handleSubraceSelect = useCallback((subrace: DnD5eRace) => {
        console.log(`🧝 [RaceSelection] Selected subrace: ${subrace.name}`);

        updateDnD5eData({
            race: subrace,
            // Clear flexible bonus choices when switching subraces
            flexibleAbilityBonusChoices: undefined
        });
    }, [updateDnD5eData]);

    // Handle flexible ability bonus changes (Half-Elf)
    const handleFlexibleBonusChange = useCallback((choices: AbilityBonusChoice[]) => {
        console.log(`🎲 [RaceSelection] Flexible bonus choices:`, choices);

        updateDnD5eData({
            flexibleAbilityBonusChoices: choices
        });
    }, [updateDnD5eData]);

    // Get race-specific validation errors
    const raceValidationErrors = useMemo(() => {
        return validation.errors.filter(e => e.step === 'race');
    }, [validation]);

    // Format ability bonuses for display (using full DnD5eRace)
    const formatAbilityBonuses = (race: DnD5eRace): string => {
        const bonuses = race.abilityBonuses
            .filter(b => b.ability !== 'choice')
            .map(b => `+${b.bonus} ${b.ability.substring(0, 3).toUpperCase()}`)
            .join(', ');

        // Check for flexible bonuses (Half-Elf has 'choice' entries)
        const choiceBonuses = race.abilityBonuses.filter(b => b.ability === 'choice');
        if (choiceBonuses.length > 0) {
            // Half-Elf: +1 to two abilities of choice
            const totalChoices = choiceBonuses.reduce((sum, b) => sum + b.bonus, 0);
            return bonuses ? `${bonuses}, +1 to ${totalChoices} others` : `+1 to ${totalChoices} abilities`;
        }

        return bonuses;
    };

    // Get the full race data for a base race option
    const getFullRaceData = useCallback((baseRaceOption: { id: string; name: string; hasSubraces: boolean }): DnD5eRace | null => {
        // For races with subraces, find any matching full race (we'll use subraces for details)
        // For races without subraces, find the exact race
        if (baseRaceOption.hasSubraces) {
            // Find the first subrace to get representative data for the base race
            const subraces = ruleEngine.getSubraces(baseRaceOption.id);
            if (subraces.length > 0) {
                return subraces[0];
            }
        }
        // Find the exact race (no subraces)
        return allRaces.find(r => r.id === baseRaceOption.id) || null;
    }, [allRaces, ruleEngine]);

    return (
        <Stack gap="md">
            {/* Header */}
            <Box>
                <Text fw={600} size="lg">Race Selection</Text>
                <Text c="dimmed" size="sm">
                    Choose your character's race. Each race provides unique ability bonuses and traits.
                </Text>
            </Box>

            {/* Validation Errors */}
            {raceValidationErrors.length > 0 && (
                <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="Validation"
                    color="red"
                    variant="light"
                >
                    {raceValidationErrors.map((err, i) => (
                        <Text key={i} size="sm">{err.message}</Text>
                    ))}
                </Alert>
            )}

            {/* Race List - parent drawer handles scrolling */}
            <Stack gap="xs">
                {baseRaceOptions.map((baseRaceOption) => {
                    // Get full race data for display
                    const fullRaceData = getFullRaceData(baseRaceOption);
                    if (!fullRaceData) return null;

                    // Get subraces for this base race
                    const subraces = ruleEngine.getSubraces(baseRaceOption.id);
                    const hasSubraces = subraces.length > 0;

                    // Check if this race or one of its subraces is selected
                    const isSelected = selectedBaseRace === baseRaceOption.id ||
                        subraces.some(sr => sr.id === selectedRaceId);

                    return (
                        <RaceCard
                            key={baseRaceOption.id}
                            race={fullRaceData}
                            isSelected={isSelected}
                            onSelect={hasSubraces ? undefined : handleRaceSelect}
                            subraces={hasSubraces ? subraces : undefined}
                            selectedSubraceId={selectedRaceId}
                            onSubraceSelect={handleSubraceSelect}
                            bonusesDisplay={formatAbilityBonuses(fullRaceData)}
                            hasFlexibleBonuses={hasFlexibleBonuses && isSelected}
                            flexibleBonusOptions={flexibleBonusOptions}
                            currentFlexibleChoices={character?.dnd5eData?.flexibleAbilityBonusChoices}
                            onFlexibleBonusChange={handleFlexibleBonusChange}
                        />
                    );
                })}
            </Stack>

            {/* Selection Summary */}
            {selectedRaceId && character?.dnd5eData?.race && (
                <Box
                    p="sm"
                    style={{
                        backgroundColor: 'var(--mantine-color-gray-1)',
                        borderRadius: 'var(--mantine-radius-md)',
                        borderLeft: '4px solid var(--mantine-color-red-6)'
                    }}
                >
                    <Text size="sm" fw={500}>
                        Selected: {character.dnd5eData.race.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                        Bonuses: {formatAbilityBonuses(character.dnd5eData.race)}
                    </Text>
                </Box>
            )}

            {/* Live preview note */}
            <Text size="xs" c="dimmed" ta="center">
                Changes are saved automatically and shown on the character sheet.
            </Text>
        </Stack>
    );
};

export default RaceSelectionStep;
