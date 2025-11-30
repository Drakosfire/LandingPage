/**
 * D&D 5e Rule Engine Implementation
 * 
 * Implements the RuleEngine interface for D&D 5th Edition (SRD).
 * This class encapsulates all D&D 5e rules, validation, and calculations.
 * 
 * @module PlayerCharacterGenerator/engine/dnd5e
 */

import type { RuleEngine } from '../RuleEngine.interface';
import type {
    CreationStep,
    ValidationResult,
    SkillChoice,
    EquipmentChoiceGroup,
    DerivedStats,
    AbilityScores,
    createEmptyValidationResult,
    createValidationError,
    mergeValidationResults
} from '../RuleEngine.types';

import type { DnD5eCharacter } from '../../types/dnd5e/character.types';
import type { DnD5eRace } from '../../types/dnd5e/race.types';
import type { DnD5eClass } from '../../types/dnd5e/class.types';
import type { DnD5eBackground } from '../../types/dnd5e/background.types';
import type { DnD5eSpell } from '../../types/dnd5e/spell.types';

/**
 * D&D 5e Rule Engine
 * 
 * Validates characters, provides choices, and calculates derived stats
 * according to D&D 5th Edition SRD rules.
 */
export class DnD5eRuleEngine implements RuleEngine<
    DnD5eCharacter,
    DnD5eRace,
    DnD5eClass,
    DnD5eBackground,
    DnD5eSpell
