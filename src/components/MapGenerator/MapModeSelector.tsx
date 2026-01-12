/**
 * Map Mode Selector Component
 * 
 * Minimal mode selector for Map Generator drawer.
 * Four modes: Generate, Inpaint, Edit, SVG (coming soon)
 */

import React from 'react';
import { SegmentedControl, Group } from '@mantine/core';
import { IconWand, IconMask, IconEdit, IconVectorSpline } from '@tabler/icons-react';

export type MapMode = 'generate' | 'inpaint' | 'edit' | 'svg';

export interface MapModeSelectorProps {
  /** Current selected mode */
  mode: MapMode;
  /** Callback when mode changes */
  onModeChange: (mode: MapMode) => void;
  /** Whether component is disabled */
  disabled?: boolean;
}

export const MapModeSelector: React.FC<MapModeSelectorProps> = ({
  mode,
  onModeChange,
  disabled = false,
}) => {
  return (
    <SegmentedControl
      value={mode}
      onChange={(value) => onModeChange(value as MapMode)}
      disabled={disabled}
      data={[
        {
          value: 'generate',
          label: (
            <Group gap={6} wrap="nowrap">
              <IconWand size={16} />
              <span>Generate</span>
            </Group>
          ),
        },
        {
          value: 'inpaint',
          label: (
            <Group gap={6} wrap="nowrap">
              <IconMask size={16} />
              <span>Inpaint</span>
            </Group>
          ),
        },
        {
          value: 'edit',
          label: (
            <Group gap={6} wrap="nowrap">
              <IconEdit size={16} />
              <span>Edit</span>
            </Group>
          ),
        },
        {
          value: 'svg',
          disabled: true,
          label: (
            <Group gap={6} wrap="nowrap">
              <IconVectorSpline size={16} />
              <span>SVG</span>
            </Group>
          ),
        },
      ]}
      fullWidth
      size="sm"
    />
  );
};

export default MapModeSelector;
