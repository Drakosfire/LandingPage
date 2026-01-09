/**
 * MaskControls Component
 *
 * Control panel for mask drawing tools.
 * Implements TDD tests from T169-T173.
 */

import React from 'react';
import { ActionIcon, Slider, Group, Stack, Text, Tooltip } from '@mantine/core';
import {
  IconBrush,
  IconEraser,
  IconRectangle,
  IconCircle,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconTrash,
} from '@tabler/icons-react';

export type MaskTool = 'brush' | 'eraser' | 'rect' | 'circle';

export interface MaskControlsProps {
  /** Currently active tool */
  activeTool: MaskTool;
  /** Current brush size (5-100) */
  brushSize: number;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Callback when tool changes */
  onToolChange: (tool: MaskTool) => void;
  /** Callback when brush size changes */
  onBrushSizeChange: (size: number) => void;
  /** Callback for undo action */
  onUndo: () => void;
  /** Callback for redo action */
  onRedo: () => void;
  /** Callback for clear action */
  onClear: () => void;
}

interface ToolButtonProps {
  tool: MaskTool;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({ tool, label, icon, active, onClick }) => (
  <Tooltip label={label}>
    <ActionIcon
      variant={active ? 'filled' : 'default'}
      color={active ? 'blue' : 'gray'}
      size="lg"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
    >
      {icon}
    </ActionIcon>
  </Tooltip>
);

export const MaskControls: React.FC<MaskControlsProps> = ({
  activeTool,
  brushSize,
  canUndo,
  canRedo,
  onToolChange,
  onBrushSizeChange,
  onUndo,
  onRedo,
  onClear,
}) => {
  return (
    <Stack gap="sm" p="xs">
      {/* Tool Selection */}
      <Group gap="xs">
        <ToolButton
          tool="brush"
          label="Brush"
          icon={<IconBrush size={18} />}
          active={activeTool === 'brush'}
          onClick={() => onToolChange('brush')}
        />
        <ToolButton
          tool="eraser"
          label="Eraser"
          icon={<IconEraser size={18} />}
          active={activeTool === 'eraser'}
          onClick={() => onToolChange('eraser')}
        />
        <ToolButton
          tool="rect"
          label="Rectangle"
          icon={<IconRectangle size={18} />}
          active={activeTool === 'rect'}
          onClick={() => onToolChange('rect')}
        />
        <ToolButton
          tool="circle"
          label="Circle"
          icon={<IconCircle size={18} />}
          active={activeTool === 'circle'}
          onClick={() => onToolChange('circle')}
        />
      </Group>

      {/* Brush Size Slider */}
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Brush Size
          </Text>
          <Text size="sm" fw={500}>
            {brushSize}
          </Text>
        </Group>
        <Slider
          value={brushSize}
          onChange={onBrushSizeChange}
          min={5}
          max={100}
          step={1}
          aria-label="Brush size"
        />
      </Stack>

      {/* Undo/Redo/Clear Actions */}
      <Group gap="xs">
        <Tooltip label="Undo">
          <ActionIcon
            variant="default"
            size="lg"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo"
          >
            <IconArrowBackUp size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Redo">
          <ActionIcon
            variant="default"
            size="lg"
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Redo"
          >
            <IconArrowForwardUp size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Clear mask">
          <ActionIcon variant="default" size="lg" onClick={onClear} aria-label="Clear">
            <IconTrash size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Stack>
  );
};

export default MaskControls;
