import { useState } from 'react';
import styles from '../../../styles/BorderGallery.module.css';
import { borderTemplates } from '../../../config/borderTemplate';

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