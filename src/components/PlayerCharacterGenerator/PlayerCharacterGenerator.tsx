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

import React, { useEffect } from 'react';
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
        setDrawerOpen
    } = usePlayerCharacterGenerator();

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

    // Toolbox configuration
    const toolboxSections = createCharacterToolboxSections({
        handleHelpTutorial: undefined, // Phase 2+
        loadDemoCharacter,
        demoCharacterOptions
    });

    // Placeholder handlers for UnifiedHeader
    const handleProjectsClick = () => {
        console.log('📂 [PlayerCharacterGen] Projects (Phase 2+)');
    };

    const handleGenerationClick = () => {
        console.log('🎨 [PlayerCharacterGen] Opening creation drawer');
        setDrawerOpen(true);
    };

    return (
        <div className="generator-layout" data-testid="player-character-generator">
            {/* UnifiedHeader */}
            <UnifiedHeader
                app={CHARACTER_GENERATOR_APP}
                toolboxSections={toolboxSections}
                saveStatus="idle"
                saveError={null}
                showEditMode={true}
                isEditMode={isEditMode}
                onEditModeToggle={setIsEditMode}
                showProjects={true}  // Show projects button (placeholder for Phase 2+)
                onProjectsClick={handleProjectsClick}
                showGeneration={true}  // Phase 1: Enable generation drawer
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
