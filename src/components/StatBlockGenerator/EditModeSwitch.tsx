// EditModeSwitch.tsx - Reusable Edit Mode Toggle Component
// Used in AppToolbox for StatBlockGenerator

import React from 'react';
import { Switch } from '@mantine/core';
import { IconEdit, IconLock } from '@tabler/icons-react';

interface EditModeSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

/**
 * EditModeSwitch - Inline edit mode toggle for AppToolbox
 * 
 * Features:
 * - Switch with Edit/Lock icons
 * - Controlled component
 * - Inline display (fits in dropdown)
 * - Touch-friendly on mobile
 */
export const EditModeSwitch: React.FC<EditModeSwitchProps> = ({
    checked,
    onChange,
    disabled = false
}) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.currentTarget.checked);
    };

    return (
        <Switch
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            label="Edit Mode"
            size="sm"
            thumbIcon={
                checked ? (
                    <IconEdit size={12} stroke={3} />
                ) : (
                    <IconLock size={12} stroke={3} />
                )
            }
            styles={{
                track: {
                    minHeight: 28,
                    cursor: disabled ? 'not-allowed' : 'pointer'
                },
                label: {
                    cursor: disabled ? 'not-allowed' : 'pointer'
                }
            }}
        />
    );
};

export default EditModeSwitch;

