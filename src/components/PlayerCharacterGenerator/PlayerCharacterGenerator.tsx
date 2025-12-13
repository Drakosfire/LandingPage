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

import React, { useEffect, useState } from 'react';
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
