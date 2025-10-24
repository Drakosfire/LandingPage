// TextGenerationTab.tsx - Text Generation for Drawer (refactored from Step1)
// Simplified component without step navigation props

import React, { useState, useCallback, useEffect } from 'react';
import { DUNGEONMIND_API_URL } from '../../../config';
import { Stack, Textarea, Checkbox, Button, Loader, Text, Group, Alert, Card } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconInfoCircle, IconWand } from '@tabler/icons-react';
import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';
import { normalizeStatblock } from '../../../utils/statblockNormalization';
import { StatBlockDetails } from '../../../types/statblock.types';
import { TextGenerationProgress } from './TextGenerationProgress';
import { TutorialProgressBarSimulation } from '../TutorialProgressBarSimulation';
import { getComplexityLevel } from '../../../constants/textGenerationTiming';

interface TextGenerationTabProps {
    onGenerationStart?: () => void;
    onGenerationComplete?: () => void;
    initialPrompt?: string; // Pre-populate the prompt field
    isTutorialMode?: boolean; // Prevent real generation during tutorial
}

const TextGenerationTab: React.FC<TextGenerationTabProps> = ({
    onGenerationStart,
    onGenerationComplete,
    initialPrompt = '',
    isTutorialMode = false
}) => {
    const {
        creatureDetails,
        replaceCreatureDetails,
        setIsGenerating,
        setImagePrompt
    } = useStatBlockGenerator();

    const isMobile = useMediaQuery('(max-width: 768px)');

    const [includeSpellcasting, setIncludeSpellcasting] = useState(false);
    const [includeLegendaryActions, setIncludeLegendaryActions] = useState(false);
    const [includeLairActions, setIncludeLairActions] = useState(false);
    const [generationPrompt, setGenerationPrompt] = useState(initialPrompt);
    const [isLocalGenerating, setIsLocalGenerating] = useState(false);
    const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
    const [generationComplexity, setGenerationComplexity] = useState<string>('base');
    const [errorAlert, setErrorAlert] = useState<{
        type: 'error' | 'warning';
        title: string;
        message: string;
    } | null>(null);

    // Update prompt when initialPrompt changes (e.g., from new project creation)
    useEffect(() => {
        if (initialPrompt && initialPrompt !== generationPrompt) {
            setGenerationPrompt(initialPrompt);
        }
    }, [initialPrompt]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleGenerateCreature = useCallback(async () => {
        console.log('🎲 [TextGen] Generate clicked, isTutorialMode:', isTutorialMode, 'prompt:', generationPrompt.substring(0, 50));

        if (!generationPrompt.trim() && !isTutorialMode) {
            console.log('⚠️ [TextGen] No prompt provided, aborting');
            return;
        }

        // CRITICAL: Prevent real generation during tutorial BUT show progress bar for UX
        if (isTutorialMode) {
            console.log('🎓 [Tutorial] Tutorial mode ACTIVE - showing simulated progress animation (no API call)');
            console.log('🎓 [Tutorial] Setting isLocalGenerating = true');

            // Trigger the simulated progress bar
            // TutorialProgressBarSimulation component will handle timing and completion
            setIsLocalGenerating(true);
            onGenerationStart?.();

            console.log('🎓 [Tutorial] Progress bar should render now with data-tutorial="progress-bar"');

            // Note: The TutorialProgressBarSimulation component handles:
            // - 7 second progress animation
            // - Setting isLocalGenerating back to false
            // - Calling onGenerationComplete when done

            return;
        }

        // Clear any previous errors
        setErrorAlert(null);

        // Create AbortController for timeout handling
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => {
            abortController.abort();
        }, 150000); // 150 second timeout (2.5 minutes - longer than nginx/backend)

        try {
            // Determine complexity level for progress tracking
            const complexity = getComplexityLevel(
                includeSpellcasting,
                includeLegendaryActions,
                includeLairActions
            );
            setGenerationComplexity(complexity);

            // Track generation start time for progress bar
            const startTime = Date.now();
            setGenerationStartTime(startTime);

            setIsGenerating(true);
            setIsLocalGenerating(true);
            onGenerationStart?.();

            console.log(`🎲 Starting text generation with complexity: ${complexity}...`);

            const response = await fetch(
                `${DUNGEONMIND_API_URL}/api/statblockgenerator/generate-statblock`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    signal: abortController.signal,
                    body: JSON.stringify({
                        description: generationPrompt,
                        // NO challengeRatingTarget - let LLM decide based on description
                        includeSpellcasting,
                        includeLegendaryActions,
                        includeLairActions,
                        size: creatureDetails.size,
                        type: creatureDetails.type,
                        alignment: creatureDetails.alignment
                    })
                }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 504) {
                    throw new Error('GATEWAY_TIMEOUT');
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Server returned ${response.status}: ${response.statusText}`);
            }

            const payload = await response.json();

            if (!payload?.success || !payload?.data?.statblock) {
                throw new Error('Unexpected response from StatBlock Generator');
            }

            const statblock = payload.data.statblock;

            // DEBUG: Log what we received from backend
            console.log('🔍 [TextGen] Received statblock from backend:', {
                name: statblock.name,
                challengeRating: statblock.challengeRating,
                challenge_rating: statblock.challenge_rating,
                xp: statblock.xp,
                keys: Object.keys(statblock)
            });

            // Extract and set image prompt if present
            if (statblock.sdPrompt) {
                console.log('📝 Setting image prompt from generated statblock:', statblock.sdPrompt);
                setImagePrompt(statblock.sdPrompt);
            }

            // Normalize statblock with explicit null→undefined conversion
            const normalizedStatblock: StatBlockDetails = normalizeStatblock({
                ...statblock,
                senses: {
                    ...statblock.senses,
                    passivePerception: statblock.senses?.passivePerception ?? 10
                },
                abilities: {
                    str: statblock.abilities?.str ?? 0,
                    dex: statblock.abilities?.dex ?? 0,
                    con: statblock.abilities?.con ?? 0,
                    int: statblock.abilities?.int ?? 0,
                    wis: statblock.abilities?.wis ?? 0,
                    cha: statblock.abilities?.cha ?? 0
                },
                spells: statblock.spells || undefined,
                legendaryActions: statblock.legendaryActions || undefined,
                lairActions: statblock.lairActions || undefined,
                bonusActions: statblock.bonusActions || undefined
            });

            // DEBUG: Log after normalization
            console.log('🔍 [TextGen] After normalization:', {
                name: normalizedStatblock.name,
                challengeRating: normalizedStatblock.challengeRating,
                xp: normalizedStatblock.xp
            });

            replaceCreatureDetails(normalizedStatblock);

            // Log completion time
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✅ Text generation completed in ${duration}s`);

            onGenerationComplete?.();
        } catch (error: any) {
            console.error('❌ Creature generation failed:', error);

            // Handle different error types with user-friendly messages
            if (error.name === 'AbortError') {
                setErrorAlert({
                    type: 'warning',
                    title: 'Generation Timeout',
                    message: 'The AI took longer than expected to respond (over 2 minutes). Your creature may still be processing. Please try again with a simpler description, or wait a moment and check your Projects tab.'
                });
            } else if (error.message === 'GATEWAY_TIMEOUT') {
                setErrorAlert({
                    type: 'error',
                    title: 'Server Timeout',
                    message: 'The AI generation took too long (over 2 minutes). This usually happens with very complex creatures. Try simplifying your description or reducing optional features (spellcasting, legendary actions, lair actions).'
                });
            } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                setErrorAlert({
                    type: 'error',
                    title: 'Network Error',
                    message: 'Unable to connect to the server. Please check your internet connection and try again.'
                });
            } else {
                setErrorAlert({
                    type: 'error',
                    title: 'Generation Failed',
                    message: error.message || 'An unexpected error occurred. Please try again or contact support if the problem persists.'
                });
            }
        } finally {
            setIsGenerating(false);
            setIsLocalGenerating(false);
            setGenerationStartTime(null); // Clear progress tracking
        }
    }, [
        generationPrompt,
        includeSpellcasting,
        includeLegendaryActions,
        includeLairActions,
        creatureDetails,
        replaceCreatureDetails,
        setIsGenerating,
        setImagePrompt,
        onGenerationStart,
        onGenerationComplete,
        isTutorialMode
    ]);

    const quickFillSuggestions = [
        { label: 'Forest Guardian', prompt: 'A mystical creature that protects ancient forests, with bark-like skin and glowing green eyes' },
        { label: 'Shadow Assassin', prompt: 'A deadly humanoid that can meld with shadows and strikes from darkness' },
        { label: 'Crystal Golem', prompt: 'A construct made of living crystal that pulses with magical energy' },
        { label: 'Flame Salamander', prompt: 'A fire-breathing lizard that dwells in volcanic regions' },
        { label: 'Storm Eagle', prompt: 'A magnificent bird that can summon lightning and control weather' },
    ];

    return (
        <Stack gap="md">
            {/* Error Alert */}
            {errorAlert && (
                <Alert
                    color={errorAlert.type === 'error' ? 'red' : 'yellow'}
                    variant="light"
                    title={errorAlert.title}
                    withCloseButton
                    onClose={() => setErrorAlert(null)}
                >
                    <Text size="sm">{errorAlert.message}</Text>
                </Alert>
            )}

            {/* Quick Fill Suggestions */}
            <div>
                <Text size="sm" fw={500} mb="xs">Quick Start Ideas</Text>
                <Group gap="xs" wrap="wrap">
                    {quickFillSuggestions.map((suggestion) => (
                        <Button
                            key={suggestion.label}
                            variant="light"
                            size="xs"
                            onClick={() => setGenerationPrompt(suggestion.prompt)}
                            disabled={isLocalGenerating}
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
                disabled={isLocalGenerating}
                required
                data-tutorial="text-generation-input"
            />

            {/* Advanced Options */}
            <Card withBorder padding="sm">
                <Stack gap="xs">
                    <Text size="sm" fw={500}>Advanced Options</Text>
                    <Group gap="sm" wrap="wrap">
                        <Checkbox
                            label="Spellcasting"
                            checked={includeSpellcasting}
                            onChange={(e) => setIncludeSpellcasting(e.target.checked)}
                            disabled={isLocalGenerating}
                            data-tutorial="spellcasting-checkbox"
                        />
                        <Checkbox
                            label="Legendary Actions"
                            checked={includeLegendaryActions}
                            onChange={(e) => setIncludeLegendaryActions(e.target.checked)}
                            disabled={isLocalGenerating}
                            data-tutorial="legendary-checkbox"
                        />
                        <Checkbox
                            label="Lair Actions"
                            checked={includeLairActions}
                            onChange={(e) => setIncludeLairActions(e.target.checked)}
                            disabled={isLocalGenerating}
                            data-tutorial="lair-checkbox"
                        />
                    </Group>
                </Stack>
            </Card>

            {/* Generate Button */}
            <Button
                leftSection={isLocalGenerating ? <Loader size="sm" /> : <IconWand size={16} />}
                onClick={handleGenerateCreature}
                disabled={isTutorialMode ? false : (!generationPrompt.trim() || isLocalGenerating)}
                loading={isLocalGenerating}
                size="md"
                fullWidth
                style={{ minHeight: 44 }}
                data-tutorial="generate-button"
            >
                {isLocalGenerating ? 'Generating...' : (isMobile ? 'Generate' : 'Generate Creature with AI')}
            </Button>

            {/* Text Generation Progress */}
            {isLocalGenerating && isTutorialMode ? (
                // Tutorial mode: Show simulated progress bar
                <TutorialProgressBarSimulation
                    onComplete={() => {
                        console.log('✅ [Tutorial] Progress animation complete');
                        setIsLocalGenerating(false);
                        setGenerationStartTime(null);
                        onGenerationComplete?.(); // Notify tutorial to load demo
                    }}
                />
            ) : isLocalGenerating && generationStartTime ? (
                // Real generation: Show actual progress bar
                <TextGenerationProgress
                    complexity={generationComplexity}
                    startTime={generationStartTime}
                />
            ) : null}

            {/* Help Tips */}
            {!isLocalGenerating && (
                <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                    <Text size="xs">
                        • Be descriptive about appearance and abilities<br />
                        • Mention habitat or environment<br />
                        • Include special powers or unique traits<br />
                        • Reference challenge level if you have a preference
                    </Text>
                </Alert>
            )}
        </Stack>
    );
};

export default TextGenerationTab;

