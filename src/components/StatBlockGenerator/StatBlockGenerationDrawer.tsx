/**
 * StatBlockGenerationDrawer.tsx - Factory-based generation drawer
 * 
 * Uses the createServiceDrawer factory pattern for automatic context wiring.
 * Supports both the old GenerationDrawer and the new factory-based engine
 * via the USE_NEW_GENERATION_DRAWER feature flag.
 */

import React from 'react';
import { USE_NEW_GENERATION_DRAWER } from '../../config';
import GenerationDrawer from './GenerationDrawer';
import { useStatBlockGenerator, type StatBlockGeneratorContextType } from './StatBlockGeneratorProvider';
import { TutorialMockImage } from './generationDrawerComponents/ImageGenerationTab';

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
        ctx.setSelectedCreatureImage(url, index);
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
    initialPrompt?: string;
    isTutorialMode?: boolean;
    isTutorialMockAuth?: boolean;
    tutorialMockImages?: TutorialMockImage[];
    onGenerationComplete?: () => void;
}

// =============================================================================
// WRAPPER COMPONENTS
// =============================================================================

/**
 * Wrapper for the factory-based drawer to handle legacy props.
 */
const NewStatBlockGenerationDrawer: React.FC<StatBlockGenerationDrawerProps> = ({
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

/**
 * Old implementation using the legacy GenerationDrawer.
 * Will be removed once migration is complete.
 */
const OldStatBlockGenerationDrawer: React.FC<StatBlockGenerationDrawerProps> = ({
    opened,
    onClose,
    initialTab,
    initialPrompt,
    isTutorialMode,
    isTutorialMockAuth,
    tutorialMockImages,
    onGenerationComplete
}) => {
    const { isGenerating } = useStatBlockGenerator();

    return (
        <GenerationDrawer
            opened={opened}
            onClose={onClose}
            isGenerationInProgress={isGenerating}
            initialTab={initialTab}
            initialPrompt={initialPrompt}
            isTutorialMode={isTutorialMode}
            isTutorialMockAuth={isTutorialMockAuth}
            tutorialMockImages={tutorialMockImages}
            onGenerationComplete={onGenerationComplete}
        />
    );
};

// =============================================================================
// EXPORTED COMPONENT
// =============================================================================

/**
 * StatBlockGenerationDrawer - Feature-flagged wrapper
 * 
 * Uses USE_NEW_GENERATION_DRAWER feature flag to switch between:
 * - New: Factory-based GenerationDrawerEngine (automatic context wiring)
 * - Old: GenerationDrawer (legacy implementation)
 */
const StatBlockGenerationDrawer: React.FC<StatBlockGenerationDrawerProps> = (props) => {
    if (USE_NEW_GENERATION_DRAWER) {
        return <NewStatBlockGenerationDrawer {...props} />;
    }
    return <OldStatBlockGenerationDrawer {...props} />;
};

export default StatBlockGenerationDrawer;
