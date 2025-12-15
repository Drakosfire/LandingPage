/**
 * SpellSelectionStep Component
 * 
 * Step 4 of character creation wizard - Spell Selection.
 * Only shown for spellcasting classes.
 * 
 * Features:
 * - Cantrip selection based on class
 * - Spell selection (for known casters) or spell list (for prepared casters)
 * - Clear feedback on selections remaining
 * 
 * @module CharacterGenerator/creationDrawerComponents
 */

import React, { useMemo, useCallback } from 'react';
import { Stack, Text, Box, Title, Alert, Group } from '@mantine/core';
import { IconWand, IconAlertCircle } from '@tabler/icons-react';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';
import { SpellSelector } from '../components';

const SpellSelectionStep: React.FC = () => {
    const {
        character,
        updateDnD5eData,
        ruleEngine,
        validation
    } = usePlayerCharacterGenerator();

    const dnd5eData = character?.dnd5eData;

    // Get spellcasting info
    const spellcastingInfo = useMemo(() => {
        if (!dnd5eData) return null;
        const info = ruleEngine.getSpellcastingInfo(dnd5eData);
        console.log('🔮 [SpellStep] spellcastingInfo:', {
            isSpellcaster: info.isSpellcaster,
            class: info.spellcastingClass,
            cantripsKnown: info.cantripsKnown,
            maxSpellsKnown: info.maxSpellsKnown
        });
        return info;
    }, [dnd5eData, ruleEngine]);

    // Get selected class data
    const selectedClass = useMemo(() => {
        if (!dnd5eData?.classes?.length) return null;
        const classId = dnd5eData.classes[0]?.name?.toLowerCase();
        return ruleEngine.getAvailableClasses().find(c => c.id === classId) || null;
    }, [dnd5eData?.classes, ruleEngine]);

    // Get available cantrips
    const availableCantrips = useMemo(() => {
        if (!dnd5eData) return [];
        const cantrips = ruleEngine.getAvailableSpells(dnd5eData, 0);
        console.log('🔮 [SpellStep] availableCantrips:', cantrips.length, cantrips.map(s => s.name));
        return cantrips;
    }, [dnd5eData, ruleEngine]);

    // Get available 1st level spells
    const availableSpells = useMemo(() => {
        if (!dnd5eData) return [];
        const spells = ruleEngine.getAvailableSpells(dnd5eData, 1);
        console.log('🔮 [SpellStep] availableSpells:', spells.length, spells.map(s => s.name));
        return spells;
    }, [dnd5eData, ruleEngine]);

    // Current selections
    const selectedCantrips = dnd5eData?.selectedCantrips || [];
    const selectedSpells = dnd5eData?.selectedSpells || [];

    // Validation errors for this step
    const spellErrors = useMemo(() => {
        return validation.errors.filter(e => e.step === 'spells');
    }, [validation]);

    // Handle cantrip changes
    const handleCantripsChange = useCallback((cantrips: string[]) => {
        updateDnD5eData({
            selectedCantrips: cantrips
        });
    }, [updateDnD5eData]);

    // Handle spell changes
    const handleSpellsChange = useCallback((spells: string[]) => {
        updateDnD5eData({
            selectedSpells: spells
        });
    }, [updateDnD5eData]);

    // Not a spellcaster check
    if (!spellcastingInfo?.isSpellcaster) {
        return (
            <Stack gap="md" h="100%" align="center" justify="center">
                <Text c="dimmed">This class doesn't cast spells.</Text>
                <Text size="sm" c="dimmed">Click "Next" to continue.</Text>
            </Stack>
        );
    }

    if (!dnd5eData) {
        return <Text c="dimmed">Loading character data...</Text>;
    }

    return (
        <Stack gap="md">
            {/* Header */}
            <Box>
                <Group gap="xs">
                    <IconWand size={20} />
                    <Title order={4}>Spell Selection</Title>
                </Group>
                <Text size="sm" c="dimmed">
                    Choose your starting cantrips and spells for {selectedClass?.name}.
                </Text>
            </Box>

            {/* Validation Errors */}
            {spellErrors.length > 0 && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                    <Stack gap={4}>
                        {spellErrors.map((error, idx) => (
                            <Text key={idx} size="sm">{error.message}</Text>
                        ))}
                    </Stack>
                </Alert>
            )}

            {/* Spell Selector Component */}
            <Box>
                <SpellSelector
                    spellcastingInfo={spellcastingInfo}
                    availableCantrips={availableCantrips}
                    availableSpells={availableSpells}
                    selectedCantrips={selectedCantrips}
                    selectedSpells={selectedSpells}
                    onCantripsChange={handleCantripsChange}
                    onSpellsChange={handleSpellsChange}
                />
            </Box>

            {/* Live preview note */}
            <Text size="xs" c="dimmed" ta="center">
                Changes are saved automatically and shown on the character sheet.
            </Text>
        </Stack>
    );
};

export default SpellSelectionStep;
