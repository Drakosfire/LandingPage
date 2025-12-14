/**
 * Preference Translator
 * 
 * Translates AI-generated preferences into valid mechanical choices.
 * 
 * Key principle: AI expresses INTENT, this module enforces VALIDITY.
 * - AI says "prioritize constitution" → we compute optimal point buy
 * - AI says "physical prowess" → we select Athletics if available
 * - AI says "heavy armor" → we pick the matching equipment package
 * 
 * @module CharacterGenerator/generation/preferenceTranslator
 */

import { DnD5eAbilityScores } from '../types/dnd5e/character.types';
import {
    POINT_BUY_TOTAL,
    POINT_BUY_MIN_SCORE,
    POINT_BUY_MAX_SCORE,
    getPointBuyCost
} from '../rules/dnd5e/pointBuy';
import {
    AiPreferences,
    GenerationConstraints,
    TranslationResult,
    AbilityName,
    ABILITY_NAMES,
} from './types';

// ============================================================================
// TRANSLATION RESULT TYPES
// ============================================================================

/**
 * Result type for ability score translation
 */
export interface AbilityTranslationResult {
    success: boolean;
    scores?: DnD5eAbilityScores;
    pointsSpent?: number;
    issues?: string[];
}

/**
 * Result type for skill translation
 */
export interface SkillTranslationResult {
    success: boolean;
    selected?: string[];
    unmatchedThemes?: string[];
    issues?: string[];
}

/**
 * Result type for equipment translation
 */
export interface EquipmentTranslationResult {
    success: boolean;
    packageId?: string;
    issues?: string[];
}

/**
 * Result type for feature choice translation
 */
export interface FeatureChoiceTranslationResult {
    success: boolean;
    choices?: Record<string, string>;
    issues?: string[];
}

/**
 * Result type for spell translation
 */
export interface SpellTranslationResult {
    success: boolean;
    cantrips?: string[];
    spells?: string[];
    unmatchedThemes?: string[];
    issues?: string[];
}

// ============================================================================
// MAIN TRANSLATOR FUNCTION
// ============================================================================

/**
 * Translate AI preferences into valid mechanical choices
 * 
 * @param preferences - AI-generated preferences
 * @param constraints - Rule Engine constraints (valid options)
 * @returns Translation result with valid mechanical choices
 */
export function translatePreferences(
    preferences: AiPreferences,
    constraints: GenerationConstraints,
    input: { level: number }
): TranslationResult {
    const issues: string[] = [];

    // 1. Translate ability scores (point buy optimization)
    const abilityResult = translateAbilityPriorities(
        preferences.abilityPriorities,
        constraints.race.abilityBonuses
    );
    if (!abilityResult.success && abilityResult.issues) {
        issues.push(...abilityResult.issues);
    }

    // 2. Translate skill themes to actual skills
    const skillResult = translateSkillThemes(
        preferences.skillThemes,
        constraints.skills
    );
    if (!skillResult.success && skillResult.issues) {
        issues.push(...skillResult.issues);
    }

    // 3. Translate equipment style to package selection
    const equipmentResult = translateEquipmentStyle(
        preferences.equipmentStyle,
        constraints.equipment.packages
    );
    if (!equipmentResult.success && equipmentResult.issues) {
        issues.push(...equipmentResult.issues);
    }

    // 4. Translate feature choices (fighting style, etc.)
    const featureResult = translateFeatureChoices(
        preferences,
        constraints.featureChoices
    );
    if (!featureResult.success && featureResult.issues) {
        issues.push(...featureResult.issues);
    }

    // 5. Translate spell themes (if caster)
    let spellResult: SpellTranslationResult | undefined;
    if (constraints.spellcasting) {
        spellResult = translateSpellThemes(
            preferences.cantripThemes || [],
            preferences.spellThemes || [],
            constraints.spellcasting,
            input.level,
            abilityResult.scores
        );
        if (spellResult && !spellResult.success && spellResult.issues) {
            issues.push(...spellResult.issues);
        }
    }

    // Determine overall success
    const success =
        abilityResult.success &&
        skillResult.success &&
        equipmentResult.success &&
        featureResult.success &&
        (!constraints.spellcasting || (spellResult?.success ?? true));

    return {
        success,
        translations: {
            abilityScores: abilityResult,
            skills: skillResult,
            equipment: equipmentResult,
            featureChoices: featureResult,
            spells: spellResult,
        },
        issues,
    };
}

