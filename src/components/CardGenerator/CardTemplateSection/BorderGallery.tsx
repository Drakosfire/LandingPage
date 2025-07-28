import { useState } from 'react';
import styles from '../../../styles/BorderGallery.module.css';
import { borderTemplates } from '../../../config/borderTemplate';
import { SelectedImage } from '../../../types/card.types';

// Define the props interface
interface BorderGalleryProps {
    onSelect: (border: string) => void;
}

const BorderGallery: React.FC<BorderGalleryProps> = ({ onSelect }) => {
    // State for tracking the selected border
    const [selectedBorderId, setSelectedBorderId] = useState<string | null>(null);

    // Border templates array (move to a separate config file in production)

    const handleBorderSelect = (border: SelectedImage) => {
        setSelectedBorderId(border.id);
        onSelect(border.url);
        // Border selected
    };

    return (
        <div><h3>Step 1: Pick a border and a seed image</h3>
            <div className={styles.borderGalleryContainer}>

                <div className={styles.galleryGrid}>
                    {borderTemplates.map((border) => (
                        <div
                            key={border.id}
                            className={`${styles.borderItem} ${selectedBorderId === border.id ? styles.selected : ''
                                }`}
                            onClick={() => handleBorderSelect(border)}
                        >
                            <img
                                src={border.url}
                                alt={border.alt}
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BorderGallery;