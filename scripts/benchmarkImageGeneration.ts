// @ts-nocheck - Node.js script, not browser code
/**
 * Async Benchmark Script for Image Generation Timing
 * 
 * Measures AI model performance with PARALLEL image generation.
 * All 4 images are generated concurrently (Promise.all) per iteration.
 * Compares async performance vs sequential generation.
 * 
 * Key Differences from Sequential Benchmark:
 * - OpenAI: 4 parallel calls instead of sequential
 * - Flux/Imagen4: Still 1 call, but can extend to parallel if needed
 * - Measures total time for batch of 4 images generated in parallel
 * 
 * Required Environment Variables:
 *   OPENAI_API_KEY - OpenAI API key
 *   FAL_KEY - Fal.ai API key for FLUX Pro and Imagen4
 * 
 * Usage:
 *   export OPENAI_API_KEY=your_key_here
 *   export FAL_KEY=your_key_here
 *   pnpm benchmark:images
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

// Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const FAL_KEY = process.env.FAL_KEY;
const MODELS = ['flux-pro', 'imagen4', 'openai'];
const ITERATIONS = 5; // 1 cold start + 4 warm starts
const TEST_PROMPT = 'A fantasy dragon breathing fire';
const TIMEOUT_MS = 120000; // 2 minutes
const NUM_IMAGES = 4; // Generate 4 images per batch

interface TimingResult {
    model: string;
    mode: 'async' | 'sync';
    coldStart: number;  // First generation (ms)
    warmStarts: number[];  // Subsequent generations (ms)
    average: number;
    min: number;
    max: number;
    errors: number;
    totalImages: number;
}

interface BenchmarkResults {
    timestamp: string;
    iterations: number;
    testPrompt: string;
    numImages: number;
    models: Record<string, TimingResult>;
}

/**
 * Call OpenAI API directly (single image)
 */
async function generateSingleImageOpenAI(prompt: string): Promise<void> {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-image-1-mini',
            prompt: prompt,
            n: 1,
            size: '1024x1024'
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    await response.json();
}

/**
 * Generate multiple OpenAI images in PARALLEL
 */
async function generateWithOpenAI(prompt: string, numImages: number): Promise<void> {
    // Launch all requests in parallel with Promise.all
    const promises = Array.from({ length: numImages }, () =>
        generateSingleImageOpenAI(prompt)
    );

    await Promise.all(promises);
}

/**
 * Call Fal.ai API directly for FLUX Pro
 * Already supports batch generation in single call
 */
async function generateWithFluxPro(prompt: string, numImages: number): Promise<void> {
    const response = await fetch('https://fal.run/fal-ai/flux-pro/v1.1', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Key ${FAL_KEY}`
        },
        body: JSON.stringify({
            prompt: prompt,
            image_size: 'square_hd',
            num_inference_steps: 28,
            guidance_scale: 3.5,
            num_images: numImages,
            enable_safety_checker: false,
            output_format: 'png'
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fal.ai FLUX Pro error: ${response.status} - ${errorText}`);
    }

    await response.json();
}

/**
 * Call Fal.ai API directly for Imagen4
 * Already supports batch generation in single call
 */
async function generateWithImagen4(prompt: string, numImages: number): Promise<void> {
    const response = await fetch('https://fal.run/fal-ai/imagen4/preview', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Key ${FAL_KEY}`
        },
        body: JSON.stringify({
            prompt: prompt,
            num_inference_steps: 28,
            guidance_scale: 3.5,
            num_images: numImages,
            enable_safety_checker: false,
            output_format: 'png'
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fal.ai Imagen4 error: ${response.status} - ${errorText}`);
    }

    await response.json();
}

/**
 * Benchmark a single model with PARALLEL image generation
 */
