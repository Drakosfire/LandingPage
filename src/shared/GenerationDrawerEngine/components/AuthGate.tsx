/**
 * AuthGate - Authentication gate component
 * 
 * Wraps content that requires authentication. Shows login prompt for unauthenticated users.
 * Supports tutorial mode bypass.
 */

import React from 'react';
import { Stack, Text, Button, Alert } from '@mantine/core';
import { IconLock, IconLogin } from '@tabler/icons-react';
import { useAuth } from '../../../context/AuthContext';

export interface AuthGateProps {
    /** Children to render when authenticated */
    children: React.ReactNode;
    /** Bypass auth check (for tutorial mode) */
    isTutorialMode?: boolean;
    /** Custom message for login prompt */
    message?: string;
}

/**
 * AuthGate component for protecting authenticated content
 */
export const AuthGate: React.FC<AuthGateProps> = ({
    children,
    isTutorialMode = false,
    message
}) => {
    const { isLoggedIn, login } = useAuth();

    // Bypass auth check in tutorial mode
    if (isTutorialMode || isLoggedIn) {
        return <>{children}</>;
    }

    const defaultMessage = message || 'Login required to upload and manage images.';

    return (
        <Stack align="center" gap="md" py="xl" px="md">
            <IconLock size={48} stroke={1.5} color="var(--mantine-color-gray-6)" />
            <Text size="lg" fw={500} ta="center">
                Login Required
            </Text>
            <Text size="sm" c="dimmed" ta="center" maw={400}>
                {defaultMessage}
            </Text>
            <Button
                leftSection={<IconLogin size={18} />}
                onClick={login}
                size="md"
                aria-label="Login to continue"
            >
                Login
            </Button>
        </Stack>
    );
};

