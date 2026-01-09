/**
 * Map Engine Configuration for GenerationDrawerEngine
 * 
 * Configures the AI generation drawer for map creation.
 * Uses two-stage prompt compilation:
 * 1. User prompt + style options → MapSpec (structured JSON)
 * 2. MapSpec → Optimized image prompt
 * 3. Image prompt → GPT Image 1.5 via Fal.ai
 */

import type { GenerationDrawerConfig, TabConfig } from '../../shared/GenerationDrawerEngine/types';
import { GenerationType } from '../../shared/GenerationDrawerEngine/types';
import MapInputForm from './MapInputForm';
import type { MapGenerationInput, MapGenerationOutput, MapStyleOptions } from './mapTypes';
import { DEFAULT_STYLE_OPTIONS } from './mapTypes';

/**
 * Configuration for the Map Generator's GenerationDrawerEngine.
 * Enables AI map generation with style selection.
 */
export const mapEngineConfig: GenerationDrawerConfig<MapGenerationInput, MapGenerationOutput> = {
  id: 'map',
  title: 'Generate Battle Map',
  
  // Input form component
  InputSlot: MapInputForm,
  initialInput: {
    prompt: '',
    styleOptions: DEFAULT_STYLE_OPTIONS,
  },
  
  // Validate map input
  validateInput: (input: MapGenerationInput) => {
    if (!input.prompt || input.prompt.trim().length < 10) {
      return {
        valid: false,
        errors: { prompt: 'Map description must be at least 10 characters' }
      };
    }
    return { valid: true };
  },
  
  // API endpoints - dynamically select based on mask data (T207)
  generationEndpoint: (input: MapGenerationInput) => {
    // Use masked endpoint if mask data is present
    if (input.maskData && input.baseImageData) {
      return '/api/mapgenerator/generate-masked';
    }
    return '/api/mapgenerator/generate';
  },
  imageGenerationEndpoint: (input: MapGenerationInput) => {
    // Use masked endpoint if mask data is present
    if (input.maskData && input.baseImageData) {
      return '/api/mapgenerator/generate-masked';
    }
    return '/api/mapgenerator/generate';
  },
  
  // Transform functions
  transformInput: (input: MapGenerationInput) => {
    // Convert styleOptions to backend format (camelCase to snake_case)
    const styleOptions = {
      fantasy_level: input.styleOptions.fantasyLevel,
      rendering: input.styleOptions.rendering,
      tone: input.styleOptions.tone,
      scale: input.styleOptions.scale,
      movement_space: input.styleOptions.movementSpace,
      cover_density: input.styleOptions.coverDensity,
      saturation: input.styleOptions.saturation,
      contrast: input.styleOptions.contrast,
      temperature: input.styleOptions.temperature,
      pathways: input.styleOptions.pathways,
      elevation_present: input.styleOptions.elevationPresent,
      texture_density: input.styleOptions.textureDensity,
    };

    const basePayload: any = {
      prompt: input.prompt,  // Backend handles prompt compilation
      style_options: styleOptions,
    };

    // Add mask data if present (T206)
    // Normalize to data URI format as safety measure
    if (input.maskData && input.baseImageData) {
      // Normalize mask to data URI format
      const normalizeMask = (data: string): string => {
        if (data.startsWith('data:image/')) return data;
        return `data:image/png;base64,${data}`;
      };

      // Normalize base image to data URI format
      const normalizeBaseImage = (data: string): string => {
        if (data.startsWith('data:image/')) return data;
        return `data:image/png;base64,${data}`;
      };

      basePayload.mask_base64 = normalizeMask(input.maskData);
      basePayload.base_image_base64 = normalizeBaseImage(input.baseImageData);
    }

    return basePayload;
  },
  
  // Override image transform to use masked endpoint when mask data is present (T207)
  imageTransformInput: (input: MapGenerationInput) => {
    const baseTransform = mapEngineConfig.transformInput(input);
    // The endpoint selection happens in the factory based on mask data presence
    return baseTransform;
  },
  
  transformOutput: (response: any): MapGenerationOutput => ({
    imageUrl: response.imageUrl || response.image_url,
    width: response.width || 1024,
    height: response.height || 1024,
    mapspec: response.mapspec,
    compiledPrompt: response.compiledPrompt || response.compiled_prompt,
  }),
  
  // Examples for quick-fill (inspired by The Migrating Forest battle map prompts)
  examples: [
    { 
      name: 'Forest Entrance', 
      input: { 
        prompt: 'The first step into a migrating forest at the moment of transition, where settled ground loosens into rising roots and layered undergrowth, paths curving immediately upon entry. Subtle motion through patterns rather than animation, such as gently offset root lines, drifting leaf clusters, and ground that appears recently re-settled.',
        styleOptions: { ...DEFAULT_STYLE_OPTIONS, tone: 'neutral', movementSpace: 'mixed', coverDensity: 'medium' } 
      } 
    },
    { 
      name: 'Canopy Paths', 
      input: { 
        prompt: 'Maintained canopy paths within a living forest, with interwoven tree trunks, elevated root bridges, and naturally placed fallen limbs forming steps and crossings. Paths curve organically and subtly correct movement, while side areas thicken into tangled undergrowth and vertical drops implied by dense shadow.',
        styleOptions: { ...DEFAULT_STYLE_OPTIONS, movementSpace: 'open', pathways: 'organic', coverDensity: 'light' } 
      } 
    },
    { 
      name: 'Fallen Tree Chokepoint', 
      input: { 
        prompt: 'A massive fallen tree forming a natural chokepoint, with tight composition. The split trunk creates a hollowed corridor with rib-like interior walls, while tangled roots rise at the edges, restricting movement and sightlines. Smaller trees and dense growth press inward, creating layered obstacles and ambush-friendly terrain.',
        styleOptions: { ...DEFAULT_STYLE_OPTIONS, scale: 'encounter', movementSpace: 'tight', coverDensity: 'heavy' } 
      } 
    },
    { 
      name: 'Storm-Scarred Clearing', 
      input: { 
        prompt: 'A storm-scarred section of forest where magical weather has fractured the canopy. Shattered treetops, splintered trunks, and irregular clearings formed by past impacts, with glassy, fused wood textures and shallow glowing pools embedded into the terrain. Walkable areas remain readable but broken into uneven zones.',
        styleOptions: { ...DEFAULT_STYLE_OPTIONS, fantasyLevel: 'medium', temperature: 'cool', coverDensity: 'medium' } 
      } 
    },
    { 
      name: 'Moss Memory Ring', 
      input: { 
        prompt: 'A circular forest clearing carpeted in thick moss, with trees forming a loose ring around the clearing. Footprints and depressions appear faintly in the moss, partially smoothed over, suggesting repeated but impermanent use. The space feels inviting but exposed, with minimal hard cover.',
        styleOptions: { ...DEFAULT_STYLE_OPTIONS, temperature: 'warm', movementSpace: 'open', coverDensity: 'light' } 
      } 
    },
    { 
      name: 'Pale Watcher Tree', 
      input: { 
        prompt: 'A single pale-leaved tree standing apart from surrounding growth. The ground beneath the tree is bare and smooth, with no undergrowth, while surrounding forest presses close but does not intrude. Light appears even and shadowless within the tree\'s canopy. Symmetrical spacing and unusually clean silhouettes.',
        styleOptions: { ...DEFAULT_STYLE_OPTIONS, saturation: 'muted', tone: 'neutral', coverDensity: 'light' } 
      } 
    },
    { 
      name: 'Root Bridge Crossing', 
      input: { 
        prompt: 'A wet root lattice crossing with thick, exposed roots forming natural bridges over shallow, slow-moving water. Multiple crossing paths with clear distinctions between safe footing, slick surfaces, and submerged hazards. Water transparency reveals depth changes and obscured movement below.',
        styleOptions: { ...DEFAULT_STYLE_OPTIONS, movementSpace: 'mixed', pathways: 'organic', temperature: 'cool' } 
      } 
    },
    { 
      name: 'Quiet Canopy', 
      input: { 
        prompt: 'An unnaturally calm section of forest canopy. Vegetation is intact but sparse, with fewer insects, minimal debris, and unusually clear sightlines. The forest feels paused rather than abandoned. Broad open areas broken by occasional trunks and low roots.',
        styleOptions: { ...DEFAULT_STYLE_OPTIONS, movementSpace: 'open', coverDensity: 'light', textureDensity: 'low' } 
      } 
    },
  ],
  
  // Image-only mode (no text generation for maps)
  tabs: [
    { id: 'image', label: 'Generate', generationType: GenerationType.IMAGE },
    { id: 'upload', label: 'Upload', contentType: 'upload' },
    { id: 'library', label: 'Library', contentType: 'library' },
  ] as TabConfig[],
  defaultTab: 'image',
  
  // Enable custom input form for IMAGE tabs (MapInputForm with style toggles)
  useInputSlotForImage: true,
  
  // Image configuration (includes upload settings)
  imageConfig: {
    promptField: 'imageUrl' as keyof MapGenerationOutput,
    uploadEndpoint: '/api/images/upload',
    libraryEndpoint: '/api/images/library',
    deleteEndpoint: '/api/images/delete',
    maxUploadSize: 10 * 1024 * 1024, // 10MB in bytes
    acceptedUploadTypes: ['image/png', 'image/jpeg', 'image/webp'],
    allowMultipleUploads: false,
  },
};

export default mapEngineConfig;
