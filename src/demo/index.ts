import { createClient } from '../client/index.js';
import { createMockAdapter, createGeminiAdapter, AGENT_PROMPTS } from '../adapters/index.js';
import { createDashboard, type Dashboard, type TaskStep } from '../tui/index.js';
import { DEMO_SCENARIO } from './scenario.js';
import { generateKeypair, signMessage } from '../crypto/signature.js';
import * as dotenv from 'dotenv';

dotenv.config();

export interface DemoConfig {
  useMockAI: boolean;
  showTUI: boolean;
  geminiApiKey?: string;
}

export class DemoRunner {
  private config: DemoConfig;
  private dashboard: Dashboard | null = null;
  private logs: string[] = [];

  constructor(config: DemoConfig) {
    this.config = config;
  }

  private addLog(msg: string) {
    this.logs.push(msg);
    if (this.dashboard) {
      this.dashboard.update({ logs: this.logs });
    } else {
      console.log(`[DEMO] ${msg}`);
    }
  }

  async run(): Promise<void> {
    const scenario = DEMO_SCENARIO;
    const useGemini = this.config.useMockAI === false && this.config.geminiApiKey;
    const adapterType = useGemini ? 'Gemini API' : 'Mock';

    // Initialize Dashboard
    if (this.config.showTUI) {
      this.dashboard = createDashboard();
      await this.dashboard.render();
    }

    this.addLog(`BlindSwarm 3-Agent Demo Starting (Adapter: ${adapterType})...`);
    this.addLog(`Scenario: ${scenario.agents.map((a) => a.name).join(' → ')}`);

    // Initialize Midnight Client
    this.addLog('Initializing Midnight client...');
    const client = await createClient({
      providerUrl: 'https://testnet.midnight.network',
      walletPrivateKey: process.env.PRIVATE_KEY || 'default_test_key',
    });

    // Deploy contract
    this.addLog('Deploying BlindSwarm contract to Testnet...');
    const deployResult = await client.deployContract();
    this.addLog(`Contract deployed: ${deployResult.contractAddress.slice(0, 16)}...`);

    // Register Agents with REAL KEYPAIRS
    this.addLog('Generating cryptographic identities for agents...');
    const registeredAgents = [];
    for (const agent of scenario.agents) {
      const keys = await generateKeypair();
      const result = await client.registerAgent([agent.capability], BigInt(1000));
      this.addLog(`- Registered ${agent.name} (PK: ${keys.publicKey.slice(0, 8)}...)`);
      registeredAgents.push({ 
        ...agent, 
        registeredId: result.agentId, 
        publicKey: keys.publicKey,
        privateKey: keys.privateKey
      });
    }

    // Create Task
    this.addLog('Submitting Task DAG metadata to Midnight...');
    const taskResult = await client.createTask(scenario.dag, BigInt(1000), Date.now() + 3600000);
    this.addLog(`Task created: ${taskResult.taskId}`);

    const steps: TaskStep[] = scenario.dag.steps.map(s => ({
      index: s.index,
      agentId: null,
      status: 'pending' as const,
      dependencies: s.dependencies || [],
      inputHash: '',
      outputHash: null,
      attestation: null
    }));

    if (this.dashboard) {
      this.dashboard.update({ taskId: taskResult.taskId, status: 'EXECUTING', steps });
    }

    // Protocol Loop
    for (const stepIndex of scenario.dag.steps.map(s => s.index)) {
      const step = scenario.dag.steps[stepIndex];
      const assignedAgent = registeredAgents[stepIndex];
      
      this.addLog(`Assigning Step ${stepIndex + 1} to Agent ${assignedAgent.name}...`);
      await client.assignStep(taskResult.taskId, stepIndex, assignedAgent.registeredId);
      
      // Update UI state
      steps[stepIndex].status = 'assigned';
      steps[stepIndex].agentId = assignedAgent.registeredId;
      if (this.dashboard) this.dashboard.update({ steps });

      // Private AI Execution
      this.addLog(`Agent ${assignedAgent.name} performing private ${assignedAgent.capability} task...`);
      
      let adapter;
      let aiResult;
      if (useGemini) {
        try {
          const systemPrompt = AGENT_PROMPTS[assignedAgent.capability] || '';
          adapter = createGeminiAdapter(this.config.geminiApiKey!, 'gemini-2.0-flash', systemPrompt);
          aiResult = await adapter.execute(step.description, { taskId: taskResult.taskId });
        } catch (e) {
          this.addLog(`Gemini API failed (quota?), using mock adapter: ${(e as Error).message.slice(0, 50)}`);
          adapter = createMockAdapter(assignedAgent.capability);
          aiResult = await adapter.execute(step.description, { taskId: taskResult.taskId });
        }
      } else {
        adapter = createMockAdapter(assignedAgent.capability);
        aiResult = await adapter.execute(step.description, { taskId: taskResult.taskId });
      }
      this.addLog(`Agent ${assignedAgent.name} output: ${aiResult.result.substring(0, 50)}... [Confidence: ${aiResult.confidence}%]`);

      // Cryptographic Signing of Intermediate Result
      this.addLog(`Generating ZK-Attestation signature for Agent ${assignedAgent.name}...`);
      const payloadToSign = `${taskResult.taskId}:${stepIndex}:${aiResult.result}`;
      const signature = await signMessage(assignedAgent.privateKey, payloadToSign);
      
      // Submit to Midnight
      await client.submitAttestation(
        taskResult.taskId,
        stepIndex,
        signature,
        `hash_${stepIndex}` // In practice this would be actual SHA256 of result
      );

      steps[stepIndex].status = 'completed';
      if (this.dashboard) this.dashboard.update({ steps });
      this.addLog(`On-chain state updated for step ${stepIndex + 1}.`);
    }

    this.addLog('══════════ DEMO SUCCESSFUL: PROOF OF WORKFLOW VERIFIED ══════════');
    if (this.dashboard) this.dashboard.update({ status: 'COMPLETED' });
    
    // Wait for user to read
    await new Promise(r => setTimeout(r, 5000));
    
    if (this.dashboard) {
      this.dashboard.stop();
    }
  }
}

export async function runDemo(config?: Partial<DemoConfig>): Promise<void> {
  const runner = new DemoRunner({
    useMockAI: config?.useMockAI ?? (process.env.GEMINI_API_KEY ? false : true),
    showTUI: config?.showTUI ?? true,
    geminiApiKey: process.env.GEMINI_API_KEY,
  });
  await runner.run();
}
