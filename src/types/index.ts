export interface Agent {
  id: string;
  owner: string;
  capabilities: string[];
  stake: bigint;
  reputation: number;
  registeredAt: number;
}

export interface TaskStep {
  index: number;
  agentId: string | null;
  status: 'pending' | 'assigned' | 'completed' | 'failed';
  dependencies: number[];
  inputHash: string;
  outputHash: string | null;
  attestation: string | null;
}

export interface Task {
  id: string;
  owner: string;
  dag: TaskStep[];
  escrow: bigint;
  deadline: number;
  status: 'created' | 'in_progress' | 'completed' | 'disputed';
  createdAt: number;
}

export interface Attestation {
  taskId: string;
  stepIndex: number;
  agentId: string;
  outputHash: string;
  signature: string;
  timestamp: number;
}

export interface Dispute {
  id: string;
  taskId: string;
  stepIndex: number;
  initiator: string;
  evidenceCommitment: string;
  resolution: 'pending' | 'ruled_for_initiator' | 'ruled_against_initiator';
  resolvedAt: number | null;
}

export interface DAG {
  steps: {
    index: number;
    dependencies: number[];
    description: string;
  }[];
}

export type Capability = 
  | 'market_analysis'
  | 'risk_analysis'
  | 'compliance'
  | 'data_processing'
  | 'reasoning';

export interface OrchestratorConfig {
  contractAddress: string;
  walletPrivateKey: string;
  storagePath: string;
}

export type TaskStatus = 'created' | 'in_progress' | 'completed' | 'disputed' | 'not_found';
