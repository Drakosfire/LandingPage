import React, { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step, Styles } from 'react-joyride';
import { useMantineTheme } from '@mantine/core';
import { tutorialSteps } from '../../constants/tutorialSteps';
import { tutorialCookies } from '../../utils/tutorialCookies';
import { HERMIONE_DEMO_STATBLOCK, EMPTY_STATBLOCK } from '../../constants/demoStatblock';
import { useStatBlockGenerator } from './StatBlockGeneratorProvider';

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
}) => {
    const theme = useMantineTheme();
    const { replaceCreatureDetails } = useStatBlockGenerator();
    const [run, setRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [steps, setSteps] = useState<Step[]>(tutorialSteps);
    const [isTypingDemoTriggered, setIsTypingDemoTriggered] = useState(false);
    const [isCheckboxDemoTriggered, setIsCheckboxDemoTriggered] = useState(false);
    const [isGenerationDemoTriggered, setIsGenerationDemoTriggered] = useState(false);

    // Filter steps - only remove conditionally rendered elements (like projects button for non-logged-in users)
    const filterAvailableSteps = () => {
        // List of selectors that are conditionally rendered and should be checked
        const conditionalSelectors = [
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
    // These useEffects are removed as animations happen before showing tooltips

    // Auto-trigger generation demo when step 3 (generate button) is displayed
    useEffect(() => {
        if (stepIndex === 3 && run && !isGenerationDemoTriggered) {
            console.log('🎯 [Tutorial] Step 3 (generate button) loaded, auto-clicking in 1s');

            const genTimer = setTimeout(async () => {
                setIsGenerationDemoTriggered(true); // Mark as triggered
                setRun(false); // Disable Next button during demo
                console.log('🎬 [Tutorial] Auto-starting generation demo');

                if (onTutorialClickButton) {
                    try {
                        // Click the generate button (visual feedback)
                        console.log('🖱️ [Tutorial] Clicking Generate button');
                        await onTutorialClickButton('[data-tutorial="generate-button"]');

                        // Simulate loading time
                        console.log('⏳ [Tutorial] Simulating generation (2s)...');
                        await new Promise(r => setTimeout(r, 2000));

                        // Load demo statblock
                        console.log('📜 [Tutorial] Loading Hermione demo statblock');
                        console.log('📜 [Tutorial] Demo creature name:', HERMIONE_DEMO_STATBLOCK.name);
                        console.log('📜 [Tutorial] Demo has actions:', HERMIONE_DEMO_STATBLOCK.actions?.length);
                        console.log('📜 [Tutorial] Demo has legendary:', HERMIONE_DEMO_STATBLOCK.legendaryActions?.actions?.length);

                        replaceCreatureDetails(HERMIONE_DEMO_STATBLOCK);
                        console.log('✅ [Tutorial] replaceCreatureDetails called');

                        // Wait for canvas to measure and render components
                        // This is critical - canvas needs time to:
                        // 1. Detect creatureDetails change (via useMemo dependencies)
                        // 2. Build page document
                        // 3. Measure all components
                        // 4. Place components on canvas
                        console.log('⏳ [Tutorial] Waiting for canvas measurement and render...');
                        await new Promise(r => setTimeout(r, 1000)); // Increased from 500ms
                        console.log('✅ [Tutorial] Canvas should now be fully rendered');

                        // Close drawer
                        console.log('🚪 [Tutorial] Closing generation drawer');
                        onCloseGenerationDrawer?.();

                        // Wait for drawer close animation
                        await new Promise(r => setTimeout(r, 300));

                        // Move to canvas step (step 4)
                        console.log('➡️ [Tutorial] Moving to canvas with Hermione visible');
                        setStepIndex(4);
                        setRun(true);
                    } catch (error) {
                        console.error('❌ [Tutorial] Generation error:', error);
                        setRun(true); // Re-enable on error
                    }
                } else {
                    console.warn('⚠️ [Tutorial] No button click handler provided');
                    setRun(true);
                }
            }, 1000); // Wait 1s for user to read the step

            return () => clearTimeout(genTimer);
        }
    }, [stepIndex, run, isGenerationDemoTriggered, onTutorialClickButton, replaceCreatureDetails, onCloseGenerationDrawer]);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, index, action, type } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        console.log(`📚 [Tutorial] Callback - Step ${index + 1}, Action: ${action}, Type: ${type}, Status: ${status}`);

        // PRIORITY: Check for completion FIRST before any other logic
        if (finishedStatuses.includes(status)) {
            console.log('✅ Tutorial completed! Status:', status);
            setRun(false);
            setStepIndex(0);
            setIsTypingDemoTriggered(false); // Reset typing demo flag
            setIsCheckboxDemoTriggered(false); // Reset checkbox demo flag
            setIsGenerationDemoTriggered(false); // Reset generation demo flag
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

        // Step 3 → 4 transition: Normal navigation (generation demo happens automatically via useEffect)
        if (index === 3 && action === 'next' && type === 'step:after') {
            console.log('➡️ [Tutorial] Step 3 → 4: Generation will trigger automatically');
            // Don't advance here - the generation useEffect will handle it
            return;
        }

        // When user clicks "Next" on step 4 (canvas), turn on edit mode for step 5
        if (index === 4 && action === 'next' && type === 'step:after') {
            console.log('✏️ [Tutorial] Enabling edit mode');
            onToggleEditMode?.(true);
            setStepIndex(5);
            return;
        }

        // Handle back button - reopen/close drawer as needed
        if (action === 'prev') {
            if (index === 1) {
                // Going back from drawer to generation button - close drawer
                console.log('⬅️ [Tutorial] Back: closing drawer');
                onCloseGenerationDrawer?.();
            } else if (index === 5) {
                // Going back from edit toggle to canvas - turn off edit mode
                console.log('⬅️ [Tutorial] Back: disabling edit mode');
                onToggleEditMode?.(false);
            } else if (index === 4) {
                // Going back from canvas to generate button - reopen drawer
                console.log('⬅️ [Tutorial] Back: reopening drawer to generate button');
                setRun(false);
                setStepIndex(3); // Move to generate button
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
        // Skip automated steps: 0 (drawer open), 2 (animations), 3 (generation), 4 (edit mode toggle)
        if (type === 'step:after' && action === 'next' && index !== 0 && index !== 2 && index !== 3 && index !== 4) {
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

