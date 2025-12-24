/**
 * Generation Drawer Engine - Main Component
 * 
 * Orchestrates drawer shell, tabs, input slot, and state management.
 * This is the main entry point for services to use the generation drawer.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Stack, Tabs } from '@mantine/core';
import type { GenerationDrawerEngineProps } from './types';
import { DrawerShell } from './components/DrawerShell';
import { TabsContainer } from './components/TabsContainer';

/**
 * Main orchestrating component for the generation drawer engine.
 * 
 * @typeParam TInput - The input type for the service
 * @typeParam TOutput - The output type for the service
 */
export function GenerationDrawerEngine<TInput, TOutput>(
  props: GenerationDrawerEngineProps<TInput, TOutput>
) {
  const { config, opened, onClose } = props;
  const { tabs, defaultTab, InputSlot, initialInput, tutorialConfig } = config;

  // State management
  const [activeTab, setActiveTab] = useState<string>(
    defaultTab || tabs[0]?.id || ''
  );
  const [input, setInput] = useState<TInput>(initialInput);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string> | undefined
  >(undefined);

  // Update active tab when defaultTab changes or drawer opens
  useEffect(() => {
    if (opened && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [opened, defaultTab]);

  // Reset input when drawer closes
  useEffect(() => {
    if (!opened) {
      setInput(initialInput);
      setValidationErrors(undefined);
    }
  }, [opened, initialInput]);

  // Handle input changes from InputSlot
  const handleInputChange = useCallback((value: Partial<TInput>) => {
    setInput((prev) => ({ ...prev, ...value }));
    // Clear validation errors when input changes
    if (validationErrors) {
      setValidationErrors(undefined);
    }
  }, [validationErrors]);

  // Determine if in tutorial mode
  const isTutorialMode = Boolean(tutorialConfig);

  // Get active tab config
  const activeTabConfig = tabs.find((tab) => tab.id === activeTab);

  return (
    <DrawerShell
      opened={opened}
      onClose={onClose}
      title={config.title}
    >
      <Stack gap="md" h="100%">
        <Tabs value={activeTab} onChange={(val) => setActiveTab(val || '')}>
          <TabsContainer
            tabs={tabs}
            isGenerating={isGenerating}
          />

          {tabs.map((tab) => (
            <Tabs.Panel key={tab.id} value={tab.id} pt="md" data-tutorial={`${tab.id}-panel`}>
              <InputSlot
                value={input}
                onChange={handleInputChange}
                isGenerating={isGenerating}
                isTutorialMode={isTutorialMode}
                errors={validationErrors}
              />
            </Tabs.Panel>
          ))}
        </Tabs>
      </Stack>
    </DrawerShell>
  );
}
