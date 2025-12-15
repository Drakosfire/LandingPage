/**
 * Test Runner for AI Character Generation
 * 
 * Runs the complete generation pipeline:
 * 1. Build prompt from test case
 * 2. Get AI response (mock or real)
 * 3. Parse and validate preferences
 * 4. Translate to mechanics
 * 5. Validate against rules
 * 
 * @module CharacterGenerator/generation/testRunner
 */

import {
    TestCase,
    TestResult,
    AiPreferences,
    GenerationConstraints,
    GenerationInput,
} from './types';
import {
    generatePilotTestCases,
    createEmptyTestResult,
    aggregateResults,
    formatSummaryReport,
} from './testHarness';
import {
    SYSTEM_PROMPT,
    buildPreferencePrompt,
    parseAiResponse,
    validatePreferences,
    getMockConstraints,
} from './promptBuilder';
import { translatePreferences } from './preferenceTranslator';

// ============================================================================
// API CONFIGURATION
// ============================================================================

/**
 * Get the API URL - works in browser and Node.js
 */
function getApiUrl(): string {
    // Browser environment
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'dev.dungeonmind.net') {
            return 'https://dev.dungeonmind.net';
        }
        if (hostname === 'localhost') {
            return 'http://localhost:7860';
        }
        return 'https://www.dungeonmind.net';
    }
    // Node.js environment (for testing)
    return process.env.DUNGEONMIND_API_URL || 'http://localhost:7860';
}

const API_URL = getApiUrl();

/**
 * API response type from backend
 */
interface ApiGenerationResponse {
    success: boolean;
    data?: {
        preferences: AiPreferences;
        rawResponse: string;
        generationInfo: {
            promptVersion: string;
            model: string;
            timestamp: string;
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
        };
    };
    error?: string;
    generationTimeSeconds?: number;
}

interface ApiConstraintsResponse {
    success: boolean;
    data?: {
        constraints: GenerationConstraints;
    };
    error?: string;
}

interface ApiValidateResponse {
    success: boolean;
    issues: string[];
    sections?: Record<string, any>;
}

interface ApiComputeResponse {
    success: boolean;
    issues: string[];
    derivedStats?: Record<string, any>;
    sections?: Record<string, any>;
}

/**
 * Call the real backend API to generate preferences
 */
