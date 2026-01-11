/**
 * ModeSelector Component
 * 
 * Renders a segmented control for switching between generation modes.
 * Used at the top of the GenerationDrawerEngine when modeConfig is provided.
 */

import React from 'react';
import { SegmentedControl, Group } from '@mantine/core';
import type { ModeSelectorConfig } from '../types';

export interface ModeSelectorProps extends ModeSelectorConfig {}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
  modes,
  disabled = false,
}) => {
  return (
    <SegmentedControl
      value={currentMode}
      onChange={onModeChange}
      disabled={disabled}
      data={modes.map((mode) => ({
        value: mode.value,
        label: mode.icon ? (
          <Group gap={6} wrap="nowrap">
            {mode.icon}
            <span>{mode.label}</span>
          </Group>
        ) : (
          mode.label
        ),
      }))}
      fullWidth
      size="sm"
    />
  );
};

export default ModeSelector;
