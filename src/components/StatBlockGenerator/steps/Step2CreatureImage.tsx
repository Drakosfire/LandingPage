// Step2CreatureImage.tsx - Creature Image Generation Step (Placeholder)
import React from 'react';
import { Card, Title, Text, Button, Group } from '@mantine/core';
import { StatBlockStepProps } from '../../../types/statblock.types';

interface Step2CreatureImageProps extends StatBlockStepProps { }

const Step2CreatureImage: React.FC<Step2CreatureImageProps> = ({
    onNext,
    onPrevious,
    canGoNext = false,
    canGoPrevious = false,
}) => {
    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">Creature Image Generation</Title>
            <Text mb="md">Generate artwork for your creature using AI image generation.</Text>
            <Text size="sm" c="dimmed" mb="xl">This step will be implemented next...</Text>

        </Card>
    );
};

export default Step2CreatureImage;
