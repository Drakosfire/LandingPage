import React, { useState } from 'react';
import styles from '../../../styles/ImageGallery.module.css';

interface ImageGalleryProps {
    template: Blob | null;  // Changed from string to Blob
    sdPrompt: string;
    onSelect: (imageUrl: string) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ template, sdPrompt, onSelect }) => {
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateImages = async () => {
        if (!template) {
            setError("Please create a template first");
            return;
        }

        if (!sdPrompt) {
            setError("Please provide an SD Prompt");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Create FormData with both the template blob and SD prompt
            const formData = new FormData();
            formData.append('template', template);
            formData.append('sdPrompt', sdPrompt);
            formData.append('numImages', '4');

            // Make a single call to your API server
            const response = await fetch('http://localhost:7860/api/cardgenerator/generate-card-images', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to generate images');
            }

            const data = await response.json();
            setGeneratedImages(data.images);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <button
                    onClick={handleGenerateImages}
                    disabled={isLoading || !template}
                    className={`${styles.generateButton} ${isLoading ? styles.loading : ''}`}
                >
                    {isLoading ? 'Generating...' : 'Generate Card Images'}
                </button>
            </div>

            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}

            <div className={styles.gallery}>
                {generatedImages.map((imageUrl, index) => (
                    <div
                        key={index}
                        className={styles.imageContainer}
                        onClick={() => onSelect(imageUrl)}
                    >
                        <img
                            src={imageUrl}
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