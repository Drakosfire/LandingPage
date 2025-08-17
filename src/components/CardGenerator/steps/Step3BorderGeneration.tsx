import React, { useState } from 'react';
import {
    Container,
    Grid,
    Card,
    Text,
    Stack,
    Badge,
    Title,
    Alert,
    List,
    Progress,
    Box,
    Group,
    Button
} from '@mantine/core';
import { IconInfoCircle, IconPalette, IconWand, IconExclamationCircle } from '@tabler/icons-react';
// Template type not needed
import { DUNGEONMIND_API_URL } from '../../../config';
import BorderGallery from '../CardTemplateSection/BorderGallery';
import TemplatePreview from '../CardTemplateSection/TemplatePreview';
import { ClickableImage } from '../shared';
// FunGenerationFeedback not used

import '../../../styles/DesignSystem.css';

// Add keyframe animation for loading spinner
const spinnerStyle = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;

// Inject CSS if not already present
if (!document.querySelector('#spinner-style')) {
    const style = document.createElement('style');
    style.id = 'spinner-style';
    style.textContent = spinnerStyle;
    document.head.appendChild(style);
}

interface Step3BorderGenerationProps {
    selectedBorder: string;
    selectedFinalImage: string; // Add the core image from Step 2
    onBorderSelect: (border: string) => void;
    onGenerateTemplate: (blob: Blob, url: string) => void;
    onFinalImageChange?: (image: string) => void; // Optional callback to change the core image
    sdPrompt?: string; // Stable Diffusion prompt from Step 1 (optional since it can be undefined)
    onSdPromptChange?: (prompt: string) => void; // Callback to update the prompt
    onGeneratedImagesChange?: (images: string[]) => void; // Callback to persist generated images
    persistedGeneratedImages?: string[]; // Previously generated images
    selectedGeneratedImage?: string; // Previously selected generated image
    onSelectedGeneratedImageChange?: (image: string) => void; // Callback to persist selected image
    onGenerationLockChange?: (isLocked: boolean) => void; // Generation lock callback
    onNext?: () => void;
    onPrevious?: () => void;
    canGoNext?: boolean;
    canGoPrevious?: boolean;
    currentStepIndex?: number;
    totalSteps?: number;
}

