// StatBlockGenerator.tsx - Main StatBlock Generator Component
// Phase 5: Single-page canvas-first layout with drawer-based generation tools

import React, { useState } from 'react';
import "@mantine/core/styles.css";
import '../../styles/mantineOverrides.css';
import '../../styles/DesignSystem.css';
import '../../styles/CardGeneratorLayout.css';
import '../../styles/CardGeneratorPolish.css';

import { useStatBlockGenerator } from './StatBlockGeneratorProvider';
import { useAuth } from '../../context/AuthContext';

// Import components
import StatBlockHeader from './StatBlockHeader';
import Footer from '../Footer';
import FunGenerationFeedback from './shared/FunGenerationFeedback';
import StatBlockProjectsDrawer from './StatBlockProjectsDrawer';
import StatBlockGenerationDrawer from './StatBlockGenerationDrawer';
import StatBlockCanvas from './shared/StatBlockCanvas';
import { TutorialTour } from './TutorialTour';

// Main component (provider now in App.tsx)
// Phase 5: Simple single-page layout with drawers
const StatBlockGenerator: React.FC = () => {
    const { isLoggedIn } = useAuth();
    const {
        isAnyGenerationInProgress,
        saveStatus,
        error,
        generationDrawerState,
        openGenerationDrawer,
        closeGenerationDrawer,
        setIsCanvasEditMode
    } = useStatBlockGenerator();

    // Drawer state
    const [projectsDrawerOpen, setProjectsDrawerOpen] = useState(false);

    // Tutorial state
    const [forceTutorialRun, setForceTutorialRun] = useState(false);

    const handleHelpTutorial = () => {
        setForceTutorialRun(true);
    };

    const handleTutorialComplete = () => {
        setForceTutorialRun(false);
    };

    const handleTutorialOpenDrawer = () => {
        openGenerationDrawer({ tab: 'text', isTutorialMode: true });
    };

    const handleTutorialCloseDrawer = () => {
        closeGenerationDrawer();
    };

    const handleTutorialToggleEditMode = (enabled: boolean) => {
        setIsCanvasEditMode(enabled);
    };

    const handleTutorialSimulateTyping = async (targetSelector: string, text: string) => {
        console.log(`⌨️ [Tutorial Typing] Targeting: ${targetSelector}`);
        console.log(`⌨️ [Tutorial Typing] Text length: ${text.length} characters`);

        const element = document.querySelector(targetSelector) as HTMLTextAreaElement | HTMLInputElement;
        if (!element) {
            console.error(`❌ [Tutorial Typing] Could not find element: ${targetSelector}`);
            return;
        }

        console.log('✅ [Tutorial Typing] Element found, focusing...');
        // Focus the element
        element.focus();

        // Clear existing content
        element.value = '';
        console.log('🎬 [Tutorial Typing] Starting character-by-character typing...');

        // Type character by character with typing speed
        for (let i = 0; i < text.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 50)); // 50ms between characters (faster typing)
            element.value = text.substring(0, i + 1);

            // Dispatch input event so React components update
            const inputEvent = new Event('input', { bubbles: true });
            element.dispatchEvent(inputEvent);

            // Also dispatch change event for good measure
            const changeEvent = new Event('change', { bubbles: true });
            element.dispatchEvent(changeEvent);

            // Log progress every 20 characters
            if ((i + 1) % 20 === 0) {
                console.log(`⌨️ [Tutorial Typing] Progress: ${i + 1}/${text.length} characters`);
            }
        }

        console.log('✅ [Tutorial Typing] Typing complete, blurring element...');
        // Wait a moment before blurring
        await new Promise(resolve => setTimeout(resolve, 800));
        element.blur();
        console.log('🎉 [Tutorial Typing] Demo finished');
    };

    const handleTutorialCheckbox = async (selector: string) => {
        console.log(`☑️ [Tutorial Checkbox] Targeting: ${selector}`);
        const checkbox = document.querySelector(selector) as HTMLInputElement;

        if (!checkbox) {
            console.error(`❌ [Tutorial Checkbox] Not found: ${selector}`);
            return;
        }

        console.log(`☑️ [Tutorial Checkbox] Found checkbox, current state: ${checkbox.checked}`);

        if (!checkbox.checked) {
            console.log('✅ [Tutorial Checkbox] Clicking checkbox');
            checkbox.click();
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log('🎉 [Tutorial Checkbox] Checkbox checked');
        } else {
            console.log('ℹ️ [Tutorial Checkbox] Already checked, skipping');
        }
    };

    const handleTutorialClickButton = async (selector: string) => {
        console.log(`🖱️ [Tutorial Click] Targeting: ${selector}`);
        const button = document.querySelector(selector) as HTMLButtonElement;

        if (!button) {
            console.error(`❌ [Tutorial Click] Not found: ${selector}`);
            return;
        }

        console.log(`🖱️ [Tutorial Click] Found button, disabled: ${button.disabled}`);

        if (!button.disabled) {
            console.log('✅ [Tutorial Click] Clicking button');
            button.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log('🎉 [Tutorial Click] Button clicked');
        } else {
            console.log('⚠️ [Tutorial Click] Button is disabled, cannot click');
        }
    };

    return (
        <div className="generator-layout">
            {/* Tutorial Tour */}
            <TutorialTour
                forceRun={forceTutorialRun}
                onComplete={handleTutorialComplete}
                onOpenGenerationDrawer={handleTutorialOpenDrawer}
                onCloseGenerationDrawer={handleTutorialCloseDrawer}
                onToggleEditMode={handleTutorialToggleEditMode}
                onSimulateTyping={handleTutorialSimulateTyping}
                onTutorialCheckbox={handleTutorialCheckbox}
                onTutorialClickButton={handleTutorialClickButton}
            />

            {/* Projects Drawer - Phase 5: Updated to Mantine Drawer */}
            <StatBlockProjectsDrawer
                opened={projectsDrawerOpen}
                onClose={() => setProjectsDrawerOpen(false)}
            />

            {/* Generation Drawer - Phase 5 NEW - Now controlled by provider */}
            <StatBlockGenerationDrawer
                opened={generationDrawerState.opened}
                onClose={closeGenerationDrawer}
                initialTab={generationDrawerState.initialTab}
                initialPrompt={generationDrawerState.initialPrompt}
                isTutorialMode={generationDrawerState.isTutorialMode}
            />

            {/* Main Content - Accounts for nav bar (80px left) */}
            <div className="generator-main-content">
                {/* Header - Fixed at top, right of nav bar */}
                <StatBlockHeader
                    onOpenProjects={() => setProjectsDrawerOpen(true)}
                    onOpenGeneration={() => openGenerationDrawer()}
                    onOpenHelpTutorial={handleHelpTutorial}
                    saveStatus={saveStatus}
                    error={error}
                    isLoggedIn={isLoggedIn}
                />

                {/* Canvas - Primary Interface */}
                <div className="generator-canvas-container" data-tutorial="canvas-area">
                    <StatBlockCanvas />
                </div>

                {/* Generation Feedback Overlay */}
                {isAnyGenerationInProgress && (
                    <FunGenerationFeedback
                        isVisible={isAnyGenerationInProgress}
                        message="Generating your creature..."
                    />
                )}

                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
};

export default StatBlockGenerator;
