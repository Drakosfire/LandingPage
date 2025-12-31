/**
 * StatBlock Input Form - Input component for GenerationDrawerEngine
 * 
 * This component provides the input form used by the GenerationDrawerEngine.
 * It includes the description textarea, advanced options (checkboxes), and
 * preserves all data-tutorial attributes for the onboarding flow.
 * 
 * @module StatBlockGenerator
 */

import React from 'react';
import { Stack, Textarea, Checkbox, Card, Text, Group } from '@mantine/core';
import type { StatBlockInput } from './statblockEngineConfig';
import type { InputSlotProps } from '../../shared/GenerationDrawerEngine';

/**
 * StatBlockInputForm component for the GenerationDrawerEngine.
 * 
 * Implements the InputSlotProps interface to work with the engine.
 * Provides:
 * - Description textarea for creature description
 * - Advanced options (spellcasting, legendary actions, lair actions)
 * - Tutorial data attributes for onboarding
 */
const StatBlockInputForm: React.FC<InputSlotProps<StatBlockInput>> = ({
    value,
    onChange,
    isGenerating,
    isTutorialMode,
    errors
}) => {
    return (
        <Stack gap="md">
            {/* Main Description Input */}
            <Textarea
                label="Creature Description"
                placeholder="Describe your creature... (e.g., 'A massive dragon with scales that shimmer like starlight, ancient and wise, dwelling in mountain peaks...')"
                value={value.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    onChange({ description: e.target.value })
                }
                minRows={4}
                maxRows={8}
                disabled={isGenerating}
                required
                error={errors?.description}
                data-testid="description-input"
                data-tutorial="text-generation-input"
            />

            {/* Advanced Options */}
            <Card withBorder padding="sm">
                <Stack gap="xs">
                    <Text size="sm" fw={500}>Advanced Options</Text>
                    <Group gap="sm" wrap="wrap">
                        <Checkbox
                            label="Spellcasting"
                            checked={value.includeSpellcasting}
                            onChange={(e) => onChange({ includeSpellcasting: e.target.checked })}
                            disabled={isGenerating}
                            data-tutorial="spellcasting-checkbox"
                        />
                        <Checkbox
                            label="Legendary Actions"
                            checked={value.includeLegendaryActions}
                            onChange={(e) => onChange({ includeLegendaryActions: e.target.checked })}
                            disabled={isGenerating}
                            data-tutorial="legendary-checkbox"
                        />
                        <Checkbox
                            label="Lair Actions"
                            checked={value.includeLairActions}
                            onChange={(e) => onChange({ includeLairActions: e.target.checked })}
                            disabled={isGenerating}
                            data-tutorial="lair-checkbox"
                        />
                    </Group>
                </Stack>
            </Card>
        </Stack>
    );
};

export default StatBlockInputForm;


