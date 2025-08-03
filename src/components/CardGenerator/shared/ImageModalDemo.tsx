import React from 'react';
import { Card, Text, Stack, Group, Button } from '@mantine/core';
import { ClickableImage, ImageModal, useImageModal } from './index';

const ImageModalDemo: React.FC = () => {
    const { modalState, openModal, closeModal } = useImageModal();

    const demoImages = [
        {
            url: 'https://picsum.photos/300/400?random=1',
            title: 'Demo Image 1',
            description: 'This is a demo image showing the modal functionality'
        },
        {
            url: 'https://picsum.photos/300/400?random=2',
            title: 'Demo Image 2',
            description: 'Another demo image with different content'
        },
        {
            url: 'https://picsum.photos/300/400?random=3',
            title: 'Demo Image 3',
            description: 'Third demo image for testing purposes'
        }
    ];

    return (
        <Stack gap="lg">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text size="xl" fw={700} mb="md">
                    Image Modal Demo
                </Text>
                <Text size="sm" c="dimmed" mb="lg">
                    This demonstrates the new expandable image functionality. Click on any image or the expand button to view it in a modal.
                </Text>

                <Group gap="md">
                    {demoImages.map((image, index) => (
                        <div key={index} style={{ width: '200px' }}>
                            <ClickableImage
                                src={image.url}
                                alt={image.title}
                                title={image.title}
                                description={image.description}
                                className="rounded-lg border border-gray-200"
                                showExpandButton={true}
                                expandButtonPosition="top-right"
                                downloadFilename={`demo-image-${index + 1}.png`}
                            />
                        </div>
                    ))}
                </Group>

                <Group mt="lg">
                    <Button
                        variant="outline"
                        onClick={() => openModal(demoImages[0].url, {
                            title: 'Programmatically Opened',
                            description: 'This modal was opened programmatically'
                        })}
                    >
                        Open Modal Programmatically
                    </Button>
                </Group>
            </Card>

            {/* Manual Modal Example */}
            <ImageModal
                imageUrl={modalState.imageUrl}
                altText={modalState.altText}
                title={modalState.title}
                description={modalState.description}
                downloadFilename={modalState.downloadFilename}
                opened={modalState.opened}
                onClose={closeModal}
                size="lg"
            />
        </Stack>
    );
};

export default ImageModalDemo; 