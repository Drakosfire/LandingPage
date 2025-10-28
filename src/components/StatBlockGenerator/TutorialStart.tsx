/**
 * TutorialStart Component
 * 
 * Universal tutorial initialization component for the unified header.
 * Handles high-level page setup that applies to ANY tutorial in ANY app.
 * 
 * App-specific initialization (like clearing canvas, loading demo data) should
 * be handled by the individual app's tutorial flow AFTER this component runs.
 */

import { useEffect, useRef } from 'react';
import { TutorialStartProps } from './TutorialLifecycle';

interface TutorialStartInternalProps extends TutorialStartProps {
    /** Flag to force tutorial initialization */
    forceRun?: boolean;
    /** Optional callback to prepare app-specific state */
    onPrepareAppState?: () => void;
}

/**
 * TutorialStart Component
 * 
 * Universal tutorial initialization:
 * 1. Closes any app-specific drawers/panels
 * 2. Optionally calls app-specific preparation callback
 * 3. Signals that header is ready for tutorial start
 * 
 * This ensures a consistent starting point regardless of what state
 * the page was in when the tutorial was initiated.
 * 
 * The actual app-specific setup (like clearing canvas, loading demo data)
 * should be handled by the first tutorial step or app-specific handlers.
 */
export const TutorialStart: React.FC<TutorialStartInternalProps> = ({
    forceRun = false,
    onCloseGenerationDrawer, // Now generic "close any drawers"
    onPrepareAppState, // New: app-specific prep callback
    onInitializationComplete,
}) => {
    const initializationStartedRef = useRef(false);

    useEffect(() => {
        // Only initialize once per forceRun trigger
        if (!forceRun || initializationStartedRef.current) {
            return;
        }

        initializationStartedRef.current = true;

        console.log('🧹 [TutorialStart] Initializing tutorial (universal header setup)...');

        // 1. Close any open drawers/panels (app-agnostic)
        onCloseGenerationDrawer?.();
        console.log('🚪 [TutorialStart] Closed all drawers/panels');

        // 2. Prepare app-specific state (if callback provided)
        // This is where apps can do things like:
        // - Clear canvas/editor
        // - Load demo data
        // - Reset filters/selections
        if (onPrepareAppState) {
            onPrepareAppState();
            console.log('🎨 [TutorialStart] App-specific preparation called');
        }

        // 3. Signal initialization complete
        if (onInitializationComplete) {
            console.log('✅ [TutorialStart] Universal initialization complete');
            onInitializationComplete();
        }
    }, [forceRun, onCloseGenerationDrawer, onPrepareAppState, onInitializationComplete]);

    // Reset initialization flag when forceRun becomes false
    useEffect(() => {
        if (!forceRun) {
            initializationStartedRef.current = false;
            console.log('🔄 [TutorialStart] Reset initialization flag (forceRun=false)');
        }
    }, [forceRun]);

    // This component doesn't render anything
    return null;
};
