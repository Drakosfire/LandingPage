/**
 * Prompt Builder for AI Character Generation
 * 
 * Builds prompts that inject constraints from the Rule Engine and
 * request structured preferences from the AI.
 * 
 * Key principle: The prompt provides ALL valid options explicitly.
 * AI picks from constrained lists, not from internal knowledge.
 * 
 * @module CharacterGenerator/generation/promptBuilder
 */

import {
    GenerationInput,
    GenerationConstraints,
    AiPreferences,
    AbilityName,
} from './types';
import { getRaceById } from '../data/dnd5e/races';

// ============================================================================
// PROMPT TEMPLATES
// ============================================================================

/**
 * System prompt that establishes AI behavior
 */
export const SYSTEM_PROMPT = `You are a D&D 5e character creation assistant. Your job is to express CHARACTER PREFERENCES based on a concept.

CRITICAL RULES:
1. You express PREFERENCES and THEMES, not exact mechanical values
2. All abilities must be ranked in priority order (all 6, highest first)
3. Skill themes should describe what the character is good at, not specific skill names
4. Equipment style describes the look and feel, not specific items
5. Your output must be valid JSON matching the exact schema provided

You are creative and evocative, but you work WITHIN the constraints provided.`;

/**
 * Build the complete prompt for preference generation
 */
export function buildPreferencePrompt(
    input: GenerationInput,
    constraints: GenerationConstraints
): string {
    const sections: string[] = [];

    // Section 1: Character Foundation (what user chose)
    sections.push(formatFoundationSection(input, constraints));

    // Section 2: Available Options (what AI can reference)
    sections.push(formatOptionsSection(constraints));

    // Section 3: Output Schema (what AI must produce)
    sections.push(formatOutputSchema(constraints));

    // Section 4: The actual request
    sections.push(formatRequest(input));

    return sections.join('\n\n');
}

// ============================================================================
// SECTION FORMATTERS
// ============================================================================

/**
 * Format the character foundation section
 */
function formatFoundationSection(
    input: GenerationInput,
    constraints: GenerationConstraints
): string {
    const lines: string[] = [
        '## CHARACTER FOUNDATION (Fixed by Player)',
        '',
        `**Class:** ${constraints.class.name}`,
    ];

    // Format race display: show subrace if selected, otherwise base race
    let raceDisplay = constraints.race.name;
    if (input.subraceId) {
        // Look up the subrace to get base race name for context
        const subraceData = getRaceById(input.subraceId);
        if (subraceData?.baseRace) {
            const baseRaceData = getRaceById(subraceData.baseRace);
            const baseRaceName = baseRaceData?.name || subraceData.baseRace;
            raceDisplay = `${constraints.race.name} (${baseRaceName})`;
        }
    }
    lines.push(`**Race:** ${raceDisplay}`);

    lines.push(`**Level:** ${input.level}`);
    lines.push(`**Background:** ${constraints.background.name}`);

    if (constraints.subclass) {
        lines.push(`**Subclass:** ${constraints.subclass.name}`);
    }

    // Add key class info
    lines.push('');
    lines.push(`**Hit Die:** d${constraints.class.hitDie}`);
    lines.push(`**Primary Abilities:** ${constraints.class.primaryAbilities.join(', ')}`);

    // Add racial bonuses
    const bonuses = Object.entries(constraints.race.abilityBonuses)
        .filter(([_, v]) => v && v > 0)
        .map(([ability, bonus]) => `${ability} +${bonus}`)
        .join(', ');
    if (bonuses) {
        lines.push(`**Racial Bonuses:** ${bonuses}`);
    }

    return lines.join('\n');
}

/**
 * Format the available options section
 */
