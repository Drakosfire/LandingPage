/**
 * Prototype Data Objects for Generation Drawer Engine
 * 
 * These are concrete examples of input/output data structures that services
 * will pass through the engine. They serve as:
 * 
 * 1. **Contracts**: Define the expected shape of data
 * 2. **Examples**: Show how services should structure their data
 * 3. **Validation**: Test the engine with real-world data shapes
 * 4. **Standards**: Establish patterns for future services
 * 
 * These should be flexible initially, but aim to become standards as patterns emerge.
 * 
 * NOTE: This file is a copy of the canonical version in:
 * specs/001-generation-drawer-engine/prototypes.ts
 * 
 * It's duplicated here so Jest can resolve it during tests.
 */

// =============================================================================
// STATBLOCK GENERATOR PROTOTYPES
// =============================================================================

/**
 * StatBlockGenerator Input Prototype
 * 
 * This represents what a user provides to generate a statblock.
 */
export interface StatBlockInput {
    /** Creature description/prompt */
    description: string;
    /** Optional: Creature name */
    name?: string;
    /** Optional: Challenge Rating override */
    challengeRating?: number;
    /** Optional: Specific abilities to include */
    abilities?: string[];
    /** Optional: Environment/biome */
    environment?: string;
}

/**
 * StatBlockGenerator Output Prototype
 * 
 * This represents what the service returns after generation.
 */
export interface StatBlockOutput {
    /** Generated statblock data */
    statblock: {
        name: string;
        size: string;
        type: string;
        alignment: string;
        armorClass: number;
        hitPoints: number;
        speed: string;
        stats: {
            strength: number;
            dexterity: number;
            constitution: number;
            intelligence: number;
            wisdom: number;
            charisma: number;
        };
        skills: string[];
        senses: string;
        languages: string;
        challengeRating: number;
        abilities: Array<{
            name: string;
            description: string;
        }>;
        actions: Array<{
            name: string;
            description: string;
        }>;
    };
    /** Image prompt extracted from input */
    imagePrompt?: string;
    /** Generated images (if any) */
    images?: Array<{
        id: string;
        url: string;
        prompt: string;
    }>;
}

/**
 * StatBlockGenerator Prototype Data - Example Input
 */
export const STATBLOCK_INPUT_EXAMPLE: StatBlockInput = {
    description: "A massive red dragon with ancient scales, breathes fire, hoards gold",
    name: "Ancient Red Dragon",
    challengeRating: 20,
    environment: "Volcanic mountains"
};

/**
 * StatBlockGenerator Prototype Data - Example Output
 */
export const STATBLOCK_OUTPUT_EXAMPLE: StatBlockOutput = {
    statblock: {
        name: "Ancient Red Dragon",
        size: "Gargantuan",
        type: "dragon",
        alignment: "chaotic evil",
        armorClass: 22,
        hitPoints: 546,
        speed: "40 ft., climb 40 ft., fly 80 ft.",
        stats: {
            strength: 30,
            dexterity: 10,
            constitution: 29,
            intelligence: 18,
            wisdom: 15,
            charisma: 23
        },
        skills: ["Perception +17", "Stealth +10"],
        senses: "Blindsight 60 ft., Darkvision 120 ft.",
        languages: "Common, Draconic",
        challengeRating: 20,
        abilities: [
            {
                name: "Legendary Resistance (3/Day)",
                description: "If the dragon fails a saving throw, it can choose to succeed instead."
            }
        ],
        actions: [
            {
                name: "Multiattack",
                description: "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
            },
            {
                name: "Bite",
                description: "Melee Weapon Attack: +17 to hit, reach 15 ft., one target. Hit: 21 (2d10 + 10) piercing damage plus 14 (4d6) fire damage."
            }
        ]
    },
    imagePrompt: "A massive red dragon with ancient scales, breathes fire, hoards gold, in volcanic mountains",
    images: []
};

