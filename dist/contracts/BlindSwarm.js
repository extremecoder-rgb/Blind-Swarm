// BlindSwarm Compact Contract
// Unified contract with AgentRegistry, TaskRegistry, and DisputeRegistry modules
export const CONTRACT_NAME = 'BlindSwarm';
export const CONTRACT_VERSION = '1.0.0';
// Circuit Names
export const CIRCUITS = {
    REGISTER_AGENT: 'register_agent',
    DEREGISTER_AGENT: 'deregister_agent',
    CREATE_TASK: 'create_task',
    ASSIGN_STEP: 'assign_step',
    SUBMIT_ATTESTATION: 'submit_attestation',
    INITIATE_DISPUTE: 'initiate_dispute',
    RESOLVE_DISPUTE: 'resolve_dispute',
};
// Event Names
export const EVENTS = {
    AGENT_REGISTERED: 'AgentRegistered',
    AGENT_DEREGISTERED: 'AgentDeregistered',
    TASK_CREATED: 'TaskCreated',
    STEP_ASSIGNED: 'StepAssigned',
    ATTESTATION_SUBMITTED: 'AttestationSubmitted',
    DISPUTE_INITIATED: 'DisputeInitiated',
    DISPUTE_RESOLVED: 'DisputeResolved',
};
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
//# sourceMappingURL=BlindSwarm.js.map