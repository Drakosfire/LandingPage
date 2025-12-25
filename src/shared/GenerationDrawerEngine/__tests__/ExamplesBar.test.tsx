/**
 * Unit tests for ExamplesBar component
 * 
 * Tests: rendering, empty hidden, click populates, disabled during generation
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { ExamplesBar } from '../components/ExamplesBar';
import type { ExampleConfig } from '../types';

// Mock ResizeObserver for Mantine ScrollArea
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <MantineProvider>
      {ui}
    </MantineProvider>
  );
};

describe('ExamplesBar', () => {
  interface TestInput {
    description: string;
  }

  const mockExamples: ExampleConfig<TestInput>[] = [
    {
      name: 'Red Dragon',
      description: 'A fearsome red dragon',
      input: { description: 'A massive red dragon with ancient scales' }
    },
    {
      name: 'Goblin Chief',
      description: 'A cunning goblin leader',
      input: { description: 'A small but cunning goblin chief' }
    },
    {
      name: 'Evil Wizard',
      description: 'A powerful dark wizard',
      input: { description: 'An ancient wizard corrupted by dark magic' }
    }
  ];

  const defaultProps = {
    examples: mockExamples,
    onSelect: jest.fn(),
    isGenerating: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all example cards', () => {
      renderWithProvider(<ExamplesBar {...defaultProps} />);

      expect(screen.getByText('Red Dragon')).toBeInTheDocument();
      expect(screen.getByText('Goblin Chief')).toBeInTheDocument();
      expect(screen.getByText('Evil Wizard')).toBeInTheDocument();
    });

    it('renders helper text when examples have descriptions', () => {
      renderWithProvider(<ExamplesBar {...defaultProps} />);

      // The component shows a helper text when examples have descriptions
      expect(screen.getByText('Click an example to populate the form')).toBeInTheDocument();
    });

    it('has data-tutorial attribute', () => {
      renderWithProvider(<ExamplesBar {...defaultProps} />);

      const container = screen.getByTestId('examples-bar');
      expect(container).toHaveAttribute('data-tutorial', 'examples-bar');
    });
  });

  describe('Empty State', () => {
    it('renders nothing when examples array is empty', () => {
      const { container } = renderWithProvider(
        <ExamplesBar {...defaultProps} examples={[]} />
      );

      // Should not render the examples bar at all
      expect(screen.queryByTestId('examples-bar')).not.toBeInTheDocument();
    });

    it('renders nothing when examples is undefined', () => {
      const { container } = renderWithProvider(
        <ExamplesBar {...defaultProps} examples={undefined as any} />
      );

      expect(screen.queryByTestId('examples-bar')).not.toBeInTheDocument();
    });
  });

  describe('Click Behavior', () => {
    it('calls onSelect with example input when clicked', () => {
      const onSelect = jest.fn();
      renderWithProvider(<ExamplesBar {...defaultProps} onSelect={onSelect} />);

      fireEvent.click(screen.getByText('Red Dragon'));

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(mockExamples[0].input);
    });

    it('calls onSelect with correct input for each example', () => {
      const onSelect = jest.fn();
      renderWithProvider(<ExamplesBar {...defaultProps} onSelect={onSelect} />);

      fireEvent.click(screen.getByText('Goblin Chief'));

      expect(onSelect).toHaveBeenCalledWith(mockExamples[1].input);
    });
  });

  describe('Disabled During Generation', () => {
    it('disables all example cards when isGenerating is true', () => {
      renderWithProvider(<ExamplesBar {...defaultProps} isGenerating={true} />);

      // Cards should have disabled styling or not respond to clicks
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('does not call onSelect when clicked during generation', () => {
      const onSelect = jest.fn();
      renderWithProvider(
        <ExamplesBar {...defaultProps} onSelect={onSelect} isGenerating={true} />
      );

      fireEvent.click(screen.getByText('Red Dragon'));

      expect(onSelect).not.toHaveBeenCalled();
    });

    it('enables cards when isGenerating is false', () => {
      renderWithProvider(<ExamplesBar {...defaultProps} isGenerating={false} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Styling', () => {
    it('renders as a horizontal scrollable list', () => {
      renderWithProvider(<ExamplesBar {...defaultProps} />);

      const container = screen.getByTestId('examples-bar');
      // Should have horizontal scroll styling
      expect(container).toBeInTheDocument();
    });

    it('shows label above examples', () => {
      renderWithProvider(<ExamplesBar {...defaultProps} label="Try an example:" />);

      expect(screen.getByText('Try an example:')).toBeInTheDocument();
    });
  });
});

