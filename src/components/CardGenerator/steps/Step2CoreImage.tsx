import React, { useState } from 'react';
import {
    Container,
    Grid,
    Card,
    Text,
    Stack,
    FileInput,
    Button,
    Group,
    Badge,
    Title,
    Alert,
    List,
    Progress,
    Box
} from '@mantine/core';
import { IconInfoCircle, IconCheck, IconPhoto } from '@tabler/icons-react';
import { ItemDetails, GeneratedImage } from '../../../types/card.types';
import CoreImageGallery from '../ImageGenerationSection/CoreImageGallery';
import { ClickableImage } from '../shared';
import '../../../styles/DesignSystem.css';

interface Step2CoreImageProps {
    itemDetails: ItemDetails;
    selectedFinalImage: string;
    onImageSelect: (imageUrl: string) => void;
    onSdPromptChange: (prompt: string) => void;
    onImagesGenerated: (images: GeneratedImage[]) => void;
    persistedImages?: GeneratedImage[]; // Add persisted images prop
    onGenerationLockChange?: (isLocked: boolean) => void; // Generation lock callback
    onNext?: () => void;
    onPrevious?: () => void;
    canGoNext?: boolean;
    canGoPrevious?: boolean;
    currentStepIndex?: number;
    totalSteps?: number;
}

