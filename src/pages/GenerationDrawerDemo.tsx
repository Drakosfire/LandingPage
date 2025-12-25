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

import React, { useState, useCallback } from 'react';
import {
    Button, Stack, Title, Text, Code, Paper, Textarea,
    Checkbox, Badge, Group, Divider, Accordion, Alert
} from '@mantine/core';
import { IconWand, IconPhoto, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { GenerationDrawerEngine } from '../shared/GenerationDrawerEngine';
import type { GenerationDrawerConfig, GenerationError } from '../shared/GenerationDrawerEngine';
import { GenerationType } from '../shared/GenerationDrawerEngine';
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
    onError: (error: GenerationError) => void
): GenerationDrawerConfig<StatBlockInput, StatBlockOutput> => ({
    id: 'demo-statblock',
    title: 'Generate StatBlock (Demo)',

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

    generationEndpoint: '/api/demo/generate',
    transformInput: (input: StatBlockInput) => ({
        description: input.description,
        name: input.name,
        challengeRating: input.challengeRating
    }),
    transformOutput: (): StatBlockOutput => STATBLOCK_OUTPUT_EXAMPLE,

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

    tutorialConfig: {
        simulatedDurationMs: 7000,
        mockAuthState: true,
        mockImages: [],
        onTutorialComplete: () => {
            console.log('🎓 Tutorial complete');
        }
    },

    // State management - preserve state on close for testing
    resetOnClose: false,
    isTutorialMode: true
});

// =============================================================================
// DEMO PAGE COMPONENT
// =============================================================================

export default function GenerationDrawerDemo() {
    const [opened, setOpened] = useState(false);
    const [completedTests, setCompletedTests] = useState<Set<string>>(new Set());
    const [lastOutput, setLastOutput] = useState<StatBlockOutput | null>(null);
    const [lastError, setLastError] = useState<GenerationError | null>(null);

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

    const demoConfig = createDemoConfig(handleComplete, handleError);

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
                    <Badge size="xl" variant="filled" color={progress === 100 ? 'green' : 'blue'}>
                        {completedCount} / {totalCount} ({progress}%)
                    </Badge>
                </Group>
            </div>

            {/* Launch Button */}
            <Paper p="lg" withBorder shadow="sm">
                <Stack gap="md">
                    <Text fw={600} size="lg">Step 1: Open the Drawer</Text>
                    <Group>
                        <Button
                            size="lg"
                            onClick={() => setOpened(true)}
                            leftSection={<IconWand size={20} />}
                        >
                            Open Generation Drawer
                        </Button>
                        <Text c="dimmed" size="sm">
                            Then work through the checklist below
                        </Text>
                    </Group>
                </Stack>
            </Paper>

            {/* Status Alerts */}
            {lastOutput && lastOutput.statblock && (
                <Alert icon={<IconCheck size={16} />} color="green" title="Last Generation Result">
                    Generated: {lastOutput.statblock.name} (CR {lastOutput.statblock.challengeRating})
                </Alert>
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
            />
        </Stack>
    );
}
