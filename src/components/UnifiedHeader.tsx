// src/components/UnifiedHeader.tsx
// Unified horizontal navigation header for all DungeonMind apps
import React, { useState, useEffect, ReactNode } from 'react';
import { Group, ActionIcon, Box, Badge, Title, Tooltip, Loader } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconHelp, IconEye, IconCheck, IconAlertTriangle } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { useAppContext, AppMetadata } from '../context/AppContext';
import { NavigationDrawer } from './NavigationDrawer';
import { AppToolbox, ToolboxSection } from './AppToolbox';

// Icon image URLs
const EDIT_ICON_URL = 'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/d33a77cb-d126-42f1-5219-0be558ec3500/public';
const SAVE_ICON_URL = 'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/4890ed87-7804-4770-28c4-14bc220fb000/public';
const UNSAVED_ICON_URL = 'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/5b10b4e1-8add-4a25-4a3b-61ba94684b00/public';

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

    // Save Button & Status (optional)
    saveStatus?: 'idle' | 'saving' | 'saved' | 'error'; // Save status indicator
    saveError?: string | null;          // Error message if saveStatus is 'error'
    onSaveClick?: () => void;           // Manual save button click handler
    showSaveButton?: boolean;           // Show save button (default: true if onSaveClick provided)
    isUnsaved?: boolean;                // True when content exists but hasn't been saved to cloud

    // Projects Button (optional)
    showProjects?: boolean;             // Show projects button (default: false)
    onProjectsClick?: () => void;       // Projects button click handler
    projectsIconUrl?: string;           // Custom projects icon URL

    // Generation Button (optional)
    showGeneration?: boolean;           // Show generation button (default: false)
    onGenerationClick?: () => void;     // Generation button click handler
    generationIconUrl?: string;         // Custom generation icon URL

    // Edit Mode Toggle (optional)
    showEditMode?: boolean;             // Show edit mode toggle (default: false)
    isEditMode?: boolean;               // Current edit mode state
    onEditModeToggle?: (enabled: boolean) => void; // Edit mode toggle handler

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
    onSaveClick,
    showSaveButton,
    isUnsaved = false,
    showProjects = false,
    onProjectsClick,
    projectsIconUrl,
    showGeneration = false,
    onGenerationClick,
    generationIconUrl,
    showEditMode = false,
    isEditMode = false,
    onEditModeToggle,
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
        console.error('❌ [UnifiedHeader] Image failed to load:', e.currentTarget.src);
        // Don't hide the image, show a fallback or keep it visible for debugging
        e.currentTarget.style.opacity = '0.5';
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

    // Determine if save button should be shown (default: true if onSaveClick provided)
    const shouldShowSaveButton = showSaveButton !== undefined ? showSaveButton : !!onSaveClick;

    // Save button handler
    const handleSaveClick = () => {
        if (!isLoggedIn) {
            alert('Please log in to save your work');
            return;
        }
        if (saveStatus === 'saving') {
            return; // Already saving
        }
        onSaveClick?.();
    };

    // Get save button icon based on status
    const getSaveButtonIcon = () => {
        const size = isMobile ? 18 : 22;
        switch (saveStatus) {
            case 'saving':
                return <Loader size={size} color="white" />;
            case 'saved':
                return <IconCheck size={size} color="white" />;
            case 'error':
                return <IconAlertTriangle size={size} color="white" />;
            default:
                // Use UnSaved icon if there are unsaved changes, otherwise use Save icon
                const iconUrl = isUnsaved ? UNSAVED_ICON_URL : SAVE_ICON_URL;
                return (
                    <img
                        src={iconUrl}
                        alt={isUnsaved ? 'Unsaved' : 'Save'}
                        onError={handleImageError}
                        style={{
                            width: size,
                            height: size,
                            objectFit: 'contain',
                            display: 'block'
                        }}
                    />
                );
        }
    };

    // Get save button tooltip text
    const getSaveTooltipText = () => {
        if (!isLoggedIn) return 'Log in to save';
        if (saveStatus === 'saving') return 'Saving...';
        if (saveStatus === 'saved') return 'All changes saved';
        if (saveStatus === 'error') return saveError || 'Save failed - click to retry';
        if (isUnsaved) return 'Unsaved - Click to save';
        return 'Save now';
    };

    // Get save button color based on status
    const getSaveButtonColor = () => {
        switch (saveStatus) {
            case 'saving':
                return 'rgba(251, 191, 36, 0.9)'; // Yellow
            case 'saved':
                return 'rgba(34, 197, 94, 0.9)';  // Green
            case 'error':
                return 'rgba(239, 68, 68, 0.9)'; // Red
            default:
                // Show orange for unsaved, blue for idle
                return isUnsaved ? 'rgba(249, 115, 22, 0.9)' : 'rgba(59, 130, 246, 0.9)'; // Orange or Blue
        }
    };

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

                {/* Right Section: Save Button + Edit Toggle + Projects + App Toolbox + Right Controls + Help Button */}
                <Group gap={controlGap}>
                    {/* Save Button (clickable with status indicator) */}
                    {shouldShowSaveButton && (
                        <Tooltip
                            label={getSaveTooltipText()}
                            zIndex={1100}
                            position="bottom"
                        >
                            <ActionIcon
                                onClick={handleSaveClick}
                                variant="filled"
                                size={isMobile ? 'lg' : 'xl'}
                                radius="md"
                                data-tutorial="save-button"
                                aria-label={getSaveTooltipText()}
                                disabled={saveStatus === 'saving'}
                                style={{
                                    backgroundColor: getSaveButtonColor(),
                                    border: '2px solid rgba(255, 255, 255, 0.4)',
                                    opacity: isLoggedIn ? 1 : 0.5,
                                    cursor: !isLoggedIn || saveStatus === 'saving' ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {getSaveButtonIcon()}
                            </ActionIcon>
                        </Tooltip>
                    )}

                    {/* Save Status Badge (fallback for apps without save button but with status) */}
                    {!shouldShowSaveButton && saveStatus && saveStatus !== 'idle' && (
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

                    {/* Edit Mode Toggle (if enabled) */}
                    {showEditMode && (
                        <Tooltip
                            label={isEditMode ? 'Switch to View Mode' : 'Switch to Edit Mode'}
                            zIndex={1100}
                        >
                            <ActionIcon
                                onClick={() => onEditModeToggle?.(!isEditMode)}
                                variant={isEditMode ? 'filled' : 'subtle'}
                                color={isEditMode ? 'blue' : 'gray'}
                                size={isMobile ? 'lg' : 'xl'}
                                radius="md"
                                data-tutorial="edit-mode-toggle"
                                aria-label={isEditMode ? 'Switch to View Mode' : 'Switch to Edit Mode'}
                                style={{
                                    backgroundColor: isEditMode
                                        ? 'rgba(59, 130, 246, 0.9)'
                                        : 'rgba(255, 255, 255, 0.2)',
                                    border: isEditMode
                                        ? '2px solid rgba(59, 130, 246, 1)'
                                        : '2px solid rgba(255, 255, 255, 0.4)',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {isEditMode ? (
                                    <img
                                        src={EDIT_ICON_URL}
                                        alt="Edit Mode"
                                        onError={handleImageError}
                                        style={{
                                            width: isMobile ? 20 : 24,
                                            height: isMobile ? 20 : 24,
                                            objectFit: 'contain',
                                            display: 'block'
                                        }}
                                    />
                                ) : (
                                    <IconEye size={isMobile ? 20 : 24} color="white" />
                                )}
                            </ActionIcon>
                        </Tooltip>
                    )}

                    {/* Projects Button (if enabled) */}
                    {showProjects && (
                        <Box
                            onClick={handleProjectsClick}
                            data-tutorial="projects-button"
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
                            data-tutorial="generation-button"
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

