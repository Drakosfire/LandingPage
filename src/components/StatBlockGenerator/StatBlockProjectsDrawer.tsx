// StatBlockProjectsDrawer.tsx - Projects Drawer for StatBlock Generator (Placeholder)
import React from 'react';
import { Drawer, Title, Text } from '@mantine/core';

interface StatBlockProjectsDrawerProps {
    forceExpanded: boolean;
    onExpandedChange: (expanded: boolean) => void;
}

const StatBlockProjectsDrawer: React.FC<StatBlockProjectsDrawerProps> = ({
    forceExpanded,
    onExpandedChange
}) => {
    return (
        <Drawer
            opened={forceExpanded}
            onClose={() => onExpandedChange(false)}
            title="StatBlock Projects"
            padding="md"
            size="md"
        >
            <Title order={4} mb="md">Your Creatures</Title>
            <Text size="sm" c="dimmed">
                Project management will be implemented here...
            </Text>
        </Drawer>
    );
};

export default StatBlockProjectsDrawer;
