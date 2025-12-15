import type { Character } from '../types/character.types';

function compactWhitespace(input: string): string {
    return input.replace(/\s+/g, ' ').trim();
}

function pickFirstNonEmpty(...values: Array<string | undefined | null>): string | null {
    for (const v of values) {
        if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return null;
}

/**
 * Derive a default portrait prompt + caption/alt text from the current character.
 * This is intentionally deterministic and client-side (v1 does not use backend for this).
 */
export function derivePortraitPrompt(character: Character): {
    basePrompt: string;
    defaultCaption: string;
    defaultAlt: string;
} {
    const name = pickFirstNonEmpty(character.name) || 'Unnamed adventurer';
    const dnd = character.dnd5eData;

    const race = pickFirstNonEmpty(dnd?.race?.name);
    const cls = pickFirstNonEmpty(dnd?.classes?.[0]?.name);
    const background = pickFirstNonEmpty(dnd?.background?.name);

    const armor = pickFirstNonEmpty(dnd?.armor?.name, dnd?.armor?.id);
    const primaryWeapon = pickFirstNonEmpty((dnd?.weapons || [])[0]?.name, (dnd?.weapons || [])[0]?.id);

    const description = pickFirstNonEmpty(character.description);
    const backstory = pickFirstNonEmpty(character.backstory);

    const identityBits = [
        'fantasy character portrait',
        race ? `of a ${race}` : null,
        cls ? `${cls}` : null,
        background ? `(background: ${background})` : null
    ].filter(Boolean).join(' ');

    const gearBits = [
        armor ? `wearing ${armor}` : null,
        primaryWeapon ? `with ${primaryWeapon}` : null
    ].filter(Boolean).join(', ');

    const vibeBits = [
        description ? description : null,
        backstory ? backstory : null
    ].filter(Boolean).join(' ');

    const basePrompt = compactWhitespace(
        [
            `A ${identityBits} named ${name}.`,
            gearBits ? `${gearBits}.` : null,
            vibeBits ? `${vibeBits}` : null,
            'Half-body portrait, detailed face, sharp focus, dramatic lighting, high detail.'
        ]
            .filter(Boolean)
            .join(' ')
    );

    const defaultCaption = compactWhitespace(
        [name, race || cls ? '-' : null, [race, cls].filter(Boolean).join(' ')].filter(Boolean).join(' ')
    );

    const defaultAlt = compactWhitespace(
        `Portrait of ${name}${race || cls ? `, a ${[race, cls].filter(Boolean).join(' ')}` : ''}`
    );

    return { basePrompt, defaultCaption, defaultAlt };
}


