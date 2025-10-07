// StatBlockGenerator.tsx - Main StatBlock Generator Component
// Phase 5: Single-page canvas-first layout with drawer-based generation tools

import React, { useState } from 'react';
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import dungeonMindTheme from '../../config/mantineTheme';
import '../../styles/mantineOverrides.css';
import '../../styles/DesignSystem.css';
import '../../styles/CardGeneratorLayout.css';
import '../../styles/CardGeneratorPolish.css';

import { StatBlockGeneratorProvider, useStatBlockGenerator } from './StatBlockGeneratorProvider';
import { useAuth } from '../../context/AuthContext';

// Import components
import StatBlockHeader from './StatBlockHeader';
import Footer from '../Footer';
import FunGenerationFeedback from './shared/FunGenerationFeedback';
import StatBlockProjectsDrawer from './StatBlockProjectsDrawer';
import StatBlockGenerationDrawer from './StatBlockGenerationDrawer';
import StatBlockCanvas from './shared/StatBlockCanvas';

// Main component content (wrapped by provider)
// Phase 5: Simple single-page layout with drawers
const StatBlockGeneratorContent: React.FC = () => {
    const { isLoggedIn } = useAuth();
    const {
        isAnyGenerationInProgress,
        saveStatus,
        error,
        loadDemoData
    } = useStatBlockGenerator();

    // Drawer state
    const [projectsDrawerOpen, setProjectsDrawerOpen] = useState(false);
    const [generationDrawerOpen, setGenerationDrawerOpen] = useState(false);

    return (
        <div className="generator-layout">
            {/* Projects Drawer - Phase 5: Updated to Mantine Drawer */}
            <StatBlockProjectsDrawer
                opened={projectsDrawerOpen}
                onClose={() => setProjectsDrawerOpen(false)}
            />

            {/* Generation Drawer - Phase 5 NEW */}
            <StatBlockGenerationDrawer
                opened={generationDrawerOpen}
                onClose={() => setGenerationDrawerOpen(false)}
            />

            {/* Main Content - Accounts for nav bar (80px left) */}
            <div className="generator-main-content">
                {/* Header - Fixed at top, right of nav bar */}
                <StatBlockHeader
                    onOpenProjects={() => setProjectsDrawerOpen(true)}
                    onOpenGeneration={() => setGenerationDrawerOpen(true)}
                    onLoadDemo={loadDemoData}
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

// Main exported component with provider wrapper
const StatBlockGenerator: React.FC = () => {
    return (
        <MantineProvider theme={dungeonMindTheme}>
            <StatBlockGeneratorProvider>
                <StatBlockGeneratorContent />
            </StatBlockGeneratorProvider>
        </MantineProvider>
    );
};

export default StatBlockGenerator;
