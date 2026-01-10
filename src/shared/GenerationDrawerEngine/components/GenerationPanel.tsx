/**
 * GenerationPanel - Generation trigger and state management
 * 
 * Handles Generate button, input validation, progress display, error handling,
 * and optional model/style/numImages selectors for image generation.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button, Stack, Select, Group, Text, Tooltip } from '@mantine/core';
import { IconWand, IconInfoCircle } from '@tabler/icons-react';
import { ProgressPanel } from './ProgressPanel';
import { ErrorDisplay } from './ErrorDisplay';
import type { 
  ValidationResult, 
  ProgressConfig, 
  GenerationType,
  ImageGenerationModel,
  ImageGenerationStyle
} from '../types';
import { GenerationType as GenType } from '../types';

/**
 * Image generation options selected by the user.
 */
export interface ImageGenerationOptions {
  /** Selected model ID */
  model?: string;
  /** Selected style ID */
  style?: string;
  /** Number of images to generate */
  numImages?: number;
}

export interface GenerationPanelProps<TInput> {
  /** Current input value */
  input: TInput;
  /** Input validation function */
  validateInput?: (input: TInput) => ValidationResult;
  /** Generate callback */
  onGenerate: (input: TInput) => Promise<void>;
  /** Whether generation is in progress */
  isGenerating: boolean;
  /** Current error (if any) */
  error: any;
  /** Retry callback */
  onRetry?: () => void;
  /** Progress configuration */
  progressConfig?: ProgressConfig;
  /** Generation type (for progress config lookup) */
  generationType?: GenerationType;
  /** Persisted start time for progress continuity across remounts */
  persistedStartTime?: number | null;
  
  // === Image Generation Options (only for IMAGE type) ===
  
  /** Available models (enables model selector if provided) */
  models?: ImageGenerationModel[];
  /** Default model ID */
  defaultModel?: string;
  /** Available styles (enables style selector if provided) */
  styles?: ImageGenerationStyle[];
  /** Default style ID */
  defaultStyle?: string;
  /** Maximum images per generation (enables numImages selector if > 1) */
  maxImages?: number;
  /** Default number of images */
  defaultNumImages?: number;
  /** Initial image options (loaded from persistence) */
  initialImageOptions?: ImageGenerationOptions;
  /** Callback when image options change */
  onImageOptionsChange?: (options: ImageGenerationOptions) => void;
}

/**
 * Find the default option from a list based on default:true or defaultId or first item.
 */
function getDefaultOption<T extends { id: string; default?: boolean }>(
  options: T[] | undefined,
  defaultId: string | undefined
): string | undefined {
  if (!options || options.length === 0) return undefined;
  
  // Priority: defaultId prop > option with default:true > first option
  if (defaultId && options.some(o => o.id === defaultId)) {
    return defaultId;
  }
  const defaultOption = options.find(o => o.default);
  if (defaultOption) return defaultOption.id;
  return options[0].id;
}

/**
 * GenerationPanel component for triggering and managing generation
 */
