/**
 * MapGenerationDrawer.tsx - Factory-based generation drawer
 * 
 * Uses the createServiceDrawer factory pattern for automatic context wiring.
 */

import React from 'react';
import { useMapGenerator, type MapGeneratorContextValue } from './MapGeneratorProvider';

// Factory imports
import { createServiceDrawer } from '../../shared/GenerationDrawerEngine/factory';
import MapInputForm from './MapInputForm';
import { mapEngineConfig } from './mapEngineConfig';
import type { MapGenerationInput, MapGenerationOutput } from './mapTypes';

// =============================================================================
// FACTORY-BASED DRAWER
// =============================================================================

/**
 * Factory-created Map generation drawer.
 * 
 * Benefits:
 * - Automatic `isGenerating` state sync
 * - Declarative configuration
 * - Type-safe context wiring
 */
const FactoryMapGenerationDrawer = createServiceDrawer<
  MapGenerationInput,
  MapGenerationOutput,
  MapGeneratorContextValue
>({
  serviceId: 'map',
  displayName: 'Generate Battle Map',
  InputForm: MapInputForm,
  engineConfig: mapEngineConfig,

  // === Context Wiring ===
  useContext: useMapGenerator,
  getIsGeneratingSetter: (ctx) => {
    // MapGeneratorProvider doesn't have setIsGenerating yet
    // For now, we'll use a no-op function
    // TODO: Add setIsGenerating to MapGeneratorProvider if needed
    return () => { };
  },

  // === Output Handling ===
  handleOutput: (ctx, output, input) => {
    console.log('🎉 [MapGenerator] Generation output received:', output);
    ctx.handleGenerationComplete({
      imageUrl: output.imageUrl,
      compiledPrompt: output.compiledPrompt,
      mapspec: output.mapspec,
      input: input ? {
        prompt: input.prompt,
        styleOptions: input.styleOptions,
      } : undefined,
    });
  },

  // === Image Handling ===
  getSessionId: (ctx) => ctx.projectId || 'map-session',
  getImagePrompt: (ctx) => '', // Maps don't have separate image prompts

  getInitialImages: (ctx): never[] => {
    // Maps don't have an image gallery yet
    return [];
  },

  handleImagesGenerated: (ctx, images) => {
    // For maps, image generation is handled via handleOutput
    // This is for the image tab's "Add from Library" feature
    if (images.length > 0) {
      ctx.handleGenerationComplete({
        imageUrl: images[0].url,
      });
    }
  },

  handleImageSelected: (ctx, url, index) => {
    console.log('🖼️ [MapGenerator] Image selected:', url);
    ctx.setBaseImageUrl(url);
  },

  // === Tutorial Mode ===
  tutorialConfig: {
    isTutorialMode: (_ctx, props) => props.isTutorialMode ?? false,
    mockAuthState: true,
    simulatedDurationMs: 7000
  }
});

// =============================================================================
// PROPS INTERFACE
// =============================================================================

interface MapGenerationDrawerProps {
  opened: boolean;
  onClose: () => void;
  initialTab?: 'image' | 'upload' | 'library';
  isTutorialMode?: boolean;
  onGenerationComplete?: () => void;
}

// =============================================================================
// EXPORTED COMPONENT
// =============================================================================

/**
 * MapGenerationDrawer - Factory-based generation drawer
 * 
 * Uses the GenerationDrawerEngine with automatic context wiring.
 */
const MapGenerationDrawer: React.FC<MapGenerationDrawerProps> = ({
  opened,
  onClose,
  initialTab,
  isTutorialMode = false,
  onGenerationComplete
}) => {
  return (
    <FactoryMapGenerationDrawer
      opened={opened}
      onClose={onClose}
      initialTab={initialTab}
      isTutorialMode={isTutorialMode}
      onGenerationComplete={onGenerationComplete}
    />
  );
};

export default MapGenerationDrawer;