const Step3BorderGeneration: React.FC<Step3BorderGenerationProps> = ({
    selectedBorder,
    selectedFinalImage,
    onBorderSelect,
    onGenerateTemplate,
    onFinalImageChange,
    sdPrompt = '', // Default to empty string
    onSdPromptChange,
    onGeneratedImagesChange,
    persistedGeneratedImages = [],
    selectedGeneratedImage: initialSelectedGeneratedImage = '',
    onSelectedGeneratedImageChange,
    onGenerationLockChange,
    onNext,
    onPrevious,
    canGoNext = false,
    canGoPrevious = false,
    currentStepIndex = 2,
    totalSteps = 4
}) => {
    const [generatedImages, setGeneratedImages] = useState<string[]>(persistedGeneratedImages);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedGeneratedImage, setSelectedGeneratedImage] = useState<string>(initialSelectedGeneratedImage);
    const [templateBlob, setTemplateBlob] = useState<Blob | null>(null);
    const [templateUrl, setTemplateUrl] = useState<string>('');
    const [localSdPrompt, setLocalSdPrompt] = useState<string>(sdPrompt);
    const [lastPersistedImages, setLastPersistedImages] = useState<string[]>(persistedGeneratedImages); // Track last persisted state


    // Sync local prompt with prop when it changes
    React.useEffect(() => {
        setLocalSdPrompt(sdPrompt || '');
    }, [sdPrompt]);

    // Sync selected image with prop when it changes (for project switching)
    React.useEffect(() => {
        if (initialSelectedGeneratedImage !== selectedGeneratedImage) {
            console.log('🎯 Step3: Syncing selected image:', initialSelectedGeneratedImage);
            setSelectedGeneratedImage(initialSelectedGeneratedImage);
        }
    }, [initialSelectedGeneratedImage]);

    // Sync generated images with persisted images when they change
    React.useEffect(() => {
        // Check if this is a project switch (persisted data changed)
        const isProjectSwitch = JSON.stringify(lastPersistedImages) !== JSON.stringify(persistedGeneratedImages);

        if (isProjectSwitch) {
            console.log('🎯 Step3: Project switch detected - updating images. From:', lastPersistedImages.length, 'to:', persistedGeneratedImages.length);
            setGeneratedImages(persistedGeneratedImages);
            setLastPersistedImages(persistedGeneratedImages);
        } else if (persistedGeneratedImages && persistedGeneratedImages.length > 0 && generatedImages.length === 0) {
            // Initial load case - only restore if local is empty
            console.log('🎯 Step3: Initial load - restoring persisted images:', persistedGeneratedImages.length, 'images');
            setGeneratedImages(persistedGeneratedImages);
            setLastPersistedImages(persistedGeneratedImages);
        } else {
            console.log('🎯 Step3: No change needed. Persisted:', persistedGeneratedImages.length, 'Local:', generatedImages.length);
        }
    }, [persistedGeneratedImages, lastPersistedImages]);

    const isStepValid = () => {
        return selectedBorder !== '';
    };

    const getCompletionPercentage = () => {
        let completed = 0;
        const total = 4; // Border selected, template generated, variations generated, variation selected

        if (selectedBorder !== '') completed++;
        if (templateBlob !== null) completed++;
        if (generatedImages.length > 0) completed++;
        if (selectedGeneratedImage !== '') completed++;

        return Math.round((completed / total) * 100);
    };

    const generateCardImages = async () => {
        if (!templateBlob || !localSdPrompt?.trim()) {
            return;
        }

        setIsGenerating(true);
        onGenerationLockChange?.(true); // 🔒 Lock navigation during generation
        try {
            // Prepare form data using the stored template blob
            const formData = new FormData();
            formData.append('template', templateBlob, 'template.png');
            formData.append('sdPrompt', localSdPrompt);
            formData.append('numImages', '4');

            const response = await fetch('/api/cardgenerator/generate-card-images', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to generate images');
            }

            const result = await response.json();

            // Extract image URLs from the result
            const tempImageUrls = result.images?.map((img: any) => img.url) || [];

            // Upload generated images to Cloudflare for permanent storage
            try {
                const uploadResponse = await fetch(`${DUNGEONMIND_API_URL}/api/cardgenerator/upload-generated-images`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(tempImageUrls),
                    credentials: 'include'
                });

                if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();

                    // Replace temporary URLs with permanent Cloudflare URLs
                    const permanentImageUrls = uploadData.uploaded_images.map((uploaded: any) => uploaded.permanent_url);

                    // ✅ FIXED: Calculate updated images first, then update state and callback
                    const updatedImages = [...permanentImageUrls, ...generatedImages];

                    setGeneratedImages(updatedImages);
                    onGeneratedImagesChange?.(updatedImages);
                } else {
                    // ✅ FIXED: Calculate updated images first, then update state and callback
                    const updatedImages = [...tempImageUrls, ...generatedImages];

                    setGeneratedImages(updatedImages);
                    onGeneratedImagesChange?.(updatedImages);
                }
            } catch (uploadError) {
                // Fallback to temporary URLs if upload fails
                // ✅ FIXED: Calculate updated images first, then update state and callback
                const updatedImages = [...tempImageUrls, ...generatedImages];

                setGeneratedImages(updatedImages);
                onGeneratedImagesChange?.(updatedImages);
            }

        } catch (error) {
            // Error handled by UI state
        } finally {
            setIsGenerating(false);
            onGenerationLockChange?.(false); // 🔓 Unlock navigation when done
        }
    };

    const template = {
        border: selectedBorder,
        itemImage: selectedFinalImage || ''
    };

    return (
        <div
            id="step-panel-border-generation"
            role="tabpanel"
            aria-labelledby="step-tab-border-generation"
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
                                        <Badge color="purple" variant="light" size="sm">2</Badge>
                                        <Text size="sm" fw={500} c="dimmed">Choose Image</Text>
                                    </Group>
                                    <Group gap="xs">
                                        <Badge color="orange" variant="filled" size="sm">3</Badge>
                                        <Text size="sm" fw={500}>Card Style</Text>
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
                                    <Badge color="orange" variant="light">Step 3 of 4</Badge>
                                    <Title order={4}>Style Your Card</Title>
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

                            {/* No Core Image Warning */}
                            {!selectedFinalImage && (
                                <Alert icon={<IconExclamationCircle size={16} />} color="red" variant="light">
                                    <Text size="sm" fw={500}>No Core Image Selected</Text>
                                    <Text size="xs" c="dimmed">Please go back to Step 2 to select or generate a core image before choosing borders.</Text>
                                </Alert>
                            )}

                            {/* Action-Oriented Instructions */}
                            {selectedFinalImage && (
                                <Alert icon={<IconInfoCircle size={16} />} color="orange" variant="light">
                                    <Text size="sm" fw={500}>What to do next:</Text>
                                    <List size="sm" mt="xs">
                                        <List.Item>Select a border style that matches your item</List.Item>
                                        <List.Item>Review and edit the AI prompt if needed</List.Item>
                                        <List.Item>Generate card variations with your chosen style</List.Item>
                                        <List.Item>Pick your favorite design to continue</List.Item>
                                    </List>
                                </Alert>
                            )}

                            {/* Progress Indicator with Navigation */}
                            {selectedFinalImage && (
                                <Box>
                                    <Group justify="space-between" mb="xs">
                                        <Text size="sm" fw={500}>Step Progress</Text>
                                        <Text size="sm" c="dimmed">{getCompletionPercentage()}% complete</Text>
                                    </Group>
                                    <Progress
                                        value={getCompletionPercentage()}
                                        color="orange"
                                        size="lg"
                                    />
                                </Box>
                            )}

                            {/* Main Controls Section */}
                            {selectedFinalImage && (
                                <Grid>
                                    {/* Border Selection */}
                                    <Grid.Col span={{ base: 12, lg: 4 }}>
                                        <Card shadow="xs" padding="md" radius="md" withBorder>
                                            <Stack gap="md">
                                                <Group>
                                                    <IconPalette size={20} />
                                                    <Text size="lg" fw={600}>Border Style</Text>
                                                </Group>

                                                <BorderGallery onSelect={onBorderSelect} />

                                                {selectedBorder && (
                                                    <Alert color="blue" variant="light">
                                                        <Text size="sm" fw={500}>✓ Border Selected</Text>
                                                    </Alert>
                                                )}
                                            </Stack>
                                        </Card>
                                    </Grid.Col>

                                    {/* Prompt Editing */}
                                    <Grid.Col span={{ base: 12, lg: 4 }}>
                                        <Card shadow="xs" padding="md" radius="md" withBorder>
                                            <Stack gap="md">
                                                <Group>
                                                    <IconWand size={20} />
                                                    <Text size="lg" fw={600}>AI Prompt</Text>
                                                </Group>

                                                <textarea
                                                    value={localSdPrompt}
                                                    onChange={(e) => {
                                                        setLocalSdPrompt(e.target.value);
                                                        onSdPromptChange?.(e.target.value);
                                                    }}
                                                    placeholder="Describe your card design..."
                                                    style={{
                                                        width: '100%',
                                                        minHeight: '100px',
                                                        padding: 'var(--mantine-spacing-sm)',
                                                        border: '1px solid var(--mantine-color-gray-4)',
                                                        borderRadius: 'var(--mantine-radius-sm)',
                                                        fontSize: 'var(--mantine-font-size-sm)',
                                                        fontFamily: 'var(--mantine-font-family)',
                                                        resize: 'vertical',
                                                        backgroundColor: 'white'
                                                    }}
                                                />
                                            </Stack>
                                        </Card>
                                    </Grid.Col>

                                    {/* Template Preview */}
                                    <Grid.Col span={{ base: 12, lg: 4 }}>
                                        <Card shadow="xs" padding="md" radius="md" withBorder>
                                            <Stack gap="md">
                                                <Group>
                                                    <Text size="2rem">🏛️</Text>
                                                    <Text size="lg" fw={600}>Template</Text>
                                                </Group>

                                                {isStepValid() ? (
                                                    <Stack gap="md">
                                                        <TemplatePreview
                                                            template={template}
                                                            onGenerate={(blob, url) => {
                                                                setTemplateBlob(blob);
                                                                setTemplateUrl(url);
                                                                onGenerateTemplate(blob, url);
                                                            }}
                                                        />

                                                        <Button
                                                            onClick={generateCardImages}
                                                            disabled={isGenerating || !localSdPrompt || !templateBlob}
                                                            loading={isGenerating}
                                                            color="blue"
                                                            fullWidth
                                                            leftSection={!isGenerating && <IconWand size={16} />}
                                                        >
                                                            {isGenerating ? 'Generating...' : '🎨 Generate Variations'}
                                                        </Button>
                                                    </Stack>
                                                ) : (
                                                    <Stack align="center" gap="sm" py="lg">
                                                        <Text size="2rem">🎨</Text>
                                                        <Text size="sm" c="dimmed" ta="center">Select a border to create template</Text>
                                                    </Stack>
                                                )}
                                            </Stack>
                                        </Card>
                                    </Grid.Col>
                                </Grid>
                            )}

                            {/* Generated Card Variations */}
                            {selectedFinalImage && (
                                <Card shadow="xs" padding="md" radius="md" withBorder>
                                    <Stack gap="md">
                                        <Group>
                                            <Text size="2rem">🎨</Text>
                                            <Text size="lg" fw={600}>Generated Variations</Text>
                                        </Group>

                                        {generatedImages.length > 0 ? (
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                                gap: 'var(--space-4)',
                                                marginTop: 'var(--space-4)',
                                                justifyItems: 'center'
                                            }} className="card-variations-grid">
                                                {generatedImages.map((imageUrl, index) => (
                                                    <div
                                                        key={index}
                                                        style={{
                                                            position: 'relative',
                                                            borderRadius: 'var(--radius-base)',
                                                            overflow: 'hidden',
                                                            border: selectedGeneratedImage === imageUrl ?
                                                                '3px solid var(--primary-blue)' :
                                                                '2px solid var(--border-light)',
                                                            transition: 'all 0.2s ease',
                                                            boxShadow: selectedGeneratedImage === imageUrl ?
                                                                '0 4px 12px rgba(74, 144, 226, 0.3)' :
                                                                '0 2px 8px rgba(0, 0, 0, 0.1)',
                                                            width: 'fit-content',
                                                            maxWidth: '100%'
                                                        }}
                                                    >
                                                        <ClickableImage
                                                            src={imageUrl}
                                                            alt={`Generated card ${index + 1}`}
                                                            title={`Generated Card Variation #${index + 1}`}
                                                            description="AI-generated card variation with your selected border and image"
                                                            style={{
                                                                width: '100%',
                                                                maxWidth: 'min(160px, 20vw)',
                                                                minWidth: '120px',
                                                                height: 'auto',
                                                                aspectRatio: '3/4',
                                                                objectFit: 'contain',
                                                                display: 'block',
                                                                backgroundColor: '#f8f9fa',
                                                                borderRadius: '4px'
                                                            }}
                                                            onClick={() => {
                                                                setSelectedGeneratedImage(imageUrl);
                                                                onSelectedGeneratedImageChange?.(imageUrl);
                                                            }}
                                                            showExpandButton={true}
                                                            expandButtonPosition="bottom-right"
                                                            downloadFilename={`card-variation-${index + 1}.png`}
                                                        />
                                                        {selectedGeneratedImage === imageUrl && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '8px',
                                                                right: '8px',
                                                                background: 'var(--success-green)',
                                                                color: 'white',
                                                                borderRadius: '50%',
                                                                width: '24px',
                                                                height: '24px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '12px',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                ✓
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                try {
                                                                    const response = await fetch(`/api/cardgenerator/delete-image?image_url=${encodeURIComponent(imageUrl)}`, {
                                                                        method: 'DELETE',
                                                                        credentials: 'include'
                                                                    });
                                                                    // Image deletion handled silently
                                                                } catch (error) {
                                                                    // Error handled silently
                                                                }
                                                                const updatedImages = generatedImages.filter(img => img !== imageUrl);
                                                                setGeneratedImages(updatedImages);
                                                                onGeneratedImagesChange?.(updatedImages);
                                                                if (selectedGeneratedImage === imageUrl) {
                                                                    setSelectedGeneratedImage('');
                                                                    onSelectedGeneratedImageChange?.('');
                                                                }
                                                            }}
                                                            style={{
                                                                position: 'absolute',
                                                                top: '8px',
                                                                left: '8px',
                                                                background: 'rgba(255, 0, 0, 0.8)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '50%',
                                                                width: '24px',
                                                                height: '24px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '12px',
                                                                fontWeight: 'bold',
                                                                cursor: 'pointer',
                                                                opacity: 0.8,
                                                                transition: 'opacity 0.2s ease',
                                                                zIndex: 50
                                                            }}
                                                            onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                                                            onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
                                                        >
                                                            ×
                                                        </button>
                                                        <div style={{
                                                            position: 'absolute',
                                                            bottom: '8px',
                                                            left: '8px',
                                                            background: 'rgba(0, 0, 0, 0.7)',
                                                            color: 'white',
                                                            padding: '4px 8px',
                                                            borderRadius: 'var(--radius-sm)',
                                                            fontSize: 'var(--text-sm)',
                                                            fontWeight: 'var(--font-medium)'
                                                        }}>
                                                            Option {index + 1}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                                                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>🎨</div>
                                                <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)' }}>
                                                    No Variations Generated Yet
                                                </h4>
                                                <p style={{ fontSize: 'var(--text-sm)' }}>
                                                    Select a border and generate variations to see them here
                                                </p>
                                            </div>
                                        )}


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

export default Step3BorderGeneration; 