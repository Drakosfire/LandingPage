// StatBlockGenerator.tsx - Main StatBlock Generator Component
// Phase 5: Single-page canvas-first layout with drawer-based generation tools
// Phase 6 (Phase 1 of Unified Navigation): Integrated with UnifiedHeader

import React, { useState, useCallback } from 'react';
import "@mantine/core/styles.css";
import '../../styles/mantineOverrides.css';
import '../../styles/DesignSystem.css';
import '../../styles/CardGeneratorLayout.css';
import '../../styles/CardGeneratorPolish.css';

import { useStatBlockGenerator } from './StatBlockGeneratorProvider';
import { useAuth } from '../../context/AuthContext';
import { STATBLOCK_APP } from '../../context/AppContext';
import { getTemplate, DEFAULT_TEMPLATE } from '../../fixtures/templates';
import { buildPageDocument, extractCustomData } from '../../canvas/data';
import { exportPageToHTMLFile } from '../../canvas/export';

// Import components
import { UnifiedHeader } from '../UnifiedHeader';
import { createStatBlockToolboxSections } from './statblockToolboxConfig';
import Footer from '../Footer';
import FunGenerationFeedback from './shared/FunGenerationFeedback';
import StatBlockProjectsDrawer from './StatBlockProjectsDrawer';
import StatBlockGenerationDrawer from './StatBlockGenerationDrawer';
import StatBlockCanvas from './shared/StatBlockCanvas';
import { TutorialTour } from './TutorialTour';
import { TUTORIAL_HERMIONE_IMAGES } from '../../fixtures/tutorialImages';

