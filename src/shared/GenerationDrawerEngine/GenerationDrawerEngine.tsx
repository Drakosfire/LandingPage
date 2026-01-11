/**
 * Generation Drawer Engine - Main Component
 * 
 * Orchestrates drawer shell, tabs, input slot, and state management.
 * This is the main entry point for services to use the generation drawer.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Stack, Tabs, Text, Divider, Paper, Textarea } from '@mantine/core';
import type { GenerationDrawerEngineProps } from './types';
import { DrawerShell } from './components/DrawerShell';
import { TabsContainer } from './components/TabsContainer';
import { GenerationPanel, type ImageGenerationOptions } from './components/GenerationPanel';
import { ProjectGallery } from './components/ProjectGallery';
import { ImageModal } from './components/ImageModal';
import { UploadZone } from './components/UploadZone';
import { LibraryBrowser } from './components/LibraryBrowser';
import { AuthGate } from './components/AuthGate';
import { ExamplesBar } from './components/ExamplesBar';
import { useGeneration } from './hooks/useGeneration';
import { useImageLibrary } from './hooks/useImageLibrary';
import { useImageCapabilities } from './hooks/useImageCapabilities';
import {
  GenerationType,
  type GeneratedImage,
  type ImageGenerationStyle,
  type ApiImageGenerationResponse,
  type ApiGeneratedImage,
  type GenerationError,
  ErrorCode,
  normalizeApiImage
} from './types';

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
    onGenerationComplete: propsOnGenerationComplete,
    onGeneratingChange,
    imageTabPrompt
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
    isTutorialMode: configTutorialMode,
    useInputSlotForImage = false
  } = config;

  // Fetch image capabilities from backend if not provided in config
  // This provides the shared model/style list for all services
  const hasImageTab = tabs.some(tab => tab.generationType === GenerationType.IMAGE);
  const needsCapabilities = hasImageTab && (!imageConfig?.models || imageConfig.models.length === 0);

  const { capabilities } = useImageCapabilities({
    skip: !needsCapabilities || propsTutorialMode
  });

  // Merge fetched capabilities with any config overrides
  const resolvedImageConfig = imageConfig ? {
    ...imageConfig,
    models: imageConfig.models?.length ? imageConfig.models : capabilities.models,
    styles: imageConfig.styles?.length ? imageConfig.styles : capabilities.styles,
    maxImages: imageConfig.maxImages ?? capabilities.maxImages,
    defaultNumImages: imageConfig.defaultNumImages ?? capabilities.defaultNumImages
  } : undefined;

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

  // Determine if in tutorial mode (props takes precedence over config)
  const isTutorialMode = propsTutorialMode ?? configTutorialMode ?? Boolean(tutorialConfig);

  // Prefer provider/project images (initialImages) as the source of truth for the Project Gallery
  // when available, so the gallery doesn't go blank when a project has images.
  const projectGalleryImages = useMemo<GeneratedImage[]>(() => {
    if (isTutorialMode) {
      return generatedImages;
    }
    if (initialImages && initialImages.length > 0) {
      return initialImages;
    }
    return generatedImages;
  }, [isTutorialMode, initialImages, generatedImages]);

  // Track previous initialImages to detect project switches
  const prevInitialImagesRef = useRef<GeneratedImage[] | undefined>(undefined);

  // Keep the local gallery in sync with provider/project images.
  // When project changes (initialImages array identity changes), REPLACE local state.
  // When images are added to the same project, MERGE them in.
  useEffect(() => {
    if (!opened) return;
    if (isTutorialMode) return;

    const prevImages = prevInitialImagesRef.current;
    prevInitialImagesRef.current = initialImages;

    // Detect project switch: initialImages array reference changed AND content differs
    const isProjectSwitch = prevImages !== undefined && initialImages !== prevImages;
    
    if (isProjectSwitch) {
      // Project switched - replace local state entirely with new project's images
      const newImages = initialImages || [];
      console.log('🔄 [Engine] Project switched - resetting gallery:', { count: newImages.length });
      setGeneratedImages(newImages);
      setSelectedImageId(null);
      return;
    }

    // Same project - merge any missing images
    if (!initialImages || initialImages.length === 0) return;

    setGeneratedImages((prev) => {
      if (prev.length === 0) {
        return initialImages;
      }

      const missing = initialImages.filter(
        (img) => !prev.some((p) => p.id === img.id || p.url === img.url)
      );

      if (missing.length === 0) {
        return prev;
      }

      console.log('🔄 [Engine] Syncing gallery from project state:', { added: missing.length });
      return [...prev, ...missing];
    });
  }, [opened, initialImages, isTutorialMode]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  // Track whether modal is showing library images or project gallery images
  const [modalSource, setModalSource] = useState<'project' | 'library'>('project');

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

  // Image generation options selected by user (model, style, numImages)
  const imageOptionsRef = useRef<ImageGenerationOptions>({});
  const [persistedImageOptions, setPersistedImageOptions] = useState<ImageGenerationOptions | undefined>(undefined);

  // Load persisted options for map service on drawer open
  useEffect(() => {
    if (opened && config.id === 'map') {
      // Dynamic import to avoid circular dependency
      import('../../components/MapGenerator/utils/persistence').then(({ loadGenerationOptions, loadMapInput }) => {
        // Load generation options (model, style, numImages)
        const savedOptions = loadGenerationOptions();
        if (savedOptions) {
          imageOptionsRef.current = savedOptions;
          setPersistedImageOptions(savedOptions);
          console.log('📦 [Engine] Restored generation options from localStorage:', savedOptions);
        }

        // Load map input (prompt, styleOptions)
        const savedMapInput = loadMapInput();
        if (savedMapInput) {
          // Find the image tab for map generation
          const imageTab = tabs.find(tab => tab.generationType === GenerationType.IMAGE);
          if (imageTab) {
            setInputsByTab(prev => ({
              ...prev,
              [imageTab.id]: {
                ...prev[imageTab.id],
                prompt: savedMapInput.prompt || (prev[imageTab.id] as { prompt?: string })?.prompt || '',
                styleOptions: savedMapInput.styleOptions || (prev[imageTab.id] as { styleOptions?: unknown })?.styleOptions,
              } as TInput
            }));
            console.log('📦 [Engine] Restored map input from localStorage:', {
              promptLength: savedMapInput.prompt?.length || 0,
              hasStyleOptions: !!savedMapInput.styleOptions
            });
          }
        }

        // Note: Generated images are now loaded from the project via getInitialImages,
        // not from localStorage. This ensures proper backend persistence.
      }).catch((err) => {
        console.warn('⚠️ [Engine] Failed to load persisted options:', err);
      });
    } else {
      // Clear persisted options when drawer closes or for non-map services
      setPersistedImageOptions(undefined);
    }
  }, [opened, config.id, tabs]);

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

  // Sync generation state to parent (for context state management)
  useEffect(() => {
    onGeneratingChange?.(generation.isGenerating);
  }, [generation.isGenerating, onGeneratingChange]);

  // Track previous imageTabPrompt to detect changes (for auto-switch)
  const prevImageTabPromptRef = React.useRef<string>('');

  // Sync imageTabPrompt to image tab's input (populates prompt after text generation)
  // Also auto-switch to image tab when prompt changes (indicating text generation completed)
  useEffect(() => {
    if (imageTabPrompt) {
      // Find the image tab (generationType === IMAGE)
      const imageTab = tabs.find(tab => tab.generationType === GenerationType.IMAGE);
      if (imageTab) {
        setInputsByTab(prev => ({
          ...prev,
          [imageTab.id]: {
            ...prev[imageTab.id],
            // Update description field which is used as the prompt
            description: imageTabPrompt
          } as TInput
        }));
        console.log('📝 [Engine] Synced image prompt to image tab:', imageTabPrompt.substring(0, 50) + '...');

        // Auto-switch to image tab if the prompt changed (text generation just completed)
        // Only switch if we were on the text tab (not already on image/upload/library)
        if (prevImageTabPromptRef.current !== imageTabPrompt) {
          const textTab = tabs.find(tab => tab.generationType === GenerationType.TEXT);
          if (textTab && activeTab === textTab.id) {
            console.log('🔄 [Engine] Auto-switching to image tab after text generation');
            setActiveTab(imageTab.id);
          }
        }
      }
    }
    prevImageTabPromptRef.current = imageTabPrompt || '';
  }, [imageTabPrompt, tabs, activeTab]);

  // Setup image library hook - always call to satisfy React hooks rules
  // Only disable if simulating (simulateGeneration !== false means simulate)
  const shouldSimulateLibrary = isTutorialMode && tutorialConfig?.simulateGeneration !== false;
  const imageLibrary = useImageLibrary({
    libraryEndpoint: resolvedImageConfig?.libraryEndpoint || '/api/images/library',
    uploadEndpoint: resolvedImageConfig?.uploadEndpoint || '/api/images/upload',
    deleteEndpoint: resolvedImageConfig?.deleteEndpoint || resolvedImageConfig?.libraryEndpoint || '/api/images/delete',
    sessionId: resolvedImageConfig?.sessionId,
    service: config.id,
    disabled: shouldSimulateLibrary,
    // Pass through callback to sync external state when images are deleted from library
    onImageDeleted: resolvedImageConfig?.onImageDeleted
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
      // Always clear errors, progress, and close modal when closing
      generation.clearError();
      setModalOpened(false); // Close any open modal when drawer closes

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

  // Callback for GenerationPanel to report image option changes
  const handleImageOptionsChange = useCallback((options: ImageGenerationOptions) => {
    imageOptionsRef.current = options;

    // Persist options for map service
    if (config.id === 'map') {
      // Dynamic import to avoid circular dependency
      import('../../components/MapGenerator/utils/persistence').then(({ saveGenerationOptions }) => {
        saveGenerationOptions(options);
      }).catch((err) => {
        console.warn('⚠️ [Engine] Failed to save generation options:', err);
      });
    }
  }, [config.id]);

  // Build style suffix from selected style
  const getStyleSuffix = useCallback((styleId: string | undefined): string => {
    if (!styleId || !resolvedImageConfig?.styles) return '';
    const style = resolvedImageConfig.styles.find((s: ImageGenerationStyle) => s.id === styleId);
    return style?.suffix || '';
  }, [resolvedImageConfig?.styles]);

  // Handle generation
  const handleGenerate = useCallback(
    async (inputValue: TInput) => {
      // Record start time for progress persistence
      generationStartTimeRef.current = Date.now();

      onGenerationStart?.(inputValue);

      try {
        // Use image endpoint and transform for image generation
        const isImageGeneration = activeGenerationType === GenerationType.IMAGE;
        // Resolve imageGenerationEndpoint (string or function) - pass function through to useGeneration
        const endpointOverride = isImageGeneration && imageGenerationEndpoint
          ? imageGenerationEndpoint  // Can be string or function - useGeneration will handle it
          : undefined;

        // For image generation, create a wrapper transform that includes selected options
        let transformOverride = isImageGeneration && imageTransformInput
          ? imageTransformInput
          : undefined;

        if (isImageGeneration && transformOverride) {
          const originalTransform = transformOverride;
          const imageOptions = imageOptionsRef.current;
          const styleSuffix = getStyleSuffix(imageOptions.style);

          transformOverride = (input: TInput) => {
            const baseResult = originalTransform(input);

            // Merge in the selected image options
            const mergedResult: Record<string, unknown> = { ...baseResult };

            // Add model if selected
            if (imageOptions.model) {
              mergedResult.model = imageOptions.model;
            }

            // Add num_images if selected and > 1
            if (imageOptions.numImages && imageOptions.numImages > 0) {
              mergedResult.num_images = imageOptions.numImages;
            }

            // Apply style suffix to prompt if style is selected
            // Handle both "prompt" (generic endpoint) and "sd_prompt" (legacy/demo)
            if (styleSuffix) {
              if (mergedResult.prompt) {
                mergedResult.prompt = `${mergedResult.prompt}, ${styleSuffix}`;
              } else if (mergedResult.sd_prompt) {
                mergedResult.sd_prompt = `${mergedResult.sd_prompt}, ${styleSuffix}`;
              }
            }

            console.log('📸 [GenerationDrawer] Image generation request:', {
              model: mergedResult.model,
              num_images: mergedResult.num_images,
              style: imageOptions.style,
              hasStyleSuffix: !!styleSuffix
            });

            return mergedResult;
          };
        }

        // Skip transformOutput for image generation - we need raw response to extract images
        const skipTransform = isImageGeneration;

        // Cast transformOverride to match the expected signature
        const output = await generation.generate(inputValue, {
          endpointOverride,
          transformOverride: transformOverride as ((input: unknown) => Record<string, unknown>) | undefined,
          skipTransform
        });

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
              url: `https://placehold.co/512x512/${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}/ffffff?text=${encodeURIComponent(description.substring(0, 15))}`,
              prompt: description,
              createdAt: new Date().toISOString(),
              sessionId: resolvedImageConfig?.sessionId || 'demo-session',
              service: config.id
            };

            // Add to project gallery
            setGeneratedImages((prev) => [...prev, mockImage]);
            // Add to library as well
            imageLibrary.addImages([mockImage]);
            resolvedImageConfig?.onImageGenerated?.([mockImage]);
            console.log('📸 [Tutorial] Mock image generated and added to library:', mockImage);
          } else {
            // In live mode, extract images from typed API response
            // Contract: ApiImageGenerationResponse from types.ts
            const apiResponse = output as ApiImageGenerationResponse;

            if (apiResponse?.success && apiResponse?.data?.images) {
              const apiImages: ApiGeneratedImage[] = apiResponse.data.images;
              console.log('📸 [Live] Received', apiImages.length, 'images from API');

              // Normalize backend format (snake_case) to frontend format (camelCase)
              const newImages: GeneratedImage[] = apiImages.map((apiImg) =>
                normalizeApiImage(
                  apiImg,
                  resolvedImageConfig?.sessionId || '',
                  config.id
                )
              );

              // Add to project gallery
              setGeneratedImages((prev) => [...prev, ...newImages]);
              // Add to library as well
              imageLibrary.addImages(newImages);
              resolvedImageConfig?.onImageGenerated?.(newImages);
              console.log('📸 [Live] Images normalized and added to gallery:', newImages.length);
            } else {
              // Fallback: Check if response has imageUrl field (e.g., Map Generator format)
              const responseObj = output as Record<string, unknown>;
              const imageUrl = responseObj?.imageUrl as string || responseObj?.image_url as string;

              if (imageUrl) {
                console.log('📸 [Live] Found imageUrl in response, creating gallery image');
                const inputObj = inputValue as Record<string, unknown>;
                const prompt = (inputObj?.prompt as string) || (inputObj?.description as string) || 'Generated image';

                const newImage: GeneratedImage = {
                  id: `gen-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                  url: imageUrl,
                  prompt: prompt,
                  createdAt: new Date().toISOString(),
                  sessionId: resolvedImageConfig?.sessionId || '',
                  service: config.id
                };

                // Add to project gallery
                setGeneratedImages((prev) => [...prev, newImage]);
                // Add to library as well
                imageLibrary.addImages([newImage]);
                resolvedImageConfig?.onImageGenerated?.([newImage]);
                console.log('📸 [Live] Image added to gallery from imageUrl:', newImage.url.substring(0, 50));
              } else {
                console.warn('📸 [Live] Invalid API response format - no images array or imageUrl:', apiResponse);
              }
            }
          }
        }

        onGenerationComplete?.(output);
      } catch (err) {
        // Clear start time on error
        generationStartTimeRef.current = null;
        // Pass the error from generation hook (may be set) or create one from the exception
        const errorToReport: GenerationError = generation.error || {
          code: ErrorCode.UNKNOWN,
          title: 'Generation Failed',
          message: err instanceof Error ? err.message : 'An unexpected error occurred',
          retryable: true
        };
        onGenerationError?.(errorToReport);
      }
    },
    [generation, onGenerationStart, onGenerationComplete, onGenerationError, imageConfig, activeGenerationType, isTutorialMode, config.id, imageGenerationEndpoint, imageTransformInput, getStyleSuffix, imageLibrary]
  );

  // Handle image gallery interactions
  // Handle image click in project gallery (opens modal)
  const handleImageClick = useCallback((image: GeneratedImage | { id: string; url: string; prompt: string; createdAt?: string; sessionId?: string; service?: string }, index: number) => {
    setModalSource('project');
    setModalIndex(index);
    setModalOpened(true);
  }, []);

  // Handle image click in library (opens modal with library images)
  const handleLibraryImageClick = useCallback((image: { id: string; url: string; prompt?: string }, index: number) => {
    console.log('📚 [Engine] Library image clicked:', { index, imageId: image.id });
    setModalSource('library');
    setModalIndex(index);
    setModalOpened(true);
  }, []);

  // Handle add from library to project
  const handleAddFromLibrary = useCallback((image: any) => {
    console.log('📚 [Engine] handleAddFromLibrary called with:', {
      imageId: image.id,
      imageUrl: image.url?.substring(0, 50) + '...',
      hasOnImageGenerated: !!resolvedImageConfig?.onImageGenerated
    });

    const generatedImage: GeneratedImage = {
      id: image.id,
      url: image.url,
      prompt: image.prompt,
      createdAt: image.createdAt,
      sessionId: image.sessionId || resolvedImageConfig?.sessionId || '',
      service: image.service || config.id
    };

    // Add to local drawer gallery
    setGeneratedImages((prev) => {
      const isDuplicate = prev.some(img => img.id === generatedImage.id || img.url === generatedImage.url);
      if (isDuplicate) {
        console.log('⚠️ [Engine] Image already in drawer gallery, skipping');
        return prev;
      }
      console.log('✅ [Engine] Adding image to drawer gallery');
      return [...prev, generatedImage];
    });

    // Notify service (provider) to add to project state
    if (resolvedImageConfig?.onImageGenerated) {
      console.log('📤 [Engine] Calling onImageGenerated to sync with provider');
      resolvedImageConfig.onImageGenerated([generatedImage]);
    } else {
      console.warn('⚠️ [Engine] No onImageGenerated callback - image not saved to project!');
    }
  }, [resolvedImageConfig, config.id]);

  // Handle image selection in gallery
  const handleImageSelect = useCallback((image: GeneratedImage | { id: string; url: string; prompt: string; createdAt?: string; sessionId?: string; service?: string }, index: number) => {
    resolvedImageConfig?.onImageSelected?.(image.url, index);
    setSelectedImageId(image.id || null);
    setModalOpened(false);
  }, [imageConfig]);

  // Handle image selection from modal (url-based signature for ImageModal)
  // Behavior differs based on modal source:
  // - Project gallery: select image for use in canvas
  // - Library: add image to project AND select it
  const handleModalSelect = useCallback((url: string, index: number) => {
    const images = modalSource === 'library' ? imageLibrary?.images : projectGalleryImages;
    const currentImage = images?.[index];

    console.log('🖼️ [Engine] handleModalSelect called:', {
      source: modalSource,
      url: url?.substring(0, 50) + '...',
      index,
      hasOnImageSelected: !!resolvedImageConfig?.onImageSelected
    });

    if (modalSource === 'library' && currentImage) {
      // Library source: Add to project first, then select
      console.log('📚 [Engine] Adding library image to project:', currentImage.id);
      handleAddFromLibrary(currentImage);
    }

    // Select the image
    if (resolvedImageConfig?.onImageSelected) {
      resolvedImageConfig.onImageSelected(url, index);
      console.log('✅ [Engine] onImageSelected callback invoked');
    } else {
      console.warn('⚠️ [Engine] No onImageSelected callback configured!');
    }

    setSelectedImageId(currentImage?.id || null);
    setModalOpened(false);
  }, [modalSource, resolvedImageConfig, projectGalleryImages, imageLibrary?.images, handleAddFromLibrary]);

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
          resolvedImageConfig?.onImageGenerated?.([uploadedImage]);

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

  const handleModalNavigate = useCallback((newIndex: number) => {
    setModalIndex(newIndex);
  }, []);

  // Update generated images when imageConfig callback is triggered
  // Services should call onImageGenerated with the generated images
  useEffect(() => {
    if (resolvedImageConfig?.onImageGenerated) {
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
                {/* Examples Bar - show for TEXT generation only here (IMAGE with useInputSlotForImage is inside AuthGate) */}
                {examples && examples.length > 0 && tab.generationType === GenerationType.TEXT && (
                  <ExamplesBar
                    examples={examples}
                    onSelect={handleExampleSelect}
                    isGenerating={generation.isGenerating}
                  />
                )}

                {/* Input Slot - show for TEXT generation only here (IMAGE with useInputSlotForImage is inside AuthGate) */}
                {tab.generationType === GenerationType.TEXT && (
                  <InputSlot
                    value={input}
                    onChange={handleInputChange}
                    isGenerating={generation.isGenerating}
                    isTutorialMode={isTutorialMode}
                    errors={validationErrors}
                  />
                )}

                {/* Generation Panel for TEXT generation (no auth required) */}
                {tab.generationType === GenerationType.TEXT && (
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
                    initialImageOptions={persistedImageOptions}
                    onImageOptionsChange={handleImageOptionsChange}
                  />
                )}

                {/* IMAGE generation - all content auth gated in single wrapper */}
                {tab.generationType === GenerationType.IMAGE && (
                  <AuthGate
                    isTutorialMode={isTutorialMode}
                    message="Login required to generate AI images."
                  >
                    <Stack gap="md">
                      {/* Project Gallery at TOP (when galleryPosition === 'top') */}
                      {resolvedImageConfig?.galleryPosition === 'top' && (
                        <>
                          <Divider label="Project Gallery" labelPosition="center" />
                          {projectGalleryImages.length > 0 ? (
                            <ProjectGallery
                              images={projectGalleryImages}
                              selectedImageId={selectedImageId}
                              onImageClick={handleImageClick}
                              onImageSelect={handleImageSelect}
                            />
                          ) : (
                            <Paper p="md" withBorder style={{ textAlign: 'center' }}>
                              <Stack gap="xs" align="center">
                                <Text c="dimmed" size="sm">No images yet</Text>
                                <Text c="dimmed" size="xs">Generate or upload images to see them here</Text>
                              </Stack>
                            </Paper>
                          )}
                        </>
                      )}

                      {/* Examples Bar for IMAGE tabs with useInputSlotForImage (inside AuthGate) */}
                      {examples && examples.length > 0 && useInputSlotForImage && (
                        <ExamplesBar
                          examples={examples}
                          onSelect={handleExampleSelect}
                          isGenerating={generation.isGenerating}
                        />
                      )}

                      {/* Custom InputSlot for IMAGE tabs with useInputSlotForImage (inside AuthGate) */}
                      {useInputSlotForImage && (
                        <InputSlot
                          value={input}
                          onChange={handleInputChange}
                          isGenerating={generation.isGenerating}
                          isTutorialMode={isTutorialMode}
                          errors={validationErrors}
                        />
                      )}

                      {/* Default Textarea - only show when NOT using custom InputSlot */}
                      {!useInputSlotForImage && (
                        <Textarea
                          label="Image Prompt"
                          description="Describe the image you want to generate"
                          placeholder="Enter a description for image generation..."
                          value={(input as Record<string, unknown>)?.description as string || ''}
                          onChange={(e) => handleInputChange({ description: e.target.value } as unknown as Partial<TInput>)}
                          disabled={generation.isGenerating}
                          minRows={3}
                          maxRows={6}
                          autosize
                          data-tutorial="image-prompt-input"
                        />
                      )}
                      <GenerationPanel
                        input={input}
                        validateInput={useInputSlotForImage && validateInput
                          ? validateInput
                          : (inp) => {
                            // Default validation for image generation - check description/prompt field
                            const prompt = (inp as Record<string, unknown>)?.description as string ||
                              (inp as Record<string, unknown>)?.prompt as string || '';
                            if (!prompt || prompt.trim().length < 5) {
                              return {
                                valid: false,
                                errors: { prompt: 'Prompt must be at least 5 characters' }
                              };
                            }
                            return { valid: true };
                          }}
                        onGenerate={handleGenerate}
                        isGenerating={generation.isGenerating}
                        error={generation.error}
                        onRetry={handleRetry}
                        progressConfig={currentProgressConfig}
                        generationType={tab.generationType}
                        persistedStartTime={generationStartTimeRef.current}
                        models={resolvedImageConfig?.models}
                        defaultModel={resolvedImageConfig?.defaultModel}
                        styles={resolvedImageConfig?.styles}
                        defaultStyle={resolvedImageConfig?.defaultStyle}
                        maxImages={resolvedImageConfig?.maxImages}
                        defaultNumImages={resolvedImageConfig?.defaultNumImages}
                        initialImageOptions={persistedImageOptions}
                        onImageOptionsChange={handleImageOptionsChange}
                      />
                    </Stack>
                  </AuthGate>
                )}

                {/* Image Gallery at BOTTOM (default, when galleryPosition !== 'top') */}
                {tab.generationType === GenerationType.IMAGE && resolvedImageConfig?.galleryPosition !== 'top' && (
                  <>
                    <Divider label="Project Gallery" labelPosition="center" />
                    {projectGalleryImages.length > 0 ? (
                      <ProjectGallery
                        images={projectGalleryImages}
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
                      maxSize={resolvedImageConfig?.maxUploadSize || 10 * 1024 * 1024} // Default 10MB
                      acceptedTypes={resolvedImageConfig?.acceptedUploadTypes || ['image/png', 'image/jpeg', 'image/webp']}
                      multiple={resolvedImageConfig?.allowMultipleUploads || false}
                    />
                  </AuthGate>
                )}

                {/* Library Tab */}
                {tab.id === 'library' && (
                  <AuthGate isTutorialMode={isTutorialMode}>
                    {isTutorialMode ? (
                      // In tutorial mode, show project gallery as the "library"
                      <ProjectGallery
                        images={projectGalleryImages}
                        selectedImageId={selectedImageId}
                        onImageClick={handleImageClick}
                        onImageSelect={handleImageSelect}
                      />
                    ) : imageLibrary ? (
                      <LibraryBrowser
                        images={imageLibrary.images}
                        onImageClick={handleLibraryImageClick}
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
                {tab.id === 'upload' && projectGalleryImages.length > 0 && (
                  <Stack gap="md" mt="md">
                    <Text size="sm" fw={500}>Uploaded Images</Text>
                    <ProjectGallery
                      images={projectGalleryImages}
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

        {/* Image Modal (shared across all tabs - shows project or library images based on source) */}
        {imageConfig && (
          <ImageModal
            opened={modalOpened}
            images={modalSource === 'library' ? (imageLibrary?.images || []) : projectGalleryImages}
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