function formatOptionsSection(constraints: GenerationConstraints): string {
    const sections: string[] = ['## AVAILABLE OPTIONS'];

    // Skills
    sections.push('');
    sections.push('### Skills');
    sections.push(`Background grants: ${constraints.skills.grantedByBackground.join(', ')}`);
    sections.push(`Choose ${constraints.skills.chooseCount} from: ${constraints.skills.classOptions.join(', ')}`);

    // Equipment
    sections.push('');
    sections.push('### Equipment Packages');
    for (const pkg of constraints.equipment.packages) {
        sections.push(`- **${pkg.id}:** ${pkg.description}`);
    }

    // Feature choices
    if (constraints.featureChoices.length > 0) {
        sections.push('');
        sections.push('### Class Feature Choices');
        for (const feature of constraints.featureChoices) {
            sections.push(`**${feature.featureName}:** Choose one:`);
            for (const option of feature.options) {
                sections.push(`  - ${option.name}: ${option.description}`);
            }
        }
    }

    // Spellcasting
    if (constraints.spellcasting) {
        sections.push('');
        sections.push('### Spellcasting');
        sections.push(`Spellcasting Ability: ${constraints.spellcasting.ability}`);
        sections.push(`Cantrips Known: ${constraints.spellcasting.cantripsKnown}`);

        if (constraints.spellcasting.spellsKnown) {
            sections.push(`Spells Known: ${constraints.spellcasting.spellsKnown}`);
        }
        if (constraints.spellcasting.spellsPrepared) {
            sections.push(`Spells Prepared: ${constraints.spellcasting.spellsPrepared}`);
        }

        sections.push('');
        sections.push('**Available Cantrips:**');
        for (const cantrip of constraints.spellcasting.availableCantrips.slice(0, 15)) {
            sections.push(`- ${cantrip.name} (${cantrip.school}): ${cantrip.description}`);
        }
        if (constraints.spellcasting.availableCantrips.length > 15) {
            sections.push(`... and ${constraints.spellcasting.availableCantrips.length - 15} more`);
        }

        sections.push('');
        sections.push('**Available Spells:**');
        for (const spell of constraints.spellcasting.availableSpells.slice(0, 20)) {
            sections.push(`- ${spell.name} (Level ${spell.level}, ${spell.school}): ${spell.description}`);
        }
        if (constraints.spellcasting.availableSpells.length > 20) {
            sections.push(`... and ${constraints.spellcasting.availableSpells.length - 20} more`);
        }
    }

    return sections.join('\n');
}

/**
 * Format the output schema section
 */
function formatOutputSchema(constraints: GenerationConstraints): string {
    const hasSpellcasting = !!constraints.spellcasting;
    const hasFeatureChoices = constraints.featureChoices.length > 0;
    const hasFightingStyle = constraints.featureChoices.some(f => f.featureId === 'fighting-style');

    let schema = `## OUTPUT FORMAT

Respond with ONLY valid JSON matching this exact structure:

\`\`\`json
{
  "abilityPriorities": ["ability1", "ability2", "ability3", "ability4", "ability5", "ability6"],
  "abilityReasoning": "Brief explanation of why these priorities fit the character concept",
  
  "combatApproach": "Description of how this character fights (e.g., 'Defensive tank who protects allies')",
  "skillThemes": ["theme1", "theme2", "theme3"],
  
  "equipmentStyle": "Description of preferred equipment (e.g., 'Heavy armor with shield for maximum protection')"`;

    if (hasFightingStyle) {
        schema += `,
  
  "fightingStylePreference": {
    "id": "style-id",
    "reasoning": "Why this fighting style fits"
  }`;
    }

    if (hasFeatureChoices) {
        schema += `,
  
  "featureChoicePreferences": {
    "feature-id": {
      "optionId": "chosen-option-id",
      "reasoning": "Why this option fits"
    }
  }`;
    }

    if (hasSpellcasting) {
        schema += `,
  
  "cantripThemes": ["theme1", "theme2"],
  "spellThemes": ["theme1", "theme2", "theme3"]`;
    }

    schema += `,
  
  "character": {
    "name": "Character Name",
    "personality": {
      "traits": ["Personality trait 1", "Personality trait 2"],
      "ideals": ["What the character believes in"],
      "bonds": ["What connects the character to the world"],
      "flaws": ["Character weakness or vice"]
    },
    "backstory": "2-4 paragraphs of character history that connects to the concept and explains their current situation.",
    "appearance": "Physical description of the character",
    "age": 25
  }
}
\`\`\`

### Ability Priority Rules
- List ALL SIX abilities in order from highest to lowest priority
- Valid abilities: strength, dexterity, constitution, intelligence, wisdom, charisma
- Consider the class's primary abilities: ${constraints.class.primaryAbilities.join(', ')}
- Consider racial bonuses when prioritizing

### Skill Theme Examples
Good themes: "physical prowess", "stealth and subterfuge", "social manipulation", "arcane knowledge", "wilderness survival", "keen observation"
Bad themes: "Athletics" (too specific), "good at stuff" (too vague)

### Equipment Style Examples
Good: "Heavy armor and shield, favoring defense over offense"
Good: "Light and mobile, preferring ranged combat"
Bad: "Chain mail" (too specific - we pick the package)`;

    return schema;
}

