/**
 * LabelEditor Component
 * 
 * UI panel for editing label properties:
 * - Add Label button (activates placement mode)
 * - Show Labels toggle
 * - Clear All button
 * - Font family dropdown
 * - Text color picker
 * - Advanced options (outline, shadow) in accordion
 * - Delete label button
 * 
 * Note: Text editing, rotation, and font size are done directly on the map
 * via inline editing and the Transformer.
 */

import React from 'react';
import { Stack, Select, Text, Button, Group, Paper, Divider, Switch, Accordion, Slider } from '@mantine/core';
import { IconTrash, IconPlus, IconClearAll } from '@tabler/icons-react';
import { useMapGenerator } from './MapGeneratorProvider';
import { FONT_OPTIONS, FontFamily } from 'dungeonmind-canvas';

/**
 * LabelEditor provides UI controls for editing the selected label.
 * Only visible when mode is 'label'.
 */
export function LabelEditor() {
  const {
    labels,
    selectedLabelId,
    updateLabel,
    removeLabel,
    selectLabel,
    labelsVisible,
    setLabelsVisible,
    isPlacingLabel,
    setIsPlacingLabel,
    clearAllLabels,
  } = useMapGenerator();

  // Get selected label
  const selectedLabel = selectedLabelId
    ? labels.find((label) => label.id === selectedLabelId)
    : null;

  // Handle font family change
  const handleFontFamilyChange = (value: string | null) => {
    if (value && selectedLabelId) {
      updateLabel(selectedLabelId, { fontFamily: value as FontFamily });
    }
  };

  // Handle color change
  const handleColorChange = (color: string) => {
    if (selectedLabelId) {
      updateLabel(selectedLabelId, { color });
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (selectedLabelId) {
      removeLabel(selectedLabelId);
      selectLabel(null);
    }
  };

  return (
    <Stack gap="md">
      <Text size="sm" fw={500}>
        Labels Layer
      </Text>

      {/* Top Controls - Always visible */}
      <Group gap="xs">
        <Button
          size="xs"
          variant={isPlacingLabel ? 'filled' : 'light'}
          color={isPlacingLabel ? 'green' : 'blue'}
          leftSection={<IconPlus size={14} />}
          onClick={() => setIsPlacingLabel(!isPlacingLabel)}
          flex={1}
        >
          {isPlacingLabel ? 'Click Map...' : 'Add Label'}
        </Button>
      </Group>

      {/* Show Labels Toggle */}
      <Group justify="space-between">
        <Text size="sm">Show Labels</Text>
        <Switch
          checked={labelsVisible}
          onChange={(e) => setLabelsVisible(e.currentTarget.checked)}
          data-testid="labels-visibility-toggle"
        />
      </Group>

      {/* Clear All - only show if there are labels */}
      {labels.length > 0 && (
        <Button
          size="xs"
          variant="light"
          color="red"
          leftSection={<IconClearAll size={14} />}
          onClick={() => {
            if (window.confirm(`Delete all ${labels.length} labels?`)) {
              clearAllLabels();
            }
          }}
          fullWidth
        >
          Clear All ({labels.length})
        </Button>
      )}

      {/* Label count or placement hint */}
      {!selectedLabel && (
        <Paper bg="gray.0" p="sm" radius="sm">
          <Text size="xs" c="dimmed" ta="center">
            {isPlacingLabel 
              ? 'Click on the map to place a label' 
              : labels.length === 0 
                ? 'Click "Add Label" to get started'
                : `${labels.length} label${labels.length !== 1 ? 's' : ''} on map. Double-click to edit text.`
            }
          </Text>
        </Paper>
      )}

      {/* Editing Controls - Only when label is selected */}
      {selectedLabel && (
        <>
          <Divider label="Selected Label" labelPosition="center" />

          {/* Hint about inline editing */}
          <Paper bg="blue.0" p="xs" radius="sm">
            <Text size="xs" c="blue.7" ta="center">
              Double-click label to edit text. Drag corners to resize/rotate.
            </Text>
          </Paper>

          {/* Font Family Dropdown */}
          <Stack gap="xs">
            <Text size="sm">Font Family</Text>
            <Select
              value={selectedLabel.fontFamily}
              onChange={handleFontFamilyChange}
              data={FONT_OPTIONS.map((font) => ({
                value: font,
                label: font,
              }))}
              data-testid="label-font-family-select"
            />
          </Stack>

          {/* Color Picker */}
          <Stack gap="xs">
            <Text size="sm">Text Color</Text>
            <input
              type="color"
              value={selectedLabel.color}
              onChange={(e) => handleColorChange(e.target.value)}
              style={{
                width: '100%',
                height: 40,
                border: '1px solid var(--mantine-color-gray-4)',
                borderRadius: 'var(--mantine-radius-sm)',
                cursor: 'pointer',
              }}
              data-testid="label-color-picker"
            />
          </Stack>

          {/* Advanced Options Accordion */}
          <Accordion variant="separated" radius="sm">
            <Accordion.Item value="outline">
              <Accordion.Control>
                <Text size="sm">Outline</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="xs">Width</Text>
                      <Text size="xs" c="dimmed">
                        {selectedLabel.strokeWidth ?? 0}px
                      </Text>
                    </Group>
                    <Slider
                      value={selectedLabel.strokeWidth ?? 0}
                      onChange={(value) => {
                        if (selectedLabelId) {
                          updateLabel(selectedLabelId, { strokeWidth: value });
                        }
                      }}
                      min={0}
                      max={5}
                      step={0.5}
                      marks={[
                        { value: 0, label: '0' },
                        { value: 2.5, label: '' },
                        { value: 5, label: '5' },
                      ]}
                      size="xs"
                      data-testid="label-stroke-width-slider"
                    />
                  </Stack>

                  <Stack gap="xs">
                    <Text size="xs">Color</Text>
                    <input
                      type="color"
                      value={selectedLabel.strokeColor ?? '#ffffff'}
                      onChange={(e) => {
                        if (selectedLabelId) {
                          updateLabel(selectedLabelId, { strokeColor: e.target.value });
                        }
                      }}
                      style={{
                        width: '100%',
                        height: 28,
                        border: '1px solid var(--mantine-color-gray-4)',
                        borderRadius: 'var(--mantine-radius-sm)',
                        cursor: 'pointer',
                      }}
                      data-testid="label-stroke-color-picker"
                    />
                  </Stack>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="shadow">
              <Accordion.Control>
                <Group justify="space-between" style={{ width: '100%' }}>
                  <Text size="sm">Shadow</Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="xs">Enable</Text>
                    <Switch
                      size="xs"
                      checked={selectedLabel.shadowEnabled ?? false}
                      onChange={(e) => {
                        if (selectedLabelId) {
                          updateLabel(selectedLabelId, { shadowEnabled: e.currentTarget.checked });
                        }
                      }}
                      data-testid="label-shadow-toggle"
                    />
                  </Group>

                  {selectedLabel.shadowEnabled && (
                    <>
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text size="xs">Blur</Text>
                          <Text size="xs" c="dimmed">
                            {selectedLabel.shadowBlur ?? 4}px
                          </Text>
                        </Group>
                        <Slider
                          value={selectedLabel.shadowBlur ?? 4}
                          onChange={(value) => {
                            if (selectedLabelId) {
                              updateLabel(selectedLabelId, { shadowBlur: value });
                            }
                          }}
                          min={0}
                          max={20}
                          step={1}
                          size="xs"
                          data-testid="label-shadow-blur-slider"
                        />
                      </Stack>

                      <Stack gap="xs">
                        <Text size="xs">Color</Text>
                        <input
                          type="color"
                          value={selectedLabel.shadowColor ?? '#000000'}
                          onChange={(e) => {
                            if (selectedLabelId) {
                              updateLabel(selectedLabelId, { shadowColor: e.target.value });
                            }
                          }}
                          style={{
                            width: '100%',
                            height: 28,
                            border: '1px solid var(--mantine-color-gray-4)',
                            borderRadius: 'var(--mantine-radius-sm)',
                            cursor: 'pointer',
                          }}
                          data-testid="label-shadow-color-picker"
                        />
                      </Stack>
                    </>
                  )}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>

          <Divider my="xs" />

          {/* Delete Button */}
          <Button
            leftSection={<IconTrash size={16} />}
            color="red"
            variant="light"
            onClick={handleDelete}
            fullWidth
            data-testid="label-delete-button"
          >
            Delete Label
          </Button>
        </>
      )}
    </Stack>
  );
}
