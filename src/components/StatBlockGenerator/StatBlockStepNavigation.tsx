// StatBlockStepNavigation.tsx - Step Navigation Component
import React from 'react';
import { Group, Button, Badge, Text, Card, Progress } from '@mantine/core';
import { IconCheck, IconChevronLeft, IconChevronRight, IconLock } from '@tabler/icons-react';

interface Step {
    id: string;
    label: string;
    order: number;
}

interface StatBlockStepNavigationProps {
    steps: Step[];
    currentStepId: string;
    onStepClick: (stepId: string) => void;
    isGenerationInProgress: boolean;
    onPrevious: () => void;
    onNext: () => void;
    canGoPrevious: boolean;
    canGoNext: boolean;
}

const StatBlockStepNavigation: React.FC<StatBlockStepNavigationProps> = ({
    steps,
    currentStepId,
    onStepClick,
    isGenerationInProgress,
    onPrevious,
    onNext,
    canGoPrevious,
    canGoNext
}) => {
    const currentStep = steps.find(step => step.id === currentStepId);
    const progressValue = currentStep ? (currentStep.order / steps.length) * 100 : 0;

    return (
        <Card shadow="sm" padding="md" radius="md" withBorder mb="lg">
            <Group justify="space-between" align="center" wrap="wrap" gap="md">
                <Button
                    variant="light"
                    color="blue"
                    size="sm"
                    leftSection={<IconChevronLeft size={16} />}
                    onClick={onPrevious}
                    disabled={!canGoPrevious || isGenerationInProgress}
                >
                    Previous
                </Button>
                <Group
                    gap="md"
                    wrap="nowrap"
                    justify="center"
                    style={{ flex: 1, minWidth: '240px' }}
                >
                    {steps.map((step, index) => {
                        const isActive = step.id === currentStepId;
                        const isCompleted = false; // TODO: Implement completion tracking
                        const isClickable = !isGenerationInProgress;

                        return (
                            <Button
                                key={step.id}
                                variant={isActive ? "filled" : "light"}
                                color={isCompleted ? "green" : "blue"}
                                size="sm"
                                onClick={() => onStepClick(step.id)}
                                disabled={!isClickable}
                                leftSection={
                                    isCompleted ? (
                                        <IconCheck size={16} />
                                    ) : isGenerationInProgress && !isActive ? (
                                        <IconLock size={16} />
                                    ) : (
                                        <Badge size="xs" variant="transparent" color="white">
                                            {step.order}
                                        </Badge>
                                    )
                                }
                            >
                                <Text size="sm" truncate>
                                    {step.label}
                                </Text>
                            </Button>
                        );
                    })}
                </Group>
                <Button
                    variant="filled"
                    color="blue"
                    size="sm"
                    rightSection={<IconChevronRight size={16} />}
                    onClick={onNext}
                    disabled={!canGoNext || isGenerationInProgress}
                >
                    Next
                </Button>
            </Group>
            <Progress value={progressValue} size="sm" mt="md" aria-label="Workflow progress" />
        </Card>
    );
};

export default StatBlockStepNavigation;