// =============================================================================
// PLAYER CHARACTER GENERATOR PROTOTYPES
// =============================================================================

/**
 * PlayerCharacterGenerator Input Prototype
 */
export interface PlayerCharacterInput {
    /** Character concept/description */
    concept: string;
    /** Desired class */
    class?: string;
    /** Desired race */
    race?: string;
    /** Desired level */
    level?: number;
    /** Desired background */
    background?: string;
    /** Ability score preferences */
    abilityPreferences?: {
        primary?: string;
        secondary?: string;
    };
}

/**
 * PlayerCharacterGenerator Output Prototype
 */
export interface PlayerCharacterOutput {
    character: {
        name: string;
        race: string;
        class: string;
        level: number;
        background: string;
        alignment: string;
        stats: {
            strength: number;
            dexterity: number;
            constitution: number;
            intelligence: number;
            wisdom: number;
            charisma: number;
        };
        skills: string[];
        proficiencies: string[];
        equipment: string[];
        spells?: Array<{
            name: string;
            level: number;
        }>;
    };
    imagePrompt?: string;
    images?: Array<{
        id: string;
        url: string;
        prompt: string;
    }>;
}

/**
 * PlayerCharacterGenerator Prototype Data - Example Input
 */
export const PLAYER_CHARACTER_INPUT_EXAMPLE: PlayerCharacterInput = {
    concept: "A wise elven wizard who studies ancient magic",
    class: "Wizard",
    race: "Elf",
    level: 5,
    background: "Sage",
    abilityPreferences: {
        primary: "intelligence",
        secondary: "wisdom"
    }
};

/**
 * PlayerCharacterGenerator Prototype Data - Example Output
 */
export const PLAYER_CHARACTER_OUTPUT_EXAMPLE: PlayerCharacterOutput = {
    character: {
        name: "Elara Moonwhisper",
        race: "High Elf",
        class: "Wizard",
        level: 5,
        background: "Sage",
        alignment: "Lawful Neutral",
        stats: {
            strength: 8,
            dexterity: 14,
            constitution: 13,
            intelligence: 18,
            wisdom: 15,
            charisma: 10
        },
        skills: ["Arcana", "History", "Investigation", "Perception"],
        proficiencies: ["Light Armor", "Simple Weapons", "Arcane Focus"],
        equipment: ["Spellbook", "Arcane Focus", "Scholar's Pack"],
        spells: [
            { name: "Magic Missile", level: 1 },
            { name: "Fireball", level: 3 }
        ]
    },
    imagePrompt: "A wise elven wizard who studies ancient magic, high elf, scholarly robes",
    images: []
};

// =============================================================================
// GENERIC/CONFIGURATION PROTOTYPES
// =============================================================================

/**
 * Example Progress Configuration
 * Shows how services should structure progress milestones
 */
export const PROGRESS_CONFIG_EXAMPLE = {
    estimatedDurationMs: 10000,
    milestones: [
        { at: 0, message: "Starting generation..." },
        { at: 25, message: "Analyzing input..." },
        { at: 50, message: "Generating content..." },
        { at: 75, message: "Refining details..." },
        { at: 90, message: "Almost done..." }
    ],
    color: "violet" as const
};

/**
 * Example Tab Configuration
 * Shows how services should structure tabs
 */
export const TAB_CONFIG_EXAMPLE = [
    {
        id: "text",
        label: "Text Generation",
        icon: "📝" as any,
        generationType: "text" as const
    },
    {
        id: "image",
        label: "Image Generation",
        icon: "🖼️" as any,
        generationType: "image" as const
    }
];

/**
 * Example Validation Result
 * Shows the shape of validation responses
 */
export const VALIDATION_RESULT_EXAMPLE = {
    valid: true,
    errors: {} as Record<string, string>
};

export const VALIDATION_RESULT_INVALID_EXAMPLE = {
    valid: false,
    errors: {
        description: "Description is required",
        name: "Name must be at least 3 characters"
    }
};

