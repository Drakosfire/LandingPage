/**
 * MapGenerator
 * 
 * Main page component for the Map Generator feature.
 * Provides AI map generation, grid overlay, and label editing.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Container, Stack, Group, Button, Text, Paper, Title } from '@mantine/core';
import { IconTypography, IconWand, IconGridDots, IconBrush, IconZoomIn, IconZoomOut, IconZoomReset } from '@tabler/icons-react';
import { MapViewport, DEFAULT_GRID_CONFIG, LabelEditInfo } from 'dungeonmind-canvas';
import { MapGeneratorProvider, useMapGenerator } from './MapGeneratorProvider';
import { useAuth } from '../../context/AuthContext';
import { UnifiedHeader } from '../UnifiedHeader';
import MapGenerationDrawer from './MapGenerationDrawer';
import MapProjectsDrawer from './MapProjectsDrawer';
import { GridControls } from './GridControls';
import { LabelEditor } from './LabelEditor';
import { ExportButton } from './ExportButton';
import { MaskControls } from './MaskControls';

// Map Generator icon URL
const MAP_GENERATOR_ICON_URL = 'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/08bd0df7-2c6b-4a96-028e-b91bf1935c00/public';

// =============================================================================
// Types
// =============================================================================

interface MapGeneratorContentProps {
  hideHeader?: boolean;
}

// =============================================================================
// Content Component (exported for use with external provider)
// =============================================================================

export function MapGeneratorContent({ hideHeader = false }: MapGeneratorContentProps) {
  const {
    baseImageUrl,
    gridConfig,
    setGridConfig,
    labels,
    addLabel,
    updateLabel,
    removeLabel,
    selectLabel,
    selectedLabelId,
    view,
    setView,
    fitToViewport,
    mode,
    setMode,
    openGenerationDrawer,
    closeGenerationDrawer,
    generationDrawerOpen,
    openProjectsDrawer,
    closeProjectsDrawer,
    projectsDrawerOpen,
    projects,
    isLoadingProjects,
    isLoadingProject,
    projectId,
    projectName,
    error,
    loadProject,
    deleteProject,
    createProject,
    renameProject,
    refreshProjects,
    labelsVisible,
    isPlacingLabel,
    setIsPlacingLabel,
    saveStatus,
    saveNow,
    // Mask state
    maskConfig,
    maskDrawingState,
    setMaskTool,
    setMaskBrushSize,
    startMaskStroke,
    continueMaskStroke,
    endMaskStroke,
    addMaskShape,
    undoMask,
    redoMask,
    clearMask,
    canUndoMask,
    canRedoMask,
    uploadAndSaveMask,
  } = useMapGenerator();

  const { isLoggedIn } = useAuth();

  // Viewport dimensions
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const previousImageUrlRef = useRef<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Inline editing state
  const [editingInfo, setEditingInfo] = useState<LabelEditInfo | null>(null);
  const [editText, setEditText] = useState('');

  // Mask saving state
  const [isSavingMask, setIsSavingMask] = useState(false);
  const canSaveMask = isLoggedIn && !!projectId && maskDrawingState.strokes.length > 0;

  // Refs to track mask drawing state for document-level listeners
  // Using refs avoids stale closure issues - handlers always see current values
  const maskDrawingStateRef = useRef(maskDrawingState);
  maskDrawingStateRef.current = maskDrawingState;

  // Handle saving mask manually
  const handleSaveMask = useCallback(async () => {
    if (!canSaveMask) return;

    setIsSavingMask(true);
    try {
      await uploadAndSaveMask();
      console.log('✅ [MapGenerator] Mask saved manually');
    } catch (err) {
      console.error('❌ [MapGenerator] Failed to save mask:', err);
    } finally {
      setIsSavingMask(false);
    }
  }, [canSaveMask, uploadAndSaveMask]);

  // Toggle handlers for navbar buttons - close if already open, open if closed
  const handleGenerationToggle = useCallback(() => {
    if (generationDrawerOpen) {
      closeGenerationDrawer();
    } else {
      openGenerationDrawer();
    }
  }, [generationDrawerOpen, closeGenerationDrawer, openGenerationDrawer]);

  const handleProjectsToggle = useCallback(() => {
    if (projectsDrawerOpen) {
      closeProjectsDrawer();
    } else {
      openProjectsDrawer();
    }
  }, [projectsDrawerOpen, closeProjectsDrawer, openProjectsDrawer]);

  // Handle starting inline edit
  const handleStartEditing = useCallback((info: LabelEditInfo) => {
    setEditingInfo(info);
    setEditText(info.label.text);
    // Focus input after render
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 10);
  }, []);

  // Handle finishing inline edit
  const handleFinishEditing = useCallback(() => {
    if (editingInfo && editText.trim()) {
      updateLabel(editingInfo.label.id, { text: editText.trim() });
      console.log('✏️ [MapGenerator] Inline edit complete:', editText.trim());
    }
    setEditingInfo(null);
    setEditText('');
  }, [editingInfo, editText, updateLabel]);

  // Handle edit input key events
  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFinishEditing();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingInfo(null);
      setEditText('');
    }
  }, [handleFinishEditing]);

  // Update viewport size on mount/resize
  useEffect(() => {
    const updateViewportSize = () => {
      if (viewportRef.current) {
        const rect = viewportRef.current.getBoundingClientRect();
        setViewportSize({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  // Fit to viewport when image loads
  useEffect(() => {
    if (baseImageUrl && baseImageUrl !== previousImageUrlRef.current) {
      previousImageUrlRef.current = baseImageUrl;

      // Load image to get dimensions
      const img = new Image();
      img.onload = () => {
        console.log('🖼️ [MapGenerator] Image loaded, fitting to viewport:', {
          imageSize: `${img.width}x${img.height}`,
          viewportSize: `${viewportSize.width}x${viewportSize.height}`,
        });
        fitToViewport(img.width, img.height, viewportSize.width, viewportSize.height);
      };
      img.onerror = () => {
        console.error('❌ [MapGenerator] Failed to load image:', baseImageUrl);
      };
      img.src = baseImageUrl;
    }
  }, [baseImageUrl, viewportSize.width, viewportSize.height, fitToViewport]);

  // Global mouse tracking for mask drawing (allows drawing outside canvas bounds)
  // IMPORTANT: Listeners are set up whenever mode === 'mask', not just when isDrawing.
  // This avoids race conditions where the mouse leaves canvas before React re-renders.
  // Uses refs to always see current state without stale closures.
  useEffect(() => {
    // Only set up listeners when in mask mode
    if (mode !== 'mask') {
      return;
    }

    // Get canvas coordinates from screen coordinates
    const getCanvasCoords = (e: MouseEvent) => {
      if (!viewportRef.current) return { x: 0, y: 0 };

      const containerRect = viewportRef.current.getBoundingClientRect();

      // Convert screen coordinates to container-relative coordinates
      let relativeX = e.clientX - containerRect.left;
      let relativeY = e.clientY - containerRect.top;

      // Clamp coordinates to container bounds (so we can draw to edges even when outside)
      relativeX = Math.max(0, Math.min(containerRect.width, relativeX));
      relativeY = Math.max(0, Math.min(containerRect.height, relativeY));

      // Convert container-relative coordinates to canvas coordinates
      const canvasX = (relativeX - view.panX) / view.zoom;
      const canvasY = (relativeY - view.panY) / view.zoom;

      return { x: canvasX, y: canvasY };
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      // Use ref to get current state (avoids stale closure)
      const state = maskDrawingStateRef.current;

      // Only handle if we're actively drawing
      if (!state.isDrawing) return;

      const isShapeTool = state.activeTool === 'rect' || state.activeTool === 'circle';

      // For brush/eraser: continue adding points
      if (!isShapeTool) {
        const { x, y } = getCanvasCoords(e);
        continueMaskStroke(x, y);
      }
      // For shapes: preview is handled by MaskDrawingLayer internally
      // (won't update when outside canvas, but that's acceptable)
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      // Use ref to get current state (avoids stale closure)
      const state = maskDrawingStateRef.current;
      
      console.log(`🎨 [MapGenerator] Document mouseup: isDrawing=${state.isDrawing}, activeTool=${state.activeTool}, hasCurrentStroke=${!!state.currentStroke}`);

      // Only handle if we're actively drawing
      if (!state.isDrawing) {
        console.log(`🎨 [MapGenerator] Document mouseup: SKIPPED (not drawing)`);
        return;
      }
      if (!viewportRef.current) return;

      const isShapeTool = state.activeTool === 'rect' || state.activeTool === 'circle';

      // Check if mouseup is inside the canvas
      const containerRect = viewportRef.current.getBoundingClientRect();
      const isInsideCanvas =
        e.clientX >= containerRect.left &&
        e.clientX <= containerRect.right &&
        e.clientY >= containerRect.top &&
        e.clientY <= containerRect.bottom;
      
      console.log(`🎨 [MapGenerator] Document mouseup: isInsideCanvas=${isInsideCanvas}, isShapeTool=${isShapeTool}`);

      // For BRUSH/ERASER: If inside canvas, MaskDrawingLayer handles it
      // For SHAPES: Document listener ALWAYS handles (Konva loses pointer tracking when mouse leaves/returns)
      if (isInsideCanvas && !isShapeTool) {
        console.log(`🎨 [MapGenerator] Document mouseup: SKIPPED (inside canvas, brush/eraser handled by MaskDrawingLayer)`);
        return;
      }

      // Handle mouseup (inside or outside canvas for shapes, outside only for brush/eraser)
      if (isShapeTool) {
        // For shapes: calculate bounds and add the shape
        // addMaskShape also resets isDrawing state, so no need to call endMaskStroke
        const currentStroke = state.currentStroke;
        if (currentStroke && currentStroke.points.length >= 2) {
          const startX = currentStroke.points[0];
          const startY = currentStroke.points[1];
          const { x: endX, y: endY } = getCanvasCoords(e);

          const bounds = {
            x: Math.min(startX, endX),
            y: Math.min(startY, endY),
            width: Math.abs(endX - startX),
            height: Math.abs(endY - startY),
          };

          // Only add shape if it has non-zero dimensions
          if (bounds.width > 0 && bounds.height > 0) {
            console.log(`🎨 [MapGenerator] Adding ${state.activeTool} shape via document listener:`, bounds);
            addMaskShape(bounds);
          } else {
            // Shape too small, just reset state
            endMaskStroke();
          }
        } else {
          // No valid stroke to create shape from, just reset state
          endMaskStroke();
        }
      } else {
        // For brush/eraser: end the stroke to finalize and reset isDrawing state
        endMaskStroke();
      }
    };

    // Add document-level listeners - ALWAYS active in mask mode
    // Handlers use refs to always see current state
    document.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [mode, view.panX, view.panY, view.zoom, continueMaskStroke, endMaskStroke, addMaskShape]);

  // Handle label placement (click-to-place)
  const handleLabelPlace = useCallback(
    (x: number, y: number) => {
      addLabel({
        text: 'New Label',
        x,
        y,
      });
      // Turn off placing mode after placing a label
      setIsPlacingLabel(false);
    },
    [addLabel, setIsPlacingLabel]
  );

  // Handle label updates from MapViewport
  const handleLabelUpdate = useCallback(
    (id: string, updates: Partial<typeof labels[0]>) => {
      updateLabel(id, updates);
    },
    [updateLabel]
  );

  // Handle label selection
  const handleLabelSelect = useCallback(
    (id: string | null) => {
      selectLabel(id);
    },
    [selectLabel]
  );

  // Handle label deletion
  const handleLabelDelete = useCallback(
    (id: string) => {
      removeLabel(id);
    },
    [removeLabel]
  );

  // Handle view changes (pan/zoom)
  const handleViewChange = useCallback(
    (newView: { zoom: number; panX: number; panY: number }) => {
      setView(newView);
    },
    [setView]
  );

  // Handle grid offset changes (in grid-adjust mode)
  const handleGridOffsetChange = useCallback(
    (offset: { offsetX: number; offsetY: number }) => {
      setGridConfig(offset);
    },
    [setGridConfig]
  );

  // ========== Zoom Controls ==========
  const ZOOM_STEP = 0.25; // 25% per click
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 5;

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(MAX_ZOOM, view.zoom + ZOOM_STEP);
    setView({ ...view, zoom: newZoom });
  }, [view, setView]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(MIN_ZOOM, view.zoom - ZOOM_STEP);
    setView({ ...view, zoom: newZoom });
  }, [view, setView]);

  const handleZoomReset = useCallback(() => {
    // Reset to fit viewport if we have an image
    if (baseImageUrl) {
      const img = new Image();
      img.onload = () => {
        fitToViewport(img.width, img.height, viewportSize.width, viewportSize.height);
      };
      img.src = baseImageUrl;
    } else {
      // Just reset to 100% zoom centered
      setView({ zoom: 1, panX: 0, panY: 0 });
    }
  }, [baseImageUrl, viewportSize.width, viewportSize.height, fitToViewport, setView]);

  // Keyboard shortcuts for label management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected label with Delete or Backspace key
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLabelId) {
        // Don't delete if user is typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }
        e.preventDefault();
        removeLabel(selectedLabelId);
        selectLabel(null);
      }
      // Escape to deselect label
      if (e.key === 'Escape' && selectedLabelId) {
        selectLabel(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLabelId, removeLabel, selectLabel]);

  // Handler for manual save button
  const handleSaveClick = async () => {
    console.log('💾 [MapGenerator] Manual save triggered');
    try {
      await saveNow();
    } catch (err) {
      console.error('❌ [MapGenerator] Manual save failed:', err);
    }
  };

  return (
    <>
      {/* Unified Header with Generate and Projects buttons (can be hidden when embedded in another page) */}
      {!hideHeader && (
        <UnifiedHeader
          app={{
            id: 'map-generator',
            name: 'Map Generator',
            icon: MAP_GENERATOR_ICON_URL,
          }}
          showGeneration={true}
          onGenerationClick={handleGenerationToggle}
          showProjects={true}
          onProjectsClick={handleProjectsToggle}
          showAuth={true}
          saveStatus={saveStatus}
          onSaveClick={handleSaveClick}
          showSaveButton={!!baseImageUrl}
          isUnsaved={!!baseImageUrl && !projectId}
        />
      )}

      <Container size="xl" py="md">
        <Stack gap="md">
          {/* Project name subtitle */}
          {projectName && projectName !== 'Untitled Map' && (
            <Text c="dimmed" size="sm" ta="center">
              {projectName}
            </Text>
          )}

          {/* Error display */}
          {error && (
            <Paper bg="red.1" p="md" radius="md">
              <Text c="red.7">{error}</Text>
            </Paper>
          )}

          {/* Main content area */}
          <Group align="flex-start" gap="md" wrap="nowrap">
            {/* Canvas area */}
            {/* position: relative allows the expanded Stage to position absolutely within this container */}
            {/* overflow: hidden clips the Stage buffer area that extends beyond the visible viewport */}
            <Paper
              ref={viewportRef}
              shadow="sm"
              radius="md"
              withBorder
              style={{
                flex: 1,
                minHeight: 600,
                overflow: 'hidden',
                position: 'relative',
                backgroundColor: '#f5f5f5',
                cursor: isPlacingLabel ? 'crosshair' : 'default',
              }}
            >
              {baseImageUrl ? (
                <>
                  <MapViewport
                    width={viewportSize.width}
                    height={viewportSize.height}
                    baseImageUrl={baseImageUrl}
                    gridConfig={gridConfig}
                    labels={labelsVisible ? labels : []}
                    selectedLabelId={labelsVisible ? selectedLabelId : null}
                    onLabelSelect={handleLabelSelect}
                    onLabelUpdate={handleLabelUpdate}
                    onLabelDelete={handleLabelDelete}
                    onLabelPlace={isPlacingLabel ? handleLabelPlace : undefined}
                    zoom={view.zoom}
                    panX={view.panX}
                    panY={view.panY}
                    onViewChange={handleViewChange}
                    mode={isPlacingLabel ? 'label' : mode}
                    onGridOffsetChange={handleGridOffsetChange}
                    onStartEditing={handleStartEditing}
                    editingLabelId={editingInfo?.label.id || null}
                    maskEnabled={mode === 'mask'}
                    maskStrokes={maskDrawingState.strokes}
                    maskCurrentStroke={maskDrawingState.currentStroke}
                    maskActiveTool={maskDrawingState.activeTool}
                    maskBrushSize={maskDrawingState.brushSize}
                    maskIsDrawing={maskDrawingState.isDrawing}
                    onMaskStrokeStart={startMaskStroke}
                    // Note: onMaskStrokeContinue and onMaskStrokeEnd are NOT passed
                    // Document listener handles all continue/end events to allow drawing outside canvas
                    onMaskShapeAdd={addMaskShape}
                  />
                  {/* Inline text editing overlay */}
                  {editingInfo && (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={handleFinishEditing}
                      onKeyDown={handleEditKeyDown}
                      style={{
                        position: 'fixed',
                        left: editingInfo.screenX,
                        top: editingInfo.screenY,
                        fontFamily: editingInfo.label.fontFamily,
                        fontSize: `${editingInfo.label.fontSize * editingInfo.scale}px`,
                        color: editingInfo.label.color,
                        backgroundColor: 'transparent',
                        border: '2px solid #3b82f6',
                        borderRadius: '4px',
                        padding: '2px 4px',
                        outline: 'none',
                        minWidth: '100px',
                        zIndex: 1000,
                        transform: `rotate(${editingInfo.label.rotation}deg)`,
                        transformOrigin: 'top left',
                        // Text stroke effect using text-shadow
                        textShadow: editingInfo.label.strokeWidth
                          ? `
                            -1px -1px 0 ${editingInfo.label.strokeColor || '#fff'},
                            1px -1px 0 ${editingInfo.label.strokeColor || '#fff'},
                            -1px 1px 0 ${editingInfo.label.strokeColor || '#fff'},
                            1px 1px 0 ${editingInfo.label.strokeColor || '#fff'}
                          `
                          : 'none',
                      }}
                    />
                  )}
                </>
              ) : (
                <Stack align="center" gap="md" p="xl">
                  <IconWand size={48} color="gray" />
                  <Text c="dimmed" ta="center">
                    Generate a map or upload an image to get started
                  </Text>
                  <Button
                    leftSection={<IconWand size={16} />}
                    onClick={openGenerationDrawer}
                  >
                    Generate Map
                  </Button>
                </Stack>
              )}
            </Paper>

            {/* Controls sidebar */}
            <Paper
              shadow="sm"
              radius="md"
              withBorder
              p="md"
              style={{ width: 280 }}
            >
              <Stack gap="md">
                <Title order={4}>Controls</Title>

                {/* Zoom controls */}
                {baseImageUrl && (
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>
                      Zoom ({Math.round(view.zoom * 100)}%)
                    </Text>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="light"
                        onClick={handleZoomOut}
                        disabled={view.zoom <= MIN_ZOOM}
                        title="Zoom Out"
                      >
                        <IconZoomOut size={16} />
                      </Button>
                      <Button
                        size="xs"
                        variant="light"
                        onClick={handleZoomReset}
                        title="Fit to Viewport"
                      >
                        <IconZoomReset size={16} />
                      </Button>
                      <Button
                        size="xs"
                        variant="light"
                        onClick={handleZoomIn}
                        disabled={view.zoom >= MAX_ZOOM}
                        title="Zoom In"
                      >
                        <IconZoomIn size={16} />
                      </Button>
                    </Group>
                  </Stack>
                )}

                {/* Mode toggles - Grid or Labels */}
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    Mode
                  </Text>
                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant={mode === 'view' ? 'filled' : 'light'}
                      onClick={() => setMode('view')}
                      leftSection={<IconGridDots size={14} />}
                    >
                      Grid
                    </Button>
                    <Button
                      size="xs"
                      variant={mode === 'label' ? 'filled' : 'light'}
                      onClick={() => setMode('label')}
                      leftSection={<IconTypography size={14} />}
                    >
                      Labels
                    </Button>
                    <Button
                      size="xs"
                      variant={mode === 'mask' ? 'filled' : 'light'}
                      onClick={() => setMode('mask')}
                      leftSection={<IconBrush size={14} />}
                    >
                      Mask
                    </Button>
                  </Group>
                </Stack>

                {/* Contextual controls - show one or the other, not both */}
                {mode === 'view' && <GridControls />}
                {mode === 'label' && <LabelEditor />}
                {mode === 'mask' && (
                  <MaskControls
                    activeTool={maskConfig.tool}
                    brushSize={maskConfig.brushSize}
                    canUndo={canUndoMask}
                    canRedo={canRedoMask}
                    canSave={canSaveMask}
                    isSaving={isSavingMask}
                    onToolChange={setMaskTool}
                    onBrushSizeChange={setMaskBrushSize}
                    onUndo={undoMask}
                    onRedo={redoMask}
                    onClear={clearMask}
                    onSaveMask={handleSaveMask}
                  />
                )}

                {/* Export button */}
                <ExportButton />
              </Stack>
            </Paper>
          </Group>

          {/* Auth gate message for guests */}
          {!isLoggedIn && (
            <Paper bg="blue.0" p="md" radius="md">
              <Text c="blue.7" size="sm">
                💡 Sign in to save your maps and access your project library.
              </Text>
            </Paper>
          )}
        </Stack>

      </Container>

      {/* Drawers */}
      <MapGenerationDrawer
        opened={generationDrawerOpen}
        onClose={closeGenerationDrawer}
      />
      <MapProjectsDrawer
        opened={projectsDrawerOpen}
        onClose={closeProjectsDrawer}
        projects={projects}
        currentProjectId={projectId || undefined}
        isLoadingProjects={isLoadingProjects}
        isLoadingProject={isLoadingProject}
        onLoadProject={loadProject}
        onCreateNewProject={async () => {
          const name = prompt('Enter project name:');
          if (name) {
            await createProject(name);
          }
        }}
        onDeleteProject={deleteProject}
        onRenameProject={renameProject}
        onRefresh={refreshProjects}
      />
    </>
  );
}

// =============================================================================
// Main Component
// =============================================================================

interface MapGeneratorProps {
  /** Hide the unified header when embedded in another page that already has one */
  hideHeader?: boolean;
}

export function MapGenerator({ hideHeader }: MapGeneratorProps) {
  return (
    <MapGeneratorProvider>
      <MapGeneratorContent hideHeader={hideHeader} />
    </MapGeneratorProvider>
  );
}

export default MapGenerator;
