/**
 * Map Generator Examples
 * 
 * Diverse biome examples for quick-fill functionality.
 * Each example includes a prompt and style options.
 */

import type { MapGenerationInput, MapStyleOptions } from './mapTypes';
import { DEFAULT_STYLE_OPTIONS } from './mapTypes';

export interface MapExample {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  styleOptions: MapStyleOptions;
}

export const MAP_EXAMPLES: MapExample[] = [
  // Forest
  {
    id: 'forest',
    name: 'Forest',
    icon: '🌲',
    prompt: 'A forest clearing at the moment of transition, where settled ground loosens into rising roots and layered undergrowth. Paths curve naturally through the trees, with subtle motion through patterns like gently offset root lines and drifting leaf clusters.',
    styleOptions: {
      ...DEFAULT_STYLE_OPTIONS,
      tone: 'neutral',
      movementSpace: 'mixed',
      coverDensity: 'medium',
      pathways: 'organic',
    },
  },
  // Dungeon
  {
    id: 'dungeon',
    name: 'Dungeon',
    icon: '🏰',
    prompt: 'An ancient stone dungeon corridor with heavy flagstone floors and torch sconces along the walls. Doorways lead to side chambers, rubble partially blocks some passages, and worn steps descend into shadow. Moisture stains the walls where underground water seeps through.',
    styleOptions: {
      ...DEFAULT_STYLE_OPTIONS,
      tone: 'gritty',
      movementSpace: 'tight',
      coverDensity: 'medium',
      pathways: 'linear',
      fantasyLevel: 'medium',
    },
  },
  // Coast
  {
    id: 'coast',
    name: 'Coast',
    icon: '🏝️',
    prompt: 'A rocky coastline where tide pools and sandy beaches meet weathered cliffs. Driftwood and seaweed mark the high tide line, scattered boulders provide natural cover, and a narrow path winds up the cliff face to a small overlook.',
    styleOptions: {
      ...DEFAULT_STYLE_OPTIONS,
      tone: 'neutral',
      movementSpace: 'open',
      coverDensity: 'light',
      temperature: 'cool',
      pathways: 'organic',
    },
  },
  // Cave
  {
    id: 'cave',
    name: 'Cave',
    icon: '⛰️',
    prompt: 'A natural cave system with stalactites and stalagmites creating natural columns. Underground pools reflect dim light, narrow passages connect larger chambers, and ancient rock formations create multiple levels of elevation.',
    styleOptions: {
      ...DEFAULT_STYLE_OPTIONS,
      tone: 'gritty',
      movementSpace: 'tight',
      coverDensity: 'heavy',
      fantasyLevel: 'low',
      elevationPresent: true,
      contrast: 'high',
    },
  },
  // Town
  {
    id: 'town',
    name: 'Town',
    icon: '🏘️',
    prompt: 'A bustling town square with cobblestone streets radiating outward. Market stalls line the edges, a central fountain provides a gathering point, and narrow alleyways lead between timber-framed buildings. Crates and barrels cluster near shop entrances.',
    styleOptions: {
      ...DEFAULT_STYLE_OPTIONS,
      tone: 'neutral',
      movementSpace: 'mixed',
      coverDensity: 'medium',
      pathways: 'radial',
      scale: 'small_area',
    },
  },
  // Ruins
  {
    id: 'ruins',
    name: 'Ruins',
    icon: '🌋',
    prompt: 'Ancient temple ruins overtaken by nature. Crumbled stone columns cast long shadows, vine-covered walls frame a central altar space, and broken statues watch from moss-covered pedestals. The floor shows traces of geometric patterns beneath the debris.',
    styleOptions: {
      ...DEFAULT_STYLE_OPTIONS,
      tone: 'neutral',
      movementSpace: 'mixed',
      coverDensity: 'heavy',
      fantasyLevel: 'medium',
      textureDensity: 'medium',
    },
  },
  // Arctic
  {
    id: 'arctic',
    name: 'Arctic',
    icon: '❄️',
    prompt: 'A frozen tundra landscape with ice formations and snow drifts. Cracks in the ice reveal dark water below, scattered boulders break through the snow, and a frozen stream bed cuts across the terrain. Wind-carved snow creates natural barriers.',
    styleOptions: {
      ...DEFAULT_STYLE_OPTIONS,
      tone: 'gritty',
      movementSpace: 'open',
      coverDensity: 'light',
      temperature: 'cool',
      saturation: 'muted',
      contrast: 'high',
    },
  },
  // Desert
  {
    id: 'desert',
    name: 'Desert',
    icon: '🏜️',
    prompt: 'A sun-baked desert canyon with towering sandstone walls and scattered rock formations. An ancient dry riverbed winds through the canyon floor, small caves dot the cliff faces, and wind-blown sand creates rippling dunes in sheltered areas.',
    styleOptions: {
      ...DEFAULT_STYLE_OPTIONS,
      tone: 'neutral',
      movementSpace: 'open',
      coverDensity: 'light',
      temperature: 'warm',
      saturation: 'balanced',
      pathways: 'organic',
    },
  },
];

/**
 * Get a map example by ID
 */
export function getExampleById(id: string): MapExample | undefined {
  return MAP_EXAMPLES.find((ex) => ex.id === id);
}

/**
 * Convert a MapExample to MapGenerationInput
 */
export function exampleToInput(example: MapExample): MapGenerationInput {
  return {
    prompt: example.prompt,
    styleOptions: example.styleOptions,
  };
}
