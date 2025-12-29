import type { Character } from '../types/character.types';

/** Maximum total prompt length to stay under API limits (leaving room for style suffix) */
const MAX_PROMPT_LENGTH = 1500;

/** Maximum length for description excerpt */
const MAX_DESCRIPTION_LENGTH = 400;

/** Maximum length for backstory excerpt */
const MAX_BACKSTORY_LENGTH = 400;

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
 * Truncate text to a maximum length, ending at a word boundary.
 * Adds ellipsis if truncated.
 */
function truncateAtWord(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;

    // Find the last space before the limit
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.5) {
        // End at word boundary if we can keep at least half the content
        return truncated.substring(0, lastSpace) + '...';
    }

    // Otherwise just truncate and add ellipsis
    return truncated.substring(0, maxLength - 3) + '...';
}

/**
 * Extract key visual descriptors from a longer text.
 * Focuses on the first sentence or clause for visual impact.
 */
function extractVisualExcerpt(text: string, maxLength: number): string {
    // Clean up the text first
    const cleaned = compactWhitespace(text);

    // Try to get the first sentence (most likely to contain key visual info)
    const firstSentence = cleaned.split(/[.!?]/)[0];

    if (firstSentence && firstSentence.length <= maxLength) {
        return firstSentence;
    }

    // If first sentence is too long, truncate at word boundary
    return truncateAtWord(cleaned, maxLength);
}

/**
 * Derive a default portrait prompt + caption/alt text from the current character.
 * This is intentionally deterministic and client-side (v1 does not use backend for this).
 * 
 * The prompt is shaped to stay under ~1500 characters to leave room for style suffixes
 * while staying under the 2000 character API limit.
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

    // Build identity string (compact)
    const identityBits = [
        race,
        cls
    ].filter(Boolean).join(' ');

    // Build gear string (compact)
    const gearBits = [
        armor ? `wearing ${armor}` : null,
        primaryWeapon ? `wielding ${primaryWeapon}` : null
    ].filter(Boolean).join(', ');

    // Extract visual excerpts from description and backstory (truncated)
    const descriptionExcerpt = description
        ? extractVisualExcerpt(description, MAX_DESCRIPTION_LENGTH)
        : null;
    const backstoryExcerpt = backstory
        ? extractVisualExcerpt(backstory, MAX_BACKSTORY_LENGTH)
        : null;

    // Build the prompt with concise structure
    // Composition/subject only - art style comes from the style dropdown selection
    const promptParts = [
        `An RPG character portrait headshot of a ${identityBits || 'adventurer'}`,
        background ? `with ${background} background` : null,
        `named ${name}`,
        gearBits ? gearBits : null,
        descriptionExcerpt,
        backstoryExcerpt,
        'Close-up head and shoulders portrait, detailed expressive face, eye contact with viewer'
    ].filter(Boolean);

    let basePrompt = compactWhitespace(promptParts.join('. ').replace(/\.\./g, '.'));

    // Final safety check - truncate if still too long
    if (basePrompt.length > MAX_PROMPT_LENGTH) {
        basePrompt = truncateAtWord(basePrompt, MAX_PROMPT_LENGTH);
    }

    const defaultCaption = compactWhitespace(
        [name, race || cls ? '-' : null, [race, cls].filter(Boolean).join(' ')].filter(Boolean).join(' ')
    );

    const defaultAlt = compactWhitespace(
        `Portrait of ${name}${race || cls ? `, a ${[race, cls].filter(Boolean).join(' ')}` : ''}`
    );

    return { basePrompt, defaultCaption, defaultAlt };
}


