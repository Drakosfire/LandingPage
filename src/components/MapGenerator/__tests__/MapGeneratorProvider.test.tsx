/**
 * MapGeneratorProvider Mask State Tests (TDD - T165-T168)
 *
 * Tests for mask-related state management in MapGeneratorProvider.
 * Written BEFORE implementation - these tests MUST FAIL initially.
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MapGeneratorProvider, useMapGeneratorContext } from '../MapGeneratorProvider';

// Test helper component to access context
const TestConsumer: React.FC<{ onContext?: (ctx: any) => void }> = ({ onContext }) => {
  const context = useMapGeneratorContext();
  React.useEffect(() => {
    if (onContext) {
      onContext(context);
    }
  }, [context, onContext]);
  return (
    <div data-testid="context-consumer">
      <span data-testid="mask-enabled">{String(context.maskConfig?.enabled ?? false)}</span>
      <span data-testid="mask-brush-size">{context.maskConfig?.brushSize ?? 30}</span>
      <span data-testid="mask-tool">{context.maskConfig?.tool ?? 'brush'}</span>
      <span data-testid="mask-data">{context.maskConfig?.maskData ?? 'null'}</span>
    </div>
  );
};

// Wrapper for rendering with provider
const renderWithProvider = (ui: React.ReactElement) => {
  return render(<MapGeneratorProvider>{ui}</MapGeneratorProvider>);
};

describe('MapGeneratorProvider mask state', () => {
  // =========================================================================
  // T165: Mask State Initialization
  // =========================================================================
  describe('mask state initialization (T165)', () => {
    it('should initialize with mask mode disabled', () => {
      renderWithProvider(<TestConsumer />);

      expect(screen.getByTestId('mask-enabled')).toHaveTextContent('false');
    });

    it('should initialize with default brush size of 30', () => {
      renderWithProvider(<TestConsumer />);

      expect(screen.getByTestId('mask-brush-size')).toHaveTextContent('30');
    });

    it('should initialize with brush as default tool', () => {
      renderWithProvider(<TestConsumer />);

      expect(screen.getByTestId('mask-tool')).toHaveTextContent('brush');
    });

    it('should initialize with null mask data', () => {
      renderWithProvider(<TestConsumer />);

      expect(screen.getByTestId('mask-data')).toHaveTextContent('null');
    });
  });

  // =========================================================================
  // T166: Mask Mode Toggle Action
  // =========================================================================
  describe('mask mode toggle action (T166)', () => {
    it('should provide toggleMaskMode action', () => {
      let contextValue: any;
      renderWithProvider(<TestConsumer onContext={(ctx) => (contextValue = ctx)} />);

      expect(typeof contextValue.toggleMaskMode).toBe('function');
    });

    it('should enable mask mode when toggled', async () => {
      let contextValue: any;
      renderWithProvider(<TestConsumer onContext={(ctx) => (contextValue = ctx)} />);

      await act(async () => {
        contextValue.toggleMaskMode();
      });

      expect(screen.getByTestId('mask-enabled')).toHaveTextContent('true');
    });

    it('should disable mask mode when toggled again', async () => {
      let contextValue: any;
      renderWithProvider(<TestConsumer onContext={(ctx) => (contextValue = ctx)} />);

      // Enable
      await act(async () => {
        contextValue.toggleMaskMode();
      });

      expect(screen.getByTestId('mask-enabled')).toHaveTextContent('true');

      // Disable
      await act(async () => {
        contextValue.toggleMaskMode();
      });

      expect(screen.getByTestId('mask-enabled')).toHaveTextContent('false');
    });

    it('should provide setMaskEnabled action for direct control', async () => {
      let contextValue: any;
      renderWithProvider(<TestConsumer onContext={(ctx) => (contextValue = ctx)} />);

      expect(typeof contextValue.setMaskEnabled).toBe('function');

      await act(async () => {
        contextValue.setMaskEnabled(true);
      });

      expect(screen.getByTestId('mask-enabled')).toHaveTextContent('true');
    });
  });

  // =========================================================================
  // T167: Brush Size Update Action
  // =========================================================================
  describe('brushSize update action (T167)', () => {
    it('should provide setMaskBrushSize action', () => {
      let contextValue: any;
      renderWithProvider(<TestConsumer onContext={(ctx) => (contextValue = ctx)} />);

      expect(typeof contextValue.setMaskBrushSize).toBe('function');
    });

    it('should update brush size when setMaskBrushSize is called', async () => {
      let contextValue: any;
      renderWithProvider(<TestConsumer onContext={(ctx) => (contextValue = ctx)} />);

      await act(async () => {
        contextValue.setMaskBrushSize(50);
      });

      expect(screen.getByTestId('mask-brush-size')).toHaveTextContent('50');
    });

    it('should clamp brush size to minimum (5px)', async () => {
      let contextValue: any;
      renderWithProvider(<TestConsumer onContext={(ctx) => (contextValue = ctx)} />);

      await act(async () => {
        contextValue.setMaskBrushSize(2);
      });

      expect(screen.getByTestId('mask-brush-size')).toHaveTextContent('5');
    });

    it('should clamp brush size to maximum (100px)', async () => {
      let contextValue: any;
      renderWithProvider(<TestConsumer onContext={(ctx) => (contextValue = ctx)} />);

      await act(async () => {
        contextValue.setMaskBrushSize(150);
      });

      expect(screen.getByTestId('mask-brush-size')).toHaveTextContent('100');
    });

    it('should provide setMaskTool action for tool switching', async () => {
      let contextValue: any;
      renderWithProvider(<TestConsumer onContext={(ctx) => (contextValue = ctx)} />);

      expect(typeof contextValue.setMaskTool).toBe('function');

      await act(async () => {
        contextValue.setMaskTool('eraser');
      });

      expect(screen.getByTestId('mask-tool')).toHaveTextContent('eraser');
    });
  });

  // =========================================================================
  // T168: Mask Data Persistence
  // =========================================================================
  describe('maskData persistence (T168)', () => {
    it('should provide setMaskData action', () => {
      let contextValue: any;
      renderWithProvider(<TestConsumer onContext={(ctx) => (contextValue = ctx)} />);

      expect(typeof contextValue.setMaskData).toBe('function');
    });

    it('should update maskData when setMaskData is called', async () => {
      let contextValue: any;
      renderWithProvider(<TestConsumer onContext={(ctx) => (contextValue = ctx)} />);

      const testBase64 = 'data:image/png;base64,iVBORw0KGgo...';

      await act(async () => {
        contextValue.setMaskData(testBase64);
      });

      expect(screen.getByTestId('mask-data')).toHaveTextContent(testBase64);
    });

    it('should clear maskData when set to null', async () => {
      let contextValue: any;
      renderWithProvider(<TestConsumer onContext={(ctx) => (contextValue = ctx)} />);

      // First set some data
      await act(async () => {
        contextValue.setMaskData('data:image/png;base64,test');
      });

      // Then clear it
      await act(async () => {
        contextValue.setMaskData(null);
      });

      expect(screen.getByTestId('mask-data')).toHaveTextContent('null');
    });

    it('should provide clearMask action that clears all mask state', async () => {
      let contextValue: any;
      renderWithProvider(<TestConsumer onContext={(ctx) => (contextValue = ctx)} />);

      expect(typeof contextValue.clearMask).toBe('function');

      // Set up mask state
      await act(async () => {
        contextValue.setMaskEnabled(true);
        contextValue.setMaskData('data:image/png;base64,test');
        contextValue.setMaskBrushSize(50);
        contextValue.setMaskTool('eraser');
      });

      // Clear mask
      await act(async () => {
        contextValue.clearMask();
      });

      // maskData should be cleared, but other settings persist
      expect(screen.getByTestId('mask-data')).toHaveTextContent('null');
    });

    it('should include maskConfig in context value', () => {
      let contextValue: any;
      renderWithProvider(<TestConsumer onContext={(ctx) => (contextValue = ctx)} />);

      expect(contextValue.maskConfig).toBeDefined();
      expect(contextValue.maskConfig).toEqual({
        enabled: false,
        brushSize: 30,
        tool: 'brush',
        maskData: null,
      });
    });
  });
});
