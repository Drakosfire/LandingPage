/**
 * Character Canvas Adapters
 * 
 * Domain-specific adapters for PlayerCharacterGenerator to work with @dungeonmind/canvas package.
 * These adapters provide character-specific knowledge that the generic Canvas library doesn't have.
 * 
 * @module PlayerCharacterGenerator/characterAdapters
 */

import type {
    DataResolver,
    ListNormalizer,
    HeightEstimator,
    MetadataExtractor,
    CanvasAdapters,
    ComponentDataSource,
    ComponentDataReference as BaseComponentDataReference,
} from 'dungeonmind-canvas';

// Extended ComponentDataReference type that includes 'character' type
// This will be available in dungeonmind-canvas after rebuild, but we define it locally for now
type ComponentDataReference =
    | BaseComponentDataReference
    | { type: 'character'; path: string; sourceId?: string };
import { createDefaultAdapters } from 'dungeonmind-canvas';
import type { DnD5eCharacter, DnD5eFeature } from './types/dnd5e/character.types';
import type { DnD5eEquipmentItem, DnD5eWeapon } from './types/dnd5e/equipment.types';
import type { Character } from './types/character.types';

// Type aliases for cleaner code
type CharacterFeature = DnD5eFeature;
type EquipmentItem = DnD5eEquipmentItem;
type Weapon = DnD5eWeapon;

// =============================================================================
// Constants for Height Estimation (Character-specific)
// =============================================================================

const SECTION_HEADER_HEIGHT_PX = 36;
const SECTION_CONTINUATION_HEADER_HEIGHT_PX = 28;
const ITEM_LINE_HEIGHT_PX = 20;
const ITEM_DESC_LINE_HEIGHT_PX = 16;
const AVG_CHARS_PER_LINE = 65; // Character sheets are narrower than statblocks
const LIST_ITEM_SPACING_PX = 6;
const MIN_LIST_ITEM_HEIGHT_PX = ITEM_LINE_HEIGHT_PX + ITEM_DESC_LINE_HEIGHT_PX;

// Component-specific heights
const ABILITY_SCORES_BLOCK_HEIGHT_PX = 160;
const COMBAT_STATS_BLOCK_HEIGHT_PX = 180;
const SAVES_SKILLS_BLOCK_HEIGHT_PX = 280;
const SPELLCASTING_HEADER_HEIGHT_PX = 80;
const SPELL_SLOT_ROW_HEIGHT_PX = 24;

// =============================================================================
// Data Resolver for Characters
// =============================================================================

const characterDataResolver: DataResolver = {
    resolveDataReference<T = unknown>(
        dataSources: ComponentDataSource[],
        dataRef: BaseComponentDataReference
    ): T | undefined {
        // Cast to our extended type that includes 'character'
        const ref = dataRef as ComponentDataReference;
        if (ref.type === 'character') {
            const source = dataSources.find((s) => s.type === 'character');
            if (source && typeof source.payload === 'object' && source.payload !== null) {
                const character = source.payload as Character;
                const charRef = ref as { type: 'character'; path: string };
                // Handle nested paths for dnd5eData
                if (charRef.path.startsWith('dnd5eData.')) {
                    const subPath = charRef.path.substring('dnd5eData.'.length);
                    const dnd5e = character.dnd5eData;
                    if (dnd5e) {
                        return (dnd5e as unknown as Record<string, unknown>)[subPath] as T | undefined;
                    }
                }
                return (character as unknown as Record<string, unknown>)[charRef.path] as T | undefined;
            }
        } else if (ref.type === 'custom') {
            const source = dataSources.find((s) => s.type === 'custom');
            if (source && typeof source.payload === 'object' && source.payload !== null) {
                const payload = source.payload as Record<string, unknown>;
                const customRef = ref as { type: 'custom'; key: string };
                return payload[customRef.key] as T | undefined;
            }
        }
        return undefined;
    },

    getPrimarySource<T = unknown>(dataSources: ComponentDataSource[], type: string): T | undefined {
        const source = dataSources.find((s) => s.type === type);
        return source?.payload as T | undefined;
    },
};

// =============================================================================
// List Normalizer for Characters
// =============================================================================

