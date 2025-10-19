// src/components/NavigationDrawer.tsx
// Site-wide navigation drawer for unified header system
import React from 'react';
import { Drawer, Stack, Box, Anchor, Tooltip } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Link } from 'react-router-dom';

/**
 * Navigation item definition
 */
interface NavItem {
    id: number;
    link: string;
    icon: string;
    label: string;
}

/**
 * Site-wide navigation links (extracted from NavBar.tsx)
 */

/**
 * TODO: Put images on CDN and use the CDN URL instead of the local URL.
 */
const NAV_ITEMS: NavItem[] = [
    { id: 1, link: '/#app-links', icon: 'WorldBuildingAppsButton3.png', label: 'World Building Apps' },
    { id: 2, link: '/#about-me', icon: 'AboutMeButtonv2.png', label: 'About Me' },
    { id: 3, link: '/#contact', icon: 'ContactMeButton.png', label: 'Contact Me' },
    { id: 4, link: '/blog', icon: 'BlogButton.png', label: 'Blog' },
];

/**
 * NavigationDrawer props
 */
interface NavigationDrawerProps {
    opened: boolean;
    onClose: () => void;
}

/**
 * NavigationDrawer - Site-wide navigation drawer for all apps
 * 
 * Features:
 * - Slides out from under the UnifiedHeader (starts at top: 88px, left: 0)
 * - Close button at top
 * - Site navigation links (World Building Apps, About, Contact, Blog)
 * - Responsive sizing (mobile: 70px, tablet: 80px, desktop: 90px)
 * - Smooth slide-right animation
 * - Hugs the left edge of the viewport
 * 
 * Usage:
 * ```typescript
 * const [opened, { open, close }] = useDisclosure();
 * 
 * <NavigationDrawer opened={opened} onClose={close} />
 * ```
 */
export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
    opened,
    onClose
}) => {
    // Responsive breakpoints
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isTablet = useMediaQuery('(max-width: 1024px)');

    // Responsive sizing
    const drawerWidth = isMobile ? '70px' : isTablet ? '80px' : '90px';
    const iconSize = isMobile ? '50px' : isTablet ? '60px' : '80px';
    const closeButtonSize = isMobile ? '32px' : '40px';
    const closeButtonFontSize = isMobile ? '20px' : '28px';
    const stackGap = isMobile ? 4 : 8;
    const stackPadding = isMobile ? '2px 0' : '4px 0';

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.style.display = 'none';
    };

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            size={drawerWidth}
            position="left"
            overlayProps={{ opacity: 0.5, blur: 4 }}
            withCloseButton={false}
            styles={{
                content: {
                    backgroundColor: 'var(--mantine-color-dark-7)',
                    color: 'var(--mantine-color-gray-0)',
                    borderRight: '1px solid var(--mantine-color-gray-3)',
                    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
                    top: '88px',
                    left: '0',
                    height: 'calc(100vh - 88px)'
                }
            }}
            transitionProps={{
                transition: 'slide-right',
                duration: 250,
                timingFunction: 'ease'
            }}
            zIndex={1003}
        >
            <Stack
                gap={stackGap}
                justify="flex-start"
                align="center"
                style={{
                    height: '100%',
                    padding: stackPadding
                }}
            >
                {/* Close button */}
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        marginBottom: isMobile ? '2px' : '4px'
                    }}
                >
                    <Box
                        onClick={onClose}
                        style={{
                            cursor: 'pointer',
                            color: 'var(--mantine-color-gray-0)',
                            fontSize: closeButtonFontSize,
                            fontWeight: 300,
                            width: closeButtonSize,
                            height: closeButtonSize,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'var(--mantine-radius-md)',
                            transition: 'all 0.2s ease',
                            backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                            e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                        aria-label="Close navigation"
                        title="Close navigation"
                    >
                        ✕
                    </Box>
                </Box>

                {/* Navigation Items */}
                {NAV_ITEMS.map((item) => (
                    <Tooltip
                        key={item.id}
                        label={item.label}
                        position="right"
                        withArrow
                    >
                        <Box
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%'
                            }}
                        >
                            <Anchor
                                component={Link}
                                to={item.link}
                                onClick={onClose}
                                styles={{
                                    root: {
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 'var(--mantine-radius-md)',
                                        transition: 'all 0.2s ease'
                                    }
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.filter = 'brightness(1.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.filter = 'brightness(1)';
                                }}
                                aria-label={item.label}
                            >
                                <img
                                    src={`${process.env.PUBLIC_URL}/images/${item.icon}`}
                                    alt={item.label}
                                    onError={handleImageError}
                                    style={{
                                        height: iconSize,
                                        objectFit: 'contain',
                                        display: 'block',
                                        cursor: 'pointer'
                                    }}
                                />
                            </Anchor>
                        </Box>
                    </Tooltip>
                ))}
            </Stack>
        </Drawer>
    );
};

export default NavigationDrawer;

