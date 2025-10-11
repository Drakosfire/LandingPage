// StatBlockHeader.tsx - Header Component for StatBlock Generator
// Phase 5: Added Generation drawer button + canvas controls
import React, { useCallback, useEffect, useState } from 'react';
import { Group, Button, Text, Badge, ActionIcon, Title, Switch, Menu, Box } from '@mantine/core';
import { IconFolder, IconAlertCircle, IconWand, IconDeviceFloppy, IconDownload, IconEdit, IconLock, IconPrinter, IconFileText, IconHelp } from '@tabler/icons-react';
import { HelpButton } from './HelpButton';
import { useStatBlockGenerator } from './StatBlockGeneratorProvider';
import { getTemplate, DEFAULT_TEMPLATE } from '../../fixtures/templates';
import { buildPageDocument, extractCustomData } from '../../canvas/data';
import { exportPageToHTMLFile } from '../../canvas/export';

interface StatBlockHeaderProps {
    onOpenProjects: () => void;
    onOpenGeneration: () => void;
    onOpenHelpTutorial?: () => void;
    saveStatus: 'idle' | 'saving' | 'saved' | 'error';
    error: string | null;
    isLoggedIn?: boolean;
}

const StatBlockHeader: React.FC<StatBlockHeaderProps> = ({
    onOpenProjects,
    onOpenGeneration,
    onOpenHelpTutorial,
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
        saveNow,
        isDemo
    } = useStatBlockGenerator();

    // Track scroll state for enhanced visual feedback
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    const handleExportPDF = useCallback(() => {
        // Use browser's native print dialog
        // For best results, users should use Firefox and select "Save as PDF"
        // Future enhancement: Server-side PDF generation with Playwright (see backlog)

        const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

        if (!isFirefox) {
            // Warn non-Firefox users about potential rendering issues
            const proceed = window.confirm(
                'For best PDF results, we recommend using Firefox.\n\n' +
                'Firefox provides the most accurate rendering of the statblock layout.\n\n' +
                'Click OK to continue with browser print, or Cancel to switch browsers.'
            );

            if (!proceed) {
                return;
            }
        }

        console.log('📄 Opening browser print dialog...');
        window.print();
    }, []);

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
        <Group
            justify="space-between"
            p="md"
            className={`statblock-header-sticky ${isScrolled ? 'scrolled' : ''}`}
            style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
        >
            <Group>
                <Title order={2}>StatBlock Generator</Title>
                {isDemo && (
                    <Badge
                        color="blue"
                        variant="light"
                        size="lg"
                        style={{ cursor: 'help' }}
                        title="This is a demo creature. Click 'Projects' → 'New Project' to create your own!"
                    >
                        Demo
                    </Badge>
                )}
            </Group>

            <Group gap="md">
                {/* Canvas Controls - Phase 5: Moved from canvas */}
                <Box data-tutorial="edit-mode-toggle">
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
                        styles={{
                            track: {
                                minHeight: 28,
                                cursor: 'pointer'
                            }
                        }}
                    />
                </Box>

                {getSaveStatusBadge()}
                {error && (
                    <ActionIcon
                        color="red"
                        variant="light"
                        size="md"
                        style={{ minWidth: 36, minHeight: 36 }}
                    >
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
                    style={{ minHeight: 38 }}
                    data-tutorial="save-button"
                >
                    Save Now
                </Button>

                <Menu shadow="md" width={200}>
                    <Menu.Target>
                        <Button
                            leftSection={<IconDownload size={16} />}
                            variant="light"
                            size="sm"
                            style={{ minHeight: 38 }}
                            data-tutorial="export-menu"
                        >
                            Export
                        </Button>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Item
                            leftSection={<IconFileText size={14} />}
                            onClick={handleExportHTML}
                        >
                            Export as HTML
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconPrinter size={14} />}
                            onClick={handleExportPDF}
                        >
                            Export as PDF
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>

                {/* Phase 5: Prominent Generation Button */}
                <Button
                    leftSection={<IconWand size={16} />}
                    variant="gradient"
                    gradient={{ from: 'violet', to: 'cyan' }}
                    onClick={onOpenGeneration}
                    style={{ minHeight: 44 }}
                    data-tutorial="generation-button"
                >
                    Generation
                </Button>
                {isLoggedIn && (
                    <Button
                        leftSection={<IconFolder size={16} />}
                        variant="outline"
                        onClick={onOpenProjects}
                        size="sm"
                        style={{ minHeight: 38 }}
                        data-tutorial="projects-button"
                    >
                        Projects
                    </Button>
                )}
                {/* Help Button for Tutorial */}
                {onOpenHelpTutorial && (
                    <HelpButton onClick={onOpenHelpTutorial} />
                )}
            </Group>
        </Group>
    );
};

export default StatBlockHeader;