/**
 * Normalize list items for characters
 * Handles special cases like:
 * - Features (combining class features, racial features, background features)
 * - Equipment (weapons, armor, gear)
 * - Spells (cantrips + known/prepared spells)
 */
const characterListNormalizer: ListNormalizer = {
    normalizeListItems<T = unknown>(items: T[] | undefined | null): T[] {
        if (!items) return [];

        // If it's already an array, return it filtered
        if (Array.isArray(items)) {
            return items.filter(item => item !== null && item !== undefined);
        }

        // If it's an object, check for special structures
        if (typeof items === 'object') {
            const obj = items as Record<string, unknown>;

            // Handle spellcasting structure: { cantrips: [...], spellsKnown: [...] }
            if (obj.cantrips || obj.spellsKnown || obj.spellsPrepared) {
                const cantrips = (obj.cantrips as unknown[] ?? []).map((spell: unknown) => {
                    const s = spell as Record<string, unknown>;
                    return {
                        id: s.id ?? `cantrip-${(s.name as string)?.toLowerCase().replace(/\s+/g, '-')}`,
                        name: s.name,
                        level: 0,
                        ...s,
                    };
                });

                const knownSpells = (obj.spellsKnown as unknown[] ?? obj.spellsPrepared as unknown[] ?? []).map((spell: unknown) => {
                    const s = spell as Record<string, unknown>;
                    return {
                        id: s.id ?? `spell-${(s.name as string)?.toLowerCase().replace(/\s+/g, '-')}`,
                        ...s,
                    };
                });

                return [...cantrips, ...knownSpells] as T[];
            }
        }

        // Fallback: return empty array
        return [];
    },
};

// =============================================================================
// Height Estimator for Character Components
// =============================================================================

/**
 * Calculate number of text lines based on character count
 */
const lineCountFromText = (text: string | undefined, avgCharsPerLine: number): number => {
    if (!text) return 0;
    const length = text.length;
    if (length <= 0) return 0;
    return Math.ceil(length / avgCharsPerLine);
};

/**
 * Estimate height of a single Feature item
 */
const estimateFeatureHeight = (feature: CharacterFeature): number => {
    // Name/header
    let height = ITEM_LINE_HEIGHT_PX;

    // Source line (if present)
    if (feature.sourceDetails) {
        height += ITEM_DESC_LINE_HEIGHT_PX;
    }

    // Description (estimate based on length)
    if (feature.description) {
        const lines = lineCountFromText(feature.description, AVG_CHARS_PER_LINE);
        height += lines * ITEM_DESC_LINE_HEIGHT_PX;
    }

    // Limited use (if present)
    if (feature.limitedUse) {
        height += ITEM_DESC_LINE_HEIGHT_PX;
    }

    return Math.max(height, MIN_LIST_ITEM_HEIGHT_PX);
};

/**
 * Estimate height of a single Equipment item
 */
const estimateEquipmentHeight = (item: EquipmentItem | Weapon): number => {
    let height = ITEM_LINE_HEIGHT_PX;

    // Weapon has extra details (damage, properties)
    if ('damage' in item && item.damage) {
        height += ITEM_DESC_LINE_HEIGHT_PX;
    }

    return height;
};

