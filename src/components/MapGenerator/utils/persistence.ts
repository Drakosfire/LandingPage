/**
 * Persistence utilities for Map Generator
 * 
 * Handles localStorage persistence for user preferences (generation options)
 */

import type { ImageGenerationOptions } from '../../../shared/GenerationDrawerEngine';

const STORAGE_KEY = 'mapGenerator:generationOptions';

/**
 * Save generation options to localStorage
 */
export function saveGenerationOptions(options: ImageGenerationOptions): void {
  try {
    const serialized = JSON.stringify(options);
    localStorage.setItem(STORAGE_KEY, serialized);
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
    const serialized = localStorage.getItem(STORAGE_KEY);
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
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ [Persistence] Cleared generation options');
  } catch (err) {
    console.error('❌ [Persistence] Failed to clear generation options:', err);
  }
}
