// Step1CreatureDescription.tsx - Creature Description and AI Generation Step
// Following Step1TextGeneration.tsx patterns adapted for D&D creature generation

import React, { useState, useCallback } from 'react';
import { DUNGEONMIND_API_URL } from '../../../config';
import { Card, Text, Stack, Group, Title, Alert, Button, Textarea, Checkbox, Loader } from '@mantine/core';
import { IconInfoCircle, IconWand } from '@tabler/icons-react';
import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';
import { StatBlockStepProps, StatBlockDetails } from '../../../types/statblock.types';
import '../../../styles/DesignSystem.css';

interface Step1CreatureDescriptionProps extends StatBlockStepProps { }

const Step1CreatureDescription: React.FC<Step1CreatureDescriptionProps> = ({
    onNext,
    onPrevious,
    canGoNext = false,
    canGoPrevious = false,
    currentStepIndex = 0,
    totalSteps = 5,
    onGenerationLockChange
}) => {
    const {
        creatureDetails,
        updateCreatureDetails,
        replaceCreatureDetails,
        generationLocks,
        isAnyGenerationInProgress
    } = useStatBlockGenerator();

    // Local state for generation options
    const [includeSpellcasting, setIncludeSpellcasting] = useState(false);
    const [includeLegendaryActions, setIncludeLegendaryActions] = useState(false);
    const [includeLairActions, setIncludeLairActions] = useState(false);
    const [generationPrompt, setGenerationPrompt] = useState('');

    // Handle AI generation
    const handleGenerateCreature = useCallback(async () => {
        if (!generationPrompt.trim()) return;

        try {
            onGenerationLockChange?.(true);

            // Prepare generation request
            const generationRequest = {
                description: generationPrompt,
                includeSpellcasting,
                includeLegendaryActions,
                includeLairActions,
                size: creatureDetails.size,
                type: creatureDetails.type,
                alignment: creatureDetails.alignment
            };

            // Call backend API
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/statblockgenerator/generate-creature`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include session cookies for authentication
                body: JSON.stringify(generationRequest)
            });

            if (!response.ok) {
                throw new Error(`Generation failed: ${response.statusText}`);
            }

            const payload = await response.json();

            if (!payload?.success || !payload?.data?.statblock) {
                throw new Error('Unexpected response from StatBlock Generator');
            }

            const normalizedStatblock: StatBlockDetails = {
                name: payload.data.statblock.name,
                size: payload.data.statblock.size,
                type: payload.data.statblock.type,
                subtype: payload.data.statblock.subtype ?? undefined,
                alignment: payload.data.statblock.alignment,
                armorClass: payload.data.statblock.armor_class,
                hitPoints: payload.data.statblock.hit_points,
                hitDice: payload.data.statblock.hit_dice,
                speed: {
                    walk: payload.data.statblock.speed?.walk ?? undefined,
                    fly: payload.data.statblock.speed?.fly ?? undefined,
                    swim: payload.data.statblock.speed?.swim ?? undefined,
                    climb: payload.data.statblock.speed?.climb ?? undefined,
                    burrow: payload.data.statblock.speed?.burrow ?? undefined
                },
                abilities: {
                    str: payload.data.statblock.abilities?.str ?? 0,
                    dex: payload.data.statblock.abilities?.dex ?? 0,
                    con: payload.data.statblock.abilities?.con ?? 0,
                    int: payload.data.statblock.abilities?.intelligence ?? 0,
                    wis: payload.data.statblock.abilities?.wis ?? 0,
                    cha: payload.data.statblock.abilities?.cha ?? 0
                },
                savingThrows: payload.data.statblock.saving_throws ?? undefined,
                skills: payload.data.statblock.skills ?? undefined,
                damageResistance: payload.data.statblock.damage_resistance ?? undefined,
                damageImmunity: payload.data.statblock.damage_immunity ?? undefined,
                conditionImmunity: payload.data.statblock.condition_immunity ?? undefined,
                damageVulnerability: payload.data.statblock.damage_vulnerability ?? undefined,
                senses: {
                    blindsight: payload.data.statblock.senses?.blindsight ?? undefined,
                    darkvision: payload.data.statblock.senses?.darkvision ?? undefined,
                    tremorsense: payload.data.statblock.senses?.tremorsense ?? undefined,
                    truesight: payload.data.statblock.senses?.truesight ?? undefined,
                    passivePerception: payload.data.statblock.senses?.passive_perception ?? 10
                },
                languages: payload.data.statblock.languages ?? '',
                challengeRating: payload.data.statblock.challenge_rating,
                xp: payload.data.statblock.xp ?? 0,
                proficiencyBonus: payload.data.statblock.proficiency_bonus ?? undefined,
                actions: payload.data.statblock.actions ?? [],
                bonusActions: payload.data.statblock.bonus_actions ?? undefined,
                reactions: payload.data.statblock.reactions ?? undefined,
                spells: payload.data.statblock.spells ?? undefined,
                legendaryActions: payload.data.statblock.legendary_actions ?? undefined,
                lairActions: payload.data.statblock.lair_actions ?? undefined,
                specialAbilities: payload.data.statblock.special_abilities ?? undefined,
                description: payload.data.statblock.description ?? '',
                sdPrompt: payload.data.statblock.sd_prompt ?? '',
                projectId: payload.data.statblock.project_id ?? undefined,
                createdAt: payload.data.statblock.created_at ?? undefined,
                lastModified: payload.data.statblock.last_modified ?? undefined,
                tags: payload.data.statblock.tags ?? []
            };

            replaceCreatureDetails(normalizedStatblock);

        } catch (error) {
            console.error('Creature generation failed:', error);
            // TODO: Show error notification
        } finally {
            onGenerationLockChange?.(false);
        }
    }, [
        generationPrompt,
        includeSpellcasting,
        includeLegendaryActions,
        includeLairActions,
        creatureDetails.size,
        creatureDetails.type,
        creatureDetails.alignment,
        updateCreatureDetails,
        onGenerationLockChange
    ]);

    // Quick fill suggestions
    const quickFillSuggestions = [
        { label: 'Forest Guardian', prompt: 'A mystical creature that protects ancient forests, with bark-like skin and glowing green eyes' },
        { label: 'Shadow Assassin', prompt: 'A deadly humanoid that can meld with shadows and strikes from darkness' },
        { label: 'Crystal Golem', prompt: 'A construct made of living crystal that pulses with magical energy' },
        { label: 'Flame Salamander', prompt: 'A fire-breathing lizard that dwells in volcanic regions' },
        { label: 'Storm Eagle', prompt: 'A magnificent bird that can summon lightning and control weather' },
    ];

    const handleQuickFill = (prompt: string) => {
        setGenerationPrompt(prompt);
    };

    return (
        <div
            id="step-panel-creature-description"
            role="tabpanel"
            aria-labelledby="step-tab-creature-description"
            className="step-panel"
        >
            <Stack gap="lg">
                {/* Main Generation Section */}
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="lg">
                        <div>
                            <Title order={3}>Describe Your Creature</Title>
                            <Text size="sm" c="dimmed">
                                Tell us about your creature and we’ll generate the full statblock. Core profile details
                                like size, type, and alignment will show up in the canvas preview once generated.
                            </Text>
                        </div>

                        {/* Quick Fill Suggestions */}
                        <div>
                            <Text size="sm" fw={500} mb="xs">Quick Start Ideas</Text>
                            <Group gap="xs">
                                {quickFillSuggestions.map((suggestion) => (
                                    <Button
                                        key={suggestion.label}
                                        variant="light"
                                        size="xs"
                                        onClick={() => handleQuickFill(suggestion.prompt)}
                                        disabled={isAnyGenerationInProgress}
                                    >
                                        {suggestion.label}
                                    </Button>
                                ))}
                            </Group>
                        </div>

                        {/* Main Description Input */}
                        <Textarea
                            label="Creature Description"
                            placeholder="Describe your creature... (e.g., 'A massive dragon with scales that shimmer like starlight, ancient and wise, dwelling in mountain peaks...')"
                            value={generationPrompt}
                            onChange={(e) => setGenerationPrompt(e.target.value)}
                            minRows={4}
                            maxRows={8}
                            disabled={isAnyGenerationInProgress}
                            required
                        />

                        {/* Advanced Options */}
                        <Card withBorder padding="md">
                            <Stack gap="md">
                                <Text size="sm" fw={500}>Advanced Options</Text>
                                <Group gap="lg">
                                    <Checkbox
                                        label="Include Spellcasting"
                                        checked={includeSpellcasting}
                                        onChange={(e) => setIncludeSpellcasting(e.target.checked)}
                                        disabled={isAnyGenerationInProgress}
                                    />
                                    <Checkbox
                                        label="Include Legendary Actions"
                                        checked={includeLegendaryActions}
                                        onChange={(e) => setIncludeLegendaryActions(e.target.checked)}
                                        disabled={isAnyGenerationInProgress}
                                    />
                                    <Checkbox
                                        label="Include Lair Actions"
                                        checked={includeLairActions}
                                        onChange={(e) => setIncludeLairActions(e.target.checked)}
                                        disabled={isAnyGenerationInProgress}
                                    />
                                </Group>
                            </Stack>
                        </Card>

                        {/* Generate Button */}
                        <Button
                            leftSection={generationLocks.creatureGeneration ? <Loader size="sm" /> : <IconWand size={16} />}
                            onClick={handleGenerateCreature}
                            disabled={!generationPrompt.trim() || isAnyGenerationInProgress}
                            loading={generationLocks.creatureGeneration}
                            size="lg"
                            fullWidth
                        >
                            {generationLocks.creatureGeneration ? 'Generating Creature...' : 'Generate Creature with AI'}
                        </Button>

                    </Stack>
                </Card>

                {/* Help Section */}
                <Alert icon={<IconInfoCircle size={16} />} title="Tips for Better Generation" color="blue">
                    <Text size="sm">
                        • Be descriptive about appearance, behavior, and abilities<br />
                        • Mention the creature's habitat or environment<br />
                        • Include any special powers or unique traits<br />
                        • Reference challenge level if you have a preference (e.g., "suitable for level 5 characters")
                    </Text>
                </Alert>

            </Stack>
        </div>
    );
};

export default Step1CreatureDescription;
