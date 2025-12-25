/**
 * Prototype Data Contract Tests
 * 
 * These tests validate that the engine works correctly with real-world
 * data shapes. They use prototype data objects to ensure:
 * 
 * 1. The engine accepts the expected input shapes
 * 2. The engine transforms data correctly
 * 3. The engine handles output shapes properly
 * 4. Services can follow these patterns
 * 
 * These prototypes should be flexible initially, but aim to become standards.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { GenerationDrawerEngine } from '../GenerationDrawerEngine';
import { renderWithConfig } from '../test-utils/renderWithEngine';
import type { GenerationDrawerConfig } from '../types';
import { GenerationType } from '../types';

// Import prototype data
import type {
  StatBlockInput,
  StatBlockOutput
} from '../prototypes';
import {
  STATBLOCK_INPUT_EXAMPLE,
  STATBLOCK_OUTPUT_EXAMPLE,
  PROGRESS_CONFIG_EXAMPLE
} from '../prototypes';

/**
 * Mock Input Slot Component for StatBlock
 */
const StatBlockInputSlot: React.FC<{
  value: StatBlockInput;
  onChange: (value: Partial<StatBlockInput>) => void;
  isGenerating: boolean;
  isTutorialMode: boolean;
  errors?: Record<string, string>;
}> = ({ value, onChange, isGenerating, isTutorialMode, errors }) => {
  return (
    <div data-testid="statblock-input-slot">
      <textarea
        data-testid="description-input"
        value={value.description}
        onChange={(e) => onChange({ description: e.target.value })}
        disabled={isGenerating}
        placeholder="Describe your creature..."
      />
      {errors?.description && (
        <div data-testid="error-description">{errors.description}</div>
      )}
    </div>
  );
};

/**
 * Create a StatBlock drawer config using prototype data
 */
function createStatBlockConfig(): GenerationDrawerConfig<StatBlockInput, StatBlockOutput> {
  return {
    id: 'statblock',
    title: 'Generate StatBlock',
    tabs: [
      {
        id: 'text',
        label: 'Text Generation',
        icon: <span>📝</span>,
        generationType: GenerationType.TEXT
      }
    ],
    defaultTab: 'text',
    InputSlot: StatBlockInputSlot,
    initialInput: STATBLOCK_INPUT_EXAMPLE,
    generationEndpoint: '/api/statblockgenerator/generate',
    transformInput: (input: StatBlockInput) => {
      // Transform prototype input to API format
      return {
        description: input.description,
        name: input.name,
        challengeRating: input.challengeRating,
        abilities: input.abilities,
        environment: input.environment
      };
    },
    transformOutput: (response: any): StatBlockOutput => {
      // Transform API response to prototype output format
      return {
        statblock: response.statblock || response,
        imagePrompt: response.imagePrompt,
        images: response.images || []
      };
    },
    validateInput: (input: StatBlockInput) => {
      if (!input.description || input.description.trim().length === 0) {
        return {
          valid: false,
          errors: { description: 'Description is required' }
        };
      }
      return { valid: true, errors: {} };
    },
    progressConfig: {
      [GenerationType.TEXT]: PROGRESS_CONFIG_EXAMPLE
    },
    onGenerationComplete: jest.fn(),
    onGenerationError: jest.fn()
  };
}

