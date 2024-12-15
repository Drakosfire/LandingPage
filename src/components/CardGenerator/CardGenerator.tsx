import { useState } from 'react';
import { ItemDetailsType, Template, GeneratedImage, createTemplate } from '../../types/card.types';
import ItemDetails from './ItemGenerationSection/ItemDetails';
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
    const [itemDetails, setItemDetails] = useState<ItemDetailsType | null>(null);
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

    const handleGenerateItemDetails = async (data: any) => {
        // TODO: API call to generate item details
        // For now, just set the data directly
        setItemDetails(data);
    };

    const handleGenerateImages = async () => {
        // TODO: API call to generate images
        // This will be connected to your image generation backend later
    };

    return (
        <div className={styles.container}>
            <Instructions />

            <section className={styles.section}>
                <h2>First: Generate Item Text</h2>
                <ItemForm onGenerate={handleGenerateItemDetails} />
                {itemDetails && <ItemDetails details={itemDetails} />}
            </section>

            <section className={styles.section}>
                <h2>Second: Build a Card Template</h2>
                <div className={styles.templateSection}>
                    <div className={styles.galleryColumn}>
                        <div className={styles.borderGallery}>
                            <BorderGallery onSelect={handleBorderSelect} />
                        </div>
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
                <h2>Third: Generate Cards</h2>
                <ImageGallery
                    template={templateBlob}
                    sdPrompt={itemDetails?.[Object.keys(itemDetails)[0]]['SD Prompt'] || ''}
                    onSelect={setSelectedFinalImage}
                />
            </section>

            <section className={styles.section}>
                <h2>Fourth: Final Card</h2>
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
