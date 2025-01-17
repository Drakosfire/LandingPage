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
    const handleImageSelect = (imageUrl: string) => {
        console.log('Setting selected final image:', imageUrl);
        setSelectedFinalImage(imageUrl);
    };

    const handleSdPromptChange = (newPrompt: string) => {
        setItemDetails(prev => ({ ...prev, sdPrompt: newPrompt }));
    };

    const template = createTemplate(selectedBorder, selectedSeedImage);

    return (
        <MantineProvider>
            <Container className="card-generator-container" size="100%" px="xs">
                <Grid>

                    <Grid
                        gutter="sm"
                        style={{
                            border: '2px solid var(--primary-color)',
                            backgroundColor: 'var(--background-color)',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            padding: '1rem',
                            width: '100%'
                        }}>
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




                    <Grid

                        gutter="sm"
                        style={{
                            border: '2px solid var(--primary-color)',
                            backgroundColor: 'var(--background-color)',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            padding: '1rem',
                            marginBottom: '1rem',
                            width: '100%'
                        }}>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <ItemForm
                                onGenerate={handleItemDetailsChange}
                                initialData={itemDetails}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 3 }} className="card-generator-section">
                            <ImageGallery
                                template={templateBlob}
                                sdPrompt={itemDetails.sdPrompt}
                                onSdPromptChange={handleSdPromptChange}
                                onSelect={handleImageSelect}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 4 }}
                            className="card-generator-section"
                            style={{ width: '100%' }}>
                            {selectedFinalImage && (
                                <CardWithTextGallery
                                    image={selectedFinalImage}
                                    details={itemDetails}
                                />
                            )}
                        </Grid.Col>
                    </Grid>
                </Grid>
            </Container>
        </MantineProvider >
    );
}

