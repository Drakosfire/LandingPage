// @ts-nocheck - Node.js script, not browser code
/**
 * Benchmark Script for StatBlock Text Generation Timing
 * 
 * Measures LLM performance for generating D&D 5e creature statblocks
 * with varying complexity levels.
 * 
 * Complexity Levels:
 * - Base: Standard creature stats, abilities, and actions
 * - Legendary: Base + Legendary Actions
 * - Lair: Base + Legendary Actions + Lair Actions
 * - Spellcasting: Base + Spellcasting
 * - Full: Everything (Legendary + Lair + Spellcasting)
 * 
 * Required:
 *   Backend server running at DUNGEONMIND_API_URL
 *   OpenAI API key configured on backend
 * 
 * Usage:
 *   # Start backend server first
 *   cd DungeonMindServer
 *   uv run python dev_server.py
 *   
 *   # In another terminal, run benchmark
 *   cd LandingPage
 *   pnpm benchmark:text
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

// Configuration
const DUNGEONMIND_API_URL = process.env.DUNGEONMIND_API_URL || 'http://localhost:7860';
const ITERATIONS = 5; // 1 cold start + 4 warm starts per complexity level
const TIMEOUT_MS = 60000; // 60 seconds (LLM can take 8-15s typically)

// Test prompts for different creature types (vary to avoid caching)
const TEST_PROMPTS = [
    'A fierce red dragon that breathes fire and guards mountain treasure hoards',
    'An ancient treant guardian that protects sacred forests with nature magic',
    'A shadow assassin that melts into darkness and strikes with poisoned blades',
    'A storm giant king who commands lightning and rules from a cloud castle',
    'A cunning mind flayer that enslaves victims with psychic powers'
];

interface ComplexityConfig {
    name: string;
    includeSpellcasting: boolean;
    includeLegendaryActions: boolean;
    includeLairActions: boolean;
}

const COMPLEXITY_LEVELS: ComplexityConfig[] = [
    {
        name: 'base',
        includeSpellcasting: false,
        includeLegendaryActions: false,
        includeLairActions: false
    },
    {
        name: 'legendary',
        includeSpellcasting: false,
        includeLegendaryActions: true,
        includeLairActions: false
    },
    {
        name: 'lair',
        includeSpellcasting: false,
        includeLegendaryActions: true,
        includeLairActions: true
    },
    {
        name: 'spellcasting',
        includeSpellcasting: true,
        includeLegendaryActions: false,
        includeLairActions: false
    },
    {
        name: 'full',
        includeSpellcasting: true,
        includeLegendaryActions: true,
        includeLairActions: true
    }
];

interface TimingResult {
    complexity: string;
    coldStart: number;  // First generation (ms)
    warmStarts: number[];  // Subsequent generations (ms)
    average: number;
    min: number;
    max: number;
    errors: number;
    totalGenerations: number;
}

interface BenchmarkResults {
    timestamp: string;
    iterations: number;
    apiUrl: string;
    complexityLevels: Record<string, TimingResult>;
}

/**
 * Generate a single statblock via backend API
 */
async function generateStatblock(
    prompt: string,
    config: ComplexityConfig
): Promise<any> {
    const response = await fetch(
        `${DUNGEONMIND_API_URL}/api/statblockgenerator/generate-statblock`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: prompt,
                includeSpellcasting: config.includeSpellcasting,
                includeLegendaryActions: config.includeLegendaryActions,
                includeLairActions: config.includeLairActions,
                size: 'Medium',
                type: 'Humanoid',
                alignment: 'Neutral'
            })
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.success || !data.data?.statblock) {
        throw new Error('Invalid response format from API');
    }

    return data.data.statblock;
}

/**
 * Benchmark a single complexity level
 */
