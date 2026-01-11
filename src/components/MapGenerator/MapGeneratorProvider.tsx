/**
 * MapGeneratorProvider
 * 
 * Context provider for the Map Generator feature.
 * Manages map canvas state, project persistence, and drawer coordination.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import { useMapCanvas, UseMapCanvasResult, useMaskDrawing } from 'dungeonmind-canvas';
import { GridConfig, MapLabel, DEFAULT_GRID_CONFIG, MapProjectSummary, ScaleMetadata, DEFAULT_SCALE_METADATA } from 'dungeonmind-canvas';
import type { MaskTool, MaskStroke, MaskDrawingState } from 'dungeonmind-canvas';
import { DUNGEONMIND_API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { MaskConfig, DEFAULT_MASK_CONFIG, ProjectGeneratedImage } from './mapTypes';

// =============================================================================
// Types
// =============================================================================

export interface MapGeneratorState {
  /** Base image URL (generated or uploaded) */
  baseImageUrl: string;
  /** Project name */
  projectName: string;
  /** Project ID (if saved) */
  projectId: string | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
}

export interface MapGeneratorContextValue extends UseMapCanvasResult {
  // Additional state
  baseImageUrl: string;
  projectName: string;
  projectId: string | null;
  isLoading: boolean;
  error: string | null;
  scaleMetadata: ScaleMetadata | null;
  lastCompiledPrompt: string | null;
  lastMapspec: any | null;
  lastGenerationInput: { prompt: string; styleOptions: any } | null;

  // Projects state
  projects: MapProjectSummary[];
  isLoadingProjects: boolean;
  isLoadingProject: boolean; // True when loading a specific project
  
  // Generated images (project gallery)
  generatedImages: ProjectGeneratedImage[];

  // Drawer state
  generationDrawerOpen: boolean;
  projectsDrawerOpen: boolean;

  // Label placement state
  labelsVisible: boolean;
  isPlacingLabel: boolean;

  // Mask state (T165-T168)
  maskConfig: MaskConfig;
  maskDrawingState: MaskDrawingState;
  maskStrokes: MaskStroke[];
  maskCurrentStroke: MaskStroke | null;

  // Actions
  setBaseImageUrl: (url: string) => void;
  setProjectName: (name: string) => void;
  setError: (error: string | null) => void;
  setScaleMetadata: (metadata: ScaleMetadata | null) => void;

  // Drawer actions
  openGenerationDrawer: () => void;
  closeGenerationDrawer: () => void;
  openProjectsDrawer: () => void;
  closeProjectsDrawer: () => void;

  // Label actions
  setLabelsVisible: (visible: boolean) => void;
  setIsPlacingLabel: (placing: boolean) => void;
  clearAllLabels: () => void;

  // Mask actions (T166-T168)
  toggleMaskMode: () => void;
  setMaskEnabled: (enabled: boolean) => void;
  setMaskBrushSize: (size: number) => void;
  setMaskTool: (tool: MaskTool) => void;
  setMaskData: (data: string | null) => void;
  clearMask: () => void;

  // Mask drawing actions (from useMaskDrawing hook)
  startMaskStroke: (x: number, y: number) => void;
  continueMaskStroke: (x: number, y: number) => void;
  endMaskStroke: () => void;
  addMaskShape: (bounds: { x: number; y: number; width: number; height: number }) => void;
  undoMask: () => void;
  redoMask: () => void;
  canUndoMask: boolean;
  canRedoMask: boolean;

  // Generation callback
  handleGenerationComplete: (result: { 
    imageUrl: string; 
    compiledPrompt?: string; 
    mapspec?: any;
    input?: { prompt: string; styleOptions: any };
  }) => void;

