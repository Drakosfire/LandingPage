/**
 * Generation Drawer Engine - Main Component
 * 
 * Orchestrates drawer shell, tabs, input slot, and state management.
 * This is the main entry point for services to use the generation drawer.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Stack, Tabs, Text, Divider, Paper } from '@mantine/core';
import type { GenerationDrawerEngineProps } from './types';
import { DrawerShell } from './components/DrawerShell';
import { TabsContainer } from './components/TabsContainer';
import { GenerationPanel } from './components/GenerationPanel';
import { ProjectGallery } from './components/ProjectGallery';
import { ImageModal } from './components/ImageModal';
import { UploadZone } from './components/UploadZone';
import { LibraryBrowser } from './components/LibraryBrowser';
import { AuthGate } from './components/AuthGate';
import { ExamplesBar } from './components/ExamplesBar';
import { useGeneration } from './hooks/useGeneration';
import { useImageLibrary } from './hooks/useImageLibrary';
import { GenerationType, type GeneratedImage } from './types';

/**
 * Main orchestrating component for the generation drawer engine.
 * 
 * @typeParam TInput - The input type for the service
 * @typeParam TOutput - The output type for the service
 */
export function GenerationDrawerEngine<TInput, TOutput>(
  props: GenerationDrawerEngineProps<TInput, TOutput>
) {
  const { 
    config, 
    opened, 
    onClose,
    isTutorialMode: propsTutorialMode,
    initialImages,
    onGenerationComplete: propsOnGenerationComplete
  } = props;
  const {
    tabs,
    defaultTab,
    InputSlot,
    initialInput,
    tutorialConfig,
    validateInput,
    generationEndpoint,
    imageGenerationEndpoint,
    transformInput,
    imageTransformInput,
    transformOutput,
    onGenerationStart,
    onGenerationComplete: configOnGenerationComplete,
    onGenerationError,
    progressConfig,
    imageConfig,
    examples,
    resetOnClose = false,
    isTutorialMode: configTutorialMode
  } = config;

  // State management
  const [activeTab, setActiveTab] = useState<string>(
    defaultTab || tabs[0]?.id || ''
  );
  
  // Per-tab input state - each tab has its own independent input
  const [inputsByTab, setInputsByTab] = useState<Record<string, TInput>>(() => {
    const initial: Record<string, TInput> = {};
    tabs.forEach((tab) => {
      initial[tab.id] = initialInput;
    });
    return initial;
  });
  
  // Get current tab's input
  const input = inputsByTab[activeTab] || initialInput;
  
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string> | undefined
  >(undefined);

  // Image gallery state (for image generation tabs)
  // Initialize with initialImages or tutorialConfig mock images if in tutorial mode
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>(() => {
    if (initialImages && initialImages.length > 0) {
      return initialImages;
    }
    if (tutorialConfig?.mockImages && tutorialConfig.mockImages.length > 0) {
      return tutorialConfig.mockImages;
    }
    return [];
  });
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  // Recent uploads for feedback display
  const [recentUploads, setRecentUploads] = useState<Array<{
    id: string;
    name: string;
    url?: string;
    status: 'pending' | 'success' | 'error';
    error?: string;
  }>>([]);

  // Generation start time for progress persistence across drawer close/reopen
  // Stored at engine level so ProgressPanel can resume from correct position
  const generationStartTimeRef = useRef<number | null>(null);

  // Determine if in tutorial mode (props takes precedence over config)
  const isTutorialMode = propsTutorialMode ?? configTutorialMode ?? Boolean(tutorialConfig);
  
  // Combined onGenerationComplete - calls both props and config callbacks
  const onGenerationComplete = useCallback((output: TOutput) => {
    propsOnGenerationComplete?.(output);
    configOnGenerationComplete?.(output);
  }, [propsOnGenerationComplete, configOnGenerationComplete]);

  // Setup generation hook
  // Note: Tutorial mode mock data should be provided via onGenerationComplete callback
  // For now, tutorial mode will use simulated delay but services should handle mock data
  const generation = useGeneration<TInput, TOutput>(
    {
      generationEndpoint,
      transformInput,
      transformOutput,
      timeout: 150000, // 150 seconds
      tutorialConfig: tutorialConfig
        ? {
          mockData: tutorialConfig.mockData as TOutput | undefined,
          simulatedDurationMs: tutorialConfig.simulatedDurationMs || 7000,
          simulateGeneration: tutorialConfig.simulateGeneration
        }
        : undefined
    },
    isTutorialMode
  );

  // Setup image library hook - always call to satisfy React hooks rules
  // Only disable if simulating (simulateGeneration !== false means simulate)
  const shouldSimulateLibrary = isTutorialMode && tutorialConfig?.simulateGeneration !== false;
  const imageLibrary = useImageLibrary({
    libraryEndpoint: imageConfig?.libraryEndpoint || '/api/images/library',
    uploadEndpoint: imageConfig?.uploadEndpoint || '/api/images/upload',
    deleteEndpoint: imageConfig?.deleteEndpoint || imageConfig?.libraryEndpoint || '/api/images/delete',
    sessionId: imageConfig?.sessionId,
    service: config.id,
    disabled: shouldSimulateLibrary
  });

  // Track previous opened state for close detection
  const wasOpenedRef = React.useRef(opened);
  
  // Ref for tabs container to auto-focus on open
  const tabsListRef = useRef<HTMLDivElement>(null);

  // Handle drawer close - reset state if configured
  useEffect(() => {
    const wasOpened = wasOpenedRef.current;
    wasOpenedRef.current = opened;

    // Drawer just closed
    if (wasOpened && !opened) {
      // Always clear errors and progress when closing
      generation.clearError();

      if (resetOnClose) {
        // Reset all tab inputs to initial values
        const resetInputs: Record<string, TInput> = {};
        tabs.forEach((tab) => {
          resetInputs[tab.id] = initialInput;
        });
        setInputsByTab(resetInputs);
        setValidationErrors(undefined);
        // Reset tab to default
        if (defaultTab) {
          setActiveTab(defaultTab);
        }
        // Reset generated images
        setGeneratedImages([]);
        setSelectedImageId(null);
      }
    }
  }, [opened, resetOnClose, initialInput, defaultTab, generation, tabs]);

  // Auto-focus tabs when drawer opens for keyboard navigation
  useEffect(() => {
    if (opened && tabsListRef.current) {
      // Delay focus to ensure drawer animation has started
      const timer = setTimeout(() => {
        // Focus the first tab button for keyboard navigation
        const firstTab = tabsListRef.current?.querySelector('[role="tab"]') as HTMLElement;
        if (firstTab) {
          firstTab.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [opened]);

  // Find active tab config (needed for generation type check)
  const activeTabConfig = tabs.find((tab) => tab.id === activeTab);
  const activeGenerationType = activeTabConfig?.generationType;

  // Handle input changes from InputSlot - updates current tab's input only
  const handleInputChange = useCallback(
    (value: Partial<TInput>) => {
      setInputsByTab((prev) => ({
        ...prev,
        [activeTab]: { ...prev[activeTab], ...value }
      }));
      // Clear validation errors when input changes
      if (validationErrors) {
        setValidationErrors(undefined);
      }
    },
    [activeTab, validationErrors]
  );

  // Handle example selection - populates the current tab's input
  const handleExampleSelect = useCallback(
    (exampleInput: TInput) => {
      setInputsByTab((prev) => ({
        ...prev,
        [activeTab]: exampleInput
      }));
      // Clear validation errors when example selected
      setValidationErrors(undefined);
      console.log('📋 [Examples] Selected:', exampleInput);
    },
    [activeTab]
  );

  // Handle generation
  const handleGenerate = useCallback(
    async (inputValue: TInput) => {
      // Record start time for progress persistence
      generationStartTimeRef.current = Date.now();
      
      onGenerationStart?.();

      try {
        // Use image endpoint and transform for image generation
        const isImageGeneration = activeGenerationType === GenerationType.IMAGE;
        const endpointOverride = isImageGeneration && imageGenerationEndpoint
          ? imageGenerationEndpoint
          : undefined;
        const transformOverride = isImageGeneration && imageTransformInput
          ? imageTransformInput
          : undefined;
        // Skip transformOutput for image generation - we need raw response to extract images
        const skipTransform = isImageGeneration;
        
        const output = await generation.generate(inputValue, { endpointOverride, transformOverride, skipTransform });

        // Clear start time on completion
        generationStartTimeRef.current = null;

        // Handle image generation results
        if (activeGenerationType === GenerationType.IMAGE) {
          // In tutorial mode, simulate adding generated images
          if (isTutorialMode) {
            const inputObj = inputValue as Record<string, unknown>;
            const description = typeof inputObj === 'object' && inputObj 
              ? (inputObj.description as string || 'Generated image')
              : 'Generated image';
            
            const mockImage: GeneratedImage = {
              id: `gen-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              url: `https://placehold.co/512x512/${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}/ffffff?text=${encodeURIComponent(description.substring(0, 15))}`,
              prompt: description,
              createdAt: new Date().toISOString(),
              sessionId: imageConfig?.sessionId || 'demo-session',
              service: config.id
            };
            
            // Add to project gallery
            setGeneratedImages((prev) => [...prev, mockImage]);
            // Add to library as well
            imageLibrary.addImages([mockImage]);
            imageConfig?.onImageGenerated?.([mockImage]);
            console.log('📸 [Tutorial] Mock image generated and added to library:', mockImage);
          } else {
            // In live mode, extract images from API response
            // API returns: { success: true, data: { images: [...] } }
            const outputObj = output as Record<string, unknown>;
            
            // Try common response patterns:
            // 1. { data: { images: [...] } } - DungeonMind pattern
            // 2. { images: [...] } - direct pattern
            let rawImages: GeneratedImage[] | undefined;
            
            if (outputObj?.data && typeof outputObj.data === 'object') {
              const dataObj = outputObj.data as Record<string, unknown>;
              if (Array.isArray(dataObj.images)) {
                rawImages = dataObj.images as GeneratedImage[];
                console.log('📸 [Live] Found images in data.images:', rawImages.length);
              }
            } else if (Array.isArray(outputObj?.images)) {
              rawImages = outputObj.images as GeneratedImage[];
              console.log('📸 [Live] Found images in images:', rawImages.length);
            }
            
            if (rawImages && rawImages.length > 0) {
              const newImages = rawImages.map((img) => ({
                ...img,
                // Backend returns created_at, normalize to createdAt
                createdAt: img.createdAt || (img as Record<string, unknown>).created_at as string || new Date().toISOString(),
                sessionId: img.sessionId || imageConfig?.sessionId || '',
                service: img.service || config.id
              }));
              // Add to project gallery
              setGeneratedImages((prev) => [...prev, ...newImages]);
              // Add to library as well
              imageLibrary.addImages(newImages);
              imageConfig?.onImageGenerated?.(newImages);
              console.log('📸 [Live] Images added to gallery and library:', newImages);
            } else {
              console.warn('📸 [Live] No images found in response:', outputObj);
            }
          }
        }

        onGenerationComplete?.(output);
      } catch (err) {
        // Clear start time on error
        generationStartTimeRef.current = null;
        // Error is already set in generation hook
        onGenerationError?.(generation.error!);
      }
    },
    [generation, onGenerationStart, onGenerationComplete, onGenerationError, imageConfig, activeGenerationType, isTutorialMode, config.id, imageGenerationEndpoint]
  );

  // Handle image gallery interactions
  // Handle image click in gallery (opens modal)
  const handleImageClick = useCallback((image: GeneratedImage | { id: string; url: string; prompt: string; createdAt?: string; sessionId?: string; service?: string }, index: number) => {
    setModalIndex(index);
    setModalOpened(true);
  }, []);

  // Handle image selection in gallery
  const handleImageSelect = useCallback((image: GeneratedImage | { id: string; url: string; prompt: string; createdAt?: string; sessionId?: string; service?: string }, index: number) => {
    imageConfig?.onImageSelected?.(image.url, index);
    setSelectedImageId(image.id || null);
    setModalOpened(false);
  }, [imageConfig]);

  // Handle image selection from modal (url-based signature for ImageModal)
  const handleModalSelect = useCallback((url: string, index: number) => {
    imageConfig?.onImageSelected?.(url, index);
    setSelectedImageId(generatedImages[index]?.id || null);
    setModalOpened(false);
  }, [imageConfig, generatedImages]);

  const handleImageDelete = useCallback((imageId: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== imageId));
    if (selectedImageId === imageId) {
      setSelectedImageId(null);
    }
    // Also delete from library if hook is available
    if (imageLibrary) {
      imageLibrary.deleteImage(imageId).catch((err) => {
        console.error('❌ [GenerationDrawer] Failed to delete from library:', err);
      });
    }
  }, [selectedImageId, imageLibrary]);

  // Handle file upload with feedback
  const handleFileUpload = useCallback(async (files: File[]) => {
    for (const file of files) {
      const uploadId = `upload-${Date.now()}-${file.name}`;
      
      // Add pending upload to recent uploads for feedback
      setRecentUploads((prev) => [
        {
          id: uploadId,
          name: file.name,
          status: 'pending'
        },
        ...prev.slice(0, 5) // Keep last 5 uploads
      ]);

      try {
        let uploadedImage: GeneratedImage | null = null;

        if (isTutorialMode || !imageLibrary) {
          // Simulate upload in tutorial mode
          await new Promise(resolve => setTimeout(resolve, 1000));
          const objectUrl = URL.createObjectURL(file);
          uploadedImage = {
            id: uploadId,
            url: objectUrl,
            prompt: file.name,
            createdAt: new Date().toISOString(),
            sessionId: 'tutorial-session',
            service: config.id
          };
        } else {
          // Real upload via library hook
          const result = await imageLibrary.uploadFile(file);
          if (result) {
            uploadedImage = {
              id: result.id,
              url: result.url,
              prompt: result.prompt,
              createdAt: result.createdAt || new Date().toISOString(),
              sessionId: result.sessionId || '',
              service: result.service || config.id
            };
          }
        }

        if (uploadedImage) {
          // Update recent uploads with success
          setRecentUploads((prev) =>
            prev.map((u) =>
              u.id === uploadId
                ? { ...u, status: 'success' as const, url: uploadedImage!.url }
                : u
            )
          );

          // Add to generated images (project gallery)
          setGeneratedImages((prev) => [...prev, uploadedImage!]);
          
          // Add to library as well
          imageLibrary?.addImages([uploadedImage!]);
          
          // Notify service
          imageConfig?.onImageGenerated?.([uploadedImage]);
          
          console.log('✅ [GenerationDrawer] Upload success:', uploadedImage.url);
        } else {
          throw new Error('Upload failed - no image returned');
        }
      } catch (err) {
        // Update recent uploads with error
        setRecentUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId
              ? {
                  ...u,
                  status: 'error' as const,
                  error: err instanceof Error ? err.message : 'Upload failed'
                }
              : u
          )
        );
        console.error('❌ [GenerationDrawer] Upload error:', err);
      }
    }
  }, [imageLibrary, imageConfig, isTutorialMode, config.id]);

  // Clear a recent upload from the list
  const handleClearUpload = useCallback((uploadId: string) => {
    setRecentUploads((prev) => prev.filter((u) => u.id !== uploadId));
  }, []);

  // Handle upload error
  const handleUploadError = useCallback((error: string) => {
    console.error('❌ [GenerationDrawer] Upload validation error:', error);
    // Could show toast notification here
  }, []);

  // Handle add from library to project
  const handleAddFromLibrary = useCallback((image: any) => {
    const generatedImage: GeneratedImage = {
      id: image.id,
      url: image.url,
      prompt: image.prompt,
      createdAt: image.createdAt,
      sessionId: image.sessionId,
      service: image.service
    };
    setGeneratedImages((prev) => [...prev, generatedImage]);
    // Notify service
    imageConfig?.onImageGenerated?.([generatedImage]);
  }, [imageConfig]);

  const handleModalNavigate = useCallback((newIndex: number) => {
    setModalIndex(newIndex);
  }, []);

  // Update generated images when imageConfig callback is triggered
  // Services should call onImageGenerated with the generated images
  useEffect(() => {
    if (imageConfig?.onImageGenerated) {
      // Store the callback so services can call it
      // This is a workaround - in practice, services will call this after generation
      // For now, we'll handle it via the config callback
    }
  }, [imageConfig]);

  // Handle retry
  const handleRetry = useCallback(() => {
    generation.clearError();
    handleGenerate(input);
  }, [generation, handleGenerate, input]);

  // Get progress config for active generation type
  const currentProgressConfig =
    activeGenerationType && progressConfig
      ? progressConfig[activeGenerationType]
      : undefined;

  return (
    <DrawerShell opened={opened} onClose={onClose} title={config.title}>
      <Stack gap="md" h="100%">
        <Tabs value={activeTab} onChange={(val) => setActiveTab(val || '')}>
          <TabsContainer ref={tabsListRef} tabs={tabs} isGenerating={generation.isGenerating} />

          {tabs.map((tab) => (
            <Tabs.Panel
              key={tab.id}
              value={tab.id}
              pt="md"
              data-tutorial={`${tab.id}-panel`}
            >
              <Stack gap="md">
                {/* Examples Bar (if examples provided) */}
                {examples && examples.length > 0 && (
                  <ExamplesBar
                    examples={examples}
                    onSelect={handleExampleSelect}
                    isGenerating={generation.isGenerating}
                  />
                )}

                {/* Input Slot */}
                <InputSlot
                  value={input}
                  onChange={handleInputChange}
                  isGenerating={generation.isGenerating}
                  isTutorialMode={isTutorialMode}
                  errors={validationErrors}
                />

                {/* Generation Panel (only for generation tabs) */}
                {tab.generationType && (
                  <GenerationPanel
                    input={input}
                    validateInput={validateInput}
                    onGenerate={handleGenerate}
                    isGenerating={generation.isGenerating}
                    error={generation.error}
                    onRetry={handleRetry}
                    progressConfig={currentProgressConfig}
                    generationType={tab.generationType}
                    persistedStartTime={generationStartTimeRef.current}
                  />
                )}

                {/* Image Gallery (for image generation tabs - always show, with empty state) */}
                {tab.generationType === GenerationType.IMAGE && (
                  <>
                    <Divider label="Project Gallery" labelPosition="center" />
                    {generatedImages.length > 0 ? (
                      <ProjectGallery
                        images={generatedImages}
                        selectedImageId={selectedImageId}
                        onImageClick={handleImageClick}
                        onImageSelect={handleImageSelect}
                      />
                    ) : (
                      <Paper p="xl" withBorder style={{ textAlign: 'center' }}>
                        <Stack gap="xs" align="center">
                          <Text c="dimmed" size="sm">No images yet</Text>
                          <Text c="dimmed" size="xs">Generate or upload images to see them here</Text>
                        </Stack>
                      </Paper>
                    )}
                  </>
                )}

                {/* Upload Tab */}
                {tab.id === 'upload' && (
                  <AuthGate isTutorialMode={isTutorialMode}>
                    <UploadZone
                      onUpload={handleFileUpload}
                      onError={handleUploadError}
                      isUploading={imageLibrary?.isLoading || false}
                      recentUploads={recentUploads}
                      onClearUpload={handleClearUpload}
                    />
                  </AuthGate>
                )}

                {/* Library Tab */}
                {tab.id === 'library' && (
                  <AuthGate isTutorialMode={isTutorialMode}>
                    {isTutorialMode ? (
                      // In tutorial mode, show project gallery as the "library"
                      <ProjectGallery
                        images={generatedImages}
                        selectedImageId={selectedImageId}
                        onImageClick={handleImageClick}
                        onImageSelect={handleImageSelect}
                      />
                    ) : imageLibrary ? (
                      <LibraryBrowser
                        images={imageLibrary.images}
                        onAddToProject={handleAddFromLibrary}
                        onDelete={handleImageDelete}
                        isLoading={imageLibrary.isLoading}
                        currentPage={imageLibrary.currentPage}
                        totalPages={imageLibrary.totalPages}
                        onPageChange={imageLibrary.changePage}
                      />
                    ) : null}
                  </AuthGate>
                )}

                {/* Show Project Gallery below upload zone when there are images */}
                {tab.id === 'upload' && generatedImages.length > 0 && (
                  <Stack gap="md" mt="md">
                    <Text size="sm" fw={500}>Uploaded Images</Text>
                    <ProjectGallery
                      images={generatedImages}
                      selectedImageId={selectedImageId}
                      onImageClick={handleImageClick}
                      onImageSelect={handleImageSelect}
                    />
                  </Stack>
                )}
              </Stack>
            </Tabs.Panel>
          ))}
        </Tabs>

        {/* Image Modal (shared across all tabs) */}
        {imageConfig && (
          <ImageModal
            opened={modalOpened}
            images={generatedImages}
            currentIndex={modalIndex}
            onClose={() => setModalOpened(false)}
            onSelect={handleModalSelect}
            onDelete={handleImageDelete}
            onNavigate={handleModalNavigate}
          />
        )}
      </Stack>
    </DrawerShell>
  );
}
