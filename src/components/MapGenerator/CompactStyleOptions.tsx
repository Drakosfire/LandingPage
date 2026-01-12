/**
 * CompactStyleOptions Component
 * 
 * Compact style selectors using Select dropdowns instead of full-width SegmentedControls.
 * Primary options visible, layout and advanced options in accordions.
 */

import React from 'react';
import { Stack, Group, Select, Accordion, Switch, Text } from '@mantine/core';
import type { MapStyleOptions } from './mapTypes';

interface CompactStyleOptionsProps {
  value: MapStyleOptions;
  onChange: (options: MapStyleOptions) => void;
  disabled?: boolean;
}

// Select data for each option
const FANTASY_LEVELS = [
  { value: 'low', label: 'Low Fantasy' },
  { value: 'medium', label: 'Medium Fantasy' },
  { value: 'high', label: 'High Fantasy' },
];

const TONES = [
  { value: 'gritty', label: 'Gritty' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'whimsical', label: 'Whimsical' },
];

const SCALES = [
  { value: 'encounter', label: 'Encounter' },
  { value: 'small_area', label: 'Small Area' },
  { value: 'district', label: 'District' },
];

const MOVEMENT_SPACES = [
  { value: 'open', label: 'Open' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'tight', label: 'Tight' },
];

const COVER_DENSITIES = [
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
];

const PATHWAYS = [
  { value: 'radial', label: 'Radial' },
  { value: 'organic', label: 'Organic' },
  { value: 'linear', label: 'Linear' },
  { value: 'gridless', label: 'Gridless' },
];

const TEXTURE_DENSITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
];

export function CompactStyleOptions({ value, onChange, disabled = false }: CompactStyleOptionsProps) {
  const handleChange = <K extends keyof MapStyleOptions>(
    key: K,
    newValue: MapStyleOptions[K]
  ) => {
    onChange({ ...value, [key]: newValue });
  };

  return (
    <Stack gap="sm">
      {/* Primary Options - Always Visible */}
      <Group gap="xs" grow>
        <Select
          size="xs"
          label="Fantasy"
          data={FANTASY_LEVELS}
          value={value.fantasyLevel}
          onChange={(v) => v && handleChange('fantasyLevel', v as MapStyleOptions['fantasyLevel'])}
          disabled={disabled}
          allowDeselect={false}
        />
        <Select
          size="xs"
          label="Tone"
          data={TONES}
          value={value.tone}
          onChange={(v) => v && handleChange('tone', v as MapStyleOptions['tone'])}
          disabled={disabled}
          allowDeselect={false}
        />
        <Select
          size="xs"
          label="Scale"
          data={SCALES}
          value={value.scale}
          onChange={(v) => v && handleChange('scale', v as MapStyleOptions['scale'])}
          disabled={disabled}
          allowDeselect={false}
        />
      </Group>

      {/* Collapsible Sections */}
      <Accordion variant="separated" chevronPosition="left">
        <Accordion.Item value="layout">
          <Accordion.Control>
            <Text size="sm" fw={500}>Layout Options</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Group gap="xs" grow>
              <Select
                size="xs"
                label="Movement"
                data={MOVEMENT_SPACES}
                value={value.movementSpace}
                onChange={(v) => v && handleChange('movementSpace', v as MapStyleOptions['movementSpace'])}
                disabled={disabled}
                allowDeselect={false}
              />
              <Select
                size="xs"
                label="Cover"
                data={COVER_DENSITIES}
                value={value.coverDensity}
                onChange={(v) => v && handleChange('coverDensity', v as MapStyleOptions['coverDensity'])}
                disabled={disabled}
                allowDeselect={false}
              />
              <Select
                size="xs"
                label="Pathways"
                data={PATHWAYS}
                value={value.pathways}
                onChange={(v) => v && handleChange('pathways', v as MapStyleOptions['pathways'])}
                disabled={disabled}
                allowDeselect={false}
              />
            </Group>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="advanced">
          <Accordion.Control>
            <Text size="sm" fw={500}>Advanced Options</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              <Select
                size="xs"
                label="Texture Density"
                data={TEXTURE_DENSITIES}
                value={value.textureDensity}
                onChange={(v) => v && handleChange('textureDensity', v as MapStyleOptions['textureDensity'])}
                disabled={disabled}
                allowDeselect={false}
              />
              <Switch
                label="Elevation Changes"
                checked={value.elevationPresent}
                onChange={(e) => handleChange('elevationPresent', e.currentTarget.checked)}
                disabled={disabled}
                size="sm"
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Stack>
  );
}

export default CompactStyleOptions;
