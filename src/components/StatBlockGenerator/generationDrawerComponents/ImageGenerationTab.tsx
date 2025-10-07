// ImageGenerationTab.tsx - Image Generation for Drawer
// Adapted from CardGenerator/CoreImageGallery.tsx for creature images

import React, { useState, useCallback } from 'react';
import { DUNGEONMIND_API_URL } from '../../../config';
import { Stack, Textarea, Button, Tabs, Loader, Image, Text, SimpleGrid, Card } from '@mantine/core';
import { IconPhoto, IconSparkles } from '@tabler/icons-react';
import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';

interface ImageGenerationTabProps {
    onGenerationStart?: () => void;
    onGenerationComplete?: () => void;
}

interface GeneratedImage {
    url: string;
    id: string;
    prompt: string;
}

const ImageGenerationTab: React.FC<ImageGenerationTabProps> = ({
    onGenerationStart,
    onGenerationComplete
}) => {
    const {
        creatureDetails,
        selectedAssets,
        setSelectedCreatureImage,
        setIsGenerating
    } = useStatBlockGenerator();

    const [imagePrompt, setImagePrompt] = useState('');
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [activeTab, setActiveTab] = useState<'generate' | 'gallery'>('generate');
    const [isLocalGenerating, setIsLocalGenerating] = useState(false);

    // Auto-generate prompt from creature details
    const handleAutoFillPrompt = useCallback(() => {
        const parts = [];
        if (creatureDetails.name) parts.push(creatureDetails.name);
        if (creatureDetails.type) parts.push(creatureDetails.type);
        if (creatureDetails.size) parts.push(creatureDetails.size);

        // Use description if available
        if (creatureDetails.description) {
            parts.push(creatureDetails.description);
        }

        const prompt = parts.join(', ') + ', fantasy art, detailed portrait, dramatic lighting, high quality';
        setImagePrompt(prompt);
    }, [creatureDetails]);

    const handleGenerateImage = useCallback(async () => {
        if (!imagePrompt.trim()) return;

        try {
            setIsGenerating(true);
            setIsLocalGenerating(true);
            onGenerationStart?.();

            const response = await fetch(
                `${DUNGEONMIND_API_URL}/api/statblockgenerator/generate-image`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        sd_prompt: imagePrompt,
                        num_images: 4
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`Image generation failed: ${response.statusText}`);
            }

            const payload = await response.json();

            // Extract images from response (backend returns data.images array)
            const newImages: GeneratedImage[] = (payload.data?.images || []).map((img: any, index: number) => ({
                url: img.url,
                id: img.id || `generated-${Date.now()}-${index}`,
                prompt: imagePrompt
            }));

            setGeneratedImages(prev => [...newImages, ...prev]);
            setActiveTab('gallery');
            onGenerationComplete?.();
        } catch (error) {
            console.error('Image generation failed:', error);
        } finally {
            setIsGenerating(false);
            setIsLocalGenerating(false);
        }
    }, [imagePrompt, setIsGenerating, onGenerationStart, onGenerationComplete]);

    const handleSelectImage = useCallback((imageUrl: string, index: number) => {
        setSelectedCreatureImage(imageUrl, index);
    }, [setSelectedCreatureImage]);

    return (
        <Tabs value={activeTab} onChange={(val) => setActiveTab(val as any)}>
            <Tabs.List>
                <Tabs.Tab value="generate" leftSection={<IconSparkles size={16} />}>
                    Generate
                </Tabs.Tab>
                <Tabs.Tab value="gallery" leftSection={<IconPhoto size={16} />}>
                    Gallery ({generatedImages.length})
                </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="generate" pt="md">
                <Stack gap="md">
                    <Button
                        variant="light"
                        size="sm"
                        onClick={handleAutoFillPrompt}
                        disabled={isLocalGenerating || !creatureDetails.name}
                    >
                        Auto-fill from creature
                    </Button>

                    <Textarea
                        label="Image Prompt"
                        placeholder="Describe the creature image you want to generate..."
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        minRows={3}
                        maxRows={6}
                        disabled={isLocalGenerating}
                    />

                    <Button
                        leftSection={isLocalGenerating ? <Loader size="sm" /> : <IconSparkles size={16} />}
                        onClick={handleGenerateImage}
                        disabled={!imagePrompt.trim() || isLocalGenerating}
                        loading={isLocalGenerating}
                        fullWidth
                    >
                        {isLocalGenerating ? 'Generating Images...' : 'Generate Images'}
                    </Button>
                </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="gallery" pt="md">
                {generatedImages.length === 0 ? (
                    <Text c="dimmed" size="sm" ta="center" py="xl">
                        No images generated yet. Switch to the Generate tab to create one.
                    </Text>
                ) : (
                    <SimpleGrid cols={2} spacing="sm">
                        {generatedImages.map((img, index) => (
                            <Card
                                key={img.id}
                                padding="xs"
                                withBorder
                                style={{
                                    cursor: 'pointer',
                                    border: selectedAssets.creatureImage === img.url
                                        ? '2px solid var(--mantine-color-blue-5)'
                                        : undefined
                                }}
                                onClick={() => handleSelectImage(img.url, index)}
                            >
                                <Image
                                    src={img.url}
                                    alt={`Generated ${index + 1}`}
                                    height={120}
                                    fit="cover"
                                />
                            </Card>
                        ))}
                    </SimpleGrid>
                )}
            </Tabs.Panel>
        </Tabs>
    );
};

export default ImageGenerationTab;

