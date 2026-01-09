/**
 * MaskPreview Component
 *
 * Displays a thumbnail preview of the current mask.
 * Implements TDD tests from T174-T175.
 */

import React from 'react';
import { Box, Text, Stack, Center, ActionIcon } from '@mantine/core';
import { IconMask, IconX } from '@tabler/icons-react';

export interface MaskPreviewProps {
  /** Base64-encoded mask data */
  maskData: string | null | undefined;
  /** Optional delete callback */
  onDelete?: () => void;
}

export const MaskPreview: React.FC<MaskPreviewProps> = ({ maskData, onDelete }) => {
  const hasMask = maskData && maskData.length > 0;

  return (
    <Box
      data-testid="mask-preview"
      style={{
        maxWidth: '150px',
        border: '1px solid var(--mantine-color-gray-4)',
        borderRadius: 'var(--mantine-radius-sm)',
        overflow: 'hidden',
        backgroundColor: 'var(--mantine-color-gray-1)',
      }}
    >
      {hasMask ? (
        <Box style={{ position: 'relative' }}>
          <img
            src={maskData}
            alt="Mask preview"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
          {onDelete && (
            <ActionIcon
              variant="filled"
              color="red"
              size="sm"
              onClick={onDelete}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
              }}
              title="Delete mask"
            >
              <IconX size={14} />
            </ActionIcon>
          )}
        </Box>
      ) : (
        <Center
          data-testid="no-mask-placeholder"
          style={{
            width: '100%',
            height: '80px',
            padding: 'var(--mantine-spacing-sm)',
          }}
        >
          <Stack gap="xs" align="center">
            <IconMask size={24} color="var(--mantine-color-gray-5)" />
            <Text size="xs" c="dimmed">
              No mask
            </Text>
          </Stack>
        </Center>
      )}
    </Box>
  );
};

export default MaskPreview;
