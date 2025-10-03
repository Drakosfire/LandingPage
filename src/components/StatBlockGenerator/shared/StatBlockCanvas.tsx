import React, { useMemo, useCallback } from 'react';
import { Card, Stack, Text, Group, Button, Switch } from '@mantine/core';
import { IconDownload, IconEdit, IconLock } from '@tabler/icons-react';

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
        selectedAssets
    } = useStatBlockGenerator();

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

    const canvasContent = useMemo(() => {
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
                            <Group gap="sm">
                                <Switch
                                    checked={isCanvasEditMode}
                                    onChange={(event) => setIsCanvasEditMode(event.currentTarget.checked)}
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
                                    leftSection={<IconDownload size={16} />}
                                    variant="light"
                                    size="sm"
                                    onClick={handleExportHTML}
                                    flex={1}
                                >
                                    Export HTML
                                </Button>
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
    }, [currentStepId, isCanvasPreviewReady, selectedTemplateId, setSelectedTemplateId, creatureDetails, selectedAssets]);

    return (
        <div className="statblock-canvas-area">
            {canvasContent}
        </div>
    );
};

export default StatBlockCanvas;


