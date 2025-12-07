/**
 * Demo Character Data Index
 * 
 * Central export for all demo characters.
 * 
 * @module PlayerCharacterGenerator/canvasComponents/demoData
 */

import { DEMO_FIGHTER } from './DEMO_FIGHTER';
import { DEMO_WIZARD } from './DEMO_WIZARD';
import { DEMO_OVERFLOW } from './DEMO_OVERFLOW';
import { Character } from '../../types/character.types';

export { DEMO_FIGHTER, DEMO_FIGHTER_DATA, createDemoFighter } from './DEMO_FIGHTER';
export { DEMO_WIZARD, DEMO_WIZARD_DATA, createDemoWizard } from './DEMO_WIZARD';
export { DEMO_OVERFLOW, DEMO_OVERFLOW_DATA, createDemoOverflow } from './DEMO_OVERFLOW';

/**
 * All available demo characters
 */
export const DEMO_CHARACTERS: Record<string, Character> = {
    fighter: DEMO_FIGHTER,
    wizard: DEMO_WIZARD,
    overflow: DEMO_OVERFLOW
};

/**
 * Demo character options for UI selection
 */
export const DEMO_CHARACTER_OPTIONS = [
    { value: 'fighter', label: 'Marcus Steelhand (Fighter 1)' },
    { value: 'wizard', label: 'Elara Starweave (Wizard 5)' },
    { value: 'overflow', label: '⚠️ Valdris the Collector (Overflow Test - Lvl 12)' }
];

/**
 * Get a demo character by key
 */
export function getDemoCharacter(key: string): Character | undefined {
    return DEMO_CHARACTERS[key];
}
