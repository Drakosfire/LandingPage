import React from 'react';
import '../../styles/DesignSystem.css';

export type StepStatus = 'pending' | 'active' | 'completed' | 'error';

export interface Step {
    id: string;
    label: string;
    shortLabel: string;
    icon: string;
    status: StepStatus;
}

interface StepNavigationProps {
    steps: Step[];
    currentStep: string;
    onStepClick: (stepId: string) => void;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
    steps,
    currentStep,
    onStepClick
}) => {
    const getStepIcon = (step: Step) => {
        switch (step.status) {
            case 'completed':
                return '✓';
            case 'error':
                return '⚠';
            default:
                const stepIndex = steps.findIndex(s => s.id === step.id) + 1;
                return stepIndex.toString();
        }
    };

    const isStepClickable = (step: Step) => {
        // Allow clicking on active, completed, or if it's the next step after completed ones
        if (step.status === 'active' || step.status === 'completed') return true;

        const stepIndex = steps.findIndex(s => s.id === step.id);
        const previousStep = stepIndex > 0 ? steps[stepIndex - 1] : null;

        return previousStep?.status === 'completed';
    };

    return (
        <nav className="step-nav" role="tablist" aria-label="Card creation steps">
            {steps.map((step) => (
                <button
                    key={step.id}
                    className={`step-tab ${step.status === 'active' ? 'active' : ''} ${step.status}`}
                    onClick={() => isStepClickable(step) && onStepClick(step.id)}
                    disabled={!isStepClickable(step)}
                    role="tab"
                    aria-selected={step.status === 'active'}
                    aria-controls={`step-panel-${step.id}`}
                    title={step.label}
                >
                    <span className="step-icon" aria-hidden="true">
                        {getStepIcon(step)}
                    </span>
                    <span className="step-label">
                        <span className="hidden md:inline">{step.label}</span>
                        <span className="md:hidden">{step.shortLabel}</span>
                    </span>
                </button>
            ))}
        </nav>
    );
};

export default StepNavigation; 