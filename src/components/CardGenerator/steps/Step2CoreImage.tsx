import React, { useState } from 'react';
import { Container, Grid, Card, Text, Stack, FileInput, Button, Group } from '@mantine/core';
import { ItemDetails, GeneratedImage } from '../../../types/card.types';
import CoreImageGallery from '../ImageGenerationSection/CoreImageGallery';
import '../../../styles/DesignSystem.css';

interface Step2CoreImageProps {
    itemDetails: ItemDetails;
    selectedFinalImage: string;
    onImageSelect: (imageUrl: string) => void;
    onSdPromptChange: (prompt: string) => void;
    onImagesGenerated: (images: GeneratedImage[]) => void;
    persistedImages?: GeneratedImage[]; // Add persisted images prop
    onGenerationLockChange?: (isLocked: boolean) => void; // Generation lock callback
}

const Step2CoreImage: React.FC<Step2CoreImageProps> = ({
    itemDetails,
    selectedFinalImage,
    onImageSelect,
    onSdPromptChange,
    onImagesGenerated,
    persistedImages = [], // Default to empty array
    onGenerationLockChange
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
                <Grid gutter="md">
                    {/* Upload & Preview Section - Combined */}
                    <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                        <Stack gap="md">
                            {/* Upload Section */}
                            <Card shadow="sm" padding="lg" radius="md" withBorder>
                                <Stack gap="lg">
                                    <div>
                                        <Text size="xl" fw={700} c="blue.4" mb="sm">
                                            Upload Your Image
                                        </Text>
                                        <Text size="md" c="dimmed">
                                            Have your own artwork? Upload it here, or let AI generate something perfect for your item.
                                        </Text>
                                    </div>

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
                                            <img
                                                src={uploadedImage}
                                                alt="Uploaded item"
                                                style={{
                                                    width: '100%',
                                                    height: 'auto',
                                                    aspectRatio: '3/4',
                                                    objectFit: 'contain',
                                                    borderRadius: 'var(--radius-base)',
                                                    border: '2px solid var(--border-light)',
                                                    backgroundColor: '#f8f9fa'
                                                }}
                                            />
                                            <button
                                                onClick={() => {
                                                    setUploadedImage('');
                                                    onImageSelect('');
                                                }}
                                                className="btn btn-secondary"
                                                style={{
                                                    marginTop: 'var(--space-2)',
                                                    width: '100%',
                                                    fontSize: 'var(--text-sm)'
                                                }}
                                            >
                                                Remove Image
                                            </button>
                                        </div>
                                    )}
                                </Stack>
                            </Card>

                            {/* Selected Image Preview - Same Column */}
                            <Card shadow="md" padding="md" radius="md" withBorder>
                                <Stack gap="md">
                                    <Text size="lg" fw={600} c="blue.4">
                                        Selected Image
                                    </Text>

                                    {(selectedFinalImage || uploadedImage) ? (
                                        <Stack gap="md" align="center">
                                            <img
                                                src={selectedFinalImage || uploadedImage}
                                                alt="Selected item image"
                                                style={{
                                                    width: '100%',
                                                    height: 'auto',
                                                    aspectRatio: '3/4',
                                                    objectFit: 'contain',
                                                    borderRadius: 'var(--mantine-radius-md)',
                                                    border: '2px solid var(--mantine-color-blue-4)',
                                                    backgroundColor: '#f8f9fa'
                                                }}
                                            />
                                            <Text size="sm" c="green.4" fw={500}>
                                                ✓ Image selected
                                            </Text>
                                        </Stack>
                                    ) : (
                                        <Stack align="center" gap="sm" py="lg">
                                            <Text size="2rem">🖼️</Text>
                                            <Text size="sm" c="dimmed" ta="center">
                                                Upload an image or generate one with AI to continue.
                                            </Text>
                                        </Stack>
                                    )}
                                </Stack>
                            </Card>
                        </Stack>
                    </Grid.Col>

                    {/* AI Generation Section - Expanded */}
                    <Grid.Col span={{ base: 12, md: 6, lg: 8 }}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Stack gap="lg">
                                <div>
                                    <Text size="xl" fw={700} c="blue.4" mb="sm">
                                        AI Generated Options
                                    </Text>
                                    <Text size="md" c="dimmed">
                                        Let AI create the perfect image based on your item description.
                                    </Text>
                                </div>

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

                {/* Step Status */}
                <div style={{
                    textAlign: 'center',
                    marginTop: 'var(--mantine-spacing-xl)',
                    paddingTop: 'var(--mantine-spacing-md)',
                    borderTop: '1px solid var(--mantine-color-gray-3)'
                }}>
                    {isStepValid() ? (
                        <Text size="sm" c="green.4">
                            ✓ Image selected - ready to proceed to next step
                        </Text>
                    ) : (
                        <Text size="sm" c="dimmed">
                            Please select or upload an image to continue
                        </Text>
                    )}
                </div>
            </Container>
        </div>
    );
};

export default Step2CoreImage; 