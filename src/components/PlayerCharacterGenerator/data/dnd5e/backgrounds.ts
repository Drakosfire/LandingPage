/**
 * D&D 5e SRD Backgrounds
 * 
 * The 6 backgrounds available in the D&D 5e SRD.
 * Reference: https://5e.tools and SRD documentation
 * 
 * @module CharacterGenerator/data/dnd5e/backgrounds
 */

import { DnD5eBackground } from '../../types/dnd5e/background.types';

// ============================================================================
// ACOLYTE
// ============================================================================

export const ACOLYTE: DnD5eBackground = {
    id: 'acolyte',
    name: 'Acolyte',
    skillProficiencies: ['insight', 'religion'],
    languageChoices: 2,
    equipment: [
        'holy-symbol',
        'prayer-book',
        'incense-5-sticks',
        'vestments',
        'common-clothes',
        '15-gp'
    ],
    feature: {
        id: 'shelter-of-the-faithful',
        name: 'Shelter of the Faithful',
        description: 'As an acolyte, you command the respect of those who share your faith, and you can perform the religious ceremonies of your deity. You and your adventuring companions can expect to receive free healing and care at a temple, shrine, or other established presence of your faith.',
        source: 'background'
    },
    suggestedCharacteristics: {
        traits: [
            'I idolize a particular hero of my faith.',
            'I can find common ground between the fiercest enemies.',
            'I see omens in every event and action.',
            'Nothing can shake my optimistic attitude.',
            'I quote sacred texts in almost every situation.',
            'I am tolerant of other faiths.',
            'I have enjoyed fine food and drink.',
            'I have spent so long in the temple that I have little experience dealing with people.'
        ],
        ideals: [
            'Tradition. The ancient traditions of worship must be preserved.',
            'Charity. I always try to help those in need.',
            'Change. We must help bring about the changes the gods are constantly working.',
            'Power. I hope to one day rise to the top of my faith.',
            'Faith. I trust that my deity will guide my actions.',
            'Aspiration. I seek to prove myself worthy of my god.'
        ],
        bonds: [
            'I would die to recover an ancient relic of my faith.',
            'I will someday get revenge on the corrupt temple hierarchy.',
            'I owe my life to the priest who took me in.',
            'Everything I do is for the common people.',
            'I will do anything to protect the temple where I served.',
            'I seek to preserve a sacred text.'
        ],
        flaws: [
            'I judge others harshly, and myself even more severely.',
            'I put too much trust in those who wield power within my temple.',
            'My piety sometimes leads me to blindly trust those that profess faith.',
            'I am inflexible in my thinking.',
            'I am suspicious of strangers.',
            'Once I pick a goal, I become obsessed with it.'
        ]
    },
    description: 'You have spent your life in the service of a temple to a specific god or pantheon of gods. You act as an intermediary between the realm of the holy and the mortal world.',
    source: 'SRD'
};

// ============================================================================
// CRIMINAL
// ============================================================================

