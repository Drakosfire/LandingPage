// StatBlockHeader.tsx - Header Component for StatBlock Generator
// Phase 5: Added Generation drawer button + canvas controls
import React, { useCallback, useEffect, useState } from 'react';
import { Group, Button, Text, Badge, ActionIcon, Title, Switch, Menu, Box, Drawer, Stack, Anchor, Tooltip } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Link } from 'react-router-dom';
import { IconFolder, IconAlertCircle, IconWand, IconDeviceFloppy, IconDownload, IconEdit, IconLock, IconPrinter, IconFileText, IconHelp } from '@tabler/icons-react';
import { HelpButton } from './HelpButton';
import { useStatBlockGenerator } from './StatBlockGeneratorProvider';
import { useAuth } from '../../context/AuthContext';
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

    const { login, logout } = useAuth();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [navDrawerOpened, { toggle: toggleNavDrawer, close: closeNavDrawer }] = useDisclosure(false);

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

    // Render navigation content for mobile drawer (similar to NavBar.tsx)
    const renderNavContent = () => (
        <Stack
            gap="md"
            justify="flex-start"
            align="center"
            style={{
                height: '100%',
                padding: 'var(--mantine-spacing-md) 0',
            }}
        >
            {/* Close button */}
            <Box style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: 'var(--mantine-spacing-md)' }}>
                <ActionIcon
                    onClick={closeNavDrawer}
                    variant="transparent"
                    size="lg"
                    style={{ color: 'white' }}
                >
                    ✕
                </ActionIcon>
            </Box>

            {/* DungeonMind Logo */}
            <Tooltip label="DungeonMind Home" position="bottom">
                <Anchor component={Link} to="/" onClick={closeNavDrawer}>
                    <img
                        src={`${process.env.PUBLIC_URL}/images/DungeonMindLogo2.png`}
                        alt="DungeonMind"
                        style={{ width: '60px', height: '60px', objectFit: 'contain', cursor: 'pointer', display: 'block' }}
                    />
                </Anchor>
            </Tooltip>

            {/* Nav Items */}
            {[
                { link: '/#app-links', icon: 'WorldBuildingAppsButton3.png', label: 'World Building Apps' },
                { link: '/#about-me', icon: 'AboutMeButtonv2.png', label: 'About Me' },
                { link: '/#contact', icon: 'ContactMeButton.png', label: 'Contact Me' },
                { link: '/blog', icon: 'BlogButton.png', label: 'Blog' },
            ].map((item) => (
                <Tooltip key={item.label} label={item.label} position="bottom">
                    <ActionIcon
                        component={Link}
                        to={item.link}
                        onClick={closeNavDrawer}
                        variant="transparent"
                        size="xl"
                        style={{ width: '60px', height: '60px' }}
                    >
                        <img
                            src={`${process.env.PUBLIC_URL}/images/${item.icon}`}
                            alt={item.label}
                            style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                        />
                    </ActionIcon>
                </Tooltip>
            ))}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Auth Button */}
            <Tooltip label={isLoggedIn ? 'Logout' : 'Login'} position="bottom">
                {isLoggedIn ? (
                    <ActionIcon
                        onClick={() => { logout(); closeNavDrawer(); }}
                        variant="transparent"
                        size="xl"
                        style={{ width: '60px', height: '60px' }}
                    >
                        <img
                            src={`${process.env.PUBLIC_URL}/images/logoutButton.png`}
                            alt="Logout"
                            style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                        />
                    </ActionIcon>
                ) : (
                    <ActionIcon
                        onClick={() => { login(); closeNavDrawer(); }}
                        variant="transparent"
                        size="xl"
                        style={{ width: '60px', height: '60px' }}
                    >
                        <img
                            src={`${process.env.PUBLIC_URL}/images/Login.png`}
                            alt="Login"
                            style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                        />
                    </ActionIcon>
                )}
            </Tooltip>
        </Stack>
    );

    return (
        <>
            {/* Mobile NavBar Drawer */}
            {isMobile && (
                <Drawer
                    opened={navDrawerOpened}
                    onClose={closeNavDrawer}
                    size="60px"
                    position="left"
                    overlayProps={{ opacity: 0.5, blur: 4 }}
                    withCloseButton={false}
                    styles={{
                        content: {
                            backgroundColor: '#4a4e69',
                            color: 'white'
                        }
                    }}
                    zIndex={1003}
                >
                    {renderNavContent()}
                </Drawer>
            )}

            <Group
                justify="space-between"
                p="md"
                className={`statblock-header-sticky ${isScrolled ? 'scrolled' : ''}`}
                style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
            >
                <Group>
                    {/* StatBlock Logo - Mobile Only */}
                    {isMobile && (
                        <ActionIcon
                            onClick={toggleNavDrawer}
                            variant="subtle"
                            size="lg"
                            style={{ minWidth: 44, minHeight: 44 }}
                            aria-label="Open navigation menu"
                        >
                            <img
                                src="https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/e578f198-82c8-429c-b8b8-af2ec452dc00/public"
                                alt="StatBlock Generator"
                                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                            />
                        </ActionIcon>
                    )}
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

                    {isLoggedIn && (
                        <>
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
                        </>
                    )}

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
        </>
    );
};

export default StatBlockHeader;
