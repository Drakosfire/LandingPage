// StatBlockHeader.tsx - Header Component for StatBlock Generator
// Phase 5: Added Generation drawer button + canvas controls
import React, { useCallback } from 'react';
import { Group, Button, Text, Badge, ActionIcon, Title, Switch } from '@mantine/core';
import { IconFolder, IconAlertCircle, IconTestPipe, IconWand, IconDeviceFloppy, IconDownload, IconEdit, IconLock } from '@tabler/icons-react';
import { useStatBlockGenerator } from './StatBlockGeneratorProvider';
import { getTemplate, DEFAULT_TEMPLATE } from '../../fixtures/templates';
import { buildPageDocument, extractCustomData } from '../../canvas/data';
import { exportPageToHTMLFile } from '../../canvas/export';

interface StatBlockHeaderProps {
    onOpenProjects: () => void;
    onOpenGeneration: () => void;  // Phase 5: NEW
    onLoadDemo?: () => void;
    saveStatus: 'idle' | 'saving' | 'saved' | 'error';
    error: string | null;
    isLoggedIn?: boolean;  // Phase 4: Hide Projects button if not logged in
}

const StatBlockHeader: React.FC<StatBlockHeaderProps> = ({
    onOpenProjects,
    onOpenGeneration,  // Phase 5: NEW
    onLoadDemo,
    saveStatus,
    error,
    isLoggedIn = false
}) => {
    const {
        isCanvasEditMode,
        setIsCanvasEditMode,
        selectedTemplateId,
        creatureDetails,
        selectedAssets,
        saveNow
    } = useStatBlockGenerator();

    const handleToggleEditMode = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setIsCanvasEditMode(event.currentTarget.checked);
    }, [setIsCanvasEditMode]);

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

    const getSaveStatusBadge = () => {
        switch (saveStatus) {
            case 'saving':
                return <Badge color="yellow" variant="light">Saving...</Badge>;
            case 'saved':
                return <Badge color="green" variant="light">Saved</Badge>;
            case 'error':
                return <Badge color="red" variant="light">Error</Badge>;
            default:
                return null;
        }
    };

    return (
        <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
            <Group>
                <Title order={2}>StatBlock Generator</Title>
                <Text size="sm" c="dimmed">Create D&D 5e Creatures</Text>
            </Group>

            <Group gap="md">
                {/* Canvas Controls - Phase 5: Moved from canvas */}
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

                {getSaveStatusBadge()}
                {error && (
                    <ActionIcon color="red" variant="light">
                        <IconAlertCircle size={16} />
                    </ActionIcon>
                )}

                <Button
                    leftSection={<IconDeviceFloppy size={16} />}
                    variant="light"
                    size="sm"
                    onClick={saveNow}
                    loading={saveStatus === 'saving'}
                    color={saveStatus === 'error' ? 'red' : saveStatus === 'saved' ? 'green' : 'blue'}
                >
                    Save Now
                </Button>

                <Button
                    leftSection={<IconDownload size={16} />}
                    variant="light"
                    size="sm"
                    onClick={handleExportHTML}
                >
                    Export
                </Button>

                {/* Phase 5: Prominent Generation Button */}
                <Button
                    leftSection={<IconWand size={16} />}
                    variant="gradient"
                    gradient={{ from: 'violet', to: 'cyan' }}
                    onClick={onOpenGeneration}
                >
                    AI Generation
                </Button>

                {onLoadDemo && (
                    <Button
                        leftSection={<IconTestPipe size={16} />}
                        variant="light"
                        color="violet"
                        onClick={onLoadDemo}
                        size="sm"
                    >
                        Load Demo
                    </Button>
                )}
                {isLoggedIn && (
                    <Button
                        leftSection={<IconFolder size={16} />}
                        variant="outline"
                        onClick={onOpenProjects}
                        size="sm"
                    >
                        Projects
                    </Button>
                )}
            </Group>
        </Group>
    );
};

export default StatBlockHeader;