/**
 * Format the actual request with the concept
 */
function formatRequest(input: GenerationInput): string {
    return `## CHARACTER CONCEPT

"${input.concept}"

---

Based on this concept and the constraints above, generate the character preferences JSON. Be creative with the backstory and personality, but stay true to the concept. Remember: express PREFERENCES and THEMES, we will translate them to valid mechanical choices.`;
}

// ============================================================================
// CONSTRAINT FORMATTERS (for Rule Engine integration)
// ============================================================================

/**
 * Format skill options for the prompt
 */
export function formatSkillOptions(
    classSkills: string[],
    backgroundSkills: string[],
    chooseCount: number
): string {
    const lines: string[] = [];
    lines.push(`Background grants: ${backgroundSkills.join(', ')}`);
    lines.push(`Choose ${chooseCount} from class options: ${classSkills.join(', ')}`);
    return lines.join('\n');
}

/**
 * Format equipment packages for the prompt
 */
export function formatEquipmentOptions(
    packages: GenerationConstraints['equipment']['packages']
): string {
    return packages
        .map(pkg => `- ${pkg.id}: ${pkg.description}`)
        .join('\n');
}

/**
 * Format feature choices for the prompt
 */
export function formatFeatureChoices(
    choices: GenerationConstraints['featureChoices']
): string {
    if (choices.length === 0) return '';

    const sections: string[] = [];
    for (const feature of choices) {
        sections.push(`**${feature.featureName}:** Choose one:`);
        for (const option of feature.options) {
            sections.push(`  - ${option.id} (${option.name}): ${option.description}`);
        }
    }
    return sections.join('\n');
}

/**
 * Format spell list for the prompt
 */
export function formatSpellList(
    spells: GenerationConstraints['spellcasting'] extends undefined
        ? never
        : NonNullable<GenerationConstraints['spellcasting']>['availableSpells'],
    maxDisplay: number = 20
): string {
    const displayed = spells.slice(0, maxDisplay);
    const lines = displayed.map(
        spell => `- ${spell.name} (L${spell.level}, ${spell.school}): ${spell.description}`
    );

    if (spells.length > maxDisplay) {
        lines.push(`... and ${spells.length - maxDisplay} more options`);
    }

    return lines.join('\n');
}

// ============================================================================
// RESPONSE PARSING
// ============================================================================

/**
 * Parse AI response into AiPreferences
 * 
 * @param response - Raw response from AI
 * @returns Parsed preferences or null if parsing failed
 */
export function parseAiResponse(response: string): AiPreferences | null {
    try {
        // Try to extract JSON from response
        let jsonStr = response.trim();

        // Handle markdown code blocks
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1].trim();
        }

        // Parse JSON
        const parsed = JSON.parse(jsonStr);

        // Validate required fields exist
        if (!parsed.abilityPriorities || !Array.isArray(parsed.abilityPriorities)) {
            console.error('Missing or invalid abilityPriorities');
            return null;
        }

        if (!parsed.character || !parsed.character.name) {
            console.error('Missing character or character.name');
            return null;
        }

        // Normalize ability priorities to lowercase
        parsed.abilityPriorities = parsed.abilityPriorities.map(
            (a: string) => a.toLowerCase() as AbilityName
        );

        // Ensure all 6 abilities are present
        const validAbilities: AbilityName[] = [
            'strength', 'dexterity', 'constitution',
            'intelligence', 'wisdom', 'charisma'
        ];
        const missing = validAbilities.filter(
            a => !parsed.abilityPriorities.includes(a)
        );
        if (missing.length > 0) {
            // Add missing abilities at the end
            parsed.abilityPriorities = [
                ...parsed.abilityPriorities.filter((a: string) => validAbilities.includes(a as AbilityName)),
                ...missing
            ];
        }

        // Ensure personality structure
        if (!parsed.character.personality) {
            parsed.character.personality = {};
        }

        return parsed as AiPreferences;
    } catch (error) {
        console.error('Failed to parse AI response:', error);
        console.error('Raw response:', response.substring(0, 500));
        return null;
    }
}

