// Step3StatblockCustomization.tsx - Statblock Customization Step (Placeholder)
import React from 'react';
import { Card, Title, Text, Button, Group } from '@mantine/core';
import { StatBlockStepProps } from '../../../types/statblock.types';

interface Step3StatblockCustomizationProps extends StatBlockStepProps { }

const Step3StatblockCustomization: React.FC<Step3StatblockCustomizationProps> = ({
    onNext,
    onPrevious,
    canGoNext = false,
    canGoPrevious = false,
}) => {
    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">Statblock Customization</Title>
            <Text mb="md">Edit and customize your creature's stats, abilities, and actions.</Text>
            <Text size="sm" c="dimmed" mb="xl">This step will be implemented next...</Text>

        </Card>
    );
};

export default Step3StatblockCustomization;
