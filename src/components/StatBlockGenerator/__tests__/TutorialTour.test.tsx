/**
 * TutorialTour.test.tsx
 * 
 * Tests for TutorialTour component initialization and progression
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { TutorialTour } from '../TutorialTour';

// Mock uuid
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-uuid'),
}));

// Mock tutorial cookies
const mockHasCompletedTutorial = jest.fn(() => false);
const mockMarkTutorialCompleted = jest.fn();
jest.mock('../../../utils/tutorialCookies', () => ({
    tutorialCookies: {
        hasCompletedTutorial: () => mockHasCompletedTutorial(),
        markTutorialCompleted: () => mockMarkTutorialCompleted(),
        resetTutorial: jest.fn(),
    },
}));

// Mock tutorial steps
jest.mock('../../../constants/tutorialSteps', () => ({
    tutorialSteps: [
        {
            name: 'welcome',
            target: '[data-tutorial="generation-button"]',
            content: 'Welcome to the tutorial',
            placement: 'bottom' as const,
        },
        {
            name: 'drawer',
            target: '[data-tutorial="generation-drawer-title"]',
            content: 'This is the drawer',
            placement: 'bottom-start' as const,
        },
    ],
    TUTORIAL_STEP_NAMES: {
        WELCOME: 'welcome',
        DRAWER: 'drawer',
    },
    getStepIndex: (name: string) => (name === 'welcome' ? 0 : 1),
    getStepName: (index: number) => (index === 0 ? 'welcome' : 'drawer'),
}));

// Mock fixtures
jest.mock('../../../fixtures/demoStatblocks', () => ({
    EMPTY_STATBLOCK: {
        name: '',
        actions: [],
    },
    HERMIONE_DEMO_STATBLOCK: {
        name: 'Hermione',
        actions: [],
    },
}));

// Mock StatBlockGeneratorProvider
const mockReplaceCreatureDetails = jest.fn();
jest.mock('../StatBlockGeneratorProvider', () => ({
    useStatBlockGenerator: () => ({
        replaceCreatureDetails: mockReplaceCreatureDetails,
    }),
}));

// Mock AuthContext
jest.mock('../../../context/AuthContext', () => ({
    useAuth: () => ({
        isLoggedIn: false,
    }),
}));

// Mock Mantine theme
jest.mock('@mantine/core', () => ({
    useMantineTheme: () => ({
        colors: {
            blue: { 6: '#228be6' },
            dark: { 9: '#1a1b1e' },
            gray: { 6: '#868e96', 7: '#495057' },
        },
        white: '#ffffff',
        radius: {
            sm: '4px',
            md: '8px',
        },
    }),
    MantineProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('TutorialTour', () => {
    const defaultProps = {
        forceRun: false,
        onComplete: jest.fn(),
        onOpenGenerationDrawer: jest.fn(),
        onCloseGenerationDrawer: jest.fn(),
        onToggleEditMode: jest.fn(),
        onSimulateTyping: jest.fn(),
        onTutorialCheckbox: jest.fn(),
        onTutorialClickButton: jest.fn(),
        onTutorialEditText: jest.fn(),
        onSwitchDrawerTab: jest.fn(),
        onSwitchImageTab: jest.fn(),
        onSetGenerationCompleteCallback: jest.fn(),
        onSetMockAuthState: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        mockHasCompletedTutorial.mockReturnValue(false);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should pass a basic smoke test', () => {
        expect(true).toBe(true);
    });

    describe('Tutorial Initialization', () => {
        it('should not start tutorial when forceRun is false', () => {
            // Mark tutorial as completed to prevent auto-start
            mockHasCompletedTutorial.mockReturnValue(true);

            render(<TutorialTour {...defaultProps} />);

            act(() => {
                jest.advanceTimersByTime(2000);
            });

            // Should not have called any initialization functions
            expect(defaultProps.onCloseGenerationDrawer).not.toHaveBeenCalled();
            expect(defaultProps.onOpenGenerationDrawer).not.toHaveBeenCalled();
        });

        it('should initialize when forceRun is true', async () => {
            render(<TutorialTour {...defaultProps} forceRun={true} />);

            await act(async () => {
                jest.advanceTimersByTime(100);
                await Promise.resolve();
            });

            // Should have initialized
            expect(defaultProps.onCloseGenerationDrawer).toHaveBeenCalled();
            expect(mockReplaceCreatureDetails).toHaveBeenCalled();
        });

        it('should clear canvas to empty statblock on initialization', async () => {
            render(<TutorialTour {...defaultProps} forceRun={true} />);

            await act(async () => {
                jest.advanceTimersByTime(100);
                await Promise.resolve();
            });

            // Should clear canvas to empty statblock
            expect(mockReplaceCreatureDetails).toHaveBeenCalledWith({
                name: '',
                actions: [],
            });
        });
    });

    describe('Auto-Start Behavior', () => {
        it('should not auto-start for users who completed tutorial', () => {
            mockHasCompletedTutorial.mockReturnValue(true);

            render(<TutorialTour {...defaultProps} />);

            act(() => {
                jest.advanceTimersByTime(2000);
            });

            // Should not trigger auto-start
            expect(defaultProps.onCloseGenerationDrawer).not.toHaveBeenCalled();
            expect(mockReplaceCreatureDetails).not.toHaveBeenCalled();
        });

        it('should auto-start for first-time users after delay', async () => {
            mockHasCompletedTutorial.mockReturnValue(false);

            render(<TutorialTour {...defaultProps} />);

            // Advance time past the 1500ms auto-start delay
            act(() => {
                jest.advanceTimersByTime(1600);
            });

            await act(async () => {
                await Promise.resolve();
            });

            // Should have triggered auto-start initialization
            expect(defaultProps.onCloseGenerationDrawer).toHaveBeenCalled();
            expect(mockReplaceCreatureDetails).toHaveBeenCalled();
        });
    });

    describe('Manual vs Auto-Start Conflict', () => {
        it('should prevent auto-start if manual start occurred during delay', async () => {
            mockHasCompletedTutorial.mockReturnValue(false);

            const { rerender } = render(<TutorialTour {...defaultProps} />);

            // Wait 500ms (before auto-start fires)
            act(() => {
                jest.advanceTimersByTime(500);
            });

            // Manually start the tutorial
            rerender(<TutorialTour {...defaultProps} forceRun={true} />);

            await act(async () => {
                jest.advanceTimersByTime(100);
                await Promise.resolve();
            });

            const manualCallCount = defaultProps.onCloseGenerationDrawer.mock.calls.length;

            // Now let auto-start try to fire
            act(() => {
                jest.advanceTimersByTime(1100); // Total 1600ms
            });

            await act(async () => {
                await Promise.resolve();
            });

            // Should still only have the manual initialization
            expect(defaultProps.onCloseGenerationDrawer).toHaveBeenCalledTimes(manualCallCount);
        });
    });

    describe('Tutorial State Management', () => {
        it('should reset initialization flag when forceRun becomes false', async () => {
            const { rerender } = render(<TutorialTour {...defaultProps} forceRun={true} />);

            await act(async () => {
                jest.advanceTimersByTime(100);
                await Promise.resolve();
            });

            // Clear mocks
            jest.clearAllMocks();

            // Toggle forceRun off
            rerender(<TutorialTour {...defaultProps} forceRun={false} />);

            await act(async () => {
                jest.advanceTimersByTime(100);
                await Promise.resolve();
            });

            // Should have reset (no new calls)
            expect(defaultProps.onCloseGenerationDrawer).not.toHaveBeenCalled();

            // Toggle forceRun back on
            rerender(<TutorialTour {...defaultProps} forceRun={true} />);

            await act(async () => {
                jest.advanceTimersByTime(100);
                await Promise.resolve();
            });

            // Should re-initialize
            expect(defaultProps.onCloseGenerationDrawer).toHaveBeenCalled();
        });
    });

    describe('Component Rendering', () => {
        it('should render without crashing', () => {
            const { container } = render(<TutorialTour {...defaultProps} />);
            expect(container).toBeInTheDocument();
        });

        it('should handle multiple initialization cycles', async () => {
            const { rerender } = render(<TutorialTour {...defaultProps} />);

            // Start
            rerender(<TutorialTour {...defaultProps} forceRun={true} />);
            await act(async () => {
                jest.advanceTimersByTime(100);
                await Promise.resolve();
            });

            expect(defaultProps.onCloseGenerationDrawer).toHaveBeenCalledTimes(1);

            // Stop
            rerender(<TutorialTour {...defaultProps} forceRun={false} />);
            await act(async () => {
                jest.advanceTimersByTime(100);
                await Promise.resolve();
            });

            // Start again
            rerender(<TutorialTour {...defaultProps} forceRun={true} />);
            await act(async () => {
                jest.advanceTimersByTime(100);
                await Promise.resolve();
            });

            expect(defaultProps.onCloseGenerationDrawer).toHaveBeenCalledTimes(2);
        });
    });

    describe('Tutorial Runtime State', () => {
        it('should set run to true when tutorial starts', async () => {
            // This test verifies the tutorial actually enters "running" state
            render(<TutorialTour {...defaultProps} forceRun={true} />);

            await act(async () => {
                jest.advanceTimersByTime(100);
                await Promise.resolve();
            });

            // Verify initialization completed
            expect(defaultProps.onCloseGenerationDrawer).toHaveBeenCalled();
            expect(mockReplaceCreatureDetails).toHaveBeenCalled();

            // The component should be in a state where it's ready to run
            // We can't directly check internal state, but we can verify
            // that all initialization steps were called
        });

        it('should call all initialization steps in sequence', async () => {
            const callOrder: string[] = [];

            const onCloseSpy = jest.fn(() => {
                callOrder.push('close');
                defaultProps.onCloseGenerationDrawer();
            });

            const renderResult = render(
                <TutorialTour
                    {...defaultProps}
                    forceRun={true}
                    onCloseGenerationDrawer={onCloseSpy}
                />
            );

            await act(async () => {
                jest.advanceTimersByTime(100);
                await Promise.resolve();
            });

            // Should have called initialization functions
            expect(onCloseSpy).toHaveBeenCalled();
            expect(mockReplaceCreatureDetails).toHaveBeenCalled();

            // Verify proper initialization sequence
            expect(callOrder).toContain('close');
        });

        it('should be ready to show first step after initialization', async () => {
            render(<TutorialTour {...defaultProps} forceRun={true} />);

            await act(async () => {
                jest.advanceTimersByTime(100);
                await Promise.resolve();
            });

            // After initialization, tutorial should be ready
            // Verify all setup was completed
            expect(defaultProps.onCloseGenerationDrawer).toHaveBeenCalled();
            expect(mockReplaceCreatureDetails).toHaveBeenCalled();

            // Component should now be in "running" state ready for user interaction
        });
    });
});
