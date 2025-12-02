/**
 * ReviewStep Component
 * 
 * Final step of character creation wizard - Review & Finalize.
 * Displays complete character summary and allows name entry.
 * 
 * @module CharacterGenerator/creationDrawerComponents
 */

import React, { useMemo, useCallback } from 'react';
import { Stack, Text, Box, Title, Paper, Group, Badge, TextInput, Divider, Alert, Grid, SimpleGrid } from '@mantine/core';
import { IconUser, IconSword, IconShield, IconWand, IconHeart, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';
import { getAbilityModifier, getProficiencyBonus } from '../types/dnd5e/character.types';

const ReviewStep: React.FC = () => {
    const { character, updateCharacter, updateDnD5eData, ruleEngine, validation, isCharacterValid } = usePlayerCharacterGenerator();
    
    const dnd5eData = character?.dnd5eData;

    // Get class data
    const selectedClass = useMemo(() => {
        if (!dnd5eData?.classes?.length) return null;
        const classId = dnd5eData.classes[0]?.name?.toLowerCase();
        return ruleEngine.getAvailableClasses().find(c => c.id === classId) || null;
    }, [dnd5eData?.classes, ruleEngine]);

    // Get subclass if L1 subclass
    const subclass = useMemo(() => {
        if (!selectedClass || !dnd5eData?.classes?.[0]?.subclass) return null;
        return ruleEngine.getSubclassById(selectedClass.id, dnd5eData.classes[0].subclass);
    }, [selectedClass, dnd5eData?.classes, ruleEngine]);

    // Get spellcasting info
    const spellcastingInfo = useMemo(() => {
        if (!dnd5eData) return null;
        return ruleEngine.getSpellcastingInfo(dnd5eData);
    }, [dnd5eData, ruleEngine]);

    // Calculate derived stats
    const derivedStats = useMemo(() => {
        if (!dnd5eData || !selectedClass) return null;
        
        const level = dnd5eData.classes[0]?.level || 1;
        const conMod = getAbilityModifier(dnd5eData.abilityScores.constitution);
        const dexMod = getAbilityModifier(dnd5eData.abilityScores.dexterity);
        const profBonus = getProficiencyBonus(level);
        
        // Calculate HP (max at level 1)
        const hp = selectedClass.hitDie + conMod;
        
        // Calculate AC (assume no armor = 10 + DEX)
        const ac = 10 + dexMod;
        
        return {
            hp,
            ac,
            initiative: dexMod,
            speed: dnd5eData.race?.speed?.walk || 30,
            proficiencyBonus: profBonus
        };
    }, [dnd5eData, selectedClass]);

    // Handle name change
    const handleNameChange = useCallback((name: string) => {
        updateCharacter({ name });
    }, [updateCharacter]);

    // Format ability score for display
    const formatAbility = (score: number) => {
        const mod = getAbilityModifier(score);
        const sign = mod >= 0 ? '+' : '';
        return { score, modifier: `${sign}${mod}` };
    };

    if (!dnd5eData) {
        return <Text c="dimmed">Loading character data...</Text>;
    }

    const abilities = [
        { key: 'strength', label: 'STR', ...formatAbility(dnd5eData.abilityScores.strength) },
        { key: 'dexterity', label: 'DEX', ...formatAbility(dnd5eData.abilityScores.dexterity) },
        { key: 'constitution', label: 'CON', ...formatAbility(dnd5eData.abilityScores.constitution) },
        { key: 'intelligence', label: 'INT', ...formatAbility(dnd5eData.abilityScores.intelligence) },
        { key: 'wisdom', label: 'WIS', ...formatAbility(dnd5eData.abilityScores.wisdom) },
        { key: 'charisma', label: 'CHA', ...formatAbility(dnd5eData.abilityScores.charisma) }
    ];

    return (
        <Stack gap="md">
            {/* Header */}
            <Box>
                <Title order={4}>Review & Finalize</Title>
                <Text size="sm" c="dimmed">
                    Review your character and enter a name to complete creation.
                </Text>
            </Box>

            {/* Validation Status */}
            {!isCharacterValid ? (
                <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                    <Text size="sm" fw={500} mb="xs">Character Incomplete</Text>
                    <Stack gap={4}>
                        {validation.errors.map((error, idx) => (
                            <Text key={idx} size="xs">• {error.message}</Text>
                        ))}
                    </Stack>
                </Alert>
            ) : (
                <Alert icon={<IconCheck size={16} />} color="green" variant="light">
                    <Text size="sm">Character is complete and valid!</Text>
                </Alert>
            )}

            {/* Character Name */}
            <Paper p="md" withBorder>
                <TextInput
                    label="Character Name"
                    placeholder="Enter your character's name"
                    value={character?.name || ''}
                    onChange={(e) => handleNameChange(e.target.value)}
                    leftSection={<IconUser size={16} />}
                    size="md"
                />
            </Paper>

            {/* Core Info */}
            <Paper p="md" withBorder>
                <Text size="xs" fw={600} c="dimmed" mb="sm">CHARACTER SUMMARY</Text>
                <Group gap="md">
                    <div>
                        <Text size="xs" c="dimmed">Race</Text>
                        <Text size="sm" fw={500}>{dnd5eData.race?.name || 'Not selected'}</Text>
                    </div>
                    <div>
                        <Text size="xs" c="dimmed">Class</Text>
                        <Text size="sm" fw={500}>
                            {selectedClass?.name || 'Not selected'}
                            {subclass && ` (${subclass.name})`}
                            {' Level '}{dnd5eData.classes[0]?.level || 1}
                        </Text>
                    </div>
                    <div>
                        <Text size="xs" c="dimmed">Background</Text>
                        <Text size="sm" fw={500}>{dnd5eData.background?.name || 'Not selected'}</Text>
                    </div>
                </Group>
            </Paper>

            {/* Ability Scores */}
            <Paper p="md" withBorder>
                <Text size="xs" fw={600} c="dimmed" mb="sm">ABILITY SCORES</Text>
                <SimpleGrid cols={6}>
                    {abilities.map(ability => (
                        <Box key={ability.key} ta="center">
                            <Text size="xs" c="dimmed">{ability.label}</Text>
                            <Text size="lg" fw={700}>{ability.score}</Text>
                            <Badge size="sm" variant="light">{ability.modifier}</Badge>
                        </Box>
                    ))}
                </SimpleGrid>
            </Paper>

            {/* Combat Stats */}
            {derivedStats && (
                <Paper p="md" withBorder>
                    <Text size="xs" fw={600} c="dimmed" mb="sm">COMBAT STATS</Text>
                    <SimpleGrid cols={4}>
                        <Box ta="center">
                            <IconHeart size={20} color="red" />
                            <Text size="lg" fw={700}>{derivedStats.hp}</Text>
                            <Text size="xs" c="dimmed">HP</Text>
                        </Box>
                        <Box ta="center">
                            <IconShield size={20} />
                            <Text size="lg" fw={700}>{derivedStats.ac}</Text>
                            <Text size="xs" c="dimmed">AC</Text>
                        </Box>
                        <Box ta="center">
                            <Text size="lg" fw={700}>{derivedStats.initiative >= 0 ? '+' : ''}{derivedStats.initiative}</Text>
                            <Text size="xs" c="dimmed">Initiative</Text>
                        </Box>
                        <Box ta="center">
                            <Text size="lg" fw={700}>{derivedStats.speed}</Text>
                            <Text size="xs" c="dimmed">Speed (ft)</Text>
                        </Box>
                    </SimpleGrid>
                    <Divider my="sm" />
                    <Text size="sm" c="dimmed" ta="center">
                        Proficiency Bonus: <strong>+{derivedStats.proficiencyBonus}</strong>
                    </Text>
                </Paper>
            )}

            {/* Proficiencies */}
            <Paper p="md" withBorder>
                <Text size="xs" fw={600} c="dimmed" mb="sm">PROFICIENCIES</Text>
                <Stack gap="xs">
                    {dnd5eData.proficiencies?.skills?.length > 0 && (
                        <div>
                            <Text size="xs" c="dimmed">Skills</Text>
                            <Text size="sm">
                                {dnd5eData.proficiencies.skills.map(s => 
                                    s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                                ).join(', ')}
                            </Text>
                        </div>
                    )}
                    {selectedClass && (
                        <div>
                            <Text size="xs" c="dimmed">Saving Throws</Text>
                            <Text size="sm">
                                {selectedClass.savingThrows.map(s => 
                                    s.charAt(0).toUpperCase() + s.slice(1)
                                ).join(', ')}
                            </Text>
                        </div>
                    )}
                    {dnd5eData.race?.languages && (
                        <div>
                            <Text size="xs" c="dimmed">Languages</Text>
                            <Text size="sm">{dnd5eData.race.languages.join(', ')}</Text>
                        </div>
                    )}
                </Stack>
            </Paper>

            {/* Spellcasting Summary (if caster) */}
            {spellcastingInfo?.isSpellcaster && (
                <Paper p="md" withBorder>
                    <Group gap="xs" mb="sm">
                        <IconWand size={16} />
                        <Text size="xs" fw={600} c="dimmed">SPELLCASTING</Text>
                    </Group>
                    <SimpleGrid cols={3}>
                        <Box ta="center">
                            <Text size="lg" fw={700}>{spellcastingInfo.spellSaveDC || '—'}</Text>
                            <Text size="xs" c="dimmed">Spell DC</Text>
                        </Box>
                        <Box ta="center">
                            <Text size="lg" fw={700}>
                                {spellcastingInfo.spellAttackBonus !== undefined 
                                    ? `+${spellcastingInfo.spellAttackBonus}` 
                                    : '—'}
                            </Text>
                            <Text size="xs" c="dimmed">Spell Attack</Text>
                        </Box>
                        <Box ta="center">
                            <Text size="lg" fw={700}>{spellcastingInfo.cantripsKnown}</Text>
                            <Text size="xs" c="dimmed">Cantrips</Text>
                        </Box>
                    </SimpleGrid>
                    {spellcastingInfo.knownCantrips.length > 0 && (
                        <>
                            <Divider my="sm" />
                            <Text size="xs" c="dimmed">Known Cantrips</Text>
                            <Text size="sm">{spellcastingInfo.knownCantrips.join(', ') || 'None selected'}</Text>
                        </>
                    )}
                </Paper>
            )}

            {/* Features */}
            {dnd5eData.background?.feature && (
                <Paper p="md" withBorder>
                    <Text size="xs" fw={600} c="dimmed" mb="sm">BACKGROUND FEATURE</Text>
                    <Text size="sm" fw={500}>{dnd5eData.background.feature.name}</Text>
                    <Text size="xs" c="dimmed" lineClamp={3}>
                        {dnd5eData.background.feature.description}
                    </Text>
                </Paper>
            )}

            {/* Final Summary */}
            <Box
                p="sm"
                style={{
                    backgroundColor: isCharacterValid 
                        ? 'var(--mantine-color-green-0)' 
                        : 'var(--mantine-color-gray-1)',
                    borderRadius: 'var(--mantine-radius-sm)',
                    border: isCharacterValid 
                        ? '1px solid var(--mantine-color-green-3)' 
                        : '1px solid var(--mantine-color-gray-3)'
                }}
            >
                <Text size="sm" ta="center" c={isCharacterValid ? 'green' : 'dimmed'}>
                    {isCharacterValid 
                        ? '✓ Ready to finalize your character!' 
                        : 'Complete all steps to finalize your character'}
                </Text>
            </Box>
        </Stack>
    );
};

export default ReviewStep;

