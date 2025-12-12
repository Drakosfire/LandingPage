/**
 * PlayerCharacterCreationDrawer Component
 * 
 * Main drawer for player character creation with wizard-style workflow.
 * Adapted from StatBlockGenerationDrawer but with D&D Beyond-style step progression.
 * 
 * Features:
 * - Tab 1: Character Creation (wizard with 5 steps)
 * - Tab 2: Portrait Generation
 * 
 * @module PlayerCharacterGenerator
 */

import React, { useState, useEffect } from 'react';
import { Drawer, Tabs, Title, Stack, Box, Button, Group } from '@mantine/core';
import { IconUsers, IconPhoto, IconPlus } from '@tabler/icons-react';
import CharacterCreationWizard, { StepNav, TOTAL_STEPS } from './creationDrawerComponents/CharacterCreationWizard';
import { usePlayerCharacterGenerator } from './PlayerCharacterGeneratorProvider';

interface PlayerCharacterCreationDrawerProps {
    opened: boolean;
    onClose: () => void;
}

const PlayerCharacterCreationDrawer: React.FC<PlayerCharacterCreationDrawerProps> = ({
    opened,
    onClose,
}) => {
    const [activeTab, setActiveTab] = useState<'creation' | 'portrait'>('creation');
    const { character, ruleEngine, wizardStep, setWizardStep, resetCharacter } = usePlayerCharacterGenerator();

    // Reset to creation tab when drawer opens
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

    return (
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
            {/* Sticky tabs header */}
            <Tabs
                value={activeTab}
                onChange={(val) => setActiveTab(val as any)}
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
                    <Tabs.Panel value="creation" style={{ minHeight: '100%' }}>
                        <CharacterCreationWizard />
                    </Tabs.Panel>

                    <Tabs.Panel value="portrait" style={{ minHeight: '100%' }}>
                        <Stack gap="md">
                            <Title order={5}>Portrait Generation</Title>
                            <Box p="md" style={{ border: '1px dashed gray', borderRadius: '8px' }}>
                                Phase 1: Portrait generation placeholder
                                <br />
                                Will lift ImageGenerationTab from StatblockGenerator in Phase 2
                            </Box>
                        </Stack>
                    </Tabs.Panel>
                </Box>
            </Tabs>
        </Drawer>
    );
};

export default PlayerCharacterCreationDrawer;