export function GenerationPanel<TInput>({
  input,
  validateInput,
  onGenerate,
  isGenerating,
  error,
  onRetry,
  progressConfig,
  generationType,
  persistedStartTime,
  // Image generation options
  models,
  defaultModel,
  styles,
  defaultStyle,
  maxImages,
  defaultNumImages,
  initialImageOptions,
  onImageOptionsChange
}: GenerationPanelProps<TInput>) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string> | undefined>();
  const progressOnCompleteRef = useRef<(() => void) | null>(null);

  // Image generation options state (only relevant for IMAGE type)
  const isImageGeneration = generationType === GenType.IMAGE;
  
  // Use initial options if provided, otherwise fall back to defaults
  const [selectedModel, setSelectedModel] = useState<string | undefined>(() => 
    initialImageOptions?.model ?? getDefaultOption(models, defaultModel)
  );
  const [selectedStyle, setSelectedStyle] = useState<string | undefined>(() =>
    initialImageOptions?.style ?? getDefaultOption(styles, defaultStyle)
  );
  const [numImages, setNumImages] = useState<number>(() =>
    initialImageOptions?.numImages ?? (defaultNumImages ?? (maxImages && maxImages > 1 ? 4 : 1))
  );

  // Track if we've applied initial options (to avoid re-applying on every change)
  const hasAppliedInitialOptions = useRef(false);

  // Apply persisted options when they become available
  // This handles the async loading case where initialImageOptions arrives after mount
  useEffect(() => {
    if (!initialImageOptions) {
      // Reset the flag when options are cleared (drawer closed)
      hasAppliedInitialOptions.current = false;
      return;
    }
    
    // Only apply once per drawer open
    if (hasAppliedInitialOptions.current) {
      return;
    }
    
    // Wait for models to be available before trying to apply persisted model
    // Otherwise we'd set the flag to true before we could actually apply values
    const modelsReady = models && models.length > 0;
    const stylesReady = styles && styles.length > 0;
    
    if (!modelsReady && !stylesReady) {
      console.log('⏳ [GenerationPanel] Waiting for models/styles to load before applying persisted options');
      return; // Don't set the flag yet - wait for options to be available
    }
    
    let appliedAny = false;
    
    // Apply persisted values if they're valid in current options
    if (initialImageOptions.model && modelsReady && models.some(m => m.id === initialImageOptions.model)) {
      setSelectedModel(initialImageOptions.model);
      console.log('📦 [GenerationPanel] Applied persisted model:', initialImageOptions.model);
      appliedAny = true;
    }
    if (initialImageOptions.style && stylesReady && styles.some(s => s.id === initialImageOptions.style)) {
      setSelectedStyle(initialImageOptions.style);
      console.log('📦 [GenerationPanel] Applied persisted style:', initialImageOptions.style);
      appliedAny = true;
    }
    if (initialImageOptions.numImages !== undefined) {
      setNumImages(initialImageOptions.numImages);
      console.log('📦 [GenerationPanel] Applied persisted numImages:', initialImageOptions.numImages);
      appliedAny = true;
    }
    
    // Only mark as applied if models/styles are ready (so we don't skip valid options)
    if (modelsReady || stylesReady) {
      hasAppliedInitialOptions.current = true;
      if (appliedAny) {
        console.log('✅ [GenerationPanel] Finished applying persisted options');
      }
    }
  }, [initialImageOptions, models, styles]);

  // Update parent when image options change
  useEffect(() => {
    if (isImageGeneration && onImageOptionsChange) {
      onImageOptionsChange({
        model: selectedModel,
        style: selectedStyle,
        numImages
      });
    }
  }, [isImageGeneration, selectedModel, selectedStyle, numImages, onImageOptionsChange]);

  // Update defaults when models/styles change (e.g., config changes)
  // BUT only if we don't already have a valid selection AND no persisted option to apply
  useEffect(() => {
    // Skip if we have a persisted model waiting to be applied
    if (initialImageOptions?.model && models?.some(m => m.id === initialImageOptions.model)) {
      return;
    }
    // Skip if we already have a valid model selection
    if (selectedModel && models?.some(m => m.id === selectedModel)) {
      return;
    }
    // Reset to default if current selection is invalid
    setSelectedModel(getDefaultOption(models, defaultModel));
  }, [models, defaultModel, selectedModel, initialImageOptions?.model]);
  
  useEffect(() => {
    // Skip if we have a persisted style waiting to be applied
    if (initialImageOptions?.style && styles?.some(s => s.id === initialImageOptions.style)) {
      return;
    }
    // Skip if we already have a valid style selection
    if (selectedStyle && styles?.some(s => s.id === selectedStyle)) {
      return;
    }
    // Reset to default if current selection is invalid
    setSelectedStyle(getDefaultOption(styles, defaultStyle));
  }, [styles, defaultStyle, selectedStyle, initialImageOptions?.style]);

  // Handle generate button click
  const handleGenerate = useCallback(async () => {
    // Clear previous errors
    setValidationErrors(undefined);

    // Validate input if validator provided
    if (validateInput) {
      const validation = validateInput(input);
      if (!validation || !validation.valid) {
        setValidationErrors(validation?.errors);
        return;
      }
    }

    // Trigger generation
    try {
      await onGenerate(input);
      // Call progress onComplete when generation finishes
      if (progressOnCompleteRef.current) {
        progressOnCompleteRef.current();
      }
    } catch (err) {
      // Error is handled by parent via error prop
      console.error('Generation failed:', err);
    }
  }, [input, validateInput, onGenerate]);

  // Get progress config for current generation type
  const currentProgressConfig = generationType && progressConfig
    ? progressConfig
    : progressConfig;

  // Determine if generate button should be enabled
  // If no validator, button is enabled (assume valid)
  // If validator exists, check its result (default to valid if undefined)
  const validationResult = validateInput ? validateInput(input) : { valid: true };
  const isButtonEnabled = !isGenerating && (validationResult?.valid !== false);

  // Prepare select data for models
  const modelSelectData = models?.map(m => ({
    value: m.id,
    label: m.name,
    description: m.description
  })) || [];

  // Prepare select data for styles
  const styleSelectData = styles?.map(s => ({
    value: s.id,
    label: s.name
  })) || [];

  // Determine button text for image generation
  const getButtonText = () => {
    if (isGenerating) return 'Generating...';
    if (isImageGeneration && numImages > 1) {
      return `Generate (${numImages} images)`;
    }
    return 'Generate';
  };

  return (
    <Stack gap="md">
      {/* Error Display */}
      {error && (
        <ErrorDisplay
          error={error}
          onRetry={onRetry}
          onDismiss={() => {
            // Clear error via parent
            if (onRetry) {
              // Retry will clear error
            }
          }}
        />
      )}

      {/* Image Generation Options (only for IMAGE type with capabilities) */}
      {isImageGeneration && (models || styles || (maxImages && maxImages > 1)) && (
        <Stack gap="sm">
          {/* Style Selector */}
          {styles && styles.length > 0 && (
            <Select
              label="Art Style"
              description="Choose a visual style for the image"
              data={styleSelectData}
              value={selectedStyle}
              onChange={(value) => setSelectedStyle(value || undefined)}
              disabled={isGenerating}
              comboboxProps={{ withinPortal: true, zIndex: 500 }}
              data-tutorial="style-selector"
            />
          )}

          {/* Number of Images Selector */}
          {maxImages && maxImages > 1 && (
            <Select
              label="Number of Images"
              description="How many images to generate"
              data={Array.from({ length: maxImages }, (_, i) => ({
                value: String(i + 1),
                label: `${i + 1} image${i + 1 > 1 ? 's' : ''}`
              }))}
              value={String(numImages)}
              onChange={(value) => setNumImages(value ? parseInt(value, 10) : 1)}
              disabled={isGenerating}
              comboboxProps={{ withinPortal: true, zIndex: 500 }}
              data-tutorial="num-images-selector"
            />
          )}

          {/* Model Selector */}
          {models && models.length > 0 && (
            <Select
              label={
                <Group gap={4}>
                  <Text size="sm" fw={500}>AI Model</Text>
                  <Tooltip 
                    label="Different models have different quality, speed, and cost trade-offs"
                    position="right"
                  >
                    <IconInfoCircle size={14} style={{ opacity: 0.6 }} />
                  </Tooltip>
                </Group>
              }
              description="Choose the image generation model"
              data={modelSelectData}
              value={selectedModel}
              onChange={(value) => setSelectedModel(value || undefined)}
              disabled={isGenerating}
              comboboxProps={{ withinPortal: true, zIndex: 500 }}
              data-tutorial="model-selector"
            />
          )}
        </Stack>
      )}

      {/* Progress Panel */}
      {currentProgressConfig && (
        <ProgressPanel
          isGenerating={isGenerating}
          config={currentProgressConfig}
          onCompleteRef={progressOnCompleteRef}
          persistedStartTime={persistedStartTime}
        />
      )}

      {/* Generate Button */}
      <Button
        leftSection={isGenerating ? undefined : <IconWand size={16} />}
        onClick={handleGenerate}
        disabled={!isButtonEnabled}
        loading={isGenerating}
        size="md"
        fullWidth
        style={{ minHeight: 44 }}
        data-tutorial="generate-button"
      >
        {getButtonText()}
      </Button>
    </Stack>
  );
}


