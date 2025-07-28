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
                                    <Text size="xl" fw={700} c="blue.4" mb="sm">
                                        Describe Your Item
                                    </Text>
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

                    {/* Preview Section - Standard responsive layout */}
                    <Grid.Col
                        span={{ base: 12, md: 4, lg: 4 }}
                    >
                        <Card shadow="md" padding="md" radius="md" withBorder style={{
                            position: 'sticky',
                            top: '1rem',
                            backgroundColor: 'var(--mantine-color-white)'
                        }}>
                            <Stack gap="md">
                                <Text size="lg" fw={600} c="blue.4">
                                    Item Preview
                                </Text>

                                {itemDetails.name && (
                                    <div>
                                        <Text size="xs" fw={500} c="dimmed" mb={2}>Name</Text>
                                        <Text size="sm" fw={500} c="dark">
                                            {itemDetails.name}
                                        </Text>
                                    </div>
                                )}

                                {itemDetails.type && (
                                    <div>
                                        <Text size="xs" fw={500} c="dimmed" mb={2}>Type</Text>
                                        <Text size="sm" c="gray.7">
                                            {itemDetails.type}
                                        </Text>
                                    </div>
                                )}

                                {itemDetails.rarity && (
                                    <div>
                                        <Text size="xs" fw={500} c="dimmed" mb={2}>Rarity</Text>
                                        <Badge
                                            color={
                                                itemDetails.rarity === 'Common' ? 'rarity-common' :
                                                    itemDetails.rarity === 'Uncommon' ? 'rarity-uncommon' :
                                                        itemDetails.rarity === 'Rare' ? 'rarity-rare' :
                                                            itemDetails.rarity === 'Epic' ? 'rarity-epic' :
                                                                itemDetails.rarity === 'Legendary' ? 'rarity-legendary' :
                                                                    'gray'
                                            }
                                            variant="light"
                                        >
                                            {itemDetails.rarity}
                                        </Badge>
                                    </div>
                                )}

                                {itemDetails.description && (
                                    <div>
                                        <Text size="xs" fw={500} c="dimmed" mb={2}>Description</Text>
                                        <Text size="sm" c="gray.7" lh="md">
                                            {itemDetails.description.length > 100
                                                ? `${itemDetails.description.substring(0, 100)}...`
                                                : itemDetails.description
                                            }
                                        </Text>
                                    </div>
                                )}

                                {itemDetails.sdPrompt && (
                                    <div>
                                        <Text size="xs" fw={500} c="dimmed" mb={2}>AI Image Prompt</Text>
                                        <Text size="xs" c="dimmed" fs="italic" lh="sm">
                                            {itemDetails.sdPrompt.length > 80
                                                ? `${itemDetails.sdPrompt.substring(0, 80)}...`
                                                : itemDetails.sdPrompt
                                            }
                                        </Text>
                                    </div>
                                )}

                                {!itemDetails.name && !itemDetails.type && !itemDetails.description && (
                                    <Stack align="center" gap="sm" py="xl">
                                        <Text size="2rem">📝</Text>
                                        <Text size="sm" c="dimmed" ta="center">
                                            Your item details will appear here as you fill out the form.
                                        </Text>
                                    </Stack>
                                )}
                            </Stack>
                        </Card>
                    </Grid.Col>
                </Grid>
            </Container>
        </div>
    );
};

export default Step1TextGeneration; 