/**
 * Statblock Canvas Adapters
 * 
 * Domain-specific adapters for StatblockGenerator to work with @dungeonmind/canvas package.
 * These adapters provide statblock-specific knowledge that the generic Canvas library doesn't have.
 */

// Canvas package imports (using npm linked @dungeonmind/canvas)
import type {
    DataResolver,
    ListNormalizer,
    HeightEstimator,
    MetadataExtractor,
    CanvasAdapters,
    ComponentDataSource,
    ComponentDataReference,
} from 'dungeonmind-canvas';
import { createDefaultAdapters } from 'dungeonmind-canvas';
import type { StatBlockDetails, Action } from '../../types/statblock.types';

// =============================================================================
// Constants for Height Estimation (Statblock-specific)
// =============================================================================

const ACTION_HEADER_HEIGHT_PX = 36;
const ACTION_CONTINUATION_HEADER_HEIGHT_PX = 28;
const ACTION_META_LINE_HEIGHT_PX = 16;
const ACTION_DESC_LINE_HEIGHT_PX = 18;
const ACTION_AVG_CHARS_PER_LINE = 75;
const LIST_ITEM_SPACING_PX = 8;
const MIN_LIST_ITEM_HEIGHT_PX = ACTION_HEADER_HEIGHT_PX + ACTION_DESC_LINE_HEIGHT_PX;

// =============================================================================
// Data Resolver for Statblocks
// =============================================================================

