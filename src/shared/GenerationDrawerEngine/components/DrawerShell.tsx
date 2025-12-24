/**
 * DrawerShell - Mantine Drawer wrapper with standardized positioning
 * 
 * Provides consistent drawer positioning (left side, below header) across all services.
 */

import React, { ReactNode } from 'react';
import { Drawer, Title, Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export interface DrawerShellProps {
  /** Whether drawer is open */
  opened: boolean;
  /** Close drawer callback */
  onClose: () => void;
  /** Drawer title */
  title: string;
  /** Drawer content */
  children: ReactNode;
}

/**
 * DrawerShell component with standardized positioning
 */
export const DrawerShell: React.FC<DrawerShellProps> = ({
  opened,
  onClose,
  title,
  children
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="left"
      size="lg"
      title={
        <Box data-tutorial="generation-drawer-title">
          <Title order={4}>
            {isMobile ? 'Generation' : title}
          </Title>
        </Box>
      }
      closeButtonProps={{ 'aria-label': 'Close generation drawer' }}
      overlayProps={{ opacity: 0.3, blur: 2 }}
      styles={{
        content: {
          marginTop: '88px', // Below UnifiedHeader (88px desktop height)
          marginLeft: '0', // Full width with UnifiedHeader
          height: 'calc(100vh - 88px)',
          width: '100%' // Full width
        }
      }}
      data-tutorial="generation-drawer"
    >
      {children}
    </Drawer>
  );
};

