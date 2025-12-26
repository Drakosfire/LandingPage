/**
 * Generation Drawer Engine - Demo/Test Page
 * 
 * This page allows manual verification of the Generation Drawer Engine
 * using prototype data contracts. It serves as:
 * 
 * 1. Manual integration test before service migration
 * 2. Visual verification of all features
 * 3. Prototype data contract validation
 * 4. Reference implementation for service integration
 * 
 * Access: Navigate to /generation-drawer-demo
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
    Button, Stack, Title, Text, Code, Paper, Textarea,
    Checkbox, Badge, Group, Divider, Accordion, Alert, Switch, Loader,
    ThemeIcon, Tooltip
} from '@mantine/core';
import { IconWand, IconPhoto, IconCheck, IconAlertCircle, IconRefresh, IconPlugConnected, IconPlugConnectedX, IconUpload, IconLibrary } from '@tabler/icons-react';
import { GenerationDrawerEngine } from '../shared/GenerationDrawerEngine';
import type { GenerationDrawerConfig, GenerationError } from '../shared/GenerationDrawerEngine';
import { GenerationType } from '../shared/GenerationDrawerEngine';
import { useBackendHealth } from '../shared/GenerationDrawerEngine/hooks/useBackendHealth';
import type {
    StatBlockInput,
    StatBlockOutput
} from '../shared/GenerationDrawerEngine/prototypes';
import {
    STATBLOCK_INPUT_EXAMPLE,
    STATBLOCK_OUTPUT_EXAMPLE,
    PROGRESS_CONFIG_EXAMPLE
} from '../shared/GenerationDrawerEngine/prototypes';

// =============================================================================
// MANUAL TEST CHECKLIST
// =============================================================================

interface ChecklistItem {
    id: string;
    category: string;
    action: string;
    expected: string;
}

const MANUAL_TEST_CHECKLIST: ChecklistItem[] = [
    // Drawer Shell
    {
        id: 'drawer-open',
        category: 'Drawer Shell',
        action: 'Click "Open Generation Drawer" button',
        expected: 'Drawer slides in from left, title shows "Generate StatBlock (Demo)"'
    },
    {
        id: 'drawer-close-button',
        category: 'Drawer Shell',
        action: 'Click the X button in drawer header',
        expected: 'Drawer closes smoothly'
    },
    {
        id: 'drawer-close-outside',
        category: 'Drawer Shell',
        action: 'Open drawer, click outside the drawer (on the overlay)',
        expected: 'Drawer closes smoothly'
    },
    {
        id: 'drawer-close-escape',
        category: 'Drawer Shell',
        action: 'Open drawer, press Escape key',
        expected: 'Drawer closes smoothly'
    },

    // Tab Navigation
    {
        id: 'tab-switch',
        category: 'Tab Navigation',
        action: 'Click on "Image Generation" tab',
        expected: 'Tab highlights/selects, Generate button updates for image generation'
    },
    {
        id: 'tab-independent-input',
        category: 'Tab Navigation',
        action: 'Type in Text tab, switch to Image tab',
        expected: 'Image tab has its own independent input (starts with prototype text)'
    },
    {
        id: 'tab-persistence',
        category: 'Tab Navigation',
        action: 'Switch to Image tab, close drawer, reopen',
        expected: 'Image tab remains active (tab state preserved)'
    },

    // Input Form
    {
        id: 'input-prefilled',
        category: 'Input Form',
        action: 'Open drawer',
        expected: 'Description field has prototype text about red dragon'
    },
    {
        id: 'input-modify',
        category: 'Input Form',
        action: 'Clear description, type "A tiny frog wizard"',
        expected: 'Text updates as you type'
    },
    {
        id: 'input-validation-empty',
        category: 'Input Form',
        action: 'Clear description field completely',
        expected: 'Generate button becomes disabled'
    },
    {
        id: 'input-validation-valid',
        category: 'Input Form',
        action: 'Type any text in description',
        expected: 'Generate button becomes enabled'
    },

    // Generation Flow
    {
        id: 'generation-start',
        category: 'Generation Flow',
        action: 'Click Generate with valid input',
        expected: 'Progress bar appears, button disabled, console logs "🚀 Generation started"'
    },
    {
        id: 'generation-progress',
        category: 'Generation Flow',
        action: 'Watch progress bar during generation',
        expected: 'Progress increases, milestone messages change (Analyzing, Crafting, Applying, Finishing)'
    },
    {
        id: 'generation-complete',
        category: 'Generation Flow',
        action: 'Wait for generation to complete',
        expected: 'Alert shows "Generated: Ancient Red Dragon", console logs "✅ Generation complete"'
    },
    {
        id: 'generation-button-reenable',
        category: 'Generation Flow',
        action: 'After completion',
        expected: 'Generate button is enabled again'
    },

    // Text Generation Results
    {
        id: 'text-result-display',
        category: 'Text Generation Results',
        action: 'Complete a text generation',
        expected: 'Generated statblock data displays in the Text tab (name, stats, abilities visible)'
    },
    {
        id: 'text-result-matches-input',
        category: 'Text Generation Results',
        action: 'Check the generated content',
        expected: 'Content reflects your input description (e.g., dragon description → dragon statblock)'
    },
    {
        id: 'text-result-alert',
        category: 'Text Generation Results',
        action: 'Check the page alert below drawer',
        expected: 'Alert shows "Generated: [creature name]" with the actual creature name'
    },

    // Image Generation Results
    {
        id: 'image-generation-flow',
        category: 'Image Generation Results',
        action: 'Switch to Image tab, enter prompt, click Generate',
        expected: 'Progress bar shows, image generation runs'
    },
    {
        id: 'image-result-gallery',
        category: 'Image Generation Results',
        action: 'Wait for image generation to complete',
        expected: 'Generated images appear in Project Gallery grid below the input'
    },
    {
        id: 'image-result-click',
        category: 'Image Generation Results',
        action: 'Click on a generated image in the gallery',
        expected: 'Image modal opens showing full-size image with navigation arrows'
    },
    {
        id: 'image-result-select',
        category: 'Image Generation Results',
        action: 'Click "Select" button in image modal',
        expected: 'Image is selected (highlighted border), modal closes'
    },
    {
        id: 'image-result-multiple',
        category: 'Image Generation Results',
        action: 'Generate images multiple times',
        expected: 'All generated images accumulate in Project Gallery'
    },

    // State Persistence (Close/Reopen)
    {
        id: 'state-input-modified',
        category: 'State Persistence',
        action: 'Modify input text, close drawer, reopen',
        expected: 'Input is preserved (NOT reset) - current behavior'
    },
    {
        id: 'state-progress-persist',
        category: 'State Persistence',
        action: 'Start generation, close drawer mid-progress, reopen',
        expected: 'Progress bar resumes from where it was (not reset to 0%)'
    },
    {
        id: 'state-progress-tab-switch',
        category: 'State Persistence',
        action: 'Start generation on Text tab, switch to Image tab, switch back',
        expected: 'Progress bar continues (state persisted across tab switch)'
    },
    {
        id: 'state-error-reset',
        category: 'State Persistence',
        action: 'If error occurred, close drawer, reopen',
        expected: 'Error message is cleared'
    },

    // Accessibility
    {
        id: 'a11y-keyboard-tabs',
        category: 'Accessibility',
        action: 'Use arrow keys to navigate tabs',
        expected: 'Focus moves between tabs correctly'
    },
    {
        id: 'a11y-enter-generate',
        category: 'Accessibility',
        action: 'Focus Generate button, press Enter',
        expected: 'Generation starts'
    },

    // Console Verification
    {
        id: 'console-callbacks',
        category: 'Console Verification',
        action: 'Open browser console, perform generation',
        expected: 'See logs: 🚀 start, ✅ complete with output object, 🎓 tutorial complete'
    },

    // Upload Tab
    {
        id: 'upload-tab-open',
        category: 'Upload Tab',
        action: 'Click "Upload" tab',
        expected: 'Tab switches to upload zone with drag-and-drop area'
    },
    {
        id: 'upload-auth-gate',
        category: 'Upload Tab',
        action: 'View upload tab in demo mode (not logged in)',
        expected: 'In tutorial mode, upload zone is accessible. In live mode without auth, shows login prompt.'
    },
    {
        id: 'upload-drag-drop',
        category: 'Upload Tab',
        action: 'Drag an image file onto the drop zone',
        expected: 'Zone highlights on drag-over, file is accepted'
    },
    {
        id: 'upload-file-picker',
        category: 'Upload Tab',
        action: 'Click the drop zone to open file picker',
        expected: 'File browser opens, can select image files'
    },

    // Library Tab
    {
        id: 'library-tab-open',
        category: 'Library Tab',
        action: 'Click "Library" tab',
        expected: 'Tab switches to library browser with image grid (may be empty)'
    },
    {
        id: 'library-empty-state',
        category: 'Library Tab',
        action: 'View library when empty',
        expected: 'Shows "No images in library" or similar empty state'
    },
    {
        id: 'library-pagination',
        category: 'Library Tab',
        action: 'If library has images, check pagination',
        expected: 'Page numbers or prev/next controls visible if more than one page'
    },

    // Project Gallery (within Image Generation tab)
    {
        id: 'project-gallery-empty',
        category: 'Project Gallery',
        action: 'Switch to Image tab before generating',
        expected: 'Gallery shows "No images generated yet" or is hidden'
    },
    {
        id: 'project-gallery-images',
        category: 'Project Gallery',
        action: 'After image generation (mock in demo mode)',
        expected: 'Images appear in a grid below the generate button'
    },
    {
        id: 'project-gallery-click',
        category: 'Project Gallery',
        action: 'Click on an image in the gallery',
        expected: 'Full-size modal opens with navigation arrows'
    },
    {
        id: 'project-gallery-modal-nav',
        category: 'Project Gallery',
        action: 'Use arrow keys or buttons in image modal',
        expected: 'Navigate between images'
    },
    {
        id: 'project-gallery-select',
        category: 'Project Gallery',
        action: 'Click Select button in image modal',
        expected: 'Image is selected (visual indicator), modal closes'
    },

    // Live Mode (requires backend running)
    {
        id: 'live-health-check',
        category: 'Live Mode',
        action: 'View backend status indicator in header',
        expected: 'Shows "Online" (green) or "Offline" (red) based on backend availability'
    },
    {
        id: 'live-toggle',
        category: 'Live Mode',
        action: 'Toggle "Live Mode" switch (when backend online)',
        expected: 'Switch enables, drawer uses real API endpoints'
    },
    {
        id: 'live-generate',
        category: 'Live Mode',
        action: 'In live mode, enter prompt and generate',
        expected: 'Real generation occurs, actual statblock data returned (not mock)'
    },
    {
        id: 'live-error-handling',
        category: 'Live Mode',
        action: 'In live mode, if backend returns error',
        expected: 'Error display shows with retry option'
    }
];

// Group checklist by category
const groupedChecklist = MANUAL_TEST_CHECKLIST.reduce((acc, item) => {
    if (!acc[item.category]) {
        acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
}, {} as Record<string, ChecklistItem[]>);

// =============================================================================
// INPUT FORM COMPONENT
// =============================================================================

const StatBlockInputForm: React.FC<{
    value: StatBlockInput;
    onChange: (value: Partial<StatBlockInput>) => void;
    isGenerating: boolean;
    isTutorialMode: boolean;
    errors?: Record<string, string>;
}> = ({ value, onChange, isGenerating, errors }) => {
    return (
        <Stack gap="md">
            <Textarea
                label="Creature Description"
                placeholder="Describe your creature (e.g., 'A massive red dragon with ancient scales...')"
                value={value.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    onChange({ description: e.target.value })
                }
                disabled={isGenerating}
                error={errors?.description}
                minRows={3}
                data-testid="description-input"
                data-tutorial="statblock-input"
            />
        </Stack>
    );
};

// =============================================================================
// DRAWER CONFIGURATION
// =============================================================================

const createDemoConfig = (
    onComplete: (output: StatBlockOutput) => void,
    onError: (error: GenerationError) => void,
    liveMode: boolean = false
): GenerationDrawerConfig<StatBlockInput, StatBlockOutput> => ({
    id: 'demo-statblock',
    title: liveMode ? 'Generate StatBlock (Live)' : 'Generate StatBlock (Demo)',

    tabs: [
        {
            id: 'text',
            label: 'Text Generation',
            icon: <IconWand size={16} />,
            generationType: GenerationType.TEXT
        },
        {
            id: 'image',
            label: 'Image Generation',
            icon: <IconPhoto size={16} />,
            generationType: GenerationType.IMAGE
        },
        {
            id: 'upload',
            label: 'Upload',
            icon: <IconUpload size={16} />
        },
        {
            id: 'library',
            label: 'Library',
            icon: <IconLibrary size={16} />
        }
    ],

    defaultTab: 'text',

    InputSlot: StatBlockInputForm,
    initialInput: STATBLOCK_INPUT_EXAMPLE,

    validateInput: (input: StatBlockInput) => {
        if (!input.description || input.description.trim().length === 0) {
            return {
                valid: false,
                errors: { description: 'Description is required' } as Record<string, string>
            };
        }
        return { valid: true, errors: {} as Record<string, string> };
    },

    // Use real endpoint in live mode, demo endpoint otherwise
    generationEndpoint: liveMode 
        ? '/api/statblockgenerator/generate-statblock' 
        : '/api/demo/generate',
    // Image generation endpoint (demo always uses demo endpoint for images)
    imageGenerationEndpoint: liveMode 
        ? '/api/statblockgenerator/generate-image'
        : '/api/demo/generate-image',
    transformInput: (input: StatBlockInput) => ({
        description: input.description,
        name: input.name,
        challengeRating: input.challengeRating
    }),
    // In live mode, transform actual API response; in demo mode, return mock
    transformOutput: liveMode 
        ? (response: unknown): StatBlockOutput => {
            // Real API response structure
            const data = response as any;
            return {
                statblock: data.statblock || data,
                imagePrompt: data.image_prompt || data.description,
                images: []
            };
        }
        : (): StatBlockOutput => STATBLOCK_OUTPUT_EXAMPLE,

    progressConfig: {
        [GenerationType.TEXT]: PROGRESS_CONFIG_EXAMPLE,
        [GenerationType.IMAGE]: {
            estimatedDurationMs: 15000,
            milestones: [
                { at: 20, message: 'Preparing prompt...' },
                { at: 60, message: 'Generating images...' },
                { at: 90, message: 'Uploading...' }
            ],
            color: 'violet'
        }
    },

    imageConfig: {
        promptField: 'imagePrompt' as keyof StatBlockOutput,
        uploadEndpoint: '/api/demo/upload',
        deleteEndpoint: '/api/demo/delete',
        libraryEndpoint: '/api/demo/library',
        sessionId: 'demo-session-123',
        onImageGenerated: (images) => {
            console.log('📸 Images generated:', images);
        },
        onImageSelected: (url, index) => {
            console.log('🖼️ Image selected:', url, index);
        }
    },

    onGenerationStart: () => {
        console.log('🚀 Generation started');
    },
    onGenerationComplete: onComplete,
    onGenerationError: onError,

    // Tutorial config for auth bypass and mock images
    // In demo mode: hit real demo API endpoints (simulateGeneration: false)
    // In live mode: no tutorial config
    tutorialConfig: liveMode ? undefined : {
        simulatedDurationMs: 7000,
        mockAuthState: true,
        // Hit real demo API instead of simulating locally
        simulateGeneration: false,
        mockImages: [],  // Images come from initialImages prop or API
        onTutorialComplete: () => {
            console.log('🎓 Tutorial complete');
        }
    },

    // State management - preserve state on close for testing
    resetOnClose: false,
    // Config-level isTutorialMode is used as default, but prop can override
    isTutorialMode: false
});

// =============================================================================
// DEMO PAGE COMPONENT
// =============================================================================

export default function GenerationDrawerDemo() {
    const [opened, setOpened] = useState(false);
    const [completedTests, setCompletedTests] = useState<Set<string>>(new Set());
    const [lastOutput, setLastOutput] = useState<StatBlockOutput | null>(null);
    const [lastError, setLastError] = useState<GenerationError | null>(null);
    const [liveMode, setLiveMode] = useState(false);

    // Backend health check
    const { health, isChecking, checkHealth } = useBackendHealth(true, 0);

    const handleComplete = useCallback((output: StatBlockOutput) => {
        console.log('✅ Generation complete:', output);
        setLastOutput(output);
        setLastError(null);
    }, []);

    const handleError = useCallback((error: GenerationError) => {
        console.error('❌ Generation error:', error);
        setLastError(error);
        setLastOutput(null);
    }, []);

    const toggleTest = useCallback((id: string) => {
        setCompletedTests(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const completedCount = completedTests.size;
    const totalCount = MANUAL_TEST_CHECKLIST.length;
    const progress = Math.round((completedCount / totalCount) * 100);

    // Create config with current mode (memoized to prevent unnecessary re-renders)
    const demoConfig = useMemo(
        () => createDemoConfig(handleComplete, handleError, liveMode),
        [handleComplete, handleError, liveMode]
    );

    // Disable live mode toggle if backend is offline
    const canEnableLiveMode = health.statblockgenerator.status === 'online';

    return (
        <Stack gap="xl" p="xl" maw={1200} mx="auto">
            {/* Header */}
            <div>
                <Group justify="space-between" align="start">
                    <div>
                        <Title order={1}>Generation Drawer Engine - Manual Test</Title>
                        <Text c="dimmed" mt="xs">
                            Interactive checklist for manual verification
                        </Text>
                    </div>
                    <Group gap="md">
                        {/* Backend Status */}
                        <Tooltip 
                            label={
                                health.statblockgenerator.status === 'online' 
                                    ? 'Backend is running' 
                                    : health.statblockgenerator.error || 'Backend not reachable'
                            }
                        >
                            <Group gap="xs">
                                {isChecking ? (
                                    <Loader size="xs" />
                                ) : (
                                    <ThemeIcon 
                                        size="sm" 
                                        variant="light"
                                        color={health.statblockgenerator.status === 'online' ? 'green' : 'red'}
                                    >
                                        {health.statblockgenerator.status === 'online' 
                                            ? <IconPlugConnected size={14} />
                                            : <IconPlugConnectedX size={14} />
                                        }
                                    </ThemeIcon>
                                )}
                                <Text size="sm" c={health.statblockgenerator.status === 'online' ? 'green' : 'red'}>
                                    {health.statblockgenerator.status === 'online' ? 'Online' : 'Offline'}
                                </Text>
                                <Button 
                                    variant="subtle" 
                                    size="compact-xs" 
                                    onClick={checkHealth}
                                    loading={isChecking}
                                    leftSection={<IconRefresh size={12} />}
                                >
                                    Refresh
                                </Button>
                            </Group>
                        </Tooltip>
                        
                        <Badge size="xl" variant="filled" color={progress === 100 ? 'green' : 'blue'}>
                            {completedCount} / {totalCount} ({progress}%)
                        </Badge>
                    </Group>
                </Group>
            </div>

            {/* Mode Selection & Launch Button */}
            <Paper p="lg" withBorder shadow="sm">
                <Stack gap="md">
                    <Group justify="space-between">
                        <Text fw={600} size="lg">Step 1: Choose Mode & Open Drawer</Text>
                        <Group gap="md">
                            <Tooltip 
                                label={
                                    canEnableLiveMode 
                                        ? 'Use real backend API' 
                                        : 'Backend must be online to enable live mode'
                                }
                            >
                                <Group gap="xs">
                                    <Switch
                                        checked={liveMode}
                                        onChange={(e) => setLiveMode(e.currentTarget.checked)}
                                        disabled={!canEnableLiveMode}
                                        label="Live Mode"
                                        color="green"
                                    />
                                    <Badge 
                                        variant="light" 
                                        color={liveMode ? 'green' : 'blue'}
                                    >
                                        {liveMode ? 'Real API' : 'Mock Data'}
                                    </Badge>
                                </Group>
                            </Tooltip>
                        </Group>
                    </Group>
                    
                    {liveMode && (
                        <Alert color="yellow" variant="light">
                            <Text size="sm">
                                <strong>Live Mode:</strong> Generation will use the real StatBlockGenerator API. 
                                This may take 10-30 seconds and incurs API costs.
                            </Text>
                        </Alert>
                    )}
                    
                    <Group>
                        <Button
                            size="lg"
                            onClick={() => setOpened(true)}
                            leftSection={<IconWand size={20} />}
                            color={liveMode ? 'green' : 'blue'}
                        >
                            Open Generation Drawer {liveMode ? '(Live)' : '(Demo)'}
                        </Button>
                        <Text c="dimmed" size="sm">
                            Then work through the checklist below
                        </Text>
                    </Group>
                </Stack>
            </Paper>

            {/* Status Alerts */}
            {lastOutput && lastOutput.statblock && (
                <Paper p="lg" withBorder shadow="sm">
                    <Stack gap="md">
                        <Group justify="space-between" align="center">
                            <Title order={3}>
                                <Group gap="xs">
                                    <IconCheck size={20} color="green" />
                                    Generated: {lastOutput.statblock.name}
                                </Group>
                            </Title>
                            <Badge size="lg" color="violet">
                                CR {lastOutput.statblock.challengeRating}
                            </Badge>
                        </Group>
                        
                        <Divider />
                        
                        <Group gap="lg">
                            <Text size="sm"><strong>Type:</strong> {lastOutput.statblock.size} {lastOutput.statblock.type}</Text>
                            <Text size="sm"><strong>Alignment:</strong> {lastOutput.statblock.alignment}</Text>
                            <Text size="sm"><strong>AC:</strong> {lastOutput.statblock.armorClass}</Text>
                            <Text size="sm"><strong>HP:</strong> {lastOutput.statblock.hitPoints} ({lastOutput.statblock.hitDice})</Text>
                        </Group>
                        
                        {lastOutput.statblock.abilityScores && (
                            <Group gap="md">
                                <Badge variant="outline">STR {lastOutput.statblock.abilityScores.strength}</Badge>
                                <Badge variant="outline">DEX {lastOutput.statblock.abilityScores.dexterity}</Badge>
                                <Badge variant="outline">CON {lastOutput.statblock.abilityScores.constitution}</Badge>
                                <Badge variant="outline">INT {lastOutput.statblock.abilityScores.intelligence}</Badge>
                                <Badge variant="outline">WIS {lastOutput.statblock.abilityScores.wisdom}</Badge>
                                <Badge variant="outline">CHA {lastOutput.statblock.abilityScores.charisma}</Badge>
                            </Group>
                        )}
                        
                        {lastOutput.statblock.actions && lastOutput.statblock.actions.length > 0 && (
                            <div>
                                <Text size="sm" fw={600} mb="xs">Actions:</Text>
                                <Stack gap="xs">
                                    {lastOutput.statblock.actions.slice(0, 3).map((action: { name: string; description: string }, i: number) => (
                                        <Text key={i} size="xs" c="dimmed">
                                            <strong>{action.name}:</strong> {action.description.substring(0, 100)}...
                                        </Text>
                                    ))}
                                    {lastOutput.statblock.actions.length > 3 && (
                                        <Text size="xs" c="dimmed">...and {lastOutput.statblock.actions.length - 3} more actions</Text>
                                    )}
                                </Stack>
                            </div>
                        )}
                        
                        {lastOutput.imagePrompt && (
                            <div>
                                <Text size="sm" fw={600}>Image Prompt:</Text>
                                <Code block>{lastOutput.imagePrompt}</Code>
                            </div>
                        )}
                    </Stack>
                </Paper>
            )}
            {lastError && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" title="Last Error">
                    {lastError.title}: {lastError.message}
                </Alert>
            )}

            {/* Checklist */}
            <Paper p="lg" withBorder>
                <Stack gap="md">
                    <Text fw={600} size="lg">Step 2: Manual Test Checklist</Text>
                    <Text size="sm" c="dimmed">
                        Perform each action and check the box if the expected result occurs.
                        Click a checkbox to toggle it.
                    </Text>

                    <Divider />

                    <Accordion multiple variant="separated">
                        {Object.entries(groupedChecklist).map(([category, items]) => {
                            const categoryComplete = items.every(item => completedTests.has(item.id));
                            const categoryCount = items.filter(item => completedTests.has(item.id)).length;

                            return (
                                <Accordion.Item key={category} value={category}>
                                    <Accordion.Control>
                                        <Group justify="space-between" pr="md">
                                            <Text fw={500}>{category}</Text>
                                            <Badge
                                                color={categoryComplete ? 'green' : 'gray'}
                                                variant={categoryComplete ? 'filled' : 'light'}
                                            >
                                                {categoryCount}/{items.length}
                                            </Badge>
                                        </Group>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <Stack gap="sm">
                                            {items.map((item) => (
                                                <Paper
                                                    key={item.id}
                                                    p="sm"
                                                    withBorder
                                                    style={{
                                                        borderColor: completedTests.has(item.id)
                                                            ? 'var(--mantine-color-green-4)'
                                                            : undefined,
                                                        backgroundColor: completedTests.has(item.id)
                                                            ? 'var(--mantine-color-green-0)'
                                                            : undefined
                                                    }}
                                                >
                                                    <Group align="flex-start" wrap="nowrap">
                                                        <Checkbox
                                                            checked={completedTests.has(item.id)}
                                                            onChange={() => toggleTest(item.id)}
                                                            size="md"
                                                            mt={4}
                                                        />
                                                        <Stack gap={4} style={{ flex: 1 }}>
                                                            <Text fw={500} size="sm">
                                                                Action: {item.action}
                                                            </Text>
                                                            <Text size="sm" c="dimmed">
                                                                Expected: {item.expected}
                                                            </Text>
                                                        </Stack>
                                                    </Group>
                                                </Paper>
                                            ))}
                                        </Stack>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            );
                        })}
                    </Accordion>
                </Stack>
            </Paper>

            {/* Prototype Data Reference */}
            <Paper p="lg" withBorder>
                <Stack gap="md">
                    <Text fw={600} size="lg">Reference: Prototype Data</Text>
                    <Text size="sm" c="dimmed">
                        This is the prototype input data used to pre-fill the form:
                    </Text>
                    <Code block>
                        {JSON.stringify(STATBLOCK_INPUT_EXAMPLE, null, 2)}
                    </Code>
                </Stack>
            </Paper>

            {/* The Drawer */}
            <GenerationDrawerEngine
                config={demoConfig}
                opened={opened}
                onClose={() => setOpened(false)}
                initialImages={[
                    {
                        id: 'demo-img-1',
                        url: 'https://placehold.co/512x512/7c3aed/ffffff?text=Dragon',
                        prompt: 'A fearsome red dragon',
                        createdAt: '2025-12-20T10:00:00Z',
                        sessionId: 'demo-session',
                        service: 'demo-statblock'
                    },
                    {
                        id: 'demo-img-2',
                        url: 'https://placehold.co/512x512/059669/ffffff?text=Goblin',
                        prompt: 'A sneaky goblin rogue',
                        createdAt: '2025-12-21T11:00:00Z',
                        sessionId: 'demo-session',
                        service: 'demo-statblock'
                    }
                ]}
                isTutorialMode={!liveMode}
            />
        </Stack>
    );
}
