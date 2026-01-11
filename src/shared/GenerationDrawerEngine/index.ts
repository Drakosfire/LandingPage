/**
 * Generation Drawer Engine - Public Exports
 * 
 * This module exports all public types, components, and utilities
 * for the Generation Drawer Engine.
 */

// Types and Enums
export type {
  GenerationDrawerConfig,
  GenerationDrawerEngineProps,
  TabConfig,
  ProgressConfig,
  Milestone,
  ExampleConfig,
  TutorialConfig,
  GeneratedImage,
  GenerationError,
  ValidationResult,
  InputSlotProps,
  OutputSlotProps,
  ImageConfig,
  // Dynamic image capabilities types
  ImageGenerationModel,
  ImageGenerationStyle,
  // API response contracts (for typed backend communication)
  ApiGeneratedImage,
  ApiImageGenerationInfo,
  ApiImageGenerationResponse,
  // Mode selector types
  ModeSelectorConfig,
  ModeOption,
  ModeGalleryConfig,
  MaskImage
} from './types';

export { GenerationType, ErrorCode, normalizeApiImage } from './types';

// Image generation options (from GenerationPanel)
export type { ImageGenerationOptions } from './components/GenerationPanel';

// Main Component
export { GenerationDrawerEngine } from './GenerationDrawerEngine';

// Factory Pattern
export { createServiceDrawer } from './factory';
export type { ServiceDrawerFactoryConfig, ServiceDrawerProps } from './factory';

// Components
export * from './components';

// Hooks
export * from './hooks';

