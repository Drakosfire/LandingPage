// ImageGenerationTab.tsx - Image Generation for Drawer
// Adapted from CardGenerator/CoreImageGallery.tsx for creature images

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { DUNGEONMIND_API_URL } from '../../../config';
import { Stack, Textarea, Button, Tabs, Loader, Image, Text, SimpleGrid, Card, Alert, Badge, Tooltip, Group, ActionIcon, Modal, Select, Box, Center } from '@mantine/core';
import { IconPhoto, IconSparkles, IconLock, IconLogin, IconFolderOpen, IconLibraryPhoto, IconTrash, IconUpload } from '@tabler/icons-react';
import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';
import { useAuth } from '../../../context/AuthContext';

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
        creatureDetails,
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
    const [activeTab, setActiveTab] = useState<'generate' | 'upload' | 'project' | 'library'>('generate');
    const [isLocalGenerating, setIsLocalGenerating] = useState(false);
    const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-generate prompt from creature details
    const handleAutoFillPrompt = useCallback(() => {
        const parts = [];
        if (creatureDetails.name) parts.push(creatureDetails.name);
        if (creatureDetails.type) parts.push(creatureDetails.type);
        if (creatureDetails.size) parts.push(creatureDetails.size);

        // Use description if available
        if (creatureDetails.description) {
            parts.push(creatureDetails.description);
        }

        const prompt = parts.join(', ') + ', fantasy art, detailed portrait, dramatic lighting, high quality';
        setImagePrompt(prompt);
    }, [creatureDetails]);

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
            onGenerationStart?.();

            console.log(`🎨 Starting image generation with ${selectedModel}...`);
            const startTime = Date.now();

            const response = await fetch(
                `${DUNGEONMIND_API_URL}/api/statblockgenerator/generate-image`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    signal: abortController.signal,
                    body: JSON.stringify({
                        sd_prompt: imagePrompt,
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
        }
    }, [imagePrompt, selectedModel, addGeneratedImage, onGenerationStart, onGenerationComplete]);

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
    }, []);

    // File upload handler
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

            <Tabs value={activeTab} onChange={(val) => setActiveTab(val as any)}>
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

                            <Button
                                variant="light"
                                size="sm"
                                onClick={handleAutoFillPrompt}
                                disabled={isLocalGenerating || !creatureDetails.name}
                            >
                                Auto-fill from creature
                            </Button>

                            <Textarea
                                label="Image Prompt"
                                placeholder="Describe the creature image you want to generate..."
                                value={imagePrompt}
                                onChange={(e) => setImagePrompt(e.target.value)}
                                minRows={3}
                                maxRows={6}
                                disabled={isLocalGenerating}
                            />

                            <Button
                                leftSection={isLocalGenerating ? <Loader size="sm" /> : <IconSparkles size={16} />}
                                onClick={handleGenerateImage}
                                disabled={!imagePrompt.trim() || isLocalGenerating}
                                loading={isLocalGenerating}
                                fullWidth
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
                        <SimpleGrid cols={2} spacing="sm">
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
                                    <ActionIcon
                                        color="red"
                                        variant="filled"
                                        size="sm"
                                        style={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            zIndex: 10
                                        }}
                                        onClick={(e) => handleDeleteFromProject(img.id, e)}
                                    >
                                        <IconTrash size={14} />
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
                        <SimpleGrid cols={2} spacing="sm">
                            {libraryImages.map((img) => {
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
                                                const index = generatedContent.images.findIndex(
                                                    projectImg => projectImg.url === img.url
                                                );
                                                handleSelectImage(img.url, index);
                                            } else {
                                                // Add from library to current project
                                                handleAddFromLibrary(img);
                                            }
                                        }}
                                    >
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