// Main component (provider now in App.tsx)
// Phase 5: Simple single-page layout with drawers
const StatBlockGenerator: React.FC = () => {
    const { isLoggedIn } = useAuth();
    const {
        isAnyGenerationInProgress,
        isCanvasEditMode,
        saveStatus,
        error,
        generationDrawerState,
        openGenerationDrawer,
        closeGenerationDrawer,
        setIsCanvasEditMode,
        selectedTemplateId,
        creatureDetails,
        selectedAssets,
        saveNow
    } = useStatBlockGenerator();

    // Drawer state
    const [projectsDrawerOpen, setProjectsDrawerOpen] = useState(false);

    // Tutorial state
    const [forceTutorialRun, setForceTutorialRun] = useState(false);
    const [tutorialGenerationCompleteCallback, setTutorialGenerationCompleteCallback] = useState<(() => void) | null>(null);
    const [isTutorialMockAuth, setIsTutorialMockAuth] = useState(false); // Mock "logged in" for image gen demo

    const handleHelpTutorial = () => {
        console.log('🎓 [Tutorial] Help button clicked, forcing tutorial run');
        setForceTutorialRun(true);
    };

    const handleTutorialComplete = () => {
        setForceTutorialRun(false);
    };

    const handleSetMockAuthState = (enabled: boolean) => {
        console.log(`🎭 [Tutorial] Mock auth state: ${enabled}`);
        setIsTutorialMockAuth(enabled);
    };

    // Tutorial generation completion handler
    const handleTutorialGenerationComplete = useCallback(() => {
        console.log('✅ [Tutorial] Generation simulation complete, calling tutorial callback');
        if (tutorialGenerationCompleteCallback) {
            tutorialGenerationCompleteCallback();
        }
    }, [tutorialGenerationCompleteCallback]);

    // Export handlers (moved from StatBlockHeader for UnifiedHeader integration)
    const handleExportHTML = useCallback(() => {
        const template = getTemplate(selectedTemplateId) ?? DEFAULT_TEMPLATE;
        const customData = extractCustomData(selectedAssets);

        const livePage = buildPageDocument({
            template,
            statblockData: creatureDetails,
            customData,
            projectId: creatureDetails.projectId,
            ownerId: 'current-user',
        });

        exportPageToHTMLFile(livePage, template);
    }, [selectedTemplateId, creatureDetails, selectedAssets]);

    const handleExportPDF = useCallback(() => {
        // Use browser's native print dialog
        // For best results, users should use Firefox and select "Save as PDF"
        const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

        if (!isFirefox) {
            const proceed = window.confirm(
                'For best PDF results, we recommend using Firefox.\n\n' +
                'Firefox provides the most accurate rendering of the statblock layout.\n\n' +
                'Click OK to continue with browser print, or Cancel to switch browsers.'
            );

            if (!proceed) {
                return;
            }
        }

        console.log('📄 Opening browser print dialog...');
        window.print();
    }, []);

    const handleTutorialOpenDrawer = () => {
        openGenerationDrawer({ tab: 'text', isTutorialMode: true });
    };

    const handleTutorialCloseDrawer = () => {
        closeGenerationDrawer();
    };

    const handleTutorialToggleEditMode = (enabled: boolean) => {
        setIsCanvasEditMode(enabled);
    };

    const handleTutorialSwitchDrawerTab = (tab: 'text' | 'image') => {
        console.log(`🔄 [Tutorial] Switching drawer tab to: ${tab}`);
        // Click the tab button to switch
        const tabSelector = tab === 'text'
            ? '[data-tutorial="text-generation-tab"]'
            : '[data-tutorial="image-generation-tab"]';
        const tabButton = document.querySelector<HTMLButtonElement>(tabSelector);
        if (tabButton) {
            tabButton.click();
        } else {
            console.warn(`⚠️ [Tutorial] Tab button not found: ${tabSelector}`);
        }
    };

    const handleTutorialSwitchImageTab = (tab: 'generate' | 'upload' | 'project' | 'library') => {
        console.log(`🔄 [Tutorial] Switching image tab to: ${tab}`);
        // Click the sub-tab button within image generation
        const tabSelector = tab === 'upload' ? '[data-tutorial="upload-tab"]' : `button[value="${tab}"]`;
        const tabButton = document.querySelector<HTMLButtonElement>(tabSelector);
        if (tabButton) {
            tabButton.click();
        } else {
            console.warn(`⚠️ [Tutorial] Image sub-tab button not found: ${tabSelector}`);
        }
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

    const handleTutorialEditText = async (targetSelector: string, newText: string) => {
        console.log(`✍️ [Tutorial Edit] Targeting: ${targetSelector}`);
        console.log(`✍️ [Tutorial Edit] New text: "${newText}"`);

        const element = document.querySelector(targetSelector) as HTMLElement;

        if (!element) {
            console.error(`❌ [Tutorial Edit] Not found: ${targetSelector}`);
            return;
        }

        console.log('✅ [Tutorial Edit] Element found, clicking to activate edit mode...');

        // Click the element to activate editing
        element.click();
        await new Promise(resolve => setTimeout(resolve, 300));

        // Find the contentEditable span inside (EditableText component)
        const editableSpan = element.querySelector('[contenteditable="true"]') as HTMLElement;

        if (!editableSpan) {
            console.error('❌ [Tutorial Edit] No contentEditable element found');
            return;
        }

        console.log('✅ [Tutorial Edit] ContentEditable found, focusing...');
        editableSpan.focus();

        // Select all existing text
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editableSpan);
        selection?.removeAllRanges();
        selection?.addRange(range);

        await new Promise(resolve => setTimeout(resolve, 200));

        // Clear existing text
        console.log('🧹 [Tutorial Edit] Clearing existing text...');
        editableSpan.textContent = '';

        // Dispatch input event to trigger React updates
        editableSpan.dispatchEvent(new Event('input', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 300));

        console.log('🎬 [Tutorial Edit] Typing new text character by character...');

        // Type new text character by character
        for (let i = 0; i < newText.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 50)); // 50ms between characters

            editableSpan.textContent = newText.substring(0, i + 1);

            // Dispatch input event for React to update
            const inputEvent = new Event('input', { bubbles: true });
            editableSpan.dispatchEvent(inputEvent);

            // Log progress every 10 characters
            if ((i + 1) % 10 === 0) {
                console.log(`✍️ [Tutorial Edit] Progress: ${i + 1}/${newText.length} characters`);
            }
        }

        console.log('✅ [Tutorial Edit] Typing complete, waiting before blur...');
        await new Promise(resolve => setTimeout(resolve, 800));

        // Blur to finish editing
        console.log('💾 [Tutorial Edit] Blurring to save changes...');
        editableSpan.blur();

        // Click outside to ensure save
        await new Promise(resolve => setTimeout(resolve, 200));
        const canvas = document.querySelector('[data-tutorial="canvas-area"]') as HTMLElement;
        if (canvas) {
            canvas.click();
        }

        console.log('🎉 [Tutorial Edit] Text editing complete!');
    };

    // Create toolbox sections for UnifiedHeader
    const toolboxSections = createStatBlockToolboxSections({
        isCanvasEditMode,
        setIsCanvasEditMode,
        isLoggedIn,
        saveNow,
        saveStatus,
        handleExportHTML,
        handleExportPDF,
        handleHelpTutorial
    });

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
                onTutorialEditText={handleTutorialEditText}
                onSwitchDrawerTab={handleTutorialSwitchDrawerTab}
                onSwitchImageTab={handleTutorialSwitchImageTab}
                onSetGenerationCompleteCallback={setTutorialGenerationCompleteCallback}
                onSetMockAuthState={handleSetMockAuthState}
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
                isTutorialMockAuth={isTutorialMockAuth}
                tutorialMockImages={isTutorialMockAuth ? TUTORIAL_HERMIONE_IMAGES : []}
                onGenerationComplete={generationDrawerState.isTutorialMode ? handleTutorialGenerationComplete : closeGenerationDrawer}
            />

            {/* Main Content - Full width with UnifiedHeader */}
            <div className="generator-main-content" style={{ paddingLeft: 0, marginLeft: 0 }}>
                {/* Header - UnifiedHeader with toolbox */}
                <UnifiedHeader
                    app={STATBLOCK_APP}
                    toolboxSections={toolboxSections}
                    saveStatus={saveStatus}
                    saveError={error}
                    showProjects={true}
                    onProjectsClick={() => setProjectsDrawerOpen(!projectsDrawerOpen)}
                    showGeneration={true}
                    onGenerationClick={() => generationDrawerState.opened ? closeGenerationDrawer() : openGenerationDrawer()}
                    showAuth={true}
                    showHelp={false}
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
