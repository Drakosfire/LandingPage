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
  onImageOptionsChange
}: GenerationPanelProps<TInput>) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string> | undefined>();
  const progressOnCompleteRef = useRef<(() => void) | null>(null);

  // Image generation options state (only relevant for IMAGE type)
  const isImageGeneration = generationType === GenType.IMAGE;
  
  const [selectedModel, setSelectedModel] = useState<string | undefined>(() => 
    getDefaultOption(models, defaultModel)
  );
  const [selectedStyle, setSelectedStyle] = useState<string | undefined>(() =>
    getDefaultOption(styles, defaultStyle)
  );
  const [numImages, setNumImages] = useState<number>(
    defaultNumImages ?? (maxImages && maxImages > 1 ? 4 : 1)
  );

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
  useEffect(() => {
    setSelectedModel(getDefaultOption(models, defaultModel));
  }, [models, defaultModel]);
  
  useEffect(() => {
    setSelectedStyle(getDefaultOption(styles, defaultStyle));
  }, [styles, defaultStyle]);

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


