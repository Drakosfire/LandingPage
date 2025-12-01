/**
 * Tests for SRD Background Data
 * 
 * Validates that all 6 SRD backgrounds have correct structure and data.
 */

import {
    SRD_BACKGROUNDS,
    ACOLYTE,
    CRIMINAL,
    FOLK_HERO,
    NOBLE,
    SAGE,
    SOLDIER,
    getBackgroundById,
    getBackgroundsBySkill
} from '../../../data/dnd5e/backgrounds';

describe('SRD Backgrounds', () => {
    describe('All backgrounds array', () => {
        it('should have exactly 6 SRD backgrounds', () => {
            expect(SRD_BACKGROUNDS).toHaveLength(6);
        });

        it('should have unique IDs', () => {
            const ids = SRD_BACKGROUNDS.map(bg => bg.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it('should all have source SRD', () => {
            for (const bg of SRD_BACKGROUNDS) {
                expect(bg.source).toBe('SRD');
            }
        });

        it('should all grant exactly 2 skill proficiencies', () => {
            for (const bg of SRD_BACKGROUNDS) {
                expect(bg.skillProficiencies).toHaveLength(2);
            }
        });

        it('should all have a feature', () => {
            for (const bg of SRD_BACKGROUNDS) {
                expect(bg.feature).toBeDefined();
                expect(bg.feature.id).toBeDefined();
                expect(bg.feature.name).toBeDefined();
                expect(bg.feature.description).toBeDefined();
            }
        });

        it('should all have suggested characteristics', () => {
            for (const bg of SRD_BACKGROUNDS) {
                expect(bg.suggestedCharacteristics).toBeDefined();
                expect(bg.suggestedCharacteristics.traits.length).toBeGreaterThan(0);
                expect(bg.suggestedCharacteristics.ideals.length).toBeGreaterThan(0);
                expect(bg.suggestedCharacteristics.bonds.length).toBeGreaterThan(0);
                expect(bg.suggestedCharacteristics.flaws.length).toBeGreaterThan(0);
            }
        });

        it('should all have equipment', () => {
            for (const bg of SRD_BACKGROUNDS) {
                expect(bg.equipment.length).toBeGreaterThan(0);
            }
        });
    });

    describe('Acolyte', () => {
        it('should have correct ID and name', () => {
            expect(ACOLYTE.id).toBe('acolyte');
            expect(ACOLYTE.name).toBe('Acolyte');
        });

        it('should grant Insight and Religion', () => {
            expect(ACOLYTE.skillProficiencies).toContain('insight');
            expect(ACOLYTE.skillProficiencies).toContain('religion');
        });

        it('should grant 2 language choices', () => {
            expect(ACOLYTE.languageChoices).toBe(2);
        });

        it('should have Shelter of the Faithful feature', () => {
            expect(ACOLYTE.feature.id).toBe('shelter-of-the-faithful');
            expect(ACOLYTE.feature.name).toBe('Shelter of the Faithful');
        });

        it('should not grant tool proficiencies', () => {
            expect(ACOLYTE.toolProficiencies).toBeUndefined();
        });
    });

    describe('Criminal', () => {
        it('should have correct ID and name', () => {
            expect(CRIMINAL.id).toBe('criminal');
            expect(CRIMINAL.name).toBe('Criminal');
        });

        it('should grant Deception and Stealth', () => {
            expect(CRIMINAL.skillProficiencies).toContain('deception');
            expect(CRIMINAL.skillProficiencies).toContain('stealth');
        });

        it('should grant gaming set and thieves tools', () => {
            expect(CRIMINAL.toolProficiencies).toContain('gaming-set');
            expect(CRIMINAL.toolProficiencies).toContain('thieves-tools');
        });

        it('should have Criminal Contact feature', () => {
            expect(CRIMINAL.feature.id).toBe('criminal-contact');
            expect(CRIMINAL.feature.name).toBe('Criminal Contact');
        });

        it('should not grant language choices', () => {
            expect(CRIMINAL.languageChoices).toBeUndefined();
        });
    });

    describe('Folk Hero', () => {
        it('should have correct ID and name', () => {
            expect(FOLK_HERO.id).toBe('folk-hero');
            expect(FOLK_HERO.name).toBe('Folk Hero');
        });

        it('should grant Animal Handling and Survival', () => {
            expect(FOLK_HERO.skillProficiencies).toContain('animal-handling');
            expect(FOLK_HERO.skillProficiencies).toContain('survival');
        });

        it('should grant artisan tools and land vehicles', () => {
            expect(FOLK_HERO.toolProficiencies).toContain('artisans-tools');
            expect(FOLK_HERO.toolProficiencies).toContain('land-vehicles');
        });

        it('should have Rustic Hospitality feature', () => {
            expect(FOLK_HERO.feature.id).toBe('rustic-hospitality');
            expect(FOLK_HERO.feature.name).toBe('Rustic Hospitality');
        });
    });

    describe('Noble', () => {
        it('should have correct ID and name', () => {
            expect(NOBLE.id).toBe('noble');
            expect(NOBLE.name).toBe('Noble');
        });

        it('should grant History and Persuasion', () => {
            expect(NOBLE.skillProficiencies).toContain('history');
            expect(NOBLE.skillProficiencies).toContain('persuasion');
        });

        it('should grant gaming set and 1 language', () => {
            expect(NOBLE.toolProficiencies).toContain('gaming-set');
            expect(NOBLE.languageChoices).toBe(1);
        });

        it('should have Position of Privilege feature', () => {
            expect(NOBLE.feature.id).toBe('position-of-privilege');
            expect(NOBLE.feature.name).toBe('Position of Privilege');
        });

        it('should have 25 gp in equipment', () => {
            expect(NOBLE.equipment).toContain('25-gp');
        });
    });

    describe('Sage', () => {
        it('should have correct ID and name', () => {
            expect(SAGE.id).toBe('sage');
            expect(SAGE.name).toBe('Sage');
        });

        it('should grant Arcana and History', () => {
            expect(SAGE.skillProficiencies).toContain('arcana');
            expect(SAGE.skillProficiencies).toContain('history');
        });

        it('should grant 2 language choices', () => {
            expect(SAGE.languageChoices).toBe(2);
        });

        it('should have Researcher feature', () => {
            expect(SAGE.feature.id).toBe('researcher');
            expect(SAGE.feature.name).toBe('Researcher');
        });

        it('should not grant tool proficiencies', () => {
            expect(SAGE.toolProficiencies).toBeUndefined();
        });
    });

    describe('Soldier', () => {
        it('should have correct ID and name', () => {
            expect(SOLDIER.id).toBe('soldier');
            expect(SOLDIER.name).toBe('Soldier');
        });

        it('should grant Athletics and Intimidation', () => {
            expect(SOLDIER.skillProficiencies).toContain('athletics');
            expect(SOLDIER.skillProficiencies).toContain('intimidation');
        });

        it('should grant gaming set and land vehicles', () => {
            expect(SOLDIER.toolProficiencies).toContain('gaming-set');
            expect(SOLDIER.toolProficiencies).toContain('land-vehicles');
        });

        it('should have Military Rank feature', () => {
            expect(SOLDIER.feature.id).toBe('military-rank');
            expect(SOLDIER.feature.name).toBe('Military Rank');
        });

        it('should not grant language choices', () => {
            expect(SOLDIER.languageChoices).toBeUndefined();
        });
    });

    describe('Helper functions', () => {
        describe('getBackgroundById', () => {
            it('should find Acolyte by ID', () => {
                const bg = getBackgroundById('acolyte');
                expect(bg).toBeDefined();
                expect(bg!.name).toBe('Acolyte');
            });

            it('should find Soldier by ID', () => {
                const bg = getBackgroundById('soldier');
                expect(bg).toBeDefined();
                expect(bg!.name).toBe('Soldier');
            });

            it('should return undefined for unknown ID', () => {
                const bg = getBackgroundById('unknown');
                expect(bg).toBeUndefined();
            });
        });

        describe('getBackgroundsBySkill', () => {
            it('should find backgrounds granting History', () => {
                const bgs = getBackgroundsBySkill('history');
                expect(bgs).toHaveLength(2); // Noble and Sage
                expect(bgs.map(b => b.id)).toContain('noble');
                expect(bgs.map(b => b.id)).toContain('sage');
            });

            it('should find backgrounds granting Stealth', () => {
                const bgs = getBackgroundsBySkill('stealth');
                expect(bgs).toHaveLength(1); // Criminal only
                expect(bgs[0].id).toBe('criminal');
            });

            it('should return empty for unknown skill', () => {
                const bgs = getBackgroundsBySkill('unknown-skill');
                expect(bgs).toHaveLength(0);
            });
        });
    });
});
