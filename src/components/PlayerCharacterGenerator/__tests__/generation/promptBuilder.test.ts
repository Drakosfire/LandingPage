/**
 * Tests for prompt builder with subrace handling
 * 
 * @module CharacterGenerator/__tests__/generation/promptBuilder
 */

import '../setup';
import { buildPreferencePrompt } from '../../../generation/promptBuilder';
import { GenerationInput, GenerationConstraints } from '../../../generation/types';
import { HILL_DWARF, MOUNTAIN_DWARF, HIGH_ELF, WOOD_ELF, HUMAN } from '../../../data/dnd5e/races';

describe('Prompt Builder - Subrace Handling', () => {
    const createMockConstraints = (raceId: string, raceName: string, abilityBonuses: Record<string, number>): GenerationConstraints => ({
        class: {
            id: 'fighter',
            name: 'Fighter',
            hitDie: 10,
            primaryAbilities: ['strength', 'dexterity'],
        },
        race: {
            id: raceId,
            name: raceName,
            abilityBonuses,
        },
        background: {
            id: 'soldier',
            name: 'Soldier',
            grantedSkills: ['Athletics', 'Intimidation'],
        },
        skills: {
            grantedByBackground: ['Athletics', 'Intimidation'],
            classOptions: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'],
            chooseCount: 2,
            overlapHandling: 'replace',
        },
        equipment: {
            packages: [
                {
                    id: 'A',
                    description: 'Chain mail + shield + martial weapon',
                    items: ['chain-mail', 'shield', 'martial-weapon-choice'],
                },
            ],
        },
        featureChoices: [],
    });

    describe('Subrace display in foundation section', () => {
        it('should display subrace with base race in parentheses when subraceId is provided', () => {
            const input: GenerationInput = {
                classId: 'fighter',
                raceId: 'dwarf',
                subraceId: 'hill-dwarf',
                level: 1,
                backgroundId: 'soldier',
                concept: 'A sturdy hill dwarf warrior',
            };

            const constraints = createMockConstraints('hill-dwarf', 'Hill Dwarf', {
                constitution: 2,
                wisdom: 1,
            });

            const prompt = buildPreferencePrompt(input, constraints);

            // Should show "Hill Dwarf (Dwarf)" format
            expect(prompt).toContain('**Race:** Hill Dwarf (Dwarf)');
        });

        it('should display high elf subrace correctly', () => {
            const input: GenerationInput = {
                classId: 'wizard',
                raceId: 'elf',
                subraceId: 'high-elf',
                level: 1,
                backgroundId: 'sage',
                concept: 'A scholarly high elf wizard',
            };

            const constraints = createMockConstraints('high-elf', 'High Elf', {
                dexterity: 2,
                intelligence: 1,
            });

            const prompt = buildPreferencePrompt(input, constraints);

            expect(prompt).toContain('**Race:** High Elf (Elf)');
        });

        it('should display wood elf subrace correctly', () => {
            const input: GenerationInput = {
                classId: 'ranger',
                raceId: 'elf',
                subraceId: 'wood-elf',
                level: 1,
                backgroundId: 'folk-hero',
                concept: 'A swift wood elf tracker',
            };

            const constraints = createMockConstraints('wood-elf', 'Wood Elf', {
                dexterity: 2,
                wisdom: 1,
            });

            const prompt = buildPreferencePrompt(input, constraints);

            expect(prompt).toContain('**Race:** Wood Elf (Elf)');
        });

        it('should display mountain dwarf subrace correctly', () => {
            const input: GenerationInput = {
                classId: 'paladin',
                raceId: 'dwarf',
                subraceId: 'mountain-dwarf',
                level: 1,
                backgroundId: 'noble',
                concept: 'A strong mountain dwarf champion',
            };

            const constraints = createMockConstraints('mountain-dwarf', 'Mountain Dwarf', {
                constitution: 2,
                strength: 2,
            });

            const prompt = buildPreferencePrompt(input, constraints);

            expect(prompt).toContain('**Race:** Mountain Dwarf (Dwarf)');
        });

        it('should display race name only when no subraceId is provided', () => {
            const input: GenerationInput = {
                classId: 'fighter',
                raceId: 'human',
                level: 1,
                backgroundId: 'soldier',
                concept: 'A human warrior',
            };

            const constraints = createMockConstraints('human', 'Human', {
                strength: 1,
                dexterity: 1,
                constitution: 1,
                intelligence: 1,
                wisdom: 1,
                charisma: 1,
            });

            const prompt = buildPreferencePrompt(input, constraints);

            // Should show just "Human" without parentheses
            expect(prompt).toContain('**Race:** Human');
            expect(prompt).not.toContain('**Race:** Human (');
        });

        it('should display race name only when subraceId is not provided even for subrace raceId', () => {
            // This tests the case where raceId is a subrace ID but subraceId is not explicitly set
            const input: GenerationInput = {
                classId: 'fighter',
                raceId: 'hill-dwarf', // Subrace ID but no subraceId field
                level: 1,
                backgroundId: 'soldier',
                concept: 'A hill dwarf warrior',
            };

            const constraints = createMockConstraints('hill-dwarf', 'Hill Dwarf', {
                constitution: 2,
                wisdom: 1,
            });

            const prompt = buildPreferencePrompt(input, constraints);

            // Should show just "Hill Dwarf" without parentheses when subraceId is not set
            expect(prompt).toContain('**Race:** Hill Dwarf');
            // Should not have the base race in parentheses
            expect(prompt).not.toContain('**Race:** Hill Dwarf (Dwarf)');
        });
    });

    describe('Racial bonuses in prompt', () => {
        it('should include subrace ability bonuses in prompt', () => {
            const input: GenerationInput = {
                classId: 'fighter',
                raceId: 'dwarf',
                subraceId: 'hill-dwarf',
                level: 1,
                backgroundId: 'soldier',
                concept: 'A sturdy hill dwarf warrior',
            };

            const constraints = createMockConstraints('hill-dwarf', 'Hill Dwarf', {
                constitution: 2,
                wisdom: 1,
            });

            const prompt = buildPreferencePrompt(input, constraints);

            // Should show racial bonuses
            expect(prompt).toContain('**Racial Bonuses:**');
            expect(prompt).toMatch(/constitution \+2/);
            expect(prompt).toMatch(/wisdom \+1/);
        });

        it('should include mountain dwarf ability bonuses correctly', () => {
            const input: GenerationInput = {
                classId: 'paladin',
                raceId: 'dwarf',
                subraceId: 'mountain-dwarf',
                level: 1,
                backgroundId: 'noble',
                concept: 'A strong mountain dwarf champion',
            };

            const constraints = createMockConstraints('mountain-dwarf', 'Mountain Dwarf', {
                constitution: 2,
                strength: 2,
            });

            const prompt = buildPreferencePrompt(input, constraints);

            expect(prompt).toContain('**Racial Bonuses:**');
            expect(prompt).toMatch(/constitution \+2/);
            expect(prompt).toMatch(/strength \+2/);
        });
    });

    describe('Complete prompt structure with subrace', () => {
        it('should build complete prompt with all sections for hill dwarf fighter', () => {
            const input: GenerationInput = {
                classId: 'fighter',
                raceId: 'dwarf',
                subraceId: 'hill-dwarf',
                level: 1,
                backgroundId: 'soldier',
                concept: 'A sturdy hill dwarf defender',
            };

            const constraints = createMockConstraints('hill-dwarf', 'Hill Dwarf', {
                constitution: 2,
                wisdom: 1,
            });

            const prompt = buildPreferencePrompt(input, constraints);

            // Check all major sections exist
            expect(prompt).toContain('## CHARACTER FOUNDATION (Fixed by Player)');
            expect(prompt).toContain('## AVAILABLE OPTIONS');
            expect(prompt).toContain('## OUTPUT FORMAT');
            expect(prompt).toContain('## CHARACTER CONCEPT');

            // Check foundation details
            expect(prompt).toContain('**Class:** Fighter');
            expect(prompt).toContain('**Race:** Hill Dwarf (Dwarf)');
            expect(prompt).toContain('**Level:** 1');
            expect(prompt).toContain('**Background:** Soldier');
            expect(prompt).toContain('**Hit Die:** d10');
            expect(prompt).toContain('**Primary Abilities:** strength, dexterity');

            // Check concept is included
            expect(prompt).toContain('A sturdy hill dwarf defender');
        });
    });
});

