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
    DnD5eRace 
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
 * Create a test D&D 5e character with optional overrides
 */
export const createTestDnD5eCharacter = (overrides?: Partial<DnD5eCharacter>): DnD5eCharacter => {
    const base = createEmptyDnD5eCharacter();
    
    return {
        ...base,
        ...overrides
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

