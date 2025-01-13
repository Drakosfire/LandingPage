import React, { useEffect, useRef, useState } from 'react';
import { CardPreviewProps } from '../../../types/card.types';
import { DUNGEONMIND_API_URL } from '../../../config';
import styles from '../../../styles/CardWithTextGallery.module.css';
const CardWithTextGallery: React.FC<CardPreviewProps> = ({ image, details }) => {
    const [finalImage, setFinalImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [renderedCards, setRenderedCards] = useState<Array<{ url: string, name: string }>>([]);

    const handleRenderText = async () => {
        if (!image || !details) return;

        setIsLoading(true);
        setError(null);

        try {
            // Convert properties array to list of strings
            const propertiesList = details.properties.map(property => property.trim());

            const requestBody = {
                image_url: image,
                item_details: {
                    Name: details.name,
                    Type: details.type,
                    Rarity: details.rarity,
                    Value: details.value,
                    Properties: propertiesList,
                    "Damage Formula": details.damageFormula,
                    "Damage Type": details.damageType,
                    Weight: details.weight,
                    Description: details.description,
                    Quote: details.quote,
                    "SD Prompt": details.sdPrompt
                }
            };

            console.log('Sending request with body:', requestBody);

            const response = await fetch(`${DUNGEONMIND_API_URL}/api/cardgenerator/render-card-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to render card text: ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            setFinalImage(data.url);
            setRenderedCards(prev => [...prev, {
                url: data.url,
                name: details.name || 'card'
            }]);
        } catch (err) {
            console.error('Error rendering card:', err);
            setError('Failed to render card. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.cardWithTextGalleryContainer}>
            {/* Original image and render button */}
            <div className="mb-8 border-b pb-8">
                <img
                    src={image}
                    alt="Card Preview"
                    className={styles.cardWithTextGalleryImage}
                />

                <button
                    onClick={handleRenderText}
                    disabled={isLoading}
                    className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {isLoading ? 'Rendering...' : 'Add Text to Card'}
                </button>

                {error && (
                    <div className="text-red-500 text-center p-4">
                        {error}
                    </div>
                )}
            </div>

            {/* Gallery of rendered cards */}
            <div className={styles.gallery}>
                {renderedCards.map((card, index) => (
                    <div
                        key={index}
                        className={styles.cardWithTextGalleryContainer}
                        onClick={() => {
                            console.log('ImageGallery: Selected image:', card.url);
                            // onSelect(card.url);
                        }}
                    >
                        <img
                            src={card.url}
                            alt={`Generated card ${index + 1}`}
                            className={styles.cardWithTextGalleryImage}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CardWithTextGallery;