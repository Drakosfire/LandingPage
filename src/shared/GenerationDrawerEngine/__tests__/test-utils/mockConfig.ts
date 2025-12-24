/**
 * Test utilities for creating mock GenerationDrawerConfig objects
 */

import type { ReactNode } from 'react';
import { GenerationType } from '../../types';
import type { GenerationDrawerConfig, ExampleConfig } from '../../types';

/**
 * Mock input slot component for testing
 */
export const MockInputSlot = <TInput,>({
    value,
    onChange,
    isGenerating,
    isTutorialMode,
    errors
}: {
    value: TInput;
    onChange: (value: Partial<TInput>) => void;
    isGenerating: boolean;
    isTutorialMode: boolean;
    errors?: Record<string, string>;
}) => {
    return (
        <div data - testid= "mock-input-slot" >
        <div data - testid="input-value" > { JSON.stringify(value) } </div>
            < div data - testid="is-generating" > { String(isGenerating) } </div>
                < div data - testid="is-tutorial-mode" > { String(isTutorialMode) } </div>
    { errors && <div data - testid="errors" > { JSON.stringify(errors) } </div> }
    <button
        onClick={ () => onChange({} as Partial<TInput>) }
    data - testid="mock-change-button"
        >
        Change
        </button>
        </div>
  );
};

/**
 * Creates a mock GenerationDrawerConfig with sensible defaults
 * @param overrides - Partial config to override defaults
 */
export const createMockConfig = <TInput, TOutput>(
    overrides?: Partial<GenerationDrawerConfig<TInput, TOutput>>
): GenerationDrawerConfig<TInput, TOutput> => {
    const defaultIcon: ReactNode = <span>📝</span>;

    return {
        id: 'test-drawer',
        title: 'Test Drawer',
        tabs: [
            {
                id: 'text',
                label: 'Text Generation',
                icon: defaultIcon,
                generationType: GenerationType.TEXT
            }
        ],
        defaultTab: 'text',
        InputSlot: MockInputSlot as any,
        initialInput: {} as TInput,
        generationEndpoint: '/api/test/generate',
        transformInput: (input: TInput) => input as Record<string, unknown>,
        transformOutput: (response: unknown) => response as TOutput,
        ...overrides
    };
};

/**
 * Creates a mock example configuration
 */
export const createMockExample = <TInput,>(
    name: string,
    input: TInput,
    description?: string
): ExampleConfig<TInput> => ({
    name,
    input,
    description
});

