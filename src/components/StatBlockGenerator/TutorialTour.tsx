import React, { useEffect, useState, useRef } from 'react';
import Joyride, { CallBackProps, STATUS, Step, Styles } from 'react-joyride';
import { useMantineTheme } from '@mantine/core';
import { tutorialSteps } from '../../constants/tutorialSteps';
import { tutorialCookies } from '../../utils/tutorialCookies';
import { HERMIONE_DEMO_STATBLOCK, EMPTY_STATBLOCK } from '../../fixtures/demoStatblocks';
import { useStatBlockGenerator } from './StatBlockGeneratorProvider';
import { useAuth } from '../../context/AuthContext';

interface TutorialTourProps {
    /** Force the tutorial to run (e.g., from help button) */
    forceRun?: boolean;
    /** Callback when tutorial is skipped or completed */
    onComplete?: () => void;
    /** Callback to open the generation drawer */
    onOpenGenerationDrawer?: () => void;
    /** Callback to close the generation drawer */
    onCloseGenerationDrawer?: () => void;
    /** Callback to toggle edit mode */
    onToggleEditMode?: (enabled: boolean) => void;
    /** Callback to simulate typing in a field */
    onSimulateTyping?: (targetSelector: string, text: string) => Promise<void>;
    /** Callback to check a checkbox */
    onTutorialCheckbox?: (selector: string) => Promise<void>;
    /** Callback to click a button */
    onTutorialClickButton?: (selector: string) => Promise<void>;
    /** Callback to edit text in a contentEditable element */
    onTutorialEditText?: (targetSelector: string, newText: string) => Promise<void>;
    /** Callback to switch drawer tabs (text/image) */
    onSwitchDrawerTab?: (tab: 'text' | 'image') => void;
    /** Callback to switch image generation sub-tab (generate/upload/project/library) */
    onSwitchImageTab?: (tab: 'generate' | 'upload' | 'project' | 'library') => void;
}