const Step2CoreImage: React.FC<Step2CoreImageProps> = ({
    itemDetails,
    selectedFinalImage,
    onImageSelect,
    onSdPromptChange,
    onImagesGenerated,
    persistedImages = [], // Default to empty array
    onGenerationLockChange,
    onNext,
    onPrevious,
    canGoNext = false,
    canGoPrevious = false,
    currentStepIndex = 1,
    totalSteps = 4
}) => {
    const [uploadedImage, setUploadedImage] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);

    // Debug persistedImages changes
    React.useEffect(() => {
        // Removed verbose debug logging for persisted images
    }, [persistedImages]);

    const isStepValid = () => {
        return selectedFinalImage !== '' || uploadedImage !== '';
    };

    const getCompletionPercentage = () => {
        let completed = 0;
        const total = 2; // Either upload OR AI generate

        if (uploadedImage !== '' || persistedImages.length > 0) completed++;
        if (selectedFinalImage !== '') completed++;

        return Math.round((completed / total) * 100);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                setUploadedImage(imageUrl);
                onImageSelect(imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                setUploadedImage(imageUrl);
                onImageSelect(imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    return (
        <div
            id="step-panel-core-image"
            role="tabpanel"
            aria-labelledby="step-tab-core-image"
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
                                        <Badge color="blue" variant="light" size="sm">1</Badge>
                                        <Text size="sm" fw={500} c="dimmed">Describe Item</Text>
                                    </Group>
                                    <Group gap="xs">
                                        <Badge color="purple" variant="filled" size="sm">2</Badge>
                                        <Text size="sm" fw={500}>Choose Image</Text>
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
                                    <Badge color="purple" variant="light">Step 2 of 4</Badge>
                                    <Title order={4}>Choose Your Image</Title>
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
                            <Alert icon={<IconInfoCircle size={16} />} color="purple" variant="light">
                                <Text size="sm" fw={500}>What to do next:</Text>
                                <List size="sm" mt="xs">
                                    <List.Item>Upload your own artwork OR use AI generation</List.Item>
                                    <List.Item>For AI: Review and edit the generated prompt if needed</List.Item>
                                    <List.Item>Click "Generate Images" to create AI variations</List.Item>
                                    <List.Item>Select your favorite image to continue</List.Item>
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
                                    color="purple"
                                    size="lg"
                                />
                            </Box>

                            {/* Upload and AI Generation Options */}
                            <Grid>
                                {/* Upload Section */}
                                <Grid.Col span={{ base: 12, lg: 6 }}>
                                    <Card shadow="xs" padding="md" radius="md" withBorder>
                                        <Stack gap="md">
                                            <Group>
                                                <IconPhoto size={20} />
                                                <Text size="lg" fw={600}>Upload Your Image</Text>
                                            </Group>
                                            <Text size="sm" c="dimmed">
                                                Have your own artwork? Upload it here to use with your card.
                                            </Text>

                                            <div
                                                className={`upload-zone ${isDragging ? 'dragover' : ''}`}
                                                onDrop={handleDrop}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onClick={() => document.getElementById('file-input')?.click()}
                                            >
                                                <div className="upload-zone-icon">
                                                    📁
                                                </div>
                                                <div className="upload-zone-text">
                                                    Drop your image here or click to browse
                                                </div>
                                                <div className="upload-zone-subtext">
                                                    Supports JPG, PNG, WebP up to 10MB
                                                </div>

                                                <input
                                                    id="file-input"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                    style={{ display: 'none' }}
                                                />
                                            </div>

                                            {uploadedImage && (
                                                <div style={{ marginTop: 'var(--space-4)' }}>
                                                    <ClickableImage
                                                        src={uploadedImage}
                                                        alt="Uploaded item"
                                                        title="Uploaded Image"
                                                        description="Your uploaded image for the item"
                                                        style={{
                                                            width: '100%',
                                                            height: 'auto',
                                                            aspectRatio: '3/4',
                                                            objectFit: 'contain',
                                                            borderRadius: 'var(--radius-base)',
                                                            border: '2px solid var(--border-light)',
                                                            backgroundColor: '#f8f9fa'
                                                        }}
                                                        showExpandButton={true}
                                                        expandButtonPosition="top-right"
                                                        downloadFilename="uploaded-item-image.png"
                                                    />
                                                    <Button
                                                        variant="subtle"
                                                        color="red"
                                                        size="sm"
                                                        onClick={() => {
                                                            setUploadedImage('');
                                                            onImageSelect('');
                                                        }}
                                                        fullWidth
                                                        mt="sm"
                                                    >
                                                        Remove Image
                                                    </Button>
                                                </div>
                                            )}
                                        </Stack>
                                    </Card>
                                </Grid.Col>

                                {/* AI Generation Section */}
                                <Grid.Col span={{ base: 12, lg: 6 }}>
                                    <Card shadow="xs" padding="md" radius="md" withBorder>
                                        <Stack gap="md">
                                            <Group>
                                                <Text size="2rem">🎨</Text>
                                                <Text size="lg" fw={600}>AI Generated Options</Text>
                                            </Group>
                                            <Text size="sm" c="dimmed">
                                                Let AI create the perfect image based on your item description.
                                            </Text>

                                            <CoreImageGallery
                                                sdPrompt={itemDetails.sdPrompt}
                                                onSdPromptChange={onSdPromptChange}
                                                onSelect={onImageSelect}
                                                selectedImage={selectedFinalImage}
                                                onImagesGenerated={onImagesGenerated}
                                                persistedImages={persistedImages}
                                                onGenerationLockChange={onGenerationLockChange}
                                            />
                                        </Stack>
                                    </Card>
                                </Grid.Col>
                            </Grid>

                            {/* Selected Image Preview */}
                            {(selectedFinalImage || uploadedImage) && (
                                <Card shadow="xs" padding="md" radius="md" withBorder>
                                    <Stack gap="md">
                                        <Group>
                                            <IconCheck size={20} />
                                            <Text size="lg" fw={600} c="green">Selected Image</Text>
                                        </Group>

                                        <div style={{ textAlign: 'center' }}>
                                            <ClickableImage
                                                src={selectedFinalImage || uploadedImage}
                                                alt="Selected item image"
                                                title="Selected Item Image"
                                                description="The image chosen for your item card"
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '200px',
                                                    height: 'auto',
                                                    aspectRatio: '3/4',
                                                    objectFit: 'contain',
                                                    borderRadius: 'var(--mantine-radius-md)',
                                                    border: '2px solid var(--mantine-color-green-4)',
                                                    backgroundColor: '#f8f9fa'
                                                }}
                                                showExpandButton={true}
                                                expandButtonPosition="top-right"
                                                downloadFilename="selected-item-image.png"
                                            />
                                        </div>

                                        <Text size="sm" c="green" fw={500} ta="center">
                                            ✓ Image selected - ready for Step 3
                                        </Text>
                                    </Stack>
                                </Card>
                            )}


                        </Stack>
                    </Card>
                </Stack>
            </Container>
        </div>
    );
};

export default Step2CoreImage; 