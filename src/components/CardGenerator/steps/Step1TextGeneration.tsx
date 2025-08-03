import React from 'react';
import {
    Container,
    Grid,
    Card,
    Text,
    Stack,
    Badge,
    Group,
    Title,
    Alert,
    List,
    Progress,
    Box,
    Button
} from '@mantine/core';
import { IconInfoCircle, IconCheck, IconEdit } from '@tabler/icons-react';
import { ItemDetails } from '../../../types/card.types';
import ItemForm from '../TextGenerationSection/ItemForm';
import '../../../styles/DesignSystem.css';

interface Step1TextGenerationProps {
    itemDetails: ItemDetails;
    onItemDetailsChange: (data: Partial<ItemDetails>) => void;
    onGenerationLockChange?: (isLocked: boolean) => void; // Generation lock callback
    onNext?: () => void;
    onPrevious?: () => void;
    canGoNext?: boolean;
    canGoPrevious?: boolean;
    currentStepIndex?: number;
    totalSteps?: number;
}

const Step1TextGeneration: React.FC<Step1TextGenerationProps> = ({
    itemDetails,
    onItemDetailsChange,
    onGenerationLockChange,
    onNext,
    onPrevious,
    canGoNext = false,
    canGoPrevious = false,
    currentStepIndex = 0,
    totalSteps = 4
}) => {
    const isStepValid = () => {
        return itemDetails.name?.trim() !== '' &&
            itemDetails.type?.trim() !== '' &&
            itemDetails.description?.trim() !== '';
    };

    const getCompletionPercentage = () => {
        let completed = 0;
        if (itemDetails.name?.trim()) completed++;
        if (itemDetails.type?.trim()) completed++;
        if (itemDetails.description?.trim()) completed++;
        return Math.round((completed / 3) * 100);
    };

    return (
        <div
            id="step-panel-text-generation"
            role="tabpanel"
            aria-labelledby="step-tab-text-generation"
            className="step-panel"
        >
            <Container size="lg" style={{ maxWidth: '1280px' }}>
                <Stack gap="lg">
                    {/* Card Creation Journey at Top */}
                    <Card shadow="sm" padding="md" radius="md" withBorder>
                        <Stack gap="md">
                            <Title order={5}>Your Card Creation Journey</Title>
                            <Group justify="space-between" wrap="wrap">
                                <Group gap="lg">
                                    <Group gap="xs">
                                        <Badge color="blue" variant="filled" size="sm">1</Badge>
                                        <Text size="sm" fw={500}>Describe Item</Text>
                                    </Group>
                                    <Group gap="xs">
                                        <Badge color="gray" variant="light" size="sm">2</Badge>
                                        <Text size="sm" fw={500} c="dimmed">Choose Image</Text>
                                    </Group>
                                    <Group gap="xs">
                                        <Badge color="gray" variant="light" size="sm">3</Badge>
                                        <Text size="sm" fw={500} c="dimmed">Card Style</Text>
                                    </Group>
                                    <Group gap="xs">
                                        <Badge color="gray" variant="light" size="sm">4</Badge>
                                        <Text size="sm" fw={500} c="dimmed">Assemble Card</Text>
                                    </Group>
                                </Group>
                            </Group>
                        </Stack>
                    </Card>

                    {/* Main Step Content */}
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Stack gap="lg">
                            {/* Step Header with Navigation */}
                            <Group justify="space-between">
                                <Group>
                                    <Badge color="blue" variant="light">Step 1 of 4</Badge>
                                    <Title order={4}>Describe Your Item</Title>
                                </Group>
                                <Group gap="xs">
                                    {canGoPrevious && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={onPrevious}
                                            leftSection={<Text>←</Text>}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {canGoNext && (
                                        <Button
                                            size="sm"
                                            onClick={onNext}
                                            rightSection={<Text>→</Text>}
                                        >
                                            Next
                                        </Button>
                                    )}
                                </Group>
                            </Group>

                            {/* Action-Oriented Instructions */}
                            <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                                <Text size="sm" fw={500}>What to do next:</Text>
                                <List size="sm" mt="xs">
                                    <List.Item>Enter your item's name (e.g., "Flaming Sword")</List.Item>
                                    <List.Item>Choose the item type from the dropdown</List.Item>
                                    <List.Item>Write a detailed description of your item</List.Item>
                                    <List.Item>Click "Generate Description" to enhance with AI</List.Item>
                                </List>
                            </Alert>

                            {/* Progress Indicator with Navigation */}
                            <Box>
                                <Group justify="space-between" mb="xs">
                                    <Text size="sm" fw={500}>Step Progress</Text>
                                    <Text size="sm" c="dimmed">{getCompletionPercentage()}% complete</Text>
                                </Group>
                                <Progress
                                    value={getCompletionPercentage()}
                                    color="blue"
                                    size="lg"
                                />
                            </Box>

                            {/* Item Form */}
                            <ItemForm
                                onGenerate={onItemDetailsChange}
                                initialData={itemDetails}
                                onGenerationLockChange={onGenerationLockChange}
                            />


                        </Stack>
                    </Card>
                </Stack>
            </Container>
        </div>
    );
};

export default Step1TextGeneration; 