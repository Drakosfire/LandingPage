// ImageGenerationTab.tsx - Image Generation for Drawer
// Adapted from CardGenerator/CoreImageGallery.tsx for creature images

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { DUNGEONMIND_API_URL } from '../../../config';
import { Stack, Textarea, Button, Tabs, Loader, Image, Text, SimpleGrid, Card, Alert, Badge, Tooltip, Group, ActionIcon, Modal, Select, Box, Center } from '@mantine/core';
import { IconSparkles, IconLock, IconLogin, IconFolderOpen, IconLibraryPhoto, IconTrash, IconUpload, IconMaximize, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';
import { useAuth } from '../../../context/AuthContext';
import { buildFullPrompt, getStyleOptions, ImageStyle } from '../../../constants/imageStyles';
import { ImageGenerationProgress } from './ImageGenerationProgress';

interface ImageGenerationTabProps {
    onGenerationStart?: () => void;
    onGenerationComplete?: () => void;
}

interface LibraryImage {
    id: string;
    url: string;
    prompt: string;
    timestamp: string;
    projectId: string;
    projectName: string;
}

const ImageGenerationTab: React.FC<ImageGenerationTabProps> = ({
    onGenerationStart,
    onGenerationComplete
}) => {
    const { isLoggedIn } = useAuth();
    const {
        selectedAssets,
        generatedContent,
        setSelectedCreatureImage,
        addGeneratedImage,
        removeGeneratedImage,
        imagePrompt,
        setImagePrompt
        // setIsGenerating removed - don't use it for image generation
    } = useStatBlockGenerator();
    const [selectedModel, setSelectedModel] = useState<string>('flux-pro');
    const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('classic_dnd');
    const [activeTab, setActiveTab] = useState<'generate' | 'upload' | 'project' | 'library'>('generate');
    const [isLocalGenerating, setIsLocalGenerating] = useState(false);
    const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);
    const [expandedImagePrompt, setExpandedImagePrompt] = useState<string>('');
    const [expandedImageId, setExpandedImageId] = useState<string | null>(null);
    const [expandedImageIndex, setExpandedImageIndex] = useState<number>(0);
    const [expandedImageContext, setExpandedImageContext] = useState<'project' | 'library'>('project');

    const handleGenerateImage = useCallback(async () => {
        if (!imagePrompt.trim()) return;

        // Clear previous error
        setErrorMessage(null);

        // Create AbortController for timeout handling
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => {
            abortController.abort();
        }, 120000); // 120 second timeout (2 minutes)

        try {
            // Don't use setIsGenerating(true) - it causes canvas to hide the statblock
            // setIsGenerating(true);  // Only needed for TEXT generation, not images
            setIsLocalGenerating(true);

            // Track generation start time for progress bar
            const startTime = Date.now();
            setGenerationStartTime(startTime);

            onGenerationStart?.();

            console.log(`🎨 Starting image generation with ${selectedModel} in ${selectedStyle} style...`);

            // Build full prompt with style suffix
            const fullPrompt = buildFullPrompt(imagePrompt, selectedStyle);

            const response = await fetch(
                `${DUNGEONMIND_API_URL}/api/statblockgenerator/generate-image`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    signal: abortController.signal,
                    body: JSON.stringify({
                        sd_prompt: fullPrompt,
                        model: selectedModel,
                        num_images: 4
                    })
                }
            );

            clearTimeout(timeoutId);
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`⚡ Image generation completed in ${duration}s`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Image generation failed: ${response.statusText}`);
            }

            const payload = await response.json();

            // Extract images from response and add to provider state
            const newImages = payload.data?.images || [];
            if (newImages.length === 0) {
                throw new Error('No images were generated. Please try again.');
            }

            newImages.forEach((img: any) => {
                addGeneratedImage({
                    id: img.id || `img_${Date.now()}_${Math.random()}`,
                    url: img.url,
                    prompt: img.prompt || imagePrompt,
                    timestamp: img.created_at || new Date().toISOString()
                });
            });

            console.log(`✅ Successfully generated ${newImages.length} images`);

            // Auto-switch to project tab to show generated images
            setActiveTab('project');
            onGenerationComplete?.();
        } catch (error) {
            console.error('❌ Image generation failed:', error);

            // Handle different error types
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    setErrorMessage('Image generation timed out. This can happen with slower models. Please try again or choose a different model.');
                } else {
                    setErrorMessage(error.message);
                }
            } else {
                setErrorMessage('An unexpected error occurred. Please try again.');
            }
        } finally {
            clearTimeout(timeoutId);
            // setIsGenerating(false);  // Not needed since we don't set it to true
            setIsLocalGenerating(false);
            setGenerationStartTime(null); // Clear progress tracking
        }
    }, [imagePrompt, selectedModel, selectedStyle, addGeneratedImage, onGenerationStart, onGenerationComplete]);

    const handleSelectImage = useCallback((imageUrl: string, index: number) => {
        setSelectedCreatureImage(imageUrl, index);
    }, [setSelectedCreatureImage]);

    // Load all user images when Library tab is opened
    const loadLibraryImages = useCallback(async () => {
        if (!isLoggedIn) return;

        setIsLoadingLibrary(true);
        try {
            const response = await fetch(
                `${DUNGEONMIND_API_URL}/api/statblockgenerator/list-all-images`,
                {
                    method: 'GET',
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to load library: ${response.statusText}`);
            }

            const result = await response.json();
            setLibraryImages(result.data?.images || []);
        } catch (error) {
            console.error('Failed to load image library:', error);
        } finally {
            setIsLoadingLibrary(false);
        }
    }, [isLoggedIn]);

    // Load library when tab switches to library
    useEffect(() => {
        if (activeTab === 'library' && isLoggedIn && libraryImages.length === 0) {
            loadLibraryImages();
        }
    }, [activeTab, isLoggedIn, libraryImages.length, loadLibraryImages]);

    // Add image from library to current project
    const handleAddFromLibrary = useCallback((libraryImage: LibraryImage) => {
        // Add to current project's generatedContent
        addGeneratedImage({
            id: libraryImage.id,
            url: libraryImage.url,
            prompt: libraryImage.prompt,
            timestamp: libraryImage.timestamp
        });

        // Also select it as the current image
        setSelectedCreatureImage(libraryImage.url, generatedContent.images.length);

        // Switch to project gallery to show it was added
        setActiveTab('project');
    }, [addGeneratedImage, setSelectedCreatureImage, generatedContent.images.length]);

    // Delete image from current project with confirmation
    const handleDeleteFromProject = useCallback((imageId: string, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent card click
        setImageToDelete(imageId);
        setDeleteModalOpen(true);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (imageToDelete) {
            await removeGeneratedImage(imageToDelete);
            setDeleteModalOpen(false);
            setImageToDelete(null);
        }
    }, [imageToDelete, removeGeneratedImage]);

    // Drag & Drop handlers
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Only set dragging to false if leaving the drop zone completely
        if (e.currentTarget === e.target) {
            setIsDragging(false);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    // File upload handler (defined before handleDrop to avoid forward reference)
    const handleUploadImages = useCallback(async (files: File[]) => {
        if (files.length === 0) return;

        try {
            setIsUploading(true);
            setErrorMessage(null);

            // Validate file sizes (max 10MB each)
            const maxSize = 10 * 1024 * 1024; // 10MB
            const invalidFiles = files.filter(f => f.size > maxSize);
            if (invalidFiles.length > 0) {
                throw new Error(`Some files are too large. Maximum size is 10MB per file.`);
            }

            console.log(`📤 Uploading ${files.length} image(s)...`);
            const startTime = Date.now();

            const formData = new FormData();
            files.forEach(file => formData.append('images', file));

            const response = await fetch(
                `${DUNGEONMIND_API_URL}/api/statblockgenerator/upload-images`,
                {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Upload failed: ${response.statusText}`);
            }

            const payload = await response.json();
            const uploadedImages = payload.data?.images || [];

            if (uploadedImages.length === 0) {
                throw new Error('No images were uploaded. Please try again.');
            }

            // Add uploaded images to project
            uploadedImages.forEach((img: any) => {
                addGeneratedImage({
                    id: img.id || `img_upload_${Date.now()}_${Math.random()}`,
                    url: img.url,
                    prompt: img.filename || 'Uploaded image',
                    timestamp: img.timestamp || new Date().toISOString()
                });
            });

            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✅ Successfully uploaded ${uploadedImages.length} image(s) in ${duration}s`);

            // Auto-switch to project tab to show uploaded images
            setActiveTab('project');
        } catch (err) {
            console.error('❌ Upload error:', err);
            if (err instanceof Error) {
                setErrorMessage(err.message);
            } else {
                setErrorMessage('An unexpected error occurred during upload. Please try again.');
            }
        } finally {
            setIsUploading(false);
        }
    }, [addGeneratedImage]);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            setErrorMessage('Please drop image files only (PNG, JPEG, WebP, etc.)');
            return;
        }

        await handleUploadImages(imageFiles);
    }, [handleUploadImages]);

    // File input change handler
    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            handleUploadImages(files);
        }
        // Reset input so same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [handleUploadImages]);

    // Image expansion handlers
    const handleExpandImage = useCallback((
        imageUrl: string,
        prompt: string,
        imageId: string,
        index: number,
        context: 'project' | 'library',
        event: React.MouseEvent
    ) => {
        event.stopPropagation(); // Prevent card click from selecting image
        setExpandedImageUrl(imageUrl);
        setExpandedImagePrompt(prompt);
        setExpandedImageId(imageId);
        setExpandedImageIndex(index);
        setExpandedImageContext(context);
    }, []);

    const handleCloseExpandedImage = useCallback(() => {
        setExpandedImageUrl(null);
        setExpandedImagePrompt('');
        setExpandedImageId(null);
        setExpandedImageIndex(0);
    }, []);

    // Navigation handlers for modal
    const handlePreviousImage = useCallback(() => {
        const imageList = expandedImageContext === 'project'
            ? generatedContent.images
            : libraryImages;

        if (imageList.length === 0) return;

        const newIndex = expandedImageIndex > 0
            ? expandedImageIndex - 1
            : imageList.length - 1;

        const newImage = imageList[newIndex];
        setExpandedImageIndex(newIndex);
        setExpandedImageUrl(newImage.url);
        setExpandedImagePrompt(newImage.prompt || 'Image');
        setExpandedImageId(newImage.id);
    }, [expandedImageIndex, expandedImageContext, generatedContent.images, libraryImages]);

    const handleNextImage = useCallback(() => {
        const imageList = expandedImageContext === 'project'
            ? generatedContent.images
            : libraryImages;

        if (imageList.length === 0) return;

        const newIndex = expandedImageIndex < imageList.length - 1
            ? expandedImageIndex + 1
            : 0;

        const newImage = imageList[newIndex];
        setExpandedImageIndex(newIndex);
        setExpandedImageUrl(newImage.url);
        setExpandedImagePrompt(newImage.prompt || 'Image');
        setExpandedImageId(newImage.id);
    }, [expandedImageIndex, expandedImageContext, generatedContent.images, libraryImages]);

    // Delete from modal (project context)
    const handleDeleteFromModal = useCallback(async () => {
        if (!expandedImageId) return;

        if (expandedImageContext === 'project') {
            // Navigate to next/previous image before deleting
            const imageList = generatedContent.images;
            if (imageList.length > 1) {
                // Show next image, or previous if we're at the end
                if (expandedImageIndex < imageList.length - 1) {
                    handleNextImage();
                } else {
                    handlePreviousImage();
                }
            } else {
                // No more images, close modal
                handleCloseExpandedImage();
            }

            // Delete the image
            await removeGeneratedImage(expandedImageId);
        }
    }, [expandedImageId, expandedImageContext, expandedImageIndex, generatedContent.images, handleNextImage, handlePreviousImage, handleCloseExpandedImage, removeGeneratedImage]);

    // Delete from library (permanent deletion)
    const handleDeleteFromLibrary = useCallback(async () => {
        if (!expandedImageUrl || !expandedImageId) return;

        // Navigate to next/previous image before deleting
        const imageList = libraryImages;
        if (imageList.length > 1) {
            // Show next image, or previous if we're at the end
            if (expandedImageIndex < imageList.length - 1) {
                handleNextImage();
            } else {
                handlePreviousImage();
            }
        } else {
            // No more images, close modal
            handleCloseExpandedImage();
        }

        try {
            // Delete image from storage (permanent deletion)
            const response = await fetch(
                `${DUNGEONMIND_API_URL}/api/statblockgenerator/delete-image?image_url=${encodeURIComponent(expandedImageUrl)}`,
                {
                    method: 'DELETE',
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                console.error('Failed to delete image from library:', response.statusText);
            }

            // Remove from library state
            setLibraryImages(prev => prev.filter(img => img.id !== expandedImageId));

            // If this image is in the current project, remove it there too
            const isInProject = generatedContent.images.some(img => img.url === expandedImageUrl);
            if (isInProject) {
                const projectImage = generatedContent.images.find(img => img.url === expandedImageUrl);
                if (projectImage) {
                    await removeGeneratedImage(projectImage.id);
                }
            }
        } catch (error) {
            console.error('Error deleting image from library:', error);
        }
    }, [expandedImageUrl, expandedImageId, expandedImageIndex, libraryImages, generatedContent.images, handleNextImage, handlePreviousImage, handleCloseExpandedImage, removeGeneratedImage]);

    return (
        <>
            {/* Delete Confirmation Modal */}
            <Modal
                opened={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Remove Image from Project"
                centered
            >
                <Stack gap="md">
                    <Text size="sm">
                        Remove this image from the current project? This won't delete it from your library.
                    </Text>
                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button color="red" onClick={confirmDelete}>
                            Remove
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Image Expansion Modal */}
            <Modal
                opened={expandedImageUrl !== null}
                onClose={handleCloseExpandedImage}
                title={
                    <Badge size="md" variant="light">
                        {expandedImageIndex + 1} / {expandedImageContext === 'project' ? generatedContent.images.length : libraryImages.length}
                    </Badge>
                }
                size="xl"
                centered
            >
                <Stack gap="md">
                    {/* Image Container with Navigation */}
                    <Box style={{ position: 'relative' }}>
                        {expandedImageUrl && (
                            <Image
                                src={expandedImageUrl}
                                alt={expandedImagePrompt || 'Expanded image'}
                                fit="contain"
                                radius="md"
                                style={{
                                    maxHeight: '70vh',
                                    width: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                        )}

                        {/* Previous Button */}
                        <ActionIcon
                            size="xl"
                            variant="filled"
                            color="blue"
                            style={{
                                position: 'absolute',
                                left: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 10
                            }}
                            onClick={handlePreviousImage}
                            title="Previous image"
                        >
                            <IconChevronLeft size={24} />
                        </ActionIcon>

                        {/* Next Button */}
                        <ActionIcon
                            size="xl"
                            variant="filled"
                            color="blue"
                            style={{
                                position: 'absolute',
                                right: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 10
                            }}
                            onClick={handleNextImage}
                            title="Next image"
                        >
                            <IconChevronRight size={24} />
                        </ActionIcon>
                    </Box>

                    {/* Action Buttons */}
                    <Group justify="space-between">
                        <Group gap="xs">
                            {expandedImageContext === 'project' ? (
                                <Button
                                    leftSection={<IconTrash size={16} />}
                                    color="red"
                                    variant="light"
                                    onClick={handleDeleteFromModal}
                                >
                                    Remove from Project
                                </Button>
                            ) : (
                                <Button
                                    leftSection={<IconTrash size={16} />}
                                    color="red"
                                    variant="filled"
                                    onClick={handleDeleteFromLibrary}
                                >
                                    Remove from Library
                                </Button>
                            )}
                        </Group>
                        <Button variant="default" onClick={handleCloseExpandedImage}>
                            Close
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            <Tabs value={activeTab} onChange={(val) => setActiveTab(val as any)} data-tutorial="image-generation">
                <Tabs.List grow>
                    <Tabs.Tab value="generate" leftSection={<IconSparkles size={16} />}>
                        Generate
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="upload"
                        leftSection={<IconUpload size={16} />}
                        disabled={!isLoggedIn}
                    >
                        Upload
                    </Tabs.Tab>
                    <Tabs.Tab value="project" leftSection={<IconFolderOpen size={16} />}>
                        Project ({generatedContent.images.length})
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="library"
                        leftSection={<IconLibraryPhoto size={16} />}
                        disabled={!isLoggedIn}
                    >
                        Library
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="generate" pt="md">
                    {!isLoggedIn ? (
                        <Alert
                            icon={<IconLock size={16} />}
                            color="orange"
                            variant="light"
                            title="Login Required for AI Generation"
                        >
                            <Stack gap="sm">
                                <Text size="sm">
                                    AI image generation requires an account to save your images
                                    to the CDN and associate them with your projects.
                                </Text>
                                <Button
                                    component={Link}
                                    to="/login"
                                    leftSection={<IconLogin size={16} />}
                                    variant="filled"
                                    size="sm"
                                    style={{ minHeight: 38 }}
                                >
                                    Login or Sign Up
                                </Button>
                            </Stack>
                        </Alert>
                    ) : (
                        <Stack gap="md">
                            {errorMessage && (
                                <Alert color="red" variant="light" withCloseButton onClose={() => setErrorMessage(null)}>
                                    <Text size="sm">{errorMessage}</Text>
                                </Alert>
                            )}

                            <Textarea
                                label="Image Prompt"
                                description="Describe the creature's appearance"
                                placeholder="Describe the creature image you want to generate..."
                                value={imagePrompt}
                                onChange={(e) => setImagePrompt(e.target.value)}
                                minRows={3}
                                maxRows={10}
                                autosize
                                disabled={isLocalGenerating}
                            />

                            <Select
                                label="Art Style"
                                description="Choose a visual style for the image"
                                data={getStyleOptions()}
                                value={selectedStyle}
                                onChange={(value) => setSelectedStyle(value as ImageStyle)}
                                disabled={isLocalGenerating}
                            />

                            <Button
                                leftSection={isLocalGenerating ? <Loader size="sm" /> : <IconSparkles size={16} />}
                                onClick={handleGenerateImage}
                                disabled={!imagePrompt.trim() || isLocalGenerating}
                                loading={isLocalGenerating}
                                fullWidth
                                size="md"
                                style={{ minHeight: 44 }}
                            >
                                {isLocalGenerating ? 'Generating Images...' : 'Generate Images (4x)'}
                            </Button>

                            <Select
                                label="AI Model"
                                description="Choose the image generation model"
                                value={selectedModel}
                                onChange={(value) => setSelectedModel(value || 'flux-pro')}
                                data={[
                                    {
                                        value: 'flux-pro',
                                        label: 'FLUX Pro (Default) - High quality, balanced speed'
                                    },
                                    {
                                        value: 'imagen4',
                                        label: 'Imagen4 - Google\'s model, premium quality'
                                    },
                                    {
                                        value: 'openai',
                                        label: 'OpenAI GPT-Image-Mini - Fast, cost-effective'
                                    }
                                ]}
                                disabled={isLocalGenerating}
                            />

                            {/* Progress bar during generation */}
                            {isLocalGenerating && generationStartTime && (
                                <ImageGenerationProgress
                                    model={selectedModel}
                                    startTime={generationStartTime}
                                />
                            )}
                        </Stack>
                    )}
                </Tabs.Panel>

                {/* Upload Tab - Drag & Drop or Browse */}
                <Tabs.Panel value="upload" pt="md">
                    {!isLoggedIn ? (
                        <Alert
                            icon={<IconLock size={16} />}
                            color="orange"
                            variant="light"
                            title="Login Required for Image Upload"
                        >
                            <Stack gap="sm">
                                <Text size="sm">
                                    Image uploads require an account to save images to the CDN
                                    and associate them with your projects.
                                </Text>
                                <Button
                                    component={Link}
                                    to="/login"
                                    leftSection={<IconLogin size={16} />}
                                    variant="filled"
                                    size="sm"
                                    style={{ minHeight: 38 }}
                                >
                                    Login or Sign Up
                                </Button>
                            </Stack>
                        </Alert>
                    ) : (
                        <Stack gap="md">
                            {errorMessage && (
                                <Alert color="red" variant="light" withCloseButton onClose={() => setErrorMessage(null)}>
                                    <Text size="sm">{errorMessage}</Text>
                                </Alert>
                            )}

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                style={{ display: 'none' }}
                                onChange={handleFileInputChange}
                            />

                            {/* Drag & Drop Zone */}
                            <Box
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                style={{
                                    border: isDragging
                                        ? '3px dashed var(--mantine-color-blue-5)'
                                        : '2px dashed var(--mantine-color-gray-4)',
                                    borderRadius: '8px',
                                    padding: '2rem',
                                    backgroundColor: isDragging
                                        ? 'var(--mantine-color-blue-0)'
                                        : 'var(--mantine-color-gray-0)',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                            >
                                <Center>
                                    <Stack align="center" gap="md">
                                        {isUploading ? (
                                            <>
                                                <Loader size="lg" />
                                                <Text size="sm" c="dimmed">
                                                    Uploading images...
                                                </Text>
                                            </>
                                        ) : (
                                            <>
                                                <IconUpload
                                                    size={48}
                                                    style={{
                                                        color: isDragging
                                                            ? 'var(--mantine-color-blue-5)'
                                                            : 'var(--mantine-color-gray-5)'
                                                    }}
                                                />
                                                <Text size="lg" fw={500} ta="center">
                                                    {isDragging
                                                        ? 'Drop images here'
                                                        : 'Drag & drop images here'}
                                                </Text>
                                                <Text size="sm" c="dimmed" ta="center">
                                                    or click to browse files
                                                </Text>
                                                <Badge variant="light" color="gray">
                                                    Supports: PNG, JPEG, WebP, GIF (Max 10MB each)
                                                </Badge>
                                            </>
                                        )}
                                    </Stack>
                                </Center>
                            </Box>

                            <Text size="xs" c="dimmed" ta="center">
                                Uploaded images will be added to your project and library
                            </Text>
                        </Stack>
                    )}
                </Tabs.Panel>

                {/* Project Gallery - Current project's images only */}
                <Tabs.Panel value="project" pt="md">
                    <Stack gap="xs" mb="sm">
                        <Text size="sm" c="dimmed">
                            Images generated for this project
                        </Text>
                    </Stack>
                    {generatedContent.images.length === 0 ? (
                        <Text c="dimmed" size="sm" ta="center" py="xl">
                            No images generated yet. Switch to the Generate tab to create some.
                        </Text>
                    ) : (
                        <SimpleGrid
                            cols={{ base: 1, xs: 1, sm: 2, md: 2, lg: 2 }}
                            spacing={{ base: 'xs', sm: 'sm' }}
                            verticalSpacing={{ base: 'xs', sm: 'sm' }}
                        >
                            {generatedContent.images.map((img, index) => (
                                <Card
                                    key={img.id}
                                    padding="xs"
                                    withBorder
                                    style={{
                                        cursor: 'pointer',
                                        position: 'relative',
                                        border: selectedAssets.creatureImage === img.url
                                            ? '2px solid var(--mantine-color-blue-5)'
                                            : undefined
                                    }}
                                    onClick={() => handleSelectImage(img.url, index)}
                                >
                                    {/* Expand button - top left */}
                                    <ActionIcon
                                        color="blue"
                                        variant="filled"
                                        size="md"
                                        style={{
                                            position: 'absolute',
                                            top: 8,
                                            left: 8,
                                            zIndex: 10,
                                            minWidth: 36,
                                            minHeight: 36
                                        }}
                                        onClick={(e) => handleExpandImage(img.url, img.prompt || 'Generated image', img.id, index, 'project', e)}
                                        title="View full size"
                                    >
                                        <IconMaximize size={16} />
                                    </ActionIcon>

                                    {/* Delete button - top right */}
                                    <ActionIcon
                                        color="red"
                                        variant="filled"
                                        size="md"
                                        style={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            zIndex: 10,
                                            minWidth: 36,
                                            minHeight: 36
                                        }}
                                        onClick={(e) => handleDeleteFromProject(img.id, e)}
                                        title="Remove from project"
                                    >
                                        <IconTrash size={16} />
                                    </ActionIcon>

                                    <Image
                                        src={img.url}
                                        alt={`Generated ${index + 1}`}
                                        height={120}
                                        fit="cover"
                                    />
                                </Card>
                            ))}
                        </SimpleGrid>
                    )}
                </Tabs.Panel>

                {/* Library - All user images across all projects */}
                <Tabs.Panel value="library" pt="md">
                    <Stack gap="xs" mb="sm">
                        <Group justify="space-between">
                            <Text size="sm" c="dimmed">
                                All your generated images
                            </Text>
                            <Button
                                size="xs"
                                variant="subtle"
                                onClick={loadLibraryImages}
                                loading={isLoadingLibrary}
                                style={{ minHeight: 32 }}
                            >
                                Refresh
                            </Button>
                        </Group>
                    </Stack>

                    {isLoadingLibrary ? (
                        <Stack align="center" py="xl">
                            <Loader size="md" />
                            <Text size="sm" c="dimmed">Loading image library...</Text>
                        </Stack>
                    ) : libraryImages.length === 0 ? (
                        <Alert color="blue" variant="light">
                            <Text size="sm">
                                Your image library is empty. Generate images in any project to build your library.
                            </Text>
                        </Alert>
                    ) : (
                        <SimpleGrid
                            cols={{ base: 1, xs: 1, sm: 2, md: 2, lg: 2 }}
                            spacing={{ base: 'xs', sm: 'sm' }}
                            verticalSpacing={{ base: 'xs', sm: 'sm' }}
                        >
                            {libraryImages.map((img, index) => {
                                const isInCurrentProject = generatedContent.images.some(
                                    projectImg => projectImg.url === img.url
                                );
                                const isSelected = selectedAssets.creatureImage === img.url;

                                return (
                                    <Card
                                        key={img.id}
                                        padding="xs"
                                        withBorder
                                        style={{
                                            cursor: 'pointer',
                                            position: 'relative',
                                            border: isSelected
                                                ? '2px solid var(--mantine-color-blue-5)'
                                                : undefined
                                        }}
                                        onClick={() => {
                                            if (isInCurrentProject) {
                                                // If already in project, just select it
                                                const projectIndex = generatedContent.images.findIndex(
                                                    projectImg => projectImg.url === img.url
                                                );
                                                handleSelectImage(img.url, projectIndex);
                                            } else {
                                                // Add from library to current project
                                                handleAddFromLibrary(img);
                                            }
                                        }}
                                    >
                                        {/* Expand button - top left */}
                                        <ActionIcon
                                            color="blue"
                                            variant="filled"
                                            size="md"
                                            style={{
                                                position: 'absolute',
                                                top: 8,
                                                left: 8,
                                                zIndex: 10,
                                                minWidth: 36,
                                                minHeight: 36
                                            }}
                                            onClick={(e) => handleExpandImage(img.url, img.prompt || 'Library image', img.id, index, 'library', e)}
                                            title="View full size"
                                        >
                                            <IconMaximize size={16} />
                                        </ActionIcon>

                                        <Image
                                            src={img.url}
                                            alt={img.prompt || 'Library image'}
                                            height={120}
                                            fit="cover"
                                        />
                                        <Stack gap={4} mt="xs">
                                            {isInCurrentProject ? (
                                                <Badge size="xs" color="green" variant="light">
                                                    In Project
                                                </Badge>
                                            ) : (
                                                <Badge size="xs" color="blue" variant="light">
                                                    Click to Add
                                                </Badge>
                                            )}
                                            <Tooltip label={img.projectName} position="bottom">
                                                <Text size="xs" c="dimmed" truncate="end">
                                                    {img.projectName}
                                                </Text>
                                            </Tooltip>
                                        </Stack>
                                    </Card>
                                );
                            })}
                        </SimpleGrid>
                    )}
                </Tabs.Panel>
            </Tabs>
        </>
    );
};

export default ImageGenerationTab;

