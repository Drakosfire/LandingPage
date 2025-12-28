/**
 * StatBlockGenerationDrawer.tsx - Context-aware wrapper for Generation Drawer
 * 
 * Supports both the old GenerationDrawer and the new GenerationDrawerEngine
 * via the USE_NEW_GENERATION_DRAWER feature flag.
 * 
 * Pattern: Follow StatBlockProjectsDrawer.tsx structure
 */

import React, { useCallback, useMemo } from 'react';
import { USE_NEW_GENERATION_DRAWER } from '../../config';
import GenerationDrawer from './GenerationDrawer';
import { useStatBlockGenerator } from './StatBlockGeneratorProvider';
import { TutorialMockImage } from './generationDrawerComponents/ImageGenerationTab';

// New engine imports
import { GenerationDrawerEngine } from '../../shared/GenerationDrawerEngine';
import type { GeneratedImage } from '../../shared/GenerationDrawerEngine';
import { useImageCapabilities } from '../../shared/GenerationDrawerEngine/hooks/useImageCapabilities';
import StatBlockInputForm from './StatBlockInputForm';
import { 
    createStatBlockDrawerConfig, 
    type StatBlockOutput 
} from './statblockDrawerConfig';

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

/**
 * New engine-based implementation of the generation drawer.
 * Uses GenerationDrawerEngine with StatBlock-specific configuration.
 */
const NewStatBlockGenerationDrawer: React.FC<StatBlockGenerationDrawerProps> = ({
    opened,
    onClose,
    initialTab,
    initialPrompt,
    isTutorialMode = false,
    isTutorialMockAuth = false,
    tutorialMockImages = [],
    onGenerationComplete
}) => {
    const {
        replaceCreatureDetails,
        setImagePrompt,
        addGeneratedImage,
        setSelectedCreatureImage,
        generatedContent,
        currentProject
    } = useStatBlockGenerator();

    // Fetch image capabilities from backend (skip in tutorial mode)
    const { capabilities } = useImageCapabilities({ 
        skip: isTutorialMode 
    });

    // Session ID for image management
    const sessionId = currentProject?.id || 'statblock-session';

    // Handle generation complete - update statblock in context
    const handleGenerationComplete = useCallback((output: StatBlockOutput) => {
        console.log('✅ [StatBlockGeneration] Generation complete:', output.statblock.name);
        
        // Update creature details in context
        replaceCreatureDetails(output.statblock);
        
        // Set image prompt if provided
        if (output.imagePrompt) {
            setImagePrompt(output.imagePrompt);
        }
        
        // Notify parent
        onGenerationComplete?.();
    }, [replaceCreatureDetails, setImagePrompt, onGenerationComplete]);

    // Handle image generation - add to context
    const handleImageGenerated = useCallback((images: { url: string; id: string }[]) => {
        console.log('📸 [StatBlockGeneration] Images generated:', images.length);
        
        images.forEach((img) => {
            addGeneratedImage({
                id: img.id,
                url: img.url,
                prompt: '',
                timestamp: new Date().toISOString()
            });
        });
    }, [addGeneratedImage]);

    // Handle image selection
    const handleImageSelected = useCallback((url: string, index: number) => {
        console.log('🖼️ [StatBlockGeneration] Image selected:', url, index);
        setSelectedCreatureImage(url, index);
    }, [setSelectedCreatureImage]);

    // Handle generation error
    const handleGenerationError = useCallback((error: { title: string; message: string }) => {
        console.error('❌ [StatBlockGeneration] Generation error:', error.title, error.message);
    }, []);

    // Create config with callbacks
    const config = useMemo(() => createStatBlockDrawerConfig(
        StatBlockInputForm,
        {
            sessionId,
            onGenerationComplete: handleGenerationComplete,
            onGenerationError: handleGenerationError,
            onImageGenerated: handleImageGenerated,
            onImageSelected: handleImageSelected,
            isTutorialMode,
            mockAuthState: isTutorialMockAuth,
            tutorialDurationMs: 7000,
            onTutorialComplete: onGenerationComplete,
            models: capabilities.models,
            styles: capabilities.styles,
            maxImages: capabilities.maxImages
        }
    ), [
        sessionId,
        handleGenerationComplete,
        handleGenerationError,
        handleImageGenerated,
        handleImageSelected,
        isTutorialMode,
        isTutorialMockAuth,
        onGenerationComplete,
        capabilities
    ]);

    // Convert existing generated images to engine format
    const initialImages: GeneratedImage[] = useMemo(() => {
        // Tutorial mock images take priority
        if (isTutorialMode && tutorialMockImages.length > 0) {
            return tutorialMockImages.map((img, index) => ({
                id: img.id || `tutorial-${index}`,
                url: img.url,
                prompt: img.prompt || '',
                createdAt: img.timestamp || new Date().toISOString(),
                sessionId: sessionId,
                service: 'statblock'
            }));
        }
        
        // Otherwise use existing generated images from context
        return generatedContent.images.map((img) => ({
            id: img.id,
            url: img.url,
            prompt: img.prompt || '',
            createdAt: img.timestamp || new Date().toISOString(),
            sessionId: sessionId,
            service: 'statblock'
        }));
    }, [isTutorialMode, tutorialMockImages, generatedContent.images, sessionId]);

    return (
        <GenerationDrawerEngine
            config={config}
            opened={opened}
            onClose={onClose}
            isTutorialMode={isTutorialMode}
            initialImages={initialImages}
            onGenerationComplete={handleGenerationComplete}
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

/**
 * StatBlockGenerationDrawer - Feature-flagged wrapper
 * 
 * Uses USE_NEW_GENERATION_DRAWER feature flag to switch between:
 * - New: GenerationDrawerEngine (reusable engine)
 * - Old: GenerationDrawer (legacy implementation)
 */
const StatBlockGenerationDrawer: React.FC<StatBlockGenerationDrawerProps> = (props) => {
    if (USE_NEW_GENERATION_DRAWER) {
        return <NewStatBlockGenerationDrawer {...props} />;
    }
    return <OldStatBlockGenerationDrawer {...props} />;
};

export default StatBlockGenerationDrawer;
