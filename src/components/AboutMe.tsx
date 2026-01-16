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
                <Text mb="md" style={{ lineHeight: 1.7 }}>
                    DungeonMind lives at the crossroads of tabletop games, generative AI, and an incurable engineering curiosity. I'm a tinkerer at heart, part builder, part mad scientist, and this project has grown far beyond what I ever imagined when I started.
                </Text>
                <Text mb="lg" style={{ lineHeight: 1.7 }}>
                    Today, DungeonMind is both my workshop and my portfolio. I design systems that turn lore into logic, rules into engines, and player choice into something computers can genuinely respect. If it feels a little overbuilt for a game tool, that's not an accident. It's the sound of learning, experimenting, and pushing ideas until they either work or teach me something better.
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
