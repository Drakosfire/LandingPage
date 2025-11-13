import React, { useMemo } from 'react';
import { Card, Stack, Text } from '@mantine/core';

import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';
import StatblockPage from '../StatblockPage';
import { getTemplate, DEFAULT_TEMPLATE } from '../../../fixtures/templates';
import { CANVAS_COMPONENT_REGISTRY } from '../canvasComponents/componentRegistry';
import { buildPageDocument, extractCustomData } from 'dungeonmind-canvas';
import type { TemplateConfig as BaseTemplateConfig } from 'dungeonmind-canvas';
import type { StatblockPageDocument, ComponentRegistryEntry, TemplateConfig } from '../../../types/statblockCanvas.types';

const StatBlockCanvas: React.FC = () => {
    const {
        isCanvasPreviewReady,
        selectedTemplateId,
        isCanvasEditMode,
        creatureDetails,
        updateCreatureDetails,
        selectedAssets,
        measurementCoordinator,
        isGenerating,
        isLoading,  // Add isLoading to detect project switching
        currentProject  // Add currentProject for key prop
    } = useStatBlockGenerator();

    // Phase 5: Simplified canvas - controls moved to header

    const canvasContent = useMemo(() => {
        // CRITICAL: Show loading during generation AND project loading
        // This forces complete unmount/remount, preventing old component state from lingering
        if (isGenerating) {
            return (
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="sm" align="center" style={{ minHeight: '400px', justifyContent: 'center' }}>
                        <Text fw={500} size="lg">🎲 Generating Creature...</Text>
                        <Text size="sm" c="dimmed">
                            Creating your custom D&D creature with AI
                        </Text>
                    </Stack>
                </Card>
            );
        }

        // CRITICAL FIX: Force unmount during project load to prevent old components from persisting
        if (isLoading) {
            return (
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="sm" align="center" style={{ minHeight: '400px', justifyContent: 'center' }}>
                        <Text fw={500} size="lg">📁 Loading Project...</Text>
                        <Text size="sm" c="dimmed">
                            Switching to new statblock data
                        </Text>
                    </Stack>
                </Card>
            );
        }

        // Check if canvas is truly empty (no creature name)
        // This handles the blank canvas state for first-time users
        const hasCreature = creatureDetails?.name?.trim().length > 0;

        if (isCanvasPreviewReady && hasCreature) {
            // Get selected template or fall back to default
            const template = getTemplate(selectedTemplateId) ?? DEFAULT_TEMPLATE;

            // Build page document with LIVE creature data from generator state
            const customData = extractCustomData(selectedAssets);

            const livePage = buildPageDocument({
                template: template as unknown as BaseTemplateConfig,
                statblockData: creatureDetails,
                customData,
                projectId: creatureDetails.projectId,
                ownerId: 'current-user',
            }) as unknown as StatblockPageDocument;

            return (
                <Card shadow="sm" padding="sm" radius="md" withBorder>
                    <StatblockPage
                        key={currentProject?.id || 'no-project'}  // Force remount on project change
                        page={livePage}
                        template={template}
                        componentRegistry={CANVAS_COMPONENT_REGISTRY as Record<string, ComponentRegistryEntry>}
                        isEditMode={isCanvasEditMode}
                        onUpdateData={updateCreatureDetails}
                        measurementCoordinator={measurementCoordinator}
                    />
                </Card>
            );
        }

        return (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="sm">
                    <Text fw={500}>Canvas Preview</Text>
                    <Text size="sm" c="dimmed">
                        Generate a creature to see the statblock preview. Click "AI Generation" to start.
                    </Text>
                </Stack>
            </Card>
        );
    }, [
        isCanvasPreviewReady,
        selectedTemplateId,
        creatureDetails,
        selectedAssets,
        isCanvasEditMode,
        updateCreatureDetails,
        measurementCoordinator,
        isGenerating,
        isLoading,  // Add to dependencies to rebuild on load state change
        currentProject?.id  // Force rebuild when project changes
    ]);

    return (
        <div className="statblock-canvas-area">
            {canvasContent}
        </div>
    );
};

export default StatBlockCanvas;


