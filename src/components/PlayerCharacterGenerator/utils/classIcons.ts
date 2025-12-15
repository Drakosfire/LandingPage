/**
 * D&D 5e Class Icons
 * 
 * Thematic emoji icons for each D&D class, used in the Character Roster
 * for quick visual identification.
 * 
 * @module PlayerCharacterGenerator/utils
 */

/**
 * Map of D&D 5e class names to emoji icons
 * Lowercase keys for case-insensitive lookup
 */
export const CLASS_ICONS: Record<string, string> = {
    // Core PHB classes
    'barbarian': '⚔️',   // Rage, brute strength
    'bard': '🎵',        // Music, performance
    'cleric': '✝️',      // Divine magic, healing (cross represents faith)
    'druid': '🌿',       // Nature magic
    'fighter': '🗡️',     // Martial combat
    'monk': '👊',        // Martial arts
    'paladin': '🛡️',     // Holy warrior
    'ranger': '🏹',      // Archery, nature
    'rogue': '🗝️',       // Sneaky, locks
    'sorcerer': '✨',    // Innate magic
    'warlock': '🔮',     // Pact magic
    'wizard': '📖',      // Learned magic, spellbook

    // Artificer (Eberron/Tasha's)
    'artificer': '⚙️',   // Invention, crafting

    // Blood Hunter (Matt Mercer homebrew - popular)
    'blood hunter': '🩸',

    // Fallback
    'unknown': '👤'
};

/**
 * Get the emoji icon for a D&D class
 * 
 * @param className - The class name (case-insensitive)
 * @returns The emoji icon for the class, or '👤' if not found
 * 
 * @example
 * getClassIcon('Fighter')    // '🗡️'
 * getClassIcon('WIZARD')     // '📖'
 * getClassIcon('Homebrew')   // '👤' (fallback)
 */
export function getClassIcon(className: string | undefined | null): string {
    if (!className) return CLASS_ICONS['unknown'];

    const normalizedName = className.toLowerCase().trim();
    return CLASS_ICONS[normalizedName] || CLASS_ICONS['unknown'];
}

/**
 * Get class icon with the class name for display
 * 
 * @param className - The class name
 * @returns Formatted string like "🗡️ Fighter"
 * 
 * @example
 * getClassIconWithName('Fighter')  // '🗡️ Fighter'
 */
export function getClassIconWithName(className: string | undefined | null): string {
    if (!className) return `${CLASS_ICONS['unknown']} Unknown`;

    return `${getClassIcon(className)} ${className}`;
}

/**
 * Check if a class name has a known icon (not fallback)
 * 
 * @param className - The class name
 * @returns True if the class has a specific icon
 */
export function hasKnownClassIcon(className: string | undefined | null): boolean {
    if (!className) return false;

    const normalizedName = className.toLowerCase().trim();
    return normalizedName in CLASS_ICONS && normalizedName !== 'unknown';
}
