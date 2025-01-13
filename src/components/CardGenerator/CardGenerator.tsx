import React, { useState } from 'react';
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { Container, Grid, Stack } from '@mantine/core';

import { ItemDetails, GeneratedImage, createTemplate } from '../../types/card.types';

import ItemForm from './TextGenerationSection/ItemForm';
import BorderGallery from './CardTemplateSection/BorderGallery';
import SeedImageGallery from './CardTemplateSection/SeedImageGallery';
import ImageGallery from './ImageGenerationSection/ImageGallery';
import TemplatePreview from './CardTemplateSection/TemplatePreview';
import CardPreview from './CardWithText/CardWithTextGallery';
import CardWithTextGallery from './CardWithText/CardWithTextGallery';




export default function CardGenerator() {
    const [selectedBorder, setSelectedBorder] = useState<string>('');
    const [selectedSeedImage, setSelectedSeedImage] = useState<string>('');
    const [itemDetails, setItemDetails] = useState<ItemDetails>({
        name: '',
        type: '',
        rarity: '',
        value: '',
        properties: [],
        damageFormula: '',
        damageType: '',
        weight: '',
        description: '',
        quote: '',
        sdPrompt: ''
    });
    const handleItemDetailsChange = (data: any) => {
        setItemDetails(prev => ({ ...prev, ...data }));
    };
    const [selectedFinalImage, setSelectedFinalImage] = useState<string>('');
    const [templateBlob, setTemplateBlob] = useState<Blob | null>(null);
    const handleBorderSelect = (border: string) => setSelectedBorder(border);
    const handleSeedImageSelect = (image: string) => setSelectedSeedImage(image);
    const handleGenerateTemplate = (blob: Blob, url: string) => setTemplateBlob(blob);
    const handleImageSelect = (imageUrl: string) => setSelectedFinalImage(imageUrl);

    const handleSdPromptChange = (newPrompt: string) => {
        setItemDetails(prev => ({ ...prev, sdPrompt: newPrompt }));
    };

    const template = createTemplate(selectedBorder, selectedSeedImage);

    return (
        <MantineProvider>
            <Container className="card-generator-container" size="100%" px="xs">
                <Grid grow gutter="sm">
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 9 }}>
                            <Stack>
                                <BorderGallery onSelect={handleBorderSelect} />
                                <SeedImageGallery onSelect={handleSeedImageSelect} />
                            </Stack>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 3 }}>
                            <div className="template-preview-wrapper">
                                <TemplatePreview
                                    template={template}
                                    onGenerate={handleGenerateTemplate}
                                />
                            </div>
                        </Grid.Col>
                    </Grid>

                    <Grid.Col span={{ base: 12, sm: 2 }}>
                        <ItemForm
                            onGenerate={handleItemDetailsChange}
                            initialData={itemDetails}
                        />
                    </Grid.Col>

                    <ImageGallery
                        template={templateBlob}
                        sdPrompt={itemDetails.sdPrompt}
                        onSdPromptChange={handleSdPromptChange}
                        onSelect={handleImageSelect}
                    />

                    {/* Card Preview - full width on mobile */}
                    <Grid.Col span={{ base: 12, sm: 2 }} className="card-generator-section">
                        {selectedFinalImage && (
                            <CardWithTextGallery
                                image={selectedFinalImage}
                                details={itemDetails}
                            />
                        )}
                    </Grid.Col>
                </Grid>
            </Container>
        </MantineProvider>
    );
}

