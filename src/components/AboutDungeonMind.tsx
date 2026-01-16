// src/components/AboutDungeonMind.tsx
// Updated with Mantine components for DungeonMind theme
import React from 'react';
import { Paper, Title, Text, List, Container } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

const AboutDungeonMind: React.FC = () => {
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
                    About DungeonMind
                </Title>
                <Text mb="md" style={{ lineHeight: 1.7 }}>
                    DungeonMind is a growing ecosystem of tools for tabletop roleplaying worldbuilding, powered by multimodal generative AI and an insistence on understanding how things actually work. It began with skepticism. I didn't trust the magic, so I pulled it apart to see what was inside.
                </Text>
                <Text mb="md" style={{ lineHeight: 1.7 }}>
                    That curiosity started locally, generating images on my own machine, then spiraled into fine-tuning Stable Diffusion models, building custom training sets, and experimenting with inference pipelines. From there came HuggingFace, Gradio, Dockerized deployments, and the realization that tooling matters just as much as models.
                </Text>
                <Text mb="lg" style={{ lineHeight: 1.7 }}>
                    Today, DungeonMind is evolving into a unified, polished platform. I'm using TypeScript and React on the frontend, with a Python FastAPI backend, to bring these tools together into a cohesive experience. What began as experimentation is now deliberate engineering: systems built to be explored, extended, and occasionally pushed a little too far.
                </Text>

            </Paper>
        </Container>
    );
};

export default AboutDungeonMind;