// ============================================================================
// ABILITY SCORE TRANSLATION
// ============================================================================

/**
 * Point buy cost table for quick lookup
 */
const POINT_COSTS: Record<number, number> = {
    8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
};

/**
 * Translate ability priorities into optimal point buy allocation
 * 
 * Strategy:
 * 1. Start all scores at 8 (0 points)
 * 2. Allocate points to highest priority first
 * 3. Respect racial bonuses (final score can exceed 15)
 * 
 * @param priorities - Ordered ability priorities (highest first)
 * @param racialBonuses - Racial ability bonuses
 * @returns Ability scores result
 */
export function translateAbilityPriorities(
    priorities: AbilityName[],
    racialBonuses: Partial<Record<AbilityName, number>>
): AbilityTranslationResult {
    const issues: string[] = [];

    // Validate priorities include all 6 abilities
    if (priorities.length !== 6) {
        // Fill in missing abilities at the end
        const missing = ABILITY_NAMES.filter(a => !priorities.includes(a));
        priorities = [...priorities, ...missing].slice(0, 6);
        issues.push(`Priorities incomplete, filled with: ${missing.join(', ')}`);
    }

    // Start with minimum scores
    const baseScores: DnD5eAbilityScores = {
        strength: POINT_BUY_MIN_SCORE,
        dexterity: POINT_BUY_MIN_SCORE,
        constitution: POINT_BUY_MIN_SCORE,
        intelligence: POINT_BUY_MIN_SCORE,
        wisdom: POINT_BUY_MIN_SCORE,
        charisma: POINT_BUY_MIN_SCORE,
    };

    let pointsRemaining = POINT_BUY_TOTAL;

    // Allocate points by priority
    // Strategy: Give top 2 priorities 15, next 2 get 13, rest get whatever's left
    const targetScores = [15, 15, 13, 13, 10, 8]; // Common optimal distribution

    for (let i = 0; i < priorities.length && pointsRemaining > 0; i++) {
        const ability = priorities[i];
        const targetScore = targetScores[i] || POINT_BUY_MIN_SCORE;

        // Calculate how many points needed to reach target
        const currentCost = getPointBuyCost(baseScores[ability]);
        const targetCost = getPointBuyCost(Math.min(targetScore, POINT_BUY_MAX_SCORE));
        const costNeeded = targetCost - currentCost;

        if (costNeeded <= pointsRemaining) {
            baseScores[ability] = Math.min(targetScore, POINT_BUY_MAX_SCORE);
            pointsRemaining -= costNeeded;
        } else {
            // Allocate what we can
            let score = baseScores[ability];
            while (score < POINT_BUY_MAX_SCORE && pointsRemaining > 0) {
                const nextCost = POINT_COSTS[score + 1] - POINT_COSTS[score];
                if (nextCost <= pointsRemaining) {
                    score++;
                    pointsRemaining -= nextCost;
                } else {
                    break;
                }
            }
            baseScores[ability] = score;
        }
    }

    // If points remain, distribute to highest priority that can still increase
    while (pointsRemaining > 0) {
        let allocated = false;
        for (const ability of priorities) {
            if (baseScores[ability] < POINT_BUY_MAX_SCORE) {
                const currentCost = POINT_COSTS[baseScores[ability]];
                const nextCost = POINT_COSTS[baseScores[ability] + 1];
                const costNeeded = nextCost - currentCost;

                if (costNeeded <= pointsRemaining) {
                    baseScores[ability]++;
                    pointsRemaining -= costNeeded;
                    allocated = true;
                    break;
                }
            }
        }
        if (!allocated) break; // Can't allocate any more
    }

    // Calculate points spent
    const pointsSpent = POINT_BUY_TOTAL - pointsRemaining;

    // Apply racial bonuses (these don't count against point buy)
    const finalScores = { ...baseScores };
    for (const [ability, bonus] of Object.entries(racialBonuses)) {
        if (bonus && ability in finalScores) {
            finalScores[ability as AbilityName] += bonus;
        }
    }

    return {
        success: pointsSpent <= POINT_BUY_TOTAL,
        scores: finalScores,
        pointsSpent,
        issues: issues.length > 0 ? issues : undefined,
    };
}

