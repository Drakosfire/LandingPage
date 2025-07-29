import React from 'react';
import { Box, Loader, Text, Stack, Progress, Button } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

export interface LoadingStateProps {
    message?: string;
    progress?: number;
    timeRemaining?: string;
    allowCancel?: boolean;
    onCancel?: () => void;
    variant?: 'spinner' | 'progress' | 'skeleton';
    size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
    message = 'Loading...',
    progress,
    timeRemaining,
    allowCancel = false,
    onCancel,
    variant = 'spinner',
    size = 'md'
}) => {
    const sizeMap = {
        sm: { loader: 16, text: 'sm', spacing: 'xs' },
        md: { loader: 24, text: 'md', spacing: 'sm' },
        lg: { loader: 32, text: 'lg', spacing: 'md' }
    };

    const currentSize = sizeMap[size];

    return (
        <Box
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center'
            }}
        >
            <Stack gap={currentSize.spacing} align="center">
                {variant === 'spinner' && (
                    <Loader size={currentSize.loader} />
                )}

                {variant === 'progress' && progress !== undefined && (
                    <Box style={{ width: '100%', maxWidth: '300px' }}>
                        <Progress
                            value={progress}
                            size={size === 'lg' ? 'lg' : 'md'}
                            radius="md"
                            color="blue"
                        />
                    </Box>
                )}

                <Stack gap="xs" align="center">
                    <Text size={currentSize.text} fw={500}>
                        {message}
                    </Text>

                    {timeRemaining && (
                        <Text size="sm" c="dimmed">
                            {timeRemaining}
                        </Text>
                    )}

                    {progress !== undefined && variant === 'progress' && (
                        <Text size="sm" c="dimmed">
                            {Math.round(progress)}% complete
                        </Text>
                    )}
                </Stack>

                {allowCancel && onCancel && (
                    <Button
                        variant="subtle"
                        size="sm"
                        leftSection={<IconX size={14} />}
                        onClick={onCancel}
                        color="gray"
                    >
                        Cancel
                    </Button>
                )}
            </Stack>
        </Box>
    );
};

// Specialized loading states for common scenarios
export const CardGenerationLoading: React.FC<{
    step: 'text' | 'image' | 'border' | 'assembly';
    progress?: number;
    onCancel?: () => void;
}> = ({ step, progress, onCancel }) => {
    const stepMessages = {
        text: 'Generating your item description...',
        image: 'Creating your item image...',
        border: 'Designing your card style...',
        assembly: 'Assembling your final card...'
    };

    const stepTimes = {
        text: '~10 seconds',
        image: '~30 seconds',
        border: '~45 seconds',
        assembly: '~15 seconds'
    };

    return (
        <LoadingState
            message={stepMessages[step]}
            progress={progress}
            timeRemaining={stepTimes[step]}
            allowCancel={true}
            onCancel={onCancel}
            variant="progress"
            size="lg"
        />
    );
};

export const ProjectLoading: React.FC<{
    action: 'loading' | 'saving' | 'deleting' | 'duplicating';
}> = ({ action }) => {
    const actionMessages = {
        loading: 'Loading your project...',
        saving: 'Saving your progress...',
        deleting: 'Removing project...',
        duplicating: 'Creating copy...'
    };

    return (
        <LoadingState
            message={actionMessages[action]}
            variant="spinner"
            size="md"
        />
    );
};

// Skeleton loading for content areas
export const SkeletonLoading: React.FC<{
    lines?: number;
    height?: string;
}> = ({ lines = 3, height = '20px' }) => {
    return (
        <Stack gap="sm">
            {Array.from({ length: lines }).map((_, index) => (
                <Box
                    key={index}
                    style={{
                        height,
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
                        animation: 'pulse 1.5s ease-in-out infinite'
                    }}
                />
            ))}
            <style>
                {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
            </style>
        </Stack>
    );
};