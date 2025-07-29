import React from 'react';
import { Card, Text, Group, Badge, ActionIcon, Stack } from '@mantine/core';
import { IconCopy, IconTrash } from '@tabler/icons-react';
import { ProjectSummary } from '../../types/card.types';

interface ProjectCardProps {
    project: ProjectSummary;
    isActive: boolean;
    onSelect: () => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
    project,
    isActive,
    onSelect,
    onDuplicate,
    onDelete
}) => {
    const formatRelativeTime = (timestamp: number): string => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        return new Date(timestamp).toLocaleDateString();
    };

    return (
        <Card
            withBorder
            style={{
                cursor: 'pointer',
                borderColor: isActive ? 'var(--mantine-color-blue-4)' : undefined,
                backgroundColor: isActive ? 'var(--mantine-color-blue-0)' : undefined,
                transition: 'all 0.2s ease'
            }}
            onClick={onSelect}
        >
            <Stack gap="xs">
                <Group justify="space-between" align="flex-start">
                    <Text fw={600} size="sm" style={{ flex: 1 }} lineClamp={1}>
                        {project.name}
                    </Text>
                    <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                        {formatRelativeTime(new Date(project.updatedAt).getTime())}
                    </Text>
                </Group>

                {project.description && (
                    <Text size="xs" c="dimmed" lineClamp={2}>
                        {project.description}
                    </Text>
                )}

                <Group justify="space-between" align="center">
                    <Badge size="xs" variant="light" color="blue">
                        {project.cardCount} cards
                    </Badge>

                    <Group gap={4}>
                        <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="gray"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDuplicate(project.id);
                            }}
                            title="Duplicate project"
                        >
                            <IconCopy size={12} />
                        </ActionIcon>

                        <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="red"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(project.id);
                            }}
                            title="Delete project"
                        >
                            <IconTrash size={12} />
                        </ActionIcon>
                    </Group>
                </Group>
            </Stack>
        </Card>
    );
};

export default ProjectCard; 