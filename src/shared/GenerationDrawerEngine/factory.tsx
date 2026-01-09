/**
 * Service Drawer Factory
 * 
 * Creates service-specific drawer components with automatic context wiring
 * and generation state synchronization.
 * 
 * @module GenerationDrawerEngine/factory
 * @version 1.0.0
 */

import React, { useCallback, useMemo, useRef } from 'react';
import { GenerationDrawerEngine } from './GenerationDrawerEngine';
import type {
    GenerationDrawerConfig,
    InputSlotProps,
    GeneratedImage,
    GenerationError,
    TutorialConfig
} from './types';
import type { ComponentType } from 'react';

// =============================================================================
// FACTORY TYPES
// =============================================================================

/**
 * Configuration for creating a service-specific drawer.
 * 
 * @typeParam TInput - Input type for the service (e.g., StatBlockInput)
 * @typeParam TOutput - Output type from generation (e.g., StatBlockOutput)
 * @typeParam TContext - Service context type (e.g., StatBlockGeneratorContextType)
 */
export interface ServiceDrawerFactoryConfig<TInput, TOutput, TContext> {
    /** Unique service identifier (e.g., 'statblock', 'pcg', 'card') */
    serviceId: string;

    /** Display name for the drawer title */
    displayName: string;

    /** Input form component matching InputSlotProps<TInput> */
    InputForm: ComponentType<InputSlotProps<TInput>>;

    /** 
     * Base engine configuration (tabs, endpoints, transforms).
     * Callbacks (onGenerationStart, onGenerationComplete, onGenerationError) 
     * are wired automatically by the factory.
     */
    engineConfig: Omit<GenerationDrawerConfig<TInput, TOutput>,
        'id' | 'title' | 'InputSlot' | 'onGenerationStart' | 'onGenerationComplete' | 'onGenerationError'
    >;

    /** Hook to access service context */
    useContext: () => TContext;

    /** Extract setIsGenerating function from context */
    getIsGeneratingSetter: (ctx: TContext) => (isGenerating: boolean) => void;

    /** Handle successful generation output - route to context methods */
    handleOutput: (ctx: TContext, output: TOutput, input?: TInput) => void;

    /** Handle generation error (optional, default logs) */
    handleError?: (ctx: TContext, error: GenerationError) => void;

    /** Get initial images from context (for image gallery population) */
    getInitialImages?: (ctx: TContext) => GeneratedImage[];

    /** Handle new images generated - save to context */
    handleImagesGenerated?: (ctx: TContext, images: GeneratedImage[]) => void;

    /** Handle image selection from gallery */
    handleImageSelected?: (ctx: TContext, url: string, index: number) => void;

    /** Handle image deletion from library - sync with context state */
    handleImageDeleted?: (ctx: TContext, imageId: string, imageUrl: string) => void;

    /** Get session ID for image management (defaults to serviceId-session) */
    getSessionId?: (ctx: TContext) => string;

    /** Get image prompt from context (populates image tab after text generation) */
    getImagePrompt?: (ctx: TContext) => string;

    /** Tutorial mode configuration */
    tutorialConfig?: {
        /** Get tutorial mode state from context or props */
        isTutorialMode?: (ctx: TContext, props: ServiceDrawerProps) => boolean;
        /** Mock auth state for tutorial bypass */
        mockAuthState?: boolean;
        /** Simulated generation duration (default: 7000ms) */
        simulatedDurationMs?: number;
        /** Mock output data for tutorial mode */
        mockData?: TOutput;
        /** Mock images for tutorial mode gallery */
        mockImages?: GeneratedImage[];
        /** Callback when tutorial generation completes */
        onTutorialComplete?: (ctx: TContext) => void;
    };
}

/**
 * Props for the generated service drawer component.
 */
