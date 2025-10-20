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
    { id: 0, link: '/', icon: 'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/c73e6012-aa0b-4c6f-802c-c5c81f55d100/public', label: 'Home' },
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
    headerHeight?: string;  // Height of UnifiedHeader to position drawer correctly
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
    onClose,
    headerHeight: propHeaderHeight
}) => {
    // Responsive breakpoints
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isTablet = useMediaQuery('(max-width: 1024px)');

    // Responsive sizing (matches UnifiedHeader exactly)
    const drawerWidth = isMobile ? '70px' : isTablet ? '80px' : '90px';
    const iconSize = isMobile ? '60px' : isTablet ? '70px' : '80px';
    const closeButtonSize = isMobile ? '60px' : isTablet ? '70px' : '80px';  // Match iconSize for alignment
    const closeButtonFontSize = isMobile ? '20px' : '28px';
    const stackGap = isMobile ? 2 : 2;  // Reduced gap: 0.5rem = 8px
    const stackPadding = '0';  // No padding - icons start at top edge

    // Use prop headerHeight if provided, otherwise fall back to responsive default
    const headerHeight = propHeaderHeight || (isMobile ? '72px' : isTablet ? '82px' : '88px');

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
                inner: {
                    // Override inner container constraints
                    maxHeight: 'none',
                    minHeight: '100%',
                    height: '100%'
                },
                content: {
                    backgroundColor: 'var(--mantine-color-dark-7)',
                    color: 'var(--mantine-color-gray-0)',
                    borderRight: '1px solid var(--mantine-color-gray-3)',
                    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
                    top: headerHeight,
                    left: '0',
                    height: `calc(100vh - ${headerHeight})`,
                    maxHeight: 'none',  // Override Mantine's max-height constraint
                    minHeight: '100%',   // Force full height
                    // Override each padding property individually (more specific than shorthand)
                    paddingTop: '0.5rem',
                    paddingRight: '0.5rem',
                    paddingBottom: '0.5rem',
                    paddingLeft: '0.5rem'
                },
                body: {
                    // Remove ALL Mantine's default padding (explicitly set each side)
                    padding: 0,
                    paddingTop: 0,
                    paddingRight: 0,
                    paddingBottom: 0,
                    paddingLeft: 0,
                    height: '100%'
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
                        width: '100%'
                    }}
                >
                    <Box
                        onClick={onClose}
                        style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'var(--mantine-radius-md)',
                            transition: 'all 0.2s ease',
                            outline: 'none'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.filter = 'brightness(1.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.filter = 'brightness(1)';
                        }}
                        aria-label="Close navigation"
                        title="Close navigation"
                    >
                        <img
                            src="https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/6ea6baa9-07b3-419e-a52d-38602d360200/public"
                            alt="Close"
                            style={{
                                height: closeButtonSize,
                                objectFit: 'contain',
                                display: 'block',
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                            crossOrigin="anonymous"
                            onLoad={() => console.log('✅ Close button image loaded successfully')}
                            onError={(e) => {
                                console.error('❌ Close button image failed to load, using fallback text');
                                // Replace image with text fallback
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                    parent.innerHTML = `<span style="color: var(--mantine-color-gray-0); font-size: ${closeButtonFontSize}; font-weight: 300;">✕</span>`;
                                }
                            }}
                        />
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
                                        transition: 'all 0.2s ease',
                                        outline: 'none'
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
                                    src={item.icon.startsWith('http') ? item.icon : `${process.env.PUBLIC_URL}/images/${item.icon}`}
                                    alt={item.label}
                                    onError={handleImageError}
                                    crossOrigin={item.icon.startsWith('http') ? 'anonymous' : undefined}
                                    style={{
                                        height: iconSize,
                                        objectFit: 'contain',
                                        display: 'block',
                                        cursor: 'pointer',
                                        outline: 'none'
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

