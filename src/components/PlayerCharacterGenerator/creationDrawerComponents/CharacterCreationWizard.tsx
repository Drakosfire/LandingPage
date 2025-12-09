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
 * 6. Equipment Summary
 * 7. Review & Finalize
 * 
 * @module CharacterGenerator
 */

import React, { useEffect } from 'react';
import { Stack, Button, Group, Stepper, Box } from '@mantine/core';
import AbilityScoresStep from './AbilityScoresStep';
import RaceSelectionStep from './RaceSelectionStep';
import ClassSelectionStep from './ClassSelectionStep';
import SpellSelectionStep from './SpellSelectionStep';
import BackgroundSelectionStep from './BackgroundSelectionStep';
import EquipmentStep from './EquipmentStep';
import ReviewStep from './ReviewStep';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';

const TOTAL_STEPS = 7;

const CharacterCreationWizard: React.FC = () => {
    const { character, ruleEngine, wizardStep, setWizardStep } = usePlayerCharacterGenerator();

    // Use wizardStep from context (localStorage persistence handled by provider)
    const currentStep = wizardStep;
    const setCurrentStep = setWizardStep;

    // Determine if current character is a spellcaster (for step 4 skip logic)
    const isSpellcaster = (): boolean => {
        if (!character?.dnd5eData?.classes?.length) return false;
        const primaryClass = character.dnd5eData.classes[0];
        const classData = ruleEngine.getClassById(primaryClass.name);
        return classData?.spellcasting !== undefined;
    };

    // Log step changes
    useEffect(() => {
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
                <Stepper.Step label="Equipment" description="Review gear" />
                <Stepper.Step label="Review" description="Finalize" />
            </Stepper>

            {/* Step Content */}
            <Box style={{ flex: 1, overflowY: 'auto' }}>
                {currentStep === 0 && <AbilityScoresStep />}
                {currentStep === 1 && <RaceSelectionStep />}
                {currentStep === 2 && <ClassSelectionStep />}
                {currentStep === 3 && <SpellSelectionStep />}
                {currentStep === 4 && <BackgroundSelectionStep />}
                {currentStep === 5 && <EquipmentStep />}
                {currentStep === 6 && <ReviewStep />}
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

export default CharacterCreationWizard;