/**
 * Validate parsed preferences
 */
export function validatePreferences(prefs: AiPreferences): string[] {
    const issues: string[] = [];

    // Check ability priorities
    if (prefs.abilityPriorities.length !== 6) {
        issues.push(`Expected 6 ability priorities, got ${prefs.abilityPriorities.length}`);
    }

    // Check for duplicate abilities
    const uniqueAbilities = new Set(prefs.abilityPriorities);
    if (uniqueAbilities.size !== prefs.abilityPriorities.length) {
        issues.push('Duplicate abilities in priority list');
    }

    // Check skill themes exist
    if (!prefs.skillThemes || prefs.skillThemes.length === 0) {
        issues.push('No skill themes provided');
    }

    // Check equipment style exists
    if (!prefs.equipmentStyle) {
        issues.push('No equipment style provided');
    }

    // Check character basics
    if (!prefs.character.name) {
        issues.push('No character name provided');
    }
    if (!prefs.character.backstory) {
        issues.push('No backstory provided');
    }

    return issues;
}

// ============================================================================
// MOCK CONSTRAINTS (for testing without Rule Engine)
// ============================================================================

/**
 * Create mock constraints for a fighter
 */
export function createMockFighterConstraints(): GenerationConstraints {
    return {
        class: {
            id: 'fighter',
            name: 'Fighter',
            hitDie: 10,
            primaryAbilities: ['strength', 'constitution'],
        },
        race: {
            id: 'human',
            name: 'Human',
            abilityBonuses: {
                strength: 1,
                dexterity: 1,
                constitution: 1,
                intelligence: 1,
                wisdom: 1,
                charisma: 1,
            },
            traits: ['Extra Language', 'Extra Skill'],
        },
        background: {
            id: 'soldier',
            name: 'Soldier',
            grantedSkills: ['Athletics', 'Intimidation'],
        },
        skills: {
            grantedByBackground: ['Athletics', 'Intimidation'],
            classOptions: [
                'Acrobatics', 'Animal Handling', 'Athletics', 'History',
                'Insight', 'Intimidation', 'Perception', 'Survival'
            ],
            chooseCount: 2,
            overlapHandling: 'free-choice',
        },
        equipment: {
            packages: [
                {
                    id: 'A',
                    description: 'Chain mail, martial weapon and shield, light crossbow with 20 bolts',
                    items: ['chain-mail', 'longsword', 'shield', 'light-crossbow', 'bolts-20'],
                },
                {
                    id: 'B',
                    description: 'Leather armor, longbow with 20 arrows, two martial weapons',
                    items: ['leather-armor', 'longbow', 'arrows-20', 'longsword', 'shortsword'],
                },
            ],
        },
        featureChoices: [
            {
                featureId: 'fighting-style',
                featureName: 'Fighting Style',
                description: 'Choose a fighting style specialty',
                options: [
                    { id: 'archery', name: 'Archery', description: '+2 bonus to attack rolls with ranged weapons' },
                    { id: 'defense', name: 'Defense', description: '+1 bonus to AC when wearing armor' },
                    { id: 'dueling', name: 'Dueling', description: '+2 damage when wielding one-handed weapon' },
                    { id: 'great-weapon', name: 'Great Weapon Fighting', description: 'Reroll 1s and 2s on damage dice with two-handed weapons' },
                    { id: 'protection', name: 'Protection', description: 'Impose disadvantage on attacks against adjacent allies' },
                    { id: 'two-weapon', name: 'Two-Weapon Fighting', description: 'Add ability modifier to off-hand damage' },
                ],
            },
        ],
    };
}

/**
 * Create mock constraints for a wizard
 */
