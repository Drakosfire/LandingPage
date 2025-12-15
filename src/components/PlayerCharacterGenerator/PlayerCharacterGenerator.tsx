/**
 * PlayerCharacterGenerator Main Component
 * 
 * D&D 5e player character creation tool with AI generation and manual workflows.
 * Canvas-first architecture matching StatblockGenerator pattern.
 * 
 * Phase 1: Canvas-based character sheet with wizard-style creation drawer
 * Phase 2+: Full character creation workflow with all features
 * 
 * @module PlayerCharacterGenerator
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import '@mantine/core/styles.css';
import '../../styles/mantineOverrides.css';
import '../../styles/DesignSystem.css';

import { PlayerCharacterGeneratorProvider, usePlayerCharacterGenerator } from './PlayerCharacterGeneratorProvider';
import { UnifiedHeader } from '../UnifiedHeader';
import { CHARACTER_GENERATOR_APP } from '../../context/AppContext';
import { createCharacterToolboxSections } from './characterToolboxConfig';
import { DND_CSS_BASE_URL } from '../../config';
import Footer from '../Footer';
import CharacterCanvas from './shared/CharacterCanvas';
import PlayerCharacterCreationDrawer from './PlayerCharacterCreationDrawer';
import PlayerCharacterRosterDrawer from './PlayerCharacterRosterDrawer';
import { capturePcgPrintSnapshot } from './printDebug';

/**
 * Inner component (has access to context)
 */
