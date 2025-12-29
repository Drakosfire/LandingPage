/**
 * PlayerCharacterCreationDrawer Component
 * 
 * Main drawer for player character creation with wizard-style workflow.
 * 
 * Features:
 * - Tab 1: Generate (opens PCGGenerationDrawer for AI character generation)
 * - Tab 2: Build (manual wizard with steps)
 * - Tab 3: Portrait (opens PCGGenerationDrawer on image tab for AI portrait)
 * 
 * The Generate and Portrait tabs trigger the PCGGenerationDrawer which uses
 * the GenerationDrawerEngine factory pattern for consistent generation UX.
 * 
 * @module PlayerCharacterGenerator
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Drawer, Tabs, Box, Button, Group, Text, Stack, Title, Paper } from '@mantine/core';
import { IconUsers, IconPhoto, IconPlus, IconSparkles, IconWand } from '@tabler/icons-react';
import CharacterCreationWizard, { StepNav, TOTAL_STEPS } from './creationDrawerComponents/CharacterCreationWizard';
import { usePlayerCharacterGenerator } from './PlayerCharacterGeneratorProvider';
import PCGGenerationDrawer from './PCGGenerationDrawer';

interface PlayerCharacterCreationDrawerProps {
    opened: boolean;
    onClose: () => void;
    isTutorialMode?: boolean;
}

const PlayerCharacterCreationDrawer: React.FC<PlayerCharacterCreationDrawerProps> = ({
    opened,
    onClose,
    isTutorialMode = false,
}) => {
    const [activeTab, setActiveTab] = useState<'generate' | 'creation' | 'portrait'>('creation');
    const { 
        character, 
        ruleEngine, 
        wizardStep, 
        setWizardStep, 
        resetCharacter,
        isGenerating
    } = usePlayerCharacterGenerator();

    // State for PCGGenerationDrawer
    const [generationDrawerOpen, setGenerationDrawerOpen] = useState(false);
    const [generationDrawerTab, setGenerationDrawerTab] = useState<'text' | 'image'>('text');

    // Lightweight toast (DesignSystem.css has `.toast` styles; we keep local to the drawer for now)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        return () => {
            if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
            }
        };
    }, []);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
        setToast({ message, type });
        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
        }
        toastTimerRef.current = setTimeout(() => setToast(null), 3000);
    }, []);

    // Handle tab changes - open generation drawer for Generate/Portrait
    const handleTabChange = useCallback((tab: string | null) => {
        if (tab === 'generate') {
            setGenerationDrawerTab('text');
            setGenerationDrawerOpen(true);
        } else if (tab === 'portrait') {
            setGenerationDrawerTab('image');
            setGenerationDrawerOpen(true);
        } else if (tab) {
            setActiveTab(tab as any);
        }
    }, []);

    // Reset to creation tab when main drawer opens
    useEffect(() => {
        if (opened) {
            setActiveTab('creation');
        }
    }, [opened]);

    // Create new character - reset everything
    const handleNewCharacter = () => {
        if (window.confirm('Start a new character? Current progress will be lost.')) {
            resetCharacter();
            setWizardStep(0);
            setActiveTab('creation');
            console.log('🆕 [Drawer] New character created');
        }
    };

    // Spellcaster check for step navigation
    const isSpellcaster = (): boolean => {
        if (!character?.dnd5eData?.classes?.length) return false;
        const primaryClass = character.dnd5eData.classes[0];
        // Class IDs are lowercase (e.g., 'warlock'), but name is capitalized (e.g., 'Warlock')
        const classData = ruleEngine.getClassById(primaryClass.name.toLowerCase());
        return classData?.spellcasting !== undefined;
    };

    // Handle step navigation (matches wizard logic)
    const handlePrevious = () => {
        if (wizardStep > 0) {
            let prevStep = wizardStep - 1;
            if (prevStep === 4 && !isSpellcaster()) {
                prevStep = 3;
            }
            setWizardStep(prevStep);
        }
    };

    const handleNext = () => {
        if (wizardStep < TOTAL_STEPS - 1) {
            let nextStep = wizardStep + 1;
            if (nextStep === 4 && !isSpellcaster()) {
                nextStep = 5;
            }
            setWizardStep(nextStep);
        }
    };

    // Handle generation completion - switch to Build tab at Review step
    const handleGenerationComplete = useCallback(() => {
        setGenerationDrawerOpen(false);
        setActiveTab('creation');
        setWizardStep(7); // Review step
        showToast('Character created! Review and customize below.', 'success');
    }, [setWizardStep, showToast]);

    return (
        <>
            <Drawer
                opened={opened}
                onClose={onClose}
                position="left"
                size="lg"
                withCloseButton={false}
                overlayProps={{ opacity: 0.3, blur: 2 }}
                zIndex={350}  // Above footer (300), below header (400)
                styles={{
                    content: {
                        marginTop: '88px', // Below UnifiedHeader
                        marginLeft: '0',
                        height: 'calc(100vh - 93px)', // 88px header + 5px bottom gap
                        width: '100%',
                        borderTopRightRadius: '12px',
                        borderBottomRightRadius: '12px'
                    },
                    body: {
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: 0
                    }
                }}
                data-testid="character-creation-drawer"
            >
                {toast && (
                    <div className={`toast ${toast.type}`} role="status" aria-live="polite">
                        <Text size="sm" fw={600} mb={4}>
                            {toast.type === 'success' ? '✨ Success' : toast.type === 'error' ? 'Error' : 'Notice'}
                        </Text>
                        <Text size="sm">{toast.message}</Text>
                    </div>
                )}
                {/* Sticky tabs header */}
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%'
                    }}
                >
                    <Box
                        style={{
                            position: 'sticky',
                            top: 0,
                            zIndex: 10,
                            background: 'var(--mantine-color-body)',
                            borderBottom: '1px solid var(--mantine-color-gray-3)'
                        }}
                    >
                        <Tabs.List grow>
                            <Tabs.Tab
                                value="generate"
                                leftSection={<IconSparkles size={16} />}
                                data-testid="character-generate-tab"
                            >
                                Generate
                            </Tabs.Tab>
                            <Tabs.Tab
                                value="creation"
                                leftSection={<IconUsers size={16} />}
                                data-testid="character-creation-tab"
                            >
                                Build
                            </Tabs.Tab>
                            <Tabs.Tab
                                value="portrait"
                                leftSection={<IconPhoto size={16} />}
                                data-testid="portrait-tab"
                            >
                                Portrait
                            </Tabs.Tab>
                        </Tabs.List>

                        {/* Step nav - always visible on Build tab */}
                        {activeTab === 'creation' && (
                            <Box
                                p="xs"
                                style={{
                                    borderTop: '1px solid var(--mantine-color-gray-2)',
                                    background: 'var(--mantine-color-gray-0)'
                                }}
                            >
                                <Group gap="xs" wrap="nowrap">
                                    <Button
                                        variant="subtle"
                                        size="xs"
                                        color="gray"
                                        leftSection={<IconPlus size={14} />}
                                        onClick={handleNewCharacter}
                                    >
                                        New
                                    </Button>
                                    <Box style={{ flex: 1 }}>
                                        <StepNav
                                            currentStep={wizardStep}
                                            totalSteps={TOTAL_STEPS}
                                            onPrevious={handlePrevious}
                                            onNext={handleNext}
                                            isSpellcaster={isSpellcaster()}
                                        />
                                    </Box>
                                </Group>
                            </Box>
                        )}
                    </Box>

                    {/* Scrollable content area */}
                    <Box
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: 'var(--mantine-spacing-md)',
                            paddingBottom: '100px' // Extra space at bottom for last content to be visible
                        }}
                    >
                        {/* Generate tab - show prompt to open generation drawer */}
                        <Tabs.Panel value="generate" style={{ minHeight: '100%' }}>
                            <Stack gap="lg" align="center" justify="center" py="xl">
                                <Paper p="xl" radius="md" withBorder style={{ maxWidth: 400, textAlign: 'center' }}>
                                    <Stack gap="md" align="center">
                                        <IconWand size={48} color="var(--mantine-color-violet-6)" />
                                        <Title order={3}>AI Character Generation</Title>
                                        <Text size="sm" c="dimmed">
                                            Let AI create a complete character based on your concept.
                                            Includes backstory, stats, equipment, and more.
                                        </Text>
                                        <Button
                                            size="lg"
                                            color="violet"
                                            leftSection={<IconSparkles size={18} />}
                                            onClick={() => {
                                                setGenerationDrawerTab('text');
                                                setGenerationDrawerOpen(true);
                                            }}
                                        >
                                            Generate Character
                                        </Button>
                                    </Stack>
                                </Paper>
                            </Stack>
                        </Tabs.Panel>

                        {/* Build tab - wizard */}
                        <Tabs.Panel value="creation" style={{ minHeight: '100%' }}>
                            <CharacterCreationWizard />
                        </Tabs.Panel>

                        {/* Portrait tab - show prompt to open portrait generation */}
                        <Tabs.Panel value="portrait" style={{ minHeight: '100%' }}>
                            <Stack gap="lg" align="center" justify="center" py="xl">
                                <Paper p="xl" radius="md" withBorder style={{ maxWidth: 400, textAlign: 'center' }}>
                                    <Stack gap="md" align="center">
                                        <IconPhoto size={48} color="var(--mantine-color-violet-6)" />
                                        <Title order={3}>AI Portrait Generation</Title>
                                        <Text size="sm" c="dimmed">
                                            Generate a custom portrait for your character using AI.
                                            Choose from different styles and models.
                                        </Text>
                                        <Button
                                            size="lg"
                                            color="violet"
                                            leftSection={<IconPhoto size={18} />}
                                            onClick={() => {
                                                setGenerationDrawerTab('image');
                                                setGenerationDrawerOpen(true);
                                            }}
                                        >
                                            Generate Portrait
                                        </Button>
                                    </Stack>
                                </Paper>
                            </Stack>
                        </Tabs.Panel>
                    </Box>
                </Tabs>
            </Drawer>

            {/* PCG Generation Drawer - opens on top when Generate/Portrait selected */}
            <PCGGenerationDrawer
                opened={generationDrawerOpen}
                onClose={() => setGenerationDrawerOpen(false)}
                initialTab={generationDrawerTab}
                isTutorialMode={isTutorialMode}
                onGenerationComplete={handleGenerationComplete}
            />
        </>
    );
};

export default PlayerCharacterCreationDrawer;