// ============================================================================
// SKILL TRANSLATION
// ============================================================================

/**
 * Theme to skill mapping
 * Maps descriptive themes to D&D 5e skill names
 */
const SKILL_THEME_MAP: Record<string, string[]> = {
    // Physical themes
    'physical': ['Athletics', 'Acrobatics'],
    'physical prowess': ['Athletics'],
    'strength': ['Athletics'],
    'agility': ['Acrobatics'],
    'endurance': ['Athletics'],

    // Stealth/Dexterity themes
    'stealth': ['Stealth'],
    'sneaky': ['Stealth', 'Sleight of Hand'],
    'thievery': ['Sleight of Hand', 'Stealth'],
    'nimble': ['Acrobatics', 'Sleight of Hand'],

    // Social themes
    'social': ['Persuasion', 'Deception', 'Intimidation'],
    'persuasion': ['Persuasion'],
    'deception': ['Deception'],
    'intimidation': ['Intimidation'],
    'intimidating': ['Intimidation'],
    'charm': ['Persuasion', 'Performance'],
    'leadership': ['Persuasion', 'Intimidation'],

    // Knowledge themes
    'knowledge': ['Arcana', 'History', 'Nature', 'Religion'],
    'arcane': ['Arcana'],
    'scholarly': ['History', 'Arcana'],
    'nature': ['Nature', 'Survival'],
    'religious': ['Religion'],
    'lore': ['History', 'Arcana', 'Religion'],

    // Awareness themes
    'awareness': ['Perception', 'Insight'],
    'perception': ['Perception'],
    'insight': ['Insight'],
    'observant': ['Perception', 'Investigation'],
    'vigilant': ['Perception'],
    'intuition': ['Insight'],

    // Survival themes
    'survival': ['Survival', 'Nature'],
    'wilderness': ['Survival', 'Nature', 'Animal Handling'],
    'tracking': ['Survival', 'Perception'],
    'animals': ['Animal Handling'],

    // Investigation themes
    'investigation': ['Investigation'],
    'detective': ['Investigation', 'Insight', 'Perception'],
    'analytical': ['Investigation'],

    // Performance themes
    'performance': ['Performance'],
    'entertainment': ['Performance'],
    'artistic': ['Performance'],

    // Medical themes
    'medical': ['Medicine'],
    'healing': ['Medicine'],
    'doctor': ['Medicine'],
};

/**
 * Translate skill themes into actual skill selections
 * 
 * @param themes - Descriptive skill themes from AI
 * @param constraints - Skill constraints from Rule Engine
 * @returns Skill selection result
 */
