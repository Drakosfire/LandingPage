/**
 * Test Harness for AI Character Generation
 * 
 * Generates synthetic test cases and runs them through the generation pipeline.
 * Used to validate AI preference generation and Rule Engine translation.
 * 
 * @module CharacterGenerator/generation/testHarness
 */

import {
    GenerationInput,
    TestCase,
    TestResult,
    TestSummary,
    createTestCaseId,
} from './types';

// ============================================================================
// TEST DATA
// ============================================================================

/**
 * Available classes for testing (core PHB classes)
 */
export const TEST_CLASSES = [
    'fighter',
    'wizard',
    'rogue',
    'cleric',
    'bard',
] as const;

/**
 * Available races for testing (core PHB races)
 */
export const TEST_RACES = [
    'human',
    'dwarf',
    'elf',
    'halfling',
    'half-orc',
] as const;

/**
 * Available levels for testing (1-3 per scope)
 */
export const TEST_LEVELS = [1, 2, 3] as const;

/**
 * Available backgrounds for testing
 */
export const TEST_BACKGROUNDS = [
    'soldier',
    'sage',
    'criminal',
    'acolyte',
    'folk-hero',
] as const;

/**
 * Sample character concepts for variety
 */
export const SAMPLE_CONCEPTS = [
    "A battle-hardened veteran seeking redemption after a war gone wrong",
    "A young prodigy discovering their hidden magical talents",
    "A cynical outcast with a heart of gold and a troubled past",
    "A devout believer on a holy mission to cleanse corruption",
    "A charming trickster with hidden depths and surprising loyalty",
    "A stoic guardian who speaks little but protects fiercely",
    "A curious scholar obsessed with forbidden knowledge",
    "A reformed criminal trying to make amends for past sins",
    "A wilderness survivor distrustful of civilization",
    "A noble exile seeking to reclaim their birthright",
] as const;

// ============================================================================
// TEST CASE GENERATION
// ============================================================================

/**
 * Generate a single test case
 */
export function generateTestCase(
    classId: string,
    raceId: string,
    level: 1 | 2 | 3,
    backgroundId: string,
    concept: string
): TestCase {
    const input: GenerationInput = {
        classId,
        raceId,
        level,
        backgroundId,
        concept,
    };

    return {
        id: createTestCaseId(input),
        input,
        createdAt: new Date().toISOString(),
    };
}

/**
 * Generate pilot test cases (5 cases - one per class)
 * 
 * Strategy: Hold race, level, background constant, vary class
 * This isolates class-specific behavior
 */
export function generatePilotTestCases(): TestCase[] {
    const cases: TestCase[] = [];

    // Fixed parameters for pilot
    const race = 'human';      // No ability bonuses to complicate things
    const level = 1 as const;  // Simplest case
    const background = 'soldier';
    const concept = SAMPLE_CONCEPTS[0]; // "battle-hardened veteran..."

    for (const classId of TEST_CLASSES) {
        cases.push(generateTestCase(classId, race, level, background, concept));
    }

    return cases;
}

/**
 * Generate a representative sample of test cases
 * 
 * Strategy: Cover key combinations without exhaustive matrix
 * - Each class appears at least once
 * - Each race appears at least once
 * - Each level appears at least once
 * - Different concepts for variety
 */
export function generateRepresentativeSample(count: number = 15): TestCase[] {
    // NOTE: `createTestCaseId()` intentionally ignores `concept`, so uniqueness is bounded by:
    // classes × races × levels × backgrounds = 5 × 5 × 3 × 5 = 375 unique IDs.
    // This generator must reliably return up to `count` unique cases (<= 375).

    const normalizedCount = Math.max(1, Math.floor(count));

    // Build all unique combinations deterministically (375 total).
    const candidates: TestCase[] = [];
    let conceptIndex = 0;

    for (const level of TEST_LEVELS) {
        for (const classId of TEST_CLASSES) {
            for (const raceId of TEST_RACES) {
                for (const backgroundId of TEST_BACKGROUNDS) {
                    const concept = SAMPLE_CONCEPTS[conceptIndex % SAMPLE_CONCEPTS.length];
                    candidates.push(generateTestCase(classId, raceId, level, backgroundId, concept));
                    conceptIndex++;
                }
            }
        }
    }

    if (normalizedCount >= candidates.length) {
        return candidates;
    }

    // Select an evenly spaced subset so we cover the space without biasing toward early loops.
    const stride = candidates.length / normalizedCount;
    const selected: TestCase[] = [];
    for (let i = 0; i < normalizedCount; i++) {
        selected.push(candidates[Math.floor(i * stride)]);
    }

    return selected;
}

/**
 * Generate full test matrix (all combinations)
 * Warning: This generates 5 × 5 × 3 × 5 = 375 cases
 */