export const CRIMINAL: DnD5eBackground = {
    id: 'criminal',
    name: 'Criminal',
    skillProficiencies: ['deception', 'stealth'],
    toolProficiencies: ['gaming-set', 'thieves-tools'],
    equipment: [
        'crowbar',
        'dark-common-clothes-with-hood',
        '15-gp'
    ],
    feature: {
        id: 'criminal-contact',
        name: 'Criminal Contact',
        description: 'You have a reliable and trustworthy contact who acts as your liaison to a network of other criminals. You know how to get messages to and from your contact, even over great distances.',
        source: 'background'
    },
    suggestedCharacteristics: {
        traits: [
            'I always have a plan for what to do when things go wrong.',
            'I am always calm, no matter what the situation.',
            'The first thing I do in a new place is note escape routes.',
            'I would rather make a new friend than a new enemy.',
            'I am incredibly slow to trust.',
            'I do not pay attention to the risks in a situation.',
            'The best way to get me to do something is to tell me I cannot.',
            'I blow up at the slightest insult.'
        ],
        ideals: [
            'Honor. I do not steal from others in the trade.',
            'Freedom. Chains are meant to be broken.',
            'Charity. I steal from the wealthy to help those in need.',
            'Greed. I will do whatever it takes to become wealthy.',
            'People. I am loyal to my friends, not to any ideals.',
            'Redemption. There is a spark of good in everyone.'
        ],
        bonds: [
            'I am trying to pay off an old debt I owe to a generous benefactor.',
            'My ill-gotten gains go to support my family.',
            'Something important was taken from me, and I aim to steal it back.',
            'I will become the greatest thief that ever lived.',
            'I am guilty of a terrible crime. I hope I can redeem myself.',
            'Someone I loved died because of a mistake I made.'
        ],
        flaws: [
            'When I see something valuable, I cannot think about anything but how to steal it.',
            'When faced with a choice between money and my friends, I usually choose the money.',
            'If there is a plan, I will forget it. If I do not forget it, I will ignore it.',
            'I have a tell that reveals when I am lying.',
            'I turn tail and run when things look bad.',
            'An innocent person is in prison for a crime that I committed.'
        ]
    },
    description: 'You are an experienced criminal with a history of breaking the law. You have spent a lot of time among other criminals and still have contacts within the criminal underworld.',
    source: 'SRD'
};

// ============================================================================
// FOLK HERO
// ============================================================================

export const FOLK_HERO: DnD5eBackground = {
    id: 'folk-hero',
    name: 'Folk Hero',
    skillProficiencies: ['animal-handling', 'survival'],
    toolProficiencies: ['artisans-tools', 'land-vehicles'],
    equipment: [
        'artisans-tools',
        'shovel',
        'iron-pot',
        'common-clothes',
        '10-gp'
    ],
    feature: {
        id: 'rustic-hospitality',
        name: 'Rustic Hospitality',
        description: 'Since you come from the ranks of the common folk, you fit in among them with ease. You can find a place to hide, rest, or recuperate among other commoners, unless you have shown yourself to be a danger to them.',
        source: 'background'
    },
    suggestedCharacteristics: {
        traits: [
            'I judge people by their actions, not their words.',
            'If someone is in trouble, I am always ready to lend help.',
            'When I set my mind to something, I follow through.',
            'I have a strong sense of fair play.',
            'I am confident in my own abilities.',
            'Thinking is for other people. I prefer action.',
            'I misuse long words in an attempt to sound smarter.',
            'I get bored easily. When am I going to get on with my destiny?'
        ],
        ideals: [
            'Respect. People deserve to be treated with dignity.',
            'Fairness. No one should get preferential treatment.',
            'Freedom. Tyrants must not be allowed to oppress the people.',
            'Might. If I become strong, I can take what I want.',
            'Sincerity. There is no good in pretending to be something I am not.',
            'Destiny. Nothing can stay the hand of fate.'
        ],
        bonds: [
            'I have a family, but I have no idea where they are.',
            'I worked the land, and I love the land.',
            'A proud noble once gave me a horrible beating.',
            'My tools are symbols of my past life.',
            'I protect those who cannot protect themselves.',
            'I wish my childhood sweetheart had come with me.'
        ],
        flaws: [
            'The tyrant who rules my land will stop at nothing to see me killed.',
            'I am convinced of the significance of my destiny.',
            'I have a weakness for the vices of the city.',
            'Secretly, I believe that things would be better if I were a tyrant.',
            'I have trouble trusting in my allies.',
            'I am too enamored of ale, wine, and other intoxicants.'
        ]
    },
    description: 'You come from a humble social rank, but you are destined for so much more. Already the people of your home village regard you as their champion.',
    source: 'SRD'
};

// ============================================================================
// NOBLE
// ============================================================================

