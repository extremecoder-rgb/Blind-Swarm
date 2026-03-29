import { Command } from 'commander';
import { createClient } from '../client/index.js';
import { createAgentNode } from '../agents/index.js';
import { createMockAdapter } from '../adapters/index.js';
import { Orchestrator } from '../orchestrator/index.js';

const program = new Command();

program
  .name('blindswarm')
  .description('Privacy-preserving multi-agent AI orchestration on Midnight Network')
  .version('0.1.0');

program
  .command('register-agent')
  .description('Register a new agent')
  .requiredOption('--capabilities <capabilities>', 'Comma-separated capabilities')
  .requiredOption('--stake <stake>', 'Stake amount', '1000')
  .action(async (options) => {
    console.log('Registering agent with capabilities:', options.capabilities);
    
    const capabilities = options.capabilities.split(',');
    const stake = BigInt(options.stake);
    
    const client = await createClient({
      providerUrl: 'https://testnet.midnight.network',
      walletPrivateKey: process.env.PRIVATE_KEY || '',
    });
    
    const result = await client.registerAgent(capabilities, stake);
    console.log('Agent registered successfully!');
    console.log('Agent ID:', result.agentId);
  });

program
  .command('create-task')
  .description('Create a new task with DAG')
  .requiredOption('--dag <dag>', 'DAG as JSON string')
  .requiredOption('--escrow <escrow>', 'Escrow amount', '100')
  .requiredOption('--deadline <deadline>', 'Deadline timestamp')
  .action(async (options) => {
    console.log('Creating task...');
    
    const dag = JSON.parse(options.dag);
    const escrow = BigInt(options.escrow);
    const deadline = parseInt(options.deadline);
    
    const client = await createClient({
      providerUrl: 'https://testnet.midnight.network',
      walletPrivateKey: process.env.PRIVATE_KEY || '',
    });
    
    const result = await client.createTask(dag, escrow, deadline);
    console.log('Task created successfully!');
    console.log('Task ID:', result.taskId);
  });

program
  .command('task-status')
  .description('Get task status')
  .requiredOption('--task-id <taskId>', 'Task ID')
  .action(async (options) => {
    console.log('Getting task status for:', options.taskId);
    
    const client = await createClient({
      providerUrl: 'https://testnet.midnight.network',
      walletPrivateKey: process.env.PRIVATE_KEY || '',
      contractAddress: process.env.CONTRACT_ADDRESS || '',
    });
    
    const state = await client.getContractState();
    const task = state.tasks?.find((t: any) => t.id === options.taskId);
    
    if (task) {
      console.log('Task Status:', task.status);
      console.log('Steps:', JSON.stringify(task.steps, null, 2));
    } else {
      console.log('Task not found');
    }
  });

program
  .command('demo')
  .description('Run the 3-agent demo')
  .option('--run', 'Run demo automatically')
  .action(async (options) => {
    console.log('Starting BlindSwarm Demo...');
    console.log('Scenario: Market Analysis -> Risk Analysis -> Compliance Decision');
    
    if (options.run) {
      console.log('Running demo...');
      // Demo would execute full workflow
    } else {
      console.log('Use --run to execute');
    }
  });

export function createCLI(): Command {
  return program;
}

export default program;