export function generateFullMatrix(): TestCase[] {
    const cases: TestCase[] = [];
    let conceptIndex = 0;

    for (const classId of TEST_CLASSES) {
        for (const raceId of TEST_RACES) {
            for (const level of TEST_LEVELS) {
                for (const backgroundId of TEST_BACKGROUNDS) {
                    const concept = SAMPLE_CONCEPTS[conceptIndex % SAMPLE_CONCEPTS.length];
                    cases.push(generateTestCase(classId, raceId, level, backgroundId, concept));
                    conceptIndex++;
                }
            }
        }
    }

    return cases;
}

// ============================================================================
// FILTERED GENERATION (for rerunning failure slices)
// ============================================================================

export interface TestCaseFilters {
    classes?: string[];
    races?: string[];
    levels?: Array<1 | 2 | 3>;
    backgrounds?: string[];
}

/**
 * Generate a filtered matrix (all combinations matching filters).
 *
 * Used to quickly re-run only the slices that failed (e.g. classes+levels).
 */
export function generateFilteredMatrix(filters: TestCaseFilters): TestCase[] {
    const classSet = filters.classes ? new Set(filters.classes) : null;
    const raceSet = filters.races ? new Set(filters.races) : null;
    const levelSet = filters.levels ? new Set(filters.levels) : null;
    const bgSet = filters.backgrounds ? new Set(filters.backgrounds) : null;

    const classes = TEST_CLASSES.filter(c => !classSet || classSet.has(c));
    const races = TEST_RACES.filter(r => !raceSet || raceSet.has(r));
    const levels = TEST_LEVELS.filter(l => !levelSet || levelSet.has(l));
    const backgrounds = TEST_BACKGROUNDS.filter(b => !bgSet || bgSet.has(b));

    const candidates: TestCase[] = [];
    let conceptIndex = 0;

    // Iterate in the same stable order as representative sample (level → class → race → background)
    for (const level of levels) {
        for (const classId of classes) {
            for (const raceId of races) {
                for (const backgroundId of backgrounds) {
                    const concept = SAMPLE_CONCEPTS[conceptIndex % SAMPLE_CONCEPTS.length];
                    candidates.push(generateTestCase(classId, raceId, level, backgroundId, concept));
                    conceptIndex++;
                }
            }
        }
    }

    return candidates;
}

/**
 * Generate a filtered sample.
 *
 * If `count` is omitted, returns the full filtered matrix.
 * If `count` is provided, returns an evenly spaced subset.
 */
export function generateFilteredSample(filters: TestCaseFilters, count?: number): TestCase[] {
    const candidates = generateFilteredMatrix(filters);
    if (count === undefined || !Number.isFinite(count) || count <= 0 || count >= candidates.length) {
        return candidates;
    }

    const normalizedCount = Math.max(1, Math.floor(count));
    const stride = candidates.length / normalizedCount;
    const selected: TestCase[] = [];
    for (let i = 0; i < normalizedCount; i++) {
        selected.push(candidates[Math.floor(i * stride)]);
    }
    return selected;
}

// ============================================================================
// RESULT AGGREGATION
// ============================================================================

/**
 * Create an empty test result for a test case
 * Used as a template before actual execution
 */
export function createEmptyTestResult(testCase: TestCase): TestResult {
    return {
        testCase,
        executedAt: new Date().toISOString(),
        aiGeneration: {
            parseSuccess: false,
            rawResponse: '',
        },
        translation: {
            success: false,
            translations: {},
            issues: [],
        },
        validation: {
            isValid: false,
            pointBuy: { valid: false, pointsSpent: 0, issues: [] },
            skills: { valid: false, invalidSkills: [] },
            equipment: { valid: false, issues: [] },
            allIssues: [],
        },
        metrics: {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            latencyMs: 0,
            costUsd: 0,
            stageMs: {},
        },
    };
}

function percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const rank = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * (sorted.length - 1))));
    return sorted[rank];
}

/**
 * Aggregate test results into a summary
 */
