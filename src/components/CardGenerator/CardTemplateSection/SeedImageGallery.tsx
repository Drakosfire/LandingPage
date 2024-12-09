import { useState, useCallback } from 'react';
import { SeedImageGalleryProps } from '../../../types/card.types';
import styles from '../../../styles/CardGenerator.module.css';

const SeedImageGallery: React.FC<SeedImageGalleryProps> = ({ onSelect }) => {
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);

    // Handle both drag-and-drop and click upload
    const handleImageUpload = useCallback((file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Validate file size (e.g., 5MB limit)
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_SIZE) {
            alert('File size must be less than 5MB');
            return;
        }

        // Create URL for preview and pass to parent
        const imageUrl = URL.createObjectURL(file);
        setSelectedImage(imageUrl);
        onSelect(imageUrl);
    }, [onSelect]);

    // Drag and drop handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleImageUpload(file);
        }
    }, [handleImageUpload]);

    return (
        <div className={styles.galleryContainer}>
            {/* ... existing gallery code ... */}

            <div
                className={`${styles.uploadZone} ${isDragging ? styles.dragging : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <p>Drop your image here or</p>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                    }}
                    className={styles.fileInput}
                    id="fileInput"
                />
                <label htmlFor="fileInput" className={styles.uploadButton}>
                    Choose File
                </label>
            </div>
        </div>
    );
};

export default SeedImageGallery;