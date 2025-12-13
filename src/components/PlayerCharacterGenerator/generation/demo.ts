/**
 * Demo script for AI Character Generation Pipeline
 * 
 * Run with:
 *   npx tsx src/components/PlayerCharacterGenerator/generation/demo.ts pilot
 *   npx tsx src/components/PlayerCharacterGenerator/generation/demo.ts pilot --live
 *   npx tsx src/components/PlayerCharacterGenerator/generation/demo.ts prompt wizard
 *   npx tsx src/components/PlayerCharacterGenerator/generation/demo.ts pipeline fighter --live
 */

import { runPilotTest, showPromptDemo, showPipelineDemo, runTestCase } from './index';
import { generatePilotTestCases } from './testHarness';
import { aggregateResults, formatSummaryReport } from './testHarness';
import type { TestResult } from './types';

async function runPilotWithApi(): Promise<void> {
    console.log('═'.repeat(70));
    console.log(' AI CHARACTER GENERATION PILOT TEST (LIVE API)');
    console.log('═'.repeat(70));

    const testCases = generatePilotTestCases();
    console.log(`\n📋 Generated ${testCases.length} test cases\n`);
    console.log('⚠️  Using REAL OpenAI API - this will incur costs!\n');

    const results: TestResult[] = [];

    for (const testCase of testCases) {
        const result = await runTestCase(testCase, false); // false = use real API
        results.push(result);
    }

    // Aggregate and report
    console.log('\n' + '═'.repeat(70));
    const summary = aggregateResults(results);
    console.log(formatSummaryReport(summary));

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

    await runTestCase(testCase, false); // false = use real API
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'pilot';
    const classId = args[1] || 'fighter';
    const useLiveApi = args.includes('--live');

    console.log('\n🎲 D&D 5e AI Character Generation Demo\n');

    if (useLiveApi) {
        console.log('🌐 Mode: LIVE API (real OpenAI calls)\n');
    } else {
        console.log('🧪 Mode: MOCK (no API calls)\n');
    }

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
}

main().catch(console.error);

