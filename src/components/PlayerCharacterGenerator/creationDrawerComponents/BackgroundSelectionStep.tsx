/**
 * BackgroundSelectionStep Component
 * 
 * Step 5 of character creation wizard - Background Selection.
 * Displays a scrollable list of backgrounds with skill overlap detection.
 * 
 * Features:
 * - Scrollable list of background cards (not grid)
 * - Collapsible details (collapsed by default)
 * - Skill overlap detection with class skills
 * - Replacement skill selector when overlap occurs
 * - Validation feedback from rule engine
 * 
 * @module CharacterGenerator/creationDrawerComponents
 */

import React, { useMemo, useCallback, useState } from 'react';
import { Stack, Text, Box, ScrollArea, Alert, Title, Radio, Group, Paper, Divider } from '@mantine/core';
import { IconAlertCircle, IconAlertTriangle } from '@tabler/icons-react';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';
import BackgroundCard from '../components/BackgroundCard';
import type { DnD5eBackground } from '../types';
import { findDuplicateSkills } from '../types/dnd5e/background.types';

// All available skills for replacement
const ALL_SKILLS = [
    'acrobatics', 'animal-handling', 'arcana', 'athletics', 'deception',
    'history', 'insight', 'intimidation', 'investigation', 'medicine',
    'nature', 'perception', 'performance', 'persuasion', 'religion',
    'sleight-of-hand', 'stealth', 'survival'
];

