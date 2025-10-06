// StatBlockHeader.tsx - Header Component for StatBlock Generator
import React from 'react';
import { Group, Button, Text, Badge, ActionIcon, Title } from '@mantine/core';
import { IconFolder, IconAlertCircle, IconTestPipe } from '@tabler/icons-react';

interface StatBlockHeaderProps {
    onOpenProjects: () => void;
    onLoadDemo?: () => void;
    saveStatus: 'idle' | 'saving' | 'saved' | 'error';
    error: string | null;
    isLoggedIn?: boolean;  // Phase 4: Hide Projects button if not logged in
}

const StatBlockHeader: React.FC<StatBlockHeaderProps> = ({
    onOpenProjects,
    onLoadDemo,
    saveStatus,
    error,
    isLoggedIn = false
}) => {
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
                {getSaveStatusBadge()}
                {error && (
                    <ActionIcon color="red" variant="light">
                        <IconAlertCircle size={16} />
                    </ActionIcon>
                )}
                {onLoadDemo && (
                    <Button
                        leftSection={<IconTestPipe size={16} />}
                        variant="light"
                        color="violet"
                        onClick={onLoadDemo}
                    >
                        Load Demo (Dustwalker)
                    </Button>
                )}
                {isLoggedIn && (
                    <Button
                        leftSection={<IconFolder size={16} />}
                        variant="outline"
                        onClick={onOpenProjects}
                    >
                        Projects
                    </Button>
                )}
            </Group>
        </Group>
    );
};

export default StatBlockHeader;
