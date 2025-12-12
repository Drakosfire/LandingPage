/**
 * BasicInfoStep Component
 * 
 * Step 0 of character creation wizard - Basic Information.
 * Captures essential character identity before mechanical choices.
 * 
 * Features:
 * - Character name (required for validation)
 * - Player name (optional)
 * - Character concept/backstory hook (optional, 2-3 sentences)
 * - Pronouns (optional dropdown)
 * 
 * Updates character context directly (live preview on canvas).
 * 
 * @module CharacterGenerator/creationDrawerComponents
 */

import React, { useCallback } from 'react';
import { Stack, Text, Box, Title, Paper, TextInput, Textarea, Select } from '@mantine/core';
import { IconUser, IconUsers, IconNote, IconGenderBigender } from '@tabler/icons-react';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';

const PRONOUN_OPTIONS = [
    { value: 'he/him', label: 'He/Him' },
    { value: 'she/her', label: 'She/Her' },
    { value: 'they/them', label: 'They/Them' },
    { value: 'other', label: 'Other / Custom' },
];

const BasicInfoStep: React.FC = () => {
    const { character, updateCharacter, updateDnD5eData } = usePlayerCharacterGenerator();

    const dnd5eData = character?.dnd5eData;

    // ===== HANDLERS (update context directly for live preview) =====

    const handleNameChange = useCallback((name: string) => {
        console.log('📝 [BasicInfo] Name changed:', name);
        updateCharacter({ name });
    }, [updateCharacter]);

    const handlePlayerNameChange = useCallback((playerName: string) => {
        console.log('📝 [BasicInfo] Player name changed:', playerName);
        updateCharacter({ playerName });
    }, [updateCharacter]);

    const handleConceptChange = useCallback((concept: string) => {
        console.log('📝 [BasicInfo] Concept changed:', concept);
        // Store in character notes (backstory concept)
        updateDnD5eData({
            backstoryConcept: concept
        });
    }, [updateDnD5eData]);

    const handlePronounsChange = useCallback((pronouns: string | null) => {
        console.log('📝 [BasicInfo] Pronouns changed:', pronouns);
        updateDnD5eData({
            pronouns: pronouns || undefined
        });
    }, [updateDnD5eData]);

    return (
        <Stack gap="md" data-testid="basic-info-step">
            {/* Header */}
            <Box>
                <Title order={4}>Basic Information</Title>
                <Text size="sm" c="dimmed">
                    Start with your character's identity. You can change these anytime.
                </Text>
            </Box>

            {/* Character Name (Primary Field) */}
            <Paper p="md" withBorder>
                <TextInput
                    label="Character Name"
                    placeholder="e.g., Thorin Ironforge, Lyra Shadowmend"
                    description="Your character's name as it will appear on the character sheet."
                    value={character?.name || ''}
                    onChange={(e) => handleNameChange(e.target.value)}
                    leftSection={<IconUser size={16} />}
                    size="md"
                    data-testid="character-name-input"
                />
            </Paper>

            {/* Player Name (Optional) */}
            <Paper p="sm" withBorder>
                <TextInput
                    label="Player Name"
                    placeholder="Your real name (optional)"
                    description="Helps identify whose character this is at the table."
                    value={character?.playerName || ''}
                    onChange={(e) => handlePlayerNameChange(e.target.value)}
                    leftSection={<IconUsers size={16} />}
                    size="sm"
                />
            </Paper>

            {/* Character Concept (Optional) */}
            <Paper p="sm" withBorder>
                <Textarea
                    label="Character Concept"
                    placeholder="A grizzled dwarf blacksmith seeking revenge for his clan... A curious elf scholar studying ancient magic..."
                    description="A 1-2 sentence hook that captures your character's core concept. This can guide your choices."
                    value={dnd5eData?.backstoryConcept || ''}
                    onChange={(e) => handleConceptChange(e.target.value)}
                    leftSection={<IconNote size={16} />}
                    minRows={2}
                    maxRows={4}
                    autosize
                    size="sm"
                />
            </Paper>

            {/* Pronouns (Optional) */}
            <Paper p="sm" withBorder>
                <Select
                    label="Pronouns"
                    placeholder="Select pronouns (optional)"
                    description="How your character should be referred to."
                    data={PRONOUN_OPTIONS}
                    value={dnd5eData?.pronouns || null}
                    onChange={handlePronounsChange}
                    leftSection={<IconGenderBigender size={16} />}
                    clearable
                    size="sm"
                    comboboxProps={{ withinPortal: true, zIndex: 400 }}
                />
            </Paper>

            {/* Guidance */}
            <Box
                p="sm"
                style={{
                    backgroundColor: 'var(--mantine-color-blue-0)',
                    borderRadius: 'var(--mantine-radius-sm)',
                    border: '1px solid var(--mantine-color-blue-2)'
                }}
            >
                <Text size="xs" c="blue.7">
                    💡 <strong>Tip:</strong> A character concept can help guide your race, class, and background choices. 
                    But don't worry — you can always come back and change it!
                </Text>
            </Box>

            {/* Live preview note */}
            <Text size="xs" c="dimmed" ta="center">
                Changes are saved automatically and shown on the character sheet.
            </Text>
        </Stack>
    );
};

export default BasicInfoStep;

