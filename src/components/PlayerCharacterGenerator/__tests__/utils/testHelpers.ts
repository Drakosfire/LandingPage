/**
 * Test helper utilities
 * 
 * Factory functions for creating test data.
 * 
 * @module CharacterGenerator/__tests__/utils
 */

import {
    Character,
    createEmptyCharacter,
    DnD5eCharacter,
    createEmptyDnD5eCharacter,
    DnD5eRace,
    DnD5eClassLevel,
    DnD5eProficiencies
} from '../../types';
import { HILL_DWARF } from '../../data/dnd5e/races';

/**
 * Create a test character with optional overrides
 */
export const createTestCharacter = (overrides?: Partial<Character>): Character => {
    const base = createEmptyCharacter();
    base.dnd5eData = createEmptyDnD5eCharacter();

    return {
        ...base,
        name: 'Test Character',
        ...overrides
    };
};

/**
 * Deep partial type for test creation
 */
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Create a test D&D 5e character with optional overrides
 * Deep merges race, classes, and proficiencies if provided as partial
 */
export const createTestDnD5eCharacter = (overrides?: DeepPartial<DnD5eCharacter>): DnD5eCharacter => {
    const base = createEmptyDnD5eCharacter();

    // Handle race merge
    let race = base.race;
    if (overrides?.race !== undefined) {
        race = createTestRace(overrides.race as Partial<DnD5eRace>);
    }

    // Handle classes merge
    let classes = base.classes;
    if (overrides?.classes !== undefined) {
        classes = (overrides.classes as Partial<DnD5eClassLevel>[]).map(cls => createTestClassLevel(cls));
    }

    // Handle proficiencies merge  
    let proficiencies = base.proficiencies;
    if (overrides?.proficiencies !== undefined) {
        proficiencies = createTestProficiencies(overrides.proficiencies as Partial<DnD5eProficiencies>);
    }

    // Handle armor separately (it's a complex object)
    let armor = base.armor;
    if ('armor' in (overrides || {})) {
        armor = overrides?.armor as DnD5eCharacter['armor'];
    }

    return {
        ...base,
        ...(overrides as Partial<DnD5eCharacter>),
        race,
        classes,
        proficiencies,
        armor
    };
};

/**
 * Create a test race with optional overrides
 */
export const createTestRace = (overrides?: Partial<DnD5eRace>): DnD5eRace => {
    return {
        id: 'test-race',
        name: 'Test Race',
        size: 'medium',
        speed: { walk: 30 },
        abilityBonuses: [{ ability: 'strength', bonus: 2 }],
        traits: [],
        languages: ['Common'],
        description: 'Test race for unit tests',
        source: 'TEST',
        ...overrides
    };
};

/**
 * Create a test class level with optional overrides
 */
export const createTestClassLevel = (overrides?: Partial<DnD5eClassLevel>): DnD5eClassLevel => {
    return {
        name: 'Fighter',
        level: 1,
        hitDie: 10,
        features: [],
        ...overrides
    };
};

/**
 * Create test proficiencies with optional overrides
 */
export const createTestProficiencies = (overrides?: Partial<DnD5eProficiencies>): DnD5eProficiencies => {
    return {
        skills: [],
        savingThrows: [],
        armor: [],
        weapons: [],
        tools: [],
        languages: ['Common'],
        ...overrides
    };
};

/**
 * Create a test character with Hill Dwarf race
 */
export const createHillDwarfCharacter = (): Character => {
    const character = createTestCharacter({
        name: 'Thorin Ironforge',
        level: 1
    });

    if (character.dnd5eData) {
        character.dnd5eData.race = HILL_DWARF;
        character.dnd5eData.abilityScores = {
            strength: 15,
            dexterity: 12,
            constitution: 16,
            intelligence: 10,
            wisdom: 13,
            charisma: 8
        };
    }

    return character;
};

// Placeholder test to prevent "no tests" error
// This file is a utility module, not a test suite
describe('Test Helpers', () => {
    it('should create a valid test character', () => {
        const character = createTestCharacter();
        expect(character).toBeDefined();
        expect(character.name).toBe('Test Character');
    });
});

