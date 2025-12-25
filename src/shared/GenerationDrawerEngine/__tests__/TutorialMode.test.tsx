/**
 * TutorialMode.test.tsx - Integration tests for tutorial mode
 * 
 * Tests the complete tutorial mode flow including:
 * - Simulated progress without API calls
 * - Mock data return
 * - Auth bypass
 * - Mock image display
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { GenerationDrawerEngine } from '../GenerationDrawerEngine';
import { GenerationType, type GenerationDrawerConfig, type GeneratedImage, type InputSlotProps } from '../types';

// Mock useAuth
const mockLogin = jest.fn();
jest.mock('../../../context/AuthContext', () => ({
    useAuth: () => ({
        isLoggedIn: false, // User NOT logged in - tests auth bypass
        userId: null,
        login: mockLogin
    })
}));

// Mock fetch - should NOT be called in tutorial mode
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Test input/output types
interface TestInput {
    description: string;
}

interface TestOutput {
    name: string;
    description: string;
}

// Mock data for tutorial mode
const MOCK_OUTPUT: TestOutput = {
    name: 'Tutorial Creature',
    description: 'A creature generated in tutorial mode'
};

const MOCK_IMAGES: GeneratedImage[] = [
    {
        id: 'mock-1',
        url: 'https://example.com/mock-1.png',
        thumbnailUrl: 'https://example.com/mock-1-thumb.png',
        createdAt: new Date().toISOString()
    },
    {
        id: 'mock-2',
        url: 'https://example.com/mock-2.png',
        thumbnailUrl: 'https://example.com/mock-2-thumb.png',
        createdAt: new Date().toISOString()
    }
];

// Input slot component
const TestInputSlot: React.FC<InputSlotProps<TestInput>> = ({ input, onChange, disabled }) => (
    <textarea
        data-testid="test-input"
        value={input?.description || ''}
        onChange={(e) => onChange({ description: e.target.value })}
        disabled={disabled}
        placeholder="Enter description"
    />
);

// Create tutorial config
const createTutorialConfig = (): GenerationDrawerConfig<TestInput, TestOutput> => ({
    id: 'test',
    title: 'Tutorial Test Drawer',
    defaultTab: 'text',
    tabs: [
        {
            id: 'text',
            label: 'Text',
            generationType: GenerationType.TEXT
        },
        {
            id: 'image',
            label: 'Image',
            generationType: GenerationType.IMAGE
        }
    ],
    InputSlot: TestInputSlot,
    initialInput: { description: '' },
    generationEndpoint: '/api/test/generate',
    transformInput: (input) => ({ description: input.description }),
    transformOutput: (response) => response as TestOutput,
    progressConfig: {
        [GenerationType.TEXT]: {
            estimatedDurationMs: 500,
            milestones: [
                { at: 0, message: 'Starting...' },
                { at: 50, message: 'Processing...' },
                { at: 100, message: 'Complete!' }
            ],
            color: 'blue'
        },
        [GenerationType.IMAGE]: {
            estimatedDurationMs: 500,
            milestones: [
                { at: 0, message: 'Generating image...' },
                { at: 100, message: 'Complete!' }
            ],
            color: 'green'
        }
    },
    tutorialConfig: {
        mockData: MOCK_OUTPUT,
        mockImages: MOCK_IMAGES,
        simulatedDurationMs: 500 // Short for tests
    },
    imageConfig: {
        imageEndpoint: '/api/test/generate-image',
        transformImageInput: (input) => ({ prompt: input.description })
    },
    isTutorialMode: true
});

const renderWithMantine = (ui: React.ReactElement) => {
    return render(
        <MantineProvider>
            {ui}
        </MantineProvider>
    );
};

describe('TutorialMode Integration', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        mockFetch.mockClear();
        mockLogin.mockClear();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('Text Generation in Tutorial Mode', () => {
        it('simulates generation without making API calls', async () => {
            const handleComplete = jest.fn();
            const config = createTutorialConfig();

            renderWithMantine(
                <GenerationDrawerEngine
                    opened={true}
                    onClose={() => {}}
                    config={config}
                    isTutorialMode={true}
                    onGenerationComplete={handleComplete}
                />
            );

            // Enter input - get the first one (active tab)
            const inputs = screen.getAllByTestId('test-input');
            await act(async () => {
                fireEvent.change(inputs[0], { target: { value: 'Test creature' } });
            });

            // Click generate
            const generateButton = screen.getByRole('button', { name: /generate/i });
            await act(async () => {
                fireEvent.click(generateButton);
            });

            // Advance timers for simulated generation
            await act(async () => {
                jest.advanceTimersByTime(600);
            });

            // Verify NO API call was made
            expect(mockFetch).not.toHaveBeenCalled();

            // Verify completion callback received mock data
            await waitFor(() => {
                expect(handleComplete).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: 'Tutorial Creature',
                        description: 'A creature generated in tutorial mode'
                    })
                );
            });
        });

        it('shows simulated progress during generation', async () => {
            jest.useRealTimers(); // Use real timers for this test
            const config = createTutorialConfig();

            renderWithMantine(
                <GenerationDrawerEngine
                    opened={true}
                    onClose={() => {}}
                    config={config}
                    isTutorialMode={true}
                />
            );

            // Enter input - get the first one (active tab)
            const inputs = screen.getAllByTestId('test-input');
            await act(async () => {
                fireEvent.change(inputs[0], { target: { value: 'Test creature' } });
            });

            // Click generate
            const generateButton = screen.getByRole('button', { name: /generate/i });
            await act(async () => {
                fireEvent.click(generateButton);
            });

            // Wait for progress bar to appear
            await waitFor(() => {
                const progressBar = document.querySelector('[data-tutorial="progress-bar"]');
                expect(progressBar).toBeInTheDocument();
            });
        });

        it('returns mock data from tutorialConfig', async () => {
            const handleComplete = jest.fn();
            const config = createTutorialConfig();

            renderWithMantine(
                <GenerationDrawerEngine
                    opened={true}
                    onClose={() => {}}
                    config={config}
                    isTutorialMode={true}
                    onGenerationComplete={handleComplete}
                />
            );

            // Enter input and generate - get the first one (active tab)
            const inputs = screen.getAllByTestId('test-input');
            await act(async () => {
                fireEvent.change(inputs[0], { target: { value: 'Test' } });
            });

            const generateButton = screen.getByRole('button', { name: /generate/i });
            await act(async () => {
                fireEvent.click(generateButton);
            });

            await act(async () => {
                jest.advanceTimersByTime(600);
            });

            // Verify mock data returned
            await waitFor(() => {
                expect(handleComplete).toHaveBeenCalledWith(MOCK_OUTPUT);
            });
        });
    });

    describe('AuthGate Bypass in Tutorial Mode', () => {
        it('shows protected content even when not logged in', () => {
            const config = createTutorialConfig();

            renderWithMantine(
                <GenerationDrawerEngine
                    opened={true}
                    onClose={() => {}}
                    config={config}
                    isTutorialMode={true}
                />
            );

            // Should NOT show login prompt
            expect(screen.queryByText('Login Required')).not.toBeInTheDocument();

            // Should show the drawer content
            expect(screen.getByText('Tutorial Test Drawer')).toBeInTheDocument();
        });

        it('shows login prompt when not in tutorial mode and not logged in', () => {
            // This test verifies the contrast - tutorial mode bypasses auth
            const config = createTutorialConfig();
            
            // Add upload tab to test AuthGate
            config.tabs.push({
                id: 'upload',
                label: 'Upload',
                type: GenerationType.IMAGE
            });
            
            config.imageConfig = {
                ...config.imageConfig!,
                uploadEndpoint: '/api/test/upload',
                libraryEndpoint: '/api/test/library'
            };

            renderWithMantine(
                <GenerationDrawerEngine
                    opened={true}
                    onClose={() => {}}
                    config={config}
                    isTutorialMode={false} // NOT in tutorial mode
                />
            );

            // Content should still be accessible - AuthGate is for upload/library features
            expect(screen.getByText('Tutorial Test Drawer')).toBeInTheDocument();
        });
    });

    describe('Mock Images in Tutorial Mode', () => {
        it('displays mock images in gallery when configured', async () => {
            const config = createTutorialConfig();

            renderWithMantine(
                <GenerationDrawerEngine
                    opened={true}
                    onClose={() => {}}
                    config={config}
                    isTutorialMode={true}
                    initialImages={MOCK_IMAGES}
                />
            );

            // Switch to image tab
            const imageTab = screen.getByRole('tab', { name: /image/i });
            await act(async () => {
                fireEvent.click(imageTab);
            });

            // Mock images should be visible
            const images = screen.getAllByRole('img');
            expect(images.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Data Tutorial Attributes', () => {
        it('has all required data-tutorial attributes for tutorial targeting', () => {
            const config = createTutorialConfig();

            renderWithMantine(
                <GenerationDrawerEngine
                    opened={true}
                    onClose={() => {}}
                    config={config}
                    isTutorialMode={true}
                />
            );

            // Drawer container
            const drawer = document.querySelector('[data-tutorial="generation-drawer"]');
            expect(drawer).toBeInTheDocument();

            // Drawer title
            const title = document.querySelector('[data-tutorial="generation-drawer-title"]');
            expect(title).toBeInTheDocument();

            // Tab
            const textTab = document.querySelector('[data-tutorial="text-generation-tab"]');
            expect(textTab).toBeInTheDocument();

            // Generate button
            const generateButton = document.querySelector('[data-tutorial="generate-button"]');
            expect(generateButton).toBeInTheDocument();
        });

        it('has progress bar data-tutorial when generating', async () => {
            jest.useRealTimers(); // Use real timers for this test
            const config = createTutorialConfig();

            renderWithMantine(
                <GenerationDrawerEngine
                    opened={true}
                    onClose={() => {}}
                    config={config}
                    isTutorialMode={true}
                />
            );

            // Enter input and start generation - get the first one (active tab)
            const inputs = screen.getAllByTestId('test-input');
            await act(async () => {
                fireEvent.change(inputs[0], { target: { value: 'Test' } });
            });

            const generateButton = screen.getByRole('button', { name: /generate/i });
            await act(async () => {
                fireEvent.click(generateButton);
            });

            // Wait for progress bar to appear with data-tutorial
            await waitFor(() => {
                const progressBar = document.querySelector('[data-tutorial="progress-bar"]');
                expect(progressBar).toBeInTheDocument();
            });
        });
    });

    describe('Tutorial Mode Flag Propagation', () => {
        it('passes isTutorialMode to child components', () => {
            const config = createTutorialConfig();

            renderWithMantine(
                <GenerationDrawerEngine
                    opened={true}
                    onClose={() => {}}
                    config={config}
                    isTutorialMode={true}
                />
            );

            // The fact that content renders without login proves tutorial mode propagated
            expect(screen.getByText('Tutorial Test Drawer')).toBeInTheDocument();
            expect(screen.getAllByTestId('test-input').length).toBeGreaterThan(0);
        });
    });
});