export const TutorialTour: React.FC<TutorialTourProps> = ({
    forceRun = false,
    onComplete,
    onOpenGenerationDrawer,
    onCloseGenerationDrawer,
    onToggleEditMode,
    onSimulateTyping,
    onTutorialCheckbox,
    onTutorialClickButton,
    onTutorialEditText,
    onSwitchDrawerTab,
    onSwitchImageTab,
}) => {
    const theme = useMantineTheme();
    const { isLoggedIn } = useAuth();
    const { replaceCreatureDetails } = useStatBlockGenerator();
    const [run, setRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [steps, setSteps] = useState<Step[]>(tutorialSteps);
    const [isTypingDemoTriggered, setIsTypingDemoTriggered] = useState(false);
    const [isCheckboxDemoTriggered, setIsCheckboxDemoTriggered] = useState(false);
    const [isGenerationDemoTriggered, setIsGenerationDemoTriggered] = useState(false);
    const [isEditDemoTriggered, setIsEditDemoTriggered] = useState(false);

    // Use ref for immediate synchronous updates (no async state delay)
    const justAdvancedToStep4Ref = useRef(false);

    // Filter steps - only remove conditionally rendered elements (like projects button for non-logged-in users)
    const filterAvailableSteps = () => {
        // List of selectors that are conditionally rendered and should be checked
        const conditionalSelectors = [
            '[data-tutorial="save-button"]', // Only visible when logged in
            '[data-tutorial="projects-button"]', // Only visible when logged in
        ];

        const availableSteps = tutorialSteps.filter(step => {
            const target = typeof step.target === 'string' ? step.target : '';
            if (!target) return true; // Keep steps without specific targets

            // Only check conditionally rendered elements
            if (!conditionalSelectors.includes(target)) {
                return true; // Keep all other steps (they'll appear when needed, like drawer content)
            }

            // For conditional elements, check if they exist
            const element = document.querySelector(target);
            const exists = element !== null;
            if (!exists) {
                console.log(`⏭️ Skipping step - element not available: ${target}`);
            }
            return exists;
        });

        console.log(`📋 Tutorial: ${availableSteps.length}/${tutorialSteps.length} steps available`);
        return availableSteps;
    };

    useEffect(() => {
        if (forceRun) {
            // Clear canvas for fresh tutorial start
            console.log('🧹 [Tutorial] Clearing canvas for tutorial start');
            replaceCreatureDetails(EMPTY_STATBLOCK);

            // Filter steps when manually triggered
            const availableSteps = filterAvailableSteps();
            setSteps(availableSteps);
            setStepIndex(0);
            setIsTypingDemoTriggered(false); // Reset typing demo flag
            setIsCheckboxDemoTriggered(false); // Reset checkbox demo flag
            setIsGenerationDemoTriggered(false); // Reset generation demo flag
            setIsEditDemoTriggered(false); // Reset edit demo flag
            justAdvancedToStep4Ref.current = false; // Reset step 4 flag
            setRun(true);
            return;
        }

        // Auto-start for first-time users after a delay
        const hasCompleted = tutorialCookies.hasCompletedTutorial();
        if (!hasCompleted) {
            const timer = setTimeout(() => {
                // Clear canvas for fresh tutorial start
                console.log('🧹 [Tutorial] Clearing canvas for first-time user');
                replaceCreatureDetails(EMPTY_STATBLOCK);

                // Filter steps on auto-start
                const availableSteps = filterAvailableSteps();
                setSteps(availableSteps);
                setStepIndex(0);
                setIsTypingDemoTriggered(false); // Reset typing demo flag
                setIsCheckboxDemoTriggered(false); // Reset checkbox demo flag
                setIsGenerationDemoTriggered(false); // Reset generation demo flag
                setIsEditDemoTriggered(false); // Reset edit demo flag
                justAdvancedToStep4Ref.current = false; // Reset step 4 flag
                setRun(true);
            }, 1500); // 1.5s delay to let the page settle

            return () => clearTimeout(timer);
        }
    }, [forceRun, replaceCreatureDetails]);

    // Cleanup effect to ensure beacons are removed when tour stops
    useEffect(() => {
        if (!run) {
            // Force cleanup of any lingering beacons/spotlights
            const beacons = document.querySelectorAll('[data-test-id="button-primary"]');
            beacons.forEach(beacon => {
                const parent = beacon.closest('[class*="joyride"]');
                if (parent) parent.remove();
            });
        }
    }, [run]);

    // Typing and checkbox demos are now triggered directly in the callback handler (step 2 → 3 transition)
    // Generation demo is triggered when user clicks Next on step 3 (in callback handler)
    // These useEffects are removed as animations happen before showing tooltips

    // Clear step 4 guard flag after step 4 renders
    useEffect(() => {
        if (stepIndex === 4 && justAdvancedToStep4Ref.current && run) {
            console.log('⏰ [Tutorial] Step 4 rendered, clearing guard flag after 200ms');
            const timer = setTimeout(() => {
                justAdvancedToStep4Ref.current = false;
                console.log('✅ [Tutorial] Step 4 guard flag cleared, ready for user interaction');
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [stepIndex, run]);

    // Auto-trigger edit demo when step 6 (creature name spotlight) user clicks Next
    useEffect(() => {
        if (stepIndex === 6 && run && !isEditDemoTriggered) {
            console.log('🎯 [Tutorial] Step 6 (creature name) loaded, ready to demonstrate editing');
            // Note: The actual animation is triggered by the callback handler when user clicks Next
        }
    }, [stepIndex, run, isEditDemoTriggered]);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, index, action, type, lifecycle } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        // DEBUG: Log every step 4 callback with full details
        if (index === 4) {
            console.log('🔍 [Step 4 Callback] DETAILED:', {
                action,
                type,
                status,
                lifecycle,
                guardFlag: justAdvancedToStep4Ref.current,
                run,
                stepIndex,
                timestamp: new Date().toISOString()
            });
        }

        console.log(`📚 [Tutorial] Callback - Step ${index + 1}, Action: ${action}, Type: ${type}, Status: ${status}`);

        // PRIORITY: Check for completion FIRST before any other logic
        if (finishedStatuses.includes(status)) {
            console.log('✅ Tutorial completed! Status:', status);
            setRun(false);
            setStepIndex(0);
            setIsTypingDemoTriggered(false); // Reset typing demo flag
            setIsCheckboxDemoTriggered(false); // Reset checkbox demo flag
            setIsGenerationDemoTriggered(false); // Reset generation demo flag
            setIsEditDemoTriggered(false); // Reset edit demo flag
            justAdvancedToStep4Ref.current = false; // Reset step 4 flag
            onCloseGenerationDrawer?.();
            onToggleEditMode?.(false); // Turn off edit mode on completion
            tutorialCookies.markTutorialCompleted();
            console.log('🍪 Tutorial cookie set');
            onComplete?.();
            return;
        }

        // Handle close button (X) click - same as skip
        if (action === 'close') {
            setRun(false);
            setStepIndex(0);
            setIsTypingDemoTriggered(false); // Reset typing demo flag
            setIsCheckboxDemoTriggered(false); // Reset checkbox demo flag
            setIsGenerationDemoTriggered(false); // Reset generation demo flag
            setIsEditDemoTriggered(false); // Reset edit demo flag
            justAdvancedToStep4Ref.current = false; // Reset step 4 flag
            onCloseGenerationDrawer?.();
            onToggleEditMode?.(false); // Turn off edit mode on close
            tutorialCookies.markTutorialCompleted();
            onComplete?.();
            return;
        }

        // When user clicks "Next" on step 0 (generation button), pause and open drawer
        if (index === 0 && action === 'next' && type === 'step:after') {
            setRun(false); // Pause the tour
            onOpenGenerationDrawer?.();

            // Wait for drawer to open and element to be positioned
            const waitForElement = () => {
                const element = document.querySelector('[data-tutorial="generation-drawer-title"]');
                if (element && element.getBoundingClientRect().top > 0) {
                    setStepIndex(1);
                    // Small additional delay before showing spotlight
                    setTimeout(() => {
                        setRun(true);
                    }, 100);
                } else {
                    // Keep checking until element is properly positioned
                    setTimeout(waitForElement, 50);
                }
            };

            // Start checking after initial animation delay
            setTimeout(waitForElement, 400);
            return;
        }

        // When user clicks "Next" on step 2 (text generation tab), trigger typing + checkbox animations
        if (index === 2 && action === 'next' && type === 'step:after') {
            console.log('📝 [Tutorial] Triggering typing + checkbox demos, then showing generate button');
            setRun(false); // Pause tour during animations

            // Run typing AND checkbox animations sequentially
            (async () => {
                try {
                    // Mark both as triggered to prevent useEffects from firing
                    setIsTypingDemoTriggered(true);
                    setIsCheckboxDemoTriggered(true);

                    // 1. Type description
                    if (onSimulateTyping) {
                        console.log('🎬 [Tutorial] Auto-typing description...');
                        const description = 'A mystical storm grey British Shorthair cat with divine powers, known as Hermione the All Cat. She has glowing amber eyes and a regal presence.';
                        await onSimulateTyping('[data-tutorial="text-generation-input"]', description);
                        console.log('✅ [Tutorial] Typing complete');
                    }

                    // Small delay before checkboxes
                    await new Promise(r => setTimeout(r, 500));

                    // 2. Check all three boxes
                    if (onTutorialCheckbox) {
                        console.log('🎬 [Tutorial] Auto-checking boxes...');

                        await onTutorialCheckbox('[data-tutorial="legendary-checkbox"]');
                        await new Promise(r => setTimeout(r, 400));

                        await onTutorialCheckbox('[data-tutorial="lair-checkbox"]');
                        await new Promise(r => setTimeout(r, 400));

                        await onTutorialCheckbox('[data-tutorial="spellcasting-checkbox"]');
                        await new Promise(r => setTimeout(r, 400));

                        console.log('✅ [Tutorial] All boxes checked');
                    }

                    // 3. Move to generate button step (step 3)
                    console.log('➡️ [Tutorial] Moving to generate button step');
                    setStepIndex(3);
                    setRun(true);
                } catch (error) {
                    console.error('❌ [Tutorial] Animation error:', error);
                    setStepIndex(3); // Move to next step even on error
                    setRun(true);
                }
            })();
            return;
        }

        // Step 3 → 4 transition: User clicked Next on generate button, trigger generation demo
        if (index === 3 && action === 'next' && type === 'step:after') {
            console.log('➡️ [Tutorial] User clicked Next on step 3, triggering generation demo');

            // Prevent re-triggering if already triggered
            if (isGenerationDemoTriggered) {
                console.log('⏭️ [Tutorial] Generation demo already triggered, skipping');
                return;
            }

            setIsGenerationDemoTriggered(true); // Mark as triggered
            setRun(false); // Pause tour during demo

            (async () => {
                try {
                    // Click the generate button (visual feedback)
                    if (onTutorialClickButton) {
                        console.log('🖱️ [Tutorial] Clicking Generate button');
                        await onTutorialClickButton('[data-tutorial="generate-button"]');
                    }

                    // Simulate loading time
                    console.log('⏳ [Tutorial] Simulating generation (2s)...');
                    await new Promise(r => setTimeout(r, 2000));

                    // Load demo statblock
                    console.log('📜 [Tutorial] Loading Hermione demo statblock');
                    replaceCreatureDetails(HERMIONE_DEMO_STATBLOCK);
                    console.log('✅ [Tutorial] replaceCreatureDetails called');

                    // Wait for canvas to measure and render components
                    console.log('⏳ [Tutorial] Waiting for canvas measurement and render...');
                    await new Promise(r => setTimeout(r, 1000));
                    console.log('✅ [Tutorial] Canvas should now be fully rendered');

                    // Close drawer
                    console.log('🚪 [Tutorial] Closing generation drawer');
                    onCloseGenerationDrawer?.();

                    // Wait for drawer close animation
                    await new Promise(r => setTimeout(r, 300));

                    // Move to canvas step (step 4)
                    console.log('➡️ [Tutorial] Moving to canvas with Hermione visible');
                    justAdvancedToStep4Ref.current = true; // Flag to prevent immediate advancement
                    console.log('🚩 [Tutorial] Set guard flag = true');
                    setStepIndex(4);
                    setRun(true);
                } catch (error) {
                    console.error('❌ [Tutorial] Generation error:', error);
                    setStepIndex(4); // Move to step 4 even on error
                    setRun(true);
                }
            })();

            return;
        }

        // When user clicks "Next" on step 4 (canvas), turn on edit mode for step 5
        if (index === 4 && action === 'next' && type === 'step:after') {
            console.log('🎯 [Step 4→5 Handler] Matched! guardFlag:', justAdvancedToStep4Ref.current);

            // Check if we just programmatically advanced to step 4
            if (justAdvancedToStep4Ref.current) {
                console.log('⏭️ [Tutorial] Step 4 just loaded programmatically, ignoring initial callback');
                // DON'T clear flag here - useEffect handles it after render
                return; // Don't advance yet, wait for actual user click
            }

            console.log('✏️ [Tutorial] User clicked Next on step 4, enabling edit mode');
            onToggleEditMode?.(true);
            setStepIndex(5);
            return;
        }

        // DEBUG: Log any attempt to advance to step 5
        if (index === 5) {
            console.log('🔍 [Step 5 Callback] Edit mode toggle step:', { action, type, status, lifecycle });
        }

        // When user clicks "Next" on step 6 (creature name), trigger edit animation
        if (index === 6 && action === 'next' && type === 'step:after') {
            console.log('✍️ [Tutorial] Triggering edit animation');
            setRun(false); // Pause tour during animation

            (async () => {
                try {
                    setIsEditDemoTriggered(true); // Mark as triggered

                    if (onTutorialEditText) {
                        // Wait a moment before starting animation
                        await new Promise(r => setTimeout(r, 300));

                        // Edit the creature name
                        console.log('✍️ [Tutorial] Editing creature name');
                        await onTutorialEditText('[data-tutorial="creature-name"]', 'Hermione the Divine Protector');

                        // Wait to show the result (1 second "processing time")
                        console.log('⏳ [Tutorial] Processing edit (1s)...');
                        await new Promise(r => setTimeout(r, 1000));

                        // Turn off edit mode
                        console.log('🔒 [Tutorial] Turning off edit mode');
                        onToggleEditMode?.(false);

                        // Wait for toggle animation
                        await new Promise(r => setTimeout(r, 300));

                        // Move to step 7 (edit mode OFF explanation)
                        console.log('➡️ [Tutorial] Moving to edit mode OFF explanation');
                        setStepIndex(7);
                        setRun(true);
                    } else {
                        console.warn('⚠️ [Tutorial] No edit text handler provided');
                        setStepIndex(7);
                        setRun(true);
                    }
                } catch (error) {
                    console.error('❌ [Tutorial] Edit animation error:', error);
                    setStepIndex(7); // Move to next step even on error
                    setRun(true);
                }
            })();
            return;
        }

        // When user clicks "Next" on step 7 (edit mode OFF), handle image upload step
        if (index === 7 && action === 'next' && type === 'step:after') {
            // GUEST USERS: Skip upload step (requires login) and go directly to save button (step 9)
            if (!isLoggedIn) {
                console.log('⏩ [Tutorial] Guest user - skipping upload step, moving to step 9');
                setStepIndex(9);
                return;
            }

            // LOGGED-IN USERS: Show image upload demonstration
            console.log('📤 [Tutorial] Logged-in user - showing image upload');
            setRun(false); // Pause tour while opening drawer

            (async () => {
                try {
                    // Open the generation drawer
                    onOpenGenerationDrawer?.();

                    // Wait for drawer to open
                    await new Promise(r => setTimeout(r, 400));

                    // Switch to image generation tab
                    console.log('🖼️ [Tutorial] Switching to Image Generation tab');
                    onSwitchDrawerTab?.('image');

                    // Wait for tab transition
                    await new Promise(r => setTimeout(r, 300));

                    // Switch to upload sub-tab
                    console.log('📤 [Tutorial] Switching to Upload tab');
                    onSwitchImageTab?.('upload');

                    // Wait for upload tab to render
                    await new Promise(r => setTimeout(r, 300));

                    // Move to step 8 (upload zone)
                    console.log('➡️ [Tutorial] Moving to upload zone step');
                    setStepIndex(8);
                    setRun(true);
                } catch (error) {
                    console.error('❌ [Tutorial] Image upload demo error:', error);
                    setStepIndex(8);
                    setRun(true);
                }
            })();
            return;
        }

        // Handle back button - reopen/close drawer as needed
        if (action === 'prev') {
            if (index === 1) {
                // Going back from drawer to generation button - close drawer
                console.log('⬅️ [Tutorial] Back: closing drawer');
                onCloseGenerationDrawer?.();
            } else if (index === 2) {
                // Going back from text generation tab - reset typing/checkbox flags for potential replay
                console.log('⬅️ [Tutorial] Back: resetting typing/checkbox demos');
                setIsTypingDemoTriggered(false);
                setIsCheckboxDemoTriggered(false);
            } else if (index === 3) {
                // Going back from generate button to text tab - reset typing/checkbox flags
                console.log('⬅️ [Tutorial] Back: resetting typing/checkbox demos');
                setIsTypingDemoTriggered(false);
                setIsCheckboxDemoTriggered(false);
            } else if (index === 9 && !isLoggedIn) {
                // GUEST USERS: Going back from save button (step 9) - skip step 8 and go to step 7
                console.log('⬅️ [Tutorial] Guest user back from step 9 - skipping to step 7');
                setStepIndex(7);
                return;
            } else if (index === 8) {
                // Going back from upload zone to edit OFF - close drawer
                console.log('⬅️ [Tutorial] Back: closing drawer');
                onCloseGenerationDrawer?.();
            } else if (index === 7) {
                // Going back from edit OFF explanation to creature name - turn edit mode ON, reset animation flag
                console.log('⬅️ [Tutorial] Back: re-enabling edit mode');
                onToggleEditMode?.(true);
                setIsEditDemoTriggered(false); // Reset flag so animation can trigger again
            } else if (index === 6) {
                // Going back from creature name to edit toggle - just navigate back
                console.log('⬅️ [Tutorial] Back: returning to edit toggle');
                // Edit mode stays on
            } else if (index === 5) {
                // Going back from edit toggle to canvas - turn off edit mode and reset generation flag
                console.log('⬅️ [Tutorial] Back: disabling edit mode, resetting generation demo');
                onToggleEditMode?.(false);
                setIsEditDemoTriggered(false); // Reset edit demo flag
                setIsGenerationDemoTriggered(false); // Reset generation flag for potential replay
                justAdvancedToStep4Ref.current = false; // Reset step 4 flag so it can wait properly next time
            } else if (index === 4) {
                // Going back from canvas to generate button - reopen drawer and reset generation flag
                console.log('⬅️ [Tutorial] Back: reopening drawer, resetting generation demo');
                setRun(false);
                setStepIndex(3); // Move to generate button
                setIsGenerationDemoTriggered(false); // Reset so user can trigger generation again
                justAdvancedToStep4Ref.current = false; // Reset step 4 flag
                onOpenGenerationDrawer?.();

                // Wait for drawer to reopen before continuing
                const waitForDrawer = () => {
                    const element = document.querySelector('[data-tutorial="generate-button"]');
                    if (element && element.getBoundingClientRect().top > 0) {
                        setTimeout(() => setRun(true), 100);
                    } else {
                        setTimeout(waitForDrawer, 50);
                    }
                };
                setTimeout(waitForDrawer, 400);
                return;
            }
        }

        // Update step index for normal navigation
        // Skip steps with custom handlers: 0 (drawer open), 2 (animations), 3 (generation trigger), 4 (canvas), 6 (edit demo), 7 (image upload)
        // Steps using normal navigation: 1, 5, 8, 9, 10...
        if (type === 'step:after' && action === 'next' && index !== 0 && index !== 2 && index !== 3 && index !== 4 && index !== 6 && index !== 7) {
            console.log(`➡️ [Tutorial] Normal next: ${index} → ${index + 1}`);
            setStepIndex(index + 1);
        } else if (type === 'step:after' && action === 'prev') {
            console.log(`⬅️ [Tutorial] Normal back: ${index} → ${index - 1}`);
            setStepIndex(index - 1);
        }
    };

    // Custom styling to match Mantine theme
    const joyrideStyles: Partial<Styles> = {
        options: {
            primaryColor: theme.colors.blue[6],
            textColor: theme.colors.dark[9],
            backgroundColor: theme.white,
            arrowColor: theme.white,
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10000,
        },
        tooltip: {
            borderRadius: theme.radius.md,
            fontSize: '14px',
            padding: '20px',
        },
        tooltipContent: {
            padding: '10px 0',
        },
        buttonNext: {
            backgroundColor: theme.colors.blue[6],
            borderRadius: theme.radius.sm,
            fontSize: '14px',
            padding: '8px 16px',
        },
        buttonBack: {
            color: theme.colors.gray[7],
            marginRight: '10px',
        },
        buttonSkip: {
            color: theme.colors.gray[6],
        },
    };

    return (
        <Joyride
            key={`tutorial-${stepIndex}`}
            steps={steps}
            run={run}
            stepIndex={stepIndex}
            continuous
            showProgress
            showSkipButton
            callback={handleJoyrideCallback}
            styles={joyrideStyles}
            locale={{
                back: 'Back',
                close: 'Close',
                last: 'Finish',
                next: 'Next',
                skip: 'Skip Tutorial',
            }}
            floaterProps={{
                disableAnimation: false,
            }}
            scrollOffset={100}
            disableOverlayClose
            spotlightClicks
        />
    );
};

