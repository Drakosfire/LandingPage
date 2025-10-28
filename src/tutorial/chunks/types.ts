import { CallBackProps } from 'react-joyride';

/**
 * TutorialState represents all UI and canvas state relevant to the tutorial.
 * This is used for state validation between chunks and determining chunk readiness.
 */
export interface TutorialState {
  // Canvas state
  canvas: 'empty' | 'hermione' | 'hermione-edited' | 'hermione-with-image';

  // UI state
  drawer: 'open' | 'closed';
  drawerTab: 'text' | 'image' | null;
  editMode: boolean;

  // Modal state (for image generation)
  imageModal: 'closed' | 'open' | 'navigated';
  selectedImageIndex: number;

  // Auth state (for tutorial mock login)
  mockAuth: boolean;
}

/**
 * Handler function type for step-specific logic within a chunk.
 * Called when Joyride fires callback for a step within this chunk.
 */
export type StepHandler = (data: CallBackProps) => Promise<void>;

/**
 * TutorialChunk represents a logical group of related tutorial steps.
 * Each chunk has explicit state requirements and provides clear state transitions.
 */
export interface TutorialChunk {
  // Metadata
  name: string;
  steps: string[];  // Step names from TUTORIAL_STEP_NAMES (e.g., 'welcome', 'text-tab', etc.)
  purpose: string;

  // State flow
  requiredState: Partial<TutorialState>;
  providesState: Partial<TutorialState>;

  // Lifecycle hooks
  setup: (state: TutorialState) => Promise<void>;
  cleanup: (state: TutorialState) => Promise<void>;

  // Step-specific handlers
  // Map from step name to handler function
  handlers: {
    [stepName: string]: StepHandler;
  };

  // Validation methods
  canStart: (state: TutorialState) => boolean;
  isComplete: (state: TutorialState) => boolean;
}

/**
 * Create an empty/default TutorialState for testing
 */
export const createEmptyState = (): TutorialState => ({
  canvas: 'empty',
  drawer: 'closed',
  drawerTab: null,
  editMode: false,
  imageModal: 'closed',
  selectedImageIndex: 0,
  mockAuth: false,
});

/**
 * Create a state with Hermione loaded
 */
export const createHermioneState = (): TutorialState => ({
  canvas: 'hermione',
  drawer: 'closed',
  drawerTab: null,
  editMode: false,
  imageModal: 'closed',
  selectedImageIndex: 0,
  mockAuth: false,
});

/**
 * Create a state with edited Hermione
 */
export const createHermioneEditedState = (): TutorialState => ({
  canvas: 'hermione-edited',
  drawer: 'closed',
  drawerTab: null,
  editMode: false,
  imageModal: 'closed',
  selectedImageIndex: 0,
  mockAuth: false,
});

/**
 * Merge partial state into existing state
 */
export const mergeState = (
  current: TutorialState,
  partial: Partial<TutorialState>
): TutorialState => ({
  ...current,
  ...partial,
});

/**
 * Check if two states are equivalent
 */
export const statesMatch = (
  expected: Partial<TutorialState>,
  actual: TutorialState
): boolean => {
  return Object.entries(expected).every(
    ([key, value]) => actual[key as keyof TutorialState] === value
  );
};

/**
 * Tutorial callback functions
 * These are provided by TutorialTour component and called by chunk handlers
 */
export interface TutorialCallbacks {
  onOpenGenerationDrawer?: () => void;
  onCloseGenerationDrawer?: () => void;
  onToggleEditMode?: (enabled: boolean) => void;
  onSimulateTyping?: (targetSelector: string, text: string) => Promise<void>;
  onTutorialCheckbox?: (selector: string) => Promise<void>;
  onTutorialClickButton?: (selector: string) => Promise<void>;
  onTutorialEditText?: (targetSelector: string, newText: string) => Promise<void>;
  onSwitchDrawerTab?: (tab: 'text' | 'image') => void;
  onSwitchImageTab?: (tab: 'generate' | 'upload' | 'project' | 'library') => void;
  onSetGenerationCompleteCallback?: (callback: (() => void) | null) => void;
  onSetMockAuthState?: (enabled: boolean) => void;
}
