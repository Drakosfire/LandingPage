import React, { useState } from 'react';
import styles from '../../../styles/ImageGallery.module.css';
import { DUNGEONMIND_API_URL } from '../../../config';
import { Select, TextInput, Textarea, Grid } from '@mantine/core';
import classes from '../../../styles/ItemForm.module.css';
interface ImageGalleryProps {
    template: Blob | null;
    sdPrompt: string;
    onSdPromptChange: (newPrompt: string) => void;
    onSelect: (imageUrl: string) => void;
}

interface GeneratedImage {
    url: string;
    width: number;
    height: number;
    content_type: string;
}



const ImageGallery: React.FC<ImageGalleryProps> = ({ template, sdPrompt, onSdPromptChange, onSelect }) => {
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateImages = async () => {
        if (!template || !sdPrompt) {
            setError('Template and prompt are required');
            return;
        }

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('template', template, 'template.png');
        formData.append('sdPrompt', sdPrompt);
        formData.append('numImages', '4');

        try {
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/cardgenerator/generate-card-images`, {
                method: 'POST',
                credentials: 'include', // Include session cookies
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Failed to generate images: ${response.status}`);
            }

            const data = await response.json();
            setGeneratedImages(data.images);
        } catch (error) {
            setError('Failed to generate images. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageSelect = async (image: GeneratedImage) => {
        onSelect(image.url);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="w-full">
                <Textarea
                    placeholder="SD Prompt"
                    value={sdPrompt}
                    onChange={(event) => onSdPromptChange(event.target.value)}
                    autosize
                    minRows={2}
                    maxRows={10}
                    className="w-full p-2 border rounded"
                />
            </div>
            <div className={styles.imageGalleryContainer}>

                <div className={styles.imageGalleryControls}>
                    <button
                        onClick={handleGenerateImages}
                        disabled={isLoading || !template}
                        className={`${styles.imageGalleryGenerateButton} ${isLoading ? styles.loading : ''}`}
                    >
                        {isLoading ? 'Generating...' : 'Step 5: Generate Card Images'}
                    </button>
                </div>

                {error && (
                    <div className={styles.imageGalleryError}>
                        {error}
                    </div>
                )}

                <Grid className={styles.imageGallery}>
                    {generatedImages.map((image, index) => (
                        <Grid.Col span={6} key={index}>
                            <div
                                className={styles.imageGalleryImage}
                                onClick={() => handleImageSelect(image)}
                            >
                                <img
                                    src={image.url}
                                    alt={`Generated card ${index + 1}`}
                                    className={styles.imageGalleryImage}
                                />
                            </div>
                        </Grid.Col>
                    ))}
                </Grid>
            </div>
        </div>
    );
};

export default ImageGallery;