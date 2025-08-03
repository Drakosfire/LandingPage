import React from 'react';
import { Step } from './StepNavigation';
import '../../styles/DesignSystem.css';

interface FloatingHeaderProps {
    steps: Step[];
    currentStepId: string;
    onStepClick: (stepId: string) => void;
    onPrevious: () => void;
    onNext: () => void;
    canGoNext: boolean;
    canGoPrevious: boolean;
    projectName?: string;
    currentItemName?: string;
    saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
    isGenerationInProgress?: boolean; // Generation lock state
}

const FloatingHeader: React.FC<FloatingHeaderProps> = ({
    steps,
    currentStepId,
    onStepClick,
    onPrevious,
    onNext,
    canGoNext,
    canGoPrevious,
    projectName,
    currentItemName,
    saveStatus = 'idle',
    isGenerationInProgress = false
}) => {
    const currentStepIndex = steps.findIndex(step => step.id === currentStepId);
    const currentStep = steps[currentStepIndex];
    const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

    const getStepIcon = (step: Step) => {
        switch (step.status) {
            case 'completed':
                return '✓';
            case 'error':
                return '⚠';
            default:
                return step.icon || (steps.findIndex(s => s.id === step.id) + 1).toString();
        }
    };

    const isStepClickable = (step: Step) => {
        // 🔒 Block all step navigation during generation
        if (isGenerationInProgress) return false;

        if (step.status === 'active' || step.status === 'completed') return true;
        const stepIndex = steps.findIndex(s => s.id === step.id);
        const previousStep = stepIndex > 0 ? steps[stepIndex - 1] : null;
        return previousStep?.status === 'completed';
    };

    const getDisplayTitle = () => {
        // Prioritize current item name over saved project name
        if (currentItemName && currentItemName.trim() && currentItemName !== 'Untitled Project') {
            return currentItemName;
        }
        if (projectName && projectName.trim()) {
            return projectName;
        }
        return "New Project";
    };

    const getSaveStatusIcon = () => {
        switch (saveStatus) {
            case 'saving':
                return { icon: '⏳', color: 'var(--primary-blue)', text: 'Saving...' };
            case 'saved':
                return { icon: '✅', color: 'var(--success-green)', text: 'Saved' };
            case 'error':
                return { icon: '❌', color: 'var(--error-red)', text: 'Save Error' };
            default:
                return null;
        }
    };

    const saveStatusInfo = getSaveStatusIcon();

    return (
        <header
            style={{
                position: 'fixed',
                top: 0,
                left: '80px', // Start after nav bar on desktop
                right: 0,
                height: '80px', // Fixed header height
                background: 'var(--surface-white)',
                borderBottom: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                zIndex: 400, // Below nav bar (which should be 500+)
                padding: 'var(--space-3) var(--space-4)',
                display: 'flex',
                alignItems: 'center'
            }}
            className="card-generator-header"
        >
            {/* Mobile Layout */}
            <div
                className="block md:hidden"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                    width: '100%'
                }}
            >
                {/* Top row: Title and Projects button */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--text-primary)',
                        flex: 1,
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-2)'
                    }}>
                        <span>{getDisplayTitle()}</span>
                        {saveStatusInfo && (
                            <span style={{
                                fontSize: 'var(--text-sm)',
                                color: saveStatusInfo.color,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <span>{saveStatusInfo.icon}</span>
                                <span className="hidden sm:inline">{saveStatusInfo.text}</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Progress bar */}
                <div style={{
                    width: '100%',
                    height: '4px',
                    background: 'var(--surface-light)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--primary-blue), var(--success-green))',
                        borderRadius: 'var(--radius-full)',
                        width: `${progressPercentage}%`,
                        transition: 'width 0.3s ease'
                    }} />
                </div>

                {/* Current step and navigation */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <button
                        onClick={onPrevious}
                        disabled={!canGoPrevious || isGenerationInProgress}
                        className="btn btn-secondary btn-compact"
                        style={{
                            opacity: (canGoPrevious && !isGenerationInProgress) ? 1 : 0.5,
                            cursor: isGenerationInProgress ? 'not-allowed' : 'pointer'
                        }}
                        title={isGenerationInProgress ? 'Navigation disabled during generation' : ''}
                    >
                        ← Previous
                    </button>

                    <div style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--primary-blue)',
                        fontWeight: 'var(--font-semibold)',
                        textAlign: 'center'
                    }}>
                        {currentStep?.label}
                    </div>

                    <button
                        onClick={onNext}
                        disabled={!canGoNext || isGenerationInProgress}
                        className="btn btn-primary btn-compact"
                        style={{
                            opacity: (canGoNext && !isGenerationInProgress) ? 1 : 0.5,
                            cursor: isGenerationInProgress ? 'not-allowed' : 'pointer'
                        }}
                        title={isGenerationInProgress ? 'Navigation disabled during generation' : ''}
                    >
                        Next →
                    </button>
                </div>
            </div>

            {/* Desktop Layout */}
            <div
                className="hidden md:flex"
                style={{
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    width: '100%',
                    height: '100%'
                }}
            >
                {/* Left: Title and Progress */}
                <div style={{
                    flex: '0 0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                    minWidth: '200px'
                }}>
                    <div style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        marginTop: 'var(--space-1)' // Bump title down slightly
                    }}>
                        <span>{getDisplayTitle()}</span>
                        {saveStatusInfo && (
                            <span style={{
                                fontSize: 'var(--text-sm)',
                                color: saveStatusInfo.color,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <span>{saveStatusInfo.icon}</span>
                                <span>{saveStatusInfo.text}</span>
                            </span>
                        )}
                    </div>

                    <div style={{
                        width: '100%',
                        height: '4px',
                        background: 'var(--surface-light)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--primary-blue), var(--success-green))',
                            borderRadius: 'var(--radius-full)',
                            width: `${progressPercentage}%`,
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                </div>

                {/* Center: Step Navigation */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                }}>
                    <div style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--primary-blue)',
                        fontWeight: 'var(--font-semibold)',
                        textAlign: 'center'
                    }}>
                        {currentStep?.label}
                    </div>

                    <nav
                        className="step-nav"
                        role="tablist"
                        aria-label="Card creation steps"
                        style={{
                            display: 'flex',
                            gap: 'var(--space-1)',
                            background: 'var(--surface-light)',
                            padding: 'var(--space-1)',
                            borderRadius: 'var(--radius-base)',
                            border: '1px solid var(--border-light)'
                        }}
                    >
                        {steps.map((step, index) => {
                            const isActive = step.id === currentStepId;
                            const isClickable = isStepClickable(step);

                            return (
                                <button
                                    key={step.id}
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => isClickable ? onStepClick(step.id) : undefined}
                                    disabled={!isClickable}
                                    style={{
                                        padding: 'var(--space-2)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: 'none',
                                        background: isActive ? 'var(--primary-blue)' : 'transparent',
                                        color: isActive ? 'var(--surface-white)' :
                                            isClickable ? 'var(--text-primary)' : 'var(--text-muted)',
                                        cursor: isClickable ? 'pointer' : 'not-allowed',
                                        fontSize: 'var(--text-sm)',
                                        fontWeight: isActive ? 'var(--font-semibold)' : 'var(--font-medium)',
                                        transition: 'all 0.2s ease',
                                        minWidth: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    title={step.label}
                                >
                                    {getStepIcon(step)}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Right: Navigation */}
                <div style={{
                    flex: '0 0 auto',
                    display: 'flex',
                    gap: 'var(--space-2)'
                }}>
                    <button
                        onClick={onPrevious}
                        disabled={!canGoPrevious || isGenerationInProgress}
                        className="btn btn-secondary btn-compact"
                        style={{
                            opacity: (canGoPrevious && !isGenerationInProgress) ? 1 : 0.5,
                            padding: 'var(--space-1) var(--space-2)',
                            fontSize: 'var(--text-sm)',
                            height: '20px',
                            minHeight: '10px !important',
                            cursor: isGenerationInProgress ? 'not-allowed' : 'pointer'
                        }}
                        title={isGenerationInProgress ? 'Navigation disabled during generation' : ''}
                    >
                        ← Previous
                    </button>

                    <button
                        onClick={onNext}
                        disabled={!canGoNext || isGenerationInProgress}
                        className="btn btn-primary btn-compact"
                        style={{
                            opacity: (canGoNext && !isGenerationInProgress) ? 1 : 0.5,
                            padding: 'var(--space-1) var(--space-2)',
                            fontSize: 'var(--text-sm)',
                            height: '20px',
                            minHeight: '10px !important',
                            cursor: isGenerationInProgress ? 'not-allowed' : 'pointer'
                        }}
                        title={isGenerationInProgress ? 'Navigation disabled during generation' : ''}
                    >
                        Next →
                    </button>
                </div>
            </div>
        </header>
    );
};

export default FloatingHeader; 