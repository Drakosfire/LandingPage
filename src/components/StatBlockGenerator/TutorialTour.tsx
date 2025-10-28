import React, { useEffect, useState, useRef } from 'react';
import Joyride, { CallBackProps, STATUS, Step, Styles } from 'react-joyride';
import { useMantineTheme, Modal, Button, Text, Group, Stack, ThemeIcon } from '@mantine/core';
import { IconCheck, IconSparkles, IconArrowRight } from '@tabler/icons-react';
import {
    tutorialSteps,
    GUEST_TUTORIAL_STEPS,
    LOGGEDIN_TUTORIAL_STEPS,
    TUTORIAL_STEP_NAMES,
    getStepIndex,
    getStepName,
    TutorialStep
} from '../../constants/tutorialSteps';
import { tutorialCookies } from '../../utils/tutorialCookies';
import { HERMIONE_DEMO_STATBLOCK, EMPTY_STATBLOCK } from '../../fixtures/demoStatblocks';
import { useStatBlockGenerator } from './StatBlockGeneratorProvider';
import { useAuth } from '../../context/AuthContext';
import { createChunkHandlerExecutor, getCurrentChunk } from '../../tutorial/utils/chunkUtilities';
import type { TutorialCallbacks } from '../../tutorial/chunks';

/**
 * ============================================
 * TUTORIAL DEBUG UTILITIES (Browser Console)
 * ============================================
 * 
 * Available commands:
 *   window.__TUTORIAL_DEBUG__.jumpToChunk('IMAGE_GENERATION');  // Jump to image gen chunk
 *   window.__TUTORIAL_DEBUG__.jumpToChunk('WELCOME');
 *   window.__TUTORIAL_DEBUG__.jumpToChunk('TEXT_GENERATION');
 *   window.__TUTORIAL_DEBUG__.jumpToChunk('EDITING');
 *   window.__TUTORIAL_DEBUG__.jumpToChunk('COMPLETION');
 * 
 *   window.__TUTORIAL_DEBUG__.jumpToStep('image-gen-tab');      // Jump to specific step
 *   window.__TUTORIAL_DEBUG__.currentChunk();                   // Log current chunk
 *   window.__TUTORIAL_DEBUG__.currentStep();                    // Log current step
 *   window.__TUTORIAL_DEBUG__.currentTotalSteps();              // Log total steps for current user type
 *   window.__TUTORIAL_DEBUG__.listChunks();                     // List all chunks
 *   window.__TUTORIAL_DEBUG__.enableMockAuth();                 // Enable mock auth
 *   window.__TUTORIAL_DEBUG__.disableMockAuth();                // Disable mock auth
 */
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
    const [showCompletionModal, setShowCompletionModal] = useState(false); // Completion popup state

    // Use ref for immediate synchronous updates (no async state delay)
    const justAdvancedToStep4Ref = useRef(false);
    const initializationStartedRef = useRef(false);
    const autoStartInitializedRef = useRef(false);
    const onCloseGenerationDrawerRef = useRef(onCloseGenerationDrawer);

    // Update ref when prop changes
    useEffect(() => {
        onCloseGenerationDrawerRef.current = onCloseGenerationDrawer;
    }, [onCloseGenerationDrawer]);

    // Simple list lookup - no more complex filtering!
    const getTutorialSteps = () => {
        const tutorialList = isLoggedIn ? LOGGEDIN_TUTORIAL_STEPS : GUEST_TUTORIAL_STEPS;
        console.log(`📋 Tutorial: ${tutorialList.length} steps for ${isLoggedIn ? 'logged in' : 'guest'} user`);
        return tutorialList;
    };

    /**
     * TUTORIAL STATE DEFINITION:
     * ==========================
     * A "tutorial state" is a clean slate where:
     * 1. All drawers are closed (generation drawer, projects drawer)
     * 2. Canvas is cleared to empty statblock (EMPTY_STATBLOCK)
     * 3. All tutorial flags are reset (no animations triggered yet)
     * 4. Step index is 0 (first step)
     * 5. Tour is ready to run (run=true)
     * 
     * This ensures a consistent starting point regardless of what state
     * the user was in when they initiated the tutorial.
     */
    useEffect(() => {
        console.log('🎓 [Tutorial] useEffect triggered, forceRun:', forceRun);

        if (forceRun) {
            // TUTORIAL STATE INITIALIZATION
            // Reset to a clean slate for tutorial start
            console.log('🧹 [Tutorial] Initializing clean tutorial state...');

            // 1. Close all drawers
            onCloseGenerationDrawerRef.current?.();
            console.log('🚪 [Tutorial] Closed generation drawer');

            // 2. Clear canvas (blank statblock)
            replaceCreatureDetails(EMPTY_STATBLOCK);
            console.log('🎨 [Tutorial] Cleared canvas to blank statblock');

            // 3. Reset all tutorial flags
            setIsTypingDemoTriggered(false);
            setIsCheckboxDemoTriggered(false);
            setIsGenerationDemoTriggered(false);
            setIsEditDemoTriggered(false);
            justAdvancedToStep4Ref.current = false;
            console.log('🔄 [Tutorial] Reset all tutorial flags');

            // 4. Get steps for user type when manually triggered
            const tutorialSteps = getTutorialSteps();
            setSteps(tutorialSteps);

            // Initialize at step 0
            setStepIndex(0);

            console.log('✅ [Tutorial] Starting tutorial with clean state, run=true');

            // Start the tour
            setTimeout(() => {
                setRun(true);
            }, 100);
            return;
        }

        // Auto-start for first-time users after a delay
        // Only run if tutorial hasn't been manually started
        const hasCompleted = tutorialCookies.hasCompletedTutorial();
        if (!forceRun && !hasCompleted && !autoStartInitializedRef.current) {
            autoStartInitializedRef.current = true; // Mark as started to prevent re-triggering

            const timer = setTimeout(() => {
                // Check if tutorial was manually started while we were waiting
                if (initializationStartedRef.current) {
                    console.log('⏭️ [Tutorial] Manual start occurred, skipping auto-start initialization');
                    return;
                }

                // TUTORIAL STATE INITIALIZATION (Auto-start)
                // Reset to a clean slate for first-time tutorial
                console.log('🧹 [Tutorial] Initializing clean tutorial state for first-time user...');

                // 1. Close all drawers
                onCloseGenerationDrawerRef.current?.();
                console.log('🚪 [Tutorial] Closed generation drawer (auto-start)');

                // 2. Clear canvas (blank statblock)
                replaceCreatureDetails(EMPTY_STATBLOCK);
                console.log('🎨 [Tutorial] Cleared canvas to blank statblock (auto-start)');

                // 3. Reset all tutorial flags
                setIsTypingDemoTriggered(false);
                setIsCheckboxDemoTriggered(false);
                setIsGenerationDemoTriggered(false);
                setIsEditDemoTriggered(false);
                justAdvancedToStep4Ref.current = false;

                // 4. Get steps for user type on auto-start
                const tutorialSteps = getTutorialSteps();
                setSteps(tutorialSteps);
                setStepIndex(0);

                console.log('✅ [Tutorial] Starting tutorial with clean state (auto-start), run=true');

                // Debug: Check if first step target exists
                const firstStepTarget = document.querySelector('[data-tutorial="generation-button"]');
                console.log('🎯 [Tutorial] First step target exists? (auto-start)', !!firstStepTarget, firstStepTarget);

                setRun(true);
            }, 1500); // 1.5s delay to let the page settle

            return () => {
                console.log('🔄 [Tutorial] Auto-start timer cleanup');
                clearTimeout(timer);
            };
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

    /**
     * Create a wrapped chunk handler executor with all callbacks available through closure
     * This allows chunk handlers to call tutorial callbacks without circular dependencies
     */
    const chunkCallbacks: TutorialCallbacks = {
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
    };

    /**
     * Execute a chunk handler if one exists for the current step
     * This is called from handleJoyrideCallback to delegate to chunk-specific logic
     */
    const executeChunkHandler = async (stepName: string | undefined, callbackProps: CallBackProps) => {
        if (!stepName) {
            return;
        }

        const executor = createChunkHandlerExecutor(chunkCallbacks);
        await executor(stepName, callbackProps);
    };

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

        // Debug: Log when tour starts
        if (type === 'tour:start' && status === 'running') {
            const target = steps[index]?.target;
            console.log('🎯 [Tutorial] Tour started! Looking for target:', target);
            const element = typeof target === 'string' ? document.querySelector(target) : null;
            console.log('🎯 [Tutorial] Target element exists?', !!element, element);
        }

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
            autoStartInitializedRef.current = false; // Reset auto-start flag
            onToggleEditMode?.(false); // Turn off edit mode on completion
            tutorialCookies.markTutorialCompleted();
            console.log('🍪 Tutorial cookie set');

            // Clear canvas and open text generation drawer for user to start creating
            console.log('🧹 [Tutorial] Setting up clean state for user to start creating');
            replaceCreatureDetails(EMPTY_STATBLOCK);

            // Wait for canvas to clear, then open generation drawer
            setTimeout(() => {
                console.log('📝 [Tutorial] Opening text generation drawer - ready to create!');
                onOpenGenerationDrawer?.();
                onSwitchDrawerTab?.('text');
            }, 500);

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
            autoStartInitializedRef.current = false; // Reset auto-start flag
            onCloseGenerationDrawerRef.current?.();
            onToggleEditMode?.(false); // Turn off edit mode on close
            tutorialCookies.markTutorialCompleted();
            onComplete?.();
            return;
        }

        /**
         * NEW: Chunk Handler Delegation (Phase 3)
         * =======================================
         * Execute chunk handlers for the current step
         * This is the new architecture: delegate to chunks instead of monolithic callback
         * 
         * The handler will have access to all callbacks through closure,
         * and can call them as needed. Current handlers just log, but this
         * pattern enables sophisticated behavior in the future.
         */
        const currentStepName = getStepName(index);
        if (currentStepName && type === 'step:after' && action === 'next') {
            executeChunkHandler(currentStepName, data).catch(error => {
                console.error('❌ Error in chunk handler:', error);
            });
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
                    onCloseGenerationDrawerRef.current?.();

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

        // IMAGE_LOGIN_REMINDER → Tutorial Complete: Execute final completion sequence
        if (index === 16 && action === 'next' && type === 'step:after') {
            console.log('🎉 [Tutorial] Congratulations step complete, executing final completion sequence');

            // Pause the tour
            setRun(false);
            console.log('⏸️ [Tutorial] Tour paused at final step');

            // Execute completion sequence with delays to ensure proper state transitions
            setTimeout(() => {
                console.log('✅ [Tutorial] Executing completion sequence...');

                // 1. Disable mock auth
                setIsTutorialMockAuth(false);
                onSetMockAuthState?.(false);
                console.log('🔓 [Tutorial] Mock auth disabled');

                // 2. Reset step index
                setStepIndex(0);
                console.log('🔄 [Tutorial] Step index reset to 0');

                // 3. Reset all tutorial flags
                setIsTypingDemoTriggered(false);
                setIsCheckboxDemoTriggered(false);
                setIsGenerationDemoTriggered(false);
                setIsEditDemoTriggered(false);
                justAdvancedToStep4Ref.current = false;
                autoStartInitializedRef.current = false;
                onToggleEditMode?.(false);
                console.log('🔄 [Tutorial] All tutorial flags reset');

                // 4. Mark tutorial as completed
                tutorialCookies.markTutorialCompleted();
                console.log('🍪 [Tutorial] Tutorial marked as completed in cookies');

                // 5. Clear canvas and prepare for user to create independently
                console.log('🧹 [Tutorial] Setting up clean state for independent creation');
                replaceCreatureDetails(EMPTY_STATBLOCK);

                // 6. Show completion modal
                console.log('🎊 [Tutorial] Showing completion modal');
                setShowCompletionModal(true);
            }, 400);
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

        // IMAGE_GEN_TAB → IMAGE_GEN_PROMPT: Skip typing animation (prompt auto-populated from creature sdPrompt)
        if (index === 9 && action === 'next' && type === 'step:after') {
            console.log('📝 [Tutorial] Image gen tab intro complete, moving to prompt step (already auto-populated)');

            // Move directly to IMAGE_GEN_PROMPT step (step 10) - no typing needed
            // The image prompt should already be populated from the creature's sdPrompt field
            console.log('➡️ [Tutorial] Moving to image prompt step (step 10)');
            setStepIndex(10);
            return;
        }

        // IMAGE_GEN_BUTTON → IMAGE_GEN_RESULTS: Click generate, show progress bar, load mock images, show results
        if (index === 11 && action === 'next' && type === 'step:after') {
            console.log('🎨 [Tutorial] Clicking image generate button');
            setRun(false);

            (async () => {
                try {
                    // Click the generate button (this triggers the progress bar animation)
                    if (onTutorialClickButton) {
                        console.log('🖱️ [Tutorial] Clicking image generate button');
                        await onTutorialClickButton('[data-tutorial="image-generate-button"]');
                    }

                    // Wait for progress bar simulation to complete (~9 seconds) + buffer
                    console.log('⏳ [Tutorial] Waiting for progress bar simulation to complete...');
                    await new Promise(r => setTimeout(r, 9500));

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

        // IMAGE_GEN_RESULTS → MODAL_NAVIGATION: Click expand button, navigate to 4th image, explain buttons
        if (index === 12 && action === 'next' && type === 'step:after') {
            console.log('🔍 [Tutorial] Showing expand button and navigating to 4th image');
            setRun(false);

            (async () => {
                try {
                    // Click expand button on first image
                    if (onTutorialClickButton) {
                        console.log('🖱️ [Tutorial] Clicking expand button');
                        await onTutorialClickButton('[data-tutorial="image-expand-button"]');
                    }

                    // Wait for modal to open
                    await new Promise(r => setTimeout(r, 800));

                    // Navigate to 4th image (click next button 3 times)
                    console.log('➡️ [Tutorial] Navigating to 4th image in modal');
                    const nextButton = document.querySelector('[data-tutorial="modal-next-button"]');
                    if (nextButton) {
                        // Click next 3 times to reach image 4
                        for (let i = 0; i < 3; i++) {
                            await new Promise(r => setTimeout(r, 800));
                            (nextButton as HTMLElement).click();
                            console.log(`➡️ [Tutorial] Clicked next button ${i + 1}/3 (now at image ${i + 2})`);
                        }
                    }

                    // Wait for user to see the 4th image
                    await new Promise(r => setTimeout(r, 1000));

                    // Highlight the previous button since we're at the last image
                    console.log('🔍 [Tutorial] Highlighting previous button for navigation explanation');
                    const prevButton = document.querySelector('[data-tutorial="modal-prev-button"]');
                    if (prevButton) {
                        // Add highlighting class to make it clear which button to use
                        (prevButton as HTMLElement).style.border = '2px solid #228be6';
                        (prevButton as HTMLElement).style.borderRadius = '4px';
                        (prevButton as HTMLElement).style.backgroundColor = 'rgba(34, 139, 230, 0.1)';
                        console.log('✨ [Tutorial] Previous button highlighted');
                    }

                    // Move to MODAL_NAVIGATION_EXPLANATION step (step 13 - inside modal)
                    console.log('➡️ [Tutorial] Moving to modal navigation explanation step (step 13)');
                    setStepIndex(13);
                    setRun(true);
                } catch (error) {
                    console.error('❌ [Tutorial] Expand button demo error:', error);
                    setStepIndex(13);
                    setRun(true);
                }
            })();
            return;
        }

        // MODAL_NAVIGATION_EXPLANATION → IMAGE_SELECT: Close modal, proceed to image selection
        if (index === 13 && action === 'next' && type === 'step:after') {
            console.log('🚪 [Tutorial] Closing modal and proceeding to image selection');
            setRun(false);

            (async () => {
                try {
                    // Remove highlighting from navigation buttons before closing
                    console.log('🧹 [Tutorial] Removing button highlighting before closing modal');
                    const prevButton = document.querySelector('[data-tutorial="modal-prev-button"]');
                    const nextButton = document.querySelector('[data-tutorial="modal-next-button"]');

                    if (prevButton) {
                        (prevButton as HTMLElement).style.border = '';
                        (prevButton as HTMLElement).style.borderRadius = '';
                        (prevButton as HTMLElement).style.backgroundColor = '';
                    }
                    if (nextButton) {
                        (nextButton as HTMLElement).style.border = '';
                        (nextButton as HTMLElement).style.borderRadius = '';
                        (nextButton as HTMLElement).style.backgroundColor = '';
                    }

                    // Close modal
                    await new Promise(r => setTimeout(r, 500));
                    const closeButton = document.querySelector('[data-tutorial="modal-close-button"]');
                    if (closeButton) {
                        (closeButton as HTMLElement).click();
                        console.log('🚪 [Tutorial] Closed modal');
                    }

                    // Wait for modal to close
                    await new Promise(r => setTimeout(r, 400));

                    // Move to IMAGE_SELECT step (step 14)
                    console.log('➡️ [Tutorial] Moving to image select step (step 14)');
                    setStepIndex(14);
                    setRun(true);
                } catch (error) {
                    console.error('❌ [Tutorial] Modal close error:', error);
                    setStepIndex(14);
                    setRun(true);
                }
            })();
            return;
        }

        // IMAGE_SELECT → IMAGE_ON_CANVAS: Click 3rd image to select it
        if (index === 14 && action === 'next' && type === 'step:after') {
            console.log('🖼️ [Tutorial] Selecting 3rd image');
            setRun(false);

            (async () => {
                try {
                    // Highlight the 3rd image before selecting it
                    console.log('🔍 [Tutorial] Highlighting 3rd image for selection');
                    const thirdImage = document.querySelector('[data-tutorial="image-result-2"]');
                    if (thirdImage) {
                        // Scroll the image into view first
                        thirdImage.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                            inline: 'center'
                        });
                        console.log('📜 [Tutorial] Scrolled to 3rd image');

                        // Wait for scroll to complete
                        await new Promise(r => setTimeout(r, 500));

                        // Then highlight the image
                        (thirdImage as HTMLElement).style.border = '3px solid #228be6';
                        (thirdImage as HTMLElement).style.borderRadius = '8px';
                        (thirdImage as HTMLElement).style.boxShadow = '0 0 0 2px rgba(34, 139, 230, 0.3)';
                        console.log('✨ [Tutorial] 3rd image highlighted');
                    }

                    // Wait a moment for user to see the highlighting
                    await new Promise(r => setTimeout(r, 1000));

                    // Click 3rd image to select it
                    if (onTutorialClickButton) {
                        console.log('🖱️ [Tutorial] Clicking 3rd image');
                        await onTutorialClickButton('[data-tutorial="image-result-2"]');
                    }

                    // Wait for image to be placed on canvas
                    await new Promise(r => setTimeout(r, 1000));

                    // Close drawer to show canvas
                    console.log('🚪 [Tutorial] Closing drawer to show canvas');
                    onCloseGenerationDrawerRef.current?.();

                    // Wait for drawer close animation AND canvas to settle
                    await new Promise(r => setTimeout(r, 600));

                    // Wait for canvas element to be fully positioned before showing spotlight
                    const waitForCanvasReady = () => {
                        const canvasElement = document.querySelector('[data-tutorial="canvas-area"]');
                        if (canvasElement) {
                            const rect = canvasElement.getBoundingClientRect();
                            const height = rect.height;
                            const width = rect.width;
                            // Check if element exists AND has been measured (has dimensions)
                            if (height > 100 && width > 100) {
                                console.log(`✅ [Tutorial] Canvas fully positioned (${width}x${height}), moving to step 15`);
                                setStepIndex(15);
                                setTimeout(() => setRun(true), 100);
                                return;
                            }
                        }
                        // Log detailed diagnostics
                        if (canvasElement) {
                            const rect = canvasElement.getBoundingClientRect();
                            console.log(`⏳ [Tutorial] Canvas exists but not ready yet: ${rect.width}x${rect.height}px`);
                        } else {
                            console.log('⏳ [Tutorial] Canvas element not found yet');
                        }
                        setTimeout(waitForCanvasReady, 50);
                    };

                    // Add safety timeout (5 seconds max wait)
                    const maxWaitTimeout = setTimeout(() => {
                        console.warn('⚠️ [Tutorial] Canvas positioning timeout - proceeding anyway');
                        setStepIndex(15);
                        setTimeout(() => setRun(true), 100);
                    }, 5000);

                    // Enhanced polling with cleanup
                    const originalWaitForCanvasReady = waitForCanvasReady;
                    const wrappedWait = () => {
                        const canvasElement = document.querySelector('[data-tutorial="canvas-area"]');
                        if (canvasElement) {
                            const rect = canvasElement.getBoundingClientRect();
                            const height = rect.height;
                            const width = rect.width;
                            if (height > 100 && width > 100) {
                                console.log(`✅ [Tutorial] Canvas fully positioned (${width}x${height}), moving to step 15`);
                                clearTimeout(maxWaitTimeout);
                                setStepIndex(15);
                                setTimeout(() => setRun(true), 100);
                                return;
                            }
                        }
                        // Log detailed diagnostics
                        if (canvasElement) {
                            const rect = canvasElement.getBoundingClientRect();
                            console.log(`⏳ [Tutorial] Canvas exists but not ready yet: ${rect.width}x${rect.height}px`);
                        } else {
                            console.log('⏳ [Tutorial] Canvas element not found yet');
                        }
                        setTimeout(wrappedWait, 50);
                    };

                    wrappedWait();
                } catch (error) {
                    console.error('❌ [Tutorial] Image selection error:', error);
                    setStepIndex(15);
                    setRun(true);
                }
            })();
            return;
        }

        // IMAGE_ON_CANVAS → Completion/IMAGE_LOGIN_REMINDER: Begin exit/completion flow
        if (index === 15 && action === 'next' && type === 'step:after') {
            console.log('🎉 [Tutorial] Canvas step complete, transitioning to exit flow');

            // Pause the tour
            setRun(false);
            console.log('⏸️ [Tutorial] Tour paused');

            // For guests: step 15 is the last step, show completion
            // For logged-in: move to step 16 (IMAGE_LOGIN_REMINDER) for congratulations screen
            if (!isLoggedIn) {
                console.log('👤 [Tutorial] Guest user - showing completion at step 15');
                // Execute completion sequence immediately for guests
                setTimeout(() => {
                    console.log('✅ [Tutorial] Executing completion sequence (guest)...');

                    // Reset state
                    setStepIndex(0);
                    setIsTypingDemoTriggered(false);
                    setIsCheckboxDemoTriggered(false);
                    setIsGenerationDemoTriggered(false);
                    setIsEditDemoTriggered(false);
                    justAdvancedToStep4Ref.current = false;
                    autoStartInitializedRef.current = false;
                    onToggleEditMode?.(false);
                    console.log('🔄 [Tutorial] All tutorial flags reset');

                    // Mark tutorial as completed
                    tutorialCookies.markTutorialCompleted();
                    console.log('🍪 [Tutorial] Tutorial marked as completed in cookies');

                    // Clear canvas and prepare for user to create independently
                    console.log('🧹 [Tutorial] Setting up clean state for independent creation');
                    replaceCreatureDetails(EMPTY_STATBLOCK);

                    // Show completion modal
                    console.log('🎊 [Tutorial] Showing completion modal');
                    setShowCompletionModal(true);
                }, 400);
                return;
            }

            // For logged-in users: proceed to step 16 (IMAGE_LOGIN_REMINDER)
            setTimeout(() => {
                console.log('➡️ [Tutorial] Moving to IMAGE_LOGIN_REMINDER step (step 16) - begin exit flow');
                setStepIndex(16);
                setRun(true);
            }, 400);
            return;
        }


        // IMAGE_LOGIN_REMINDER → SAVE: Congratulations and quicksave info, move to save button
        if (index === 16 && action === 'next' && type === 'step:after') {
            console.log('🎉 [Tutorial] Exit flow - congratulations step complete, moving to SAVE button');

            setRun(false);
            console.log('⏸️ [Tutorial] Tour paused');

            // Move to SAVE button step (step 17) - only logged-in users see this
            if (isLoggedIn) {
                setTimeout(() => {
                    console.log('➡️ [Tutorial] Moving to SAVE button step (step 17)');
                    setStepIndex(17);
                    setRun(true);
                }, 400);
            } else {
                // For guests: step 17 (SAVE) is filtered out, move directly to step 18 (HELP)
                console.log('👤 [Tutorial] Guest user - skipping SAVE button, moving to HELP button (step 18)');
                setTimeout(() => {
                    setStepIndex(18);
                    setRun(true);
                }, 400);
            }
            return;
        }

        // SAVE → HELP: Show where to save, move to help button
        if (index === 17 && action === 'next' && type === 'step:after') {
            console.log('💾 [Tutorial] SAVE button step complete, moving to HELP button');

            setRun(false);
            console.log('⏸️ [Tutorial] Tour paused');

            // Move to HELP button step (step 18)
            setTimeout(() => {
                console.log('➡️ [Tutorial] Moving to HELP button step (step 18)');
                setStepIndex(18);
                setRun(true);
            }, 400);
            return;
        }

        // HELP → Complete: Show where tutorial button is, then complete
        if (index === 18 && action === 'next' && type === 'step:after') {
            console.log('❓ [Tutorial] HELP button step complete, executing tutorial completion');

            // Pause the tour
            setRun(false);
            console.log('⏸️ [Tutorial] Tour paused at final step');

            // Execute completion sequence
            setTimeout(() => {
                console.log('✅ [Tutorial] Executing completion sequence...');

                // 1. Disable mock auth
                setIsTutorialMockAuth(false);
                onSetMockAuthState?.(false);
                console.log('🔓 [Tutorial] Mock auth disabled');

                // 2. Reset step index
                setStepIndex(0);
                console.log('🔄 [Tutorial] Step index reset to 0');

                // 3. Reset all tutorial flags
                setIsTypingDemoTriggered(false);
                setIsCheckboxDemoTriggered(false);
                setIsGenerationDemoTriggered(false);
                setIsEditDemoTriggered(false);
                justAdvancedToStep4Ref.current = false;
                autoStartInitializedRef.current = false;
                onToggleEditMode?.(false);
                console.log('🔄 [Tutorial] All tutorial flags reset');

                // 4. Mark tutorial as completed
                tutorialCookies.markTutorialCompleted();
                console.log('🍪 [Tutorial] Tutorial marked as completed in cookies');

                // 5. Clear canvas and prepare for user to create independently
                console.log('🧹 [Tutorial] Setting up clean state for independent creation');
                replaceCreatureDetails(EMPTY_STATBLOCK);

                // 6. Wait for canvas to clear, then open generation drawer on text tab
                setTimeout(() => {
                    console.log('📝 [Tutorial] Opening text generation drawer on text tab');
                    onOpenGenerationDrawer?.();
                    onSwitchDrawerTab?.('text');
                }, 500);

                // 7. Notify parent that tutorial is complete
                onComplete?.();
                console.log('✅ [Tutorial] Completion callback executed');
            }, 400);
            return;
        }

        // Handle back button - reopen/close drawer as needed
        if (action === 'prev') {
            if (index === 1) {
                // Going back from drawer to generation button - close drawer
                console.log('⬅️ [Tutorial] Back: closing drawer');
                onCloseGenerationDrawerRef.current?.();
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
                onCloseGenerationDrawerRef.current?.();
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
        // 7 (edit demo), 8 (edit off→image), 9 (image prompt), 11 (image gen), 13 (image select), 14 (image canvas→select), 15 (canvas→completion), 16 (completion)
        // Steps using normal navigation: 1, 6, 10, 12
        const customHandlerSteps = [0, 2, 3, 4, 5, 7, 8, 9, 11, 13, 14, 15, 16, 17, 18];
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

    /**
     * DEBUG MODE: Jump to a specific tutorial chunk
     * Usage in browser console:
     *   window.__TUTORIAL_DEBUG__.jumpToChunk('IMAGE_GENERATION');
     *   window.__TUTORIAL_DEBUG__.jumpToStep('image-gen-tab');
     */
    useEffect(() => {
        (window as any).__TUTORIAL_DEBUG__ = {
            jumpToChunk: (chunkName: string) => {
                console.log(`🚀 [DEBUG] Jumping to chunk: ${chunkName}`);

                // Map chunk names to their first step
                const chunkFirstSteps: Record<string, string> = {
                    'WELCOME': TUTORIAL_STEP_NAMES.WELCOME,
                    'TEXT_GENERATION': TUTORIAL_STEP_NAMES.TEXT_TAB,
                    'EDITING': TUTORIAL_STEP_NAMES.CANVAS,
                    'IMAGE_GENERATION': TUTORIAL_STEP_NAMES.IMAGE_GEN_TAB,
                    'COMPLETION': TUTORIAL_STEP_NAMES.IMAGE_LOGIN_REMINDER,
                };

                const targetStepName = chunkFirstSteps[chunkName];
                if (!targetStepName) {
                    console.error(`❌ Unknown chunk: ${chunkName}`);
                    return;
                }

                // Get the step index for this step name
                const targetStepIndex = getStepIndex(targetStepName);
                if (targetStepIndex === -1) {
                    console.error(`❌ Step not found: ${targetStepName}`);
                    return;
                }

                console.log(`✅ [DEBUG] Jumping to step ${targetStepIndex} (${targetStepName})`);

                // For IMAGE_GENERATION chunk, we need to set up the state first
                if (chunkName === 'IMAGE_GENERATION') {
                    console.log('🔧 [DEBUG] Setting up state for IMAGE_GENERATION chunk...');
                    // Load Hermione edited state (already has edited name)
                    replaceCreatureDetails(HERMIONE_DEMO_STATBLOCK);
                    // Close drawer initially
                    onCloseGenerationDrawer?.();
                    // Disable edit mode
                    onToggleEditMode?.(false);
                    // Enable mock auth for image generation
                    setIsTutorialMockAuth(true);
                    onSetMockAuthState?.(true);
                    console.log('✅ [DEBUG] State setup complete');

                    // Wait a moment for state to settle, then open drawer with image tab
                    setTimeout(() => {
                        console.log('🖼️ [DEBUG] Opening generation drawer for image tab');
                        // Open the generation drawer
                        onOpenGenerationDrawer?.();

                        // Wait for drawer to open, then switch to image tab
                        setTimeout(() => {
                            console.log('🖼️ [DEBUG] Switching to image generation tab');
                            onSwitchDrawerTab?.('image');

                            // Wait for tab switch, then start the tour
                            setTimeout(() => {
                                console.log('🎬 [DEBUG] Starting tour at IMAGE_GENERATION chunk');
                                setStepIndex(targetStepIndex);
                                setTimeout(() => {
                                    setRun(true);
                                }, 100);
                            }, 300); // Tab transition
                        }, 400); // Drawer open animation
                    }, 200); // State settle
                    return;
                }

                // Jump to step
                setStepIndex(targetStepIndex);

                // Start tour
                setTimeout(() => {
                    setRun(true);
                }, 300);
            },

            jumpToStep: (stepName: string) => {
                console.log(`🚀 [DEBUG] Jumping to step: ${stepName}`);
                const targetStepIndex = getStepIndex(stepName);
                if (targetStepIndex === -1) {
                    console.error(`❌ Step not found: ${stepName}`);
                    return;
                }
                console.log(`✅ [DEBUG] Jumping to step ${targetStepIndex}`);
                setStepIndex(targetStepIndex);
                setTimeout(() => setRun(true), 300);
            },

            currentChunk: () => {
                const chunk = getCurrentChunk(stepIndex, tutorialSteps);
                console.log('📖 Current Chunk:', chunk?.name || 'None');
                return chunk;
            },

            currentStep: () => {
                const stepName = getStepName(stepIndex);
                console.log(`📍 Current Step: ${stepIndex} (${stepName})`);
                return stepName;
            },

            listChunks: () => {
                console.log('📚 Available Chunks:');
                console.log('  - WELCOME');
                console.log('  - TEXT_GENERATION');
                console.log('  - EDITING');
                console.log('  - IMAGE_GENERATION');
                console.log('  - COMPLETION');
            },

            enableMockAuth: () => {
                console.log('🎭 [DEBUG] Enabling mock auth');
                setIsTutorialMockAuth(true);
                onSetMockAuthState?.(true);
            },

            disableMockAuth: () => {
                console.log('🔓 [DEBUG] Disabling mock auth');
                setIsTutorialMockAuth(false);
                onSetMockAuthState?.(false);
            },

            currentTotalSteps: () => {
                const tutorialList = isLoggedIn ? LOGGEDIN_TUTORIAL_STEPS : GUEST_TUTORIAL_STEPS;
                console.log(`📊 Total steps for user: ${tutorialList.length}`);
                return tutorialList.length;
            },
        };

        return () => {
            delete (window as any).__TUTORIAL_DEBUG__;
        };
    }, [stepIndex, tutorialSteps, setStepIndex, setRun, setIsTutorialMockAuth,
        onCloseGenerationDrawer, onToggleEditMode, onSetMockAuthState, replaceCreatureDetails]);

    return (
        <>
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

            {/* Tutorial Completion Modal */}
            <Modal
                opened={showCompletionModal}
                onClose={() => setShowCompletionModal(false)}
                title={
                    <Group gap="sm">
                        <ThemeIcon color="green" size="lg" radius="xl">
                            <IconCheck size={20} />
                        </ThemeIcon>
                        <Text size="xl" fw={600}>Tutorial Complete!</Text>
                    </Group>
                }
                centered
                size="md"
                closeOnClickOutside={false}
                closeOnEscape={false}
                withCloseButton={false}
            >
                <Stack gap="lg">
                    <Text size="lg" ta="center">
                        🎉 Congratulations! You've completed the StatBlock Generator tutorial.
                    </Text>

                    <Text ta="center" c="dimmed">
                        You now know how to:
                    </Text>

                    <Stack gap="xs">
                        <Group gap="sm">
                            <ThemeIcon color="blue" size="sm" radius="xl">
                                <IconCheck size={12} />
                            </ThemeIcon>
                            <Text size="sm">Generate creature text with AI</Text>
                        </Group>
                        <Group gap="sm">
                            <ThemeIcon color="blue" size="sm" radius="xl">
                                <IconCheck size={12} />
                            </ThemeIcon>
                            <Text size="sm">Edit statblock details directly</Text>
                        </Group>
                        <Group gap="sm">
                            <ThemeIcon color="blue" size="sm" radius="xl">
                                <IconCheck size={12} />
                            </ThemeIcon>
                            <Text size="sm">Generate and select creature images</Text>
                        </Group>
                        <Group gap="sm">
                            <ThemeIcon color="blue" size="sm" radius="xl">
                                <IconCheck size={12} />
                            </ThemeIcon>
                            <Text size="sm">Export your creations</Text>
                        </Group>
                    </Stack>

                    <Text ta="center" fw={500} c="blue">
                        Ready to create your own creatures?
                    </Text>

                    <Group justify="center" gap="md">
                        <Button
                            size="lg"
                            rightSection={<IconArrowRight size={16} />}
                            onClick={() => {
                                setShowCompletionModal(false);
                                // Open generation drawer and notify parent
                                setTimeout(() => {
                                    console.log('📝 [Tutorial] Opening text generation drawer on text tab');
                                    onOpenGenerationDrawer?.();
                                    onSwitchDrawerTab?.('text');
                                    onComplete?.();
                                    console.log('✅ [Tutorial] Completion callback executed');
                                }, 300);
                            }}
                        >
                            Try It Yourself!
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
};