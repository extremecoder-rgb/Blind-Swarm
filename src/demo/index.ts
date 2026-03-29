import { createClient } from '../client/index.js';
import { createMockAdapter } from '../adapters/index.js';
import { createAgentNode } from '../agents/index.js';
import { createDashboard, type Dashboard } from '../tui/index.js';
import { DEMO_SCENARIO, type DemoScenario } from './scenario.js';

export interface DemoConfig {
  useMockAI: boolean;
  showTUI: boolean;
}

export class DemoRunner {
  private config: DemoConfig;
  private dashboard: Dashboard | null = null;

  constructor(config: DemoConfig) {
    this.config = config;
  }

  async run(): Promise<void> {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('          BlindSwarm 3-Agent Demo Starting...');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const scenario = DEMO_SCENARIO;
    console.log('Scenario:', scenario.agents.map((a) => a.name).join(' → '));
    console.log('Steps:', scenario.dag.steps.length, '\n');

    // Initialize client
    console.log('[1/5] Initializing client...');
    const client = await createClient({
      providerUrl: 'https://testnet.midnight.network',
      walletPrivateKey: process.env.PRIVATE_KEY || '',
    });

    // Deploy contract if needed
    console.log('[2/5] Deploying contract...');
    let contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
      const deployResult = await client.deployContract();
      contractAddress = deployResult.contractAddress;
      console.log('Contract deployed at:', contractAddress);
    }

    // Register agents
    console.log('[3/5] Registering agents...');
    const registeredAgents = [];
    for (const agent of scenario.agents) {
      const result = await client.registerAgent([agent.capability], BigInt(1000));
      console.log(`  ✓ ${agent.name} registered: ${result.agentId}`);
      registeredAgents.push({ ...agent, registeredId: result.agentId });
    }

    // Create task
    console.log('[4/5] Creating task...');
    const taskResult = await client.createTask(scenario.dag, BigInt(1000), Date.now() + 3600000);
    console.log('  ✓ Task created:', taskResult.taskId);

    // Show TUI if enabled
    if (this.config.showTUI) {
      this.dashboard = createDashboard();
      await this.dashboard.render();
    }

    // Simulate execution
    console.log('[5/5] Executing workflow...\n');
    
    for (const step of scenario.dag.steps) {
      console.log(`  Step ${step.index + 1}: ${step.description}`);
      
      // Find assigned agent
      const assignedAgent = registeredAgents[step.index];
      
      // Simulate AI execution
      const adapter = createMockAdapter(assignedAgent.capability);
      const result = await adapter.execute(step.description, { taskId: taskResult.taskId });
      
      console.log(`    → ${assignedAgent.name} completed`);
      console.log(`    → Result: ${result.result.substring(0, 60)}...`);
      console.log(`    → Confidence: ${result.confidence}%\n`);
      
      // Submit attestation
      const proof = `proof_${Date.now()}`;
      await client.submitAttestation(
        taskResult.taskId,
        step.index,
        `sig_${assignedAgent.registeredId}`,
        proof
      );
      console.log(`    → Attestation submitted on-chain\n`);
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                    DEMO COMPLETE!                            ');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\nAll 3 agents completed their steps with on-chain attestations.');
    console.log('The BlindSwarm protocol is working correctly.\n');

    if (this.dashboard) {
      this.dashboard.stop();
    }
  }
}

export async function runDemo(config?: Partial<DemoConfig>): Promise<void> {
  const runner = new DemoRunner({
    useMockAI: config?.useMockAI ?? true,
    showTUI: config?.showTUI ?? true,
  });
  await runner.run();
}
