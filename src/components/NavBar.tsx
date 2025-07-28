// src/components/NavBar.tsx
import React from 'react';
import '@mantine/core/styles.css';
import { MantineProvider, Stack, Anchor, ActionIcon, Tooltip } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dungeonMindTheme from '../config/mantineTheme';
const NavBar: React.FC = () => {
    const { isLoggedIn, login, logout } = useAuth();

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.style.display = 'none';
    };

    const navItems = [
        { id: 1, link: '/#app-links', icon: 'WorldBuildingAppsButton3.png', label: 'World Building Apps' },
        { id: 2, link: '/#about-me', icon: 'AboutMeButtonv2.png', label: 'About Me' },
        { id: 3, link: '/#contact', icon: 'ContactMeButton.png', label: 'Contact Me' },
        { id: 4, link: '/blog', icon: 'BlogButton.png', label: 'Blog' },
    ];

    return (
        <MantineProvider theme={dungeonMindTheme}>
            <nav
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '80px',
                    minWidth: '80px',
                    maxWidth: '80px',
                    height: '100vh',
                    backgroundColor: '#4a4e69',
                    zIndex: 1000,
                    boxSizing: 'border-box'
                }}
            >
                <Stack
                    gap="sm"
                    justify="flex-start"
                    align="center"
                    styles={{
                        root: {
                            height: '100%',
                            padding: 'var(--mantine-spacing-md) 0',
                            position: 'relative',
                            zIndex: 1001
                        }
                    }}
                >
                    {/* Logo */}
                    <Tooltip label="DungeonMind Home" position="right" withArrow>
                        <Anchor
                            component={Link}
                            to="/"
                            styles={{
                                root: {
                                    textDecoration: 'none',
                                    display: 'block',
                                    width: '60px',
                                    height: '60px'
                                }
                            }}
                        >
                            <img
                                src={`${process.env.PUBLIC_URL}/images/DungeonMindLogo2.png`}
                                alt="DungeonMind"
                                onError={handleImageError}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    objectFit: 'contain',
                                    cursor: 'pointer',
                                    display: 'block'
                                }}
                            />
                        </Anchor>
                    </Tooltip>

                    {/* Navigation Items */}
                    {navItems.map((item) => (
                        <Tooltip key={item.id} label={item.label} position="right" withArrow>
                            <ActionIcon
                                component={Link}
                                to={item.link}
                                variant="transparent"
                                size="xl"
                                styles={{
                                    root: {
                                        padding: 'var(--mantine-spacing-xs)',
                                        borderRadius: 'var(--mantine-radius-sm)',
                                        width: '60px',
                                        height: '60px',
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
                                        width: '60px',
                                        height: '60px',
                                        objectFit: 'contain',
                                        display: 'block'
                                    }}
                                />
                            </ActionIcon>
                        </Tooltip>
                    ))}

                    {/* Spacer to push auth section to bottom */}
                    <div style={{ flex: 1 }} />

                    {/* Authentication Section */}
                    <Tooltip
                        label={isLoggedIn ? 'Logout' : 'Login'}
                        position="right"
                        withArrow
                    >
                        {isLoggedIn ? (
                            <ActionIcon
                                onClick={logout}
                                variant="transparent"
                                size="xl"
                                styles={{
                                    root: {
                                        padding: 'var(--mantine-spacing-xs)',
                                        borderRadius: 'var(--mantine-radius-sm)',
                                        width: '60px',
                                        height: '60px',
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
                                        width: '60px',
                                        height: '60px',
                                        objectFit: 'contain',
                                        display: 'block',
                                        mixBlendMode: 'multiply'
                                    }}
                                />
                            </ActionIcon>
                        ) : (
                            <ActionIcon
                                onClick={login}
                                variant="transparent"
                                size="xl"
                                styles={{
                                    root: {
                                        padding: 'var(--mantine-spacing-xs)',
                                        borderRadius: 'var(--mantine-radius-sm)',
                                        width: '60px',
                                        height: '60px',
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
                                        width: '60px',
                                        height: '60px',
                                        objectFit: 'contain',
                                        display: 'block',
                                        mixBlendMode: 'multiply'
                                    }}
                                />
                            </ActionIcon>
                        )}
                    </Tooltip>
                </Stack>
            </nav>
        </MantineProvider>
    );
};

export default NavBar;
