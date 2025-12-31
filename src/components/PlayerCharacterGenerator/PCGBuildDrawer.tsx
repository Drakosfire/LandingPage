/**
 * PCGBuildDrawer - Standalone Build Wizard Drawer
 * 
 * Contains the manual character creation wizard (CharacterCreationWizard).
 * Separate from AI generation - this is for step-by-step manual character building.
 * 
 * @module PlayerCharacterGenerator
 */

import React, { useCallback } from 'react';
import { Drawer, Box, Button, Group, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import CharacterCreationWizard, { StepNav, TOTAL_STEPS } from './creationDrawerComponents/CharacterCreationWizard';
import { usePlayerCharacterGenerator } from './PlayerCharacterGeneratorProvider';

interface PCGBuildDrawerProps {
    opened: boolean;
    onClose: () => void;
}

/**
 * PCGBuildDrawer - Manual character building wizard
 * 
 * This drawer provides the step-by-step wizard for manually building a character.
 * It is completely separate from the AI generation drawer.
 */
const PCGBuildDrawer: React.FC<PCGBuildDrawerProps> = ({
    opened,
    onClose,
}) => {
    const {
        character,
        ruleEngine,
        wizardStep,
        setWizardStep,
        resetCharacter
    } = usePlayerCharacterGenerator();

    // Create new character - reset everything
    const handleNewCharacter = useCallback(() => {
        if (window.confirm('Start a new character? Current progress will be lost.')) {
            resetCharacter();
            setWizardStep(0);
            console.log('🆕 [PCGBuildDrawer] New character created');
        }
    }, [resetCharacter, setWizardStep]);

    // Spellcaster check for step navigation
    const isSpellcaster = useCallback((): boolean => {
        if (!character?.dnd5eData?.classes?.length) return false;
        const primaryClass = character.dnd5eData.classes[0];
        // Class IDs are lowercase (e.g., 'warlock'), but name is capitalized (e.g., 'Warlock')
        const classData = ruleEngine.getClassById(primaryClass.name.toLowerCase());
        return classData?.spellcasting !== undefined;
    }, [character, ruleEngine]);

    // Handle step navigation (matches wizard logic)
    const handlePrevious = useCallback(() => {
        if (wizardStep > 0) {
            let prevStep = wizardStep - 1;
            if (prevStep === 4 && !isSpellcaster()) {
                prevStep = 3;
            }
            setWizardStep(prevStep);
        }
    }, [wizardStep, setWizardStep, isSpellcaster]);

    const handleNext = useCallback(() => {
        if (wizardStep < TOTAL_STEPS - 1) {
            let nextStep = wizardStep + 1;
            if (nextStep === 4 && !isSpellcaster()) {
                nextStep = 5;
            }
            setWizardStep(nextStep);
        }
    }, [wizardStep, setWizardStep, isSpellcaster]);

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            position="left"
            size="lg"
            title={
                <Text fw={600} size="lg">Build Character</Text>
            }
            overlayProps={{ opacity: 0.3, blur: 2 }}
            zIndex={350}
            styles={{
                inner: {
                    top: '88px',
                    height: 'calc(100vh - 88px)'
                },
                content: {
                    height: '100%',
                    maxHeight: '100%'
                },
                body: {
                    height: 'calc(100vh - 88px - 60px)',
                    maxHeight: 'calc(100vh - 88px - 60px)',
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 0
                }
            }}
            data-testid="pcg-build-drawer"
        >
            {/* Step navigation header */}
            <Box
                p="xs"
                style={{
                    borderBottom: '1px solid var(--mantine-color-gray-3)',
                    background: 'var(--mantine-color-gray-0)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
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

            {/* Wizard content */}
            <Box
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: 'var(--mantine-spacing-md)',
                    paddingBottom: '100px'
                }}
            >
                <CharacterCreationWizard />
            </Box>
        </Drawer>
    );
};

export default PCGBuildDrawer;
