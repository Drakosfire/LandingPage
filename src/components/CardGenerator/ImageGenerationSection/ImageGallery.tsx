import React, { useState } from 'react';
import styles from '../../../styles/ImageGallery.module.css';
import { DUNGEONMIND_API_URL } from '../../../config';
import { Select, TextInput, Textarea } from '@mantine/core';
import classes from '../../../styles/TextInput.module.css';
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
        console.log('ImageGallery: Generate button clicked');

        if (!template || !sdPrompt) {
            console.warn('ImageGallery: Missing required data:', {
                hasTemplate: !!template,
                hasSdPrompt: !!sdPrompt
            });
            setError('Template and prompt are required');
            return;
        }

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('template', template, 'template.png');
        formData.append('sdPrompt', sdPrompt);
        formData.append('numImages', '4');

        console.log('ImageGallery: Sending request with:', {
            templateSize: template.size,
            sdPrompt,
            formDataEntries: Array.from(formData.entries()).map(([key]) => key)
        });

        try {
            console.log('ImageGallery: Sending request to:', `${DUNGEONMIND_API_URL}/api/generate-card-images`);
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/cardgenerator/generate-card-images`, {
                method: 'POST',
                body: formData,
            });

            console.log('ImageGallery: Received response:', {
                status: response.status,
                ok: response.ok
            });

            if (!response.ok) {
                throw new Error(`Failed to generate images: ${response.status}`);
            }

            const data = await response.json();
            console.log('ImageGallery: Received data:', data);
            setGeneratedImages(data.images);
        } catch (error) {
            console.error('ImageGallery: Error generating images:', error);
            setError('Failed to generate images. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    console.log('ImageGallery: Rendering with state:', {
        hasGeneratedImages: generatedImages.length > 0,
        isLoading,
        hasError: !!error
    });

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <TextInput
                    placeholder="Enter image generation prompt"
                    value={sdPrompt}
                    onChange={(event) => onSdPromptChange(event.currentTarget.value)}
                    classNames={classes}
                />

                <button
                    onClick={handleGenerateImages}
                    disabled={isLoading || !template}
                    className={`${styles.generateButton} ${isLoading ? styles.loading : ''}`}
                >
                    {isLoading ? 'Generating...' : 'Step 5: Generate Card Images'}
                </button>
            </div>

            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}

            <div className={styles.gallery}>
                {generatedImages.map((image, index) => (
                    <div
                        key={index}
                        className={styles.imageContainer}
                        onClick={() => {
                            console.log('ImageGallery: Selected image:', image);
                            onSelect(image.url);
                        }}
                    >
                        <img
                            src={image.url}
                            alt={`Generated card ${index + 1}`}
                            className={styles.image}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageGallery;