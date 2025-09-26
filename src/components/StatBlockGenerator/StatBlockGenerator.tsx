// StatBlockGenerator.tsx - Main StatBlock Generator Component
// Following CardGenerator.tsx patterns adapted for 5-step StatBlock workflow

import React, { useState, useEffect, useCallback } from 'react';
import "@mantine/core/styles.css";
import { MantineProvider, Stack } from "@mantine/core";
import dungeonMindTheme from '../../config/mantineTheme';
import '../../styles/mantineOverrides.css';
import '../../styles/DesignSystem.css';
import '../../styles/CardGeneratorLayout.css';
import '../../styles/CardGeneratorPolish.css';

import { StatBlockGeneratorProvider, useStatBlockGenerator } from './StatBlockGeneratorProvider';
import { useAuth } from '../../context/AuthContext';

// Import step components
import Step1CreatureDescription from './steps/Step1CreatureDescription';
import Step2CreatureImage from './steps/Step2CreatureImage';
import Step3StatblockCustomization from './steps/Step3StatBlockCustomization';
import Step4ModelGeneration from './steps/Step4ModelGeneration';
import Step5ExportFinalization from './steps/Step5ExportFinalization';

// Import navigation and shared components
import StatBlockStepNavigation from './StatBlockStepNavigation';
import StatBlockHeader from './StatBlockHeader';
import Footer from '../Footer';

// Import shared components (to be created)
import FunGenerationFeedback from './shared/FunGenerationFeedback';
import SuccessCelebration from './shared/SuccessCelebration';
import StatBlockProjectsDrawer from './StatBlockProjectsDrawer';
import StatBlockCanvas from './shared/StatBlockCanvas';

// Main component content (wrapped by provider)
const StatBlockGeneratorContent: React.FC = () => {
    const { authState } = useAuth();
    // user available via authState.user when needed for save operations
    const {
        currentStepId,
        canGoNext,
        canGoPrevious,
        nextStep,
        previousStep,
        goToStep,
        isAnyGenerationInProgress,
        setGenerationLock,
        saveStatus,
        error
    } = useStatBlockGenerator();

    // Local UI state
    const [forceExpandDrawer, setForceExpandDrawer] = useState(false);
    const [showSuccessCelebration, setShowSuccessCelebration] = useState(false);

    // Step definitions
    const steps = [
        { id: 'creature-description', label: 'Creature Description', order: 1 },
        { id: 'creature-image', label: 'Creature Image', order: 2 },
        { id: 'statblock-customization', label: 'Statblock Customization', order: 3 },
        { id: 'model-generation', label: '3D Model Generation', order: 4 },
        { id: 'export-finalization', label: 'Export & Finalization', order: 5 }
    ];

    const currentStepIndex = steps.findIndex(step => step.id === currentStepId);
    const totalSteps = steps.length;

    // Navigation handlers
    const handleNext = useCallback(() => {
        if (canGoNext()) {
            nextStep();
        }
    }, [canGoNext, nextStep]);

    const handlePrevious = useCallback(() => {
        if (canGoPrevious()) {
            previousStep();
        }
    }, [canGoPrevious, previousStep]);

    const handleGoToStep = useCallback((stepId: string) => {
        if (!isAnyGenerationInProgress) {
            goToStep(stepId);
        }
    }, [isAnyGenerationInProgress, goToStep]);

    // Generation lock handler
    const handleGenerationLockChange = useCallback((lockType: 'creatureGeneration' | 'imageGeneration' | 'modelGeneration' | 'exportGeneration', isLocked: boolean) => {
        setGenerationLock(lockType, isLocked);
    }, [setGenerationLock]);

    // Show success celebration when reaching final step
    useEffect(() => {
        if (currentStepId === 'export-finalization' && !showSuccessCelebration) {
            setShowSuccessCelebration(true);
            // Auto-hide after 3 seconds
            const timer = setTimeout(() => setShowSuccessCelebration(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [currentStepId, showSuccessCelebration]);

    // Render current step component
    const renderCurrentStep = () => {
        const stepProps = {
            onNext: handleNext,
            onPrevious: handlePrevious,
            canGoNext: canGoNext(),
            canGoPrevious: canGoPrevious(),
            currentStepIndex,
            totalSteps,
            onGenerationLockChange: (isLocked: boolean) => {
                // Map step to appropriate lock type
                const lockTypeMap = {
                    'creature-description': 'creatureGeneration',
                    'creature-image': 'imageGeneration',
                    'model-generation': 'modelGeneration',
                    'export-finalization': 'exportGeneration'
                } as const;

                const lockType = lockTypeMap[currentStepId as keyof typeof lockTypeMap];
                if (lockType) {
                    handleGenerationLockChange(lockType, isLocked);
                }
            }
        };

        switch (currentStepId) {
            case 'creature-description':
                return <Step1CreatureDescription {...stepProps} />;
            case 'creature-image':
                return <Step2CreatureImage {...stepProps} />;
            case 'statblock-customization':
                return <Step3StatblockCustomization {...stepProps} />;
            case 'model-generation':
                return <Step4ModelGeneration {...stepProps} />;
            case 'export-finalization':
                return <Step5ExportFinalization {...stepProps} />;
            default:
                return <Step1CreatureDescription {...stepProps} />;
        }
    };


    return (
        <div className="card-generator-layout">
            {/* Projects Drawer */}
            <StatBlockProjectsDrawer
                forceExpanded={forceExpandDrawer}
                onExpandedChange={setForceExpandDrawer}
            />

            {/* Main Content Area */}
            <div className="main-content-area">
                {/* Header */}
                <StatBlockHeader
                    onOpenProjects={() => setForceExpandDrawer(true)}
                    saveStatus={saveStatus}
                    error={error}
                />

                {/* Step Navigation */}
                <StatBlockStepNavigation
                    steps={steps}
                    currentStepId={currentStepId}
                    onStepClick={handleGoToStep}
                    isGenerationInProgress={isAnyGenerationInProgress}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    canGoNext={canGoNext()}
                    canGoPrevious={canGoPrevious()}
                />

                {/* Main Step Content with Persistent Canvas */}
                <div className="statblock-generator-layout">
                    <div className="statblock-tools-column">
                        <Stack gap="lg">
                            {renderCurrentStep()}
                        </Stack>
                    </div>
                    <div className="statblock-canvas-column">
                        <StatBlockCanvas />
                    </div>
                </div>

                {/* Generation Feedback Overlay */}
                {isAnyGenerationInProgress && (
                    <FunGenerationFeedback
                        isVisible={isAnyGenerationInProgress}
                        currentStep={currentStepId}
                    />
                )}

                {/* Success Celebration */}
                {showSuccessCelebration && (
                    <SuccessCelebration
                        isVisible={showSuccessCelebration}
                        onClose={() => setShowSuccessCelebration(false)}
                        title="StatBlock Complete!"
                        message="Your D&D 5e creature is ready for adventure!"
                    />
                )}

                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
};

// Main exported component with provider wrapper
const StatBlockGenerator: React.FC = () => {
    return (
        <MantineProvider theme={dungeonMindTheme}>
            <StatBlockGeneratorProvider>
                <StatBlockGeneratorContent />
            </StatBlockGeneratorProvider>
        </MantineProvider>
    );
};

export default StatBlockGenerator;