> {
    // ===== IDENTITY =====

    readonly systemId = 'dnd5e';
    readonly systemName = 'D&D 5th Edition (SRD)';
    readonly version = '1.0.0';

    // ===== INJECTED DATA =====

    private races: DnD5eRace[];
    private classes: DnD5eClass[];
    private backgrounds: DnD5eBackground[];
    private spells: DnD5eSpell[];

    /**
     * Create a new D&D 5e Rule Engine
     * 
     * @param races - Available race definitions
     * @param classes - Available class definitions
     * @param backgrounds - Available background definitions
     * @param spells - Available spell definitions
     */
    constructor(
        races: DnD5eRace[] = [],
        classes: DnD5eClass[] = [],
        backgrounds: DnD5eBackground[] = [],
        spells: DnD5eSpell[] = []
    ) {
        this.races = races;
        this.classes = classes;
        this.backgrounds = backgrounds;
        this.spells = spells;
    }

    // ===== VALIDATION =====

    /**
     * Validate entire character
     * @param character - Character to validate
     * @returns Combined validation result from all steps
     */
    validateCharacter(character: DnD5eCharacter): ValidationResult {
        // TODO: Implement in Phase 2 (T043)
        // Will aggregate results from all step validators
        const steps: CreationStep[] = [
            'abilityScores',
            'race',
            'class',
            'background',
            'equipment',
            'review'
        ];

        const results = steps.map(step => this.validateStep(character, step));

        // Merge all results
        const merged: ValidationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            info: []
        };

        for (const result of results) {
            merged.errors.push(...result.errors);
            merged.warnings.push(...result.warnings);
            merged.info.push(...result.info);
        }

        merged.isValid = merged.errors.length === 0;
        return merged;
    }

    /**
     * Validate a specific wizard step
     * @param character - Character to validate
     * @param step - Which step to validate
     * @returns Validation result for that step
     */
    validateStep(character: DnD5eCharacter, step: CreationStep): ValidationResult {
        // TODO: Implement validators in Phase 2 (T038-T042)
        // For now, return valid result
        switch (step) {
            case 'abilityScores':
                return this.validateAbilityScores(character);
            case 'race':
                return this.validateRace(character);
            case 'class':
                return this.validateClass(character);
            case 'background':
                return this.validateBackground(character);
            case 'equipment':
                return this.validateEquipment(character);
            case 'review':
                return this.validateReview(character);
            default:
                return { isValid: true, errors: [], warnings: [], info: [] };
        }
    }

    /**
     * Check if character is complete and ready to finalize
     * @param character - Character to check
     * @returns True if all validations pass
     */
    isCharacterComplete(character: DnD5eCharacter): boolean {
        // TODO: Implement in Phase 2 (T045)
        const result = this.validateCharacter(character);
        return result.isValid;
    }

    // ===== PRIVATE VALIDATORS (stubs for Phase 2) =====

    private validateAbilityScores(character: DnD5eCharacter): ValidationResult {
        // TODO: T038 - Implement in Phase 2
        return { isValid: true, errors: [], warnings: [], info: [] };
    }

    private validateRace(character: DnD5eCharacter): ValidationResult {
        // TODO: T039 - Implement in Phase 2
        return { isValid: true, errors: [], warnings: [], info: [] };
    }

    private validateClass(character: DnD5eCharacter): ValidationResult {
        // TODO: T040 - Implement in Phase 2
        return { isValid: true, errors: [], warnings: [], info: [] };
    }

    private validateBackground(character: DnD5eCharacter): ValidationResult {
        // TODO: T041 - Implement in Phase 2
        return { isValid: true, errors: [], warnings: [], info: [] };
    }

    private validateEquipment(character: DnD5eCharacter): ValidationResult {
        // TODO: T042 - Implement in Phase 2
        return { isValid: true, errors: [], warnings: [], info: [] };
    }

    private validateReview(character: DnD5eCharacter): ValidationResult {
        // Review step validates that all other steps are valid
        return { isValid: true, errors: [], warnings: [], info: [] };
    }

    // ===== DATA PROVIDERS =====

    /**
     * Get all available races
     * @returns Array of race definitions
     */
    getAvailableRaces(): DnD5eRace[] {
        // TODO: T024 - Wire up race data in Phase 3
        return this.races;
    }

    /**
     * Get all available classes
     * @returns Array of class definitions
     */
    getAvailableClasses(): DnD5eClass[] {
        // TODO: T033 - Wire up class data in Phase 3
        return this.classes;
    }

    /**
     * Get all available backgrounds
     * @returns Array of background definitions
     */
    getAvailableBackgrounds(): DnD5eBackground[] {
        // TODO: T037 - Wire up background data in Phase 3
        return this.backgrounds;
    }

    /**
     * Get subraces for a base race
     * @param baseRaceId - ID of the base race
     * @returns Array of subrace definitions
     */
    getSubraces(baseRaceId: string): DnD5eRace[] {
        // TODO: T025 - Implement in Phase 3
        return this.races.filter(race => race.baseRace === baseRaceId);
    }

    // ===== CHOICE HELPERS =====

    /**
     * Get valid skill choices for current character state
     * @param character - Current character
     * @returns Skill choice object
     */
    getValidSkillChoices(character: DnD5eCharacter): SkillChoice {
        // TODO: T034 - Implement in Phase 3
        // Will look up class skill options and return available choices
        return {
            count: 0,
            options: [],
            selected: []
        };
    }

    /**
     * Get equipment choices for a class
     * @param classId - Class ID
     * @returns Array of equipment choice groups
     */
    getEquipmentChoices(classId: string): EquipmentChoiceGroup[] {
        // TODO: T035 - Implement in Phase 3
        return [];
    }

    /**
     * Get available spells at a level
     * @param character - Current character
     * @param spellLevel - Spell level (0 for cantrips)
     * @returns Array of available spells
     */
    getAvailableSpells(character: DnD5eCharacter, spellLevel: number): DnD5eSpell[] {
        // TODO: Implement when spellcasting is added
        return this.spells.filter(spell => spell.level === spellLevel);
    }

    // ===== CALCULATIONS =====

    /**
     * Calculate derived stats for a character
     * @param character - Current character
     * @returns Derived stats object
     */
    calculateDerivedStats(character: DnD5eCharacter): DerivedStats {
        // TODO: T066 - Implement in Phase 3
        const conMod = this.getAbilityModifier(character.abilityScores.constitution);
        const dexMod = this.getAbilityModifier(character.abilityScores.dexterity);
        const wisMod = this.getAbilityModifier(character.abilityScores.wisdom);
        const totalLevel = this.getTotalLevel(character.classes);

        return {
            armorClass: 10 + dexMod, // Base AC without armor
            initiative: dexMod,
            speed: character.race?.speed?.walk ?? 30,
            maxHitPoints: this.calculateMaxHP(character),
            currentHitPoints: this.calculateMaxHP(character),
            proficiencyBonus: this.getProficiencyBonus(totalLevel),
            passivePerception: 10 + wisMod,
            spellSaveDC: undefined, // TODO: Calculate if spellcaster
            spellAttackBonus: undefined // TODO: Calculate if spellcaster
        };
    }

    /**
     * Apply racial bonuses to ability scores
     * @param baseScores - Base ability scores
     * @param raceId - Race ID
     * @returns Modified ability scores
     */
    applyRacialBonuses(baseScores: AbilityScores, raceId: string): AbilityScores {
        // TODO: T026 - Implement in Phase 3
        const race = this.races.find(r => r.id === raceId);
        if (!race) return baseScores;

        const modified = { ...baseScores };

        for (const bonus of race.abilityBonuses) {
            const ability = bonus.ability as keyof AbilityScores;
            if (ability in modified) {
                modified[ability] += bonus.bonus;
            }
        }

        return modified;
    }

    /**
     * Calculate HP gained from level up
     * @param character - Current character
     * @param hitDieRoll - Roll result (0 for average)
     * @returns HP to add
     */
    calculateLevelUpHP(character: DnD5eCharacter, hitDieRoll: number): number {
        // TODO: T084 - Implement in Phase 7
        const conMod = this.getAbilityModifier(character.abilityScores.constitution);
        // Get primary class (first class entry)
        const primaryClass = character.classes[0];
        const classData = primaryClass ? this.classes.find(c => c.id === primaryClass.name.toLowerCase()) : undefined;
        const hitDie = classData?.hitDie ?? primaryClass?.hitDie ?? 8;

        // If hitDieRoll is 0, use average (rounded up)
        const hpFromDie = hitDieRoll > 0 ? hitDieRoll : Math.ceil(hitDie / 2) + 1;

        return Math.max(1, hpFromDie + conMod);
    }

    /**
     * Get proficiency bonus for a level
     * @param level - Character level (1-20)
     * @returns Proficiency bonus
     */
    getProficiencyBonus(level: number): number {
        // D&D 5e proficiency bonus: +2 at levels 1-4, +3 at 5-8, +4 at 9-12, +5 at 13-16, +6 at 17-20
        return Math.floor((level - 1) / 4) + 2;
    }

    // ===== HELPER METHODS =====

    /**
     * Calculate ability modifier from score
     * @param score - Ability score (1-30)
     * @returns Modifier (-5 to +10)
     */
    private getAbilityModifier(score: number): number {
        return Math.floor((score - 10) / 2);
    }

    /**
     * Get total character level from all class levels
     * @param classes - Array of class levels
     * @returns Total level (sum of all class levels)
     */
    private getTotalLevel(classes: DnD5eCharacter['classes']): number {
        if (!classes || classes.length === 0) return 1;
        return classes.reduce((total, cls) => total + cls.level, 0);
    }

    /**
     * Calculate max HP for a character
     * @param character - Character to calculate HP for
     * @returns Maximum HP
     */
    private calculateMaxHP(character: DnD5eCharacter): number {
        const conMod = this.getAbilityModifier(character.abilityScores.constitution);
        // Get primary class (first class entry)
        const primaryClass = character.classes[0];
        const classData = primaryClass ? this.classes.find(c => c.id === primaryClass.name.toLowerCase()) : undefined;
        const hitDie = classData?.hitDie ?? primaryClass?.hitDie ?? 8;
        const totalLevel = this.getTotalLevel(character.classes);

        // Level 1: Max hit die + CON modifier
        // Additional levels: Average + CON modifier (for now, simplified)
        const level1HP = hitDie + conMod;
        const additionalHP = (totalLevel - 1) * (Math.ceil(hitDie / 2) + 1 + conMod);

        return Math.max(1, level1HP + additionalHP);
    }
}

/**
 * Create a default D&D 5e Rule Engine instance
 * This will be enhanced as data is added in Phase 3
 */
export const createDnD5eRuleEngine = (): DnD5eRuleEngine => {
    // TODO: Import SRD data when available
    return new DnD5eRuleEngine();
};

