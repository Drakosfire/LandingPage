/**
 * CharacterCreationWizard Component
 * 
 * D&D Beyond-style wizard with Next/Prev navigation through character creation steps.
 * 
 * Steps:
 * 0. Basic Info (name, concept, pronouns)
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
import { Stack, ActionIcon, Text, Group } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import BasicInfoStep from './BasicInfoStep';
import AbilityScoresStep from './AbilityScoresStep';
import RaceSelectionStep from './RaceSelectionStep';
import ClassSelectionStep from './ClassSelectionStep';
import SpellSelectionStep from './SpellSelectionStep';
import BackgroundSelectionStep from './BackgroundSelectionStep';
import EquipmentStep from './EquipmentStep';
import ReviewStep from './ReviewStep';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';

const TOTAL_STEPS = 8;

const STEP_LABELS = [
    'Basics',
    'Abilities', 
    'Race',
    'Class',
    'Spells',
    'Background',
    'Equipment',
    'Review'
];

interface StepNavProps {
    currentStep: number;
    totalSteps: number;
    onPrevious: () => void;
    onNext: () => void;
    isSpellcaster: boolean;
}

/**
 * Compact step navigator - shows: ← | 1. Basics | →
 * Used for both mobile and desktop in the drawer header
 */
const StepNav: React.FC<StepNavProps> = ({
    currentStep,
    totalSteps,
    onPrevious,
    onNext,
    isSpellcaster
}) => {
    const stepLabel = STEP_LABELS[currentStep] || 'Step';
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;
    
    // For non-casters, skip spells step in display count
    const displayStep = !isSpellcaster && currentStep > 4 
        ? currentStep  // Don't adjust - we're past spells
        : currentStep + 1;
    const displayTotal = isSpellcaster ? totalSteps : totalSteps - 1;

    return (
        <Group justify="space-between" gap="xs" w="100%">
            <ActionIcon
                variant="subtle"
                size="lg"
                onClick={onPrevious}
                disabled={isFirstStep}
                aria-label="Previous step"
            >
                <IconChevronLeft size={20} />
            </ActionIcon>
            
            <Text fw={500} size="sm" style={{ textAlign: 'center', flex: 1 }}>
                {displayStep}. {stepLabel}
            </Text>
            
            <ActionIcon
                variant="subtle"
                size="lg"
                onClick={onNext}
                disabled={isLastStep}
                aria-label="Next step"
            >
                <IconChevronRight size={20} />
            </ActionIcon>
        </Group>
    );
};

const CharacterCreationWizard: React.FC = () => {
    const { wizardStep } = usePlayerCharacterGenerator();

    // Log step changes
    useEffect(() => {
        console.log(`📍 [Wizard] Step ${wizardStep + 1}/${TOTAL_STEPS}`);
    }, [wizardStep]);

    // Step content only - navigation handled by drawer header
    return (
        <Stack gap="lg">
            {wizardStep === 0 && <BasicInfoStep />}
            {wizardStep === 1 && <AbilityScoresStep />}
            {wizardStep === 2 && <RaceSelectionStep />}
            {wizardStep === 3 && <ClassSelectionStep />}
            {wizardStep === 4 && <SpellSelectionStep />}
            {wizardStep === 5 && <BackgroundSelectionStep />}
            {wizardStep === 6 && <EquipmentStep />}
            {wizardStep === 7 && <ReviewStep />}
        </Stack>
    );
};

export default CharacterCreationWizard;
export { StepNav, StepNav as MobileStepNav, STEP_LABELS, TOTAL_STEPS };
