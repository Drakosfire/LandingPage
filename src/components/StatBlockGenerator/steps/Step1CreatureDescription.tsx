// Step1CreatureDescription.tsx - Creature Description and AI Generation Step
// Following Step1TextGeneration.tsx patterns adapted for D&D creature generation

import React, { useState, useCallback } from 'react';
import { DUNGEONMIND_API_URL } from '../../../config';
import { Card, Text, Stack, Group, Title, Alert, Button, Textarea, Checkbox, Loader } from '@mantine/core';
import { IconInfoCircle, IconWand } from '@tabler/icons-react';
import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';
import { StatBlockStepProps, StatBlockDetails } from '../../../types/statblock.types';
import { normalizeStatblock } from '../../../utils/statblockNormalization';
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
        isAnyGenerationInProgress,
        setIsGenerating
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
            // Phase 3: Set flag to prevent auto-save during generation
            setIsGenerating(true);
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
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/statblockgenerator/generate-statblock`, {
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

            // Backend now sends camelCase (via model_dump(by_alias=True))
            // Just normalize IDs and pass through
            const statblock = payload.data.statblock;

            // DEBUG: Log what backend sent
            console.log('📥 [Step1] Backend response:', {
                name: statblock.name,
                hasActions: !!statblock.actions,
                actionsCount: statblock.actions?.length,
                actionNames: statblock.actions?.map((a: any) => a.name),
                hasTraits: !!statblock.specialAbilities,
                traitsCount: statblock.specialAbilities?.length,
                hasBonusActions: !!statblock.bonusActions,
                bonusActionsCount: statblock.bonusActions?.length,
                bonusActionNames: statblock.bonusActions?.map((a: any) => a.name),
                hasLegendary: !!statblock.legendaryActions,
                legendaryCount: statblock.legendaryActions?.actions?.length,
                legendaryNames: statblock.legendaryActions?.actions?.map((a: any) => a.name),
                hasLair: !!statblock.lairActions,
                lairCount: statblock.lairActions?.actions?.length,
                lairNames: statblock.lairActions?.actions?.map((a: any) => a.name),
                hasSpells: !!statblock.spells,
                spellsCount: statblock.spells?.knownSpells?.length
            });

            // CRITICAL: Normalize with explicit null→undefined conversion
            // Backend sends `null` for optional fields, we need to ensure they're undefined
            const normalizedStatblock: StatBlockDetails = normalizeStatblock({
                ...statblock,  // Backend already sends correct camelCase
                // Ensure senses has passivePerception default
                senses: {
                    ...statblock.senses,
                    passivePerception: statblock.senses?.passivePerception ?? 10
                },
                // Ensure abilities has intelligence mapped correctly
                abilities: {
                    str: statblock.abilities?.str ?? 0,
                    dex: statblock.abilities?.dex ?? 0,
                    con: statblock.abilities?.con ?? 0,
                    int: statblock.abilities?.int ?? 0,  // Backend sends 'int' not 'intelligence'
                    wis: statblock.abilities?.wis ?? 0,
                    cha: statblock.abilities?.cha ?? 0
                },
                // Explicitly handle null→undefined for special features
                spells: statblock.spells || undefined,
                legendaryActions: statblock.legendaryActions || undefined,
                lairActions: statblock.lairActions || undefined,
                bonusActions: statblock.bonusActions || undefined
            });

            console.log('✨ [Step1] After normalize:', {
                name: normalizedStatblock.name,
                actionsCount: normalizedStatblock.actions?.length,
                actionNames: normalizedStatblock.actions?.map(a => a.name),
                bonusActionsCount: normalizedStatblock.bonusActions?.length,
                bonusActionNames: normalizedStatblock.bonusActions?.map(a => a.name),
                traitsCount: normalizedStatblock.specialAbilities?.length,
                traitNames: normalizedStatblock.specialAbilities?.map(a => a.name),
                legendaryCount: normalizedStatblock.legendaryActions?.actions?.length,
                legendaryNames: normalizedStatblock.legendaryActions?.actions?.map(a => a.name),
                lairCount: normalizedStatblock.lairActions?.actions?.length,
                lairNames: normalizedStatblock.lairActions?.actions?.map(a => a.name)
            });

            // Clear existing state and replace with fresh data
            replaceCreatureDetails(normalizedStatblock);

        } catch (error) {
            console.error('Creature generation failed:', error);
            // TODO: Show error notification
        } finally {
            // Phase 3: Resume auto-save after generation completes
            setIsGenerating(false);
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
        onGenerationLockChange,
        setIsGenerating,
        replaceCreatureDetails
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
