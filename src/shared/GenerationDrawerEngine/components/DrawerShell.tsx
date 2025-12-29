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
      zIndex={400} // Above other drawers (PlayerCharacterCreationDrawer is 350)
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
        inner: {
          top: '88px', // Below UnifiedHeader (88px desktop height)
          height: 'calc(100vh - 88px)'
        },
        content: {
          height: '100%',
          maxHeight: '100%'
        },
        body: {
          // Use calc to account for drawer header (~60px)
          height: 'calc(100vh - 88px - 60px)',
          maxHeight: 'calc(100vh - 88px - 60px)',
          overflow: 'auto'
        }
      }}
      data-tutorial="generation-drawer"
    >
      {children}
    </Drawer>
  );
};

