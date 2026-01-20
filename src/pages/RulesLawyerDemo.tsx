/**
 * RulesLawyer Demo Page
 *
 * Standalone demo page exercising RulesLawyer features before main app integration.
 * Access: /ruleslawyer-demo
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Badge,
    Button,
    Checkbox,
    Container,
    Divider,
    Group,
    Modal,
    Paper,
    Stack,
    Tabs,
    Text,
    Title
} from '@mantine/core';

import { UnifiedHeader } from '../components/UnifiedHeader';
import { ChatProvider, useChatContext } from '../context/ChatContext';
import RulesLawyerView from '../components/RulesLawyer/RulesLawyerView';
import { createRulesLawyerToolboxSections } from '../components/RulesLawyer/rulesLawyerToolboxConfig';
import {
    useGenerationTimeTracking,
    type UseGenerationTimeTrackingReturn
} from '../shared/GenerationDrawerEngine/hooks/useGenerationTimeTracking';

const RULES_LAWYER_ICON_URL =
    'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/0ed83976-6007-4b56-7943-1c08d3117e00/public';
const SAVED_RULES_ICON_URL =
    'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/f825f833-5a96-44ba-f9c3-5908ce8c5000/Full';

interface ChecklistItem {
    id: string;
    label: string;
    category: string;
    taskId?: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
    { id: 'ruleset-select', label: 'Select a ruleset from the selector', category: 'Core Flow', taskId: 'T024' },
    { id: 'query-response', label: 'Submit a question and receive a cited response', category: 'Core Flow', taskId: 'T013' },
    { id: 'switch-ruleset', label: 'Switch rulesets and verify citations update', category: 'Rulesets', taskId: 'T022' },
    { id: 'mobile-layout', label: 'Verify mobile layout keeps controls visible', category: 'Mobile', taskId: 'T040' }
];

const STORAGE_KEY = 'ruleslawyerDemo_checklist';

function loadChecklistFromStorage(): Set<string> {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return new Set(JSON.parse(saved));
        }
    } catch (err) {
        console.warn('❌ [RulesLawyerDemo] Failed to load checklist:', err);
    }
    return new Set();
}

function ChecklistSection() {
    const [checkedItems, setCheckedItems] = useState<Set<string>>(() => loadChecklistFromStorage());
    const [clearModalOpened, setClearModalOpened] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(checkedItems)));
        } catch (err) {
            console.warn('❌ [RulesLawyerDemo] Failed to save checklist:', err);
        }
    }, [checkedItems, isInitialized]);

    const toggleItem = (id: string) => {
        setCheckedItems((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const itemsByCategory = useMemo(() => {
        const grouped: Record<string, ChecklistItem[]> = {};
        CHECKLIST_ITEMS.forEach((item) => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });
        return grouped;
    }, []);

    const totalChecked = checkedItems.size;
    const totalItems = CHECKLIST_ITEMS.length;
    const progressPercent = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;

    return (
        <Paper p="lg" withBorder>
            <Stack gap="md">
                <Group justify="space-between" align="center">
                    <div>
                        <Title order={3}>Feature Verification Checklist</Title>
                        <Text size="sm" c="dimmed" mt={4}>
                            Check items as you validate the RulesLawyer demo flow.
                        </Text>
                    </div>
                    <Group gap="sm">
                        <Badge size="lg" variant="light" color={progressPercent === 100 ? 'green' : 'blue'}>
                            {totalChecked} / {totalItems} ({progressPercent}%)
                        </Badge>
                        <Text
                            size="xs"
                            c="dimmed"
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => setClearModalOpened(true)}
                        >
                            Clear All
                        </Text>
                    </Group>
                </Group>

                <Divider />

                <Stack gap="lg">
                    {Object.entries(itemsByCategory).map(([category, items]) => (
                        <div key={category}>
                            <Text fw={600} size="sm" mb="sm">
                                {category}
                                {items[0].taskId && (
                                    <Badge size="xs" variant="dot" ml="xs" color="gray">
                                        {items[0].taskId}
                                    </Badge>
                                )}
                            </Text>
                            <Stack gap="xs">
                                {items.map((item) => (
                                    <Checkbox
                                        key={item.id}
                                        label={item.label}
                                        checked={checkedItems.has(item.id)}
                                        onChange={() => toggleItem(item.id)}
                                        size="sm"
                                    />
                                ))}
                            </Stack>
                        </div>
                    ))}
                </Stack>

                {progressPercent === 100 && (
                    <Paper p="md" bg="green.0" withBorder>
                        <Text size="sm" c="green.7" fw={500}>
                            ✅ All checklist items completed! RulesLawyer core flow verified.
                        </Text>
                    </Paper>
                )}
            </Stack>

            <Modal
                opened={clearModalOpened}
                onClose={() => setClearModalOpened(false)}
                title="Clear Checklist"
                centered
            >
                <Stack gap="md">
                    <Text size="sm">
                        Are you sure you want to clear all checklist items? This action cannot be undone.
                    </Text>
                    <Group justify="flex-end">
                        <Button variant="subtle" onClick={() => setClearModalOpened(false)}>
                            Cancel
                        </Button>
                        <Button color="red" onClick={() => setCheckedItems(new Set())}>
                            Clear All
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Paper>
    );
}

const SERVICE_ID = 'ruleslawyer';

function useTextGenerationTimeTracking() {
    return useGenerationTimeTracking({
        service: SERVICE_ID,
        generationType: 'text',
        maxRecords: 100,
        recommendedPercentile: 95
    });
}

function useImageGenerationTimeTracking() {
    return useGenerationTimeTracking({
        service: SERVICE_ID,
        generationType: 'image',
        maxRecords: 100,
        recommendedPercentile: 95
    });
}

function GenerationTimeStatsPanel({ textStats, imageStats }: {
    textStats: UseGenerationTimeTrackingReturn;
    imageStats: UseGenerationTimeTrackingReturn;
}) {
    return (
        <Stack gap="md">
            <div>
                <Title order={4} mb="xs">Generation Time Statistics</Title>
                <Text size="sm" c="dimmed" mb="md">
                    Track generation durations to tune progress estimates.
                </Text>
            </div>

            {textStats.stats && (
                <Paper p="md" withBorder>
                    <Group justify="space-between" mb="md">
                        <Title order={5}>Text Generation</Title>
                        <Group gap="xs">
                            <Badge size="sm" color="blue">
                                {textStats.recordCount} records
                            </Badge>
                            <Badge size="sm" color="green">
                                Recommended: {Math.round(textStats.recommendedEstimatedMs)}ms
                            </Badge>
                        </Group>
                    </Group>
                    <Group gap="lg">
                        <Text size="sm">Median: <strong>{Math.round(textStats.stats.medianMs)}ms</strong></Text>
                        <Text size="sm">P95: <strong>{Math.round(textStats.stats.p95Ms)}ms</strong></Text>
                    </Group>
                </Paper>
            )}

            {imageStats.stats && (
                <Paper p="md" withBorder>
                    <Group justify="space-between" mb="md">
                        <Title order={5}>Image Generation</Title>
                        <Group gap="xs">
                            <Badge size="sm" color="blue">
                                {imageStats.recordCount} records
                            </Badge>
                            <Badge size="sm" color="green">
                                Recommended: {Math.round(imageStats.recommendedEstimatedMs)}ms
                            </Badge>
                        </Group>
                    </Group>
                    <Group gap="lg">
                        <Text size="sm">Median: <strong>{Math.round(imageStats.stats.medianMs)}ms</strong></Text>
                        <Text size="sm">P95: <strong>{Math.round(imageStats.stats.p95Ms)}ms</strong></Text>
                    </Group>
                </Paper>
            )}

            {textStats.recordCount === 0 && imageStats.recordCount === 0 && (
                <Paper p="md" withBorder>
                    <Text c="dimmed" ta="center">
                        No generation times recorded yet.
                    </Text>
                </Paper>
            )}
        </Stack>
    );
}

function StateViewer() {
    const { chatHistory, currentEmbedding, embeddingsLoaded, isLoadingEmbeddings, debugState } = useChatContext();
    const textTimeTracking = useTextGenerationTimeTracking();
    const imageTimeTracking = useImageGenerationTimeTracking();

    const stateForDisplay = useMemo(() => ({
        chatCount: chatHistory.length,
        currentEmbedding,
        embeddingsLoaded,
        isLoadingEmbeddings,
        debugState,
        textGenerationRecords: textTimeTracking.recordCount,
        imageGenerationRecords: imageTimeTracking.recordCount
    }), [
        chatHistory.length,
        currentEmbedding,
        embeddingsLoaded,
        isLoadingEmbeddings,
        debugState,
        textTimeTracking.recordCount,
        imageTimeTracking.recordCount
    ]);

    return (
        <Stack gap="md">
            <div>
                <Title order={4} mb="xs">Internal State (JSON Viewer)</Title>
                <Text size="sm" c="dimmed" mb="md">
                    Real-time view of RulesLawyer state for debugging and verification.
                </Text>
            </div>
            <Paper p="md" withBorder style={{ backgroundColor: '#f8f9fa' }}>
                <pre style={{ fontSize: '12px', maxHeight: '600px', overflow: 'auto' }}>
                    {JSON.stringify(stateForDisplay, null, 2)}
                </pre>
            </Paper>
        </Stack>
    );
}

function DemoHeader({ onOpenSavedRules }: { onOpenSavedRules: () => void }) {
    const { clearMessages } = useChatContext();

    const handleClearChat = useCallback(() => {
        console.log('🗑️ [RulesLawyerDemo] Clear chat clicked');
        clearMessages();
    }, [clearMessages]);

    const toolboxSections = createRulesLawyerToolboxSections({
        onClearChat: handleClearChat,
    });

    return (
        <UnifiedHeader
            app={{
                id: 'rules-lawyer-demo',
                name: 'RulesLawyer Demo',
                icon: RULES_LAWYER_ICON_URL
            }}
            toolboxSections={toolboxSections}
            showAuth={true}
            showGeneration={false}
            showProjects={false}
            showSaveButton={false}
            saveStatus="idle"
            showSavedRules={true}
            onSavedRulesClick={onOpenSavedRules}
            savedRulesIconUrl={SAVED_RULES_ICON_URL}
        />
    );
}

function RulesLawyerDemoContent({
    savedRulesOpen,
    onCloseSavedRules,
}: {
    savedRulesOpen: boolean;
    onCloseSavedRules: () => void;
}) {
    const textTimeTracking = useTextGenerationTimeTracking();
    const imageTimeTracking = useImageGenerationTimeTracking();
    return (
        <Container size="xl" py="md">
            <Stack gap="xl">
                <div>
                    <Title order={1} mb="xs">RulesLawyer Demo</Title>
                    <Text c="dimmed">
                        Standalone demo page exercising RulesLawyer features before main app integration.
                    </Text>
                </div>

                <Divider />

                <Tabs defaultValue="demo" keepMounted={false}>
                    <Tabs.List>
                        <Tabs.Tab value="demo">Demo Canvas</Tabs.Tab>
                        <Tabs.Tab value="state">Internal State Viewer</Tabs.Tab>
                        <Tabs.Tab value="timing">
                            Generation Times
                            {(textTimeTracking.recordCount > 0 || imageTimeTracking.recordCount > 0) && (
                                <Badge size="xs" variant="filled" color="blue" ml="xs">
                                    {textTimeTracking.recordCount + imageTimeTracking.recordCount}
                                </Badge>
                            )}
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="demo" pt="md">
                        <RulesLawyerView
                            savedRulesOpen={savedRulesOpen}
                            onCloseSavedRules={onCloseSavedRules}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="state" pt="md">
                        <StateViewer />
                    </Tabs.Panel>

                    <Tabs.Panel value="timing" pt="md">
                        <GenerationTimeStatsPanel
                            textStats={textTimeTracking}
                            imageStats={imageTimeTracking}
                        />
                    </Tabs.Panel>
                </Tabs>

                <ChecklistSection />
            </Stack>
        </Container>
    );
}

export default function RulesLawyerDemo() {
    const [savedRulesOpen, setSavedRulesOpen] = useState(false);

    return (
        <ChatProvider>
            <DemoHeader onOpenSavedRules={() => setSavedRulesOpen(true)} />
            <RulesLawyerDemoContent
                savedRulesOpen={savedRulesOpen}
                onCloseSavedRules={() => setSavedRulesOpen(false)}
            />
        </ChatProvider>
    );
}
