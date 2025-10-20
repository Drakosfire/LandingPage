// src/components/UnifiedHeader.tsx
// Unified horizontal navigation header for all DungeonMind apps
import React, { useState, useEffect, ReactNode } from 'react';
import { Group, ActionIcon, Box, Badge, Title } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconHelp } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { useAppContext, AppMetadata } from '../context/AppContext';
import { NavigationDrawer } from './NavigationDrawer';
import { AppToolbox, ToolboxSection } from './AppToolbox';

/**
 * UnifiedHeader props
 */
export interface UnifiedHeaderProps {
    // App metadata (overrides AppContext if provided)
    app?: AppMetadata;

    // Control slots (DEPRECATED - use toolboxSections instead)
    leftControls?: ReactNode[];        // Controls displayed after title (desktop/tablet)
    rightControls?: ReactNode[];       // Controls displayed before auth button

    // App Toolbox (NEW - preferred over rightControls)
    toolboxSections?: ToolboxSection[]; // Toolbox sections for app controls
    showToolbox?: boolean;              // Show app toolbox (default: true if toolboxSections provided)

    // Save Status (optional)
    saveStatus?: 'idle' | 'saving' | 'saved' | 'error'; // Save status indicator
    saveError?: string | null;          // Error message if saveStatus is 'error'

    // Projects Button (optional)
    showProjects?: boolean;             // Show projects button (default: false)
    onProjectsClick?: () => void;       // Projects button click handler
    projectsIconUrl?: string;           // Custom projects icon URL

    // Generation Button (optional)
    showGeneration?: boolean;           // Show generation button (default: false)
    onGenerationClick?: () => void;     // Generation button click handler
    generationIconUrl?: string;         // Custom generation icon URL

    // Feature flags
    showAuth?: boolean;                // Show login/logout button (default: true)
    showHelp?: boolean;                // Show help/tutorial button (default: false)

    // Callbacks
    onHelpClick?: () => void;          // Help button click handler

    // Mobile overrides
    mobileTitle?: string;              // Shorter title for mobile (optional)

    // Styling
    sticky?: boolean;                  // Sticky header (default: true)
    elevated?: boolean;                // Shadow on scroll (default: true)
}

/**
 * UnifiedHeader - Horizontal navigation header for all apps
 * 
 * Features:
 * - App icon button → NavigationDrawer (site-wide nav)
 * - App title (from AppContext or prop)
 * - Composable control slots (left/right)
 * - Auth button (Login/Logout)
 * - Help button (optional - runs tutorial for that page if enabled)
 * - Blog link (optional - navigates to blog page related to the current app)
 * - Responsive (mobile/tablet/desktop)
 * - Sticky positioning with shadow on scroll
 * 
 * Usage:
 * ```typescript
 * <UnifiedHeader
 *   app={{
 *     id: 'statblock-generator',
 *     name: 'StatBlock Generator',
 *     icon: STATBLOCK_ICON_URL
 *   }}
 *   toolboxSections={[
 *     {
 *       id: 'editing',
 *       label: 'Editing',
 *       controls: [
 *         { id: 'edit-mode', type: 'component', component: <Switch label="Edit Mode" /> }
 *       ]
 *     },
 *     {
 *       id: 'actions',
 *       label: 'Actions',
 *       controls: [
 *         { id: 'save', type: 'menu-item', label: 'Save', icon: <IconSave />, onClick: handleSave }
 *       ]
 *     }
 *   ]}
 *   showAuth={true}
 *   showHelp={true}
 *   onHelpClick={handleOpenTutorial}
 * />
 * ```
 */
