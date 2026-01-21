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

const PF1E_PROMPTS = [
    'How does attack of opportunity work in Pathfinder?',
    'How many skill ranks do I get each level?',
    'How do combat maneuvers and CMD work?',
];

const OSR_PROMPTS = [
    'How do surprise checks work?',
    'When do I check for morale?',
    'How does reaction roll affect NPC behavior?',
];

const SWN_PROMPTS = [
    'How does ship combat work?',
    'What are the rules for spike drill travel?',
    'How do I resolve a skill check in SWN?',
];

const PROMPT_MATCHERS: Array<{ keywords: string[]; prompts: string[] }> = [
    {
        keywords: [
            'swon',
            'swn',
            'stars without number',
            'stars without numbers',
        ],
        prompts: SWN_PROMPTS
    },
    {
        keywords: [
            'pf1',
            'pathfinder 1',
            'pathfinder 1e',
            'pathfinder 1st',
            'pathfinder first',
        ],
        prompts: PF1E_PROMPTS
    },
    { keywords: ['pf2', 'pathfinder 2', 'pathfinder2', 'pathgm'], prompts: PF2E_PROMPTS },
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
