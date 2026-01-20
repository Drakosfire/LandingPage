export interface PromptContext {
    id?: string;
    title?: string;
}

const DND5E_PROMPTS = [
    'What level can a wizard learn fireball?',
    'How does advantage and disadvantage work?',
    'What triggers an opportunity attack?',
];

const PF2E_PROMPTS = [
    'How many actions do I get each turn?',
    'How does multiple attack penalty work?',
    'What is the DC for a level-5 skill check?',
];

const OSR_PROMPTS = [
    'How do surprise checks work?',
    'When do I check for morale?',
    'How does reaction roll affect NPC behavior?',
];

const PROMPT_MATCHERS: Array<{ keywords: string[]; prompts: string[] }> = [
    { keywords: ['pf2', 'pathfinder 2', 'pathfinder2'], prompts: PF2E_PROMPTS },
    {
        keywords: [
            'osr',
            'old school',
            'b x',
            'b/x',
            'ose',
            'old school essentials',
            'swords wizardry',
            'whitebox',
            'white box',
        ],
        prompts: OSR_PROMPTS
    },
    {
        keywords: ['dnd', 'd d', '5e', 'phb', 'players handbook', 'player handbook', 'dungeons dragons'],
        prompts: DND5E_PROMPTS
    },
];

export const getRulebookPrompts = ({ id, title }: PromptContext): string[] => {
    const target = `${id ?? ''} ${title ?? ''}`.trim();
    if (!target) return DND5E_PROMPTS;

    const normalized = target.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const match = PROMPT_MATCHERS.find(({ keywords }) =>
        keywords.some((keyword) => normalized.includes(keyword))
    );
    return match ? match.prompts : DND5E_PROMPTS;
};
