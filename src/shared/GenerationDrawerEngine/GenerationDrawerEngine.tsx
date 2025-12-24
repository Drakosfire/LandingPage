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
import { GenerationPanel } from './components/GenerationPanel';
import { useGeneration } from './hooks/useGeneration';
import { GenerationType } from './types';

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
  const {
    tabs,
    defaultTab,
    InputSlot,
    initialInput,
    tutorialConfig,
    validateInput,
    generationEndpoint,
    transformInput,
    transformOutput,
    onGenerationStart,
    onGenerationComplete,
    onGenerationError,
    progressConfig
  } = config;

  // State management
  const [activeTab, setActiveTab] = useState<string>(
    defaultTab || tabs[0]?.id || ''
  );
  const [input, setInput] = useState<TInput>(initialInput);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string> | undefined
  >(undefined);

  // Determine if in tutorial mode
  const isTutorialMode = Boolean(tutorialConfig);

  // Setup generation hook
  // Note: Tutorial mode mock data should be provided via onGenerationComplete callback
  // For now, tutorial mode will use simulated delay but services should handle mock data
  const generation = useGeneration<TInput, TOutput>(
    {
      generationEndpoint,
      transformInput,
      transformOutput,
      timeout: 150000, // 150 seconds
      tutorialConfig: tutorialConfig
        ? {
            simulatedDurationMs: tutorialConfig.simulatedDurationMs || 7000
          }
        : undefined
    },
    isTutorialMode
  );

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
      generation.clearError();
    }
  }, [opened, initialInput, generation]);

  // Handle input changes from InputSlot
  const handleInputChange = useCallback(
    (value: Partial<TInput>) => {
      setInput((prev) => ({ ...prev, ...value }));
      // Clear validation errors when input changes
      if (validationErrors) {
        setValidationErrors(undefined);
      }
    },
    [validationErrors]
  );

  // Handle generation
  const handleGenerate = useCallback(
    async (inputValue: TInput) => {
      onGenerationStart?.();

      try {
        const output = await generation.generate(inputValue);
        onGenerationComplete?.(output);
      } catch (err) {
        // Error is already set in generation hook
        onGenerationError?.(generation.error!);
      }
    },
    [generation, onGenerationStart, onGenerationComplete, onGenerationError]
  );

  // Handle retry
  const handleRetry = useCallback(() => {
    generation.clearError();
    handleGenerate(input);
  }, [generation, handleGenerate, input]);

  // Get active tab config
  const activeTabConfig = tabs.find((tab) => tab.id === activeTab);
  const activeGenerationType = activeTabConfig?.generationType;

  // Get progress config for active generation type
  const currentProgressConfig =
    activeGenerationType && progressConfig
      ? progressConfig[activeGenerationType]
      : undefined;

  return (
    <DrawerShell opened={opened} onClose={onClose} title={config.title}>
      <Stack gap="md" h="100%">
        <Tabs value={activeTab} onChange={(val) => setActiveTab(val || '')}>
          <TabsContainer tabs={tabs} isGenerating={generation.isGenerating} />

          {tabs.map((tab) => (
            <Tabs.Panel
              key={tab.id}
              value={tab.id}
              pt="md"
              data-tutorial={`${tab.id}-panel`}
            >
              <Stack gap="md">
                {/* Input Slot */}
                <InputSlot
                  value={input}
                  onChange={handleInputChange}
                  isGenerating={generation.isGenerating}
                  isTutorialMode={isTutorialMode}
                  errors={validationErrors}
                />

                {/* Generation Panel (only for generation tabs) */}
                {tab.generationType && (
                  <GenerationPanel
                    input={input}
                    validateInput={validateInput}
                    onGenerate={handleGenerate}
                    isGenerating={generation.isGenerating}
                    error={generation.error}
                    onRetry={handleRetry}
                    progressConfig={currentProgressConfig}
                    generationType={tab.generationType}
                  />
                )}
              </Stack>
            </Tabs.Panel>
          ))}
        </Tabs>
      </Stack>
    </DrawerShell>
  );
}
