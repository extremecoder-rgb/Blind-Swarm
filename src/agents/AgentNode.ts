import { MidnightClient } from '../client/index.js';
import { hashObject } from '../crypto/index.js';
import type { AgentNodeConfig } from './types.js';

export { type AgentNodeConfig } from './types.js';

export interface ExecutionResult {
  result: string;
  confidence: number;
  metadata: Record<string, any>;
}

export class AgentNode {
  private config: AgentNodeConfig;
  private running: boolean = false;
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(config: AgentNodeConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    console.log(`AgentNode ${this.config.agentId} starting...`);
    this.running = true;
    
    // Set up event listener for step assignments
    this.config.client.watchEvent('StepAssigned', async (data: any) => {
      if (data.agentId === this.config.agentId) {
        console.log(`Agent ${this.config.agentId} received step assignment:`, data);
        await this.executeStep(data.taskId, data.stepIndex);
      }
    });
    
    console.log(`AgentNode ${this.config.agentId} listening for assignments`);
  }

  async stop(): Promise<void> {
    console.log(`AgentNode ${this.config.agentId} stopping...`);
    this.running = false;
  }

  async executeStep(taskId: string, stepIndex: number): Promise<void> {
    console.log(`Executing step ${stepIndex} for task ${taskId}`);
    
    try {
      // Get task details from contract
      const state = await this.config.client.getContractState();
      const task = state.tasks?.find((t: any) => t.id === taskId);
      
      if (!task) {
        throw new Error(`Task ${taskId} not found`);
      }
      
      const step = task.steps?.find((s: any) => s.index === stepIndex);
      
      if (!step) {
        throw new Error(`Step ${stepIndex} not found`);
      }
      
      const prompt = step.description || `Execute step ${stepIndex}`;
      const context = { taskId, stepIndex, dependencies: step.dependencies };
      
      const executionResult = await this.config.adapter.execute(prompt, context);
      
      // Generate proof
      const proof = await this.generateProof(executionResult);
      
      // Submit attestation
      await this.submitAttestation(taskId, stepIndex, proof, executionResult);
      
      console.log(`Step ${stepIndex} completed successfully`);
    } catch (error) {
      console.error(`Error executing step ${stepIndex}:`, error);
      throw error;
    }
  }

  private async generateProof(output: ExecutionResult): Promise<string> {
    const data = JSON.stringify({
      agentId: this.config.agentId,
      output,
      timestamp: Date.now(),
    });
    return hashObject(data);
  }

  private async submitAttestation(
    taskId: string,
    stepIndex: number,
    proof: string,
    output: ExecutionResult
  ): Promise<void> {
    const outputHash = hashObject(output);
    
    // Create signature (simplified)
    const signature = `sig_${this.config.agentId}_${Date.now()}`;
    
    const stepBytes = new Uint8Array(16);
    stepBytes[15] = stepIndex;
    
    await this.config.client.submitAttestation(
      taskId,
      stepBytes,
      outputHash
    );
    
    console.log(`Attestation submitted for step ${stepIndex}`);
  }
}

export interface AgentNodeRuntimeConfig {
  agentId: string;
  capabilities: string[];
  client: MidnightClient;
  adapter: any;
  privateKey: string;
}

export function createAgentNode(config: AgentNodeRuntimeConfig): AgentNode {
  return new AgentNode(config);
}
