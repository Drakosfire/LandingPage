import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActionIcon,
    Alert,
    Badge,
    Box,
    Button,
    Collapse,
    CopyButton,
    Divider,
    Group,
    Image,
    Loader,
    Select,
    SimpleGrid,
    Stack,
    Switch,
    Text,
    Textarea,
    TextInput,
    Title
} from '@mantine/core';
import { IconAlertCircle, IconCheck, IconCopy, IconLogin, IconSparkles, IconTrash, IconUpload } from '@tabler/icons-react';
import { DUNGEONMIND_API_URL } from '../../../config';
import { useAuth } from '../../../context/AuthContext';
import { buildFullPrompt, getStyleOptions, ImageStyle } from '../../../constants/imageStyles';
import { ProgressPanel } from '../../../shared/GenerationDrawerEngine/components/ProgressPanel';
import type { ProgressConfig } from '../../../shared/GenerationDrawerEngine/types';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';
import { derivePortraitPrompt } from '../generation/portraitPromptBuilder';
import type { PortraitGalleryItem, PortraitMeta } from '../types/character.types';

function generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `portrait_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function compactWhitespace(input: string): string {
    return input.replace(/\s+/g, ' ').trim();
}

function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(file);
    });
}

async function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
    return await new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to decode image'));
        img.src = dataUrl;
    });
}

async function imageFileToCompressedJpegDataUrl(
    file: File,
    opts: { maxDim: number; quality: number }
): Promise<string> {
    // Keep SVG as-is (and keep animated GIFs as-is to avoid flattening/losing animation).
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
        return await fileToDataUrl(file);
    }

    const originalDataUrl = await fileToDataUrl(file);
    const img = await loadImageFromDataUrl(originalDataUrl);

    const maxDim = Math.max(1, opts.maxDim);
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
    const width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
    const height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        // Fallback: no canvas available, store original
        return originalDataUrl;
    }

    // Fill background white so transparent PNGs don't become black in JPEG.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', Math.min(1, Math.max(0.1, opts.quality)));
}

type LockKey = 'mood' | 'pose' | 'palette' | 'backgroundHint';

type LocksState = Record<LockKey, { enabled: boolean; value: string }>;

const DEFAULT_LOCKS: LocksState = {
    mood: { enabled: false, value: '' },
    pose: { enabled: false, value: '' },
    palette: { enabled: false, value: '' },
    backgroundHint: { enabled: false, value: '' }
};

const MODEL_OPTIONS = [
    { value: 'flux-pro', label: 'FLUX Pro (Default) - High quality, balanced speed' },
    { value: 'imagen4', label: "Imagen4 - Google's model, premium quality" },
    { value: 'openai', label: 'OpenAI GPT-Image-Mini - Fast, cost-effective' }
];

/** Progress config for portrait image generation (reuses engine's ProgressPanel) */
const PORTRAIT_PROGRESS_CONFIG: ProgressConfig = {
    estimatedDurationMs: 25000, // ~25 seconds for image generation
    milestones: [
        { at: 10, message: 'Preparing prompt...' },
        { at: 30, message: 'Generating portrait...' },
        { at: 60, message: 'Refining details...' },
        { at: 85, message: 'Finalizing image...' }
    ],
    color: 'violet'
};

export const PortraitGenerationTab: React.FC = () => {
    const { isLoggedIn, login } = useAuth();
    const { character, updateCharacter } = usePlayerCharacterGenerator();

    const initializedForCharacterIdRef = useRef<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [basePrompt, setBasePrompt] = useState('');
    const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('classic_dnd');
    const [selectedModel, setSelectedModel] = useState<string>('flux-pro');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [locks, setLocks] = useState<LocksState>(DEFAULT_LOCKS);

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [recipeOpen, setRecipeOpen] = useState(false);
    const [isDraggingUpload, setIsDraggingUpload] = useState(false);

    // Initialize prompt/caption/alt from the current character once per character ID.
    useEffect(() => {
        if (!character) return;
        if (initializedForCharacterIdRef.current === character.id) return;

        const derived = derivePortraitPrompt(character);
        setBasePrompt(derived.basePrompt);
        setSelectedStyle('classic_dnd');
        setSelectedModel('flux-pro');
        setNegativePrompt('');
        setLocks(DEFAULT_LOCKS);
        setErrorMessage(null);
        setRecipeOpen(false);

        // Only fill caption/alt defaults if not already set (don’t clobber user edits).
        const needsCaption = !character.portraitCaption || !character.portraitCaption.trim();
        const needsAlt = !character.portraitAlt || !character.portraitAlt.trim();
        if (needsCaption || needsAlt) {
            updateCharacter({
                ...(needsCaption ? { portraitCaption: derived.defaultCaption } : {}),
                ...(needsAlt ? { portraitAlt: derived.defaultAlt } : {})
            });
        }

        initializedForCharacterIdRef.current = character.id;
    }, [character, updateCharacter]);

    const portraitCaption = character?.portraitCaption || '';
    const portraitAlt = character?.portraitAlt || '';
    const gallery = character?.portraitGallery || [];
    const activePortraitUrl = character?.portrait;

    const composedBasePrompt = useMemo(() => {
        const parts: string[] = [];
        const trimmedBase = basePrompt.trim();
        if (trimmedBase) parts.push(trimmedBase);

        (Object.keys(locks) as LockKey[]).forEach((k) => {
            const entry = locks[k];
            if (entry.enabled && entry.value.trim()) {
                const label = k === 'backgroundHint' ? 'background' : k;
                parts.push(`${label}: ${entry.value.trim()}`);
            }
        });

        return compactWhitespace(parts.join(', '));
    }, [basePrompt, locks]);

    const fullPrompt = useMemo(() => {
        if (!composedBasePrompt) return '';
        return buildFullPrompt(composedBasePrompt, selectedStyle);
    }, [composedBasePrompt, selectedStyle]);

    const recipeText = useMemo(() => {
        return [
            `Prompt: ${fullPrompt}`,
            `Negative prompt: ${negativePrompt.trim() || '(none)'}`,
            `Model: ${selectedModel}`,
            `Style: ${selectedStyle}`
        ].join('\n');
    }, [fullPrompt, negativePrompt, selectedModel, selectedStyle]);

    const handleDeriveFromCharacter = useCallback(() => {
        if (!character) return;
        const derived = derivePortraitPrompt(character);
        setBasePrompt(derived.basePrompt);
        setErrorMessage(null);

        const needsCaption = !portraitCaption.trim();
        const needsAlt = !portraitAlt.trim();
        updateCharacter({
            ...(needsCaption ? { portraitCaption: derived.defaultCaption } : {}),
            ...(needsAlt ? { portraitAlt: derived.defaultAlt } : {})
        });
    }, [character, portraitAlt, portraitCaption, updateCharacter]);

    const addUploadedPortrait = useCallback(async (file: File) => {
        if (!character) return;
        if (!file.type.startsWith('image/')) {
            setErrorMessage('Please upload an image file.');
            return;
        }

        try {
            setErrorMessage(null);

            // Compress to keep localStorage within reasonable limits.
            const dataUrl = await imageFileToCompressedJpegDataUrl(file, { maxDim: 768, quality: 0.85 });

            const createdAt = new Date().toISOString();
            const meta: PortraitMeta = {
                source: 'uploaded',
                createdAt
            };

            const item: PortraitGalleryItem = {
                id: generateId(),
                url: dataUrl,
                prompt: '(uploaded)',
                caption: portraitCaption || undefined,
                alt: portraitAlt || undefined,
                meta
            };

            updateCharacter({
                portrait: item.url,
                portraitPrompt: item.prompt,
                portraitMeta: meta,
                portraitGallery: [...gallery, item]
            });

            console.log('📷 [PCG Portrait] Uploaded portrait added to gallery');
        } catch (err: any) {
            console.error('❌ [PCG Portrait] Upload failed:', err);
            setErrorMessage(err?.message || 'Failed to upload image');
        }
    }, [character, gallery, portraitAlt, portraitCaption, updateCharacter]);

    const handleGenerate = useCallback(async () => {
        if (!character) return;
        if (!fullPrompt.trim()) return;

        setErrorMessage(null);
        setIsGenerating(true);
        const startTime = Date.now();
        setGenerationStartTime(startTime);

        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 120000);

        try {
            console.log('🎨 [PCG Portrait] Generating images...', {
                model: selectedModel,
                style: selectedStyle,
                promptLen: fullPrompt.length
            });

            const response = await fetch(`${DUNGEONMIND_API_URL}/api/statblockgenerator/generate-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                signal: abortController.signal,
                body: JSON.stringify({
                    sd_prompt: fullPrompt,
                    model: selectedModel,
                    num_images: 4
                })
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData?.detail || `Image generation failed: ${response.statusText}`);
            }

            const payload = await response.json();
            const images = payload?.data?.images || [];
            if (!Array.isArray(images) || images.length === 0) {
                throw new Error('No images were generated. Please try again.');
            }

            const createdAt = new Date().toISOString();
            const baseMeta: PortraitMeta = {
                source: 'generated',
                model: selectedModel,
                styleId: selectedStyle,
                negativePrompt: negativePrompt.trim() || undefined,
                createdAt
            };

            const newItems: PortraitGalleryItem[] = images.map((img: any) => ({
                id: img?.id || generateId(),
                url: img?.url,
                prompt: img?.prompt || fullPrompt,
                caption: portraitCaption || undefined,
                alt: portraitAlt || undefined,
                meta: {
                    ...baseMeta,
                    seed: img?.seed ? String(img.seed) : undefined,
                    createdAt: img?.created_at || createdAt
                }
            })).filter((x) => typeof x.url === 'string' && x.url.trim());

            if (newItems.length === 0) {
                throw new Error('Image generation returned no usable URLs. Please try again.');
            }

            updateCharacter({
                portraitGallery: [...gallery, ...newItems]
            });

            console.log(`✅ [PCG Portrait] Added ${newItems.length} images to gallery`);
        } catch (err: any) {
            console.error('❌ [PCG Portrait] Generation failed:', err);
            if (err?.name === 'AbortError') {
                setErrorMessage('Image generation timed out. Please try again or choose a different model.');
            } else {
                setErrorMessage(err?.message || 'Image generation failed');
            }
        } finally {
            clearTimeout(timeoutId);
            setIsGenerating(false);
            setGenerationStartTime(null);
        }
    }, [
        character,
        fullPrompt,
        gallery,
        negativePrompt,
        portraitAlt,
        portraitCaption,
        selectedModel,
        selectedStyle,
        updateCharacter
    ]);

    const handleSetActivePortrait = useCallback((item: PortraitGalleryItem) => {
        updateCharacter({
            portrait: item.url,
            portraitPrompt: item.prompt,
            portraitCaption: item.caption ?? portraitCaption,
            portraitAlt: item.alt ?? portraitAlt,
            portraitMeta: item.meta
        });
    }, [portraitAlt, portraitCaption, updateCharacter]);

    const handleRemoveFromGallery = useCallback((id: string) => {
        if (!character) return;
        const nextGallery = (character.portraitGallery || []).filter((x) => x.id !== id);

        const removed = (character.portraitGallery || []).find((x) => x.id === id);
        const isRemovingActive = removed?.url && removed.url === character.portrait;

        updateCharacter({
            portraitGallery: nextGallery,
            ...(isRemovingActive ? { portrait: undefined, portraitPrompt: undefined, portraitMeta: undefined } : {})
        });
    }, [character, updateCharacter]);

    if (!character) {
        return (
            <Alert icon={<IconAlertCircle size={16} />} color="yellow" variant="light">
                No character loaded.
            </Alert>
        );
    }

    return (
        <Stack gap="md">
            <Group justify="space-between" align="flex-end">
                <Title order={5}>Portrait</Title>
                <Button variant="subtle" size="xs" onClick={handleDeriveFromCharacter}>
                    Derive from character
                </Button>
            </Group>

            <Stack gap="sm">
                <Divider label="Upload (local-first)" />

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        const file = e.currentTarget.files?.[0];
                        e.currentTarget.value = '';
                        if (file) {
                            void addUploadedPortrait(file);
                        }
                    }}
                />

                <Box
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingUpload(true);
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingUpload(true);
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingUpload(false);
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingUpload(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                            void addUploadedPortrait(file);
                        }
                    }}
                    p="md"
                    style={{
                        cursor: 'pointer',
                        border: `2px dashed ${isDraggingUpload ? 'var(--mantine-color-violet-5)' : 'var(--mantine-color-gray-4)'}`,
                        borderRadius: 'var(--mantine-radius-md)',
                        background: isDraggingUpload ? 'var(--mantine-color-violet-0)' : 'var(--mantine-color-gray-0)'
                    }}
                >
                    <Group justify="space-between" align="center">
                        <Stack gap={2}>
                            <Text fw={600} size="sm">
                                Drop an image here (or click to browse)
                            </Text>
                            <Text size="xs" c="dimmed">
                                Stored in localStorage by default{isLoggedIn ? ' (and included in project saves when signed in).' : '.'}
                            </Text>
                        </Stack>
                        <IconUpload size={20} />
                    </Group>
                </Box>
            </Stack>

            {!isLoggedIn && (
                <Alert icon={<IconAlertCircle size={16} />} color="yellow" variant="light" title="Login Required">
                    <Stack gap="sm">
                        <Text size="sm">
                            Portrait generation uses the existing image endpoint and requires an account.
                        </Text>
                        <Button onClick={login} leftSection={<IconLogin size={16} />} size="sm">
                            Login or Sign Up
                        </Button>
                    </Stack>
                </Alert>
            )}

            {errorMessage && (
                <Alert
                    icon={<IconAlertCircle size={16} />}
                    color="red"
                    variant="light"
                    withCloseButton
                    onClose={() => setErrorMessage(null)}
                >
                    <Text size="sm">{errorMessage}</Text>
                </Alert>
            )}

            <Stack gap="sm">
                <Textarea
                    label="Portrait Prompt"
                    description="Start from a derived prompt, then tweak it. Locks add structured hints during composition."
                    value={basePrompt}
                    onChange={(e) => setBasePrompt(e.target.value)}
                    minRows={4}
                    maxRows={10}
                    autosize
                    disabled={isGenerating}
                />

                <Group grow>
                    <Select
                        label="Art Style"
                        data={getStyleOptions()}
                        value={selectedStyle}
                        onChange={(value) => setSelectedStyle((value as ImageStyle) || 'classic_dnd')}
                        disabled={isGenerating}
                    />

                    <Select
                        label="AI Model"
                        value={selectedModel}
                        onChange={(value) => setSelectedModel(value || 'flux-pro')}
                        data={MODEL_OPTIONS}
                        disabled={isGenerating}
                    />
                </Group>

                <Textarea
                    label="Negative Prompt (recipe only)"
                    description="Not sent to the backend in v1, but saved in the recipe metadata for copy/paste."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    minRows={2}
                    maxRows={6}
                    autosize
                    disabled={isGenerating}
                />

                <Divider label="Soft locks" />

                <Group grow align="flex-end">
                    <Group gap="xs" wrap="nowrap">
                        <Switch
                            label="Mood"
                            checked={locks.mood.enabled}
                            onChange={(e) => setLocks((prev) => ({ ...prev, mood: { ...prev.mood, enabled: e.currentTarget.checked } }))}
                            disabled={isGenerating}
                        />
                        <TextInput
                            placeholder="brooding, heroic, mischievous..."
                            value={locks.mood.value}
                            onChange={(e) => setLocks((prev) => ({ ...prev, mood: { ...prev.mood, value: e.currentTarget.value } }))}
                            disabled={isGenerating || !locks.mood.enabled}
                        />
                    </Group>

                    <Group gap="xs" wrap="nowrap">
                        <Switch
                            label="Pose"
                            checked={locks.pose.enabled}
                            onChange={(e) => setLocks((prev) => ({ ...prev, pose: { ...prev.pose, enabled: e.currentTarget.checked } }))}
                            disabled={isGenerating}
                        />
                        <TextInput
                            placeholder="three-quarter view, looking left..."
                            value={locks.pose.value}
                            onChange={(e) => setLocks((prev) => ({ ...prev, pose: { ...prev.pose, value: e.currentTarget.value } }))}
                            disabled={isGenerating || !locks.pose.enabled}
                        />
                    </Group>
                </Group>

                <Group grow align="flex-end">
                    <Group gap="xs" wrap="nowrap">
                        <Switch
                            label="Palette"
                            checked={locks.palette.enabled}
                            onChange={(e) => setLocks((prev) => ({ ...prev, palette: { ...prev.palette, enabled: e.currentTarget.checked } }))}
                            disabled={isGenerating}
                        />
                        <TextInput
                            placeholder="cool blues, warm sepia..."
                            value={locks.palette.value}
                            onChange={(e) => setLocks((prev) => ({ ...prev, palette: { ...prev.palette, value: e.currentTarget.value } }))}
                            disabled={isGenerating || !locks.palette.enabled}
                        />
                    </Group>

                    <Group gap="xs" wrap="nowrap">
                        <Switch
                            label="Background"
                            checked={locks.backgroundHint.enabled}
                            onChange={(e) => setLocks((prev) => ({
                                ...prev,
                                backgroundHint: { ...prev.backgroundHint, enabled: e.currentTarget.checked }
                            }))}
                            disabled={isGenerating}
                        />
                        <TextInput
                            placeholder="tavern, battlefield, library..."
                            value={locks.backgroundHint.value}
                            onChange={(e) => setLocks((prev) => ({
                                ...prev,
                                backgroundHint: { ...prev.backgroundHint, value: e.currentTarget.value }
                            }))}
                            disabled={isGenerating || !locks.backgroundHint.enabled}
                        />
                    </Group>
                </Group>

                <Group grow>
                    <TextInput
                        label="Caption (selected portrait)"
                        value={portraitCaption}
                        onChange={(e) => updateCharacter({ portraitCaption: e.currentTarget.value })}
                        disabled={isGenerating}
                    />
                    <TextInput
                        label="Alt text (selected portrait)"
                        value={portraitAlt}
                        onChange={(e) => updateCharacter({ portraitAlt: e.currentTarget.value })}
                        disabled={isGenerating}
                    />
                </Group>

                <Group justify="space-between" align="center">
                    <Button
                        leftSection={isGenerating ? <Loader size="sm" /> : <IconSparkles size={16} />}
                        onClick={handleGenerate}
                        disabled={!isLoggedIn || !fullPrompt.trim() || isGenerating}
                        loading={isGenerating}
                        size="md"
                        style={{ minHeight: 44 }}
                    >
                        {isGenerating ? 'Generating...' : 'Generate (4x)'}
                    </Button>

                    <Button variant="subtle" onClick={() => setRecipeOpen((v) => !v)}>
                        {recipeOpen ? 'Hide recipe' : 'Show recipe'}
                    </Button>
                </Group>

                {isGenerating && (
                    <ProgressPanel
                        isGenerating={isGenerating}
                        config={PORTRAIT_PROGRESS_CONFIG}
                        persistedStartTime={generationStartTime}
                    />
                )}

                <Collapse in={recipeOpen}>
                    <Box
                        p="sm"
                        style={{
                            background: 'var(--mantine-color-gray-0)',
                            border: '1px solid var(--mantine-color-gray-2)',
                            borderRadius: 'var(--mantine-radius-md)'
                        }}
                    >
                        <Stack gap="xs">
                            <Group justify="space-between">
                                <Text fw={600} size="sm">
                                    Recipe
                                </Text>
                                <CopyButton value={recipeText} timeout={1500}>
                                    {({ copied, copy }) => (
                                        <Button
                                            size="xs"
                                            variant="light"
                                            onClick={copy}
                                            leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                                        >
                                            {copied ? 'Copied' : 'Copy'}
                                        </Button>
                                    )}
                                </CopyButton>
                            </Group>
                            <Text size="xs" c="dimmed">
                                Full prompt (sent to backend):
                            </Text>
                            <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                                {fullPrompt}
                            </Text>
                            <Divider />
                            <Text size="xs" c="dimmed">
                                Negative prompt (recipe only):
                            </Text>
                            <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                                {negativePrompt.trim() || '(none)'}
                            </Text>
                            <Divider />
                            <Group gap="xs">
                                <Badge variant="light">Model: {selectedModel}</Badge>
                                <Badge variant="light">Style: {selectedStyle}</Badge>
                            </Group>
                        </Stack>
                    </Box>
                </Collapse>
            </Stack>

            <Divider label="Gallery" />

            {gallery.length === 0 ? (
                <Alert icon={<IconAlertCircle size={16} />} color="gray" variant="light">
                    Generate portraits to build a gallery of candidates, then pick one as the active portrait.
                </Alert>
            ) : (
                <SimpleGrid cols={{ base: 2, sm: 2, md: 2 }} spacing="sm">
                    {gallery.map((item) => {
                        const isActive = !!activePortraitUrl && item.url === activePortraitUrl;
                        return (
                            <Box
                                key={item.id}
                                p="xs"
                                style={{
                                    border: isActive ? '2px solid var(--mantine-color-violet-5)' : '1px solid var(--mantine-color-gray-2)',
                                    borderRadius: 'var(--mantine-radius-md)'
                                }}
                            >
                                <Stack gap="xs">
                                    <Box style={{ position: 'relative' }}>
                                        {isActive && (
                                            <Badge
                                                variant="filled"
                                                color="violet"
                                                style={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
                                            >
                                                Active
                                            </Badge>
                                        )}
                                        <Image
                                            src={item.url}
                                            alt={item.alt || portraitAlt || `Portrait candidate for ${character.name}`}
                                            radius="sm"
                                            fit="cover"
                                            h={180}
                                        />
                                    </Box>

                                    <Group justify="space-between" align="center">
                                        <Button
                                            size="xs"
                                            onClick={() => handleSetActivePortrait(item)}
                                            disabled={isGenerating}
                                        >
                                            Use
                                        </Button>
                                        <ActionIcon
                                            variant="subtle"
                                            color="red"
                                            onClick={() => handleRemoveFromGallery(item.id)}
                                            disabled={isGenerating}
                                            aria-label="Remove from gallery"
                                        >
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Group>
                                </Stack>
                            </Box>
                        );
                    })}
                </SimpleGrid>
            )}
        </Stack>
    );
};

export default PortraitGenerationTab;


