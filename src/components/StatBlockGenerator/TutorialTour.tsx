import React, { useEffect, useState, useRef } from 'react';
import Joyride, { CallBackProps, STATUS, Step, Styles } from 'react-joyride';
import { useMantineTheme } from '@mantine/core';
import {
    tutorialSteps,
    TUTORIAL_STEP_NAMES,
    getStepIndex,
    getStepName,
    TutorialStep
} from '../../constants/tutorialSteps';
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
    /** Callback to set the generation complete callback for tutorial mode */
    onSetGenerationCompleteCallback?: (callback: (() => void) | null) => void;
    /** Callback to set mock auth state for tutorial mode */
    onSetMockAuthState?: (enabled: boolean) => void;
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
    onSetGenerationCompleteCallback,
    onSetMockAuthState,
}) => {
    const theme = useMantineTheme();
    const { isLoggedIn } = useAuth();
    const { replaceCreatureDetails } = useStatBlockGenerator();
    const [run, setRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [steps, setSteps] = useState<TutorialStep[]>(tutorialSteps);

    // Helper functions for named step navigation (no more magic numbers!)
    const isStep = (name: string) => getStepName(stepIndex) === name;
    const goToStep = (name: string) => setStepIndex(getStepIndex(name));
    const [isTypingDemoTriggered, setIsTypingDemoTriggered] = useState(false);
    const [isCheckboxDemoTriggered, setIsCheckboxDemoTriggered] = useState(false);
    const [isGenerationDemoTriggered, setIsGenerationDemoTriggered] = useState(false);
    const [isEditDemoTriggered, setIsEditDemoTriggered] = useState(false);
    const [isTutorialMockAuth, setIsTutorialMockAuth] = useState(false); // Mock "logged in" state for tutorial

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
        console.log('🎓 [Tutorial] useEffect triggered, forceRun:', forceRun);
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
            console.log('✅ [Tutorial] Starting tutorial, run=true');
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

    // Clear canvas guard flag after step 5 (canvas) renders
    useEffect(() => {
        if (stepIndex === 5 && justAdvancedToStep4Ref.current && run) {
            console.log('⏰ [Tutorial] Step 5 (canvas) rendered, clearing guard flag after 200ms');
            const timer = setTimeout(() => {
                justAdvancedToStep4Ref.current = false;
                console.log('✅ [Tutorial] Canvas guard flag cleared, ready for user interaction');
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [stepIndex, run]);

    // Auto-trigger edit demo when step 7 (creature name spotlight) user clicks Next
    useEffect(() => {
        if (stepIndex === 7 && run && !isEditDemoTriggered) {
            console.log('🎯 [Tutorial] Step 7 (creature name) loaded, ready to demonstrate editing');
            // Note: The actual animation is triggered by the callback handler when user clicks Next
        }
    }, [stepIndex, run, isEditDemoTriggered]);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, index, action, type, lifecycle } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        /**
         * MIGRATION TO NAMED STEPS:
         * ========================
         * OLD WAY (hardcoded indices - fragile!):
         *   if (index === 3 && action === 'next') { ... setStepIndex(4); }
         * 
         * NEW WAY (semantic names - maintainable!):
         *   if (isStep(TUTORIAL_STEP_NAMES.GENERATE_BUTTON) && action === 'next') { 
         *     ... 
         *     goToStep(TUTORIAL_STEP_NAMES.PROGRESS_BAR); 
         *   }
         * 
         * Benefits:
         * - Add/remove steps without updating every transition
         * - Self-documenting code (no need to count indices)
         * - Find usages by searching for TUTORIAL_STEP_NAMES
         * 
         * TODO: Systematically update all hardcoded index checks below
         */

        // DEBUG: Log every step 5 (canvas) callback with full details
        if (index === 5) {
            console.log('🔍 [Step 5 (Canvas) Callback] DETAILED:', {
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
            setIsTutorialMockAuth(false); // DISABLE mock auth
            onSetMockAuthState?.(false); // Notify parent
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
            setIsTutorialMockAuth(false); // DISABLE mock auth
            onSetMockAuthState?.(false); // Notify parent
            justAdvancedToStep4Ref.current = false; // Reset step 4 flag
            onCloseGenerationDrawer?.();
            onToggleEditMode?.(false); // Turn off edit mode on close
            tutorialCookies.markTutorialCompleted();
            onComplete?.();
            return;
        }

        // WELCOME → DRAWER: User clicked Next, open the generation drawer
        // EXAMPLE OF NEW PATTERN: Using named steps instead of hardcoded indices
        if (isStep(TUTORIAL_STEP_NAMES.WELCOME) && action === 'next' && type === 'step:after') {
            setRun(false); // Pause the tour
            onOpenGenerationDrawer?.();

            // Wait for drawer to open and element to be positioned
            const waitForElement = () => {
                const element = document.querySelector('[data-tutorial="generation-drawer-title"]');
                if (element && element.getBoundingClientRect().top > 0) {
                    goToStep(TUTORIAL_STEP_NAMES.DRAWER); // ← Named step instead of setStepIndex(1)
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

        // Step 3 → 4 transition: User clicked Next on generate button, trigger generation and show progress bar
        if (index === 3 && action === 'next' && type === 'step:after') {
            console.log('➡️ [Tutorial] User clicked Next on step 3 (generate button)');

            // Prevent re-triggering if already triggered
            if (isGenerationDemoTriggered) {
                console.log('⏭️ [Tutorial] Generation demo already triggered, skipping');
                return;
            }

            setIsGenerationDemoTriggered(true); // Mark as triggered
            setRun(false); // Pause tour while we trigger generation

            (async () => {
                try {
                    // Click the generate button to start the simulation
                    if (onTutorialClickButton) {
                        console.log('🖱️ [Tutorial] Clicking Generate button');
                        await onTutorialClickButton('[data-tutorial="generate-button"]');
                    }

                    // Wait for progress bar to render in DOM
                    console.log('⏳ [Tutorial] Waiting for progress bar to render...');
                    const waitForProgressBar = async () => {
                        const maxAttempts = 20; // 2 seconds max
                        for (let i = 0; i < maxAttempts; i++) {
                            const progressBar = document.querySelector('[data-tutorial="progress-bar"]');
                            if (progressBar && progressBar.getBoundingClientRect().height > 0) {
                                console.log('✅ [Tutorial] Progress bar found in DOM');
                                return true;
                            }
                            await new Promise(r => setTimeout(r, 100));
                        }
                        console.warn('⚠️ [Tutorial] Progress bar not found after 2s, continuing anyway');
                        return false;
                    };

                    await waitForProgressBar();

                    // Move to progress bar step (step 4)
                    console.log('➡️ [Tutorial] Moving to progress bar step (step 4)');
                    setStepIndex(4);
                    setRun(true);

                } catch (error) {
                    console.error('❌ [Tutorial] Generation trigger error:', error);
                    setStepIndex(4); // Move to progress bar step even on error
                    setRun(true);
                }
            })();

            return;
        }

        // Step 4 → 5 transition: Progress bar completes, load demo and show canvas
        if (index === 4 && action === 'next' && type === 'step:after') {
            console.log('➡️ [Tutorial] User clicked Next on step 4 (progress bar), loading demo');

            setRun(false); // Pause tour while we load demo

            (async () => {
                try {
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

                    // Move to canvas step (step 5)
                    console.log('➡️ [Tutorial] Moving to canvas with Hermione visible (step 5)');
                    justAdvancedToStep4Ref.current = true; // Flag to prevent immediate advancement
                    console.log('🚩 [Tutorial] Set guard flag = true');
                    setStepIndex(5);
                    setRun(true);

                } catch (error) {
                    console.error('❌ [Tutorial] Demo loading error:', error);
                    setStepIndex(5); // Move to canvas step even on error
                    setRun(true);
                }
            })();

            return;
        }

        // When user clicks "Next" on step 5 (canvas), open toolbox and show edit mode toggle
        if (index === 5 && action === 'next' && type === 'step:after') {
            console.log('🎯 [Step 5→6 Handler] Matched! guardFlag:', justAdvancedToStep4Ref.current);

            // Check if we just programmatically advanced to step 5 (canvas)
            if (justAdvancedToStep4Ref.current) {
                console.log('⏭️ [Tutorial] Step 5 (canvas) just loaded programmatically, ignoring initial callback');
                // DON'T clear flag here - useEffect handles it after render
                return; // Don't advance yet, wait for actual user click
            }

            console.log('🔧 [Tutorial] User clicked Next on step 5 (canvas), opening toolbox menu');
            setRun(false); // Pause during menu open

            // Click toolbox icon to open menu
            const toolboxIcon = document.querySelector('[data-tutorial="app-toolbox"]');
            if (toolboxIcon) {
                (toolboxIcon as HTMLElement).click();
                console.log('✅ [Tutorial] Toolbox menu clicked');
            } else {
                console.error('❌ [Tutorial] Toolbox icon not found!');
            }

            // Wait for menu to open, then show edit mode toggle (step 6)
            setTimeout(() => {
                console.log('➡️ [Tutorial] Moving to edit mode toggle in toolbox (step 6)');
                setStepIndex(6);
                setRun(true);
            }, 400);
            return;
        }

        // When user clicks "Next" on step 6 (edit mode toggle in toolbox), turn ON edit mode and go to creature name
        if (index === 6 && action === 'next' && type === 'step:after') {
            console.log('✏️ [Tutorial] User clicked Next on edit toggle (step 6), enabling edit mode');
            onToggleEditMode?.(true);

            // Wait for edit mode to activate, then go to creature name
            setTimeout(() => {
                console.log('➡️ [Tutorial] Edit mode enabled, moving to creature name (step 7)');
                setStepIndex(7);
            }, 300);
            return;
        }

        // When user clicks "Next" on step 7 (creature name), trigger edit animation and turn OFF edit mode
        if (index === 7 && action === 'next' && type === 'step:after') {
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

                        // Wait to show the result (300ms "processing time")
                        console.log('⏳ [Tutorial] Processing edit (300ms)...');
                        await new Promise(r => setTimeout(r, 300));

                        // Open toolbox to show edit mode toggle being turned OFF
                        console.log('🔧 [Tutorial] Opening toolbox to show edit toggle');
                        const toolboxIcon = document.querySelector('[data-tutorial="app-toolbox"]');
                        if (toolboxIcon) {
                            (toolboxIcon as HTMLElement).click();
                            console.log('✅ [Tutorial] Toolbox menu opened');
                        }

                        // Wait for menu to open
                        await new Promise(r => setTimeout(r, 400));

                        // Move to step 8 (show edit toggle in toolbox, about to turn OFF)
                        console.log('➡️ [Tutorial] Moving to edit toggle OFF step (step 8)');
                        setStepIndex(8);
                        setRun(true);
                    } else {
                        console.warn('⚠️ [Tutorial] No edit text handler provided');
                        setStepIndex(9); // Skip to step 9 on error
                        setRun(true);
                    }
                } catch (error) {
                    console.error('❌ [Tutorial] Edit animation error:', error);
                    setStepIndex(9); // Move to step 9 even on error
                    setRun(true);
                }
            })();
            return;
        }

        // When user clicks "Next" on step 8 (edit mode toggle - turn OFF), disable edit mode and go to image generation
        if (index === 8 && action === 'next' && type === 'step:after') {
            console.log('🔒 [Tutorial] Turning OFF edit mode and moving to image generation');
            setRun(false); // Pause during transitions

            (async () => {
                try {
                    // Turn off edit mode
                    console.log('🔒 [Tutorial] Disabling edit mode');
                    onToggleEditMode?.(false);

                    // Wait for toggle animation
                    await new Promise(r => setTimeout(r, 300));

                    // Close toolbox menu by clicking elsewhere
                    document.body.click();
                    console.log('✅ [Tutorial] Toolbox menu closed');

                    // Wait for menu to close
                    await new Promise(r => setTimeout(r, 300));

                    // ENABLE MOCK AUTH for image generation demo
                    console.log('🎭 [Tutorial] Enabling mock auth state for image generation demo');
                    setIsTutorialMockAuth(true);
                    onSetMockAuthState?.(true);

                    console.log('🖼️ [Tutorial] Opening generation drawer for image generation step');
                    // Open the generation drawer (now with mock auth enabled)
                    onOpenGenerationDrawer?.();

                    // Wait for drawer to open
                    await new Promise(r => setTimeout(r, 400));

                    // Switch to image generation tab
                    console.log('🖼️ [Tutorial] Switching to Image Generation tab');
                    onSwitchDrawerTab?.('image');

                    // Wait for tab transition
                    await new Promise(r => setTimeout(r, 300));

                    // Move to step 9 (image generation tab explanation)
                    console.log('➡️ [Tutorial] Moving to image generation tab step (step 9)');
                    setStepIndex(9);
                    setRun(true);
                } catch (error) {
                    console.error('❌ [Tutorial] Image generation step error:', error);
                    setStepIndex(9);
                    setRun(true);
                }
            })();
            return;
        }

        // IMAGE_GEN_TAB → IMAGE_GEN_PROMPT: Auto-fill image prompt
        if (index === 9 && action === 'next' && type === 'step:after') {
            console.log('📝 [Tutorial] Image gen tab intro complete, auto-filling prompt');
            setRun(false);

            (async () => {
                try {
                    // Auto-type image prompt
                    const imagePrompt = 'A mystical storm grey British Shorthair cat with divine powers, glowing amber eyes, ethereal aura, fantasy digital art';

                    if (onSimulateTyping) {
                        console.log('⌨️ [Tutorial] Auto-typing image prompt...');
                        await onSimulateTyping('[data-tutorial="image-prompt-input"]', imagePrompt);
                        console.log('✅ [Tutorial] Image prompt typed');
                    }

                    // Wait a moment
                    await new Promise(r => setTimeout(r, 500));

                    // Move to IMAGE_GEN_PROMPT step (step 10)
                    console.log('➡️ [Tutorial] Moving to image prompt step (step 10)');
                    setStepIndex(10);
                    setRun(true);
                } catch (error) {
                    console.error('❌ [Tutorial] Image prompt error:', error);
                    setStepIndex(10);
                    setRun(true);
                }
            })();
            return;
        }

        // IMAGE_GEN_BUTTON → IMAGE_GEN_RESULTS: Click generate, load mock images, show results
        if (index === 11 && action === 'next' && type === 'step:after') {
            console.log('🎨 [Tutorial] Clicking image generate button');
            setRun(false);

            (async () => {
                try {
                    // Click the generate button
                    if (onTutorialClickButton) {
                        console.log('🖱️ [Tutorial] Clicking image generate button');
                        await onTutorialClickButton('[data-tutorial="image-generate-button"]');
                    }

                    // Wait for mock images to load and tab to switch to Project
                    console.log('⏳ [Tutorial] Waiting for mock images to load...');
                    await new Promise(r => setTimeout(r, 1500));

                    // Move to IMAGE_GEN_RESULTS step (step 12)
                    console.log('➡️ [Tutorial] Moving to image results grid step (step 12)');
                    setStepIndex(12);
                    setRun(true);
                } catch (error) {
                    console.error('❌ [Tutorial] Image generation error:', error);
                    setStepIndex(12);
                    setRun(true);
                }
            })();
            return;
        }

        // IMAGE_SELECT → IMAGE_ON_CANVAS: Click first image to select it
        if (index === 13 && action === 'next' && type === 'step:after') {
            console.log('🖼️ [Tutorial] Selecting first image');
            setRun(false);

            (async () => {
                try {
                    // Click first image to select it
                    if (onTutorialClickButton) {
                        console.log('🖱️ [Tutorial] Clicking first image');
                        await onTutorialClickButton('[data-tutorial="image-result-0"]');
                    }

                    // Wait for image to be placed on canvas
                    await new Promise(r => setTimeout(r, 1000));

                    // Close drawer to show canvas
                    console.log('🚪 [Tutorial] Closing drawer to show canvas');
                    onCloseGenerationDrawer?.();

                    await new Promise(r => setTimeout(r, 400));

                    // Move to IMAGE_ON_CANVAS step (step 14)
                    console.log('➡️ [Tutorial] Moving to image on canvas step (step 14)');
                    setStepIndex(14);
                    setRun(true);
                } catch (error) {
                    console.error('❌ [Tutorial] Image selection error:', error);
                    setStepIndex(14);
                    setRun(true);
                }
            })();
            return;
        }

        // IMAGE_ON_CANVAS → IMAGE_DELETE: Reopen drawer to show delete button
        if (index === 14 && action === 'next' && type === 'step:after') {
            console.log('🗑️ [Tutorial] Showing delete button');
            setRun(false);

            (async () => {
                try {
                    // Reopen drawer
                    console.log('📂 [Tutorial] Reopening drawer for delete demo');
                    onOpenGenerationDrawer?.();

                    await new Promise(r => setTimeout(r, 400));

                    // Switch to image tab, project subtab
                    onSwitchDrawerTab?.('image');
                    await new Promise(r => setTimeout(r, 300));

                    // Move to IMAGE_DELETE step (step 15)
                    console.log('➡️ [Tutorial] Moving to delete button step (step 15)');
                    setStepIndex(15);
                    setRun(true);
                } catch (error) {
                    console.error('❌ [Tutorial] Delete demo error:', error);
                    setStepIndex(15);
                    setRun(true);
                }
            })();
            return;
        }

        // IMAGE_DELETE → IMAGE_LOGIN_REMINDER: Click delete, show login reminder
        if (index === 15 && action === 'next' && type === 'step:after') {
            console.log('🗑️ [Tutorial] Clicking delete button');
            setRun(false);

            (async () => {
                try {
                    // Click delete button
                    if (onTutorialClickButton) {
                        console.log('🖱️ [Tutorial] Clicking delete button');
                        await onTutorialClickButton('[data-tutorial="image-delete-button"]');
                    }

                    // Wait for delete to complete
                    await new Promise(r => setTimeout(r, 500));

                    // Close drawer
                    onCloseGenerationDrawer?.();
                    await new Promise(r => setTimeout(r, 300));

                    // Move to IMAGE_LOGIN_REMINDER step (step 16)
                    console.log('➡️ [Tutorial] Moving to login reminder step (step 16)');
                    setStepIndex(16);
                    setRun(true);
                } catch (error) {
                    console.error('❌ [Tutorial] Delete click error:', error);
                    setStepIndex(16);
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
            } else if (index === 4) {
                // Going back from progress bar to generate button
                console.log('⬅️ [Tutorial] Back: returning to generate button');
                setIsGenerationDemoTriggered(false); // Reset so user can trigger generation again
            } else if (index === 11 && !isLoggedIn) {
                // GUEST USERS: Going back from save button (step 11) - skip step 10 and go to step 9 (image tab)
                console.log('⬅️ [Tutorial] Guest user back from step 11 - going to step 9');
                setStepIndex(9);
                return;
            } else if (index === 10) {
                // Going back from upload zone to image generation tab
                console.log('⬅️ [Tutorial] Back: returning to image generation tab');
                setStepIndex(9);
                return;
            } else if (index === 9) {
                // Going back from image generation tab to edit OFF - close drawer
                console.log('⬅️ [Tutorial] Back: closing drawer');
                onCloseGenerationDrawer?.();
                setStepIndex(8);
                return;
            } else if (index === 8) {
                // Going back from edit OFF message to creature name - turn edit mode ON, reset animation flag
                console.log('⬅️ [Tutorial] Back: re-enabling edit mode');
                onToggleEditMode?.(true);
                setIsEditDemoTriggered(false); // Reset flag so animation can trigger again
            } else if (index === 7) {
                // Going back from creature name to edit toggle - just navigate back
                console.log('⬅️ [Tutorial] Back: returning to edit toggle');
                // Edit mode stays on
            } else if (index === 6) {
                // Going back from edit toggle to canvas - turn off edit mode and reset generation flag
                console.log('⬅️ [Tutorial] Back: disabling edit mode, resetting generation demo');
                onToggleEditMode?.(false);
                setIsEditDemoTriggered(false); // Reset edit demo flag
                setIsGenerationDemoTriggered(false); // Reset generation flag for potential replay
                justAdvancedToStep4Ref.current = false; // Reset canvas flag so it can wait properly next time
            } else if (index === 5) {
                // Going back from canvas to progress bar - reopen drawer and reset generation flag
                console.log('⬅️ [Tutorial] Back: reopening drawer, resetting generation demo');
                setRun(false);
                setStepIndex(4); // Move to progress bar step
                setIsGenerationDemoTriggered(false); // Reset so user can trigger generation again
                justAdvancedToStep4Ref.current = false; // Reset canvas flag
                onOpenGenerationDrawer?.();

                // Wait for drawer to reopen before continuing
                // Note: Looking for generate button since progress bar won't be visible yet
                const waitForDrawer = () => {
                    const element = document.querySelector('[data-tutorial="text-generation-input"]');
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
        // Skip steps with custom handlers:
        // 0 (drawer open), 2 (animations), 3 (generation trigger), 4 (progress bar), 5 (canvas→toolbox),
        // 7 (edit demo), 8 (edit off→image), 9 (image prompt), 11 (image gen), 13 (image select), 14 (image canvas), 15 (delete)
        // Steps using normal navigation: 1, 6, 10, 12, 16+...
        const customHandlerSteps = [0, 2, 3, 4, 5, 7, 8, 9, 11, 13, 14, 15];
        if (type === 'step:after' && action === 'next' && !customHandlerSteps.includes(index)) {
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

