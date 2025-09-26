// Step5ExportFinalization.tsx - Export & Finalization Step (Placeholder)
import React from 'react';
import { Card, Title, Text, Button, Group } from '@mantine/core';
import { StatBlockStepProps } from '../../../types/statblock.types';

interface Step5ExportFinalizationProps extends StatBlockStepProps { }

const Step5ExportFinalization: React.FC<Step5ExportFinalizationProps> = ({
    onNext,
    onPrevious,
    canGoNext = false,
    canGoPrevious = false,
}) => {
    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">Export & Finalization</Title>
            <Text mb="md">Review your final statblock and export it in your preferred formats.</Text>
            <Text size="sm" c="dimmed" mb="xl">This step will be implemented next...</Text>

        </Card>
    );
};

export default Step5ExportFinalization;
