import React from 'react';
import { Button, Group, Text, Tooltip } from '@mantine/core';
import { IconArrowRight, IconArrowLeft, IconDownload } from '@tabler/icons-react';

interface FloatingActionButtonProps {
    visible: boolean;
    onClick: () => void;
    disabled?: boolean;
    type: 'next' | 'previous' | 'download';
    label: string;
    color?: string;
    size?: 'sm' | 'md' | 'lg';
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
    visible,
    onClick,
    disabled = false,
    type,
    label,
    color = 'blue',
    size = 'lg',
    position = 'bottom-right'
}) => {
    if (!visible) return null;

    const getIcon = () => {
        switch (type) {
            case 'next':
                return <IconArrowRight size={20} />;
            case 'previous':
                return <IconArrowLeft size={20} />;
            case 'download':
                return <IconDownload size={20} />;
            default:
                return <IconArrowRight size={20} />;
        }
    };

    const getPositionStyles = () => {
        const baseStyles = {
            position: 'fixed' as const,
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s ease',
        };

        switch (position) {
            case 'bottom-right':
                return { ...baseStyles, bottom: '2rem', right: '2rem' };
            case 'bottom-left':
                return { ...baseStyles, bottom: '2rem', left: '2rem' };
            case 'top-right':
                return { ...baseStyles, top: '2rem', right: '2rem' };
            case 'top-left':
                return { ...baseStyles, top: '2rem', left: '2rem' };
            default:
                return { ...baseStyles, bottom: '2rem', right: '2rem' };
        }
    };

    return (
        <div style={getPositionStyles()}>
            <Tooltip
                label={label}
                position="left"
                withArrow
                disabled={disabled}
            >
                <Button
                    onClick={onClick}
                    disabled={disabled}
                    color={color}
                    size={size}
                    leftSection={getIcon()}
                    className="floating-action-button"
                    style={{
                        borderRadius: '50px',
                        padding: '0.75rem 1.5rem',
                        fontWeight: 600,
                        textTransform: 'none',
                    }}
                >
                    <Group gap="xs">
                        <Text size="sm" fw={600}>
                            {label}
                        </Text>
                    </Group>
                </Button>
            </Tooltip>
        </div>
    );
};

export default FloatingActionButton; 