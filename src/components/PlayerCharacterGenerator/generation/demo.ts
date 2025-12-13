/**
 * Demo script for AI Character Generation Pipeline
 * 
 * Run with: npx ts-node src/components/PlayerCharacterGenerator/generation/demo.ts
 * Or import into browser console
 */

import { runPilotTest, showPromptDemo, showPipelineDemo } from './index';

async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'pilot';
    const classId = args[1] || 'fighter';
    
    console.log('\n🎲 D&D 5e AI Character Generation Demo\n');
    
    switch (command) {
        case 'prompt':
            // Show what the prompt looks like
            showPromptDemo(classId);
            break;
            
        case 'pipeline':
            // Run one test through the full pipeline
            await showPipelineDemo(classId);
            break;
            
        case 'pilot':
        default:
            // Run all 5 pilot test cases
            await runPilotTest();
            break;
    }
}

main().catch(console.error);