export function aggregateResults(results: TestResult[]): TestSummary {
    const total = results.length;

    // Count successes
    const parseSuccessCount = results.filter(r => r.aiGeneration.parseSuccess).length;
    const translationSuccessCount = results.filter(r => r.translation.success).length;
    const validationSuccessCount = results.filter(r => r.validation.isValid).length;
    const overallSuccessCount = results.filter(r =>
        r.aiGeneration.parseSuccess &&
        r.translation.success &&
        r.validation.isValid
    ).length;

    // Group by class
    const byClass: TestSummary['byClass'] = {};
    for (const classId of TEST_CLASSES) {
        const classResults = results.filter(r => r.testCase.input.classId === classId);
        byClass[classId] = {
            total: classResults.length,
            parseSuccess: classResults.filter(r => r.aiGeneration.parseSuccess).length,
            translationSuccess: classResults.filter(r => r.translation.success).length,
            validationSuccess: classResults.filter(r => r.validation.isValid).length,
        };
    }

    // Group by race
    const byRace: TestSummary['byRace'] = {};
    for (const raceId of TEST_RACES) {
        const raceResults = results.filter(r => r.testCase.input.raceId === raceId);
        byRace[raceId] = {
            total: raceResults.length,
            validationSuccess: raceResults.filter(r => r.validation.isValid).length,
        };
    }

    // Group by level
    const byLevel: TestSummary['byLevel'] = {};
    for (const level of TEST_LEVELS) {
        const levelResults = results.filter(r => r.testCase.input.level === level);
        byLevel[level] = {
            total: levelResults.length,
            validationSuccess: levelResults.filter(r => r.validation.isValid).length,
        };
    }

    // Identify failure patterns
    const failurePatterns = identifyFailurePatterns(results);

    // Aggregate metrics
    const totalTokens = results.reduce((sum, r) => sum + r.metrics.totalTokens, 0);
    const totalLatency = results.reduce((sum, r) => sum + r.metrics.latencyMs, 0);
    const totalCost = results.reduce((sum, r) => sum + r.metrics.costUsd, 0);
    const latencies = results.map(r => r.metrics.latencyMs).filter(ms => Number.isFinite(ms));

    return {
        totalCases: total,
        generatedAt: new Date().toISOString(),
        successRates: {
            parseSuccess: total > 0 ? parseSuccessCount / total : 0,
            translationSuccess: total > 0 ? translationSuccessCount / total : 0,
            validationSuccess: total > 0 ? validationSuccessCount / total : 0,
            overallSuccess: total > 0 ? overallSuccessCount / total : 0,
        },
        byClass,
        byRace,
        byLevel,
        failurePatterns,
        metrics: {
            avgPromptTokens: total > 0
                ? results.reduce((sum, r) => sum + r.metrics.promptTokens, 0) / total
                : 0,
            avgCompletionTokens: total > 0
                ? results.reduce((sum, r) => sum + r.metrics.completionTokens, 0) / total
                : 0,
            avgTotalTokens: total > 0 ? totalTokens / total : 0,
            avgLatencyMs: total > 0 ? totalLatency / total : 0,
            p50LatencyMs: percentile(latencies, 50),
            p95LatencyMs: percentile(latencies, 95),
            totalCostUsd: totalCost,
            costPerSuccess: overallSuccessCount > 0 ? totalCost / overallSuccessCount : 0,
        },
    };
}

/**
 * Identify common failure patterns in test results
 */
function identifyFailurePatterns(results: TestResult[]): TestSummary['failurePatterns'] {
    const patternCounts: Record<string, { count: number; examples: string[] }> = {};

    for (const result of results) {
        // Check parse failures
        if (!result.aiGeneration.parseSuccess) {
            const pattern = 'JSON Parse Failure';
            if (!patternCounts[pattern]) {
                patternCounts[pattern] = { count: 0, examples: [] };
            }
            patternCounts[pattern].count++;
            if (patternCounts[pattern].examples.length < 3) {
                patternCounts[pattern].examples.push(result.testCase.id);
            }
        }

        // Check translation issues
        for (const issue of result.translation.issues) {
            const pattern = categorizeIssue(issue);
            if (!patternCounts[pattern]) {
                patternCounts[pattern] = { count: 0, examples: [] };
            }
            patternCounts[pattern].count++;
            if (patternCounts[pattern].examples.length < 3) {
                patternCounts[pattern].examples.push(`${result.testCase.id}: ${issue}`);
            }
        }

        // Check validation issues
        for (const issue of result.validation.allIssues) {
            const pattern = categorizeIssue(issue);
            if (!patternCounts[pattern]) {
                patternCounts[pattern] = { count: 0, examples: [] };
            }
            patternCounts[pattern].count++;
            if (patternCounts[pattern].examples.length < 3) {
                patternCounts[pattern].examples.push(`${result.testCase.id}: ${issue}`);
            }
        }
    }

    // Convert to array and sort by count
    const total = results.length;
    return Object.entries(patternCounts)
        .map(([pattern, data]) => ({
            pattern,
            count: data.count,
            percentage: total > 0 ? (data.count / total) * 100 : 0,
            examples: data.examples,
        }))
        .sort((a, b) => b.count - a.count);
}

/**
 * Categorize an issue into a pattern
 */