export const NOBLE: DnD5eBackground = {
    id: 'noble',
    name: 'Noble',
    skillProficiencies: ['history', 'persuasion'],
    toolProficiencies: ['gaming-set'],
    languageChoices: 1,
    equipment: [
        'fine-clothes',
        'signet-ring',
        'scroll-of-pedigree',
        '25-gp'
    ],
    feature: {
        id: 'position-of-privilege',
        name: 'Position of Privilege',
        description: 'Thanks to your noble birth, people are inclined to think the best of you. You are welcome in high society, and people assume you have the right to be wherever you are. Common folk make every effort to accommodate you.',
        source: 'background'
    },
    suggestedCharacteristics: {
        traits: [
            'My eloquent flattery makes everyone I talk to feel important.',
            'The common folk love me for my kindness and generosity.',
            'No one could doubt by looking at my regal bearing that I am above the common folk.',
            'I take great pains to always look my best.',
            'I do not like to get my hands dirty.',
            'Despite my noble birth, I do not place myself above other folk.',
            'My favor, once lost, is lost forever.',
            'If you do me an injury, I will crush you.'
        ],
        ideals: [
            'Respect. Respect is due to me because of my position.',
            'Responsibility. It is my duty to respect the authority of those above me.',
            'Independence. I must prove that I can handle myself without coddling.',
            'Power. If I can attain more power, no one will tell me what to do.',
            'Family. Blood runs thicker than water.',
            'Noble Obligation. It is my duty to protect and care for the people beneath me.'
        ],
        bonds: [
            'I will face any challenge to win the approval of my family.',
            'My house is most important to me.',
            'Nothing is more important than the other members of my family.',
            'I am in love with the heir of a family that my family despises.',
            'My loyalty to my sovereign is unwavering.',
            'The common folk must see me as a hero of the people.'
        ],
        flaws: [
            'I secretly believe that everyone is beneath me.',
            'I hide a truly scandalous secret.',
            'I too often hear veiled insults and threats.',
            'I have an insatiable desire for carnal pleasures.',
            'In fact, the world does revolve around me.',
            'By my words and actions, I often bring shame to my family.'
        ]
    },
    description: 'You understand wealth, power, and privilege. You carry a noble title, and your family owns land, collects taxes, and wields significant political influence.',
    source: 'SRD'
};

// ============================================================================
// SAGE
// ============================================================================

export const SAGE: DnD5eBackground = {
    id: 'sage',
    name: 'Sage',
    skillProficiencies: ['arcana', 'history'],
    languageChoices: 2,
    equipment: [
        'bottle-of-black-ink',
        'quill',
        'small-knife',
        'letter-from-dead-colleague',
        'common-clothes',
        '10-gp'
    ],
    feature: {
        id: 'researcher',
        name: 'Researcher',
        description: 'When you attempt to learn or recall a piece of lore, if you do not know that information, you often know where and from whom you can obtain it. Usually, this information comes from a library, scriptorium, university, or a sage.',
        source: 'background'
    },
    suggestedCharacteristics: {
        traits: [
            'I use polysyllabic words that convey the impression of great erudition.',
            'I have read every book in the world greatest libraries.',
            'I am used to helping out those who are not as smart as I am.',
            'There is nothing I like more than a good mystery.',
            'I am willing to listen to every side of an argument.',
            'I speak slowly when talking to idiots.',
            'I am horribly, horribly awkward in social situations.',
            'I am convinced that people are always trying to steal my secrets.'
        ],
        ideals: [
            'Knowledge. The path to power and self-improvement is through knowledge.',
            'Beauty. What is beautiful points us beyond itself.',
            'Logic. Emotions must not cloud our logical thinking.',
            'No Limits. Nothing should fetter the infinite possibility inherent in all existence.',
            'Power. Knowledge is the path to power and domination.',
            'Self-Improvement. The goal of a life of study is the betterment of oneself.'
        ],
        bonds: [
            'It is my duty to protect my students.',
            'I have an ancient text that holds terrible secrets.',
            'I work to preserve a library, university, scriptorium, or monastery.',
            'My life is dedicated to learning.',
            'I have been searching my whole life for the answer to a certain question.',
            'I sold my soul for knowledge. I hope to do great deeds to win it back.'
        ],
        flaws: [
            'I am easily distracted by the promise of information.',
            'Most people scream and run when they see a demon. I stop and take notes.',
            'Unlocking an ancient mystery is worth the price of a civilization.',
            'I overlook obvious solutions in favor of complicated ones.',
            'I speak without really thinking through my words.',
            'I cannot keep a secret to save my life, or anyone else.'
        ]
    },
    description: 'You spent years learning the lore of the multiverse. You scoured manuscripts, studied scrolls, and listened to the greatest experts on the subjects that interest you.',
    source: 'SRD'
};