async function benchmarkComplexity(config: ComplexityConfig): Promise<TimingResult> {
    const timings: number[] = [];
    let errors = 0;
    let totalGenerations = 0;

    console.log(`\n🔬 Benchmarking complexity: ${config.name.toUpperCase()}`);
    console.log(`   Iterations: ${ITERATIONS}`);
    console.log(`   Spellcasting: ${config.includeSpellcasting}`);
    console.log(`   Legendary Actions: ${config.includeLegendaryActions}`);
    console.log(`   Lair Actions: ${config.includeLairActions}`);
    console.log('');

    for (let i = 0; i < ITERATIONS; i++) {
        const isColdStart = i === 0;
        const prompt = TEST_PROMPTS[i % TEST_PROMPTS.length];

        try {
            console.log(`   ${isColdStart ? '❄️  Cold start' : `🔥 Warm start ${i}`}: Generating...`);
            console.log(`      Prompt: "${prompt.substring(0, 50)}..."`);

            const startTime = Date.now();
            const statblock = await generateStatblock(prompt, config);
            const duration = Date.now() - startTime;

            timings.push(duration);
            totalGenerations++;

            console.log(`      ✅ Completed in ${(duration / 1000).toFixed(2)}s`);
            console.log(`         Creature: ${statblock.name} (CR ${statblock.challengeRating})`);

            // Add delay between iterations to avoid rate limiting
            if (i < ITERATIONS - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

        } catch (error) {
            errors++;
            console.error(`      ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

            // Continue with other iterations
            if (i < ITERATIONS - 1) {
                console.log('      Retrying next iteration...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }

    if (timings.length === 0) {
        throw new Error(`All iterations failed for complexity: ${config.name}`);
    }

    const coldStart = timings[0];
    const warmStarts = timings.slice(1);
    const average = timings.reduce((a, b) => a + b, 0) / timings.length;
    const min = Math.min(...timings);
    const max = Math.max(...timings);

    console.log('');
    console.log(`   📊 Results for ${config.name}:`);
    console.log(`      Cold Start: ${(coldStart / 1000).toFixed(2)}s`);
    if (warmStarts.length > 0) {
        const warmAvg = warmStarts.reduce((a, b) => a + b, 0) / warmStarts.length;
        console.log(`      Warm Avg:   ${(warmAvg / 1000).toFixed(2)}s`);
    }
    console.log(`      Overall Avg: ${(average / 1000).toFixed(2)}s`);
    console.log(`      Min: ${(min / 1000).toFixed(2)}s, Max: ${(max / 1000).toFixed(2)}s`);
    console.log(`      Total Generations: ${totalGenerations}`);
    if (errors > 0) {
        console.log(`      ⚠️  Errors: ${errors}/${ITERATIONS}`);
    }

    return {
        complexity: config.name,
        coldStart,
        warmStarts,
        average,
        min,
        max,
        errors,
        totalGenerations
    };
}

/**
 * Test backend connectivity before running benchmarks
 */
async function testBackendConnection(): Promise<boolean> {
    try {
        const response = await fetch(`${DUNGEONMIND_API_URL}/health`, {
            method: 'GET'
        });

        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Run benchmarks for all complexity levels
 */
async function runBenchmarks(): Promise<void> {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║   StatBlock Text Generation Benchmark                   ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');

    // Test backend connection
    console.log(`Testing backend connection: ${DUNGEONMIND_API_URL}`);
    const isConnected = await testBackendConnection();

    if (!isConnected) {
        console.error('❌ ERROR: Cannot connect to backend server');
        console.error(`   URL: ${DUNGEONMIND_API_URL}`);
        console.error('');
        console.error('   Make sure the backend server is running:');
        console.error('   cd DungeonMindServer');
        console.error('   uv run python dev_server.py');
        console.error('');
        process.exit(1);
    }

    console.log('✅ Backend connection successful');
    console.log('');
    console.log(`Starting at: ${new Date().toISOString()}`);
    console.log(`Complexity levels: ${COMPLEXITY_LEVELS.length}`);
    console.log(`Iterations per level: ${ITERATIONS}`);
    console.log(`Total generations: ${COMPLEXITY_LEVELS.length * ITERATIONS}`);
    console.log('');
    console.log('⚠️  WARNING: This will consume OpenAI API credits!');
    console.log('');

    const results: BenchmarkResults = {
        timestamp: new Date().toISOString(),
        iterations: ITERATIONS,
        apiUrl: DUNGEONMIND_API_URL,
        complexityLevels: {}
    };

    for (const config of COMPLEXITY_LEVELS) {
        try {
            const result = await benchmarkComplexity(config);
            results.complexityLevels[config.name] = result;

            // Delay between complexity levels
            if (COMPLEXITY_LEVELS.indexOf(config) < COMPLEXITY_LEVELS.length - 1) {
                console.log('\n   ⏳ Waiting 5 seconds before next complexity level...\n');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        } catch (error) {
            console.error(`\n❌ Failed to benchmark ${config.name}:`, error);
            console.log('   Continuing with next complexity level...\n');
        }
    }

    // Output final summary
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║         TEXT GENERATION BENCHMARK RESULTS                ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');

    // Sort by average time for readability
    const sortedResults = Object.entries(results.complexityLevels)
        .sort(([, a], [, b]) => a.average - b.average);

    sortedResults.forEach(([complexity, data]) => {
        console.log(`${complexity.toUpperCase()}:`);
        console.log(`  Cold Start: ${(data.coldStart / 1000).toFixed(2)}s`);
        const warmAvg = data.warmStarts.length > 0
            ? data.warmStarts.reduce((a, b) => a + b, 0) / data.warmStarts.length
            : data.coldStart;
        console.log(`  Warm Avg:   ${(warmAvg / 1000).toFixed(2)}s`);
        console.log(`  Overall Avg: ${(data.average / 1000).toFixed(2)}s`);
        console.log(`  Min: ${(data.min / 1000).toFixed(2)}s, Max: ${(data.max / 1000).toFixed(2)}s`);
        console.log(`  Total: ${data.totalGenerations} generations`);
        if (data.errors > 0) {
            console.log(`  ⚠️  Errors: ${data.errors}/${ITERATIONS}`);
        }
        console.log('');
    });

    // Save to JSON file
    const outputPath = join(process.cwd(), 'benchmark-text-results.json');
    writeFileSync(outputPath, JSON.stringify(results, null, 2));

    console.log(`✅ Results saved to: ${outputPath}`);
    console.log('');
    console.log('📊 Quick Reference (Warm Start Averages):');
    sortedResults.forEach(([complexity, data]) => {
        const warmAvg = data.warmStarts.length > 0
            ? data.warmStarts.reduce((a, b) => a + b, 0) / data.warmStarts.length
            : data.coldStart;
        console.log(`   ${complexity.padEnd(15)}: ~${(warmAvg / 1000).toFixed(1)}s`);
    });
    console.log('');
    console.log(`Completed at: ${new Date().toISOString()}`);
    console.log('');
}

// Run benchmarks
runBenchmarks()
    .then(() => {
        console.log('✨ Benchmark complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Benchmark failed:', error);
        process.exit(1);
    });