export function createMockWizardConstraints(): GenerationConstraints {
    return {
        class: {
            id: 'wizard',
            name: 'Wizard',
            hitDie: 6,
            primaryAbilities: ['intelligence'],
        },
        race: {
            id: 'human',
            name: 'Human',
            abilityBonuses: {
                strength: 1,
                dexterity: 1,
                constitution: 1,
                intelligence: 1,
                wisdom: 1,
                charisma: 1,
            },
            traits: ['Extra Language', 'Extra Skill'],
        },
        background: {
            id: 'sage',
            name: 'Sage',
            grantedSkills: ['Arcana', 'History'],
        },
        skills: {
            grantedByBackground: ['Arcana', 'History'],
            classOptions: [
                'Arcana', 'History', 'Insight', 'Investigation',
                'Medicine', 'Religion'
            ],
            chooseCount: 2,
            overlapHandling: 'free-choice',
        },
        equipment: {
            packages: [
                {
                    id: 'A',
                    description: 'Quarterstaff, component pouch, scholar\'s pack, spellbook',
                    items: ['quarterstaff', 'component-pouch', 'scholars-pack', 'spellbook'],
                },
                {
                    id: 'B',
                    description: 'Dagger, arcane focus, explorer\'s pack, spellbook',
                    items: ['dagger', 'arcane-focus', 'explorers-pack', 'spellbook'],
                },
            ],
        },
        featureChoices: [],
        spellcasting: {
            ability: 'intelligence',
            cantripsKnown: 3,
            spellsKnown: 6,  // Wizard spellbook at level 1
            maxSpellLevel: 1,
            availableCantrips: [
                { id: 'fire-bolt', name: 'Fire Bolt', level: 0, school: 'Evocation', description: 'Hurl a mote of fire at a creature' },
                { id: 'ray-of-frost', name: 'Ray of Frost', level: 0, school: 'Evocation', description: 'A frigid beam of blue-white light' },
                { id: 'light', name: 'Light', level: 0, school: 'Evocation', description: 'Touch an object to make it shed bright light' },
                { id: 'mage-hand', name: 'Mage Hand', level: 0, school: 'Conjuration', description: 'Create a spectral floating hand' },
                { id: 'prestidigitation', name: 'Prestidigitation', level: 0, school: 'Transmutation', description: 'Minor magical tricks' },
                { id: 'minor-illusion', name: 'Minor Illusion', level: 0, school: 'Illusion', description: 'Create a sound or image' },
                { id: 'shocking-grasp', name: 'Shocking Grasp', level: 0, school: 'Evocation', description: 'Lightning springs from your hand' },
                { id: 'chill-touch', name: 'Chill Touch', level: 0, school: 'Necromancy', description: 'Ghostly skeletal hand assails your foe' },
            ],
            availableSpells: [
                { id: 'magic-missile', name: 'Magic Missile', level: 1, school: 'Evocation', description: 'Three darts of magical force' },
                { id: 'shield', name: 'Shield', level: 1, school: 'Abjuration', description: '+5 AC as a reaction' },
                { id: 'mage-armor', name: 'Mage Armor', level: 1, school: 'Abjuration', description: 'Base AC becomes 13 + DEX' },
                { id: 'sleep', name: 'Sleep', level: 1, school: 'Enchantment', description: 'Put creatures into magical slumber' },
                { id: 'charm-person', name: 'Charm Person', level: 1, school: 'Enchantment', description: 'Charm a humanoid' },
                { id: 'detect-magic', name: 'Detect Magic', level: 1, school: 'Divination', description: 'Sense presence of magic' },
                { id: 'find-familiar', name: 'Find Familiar', level: 1, school: 'Conjuration', description: 'Summon a spirit in animal form' },
                { id: 'burning-hands', name: 'Burning Hands', level: 1, school: 'Evocation', description: 'Cone of fire damage' },
                { id: 'thunderwave', name: 'Thunderwave', level: 1, school: 'Evocation', description: 'Wave of thunder pushes creatures' },
                { id: 'identify', name: 'Identify', level: 1, school: 'Divination', description: 'Learn properties of a magic item' },
            ],
        },
    };
}

/**
 * Get mock constraints by class ID
 */
export function getMockConstraints(classId: string): GenerationConstraints {
    switch (classId) {
        case 'wizard':
            return createMockWizardConstraints();
        case 'fighter':
        default:
            return createMockFighterConstraints();
    }
}

