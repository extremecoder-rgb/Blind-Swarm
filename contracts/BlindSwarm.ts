// BlindSwarm Compact Contract
// Unified contract with AgentRegistry, TaskRegistry, and DisputeRegistry modules

export const CONTRACT_NAME = 'BlindSwarm';
export const CONTRACT_VERSION = '1.0.0';

// State Types
export interface AgentState {
  id: string;
  owner: string;
  capabilities: string[];
  stake: bigint;
  reputation: number;
  registeredAt: number;
}

export interface TaskStepState {
  index: number;
  agentId: string | null;
  status: 'pending' | 'assigned' | 'completed' | 'failed';
  dependencies: number[];
  inputHash: string;
  outputHash: string | null;
  attestation: string | null;
}

export interface TaskState {
  id: string;
  owner: string;
  steps: TaskStepState[];
  escrow: bigint;
  deadline: number;
  status: 'created' | 'in_progress' | 'completed' | 'disputed';
  createdAt: number;
}

export interface DisputeState {
  id: string;
  taskId: string;
  stepIndex: number;
  initiator: string;
  evidenceCommitment: string;
  resolution: 'pending' | 'ruled_for_initiator' | 'ruled_against_initiator';
  resolvedAt: number | null;
}

// Circuit Names
export const CIRCUITS = {
  REGISTER_AGENT: 'register_agent',
  DEREGISTER_AGENT: 'deregister_agent',
  CREATE_TASK: 'create_task',
  ASSIGN_STEP: 'assign_step',
  SUBMIT_ATTESTATION: 'submit_attestation',
  INITIATE_DISPUTE: 'initiate_dispute',
  RESOLVE_DISPUTE: 'resolve_dispute',
} as const;

// Event Names
export const EVENTS = {
  AGENT_REGISTERED: 'AgentRegistered',
  AGENT_DEREGISTERED: 'AgentDeregistered',
  TASK_CREATED: 'TaskCreated',
  STEP_ASSIGNED: 'StepAssigned',
  ATTESTATION_SUBMITTED: 'AttestationSubmitted',
  DISPUTE_INITIATED: 'DisputeInitiated',
  DISPUTE_RESOLVED: 'DisputeResolved',
} as const;

// Constants
export const MIN_STAKE = BigInt(1000);
export const MAX_CAPABILITIES = 10;
export const MAX_STEPS_PER_TASK = 100;

export default {
  name: CONTRACT_NAME,
  version: CONTRACT_VERSION,
  circuits: Object.values(CIRCUITS),
  events: Object.values(EVENTS),
};
