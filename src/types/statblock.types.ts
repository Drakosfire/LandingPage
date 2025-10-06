// StatBlock Generator Type Definitions
// Following patterns from card.types.ts but adapted for D&D 5e creatures

export type CreatureSize = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';

export type CreatureType =
    | 'aberration' | 'beast' | 'celestial' | 'construct' | 'dragon' | 'elemental'
    | 'fey' | 'fiend' | 'giant' | 'humanoid' | 'monstrosity' | 'ooze'
    | 'plant' | 'undead';

export type Alignment =
    | 'lawful good' | 'neutral good' | 'chaotic good'
    | 'lawful neutral' | 'true neutral' | 'chaotic neutral'
    | 'lawful evil' | 'neutral evil' | 'chaotic evil'
    | 'unaligned';

export interface AbilityScores {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
}

export interface SpeedObject {
    walk?: number;
    fly?: number;
    swim?: number;
    climb?: number;
    burrow?: number;
}

export interface SensesObject {
    [sense: string]: number | undefined;
    blindsight?: number;
    darkvision?: number;
    tremorsense?: number;
    truesight?: number;
    passivePerception: number;
}

export interface SavingThrows {
    str?: number;
    dex?: number;
    con?: number;
    int?: number;
    wis?: number;
    cha?: number;
}

export interface Skills {
    acrobatics?: number;
    animalHandling?: number;
    arcana?: number;
    athletics?: number;
    deception?: number;
    history?: number;
    insight?: number;
    intimidation?: number;
    investigation?: number;
    medicine?: number;
    nature?: number;
    perception?: number;
    performance?: number;
    persuasion?: number;
    religion?: number;
    sleightOfHand?: number;
    stealth?: number;
    survival?: number;
}

export interface Action {
    id: string; // Backend-generated on creation, required for stable keys
    name: string;
    desc: string;
    attackBonus?: number;
    damage?: string;
    damageType?: string;
    range?: string;
    recharge?: string; // "5-6", "6", etc.
    usage?: string;
    location?: {
        page: number;
        column: 1 | 2;
    };
}

export interface Spell {
    id: string; // Backend-generated on creation, required for stable keys
    name: string;
    level: number;
    school?: string;
    usage?: string;
    description?: string;
}

export interface SpellSlots {
    slot1?: number;
    slot2?: number;
    slot3?: number;
    slot4?: number;
    slot5?: number;
    slot6?: number;
    slot7?: number;
    slot8?: number;
    slot9?: number;
}

export interface SpellcastingBlock {
    level: number;
    ability: string;
    save: number;
    attack: number;
    cantrips?: Spell[];
    knownSpells?: Spell[];
    spellSlots: SpellSlots;
}

export interface LegendaryActionsBlock {
    actionsPerTurn: number;
    actions: Action[];
    description?: string;
}

export interface LairActionsBlock {
    description: string;
    actions: Action[];
}

// Main StatBlock interface - matches backend Pydantic model
export interface StatBlockDetails {
    // Basic Information
    name: string;
    size: CreatureSize;
    type: CreatureType;
    subtype?: string;
    alignment: Alignment;

    // Combat Statistics
    armorClass: number;
    hitPoints: number;
    hitDice: string;
    speed: SpeedObject;

    // Ability Scores
    abilities: AbilityScores;
    savingThrows?: SavingThrows;
    skills?: Skills;

    // Resistances and Senses
    damageResistance?: string;
    damageImmunity?: string;
    conditionImmunity?: string;
    damageVulnerability?: string;
    senses: SensesObject;
    languages: string;

    // Challenge and Experience
    challengeRating: number | string; // Supports fractions like "1/4", "1/2"
    xp: number;
    proficiencyBonus?: number;

    // Actions and Abilities
    actions: Action[];
    bonusActions?: Action[];
    reactions?: Action[];
    spells?: SpellcastingBlock;
    legendaryActions?: LegendaryActionsBlock;
    lairActions?: LairActionsBlock;
    specialAbilities?: Action[];

    // Descriptive Content
    description: string;
    sdPrompt: string;