export interface ServiceDrawerProps {
    /** Whether drawer is open */
    opened: boolean;
    /** Close callback */
    onClose: () => void;
    /** Initial tab to display (overrides config default) */
    initialTab?: string;
    /** Tutorial mode override (from parent) */
    isTutorialMode?: boolean;
    /** Additional callback after generation completes successfully */
    onGenerationComplete?: () => void;
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Creates a service-specific drawer component with automatic context wiring.
 * 
 * The factory pattern eliminates boilerplate and prevents common bugs like
 * forgetting to sync `isGenerating` state between the engine and context.
 * 
 * @example
 * ```tsx
 * // StatBlockGenerator/StatBlockGenerationDrawer.tsx
 * 
 * export const StatBlockGenerationDrawer = createServiceDrawer({
 *     serviceId: 'statblock',
 *     displayName: 'Creature Generator',
 *     InputForm: StatBlockInputForm,
 *     engineConfig: statBlockEngineConfig,
 *     useContext: useStatBlockGenerator,
 *     getIsGeneratingSetter: (ctx) => ctx.setIsGenerating,
 *     handleOutput: (ctx, output) => {
 *         ctx.replaceCreatureDetails(output.statblock);
 *         if (output.imagePrompt) ctx.setImagePrompt(output.imagePrompt);
 *     }
 * });
 * 
 * // Usage:
 * <StatBlockGenerationDrawer opened={isOpen} onClose={handleClose} />
 * ```
 * 
 * @typeParam TInput - The input type for the service
 * @typeParam TOutput - The output type from generation
 * @typeParam TContext - The service context type
 * @param factoryConfig - Configuration for the service drawer
 * @returns A React component that can be used as the service's generation drawer
 */
export function createServiceDrawer<TInput, TOutput, TContext>(
    factoryConfig: ServiceDrawerFactoryConfig<TInput, TOutput, TContext>
): React.FC<ServiceDrawerProps> {
    const {
        serviceId,
        displayName,
        InputForm,
        engineConfig,
        useContext,
        getIsGeneratingSetter,
        handleOutput,
        handleError,
        getInitialImages,
        handleImagesGenerated,
        handleImageSelected,
        handleImageDeleted,
        getSessionId,
        getImagePrompt,
        tutorialConfig
    } = factoryConfig;

    // Extract onGenerationStart before type narrowing (it's omitted from engineConfig type)
    // We need to cast to access it since it's explicitly omitted from the type
    const originalOnGenerationStart = (engineConfig as GenerationDrawerConfig<TInput, TOutput>).onGenerationStart;

    // Create the service drawer component
    const ServiceDrawer: React.FC<ServiceDrawerProps> = (props) => {
        const {
            opened,
            onClose,
            initialTab,
            isTutorialMode: propsTutorialMode,
            onGenerationComplete: propsOnComplete
        } = props;

        // Get service context
        const ctx = useContext();

        // Extract context methods
        const setIsGenerating = getIsGeneratingSetter(ctx);
        const sessionId = getSessionId?.(ctx) || `${serviceId}-session`;
        const initialImages = getInitialImages?.(ctx) || [];
        const imagePrompt = getImagePrompt?.(ctx) || '';

        // Determine tutorial mode (props override, then context check, then false)
        const isTutorialMode = propsTutorialMode ??
            tutorialConfig?.isTutorialMode?.(ctx, props) ??
            false;

        // Capture last input for metadata saving
        const lastInputRef = useRef<TInput | undefined>(undefined);

        // Handle generation complete - routes output to context
        const handleGenerationComplete = useCallback((output: TOutput) => {
            console.log(`✅ [${displayName}] Generation complete`);

            // Route output to service context with input metadata
            handleOutput(ctx, output, lastInputRef.current);

            // Notify parent if callback provided
            propsOnComplete?.();

            // Tutorial callback if in tutorial mode
            if (isTutorialMode && tutorialConfig?.onTutorialComplete) {
                tutorialConfig.onTutorialComplete(ctx);
            }
        }, [ctx, propsOnComplete, isTutorialMode]);

        // Handle generation error
        const handleGenerationError = useCallback((error: GenerationError) => {
            console.error(`❌ [${displayName}] Generation error:`, error.title, error.message);

            if (handleError) {
                handleError(ctx, error);
            }
        }, [ctx]);

        // Handle image generation (also used for Add from Library)
        const handleImageGenerated = useCallback((images: GeneratedImage[]) => {
            console.log(`📸 [${displayName}] handleImageGenerated called:`, {
                count: images.length,
                hasHandler: !!handleImagesGenerated,
                firstImageId: images[0]?.id
            });
            if (handleImagesGenerated) {
                handleImagesGenerated(ctx, images);
            } else {
                console.warn(`⚠️ [${displayName}] No handleImagesGenerated configured!`);
            }
        }, [ctx]);

        // Handle image selection
        const handleImageSelect = useCallback((url: string, index: number) => {
            console.log(`🖼️ [${displayName}] handleImageSelect called:`, {
                url: url?.substring(0, 50) + '...',
                index,
                hasHandler: !!handleImageSelected
            });
            if (handleImageSelected) {
                handleImageSelected(ctx, url, index);
                console.log(`✅ [${displayName}] handleImageSelected invoked`);
            } else {
                console.warn(`⚠️ [${displayName}] No handleImageSelected configured!`);
            }
        }, [ctx]);

        // Handle image deletion from library - syncs with provider state
        const handleImageDelete = useCallback((imageId: string, imageUrl: string) => {
            console.log(`🗑️ [${displayName}] Image deleted from library:`, imageId);
            handleImageDeleted?.(ctx, imageId, imageUrl);
        }, [ctx]);

        // Build tutorial config for engine
        const tutorialEngineConfig: TutorialConfig | undefined = isTutorialMode ? {
            mockAuthState: tutorialConfig?.mockAuthState ?? false,
            simulatedDurationMs: tutorialConfig?.simulatedDurationMs ?? 7000,
            simulateGeneration: true,
            mockData: tutorialConfig?.mockData,
            mockImages: tutorialConfig?.mockImages
        } : undefined;

        // Wrap onGenerationStart to capture input for metadata
        const wrappedOnGenerationStart = useCallback((input: TInput) => {
            lastInputRef.current = input;
            originalOnGenerationStart?.(input);
        }, [originalOnGenerationStart]);

        // Build final engine config with all wiring
        const config = useMemo((): GenerationDrawerConfig<TInput, TOutput> => ({
            ...engineConfig,
            id: serviceId,
            title: displayName,
            InputSlot: InputForm,
            defaultTab: initialTab || engineConfig.defaultTab,
            onGenerationStart: wrappedOnGenerationStart,
            onGenerationComplete: handleGenerationComplete,
            onGenerationError: handleGenerationError,
            tutorialConfig: tutorialEngineConfig,
            imageConfig: engineConfig.imageConfig ? {
                ...engineConfig.imageConfig,
                sessionId,
                onImageGenerated: handleImageGenerated,
                onImageSelected: handleImageSelect,
                onImageDeleted: handleImageDelete
            } : undefined
        }), [
            handleGenerationComplete,
            handleGenerationError,
            handleImageGenerated,
            handleImageSelect,
            handleImageDelete,
            sessionId,
            initialTab,
            tutorialEngineConfig
        ]);

        return (
            <GenerationDrawerEngine
                config={config}
                opened={opened}
                onClose={onClose}
                isTutorialMode={isTutorialMode}
                initialImages={initialImages}
                onGeneratingChange={setIsGenerating}
                imageTabPrompt={imagePrompt}
            />
        );
    };

    // Set display name for React DevTools debugging
    ServiceDrawer.displayName = `${serviceId}GenerationDrawer`;

    return ServiceDrawer;
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

// Re-export types that services will need when using the factory
export type {
    InputSlotProps,
    GeneratedImage,
    GenerationError,
    GenerationDrawerConfig,
    TabConfig,
    ProgressConfig,
    ExampleConfig,
    Milestone,
    ImageConfig,
    ImageGenerationModel,
    ImageGenerationStyle,
    TutorialConfig,
    ValidationResult
} from './types';

export { GenerationType, ErrorCode } from './types';