  // Project CRUD operations
  listProjects: () => Promise<void>;
  createProject: (name: string) => Promise<string>;
  loadProject: (projectId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  renameProject: (projectId: string, newName: string) => Promise<void>;
  refreshProjects: () => Promise<void>;

  // Save operations
  saveNow: () => Promise<void>;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  
  // Generated images actions
  addGeneratedImage: (image: ProjectGeneratedImage) => void;
  setGeneratedImages: (images: ProjectGeneratedImage[]) => void;
}

// =============================================================================
// Context
// =============================================================================

const MapGeneratorContext = createContext<MapGeneratorContextValue | null>(null);

// =============================================================================
// Provider
// =============================================================================

export interface MapGeneratorProviderProps {
  children: ReactNode;
  /** Initial base image URL */
  initialImageUrl?: string;
}

export function MapGeneratorProvider({
  children,
  initialImageUrl = ''
}: MapGeneratorProviderProps) {
  const { isLoggedIn, userId } = useAuth();

  // Map canvas state from hook
  const mapCanvas = useMapCanvas({
    initialGridConfig: DEFAULT_GRID_CONFIG,
    initialLabels: [],
  });

  // Additional local state
  const [baseImageUrl, setBaseImageUrl] = useState(initialImageUrl);
  const [projectName, setProjectName] = useState('Untitled Map');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scaleMetadata, setScaleMetadata] = useState<ScaleMetadata | null>(null);
  const [lastCompiledPrompt, setLastCompiledPrompt] = useState<string | null>(null);
  const [lastMapspec, setLastMapspec] = useState<any | null>(null);
  const [lastGenerationInput, setLastGenerationInput] = useState<{ prompt: string; styleOptions: any } | null>(null);

