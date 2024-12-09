import { useState } from 'react';
import { BorderGalleryProps } from '../../../types/card.types';
import styles from '../../../styles/CardGenerator.module.css';

const BorderGallery: React.FC<BorderGalleryProps> = ({ onSelect, isLoading, error }) => {
    const [selectedBorder, setSelectedBorder] = useState<string>('');

    // Example border templates (you might want to move these to a config file)
    const borderTemplates = [
        '/card-templates/border1.png',
        '/card-templates/border2.png',
        '/card-templates/border3.png',
    ];

    if (isLoading) {
        return <div>Loading borders...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    const BorderGallery: React.FC<BorderGalleryProps> = ({ onSelect }) => {
        // State for tracking the selected border
        const [selectedBorderId, setSelectedBorderId] = useState<string | null>(null);

        // Border templates array (move to a separate config file in production)

        const handleBorderSelect = (border: BorderTemplate) => {
            setSelectedBorderId(border.id);
            onSelect(border.url);
        };

        return (
            <div className={styles.galleryContainer}>
                <div className={styles.imageGrid}>
                    {borderTemplates.map((border, index) => (
                        <div
                            key={index}
                            className={`${styles.imageWrapper} ${selectedBorder === border ? styles.selected : ''
                                }`}
                            onClick={() => {
                                setSelectedBorder(border);
                                onSelect(border);
                            }}
                        >
                            <img src={border} alt={`Border ${index + 1}`} />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    export default BorderGallery;