    // Project Integration
    projectId?: string;
    createdAt?: string;
    lastModified?: string;
    tags?: string[];
}

export interface CreatureGenerationResponse {
    success: boolean;
    data: {
        statblock: StatBlockDetails;
        generation_info: Record<string, unknown>;
    };
    timestamp: string;
}

// Generated content types (following card.types.ts patterns)
export interface GeneratedImage {
    url: string;
    id: string;
    prompt?: string;
    timestamp?: string;
}

export interface Generated3DModel {
    url: string;
    id: string;
    sourceImageId: string;
    timestamp: string;
    format: 'glb' | 'obj' | 'fbx';
}

export interface GeneratedExport {
    url: string;
    id: string;
    format: 'html' | 'pdf' | 'json' | 'xml' | 'roll20' | 'foundry';
    timestamp: string;
}

// StatBlock Generator State (following CardGeneratorState patterns)
export interface StatBlockGeneratorState {
    currentStepId: string;
    stepCompletion: Record<string, boolean>;
    creatureDetails: StatBlockDetails;
    selectedAssets: {
        creatureImage?: string;
        selectedImageIndex?: number;
        generatedImages: string[];
        modelFile?: string;
    };
    generatedContent: {
        images: GeneratedImage[];
        models: Generated3DModel[];
        exports: GeneratedExport[];
    };
    autoSaveEnabled: boolean;
    lastSaved?: string;
}

// Project types for StatBlocks
export interface StatBlockProject {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    lastModified: string;
    state: StatBlockGeneratorState;
    metadata: {
        version: string;
        platform: string;
        creatureCount?: number;
        totalCR?: number;
        [key: string]: any;
    };
}

export interface StatBlockProjectSummary {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    lastModified: string;
    updatedAt: string;
    creatureCount: number;
    averageCR: number;
    totalCR: number;
}

export interface CreateStatBlockProjectData {
    name: string;
    description?: string;
}

// Helper interfaces for UI components
export interface AbilityScoreEditorProps {
    abilities: AbilityScores;
    onChange: (abilities: AbilityScores) => void;
    disabled?: boolean;
}

export interface ActionEditorProps {
    actions: Action[];
    onChange: (actions: Action[]) => void;
    title?: string;
    disabled?: boolean;
}

export interface StatBlockPreviewProps {
    statblock: StatBlockDetails;
    image?: string;
    showImage?: boolean;
}

// Step component prop interfaces
export interface StatBlockStepProps {
    onNext?: () => void;
    onPrevious?: () => void;
    canGoNext?: boolean;
    canGoPrevious?: boolean;
    currentStepIndex?: number;
    totalSteps?: number;
    onGenerationLockChange?: (isLocked: boolean) => void;
}

// Validation types
export interface ValidationError {
    field: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
    suggestions: ValidationError[];
}

// Challenge Rating calculation helpers
export interface CRCalculationInput {
    hitPoints: number;
    armorClass: number;
    averageDamagePerRound: number;
    attackBonus: number;
    saveDC?: number;
    specialAbilities?: string[];
}

export interface CRCalculationResult {
    defensiveCR: number;
    offensiveCR: number;
    finalCR: number | string;
    explanation: string;
    suggestions: string[];
}

// Default/initial state helpers
export const createInitialStatBlockDetails = (): StatBlockDetails => ({
    name: '',
    size: 'Medium',
    type: 'humanoid',
    alignment: 'true neutral',
    armorClass: 10,
    hitPoints: 4,
    hitDice: '1d8',
    speed: { walk: 30 },
    abilities: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10
    },
    senses: {
        passivePerception: 10
    },
    languages: 'Common',
    challengeRating: '1/8',
    xp: 25,
    actions: [],
    description: '',
    sdPrompt: ''
});

export const createInitialStatBlockState = (): StatBlockGeneratorState => ({
    currentStepId: 'creature-description',
    stepCompletion: {},
    creatureDetails: createInitialStatBlockDetails(),
    selectedAssets: {
        generatedImages: []
    },
    generatedContent: {
        images: [],
        models: [],
        exports: []
    },
    autoSaveEnabled: true
});
