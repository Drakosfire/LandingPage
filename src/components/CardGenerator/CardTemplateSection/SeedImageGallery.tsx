import { useState, useCallback } from 'react';
import { SeedImageGalleryProps } from '../../../types/card.types';
import styles from '../../../styles/SeedImageGallery.module.css';
import { seedImages } from '../../../config/seedImages';
const SeedImageGallery: React.FC<SeedImageGalleryProps> = ({ onSelect }) => {
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Handle both drag-and-drop and click upload
    const handleImageUpload = useCallback(async (file: File) => {
        const allowedFormats = ['image/jpeg', 'image/png'];
        try {
            setIsUploading(true);
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file');
                return;
            }
            if (!allowedFormats.includes(file.type)) {
                alert('Only JPEG and PNG images are allowed');
                return;
            }

            const MAX_SIZE = 5 * 1024 * 1024; // 5MB
            if (file.size > MAX_SIZE) {
                alert('File size must be less than 5MB');
                return;
            }

            try {
                const formData = new FormData();
                formData.append('image', file);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }

                const { imageUrl } = await response.json();
                setSelectedImage(imageUrl);
                onSelect(imageUrl);
            } catch (error) {
                alert('Error uploading image: ' + (error as Error).message);
            }
        } finally {
            setIsUploading(false);
        }
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

    const handleImageSelect = (image: SeedImage) => {
        setSelectedImage(image.id);
        onSelect(image.url);
    };

    return (
        <div className={styles.galleryContainer}>
            <h3>Seed Image Gallery</h3>
            <div className={styles.galleryGrid}>
                {seedImages.map((image) => (
                    <div key={image.id}
                        className={`${styles.imageItem} ${selectedImage === image.id ? styles.selected : ''}`}
                        onClick={() => handleImageSelect(image)}
                    >
                        <img src={image.url} alt={image.alt} />
                    </div>
                ))}
            </div>

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