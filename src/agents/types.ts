import { MidnightClient } from '../client/index.js';

export interface AgentNodeConfig {
  agentId: string;
  capabilities: string[];
  client: MidnightClient;
  adapter: any;
  privateKey: string;
}

export interface ExecutionResult {
  result: string;
  confidence: number;
  metadata: Record<string, any>;
}
