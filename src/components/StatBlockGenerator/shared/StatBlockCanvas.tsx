import React, { useMemo, useCallback } from 'react';
import { Card, Stack, Text, Group, Button, Switch, Badge } from '@mantine/core';
import { IconDownload, IconEdit, IconLock, IconCheck, IconAlertCircle, IconCloudUpload, IconDeviceFloppy } from '@tabler/icons-react';

import { useStatBlockGenerator } from '../StatBlockGeneratorProvider';
import StatblockPage from '../StatblockPage';
import { getTemplate, DEFAULT_TEMPLATE } from '../../../fixtures/templates';
import { CANVAS_COMPONENT_REGISTRY } from '../../../canvas/registry';
import { buildPageDocument, extractCustomData } from '../../../canvas/data';
import { exportPageToHTMLFile } from '../../../canvas/export';
import TemplateSelector from './TemplateSelector';

const StatBlockCanvas: React.FC = () => {
    const {
        currentStepId,
        isCanvasPreviewReady,
        selectedTemplateId,
        setSelectedTemplateId,
        isCanvasEditMode,
        setIsCanvasEditMode,
        creatureDetails,
        updateCreatureDetails,
        selectedAssets,
        measurementCoordinator, // Phase 1: Get coordinator from provider
        saveStatus, // Phase 3: Save status indicator
        lastSaved, // Phase 3: Last saved timestamp
        saveNow, // Phase 3: Manual save function
        isGenerating // Phase 3: Generation flag to clear canvas during generation
    } = useStatBlockGenerator();

    // DEBUG: Log edit mode state
    console.log('🎨 [StatBlockCanvas] Current edit mode:', isCanvasEditMode);

    const handleToggleEditMode = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.currentTarget.checked;
        console.log('🔄 [StatBlockCanvas] Toggle clicked! Old:', isCanvasEditMode, '→ New:', newValue);
        console.log('🔄 [StatBlockCanvas] setIsCanvasEditMode function:', typeof setIsCanvasEditMode, setIsCanvasEditMode);
        setIsCanvasEditMode(newValue);
        console.log('✅ [StatBlockCanvas] setIsCanvasEditMode called with:', newValue);
    }, [isCanvasEditMode, setIsCanvasEditMode]);

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

    // Phase 3: Save status badge component
    const SaveStatusBadge = useMemo(() => {
        if (saveStatus === 'saving') {
            return (
                <Badge
                    size="sm"
                    variant="light"
                    color="blue"
                    leftSection={<IconCloudUpload size={14} />}
                >
                    Saving...
                </Badge>
            );
        }

        if (saveStatus === 'saved') {
            return (
                <Badge
                    size="sm"
                    variant="light"
                    color="green"
                    leftSection={<IconCheck size={14} />}
                >
                    Saved
                </Badge>
            );
        }

        if (saveStatus === 'error') {
            return (
                <Badge
                    size="sm"
                    variant="light"
                    color="red"
                    leftSection={<IconAlertCircle size={14} />}
                >
                    Save Failed
                </Badge>
            );
        }

        // idle state - show last saved time if available
        if (lastSaved) {
            const date = new Date(lastSaved);
            const timeAgo = Math.floor((Date.now() - date.getTime()) / 1000);
            let timeText = 'Just now';

            if (timeAgo > 60) {
                const minutesAgo = Math.floor(timeAgo / 60);
                timeText = `${minutesAgo}m ago`;
            }

            return (
                <Text size="xs" c="dimmed">
                    Saved {timeText}
                </Text>
            );
        }

        return null;
    }, [saveStatus, lastSaved]);

    const canvasContent = useMemo(() => {
        // Phase 3: Show loading during generation to force canvas rebuild
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

        if (isCanvasPreviewReady) {
            // Get selected template or fall back to default
            const template = getTemplate(selectedTemplateId) ?? DEFAULT_TEMPLATE;

            // Build page document with LIVE creature data from generator state
            const customData = extractCustomData(selectedAssets);

            const livePage = buildPageDocument({
                template,
                statblockData: creatureDetails,
                customData,
                projectId: creatureDetails.projectId,
                ownerId: 'current-user',
            });

            return (
                <Stack gap="md">
                    <Card shadow="sm" padding="md" radius="md" withBorder>
                        <Stack gap="sm">
                            <TemplateSelector
                                currentTemplateId={selectedTemplateId}
                                onTemplateChange={setSelectedTemplateId}
                            />
                            <Group gap="sm" justify="space-between" wrap="wrap">
                                <Group gap="sm">
                                    <Switch
                                        checked={isCanvasEditMode}
                                        onChange={handleToggleEditMode}
                                        label="Edit Mode"
                                        size="sm"
                                        thumbIcon={
                                            isCanvasEditMode ? (
                                                <IconEdit size={12} stroke={3} />
                                            ) : (
                                                <IconLock size={12} stroke={3} />
                                            )
                                        }
                                    />
                                    <Button
                                        leftSection={<IconDeviceFloppy size={16} />}
                                        variant="light"
                                        size="sm"
                                        onClick={saveNow}
                                        loading={saveStatus === 'saving'}
                                        color={saveStatus === 'error' ? 'red' : saveStatus === 'saved' ? 'green' : 'blue'}
                                    >
                                        {saveStatus === 'saving' ? 'Saving...' : 'Save Now'}
                                    </Button>
                                    <Button
                                        leftSection={<IconDownload size={16} />}
                                        variant="light"
                                        size="sm"
                                        onClick={handleExportHTML}
                                    >
                                        Export HTML
                                    </Button>
                                </Group>
                                {SaveStatusBadge}
                            </Group>
                        </Stack>
                    </Card>
                    <Card shadow="sm" padding="sm" radius="md" withBorder>
                        <StatblockPage
                            page={livePage}
                            template={template}
                            componentRegistry={CANVAS_COMPONENT_REGISTRY}
                            isEditMode={isCanvasEditMode}
                            onUpdateData={updateCreatureDetails}
                            measurementCoordinator={measurementCoordinator}
                        />
                    </Card>
                </Stack>
            );
        }

        return (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="sm">
                    <Text fw={500}>Canvas Preview</Text>
                    <Text size="sm" c="dimmed">
                        Canvas content for the {currentStepId ? currentStepId.replace('-', ' ') : 'current'} step will
                        appear here once its tooling is connected. We'll wire this up alongside the upcoming feature
                        work.
                    </Text>
                </Stack>
            </Card>
        );
    }, [
        currentStepId,
        isCanvasPreviewReady,
        selectedTemplateId,
        setSelectedTemplateId,
        creatureDetails,
        selectedAssets,
        isCanvasEditMode, // CRITICAL: Must include for edit mode toggle to work!
        updateCreatureDetails,
        measurementCoordinator,
        handleToggleEditMode,
        handleExportHTML,
        SaveStatusBadge, // Phase 3: Include save status in dependencies
        saveNow, // Phase 3: Manual save function
        saveStatus, // Phase 3: Save status for button color
        isGenerating // Phase 3: CRITICAL - Forces canvas to unmount/rebuild during generation
    ]);

    return (
        <div className="statblock-canvas-area">
            {canvasContent}
        </div>
    );
};

export default StatBlockCanvas;


