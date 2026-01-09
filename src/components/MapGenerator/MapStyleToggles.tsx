/**
 * MapStyleToggles Component
 * 
 * UI controls for map generation style options (fantasy level, rendering, tone, etc.)
 * Used in the prompt tuning system to provide structured metadata to the backend.
 */

import React from 'react';
import { SegmentedControl, Accordion, Stack, Group, Switch, Text } from '@mantine/core';
import type { MapStyleOptions } from './mapTypes';
import { DEFAULT_STYLE_OPTIONS } from './mapTypes';

interface MapStyleTogglesProps {
  value: MapStyleOptions;
  onChange: (options: MapStyleOptions) => void;
}

export function MapStyleToggles({ value, onChange }: MapStyleTogglesProps) {
  const handleChange = <K extends keyof MapStyleOptions>(
    key: K,
    newValue: MapStyleOptions[K]
  ) => {
    onChange({ ...value, [key]: newValue });
  };

  return (
    <Stack gap="md">
      {/* Primary Toggles - Always Visible */}
      <div>
        <Text size="sm" fw={500} mb="xs">Fantasy Level</Text>
        <SegmentedControl
          value={value.fantasyLevel}
          onChange={(v) => handleChange('fantasyLevel', v as MapStyleOptions['fantasyLevel'])}
          data={[
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
          ]}
          fullWidth
        />
      </div>
      
      <div>
        <Text size="sm" fw={500} mb="xs">Art Style</Text>
        <SegmentedControl
          value={value.rendering}
          onChange={(v) => handleChange('rendering', v as MapStyleOptions['rendering'])}
          data={[
            { label: 'Hand-Painted', value: 'hand-painted' },
            { label: 'Digital', value: 'digital' },
            { label: 'Sketch', value: 'sketch' },
            { label: 'Pixel Art', value: 'pixel-art' },
          ]}
          fullWidth
        />
      </div>
      
      <div>
        <Text size="sm" fw={500} mb="xs">Tone</Text>
        <SegmentedControl
          value={value.tone}
          onChange={(v) => handleChange('tone', v as MapStyleOptions['tone'])}
          data={[
            { label: 'Gritty', value: 'gritty' },
            { label: 'Neutral', value: 'neutral' },
            { label: 'Whimsical', value: 'whimsical' },
          ]}
          fullWidth
        />
      </div>
      
      {/* Layout Toggles */}
      <div>
        <Text size="sm" fw={500} mb="xs">Scale</Text>
        <SegmentedControl
          value={value.scale}
          onChange={(v) => handleChange('scale', v as MapStyleOptions['scale'])}
          data={[
            { label: 'Encounter', value: 'encounter' },
            { label: 'Small Area', value: 'small_area' },
            { label: 'District', value: 'district' },
          ]}
          fullWidth
        />
      </div>
      
      <div>
        <Text size="sm" fw={500} mb="xs">Movement Space</Text>
        <SegmentedControl
          value={value.movementSpace}
          onChange={(v) => handleChange('movementSpace', v as MapStyleOptions['movementSpace'])}
          data={[
            { label: 'Open', value: 'open' },
            { label: 'Mixed', value: 'mixed' },
            { label: 'Tight', value: 'tight' },
          ]}
          fullWidth
        />
      </div>
      
      <div>
        <Text size="sm" fw={500} mb="xs">Cover Density</Text>
        <SegmentedControl
          value={value.coverDensity}
          onChange={(v) => handleChange('coverDensity', v as MapStyleOptions['coverDensity'])}
          data={[
            { label: 'Light', value: 'light' },
            { label: 'Medium', value: 'medium' },
            { label: 'Heavy', value: 'heavy' },
          ]}
          fullWidth
        />
      </div>
      
      {/* Advanced Toggles - Collapsed */}
      <Accordion>
        <Accordion.Item value="advanced">
          <Accordion.Control>Advanced Options</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <div>
                <Text size="sm" fw={500} mb="xs">Pathways</Text>
                <SegmentedControl
                  value={value.pathways}
                  onChange={(v) => handleChange('pathways', v as MapStyleOptions['pathways'])}
                  data={[
                    { label: 'Radial', value: 'radial' },
                    { label: 'Organic', value: 'organic' },
                    { label: 'Linear', value: 'linear' },
                    { label: 'Gridless', value: 'gridless' },
                  ]}
                  fullWidth
                />
              </div>
              
              <div>
                <Text size="sm" fw={500} mb="xs">Texture Density</Text>
                <SegmentedControl
                  value={value.textureDensity}
                  onChange={(v) => handleChange('textureDensity', v as MapStyleOptions['textureDensity'])}
                  data={[
                    { label: 'Low', value: 'low' },
                    { label: 'Medium', value: 'medium' },
                  ]}
                  fullWidth
                />
              </div>
              
              <Group>
                <Switch
                  label="Elevation Changes"
                  checked={value.elevationPresent}
                  onChange={(e) => handleChange('elevationPresent', e.currentTarget.checked)}
                />
              </Group>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Stack>
  );
}

export default MapStyleToggles;
