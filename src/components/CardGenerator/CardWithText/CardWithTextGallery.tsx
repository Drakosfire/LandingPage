import React, { useEffect, useRef, useState } from 'react';
import { CardPreviewProps } from '../../../types/card.types';
import { DUNGEONMIND_API_URL } from '../../../config';
import styles from '../../../styles/CardWithTextGallery.module.css';
const CardWithTextGallery: React.FC<CardPreviewProps> = ({ image, details }) => {
    const [finalImage, setFinalImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [renderedCards, setRenderedCards] = useState<Array<{ url: string, name: string }>>([]);

    useEffect(() => {
        if (image && details) {
            handleRenderText();
        }
    }, [image, details]);

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
            setRenderedCards(prev => [{ url: data.url, name: details.name || 'card' }, ...prev]);
        } catch (err) {
            console.error('Error rendering card:', err);
            setError('Failed to render card. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.cardWithTextGalleryContainer}>
            {isLoading && (
                <div className="text-center p-4">
                    Rendering card text...
                </div>
            )}

            {error && (
                <div className="text-red-500 text-center p-4">
                    {error}
                </div>
            )}

            {/* Gallery of rendered cards */}
            <div className={styles.gallery}>
                {renderedCards.map((card, index) => (
                    <div
                        key={index}
                        className={styles.cardWithTextGalleryImage}
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