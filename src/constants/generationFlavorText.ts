/**
 * D&D-themed flavor text for generation loading states
 * Rotates through these messages to keep users engaged during generation
 */

export const GENERATION_FLAVOR_TEXTS = [
    "🎲 Rolling for initiative...",
    "📜 Consulting the ancient tomes...",
    "✨ Channeling arcane energies...",
    "🐉 Waking the dungeon master...",
    "⚔️ Sharpening legendary weapons...",
    "🧙 Brewing potions of inspiration...",
    "🗡️ Forging abilities from pure magic...",
    "🌟 Aligning the planes of existence...",
    "📖 Writing stat blocks in the Book of Fates...",
    "🔮 Scrying the multiverse for your creature...",
    "🎭 Assembling your creature's personality...",
    "⚡ Charging spell slots...",
    "🏰 Building lair defenses...",
    "🎪 Choreographing legendary actions...",
    "🌙 Consulting with the gods of chaos...",
    "🦇 Summoning dark powers from the Shadowfell...",
    "🌊 Channeling elemental forces...",
    "🎺 Composing your creature's battle theme...",
    "🧪 Mixing alchemical components...",
    "📯 Rallying the monster hordes..."
];

/**
 * Get a random flavor text for variety on each generation
 */
export function getRandomFlavorText(): string {
    return GENERATION_FLAVOR_TEXTS[Math.floor(Math.random() * GENERATION_FLAVOR_TEXTS.length)];
}

/**
 * Text rotation interval in milliseconds
 */
export const FLAVOR_TEXT_ROTATION_MS = 2000;

