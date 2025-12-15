/**
 * Demo script for AI Character Generation Pipeline
 * 
 * Run with:
 *   npx tsx src/components/PlayerCharacterGenerator/generation/demo.ts pilot
 *   npx tsx src/components/PlayerCharacterGenerator/generation/demo.ts pilot --live
 *   npx tsx src/components/PlayerCharacterGenerator/generation/demo.ts sample --count 75
 *   npx tsx src/components/PlayerCharacterGenerator/generation/demo.ts sample --count 75 --live
 *   npx tsx src/components/PlayerCharacterGenerator/generation/demo.ts sample --count 75 --live --concurrency 4
 *   npx tsx src/components/PlayerCharacterGenerator/generation/demo.ts prompt wizard
 *   npx tsx src/components/PlayerCharacterGenerator/generation/demo.ts pipeline fighter --live
 */

import fs from 'node:fs/promises';
import path from 'node:path';

import { runPilotTest, showPromptDemo, showPipelineDemo, runTestCase } from './index';
import { generatePilotTestCases, generateRepresentativeSample, generateFilteredSample } from './testHarness';
import { aggregateResults, formatSummaryReport } from './testHarness';
import type { TestResult } from './types';

function isDevEnvironment(): boolean {
    const env = (process.env.DUNGEONMIND_ENV || '').toLowerCase().trim();
    if (env === 'dev' || env === 'development') return true;
    const apiUrl = process.env.DUNGEONMIND_API_URL || '';
    return apiUrl.includes('dev.dungeonmind.net');
}

function timestampForFilename(date: Date = new Date()): string {
    // 2025-12-14T00-19-34.921Z (safe for filenames)
    return date.toISOString().replace(/:/g, '-');
}

async function saveDevRunLogIfEnabled(args: string[], output: string): Promise<string | null> {
    if (!isDevEnvironment()) return null;
    if (args.includes('--no-save-log')) return null;

    const logDir = path.join(process.cwd(), 'pcg_run_logs');
    await fs.mkdir(logDir, { recursive: true });

    const command = args[0] || 'pilot';
    const filename = `${timestampForFilename()}__${command}.txt`;
    const fullPath = path.join(logDir, filename);

    await fs.writeFile(fullPath, output, { encoding: 'utf-8' });
    return fullPath;
}

function printFailureDetails(results: TestResult[]): void {
    const failed = results.filter(r =>
        !r.aiGeneration.parseSuccess ||
        !r.translation.success ||
        !r.validation.isValid ||
        (r.validation.backend && !r.validation.backend.valid) ||
        (r.validation.backendCompute && !r.validation.backendCompute.success)
    );

    if (failed.length === 0) return;

    console.log('\n' + '═'.repeat(70));
    console.log(' FAILURE DETAILS (FULL)');
    console.log(` Failed Cases: ${failed.length}/${results.length}`);
    console.log('═'.repeat(70));

    for (const r of failed) {
        const titleParts = [
            r.testCase.id,
            !r.aiGeneration.parseSuccess ? 'PARSE_FAIL' : null,
            r.aiGeneration.parseSuccess && !r.translation.success ? 'TRANSLATE_FAIL' : null,
            r.aiGeneration.parseSuccess && r.translation.success && !r.validation.isValid ? 'VALIDATE_FAIL' : null,
            r.validation.backend && !r.validation.backend.valid ? 'BACKEND_VALIDATE_FAIL' : null,
            r.validation.backendCompute && !r.validation.backendCompute.success ? 'BACKEND_COMPUTE_FAIL' : null,
        ].filter(Boolean);

        console.log('\n' + '─'.repeat(70));
        console.log(titleParts.join(' | '));
        console.log('─'.repeat(70));

        // "Full" dump: includes rawResponse + issues + backend sections + stage timings
        console.log(
            JSON.stringify(
                {
                    testCase: r.testCase,
                    aiGeneration: r.aiGeneration,
                    translation: r.translation,
                    validation: r.validation,
                    metrics: r.metrics,
                },
                null,
                2
            )
        );
    }
}

