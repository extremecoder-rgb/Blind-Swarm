#!/usr/bin/env node
import { Command } from 'commander';
import { runDemo } from '../demo/index.js';
const program = new Command();
program
    .name('blindswarm')
    .description('Privacy-preserving multi-agent AI orchestration on Midnight Network')
    .version('0.1.0');
program
    .command('demo')
    .description('Run the 3-agent BlindSwarm protocol demo with live TUI')
    .option('--run', 'Run demo automatically')
    .option('--mock', 'Force mock AI instead of Gemini')
    .option('--no-tui', 'Disable graphical terminal interface')
    .action(async (options) => {
    if (options.run) {
        await runDemo({
            useMockAI: options.mock ?? (process.env.GEMINI_API_KEY ? false : true),
            showTUI: options.tui !== false,
        });
    }
    else {
        console.log('Use --run to execute the BlindSwarm protocol demo.');
        console.log('Example: blindswarm demo --run');
    }
});
// Mock individual commands for hackathon CLI completeness
program
    .command('register-agent')
    .description('Register a new agent (Manual)')
    .requiredOption('--capabilities <capabilities>', 'Comma-separated capabilities')
    .action(() => console.log('Use "blindswarm demo --run" to see automated registration/orchestration.'));
program
    .command('create-task')
    .description('Create a new task with DAG (Manual)')
    .action(() => console.log('Use "blindswarm demo --run" to see automated task creation.'));
export function createCLI() {
    return program;
}
program.parse();
export default program;
//# sourceMappingURL=index.js.map