#!/usr/bin/env node

/**
 * Canvas Debug Launcher
 *
 * Usage (from LandingPage directory):
 *   npm run canvas-debug -- component-1 component-2
 *
 * Usage (from project root):
 *   cd LandingPage && npm run canvas-debug -- component-1 component-2
 *
 * Options:
 *   --no-plan-diff       Disable layout plan diff logging
 *   --paginate           Enable paginate debug logs (enabled by default when components specified)
 *   --planner            Enable planner debug logs (enabled by default when components specified)
 *   --measurement        Enable measurement debug logs (enabled by default when components specified)
 *   --no-paginate        Disable paginate debug logs (overrides default)
 *   --no-planner         Disable planner debug logs (overrides default)
 *   --no-measurement     Disable measurement debug logs (overrides default)
 *   --layout             Enable layout dirty debug logs
 *   --measure-first      Enable measure-first debug logs
 *
 * When components are specified, pagination, planner, and measurement logs are enabled by default.
 * Use --no-* flags to disable specific log types.
 *
 * All additional positional arguments are treated as component IDs.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure we're in the LandingPage directory or can find react-scripts
const scriptDir = __dirname;
const landingPageDir = path.resolve(scriptDir, '..');
const packageJsonPath = path.join(landingPageDir, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
    console.error('Error: Could not find LandingPage/package.json');
    console.error('Please run this script from the LandingPage directory:');
    console.error('  cd LandingPage && npm run canvas-debug -- <component-id> [component-id...]');
    process.exit(1);
}

const argv = process.argv.slice(2);
const options = new Set();
const componentIds = [];

argv.forEach((arg) => {
    if (arg.startsWith('--')) {
        options.add(arg);
    } else {
        componentIds.push(arg);
    }
});

if (componentIds.length === 0) {
    console.error('Usage: npm run canvas-debug -- <component-id> [component-id...]');
    console.error('Example: npm run canvas-debug -- component-1 component-2');
    console.error('\nOptions:');
    console.error('  --no-plan-diff       Disable layout plan diff logging');
    console.error('  --paginate          Enable paginate debug logs (enabled by default when components specified)');
    console.error('  --planner           Enable planner debug logs (enabled by default when components specified)');
    console.error('  --measurement       Enable measurement debug logs (enabled by default when components specified)');
    console.error('  --no-paginate       Disable paginate debug logs (overrides default)');
    console.error('  --no-planner        Disable planner debug logs (overrides default)');
    console.error('  --no-measurement    Disable measurement debug logs (overrides default)');
    console.error('  --layout            Enable layout dirty debug logs');
    console.error('  --measure-first     Enable measure-first debug logs');
    console.error('\nNote: When components are specified, pagination, planner, and measurement logs');
    console.error('      are enabled by default. Use --no-* flags to disable specific log types.');
    process.exit(1);
}

const env = {
    ...process.env,
};

// React Scripts only exposes env vars prefixed with REACT_APP_ to the browser
if (!options.has('--no-plan-diff')) {
    env.REACT_APP_CANVAS_DEBUG_PLAN_DIFF = '1';
}

// When components are specified, enable pagination, planner, and measurement logs by default
// Users can explicitly disable with --no-paginate, --no-planner, --no-measurement
const hasComponents = componentIds.length > 0;
const enablePaginate = options.has('--paginate') || (hasComponents && !options.has('--no-paginate'));
const enablePlanner = options.has('--planner') || (hasComponents && !options.has('--no-planner'));
const enableMeasurement = options.has('--measurement') || (hasComponents && !options.has('--no-measurement'));

if (enablePaginate) {
    env.REACT_APP_CANVAS_DEBUG_PAGINATE = '1';
}

if (enablePlanner) {
    env.REACT_APP_CANVAS_DEBUG_PLANNER = '1';
}

if (enableMeasurement) {
    env.REACT_APP_CANVAS_DEBUG_MEASUREMENT = '1';
}

if (options.has('--layout')) {
    env.REACT_APP_CANVAS_DEBUG_LAYOUT = '1';
}

if (options.has('--measure-first')) {
    env.REACT_APP_CANVAS_DEBUG_MEASURE_FIRST = '1';
}

env.REACT_APP_CANVAS_DEBUG_COMPONENTS = componentIds.join(',');

console.log('🎯 Canvas Debug Mode');
console.log(`   Component IDs: ${componentIds.join(', ')}`);
console.log(`   Plan diff: ${!options.has('--no-plan-diff') ? 'enabled' : 'disabled'}`);

const enabledFlags = [];
if (enablePaginate) enabledFlags.push('paginate');
if (enablePlanner) enabledFlags.push('planner');
if (enableMeasurement) enabledFlags.push('measurement');
if (options.has('--layout')) enabledFlags.push('layout');
if (options.has('--measure-first')) enabledFlags.push('measure-first');

if (enabledFlags.length > 0) {
    console.log(`   Enabled flags: ${enabledFlags.join(', ')}`);
}

const disabledFlags = [];
if (options.has('--no-paginate')) disabledFlags.push('paginate');
if (options.has('--no-planner')) disabledFlags.push('planner');
if (options.has('--no-measurement')) disabledFlags.push('measurement');

if (disabledFlags.length > 0) {
    console.log(`   Disabled flags: ${disabledFlags.join(', ')}`);
}
console.log('\n📋 Environment variables being set:');
console.log(`   REACT_APP_CANVAS_DEBUG_COMPONENTS=${env.REACT_APP_CANVAS_DEBUG_COMPONENTS}`);
if (env.REACT_APP_CANVAS_DEBUG_PLAN_DIFF) console.log(`   REACT_APP_CANVAS_DEBUG_PLAN_DIFF=${env.REACT_APP_CANVAS_DEBUG_PLAN_DIFF}`);
if (env.REACT_APP_CANVAS_DEBUG_PAGINATE) console.log(`   REACT_APP_CANVAS_DEBUG_PAGINATE=${env.REACT_APP_CANVAS_DEBUG_PAGINATE}`);
if (env.REACT_APP_CANVAS_DEBUG_PLANNER) console.log(`   REACT_APP_CANVAS_DEBUG_PLANNER=${env.REACT_APP_CANVAS_DEBUG_PLANNER}`);
if (env.REACT_APP_CANVAS_DEBUG_MEASUREMENT) console.log(`   REACT_APP_CANVAS_DEBUG_MEASUREMENT=${env.REACT_APP_CANVAS_DEBUG_MEASUREMENT}`);
console.log('\n💡 Tip: Check browser console for "🎯 [Canvas Debug] Active configuration" log');
console.log('   If you don\'t see it, make sure no other dev server is running.\n');

const reactScriptsStart = require.resolve('react-scripts/scripts/start');

const child = spawn(process.execPath, [reactScriptsStart], {
    stdio: 'inherit',
    env,
    cwd: landingPageDir, // Ensure we run from LandingPage directory
});

child.on('exit', (code) => {
    process.exit(code ?? 0);
});


