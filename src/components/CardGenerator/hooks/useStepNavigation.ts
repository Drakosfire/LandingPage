import React, { useState, useCallback, useEffect } from 'react';
import { ItemDetails } from '../../../types/card.types';

export interface Step {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed' | 'error';
    canAccess: boolean;
    dependencies: string[];
}

export interface UseStepNavigationReturn {
    // State
    currentStepId: string;
    steps: Step[];

    // Actions
    setCurrentStepId: (stepId: string) => void;

    // Navigation
    handleStepClick: (stepId: string) => void;
    handleNext: () => void;
    handlePrevious: () => void;
    handleComplete: () => void;

    // Validation
    canGoNext: () => boolean;
    canGoPrevious: () => boolean;
    canAccessStep: (stepId: string) => boolean;
    updateStepStatus: (stepId: string, status: Step['status']) => void;
}

export const useStepNavigation = (
    itemDetails: ItemDetails,
    selectedFinalImage: string,
    selectedBorder: string,
    selectedSeedImage: string,
    generatedCardImages: string[],
    selectedGeneratedCardImage: string,
    finalCardWithText: string,
    generationLocks: Record<string, boolean>,
    onStepChange?: (stepId: string) => void
): UseStepNavigationReturn => {
    const [currentStepId, setCurrentStepId] = useState<string>('text-generation');

    // Define step configuration
    const steps: Step[] = [
        {
            id: 'text-generation',
            title: 'Describe Your Item',
            description: 'Tell us about your magic item',
            status: 'pending',
            canAccess: true,
            dependencies: []
        },
        {
            id: 'core-image',
            title: 'Choose Your Image',
            description: 'Upload or generate an image for your item',
            status: 'pending',
            canAccess: false,
            dependencies: ['text-generation']
        },
        {
            id: 'border-generation',
            title: 'Choose Your Card Style',
            description: 'Select borders and generate your card',
            status: 'pending',
            canAccess: false,
            dependencies: ['text-generation', 'core-image']
        },
        {
            id: 'final-assembly',
            title: 'Your Finished Card',
            description: 'Review and download your completed card',
            status: 'pending',
            canAccess: false,
            dependencies: ['text-generation', 'core-image', 'border-generation']
        }
    ];

    // Check if any generation is in progress
    const isAnyGenerationInProgress = Object.values(generationLocks).some(lock => lock);

    // Update step access based on dependencies
    const updateStepAccess = useCallback(() => {
        steps.forEach(step => {
            if (step.dependencies.length === 0) {
                step.canAccess = true;
                return;
            }

            // Check if all dependencies are completed
            const allDependenciesMet = step.dependencies.every(depId => {
                const depStep = steps.find(s => s.id === depId);
                return depStep?.status === 'completed';
            });

            step.canAccess = allDependenciesMet;
        });
    }, [steps]);

    // Update step status
    const updateStepStatus = useCallback((stepId: string, status: Step['status']) => {
        const step = steps.find(s => s.id === stepId);
        if (step) {
            step.status = status;
            updateStepAccess();
        }
    }, [steps, updateStepAccess]);

    // Check if a step can be accessed
    const canAccessStep = useCallback((stepId: string): boolean => {
        const step = steps.find(s => s.id === stepId);
        return step?.canAccess || false;
    }, [steps]);

    // Handle step click
    const handleStepClick = useCallback((stepId: string) => {
        if (isAnyGenerationInProgress) {
            console.warn('⏸️ Cannot navigate while generation is in progress');
            return;
        }

        if (!canAccessStep(stepId)) {
            console.warn('🚫 Cannot access step:', stepId, '- dependencies not met');
            return;
        }

        console.log('🔄 Navigating to step:', stepId);
        setCurrentStepId(stepId);
        onStepChange?.(stepId);
    }, [isAnyGenerationInProgress, canAccessStep, onStepChange]);

    // Navigate to next step
    const handleNext = useCallback(() => {
        if (isAnyGenerationInProgress) {
            console.warn('⏸️ Cannot navigate while generation is in progress');
            return;
        }

        const currentIndex = steps.findIndex(s => s.id === currentStepId);
        if (currentIndex === -1 || currentIndex >= steps.length - 1) {
            console.warn('🚫 Cannot go to next step - already at last step');
            return;
        }

        const nextStep = steps[currentIndex + 1];
        if (!canAccessStep(nextStep.id)) {
            console.warn('🚫 Cannot access next step - dependencies not met');
            return;
        }

        console.log('🔄 Navigating to next step:', nextStep.id);
        setCurrentStepId(nextStep.id);
        onStepChange?.(nextStep.id);
    }, [currentStepId, steps, isAnyGenerationInProgress, canAccessStep, onStepChange]);

    // Navigate to previous step
    const handlePrevious = useCallback(() => {
        if (isAnyGenerationInProgress) {
            console.warn('⏸️ Cannot navigate while generation is in progress');
            return;
        }

        const currentIndex = steps.findIndex(s => s.id === currentStepId);
        if (currentIndex <= 0) {
            console.warn('🚫 Cannot go to previous step - already at first step');
            return;
        }

        const prevStep = steps[currentIndex - 1];
        console.log('🔄 Navigating to previous step:', prevStep.id);
        setCurrentStepId(prevStep.id);
        onStepChange?.(prevStep.id);
    }, [currentStepId, steps, isAnyGenerationInProgress, onStepChange]);

    // Handle completion
    const handleComplete = useCallback(() => {
        console.log('✅ Card generation completed!');
        // This will be handled by the parent component
    }, []);

    // Check if can go to next step
    const canGoNext = useCallback((): boolean => {
        if (isAnyGenerationInProgress) {
            return false;
        }

        const currentIndex = steps.findIndex(s => s.id === currentStepId);
        if (currentIndex === -1 || currentIndex >= steps.length - 1) {
            return false;
        }

        const nextStep = steps[currentIndex + 1];
        return canAccessStep(nextStep.id);
    }, [currentStepId, steps, isAnyGenerationInProgress, canAccessStep]);

    // Check if can go to previous step
    const canGoPrevious = useCallback((): boolean => {
        if (isAnyGenerationInProgress) {
            return false;
        }

        const currentIndex = steps.findIndex(s => s.id === currentStepId);
        return currentIndex > 0;
    }, [currentStepId, steps, isAnyGenerationInProgress]);

    // Update step statuses based on current state
    const updateStepStatuses = useCallback(() => {
        // Step 1: Text Generation
        const hasTextContent = itemDetails.name?.trim() || itemDetails.description?.trim();
        updateStepStatus('text-generation', hasTextContent ? 'completed' : 'in-progress');

        // Step 2: Core Image
        const hasImage = selectedFinalImage && selectedFinalImage.trim();
        updateStepStatus('core-image', hasImage ? 'completed' : 'pending');

        // Step 3: Border Generation
        const hasBorder = selectedBorder && selectedBorder.trim();
        const hasGeneratedCards = generatedCardImages.length > 0;
        const hasSelectedCard = selectedGeneratedCardImage && selectedGeneratedCardImage.trim();
        const step3Complete = hasBorder && hasGeneratedCards && hasSelectedCard;
        updateStepStatus('border-generation', step3Complete ? 'completed' : 'pending');

        // Step 4: Final Assembly
        const hasFinalCard = finalCardWithText && finalCardWithText.trim();
        updateStepStatus('final-assembly', hasFinalCard ? 'completed' : 'pending');
    }, [
        itemDetails.name,
        itemDetails.description,
        selectedFinalImage,
        selectedBorder,
        generatedCardImages,
        selectedGeneratedCardImage,
        finalCardWithText,
        updateStepStatus
    ]);

    // Update step statuses whenever relevant state changes
    useEffect(() => {
        updateStepStatuses();
    }, [updateStepStatuses]);

    return {
        // State
        currentStepId,
        steps,

        // Actions
        setCurrentStepId,

        // Navigation
        handleStepClick,
        handleNext,
        handlePrevious,
        handleComplete,

        // Validation
        canGoNext,
        canGoPrevious,
        canAccessStep,
        updateStepStatus
    };
};