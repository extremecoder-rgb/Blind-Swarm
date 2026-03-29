import { createBlindSwarmContract, CIRCUITS, EVENTS, type AgentState, type TaskState, type DisputeState } from '../../contracts/index.js';

export interface ClientConfig {
  providerUrl: string;
  walletPrivateKey: string;
  contractAddress?: string;
}

export interface DeployResult {
  contractAddress: string;
  transactionId: string;
}

export interface EventWatcher {
  start(): void;
  stop(): void;
  on(event: string, callback: (data: any) => void): void;
}

class MidnightClient {
  private config: ClientConfig;
  private contract: any;
  private eventWatchers: Map<string, Function[]> = new Map();

  constructor(config: ClientConfig) {
    this.config = config;
    this.contract = createBlindSwarmContract();
  }

  async deployContract(): Promise<DeployResult> {
    console.log('Deploying BlindSwarm contract to Midnight testnet...');
    
    // In production, this would:
    // 1. Compile BlindSwarm.compact to ZK circuit
    // 2. Deploy to Midnight testnet via provider
    // 3. Return the contract address
    
    const contractAddress = '0x' + 'a'.repeat(64);
    const transactionId = '0x' + 'b'.repeat(64);
    
    this.config.contractAddress = contractAddress;
    
    return { contractAddress, transactionId };
  }

  async getContractState(): Promise<any> {
    return {
      agents: Array.from(this.contract.state.agents.entries()),
      tasks: Array.from(this.contract.state.tasks.entries()),
      disputes: Array.from(this.contract.state.disputes.entries()),
    };
  }

  async registerAgent(capabilities: string[], stake: bigint): Promise<{ agentId: string }> {
    console.log('Registering agent with capabilities:', capabilities);
    return this.contract.circuits.register_agent({
      capabilities,
      stake: stake.toString(),
    });
  }

  async deregisterAgent(agentId: string): Promise<{ success: boolean }> {
    console.log('Deregistering agent:', agentId);
    return this.contract.circuits.deregister_agent({ agentId });
  }

  async createTask(dag: any, escrow: bigint, deadline: number): Promise<{ taskId: string }> {
    console.log('Creating task with DAG:', JSON.stringify(dag));
    return this.contract.circuits.create_task({
      dag,
      escrow: escrow.toString(),
      deadline,
    });
  }

  async assignStep(taskId: string, stepIndex: number, agentId: string): Promise<{ success: boolean }> {
    console.log('Assigning step:', taskId, stepIndex, agentId);
    return this.contract.circuits.assign_step({ taskId, stepIndex, agentId });
  }

  async submitAttestation(
    taskId: string,
    stepIndex: number,
    signature: string,
    outputHash: string
  ): Promise<{ success: boolean }> {
    console.log('Submitting attestation for:', taskId, stepIndex);
    return this.contract.circuits.submit_attestation({
      taskId,
      stepIndex,
      signature,
      outputHash,
    });
  }

  async initiateDispute(
    taskId: string,
    stepIndex: number,
    evidenceCommitment: string
  ): Promise<{ disputeId: string }> {
    console.log('Initiating dispute for:', taskId, stepIndex);
    return this.contract.circuits.initiate_dispute({
      taskId,
      stepIndex,
      evidenceCommitment,
    });
  }

  async resolveDispute(
    disputeId: string,
    resolution: 'ruled_for_initiator' | 'ruled_against_initiator',
    selectiveData: any
  ): Promise<{ success: boolean }> {
    console.log('Resolving dispute:', disputeId, resolution);
    return this.contract.circuits.resolve_dispute({
      disputeId,
      resolution,
      selectiveData,
    });
  }

  watchEvent(eventName: string, callback: (data: any) => void): void {
    if (!this.eventWatchers.has(eventName)) {
      this.eventWatchers.set(eventName, []);
    }
    this.eventWatchers.get(eventName)!.push(callback);
  }

  emitEvent(eventName: string, data: any): void {
    const watchers = this.eventWatchers.get(eventName);
    if (watchers) {
      watchers.forEach((cb) => cb(data));
    }
  }
}

export async function createClient(config: ClientConfig): Promise<MidnightClient> {
  return new MidnightClient(config);
}

export { MidnightClient };
