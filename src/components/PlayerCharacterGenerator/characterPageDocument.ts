/**
 * Character Page Document Builder
 * 
 * Creates page documents for character sheets using the Canvas package's
 * data structures. This enables Canvas's measurement and pagination system.
 * 
 * @module PlayerCharacterGenerator/characterPageDocument
 */

import type {
    ComponentInstance,
    ComponentDataSource,
    TemplateConfig,
    PageVariables,
} from 'dungeonmind-canvas';
import type { Character } from './types/character.types';
import { DEFAULT_CHARACTER_TEMPLATE } from './characterTemplates';

/**
 * Character page document structure
 */
export interface CharacterPageDocument {
    id: string;
    templateId: string;
    pageVariables: PageVariables;
    componentInstances: ComponentInstance[];
    dataSources: ComponentDataSource[];
    metadata: {
        characterId: string;
        characterName: string;
        createdAt: string;
        updatedAt: string;
    };
}

/**
 * Determine which components should be included based on character data
 */
function getActiveComponents(character: Character): string[] {
    const dnd5e = character.dnd5eData;
    if (!dnd5e) return ['character-header'];

    const components: string[] = [
        'character-header',
        'ability-scores',
        'saves-skills',
        'combat-stats',
    ];

    // Add attacks if character has weapons
    if (dnd5e.weapons && dnd5e.weapons.length > 0) {
        components.push('attacks');
    }

    // Always include these on page 2
    components.push('proficiencies');
    components.push('features');
    components.push('equipment');
    components.push('background');

    // Add spellcasting if character is a caster
    if (dnd5e.spellcasting) {
        components.push('spellcasting');
    }

    return components;
}

/**
 * Create component instances from character data
 */
function createComponentInstances(
    character: Character,
    template: TemplateConfig
): ComponentInstance[] {
    const activeComponents = getActiveComponents(character);

    return activeComponents.map((type, index) => {
        // Find the template's default component config
        const defaultComponent = template.defaultComponents?.find(c => c.componentType === type);

        return {
            id: `character-${type}-${index}`,
            type,
            dataRef: defaultComponent?.defaultDataRef ?? { type: 'statblock', path: '.' },
            layout: {
                isVisible: true,
                slotId: defaultComponent?.slotId,
            },
            variables: defaultComponent?.defaultVariables,
        };
    });
}

/**
 * Create data sources for character page
 */
function createDataSources(character: Character): ComponentDataSource[] {
    const now = new Date().toISOString();

    return [
        {
            id: 'character-source',
            type: 'character',
            payload: character,
            updatedAt: now,
        },
    ];
}

/**
 * Build a character page document for Canvas rendering
 * 
 * @param options - Build options
 * @returns Character page document
 */
export function buildCharacterPageDocument(options: {
    character: Character;
    template?: TemplateConfig;
}): CharacterPageDocument {
    const { character, template = DEFAULT_CHARACTER_TEMPLATE } = options;
    const now = new Date().toISOString();

    const componentInstances = createComponentInstances(character, template);
    const dataSources = createDataSources(character);

    return {
        id: `character-page-${character.id}`,
        templateId: template.id,
        pageVariables: {
            mode: template.defaultMode ?? 'locked',
            ...template.defaultPageVariables,
        },
        componentInstances,
        dataSources,
        metadata: {
            characterId: character.id,
            characterName: character.name,
            createdAt: now,
            updatedAt: now,
        },
    };
}

/**
 * Update data sources when character changes
 */
export function updateCharacterDataSources(
    pageDocument: CharacterPageDocument,
    character: Character
): CharacterPageDocument {
    const now = new Date().toISOString();

    return {
        ...pageDocument,
        dataSources: [
            {
                id: 'character-source',
                type: 'character',
                payload: character,
                updatedAt: now,
            },
        ],
        metadata: {
            ...pageDocument.metadata,
            characterName: character.name,
            updatedAt: now,
        },
    };
}

export default buildCharacterPageDocument;




