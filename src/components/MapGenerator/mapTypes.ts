/**
 * Map Generator Types and Constants
 * 
 * Shared types and constants used across MapGenerator components.
 * Extracted to break circular dependencies.
 */

// =============================================================================
// Default Texture Constants
// =============================================================================

/**
 * Default papyrus texture URL (Cloudflare CDN)
 * Used as the base image for new projects before generation
 */
export const DEFAULT_PAPYRUS_TEXTURE_URL = 
  'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/bbce8d22-822b-479a-ca08-8640fd220600/Full';

/**
 * Check if a URL is the default papyrus texture
 * @param url - The URL to check
 * @returns true if the URL matches the default papyrus texture
 */
export function isDefaultTexture(url: string | null | undefined): boolean {
  if (!url) return false;
  return url === DEFAULT_PAPYRUS_TEXTURE_URL;
}

// =============================================================================
// Style Options
// =============================================================================

export interface MapStyleOptions {
  // Primary (always visible)
  fantasyLevel: 'low' | 'medium' | 'high';
  rendering: 'hand-painted' | 'digital' | 'sketch' | 'pixel-art';
  tone: 'gritty' | 'neutral' | 'whimsical';
  
  // Layout
  scale: 'encounter' | 'small_area' | 'district';
  movementSpace: 'open' | 'mixed' | 'tight';
  coverDensity: 'light' | 'medium' | 'heavy';
  
  // Palette
  saturation: 'muted' | 'balanced' | 'vibrant';
  contrast: 'low' | 'medium' | 'high';
  temperature: 'cool' | 'neutral' | 'warm';
  
  // Advanced (collapsed)
  pathways: 'radial' | 'organic' | 'linear' | 'gridless';
  elevationPresent: boolean;
  textureDensity: 'low' | 'medium';
}

export const DEFAULT_STYLE_OPTIONS: MapStyleOptions = {
  fantasyLevel: 'low',
  rendering: 'hand-painted',
  tone: 'neutral',
  scale: 'encounter',
  movementSpace: 'open',
  coverDensity: 'medium',
  saturation: 'muted',
  contrast: 'high',
  temperature: 'neutral',
  pathways: 'organic',
  elevationPresent: false,
  textureDensity: 'medium',
};

export interface MapGenerationInput {
  /** Description of the battle map to generate */
  prompt: string;
  /** Style toggles for prompt tuning */
  styleOptions: MapStyleOptions;
  /** Optional mask data for masked generation (base64-encoded PNG) */
  maskData?: string | null;
  /** Optional base image for masked generation (base64-encoded PNG) */
  baseImageData?: string | null;
}

export interface MapGenerationOutput {
  /** URL to generated map in Cloudflare R2 */
  imageUrl: string;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** Structured MapSpec (for debugging) */
  mapspec?: any;
  /** Compiled image prompt (for debugging) */
  compiledPrompt?: string;
}

/**
 * Rendering style descriptions for UI
 */
export const renderingStyleDescriptions: Record<MapStyleOptions['rendering'], string> = {
  'hand-painted': 'Classic hand-painted fantasy battle map style, optimized for tabletop readability',
  'digital': 'Clean digital rendering with precise details and sharp edges',
  'sketch': 'Pencil sketch style with artistic linework',
  'pixel-art': 'Retro pixel art style with chunky tiles',
};

/**
 * Mask configuration for masked generation
 */
export interface MaskConfig {
  /** Whether mask mode is active */
  enabled: boolean;
  /** Current brush size (5-100px) */
  brushSize: number;
  /** Current tool */
  tool: 'brush' | 'eraser' | 'rect' | 'circle';
  /** Base64-encoded mask data (null if no mask drawn) */
  maskData: string | null;
}

/**
 * Default mask configuration
 */
export const DEFAULT_MASK_CONFIG: MaskConfig = {
  enabled: false,
  brushSize: 30,
  tool: 'brush',
  maskData: null,
};

/**
 * Generated image stored with a project
 * Matches backend ProjectGeneratedImage model
 */
export interface ProjectGeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
  sessionId: string;
  service: string;
}
