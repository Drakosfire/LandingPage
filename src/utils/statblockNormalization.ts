/**
 * StatBlock Data Normalization Utilities
 * 
 * Ensures all list items have stable IDs for React keys and editing.
 * Follows backend-first pattern: prefer backend-generated IDs, fallback to frontend generation.
 */

import { v4 as uuidv4 } from 'uuid';
import type { Action, Spell, StatBlockDetails } from '../types/statblock.types';

/**
 * Ensure action has ID
 * Prefer backend-generated ID, fallback to frontend generation
 */
export function ensureActionId(action: Partial<Action>): Action {
    return {
        id: action.id || uuidv4(), // Fallback only if backend didn't provide
        name: action.name || '',
        desc: action.desc || '',
        attackBonus: action.attackBonus,
        damage: action.damage,
        damageType: action.damageType,
        range: action.range,
        recharge: action.recharge,
        usage: action.usage,
        location: action.location,
    };
}

/**
 * Ensure spell has ID
 * Prefer backend-generated ID, fallback to frontend generation
 */
export function ensureSpellId(spell: Partial<Spell>): Spell {
    return {
        id: spell.id || uuidv4(), // Fallback only if backend didn't provide
        name: spell.name || '',
        level: spell.level ?? 0,
        school: spell.school,
        usage: spell.usage,
        description: spell.description,
    };
}

/**
 * Normalize entire statblock (called on data load)
 * Ensures all list items have stable IDs
 */
export function normalizeStatblock(raw: Partial<StatBlockDetails>): StatBlockDetails {
    // Ensure all actions have IDs
    const actions = (raw.actions || []).map(ensureActionId);
    const bonusActions = (raw.bonusActions || []).map(ensureActionId);
    const reactions = (raw.reactions || []).map(ensureActionId);
    const specialAbilities = (raw.specialAbilities || []).map(ensureActionId);

    // Ensure all spells have IDs
    const spells = raw.spells ? {
        ...raw.spells,
        cantrips: (raw.spells.cantrips || []).map(ensureSpellId),
        knownSpells: (raw.spells.knownSpells || []).map(ensureSpellId),
    } : undefined;

    // Ensure legendary actions have IDs
    const legendaryActions = raw.legendaryActions ? {
        ...raw.legendaryActions,
        actions: (raw.legendaryActions.actions || []).map(ensureActionId),
    } : undefined;

    // Ensure lair actions have IDs
    const lairActions = raw.lairActions ? {
        ...raw.lairActions,
        actions: (raw.lairActions.actions || []).map(ensureActionId),
    } : undefined;

    return {
        ...raw,
        actions,
        bonusActions,
        reactions,
        specialAbilities,
        spells,
        legendaryActions,
        lairActions,
    } as StatBlockDetails;
}

/**
 * Create a new action with frontend-generated ID
 * Backend will replace ID on save
 */
export function createNewAction(partial: Partial<Action> = {}): Action {
    return {
        id: uuidv4(), // Temporary frontend ID, backend will replace on save
        name: partial.name || 'New Action',
        desc: partial.desc || 'Description',
        attackBonus: partial.attackBonus,
        damage: partial.damage,
        damageType: partial.damageType,
        range: partial.range,
        recharge: partial.recharge,
        usage: partial.usage,
        location: partial.location,
    };
}

/**
 * Create a new spell with frontend-generated ID
 * Backend will replace ID on save
 */
export function createNewSpell(partial: Partial<Spell> = {}): Spell {
    return {
        id: uuidv4(), // Temporary frontend ID, backend will replace on save
        name: partial.name || 'New Spell',
        level: partial.level ?? 0,
        school: partial.school,
        usage: partial.usage,
        description: partial.description,
    };
}

/**
 * Create default empty statblock with no IDs needed (empty arrays)
 */
export function createDefaultStatblock(): StatBlockDetails {
    return {
        name: 'New Creature',
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
            cha: 10,
        },
        senses: {
            passivePerception: 10,
        },
        languages: 'Common',
        challengeRating: '1/8',
        xp: 25,
        actions: [], // Empty lists, will get IDs when user adds items
        description: '',
        sdPrompt: '',
    };
}
