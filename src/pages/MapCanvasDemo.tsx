/**
 * Map Canvas Demo Page
 * 
 * Standalone demo page exercising all Map Canvas features before main app integration.
 * Per spec requirement FR-042: demo page must work before integration.
 * 
 * Features demonstrated:
 * - Grid overlay controls (visibility, type, size, color, opacity, adjustment mode)
 * - Text label controls (placement, editing, font, size, rotation, color, delete)
 * - Mask drawing and generation (brush, eraser, shapes, inpainting)
 * - Export functionality
 * - Internal state visualization (JSON viewer)
 * 
 * Access: Navigate to /map-demo
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Container, Stack, Group, Paper, Title, Text, Code, Divider, Tabs, Checkbox, Badge, Modal, Button } from '@mantine/core';
import { MapGeneratorProvider, useMapGenerator } from '../components/MapGenerator/MapGeneratorProvider';
import { MapGeneratorContent } from '../components/MapGenerator/MapGenerator';
import { UnifiedHeader } from '../components/UnifiedHeader';

// Demo page icon URL
const DEMO_ICON_URL = 'https://placehold.co/32x32/7c3aed/ffffff?text=M';

// =============================================================================
// Checklist Component with State Persistence
// =============================================================================

interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  taskId?: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Grid Controls
  { id: 'grid-toggle', label: 'Toggle grid visibility on/off', category: 'Grid Controls', taskId: 'T109' },
  { id: 'grid-type', label: 'Switch between square and hex grid types', category: 'Grid Controls', taskId: 'T109' },
  { id: 'grid-size', label: 'Adjust cell size (10-200px range)', category: 'Grid Controls', taskId: 'T109' },
  { id: 'grid-color', label: 'Change grid color', category: 'Grid Controls', taskId: 'T109' },
  { id: 'grid-opacity', label: 'Adjust grid opacity (0-1)', category: 'Grid Controls', taskId: 'T109' },

  // Label Controls - Basic
  { id: 'label-mode', label: 'Switch to Labels mode from mode selector', category: 'Label Controls', taskId: 'T110' },
  { id: 'label-add-btn', label: 'Click "Add Label" button to enter placement mode', category: 'Label Controls', taskId: 'T110' },
  { id: 'label-place', label: 'Click map to place new label', category: 'Label Controls', taskId: 'T110' },
  { id: 'label-select', label: 'Click label to select it', category: 'Label Controls', taskId: 'T110' },
  { id: 'label-drag', label: 'Drag label to reposition', category: 'Label Controls', taskId: 'T110' },

  // Label Controls - On-Canvas Editing
  { id: 'label-inline-edit', label: 'Double-click label to edit text inline on map', category: 'Label Editing', taskId: 'T207' },
  { id: 'label-transformer-resize', label: 'Resize label using transformer corner handles', category: 'Label Editing', taskId: 'T218' },
  { id: 'label-transformer-rotate', label: 'Rotate label using transformer rotation handle', category: 'Label Editing', taskId: 'T218' },
  { id: 'label-delete-x', label: 'Delete label using red X button on selected label', category: 'Label Editing', taskId: 'T110' },
  { id: 'label-keyboard-delete', label: 'Delete label using Delete or Backspace key', category: 'Label Editing', taskId: 'T110' },
  { id: 'label-keyboard-escape', label: 'Deselect label using Escape key', category: 'Label Editing', taskId: 'T110' },

  // Label Controls - Sidebar Properties
  { id: 'label-font', label: 'Change font family (5 available fonts)', category: 'Label Properties', taskId: 'T110' },
  { id: 'label-color', label: 'Change text color', category: 'Label Properties', taskId: 'T110' },
  { id: 'label-outline', label: 'Add text outline (stroke) with color and width', category: 'Label Properties', taskId: 'T203' },
  { id: 'label-shadow', label: 'Enable drop shadow with blur and color controls', category: 'Label Properties', taskId: 'T204' },
  { id: 'label-show-toggle', label: 'Toggle "Show Labels" to hide/show all labels', category: 'Label Properties', taskId: 'T110' },
  { id: 'label-clear-all', label: 'Clear all labels using "Clear All" button', category: 'Label Properties', taskId: 'T110' },

  // Mask Drawing (Phase 14)
  { id: 'mask-mode', label: 'Switch to Mask mode from mode selector', category: 'Mask Drawing', taskId: 'T193' },
  { id: 'mask-brush', label: 'Draw mask with brush tool', category: 'Mask Drawing', taskId: 'T156' },
  { id: 'mask-eraser', label: 'Erase mask areas with eraser tool', category: 'Mask Drawing', taskId: 'T158' },
  { id: 'mask-rect', label: 'Draw rectangle mask shape', category: 'Mask Drawing', taskId: 'T159' },
  { id: 'mask-circle', label: 'Draw circle mask shape', category: 'Mask Drawing', taskId: 'T160' },
  { id: 'mask-brush-size', label: 'Adjust brush size (5-100px)', category: 'Mask Drawing', taskId: 'T161' },
  { id: 'mask-undo', label: 'Undo mask stroke', category: 'Mask Drawing', taskId: 'T153' },
  { id: 'mask-redo', label: 'Redo mask stroke', category: 'Mask Drawing', taskId: 'T153' },
  { id: 'mask-clear', label: 'Clear all mask strokes', category: 'Mask Drawing', taskId: 'T154' },
  { id: 'mask-preview', label: 'See semi-transparent mask overlay when not in mask mode', category: 'Mask Drawing', taskId: 'T208' },

  // Mask Generation (Phase 1)
  { id: 'mask-preview-toggle', label: 'See mask preview in MapInputForm', category: 'Mask Generation', taskId: 'T195' },
  { id: 'mask-apply-toggle', label: 'Toggle "Apply Mask" in generation drawer', category: 'Mask Generation', taskId: 'T195' },
  { id: 'mask-export', label: 'Mask exports to base64 correctly', category: 'Mask Generation', taskId: 'T162' },
  { id: 'mask-generate', label: 'Generate map with mask applied (uses /generate-masked endpoint)', category: 'Mask Generation', taskId: 'T205' },
  { id: 'mask-boundary', label: 'Generated content respects mask boundaries', category: 'Mask Generation', taskId: 'T205' },
  { id: 'mask-format-fix', label: 'Mask/base image format normalized to data URI (no validation errors)', category: 'Mask Generation', taskId: 'Phase 1' },

  // Generation Options Persistence
  { id: 'options-persistence', label: 'Generation options (model, style, numImages) persist across drawer sessions', category: 'Generation Options', taskId: 'Phase 2' },
  { id: 'options-restore', label: 'Generation options restore when reopening drawer', category: 'Generation Options', taskId: 'Phase 2' },
  { id: 'options-localstorage', label: 'Generation options persist across page refresh (localStorage)', category: 'Generation Options', taskId: 'Phase 2' },

  // Map Input Persistence
  { id: 'prompt-persistence', label: 'Map description (prompt) persists across drawer sessions', category: 'Map Input Persistence', taskId: 'Input Persistence' },
  { id: 'style-options-persistence', label: 'Style options (fantasy level, rendering, tone, etc.) persist', category: 'Map Input Persistence', taskId: 'Input Persistence' },
  { id: 'input-restore', label: 'Map input restores when reopening drawer', category: 'Map Input Persistence', taskId: 'Input Persistence' },
  { id: 'input-localstorage', label: 'Map input persists across page refresh (localStorage)', category: 'Map Input Persistence', taskId: 'Input Persistence' },

  // Drawer UX Flow (Phase 6)
  { id: 'gallery-top', label: 'Project Gallery appears at TOP of generation drawer', category: 'Drawer UX', taskId: 'Phase 6' },
  { id: 'mask-toggle-auto-reset', label: 'Mask toggle auto-resets to OFF after generation completes', category: 'Drawer UX', taskId: 'Phase 6' },
  { id: 'inpaint-mode-simplified', label: 'When mask toggle ON, style options are HIDDEN (simplified UI)', category: 'Drawer UX', taskId: 'Phase 6' },
  { id: 'inpaint-prompt-label', label: 'Prompt label changes to "Describe what to generate in the masked region" in inpaint mode', category: 'Drawer UX', taskId: 'Phase 6' },
  { id: 'inpaint-flow-complete', label: 'Full flow: draw mask → toggle on → generate → toggle auto-off → UI returns to full mode', category: 'Drawer UX', taskId: 'Phase 6' },

  // Upload Persistence (Test 1 from Export Verification)
  { id: 'upload-prereq-logged-in', label: 'Prerequisite: User is logged in', category: 'Upload Persistence', taskId: 'Test 1' },
  { id: 'upload-prereq-project-exists', label: 'Prerequisite: A project exists (create or load a project first)', category: 'Upload Persistence', taskId: 'Test 1' },
  { id: 'upload-image-file', label: 'Upload an image file via Upload tab in generation drawer', category: 'Upload Persistence', taskId: 'Test 1' },
  { id: 'upload-console-logs-uploading', label: 'Check console logs: 📤 [Engine] Uploading file: filename', category: 'Upload Persistence', taskId: 'Test 1' },
  { id: 'upload-console-logs-complete', label: 'Check console logs: ✅ [Engine] Upload complete: imageUrl', category: 'Upload Persistence', taskId: 'Test 1' },
  { id: 'upload-console-logs-handled', label: 'Check console logs: 📸 [MapGenerator] handleImagesGenerated: 1 images', category: 'Upload Persistence', taskId: 'Test 1' },
  { id: 'upload-console-logs-added', label: 'Check console logs: 📸 [MapGenerator] Adding generated image to project: [id]', category: 'Upload Persistence', taskId: 'Test 1' },
  { id: 'upload-console-logs-saving', label: 'Check console logs: 💾 [MapGenerator] Saving project: [projectId] with X images', category: 'Upload Persistence', taskId: 'Test 1' },
  { id: 'upload-console-logs-saved', label: 'Check console logs: ✅ [MapGenerator] Project saved', category: 'Upload Persistence', taskId: 'Test 1' },
  { id: 'upload-gallery-immediate', label: 'Verify image appears in Project Gallery immediately', category: 'Upload Persistence', taskId: 'Test 1' },
  { id: 'upload-wait-autosave', label: 'Wait 2-3 seconds for auto-save to complete', category: 'Upload Persistence', taskId: 'Test 1' },
  { id: 'upload-refresh-page', label: 'Refresh page', category: 'Upload Persistence', taskId: 'Test 1' },
  { id: 'upload-console-logs-hydrating', label: 'After refresh, check console logs: 🔄 [MapGenerator] Hydrating current project on load: [projectId]', category: 'Upload Persistence', taskId: 'Test 1' },
  { id: 'upload-console-logs-loaded', label: 'After refresh, check console logs: 📸 [MapGenerator] Loaded X generated images from project', category: 'Upload Persistence', taskId: 'Test 1' },
  { id: 'upload-persists-backend', label: 'Verify uploaded image persists (loads from backend)', category: 'Upload Persistence', taskId: 'Test 1' },
  { id: 'upload-gallery-after-refresh', label: 'Verify uploaded image appears in Project Gallery after refresh', category: 'Upload Persistence', taskId: 'Test 1' },

  // Default Texture
  { id: 'default-texture', label: 'New projects start with default papyrus texture', category: 'Default Texture', taskId: 'New Feature' },
  { id: 'texture-detection', label: 'System detects if base image is default texture vs generated/uploaded', category: 'Default Texture', taskId: 'New Feature' },

  // Export Functionality
  { id: 'export-button', label: 'Click Export button', category: 'Export', taskId: 'T111' },
  { id: 'export-format', label: 'Select format (PNG or JPEG)', category: 'Export', taskId: 'T111' },
  { id: 'export-image', label: 'Verify export includes base image', category: 'Export', taskId: 'T111' },
  { id: 'export-grid', label: 'Verify export includes grid (if visible)', category: 'Export', taskId: 'T111' },
  { id: 'export-labels', label: 'Verify export includes all labels with styling', category: 'Export', taskId: 'T111' },
  { id: 'export-download', label: 'Verify exported image downloads as file', category: 'Export', taskId: 'T111' },

  // Canvas Navigation
  { id: 'pan-canvas', label: 'Pan canvas using middle mouse button + drag', category: 'Canvas Navigation', taskId: 'T112' },
  { id: 'zoom-canvas', label: 'Zoom canvas with mouse wheel', category: 'Canvas Navigation', taskId: 'T112' },

  // General Features
  { id: 'generate-map', label: 'Generate map via Generation Drawer', category: 'General', taskId: 'T112' },
  { id: 'upload-map', label: 'Upload existing map image', category: 'General', taskId: 'T112' },
  { id: 'save-project', label: 'Save project (check save status indicator)', category: 'General', taskId: 'T214' },
  { id: 'load-project', label: 'Load existing project from Projects drawer', category: 'General', taskId: 'T112' },
  { id: 'state-viewer', label: 'Check "Internal State" tab to verify state changes', category: 'General', taskId: 'T112' },
];

const STORAGE_KEY = 'mapCanvasDemo_checklist';

// Load initial state synchronously from localStorage to avoid race condition
function loadChecklistFromStorage(): Set<string> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log('📋 [Checklist] Loaded from localStorage:', parsed.length, 'items checked');
      return new Set(parsed);
    }
  } catch (err) {
    console.warn('❌ [Checklist] Failed to load state:', err);
  }
  return new Set();
}

function ChecklistSection() {
  // Initialize state from localStorage synchronously (prevents race condition)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => loadChecklistFromStorage());
  const [clearModalOpened, setClearModalOpened] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Mark as initialized after first render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Save to localStorage when checked items change (only after initialization)
  useEffect(() => {
    if (!isInitialized) return; // Skip initial save to avoid overwriting on mount

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(checkedItems)));
      console.log('💾 [Checklist] Saved to localStorage:', checkedItems.size, 'items checked');
    } catch (err) {
      console.warn('❌ [Checklist] Failed to save state:', err);
    }
  }, [checkedItems, isInitialized]);

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleClearAll = () => {
    setCheckedItems(new Set());
    setClearModalOpened(false);
  };

  // Group items by category
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, ChecklistItem[]> = {};
    CHECKLIST_ITEMS.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  }, []);

  const totalChecked = checkedItems.size;
  const totalItems = CHECKLIST_ITEMS.length;
  const progressPercent = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;

  return (
    <Paper p="lg" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <div>
            <Title order={3}>Feature Verification Checklist</Title>
            <Text size="sm" c="dimmed" mt={4}>
              Interactive checklist with persistent state. Check items as you verify features.
            </Text>
          </div>
          <Group gap="sm">
            <Badge size="lg" variant="light" color={progressPercent === 100 ? 'green' : 'blue'}>
              {totalChecked} / {totalItems} ({progressPercent}%)
            </Badge>
            <Text
              size="xs"
              c="dimmed"
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => setClearModalOpened(true)}
            >
              Clear All
            </Text>
          </Group>
        </Group>

        <Divider />

        <Stack gap="lg">
          {Object.entries(itemsByCategory).map(([category, items]) => (
            <div key={category}>
              <Text fw={600} size="sm" mb="sm">
                {category}
                {items[0].taskId && (
                  <Badge size="xs" variant="dot" ml="xs" color="gray">
                    {items[0].taskId}
                  </Badge>
                )}
              </Text>
              <Stack gap="xs">
                {items.map((item) => (
                  <Checkbox
                    key={item.id}
                    label={item.label}
                    checked={checkedItems.has(item.id)}
                    onChange={() => toggleItem(item.id)}
                    size="sm"
                  />
                ))}
              </Stack>
            </div>
          ))}
        </Stack>

        {progressPercent === 100 && (
          <Paper p="md" bg="green.0" withBorder>
            <Text size="sm" c="green.7" fw={500}>
              ✅ All checklist items completed! The Map Canvas feature is fully verified.
            </Text>
          </Paper>
        )}
      </Stack>

      <Modal
        opened={clearModalOpened}
        onClose={() => setClearModalOpened(false)}
        title="Clear Checklist"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to clear all checklist items? This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setClearModalOpened(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleClearAll}>
              Clear All
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}

// =============================================================================
// State Viewer Component
// =============================================================================

// Load generation options from localStorage
function loadGenerationOptionsFromStorage(): { model?: string; style?: string; numImages?: number } | null {
  try {
    const saved = localStorage.getItem('mapGenerator:generationOptions');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('❌ [StateViewer] Failed to load generation options:', err);
  }
  return null;
}

// Load map input from localStorage
function loadMapInputFromStorage(): { prompt?: string; styleOptions?: Record<string, unknown> } | null {
  try {
    const saved = localStorage.getItem('mapGenerator:mapInput');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('❌ [StateViewer] Failed to load map input:', err);
  }
  return null;
}

function StateViewer() {
  const context = useMapGenerator();
  const [generationOptions, setGenerationOptions] = useState<{ model?: string; style?: string; numImages?: number } | null>(null);
  const [mapInput, setMapInput] = useState<{ prompt?: string; styleOptions?: Record<string, unknown> } | null>(null);

  // Load generation options and map input, poll for updates
  useEffect(() => {
    const loadOptions = () => {
      setGenerationOptions(loadGenerationOptionsFromStorage());
      setMapInput(loadMapInputFromStorage());
    };

    // Initial load
    loadOptions();

    // Poll every 2 seconds to catch updates from drawer
    const interval = setInterval(loadOptions, 2000);
    return () => clearInterval(interval);
  }, []);

  // Extract state for display
  const stateForDisplay = useMemo(() => {
    if (!context) return null;

    return {
      baseImageUrl: context.baseImageUrl,
      projectId: context.projectId,
      projectName: context.projectName,
      gridConfig: context.gridConfig,
      labels: context.labels,
      selectedLabelId: context.selectedLabelId,
      scaleMetadata: context.scaleMetadata,
      view: context.view,
      mode: context.mode,
      generationDrawerOpen: context.generationDrawerOpen,
      projectsDrawerOpen: context.projectsDrawerOpen,
      isLoading: context.isLoading,
      isLoadingProjects: context.isLoadingProjects,
      isLoadingProject: context.isLoadingProject,
      error: context.error,
      saveStatus: context.saveStatus,
      projectsCount: context.projects?.length || 0,
      lastCompiledPrompt: context.lastCompiledPrompt,
      lastMapspec: context.lastMapspec,
      // Generation options from localStorage
      generationOptions: generationOptions,
      // Map input from localStorage
      mapInput: mapInput ? {
        promptLength: mapInput.prompt?.length || 0,
        promptPreview: mapInput.prompt?.substring(0, 50) + (mapInput.prompt && mapInput.prompt.length > 50 ? '...' : ''),
        styleOptions: mapInput.styleOptions,
      } : null,
      // Mask state
      maskConfig: context.maskConfig,
      maskDrawingState: {
        strokes: context.maskDrawingState?.strokes.length || 0,
        currentStroke: context.maskDrawingState?.currentStroke ? 'active' : null,
        activeTool: context.maskDrawingState?.activeTool,
        brushSize: context.maskDrawingState?.brushSize,
        isDrawing: context.maskDrawingState?.isDrawing,
      },
    };
  }, [context, generationOptions, mapInput]);

  if (!stateForDisplay || !context) {
    return (
      <Paper p="md" withBorder>
        <Text c="dimmed">No state available</Text>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      <div>
        <Title order={4} mb="xs">Internal State (JSON Viewer)</Title>
        <Text size="sm" c="dimmed" mb="md">
          Real-time view of MapGeneratorProvider state for debugging and verification
        </Text>
      </div>

      <Paper p="md" withBorder style={{ backgroundColor: '#f8f9fa' }}>
        <Code block style={{ fontSize: '12px', maxHeight: '600px', overflow: 'auto' }}>
          {JSON.stringify(stateForDisplay, null, 2)}
        </Code>
      </Paper>

      <div>
        <Text size="sm" fw={500} mb="xs">Quick Stats</Text>
        <Group gap="md">
          <Text size="xs" c="dimmed">
            Labels: <strong>{stateForDisplay.labels.length}</strong>
          </Text>
          <Text size="xs" c="dimmed">
            Mode: <strong>{stateForDisplay.mode}</strong>
          </Text>
          <Text size="xs" c="dimmed">
            Grid Visible: <strong>{stateForDisplay.gridConfig.visible ? 'Yes' : 'No'}</strong>
          </Text>
          <Text size="xs" c="dimmed">
            Save Status: <strong>{stateForDisplay.saveStatus}</strong>
          </Text>
          <Text size="xs" c="dimmed">
            Mask Strokes: <strong>{stateForDisplay.maskDrawingState.strokes}</strong>
          </Text>
          <Text size="xs" c="dimmed">
            Mask Tool: <strong>{stateForDisplay.maskDrawingState.activeTool || 'none'}</strong>
          </Text>
        </Group>
      </div>

      {/* Generation Options (from localStorage) */}
      {stateForDisplay.generationOptions && (
        <div>
          <Text size="sm" fw={500} mb="xs">Generation Options (Persisted)</Text>
          <Group gap="md">
            <Text size="xs" c="dimmed">
              Model: <strong>{stateForDisplay.generationOptions.model || 'default'}</strong>
            </Text>
            <Text size="xs" c="dimmed">
              Style: <strong>{stateForDisplay.generationOptions.style || 'default'}</strong>
            </Text>
            <Text size="xs" c="dimmed">
              Num Images: <strong>{stateForDisplay.generationOptions.numImages || 1}</strong>
            </Text>
          </Group>
        </div>
      )}

      {/* Map Input (from localStorage) */}
      {stateForDisplay.mapInput && (
        <div>
          <Text size="sm" fw={500} mb="xs">Map Input (Persisted)</Text>
          <Group gap="md">
            <Text size="xs" c="dimmed">
              Prompt Length: <strong>{stateForDisplay.mapInput.promptLength} chars</strong>
            </Text>
            <Text size="xs" c="dimmed">
              Preview: <strong>{stateForDisplay.mapInput.promptPreview || '(empty)'}</strong>
            </Text>
          </Group>
          {stateForDisplay.mapInput.styleOptions && (
            <Text size="xs" c="dimmed" mt="xs">
              Style Options: <strong>{Object.entries(stateForDisplay.mapInput.styleOptions).map(([k, v]) => `${k}:${v}`).join(', ')}</strong>
            </Text>
          )}
        </div>
      )}

      {/* Compiled Prompt Display */}
      {stateForDisplay.lastCompiledPrompt && (
        <div>
          <Text size="sm" fw={500} mb="xs">Last Compiled Prompt</Text>
          <Paper p="md" withBorder style={{ backgroundColor: '#f8f9fa' }}>
            <Code block style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
              {stateForDisplay.lastCompiledPrompt}
            </Code>
          </Paper>
        </div>
      )}
    </Stack>
  );
}

