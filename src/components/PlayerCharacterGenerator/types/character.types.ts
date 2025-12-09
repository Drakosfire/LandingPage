/**
 * System-agnostic character wrapper
 * 
 * This is the universal character container that works across all RPG systems.
 * It wraps system-specific character data (D&D 5e, Pathfinder, OSR, etc.)
 * 
 * Pattern inspired by DungeonMindObject's flexible type system.
 * 
 * @module CharacterGenerator/types/character
 */

import { RPGSystem, CharacterMetadata } from './system.types';
import { DnD5eCharacter } from './dnd5e/character.types';
import { ValidationError } from './validation.types';

/**
 * Universal character container
 * 
 * Exactly ONE system-specific data field should be populated based on `system`.
 * 
 * Example:
 * ```typescript
 * const thorin: Character = {
 *     id: 'char-12345',
 *     name: 'Thorin Ironforge',
 *     level: 3,
 *     system: 'dnd5e',
 *     dnd5eData: { ... }, // D&D 5e character data
 *     createdAt: '2025-11-03T...',
 *     updatedAt: '2025-11-03T...'
 * };
 * ```
 */
export interface Character {
    // ===== IDENTITY (universal) =====
    id: string;                     // Unique character ID (UUID)
    name: string;                   // Character name
    level: number;                  // Total character level

    // ===== SYSTEM IDENTIFICATION =====
    system: RPGSystem;              // Which RPG system this character uses
    systemVersion?: string;         // Optional version (e.g., '5e', 'OSE', 'PF1')

    // ===== SYSTEM-SPECIFIC DATA (exactly ONE populated) =====
    dnd5eData?: DnD5eCharacter;     // D&D 5e character (Phase 0-1)
    // Future system data:
    // pathfinder1eData?: PathfinderCharacter;
    // pathfinder2eData?: PF2eCharacter;
    // osrData?: OSRCharacter;
    // travellerData?: TravellerCharacter;
    // customData?: Record<string, any>;

    // ===== UNIVERSAL FIELDS (work across all systems) =====
    description?: string;           // Brief character description
    portrait?: string;              // Portrait image URL
    portraitPrompt?: string;        // AI prompt used for portrait
    backstory?: string;             // Character backstory/history
    notes?: string;                 // Player/DM notes
    playerName?: string;            // Name of player (if PC)
    xp?: number;                    // Experience points

    // ===== METADATA (universal) =====
    createdAt: string;              // ISO 8601 timestamp
    updatedAt: string;              // ISO 8601 timestamp
    createdBy?: string;             // User ID who created
    lastModifiedBy?: string;        // User ID who last modified
    version?: number;               // Version number for change tracking
}

/**
 * Type guard to check if character has D&D 5e data
 */
export function isDnD5eCharacter(character: Character): character is Character & { dnd5eData: DnD5eCharacter } {
    return character.system === 'dnd5e' && character.dnd5eData !== undefined;
}

/**
 * Helper to get D&D 5e data safely
 * Throws if character is not a D&D 5e character
 */
export function getDnD5eData(character: Character): DnD5eCharacter {
    if (!isDnD5eCharacter(character)) {
        throw new Error(`Character ${character.id} is not a D&D 5e character (system: ${character.system})`);
    }
    return character.dnd5eData;
}

/**
 * Generate a UUID v4
 * Uses crypto.randomUUID() in browser, fallback for Node/Jest
 */
function generateUUID(): string {
    // Try browser crypto API first
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    // Fallback for Node.js/Jest environments
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Empty character template (D&D 5e by default in Phase 0)
 * Used for initializing new characters
 */
export function createEmptyCharacter(): Character {
    const now = new Date().toISOString();
    return {
        id: generateUUID(),
        name: 'New Character',
        level: 1,
        system: 'dnd5e',
        dnd5eData: undefined, // Will be populated by D&D 5e creation workflow
        createdAt: now,
        updatedAt: now,
        version: 1
    };
}

/**
 * Character creation workflow state
 * Tracks which steps have been completed
 */
export interface CharacterCreationState {
    character: Character;
    currentStep: number;            // 0-5 (or more for different systems)
    completedSteps: number[];       // List of completed step indices
    validationErrors: ValidationError[];
}

/**
 * Character export format options
 */
export type ExportFormat = 'pdf' | 'json' | 'html' | 'foundry' | 'roll20';

/**
 * Character import/export metadata
 */
export interface CharacterExportData {
    character: Character;
    exportedAt: string;
    exportedBy?: string;
    exportFormat: ExportFormat;
    schemaVersion: string;          // For future schema migrations
}

