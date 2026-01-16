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
import { Container, Stack, Group, Paper, Title, Text, Code, Divider, Tabs, Checkbox, Badge, Modal, Button, Accordion, ThemeIcon } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
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
  { id: 'mask-save-button', label: 'Save mask button appears (green floppy disk icon)', category: 'Mask Drawing', taskId: 'Mask Save' },
  { id: 'mask-save-disabled', label: 'Save button disabled when no strokes or not logged in', category: 'Mask Drawing', taskId: 'Mask Save' },
  { id: 'mask-save-enabled', label: 'Save button enabled (green) when strokes exist and logged in', category: 'Mask Drawing', taskId: 'Mask Save' },
  { id: 'mask-save-click', label: 'Clicking save uploads mask to R2 and shows loading state', category: 'Mask Drawing', taskId: 'Mask Save' },
  { id: 'mask-save-console', label: 'Console shows: ✅ [MapGenerator] Mask saved manually', category: 'Mask Drawing', taskId: 'Mask Save' },
  { id: 'mask-preview', label: 'See semi-transparent mask overlay when not in mask mode', category: 'Mask Drawing', taskId: 'T208' },

  // Mask Generation (Phase 1)
  { id: 'mask-preview-toggle', label: 'See mask preview in Inpaint mode', category: 'Mask Generation', taskId: 'T195' },
  { id: 'mask-apply-toggle', label: 'Toggle "Apply Mask" in generation drawer', category: 'Mask Generation', taskId: 'T195' },
  { id: 'mask-export', label: 'Mask exports to base64 correctly', category: 'Mask Generation', taskId: 'T162' },
  { id: 'mask-generate', label: 'Generate map with mask applied (uses /generate-masked endpoint)', category: 'Mask Generation', taskId: 'T205' },
  { id: 'mask-boundary', label: 'Generated content respects mask boundaries', category: 'Mask Generation', taskId: 'T205' },
  { id: 'mask-format-fix', label: 'Mask/base image format normalized to data URI (no validation errors)', category: 'Mask Generation', taskId: 'Phase 1' },

  // Mask Persistence (New Feature)
  { id: 'mask-persist-prereq-logged-in', label: 'Prerequisite: User is logged in with a project loaded', category: 'Mask Persistence', taskId: 'Mask Persist' },
  { id: 'mask-persist-draw', label: 'Draw mask strokes on the canvas', category: 'Mask Persistence', taskId: 'Mask Persist' },
  { id: 'mask-persist-upload', label: 'Call uploadAndSaveMask() via context (or trigger auto-save)', category: 'Mask Persistence', taskId: 'Mask Persist' },
  { id: 'mask-persist-console-upload', label: 'Check console: 🎭 [MapGenerator] Uploading mask to R2...', category: 'Mask Persistence', taskId: 'Mask Persist' },
  { id: 'mask-persist-console-success', label: 'Check console: ✅ [MapGenerator] Mask uploaded: [url]', category: 'Mask Persistence', taskId: 'Mask Persist' },
  { id: 'mask-persist-state-url', label: 'Check Internal State: maskImageUrl contains Cloudflare URL', category: 'Mask Persistence', taskId: 'Mask Persist' },
  { id: 'mask-persist-refresh', label: 'Refresh page, wait for project hydration', category: 'Mask Persistence', taskId: 'Mask Persist' },
  { id: 'mask-persist-console-loaded', label: 'Check console: 🎭 [MapGenerator] Loaded mask image URL from project', category: 'Mask Persistence', taskId: 'Mask Persist' },
  { id: 'mask-persist-restored', label: 'Verify maskImageUrl is restored after refresh', category: 'Mask Persistence', taskId: 'Mask Persist' },
  { id: 'mask-persist-new-project', label: 'Creating new project clears maskImageUrl and mask strokes', category: 'Mask Persistence', taskId: 'Mask Persist' },

  // Mask Auto-Save on Generation (Critical Path)
  { id: 'mask-autosave-draw', label: 'Draw a mask on the canvas (9+ strokes)', category: 'Mask Auto-Save', taskId: 'Mask Auto-Save' },
  { id: 'mask-autosave-toggle', label: 'Toggle "Apply Mask" ON in generation drawer', category: 'Mask Auto-Save', taskId: 'Mask Auto-Save' },
  { id: 'mask-autosave-generate', label: 'Click Generate (masked generation)', category: 'Mask Auto-Save', taskId: 'Mask Auto-Save' },
  { id: 'mask-autosave-console-saving', label: 'Console: 🎭 [MapGenerator] Masked generation complete - saving mask before clearing', category: 'Mask Auto-Save', taskId: 'Mask Auto-Save' },
  { id: 'mask-autosave-console-uploading', label: 'Console: 🎭 [MapGenerator] Uploading mask to R2...', category: 'Mask Auto-Save', taskId: 'Mask Auto-Save' },
  { id: 'mask-autosave-console-uploaded', label: 'Console: ✅ [MapGenerator] Mask uploaded: [cloudflare url]', category: 'Mask Auto-Save', taskId: 'Mask Auto-Save' },
  { id: 'mask-autosave-console-saved', label: 'Console: ✅ [MapGenerator] Mask saved after masked generation', category: 'Mask Auto-Save', taskId: 'Mask Auto-Save' },
  { id: 'mask-autosave-strokes-cleared', label: 'Mask strokes are cleared from canvas after generation', category: 'Mask Auto-Save', taskId: 'Mask Auto-Save' },
  { id: 'mask-autosave-state-url', label: 'Check Internal State: maskImageUrl now contains Cloudflare URL', category: 'Mask Auto-Save', taskId: 'Mask Auto-Save' },
  { id: 'mask-autosave-saved-preview', label: 'Saved mask preview card appears in generation drawer', category: 'Mask Auto-Save', taskId: 'Mask Auto-Save' },
  { id: 'mask-autosave-refresh', label: 'Refresh page and reload project', category: 'Mask Auto-Save', taskId: 'Mask Auto-Save' },
  { id: 'mask-autosave-persisted', label: 'Saved mask is still available after refresh (maskImageUrl restored)', category: 'Mask Auto-Save', taskId: 'Mask Auto-Save' },
  // Saved Mask Viewing
  { id: 'saved-mask-preview-card', label: 'Saved mask preview card appears when maskImageUrl exists (no fresh strokes)', category: 'Saved Mask Viewing', taskId: 'Saved Mask' },
  { id: 'saved-mask-preview-button', label: 'Preview/Hide button toggles full mask view', category: 'Saved Mask Viewing', taskId: 'Saved Mask' },
  { id: 'saved-mask-preview-expanded', label: 'Full mask preview shows larger image on dark background', category: 'Saved Mask Viewing', taskId: 'Saved Mask' },
  { id: 'saved-mask-toggle-applies', label: 'Toggling on with saved mask applies it to generation', category: 'Saved Mask Viewing', taskId: 'Saved Mask' },
  { id: 'saved-mask-console-log', label: 'Console shows "Using saved mask from project: [url]" when applied', category: 'Saved Mask Viewing', taskId: 'Saved Mask' },
  { id: 'saved-mask-hides-with-fresh', label: 'Saved mask preview hides when fresh strokes are drawn', category: 'Saved Mask Viewing', taskId: 'Saved Mask' },

  // Mask Library Tab (Cross-Project Masks)
  { id: 'mask-library-tab-visible', label: 'Masks section appears in Inpaint mode content', category: 'Mask Library Tab', taskId: 'Mask Library' },
  { id: 'mask-library-auth-gate', label: 'Masks tab shows login prompt when not authenticated', category: 'Mask Library Tab', taskId: 'Mask Library' },
  { id: 'mask-library-fetches', label: 'Console shows "🎭 [MaskLibrary] Fetching masks from all projects..."', category: 'Mask Library Tab', taskId: 'Mask Library' },
  { id: 'mask-library-displays', label: 'Saved masks from other projects appear as thumbnails', category: 'Mask Library Tab', taskId: 'Mask Library' },
  { id: 'mask-library-project-name', label: 'Each mask shows originating project name', category: 'Mask Library Tab', taskId: 'Mask Library' },
  { id: 'mask-library-excludes-current', label: 'Current project mask is NOT shown in library (filtered out)', category: 'Mask Library Tab', taskId: 'Mask Library' },
  { id: 'mask-library-import-button', label: '"Use" button appears on each mask card', category: 'Mask Library Tab', taskId: 'Mask Library' },
  { id: 'mask-library-import-click', label: 'Clicking "Use" imports mask to current project', category: 'Mask Library Tab', taskId: 'Mask Library' },
  { id: 'mask-library-import-console', label: 'Console shows "🎭 [MapGenerator] Importing mask from: [projectName]"', category: 'Mask Library Tab', taskId: 'Mask Library' },
  { id: 'mask-library-state-updated', label: 'maskImageUrl state updates after import', category: 'Mask Library Tab', taskId: 'Mask Library' },
  { id: 'mask-library-empty-state', label: 'Shows "No saved masks found" when no masks exist', category: 'Mask Library Tab', taskId: 'Mask Library' },
  { id: 'mask-library-refresh-button', label: 'Refresh button reloads mask list', category: 'Mask Library Tab', taskId: 'Mask Library' },

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

  // Default Texture - Basic
  { id: 'default-texture-loads', label: 'Canvas displays papyrus texture on initial load (not blank)', category: 'Default Texture', taskId: 'Phase 1' },
  { id: 'default-texture-visible', label: 'Papyrus texture is visually correct (parchment/paper appearance)', category: 'Default Texture', taskId: 'Phase 1' },
  { id: 'default-texture-state', label: 'Check Internal State: baseImageUrl contains imagedelivery.net URL', category: 'Default Texture', taskId: 'Phase 1' },
  { id: 'default-texture-detection', label: 'Check Internal State: isUsingDefaultTexture is true on fresh load', category: 'Default Texture', taskId: 'Phase 3' },

  // Default Texture - Mask Drawing
  { id: 'default-mask-mode', label: 'Can switch to Mask mode on default texture', category: 'Default Texture Masking', taskId: 'Phase 4' },
  { id: 'default-mask-draw', label: 'Can draw mask strokes on default texture', category: 'Default Texture Masking', taskId: 'Phase 4' },
  { id: 'default-mask-shapes', label: 'Can draw rect/circle shapes on default texture', category: 'Default Texture Masking', taskId: 'Phase 4' },
  { id: 'default-mask-preview', label: 'Mask preview visible when switching away from mask mode', category: 'Default Texture Masking', taskId: 'Phase 4' },
  { id: 'default-mask-undo-redo', label: 'Undo/redo works for mask on default texture', category: 'Default Texture Masking', taskId: 'Phase 4' },

  // Default Texture - Generation
  { id: 'default-gen-full', label: 'Full generation (no mask) on default texture works', category: 'Default Texture Generation', taskId: 'Phase 4' },
  { id: 'default-gen-replaces', label: 'After generation, baseImageUrl changes to generated image URL', category: 'Default Texture Generation', taskId: 'Phase 4' },
  { id: 'default-gen-detection-off', label: 'After generation, isUsingDefaultTexture becomes false', category: 'Default Texture Generation', taskId: 'Phase 4' },
  { id: 'default-mask-gen', label: 'Masked generation (inpaint) on default texture works', category: 'Default Texture Generation', taskId: 'Phase 4' },
  { id: 'default-mask-gen-quality', label: 'Masked generation result looks good (content in masked area)', category: 'Default Texture Generation', taskId: 'Phase 4' },

  // Default Texture - Export
  { id: 'default-export-works', label: 'Export button works with default texture as base', category: 'Default Texture Export', taskId: 'Phase 4' },
  { id: 'default-export-includes-texture', label: 'Exported image includes papyrus texture', category: 'Default Texture Export', taskId: 'Phase 4' },
  { id: 'default-export-with-labels', label: 'Export includes labels drawn on default texture', category: 'Default Texture Export', taskId: 'Phase 4' },
  { id: 'default-export-with-grid', label: 'Export includes grid overlay on default texture', category: 'Default Texture Export', taskId: 'Phase 4' },

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

  // Track which accordion panels are open (multiple can be open)
  const [openPanels, setOpenPanels] = useState<string[]>([]);

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

  // Calculate completion status per category
  const categoryStatus = useMemo(() => {
    const status: Record<string, { checked: number; total: number; complete: boolean }> = {};
    Object.entries(itemsByCategory).forEach(([category, items]) => {
      const checked = items.filter(item => checkedItems.has(item.id)).length;
      status[category] = {
        checked,
        total: items.length,
        complete: checked === items.length,
      };
    });
    return status;
  }, [itemsByCategory, checkedItems]);

  // Initialize open panels to incomplete categories on first load
  useEffect(() => {
    if (!isInitialized) return;

    // Get all incomplete categories
    const incompleteCategories = Object.entries(categoryStatus)
      .filter(([, status]) => !status.complete)
      .map(([category]) => category);

    // If this is initial load and we have no panels open, open first incomplete
    if (openPanels.length === 0 && incompleteCategories.length > 0) {
      setOpenPanels([incompleteCategories[0]]);
    }
  }, [isInitialized, categoryStatus, openPanels.length]);

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

  const toggleItem = (id: string, category: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      // Check if this completes the category (auto-collapse)
      const categoryItems = itemsByCategory[category];
      const willBeComplete = categoryItems.every(item =>
        item.id === id ? !prev.has(id) : next.has(item.id)
      );

      if (willBeComplete) {
        // Auto-collapse this category after a brief delay
        setTimeout(() => {
          setOpenPanels(panels => panels.filter(p => p !== category));
        }, 300);
      }

      return next;
    });
  };

  const handleClearAll = () => {
    setCheckedItems(new Set());
    setClearModalOpened(false);
    // Open all panels when clearing
    setOpenPanels(Object.keys(itemsByCategory));
  };

  const totalChecked = checkedItems.size;
  const totalItems = CHECKLIST_ITEMS.length;
  const progressPercent = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;

  // Expand/collapse all
  const expandAll = () => setOpenPanels(Object.keys(itemsByCategory));
  const collapseAll = () => setOpenPanels([]);

  return (
    <Paper p="lg" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <div>
            <Title order={3}>Feature Verification Checklist</Title>
            <Text size="sm" c="dimmed" mt={4}>
              Interactive checklist with persistent state. Categories auto-collapse when complete.
            </Text>
          </div>
          <Group gap="sm">
            <Badge size="lg" variant="light" color={progressPercent === 100 ? 'green' : 'blue'}>
              {totalChecked} / {totalItems} ({progressPercent}%)
            </Badge>
          </Group>
        </Group>

        <Group gap="xs">
          <Text
            size="xs"
            c="dimmed"
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={expandAll}
          >
            Expand All
          </Text>
          <Text size="xs" c="dimmed">|</Text>
          <Text
            size="xs"
            c="dimmed"
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={collapseAll}
          >
            Collapse All
          </Text>
          <Text size="xs" c="dimmed">|</Text>
          <Text
            size="xs"
            c="red"
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => setClearModalOpened(true)}
          >
            Clear All
          </Text>
        </Group>

        <Divider />

        <Accordion
          multiple
          value={openPanels}
          onChange={setOpenPanels}
          variant="separated"
        >
          {Object.entries(itemsByCategory).map(([category, items]) => {
            const status = categoryStatus[category];
            const isComplete = status.complete;

            return (
              <Accordion.Item key={category} value={category}>
                <Accordion.Control>
                  <Group justify="space-between" pr="md">
                    <Group gap="sm">
                      {isComplete && (
                        <ThemeIcon size="sm" color="green" variant="light" radius="xl">
                          <IconCheck size={12} />
                        </ThemeIcon>
                      )}
                      <Text fw={600} size="sm" c={isComplete ? 'dimmed' : undefined}>
                        {category}
                      </Text>
                    </Group>
                    <Badge
                      size="sm"
                      variant="light"
                      color={isComplete ? 'green' : 'gray'}
                    >
                      {status.checked}/{status.total}
                    </Badge>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="xs">
                    {items.map((item) => (
                      <Checkbox
                        key={item.id}
                        label={item.label}
                        checked={checkedItems.has(item.id)}
                        onChange={() => toggleItem(item.id, category)}
                        size="sm"
                      />
                    ))}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>

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
      isUsingDefaultTexture: context.isUsingDefaultTexture,
      maskImageUrl: context.maskImageUrl,
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
            Default Texture: <strong style={{ color: stateForDisplay.isUsingDefaultTexture ? '#10b981' : '#6b7280' }}>
              {stateForDisplay.isUsingDefaultTexture ? 'Yes' : 'No'}
            </strong>
          </Text>
          <Text size="xs" c="dimmed">
            Mask Strokes: <strong>{stateForDisplay.maskDrawingState.strokes}</strong>
          </Text>
          <Text size="xs" c="dimmed">
            Mask Saved: <strong style={{ color: stateForDisplay.maskImageUrl ? '#10b981' : '#6b7280' }}>
              {stateForDisplay.maskImageUrl ? 'Yes' : 'No'}
            </strong>
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