// =============================================================================
// Demo Header Component (uses context for drawer functions)
// =============================================================================

function DemoHeader() {
  const {
    openGenerationDrawer,
    openProjectsDrawer,
    saveStatus,
    saveNow,
    projectId,
    baseImageUrl,
  } = useMapGenerator();

  // Show as unsaved when there's content (base image) but no project ID yet
  const isUnsaved = !!baseImageUrl && !projectId;

  const handleSaveClick = async () => {
    console.log('💾 [MapDemo] Manual save triggered');
    try {
      await saveNow();
    } catch (err) {
      console.error('❌ [MapDemo] Manual save failed:', err);
    }
  };

  return (
    <UnifiedHeader
      app={{
        id: 'map-demo',
        name: 'Map Canvas Demo',
        icon: DEMO_ICON_URL,
      }}
      showGeneration={true}
      onGenerationClick={openGenerationDrawer}
      showProjects={true}
      onProjectsClick={openProjectsDrawer}
      showAuth={true}
      saveStatus={saveStatus}
      onSaveClick={handleSaveClick}
      showSaveButton={!!baseImageUrl}
      isUnsaved={isUnsaved}
    />
  );
}

// =============================================================================
// Demo Content Component (wrapped with provider)
// =============================================================================

function MapCanvasDemoContent() {
  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={1} mb="xs">Map Canvas Demo</Title>
          <Text c="dimmed">
            Standalone demo page exercising all Map Canvas features.
            Use this page to verify functionality before main app integration.
          </Text>
        </div>

        <Divider />

        {/* Main Demo Area - using MapGeneratorContent with shared provider */}
        <Tabs defaultValue="demo" keepMounted={false}>
          <Tabs.List>
            <Tabs.Tab value="demo">Demo Canvas</Tabs.Tab>
            <Tabs.Tab value="state">Internal State Viewer</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="demo" pt="md">
            {/* MapGeneratorContent - uses shared provider context, header hidden */}
            <MapGeneratorContent hideHeader />
          </Tabs.Panel>

          <Tabs.Panel value="state" pt="md">
            {/* State Viewer - uses same shared provider context */}
            <StateViewer />
          </Tabs.Panel>
        </Tabs>

        {/* Feature Checklist */}
        <ChecklistSection />
      </Stack>
    </Container>
  );
}

// =============================================================================
// Main Demo Page Component
// =============================================================================

export default function MapCanvasDemo() {
  console.log('🗺️ [MapCanvasDemo] Component mounting');

  return (
    <MapGeneratorProvider>
      <DemoHeader />
      <MapCanvasDemoContent />
    </MapGeneratorProvider>
  );
}