async function benchmarkModel(model: string): Promise<TimingResult> {
    const timings: number[] = [];
    let errors = 0;
    let totalImagesGenerated = 0;

    console.log(`\n🔬 Benchmarking model: ${model} (ASYNC/PARALLEL)`);
    console.log(`   Iterations: ${ITERATIONS}`);
    console.log(`   Images per batch: ${NUM_IMAGES} (generated in parallel)`);
    console.log('');

    for (let i = 0; i < ITERATIONS; i++) {
        const isColdStart = i === 0;

        try {
            console.log(`   ${isColdStart ? '❄️  Cold start' : `🔥 Warm start ${i}`}: Running...`);

            const startTime = Date.now();

            // Call appropriate API based on model (ALL with async/parallel support)
            if (model === 'openai') {
                // OpenAI: 4 PARALLEL calls using Promise.all
                await generateWithOpenAI(TEST_PROMPT, NUM_IMAGES);
            } else if (model === 'flux-pro') {
                // FLUX Pro: batch generation in single call
                await generateWithFluxPro(TEST_PROMPT, NUM_IMAGES);
            } else if (model === 'imagen4') {
                // Imagen4: batch generation in single call
                await generateWithImagen4(TEST_PROMPT, NUM_IMAGES);
            } else {
                throw new Error(`Unknown model: ${model}`);
            }

            const duration = Date.now() - startTime;
            timings.push(duration);
            totalImagesGenerated += NUM_IMAGES;
            console.log(`      ✅ Completed ${NUM_IMAGES} images in ${(duration / 1000).toFixed(2)}s`);
            console.log(`         (${((duration / NUM_IMAGES) / 1000).toFixed(2)}s per image)`);

            // Add delay between iterations to simulate realistic usage
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
        throw new Error(`All iterations failed for model: ${model}`);
    }

    const coldStart = timings[0];
    const warmStarts = timings.slice(1);
    const average = timings.reduce((a, b) => a + b, 0) / timings.length;
    const min = Math.min(...timings);
    const max = Math.max(...timings);

    console.log('');
    console.log(`   📊 Results for ${model} (PARALLEL):`);
    console.log(`      Cold Start: ${(coldStart / 1000).toFixed(2)}s (${NUM_IMAGES} images)`);
    if (warmStarts.length > 0) {
        const warmAvg = warmStarts.reduce((a, b) => a + b, 0) / warmStarts.length;
        console.log(`      Warm Avg:   ${(warmAvg / 1000).toFixed(2)}s (${NUM_IMAGES} images)`);
    }
    console.log(`      Overall Avg: ${(average / 1000).toFixed(2)}s per batch`);
    console.log(`      Per Image Avg: ${((average / NUM_IMAGES) / 1000).toFixed(2)}s`);
    console.log(`      Min: ${(min / 1000).toFixed(2)}s, Max: ${(max / 1000).toFixed(2)}s`);
    console.log(`      Total Images: ${totalImagesGenerated}`);
    if (errors > 0) {
        console.log(`      ⚠️  Errors: ${errors}/${ITERATIONS}`);
    }

    return {
        model,
        mode: 'async',
        coldStart,
        warmStarts,
        average,
        min,
        max,
        errors,
        totalImages: totalImagesGenerated
    };
}

/**
 * Run benchmarks for all models
 */
async function runBenchmarks(): Promise<void> {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║   Image Generation Benchmark - ASYNC/PARALLEL MODE      ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');

    // Validate API keys
    if (!OPENAI_API_KEY) {
        console.error('❌ ERROR: OPENAI_API_KEY environment variable not set');
        console.error('   Export it before running: export OPENAI_API_KEY=your_key_here');
        process.exit(1);
    }

    if (!FAL_KEY) {
        console.error('❌ ERROR: FAL_KEY environment variable not set');
        console.error('   Export it before running: export FAL_KEY=your_key_here');
        process.exit(1);
    }

    console.log(`Starting at: ${new Date().toISOString()}`);
    console.log(`Mode: ASYNC/PARALLEL`);
    console.log(`Models: ${MODELS.join(', ')}`);
    console.log(`Iterations per model: ${ITERATIONS}`);
    console.log(`Images per batch: ${NUM_IMAGES} (generated in parallel)`);
    console.log('');
    console.log('🚀 OpenAI: Uses Promise.all to generate 4 images in parallel');
    console.log('🚀 FLUX/Imagen4: Batch generation in single API call');
    console.log('');
    console.log('⚠️  WARNING: This will generate real images and consume API credits!');
    console.log(`   Total batches: ${MODELS.length * ITERATIONS}`);
    console.log(`   Total images: ${MODELS.length * ITERATIONS * NUM_IMAGES}`);
    console.log('');
    console.log('✅ API keys validated');
    console.log('');

    const results: BenchmarkResults = {
        timestamp: new Date().toISOString(),
        iterations: ITERATIONS,
        testPrompt: TEST_PROMPT,
        numImages: NUM_IMAGES,
        models: {}
    };

    for (const model of MODELS) {
        try {
            const result = await benchmarkModel(model);
            results.models[model] = result;

            // Delay between models
            if (MODELS.indexOf(model) < MODELS.length - 1) {
                console.log('\n   ⏳ Waiting 10 seconds before next model...\n');
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        } catch (error) {
            console.error(`\n❌ Failed to benchmark ${model}:`, error);
            console.log('   Continuing with next model...\n');
        }
    }

    // Output final summary
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║         ASYNC/PARALLEL BENCHMARK RESULTS                 ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`Mode: ASYNC/PARALLEL (${NUM_IMAGES} images per batch)`);
    console.log('');

    Object.entries(results.models).forEach(([model, data]) => {
        console.log(`${model}:`);
        console.log(`  Mode: ${data.mode.toUpperCase()}`);
        console.log(`  Cold Start: ${(data.coldStart / 1000).toFixed(2)}s (${NUM_IMAGES} images)`);
        const warmAvg = data.warmStarts.length > 0
            ? data.warmStarts.reduce((a, b) => a + b, 0) / data.warmStarts.length
            : data.coldStart;
        console.log(`  Warm Avg:   ${(warmAvg / 1000).toFixed(2)}s per batch`);
        console.log(`  Per Image:  ${((data.average / NUM_IMAGES) / 1000).toFixed(2)}s average`);
        console.log(`  Min: ${(data.min / 1000).toFixed(2)}s, Max: ${(data.max / 1000).toFixed(2)}s`);
        console.log(`  Total Images: ${data.totalImages}`);
        if (data.errors > 0) {
            console.log(`  ⚠️  Errors: ${data.errors}/${ITERATIONS}`);
        }
        console.log('');
    });

    // Save to JSON file
    const outputPath = join(process.cwd(), 'benchmark-results.json');
    writeFileSync(outputPath, JSON.stringify(results, null, 2));

    console.log(`✅ Results saved to: ${outputPath}`);
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

