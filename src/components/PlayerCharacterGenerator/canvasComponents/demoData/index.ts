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
import { DEMO_WIZARD_OVERFLOW } from './DEMO_WIZARD_OVERFLOW';
import { Character } from '../../types/character.types';

export { DEMO_FIGHTER, DEMO_FIGHTER_DATA, createDemoFighter } from './DEMO_FIGHTER';
export { DEMO_WIZARD, DEMO_WIZARD_DATA, createDemoWizard } from './DEMO_WIZARD';
export { DEMO_OVERFLOW, DEMO_OVERFLOW_DATA, createDemoOverflow } from './DEMO_OVERFLOW';
export { DEMO_WIZARD_OVERFLOW, DEMO_WIZARD_OVERFLOW_DATA, createDemoWizardOverflow, SPELL_COUNT_SUMMARY } from './DEMO_WIZARD_OVERFLOW';

/**
 * All available demo characters
 */
export const DEMO_CHARACTERS: Record<string, Character> = {
    fighter: DEMO_FIGHTER,
    wizard: DEMO_WIZARD,
    overflow: DEMO_OVERFLOW,
    wizardOverflow: DEMO_WIZARD_OVERFLOW
};

/**
 * Demo character options for UI selection
 */
export const DEMO_CHARACTER_OPTIONS = [
    { value: 'fighter', label: 'Marcus Steelhand (Fighter 1)' },
    { value: 'wizard', label: 'Elara Starweave (Wizard 5)' },
    { value: 'overflow', label: '⚠️ Valdris the Collector (Features Overflow - Lvl 12)' },
    { value: 'wizardOverflow', label: '📜 Archmage Valdris (Spell Overflow - Lvl 20, 67 spells)' }
];

/**
 * Get a demo character by key
 */
export function getDemoCharacter(key: string): Character | undefined {
    return DEMO_CHARACTERS[key];
}
