// src/components/Footer.tsx
import React from 'react';
import { Box, Text, Group, Container } from '@mantine/core';

const Footer: React.FC = () => {
    return (
        <Box
            component="footer"
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                backgroundColor: 'rgba(255, 253, 245, 0.95)',
                borderTop: '1px solid rgba(71, 78, 104, 0.15)',
                backdropFilter: 'blur(8px)',
                zIndex: 300, // Above main content (100) but below header (400)
            }}
        >
            <Container size="lg" py="xs">
                <Group justify="center" gap="md">
                    <Text size="xs" c="dimmed">
                        &copy; 2024 DungeonMind. All rights reserved.
                    </Text>
                    <Text size="xs" c="dimmed">
                        Email: dungeon.mind.am@gmail.com
                    </Text>
                </Group>
            </Container>
        </Box>
    );
};

export default Footer;