export function translateSkillThemes(
    themes: string[],
    constraints: GenerationConstraints['skills']
): SkillTranslationResult {
    const issues: string[] = [];
    const selected: string[] = [];
    const unmatchedThemes: string[] = [];

    // Background-granted skills are always included in final proficiencies.
    const grantedSkills = new Set(constraints.grantedByBackground);

    // Available choices (class options minus already granted, unless overlap allowed)
    const availableOptions = constraints.classOptions.filter(skill => {
        // 5e behavior: if you already have a skill (e.g., from background),
        // you must pick a different one.
        return !grantedSkills.has(skill);
    });

    // How many we need to pick
    const remainingChoices = constraints.chooseCount;

    // Map themes to candidate skills
    const candidateSkills: string[] = [];
    for (const theme of themes) {
        const normalizedTheme = theme.toLowerCase().trim();

        // Check direct mapping
        const mappedSkills = SKILL_THEME_MAP[normalizedTheme];
        if (mappedSkills) {
            candidateSkills.push(...mappedSkills);
        } else {
            // Try partial matching
            let matched = false;
            for (const [key, skills] of Object.entries(SKILL_THEME_MAP)) {
                if (normalizedTheme.includes(key) || key.includes(normalizedTheme)) {
                    candidateSkills.push(...skills);
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                unmatchedThemes.push(theme);
            }
        }
    }

    // Select from candidates that are available (class picks only)
    const selectedSet = new Set<string>();
    for (const candidate of candidateSkills) {
        if (selectedSet.size >= remainingChoices) break;
        if (availableOptions.includes(candidate) && !selectedSet.has(candidate)) {
            selectedSet.add(candidate);
        }
    }

    // If we haven't filled all slots, pick from remaining available
    for (const option of availableOptions) {
        if (selectedSet.size >= remainingChoices) break;
        if (!selectedSet.has(option)) {
            selectedSet.add(option);
            issues.push(`Auto-selected ${option} to fill remaining slot`);
        }
    }

    // Final proficiencies = background + class picks (deduped)
    const finalSet = new Set<string>([...Array.from(grantedSkills), ...Array.from(selectedSet)]);
    selected.push(...Array.from(finalSet));

    if (unmatchedThemes.length > 0) {
        issues.push(`Could not match themes: ${unmatchedThemes.join(', ')}`);
    }

    const expectedTotal = Array.from(grantedSkills).length + remainingChoices;
    const hasAllGranted = Array.from(grantedSkills).every(s => finalSet.has(s));

    return {
        success: hasAllGranted && selectedSet.size === remainingChoices && selected.length === expectedTotal,
        selected,
        unmatchedThemes: unmatchedThemes.length > 0 ? unmatchedThemes : undefined,
        issues: issues.length > 0 ? issues : undefined,
    };
}

// ============================================================================
// EQUIPMENT TRANSLATION
// ============================================================================

/**
 * Equipment style keywords to package matching
 */
const EQUIPMENT_KEYWORDS: Record<string, string[]> = {
    // Armor preferences
    'heavy armor': ['chain mail', 'heavy', 'plate'],
    'light armor': ['leather', 'light', 'mobile'],
    'medium armor': ['scale', 'medium', 'breastplate'],
    'no armor': ['unarmored', 'cloth'],

    // Weapon preferences
    'shield': ['shield'],
    'two-handed': ['two-handed', 'greatsword', 'greataxe', 'maul'],
    'ranged': ['longbow', 'shortbow', 'crossbow', 'ranged'],
    'dual wield': ['two weapons', 'dual'],

    // Style preferences
    'defensive': ['shield', 'defense'],
    'aggressive': ['two-handed', 'damage'],
    'mobile': ['light', 'mobile', 'ranged'],
    'balanced': ['versatile', 'martial'],
};

/**
 * Translate equipment style preference to package selection
 * 
 * @param style - Descriptive equipment style from AI
 * @param packages - Available equipment packages
 * @returns Equipment selection result
 */
export function translateEquipmentStyle(
    style: string,
    packages: GenerationConstraints['equipment']['packages']
): EquipmentTranslationResult {
    const issues: string[] = [];

    if (packages.length === 0) {
        return {
            success: false,
            issues: ['No equipment packages available'],
        };
    }

    if (packages.length === 1) {
        return {
            success: true,
            packageId: packages[0].id,
        };
    }

    const normalizedStyle = style.toLowerCase();

    // Extract keywords from style
    const styleKeywords: string[] = [];
    for (const [keyword, matches] of Object.entries(EQUIPMENT_KEYWORDS)) {
        if (normalizedStyle.includes(keyword)) {
            styleKeywords.push(...matches);
        }
    }

    // Also add individual words from the style
    styleKeywords.push(...normalizedStyle.split(/\s+/));

    // Score each package
    let bestPackage = packages[0];
    let bestScore = 0;

    for (const pkg of packages) {
        const pkgDescription = pkg.description.toLowerCase();
        let score = 0;

        for (const keyword of styleKeywords) {
            if (pkgDescription.includes(keyword)) {
                score++;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestPackage = pkg;
        }
    }

    if (bestScore === 0) {
        issues.push(`No strong match for style "${style}", defaulting to first package`);
    }

    return {
        success: true,
        packageId: bestPackage.id,
        issues: issues.length > 0 ? issues : undefined,
    };
}

// ============================================================================
// FEATURE CHOICE TRANSLATION
// ============================================================================

/**
 * Translate feature choice preferences
 * 
 * @param preferences - AI preferences
 * @param featureChoices - Available feature choices
 * @returns Feature choice result
 */
export function translateFeatureChoices(
    preferences: AiPreferences,
    featureChoices: GenerationConstraints['featureChoices']
): FeatureChoiceTranslationResult {
    const issues: string[] = [];
    const choices: Record<string, string> = {};

    for (const feature of featureChoices) {
        // Check if AI expressed a preference for this feature
        if (feature.featureId.includes('fighting-style') && preferences.fightingStylePreference) {
            // Validate the preference is a valid option
            const validOption = feature.options.find(
                opt => opt.id === preferences.fightingStylePreference?.id
            );
            if (validOption) {
                choices[feature.featureId] = validOption.id;
            } else {
                // Default to first option
                choices[feature.featureId] = feature.options[0].id;
                issues.push(
                    `Invalid fighting style "${preferences.fightingStylePreference.id}", ` +
                    `defaulting to ${feature.options[0].name}`
                );
            }
        } else if (preferences.featureChoicePreferences?.[feature.featureId]) {
            // Check custom feature preferences
            const pref = preferences.featureChoicePreferences[feature.featureId];
            const validOption = feature.options.find(opt => opt.id === pref.optionId);
            if (validOption) {
                choices[feature.featureId] = validOption.id;
            } else {
                choices[feature.featureId] = feature.options[0].id;
                issues.push(
                    `Invalid choice for ${feature.featureName}: "${pref.optionId}", ` +
                    `defaulting to ${feature.options[0].name}`
                );
            }
        } else {
            // No preference expressed, default to first option
            choices[feature.featureId] = feature.options[0].id;
            issues.push(`No preference for ${feature.featureName}, defaulting to ${feature.options[0].name}`);
        }
    }

    return {
        success: true,
        choices,
        issues: issues.length > 0 ? issues : undefined,
    };
}

// ============================================================================
// SPELL TRANSLATION
// ============================================================================

/**
 * Spell theme to school/tag mapping
 */
const SPELL_THEME_MAP: Record<string, { schools?: string[], tags?: string[] }> = {
    'damage': { tags: ['damage', 'attack'] },
    'fire': { tags: ['fire'] },
    'cold': { tags: ['cold', 'ice'] },
    'lightning': { tags: ['lightning', 'thunder'] },
    'healing': { tags: ['healing', 'restoration'] },
    'control': { schools: ['enchantment', 'illusion'], tags: ['control', 'crowd'] },
    'buff': { schools: ['abjuration', 'transmutation'], tags: ['buff', 'enhance'] },
    'utility': { tags: ['utility', 'ritual'] },
    'summoning': { schools: ['conjuration'], tags: ['summon'] },
    'divination': { schools: ['divination'], tags: ['detection', 'knowledge'] },
    'necromancy': { schools: ['necromancy'] },
    'illusion': { schools: ['illusion'] },
    'protection': { schools: ['abjuration'], tags: ['protection', 'defense'] },
};

/**
 * Translate spell themes to spell selections
 * 
 * @param cantripThemes - Cantrip themes
 * @param spellThemes - Spell themes
 * @param constraints - Spellcasting constraints
 * @returns Spell selection result
 */
export function translateSpellThemes(
    cantripThemes: string[],
    spellThemes: string[],
    constraints: GenerationConstraints['spellcasting'],
    level: number,
    abilityScores?: DnD5eAbilityScores
): SpellTranslationResult {
    if (!constraints) {
        return {
            success: true,
            cantrips: [],
            spells: [],
        };
    }

    const issues: string[] = [];
    const unmatchedThemes: string[] = [];

    // Select cantrips
    const selectedCantrips = selectSpellsByThemes(
        cantripThemes,
        constraints.availableCantrips,
        constraints.cantripsKnown,
        unmatchedThemes
    );

    // Select spells
    let spellCount = constraints.spellsKnown || constraints.spellsPrepared || 0;
    if (constraints.casterType === 'prepared' && constraints.preparedFormula) {
        const abilityKey = constraints.ability;
        const score = abilityScores?.[abilityKey] ?? 10;
        const mod = Math.floor((score - 10) / 2);

        if (constraints.preparedFormula === 'abilityModPlusLevel') {
            spellCount = Math.max(1, mod + level);
        } else if (constraints.preparedFormula === 'abilityModPlusHalfLevel') {
            const halfLevel = Math.floor(level / 2);
            spellCount = Math.max(1, mod + halfLevel);
        }
    }
    const selectedSpells = selectSpellsByThemes(
        spellThemes,
        constraints.availableSpells.filter(s => s.level <= constraints.maxSpellLevel),
        spellCount,
        unmatchedThemes
    );

    if (selectedCantrips.length < constraints.cantripsKnown) {
        issues.push(
            `Only matched ${selectedCantrips.length}/${constraints.cantripsKnown} cantrips`
        );
    }

    if (selectedSpells.length < spellCount) {
        issues.push(
            `Only matched ${selectedSpells.length}/${spellCount} spells`
        );
    }

    return {
        success:
            selectedCantrips.length === constraints.cantripsKnown &&
            selectedSpells.length === spellCount,
        cantrips: selectedCantrips,
        spells: selectedSpells,
        unmatchedThemes: unmatchedThemes.length > 0 ? unmatchedThemes : undefined,
        issues: issues.length > 0 ? issues : undefined,
    };
}

/**
 * Select spells based on themes
 */
function selectSpellsByThemes(
    themes: string[],
    available: GenerationConstraints['spellcasting'] extends undefined
        ? never
        : NonNullable<GenerationConstraints['spellcasting']>['availableSpells'],
    count: number,
    unmatchedThemes: string[]
): string[] {
    const selected: string[] = [];
    const usedSpells = new Set<string>();

    // Score spells by theme match
    const scoredSpells: { spell: typeof available[0], score: number }[] = [];

    for (const spell of available) {
        let score = 0;

        for (const theme of themes) {
            const normalizedTheme = theme.toLowerCase();
            const mapping = SPELL_THEME_MAP[normalizedTheme];

            if (mapping) {
                if (mapping.schools?.includes(spell.school.toLowerCase())) {
                    score += 2;
                }
                if (mapping.tags?.some(tag =>
                    spell.description.toLowerCase().includes(tag) ||
                    spell.name.toLowerCase().includes(tag)
                )) {
                    score += 1;
                }
            } else {
                // Direct name match
                if (spell.name.toLowerCase().includes(normalizedTheme) ||
                    spell.description.toLowerCase().includes(normalizedTheme)) {
                    score += 1;
                }
            }
        }

        scoredSpells.push({ spell, score });
    }

    // Sort by score (highest first), then by level (lower first for variety)
    scoredSpells.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.spell.level - b.spell.level;
    });

    // Select top matches
    for (const { spell } of scoredSpells) {
        if (selected.length >= count) break;
        if (!usedSpells.has(spell.id)) {
            selected.push(spell.id);
            usedSpells.add(spell.id);
        }
    }

    // Fill remaining with any available
    for (const spell of available) {
        if (selected.length >= count) break;
        if (!usedSpells.has(spell.id)) {
            selected.push(spell.id);
            usedSpells.add(spell.id);
        }
    }

    return selected;
}

