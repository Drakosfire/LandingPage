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
  ImageConfig
} from './types';

export { GenerationType, ErrorCode } from './types';

// Main Component (will be implemented in Phase 2)
export { GenerationDrawerEngine } from './GenerationDrawerEngine';

// Components (will be exported as they're implemented)
export * from './components';

// Hooks (will be exported as they're implemented)
export * from './hooks';

