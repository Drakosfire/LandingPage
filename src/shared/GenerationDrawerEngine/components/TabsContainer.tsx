/**
 * TabsContainer - Config-driven tab list rendering
 * 
 * Renders Tabs.List from configuration with icons, labels, badges, and disabled states.
 */

import React from 'react';
import { Tabs } from '@mantine/core';
import type { TabConfig } from '../types';

export interface TabsContainerProps {
  /** Tab configurations */
  tabs: TabConfig[];
  /** Whether generation is in progress (disables all tabs) */
  isGenerating: boolean;
}

/**
 * TabsContainer component for config-driven tab list rendering
 */
export const TabsContainer: React.FC<TabsContainerProps> = ({
  tabs,
  isGenerating
}) => {
  return (
    <Tabs.List grow>
      {tabs.map((tab) => (
        <Tabs.Tab
          key={tab.id}
          value={tab.id}
          leftSection={tab.icon}
          disabled={isGenerating || tab.disabled}
          data-tutorial={`${tab.id}-generation-tab`}
        >
          {tab.label}
          {tab.badge !== undefined && (
            <span style={{ marginLeft: 8 }}>{tab.badge}</span>
          )}
        </Tabs.Tab>
      ))}
    </Tabs.List>
  );
};

