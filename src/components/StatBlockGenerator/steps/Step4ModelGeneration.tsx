// Step4ModelGeneration.tsx - 3D Model Generation Step (Placeholder)
import React from 'react';
import { Card, Title, Text, Button, Group } from '@mantine/core';
import { StatBlockStepProps } from '../../../types/statblock.types';

interface Step4ModelGenerationProps extends StatBlockStepProps { }

const Step4ModelGeneration: React.FC<Step4ModelGenerationProps> = ({
    onNext,
    onPrevious,
    canGoNext = false,
    canGoPrevious = false,
}) => {
    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">3D Model Generation</Title>
            <Text mb="md">Convert your creature image into a 3D model using Tripo3D integration.</Text>
            <Text size="sm" c="dimmed" mb="xl">This step will be implemented next...</Text>

        </Card>
    );
};

export default Step4ModelGeneration;