const statblockDataResolver: DataResolver = {
    resolveDataReference<T = unknown>(
        dataSources: ComponentDataSource[],
        dataRef: ComponentDataReference
    ): T | undefined {
        if (dataRef.type === 'statblock') {
            const source = dataSources.find((s) => s.type === 'statblock');
            if (source && typeof source.payload === 'object' && source.payload !== null) {
                const statblock = source.payload as StatBlockDetails;
                // Access statblock fields using path
                return (statblock as any)[dataRef.path] as T | undefined;
            }
        } else if (dataRef.type === 'custom') {
            const source = dataSources.find((s) => s.type === 'custom');
            if (source && typeof source.payload === 'object' && source.payload !== null) {
                const payload = source.payload as Record<string, unknown>;
                return payload[dataRef.key] as T | undefined;
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
// List Normalizer for Statblocks
// =============================================================================

/**
 * Normalize list items for statblocks
 * Handles special cases like:
 * - Nested actions (legendaryActions.actions, lairActions.actions)
 * - Spell lists (combining cantrips + knownSpells)
 * - Plain arrays (actions, traits, etc.)
 */
const statblockListNormalizer: ListNormalizer = {
    normalizeListItems<T = unknown>(items: T[] | undefined | null): T[] {
        if (!items) return [];

        // If it's already an array, return it
        if (Array.isArray(items)) {
            return items.filter(item => item !== null && item !== undefined);
        }

        // If it's an object, check for special structures
        if (typeof items === 'object') {
            const obj = items as any;

            // Handle legendaryActions/lairActions structure: { actions: [...], description: "..." }
            if (obj.actions && Array.isArray(obj.actions)) {
                return obj.actions.filter((item: any) => item !== null && item !== undefined);
            }

            // Handle spellcasting structure: { cantrips: [...], knownSpells: [...] }
            if (obj.cantrips || obj.knownSpells) {
                const cantrips = (obj.cantrips ?? []).map((spell: any) => ({
                    id: spell.id ?? `cantrip-${spell.name?.toLowerCase().replace(/\s+/g, '-')}`,
                    name: spell.name,
                    desc: spell.description ?? '',
                    level: spell.level ?? 0,
                    school: spell.school,
                    usage: spell.usage,
                }));

                const knownSpells = (obj.knownSpells ?? []).map((spell: any) => ({
                    id: spell.id ?? `spell-${spell.name?.toLowerCase().replace(/\s+/g, '-')}`,
                    name: spell.name,
                    desc: spell.description ?? '',
                    level: spell.level,
                    school: spell.school,
                    usage: spell.usage,
                }));

                return [...cantrips, ...knownSpells] as T[];
            }
        }

        // Fallback: return empty array
        return [];
    },
};

// =============================================================================
// Height Estimator for Statblock Actions
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
 * Estimate height of a single Action item
 */
const estimateActionHeight = (action: Action): number => {
    // Name/header
    let height = ACTION_HEADER_HEIGHT_PX;

    // Meta line (attack bonus, damage, DC, etc.)
    const hasMeta = action.attackBonus !== undefined ||
        action.damage !== undefined ||
        action.damageType !== undefined ||
        action.range !== undefined ||
        action.recharge !== undefined ||
        action.usage !== undefined;

    if (hasMeta) {
        height += ACTION_META_LINE_HEIGHT_PX;
    }

    // Description (estimate based on length)
    if (action.desc) {
        const lines = lineCountFromText(action.desc, ACTION_AVG_CHARS_PER_LINE);
        height += lines * ACTION_DESC_LINE_HEIGHT_PX;
    }

    return Math.max(height, MIN_LIST_ITEM_HEIGHT_PX);
};

const statblockHeightEstimator: HeightEstimator = {
    estimateItemHeight<T = unknown>(item: T): number {
        // Generic fallback for non-Action items
        if (!item || typeof item !== 'object') {
            return MIN_LIST_ITEM_HEIGHT_PX;
        }

        // If it looks like an Action, use Action-specific estimation
        if ('name' in item && 'desc' in item) {
            return estimateActionHeight(item as unknown as Action);
        }

        // Fallback
        return MIN_LIST_ITEM_HEIGHT_PX;
    },

    estimateListHeight<T = unknown>(items: T[], isContinuation: boolean): number {
        if (items.length === 0) return 0;

        // Header height (larger for first segment, smaller for continuations)
        const headerHeight = isContinuation ? ACTION_CONTINUATION_HEADER_HEIGHT_PX : ACTION_HEADER_HEIGHT_PX;

        // Sum item heights
        const itemsHeight = items.reduce((acc: number, item) => {
            return acc + this.estimateItemHeight(item);
        }, 0);

        // Spacing between items
        const spacingHeight = items.length > 1 ? (items.length - 1) * LIST_ITEM_SPACING_PX : 0;

        return headerHeight + itemsHeight + spacingHeight;
    },

    estimateComponentHeight<T = unknown>(): number {
        // Default component height when no better estimate
        return 200;
    },
};

// =============================================================================
// Metadata Extractor for Statblocks
// =============================================================================

const statblockMetadataExtractor: MetadataExtractor = {
    extractDisplayName(dataSources: ComponentDataSource[]): string | undefined {
        const statblock = dataSources.find((s) => s.type === 'statblock')?.payload as StatBlockDetails | undefined;
        return statblock?.name || 'Untitled Statblock';
    },

    extractExportMetadata(dataSources: ComponentDataSource[]): Record<string, unknown> {
        const statblock = dataSources.find((s) => s.type === 'statblock')?.payload as StatBlockDetails | undefined;

        if (!statblock) {
            return {};
        }

        return {
            name: statblock.name,
            type: statblock.type,
            size: statblock.size,
            cr: statblock.challengeRating,
            alignment: statblock.alignment,
        };
    },
};

// =============================================================================
// Component Type Mapping for Statblocks
// =============================================================================

/**
 * Maps statblock component types to their region list kinds
 * This tells Canvas which components should be treated as list components
 * and what kind of list content they represent
 */
const STATBLOCK_COMPONENT_TYPE_MAP: Record<string, string | undefined> = {
    'action-section': 'action-list',
    'trait-list': 'trait-list',
    'bonus-action-section': 'bonus-action-list',
    'reaction-section': 'reaction-list',
    'legendary-actions': 'legendary-action-list',
    'lair-actions': 'lair-action-list',
    'spellcasting-block': 'spell-list',
};

// =============================================================================
// Complete Adapter Bundle for Statblocks
// =============================================================================

/**
 * Create complete adapter bundle for StatblockGenerator
 * 
 * This provides all the domain-specific knowledge needed for Canvas to work
 * with D&D 5e statblocks.
 * 
 * @returns Complete CanvasAdapters bundle configured for statblocks
 */
export const createStatblockAdapters = (): CanvasAdapters => {
    // Get default adapters for region content factory
    const defaults = createDefaultAdapters();

    return {
        // Statblock-specific data resolver
        dataResolver: statblockDataResolver,

        // Statblock-specific list normalizer (handles nested actions, spell combination)
        listNormalizer: statblockListNormalizer,

        // Use default region content factory (generic content creation works)
        regionContentFactory: defaults.regionContentFactory,

        // Statblock-specific height estimator (knows about Action type)
        heightEstimator: statblockHeightEstimator,

        // Statblock-specific metadata extractor (knows how to get creature name)
        metadataExtractor: statblockMetadataExtractor,

        // Statblock component type mapping
        componentTypeMap: STATBLOCK_COMPONENT_TYPE_MAP,
    };
};

/**
 * Export individual adapters for testing or custom bundles
 */
export {
    statblockDataResolver,
    statblockListNormalizer,
    statblockHeightEstimator,
    statblockMetadataExtractor,
};

