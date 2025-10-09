// TextGenerationTab.tsx - Text Generation for Drawer (refactored from Step1)
// Simplified component without step navigation props

import React, { useState, useCallback } from 'react';
import { DUNGEONMIND_API_URL } from '../../../config';
import { Stack, Textarea, Checkbox, Button, Loader, Text, Group, Alert, Card } from '@mantine/core';
import { IconInfoCircle, IconWand } from '@tabler/icons-react';
import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';
import { normalizeStatblock } from '../../../utils/statblockNormalization';
import { StatBlockDetails } from '../../../types/statblock.types';

interface TextGenerationTabProps {
    onGenerationStart?: () => void;
    onGenerationComplete?: () => void;
}

const TextGenerationTab: React.FC<TextGenerationTabProps> = ({
    onGenerationStart,
    onGenerationComplete
}) => {
    const {
        creatureDetails,
        replaceCreatureDetails,
        setIsGenerating
    } = useStatBlockGenerator();

    const [includeSpellcasting, setIncludeSpellcasting] = useState(false);
    const [includeLegendaryActions, setIncludeLegendaryActions] = useState(false);
    const [includeLairActions, setIncludeLairActions] = useState(false);
    const [generationPrompt, setGenerationPrompt] = useState('');
    const [isLocalGenerating, setIsLocalGenerating] = useState(false);

    const handleGenerateCreature = useCallback(async () => {
        if (!generationPrompt.trim()) return;

        try {
            setIsGenerating(true);
            setIsLocalGenerating(true);
            onGenerationStart?.();

            const response = await fetch(
                `${DUNGEONMIND_API_URL}/api/statblockgenerator/generate-statblock`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        description: generationPrompt,
                        includeSpellcasting,
                        includeLegendaryActions,
                        includeLairActions,
                        size: creatureDetails.size,
                        type: creatureDetails.type,
                        alignment: creatureDetails.alignment
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`Generation failed: ${response.statusText}`);
            }

            const payload = await response.json();

            if (!payload?.success || !payload?.data?.statblock) {
                throw new Error('Unexpected response from StatBlock Generator');
            }

            const statblock = payload.data.statblock;

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

            replaceCreatureDetails(normalizedStatblock);

            onGenerationComplete?.();
        } catch (error) {
            console.error('Creature generation failed:', error);
        } finally {
            setIsGenerating(false);
            setIsLocalGenerating(false);
        }
    }, [
        generationPrompt,
        includeSpellcasting,
        includeLegendaryActions,
        includeLairActions,
        creatureDetails,
        replaceCreatureDetails,
        setIsGenerating,
        onGenerationStart,
        onGenerationComplete
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
                        />
                        <Checkbox
                            label="Legendary Actions"
                            checked={includeLegendaryActions}
                            onChange={(e) => setIncludeLegendaryActions(e.target.checked)}
                            disabled={isLocalGenerating}
                        />
                        <Checkbox
                            label="Lair Actions"
                            checked={includeLairActions}
                            onChange={(e) => setIncludeLairActions(e.target.checked)}
                            disabled={isLocalGenerating}
                        />
                    </Group>
                </Stack>
            </Card>

            {/* Generate Button */}
            <Button
                leftSection={isLocalGenerating ? <Loader size="sm" /> : <IconWand size={16} />}
                onClick={handleGenerateCreature}
                disabled={!generationPrompt.trim() || isLocalGenerating}
                loading={isLocalGenerating}
                size="md"
                fullWidth
                style={{ minHeight: 44 }}
            >
                {isLocalGenerating ? 'Generating Creature...' : 'Generate Creature with AI'}
            </Button>

            {/* Help Tips */}
            <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                <Text size="xs">
                    • Be descriptive about appearance and abilities<br />
                    • Mention habitat or environment<br />
                    • Include special powers or unique traits<br />
                    • Reference challenge level if you have a preference
                </Text>
            </Alert>
        </Stack>
    );
};

export default TextGenerationTab;

