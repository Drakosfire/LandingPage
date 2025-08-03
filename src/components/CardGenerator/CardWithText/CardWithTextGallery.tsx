import React, { useEffect, useRef, useState } from 'react';
import { CardPreviewProps } from '../../../types/card.types';
import { DUNGEONMIND_API_URL } from '../../../config';
import { ClickableImage } from '../shared';
import styles from '../../../styles/CardWithTextGallery.module.css';
import { Tabs } from '@mantine/core';

const CardWithTextGallery: React.FC<CardPreviewProps> = ({ image, details }) => {
    const [finalImage, setFinalImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [renderedCards, setRenderedCards] = useState<Array<{ url: string, name: string }>>([]);

    // Add example cards
    const exampleCards = [
        { url: '/example-cards/card1.jpg', name: 'Example Card 1' },
        { url: '/example-cards/card2.jpg', name: 'Example Card 2' },
        // Add more example cards as needed
    ];

    // Add a ref to track if this is the first render with new image
    const isFirstRender = useRef(true);
    const previousImage = useRef(image);

    useEffect(() => {
        // Only render text when the image changes (not when details change)
        if (image && image !== previousImage.current) {
            handleRenderText();
            previousImage.current = image;
        }

        // Clear the first render flag
        isFirstRender.current = false;
    }, [image]);

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

            // Sending card rendering request

            const response = await fetch(`${DUNGEONMIND_API_URL}/api/cardgenerator/render-card-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include session cookies
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

            <Tabs defaultValue="gallery">
                <Tabs.List>
                    <Tabs.Tab value="gallery">Your Cards</Tabs.Tab>
                    <Tabs.Tab value="examples">Examples</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="gallery">
                    <div className={styles.cardWithTextGalleryContainer}>
                        {renderedCards.length > 0 ? (
                            renderedCards.map((card, index) => (
                                <div
                                    key={index}
                                    className={styles.cardWithTextGalleryImage}
                                >
                                    <ClickableImage
                                        src={card.url}
                                        alt={`Generated card ${index + 1}`}
                                        title={card.name}
                                        description="Final card with text overlay"
                                        className={styles.cardWithTextGalleryImage}
                                        showExpandButton={true}
                                        expandButtonPosition="top-right"
                                        downloadFilename={`${card.name}-final-card.png`}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyGalleryPlaceholder}>
                                No cards generated yet. Try creating one!
                            </div>
                        )}
                    </div>
                </Tabs.Panel>

                <Tabs.Panel value="examples">
                    <div className={styles.cardWithTextGalleryContainer}>
                        {exampleCards.map((card, index) => (
                            <div
                                key={index}
                                className={styles.cardWithTextGalleryImage}
                            >
                                <ClickableImage
                                    src={card.url}
                                    alt={`Example card ${index + 1}`}
                                    title={card.name}
                                    description="Example card with text overlay"
                                    className={styles.cardWithTextGalleryImage}
                                    showExpandButton={true}
                                    expandButtonPosition="top-right"
                                    downloadFilename={`${card.name}-example.png`}
                                />
                            </div>
                        ))}
                    </div>
                </Tabs.Panel>
            </Tabs>
        </div>
    );
};

export default CardWithTextGallery;