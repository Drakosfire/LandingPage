/**
 * Persistence utilities for Map Generator
 * 
 * Handles localStorage persistence for user preferences:
 * - Generation options (model, style, numImages)
 * - Map input (prompt text, style options)
 * 
 * Note: Generated images are persisted via the backend (Firestore) as part of the project,
 * not in localStorage. See MapGeneratorProvider.tsx for project persistence.
 */

import type { ImageGenerationOptions } from '../../../shared/GenerationDrawerEngine';
import type { MapStyleOptions } from '../mapTypes';

const GENERATION_OPTIONS_KEY = 'mapGenerator:generationOptions';
const MAP_INPUT_KEY = 'mapGenerator:mapInput';

/**
 * Persisted map input state (prompt and style options only - no mask data)
 */
export interface PersistedMapInput {
  prompt: string;
  styleOptions: MapStyleOptions;
}

// =============================================================================
// Generation Options Persistence (model, style, numImages)
// =============================================================================

/**
 * Save generation options to localStorage
 */
export function saveGenerationOptions(options: ImageGenerationOptions): void {
  try {
    const serialized = JSON.stringify(options);
    localStorage.setItem(GENERATION_OPTIONS_KEY, serialized);
    console.log('💾 [Persistence] Saved generation options:', options);
  } catch (err) {
    console.error('❌ [Persistence] Failed to save generation options:', err);
  }
}

/**
 * Load generation options from localStorage
 */
export function loadGenerationOptions(): ImageGenerationOptions | null {
  try {
    const serialized = localStorage.getItem(GENERATION_OPTIONS_KEY);
    if (!serialized) {
      return null;
    }
    const options = JSON.parse(serialized) as ImageGenerationOptions;
    console.log('📦 [Persistence] Loaded generation options:', options);
    return options;
  } catch (err) {
    console.error('❌ [Persistence] Failed to load generation options:', err);
    return null;
  }
}

/**
 * Clear generation options from localStorage
 */
export function clearGenerationOptions(): void {
  try {
    localStorage.removeItem(GENERATION_OPTIONS_KEY);
    console.log('🗑️ [Persistence] Cleared generation options');
  } catch (err) {
    console.error('❌ [Persistence] Failed to clear generation options:', err);
  }
}

// =============================================================================
// Map Input Persistence (prompt text and style options)
// =============================================================================

/**
 * Save map input (prompt and style options) to localStorage
 */
export function saveMapInput(input: PersistedMapInput): void {
  try {
    const serialized = JSON.stringify(input);
    localStorage.setItem(MAP_INPUT_KEY, serialized);
    console.log('💾 [Persistence] Saved map input:', {
      promptLength: input.prompt.length,
      styleOptions: input.styleOptions
    });
  } catch (err) {
    console.error('❌ [Persistence] Failed to save map input:', err);
  }
}

/**
 * Load map input from localStorage
 */
export function loadMapInput(): PersistedMapInput | null {
  try {
    const serialized = localStorage.getItem(MAP_INPUT_KEY);
    if (!serialized) {
      return null;
    }
    const input = JSON.parse(serialized) as PersistedMapInput;
    console.log('📦 [Persistence] Loaded map input:', {
      promptLength: input.prompt?.length || 0,
      hasStyleOptions: !!input.styleOptions
    });
    return input;
  } catch (err) {
    console.error('❌ [Persistence] Failed to load map input:', err);
    return null;
  }
}

/**
 * Clear map input from localStorage
 */
export function clearMapInput(): void {
  try {
    localStorage.removeItem(MAP_INPUT_KEY);
    console.log('🗑️ [Persistence] Cleared map input');
  } catch (err) {
    console.error('❌ [Persistence] Failed to clear map input:', err);
  }
}
