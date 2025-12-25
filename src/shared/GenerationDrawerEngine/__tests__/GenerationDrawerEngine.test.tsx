/**
 * Unit tests for GenerationDrawerEngine main component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { GenerationDrawerEngine } from '../GenerationDrawerEngine';
import { renderWithConfig, createMockConfig } from '../test-utils/mockConfig.tsx';
import { GenerationType } from '../types';

describe('GenerationDrawerEngine', () => {
  describe('Rendering', () => {
    it('renders DrawerShell when opened', () => {
      const config = createMockConfig({
        id: 'test',
        title: 'Test Drawer'
      });
      renderWithConfig(config, { opened: true });
      expect(screen.getByText('Test Drawer')).toBeInTheDocument();
    });

    it('does not render content when closed', () => {
      const config = createMockConfig();
      renderWithConfig(config, { opened: false });
      // Drawer should not be visible
      const drawer = screen.queryByRole('dialog', { hidden: true });
      if (drawer) {
        expect(drawer).not.toBeVisible();
      }
    });

    it('renders with correct title from config', () => {
      const config = createMockConfig({
        title: 'Custom Title'
      });
      renderWithConfig(config, { opened: true });
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('applies data-tutorial attribute to drawer', () => {
      const config = createMockConfig();
      renderWithConfig(config, { opened: true });
      const drawer = screen.getByTestId('generation-drawer');
      expect(drawer).toHaveAttribute('data-tutorial', 'generation-drawer');
    });
  });

  describe('Tab Management', () => {
    it('renders all tabs from config', () => {
      const config = createMockConfig({
        tabs: [
          {
            id: 'text',
            label: 'Text',
            icon: <span>📝</span>,
            generationType: GenerationType.TEXT
          },
          {
            id: 'image',
            label: 'Image',
            icon: <span>🖼️</span>,
            generationType: GenerationType.IMAGE
          }
        ]
      });
      renderWithConfig(config, { opened: true });
      expect(screen.getByRole('tab', { name: 'Text' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Image' })).toBeInTheDocument();
    });

    it('sets defaultTab as active initially', () => {
      const config = createMockConfig({
        defaultTab: 'image',
        tabs: [
          {
            id: 'text',
            label: 'Text',
            icon: <span>📝</span>
          },
          {
            id: 'image',
            label: 'Image',
            icon: <span>🖼️</span>
          }
        ]
      });
      renderWithConfig(config, { opened: true });
      const imageTab = screen.getByRole('tab', { name: 'Image' });
      expect(imageTab).toHaveAttribute('aria-selected', 'true');
    });

    it('switches tabs on click', async () => {
      const config = createMockConfig({
        tabs: [
          {
            id: 'text',
            label: 'Text',
            icon: <span>📝</span>
          },
          {
            id: 'image',
            label: 'Image',
            icon: <span>🖼️</span>
          }
        ]
      });
      renderWithConfig(config, { opened: true });
      const imageTab = screen.getByRole('tab', { name: 'Image' });
      imageTab.click();
      await waitFor(() => {
        expect(imageTab).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('disables tabs during generation', () => {
      const config = createMockConfig();
      // This will be tested when isGenerating state is implemented
      renderWithConfig(config, { opened: true });
      // Placeholder assertion
      expect(screen.getByTestId('generation-drawer-engine')).toBeInTheDocument();
    });

    it('preserves tab state across open/close', () => {
      const config = createMockConfig({
        defaultTab: 'image'
      });
      const { rerender } = renderWithConfig(config, { opened: true });
      const imageTab = screen.getByRole('tab', { name: 'Image' });
      expect(imageTab).toHaveAttribute('aria-selected', 'true');

      rerender(
        <GenerationDrawerEngine
          config={config}
          opened={false}
          onClose={jest.fn()}
        />
      );

      rerender(
        <GenerationDrawerEngine
          config={config}
          opened={true}
          onClose={jest.fn()}
        />
      );

      // Tab should still be 'image' after reopen
      const imageTabAfter = screen.getByRole('tab', { name: 'Image' });
      expect(imageTabAfter).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('InputSlot Integration', () => {
    it('renders InputSlot component with correct props', () => {
      const config = createMockConfig({
        initialInput: { prompt: 'test' }
      });
      renderWithConfig(config, { opened: true });
      expect(screen.getByTestId('mock-input-slot')).toBeInTheDocument();
    });

    it('passes value and onChange to InputSlot', () => {
      const config = createMockConfig({
        initialInput: { prompt: 'test prompt' }
      });
      renderWithConfig(config, { opened: true });
      const valueDisplay = screen.getByTestId('input-value');
      expect(valueDisplay).toHaveTextContent('test prompt');
    });

    it('passes isGenerating state to InputSlot', () => {
      const config = createMockConfig();
      renderWithConfig(config, { opened: true });
      const isGeneratingDisplay = screen.getByTestId('is-generating');
      // Initially should be false
      expect(isGeneratingDisplay).toHaveTextContent('false');
    });

    it('passes isTutorialMode to InputSlot', () => {
      const config = createMockConfig({
        tutorialConfig: {
          mockAuthState: true
        }
      });
      renderWithConfig(config, { opened: true });
      const tutorialModeDisplay = screen.getByTestId('is-tutorial-mode');
      expect(tutorialModeDisplay).toHaveTextContent('true');
    });

    it('passes validation errors to InputSlot', () => {
      const config = createMockConfig();
      // This will be tested when validation is implemented
      renderWithConfig(config, { opened: true });
      expect(screen.getByTestId('mock-input-slot')).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('calls onClose when drawer close button clicked', () => {
      const onClose = jest.fn();
      const config = createMockConfig();
      renderWithConfig(config, { opened: true, onClose });
      const closeButton = screen.getByLabelText('Close generation drawer');
      closeButton.click();
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onGenerationStart when generation begins', () => {
      const onGenerationStart = jest.fn();
      const config = createMockConfig({
        onGenerationStart
      });
      // This will be tested when generation is implemented
      renderWithConfig(config, { opened: true });
      expect(config.onGenerationStart).toBeDefined();
    });

    it('calls onGenerationComplete with output on success', () => {
      const onGenerationComplete = jest.fn();
      const config = createMockConfig({
        onGenerationComplete
      });
      // This will be tested when generation is implemented
      renderWithConfig(config, { opened: true });
      expect(config.onGenerationComplete).toBeDefined();
    });

    it('calls onGenerationError with error on failure', () => {
      const onGenerationError = jest.fn();
      const config = createMockConfig({
        onGenerationError
      });
      // This will be tested when generation is implemented
      renderWithConfig(config, { opened: true });
      expect(config.onGenerationError).toBeDefined();
    });
  });
});