function getArgValue(args: string[], key: string): string | undefined {
    // Supports: --key value  OR  --key=value
    const eq = args.find(a => a.startsWith(`${key}=`));
    if (eq) return eq.split('=').slice(1).join('=');
    const idx = args.findIndex(a => a === key);
    if (idx >= 0 && idx + 1 < args.length) return args[idx + 1];
    return undefined;
}

function clampInt(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) return min;
    return Math.max(min, Math.min(max, Math.floor(value)));
}

function parseCsvList(arg: string | undefined): string[] | undefined {
    if (!arg) return undefined;
    const parts = arg
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    return parts.length > 0 ? parts : undefined;
}

function parseCsvLevels(arg: string | undefined): Array<1 | 2 | 3> | undefined {
    const parts = parseCsvList(arg);
    if (!parts) return undefined;
    const levels: Array<1 | 2 | 3> = [];
    for (const p of parts) {
        const n = Number(p);
        if (n === 1 || n === 2 || n === 3) levels.push(n);
    }
    return levels.length > 0 ? levels : undefined;
}

async function runTestCasesWithConcurrency(
    testCases: Array<Parameters<typeof runTestCase>[0]>,
    useLiveApi: boolean,
    concurrency: number,
    backendValidate: boolean,
    backendCompute: boolean,
    maxRetries: number
): Promise<TestResult[]> {
    const results: TestResult[] = new Array(testCases.length);

    let nextIndex = 0;
    let completed = 0;
    const startedAt = Date.now();
    let inFlight = 0;
    let maxInFlightObserved = 0;

    const shouldLogConcurrency = concurrency > 1;
    if (shouldLogConcurrency) {
        console.log(
            `\n🧵 [Concurrency] Starting worker pool: concurrency=${concurrency}, totalCases=${testCases.length}, mode=${useLiveApi ? 'LIVE' : 'MOCK'}`
        );
    }

    const worker = async (workerId: number): Promise<void> => {
        if (shouldLogConcurrency) {
            console.log(`🧵 [Concurrency] Worker ${workerId} started`);
        }
        while (true) {
            const idx = nextIndex;
            nextIndex += 1;
            if (idx >= testCases.length) return;

            const testCase = testCases[idx];
            const t0 = Date.now();

            inFlight += 1;
            maxInFlightObserved = Math.max(maxInFlightObserved, inFlight);
            if (shouldLogConcurrency) {
                console.log(
                    `🧵 [Concurrency] W${workerId} START ${idx + 1}/${testCases.length} | inFlight=${inFlight}/${concurrency} | ${testCase.id}`
                );
            }

            // runTestCase(..., useMockResponse) so: useMock = !useLiveApi
            const result = await runTestCase(testCase, !useLiveApi, { backendValidate, backendCompute, maxRetries });
            results[idx] = result;

            // Lightweight progress indicator for long-running live samples
            completed += 1;
            if (useLiveApi && concurrency > 1) {
                const elapsed = Date.now() - startedAt;
                const avgPer = completed > 0 ? elapsed / completed : 0;
                const remaining = testCases.length - completed;
                const etaMs = Math.max(0, Math.floor(avgPer * remaining));
                console.log(`   ⏱️  Progress: ${completed}/${testCases.length} (ETA ~${Math.round(etaMs / 1000)}s)`);
            }

            const durationMs = Date.now() - t0;
            const ok = result.aiGeneration.parseSuccess && result.translation.success && result.validation.isValid;
            if (shouldLogConcurrency) {
                console.log(
                    `🧵 [Concurrency] W${workerId} END   ${idx + 1}/${testCases.length} | inFlight=${inFlight - 1}/${concurrency} | ${ok ? '✅ OK' : '❌ FAIL'} | ${durationMs}ms | ${testCase.id}`
                );
            }
            inFlight -= 1;
        }
    };

    const workers = Array.from({ length: concurrency }, (_v, i) => worker(i + 1));
    await Promise.all(workers);

    if (shouldLogConcurrency) {
        console.log(
            `🧵 [Concurrency] Pool complete: maxInFlightObserved=${maxInFlightObserved}/${concurrency}, completed=${completed}/${testCases.length}`
        );
    }
    return results;
}