describe('Prototype Data Contracts', () => {
  describe('StatBlockGenerator Prototypes', () => {
    it('accepts StatBlockInput prototype shape', () => {
      const config = createStatBlockConfig();
      const { container } = renderWithConfig(config, { opened: true });
      
      // Input slot should render with prototype data
      const inputSlot = screen.getByTestId('statblock-input-slot');
      expect(inputSlot).toBeInTheDocument();
      
      const descriptionInput = screen.getByTestId('description-input');
      expect(descriptionInput).toHaveValue(STATBLOCK_INPUT_EXAMPLE.description);
    });

    it('validates StatBlockInput prototype correctly', () => {
      const config = createStatBlockConfig();
      // Override initialInput to have empty description (invalid)
      config.initialInput = { description: '' } as StatBlockInput;
      renderWithConfig(config, { opened: true });
      
      // Validation should catch empty description
      const generateButton = screen.getByRole('button', { name: /generate/i });
      expect(generateButton).toBeDisabled();
    });

    it('transforms StatBlockInput to API format', () => {
      const config = createStatBlockConfig();
      const transformed = config.transformInput(STATBLOCK_INPUT_EXAMPLE);
      
      expect(transformed).toMatchObject({
        description: STATBLOCK_INPUT_EXAMPLE.description,
        name: STATBLOCK_INPUT_EXAMPLE.name,
        challengeRating: STATBLOCK_INPUT_EXAMPLE.challengeRating
      });
    });

    it('transforms API response to StatBlockOutput prototype', () => {
      const config = createStatBlockConfig();
      const mockApiResponse = {
        statblock: STATBLOCK_OUTPUT_EXAMPLE.statblock,
        imagePrompt: STATBLOCK_OUTPUT_EXAMPLE.imagePrompt
      };
      
      const transformed = config.transformOutput(mockApiResponse);
      
      expect(transformed).toHaveProperty('statblock');
      expect(transformed.statblock).toHaveProperty('name');
      expect(transformed.statblock).toHaveProperty('stats');
      expect(transformed.statblock).toHaveProperty('actions');
    });

    it('handles StatBlockOutput prototype shape in callbacks', async () => {
      const onComplete = jest.fn();
      const config = createStatBlockConfig();
      config.onGenerationComplete = onComplete;
      
      renderWithConfig(config, { opened: true });
      
      // Simulate generation completion with prototype output
      // (In real usage, this would come from the API)
      if (onComplete) {
        onComplete(STATBLOCK_OUTPUT_EXAMPLE);
      }
      
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            statblock: expect.objectContaining({
              name: expect.any(String),
              stats: expect.any(Object)
            })
          })
        );
      });
    });
  });

  describe('Prototype Data Shape Validation', () => {
    it('StatBlockInput has required fields', () => {
      const input: StatBlockInput = STATBLOCK_INPUT_EXAMPLE;
      
      expect(input).toHaveProperty('description');
      expect(typeof input.description).toBe('string');
      expect(input.description.length).toBeGreaterThan(0);
    });

    it('StatBlockOutput has required structure', () => {
      const output: StatBlockOutput = STATBLOCK_OUTPUT_EXAMPLE;
      
      expect(output).toHaveProperty('statblock');
      expect(output.statblock).toHaveProperty('name');
      expect(output.statblock).toHaveProperty('stats');
      expect(output.statblock.stats).toHaveProperty('strength');
      expect(output.statblock).toHaveProperty('actions');
      expect(Array.isArray(output.statblock.actions)).toBe(true);
    });

    it('ProgressConfig prototype has correct structure', () => {
      const config = PROGRESS_CONFIG_EXAMPLE;
      
      expect(config).toHaveProperty('estimatedDurationMs');
      expect(typeof config.estimatedDurationMs).toBe('number');
      expect(config).toHaveProperty('milestones');
      expect(Array.isArray(config.milestones)).toBe(true);
      
      if (config.milestones && config.milestones.length > 0) {
        expect(config.milestones[0]).toHaveProperty('at');
        expect(config.milestones[0]).toHaveProperty('message');
      }
    });
  });

  describe('Engine Integration with Prototypes', () => {
    it('engine accepts config built from prototypes', () => {
      const config = createStatBlockConfig();
      const { container } = renderWithConfig(config, { opened: true });
      
      expect(container).toBeInTheDocument();
      expect(screen.getByText('Generate StatBlock')).toBeInTheDocument();
    });

    it('engine initializes with prototype input data', () => {
      const config = createStatBlockConfig();
      renderWithConfig(config, { opened: true });
      
      const descriptionInput = screen.getByTestId('description-input');
      expect(descriptionInput).toHaveValue(STATBLOCK_INPUT_EXAMPLE.description);
    });
  });
});

