/**
 * CharacterCreationWizard Component
 * 
 * D&D Beyond-style wizard with Next/Prev navigation through character creation steps.
 * 
 * Steps:
 * 1. Ability Scores (Point Buy / Standard Array / Roll)
 * 2. Race Selection
 * 3. Class Selection
 * 4. Background Selection
 * 5. Review & Finalize
 * 
 * @module CharacterGenerator
 */

import React, { useState, useEffect } from 'react';
import { Stack, Button, Group, Stepper, Text, Box } from '@mantine/core';
import AbilityScoresStep from './AbilityScoresStep';

const WIZARD_STEP_KEY = 'charactergen_wizard_step';

const CharacterCreationWizard: React.FC = () => {
    // Restore last step from localStorage
    const [currentStep, setCurrentStep] = useState<number>(() => {
        try {
            const saved = localStorage.getItem(WIZARD_STEP_KEY);
            return saved ? parseInt(saved) : 0;
        } catch {
            return 0;
        }
    });

    // Persist step to localStorage
    useEffect(() => {
        localStorage.setItem(WIZARD_STEP_KEY, currentStep.toString());
        console.log(`📍 [Wizard] Step ${currentStep + 1}/5`);
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleFinish = () => {
        console.log('✅ [Wizard] Character creation complete');
        // Phase 2: Handle character completion
    };

    return (
        <Stack gap="lg" h="100%">
            {/* Step Progress Indicator */}
            <Stepper active={currentStep} size="sm">
                <Stepper.Step label="Abilities" description="Assign ability scores" />
                <Stepper.Step label="Race" description="Choose race" />
                <Stepper.Step label="Class" description="Choose class" />
                <Stepper.Step label="Background" description="Choose background" />
                <Stepper.Step label="Review" description="Finalize character" />
            </Stepper>

            {/* Step Content */}
            <Box style={{ flex: 1, overflowY: 'auto' }}>
                {currentStep === 0 && <AbilityScoresStep />}
                {currentStep === 1 && <PlaceholderStep stepName="Race Selection" />}
                {currentStep === 2 && <PlaceholderStep stepName="Class Selection" />}
                {currentStep === 3 && <PlaceholderStep stepName="Background" />}
                {currentStep === 4 && <ReviewStep />}
            </Box>

            {/* Navigation Buttons */}
            <Group justify="space-between" mt="md">
                <Button
                    variant="default"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    data-testid="wizard-prev-button"
                >
                    ← Previous
                </Button>

                {currentStep < 4 ? (
                    <Button
                        onClick={handleNext}
                        data-testid="wizard-next-button"
                    >
                        Next →
                    </Button>
                ) : (
                    <Button
                        color="green"
                        onClick={handleFinish}
                        data-testid="wizard-finish-button"
                    >
                        ✓ Finish
                    </Button>
                )}
            </Group>
        </Stack>
    );
};

// Placeholder component for unimplemented steps
const PlaceholderStep: React.FC<{ stepName: string }> = ({ stepName }) => {
    return (
        <Stack gap="md" p="md">
            <Text fw={600} size="lg">{stepName}</Text>
            <Box p="xl" style={{ border: '2px dashed gray', borderRadius: '8px', textAlign: 'center' }}>
                <Text c="dimmed">
                    Phase 1: {stepName} - Coming in Phase 2
                    <br />
                    Use Next/Previous to navigate the wizard
                </Text>
            </Box>
        </Stack>
    );
};

// Review step (summary of character)
const ReviewStep: React.FC = () => {
    return (
        <Stack gap="md" p="md">
            <Text fw={600} size="lg">Review & Finalize</Text>
            <Box p="xl" style={{ border: '2px dashed gray', borderRadius: '8px', textAlign: 'center' }}>
                <Text c="dimmed">
                    Phase 1: Character summary - Coming in Phase 2
                    <br />
                    Click "Finish" to complete character creation
                </Text>
            </Box>
        </Stack>
    );
};

export default CharacterCreationWizard;





