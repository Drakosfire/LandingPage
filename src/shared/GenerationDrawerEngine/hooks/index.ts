/**
 * Generation Drawer Engine - Hook Exports
 */

export { useGeneration } from './useGeneration';
export type { UseGenerationConfig, UseGenerationReturn } from './useGeneration';

export { useProgress } from './useProgress';
export { useImageLibrary } from './useImageLibrary';
export type { UseImageLibraryConfig, UseImageLibraryReturn } from './useImageLibrary';

export { useGenerationTimeTracking, trackGenerationTime, getRecommendedEstimatedMs } from './useGenerationTimeTracking';
export type { 
  UseGenerationTimeTrackingConfig, 
  UseGenerationTimeTrackingReturn, 
  GenerationTimeStats, 
  GenerationTimeRecord 
} from './useGenerationTimeTracking';
export type { UseProgressReturn } from './useProgress';

export { useBackendHealth } from './useBackendHealth';
export type { ServiceHealth, BackendHealthState, UseBackendHealthReturn } from './useBackendHealth';

export { useImageCapabilities } from './useImageCapabilities';
export type { ImageCapabilities, UseImageCapabilitiesConfig, UseImageCapabilitiesReturn } from './useImageCapabilities';

