import { MidnightClient } from '../client/index.js';
import type { AgentNodeConfig } from './types.js';
export { type AgentNodeConfig } from './types.js';
export interface ExecutionResult {
    result: string;
    confidence: number;
    metadata: Record<string, any>;
}
export declare class AgentNode {
    private config;
    private running;
    private eventHandlers;
    constructor(config: AgentNodeConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    executeStep(taskId: string, stepIndex: number): Promise<void>;
    private generateProof;
    private submitAttestation;
}
export interface AgentNodeRuntimeConfig {
    agentId: string;
    capabilities: string[];
    client: MidnightClient;
    adapter: any;
    privateKey: string;
}
export declare function createAgentNode(config: AgentNodeRuntimeConfig): AgentNode;
//# sourceMappingURL=AgentNode.d.ts.map