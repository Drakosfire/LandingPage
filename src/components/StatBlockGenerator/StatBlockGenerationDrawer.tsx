/**
 * StatBlockGenerationDrawer.tsx - Factory-based generation drawer
 * 
 * Uses the createServiceDrawer factory pattern for automatic context wiring.
 */

import React from 'react';
import { useStatBlockGenerator, type StatBlockGeneratorContextType } from './StatBlockGeneratorProvider';

// Factory imports
import { createServiceDrawer, type GeneratedImage } from '../../shared/GenerationDrawerEngine/factory';
import StatBlockInputForm from './StatBlockInputForm';
import { 
    statblockEngineConfig, 
    type StatBlockInput, 
    type StatBlockOutput 
} from './statblockEngineConfig';

// =============================================================================
// FACTORY-BASED DRAWER (New Pattern)
// =============================================================================

/**
 * Factory-created StatBlock generation drawer.
 * 
 * Benefits:
 * - Automatic `isGenerating` state sync (impossible to forget)
 * - Declarative configuration
 * - Type-safe context wiring
 * - ~40 lines vs ~120 lines of boilerplate
 */
const FactoryStatBlockGenerationDrawer = createServiceDrawer<
    StatBlockInput,
    StatBlockOutput,
    StatBlockGeneratorContextType
>({
    serviceId: 'statblock',
    displayName: 'AI Generation',
    InputForm: StatBlockInputForm,
    engineConfig: statblockEngineConfig,
    
    // === Context Wiring ===
    useContext: useStatBlockGenerator,
    getIsGeneratingSetter: (ctx) => ctx.setIsGenerating,
    
    // === Output Handling ===
    handleOutput: (ctx, output) => {
        ctx.replaceCreatureDetails(output.statblock);
        // Always set imagePrompt (even if empty) to clear stale prompts from previous creatures
        ctx.setImagePrompt(output.imagePrompt || '');
    },
    
    // === Image Handling ===
    getSessionId: (ctx) => ctx.currentProject?.id || 'statblock-session',
    getImagePrompt: (ctx) => ctx.imagePrompt,
    
    getInitialImages: (ctx): GeneratedImage[] => 
        ctx.generatedContent.images.map((img) => ({
            id: img.id,
            url: img.url,
            prompt: img.prompt || '',
            createdAt: img.timestamp || new Date().toISOString(),
            sessionId: ctx.currentProject?.id || 'statblock-session',
            service: 'statblock'
        })),
    
    handleImagesGenerated: (ctx, images) => {
        images.forEach((img) => {
            ctx.addGeneratedImage({
                id: img.id,
                url: img.url,
                prompt: img.prompt || '',
                timestamp: img.createdAt || new Date().toISOString()
            });
        });
    },
    
    handleImageSelected: (ctx, url, index) => {
        console.log('🎯 [StatBlock] handleImageSelected called:', {
            url: url?.substring(0, 50) + '...',
            index
        });
        ctx.setSelectedCreatureImage(url, index);
        console.log('✅ [StatBlock] setSelectedCreatureImage invoked');
    },

    // Handle image deletion from library - sync with provider's generatedContent
    handleImageDeleted: (ctx, imageId, imageUrl) => {
        // Remove from provider state to prevent debounced save from re-adding
        const imageInProject = ctx.generatedContent.images.find(
            img => img.id === imageId || img.url === imageUrl
        );
        if (imageInProject) {
            console.log('🗑️ [StatBlock] Syncing library delete to provider:', imageId);
            // Use removeGeneratedImage to properly remove from all state
            ctx.removeGeneratedImage(imageInProject.id);
        }
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

interface StatBlockGenerationDrawerProps {
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
 * StatBlockGenerationDrawer - Factory-based generation drawer
 * 
 * Uses the GenerationDrawerEngine with automatic context wiring.
 */
const StatBlockGenerationDrawer: React.FC<StatBlockGenerationDrawerProps> = ({
    opened,
    onClose,
    initialTab,
    isTutorialMode = false,
    onGenerationComplete
}) => {
    return (
        <FactoryStatBlockGenerationDrawer
            opened={opened}
            onClose={onClose}
            initialTab={initialTab}
            isTutorialMode={isTutorialMode}
            onGenerationComplete={onGenerationComplete}
        />
    );
};

export default StatBlockGenerationDrawer;
