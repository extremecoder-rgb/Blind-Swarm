import { MidnightClient, type ClientConfig } from '../client/index.js';
import { Storage } from '../storage/index.js';
import { validateDAG, type ValidationResult } from './dag.js';
import type { OrchestratorConfig, Task, TaskStatus, DAG } from '../types/index.js';

export { validateDAG };
export type { ValidationResult };

export class Orchestrator {
  private config: OrchestratorConfig;
  private client: MidnightClient | null = null;
  private storage: Storage | null = null;
  private running: boolean = false;

  constructor(config: OrchestratorConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    console.log('Starting Orchestrator...');
    
    this.storage = new Storage(this.config.storagePath);
    await this.storage.open();
    
    this.client = await import('../client/index.js').then(
      (m) => m.createClient({
        providerUrl: 'https://testnet.midnight.network',
        walletPrivateKey: this.config.walletPrivateKey,
        contractAddress: this.config.contractAddress,
      })
    );
    
    this.running = true;
    console.log('Orchestrator started');
  }

  async stop(): Promise<void> {
    console.log('Stopping Orchestrator...');
    this.running = false;
    if (this.storage) {
      await this.storage.close();
    }
    console.log('Orchestrator stopped');
  }

  validateDAG(dag: DAG): ValidationResult {
    return validateDAG(dag);
  }

  async createTask(dag: DAG, escrow: bigint, deadline: number): Promise<string> {
    if (!this.client) throw new Error('Orchestrator not started');
    
    const validation = this.validateDAG(dag);
    if (!validation.valid) {
      throw new Error(`Invalid DAG: ${validation.errors.join(', ')}`);
    }
    
    const result = await this.client.createTask(dag, escrow, deadline);
    return result.taskId;
  }

  async assignStep(taskId: string, stepIndex: number, agentId: string): Promise<void> {
    if (!this.client) throw new Error('Orchestrator not started');
    await this.client.assignStep(taskId, stepIndex, agentId);
  }

  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    if (!this.client) throw new Error('Orchestrator not started');
    
    const state = await this.client.getContractState();
    const task = state.tasks?.find((t: any) => t.id === taskId);
    
    if (!task) {
      return 'not_found' as TaskStatus;
    }
    
    return task.status;
  }

  async lockEscrow(taskId: string, amount: bigint): Promise<void> {
    console.log(`Locking escrow for task ${taskId}: ${amount}`);
  }

  async releaseEscrow(taskId: string): Promise<void> {
    console.log(`Releasing escrow for task ${taskId}`);
  }

  async slashEscrow(taskId: string, amount: bigint): Promise<void> {
    console.log(`Slashing escrow for task ${taskId}: ${amount}`);
  }
}
