// src/components/AboutMe.tsx
// Updated with Mantine components for DungeonMind theme
import React from 'react';
import { Paper, Title, Text, Button, Group, Container } from '@mantine/core';

const AboutMe: React.FC = () => {
    return (
        <Container size="lg" py="xl">
            <Paper
                shadow="sm"
                radius="md"
                p="xl"
                style={{
                    backgroundColor: 'var(--mantine-color-parchment-3)',
                    border: '2px solid var(--mantine-color-blue-4)'
                }}
            >
                <Title order={2} mb="md" style={{ fontFamily: 'Balgruf, serif' }}>
                    About Me
                </Title>
                <Text mb="lg" style={{ lineHeight: 1.7 }}>
                    I'm a TTRPG and generative AI enthusiast on my journey to becoming a full stack software developer.
                    I love creating tools that blend technology and creativity to enhance interactive experiences.
                </Text>
                <Group gap="md" wrap="wrap">
                    <Button
                        component="a"
                        href="https://huggingface.co/TheDrakosfire"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="filled"
                    >
                        HuggingFace Spaces
                    </Button>
                    <Button
                        component="a"
                        href="https://github.com/Drakosfire"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="filled"
                    >
                        GitHub
                    </Button>
                    <Button
                        component="a"
                        href="https://www.linkedin.com/in/alan-meigs/"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="filled"
                    >
                        LinkedIn
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AboutMe;
