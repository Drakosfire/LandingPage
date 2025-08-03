import React from 'react';
import { Modal, Image, ActionIcon, Group, Text, Stack } from '@mantine/core';
import { IconX, IconDownload, IconMaximize } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

interface ImageModalProps {
    /** The image URL to display */
    imageUrl: string;
    /** Alt text for the image */
    altText?: string;
    /** Title to display in the modal header */
    title?: string;
    /** Description to display below the image */
    description?: string;
    /** Whether to show download button */
    showDownload?: boolean;
    /** Custom download filename */
    downloadFilename?: string;
    /** Modal size - can be 'sm', 'md', 'lg', 'xl', or 'full' */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** Whether the modal is open */
    opened: boolean;
    /** Callback when modal is closed */
    onClose: () => void;
    /** Additional CSS classes */
    className?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({
    imageUrl,
    altText = 'Image',
    title,
    description,
    showDownload = true,
    downloadFilename,
    size = 'lg',
    opened,
    onClose,
    className
}) => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = downloadFilename || `image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size={size}
            title={title}
            centered
            closeOnClickOutside
            closeOnEscape
            withCloseButton
            classNames={{
                header: 'border-b border-gray-200 pb-4',
                title: 'text-lg font-semibold text-gray-900',
                body: 'p-0'
            }}
            className={className}
        >
            <Stack gap="md" p="md">
                <div className="relative">
                    <Image
                        src={imageUrl}
                        alt={altText}
                        fit="contain"
                        className="max-h-[70vh] w-full"
                        fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3EImage not available%3C/text%3E%3C/svg%3E"
                    />
                </div>

                {(description || showDownload) && (
                    <Group justify="space-between" className="border-t border-gray-200 pt-4">
                        {description && (
                            <Text size="sm" c="dimmed" className="flex-1">
                                {description}
                            </Text>
                        )}

                        {showDownload && (
                            <ActionIcon
                                variant="subtle"
                                color="blue"
                                onClick={handleDownload}
                                title="Download image"
                                size="lg"
                            >
                                <IconDownload size={20} />
                            </ActionIcon>
                        )}
                    </Group>
                )}
            </Stack>
        </Modal>
    );
};

export default ImageModal; 