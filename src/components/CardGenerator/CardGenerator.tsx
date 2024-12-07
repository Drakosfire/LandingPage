
import { useState } from 'react';
import { ItemDetailsType, TemplateImage, GeneratedImage } from '../../types/card.types';
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
    const [generatedTemplate, setGeneratedTemplate] = useState<string>('');
    const [itemDetails, setItemDetails] = useState<ItemDetailsType | null>(null);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [selectedFinalImage, setSelectedFinalImage] = useState<string>('');

    const handleBorderSelect = (border: string) => {
        setSelectedBorder(border);
    };

    const handleSeedImageSelect = (image: string) => {
        setSelectedSeedImage(image);
    };

    const handleGenerateTemplate = async () => {
        // TODO: API call to generate template
        // This will be connected to your backend later
    };

    const handleGenerateItemDetails = async (prompt: string) => {
        // TODO: API call to generate item details
        // This will be connected to your LLM backend later
    };

    const handleGenerateImages = async () => {
        // TODO: API call to generate images
        // This will be connected to your image generation backend later
    };

    return (
        <div className={styles.container}>
            <Instructions />

            <section className={styles.section}>
                <h2>First: Build a Card Template</h2>
                <div className={styles.templateSection}>
                    <BorderGallery onSelect={handleBorderSelect} />
                    <SeedImageGallery onSelect={handleSeedImageSelect} />
                    <TemplatePreview
                        template={generatedTemplate}
                        onGenerate={handleGenerateTemplate}
                    />
                </div>
            </section>

            <section className={styles.section}>
                <h2>Second: Generate Item Text</h2>
                <ItemForm onGenerate={handleGenerateItemDetails} />
                {itemDetails && <ItemDetails details={itemDetails} />}
            </section>

            <section className={styles.section}>
                <h2>Third: Generate Cards</h2>
                <ImageGallery
                    images={generatedImages}
                    onSelect={setSelectedFinalImage}
                    onGenerate={handleGenerateImages}
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
