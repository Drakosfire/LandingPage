/**
 * PCGInputForm Component - Input component for GenerationDrawerEngine
 * 
 * This component provides the input form used by the GenerationDrawerEngine.
 * It includes the concept textarea, class/level/race/background selects,
 * following the pattern from AIGenerationTab.tsx.
 * 
 * @module PlayerCharacterGenerator
 */

import React, { useMemo } from 'react';
import { Stack, Textarea, Select, Text, Divider, Group, Box } from '@mantine/core';
import type { InputSlotProps } from '../../shared/GenerationDrawerEngine';
import { usePlayerCharacterGenerator } from './PlayerCharacterGeneratorProvider';

// =============================================================================
// INPUT TYPE
// =============================================================================

export type LevelOption = 1 | 2 | 3;

/**
 * Input type for PCG generation.
 * Contains the user's concept and character options.
 */
export interface PCGInput {
    /** Character concept prompt */
    concept: string;
    /** Selected class ID */
    classId: string;
    /** Character level (1-3) */
    level: LevelOption;
    /** Base race ID (null = random) */
    baseRaceId: string | null;
    /** Subrace ID (only used when base race has subraces) */
    subraceId: string | null;
    /** Background ID (null = random) */
    backgroundId: string | null;
    /** Image generation prompt (populated by engine for IMAGE tab) */
    description?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const REQUIRED_COLOR = 'red.6';
const CONCEPT_MIN_ROWS = 4;
const CONCEPT_MAX_ROWS = 8;

// Backend PCG v0 catalogs are intentionally smaller than the frontend SRD lists.
// Filter generation-only selects to prevent "Unknown <id>" errors from /generate.
export const PCG_V0_CLASS_IDS = new Set([
    'barbarian',
    'fighter',
    'rogue',
    'wizard',
    'cleric',
    'bard',
    'warlock',
    'paladin',
    'ranger',
]);

export const PCG_V0_BASE_RACE_IDS = new Set([
    'human',
    'dwarf',
    'elf',
    'halfling',
    'gnome',
    'half-orc',
    'dragonborn',
    'half-elf',
    'tiefling',
]);

export const PCG_V0_BACKGROUND_IDS = new Set([
    'soldier',
    'sage',
    'criminal',
    'acolyte',
    'folk-hero',
    'noble'
]);

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * PCGInputForm component for the GenerationDrawerEngine.
 * 
 * Implements the InputSlotProps interface to work with the engine.
 * Provides:
 * - Concept textarea for character description
 * - Required: Class and Level selects
 * - Optional: Race, Subrace, and Background selects
 */
const PCGInputForm: React.FC<InputSlotProps<PCGInput>> = ({
    value,
    onChange,
    isGenerating,
    errors
}) => {
    const { ruleEngine } = usePlayerCharacterGenerator();

    // ===== OPTIONS =====
    const classOptions = useMemo(() => {
        return ruleEngine
            .getAvailableClasses()
            .filter((c) => PCG_V0_CLASS_IDS.has(c.id))
            .map((c) => ({ value: c.id, label: c.name }));
    }, [ruleEngine]);

    const baseRaceOptions = useMemo(() => {
        return ruleEngine
            .getBaseRaceOptions()
            .filter((r) => PCG_V0_BASE_RACE_IDS.has(r.id))
            .map((r) => ({ value: r.id, label: r.name, hasSubraces: r.hasSubraces }));
    }, [ruleEngine]);

    const selectedBaseRaceHasSubraces = useMemo(() => {
        if (!value.baseRaceId) return false;
        const opt = baseRaceOptions.find((r) => r.value === value.baseRaceId);
        return !!opt?.hasSubraces;
    }, [value.baseRaceId, baseRaceOptions]);

    const subraceOptions = useMemo(() => {
        if (!value.baseRaceId) return [];
        return ruleEngine.getSubraces(value.baseRaceId).map((sr) => ({
            value: sr.id,
            label: sr.name,
        }));
    }, [ruleEngine, value.baseRaceId]);

    const backgroundOptions = useMemo(() => {
        return ruleEngine
            .getAvailableBackgrounds()
            .filter((b) => PCG_V0_BACKGROUND_IDS.has(b.id))
            .map((b) => ({ value: b.id, label: b.name }));
    }, [ruleEngine]);

    // ===== HANDLERS =====
    const handleBaseRaceChange = (val: string | null) => {
        const next = val || null;
        onChange({
            baseRaceId: next,
            subraceId: null // Reset subrace when base race changes
        });
    };

    return (
        <Stack gap="md">
            {/* Main Concept Input */}
            <Textarea
                label="What's your character concept?"
                placeholder="A battle-hardened veteran seeking redemption after a war gone wrong..."
                value={value.concept}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    onChange({ concept: e.target.value })
                }
                autosize
                minRows={CONCEPT_MIN_ROWS}
                maxRows={CONCEPT_MAX_ROWS}
                disabled={isGenerating}
                required
                error={errors?.concept}
                data-testid="concept-input"
                data-tutorial="text-generation-input"
            />

            <Divider label="Required" labelPosition="center" color="red.3" />

            <Group grow align="flex-start">
                <Select
                    label={
                        <>
                            Class{' '}
                            <Text component="span" c={REQUIRED_COLOR} size="sm">
                                *
                            </Text>
                        </>
                    }
                    placeholder="Select a class"
                    data={classOptions}
                    value={value.classId}
                    onChange={(val) => onChange({ classId: val || '' })}
                    searchable
                    required
                    disabled={isGenerating}
                    error={errors?.classId}
                    comboboxProps={{ withinPortal: true, zIndex: 500 }}
                    data-testid="class-select"
                />
                <Select
                    label={
                        <>
                            Level{' '}
                            <Text component="span" c={REQUIRED_COLOR} size="sm">
                                *
                            </Text>
                        </>
                    }
                    data={[
                        { value: '1', label: '1' },
                        { value: '2', label: '2' },
                        { value: '3', label: '3' }
                    ]}
                    value={String(value.level)}
                    onChange={(val) => onChange({ level: (parseInt(val || '1', 10) as LevelOption) || 1 })}
                    disabled={isGenerating}
                    comboboxProps={{ withinPortal: true, zIndex: 500 }}
                    data-testid="level-select"
                />
            </Group>

            <Divider label="Optional (we'll pick for you)" labelPosition="center" color="gray.4" />

            <Group grow align="flex-start">
                <Select
                    label="Race"
                    placeholder="Random"
                    data={baseRaceOptions}
                    value={value.baseRaceId}
                    onChange={handleBaseRaceChange}
                    searchable
                    clearable
                    disabled={isGenerating}
                    comboboxProps={{ withinPortal: true, zIndex: 500 }}
                    data-testid="race-select"
                />
                {value.baseRaceId && selectedBaseRaceHasSubraces ? (
                    <Select
                        label={
                            <>
                                Subrace{' '}
                                <Text component="span" c={REQUIRED_COLOR} size="sm">
                                    *
                                </Text>
                            </>
                        }
                        placeholder="Select a subrace"
                        data={subraceOptions}
                        value={value.subraceId}
                        onChange={(val) => onChange({ subraceId: val || null })}
                        searchable
                        disabled={isGenerating}
                        error={errors?.subraceId}
                        comboboxProps={{ withinPortal: true, zIndex: 500 }}
                        data-testid="subrace-select"
                    />
                ) : (
                    <Select
                        label="Background"
                        placeholder="Random"
                        data={backgroundOptions}
                        value={value.backgroundId}
                        onChange={(val) => onChange({ backgroundId: val || null })}
                        searchable
                        clearable
                        disabled={isGenerating}
                        comboboxProps={{ withinPortal: true, zIndex: 500 }}
                        data-testid="background-select"
                    />
                )}
            </Group>

            {/* Background shows separately when subrace is visible */}
            {value.baseRaceId && selectedBaseRaceHasSubraces && (
                <Box>
                    <Select
                        label="Background"
                        placeholder="Random"
                        data={backgroundOptions}
                        value={value.backgroundId}
                        onChange={(val) => onChange({ backgroundId: val || null })}
                        searchable
                        clearable
                        disabled={isGenerating}
                        comboboxProps={{ withinPortal: true, zIndex: 500 }}
                        data-testid="background-select-subrace"
                    />
                    {!value.subraceId && (
                        <Text size="xs" c="red" mt="xs">
                            Please select a subrace to continue
                        </Text>
                    )}
                </Box>
            )}
        </Stack>
    );
};

export default PCGInputForm;