async function runPilotWithApi(): Promise<void> {
    console.log('═'.repeat(70));
    console.log(' AI CHARACTER GENERATION PILOT TEST (LIVE API)');
    console.log('═'.repeat(70));

    const testCases = generatePilotTestCases();
    console.log(`\n📋 Generated ${testCases.length} test cases\n`);
    console.log('⚠️  Using REAL OpenAI API - this will incur costs!\n');

    const results = await runTestCasesWithConcurrency(testCases, true, 1, false, false, 0);

    // Aggregate and report
    console.log('\n' + '═'.repeat(70));
    const summary = aggregateResults(results);
    console.log(formatSummaryReport(summary));
    printFailureDetails(results);

    // Cost breakdown
    const totalCost = results.reduce((sum, r) => sum + (r.metrics.costUsd || 0), 0);
    console.log('\n💰 COST BREAKDOWN');
    console.log('─'.repeat(70));
    console.log(`   Total Cost: $${totalCost.toFixed(4)}`);
    console.log(`   Avg Cost/Character: $${(totalCost / results.length).toFixed(4)}`);
}

async function runRepresentativeSample(count: number, useLiveApi: boolean, concurrency: number): Promise<void> {
    console.log('═'.repeat(70));
    console.log(
        ` AI CHARACTER GENERATION REPRESENTATIVE SAMPLE (${count} cases)${useLiveApi ? ' (LIVE API)' : ''} (concurrency=${concurrency})`
    );
    console.log('═'.repeat(70));

    const filterClasses = parseCsvList(getArgValue(process.argv.slice(2), '--classes'));
    const filterLevels = parseCsvLevels(getArgValue(process.argv.slice(2), '--levels'));
    const filterRaces = parseCsvList(getArgValue(process.argv.slice(2), '--races'));
    const filterBackgrounds = parseCsvList(getArgValue(process.argv.slice(2), '--backgrounds'));

    const hasFilters = !!(filterClasses || filterLevels || filterRaces || filterBackgrounds);

    const testCases = hasFilters
        ? generateFilteredSample(
            {
                classes: filterClasses,
                levels: filterLevels,
                races: filterRaces,
                backgrounds: filterBackgrounds,
            },
            // If user didn't pass --count explicitly, we want ALL cases in the filtered slice.
            // We approximate "explicit" by checking raw argv.
            process.argv.includes('--count') || process.argv.some(a => a.startsWith('--count='))
                ? count
                : undefined
        )
        : generateRepresentativeSample(count);
    console.log(`\n📋 Generated ${testCases.length} test cases\n`);
    if (useLiveApi) {
        console.log('⚠️  Using REAL OpenAI API - this will incur costs!\n');
    }

    const backendValidate = useLiveApi && process.argv.includes('--backend-validate');
    const backendCompute = useLiveApi && process.argv.includes('--backend-compute');
    const maxRetries = clampInt(Number(getArgValue(process.argv.slice(2), '--max-retries') ?? 0), 0, 3);
    const results = await runTestCasesWithConcurrency(
        testCases,
        useLiveApi,
        concurrency,
        backendValidate,
        backendCompute,
        maxRetries
    );

    // Aggregate and report
    console.log('\n' + '═'.repeat(70));
    const summary = aggregateResults(results);
    console.log(formatSummaryReport(summary));
    printFailureDetails(results);

    // Cost breakdown
    const totalCost = results.reduce((sum, r) => sum + (r.metrics.costUsd || 0), 0);
    console.log('\n💰 COST BREAKDOWN');
    console.log('─'.repeat(70));
    console.log(`   Total Cost: $${totalCost.toFixed(4)}`);
    console.log(`   Avg Cost/Character: $${(totalCost / results.length).toFixed(4)}`);
}

