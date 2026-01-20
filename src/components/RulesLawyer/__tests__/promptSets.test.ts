import { getRulebookPrompts } from '../promptSets';

describe('getRulebookPrompts', () => {
    it('returns DnD prompts for DnD identifiers', () => {
        const prompts = getRulebookPrompts({ id: 'DnD_PHB_55', title: 'Player Handbook' });
        expect(prompts).toEqual([
            'What level can a wizard learn fireball?',
            'How does advantage and disadvantage work?',
            'What triggers an opportunity attack?',
        ]);
    });

    it('returns OSR prompts for OSR identifiers', () => {
        const prompts = getRulebookPrompts({ id: 'Swords_and_Wizardry_WhiteBox', title: 'Swords & Wizardry White Box' });
        expect(prompts).toEqual([
            'How do surprise checks work?',
            'When do I check for morale?',
            'How does reaction roll affect NPC behavior?',
        ]);
    });

    it('returns Pathfinder prompts for PF2 identifiers', () => {
        const prompts = getRulebookPrompts({ id: 'PF2_Core', title: 'Pathfinder 2 Core Rulebook' });
        expect(prompts).toEqual([
            'How many actions do I get each turn?',
            'How does multiple attack penalty work?',
            'What is the DC for a level-5 skill check?',
        ]);
    });

    it('falls back to DnD prompts for unknown rulebooks', () => {
        const prompts = getRulebookPrompts({ id: 'Unknown_Rules', title: 'Unknown Rules' });
        expect(prompts).toEqual([
            'What level can a wizard learn fireball?',
            'How does advantage and disadvantage work?',
            'What triggers an opportunity attack?',
        ]);
    });

    it('handles multiple switches reliably', () => {
        const osrPrompts = getRulebookPrompts({ id: 'OSE_Classic', title: 'Old School Essentials' });
        const dndPrompts = getRulebookPrompts({ id: 'DnD_PHB_55', title: 'Player Handbook' });
        const osrAgain = getRulebookPrompts({ id: 'WhiteBox', title: 'White Box' });

        expect(osrPrompts).toEqual(osrAgain);
        expect(osrPrompts).not.toEqual(dndPrompts);
    });
});