export const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
    app,
    leftControls = [],
    rightControls = [],
    toolboxSections,
    showToolbox,
    saveStatus,
    saveError,
    showProjects = false,
    onProjectsClick,
    projectsIconUrl,
    showGeneration = false,
    onGenerationClick,
    generationIconUrl,
    showAuth = true,
    showHelp = false,
    onHelpClick,
    mobileTitle,
    sticky = true,
    elevated = true
}) => {
    const { currentApp } = useAppContext();
    const { isLoggedIn, login, logout } = useAuth();
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Responsive breakpoints
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isTablet = useMediaQuery('(max-width: 1024px)');

    // Responsive sizing (larger icons for better visibility)
    const iconSize = isMobile ? '40px' : isTablet ? '70px' : '80px'; // Much smaller on mobile
    const centerIconSize = isMobile ? '35px' : isTablet ? '70px' : '80px'; // Even smaller center icon on mobile
    const headerHeight = isMobile ? '60px' : isTablet ? '82px' : '88px'; // More compact on mobile
    const horizontalPadding = isMobile ? 'xs' : 'md';
    const verticalPadding = isMobile ? 2 : 4;
    const controlGap = isMobile ? 4 : 'md'; // Tighter spacing on mobile

    // Use provided app or fall back to AppContext
    const activeApp = app || currentApp;

    // Track scroll for elevated shadow
    useEffect(() => {
        if (!elevated) return;

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [elevated]);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.style.display = 'none';
    };

    // Projects button click handler
    const handleProjectsClick = () => {
        if (!isLoggedIn) {
            // Simple alert for login prompt (can be replaced with toast library later)
            alert('Please log in to access your projects');
            return;
        }
        onProjectsClick?.();
    };

    // Determine if toolbox should be shown (default: true if toolboxSections provided)
    const shouldShowToolbox = showToolbox !== undefined ? showToolbox : (toolboxSections && toolboxSections.length > 0);

    return (
        <>
            {/* Navigation Drawer */}
            <NavigationDrawer opened={drawerOpened} onClose={closeDrawer} headerHeight={headerHeight} />

            {/* Header */}
            <Group
                justify="space-between"
                px={horizontalPadding}
                py={verticalPadding}
                style={{
                    position: sticky ? 'sticky' : 'relative',
                    top: sticky ? 0 : undefined,
                    left: 0,
                    right: 0,
                    width: '100%',
                    zIndex: 1000,
                    backgroundImage: 'url(https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/e59f6adf-3bd3-4309-77c3-c1dfa284dc00/public)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    borderBottom: '1px solid var(--mantine-color-gray-3)',
                    borderRight: '5px solid black',
                    boxShadow: isScrolled ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
                    transition: 'box-shadow 0.2s ease',
                    minHeight: headerHeight,
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                {/* Left Section: DM Logo → Auth Icon */}
                <Group gap={controlGap}>
                    {/* DungeonMind Logo - Opens Navigation Drawer */}
                    <Box
                        onClick={openDrawer}
                        style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        aria-label="Open navigation menu"
                    >
                        <img
                            src={`${process.env.PUBLIC_URL}/images/DungeonMindLogo2.png`}
                            alt="DungeonMind"
                            onError={handleImageError}
                            style={{
                                height: iconSize,
                                objectFit: 'contain',
                                cursor: 'pointer'
                            }}
                        />
                    </Box>

                    {/* Auth Icon Button (uses existing NavBar icons) */}
                    {showAuth && (
                        <Box
                            onClick={isLoggedIn ? logout : login}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            aria-label={isLoggedIn ? 'Logout' : 'Login'}
                            title={isLoggedIn ? 'Logout' : 'Login'}
                        >
                            <img
                                src={`${process.env.PUBLIC_URL}/images/${isLoggedIn ? 'logoutButton.png' : 'Login.png'}`}
                                alt={isLoggedIn ? 'Logout' : 'Login'}
                                onError={handleImageError}
                                style={{
                                    height: iconSize,
                                    objectFit: 'contain',
                                    cursor: 'pointer'
                                }}
                            />
                        </Box>
                    )}
                </Group>

                {/* Center Section: App Icon + Name */}
                {activeApp && (
                    <Group gap="xs" style={{ flex: 1, justifyContent: 'center' }}>
                        {activeApp.iconFallback ? (
                            activeApp.iconFallback
                        ) : (
                            <img
                                src={activeApp.icon}
                                alt={activeApp.name}
                                onError={handleImageError}
                                style={{
                                    height: centerIconSize,
                                    objectFit: 'contain'
                                }}
                            />
                        )}
                        {isTablet && !isMobile && (
                            <Title
                                order={4}
                                style={{
                                    color: 'white',
                                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                                    fontWeight: 600,
                                    fontSize: '16px'
                                }}
                            >
                                {activeApp.name}
                            </Title>
                        )}
                    </Group>
                )}

                {/* Right Section: Save Badge + Projects + App Toolbox + Right Controls + Help Button */}
                <Group gap={controlGap}>
                    {/* Save Status Badge (if provided) */}
                    {saveStatus && saveStatus !== 'idle' && (
                        <Badge
                            color={
                                saveStatus === 'saving' ? 'yellow' :
                                    saveStatus === 'saved' ? 'green' :
                                        saveStatus === 'error' ? 'red' : 'gray'
                            }
                            variant="light"
                            size={isMobile ? 'md' : 'lg'}
                            title={saveStatus === 'error' && saveError ? saveError : undefined}
                            style={{ cursor: saveStatus === 'error' ? 'help' : 'default' }}
                        >
                            {saveStatus === 'saving' ? 'Saving...' :
                                saveStatus === 'saved' ? 'Saved' :
                                    saveStatus === 'error' ? 'Error' : saveStatus}
                        </Badge>
                    )}

                    {/* Projects Button (if enabled) */}
                    {showProjects && (
                        <Box
                            onClick={handleProjectsClick}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: isLoggedIn ? 1 : 0.4,
                                filter: isLoggedIn ? 'none' : 'grayscale(100%)',
                                transition: 'opacity 0.2s ease, filter 0.2s ease'
                            }}
                            aria-label="Projects"
                            title={isLoggedIn ? 'Open Projects' : 'Login to access projects'}
                        >
                            <img
                                src={projectsIconUrl || 'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/6290ebea-258f-40b1-9b9b-10c29796c900/public'}
                                alt="Projects"
                                onError={handleImageError}
                                style={{
                                    height: iconSize,
                                    objectFit: 'contain',
                                    cursor: 'pointer'
                                }}
                            />
                        </Box>
                    )}

                    {/* Generation Button (if enabled) */}
                    {showGeneration && onGenerationClick && (
                        <Box
                            onClick={onGenerationClick}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'opacity 0.2s ease, filter 0.2s ease'
                            }}
                            aria-label="AI Generation"
                            title="Open AI Generation"
                        >
                            <img
                                src={generationIconUrl || 'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/08bd0df7-2c6b-4a96-028e-b91bf1935c00/public'}
                                alt="AI Generation"
                                onError={handleImageError}
                                style={{
                                    height: iconSize,
                                    objectFit: 'contain',
                                    cursor: 'pointer'
                                }}
                            />
                        </Box>
                    )}

                    {/* App Toolbox (NEW - preferred) */}
                    {shouldShowToolbox && toolboxSections && (
                        <AppToolbox
                            sections={toolboxSections}
                            size={isMobile ? 'md' : 'lg'}
                            width={isMobile ? 320 : 280}  // Wider on mobile for touch targets
                            position="bottom-end"  // Hug right edge
                        />
                    )}

                    {/* Right Controls (DEPRECATED - for backward compatibility) */}
                    {rightControls.length > 0 && (
                        <Group gap={isMobile ? 'xs' : 'sm'}>
                            {rightControls.map((control, index) => (
                                <React.Fragment key={index}>{control}</React.Fragment>
                            ))}
                        </Group>
                    )}

                    {/* Help Button (if enabled) */}
                    {showHelp && onHelpClick && (
                        <ActionIcon
                            onClick={onHelpClick}
                            variant="subtle"
                            size={isMobile ? 'md' : 'lg'}
                            aria-label="Help"
                            title="Help / Tutorial"
                        >
                            <IconHelp size={isMobile ? 16 : 20} />
                        </ActionIcon>
                    )}
                </Group>
            </Group>
        </>
    );
};

export default UnifiedHeader;