async function runPipelineWithApi(classId: string): Promise<void> {
    console.log('═'.repeat(70));
    console.log(' PIPELINE DEMO (LIVE API)');
    console.log('═'.repeat(70));
    console.log('⚠️  Using REAL OpenAI API - this will incur costs!\n');

    const testCases = generatePilotTestCases();
    const testCase = testCases.find(tc => tc.input.classId === classId) || testCases[0];

    const backendValidate = process.argv.includes('--backend-validate');
    const backendCompute = process.argv.includes('--backend-compute');
    const maxRetries = clampInt(Number(getArgValue(process.argv.slice(2), '--max-retries') ?? 0), 0, 3);
    await runTestCase(testCase, false, { backendValidate, backendCompute, maxRetries }); // false = use real API
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'pilot';
    const classId = args[1] || 'fighter';
    const useLiveApi = args.includes('--live');
    const count = Number(getArgValue(args, '--count') ?? 75);
    const concurrency = clampInt(Number(getArgValue(args, '--concurrency') ?? 1), 1, 12);

    // Capture console output so dev runs can be saved for review.
    const captured: string[] = [];
    const originalLog = console.log.bind(console);
    const originalWarn = console.warn.bind(console);
    const originalError = console.error.bind(console);

    const capture = (method: 'log' | 'warn' | 'error', ...parts: any[]) => {
        const msg = parts
            .map(p => (typeof p === 'string' ? p : (() => { try { return JSON.stringify(p); } catch { return String(p); } })()))
            .join(' ');
        captured.push(msg);
        if (method === 'log') originalLog(...parts);
        else if (method === 'warn') originalWarn(...parts);
        else originalError(...parts);
    };

    console.log = (...parts: any[]) => capture('log', ...parts);
    console.warn = (...parts: any[]) => capture('warn', ...parts);
    console.error = (...parts: any[]) => capture('error', ...parts);

    console.log('\n🎲 D&D 5e AI Character Generation Demo\n');

    if (useLiveApi) {
        console.log('🌐 Mode: LIVE API (real OpenAI calls)\n');
    } else {
        console.log('🧪 Mode: MOCK (no API calls)\n');
    }

    try {
        switch (command) {
            case 'prompt':
                // Show what the prompt looks like
                showPromptDemo(classId);
                break;

            case 'pipeline':
                // Run one test through the full pipeline
                if (useLiveApi) {
                    await runPipelineWithApi(classId);
                } else {
                    await showPipelineDemo(classId);
                }
                break;

            case 'sample':
                if (!Number.isFinite(count) || count <= 0) {
                    console.error(
                        'Usage: tsx demo.ts sample [--count 75] [--concurrency 4] [--live] [--backend-validate] [--backend-compute] [--max-retries 2] [--no-save-log]'
                    );
                    process.exit(1);
                }
                // Allow concurrency in MOCK runs too (useful for verifying worker pool behavior without token spend).
                await runRepresentativeSample(count, useLiveApi, Math.max(1, concurrency));
                break;

            case 'pilot':
            default:
                // Run all 5 pilot test cases
                if (useLiveApi) {
                    await runPilotWithApi();
                } else {
                    await runPilotTest();
                }
                break;
        }
    } finally {
        // Restore console and optionally save captured output.
        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;

        const header =
            `# PCG run log\n` +
            `timestamp: ${new Date().toISOString()}\n` +
            `cwd: ${process.cwd()}\n` +
            `args: ${JSON.stringify(args)}\n` +
            `DUNGEONMIND_ENV: ${process.env.DUNGEONMIND_ENV || ''}\n` +
            `DUNGEONMIND_API_URL: ${process.env.DUNGEONMIND_API_URL || ''}\n` +
            `NODE_ENV: ${process.env.NODE_ENV || ''}\n` +
            `\n---\n\n`;

        const output = header + captured.join('\n') + '\n';
        const savedPath = await saveDevRunLogIfEnabled(args, output);
        if (savedPath) {
            originalLog(`\n📝 Saved run log to: ${savedPath}\n`);
        }
    }
}

main().catch(console.error);

