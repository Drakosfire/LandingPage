/**
 * AIGenerationTab Component
 *
 * Phase 5.2: Simple "Generate a Character" UI that calls the unified backend
 * `POST /api/playercharactergenerator/generate` endpoint and hydrates the returned
 * `Character` into the PlayerCharacterGenerator context.
 *
 * Notes:
 * - Race/Background are optional; when empty we pick random base IDs client-side.
 * - Progress is simulated (backend does not stream progress events).
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Stack,
    Title,
    Text,
    Textarea,
    Divider,
    Select,
    Button,
    Group,
    Progress,
    Alert,
    Box
} from '@mantine/core';
import { IconAlertCircle, IconSparkles, IconWand } from '@tabler/icons-react';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';
import { DUNGEONMIND_API_URL } from '../../../config';

interface AIGenerationTabProps {
    onGenerationComplete?: () => void; // Callback after success (drawer can switch tab/step)
}

const REQUIRED_COLOR = 'red.6';
const GENERATE_BTN = 'violet';
const PROGRESS_COLOR = 'violet';
const CONCEPT_MIN_ROWS = 4;
const CONCEPT_MAX_ROWS = 8;
const CONCEPT_MIN_LENGTH = 10;

type LevelOption = 1 | 2 | 3;

// Backend PCG v0 catalogs are intentionally smaller than the frontend SRD lists.
// Filter generation-only selects to prevent "Unknown <id>" errors from /generate.
const PCG_V0_RACE_IDS = new Set(['human', 'dwarf', 'elf', 'halfling', 'half-orc']);
const PCG_V0_BACKGROUND_IDS = new Set(['soldier', 'sage', 'criminal', 'acolyte', 'folk-hero', 'noble']);

const AIGenerationTab: React.FC<AIGenerationTabProps> = ({ onGenerationComplete }) => {
    const { ruleEngine, setCharacter, clearCurrentProject } = usePlayerCharacterGenerator();
    const isDev = process.env.NODE_ENV !== 'production';

    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // ===== FORM STATE =====
    const [concept, setConcept] = useState('');
    const [classId, setClassId] = useState<string>('');
    const [level, setLevel] = useState<LevelOption>(1);
    const [raceId, setRaceId] = useState<string | null>(null); // null = random
    const [backgroundId, setBackgroundId] = useState<string | null>(null); // null = random
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<{ percent: number; message: string }>({ percent: 0, message: '' });

    // ===== OPTIONS =====
    const classOptions = useMemo(() => {
        return ruleEngine.getAvailableClasses().map((c) => ({ value: c.id, label: c.name }));
    }, [ruleEngine]);

    const raceOptions = useMemo(() => {
        // Use base race IDs (what the backend expects) for generation simplicity
        return ruleEngine
            .getBaseRaceOptions()
            .filter((r) => PCG_V0_RACE_IDS.has(r.id))
            .map((r) => ({ value: r.id, label: r.name }));
    }, [ruleEngine]);

    const backgroundOptions = useMemo(() => {
        return ruleEngine
            .getAvailableBackgrounds()
            .filter((b) => PCG_V0_BACKGROUND_IDS.has(b.id))
            .map((b) => ({ value: b.id, label: b.name }));
    }, [ruleEngine]);

    const pickRandomValue = useCallback((options: Array<{ value: string; label: string }>): string => {
        if (!options.length) {
            throw new Error('No options available');
        }
        const idx = Math.floor(Math.random() * options.length);
        return options[idx].value;
    }, []);

    // ===== VALIDATION =====
    const canGenerate = useMemo(() => {
        return concept.trim().length >= CONCEPT_MIN_LENGTH && classId.trim() !== '' && !isGenerating;
    }, [concept, classId, isGenerating]);

    // ===== PROGRESS SIMULATION =====
    useEffect(() => {
        if (!isGenerating) return;

        const milestones: Array<{ at: number; msg: string }> = [
            { at: 10, msg: 'Analyzing your concept...' },
            { at: 25, msg: 'Rolling ability scores...' },
            { at: 40, msg: 'Selecting skills and proficiencies...' },
            { at: 55, msg: 'Choosing equipment...' },
            { at: 70, msg: 'Writing backstory and personality...' },
            { at: 85, msg: 'Finalizing character sheet...' }
        ];

        let current = 10;
        const interval = setInterval(() => {
            current += 5;
            if (current >= 95) {
                clearInterval(interval);
                return;
            }

            // Find last milestone <= current (no Array.findLast for older runtimes)
            let msg = 'Generating...';
            for (let i = milestones.length - 1; i >= 0; i--) {
                if (milestones[i].at <= current) {
                    msg = milestones[i].msg;
                    break;
                }
            }

            if (!mountedRef.current) return;
            setProgress({ percent: current, message: msg });
        }, 2000);

        return () => clearInterval(interval);
    }, [isGenerating]);

    // ===== API CALL =====
    const handleGenerate = useCallback(async () => {
        if (!canGenerate) return;

        setIsGenerating(true);
        setError(null);
        setProgress({ percent: 10, message: 'Starting generation...' });

        try {
            const resolvedRaceId = raceId || pickRandomValue(raceOptions);
            const resolvedBackgroundId = backgroundId || pickRandomValue(backgroundOptions);

            console.log('🎲 [PCG Generate] Request:', {
                classId,
                raceId: resolvedRaceId,
                level,
                backgroundId: resolvedBackgroundId,
                conceptLen: concept.trim().length
            });

            const response = await fetch(`${DUNGEONMIND_API_URL}/api/playercharactergenerator/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    classId,
                    raceId: resolvedRaceId,
                    level,
                    backgroundId: resolvedBackgroundId,
                    concept
                })
            });

            if (!response.ok) {
                const text = await response.text();
                try {
                    const parsed = JSON.parse(text);
                    const detail = parsed?.detail;
                    if (typeof detail === 'string' && detail.trim()) {
                        throw new Error(detail);
                    }
                } catch {
                    // fall through
                }
                throw new Error(text || `Generation failed (${response.status})`);
            }

            const json = await response.json();
            const character = json?.data?.character ?? json?.character;
            if (!character) {
                throw new Error('Generation returned no character');
            }

            // Dev-only: log and expose full payload for quick inspection/tuning.
            if (isDev && typeof window !== 'undefined') {
                (window as any).__PCG_LAST_GENERATED__ = {
                    timestamp: new Date().toISOString(),
                    request: {
                        classId,
                        raceId: resolvedRaceId,
                        level,
                        backgroundId: resolvedBackgroundId,
                        concept
                    },
                    response: json
                };

                const dnd = character?.dnd5eData;
                console.groupCollapsed(
                    `🧾 [PCG Generate] Character payload: ${character?.name || '(unnamed)'} (L${character?.level ?? level})`
                );
                console.log('Request:', {
                    classId,
                    raceId: resolvedRaceId,
                    level,
                    backgroundId: resolvedBackgroundId,
                    concept
                });
                console.log('Character (full):', character);
                console.log('Summary:', {
                    race: dnd?.race?.id,
                    class: dnd?.classes?.[0]?.name,
                    background: dnd?.background?.id,
                    weapons: (dnd?.weapons || []).map((w: any) => w?.id || w?.name),
                    armor: dnd?.armor?.id || null,
                    shield: !!dnd?.shield,
                    equipment: (dnd?.equipment || []).map((i: any) => i?.id || i?.name),
                    features: (dnd?.features || []).map((f: any) => f?.id || f?.name),
                    cantrips: (dnd?.spellcasting?.cantrips || []).map((s: any) => s?.id || s?.name),
                    spellsKnown: (dnd?.spellcasting?.spellsKnown || []).map((s: any) => s?.id || s?.name),
                });
                console.log('Raw response JSON:', json);
                console.log('DevTools helper: window.__PCG_LAST_GENERATED__');
                console.groupEnd();
            }

            // Treat this as a "new character" so we don't overwrite an existing project via autosave.
            clearCurrentProject();

            setProgress({ percent: 100, message: 'Complete!' });
            setCharacter(character);

            console.log('✅ [PCG Generate] Success:', character?.name || '(unnamed)');
            onGenerationComplete?.();
        } catch (err: any) {
            console.error('❌ [PCG Generate] Failed:', err);
            if (!mountedRef.current) return;
            setError(err?.message || 'Generation failed');
        } finally {
            if (!mountedRef.current) return;
            setIsGenerating(false);
        }
    }, [
        canGenerate,
        raceId,
        backgroundId,
        raceOptions,
        backgroundOptions,
        classId,
        level,
        concept,
        pickRandomValue,
        setCharacter,
        clearCurrentProject,
        onGenerationComplete
    ]);

    return (
        <Stack gap="md">
            {!isGenerating ? (
                <>
                    <Box>
                        <Title order={4}>Generate a Character</Title>
                        <Text size="sm" c="dimmed">
                            Describe your concept and we’ll create a ready-to-play character sheet.
                        </Text>
                    </Box>

                    <Textarea
                        label="What's your character concept?"
                        placeholder="A battle-hardened veteran seeking redemption after a war gone wrong..."
                        value={concept}
                        onChange={(e) => setConcept(e.currentTarget.value)}
                        autosize
                        minRows={CONCEPT_MIN_ROWS}
                        maxRows={CONCEPT_MAX_ROWS}
                        disabled={isGenerating}
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
                            value={classId}
                            onChange={(val) => setClassId(val || '')}
                            searchable
                            required
                            disabled={isGenerating}
                            comboboxProps={{ withinPortal: true, zIndex: 500 }}
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
                            value={String(level)}
                            onChange={(val) => setLevel((parseInt(val || '1', 10) as LevelOption) || 1)}
                            disabled={isGenerating}
                            comboboxProps={{ withinPortal: true, zIndex: 500 }}
                        />
                    </Group>

                    <Divider label="Optional (we’ll pick for you)" labelPosition="center" color="gray.4" />

                    <Group grow align="flex-start">
                        <Select
                            label="Race"
                            placeholder="Random"
                            data={raceOptions}
                            value={raceId}
                            onChange={(val) => setRaceId(val || null)}
                            searchable
                            clearable
                            disabled={isGenerating}
                            comboboxProps={{ withinPortal: true, zIndex: 500 }}
                        />
                        <Select
                            label="Background"
                            placeholder="Random"
                            data={backgroundOptions}
                            value={backgroundId}
                            onChange={(val) => setBackgroundId(val || null)}
                            searchable
                            clearable
                            disabled={isGenerating}
                            comboboxProps={{ withinPortal: true, zIndex: 500 }}
                        />
                    </Group>

                    {error && (
                        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                            <Text size="sm">{error}</Text>
                        </Alert>
                    )}

                    <Button
                        leftSection={<IconSparkles size={16} />}
                        color={GENERATE_BTN}
                        size="md"
                        fullWidth
                        disabled={!canGenerate}
                        onClick={handleGenerate}
                    >
                        Generate My Character
                    </Button>

                    <Text size="xs" c="dimmed" ta="center">
                        Requires a concept (≥ {CONCEPT_MIN_LENGTH} chars) and a class. Race/background are optional.
                    </Text>
                </>
            ) : (
                <Stack gap="md" align="center" ta="center">
                    <Title order={4}>
                        <IconWand size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
                        Creating Your Character...
                    </Title>
                    <Box w="100%">
                        <Progress value={progress.percent} color={PROGRESS_COLOR} size="lg" />
                        <Text size="sm" mt="xs">
                            {progress.percent}% — {progress.message || 'Generating...'}
                        </Text>
                    </Box>
                    <Text size="xs" c="dimmed">
                        Usually takes 30–60 seconds
                    </Text>
                </Stack>
            )}
        </Stack>
    );
};

export default AIGenerationTab;


