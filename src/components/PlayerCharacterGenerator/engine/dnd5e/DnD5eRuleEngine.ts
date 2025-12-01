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
    AbilityName,
    AbilityBonusChoice,
    FlexibleBonusConfig,
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

    // ===== FLEXIBLE BONUS CONFIGURATIONS =====
    
    /**
     * Races that have flexible ability score bonuses
     * Half-Elf: +2 CHA (fixed) + choose two other abilities for +1 each
     */
    private static readonly FLEXIBLE_BONUS_CONFIGS: FlexibleBonusConfig[] = [
        {
            raceId: 'half-elf',
            choiceCount: 2,
            bonusPerChoice: 1,
            excludedAbilities: ['charisma'], // Already gets +2 CHA
            allowStacking: false // Can't put both +1s on same ability
        }
    ];

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
     * Get all available races (including subraces)
     * @returns Array of all race definitions
     */
    getAvailableRaces(): DnD5eRace[] {
        return this.races;
    }

    /**
     * Get base race options for UI selection
     * Returns races that have subraces (Dwarf, Elf, etc.) + standalone races (Human, Dragonborn, etc.)
     * @returns Array of base race options with metadata
     */
    getBaseRaceOptions(): Array<{ id: string; name: string; hasSubraces: boolean }> {
        const baseRaces = new Map<string, { id: string; name: string; hasSubraces: boolean }>();

        for (const race of this.races) {
            if (race.baseRace) {
                // This is a subrace - add its base race if not already added
                if (!baseRaces.has(race.baseRace)) {
                    baseRaces.set(race.baseRace, {
                        id: race.baseRace,
                        name: race.baseRace.charAt(0).toUpperCase() + race.baseRace.slice(1),
                        hasSubraces: true
                    });
                }
            } else {
                // This is a standalone race (no subraces)
                if (!baseRaces.has(race.id)) {
                    baseRaces.set(race.id, {
                        id: race.id,
                        name: race.name,
                        hasSubraces: false
                    });
                }
            }
        }

        return Array.from(baseRaces.values());
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
     * @param baseRaceId - ID of the base race (e.g., 'dwarf', 'elf')
     * @returns Array of subrace definitions
     */
    getSubraces(baseRaceId: string): DnD5eRace[] {
        return this.races.filter(race => race.baseRace === baseRaceId);
    }

    /**
     * Get a specific race by ID
     * @param raceId - Race ID (e.g., 'hill-dwarf', 'human')
     * @returns Race definition or undefined
     */
    getRaceById(raceId: string): DnD5eRace | undefined {
        return this.races.find(race => race.id === raceId);
    }

    // ===== FLEXIBLE ABILITY BONUSES (T026d-e) =====

    /**
     * Check if a race has flexible ability bonuses that require player choice
     * @param raceId - Race ID to check
     * @returns True if player must choose which abilities to boost
     */
    hasFlexibleAbilityBonuses(raceId: string): boolean {
        return DnD5eRuleEngine.FLEXIBLE_BONUS_CONFIGS.some(
            config => config.raceId === raceId
        );
    }

    /**
     * Get flexible bonus configuration for a race
     * @param raceId - Race ID
     * @returns Configuration object or undefined if race has no flexible bonuses
     */
    getFlexibleAbilityBonusOptions(raceId: string): FlexibleBonusConfig | undefined {
        return DnD5eRuleEngine.FLEXIBLE_BONUS_CONFIGS.find(
            config => config.raceId === raceId
        );
    }

    /**
     * Get list of valid abilities that can be chosen for flexible bonus
     * @param raceId - Race ID
     * @returns Array of ability names that can receive flexible bonus
     */
    getValidFlexibleBonusAbilities(raceId: string): AbilityName[] {
        const config = this.getFlexibleAbilityBonusOptions(raceId);
        if (!config) return [];

        const allAbilities: AbilityName[] = [
            'strength', 'dexterity', 'constitution', 
            'intelligence', 'wisdom', 'charisma'
        ];

        return allAbilities.filter(
            ability => !config.excludedAbilities.includes(ability)
        );
    }

    /**
     * Validate flexible bonus choices
     * @param raceId - Race ID
     * @param choices - Player's chosen ability bonuses
     * @returns Validation result
     */
    validateFlexibleBonusChoices(
        raceId: string, 
        choices: AbilityBonusChoice[]
    ): ValidationResult {
        const result: ValidationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            info: []
        };

        const config = this.getFlexibleAbilityBonusOptions(raceId);
        if (!config) {
            // Race doesn't have flexible bonuses - any choices are invalid
            if (choices.length > 0) {
                result.isValid = false;
                result.errors.push({
                    code: 'FLEXIBLE_BONUS_NOT_ALLOWED',
                    message: 'This race does not have flexible ability bonuses',
                    step: 'race',
                    field: 'flexibleBonuses',
                    severity: 'error'
                });
            }
            return result;
        }

        // Check correct number of choices
        if (choices.length !== config.choiceCount) {
            result.isValid = false;
            result.errors.push({
                code: 'FLEXIBLE_BONUS_COUNT_INVALID',
                message: `Must choose exactly ${config.choiceCount} abilities, got ${choices.length}`,
                step: 'race',
                field: 'flexibleBonuses',
                severity: 'error'
            });
        }

        // Check no excluded abilities
        const validAbilities = this.getValidFlexibleBonusAbilities(raceId);
        for (const choice of choices) {
            if (!validAbilities.includes(choice.ability)) {
                result.isValid = false;
                result.errors.push({
                    code: 'FLEXIBLE_BONUS_EXCLUDED_ABILITY',
                    message: `Cannot choose ${choice.ability} - already has fixed racial bonus`,
                    step: 'race',
                    field: 'flexibleBonuses',
                    severity: 'error'
                });
            }
        }

        // Check no stacking if not allowed
        if (!config.allowStacking) {
            const chosenAbilities = choices.map(c => c.ability);
            const uniqueAbilities = new Set(chosenAbilities);
            if (uniqueAbilities.size !== chosenAbilities.length) {
                result.isValid = false;
                result.errors.push({
                    code: 'FLEXIBLE_BONUS_NO_STACKING',
                    message: 'Cannot apply multiple bonuses to the same ability',
                    step: 'race',
                    field: 'flexibleBonuses',
                    severity: 'error'
                });
            }
        }

        return result;
    }

    // ===== CHOICE HELPERS =====

    /**
     * Get valid skill choices for current character state
     * @param character - Current character
     * @returns Skill choice object with count, options, and selected
     */
    getValidSkillChoices(character: DnD5eCharacter): SkillChoice {
        // Get primary class (first class in multiclass scenarios)
        const primaryClass = character.classes[0];
        if (!primaryClass) {
            return { count: 0, options: [], selected: [] };
        }

        // Find class data
        const classData = this.classes.find(
            c => c.id === primaryClass.name.toLowerCase()
        );
        if (!classData) {
            return { count: 0, options: [], selected: [] };
        }

        // Get skill choices from class
        const skillChoices = classData.skillChoices;

        // Get already selected skills from character's proficiencies
        const selectedSkills = character.proficiencies?.skills ?? [];

        return {
            count: skillChoices.choose,
            options: skillChoices.from,
            selected: selectedSkills.filter(skill => 
                skillChoices.from.includes(skill)
            )
        };
    }

    /**
     * Get equipment choices for a class
     * @param classId - Class ID
     * @returns Array of equipment choice groups
     */
    getEquipmentChoices(classId: string): EquipmentChoiceGroup[] {
        const classData = this.classes.find(c => c.id === classId);
        if (!classData) return [];

        // Transform class equipment options into EquipmentChoiceGroup format
        return classData.equipmentOptions.map(equipOption => ({
            id: equipOption.groupId,
            description: `Choose ${equipOption.choose} of the following`,
            options: equipOption.options.map(choice => ({
                id: choice.id,
                name: choice.description, // Use description as display name
                items: choice.items.map(itemId => ({
                    id: itemId,
                    name: this.formatItemName(itemId),
                    quantity: 1, // Will be expanded for items like 'javelin' x4
                    type: this.getItemType(itemId)
                })),
                description: choice.description
            })),
            selectedIndex: undefined
        }));
    }

    /**
     * Format an item ID into a readable name
     * @param itemId - Item ID (e.g., 'greataxe', 'martial-melee-choice')
     * @returns Formatted name
     */
    private formatItemName(itemId: string): string {
        // Handle special placeholder choices
        if (itemId.endsWith('-choice')) {
            return itemId
                .replace('-choice', '')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase());
        }
        // Convert kebab-case to Title Case
        return itemId
            .replace(/-/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    }

    /**
     * Determine item type from ID
     * @param itemId - Item ID
     * @returns Item type
     */
    private getItemType(itemId: string): 'weapon' | 'armor' | 'gear' | 'tool' | 'pack' {
        if (itemId.includes('pack')) return 'pack';
        if (itemId.includes('armor') || itemId.includes('shield') || 
            itemId.includes('mail') || itemId.includes('leather')) return 'armor';
        if (itemId.includes('tool') || itemId.includes('kit')) return 'tool';
        
        // Most class starting equipment is weapons
        const weapons = [
            'greataxe', 'handaxe', 'javelin', 'longsword', 'shortsword', 
            'rapier', 'scimitar', 'mace', 'dagger', 'quarterstaff',
            'crossbow', 'shortbow', 'longbow', 'sling', 'dart',
            'warhammer', 'light-hammer', 'battleaxe', 'greatsword'
        ];
        if (weapons.some(w => itemId.includes(w)) || 
            itemId.includes('martial') || itemId.includes('simple') || 
            itemId.includes('weapon')) {
            return 'weapon';
        }

        return 'gear';
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
     * Apply racial bonuses to ability scores (T026 + T026f)
     * @param baseScores - Base ability scores (before racial bonuses)
     * @param raceId - Race ID (e.g., 'hill-dwarf', 'human')
     * @param flexibleBonuses - Optional player choices for flexible bonuses (Half-Elf +1/+1)
     * @returns Modified ability scores with racial bonuses applied
     */
    applyRacialBonuses(
        baseScores: AbilityScores, 
        raceId: string,
        flexibleBonuses?: AbilityBonusChoice[]
    ): AbilityScores {
        const race = this.races.find(r => r.id === raceId);
        if (!race) return baseScores;

        const modified = { ...baseScores };

        // Apply fixed racial bonuses
        for (const bonus of race.abilityBonuses) {
            const ability = bonus.ability as keyof AbilityScores;
            if (ability in modified) {
                modified[ability] += bonus.bonus;
            }
        }

        // Apply flexible bonuses if provided and valid
        if (flexibleBonuses && flexibleBonuses.length > 0) {
            const validation = this.validateFlexibleBonusChoices(raceId, flexibleBonuses);
            if (validation.isValid) {
                for (const choice of flexibleBonuses) {
                    if (choice.ability in modified) {
                        modified[choice.ability] += choice.bonus;
                    }
                }
            }
            // If validation fails, flexible bonuses are not applied
            // The UI should prevent this by validating first
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
 * Create a default D&D 5e Rule Engine instance with SRD data
 */
export const createDnD5eRuleEngine = (): DnD5eRuleEngine => {
    // Import SRD data
    // Note: Importing dynamically to avoid circular dependencies
    const { SRD_RACES } = require('../../data/dnd5e/races');
    const { SRD_CLASSES } = require('../../data/dnd5e/classes');

    return new DnD5eRuleEngine(
        SRD_RACES,   // races (T024) ✅
        SRD_CLASSES, // classes (T033) ✅
        [],          // backgrounds (TODO: T037)
        []           // spells (TODO: Phase spellcasting)
    );
};

