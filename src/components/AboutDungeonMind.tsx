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
                    DungeonMind is a collection of tools for tabletop roleplaying game world building powered by multimodal generative AI.
                    This project was inspired by my initial generative AI skepticism and my desire to understand more about how the technology works.
                </Text>
                <Text mb="md" style={{ lineHeight: 1.7 }}>
                    I started with generating images locally on my PC, which led to fine tuning Stable Diffusion models and experimenting with custom training sets.
                    This led to building on HuggingFace with Gradio and Docker Containers, learning about deployment, and eventually building a custom UI framework
                    with JavaScript and a Python backend running on FastAPI.
                </Text>
                <Text mb="lg" style={{ lineHeight: 1.7 }}>
                    Now I'm using TypeScript and React to build a polished, unified experience for all DungeonMind tools.
                </Text>

                <Title order={4} mb="sm" style={{ fontFamily: 'Balgruf, serif' }}>
                    Available Tools
                </Title>
                <List
                    spacing="xs"
                    size="md"
                    icon={<IconCheck size={16} style={{ color: 'var(--mantine-color-blue-4)' }} />}
                >
                    <List.Item>Statblock Generator - Create custom D&D monster statblocks with AI</List.Item>
                    <List.Item>Character Sheet Generator - Build complete player character sheets</List.Item>
                    <List.Item>Item Card Generator - Design magic items with stunning visuals</List.Item>
                    <List.Item>Rules Lawyer - AI-powered D&D rules assistant</List.Item>
                    <List.Item>Store Generator - Generate fantasy shops with inventory</List.Item>
                </List>
            </Paper>
        </Container>
    );
};

export default AboutDungeonMind;
