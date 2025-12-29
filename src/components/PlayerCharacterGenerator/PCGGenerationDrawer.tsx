/**
 * PCGGenerationDrawer.tsx - Factory-based generation drawer for PCG
 * 
 * Uses the createServiceDrawer factory pattern for automatic context wiring.
 * Provides character generation and portrait generation tabs.
 * 
 * @module PlayerCharacterGenerator
 */

import React from 'react';
import { usePlayerCharacterGenerator } from './PlayerCharacterGeneratorProvider';
import type { PlayerCharacterGeneratorContextType } from './PlayerCharacterGeneratorProvider';
import { derivePortraitPrompt } from './generation/portraitPromptBuilder';

// Factory imports
import { createServiceDrawer, type GeneratedImage } from '../../shared/GenerationDrawerEngine/factory';
import PCGInputForm from './PCGInputForm';
import type { PCGInput } from './PCGInputForm';
import { pcgEngineConfig, type PCGOutput } from './pcgEngineConfig';

// Note: PlayerCharacterGeneratorContextType now includes setIsGenerating and isGenerating

// =============================================================================
// FACTORY-BASED DRAWER
// =============================================================================

/**
 * Factory-created PCG generation drawer.
 * 
 * Benefits:
 * - Automatic `isGenerating` state sync (impossible to forget)
 * - Declarative configuration
 * - Type-safe context wiring
 * - ~40 lines vs ~120 lines of boilerplate
 */
const FactoryPCGGenerationDrawer = createServiceDrawer<
    PCGInput,
    PCGOutput,
    PlayerCharacterGeneratorContextType
>({
    serviceId: 'pcg',
    displayName: 'AI Generation',
    InputForm: PCGInputForm,
    engineConfig: pcgEngineConfig,

    // === Context Wiring ===
    useContext: usePlayerCharacterGenerator,
    getIsGeneratingSetter: (ctx) => ctx.setIsGenerating,

    // === Output Handling ===
    handleOutput: (ctx, output) => {
        // Clear current project to start fresh (new character)
        ctx.clearCurrentProject();
        
        // Set the generated character
        ctx.setCharacter(output.character);
        
        console.log('✅ [PCG Generate] Character set:', output.character?.name || '(unnamed)');
    },

    // === Error Handling ===
    handleError: (ctx, error) => {
        console.error('❌ [PCG Generate] Failed:', error);
    },

    // === Image Handling ===
    getSessionId: (ctx) => ctx.currentProject?.id || 'pcg-session',
    
    getImagePrompt: (ctx) => {
        // Derive portrait prompt from the current character
        if (!ctx.character) return '';
        const { basePrompt } = derivePortraitPrompt(ctx.character);
        return basePrompt;
    },

    getInitialImages: (ctx): GeneratedImage[] => {
        // Get images from character's portrait gallery
        const gallery = ctx.character?.portraitGallery || [];
        return gallery.map((img) => ({
            id: img.id,
            url: img.url,
            prompt: img.prompt || '',
            createdAt: img.meta?.createdAt || new Date().toISOString(),
            sessionId: ctx.currentProject?.id || 'pcg-session',
            service: 'pcg'
        }));
    },

    handleImagesGenerated: (ctx, images) => {
        // Add generated images to character's portrait gallery
        if (!ctx.character) return;
        
        const newGalleryItems = images.map((img) => ({
            id: img.id,
            url: img.url,
            prompt: img.prompt || '',
            meta: {
                source: 'generated' as const,
                createdAt: img.createdAt || new Date().toISOString()
            }
        }));

        const currentGallery = ctx.character.portraitGallery || [];
        ctx.updateCharacter({
            portraitGallery: [...currentGallery, ...newGalleryItems]
        });

        // Set the first generated image as the active portrait
        if (images.length > 0) {
            ctx.updateCharacter({
                portrait: images[0].url,
                portraitMeta: {
                    source: 'generated',
                    createdAt: images[0].createdAt
                }
            });
        }

        console.log('🖼️ [PCG Portrait] Added images:', images.length);
    },

    handleImageSelected: (ctx, url, index) => {
        // Set selected image as the active portrait
        // Find the gallery item to copy its meta
        const galleryItem = ctx.character?.portraitGallery?.find(img => img.url === url);
        ctx.updateCharacter({
            portrait: url,
            portraitMeta: galleryItem?.meta || {
                source: 'library'
            }
        });
        console.log('🖼️ [PCG Portrait] Selected image:', index);
    },

    handleImageDeleted: (ctx, imageId, imageUrl) => {
        // Remove from portrait gallery
        if (!ctx.character?.portraitGallery) return;
        
        const updatedGallery = ctx.character.portraitGallery.filter(
            img => img.id !== imageId && img.url !== imageUrl
        );
        ctx.updateCharacter({
            portraitGallery: updatedGallery
        });

        // If the deleted image was the active portrait, clear it
        if (ctx.character.portrait === imageUrl) {
            ctx.updateCharacter({
                portrait: undefined,
                portraitMeta: undefined
            });
        }

        console.log('🗑️ [PCG Portrait] Deleted image:', imageId);
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

interface PCGGenerationDrawerProps {
    opened: boolean;
    onClose: () => void;
    initialTab?: 'text' | 'image';
    isTutorialMode?: boolean;
    onGenerationComplete?: () => void;
}

// =============================================================================
// EXPORTED COMPONENT
// =============================================================================

/**
 * PCGGenerationDrawer - Generation drawer for Player Character Generator
 * 
 * Uses the factory-based GenerationDrawerEngine with automatic context wiring.
 */
const PCGGenerationDrawer: React.FC<PCGGenerationDrawerProps> = ({
    opened,
    onClose,
    initialTab,
    isTutorialMode = false,
    onGenerationComplete
}) => {
    return (
        <FactoryPCGGenerationDrawer
            opened={opened}
            onClose={onClose}
            initialTab={initialTab}
            isTutorialMode={isTutorialMode}
            onGenerationComplete={onGenerationComplete}
        />
    );
};

export default PCGGenerationDrawer;
