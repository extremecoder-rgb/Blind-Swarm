#!/usr/bin/env node
import { Command } from 'commander';
import { runDemo } from '../demo/index.js';

const program = new Command();

program
  .name('gaming-studio')
  .description('Multi-agent AI game development system')
  .version('0.1.0');

program
  .command('demo')
  .description('Run the Gaming Studio multi-agent demo')
  .option('--run', 'Run demo automatically')
  .option('--no-tui', 'Disable graphical terminal interface')
  .option('--mock', 'Use mock AI responses (no API key required)')
  .action(async (options) => {
    if (options.run) {
      await runDemo({
        showTUI: options.tui !== false,
        useMockAI: options.mock || false,
      });
    } else {
      console.log('Use --run to execute the Gaming Studio demo.');
      console.log('Example: gaming-studio demo --run --mock');
    }
  });

export function createCLI(): Command {
  return program;
}

program.parse();

export default program;