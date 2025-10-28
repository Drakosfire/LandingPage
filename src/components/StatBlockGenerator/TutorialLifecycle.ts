/**
 * Tutorial Lifecycle Types
 * 
 * Shared types and interfaces for tutorial lifecycle management components
 * (TutorialStart, TutorialEnd)
 * 
 * Architecture Philosophy:
 * - TutorialStart: Universal, app-agnostic initialization for unified header
 * - TutorialEnd: App-specific completion logic (can vary by app)
 * 
 * This allows the unified header to handle tutorial initialization consistently
 * across all apps, while each app can customize the completion experience.
 */

/**
 * Callback props for TutorialStart component (app-agnostic)
 * Handles universal initialization of tutorial state
 */
export interface TutorialStartProps {
    /** Close any app-specific drawers/panels */
    onCloseGenerationDrawer?: () => void;
    /** Callback when initialization is complete */
    onInitializationComplete?: () => void;
}

/**
 * Callback props for TutorialEnd component
 * Handles completion of tutorial
 */
export interface TutorialEndProps {
    /** Replace canvas with empty statblock for user to start creating */
    replaceCreatureDetails: (statblock: any) => void;
    /** Close the generation drawer */
    onCloseGenerationDrawer: () => void;
    /** Open the generation drawer */
    onOpenGenerationDrawer: () => void;
    /** Switch to text generation tab */
    onSwitchDrawerTab: (tab: 'text' | 'image') => void;
    /** Mark tutorial as completed in cookies */
    onMarkCompleted: () => void;
    /** Callback when tutorial completion is complete */
    onComplete: () => void;
}

/**
 * Initialization state for TutorialStart
 */
export interface InitializationState {
    isInitialized: boolean;
}

/**
 * Completion state for TutorialEnd
 */
export interface CompletionState {
    isCompleted: boolean;
}
