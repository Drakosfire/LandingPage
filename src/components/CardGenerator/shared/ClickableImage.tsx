import React from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconMaximize } from '@tabler/icons-react';
import { useImageModal } from '../hooks/useImageModal';
import ImageModal from './ImageModal';

interface ClickableImageProps {
    /** The image URL */
    src: string;
    /** Alt text for the image */
    alt?: string;
    /** Title to display in the modal */
    title?: string;
    /** Description to display in the modal */
    description?: string;
    /** Custom download filename */
    downloadFilename?: string;
    /** CSS class name */
    className?: string;
    /** Whether to show the expand button */
    showExpandButton?: boolean;
    /** Position of the expand button */
    expandButtonPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
    /** Whether the image is clickable */
    clickable?: boolean;
    /** Custom click handler */
    onClick?: () => void;
    /** Whether to show open in tab button in modal */
    showOpenInTab?: boolean;
    /** Modal size */
    modalSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** Custom style for the image element */
    style?: React.CSSProperties;
}

const ClickableImage: React.FC<ClickableImageProps> = ({
    src,
    alt = 'Image',
    title,
    description,
    downloadFilename,
    className = '',
    showExpandButton = true,
    expandButtonPosition = 'top-right',
    clickable = true,
    onClick,
    showOpenInTab = true,
    modalSize = 'lg',
    style
}) => {
    const { modalState, openModal, closeModal } = useImageModal();

    const handleImageClick = () => {
        if (onClick) {
            onClick();
        } else if (clickable) {
            openModal(src, {
                altText: alt,
                title,
                description,
                downloadFilename
            });
        }
    };

    const handleExpandClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        openModal(src, {
            altText: alt,
            title,
            description,
            downloadFilename
        });
    };

    const getButtonPositionClasses = () => {
        switch (expandButtonPosition) {
            case 'top-left':
                return 'top-2 left-2';
            case 'top-right':
                return 'top-2 right-2';
            case 'bottom-left':
                return 'bottom-2 left-2';
            case 'bottom-right':
                return 'bottom-2 right-2';
            case 'center':
                return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
            default:
                return 'top-2 right-2';
        }
    };

    return (
        <>
            <div
                className={`relative group ${clickable ? 'cursor-pointer' : ''} ${className}`}
                onClick={handleImageClick}
            >
                <img
                    src={src}
                    alt={alt}
                    className={style ? '' : `w-full h-full object-cover transition-transform duration-200 ${clickable ? 'hover:scale-105' : ''}`}
                    style={style}
                />

                {showExpandButton && (
                    <Tooltip label="Expand image" position="top">
                        <ActionIcon
                            variant="filled"
                            color="blue"
                            size="sm"
                            className={`absolute ${getButtonPositionClasses()} transition-opacity duration-200 z-30`}
                            onClick={handleExpandClick}
                            style={{
                                zIndex: 30,
                                opacity: 0.8,
                                backgroundColor: 'rgba(59, 130, 246, 0.9)',
                                border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '0.8';
                                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.9)';
                            }}
                        >
                            <IconMaximize size={16} />
                        </ActionIcon>
                    </Tooltip>
                )}
            </div>

            <ImageModal
                imageUrl={modalState.imageUrl}
                altText={modalState.altText}
                title={modalState.title}
                description={modalState.description}
                downloadFilename={modalState.downloadFilename}
                showOpenInTab={showOpenInTab}
                size={modalSize}
                opened={modalState.opened}
                onClose={closeModal}
            />
        </>
    );
};

export default ClickableImage; 