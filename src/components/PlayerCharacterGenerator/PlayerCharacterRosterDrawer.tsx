/**
 * PlayerCharacterRosterDrawer Component
 * 
 * Wrapper component that connects CharacterRoster to the PlayerCharacterGeneratorProvider.
 * Handles business logic for loading, creating, and deleting character projects.
 * 
 * Pattern: Thin wrapper (like StatBlockProjectsDrawer)
 * - Connects to Provider for state and actions
 * - Manages project list loading
 * - Handles user confirmations for destructive actions
 * 
 * @module PlayerCharacterGenerator
 */

import React, { useState, useEffect, useCallback } from 'react';
import CharacterRoster from './CharacterRoster';
import { usePlayerCharacterGenerator, CharacterProjectSummary } from './PlayerCharacterGeneratorProvider';
import { useAuth } from '../../context/AuthContext';

interface PlayerCharacterRosterDrawerProps {
    opened: boolean;
    onClose: () => void;
}

const PlayerCharacterRosterDrawer: React.FC<PlayerCharacterRosterDrawerProps> = ({
    opened,
    onClose
}) => {
    const { isLoggedIn } = useAuth();
    const {
        currentProject,
        character,
        listProjects,
        loadProject,
        deleteProject,
        resetCharacter,
        setWizardStep,
        setDrawerOpen,
        saveStatus,
        clearCurrentProject
    } = usePlayerCharacterGenerator();

    const [projects, setProjects] = useState<CharacterProjectSummary[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);

    // Load projects list from API
    const loadProjectsList = useCallback(async () => {
        if (!isLoggedIn) return;

        setIsLoadingProjects(true);
        try {
            const projectsList = await listProjects();
            setProjects(projectsList);
            console.log('👤 [RosterDrawer] Loaded characters:', projectsList.length);
        } catch (err) {
            console.error('👤 [RosterDrawer] Failed to load characters:', err);
        } finally {
            setIsLoadingProjects(false);
        }
    }, [listProjects, isLoggedIn]);

    // Load projects on mount when logged in
    useEffect(() => {
        if (isLoggedIn) {
            console.log('👤 [RosterDrawer] Initial load on mount');
            loadProjectsList();
        }
    }, [isLoggedIn, loadProjectsList]);

    // Refresh list when drawer opens
    useEffect(() => {
        if (isLoggedIn && opened) {
            console.log('👤 [RosterDrawer] Refreshing on drawer open');
            loadProjectsList();
        }
    }, [isLoggedIn, opened, loadProjectsList]);

    // Refresh list when current project changes
    useEffect(() => {
        if (isLoggedIn && currentProject?.id) {
            console.log('👤 [RosterDrawer] Refreshing after project change:', currentProject.id);
            loadProjectsList();
        }
    }, [isLoggedIn, currentProject?.id, loadProjectsList]);

    /**
     * Handle loading a character project
     */
    const handleLoadProject = async (projectId: string) => {
        // Warn about unsaved changes
        if (saveStatus === 'saving') {
            const confirmSwitch = window.confirm(
                'You have unsaved changes. Are you sure you want to load a different character?'
            );
            if (!confirmSwitch) {
                return;
            }
        }

        try {
            await loadProject(projectId);
            await loadProjectsList(); // Refresh list
        } catch (err) {
            console.error('👤 [RosterDrawer] Failed to load character:', err);
        }
    };

    /**
     * Handle creating a new character
     * Clears current project (so auto-save won't overwrite), resets wizard, opens drawer
     */
    const handleCreateNewCharacter = () => {
        // Warn about unsaved changes if there's a current character with data
        if (character?.name && saveStatus === 'saving') {
            const confirmNew = window.confirm(
                'You have unsaved changes. Are you sure you want to start a new character?'
            );
            if (!confirmNew) {
                return;
            }
        }

        console.log('👤 [RosterDrawer] Creating new character');

        // CRITICAL: Clear current project FIRST (prevents auto-save to old project)
        clearCurrentProject();

        // Reset to empty character
        resetCharacter();

        // Reset wizard to step 0
        setWizardStep(0);

        // Open the creation drawer
        setDrawerOpen(true);

        // Close the roster drawer
        onClose();
    };

    /**
     * Handle deleting a character project
     */
    const handleDeleteProject = async (projectId: string) => {
        try {
            await deleteProject(projectId);
            await loadProjectsList(); // Refresh list
        } catch (err) {
            console.error('👤 [RosterDrawer] Failed to delete character:', err);
            alert('Failed to delete character. Please try again.');
        }
    };

    // Don't render if user is not logged in
    if (!isLoggedIn) {
        return null;
    }

    return (
        <CharacterRoster
            opened={opened}
            onClose={onClose}
            projects={projects}
            currentProjectId={currentProject?.id}
            currentCharacterName={character?.name}
            isLoadingProjects={isLoadingProjects}
            onLoadProject={handleLoadProject}
            onCreateNewCharacter={handleCreateNewCharacter}
            onDeleteProject={handleDeleteProject}
            onRefresh={loadProjectsList}
        />
    );
};

export default PlayerCharacterRosterDrawer;
