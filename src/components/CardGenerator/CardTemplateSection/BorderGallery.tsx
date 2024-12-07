import { useState } from 'react';
import styles from '../../../styles/BorderGallery.module.css';

// Define the props interface
interface BorderGalleryProps {
    onSelect: (border: string) => void;
}

// Define the border template interface
interface BorderTemplate {
    url: string;
    id: string;
    alt: string;
}

const BorderGallery: React.FC<BorderGalleryProps> = ({ onSelect }) => {
    // State for tracking the selected border
    const [selectedBorderId, setSelectedBorderId] = useState<string | null>(null);

    // Border templates array (move to a separate config file in production)
    const borderTemplates: BorderTemplate[] = [
        {
            id: 'moonstone',
            url: 'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/90293844-4eec-438f-2ea1-c89d9cb84700/public',
            alt: 'Moonstone Border'
        },
        {
            id: 'golden',
            url: 'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/54d94248-e737-452c-bffd-2d425f803000/public',
            alt: 'Golden Border'
        },
        // Add more borders as needed
    ];

    const handleBorderSelect = (border: BorderTemplate) => {
        setSelectedBorderId(border.id);
        onSelect(border.url);
    };

    return (
        <div className={styles.borderGalleryContainer}>
            <h3>Card Template Gallery</h3>
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
    );
};

export default BorderGallery;