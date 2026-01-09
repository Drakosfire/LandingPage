/**
 * GridControls Component
 * 
 * UI controls for configuring the grid overlay.
 * Provides controls for visibility, type, cell size, color, and opacity.
 */

import React from 'react';
import { Stack, Switch, Slider, Select, Text, Group, SegmentedControl, Button, Divider, NumberInput } from '@mantine/core';
import { GridType, ScaleMetadata, DEFAULT_SCALE_METADATA } from 'dungeonmind-canvas';
import { useMapGenerator } from './MapGeneratorProvider';

/**
 * GridControls provides UI for configuring grid overlay settings.
 * All controls update the grid configuration via the MapGenerator context.
 */
export function GridControls() {
  const { gridConfig, setGridConfig, scaleMetadata, setScaleMetadata } = useMapGenerator();

  // Handle grid visibility toggle
  const handleVisibilityChange = (checked: boolean) => {
    setGridConfig({ visible: checked });
  };

  // Handle grid type change
  const handleTypeChange = (type: string) => {
    setGridConfig({ type: type as GridType });
  };

  // Handle cell size change
  const handleCellSizeChange = (value: number) => {
    setGridConfig({ cellSizePx: value });
  };

  // Handle color change
  const handleColorChange = (color: string) => {
    setGridConfig({ color });
  };

  // Handle opacity change
  const handleOpacityChange = (value: number) => {
    setGridConfig({ opacity: value });
  };

  // NOTE: Offset handlers removed - offset controls hidden pending review
  // See TODO comment below for context

  return (
    <Stack gap="md">
      <Text size="sm" fw={500}>
        Grid Overlay
      </Text>

      {/* Visibility Toggle */}
      <Group justify="space-between">
        <Text size="sm">Show Grid</Text>
        <Switch
          checked={gridConfig.visible}
          onChange={(e) => handleVisibilityChange(e.currentTarget.checked)}
          data-testid="grid-visibility-toggle"
        />
      </Group>

      {/* Grid Type Selector */}
      <Stack gap="xs">
        <Text size="sm">Grid Type</Text>
        <SegmentedControl
          value={gridConfig.type}
          onChange={handleTypeChange}
          data={[
            { value: 'square', label: 'Square' },
            { value: 'hex', label: 'Hex' },
          ]}
          fullWidth
          data-testid="grid-type-selector"
        />
      </Stack>

      {/* Cell Size Slider */}
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm">Cell Size</Text>
          <Text size="sm" c="dimmed">
            {gridConfig.cellSizePx}px
          </Text>
        </Group>
        <Slider
          value={gridConfig.cellSizePx}
          onChange={handleCellSizeChange}
          min={10}
          max={200}
          step={5}
          marks={[
            { value: 10, label: '10' },
            { value: 50, label: '50' },
            { value: 100, label: '100' },
            { value: 200, label: '200' },
          ]}
          data-testid="grid-cell-size-slider"
        />
      </Stack>

      {/* Grid Color Picker */}
      <Stack gap="xs">
        <Text size="sm">Grid Color</Text>
        <input
          type="color"
          value={gridConfig.color}
          onChange={(e) => handleColorChange(e.target.value)}
          style={{
            width: '100%',
            height: 40,
            border: '1px solid var(--mantine-color-gray-4)',
            borderRadius: 'var(--mantine-radius-sm)',
            cursor: 'pointer',
          }}
          data-testid="grid-color-picker"
        />
      </Stack>

      {/* Opacity Slider */}
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm">Opacity</Text>
          <Text size="sm" c="dimmed">
            {Math.round(gridConfig.opacity * 100)}%
          </Text>
        </Group>
        <Slider
          value={gridConfig.opacity}
          onChange={handleOpacityChange}
          min={0}
          max={1}
          step={0.05}
          marks={[
            { value: 0, label: '0%' },
            { value: 0.5, label: '50%' },
            { value: 1, label: '100%' },
          ]}
          data-testid="grid-opacity-slider"
        />
      </Stack>

      {/* 
       * HIDDEN: Adjustment Mode Section
       * 
       * TODO: Review and possibly remove offset entirely.
       * With grid now sized to image dimensions, offset may be unnecessary.
       * The grid origin is naturally at image (0,0) and cell size can be adjusted
       * to align with map features.
       * 
       * If offset IS needed, consider a simpler UX:
       * - Click to set origin point on image
       * - Adjust cell size from that origin
       * 
       * Hidden on: 2025-01-30
       * Reason: Offset feels redundant now that grid matches image dimensions
       */}

      {/* Scale Metadata Editor */}
      <Divider my="sm" />
      <Stack gap="xs">
        <Text size="sm" fw={500}>
          Scale Metadata
        </Text>

        {/* Cell Size */}
        <NumberInput
          label="Cell Size"
          description="Size of one cell in game units"
          value={scaleMetadata?.cellSize || DEFAULT_SCALE_METADATA.cellSize}
          onChange={(value) => {
            const numValue = typeof value === 'number' ? value : parseFloat(value || '0');
            if (!isNaN(numValue) && numValue > 0) {
              setScaleMetadata({
                cellSize: numValue,
                unit: scaleMetadata?.unit || DEFAULT_SCALE_METADATA.unit,
              });
            }
          }}
          min={0.1}
          max={1000}
          step={0.1}
          decimalScale={1}
          data-testid="scale-cell-size-input"
        />

        {/* Unit Selector */}
        <Select
          label="Unit"
          value={scaleMetadata?.unit || DEFAULT_SCALE_METADATA.unit}
          onChange={(value) => {
            if (value && (value === 'ft' || value === 'm' || value === 'squares')) {
              setScaleMetadata({
                cellSize: scaleMetadata?.cellSize || DEFAULT_SCALE_METADATA.cellSize,
                unit: value,
              });
            }
          }}
          data={[
            { value: 'ft', label: 'Feet (ft)' },
            { value: 'm', label: 'Meters (m)' },
            { value: 'squares', label: 'Squares' },
          ]}
          data-testid="scale-unit-selector"
        />

        {/* Clear Scale Metadata Button */}
        {scaleMetadata && (
          <Button
            variant="light"
            color="gray"
            size="xs"
            onClick={() => setScaleMetadata(null)}
            data-testid="clear-scale-metadata-button"
          >
            Clear Scale Metadata
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
