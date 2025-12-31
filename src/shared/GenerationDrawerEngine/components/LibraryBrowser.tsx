/**
 * LibraryBrowser - Paginated image library browser
 * 
 * Displays a paginated grid of all user images with add-to-project and delete functionality.
 */

import React from 'react';
import { SimpleGrid, Card, Image, Text, Loader, Center, Stack, Pagination, ActionIcon, Tooltip, Group } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import type { SessionImage } from './ProjectGallery';

export interface LibraryBrowserProps {
    /** Library images to display */
    images: SessionImage[];
    /** Callback when image is clicked (opens modal) */
    onImageClick: (image: SessionImage, index: number) => void;
    /** Callback when image is added to project */
    onAddToProject: (image: SessionImage) => void;
    /** Callback when image is deleted */
    onDelete: (imageId: string) => void;
    /** Whether library is loading */
    isLoading: boolean;
    /** Current page number */
    currentPage: number;
    /** Total number of pages */
    totalPages: number;
    /** Callback when page changes */
    onPageChange: (page: number) => void;
}

/**
 * LibraryBrowser component for browsing user's image library
 */
export const LibraryBrowser: React.FC<LibraryBrowserProps> = ({
    images,
    onImageClick,
    onAddToProject,
    onDelete,
    isLoading,
    currentPage,
    totalPages,
    onPageChange
}) => {
    console.log('📚 [LibraryBrowser] Render:', {
        imagesCount: images.length,
        currentPage,
        totalPages,
        isLoading,
        showPagination: totalPages > 1
    });

    if (isLoading) {
        return (
            <Center py="xl">
                <Stack align="center" gap="md">
                    <Loader size="lg" />
                    <Text size="sm" c="dimmed">Loading library...</Text>
                </Stack>
            </Center>
        );
    }

    if (images.length === 0) {
        return (
            <Center py="xl">
                <Stack align="center" gap="md">
                    <Text size="lg" fw={500} c="dimmed">No images in library</Text>
                    <Text size="sm" c="dimmed">
                        Generate or upload images to see them here
                    </Text>
                </Stack>
            </Center>
        );
    }

    return (
        <Stack gap="md" pb="xl">
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
                {images.map((image, index) => (
                    <Card
                        key={image.id}
                        shadow="sm"
                        padding="xs"
                        radius="md"
                        withBorder
                        style={{ position: 'relative', cursor: 'pointer' }}
                        data-testid={`library-image-${image.id}`}
                        onClick={() => onImageClick(image, index)}
                    >
                        <Card.Section>
                            <Image
                                src={image.url}
                                alt={image.prompt || `Image ${image.id}`}
                                height={150}
                                fit="cover"
                            />
                        </Card.Section>

                        <Group justify="space-between" mt="xs" gap="xs">
                            <Text size="xs" c="dimmed" lineClamp={1} style={{ flex: 1 }}>
                                {image.prompt || 'Untitled'}
                            </Text>
                            <Group gap={4}>
                                <Tooltip label="Add to project">
                                    <ActionIcon
                                        variant="light"
                                        color="blue"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAddToProject(image);
                                        }}
                                        aria-label="Add to project"
                                    >
                                        <IconPlus size={16} />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Delete">
                                    <ActionIcon
                                        variant="light"
                                        color="red"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(image.id);
                                        }}
                                        aria-label="Delete image"
                                    >
                                        <IconTrash size={16} />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                        </Group>
                    </Card>
                ))}
            </SimpleGrid>

            {totalPages > 1 && (
                <Center>
                    <Pagination
                        value={currentPage}
                        onChange={onPageChange}
                        total={totalPages}
                        size="sm"
                        aria-label="Library pagination"
                    />
                </Center>
            )}
        </Stack>
    );
};

