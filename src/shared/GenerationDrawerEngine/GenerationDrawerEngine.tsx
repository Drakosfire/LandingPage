/**
 * Generation Drawer Engine - Main Component
 * 
 * Orchestrates drawer shell, tabs, input slot, and state management.
 * This is the main entry point for services to use the generation drawer.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Stack, Tabs } from '@mantine/core';
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
    transformInput,
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
          simulatedDurationMs: tutorialConfig.simulatedDurationMs || 7000
        }
        : undefined
    },
    isTutorialMode
  );

  // Setup image library hook - always call to satisfy React hooks rules
  const imageLibrary = useImageLibrary({
    libraryEndpoint: imageConfig?.libraryEndpoint || '/api/images/library',
    uploadEndpoint: imageConfig?.uploadEndpoint || '/api/images/upload',
    deleteEndpoint: imageConfig?.deleteEndpoint || imageConfig?.libraryEndpoint || '/api/images/delete',
    sessionId: imageConfig?.sessionId,
    service: config.id
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
        const output = await generation.generate(inputValue);

        // Clear start time on completion
        generationStartTimeRef.current = null;

        // Handle image generation results
        if (imageConfig && activeGenerationType === GenerationType.IMAGE) {
          // Extract images from output (services should provide images in response)
          // For now, we rely on onImageGenerated callback from services
          // This will be called by services after processing the API response
        }

        onGenerationComplete?.(output);
      } catch (err) {
        // Clear start time on error
        generationStartTimeRef.current = null;
        // Error is already set in generation hook
        onGenerationError?.(generation.error!);
      }
    },
    [generation, onGenerationStart, onGenerationComplete, onGenerationError, imageConfig, activeGenerationType]
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

  // Handle file upload
  const handleFileUpload = useCallback(async (files: File[]) => {
    if (!imageLibrary) return;

    for (const file of files) {
      const uploadedImage = await imageLibrary.uploadFile(file);
      if (uploadedImage) {
        // Add to generated images (project gallery)
        const generatedImage: GeneratedImage = {
          id: uploadedImage.id,
          url: uploadedImage.url,
          prompt: uploadedImage.prompt,
          createdAt: uploadedImage.createdAt || new Date().toISOString(),
          sessionId: uploadedImage.sessionId || '',
          service: uploadedImage.service || config.id
        };
        setGeneratedImages((prev) => [...prev, generatedImage]);
        // Notify service
        imageConfig?.onImageGenerated?.([generatedImage]);
      }
    }
  }, [imageLibrary, imageConfig]);

  // Handle upload error
  const handleUploadError = useCallback((error: string) => {
    console.error('❌ [GenerationDrawer] Upload error:', error);
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

                {/* Image Gallery (for image generation tabs) */}
                {tab.generationType === GenerationType.IMAGE && generatedImages.length > 0 && (
                  <ProjectGallery
                    images={generatedImages}
                    selectedImageId={selectedImageId}
                    onImageClick={handleImageClick}
                    onImageSelect={handleImageSelect}
                  />
                )}

                {/* Upload Tab */}
                {tab.id === 'upload' && imageLibrary && (
                  <AuthGate isTutorialMode={isTutorialMode}>
                    <UploadZone
                      onUpload={handleFileUpload}
                      onError={handleUploadError}
                      isUploading={imageLibrary.isLoading}
                    />
                  </AuthGate>
                )}

                {/* Library Tab */}
                {tab.id === 'library' && imageLibrary && (
                  <AuthGate isTutorialMode={isTutorialMode}>
                    <LibraryBrowser
                      images={imageLibrary.images}
                      onAddToProject={handleAddFromLibrary}
                      onDelete={handleImageDelete}
                      isLoading={imageLibrary.isLoading}
                      currentPage={imageLibrary.currentPage}
                      totalPages={imageLibrary.totalPages}
                      onPageChange={imageLibrary.changePage}
                    />
                  </AuthGate>
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