const BackgroundSelectionStep: React.FC = () => {
    const {
        character,
        updateDnD5eData,
        ruleEngine,
        validation
    } = usePlayerCharacterGenerator();

    const dnd5eData = character?.dnd5eData;

    // Track replacement skill choices
    const [replacementSkills, setReplacementSkills] = useState<Record<string, string>>({});

    // Get all available backgrounds
    const availableBackgrounds = useMemo(() => {
        return ruleEngine.getAvailableBackgrounds();
    }, [ruleEngine]);

    // Get currently selected background
    const selectedBackground = dnd5eData?.background || null;

    // Get class skills (already selected in class step)
    const classSkills = useMemo(() => {
        return dnd5eData?.proficiencies?.skills || [];
    }, [dnd5eData?.proficiencies?.skills]);

    // Detect skill overlaps between background and class
    const skillOverlaps = useMemo(() => {
        if (!selectedBackground) return [];
        return findDuplicateSkills(selectedBackground.skillProficiencies, classSkills);
    }, [selectedBackground, classSkills]);

    // Get available replacement skills (not already proficient)
    const availableReplacements = useMemo(() => {
        const allProficient = new Set([
            ...classSkills,
            ...(selectedBackground?.skillProficiencies || []),
            ...Object.values(replacementSkills)
        ]);
        return ALL_SKILLS.filter(skill => !allProficient.has(skill));
    }, [classSkills, selectedBackground, replacementSkills]);

    // Validation errors for this step
    const backgroundErrors = useMemo(() => {
        return validation.errors.filter(e => e.step === 'background');
    }, [validation]);

    // Handle background selection
    const handleBackgroundSelect = useCallback((background: DnD5eBackground) => {
        updateDnD5eData({
            background: background
        });
        // Reset replacement skills when changing background
        setReplacementSkills({});
    }, [updateDnD5eData]);

    // Handle replacement skill selection
    const handleReplacementSelect = useCallback((overlappingSkill: string, replacementSkill: string) => {
        setReplacementSkills(prev => ({
            ...prev,
            [overlappingSkill]: replacementSkill
        }));

        // Update the character's skill proficiencies with the replacement
        if (dnd5eData?.proficiencies) {
            const newSkills = [
                ...classSkills,
                ...(selectedBackground?.skillProficiencies || []).filter(s => s !== overlappingSkill),
                replacementSkill
            ];
            
            // Remove duplicates
            const uniqueSkills = [...new Set(newSkills)];
            
            updateDnD5eData({
                proficiencies: {
                    ...dnd5eData.proficiencies,
                    skills: uniqueSkills
                }
            });
        }
    }, [dnd5eData?.proficiencies, classSkills, selectedBackground, updateDnD5eData]);

    // Format skill name for display
    const formatSkillName = (skill: string): string => {
        return skill.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    if (!dnd5eData) {
        return <Text c="dimmed">Loading character data...</Text>;
    }

    return (
        <Stack gap="md" h="100%">
            {/* Header */}
            <Box>
                <Title order={4}>Background Selection</Title>
                <Text size="sm" c="dimmed">
                    Choose your character's background. This represents your past and grants skills, tools, and a special feature.
                </Text>
            </Box>

            {/* Validation Errors */}
            {backgroundErrors.length > 0 && (
                <Alert
                    icon={<IconAlertCircle size={16} />}
                    color="red"
                    variant="light"
                >
                    <Stack gap={4}>
                        {backgroundErrors.map((error, idx) => (
                            <Text key={idx} size="sm">{error.message}</Text>
                        ))}
                    </Stack>
                </Alert>
            )}

            {/* Scrollable Background List */}
            <ScrollArea style={{ flex: 1 }} offsetScrollbars>
                <Stack gap="xs">
                    {availableBackgrounds.map(background => (
                        <BackgroundCard
                            key={background.id}
                            background={background}
                            isSelected={selectedBackground?.id === background.id}
                            onSelect={handleBackgroundSelect}
                            hasSkillOverlap={
                                selectedBackground?.id === background.id && 
                                skillOverlaps.length > 0
                            }
                        />
                    ))}
                </Stack>
            </ScrollArea>

            {/* Skill Overlap Warning */}
            {selectedBackground && skillOverlaps.length > 0 && (
                <Paper p="md" withBorder style={{ borderColor: 'var(--mantine-color-orange-5)' }}>
                    <Group gap="xs" mb="sm">
                        <IconAlertTriangle size={20} color="var(--mantine-color-orange-5)" />
                        <Text fw={600} size="sm">Skill Overlap Detected</Text>
                    </Group>
                    
                    <Text size="sm" c="dimmed" mb="md">
                        Your class already grants proficiency in skills that {selectedBackground.name} also provides.
                        Choose replacement skills:
                    </Text>

                    <Stack gap="md">
                        {skillOverlaps.map(overlappingSkill => (
                            <Box key={overlappingSkill}>
                                <Text size="sm" mb="xs">
                                    Replace <strong>{formatSkillName(overlappingSkill)}</strong> with:
                                </Text>
                                <Radio.Group
                                    value={replacementSkills[overlappingSkill] || ''}
                                    onChange={(value) => handleReplacementSelect(overlappingSkill, value)}
                                >
                                    <Group gap="md">
                                        {availableReplacements.slice(0, 6).map(skill => (
                                            <Radio
                                                key={skill}
                                                value={skill}
                                                label={formatSkillName(skill)}
                                                size="sm"
                                            />
                                        ))}
                                    </Group>
                                </Radio.Group>
                            </Box>
                        ))}
                    </Stack>
                </Paper>
            )}

            {/* Selection Summary */}
            {selectedBackground && (
                <Box
                    p="sm"
                    style={{
                        backgroundColor: 'var(--mantine-color-gray-1)',
                        borderRadius: 'var(--mantine-radius-sm)'
                    }}
                >
                    <Text size="sm" fw={600}>
                        Selected: {selectedBackground.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                        Skills: {selectedBackground.skillProficiencies.map(formatSkillName).join(', ')}
                        {selectedBackground.toolProficiencies && selectedBackground.toolProficiencies.length > 0 && (
                            <> | Tools: {selectedBackground.toolProficiencies.join(', ')}</>
                        )}
                        {selectedBackground.languageChoices && selectedBackground.languageChoices > 0 && (
                            <> | Languages: +{selectedBackground.languageChoices}</>
                        )}
                    </Text>
                </Box>
            )}
        </Stack>
    );
};

export default BackgroundSelectionStep;

