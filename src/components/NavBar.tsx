// src/components/NavBar.tsx
import React from 'react';
import '@mantine/core/styles.css';
import {
    MantineProvider,
    Stack,
    Anchor,
    ActionIcon,
    Tooltip,
    Drawer,
    Burger,
    Box,
    Text
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dungeonMindTheme from '../config/mantineTheme';
const NavBar: React.FC = () => {
    const { isLoggedIn, login, logout } = useAuth();
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isTablet = useMediaQuery('(max-width: 1024px)');

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.style.display = 'none';
    };

    const navItems = [
        { id: 1, link: '/#app-links', icon: 'WorldBuildingAppsButton3.png', label: 'World Building Apps' },
        { id: 2, link: '/#about-me', icon: 'AboutMeButtonv2.png', label: 'About Me' },
        { id: 3, link: '/#contact', icon: 'ContactMeButton.png', label: 'Contact Me' },
        { id: 4, link: '/blog', icon: 'BlogButton.png', label: 'Blog' },
    ];

    // Determine sizes based on screen size
    const navWidth = isMobile ? '20px' : isTablet ? '60px' : '80px';
    const iconSize = isMobile ? '16px' : '60px';
    const logoSize = isMobile ? '16px' : '60px';

    // Render navigation content for both collapsed bar and drawer
    const renderNavContent = (isDrawer = false) => (
        <Stack
            gap={isDrawer ? "md" : "xs"}
            justify="flex-start"
            align="center"
            styles={{
                root: {
                    height: '100%',
                    padding: isDrawer ? 'var(--mantine-spacing-md) 0' : `var(--mantine-spacing-${isMobile ? 'xs' : 'md'}) 0`,
                    position: 'relative',
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            {/* Close button for drawer */}
            {isDrawer && (
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        marginBottom: 'var(--mantine-spacing-md)'
                    }}
                >
                    <ActionIcon
                        onClick={closeDrawer}
                        variant="transparent"
                        size="lg"
                        styles={{
                            root: {
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }
                        }}
                    >
                        ✕
                    </ActionIcon>
                </Box>
            )}
            {/* Logo */}
            <Box
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%'
                }}
            >
                <Tooltip
                    label="DungeonMind Home"
                    position={isDrawer ? "bottom" : "right"}
                    withArrow
                    disabled={isDrawer && isMobile}
                >
                    <Anchor
                        component={Link}
                        to="/"
                        onClick={isDrawer ? closeDrawer : undefined}
                        styles={{
                            root: {
                                textDecoration: 'none',
                                display: 'block',
                                width: isDrawer ? (isMobile ? '40px' : '60px') : logoSize,
                                height: isDrawer ? (isMobile ? '40px' : '60px') : logoSize
                            }
                        }}
                    >
                        <img
                            src={`${process.env.PUBLIC_URL}/images/DungeonMindLogo2.png`}
                            alt="DungeonMind"
                            onError={handleImageError}
                            style={{
                                width: isDrawer ? (isMobile ? '40px' : '60px') : logoSize,
                                height: isDrawer ? (isMobile ? '40px' : '60px') : logoSize,
                                objectFit: 'contain',
                                cursor: 'pointer',
                                display: 'block'
                            }}
                        />
                    </Anchor>
                </Tooltip>
            </Box>

            {/* Navigation Items - only show in drawer or when not mobile */}
            {(isDrawer || !isMobile) && navItems.map((item) => (
                <Tooltip
                    key={item.id}
                    label={item.label}
                    position={isDrawer ? "bottom" : "right"}
                    withArrow
                    disabled={isDrawer && isMobile}
                >
                    <Box
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%'
                        }}
                    >
                        <ActionIcon
                            component={Link}
                            to={item.link}
                            onClick={isDrawer ? closeDrawer : undefined}
                            variant="transparent"
                            size={isDrawer ? "xl" : isMobile ? "sm" : "xl"}
                            styles={{
                                root: {
                                    padding: 'var(--mantine-spacing-xs)',
                                    borderRadius: 'var(--mantine-radius-sm)',
                                    width: isDrawer ? (isMobile ? '40px' : '60px') : iconSize,
                                    height: isDrawer ? (isMobile ? '40px' : '60px') : iconSize,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    '&:hover': {
                                        backgroundColor: 'var(--mantine-color-blue-1)',
                                        transform: 'scale(1.05)',
                                        transition: 'all 0.2s ease'
                                    }
                                }
                            }}
                        >
                            <img
                                src={`${process.env.PUBLIC_URL}/images/${item.icon}`}
                                alt={item.label}
                                onError={handleImageError}
                                style={{
                                    width: isDrawer ? (isMobile ? '40px' : '60px') : iconSize,
                                    height: isDrawer ? (isMobile ? '40px' : '60px') : iconSize,
                                    objectFit: 'contain',
                                    display: 'block'
                                }}
                            />
                        </ActionIcon>

                    </Box>
                </Tooltip>
            ))}

            {/* Spacer to push auth section to bottom */}
            <div style={{ flex: 1 }} />

            {/* Authentication Section - only show in drawer or when not mobile */}
            {(isDrawer || !isMobile) && (
                <Tooltip
                    label={isLoggedIn ? 'Logout' : 'Login'}
                    position={isDrawer ? "bottom" : "right"}
                    withArrow
                    disabled={isDrawer && isMobile}
                >
                    <Box
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%'
                        }}
                    >
                        {isLoggedIn ? (
                            <ActionIcon
                                onClick={() => {
                                    logout();
                                    if (isDrawer) closeDrawer();
                                }}
                                variant="transparent"
                                size={isDrawer ? "xl" : isMobile ? "sm" : "xl"}
                                styles={{
                                    root: {
                                        padding: 'var(--mantine-spacing-xs)',
                                        borderRadius: 'var(--mantine-radius-sm)',
                                        width: isDrawer ? '40px' : iconSize,
                                        height: isDrawer ? '40px' : iconSize,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        '&:hover': {
                                            backgroundColor: 'var(--mantine-color-red-1)',
                                            transform: 'scale(1.05)',
                                            transition: 'all 0.2s ease'
                                        }
                                    }
                                }}
                            >
                                <img
                                    src={`${process.env.PUBLIC_URL}/images/logoutButton.png`}
                                    alt="Logout"
                                    onError={handleImageError}
                                    style={{
                                        width: isDrawer ? '40px' : iconSize,
                                        height: isDrawer ? '40px' : iconSize,
                                        objectFit: 'contain',
                                        display: 'block'
                                    }}
                                />
                            </ActionIcon>
                        ) : (
                            <ActionIcon
                                onClick={() => {
                                    login();
                                    if (isDrawer) closeDrawer();
                                }}
                                variant="transparent"
                                size={isDrawer ? "xl" : isMobile ? "sm" : "xl"}
                                styles={{
                                    root: {
                                        padding: 'var(--mantine-spacing-xs)',
                                        borderRadius: 'var(--mantine-radius-sm)',
                                        width: isDrawer ? '40px' : iconSize,
                                        height: isDrawer ? '40px' : iconSize,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        '&:hover': {
                                            backgroundColor: 'var(--mantine-color-green-1)',
                                            transform: 'scale(1.05)',
                                            transition: 'all 0.2s ease'
                                        }
                                    }
                                }}
                            >
                                <img
                                    src={`${process.env.PUBLIC_URL}/images/Login.png`}
                                    alt="Login"
                                    onError={handleImageError}
                                    style={{
                                        width: isDrawer ? '40px' : iconSize,
                                        height: isDrawer ? '40px' : iconSize,
                                        objectFit: 'contain',
                                        display: 'block'
                                    }}
                                />
                            </ActionIcon>
                        )}

                    </Box>
                </Tooltip>
            )}
        </Stack>
    );

    return (
        <MantineProvider theme={dungeonMindTheme}>
            {/* Collapsed Navigation Bar */}
            <nav
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: navWidth,
                    minWidth: navWidth,
                    maxWidth: navWidth,
                    height: '100vh',
                    backgroundColor: '#4a4e69',
                    zIndex: 1000,
                    boxSizing: 'border-box',
                    transition: 'width 0.3s ease'
                }}
            >
                {/* Burger Menu Button for Mobile Only */}
                {isMobile && (
                    <Box
                        style={{
                            position: 'absolute',
                            top: '10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 1002
                        }}
                    >
                        <Burger
                            opened={drawerOpened}
                            onClick={toggleDrawer}
                            size="sm"
                            color="white"
                            aria-label="Toggle navigation"
                        />
                    </Box>
                )}

                {/* Show content on non-mobile screens */}
                {!isMobile && (
                    <Box mt="20px">
                        {renderNavContent()}
                    </Box>
                )}
            </nav>

            {/* Navigation Drawer - Mobile Only */}
            {isMobile && (
                <Drawer
                    opened={drawerOpened}
                    onClose={closeDrawer}
                    size="60px"
                    position="left"
                    overlayProps={{ opacity: 0.5, blur: 4 }}
                    withCloseButton={false}
                    styles={{
                        content: {
                            backgroundColor: '#4a4e69',
                            color: 'white'
                        },
                        root: {
                            '--drawer-offset': '-1rem'
                        }
                    }}
                    zIndex={1003}
                >
                    {renderNavContent(true)}
                </Drawer>
            )}
        </MantineProvider>
    );
};

export default NavBar;
