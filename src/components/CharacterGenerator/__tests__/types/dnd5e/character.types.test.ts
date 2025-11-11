/**
 * D&D 5e character types tests
 * 
 * Tests for D&D 5e-specific character types and helpers.
 * 
 * @module CharacterGenerator/__tests__/types/dnd5e
 */

import '../../setup';
import { 
    createEmptyDnD5eCharacter,
    getAbilityModifier,
    getTotalLevel,
    getProficiencyBonus,
    DnD5eClassLevel
} from '../../../types';

describe('D&D 5e Character Types', () => {
    describe('createEmptyDnD5eCharacter', () => {
        it('should create valid empty D&D 5e character', () => {
            const char = createEmptyDnD5eCharacter();
            
            expect(char.abilityScores).toBeDefined();
            expect(char.abilityScores.strength).toBe(10);
            expect(char.abilityScores.dexterity).toBe(10);
            expect(char.proficiencies).toBeDefined();
            expect(char.currency).toBeDefined();
            expect(char.features).toEqual([]);
        });
    });
    
    describe('getAbilityModifier', () => {
        it('should calculate positive modifiers correctly', () => {
            expect(getAbilityModifier(16)).toBe(3);
            expect(getAbilityModifier(18)).toBe(4);
            expect(getAbilityModifier(20)).toBe(5);
        });
        
        it('should calculate negative modifiers correctly', () => {
            expect(getAbilityModifier(8)).toBe(-1);
            expect(getAbilityModifier(6)).toBe(-2);
            expect(getAbilityModifier(3)).toBe(-4);
        });
        
        it('should handle score of 10-11 as modifier 0', () => {
            expect(getAbilityModifier(10)).toBe(0);
            expect(getAbilityModifier(11)).toBe(0);
        });
    });
    
    describe('getProficiencyBonus', () => {
        it('should return +2 for levels 1-4', () => {
            expect(getProficiencyBonus(1)).toBe(2);
            expect(getProficiencyBonus(4)).toBe(2);
        });
        
        it('should return +3 for levels 5-8', () => {
            expect(getProficiencyBonus(5)).toBe(3);
            expect(getProficiencyBonus(8)).toBe(3);
        });
        
        it('should return +4 for levels 9-12', () => {
            expect(getProficiencyBonus(9)).toBe(4);
            expect(getProficiencyBonus(12)).toBe(4);
        });
    });
    
    describe('getTotalLevel', () => {
        it('should calculate total level from single class', () => {
            const classes: DnD5eClassLevel[] = [
                { name: 'Fighter', level: 3, hitDie: 10, features: [] }
            ];
            
            expect(getTotalLevel(classes)).toBe(3);
        });
        
        it('should calculate total level from multiclass', () => {
            const classes: DnD5eClassLevel[] = [
                { name: 'Fighter', level: 2, hitDie: 10, features: [] },
                { name: 'Rogue', level: 1, hitDie: 8, features: [] }
            ];
            
            expect(getTotalLevel(classes)).toBe(3);
        });
        
        it('should return 0 for no classes', () => {
            expect(getTotalLevel([])).toBe(0);
        });
    });
});