function categorizeIssue(issue: string): string {
    const lowerIssue = issue.toLowerCase();

    if (lowerIssue.includes('point buy') || lowerIssue.includes('points')) {
        return 'Point Buy Issue';
    }
    if (lowerIssue.includes('skill') && lowerIssue.includes('match')) {
        return 'Skill Theme Mismatch';
    }
    if (lowerIssue.includes('skill') && lowerIssue.includes('invalid')) {
        return 'Invalid Skill Selection';
    }
    if (lowerIssue.includes('equipment') || lowerIssue.includes('package')) {
        return 'Equipment Selection Issue';
    }
    if (lowerIssue.includes('spell') && lowerIssue.includes('level')) {
        return 'Spell Level Violation';
    }
    if (lowerIssue.includes('spell')) {
        return 'Spell Selection Issue';
    }
    if (lowerIssue.includes('subclass') || lowerIssue.includes('fighting style')) {
        return 'Feature Choice Issue';
    }
    if (lowerIssue.includes('auto-selected')) {
        return 'Auto-Selection Fallback';
    }

    return 'Other Issue';
}

// ============================================================================
// REPORTING
// ============================================================================

/**
 * Format test summary as a readable report string
 */
export function formatSummaryReport(summary: TestSummary): string {
    const lines: string[] = [];

    lines.push('═'.repeat(70));
    lines.push(' AI GENERATION EXPERIMENT RESULTS');
    lines.push(` Generated: ${summary.generatedAt}`);
    lines.push(` Test Cases: ${summary.totalCases}`);
    lines.push('═'.repeat(70));
    lines.push('');

    // Success rates
    lines.push('OVERALL SUCCESS RATES');
    lines.push('─'.repeat(70));
    lines.push(` Parse Success:       ${(summary.successRates.parseSuccess * 100).toFixed(1)}%`);
    lines.push(` Translation Success: ${(summary.successRates.translationSuccess * 100).toFixed(1)}%`);
    lines.push(` Validation Success:  ${(summary.successRates.validationSuccess * 100).toFixed(1)}%`);
    lines.push(` Overall Success:     ${(summary.successRates.overallSuccess * 100).toFixed(1)}%`);
    lines.push('');

    // By class
    lines.push('BY CLASS');
    lines.push('─'.repeat(70));
    for (const [classId, stats] of Object.entries(summary.byClass)) {
        if (stats.total > 0) {
            const rate = ((stats.validationSuccess / stats.total) * 100).toFixed(1);
            lines.push(` ${classId.padEnd(12)} ${rate}% (${stats.validationSuccess}/${stats.total})`);
        }
    }
    lines.push('');

    // By level
    lines.push('BY LEVEL');
    lines.push('─'.repeat(70));
    for (const [level, stats] of Object.entries(summary.byLevel)) {
        if (stats.total > 0) {
            const rate = ((stats.validationSuccess / stats.total) * 100).toFixed(1);
            lines.push(` Level ${level}:  ${rate}% (${stats.validationSuccess}/${stats.total})`);
        }
    }
    lines.push('');

    // Failure patterns
    if (summary.failurePatterns.length > 0) {
        lines.push('FAILURE PATTERNS');
        lines.push('─'.repeat(70));
        for (const pattern of summary.failurePatterns.slice(0, 5)) {
            lines.push(` ${pattern.pattern}: ${pattern.count} (${pattern.percentage.toFixed(1)}%)`);
            for (const example of pattern.examples.slice(0, 2)) {
                lines.push(`   → ${example}`);
            }
        }
        lines.push('');
    }

    // Metrics
    lines.push('COST ANALYSIS');
    lines.push('─'.repeat(70));
    lines.push(` Avg Tokens/Request: ${summary.metrics.avgTotalTokens.toFixed(0)}`);
    lines.push(` Avg Latency:        ${summary.metrics.avgLatencyMs.toFixed(0)}ms`);
    lines.push(` p50 Latency:        ${summary.metrics.p50LatencyMs.toFixed(0)}ms`);
    lines.push(` p95 Latency:        ${summary.metrics.p95LatencyMs.toFixed(0)}ms`);
    lines.push(` Total Cost:         $${summary.metrics.totalCostUsd.toFixed(4)}`);
    lines.push(` Cost per Success:   $${summary.metrics.costPerSuccess.toFixed(4)}`);
    lines.push('');

    lines.push('═'.repeat(70));

    return lines.join('\n');
}

/**
 * Print test cases for review
 */
export function printTestCases(cases: TestCase[]): void {
    console.log('═'.repeat(70));
    console.log(' TEST CASES');
    console.log('═'.repeat(70));

    for (const tc of cases) {
        console.log(`\n${tc.id}`);
        console.log(`  Class: ${tc.input.classId}`);
        console.log(`  Race: ${tc.input.raceId}`);
        console.log(`  Level: ${tc.input.level}`);
        console.log(`  Background: ${tc.input.backgroundId}`);
        console.log(`  Concept: "${tc.input.concept.substring(0, 50)}..."`);
    }

    console.log('\n' + '═'.repeat(70));
    console.log(` Total: ${cases.length} test cases`);
}