async function callGeneratePreferencesApi(
    input: GenerationInput
): Promise<{ success: boolean; data?: ApiGenerationResponse['data']; error?: string }> {
    try {
        const response = await fetch(`${API_URL}/api/playercharactergenerator/generate-preferences`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: {
                    classId: input.classId,
                    raceId: input.raceId,
                    level: input.level,
                    backgroundId: input.backgroundId,
                    concept: input.concept,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return { success: false, error: `API error: ${response.status} - ${errorText}` };
        }

        const result: ApiGenerationResponse = await response.json();

        if (!result.success) {
            return { success: false, error: result.error || 'Unknown error' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        const err = error as any;
        const message = err?.message ? String(err.message) : String(error);
        const cause =
            err?.cause
                ? (() => {
                    try {
                        return JSON.stringify(err.cause);
                    } catch {
                        return String(err.cause);
                    }
                })()
                : undefined;

        return {
            success: false,
            error: `Network error: ${message}${cause ? ` | cause=${cause}` : ''}`,
        };
    }
}

async function callConstraintsApi(
    input: GenerationInput
): Promise<{ success: boolean; constraints?: GenerationConstraints; error?: string }> {
    try {
        const response = await fetch(`${API_URL}/api/playercharactergenerator/constraints`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                classId: input.classId,
                raceId: input.raceId,
                level: input.level,
                backgroundId: input.backgroundId,
                concept: input.concept,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return { success: false, error: `API error: ${response.status} - ${errorText}` };
        }

        const result: ApiConstraintsResponse = await response.json();
        if (!result.success || !result.data?.constraints) {
            return { success: false, error: result.error || 'Failed to fetch constraints' };
        }

        return { success: true, constraints: result.data.constraints };
    } catch (error) {
        const err = error as any;
        const message = err?.message ? String(err.message) : String(error);
        return { success: false, error: `Network error: ${message}` };
    }
}

async function callValidateApi(
    input: GenerationInput,
    constraints: GenerationConstraints,
    translation: ReturnType<typeof translatePreferences>
): Promise<{ success: boolean; issues: string[]; sections?: Record<string, any>; error?: string }> {
    try {
        const scores = translation.translations.abilityScores?.scores;
        const skills = translation.translations.skills?.selected;
        const packageId = translation.translations.equipment?.packageId;

        if (!scores || !skills || !packageId) {
            return {
                success: false,
                issues: ['Missing translated fields required for backend validation'],
            };
        }

        const featureChoices = translation.translations.featureChoices?.choices || {};
        const selectedCantrips = translation.translations.spells?.cantrips || [];
        const selectedSpells = translation.translations.spells?.spells || [];

        const response = await fetch(`${API_URL}/api/playercharactergenerator/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: {
                    classId: input.classId,
                    raceId: input.raceId,
                    level: input.level,
                    backgroundId: input.backgroundId,
                    concept: input.concept,
                },
                choices: {
                    abilityScores: scores,
                    selectedSkills: skills,
                    equipmentPackageId: packageId,
                    featureChoices,
                    selectedCantrips,
                    selectedSpells,
                },
                constraints,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return { success: false, issues: [], error: `API error: ${response.status} - ${errorText}` };
        }

        const result: ApiValidateResponse = await response.json();
        return { success: result.success, issues: result.issues || [], sections: result.sections };
    } catch (error) {
        const err = error as any;
        const message = err?.message ? String(err.message) : String(error);
        return { success: false, issues: [], error: `Network error: ${message}` };
    }
}

async function callComputeApi(
    input: GenerationInput,
    constraints: GenerationConstraints,
    translation: ReturnType<typeof translatePreferences>
): Promise<{ success: boolean; issues: string[]; derivedStats?: Record<string, any>; sections?: Record<string, any>; error?: string }> {
    try {
        const scores = translation.translations.abilityScores?.scores;
        const skills = translation.translations.skills?.selected;
        const packageId = translation.translations.equipment?.packageId;

        if (!scores || !skills || !packageId) {
            return {
                success: false,
                issues: ['Missing translated fields required for backend compute'],
            };
        }

        const featureChoices = translation.translations.featureChoices?.choices || {};
        const selectedCantrips = translation.translations.spells?.cantrips || [];
        const selectedSpells = translation.translations.spells?.spells || [];

        const response = await fetch(`${API_URL}/api/playercharactergenerator/compute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: {
                    classId: input.classId,
                    raceId: input.raceId,
                    level: input.level,
                    backgroundId: input.backgroundId,
                    concept: input.concept,
                },
                choices: {
                    abilityScores: scores,
                    selectedSkills: skills,
                    equipmentPackageId: packageId,
                    featureChoices,
                    selectedCantrips,
                    selectedSpells,
                },
                constraints,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return { success: false, issues: [], error: `API error: ${response.status} - ${errorText}` };
        }

        const result: ApiComputeResponse = await response.json();
        return {
            success: result.success,
            issues: result.issues || [],
            derivedStats: result.derivedStats,
            sections: result.sections,
        };
    } catch (error) {
        const err = error as any;
        const message = err?.message ? String(err.message) : String(error);
        return { success: false, issues: [], error: `Network error: ${message}` };
    }
}

// ============================================================================
// MOCK RESPONSES (for testing without API)
// ============================================================================

/**
 * Mock AI response for a Fighter
 */
const MOCK_FIGHTER_RESPONSE = `\`\`\`json
{
  "abilityPriorities": ["strength", "constitution", "dexterity", "wisdom", "charisma", "intelligence"],
  "abilityReasoning": "A battle-hardened veteran prioritizes raw power and endurance. Strength for devastating blows, constitution to survive the horrors of war.",
  
  "combatApproach": "Aggressive frontline fighter who charges into battle, drawing enemy attention away from allies. Uses intimidation and overwhelming force.",
  "skillThemes": ["physical prowess", "intimidation", "battlefield awareness"],
  
  "equipmentStyle": "Heavy armor with shield for maximum protection. Prefers reliable weapons over flashy ones.",
  
  "fightingStylePreference": {
    "id": "defense",
    "reasoning": "After losing so many comrades, survival has become paramount. Defense keeps you alive to protect others."
  },
  
  "character": {
    "name": "Kira Stonefist",
    "personality": {
      "traits": ["I face problems head-on, no matter the odds", "I sleep with my back to the wall and one hand on my weapon"],
      "ideals": ["Protection - The strong must shield the weak, no matter the cost"],
      "bonds": ["I carry the insignia of my fallen unit. Their memory drives me forward."],
      "flaws": ["I blame myself for every death I witness. The guilt never fades."]
    },
    "backstory": "Kira served fifteen years in the Iron Legion, rising to the rank of sergeant through blood and determination. During the Siege of Thornwall, her unit was ambushed by hobgoblin warlords. She was the only survivor.\\n\\nNow she wanders the roads, taking on jobs that put her between danger and the innocent. She doesn't seek glory or gold—only the chance to save lives that remind her of the soldiers she couldn't protect.\\n\\nSome say she's seeking death. Kira says she's seeking redemption. Perhaps they're the same thing.",
    "appearance": "A weathered human woman in her late thirties with grey-streaked black hair kept in a practical braid. A jagged scar runs from her left temple to her jaw. Her armor is dented and scratched but meticulously maintained.",
    "age": 38
  }
}
\`\`\``;

/**
 * Mock AI response for a Wizard
 */
const MOCK_WIZARD_RESPONSE = `\`\`\`json
{
  "abilityPriorities": ["intelligence", "constitution", "dexterity", "wisdom", "charisma", "strength"],
  "abilityReasoning": "A scholar turned soldier needs sharp wits above all. Constitution keeps the frail wizard alive, dexterity helps avoid blows entirely.",
  
  "combatApproach": "Stays at range, controlling the battlefield with spells. Uses magic missile for reliable damage and shield for emergency defense.",
  "skillThemes": ["arcane knowledge", "scholarly research", "keen observation"],
  
  "equipmentStyle": "Light and practical - a quarterstaff for emergencies, component pouch for spellcasting.",
  
  "cantripThemes": ["damage", "utility", "light"],
  "spellThemes": ["protection", "control", "reliable damage"],
  
  "character": {
    "name": "Aldric Thornwood",
    "personality": {
      "traits": ["I use long words to sound more intelligent than I am", "I'm convinced that my research will change the world"],
      "ideals": ["Knowledge - The path to power is through understanding, not brute force"],
      "bonds": ["My spellbook contains the notes of my mentor, who died before completing their life's work"],
      "flaws": ["I overlook obvious solutions in favor of complicated ones"]
    },
    "backstory": "Aldric was a promising student at the Arcane Academy until the war came to its doorstep. His mentor, the great sage Mordecai, fell defending the library from raiders. With his dying breath, Mordecai pressed his spellbook into Aldric's hands.\\n\\nNow Aldric carries that book everywhere, trying to complete his mentor's research while learning to survive in a world far more dangerous than the academy halls. He joined a mercenary company—not for gold, but because they were heading toward the ruins his mentor had always wanted to explore.",
    "appearance": "A young human man with wild brown hair perpetually stained with ink. Wire-rimmed spectacles sit crookedly on his nose. He wears practical traveling robes with far too many pockets, each stuffed with notes and components.",
    "age": 24
  }
}
\`\`\``;

/**
 * Mock AI response for a Rogue
 */
const MOCK_ROGUE_RESPONSE = `\`\`\`json
{
  "abilityPriorities": ["dexterity", "constitution", "charisma", "wisdom", "intelligence", "strength"],
  "abilityReasoning": "A survivor needs quick reflexes above all. Constitution to take a hit when stealth fails, charisma to talk out of trouble.",
  
  "combatApproach": "Strike from shadows, avoid fair fights entirely. Uses mobility and cunning rather than direct confrontation.",
  "skillThemes": ["stealth and subterfuge", "quick thinking", "reading people"],
  
  "equipmentStyle": "Light armor for mobility, concealed weapons, tools for every situation.",
  
  "character": {
    "name": "Vex Shadowmere",
    "personality": {
      "traits": ["I always have a plan for when things go wrong", "The first thing I do in a new place is note exits"],
      "ideals": ["Freedom - Chains are meant to be broken, as are those who would forge them"],
      "bonds": ["Someone saved my life on the streets. I owe them everything."],
      "flaws": ["When I see something valuable, I can't think about anything but how to steal it"]
    },
    "backstory": "Vex grew up in the gutters of Waterdeep, surviving by wit and quick fingers. When the guild wars erupted, she lost everything—including the old thief who'd taught her to survive.\\n\\nNow she takes jobs that let her strike at those in power while staying alive. She tells herself it's about justice, about helping those like the child she once was. But sometimes she wonders if she just likes the thrill too much to stop.",
    "appearance": "A lithe human woman with short-cropped dark hair and sharp green eyes that never stop moving. She favors dark, practical clothing with many hidden pockets.",
    "age": 26
  }
}
\`\`\``;

/**
 * Mock AI response for a Cleric
 */
const MOCK_CLERIC_RESPONSE = `\`\`\`json
{
  "abilityPriorities": ["wisdom", "constitution", "strength", "charisma", "dexterity", "intelligence"],
  "abilityReasoning": "Divine power flows through wisdom. Constitution keeps the healer standing. Strength for righteous battle when words fail.",
  
  "combatApproach": "Support and protect allies, entering melee only when necessary. Prioritizes keeping others alive over personal glory.",
  "skillThemes": ["divine insight", "healing arts", "religious knowledge"],
  
  "equipmentStyle": "Medium armor and shield - protected but not encumbered. Holy symbol always visible.",
  
  "cantripThemes": ["light", "damage", "utility"],
  "spellThemes": ["healing", "protection", "divine wrath"],
  
  "character": {
    "name": "Brother Marcus Lightbringer",
    "personality": {
      "traits": ["I see omens in every event and action", "Nothing can shake my optimistic attitude"],
      "ideals": ["Faith - I trust that my deity will guide my actions. I have faith that if I work hard, things will go well"],
      "bonds": ["I will do anything to protect the temple where I served"],
      "flaws": ["I judge others harshly, and myself even more severely"]
    },
    "backstory": "Marcus was a soldier before he was a priest. He killed many in battle and saw horrors that broke lesser men. When the war ended, he sought absolution in the temple of Lathander.\\n\\nThe Morninglord showed him a new path—not to forget his sins, but to balance them with mercy. Now Marcus walks the dangerous roads again, but this time to heal rather than harm. His mace is for defense, his prayers for salvation.",
    "appearance": "A broad-shouldered human man in his forties with a shaved head and kind eyes. His armor bears the symbol of Lathander, and his weathered hands are gentle despite their strength.",
    "age": 45
  }
}
\`\`\``;

/**
 * Mock AI response for a Bard
 */
const MOCK_BARD_RESPONSE = `\`\`\`json
{
  "abilityPriorities": ["charisma", "dexterity", "constitution", "intelligence", "wisdom", "strength"],
  "abilityReasoning": "A performer lives and dies by charm. Dexterity for dancing away from danger, constitution to keep performing despite the wounds.",
  
  "combatApproach": "Support through inspiration and magic, using wit and distraction rather than direct combat.",
  "skillThemes": ["performance", "persuasion", "gathering secrets"],
  
  "equipmentStyle": "Light and flashy - leather armor that doesn't restrict movement, a fine instrument, rapier for style.",
  
  "cantripThemes": ["utility", "trickery"],
  "spellThemes": ["charm", "healing", "enhancement"],
  
  "character": {
    "name": "Lyric Silversong",
    "personality": {
      "traits": ["I change my mood as quickly as I change keys in a song", "I know a story about everything"],
      "ideals": ["Beauty - What is beautiful points us toward what is true"],
      "bonds": ["I would do anything for the common folk who sheltered me when nobles hunted me"],
      "flaws": ["I'm a sucker for a pretty face"]
    },
    "backstory": "Lyric was born to nobility but found court life suffocating. When they discovered their talent for magic, they fled to join a traveling troupe of performers. Life on the road was hard but honest.\\n\\nWhen war came, the troupe was scattered. Now Lyric travels alone, collecting stories and songs of the conflict. They say it's to preserve history. Really, they're looking for their lost family—the performers who became more family than blood ever was.",
    "appearance": "An androgynous half-elf with flowing silver hair and eyes that shift color with their mood. They dress in colorful but practical traveling clothes, always carrying a beautiful lute.",
    "age": 28
  }
}
\`\`\``;

/**
 * Get mock response by class
 */
function getMockResponse(classId: string): string {
    switch (classId) {
        case 'fighter':
            return MOCK_FIGHTER_RESPONSE;
        case 'wizard':
            return MOCK_WIZARD_RESPONSE;
        case 'rogue':
            return MOCK_ROGUE_RESPONSE;
        case 'cleric':
            return MOCK_CLERIC_RESPONSE;
        case 'bard':
            return MOCK_BARD_RESPONSE;
        default:
            return MOCK_FIGHTER_RESPONSE;
    }
}

// ============================================================================
// TEST RUNNER
// ============================================================================

/**
 * Run a single test case
 */
export async function runTestCase(
    testCase: TestCase,
    useMockResponse: boolean = true,
    options?: { backendValidate?: boolean; backendCompute?: boolean; maxRetries?: number }
): Promise<TestResult> {
    const startTime = Date.now();
    const result = createEmptyTestResult(testCase);
    const stageMs = (result.metrics.stageMs = result.metrics.stageMs || {});

    console.log(`\n🧪 Running test: ${testCase.id}`);
    console.log(`   Class: ${testCase.input.classId}, Race: ${testCase.input.raceId}, Level: ${testCase.input.level}`);

    try {
        // 1. Get constraints
        let constraints: GenerationConstraints;
        if (useMockResponse) {
            const t0 = Date.now();
            constraints = getMockConstraints(testCase.input.classId);
            stageMs.constraintsMs = Date.now() - t0;
        } else {
            const t0 = Date.now();
            const constraintsResult = await callConstraintsApi(testCase.input);
            stageMs.constraintsMs = Date.now() - t0;
            if (!constraintsResult.success || !constraintsResult.constraints) {
                throw new Error(constraintsResult.error || 'Constraints API call failed');
            }
            constraints = constraintsResult.constraints;
        }

        // 2. Build prompt
        const tPrompt0 = Date.now();
        const prompt = buildPreferencePrompt(testCase.input, constraints);
        stageMs.promptBuildMs = Date.now() - tPrompt0;
        console.log(`   📝 Built prompt (${prompt.length} chars)`);

        // 3. Get AI response
        let rawResponse = '';
        let preferences: AiPreferences | null = null;

        if (useMockResponse) {
            const t0 = Date.now();
            rawResponse = getMockResponse(testCase.input.classId);
            stageMs.aiCallMs = Date.now() - t0;
            console.log(`   🤖 Using mock response`);

            // Simulate some latency
            result.metrics.promptTokens = Math.floor(prompt.length / 4);
            result.metrics.completionTokens = Math.floor(rawResponse.length / 4);
            result.metrics.totalTokens = result.metrics.promptTokens + result.metrics.completionTokens;
            result.metrics.costUsd = (result.metrics.totalTokens / 1000) * 0.01; // Rough estimate
        } else {
            // Real API call (with retries)
            const maxRetries = Math.max(0, Math.floor(options?.maxRetries ?? 0));
            let lastErr: string | undefined;

            let accumulatedPromptTokens = 0;
            let accumulatedCompletionTokens = 0;
            let accumulatedTotalTokens = 0;
            let accumulatedCostUsd = 0;

            const t0 = Date.now();
            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                const attemptNo = attempt + 1;
                console.log(`   🌐 Calling real API at ${API_URL}... (attempt ${attemptNo}/${maxRetries + 1})`);

                const apiResult = await callGeneratePreferencesApi(testCase.input);
                if (!apiResult.success || !apiResult.data) {
                    lastErr = apiResult.error || 'API call failed';
                    console.log(`   ⚠️  API attempt failed: ${lastErr}`);
                    continue;
                }

                rawResponse = apiResult.data.rawResponse;
                preferences = apiResult.data.preferences as AiPreferences;

                // Accumulate real metrics from API across retries
                const genInfo = apiResult.data.generationInfo;
                accumulatedPromptTokens += genInfo.promptTokens;
                accumulatedCompletionTokens += genInfo.completionTokens;
                accumulatedTotalTokens += genInfo.totalTokens;
                accumulatedCostUsd +=
                    (genInfo.promptTokens / 1000000) * 2.50 +
                    (genInfo.completionTokens / 1000000) * 10.00;

                console.log(`   🤖 Real API response received (${genInfo.totalTokens} tokens)`);
                break;
            }
            stageMs.aiCallMs = Date.now() - t0;

            if (!preferences) {
                throw new Error(lastErr || 'API call failed (all retries exhausted)');
            }

            result.metrics.promptTokens = accumulatedPromptTokens;
            result.metrics.completionTokens = accumulatedCompletionTokens;
            result.metrics.totalTokens = accumulatedTotalTokens;
            result.metrics.costUsd = accumulatedCostUsd;
        }

        result.aiGeneration.rawResponse = rawResponse;

        // 4. Parse response (API already provides parsed preferences, mock needs parsing)
        if (!preferences) {
            const t0 = Date.now();
            preferences = parseAiResponse(rawResponse);
            stageMs.parseMs = Date.now() - t0;
        }

        if (preferences) {
            result.aiGeneration.parseSuccess = true;
            result.aiGeneration.preferences = preferences;
            console.log(`   ✅ Parsed preferences for: ${preferences.character.name}`);

            // Validate preferences
            const prefIssues = validatePreferences(preferences);
            if (prefIssues.length > 0) {
                console.log(`   ⚠️ Preference issues: ${prefIssues.join(', ')}`);
            }

            // 5. Translate to mechanics
            const tTranslate0 = Date.now();
            const translation = translatePreferences(preferences, constraints, { level: testCase.input.level });
            stageMs.translateMs = Date.now() - tTranslate0;
            result.translation = translation;

            if (translation.success) {
                console.log(`   ✅ Translation successful`);

                // Log ability scores
                if (translation.translations.abilityScores?.scores) {
                    const scores = translation.translations.abilityScores.scores;
                    console.log(`   📊 Ability Scores: STR ${scores.strength}, DEX ${scores.dexterity}, CON ${scores.constitution}, INT ${scores.intelligence}, WIS ${scores.wisdom}, CHA ${scores.charisma}`);
                    console.log(`   📊 Points Spent: ${translation.translations.abilityScores.pointsSpent}/27`);
                }

                // Log skills
                if (translation.translations.skills?.selected) {
                    console.log(`   📊 Skills: ${translation.translations.skills.selected.join(', ')}`);
                }

                // Log equipment
                if (translation.translations.equipment?.packageId) {
                    console.log(`   📊 Equipment Package: ${translation.translations.equipment.packageId}`);
                }
            } else {
                console.log(`   ❌ Translation failed: ${translation.issues.join(', ')}`);
            }

            // 6. Validate translation results
            const tValidate0 = Date.now();
            result.validation = validateTranslation(translation, constraints);
            stageMs.validateMs = Date.now() - tValidate0;

            if (result.validation.isValid) {
                console.log(`   ✅ Validation passed`);
            } else {
                console.log(`   ❌ Validation failed: ${result.validation.allIssues.join(', ')}`);
            }

            // 7. Optional backend validation (E2)
            const shouldBackendValidate = !useMockResponse && (options?.backendValidate ?? false);
            if (shouldBackendValidate && translation.success) {
                const t0 = Date.now();
                const backendValidation = await callValidateApi(testCase.input, constraints, translation);
                stageMs.backendValidateMs = Date.now() - t0;
                result.validation.backend = {
                    valid: backendValidation.success,
                    issues: backendValidation.issues || (backendValidation.error ? [backendValidation.error] : []),
                    sections: backendValidation.sections,
                };

                if (result.validation.backend.valid) {
                    console.log('   ✅ Backend validation passed');
                } else {
                    console.log(`   ❌ Backend validation failed: ${result.validation.backend.issues.join(', ')}`);
                }
            }

            // 8. Optional backend compute (E3)
            const shouldBackendCompute = !useMockResponse && (options?.backendCompute ?? false);
            if (shouldBackendCompute && translation.success) {
                const t0 = Date.now();
                const backendCompute = await callComputeApi(testCase.input, constraints, translation);
                stageMs.backendComputeMs = Date.now() - t0;

                result.validation.backendCompute = {
                    success: backendCompute.success,
                    issues: backendCompute.issues || (backendCompute.error ? [backendCompute.error] : []),
                    derivedStats: backendCompute.derivedStats,
                    sections: backendCompute.sections,
                };

                if (result.validation.backendCompute.success) {
                    console.log('   ✅ Backend compute passed');
                } else {
                    console.log(`   ❌ Backend compute failed: ${result.validation.backendCompute.issues.join(', ')}`);
                }
            }

        } else {
            result.aiGeneration.parseSuccess = false;
            result.aiGeneration.parseError = 'Failed to parse JSON from response';
            console.log(`   ❌ Parse failed`);
        }

    } catch (error) {
        console.log(`   ❌ Error: ${error}`);
        result.aiGeneration.parseError = String(error);
    }

    result.metrics.latencyMs = Date.now() - startTime;
    return result;
}

/**
 * Validate translation results against constraints
 */
function validateTranslation(
    translation: ReturnType<typeof translatePreferences>,
    constraints: GenerationConstraints
): TestResult['validation'] {
    const allIssues: string[] = [];

    // Validate point buy
    const pointBuyValid = translation.translations.abilityScores?.success ?? false;
    const pointsSpent = translation.translations.abilityScores?.pointsSpent ?? 0;
    if (!pointBuyValid) {
        allIssues.push('Point buy invalid');
    }
    if (pointsSpent > 27) {
        allIssues.push(`Point buy overflow: ${pointsSpent}/27`);
    }

    // Validate skills
    const skillsValid = translation.translations.skills?.success ?? false;
    const invalidSkills: string[] = [];
    if (translation.translations.skills?.selected) {
        for (const skill of translation.translations.skills.selected) {
            if (!constraints.skills.classOptions.includes(skill) &&
                !constraints.skills.grantedByBackground.includes(skill)) {
                invalidSkills.push(skill);
            }
        }
    }
    if (invalidSkills.length > 0) {
        allIssues.push(`Invalid skills: ${invalidSkills.join(', ')}`);
    }

    // Validate equipment
    const equipmentValid = translation.translations.equipment?.success ?? false;
    const equipmentIssues: string[] = [];
    if (translation.translations.equipment?.packageId) {
        const validPackage = constraints.equipment.packages.find(
            p => p.id === translation.translations.equipment?.packageId
        );
        if (!validPackage) {
            equipmentIssues.push(`Invalid package: ${translation.translations.equipment.packageId}`);
        }
    }

    // Overall validation
    const isValid =
        pointBuyValid &&
        pointsSpent <= 27 &&
        skillsValid &&
        invalidSkills.length === 0 &&
        equipmentValid &&
        equipmentIssues.length === 0;

    return {
        isValid,
        pointBuy: {
            valid: pointBuyValid && pointsSpent <= 27,
            pointsSpent,
            issues: pointsSpent > 27 ? [`Spent ${pointsSpent}/27 points`] : [],
        },
        skills: {
            valid: skillsValid && invalidSkills.length === 0,
            invalidSkills,
        },
        equipment: {
            valid: equipmentValid && equipmentIssues.length === 0,
            issues: equipmentIssues,
        },
        allIssues,
    };
}

// ============================================================================
// PILOT TEST
// ============================================================================

/**
 * Run the pilot test (5 cases, one per class)
 */
export async function runPilotTest(): Promise<void> {
    console.log('═'.repeat(70));
    console.log(' AI CHARACTER GENERATION PILOT TEST');
    console.log('═'.repeat(70));

    const testCases = generatePilotTestCases();
    console.log(`\n📋 Generated ${testCases.length} test cases\n`);

    const results: TestResult[] = [];

    for (const testCase of testCases) {
        const result = await runTestCase(testCase, true);
        results.push(result);
    }

    // Aggregate and report
    console.log('\n' + '═'.repeat(70));
    const summary = aggregateResults(results);
    console.log(formatSummaryReport(summary));

    // Detailed failure analysis
    if (summary.failurePatterns.length > 0) {
        console.log('\n📋 DETAILED FAILURE ANALYSIS');
        console.log('─'.repeat(70));
        for (const pattern of summary.failurePatterns) {
            console.log(`\n${pattern.pattern} (${pattern.count} occurrences)`);
            for (const example of pattern.examples) {
                console.log(`  → ${example}`);
            }
        }
    }
}

/**
 * Demo: Show the prompt that would be sent
 */
export function showPromptDemo(classId: string = 'fighter'): void {
    console.log('═'.repeat(70));
    console.log(' PROMPT DEMO');
    console.log('═'.repeat(70));

    const constraints = getMockConstraints(classId);
    const input = {
        classId,
        raceId: 'human',
        level: 1 as const,
        backgroundId: 'soldier',
        concept: 'A battle-hardened veteran seeking redemption after a war gone wrong',
    };

    console.log('\n📋 SYSTEM PROMPT:');
    console.log('─'.repeat(70));
    console.log(SYSTEM_PROMPT);

    console.log('\n📋 USER PROMPT:');
    console.log('─'.repeat(70));
    const prompt = buildPreferencePrompt(input, constraints);
    console.log(prompt);
}

/**
 * Demo: Show the full pipeline with one mock response
 */
export async function showPipelineDemo(classId: string = 'fighter'): Promise<void> {
    console.log('═'.repeat(70));
    console.log(' PIPELINE DEMO');
    console.log('═'.repeat(70));

    const testCase: TestCase = {
        id: `${classId}-human-L1-soldier`,
        input: {
            classId,
            raceId: 'human',
            level: 1,
            backgroundId: 'soldier',
            concept: 'A battle-hardened veteran seeking redemption after a war gone wrong',
        },
        createdAt: new Date().toISOString(),
    };

    await runTestCase(testCase, true);
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).pcgTest = {
        runPilotTest,
        showPromptDemo,
        showPipelineDemo,
        runTestCase,
    };
}

