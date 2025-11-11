/**
 * Character types tests
 * 
 * Tests for system-agnostic character wrapper types.
 * 
 * @module CharacterGenerator/__tests__/types
 */

import '../setup';
import { 
    Character, 
    createEmptyCharacter,
    isDnD5eCharacter,
    getDnD5eData,
    createEmptyDnD5eCharacter
} from '../../types';

describe('Character Wrapper Types', () => {
    describe('createEmptyCharacter', () => {
        it('should create valid empty character', () => {
            const character = createEmptyCharacter();
            
            expect(character).toBeValidCharacter();
            expect(character.name).toBe('New Character');
            expect(character.level).toBe(1);
            expect(character.system).toBe('dnd5e');
            expect(character.id).toBeDefined();
            expect(character.createdAt).toBeDefined();
            expect(character.updatedAt).toBeDefined();
        });
        
        it('should generate unique IDs', () => {
            const char1 = createEmptyCharacter();
            const char2 = createEmptyCharacter();
            
            expect(char1.id).not.toBe(char2.id);
        });
    });
    
    describe('D&D 5e character support', () => {
        it('should support D&D 5e characters', () => {
            const character = createEmptyCharacter();
            character.dnd5eData = createEmptyDnD5eCharacter();
            
            expect(character.system).toBe('dnd5e');
            expect(character.dnd5eData).toBeDefined();
            expect(isDnD5eCharacter(character)).toBe(true);
        });
        
        it('should get D&D 5e data safely', () => {
            const character = createEmptyCharacter();
            character.dnd5eData = createEmptyDnD5eCharacter();
            
            const dnd5eData = getDnD5eData(character);
            expect(dnd5eData).toBeDefined();
            expect(dnd5eData.abilityScores).toBeDefined();
        });
        
        it('should throw when getting D&D 5e data from non-D&D 5e character', () => {
            const character = createEmptyCharacter();
            character.system = 'pathfinder1e';
            character.dnd5eData = undefined;
            
            expect(() => getDnD5eData(character)).toThrow();
        });
    });
    
    describe('System extensibility', () => {
        it('should be extensible to other systems (future)', () => {
            const character = createEmptyCharacter();
            character.system = 'pathfinder1e';
            // Future: character.pathfinderData = { ... }
            
            expect(character.system).toBe('pathfinder1e');
            expect(isDnD5eCharacter(character)).toBe(false);
        });
    });
});

