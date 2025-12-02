/**
 * CharacterCreationWizard Component
 * 
 * D&D Beyond-style wizard with Next/Prev navigation through character creation steps.
 * 
 * Steps:
 * 1. Ability Scores (Point Buy / Standard Array / Roll)
 * 2. Race Selection
 * 3. Class Selection (with L1 subclass, skills, equipment)
 * 4. Spells (casters only, skipped for non-casters)
 * 5. Background Selection
 * 6. Review & Finalize
 * 
 * @module CharacterGenerator
 */

import React, { useState, useEffect } from 'react';
import { Stack, Button, Group, Stepper, Text, Box } from '@mantine/core';
import AbilityScoresStep from './AbilityScoresStep';
import RaceSelectionStep from './RaceSelectionStep';
import ClassSelectionStep from './ClassSelectionStep';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';

const WIZARD_STEP_KEY = 'charactergen_wizard_step';
const TOTAL_STEPS = 6;

const CharacterCreationWizard: React.FC = () => {
    const { character, ruleEngine } = usePlayerCharacterGenerator();

    // Restore last step from localStorage
    const [currentStep, setCurrentStep] = useState<number>(() => {
        try {
            const saved = localStorage.getItem(WIZARD_STEP_KEY);
            return saved ? parseInt(saved) : 0;
        } catch {
            return 0;
        }
    });

    // Determine if current character is a spellcaster (for step 4 skip logic)
    const isSpellcaster = (): boolean => {
        if (!character?.dnd5eData?.classes?.length) return false;
        const primaryClass = character.dnd5eData.classes[0];
        const classData = ruleEngine.getClassById(primaryClass.name);
        return classData?.spellcasting !== undefined;
    };

    // Persist step to localStorage
    useEffect(() => {
        localStorage.setItem(WIZARD_STEP_KEY, currentStep.toString());
        console.log(`📍 [Wizard] Step ${currentStep + 1}/${TOTAL_STEPS}`);
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep < TOTAL_STEPS - 1) {
            let nextStep = currentStep + 1;
            
            // Skip spell step (index 3) for non-casters
            if (nextStep === 3 && !isSpellcaster()) {
                console.log('⏭️ [Wizard] Skipping Spells step (non-caster)');
                nextStep = 4; // Jump to Background
            }
            
            setCurrentStep(nextStep);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            let prevStep = currentStep - 1;
            
            // Skip spell step (index 3) when going back for non-casters
            if (prevStep === 3 && !isSpellcaster()) {
                console.log('⏭️ [Wizard] Skipping Spells step (non-caster)');
                prevStep = 2; // Jump to Class
            }
            
            setCurrentStep(prevStep);
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
                <Stepper.Step label="Abilities" description="Assign scores" />
                <Stepper.Step label="Race" description="Choose race" />
                <Stepper.Step label="Class" description="Choose class" />
                <Stepper.Step 
                    label="Spells" 
                    description={isSpellcaster() ? "Select spells" : "N/A"} 
                    color={isSpellcaster() ? undefined : "gray"}
                />
                <Stepper.Step label="Background" description="Choose background" />
                <Stepper.Step label="Review" description="Finalize" />
            </Stepper>

            {/* Step Content */}
            <Box style={{ flex: 1, overflowY: 'auto' }}>
                {currentStep === 0 && <AbilityScoresStep />}
                {currentStep === 1 && <RaceSelectionStep />}
                {currentStep === 2 && <ClassSelectionStep />}
                {currentStep === 3 && <PlaceholderStep stepName="Spell Selection" />}
                {currentStep === 4 && <PlaceholderStep stepName="Background" />}
                {currentStep === 5 && <ReviewStep />}
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

                {currentStep < TOTAL_STEPS - 1 ? (
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





