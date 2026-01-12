
/**
 * SvgModeContent Component
 * 
 * Placeholder content for the "SVG Mask" mode - coming soon feature.
 * Will allow generating procedural masks from text descriptions.
 */

import React from 'react';
import { Stack, Center, Title, Text, Badge, ThemeIcon, Paper } from '@mantine/core';
import { IconVectorSpline } from '@tabler/icons-react';

export function SvgModeContent() {
  return (
    <Center h={300}>
      <Paper p="xl" withBorder bg="gray.0" radius="lg">
        <Stack align="center" gap="lg">
          <ThemeIcon size={80} variant="light" color="gray" radius="xl">
            <IconVectorSpline size={40} />
          </ThemeIcon>

          <Stack gap="xs" align="center">
            <Title order={3}>SVG Mask Generation</Title>
            <Badge color="blue" size="lg" variant="light">
              Coming Soon
            </Badge>
          </Stack>

          <Text c="dimmed" ta="center" maw={300} size="sm">
            Generate procedural masks from text descriptions for precise control over map regions.
          </Text>

          <Stack gap={4} align="center">
            <Text size="xs" c="dimmed" fs="italic">
              "a winding river" → 🎭
            </Text>
            <Text size="xs" c="dimmed" fs="italic">
              "dungeon corridors" → 🎭
            </Text>
            <Text size="xs" c="dimmed" fs="italic">
              "scattered rocks" → 🎭
            </Text>
          </Stack>
        </Stack>
      </Paper>
    </Center>
  );
}

export default SvgModeContent;
