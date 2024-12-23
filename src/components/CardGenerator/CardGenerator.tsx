import React, { useState } from 'react';
import { ItemDetails, GeneratedImage, createTemplate } from '../../types/card.types';
import BorderGallery from './CardTemplateSection/BorderGallery';
import SeedImageGallery from './CardTemplateSection/SeedImageGallery';
import TemplatePreview from './CardTemplateSection/TemplatePreview';
import ItemForm from './ItemGenerationSection/ItemForm';
import ImageGallery from './ImageGenerationSection/ImageGallery';
import CardPreview from './FinalCardSection/CardPreview';
import Instructions from '../Layout/Instructions';
import styles from '../../styles/CardGenerator.module.css';


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
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [selectedFinalImage, setSelectedFinalImage] = useState<string>('');
    const [templateBlob, setTemplateBlob] = useState<Blob | null>(null);

    // Use the factory function to create the template
    const template = createTemplate(selectedBorder, selectedSeedImage);

    const handleBorderSelect = (border: string) => {
        setSelectedBorder(border);
    };

    const handleSeedImageSelect = (image: string) => {
        setSelectedSeedImage(image);
    };

    const handleGenerateTemplate = (blob: Blob, url: string) => {
        setTemplateBlob(blob);
    };

    const handleItemDetailsChange = (data: any) => {
        // Log the new data being merged
        setItemDetails(prev => {
            const updated = { ...prev, ...data };
            // console.log('Updated State:', updated); // Log the updated state within the setter
            return updated;
        });
    };

    const handleImageSelect = (imageUrl: string) => {
        // Handle selected image storing in state
        setSelectedFinalImage(imageUrl);
    };

    return (
        <div className={styles.container}>
            <section className={styles.section}>
                <ItemForm
                    onGenerate={handleItemDetailsChange}
                    initialData={itemDetails}
                />
            </section>

            <section className={styles.section}>
                <div className={styles.templateSection}>
                    <div className={styles.galleryColumn}>
                        <div className={styles.borderGallery}>
                            <BorderGallery onSelect={handleBorderSelect} />
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.templateSection}>
                    <div className={styles.galleryColumn}>
                        <div className={styles.seedImageGallery}>
                            <SeedImageGallery onSelect={handleSeedImageSelect} />
                        </div>
                    </div>
                    <div className={styles.previewColumn}>
                        <div className={styles.templatePreview}>
                            <TemplatePreview
                                template={template}
                                onGenerate={handleGenerateTemplate}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <ImageGallery
                    template={templateBlob}
                    sdPrompt={itemDetails.sdPrompt}
                    onSelect={handleImageSelect}
                />
            </section>

            <section className={styles.section}>
                {selectedFinalImage && (
                    <CardPreview
                        image={selectedFinalImage}
                        details={itemDetails}
                    />
                )}
            </section>
        </div>
    );
}
