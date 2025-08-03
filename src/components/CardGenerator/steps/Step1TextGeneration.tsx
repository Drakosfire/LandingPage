import React from 'react';
import { Container, Grid, Card, Text, Stack, Badge } from '@mantine/core';
import { ItemDetails } from '../../../types/card.types';
import ItemForm from '../TextGenerationSection/ItemForm';
import '../../../styles/DesignSystem.css';

interface Step1TextGenerationProps {
    itemDetails: ItemDetails;
    onItemDetailsChange: (data: Partial<ItemDetails>) => void;
    onGenerationLockChange?: (isLocked: boolean) => void; // Generation lock callback
}

const Step1TextGeneration: React.FC<Step1TextGenerationProps> = ({
    itemDetails,
    onItemDetailsChange,
    onGenerationLockChange
}) => {
    const isStepValid = () => {
        return itemDetails.name?.trim() !== '' &&
            itemDetails.type?.trim() !== '' &&
            itemDetails.description?.trim() !== '';
    };

    return (
        <div
            id="step-panel-text-generation"
            role="tabpanel"
            aria-labelledby="step-tab-text-generation"
            className="step-panel"
        >
            <Container size="lg" style={{ maxWidth: '1280px' }}>
                <Grid gutter="md">
                    {/* Form Section - Standard responsive layout */}
                    <Grid.Col
                        span={{ base: 12, md: 8, lg: 8 }}
                    >
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Stack gap="lg">
                                <div>

                                    <Text size="md" c="dimmed">
                                        Start by describing your magical item. Provide basic details like name, type, and a rich description.
                                        The AI will use this information to generate images and enhance your card.
                                    </Text>
                                </div>

                                <ItemForm
                                    onGenerate={onItemDetailsChange}
                                    initialData={itemDetails}
                                    onGenerationLockChange={onGenerationLockChange}
                                />

                                <div style={{ textAlign: 'center' }}>
                                    {isStepValid() ? (
                                        <Text size="sm" c="green.4">
                                            ✓ Ready to proceed to next step
                                        </Text>
                                    ) : (
                                        <Text size="sm" c="dimmed">
                                            Please fill in name, type, and description to continue
                                        </Text>
                                    )}
                                </div>
                            </Stack>
                        </Card>
                    </Grid.Col>


                </Grid>
            </Container>
        </div>
    );
};

export default Step1TextGeneration; 