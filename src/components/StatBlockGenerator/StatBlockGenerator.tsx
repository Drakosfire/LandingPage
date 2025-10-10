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
        closeGenerationDrawer
    } = useStatBlockGenerator();

    // Drawer state
    const [projectsDrawerOpen, setProjectsDrawerOpen] = useState(false);

    return (
        <div className="generator-layout">
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
            />

            {/* Main Content - Accounts for nav bar (80px left) */}
            <div className="generator-main-content">
                {/* Header - Fixed at top, right of nav bar */}
                <StatBlockHeader
                    onOpenProjects={() => setProjectsDrawerOpen(true)}
                    onOpenGeneration={() => openGenerationDrawer()}
                    saveStatus={saveStatus}
                    error={error}
                    isLoggedIn={isLoggedIn}
                />

                {/* Canvas - Primary Interface */}
                <div className="generator-canvas-container">
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
