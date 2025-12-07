/**
 * D&D 5e spell types
 * 
 * Defines spell structures for D&D 5th Edition spellcasting.
 * 
 * @module CharacterGenerator/types/dnd5e/spell
 */

import { DamageType } from '../system.types';

/**
 * D&D 5e spell
 */
export interface DnD5eSpell {
    id: string;                      // Unique spell ID (e.g., 'fireball')
    name: string;                    // Spell name (e.g., 'Fireball')
    level: number;                   // Spell level (0-9, where 0 = cantrip)
    school: SpellSchool;             // School of magic
    
    // Casting
    castingTime: string;             // Casting time (e.g., '1 action', '1 bonus action', '10 minutes')
    range: string;                   // Range (e.g., '120 feet', 'Self', 'Touch')
    components: {
        verbal: boolean;             // Verbal component (V)
        somatic: boolean;            // Somatic component (S)
        material: boolean;           // Material component (M)
        materialDescription?: string; // Material components needed
        consumesMaterial?: boolean;  // Whether material is consumed
    };
    duration: string;                // Duration (e.g., 'Instantaneous', 'Concentration, up to 1 minute')
    
    // Effects
    description: string;             // Full spell description
    higherLevels?: string;           // Effect when cast at higher levels
    
    // Optional spell properties
    ritual?: boolean;                // Can be cast as a ritual
    concentration?: boolean;         // Requires concentration
    
    // Damage/healing (if applicable)
    damage?: {
        type: DamageType;
        dice: string;                // e.g., '8d6'
    };
    healing?: {
        dice: string;                // e.g., '1d8'
    };
    
    // Spell lists (which classes can learn this spell)
    classes: string[];               // Class IDs that have this spell
    
    // Source
    source: string;                  // Source book (e.g., 'PHB', 'SRD')

    // Optional visual
    imageUrl?: string;               // URL to spell art
}

/**
 * D&D 5e schools of magic
 */
export type SpellSchool = 
    | 'abjuration'
    | 'conjuration'
    | 'divination'
    | 'enchantment'
    | 'evocation'
    | 'illusion'
    | 'necromancy'
    | 'transmutation';

/**
 * Helper: Check if spell is a cantrip
 */
export function isCantrip(spell: DnD5eSpell): boolean {
    return spell.level === 0;
}

/**
 * Helper: Get spell components as string (e.g., 'V, S, M')
 */
export function getComponentsString(spell: DnD5eSpell): string {
    const components: string[] = [];
    if (spell.components.verbal) components.push('V');
    if (spell.components.somatic) components.push('S');
    if (spell.components.material) {
        components.push('M');
    }
    return components.join(', ');
}

/**
 * Helper: Filter spells by level
 */
export function filterSpellsByLevel(spells: DnD5eSpell[], level: number): DnD5eSpell[] {
    return spells.filter(spell => spell.level === level);
}

/**
 * Helper: Filter spells by class
 */
export function filterSpellsByClass(spells: DnD5eSpell[], className: string): DnD5eSpell[] {
    return spells.filter(spell => spell.classes.includes(className.toLowerCase()));
}

/**
 * Helper: Filter spells by school
 */
export function filterSpellsBySchool(spells: DnD5eSpell[], school: SpellSchool): DnD5eSpell[] {
    return spells.filter(spell => spell.school === school);
}

/**
 * Helper: Check if spell requires concentration
 */
export function requiresConcentration(spell: DnD5eSpell): boolean {
    return spell.concentration === true || spell.duration.toLowerCase().includes('concentration');
}

/**
 * Helper: Check if spell is a ritual
 */
export function isRitual(spell: DnD5eSpell): boolean {
    return spell.ritual === true;
}

