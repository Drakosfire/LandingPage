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
import { Stack, Text, Box, ScrollArea, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';
import RaceCard from '../components/RaceCard';
import type { DnD5eRace } from '../types';

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
    
    // Get subraces for the selected base race
    const availableSubraces = useMemo(() => {
        if (!selectedBaseRace) return [];
        return ruleEngine.getSubraces(selectedBaseRace);
    }, [selectedBaseRace, ruleEngine]);
    
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
    const handleFlexibleBonusChange = useCallback((choices: Array<{ ability: string; bonus: number }>) => {
        console.log(`🎲 [RaceSelection] Flexible bonus choices:`, choices);
        
        updateDnD5eData({
            flexibleAbilityBonusChoices: choices
        });
    }, [updateDnD5eData]);
    
    // Get race-specific validation errors
    const raceValidationErrors = useMemo(() => {
        return validation.errors.filter(e => e.step === 'race');
    }, [validation]);
    
    // Format ability bonuses for display
    const formatAbilityBonuses = (race: DnD5eRace): string => {
        const bonuses = race.abilityBonuses
            .filter(b => b.ability !== 'choice')
            .map(b => `+${b.bonus} ${b.ability.substring(0, 3).toUpperCase()}`)
            .join(', ');
        
        // Check for flexible bonuses
        const choiceBonuses = race.abilityBonuses.filter(b => b.ability === 'choice');
        if (choiceBonuses.length > 0) {
            const choiceCount = choiceBonuses.reduce((sum, b) => sum + (b.choiceCount || 1), 0);
            return bonuses ? `${bonuses}, +1 to ${choiceCount} others` : `+1 to ${choiceCount} abilities`;
        }
        
        return bonuses;
    };
    
    return (
        <Stack gap="md" h="100%">
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
            
            {/* Scrollable Race List */}
            <ScrollArea style={{ flex: 1 }} offsetScrollbars>
                <Stack gap="xs">
                    {baseRaceOptions.map((race) => {
                        // Check if this race or one of its subraces is selected
                        const isSelected = selectedRaceId === race.id || 
                            (selectedBaseRace === race.baseRace || selectedBaseRace === race.id.split('-')[0]);
                        
                        // Get subraces for this base race
                        const subraces = ruleEngine.getSubraces(race.baseRace || race.id);
                        const hasSubraces = subraces.length > 0;
                        
                        return (
                            <RaceCard
                                key={race.id}
                                race={race}
                                isSelected={isSelected}
                                onSelect={handleRaceSelect}
                                subraces={hasSubraces ? subraces : undefined}
                                selectedSubraceId={selectedRaceId}
                                onSubraceSelect={handleSubraceSelect}
                                bonusesDisplay={formatAbilityBonuses(race)}
                                hasFlexibleBonuses={hasFlexibleBonuses && isSelected}
                                flexibleBonusOptions={flexibleBonusOptions}
                                currentFlexibleChoices={character?.dnd5eData?.flexibleAbilityBonusChoices}
                                onFlexibleBonusChange={handleFlexibleBonusChange}
                            />
                        );
                    })}
                </Stack>
            </ScrollArea>
            
            {/* Selection Summary */}
            {selectedRaceId && (
                <Box 
                    p="sm" 
                    style={{ 
                        backgroundColor: 'var(--mantine-color-dark-6)',
                        borderRadius: 'var(--mantine-radius-md)',
                        borderLeft: '4px solid var(--mantine-color-red-6)'
                    }}
                >
                    <Text size="sm" fw={500}>
                        Selected: {character?.dnd5eData?.race?.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                        Bonuses: {formatAbilityBonuses(character?.dnd5eData?.race as DnD5eRace)}
                    </Text>
                </Box>
            )}
        </Stack>
    );
};

export default RaceSelectionStep;