// ============================================================================
// SOLDIER
// ============================================================================

export const SOLDIER: DnD5eBackground = {
    id: 'soldier',
    name: 'Soldier',
    skillProficiencies: ['athletics', 'intimidation'],
    toolProficiencies: ['gaming-set', 'land-vehicles'],
    equipment: [
        'insignia-of-rank',
        'trophy-from-fallen-enemy',
        'bone-dice-or-deck-of-cards',
        'common-clothes',
        '10-gp'
    ],
    feature: {
        id: 'military-rank',
        name: 'Military Rank',
        description: 'You have a military rank from your career as a soldier. Soldiers loyal to your former military organization still recognize your authority and influence, and they defer to you if they are of a lower rank.',
        source: 'background'
    },
    suggestedCharacteristics: {
        traits: [
            'I am always polite and respectful.',
            'I am haunted by memories of war.',
            'I have lost too many friends, and I am slow to make new ones.',
            'I am full of inspiring and cautionary tales from my military experience.',
            'I can stare down a hell hound without flinching.',
            'I enjoy being strong and like breaking things.',
            'I have a crude sense of humor.',
            'I face problems head-on. A simple, direct solution is the best path.'
        ],
        ideals: [
            'Greater Good. Our lot is to lay down our lives in defense of others.',
            'Responsibility. I do what I must and obey just authority.',
            'Independence. When people follow orders blindly, they embrace tyranny.',
            'Might. In life as in war, the stronger force wins.',
            'Live and Let Live. Ideals are not worth killing over.',
            'Nation. My city, nation, or people are all that matter.'
        ],
        bonds: [
            'I would still lay down my life for the people I served with.',
            'Someone saved my life on the battlefield.',
            'My honor is my life.',
            'I will never forget the crushing defeat my company suffered.',
            'Those who fight beside me are those worth dying for.',
            'I fight for those who cannot fight for themselves.'
        ],
        flaws: [
            'The monstrous enemy we faced in battle still leaves me quivering with fear.',
            'I have little respect for anyone who is not a proven warrior.',
            'I made a terrible mistake in battle that cost many lives.',
            'My hatred of my enemies is blind and unreasoning.',
            'I obey the law, even if the law causes misery.',
            'I would rather eat my armor than admit when I am wrong.'
        ]
    },
    description: 'War has been your life for as long as you care to remember. You trained as a youth, studied the use of weapons and armor, learned basic survival techniques.',
    source: 'SRD'
};

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * All 6 SRD backgrounds
 */
export const SRD_BACKGROUNDS: DnD5eBackground[] = [
    ACOLYTE,
    CRIMINAL,
    FOLK_HERO,
    NOBLE,
    SAGE,
    SOLDIER
];

/**
 * Get background by ID
 */
export function getBackgroundById(id: string): DnD5eBackground | undefined {
    return SRD_BACKGROUNDS.find(bg => bg.id === id);
}

/**
 * Get backgrounds by skill
 */
export function getBackgroundsBySkill(skill: string): DnD5eBackground[] {
    return SRD_BACKGROUNDS.filter(bg =>
        bg.skillProficiencies.includes(skill.toLowerCase())
    );
}
