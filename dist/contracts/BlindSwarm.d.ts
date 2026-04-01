export declare const CONTRACT_NAME = "BlindSwarm";
export declare const CONTRACT_VERSION = "1.0.0";
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
export declare const CIRCUITS: {
    readonly REGISTER_AGENT: "register_agent";
    readonly DEREGISTER_AGENT: "deregister_agent";
    readonly CREATE_TASK: "create_task";
    readonly ASSIGN_STEP: "assign_step";
    readonly SUBMIT_ATTESTATION: "submit_attestation";
    readonly INITIATE_DISPUTE: "initiate_dispute";
    readonly RESOLVE_DISPUTE: "resolve_dispute";
};
export declare const EVENTS: {
    readonly AGENT_REGISTERED: "AgentRegistered";
    readonly AGENT_DEREGISTERED: "AgentDeregistered";
    readonly TASK_CREATED: "TaskCreated";
    readonly STEP_ASSIGNED: "StepAssigned";
    readonly ATTESTATION_SUBMITTED: "AttestationSubmitted";
    readonly DISPUTE_INITIATED: "DisputeInitiated";
    readonly DISPUTE_RESOLVED: "DisputeResolved";
};
export declare const MIN_STAKE: bigint;
export declare const MAX_CAPABILITIES = 10;
export declare const MAX_STEPS_PER_TASK = 100;
declare const _default: {
    name: string;
    version: string;
    circuits: ("register_agent" | "create_task" | "assign_step" | "submit_attestation" | "deregister_agent" | "initiate_dispute" | "resolve_dispute")[];
    events: ("StepAssigned" | "AgentRegistered" | "AgentDeregistered" | "TaskCreated" | "AttestationSubmitted" | "DisputeInitiated" | "DisputeResolved")[];
};
export default _default;
//# sourceMappingURL=BlindSwarm.d.ts.map