const characterHeightEstimator: HeightEstimator = {
    estimateItemHeight<T = unknown>(item: T): number {
        if (!item || typeof item !== 'object') {
            return MIN_LIST_ITEM_HEIGHT_PX;
        }

        // If it looks like a Feature, use Feature-specific estimation
        if ('name' in item && 'description' in item && 'source' in item) {
            return estimateFeatureHeight(item as unknown as CharacterFeature);
        }

        // If it looks like Equipment/Weapon
        if ('name' in item && 'type' in item) {
            return estimateEquipmentHeight(item as unknown as EquipmentItem | Weapon);
        }

        // Fallback
        return MIN_LIST_ITEM_HEIGHT_PX;
    },

    estimateListHeight<T = unknown>(items: T[], isContinuation: boolean): number {
        if (items.length === 0) return 0;

        // Header height (larger for first segment, smaller for continuations)
        const headerHeight = isContinuation ? SECTION_CONTINUATION_HEADER_HEIGHT_PX : SECTION_HEADER_HEIGHT_PX;

        // Sum item heights
        const itemsHeight = items.reduce((acc: number, item) => {
            return acc + this.estimateItemHeight(item);
        }, 0);

        // Spacing between items
        const spacingHeight = items.length > 1 ? (items.length - 1) * LIST_ITEM_SPACING_PX : 0;

        return headerHeight + itemsHeight + spacingHeight;
    },

    estimateComponentHeight<T = unknown>(component: T): number {
        if (!component || typeof component !== 'object') {
            return 200;
        }

        const comp = component as Record<string, unknown>;
        const type = comp.type as string | undefined;

        // Return type-specific estimates
        switch (type) {
            case 'ability-scores':
                return ABILITY_SCORES_BLOCK_HEIGHT_PX;
            case 'combat-stats':
                return COMBAT_STATS_BLOCK_HEIGHT_PX;
            case 'saves-skills':
                return SAVES_SKILLS_BLOCK_HEIGHT_PX;
            case 'spellcasting':
                // Base header + estimate for spell levels
                return SPELLCASTING_HEADER_HEIGHT_PX + (9 * SPELL_SLOT_ROW_HEIGHT_PX);
            default:
                return 200;
        }
    },
};

// =============================================================================
// Metadata Extractor for Characters
// =============================================================================

const characterMetadataExtractor: MetadataExtractor = {
    extractDisplayName(dataSources: ComponentDataSource[]): string | undefined {
        const character = dataSources.find((s) => s.type === 'character')?.payload as Character | undefined;
        return character?.name || 'Unnamed Character';
    },

    extractExportMetadata(dataSources: ComponentDataSource[]): Record<string, unknown> {
        const character = dataSources.find((s) => s.type === 'character')?.payload as Character | undefined;

        if (!character) {
            return {};
        }

        const dnd5e = character.dnd5eData;
        return {
            name: character.name,
            level: character.level,
            race: dnd5e?.race?.name,
            class: dnd5e?.classes?.[0]?.name,
            background: dnd5e?.background?.name,
        };
    },
};

// =============================================================================
// Component Type Mapping for Characters
// =============================================================================

/**
 * Maps character component types to their region list kinds
 * This tells Canvas which components should be treated as list components
 * and what kind of list content they represent
 */
const CHARACTER_COMPONENT_TYPE_MAP: Record<string, string | undefined> = {
    'character-header': undefined, // Block component (not a list)
    'ability-scores': undefined,   // Block component
    'combat-stats': undefined,     // Block component
    'saves-skills': undefined,     // Block component
    'features': 'feature-list',    // List component
    'equipment': 'equipment-list', // List component
    'spellcasting': 'spell-list',  // List component (for spell lists within)
    'proficiencies': undefined,    // Block component
    'background': undefined,       // Block component
};

// =============================================================================
// Complete Adapter Bundle for Characters
// =============================================================================

/**
 * Create complete adapter bundle for PlayerCharacterGenerator
 * 
 * This provides all the domain-specific knowledge needed for Canvas to work
 * with D&D 5e character sheets.
 * 
 * @returns Complete CanvasAdapters bundle configured for characters
 */
export const createCharacterAdapters = (): CanvasAdapters => {
    // Get default adapters for region content factory
    const defaults = createDefaultAdapters();

    return {
        // Character-specific data resolver
        dataResolver: characterDataResolver,

        // Character-specific list normalizer (handles nested features, spell combination)
        listNormalizer: characterListNormalizer,

        // Use default region content factory (generic content creation works)
        regionContentFactory: defaults.regionContentFactory,

        // Character-specific height estimator (knows about Feature, Equipment types)
        heightEstimator: characterHeightEstimator,

        // Character-specific metadata extractor (knows how to get character name/level)
        metadataExtractor: characterMetadataExtractor,

        // Character component type mapping
        componentTypeMap: CHARACTER_COMPONENT_TYPE_MAP,
    };
};

/**
 * Export individual adapters for testing or custom bundles
 */
export {
    characterDataResolver,
    characterListNormalizer,
    characterHeightEstimator,
    characterMetadataExtractor,
    CHARACTER_COMPONENT_TYPE_MAP,
};

