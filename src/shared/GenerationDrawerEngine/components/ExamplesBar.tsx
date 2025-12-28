/**
 * ExamplesBar - Quick-fill example cards
 * 
 * Displays horizontal scrollable list of example cards that populate
 * the input form when clicked.
 */

import React from 'react';
import { Group, Text, Button, Stack, ScrollArea } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import type { ExampleConfig } from '../types';

export interface ExamplesBarProps<TInput> {
  /** Array of example configurations */
  examples?: ExampleConfig<TInput>[];
  /** Called when an example is selected */
  onSelect: (input: TInput) => void;
  /** Whether generation is in progress (disables examples) */
  isGenerating: boolean;
  /** Optional label above examples */
  label?: string;
}

/**
 * ExamplesBar component for quick-fill example cards
 */
export function ExamplesBar<TInput>({
  examples,
  onSelect,
  isGenerating,
  label = 'Quick examples:'
}: ExamplesBarProps<TInput>) {
  // Don't render if no examples
  if (!examples || examples.length === 0) {
    return null;
  }

  return (
    <Stack 
      gap="xs"
      data-testid="examples-bar"
      data-tutorial="examples-bar"
    >
      {label && (
        <Text size="sm" c="dimmed" fw={500}>
          {label}
        </Text>
      )}
      
      <ScrollArea type="auto" offsetScrollbars>
        <Group gap="sm" wrap="nowrap">
          {examples.map((example, index) => (
            <Button
              key={example.name || index}
              variant="light"
              size="compact-sm"
              leftSection={example.icon || <IconSparkles size={14} />}
              onClick={() => onSelect(example.input)}
              disabled={isGenerating}
              style={{
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {example.name}
            </Button>
          ))}
        </Group>
      </ScrollArea>
      
      {examples.some(e => e.description) && (
        <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
          Click an example to populate the form
        </Text>
      )}
    </Stack>
  );
}



