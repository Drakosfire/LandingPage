import React from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconHelp } from '@tabler/icons-react';

interface HelpButtonProps {
    onClick: () => void;
}

export const HelpButton: React.FC<HelpButtonProps> = ({ onClick }) => {
    return (
        <Tooltip label="Show Tutorial" position="bottom" withArrow>
            <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                onClick={onClick}
                data-tutorial="help-button"
                aria-label="Show tutorial"
            >
                <IconHelp size={20} />
            </ActionIcon>
        </Tooltip>
    );
};