const PlayerCharacterGeneratorInner: React.FC = () => {
    const {
        loadDemoCharacter,
        demoCharacterOptions,
        isEditMode,
        setIsEditMode,
        isDrawerOpen,
        setDrawerOpen,
        saveStatus,
        saveProject,
        isUnsavedNewCharacter
    } = usePlayerCharacterGenerator();

    // Compute effective save status for header
    // Show "unsaved" when character has content but no project
    const effectiveSaveStatus = isUnsavedNewCharacter ? 'idle' : saveStatus;

    // Character Roster drawer state
    const [isRosterOpen, setIsRosterOpen] = useState(false);

    const isPrintingRef = useRef(false);
    const isDev = process.env.NODE_ENV !== 'production';

    // Load D&D 5e PHB CSS
    useEffect(() => {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = `${DND_CSS_BASE_URL}/style.css`;
        cssLink.id = 'dnd-phb-css';
        document.head.appendChild(cssLink);

        console.log('📜 [PlayerCharacterGen] Loaded D&D PHB CSS from:', cssLink.href);

        return () => {
            const existing = document.getElementById('dnd-phb-css');
            if (existing) {
                document.head.removeChild(existing);
            }
        };
    }, []);

    const handlePrintPDF = useCallback(async () => {
        // Use browser's native print dialog.
        // For best results, users should use Firefox and select "Save as PDF".
        const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

        if (!isFirefox) {
            const proceed = window.confirm(
                'For best PDF results, we recommend using Firefox.\n\n' +
                'Firefox provides the most accurate rendering of the character sheet layout.\n\n' +
                'Click OK to continue with browser print, or Cancel to switch browsers.'
            );

            if (!proceed) return;
        }

        if (isPrintingRef.current) {
            console.log('⏭️ [PlayerCharacterGen] Print already in progress, ignoring');
            return;
        }

        isPrintingRef.current = true;

        // Optional but improves fidelity: wait for fonts to finish loading before printing.
        try {
            // `document.fonts` may not exist in older browsers.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fontsReady = (document as any)?.fonts?.ready;
            if (fontsReady) {
                await fontsReady;
            }
        } catch (err) {
            console.warn('⚠️ [PlayerCharacterGen] Font readiness check failed:', err);
        }

        // Optional: edit mode adds hover overlays/borders; disable it for print and restore afterward.
        const prevEditMode = isEditMode;
        if (prevEditMode) {
            setIsEditMode(false);
        }

        try {
            // Give React + layout a tiny moment to reflow before opening the print dialog.
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log('📄 [PlayerCharacterGen] Opening browser print dialog...');
            window.print();
        } finally {
            if (prevEditMode) {
                setIsEditMode(true);
            }
            isPrintingRef.current = false;
        }
    }, [isEditMode, setIsEditMode]);

    const handleCapturePrintSnapshot = useCallback(() => {
        if (!isDev) {
            console.log('⏭️ [PCG PrintDebug] Snapshot capture disabled outside development');
            return;
        }

        // Capture the DOM snapshot at the moment print preview is invoked.
        const capture = async () => {
            // Give print media styles a tick to apply before we inline computed styles.
            await new Promise<void>((resolve) => {
                requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
            });
            capturePcgPrintSnapshot({
                rootSelector: '.generator-canvas-container',
                inlineComputedStyles: true,
                dndCssBaseUrl: DND_CSS_BASE_URL,
                title: 'PCG Print Snapshot',
                includeAppStyles: true,
            });
        };

        const handleBeforePrint = () => {
            console.log('🧾 [PCG PrintDebug] beforeprint → capturing snapshot');
            void capture();
        };

        const handleAfterPrint = () => {
            console.log('🧾 [PCG PrintDebug] afterprint → cleanup');
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
        };

        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('afterprint', handleAfterPrint);

        // Safety cleanup (some browsers don't fire afterprint reliably)
        setTimeout(() => {
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
        }, 15000);

        // Trigger print preview — the snapshot is captured via beforeprint.
        window.print();
    }, [isDev]);

    // Toolbox configuration
    const toolboxSections = createCharacterToolboxSections({
        handleHelpTutorial: undefined, // Phase 2+
        handlePrintPDF,
        loadDemoCharacter,
        demoCharacterOptions,
        capturePrintSnapshot: isDev ? handleCapturePrintSnapshot : undefined,
    });

    // Handler for Character Roster drawer (toggle + mutual exclusion)
    const handleProjectsClick = () => {
        if (isRosterOpen) {
            // Toggle: close if already open
            console.log('📂 [PlayerCharacterGen] Closing Character Roster (toggle)');
            setIsRosterOpen(false);
        } else {
            // Close creation drawer, open roster
            console.log('📂 [PlayerCharacterGen] Opening Character Roster');
            setDrawerOpen(false);
            setIsRosterOpen(true);
        }
    };

    // Handler for Creation drawer (toggle + mutual exclusion)
    const handleGenerationClick = () => {
        if (isDrawerOpen) {
            // Toggle: close if already open
            console.log('🎨 [PlayerCharacterGen] Closing creation drawer (toggle)');
            setDrawerOpen(false);
        } else {
            // Close roster drawer, open creation
            console.log('🎨 [PlayerCharacterGen] Opening creation drawer');
            setIsRosterOpen(false);
            setDrawerOpen(true);
        }
    };

    // Handler for manual save button
    const handleSaveClick = async () => {
        console.log('💾 [PlayerCharacterGen] Manual save triggered');
        try {
            await saveProject();
        } catch (err) {
            console.error('❌ [PlayerCharacterGen] Manual save failed:', err);
        }
    };

    return (
        <div className="generator-layout" data-testid="player-character-generator">
            {/* UnifiedHeader */}
            <UnifiedHeader
                app={CHARACTER_GENERATOR_APP}
                toolboxSections={toolboxSections}
                saveStatus={effectiveSaveStatus}
                saveError={null}
                onSaveClick={handleSaveClick}
                isUnsaved={isUnsavedNewCharacter}
                showEditMode={true}
                isEditMode={isEditMode}
                onEditModeToggle={setIsEditMode}
                showProjects={true}  // Character Roster (Phase 4)
                onProjectsClick={handleProjectsClick}
                showGeneration={true}  // Creation Wizard drawer
                onGenerationClick={handleGenerationClick}
                showAuth={true}
                showHelp={false}  // Phase 2+
            />

            {/* Canvas Content Area */}
            <div
                className="generator-canvas-container"
                style={{
                    padding: '24px',
                    minHeight: 'calc(100vh - 88px - 60px)', // Header + Footer
                    background: '#f5f5f5',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start'
                }}
            >
                <div style={{
                    maxWidth: '100%',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <CharacterCanvas />
                </div>
            </div>

            {/* Player Character Creation Drawer */}
            <PlayerCharacterCreationDrawer
                opened={isDrawerOpen}
                onClose={() => setDrawerOpen(false)}
            />

            {/* Character Roster Drawer (Phase 4) */}
            <PlayerCharacterRosterDrawer
                opened={isRosterOpen}
                onClose={() => setIsRosterOpen(false)}
            />

            {/* Footer */}
            <Footer />
        </div>
    );
};

/**
 * PlayerCharacterGenerator Main Component
 * 
 * Wraps the app in PlayerCharacterGeneratorProvider
 */
export const PlayerCharacterGenerator: React.FC = () => {
    return (
        <PlayerCharacterGeneratorProvider>
            <PlayerCharacterGeneratorInner />
        </PlayerCharacterGeneratorProvider>
    );
};

export default PlayerCharacterGenerator;