  // Projects state
  const [projects, setProjects] = useState<MapProjectSummary[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Generated images (project gallery)
  const [generatedImages, setGeneratedImages] = useState<ProjectGeneratedImage[]>([]);

  // If true, the next autosave effect should persist immediately (no debounce).
  // Used for image additions where users may refresh quickly.
  const immediateSaveRequestedRef = useRef(false);

  // Prevent repeated hydration loops on mount/refresh
  const lastHydratedProjectIdRef = useRef<string | null>(null);

  // Drawer state
  const [generationDrawerOpen, setGenerationDrawerOpen] = useState(false);
  const [projectsDrawerOpen, setProjectsDrawerOpen] = useState(false);

  // Label visibility and placement state
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [isPlacingLabel, setIsPlacingLabel] = useState(false);

  // Mask state (T165-T168)
  const [maskConfig, setMaskConfig] = useState<MaskConfig>(DEFAULT_MASK_CONFIG);
  const maskDrawing = useMaskDrawing();

  // Clear all labels function
  const clearAllLabels = useCallback(() => {
    mapCanvas.setLabels([]);
    mapCanvas.selectLabel(null);
    console.log('🗑️ [MapGenerator] All labels cleared');
  }, [mapCanvas]);

  // =========================================================================
  // Mask Actions (T166-T168)
  // =========================================================================

  const toggleMaskMode = useCallback(() => {
    setMaskConfig((prev) => ({
      ...prev,
      enabled: !prev.enabled,
    }));
    console.log('🎭 [MapGenerator] Mask mode toggled');
  }, []);

  const setMaskEnabled = useCallback((enabled: boolean) => {
    setMaskConfig((prev) => ({
      ...prev,
      enabled,
    }));
    console.log(`🎭 [MapGenerator] Mask mode ${enabled ? 'enabled' : 'disabled'}`);
  }, []);

  const setMaskBrushSize = useCallback((size: number) => {
    // Clamp to valid range (5-100)
    const clampedSize = Math.max(5, Math.min(100, size));
    setMaskConfig((prev) => ({
      ...prev,
      brushSize: clampedSize,
    }));
    maskDrawing.actions.setBrushSize(clampedSize);
  }, [maskDrawing.actions]);

  const setMaskTool = useCallback((tool: MaskTool) => {
    setMaskConfig((prev) => ({
      ...prev,
      tool,
    }));
    maskDrawing.actions.setTool(tool);
    console.log(`🎭 [MapGenerator] Mask tool set to: ${tool}`);
  }, [maskDrawing.actions]);

  const setMaskData = useCallback((data: string | null) => {
    setMaskConfig((prev) => ({
      ...prev,
      maskData: data,
    }));
  }, []);

  const clearMask = useCallback(() => {
    maskDrawing.actions.clear();
    setMaskConfig((prev) => ({
      ...prev,
      maskData: null,
    }));
    console.log('🗑️ [MapGenerator] Mask cleared');
  }, [maskDrawing.actions]);

  // Add a generated image to the project gallery
  const addGeneratedImage = useCallback((image: ProjectGeneratedImage) => {
    console.log('📸 [MapGenerator] Adding generated image to project:', image.id);
    setGeneratedImages((prev) => {
      // Avoid duplicates
      if (prev.some(img => img.id === image.id || img.url === image.url)) {
        return prev;
      }
      // Request immediate persistence after state updates
      immediateSaveRequestedRef.current = true;
      return [...prev, image];
    });
  }, []);

  // Auto-save refs
  const debouncedSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const skipAutoSaveRef = useRef(false);
  const lastSavedContentHashRef = useRef<string>('');
  const isRestoringStateRef = useRef(false);
  const initialLoadCompleteRef = useRef(false);

  // localStorage key for demo/guest persistence
  const LOCALSTORAGE_KEY = 'mapGenerator_state';

  // Drawer actions
  const openGenerationDrawer = useCallback(() => {
    console.log('📂 [MapGenerator] Opening generation drawer');
    setGenerationDrawerOpen(true);
  }, []);

  const closeGenerationDrawer = useCallback(() => {
    console.log('📂 [MapGenerator] Closing generation drawer');
    setGenerationDrawerOpen(false);
  }, []);

  const openProjectsDrawer = useCallback(() => {
    console.log('📂 [MapGenerator] Opening projects drawer');
    setProjectsDrawerOpen(true);
  }, []);

  const closeProjectsDrawer = useCallback(() => {
    console.log('📂 [MapGenerator] Closing projects drawer');
    setProjectsDrawerOpen(false);
  }, []);

  // Handle generation completion
  const handleGenerationComplete = useCallback((result: { 
    imageUrl: string; 
    compiledPrompt?: string; 
    mapspec?: any;
    input?: { prompt: string; styleOptions: any };
  }) => {
    console.log('🎉 [MapGenerator] Generation complete:', result.imageUrl);
    setBaseImageUrl(result.imageUrl);
    setLastCompiledPrompt(result.compiledPrompt || null);
    setLastMapspec(result.mapspec || null);
    if (result.input) {
      setLastGenerationInput(result.input);
      console.log('💾 [MapGenerator] Saved generation input metadata:', result.input);
    }
    setGenerationDrawerOpen(false);
    setError(null);
    
    // If this was a masked generation (mapspec is null), clear the mask and switch to view mode
    if (result.mapspec === null) {
      console.log('🎭 [MapGenerator] Masked generation complete - clearing mask and switching to view mode');
      maskDrawing.actions.clear();
      setMaskConfig((prev) => ({
        ...prev,
        maskData: null,
      }));
      mapCanvas.setMode('view');
    }
  }, [maskDrawing.actions, mapCanvas]);

  // =============================================================================
  // Project CRUD Operations
  // =============================================================================

  const listProjects = useCallback(async (): Promise<void> => {
    if (!isLoggedIn || !userId) {
      console.log('📁 [MapGenerator] Not logged in, returning empty project list');
      setProjects([]);
      return;
    }

    console.log('📁 [MapGenerator] Fetching project list');
    setIsLoadingProjects(true);

    try {
      const response = await fetch(`${DUNGEONMIND_API_URL}/api/mapgenerator/projects`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`List projects failed: ${response.statusText}`);
      }

      const result = await response.json();
      const projectList = result.projects || [];

      console.log('📁 [MapGenerator] Projects fetched:', projectList.length);
      setProjects(projectList);
    } catch (err) {
      console.error('📁 [MapGenerator] Failed to list projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to list projects');
      setProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [isLoggedIn, userId]);

  const createProject = useCallback(async (name: string): Promise<string> => {
    if (!isLoggedIn || !userId) {
      throw new Error('Authentication required to create projects');
    }

    console.log('📁 [MapGenerator] Creating new project:', name);

    // Re-enable auto-save
    skipAutoSaveRef.current = false;
    lastSavedContentHashRef.current = '';

    try {
      const response = await fetch(`${DUNGEONMIND_API_URL}/api/mapgenerator/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          base_image_url: baseImageUrl || '',
          grid_config: mapCanvas.gridConfig,
          scale_metadata: scaleMetadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`Create project failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📁 [MapGenerator] Project created:', result.id);

      // Update state (backend returns camelCase)
      setProjectId(result.id);
      setProjectName(result.name || name);
      setBaseImageUrl(result.baseImageUrl || baseImageUrl);
      if (result.gridConfig) {
        mapCanvas.setGridConfig(result.gridConfig);
      }
      if (result.scaleMetadata) {
        setScaleMetadata(result.scaleMetadata);
      }
      if (result.labels) {
        // Replace all labels at once
        mapCanvas.setLabels(result.labels);
      }

      // New project starts with empty gallery
      setGeneratedImages([]);
      console.log('📁 [MapGenerator] New project - cleared generated images');

      // Refresh projects list
      await listProjects();

      return result.id;
    } catch (err) {
      console.error('📁 [MapGenerator] Failed to create project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    }
  }, [isLoggedIn, userId, baseImageUrl, mapCanvas, scaleMetadata, listProjects]);

  const loadProject = useCallback(async (projectId: string): Promise<void> => {
    if (!isLoggedIn || !userId) {
      throw new Error('Authentication required to load projects');
    }

    console.log('📁 [MapGenerator] Loading project:', projectId);
    setIsLoadingProject(true);
    setError(null);

    // Re-enable auto-save
    skipAutoSaveRef.current = false;
    lastSavedContentHashRef.current = '';

    try {
      const response = await fetch(`${DUNGEONMIND_API_URL}/api/mapgenerator/projects/${projectId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Load project failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📁 [MapGenerator] Project loaded:', result.name);

      // Update all state from loaded project (backend returns camelCase)
      setProjectId(result.id);
      setProjectName(result.name);
      setBaseImageUrl(result.baseImageUrl || '');
      if (result.gridConfig) {
        mapCanvas.setGridConfig(result.gridConfig);
      }
      if (result.scaleMetadata) {
        setScaleMetadata(result.scaleMetadata);
      } else {
        setScaleMetadata(null);
      }
      // Replace all labels (or clear if none in project)
      mapCanvas.setLabels(result.labels || []);
      
      // Load generated images from project
      const projectImages = result.generatedImages || [];
      console.log(`📸 [MapGenerator] Loaded ${projectImages.length} generated images from project`);
      setGeneratedImages(projectImages);

      setError(null);
    } catch (err) {
      console.error('📁 [MapGenerator] Failed to load project:', err);
      setError(err instanceof Error ? err.message : 'Failed to load project');
      throw err;
    } finally {
      setIsLoadingProject(false);
    }
  }, [isLoggedIn, userId, mapCanvas]);

  // On page load/refresh: if we already have a projectId (e.g. restored from localStorage),
  // hydrate full project state (including generatedImages) from backend so Project Gallery isn't blank.
  useEffect(() => {
    if (!isLoggedIn || !userId) return;
    if (!projectId) return;
    if (isLoadingProject) return;
    if (lastHydratedProjectIdRef.current === projectId) return;

    console.log('🔄 [MapGenerator] Hydrating current project on load:', projectId);

    (async () => {
      try {
        await loadProject(projectId);
        lastHydratedProjectIdRef.current = projectId;
        console.log('✅ [MapGenerator] Project hydration complete:', projectId);
      } catch (err) {
        console.warn('⚠️ [MapGenerator] Project hydration failed:', err);
      }
    })();
  }, [isLoggedIn, userId, projectId, isLoadingProject, loadProject]);

  const deleteProject = useCallback(async (projectIdToDelete: string): Promise<void> => {
    if (!isLoggedIn || !userId) {
      throw new Error('Authentication required to delete projects');
    }

    console.log('📁 [MapGenerator] Deleting project:', projectIdToDelete);

    try {
      const response = await fetch(`${DUNGEONMIND_API_URL}/api/mapgenerator/projects/${projectIdToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Delete project failed: ${response.statusText}`);
      }

      console.log('📁 [MapGenerator] Project deleted:', projectIdToDelete);

      // If deleting current project, reset state
      setProjectId(prevId => {
        if (prevId === projectIdToDelete) {
          setProjectName('Untitled Map');
          skipAutoSaveRef.current = true;
          lastSavedContentHashRef.current = '';

          // Re-enable auto-save after 5 seconds
          setTimeout(() => {
            skipAutoSaveRef.current = false;
            console.log('📁 [MapGenerator] Auto-save re-enabled after deletion cooldown');
          }, 5000);
          return null;
        }
        return prevId;
      });

      // Refresh projects list
      await listProjects();
    } catch (err) {
      console.error('📁 [MapGenerator] Failed to delete project:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      throw err;
    }
  }, [isLoggedIn, userId, listProjects]);

  const renameProject = useCallback(async (projectIdToRename: string, newName: string): Promise<void> => {
    if (!isLoggedIn || !userId) {
      throw new Error('Authentication required to rename projects');
    }

    console.log('📁 [MapGenerator] Renaming project:', projectIdToRename, 'to:', newName);

    try {
      const response = await fetch(`${DUNGEONMIND_API_URL}/api/mapgenerator/projects/${projectIdToRename}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error(`Rename project failed: ${response.statusText}`);
      }

      console.log('✅ [MapGenerator] Project renamed');

      // If renaming current project, update local state
      if (projectIdToRename === projectId) {
        setProjectName(newName);
      }

      // Refresh projects list to show new name
      await listProjects();
    } catch (err) {
      console.error('❌ [MapGenerator] Failed to rename project:', err);
      setError(err instanceof Error ? err.message : 'Failed to rename project');
      throw err;
    }
  }, [isLoggedIn, userId, projectId, listProjects]);

  const refreshProjects = useCallback(async (): Promise<void> => {
    await listProjects();
  }, [listProjects]);

  // =============================================================================
  // Auto-save Logic
  // =============================================================================

  const saveNow = useCallback(async (): Promise<void> => {
    if (!isLoggedIn || !userId || !projectId) {
      console.log('⏭️ [MapGenerator] Skipping save - not logged in or no project ID', {
        isLoggedIn,
        userId: userId ? `${userId.substring(0, 8)}...` : null,
        projectId: projectId || null,
      });
      return;
    }

    if (skipAutoSaveRef.current) {
      console.log('⏭️ [MapGenerator] Skipping save - auto-save disabled');
      return;
    }

    // Build content hash to prevent duplicate saves
    const contentToHash = JSON.stringify({
      baseImageUrl,
      gridConfig: mapCanvas.gridConfig,
      labels: mapCanvas.labels,
      scaleMetadata,
      generatedImages: generatedImages.map(img => img.id), // Only use IDs for hash
    });

    if (contentToHash === lastSavedContentHashRef.current) {
      console.log('⏭️ [MapGenerator] Skipping save - no changes detected');
      return;
    }

    console.log('💾 [MapGenerator] Saving project:', projectId, `with ${generatedImages.length} images`);
    setSaveStatus('saving');

    try {
      const response = await fetch(`${DUNGEONMIND_API_URL}/api/mapgenerator/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: projectName,
          base_image_url: baseImageUrl,
          grid_config: mapCanvas.gridConfig,
          labels: mapCanvas.labels,
          scale_metadata: scaleMetadata,
          generated_images: generatedImages.map(img => ({
            id: img.id,
            url: img.url,
            prompt: img.prompt,
            created_at: img.createdAt,
            session_id: img.sessionId,
            service: img.service,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.statusText}`);
      }

      console.log('✅ [MapGenerator] Project saved');
      setSaveStatus('saved');
      lastSavedContentHashRef.current = contentToHash;

      // Reset to idle after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('❌ [MapGenerator] Failed to save project:', err);
      setSaveStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to save project');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  }, [isLoggedIn, userId, projectId, baseImageUrl, projectName, mapCanvas, scaleMetadata, generatedImages]);

  // Auto-save effect (debounced)
  useEffect(() => {
    if (!isLoggedIn || !userId || !projectId || skipAutoSaveRef.current) {
      return;
    }

    // Clear existing timer
    if (debouncedSaveTimerRef.current) {
      clearTimeout(debouncedSaveTimerRef.current);
    }

    // If an image was just added, persist immediately (users often refresh right after)
    if (immediateSaveRequestedRef.current) {
      immediateSaveRequestedRef.current = false;
      void saveNow();
      return;
    }

    // Set new timer (3 second debounce)
    debouncedSaveTimerRef.current = setTimeout(() => {
      saveNow();
    }, 3000);

    return () => {
      if (debouncedSaveTimerRef.current) {
        clearTimeout(debouncedSaveTimerRef.current);
      }
    };
  }, [isLoggedIn, userId, projectId, baseImageUrl, mapCanvas.gridConfig, mapCanvas.labels, scaleMetadata, generatedImages, saveNow]);

  // Load projects when drawer opens
  useEffect(() => {
    if (projectsDrawerOpen && isLoggedIn) {
      listProjects();
    }
  }, [projectsDrawerOpen, isLoggedIn, listProjects]);

  // =============================================================================
  // localStorage Persistence (for demo/guest mode)
  // =============================================================================

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALSTORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const ageMinutes = (Date.now() - parsed.timestamp) / 1000 / 60;

        // Only restore if recent (within 24 hours)
        if (ageMinutes < 24 * 60) {
          console.log(`🔄 [MapGenerator] Restoring from localStorage (${ageMinutes.toFixed(1)} min old)`);
          isRestoringStateRef.current = true;

          // Restore state
          console.log('🔄 [MapGenerator] localStorage data:', {
            hasProjectId: !!parsed.projectId,
            projectId: parsed.projectId || null,
            projectName: parsed.projectName,
          });
          if (parsed.projectId) {
            setProjectId(parsed.projectId);
          }
          if (parsed.baseImageUrl) {
            setBaseImageUrl(parsed.baseImageUrl);
          }
          if (parsed.projectName) {
            setProjectName(parsed.projectName);
          }
          if (parsed.gridConfig) {
            mapCanvas.setGridConfig(parsed.gridConfig);
          }
          if (parsed.labels && Array.isArray(parsed.labels)) {
            // Replace all labels at once (prevents duplication on StrictMode double-render)
            mapCanvas.setLabels(parsed.labels);
          }
          if (parsed.scaleMetadata) {
            setScaleMetadata(parsed.scaleMetadata);
          }
          if (parsed.view) {
            mapCanvas.setView(parsed.view);
          }

          console.log(`✅ [MapGenerator] Restored state from localStorage`);

          // Small delay before allowing saves again
          setTimeout(() => {
            isRestoringStateRef.current = false;
            initialLoadCompleteRef.current = true;
          }, 100);
        } else {
          console.log(`⏭️ [MapGenerator] localStorage data too old (${ageMinutes.toFixed(1)} min), skipping restore`);
          initialLoadCompleteRef.current = true;
        }
      } else {
        console.log(`📝 [MapGenerator] No saved state in localStorage`);
        initialLoadCompleteRef.current = true;
      }
    } catch (err) {
      console.error('❌ [MapGenerator] Failed to restore from localStorage:', err);
      initialLoadCompleteRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Save to localStorage on state changes (debounced)
  useEffect(() => {
    // Don't save during initial restoration
    if (isRestoringStateRef.current || !initialLoadCompleteRef.current) {
      return;
    }

    const saveToLocalStorage = () => {
      try {
        const stateSnapshot = {
          timestamp: Date.now(),
          projectId,
          baseImageUrl,
          projectName,
          gridConfig: mapCanvas.gridConfig,
          labels: mapCanvas.labels,
          scaleMetadata,
          view: mapCanvas.view,
        };
        const serialized = JSON.stringify(stateSnapshot);
        localStorage.setItem(LOCALSTORAGE_KEY, serialized);
        console.log(`💾 [MapGenerator] Saved to localStorage (${(serialized.length / 1024).toFixed(2)} KB, projectId: ${projectId || 'none'})`);
      } catch (err) {
        console.error('❌ [MapGenerator] Failed to save to localStorage:', err);
      }
    };

    // Debounce the save (2 second delay)
    const timeoutId = setTimeout(saveToLocalStorage, 2000);

    return () => clearTimeout(timeoutId);
  }, [projectId, baseImageUrl, projectName, mapCanvas.gridConfig, mapCanvas.labels, scaleMetadata, mapCanvas.view]);

  // Save to localStorage on beforeunload (immediate)
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        const stateSnapshot = {
          timestamp: Date.now(),
          projectId,
          baseImageUrl,
          projectName,
          gridConfig: mapCanvas.gridConfig,
          labels: mapCanvas.labels,
          scaleMetadata,
          view: mapCanvas.view,
        };
        const serialized = JSON.stringify(stateSnapshot);
        localStorage.setItem(LOCALSTORAGE_KEY, serialized);
        console.log(`🚪 [MapGenerator] beforeunload: Saved to localStorage (${(serialized.length / 1024).toFixed(2)} KB, projectId: ${projectId || 'none'})`);
      } catch (err) {
        console.error('🚪 [MapGenerator] beforeunload: Failed to save:', err);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [projectId, baseImageUrl, projectName, mapCanvas.gridConfig, mapCanvas.labels, scaleMetadata, mapCanvas.view]);

  // Context value
  const value: MapGeneratorContextValue = {
    // Spread map canvas state and actions (includes fitToViewport)
    ...mapCanvas,

    // Additional state
    baseImageUrl,
    projectName,
    projectId,
    isLoading,
    error,
    scaleMetadata,
    lastCompiledPrompt,
    lastMapspec,
        lastGenerationInput,

    // Projects state
    projects,
    isLoadingProjects,
    isLoadingProject,
    
    // Generated images (project gallery)
    generatedImages,

    // Drawer state
    generationDrawerOpen,
    projectsDrawerOpen,

    // Label placement state
    labelsVisible,
    isPlacingLabel,

    // Mask state (T165-T168)
    maskConfig,
    maskDrawingState: maskDrawing.state,
    maskStrokes: maskDrawing.state.strokes,
    maskCurrentStroke: maskDrawing.state.currentStroke,

    // Actions
    setBaseImageUrl,
    setProjectName,
    setError,
    setScaleMetadata,

    // Drawer actions
    openGenerationDrawer,
    closeGenerationDrawer,
    openProjectsDrawer,
    closeProjectsDrawer,

    // Label actions
    setLabelsVisible,
    setIsPlacingLabel,
    clearAllLabels,

    // Mask actions (T166-T168)
    toggleMaskMode,
    setMaskEnabled,
    setMaskBrushSize,
    setMaskTool,
    setMaskData,
    clearMask,

    // Mask drawing actions
    startMaskStroke: maskDrawing.actions.startStroke,
    continueMaskStroke: maskDrawing.actions.continueStroke,
    endMaskStroke: maskDrawing.actions.endStroke,
    addMaskShape: maskDrawing.actions.addShape,
    undoMask: maskDrawing.actions.undo,
    redoMask: maskDrawing.actions.redo,
    canUndoMask: maskDrawing.actions.canUndo,
    canRedoMask: maskDrawing.actions.canRedo,

    // Generation callback
    handleGenerationComplete,

    // Project CRUD operations
    listProjects,
    createProject,
    loadProject,
    deleteProject,
    renameProject,
    refreshProjects,

    // Save operations
    saveNow,
    saveStatus,
    
    // Generated images actions
    addGeneratedImage,
    setGeneratedImages,
  };

  return (
    <MapGeneratorContext.Provider value={value}>
      {children}
    </MapGeneratorContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useMapGenerator(): MapGeneratorContextValue {
  const context = useContext(MapGeneratorContext);

  if (!context) {
    throw new Error('useMapGenerator must be used within a MapGeneratorProvider');
  }

  return context;
}

// Alias for tests (T165-T168)
export const useMapGeneratorContext = useMapGenerator;

export default MapGeneratorProvider;
