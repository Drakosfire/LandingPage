/**
 * D&D 5e races data tests
 * 
 * Tests for SRD race data integrity and helper functions.
 * 
 * @module CharacterGenerator/__tests__/data/dnd5e
 */

import '../../setup';
import { 
    SRD_RACES, 
    HILL_DWARF,
    getRaceById,
    getBaseRaces,
    getSubraces
} from '../../../data/dnd5e/races';

describe('D&D 5e SRD Races', () => {
    describe('Hill Dwarf data', () => {
        it('should have complete Hill Dwarf data', () => {
            expect(HILL_DWARF.name).toBe('Hill Dwarf');
            expect(HILL_DWARF.id).toBe('hill-dwarf');
            expect(HILL_DWARF.baseRace).toBe('dwarf');
            expect(HILL_DWARF.size).toBe('medium');
            expect(HILL_DWARF.speed.walk).toBe(25);
        });
        
        it('should have correct ability bonuses', () => {
            expect(HILL_DWARF.abilityBonuses).toHaveLength(2);
            expect(HILL_DWARF.abilityBonuses).toContainEqual(
                { ability: 'constitution', bonus: 2 }
            );
            expect(HILL_DWARF.abilityBonuses).toContainEqual(
                { ability: 'wisdom', bonus: 1 }
            );
        });
        
        it('should have all racial traits', () => {
            expect(HILL_DWARF.traits.length).toBeGreaterThan(0);
            expect(HILL_DWARF.traits.map(t => t.id)).toContain('darkvision');
            expect(HILL_DWARF.traits.map(t => t.id)).toContain('dwarven-resilience');
            expect(HILL_DWARF.traits.map(t => t.id)).toContain('dwarven-toughness');
        });
        
        it('should have correct languages', () => {
            expect(HILL_DWARF.languages).toContain('Common');
            expect(HILL_DWARF.languages).toContain('Dwarvish');
        });
    });
    
    describe('SRD_RACES array', () => {
        it('should contain at least one race', () => {
            expect(SRD_RACES.length).toBeGreaterThan(0);
        });
        
        it('should have unique IDs', () => {
            const ids = SRD_RACES.map(r => r.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });
    });
    
    describe('getRaceById', () => {
        it('should find race by ID', () => {
            const race = getRaceById('hill-dwarf');
            expect(race).toBeDefined();
            expect(race?.name).toBe('Hill Dwarf');
        });
        
        it('should return undefined for invalid ID', () => {
            const race = getRaceById('invalid-race');
            expect(race).toBeUndefined();
        });
    });
    
    describe('getBaseRaces', () => {
        it('should return only base races', () => {
            const baseRaces = getBaseRaces();
            expect(baseRaces.every(race => !race.baseRace)).toBe(true);
        });
    });
    
    describe('getSubraces', () => {
        it('should return subraces for dwarf', () => {
            const dwarfSubraces = getSubraces('dwarf');
            expect(dwarfSubraces.length).toBeGreaterThan(0);
            expect(dwarfSubraces.every(race => race.baseRace === 'dwarf')).toBe(true);
        });
    });
});

