/**
 * Map Mode Selector Component
 * 
 * Minimal mode selector for Map Generator drawer.
 * Three modes: Generate, Generate from Mask, Edit
 */

import React from 'react';
import { SegmentedControl } from '@mantine/core';
import { IconWand, IconMask, IconEdit } from '@tabler/icons-react';

export type MapMode = 'generate' | 'generate-from-mask' | 'edit';

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconWand size={16} />
              <span>Generate</span>
            </div>
          ),
        },
        {
          value: 'generate-from-mask',
          label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconMask size={16} />
              <span>From Mask</span>
            </div>
          ),
        },
        {
          value: 'edit',
          label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconEdit size={16} />
              <span>Edit</span>
            </div>
          ),
        },
      ]}
      fullWidth
      size="sm"
    />
  );
};

export default MapModeSelector;
