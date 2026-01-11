/**
 * MapGenerationDrawer.tsx - Factory-based generation drawer
 * 
 * Uses the createServiceDrawer factory pattern for automatic context wiring.
 */

import React from 'react';
import { IconWand, IconMask, IconEdit } from '@tabler/icons-react';
import { useMapGenerator, type MapGeneratorContextValue } from './MapGeneratorProvider';

// Factory imports
import { createServiceDrawer } from '../../shared/GenerationDrawerEngine/factory';
import MapInputForm from './MapInputForm';
import { mapEngineConfig } from './mapEngineConfig';
import { MaskLibraryTab } from './MaskLibraryTab';
import type { MapGenerationInput, MapGenerationOutput, ProjectGeneratedImage } from './mapTypes';
import type { GeneratedImage, ModeSelectorConfig, ModeGalleryConfig, MaskImage } from '../../shared/GenerationDrawerEngine';

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

    // Call the original handler
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

  getInitialImages: (ctx): GeneratedImage[] => {
    // Return project's generated images for the gallery
    return ctx.generatedImages.map((img: ProjectGeneratedImage) => ({
      id: img.id,
      url: img.url,
      prompt: img.prompt,
      createdAt: img.createdAt,
      sessionId: img.sessionId,
      service: img.service,
    }));
  },

  handleImagesGenerated: (ctx, images) => {
    // Add generated images to the project
    console.log(`📸 [MapGenerator] handleImagesGenerated: ${images.length} images`);
    images.forEach((img: GeneratedImage) => {
      // Ensure image has an ID - generate one if missing
      const imageId = img.id || `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      ctx.addGeneratedImage({
        id: imageId,
        url: img.url,
        prompt: img.prompt || '',
        createdAt: img.createdAt || new Date().toISOString(),
        sessionId: img.sessionId || '',
        service: img.service || 'map',
      });
    });
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
  },

  // === Custom Tab Slots ===
  getCustomTabSlots: (ctx) => ({
    masks: (
      <MaskLibraryTab
        currentProjectId={ctx.projectId}
        onImportMask={(maskUrl, projectName) => {
          console.log('🎭 [MapGenerator] Importing mask from:', projectName);
          ctx.setMaskImageUrl(maskUrl);
        }}
      />
    )
  }),

  // === Mode Selection ===
  getModeConfig: (ctx): ModeSelectorConfig => ({
    currentMode: ctx.generationMode,
    onModeChange: (mode) => ctx.setGenerationMode(mode as 'generate' | 'generate-from-mask' | 'edit'),
    modes: [
      { value: 'generate', label: 'Generate', icon: <IconWand size={16} /> },
      { value: 'generate-from-mask', label: 'From Mask', icon: <IconMask size={16} /> },
      { value: 'edit', label: 'Edit', icon: <IconEdit size={16} /> },
    ],
  }),

  getModeGalleries: (): ModeGalleryConfig[] => [
    { mode: 'generate', galleryType: 'images', label: 'Generated Images' },
    { mode: 'generate-from-mask', galleryType: 'masks', label: 'Project Masks' },
    { mode: 'edit', galleryType: 'both', label: 'Images & Masks' },
  ],

  getMaskImages: (ctx): MaskImage[] => {
    // Return the current project's mask if it exists
    if (ctx.maskImageUrl) {
      return [{
        id: 'current-mask',
        url: ctx.maskImageUrl,
        projectName: ctx.projectName || 'Current Project',
        updatedAt: new Date().toISOString(),
      }];
    }
    return [];
  },

  handleMaskSelect: (ctx, maskUrl) => {
    console.log('🎭 [MapGenerator] Mask selected from gallery:', maskUrl);
    ctx.setMaskImageUrl(maskUrl);
  }
});

// =============================================================================
// PROPS INTERFACE
// =============================================================================

interface MapGenerationDrawerProps {
  opened: boolean;
  onClose: () => void;
  initialTab?: 'image' | 'upload' | 'library' | 'masks';
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
