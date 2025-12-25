/**
 * Test utilities for rendering GenerationDrawerEngine with providers
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { AuthProvider } from '../../../context/AuthContext';
import type { GenerationDrawerConfig, GenerationDrawerEngineProps } from '../types';
import { GenerationDrawerEngine } from '../../GenerationDrawerEngine';

/**
 * Renders GenerationDrawerEngine with all required providers
 * @param config - Drawer configuration
 * @param props - Additional props for GenerationDrawerEngine
 * @param options - Render options
 */
export function renderWithConfig<TInput, TOutput>(
    config: GenerationDrawerConfig<TInput, TOutput>,
    props?: Partial<GenerationDrawerEngineProps<TInput, TOutput>>,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    const defaultProps: GenerationDrawerEngineProps<TInput, TOutput> = {
        config,
        opened: true,
        onClose: jest.fn(),
        ...props
    };

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <MantineProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </MantineProvider>
    );

    return render(
        <GenerationDrawerEngine {...defaultProps} />,
        {
            wrapper: Wrapper,
            ...options
        }
    );
}

/**
 * Renders a component with Mantine and Auth providers
 */
export function renderWithProviders(
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <MantineProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </MantineProvider>
    );

    return render(ui, { wrapper: Wrapper, ...options });
}

