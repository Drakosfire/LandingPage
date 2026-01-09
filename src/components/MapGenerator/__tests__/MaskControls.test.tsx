/**
 * MaskControls Component Tests (TDD - T169-T173)
 *
 * Tests for the mask control panel UI component.
 * Written BEFORE implementation - these tests MUST FAIL initially.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MaskControls } from '../MaskControls';

describe('MaskControls', () => {
  const defaultProps = {
    activeTool: 'brush' as const,
    brushSize: 30,
    canUndo: false,
    canRedo: false,
    onToolChange: jest.fn(),
    onBrushSizeChange: jest.fn(),
    onUndo: jest.fn(),
    onRedo: jest.fn(),
    onClear: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // T169: Renders All Tool Buttons
  // =========================================================================
  describe('renders all tool buttons (T169)', () => {
    it('should render brush tool button', () => {
      render(<MaskControls {...defaultProps} />);

      expect(screen.getByRole('button', { name: /brush/i })).toBeInTheDocument();
    });

    it('should render eraser tool button', () => {
      render(<MaskControls {...defaultProps} />);

      expect(screen.getByRole('button', { name: /eraser/i })).toBeInTheDocument();
    });

    it('should render rectangle tool button', () => {
      render(<MaskControls {...defaultProps} />);

      expect(screen.getByRole('button', { name: /rect/i })).toBeInTheDocument();
    });

    it('should render circle tool button', () => {
      render(<MaskControls {...defaultProps} />);

      expect(screen.getByRole('button', { name: /circle/i })).toBeInTheDocument();
    });

    it('should render undo button', () => {
      render(<MaskControls {...defaultProps} />);

      expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
    });

    it('should render redo button', () => {
      render(<MaskControls {...defaultProps} />);

      expect(screen.getByRole('button', { name: /redo/i })).toBeInTheDocument();
    });

    it('should render clear button', () => {
      render(<MaskControls {...defaultProps} />);

      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });
  });

  // =========================================================================
  // T170: Brush Size Slider Changes State
  // =========================================================================
  describe('brush size slider changes state (T170)', () => {
    it('should render brush size slider', () => {
      render(<MaskControls {...defaultProps} />);

      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('should display current brush size value', () => {
      render(<MaskControls {...defaultProps} brushSize={50} />);

      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should call onBrushSizeChange when slider changes', async () => {
      const onBrushSizeChange = jest.fn();
      render(<MaskControls {...defaultProps} onBrushSizeChange={onBrushSizeChange} />);

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '75' } });

      expect(onBrushSizeChange).toHaveBeenCalledWith(75);
    });

    it('should have minimum value of 5', () => {
      render(<MaskControls {...defaultProps} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '5');
    });

    it('should have maximum value of 100', () => {
      render(<MaskControls {...defaultProps} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('max', '100');
    });
  });

  // =========================================================================
  // T171: Tool Toggle (Brush/Eraser) Changes Mode
  // =========================================================================
  describe('tool toggle changes mode (T171)', () => {
    it('should highlight active tool', () => {
      render(<MaskControls {...defaultProps} activeTool="brush" />);

      const brushButton = screen.getByRole('button', { name: /brush/i });
      expect(brushButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should call onToolChange when brush is clicked', async () => {
      const user = userEvent.setup();
      const onToolChange = jest.fn();
      render(<MaskControls {...defaultProps} activeTool="eraser" onToolChange={onToolChange} />);

      await user.click(screen.getByRole('button', { name: /brush/i }));

      expect(onToolChange).toHaveBeenCalledWith('brush');
    });

    it('should call onToolChange when eraser is clicked', async () => {
      const user = userEvent.setup();
      const onToolChange = jest.fn();
      render(<MaskControls {...defaultProps} activeTool="brush" onToolChange={onToolChange} />);

      await user.click(screen.getByRole('button', { name: /eraser/i }));

      expect(onToolChange).toHaveBeenCalledWith('eraser');
    });

    it('should call onToolChange when rect is clicked', async () => {
      const user = userEvent.setup();
      const onToolChange = jest.fn();
      render(<MaskControls {...defaultProps} onToolChange={onToolChange} />);

      await user.click(screen.getByRole('button', { name: /rect/i }));

      expect(onToolChange).toHaveBeenCalledWith('rect');
    });

    it('should call onToolChange when circle is clicked', async () => {
      const user = userEvent.setup();
      const onToolChange = jest.fn();
      render(<MaskControls {...defaultProps} onToolChange={onToolChange} />);

      await user.click(screen.getByRole('button', { name: /circle/i }));

      expect(onToolChange).toHaveBeenCalledWith('circle');
    });
  });

  // =========================================================================
  // T172: Undo/Redo Buttons Call Correct Actions
  // =========================================================================
  describe('undo/redo buttons call correct actions (T172)', () => {
    it('should call onUndo when undo button is clicked', async () => {
      const user = userEvent.setup();
      const onUndo = jest.fn();
      render(<MaskControls {...defaultProps} canUndo={true} onUndo={onUndo} />);

      await user.click(screen.getByRole('button', { name: /undo/i }));

      expect(onUndo).toHaveBeenCalledTimes(1);
    });

    it('should call onRedo when redo button is clicked', async () => {
      const user = userEvent.setup();
      const onRedo = jest.fn();
      render(<MaskControls {...defaultProps} canRedo={true} onRedo={onRedo} />);

      await user.click(screen.getByRole('button', { name: /redo/i }));

      expect(onRedo).toHaveBeenCalledTimes(1);
    });

    it('should disable undo button when canUndo is false', () => {
      render(<MaskControls {...defaultProps} canUndo={false} />);

      const undoButton = screen.getByRole('button', { name: /undo/i });
      expect(undoButton).toBeDisabled();
    });

    it('should disable redo button when canRedo is false', () => {
      render(<MaskControls {...defaultProps} canRedo={false} />);

      const redoButton = screen.getByRole('button', { name: /redo/i });
      expect(redoButton).toBeDisabled();
    });

    it('should enable undo button when canUndo is true', () => {
      render(<MaskControls {...defaultProps} canUndo={true} />);

      const undoButton = screen.getByRole('button', { name: /undo/i });
      expect(undoButton).not.toBeDisabled();
    });

    it('should enable redo button when canRedo is true', () => {
      render(<MaskControls {...defaultProps} canRedo={true} />);

      const redoButton = screen.getByRole('button', { name: /redo/i });
      expect(redoButton).not.toBeDisabled();
    });
  });

  // =========================================================================
  // T173: Clear Mask Button Clears State
  // =========================================================================
  describe('clear mask button clears state (T173)', () => {
    it('should call onClear when clear button is clicked', async () => {
      const user = userEvent.setup();
      const onClear = jest.fn();
      render(<MaskControls {...defaultProps} onClear={onClear} />);

      await user.click(screen.getByRole('button', { name: /clear/i }));

      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('should show confirmation before clearing (optional)', async () => {
      // This test is optional - depends on UX decision
      const user = userEvent.setup();
      const onClear = jest.fn();
      render(<MaskControls {...defaultProps} onClear={onClear} />);

      await user.click(screen.getByRole('button', { name: /clear/i }));

      // If confirmation is implemented, expect a dialog
      // Otherwise, just verify onClear was called
      expect(onClear).toHaveBeenCalled();
    });
  });
});
