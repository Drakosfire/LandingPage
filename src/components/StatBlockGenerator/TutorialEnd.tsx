/**
 * TutorialEnd Component
 * 
 * Handles completion of tutorial - setting up user for their first statblock creation.
 * Extracted from TutorialTour completion logic to provide reusable component.
 */

import { useEffect, useRef } from 'react';
import { EMPTY_STATBLOCK } from '../../fixtures/demoStatblocks';
import { TutorialEndProps } from './TutorialLifecycle';

interface TutorialEndInternalProps extends TutorialEndProps {
    /** Flag to trigger tutorial completion */
    shouldComplete?: boolean;
}

/**
 * TutorialEnd Component
 * 
 * Completes tutorial by:
 * 1. Resetting to clean state (empty statblock)
 * 2. Closing all drawers
 * 3. Opening text generation drawer
 * 4. Switching to text generation tab
 * 5. Marking tutorial as completed
 * 6. Calling completion callback
 * 
 * This ensures user ends up in a clean state ready to create their first statblock.
 */
export const TutorialEnd: React.FC<TutorialEndInternalProps> = ({
    shouldComplete = false,
    replaceCreatureDetails,
    onCloseGenerationDrawer,
    onOpenGenerationDrawer,
    onSwitchDrawerTab,
    onMarkCompleted,
    onComplete,
}) => {
    const completionTriggeredRef = useRef(false);

    useEffect(() => {
        // Only complete once per trigger
        if (!shouldComplete || completionTriggeredRef.current) {
            return;
        }

        completionTriggeredRef.current = true;

        const completeTutorial = async () => {
            try {
                console.log('🎉 [TutorialEnd] Completing tutorial and setting up user for first statblock');

                // 1. Reset to clean state (empty statblock)
                console.log('🧹 [TutorialEnd] Setting up clean state for user');
                replaceCreatureDetails(EMPTY_STATBLOCK);
                onCloseGenerationDrawer();

                // 2. Wait for state to settle
                await new Promise(r => setTimeout(r, 500));

                // 3. Open text generation drawer for user to start creating
                console.log('📝 [TutorialEnd] Opening text generation drawer for user');
                onOpenGenerationDrawer();
                onSwitchDrawerTab('text');

                // 4. Wait for drawer to open
                await new Promise(r => setTimeout(r, 300));

                // 5. Mark tutorial as completed
                onMarkCompleted();
                console.log('🍪 [TutorialEnd] Tutorial completion cookie set');

                // 6. Call completion handler
                onComplete();
                console.log('🎯 [TutorialEnd] Tutorial completion callback called');

            } catch (error) {
                console.error('❌ [TutorialEnd] Tutorial completion error:', error);
                // Still complete the tutorial even if there's an error
                onMarkCompleted();
                onComplete();
            }
        };

        completeTutorial();
    }, [
        shouldComplete,
        replaceCreatureDetails,
        onCloseGenerationDrawer,
        onOpenGenerationDrawer,
        onSwitchDrawerTab,
        onMarkCompleted,
        onComplete,
    ]);

    // Reset completion flag when shouldComplete becomes false
    useEffect(() => {
        if (!shouldComplete) {
            completionTriggeredRef.current = false;
            console.log('🔄 [TutorialEnd] Reset completion flag (shouldComplete=false)');
        }
    }, [shouldComplete]);

    // This component doesn't render anything
    return null;
};
