import { validateDAG, type ValidationResult } from './dag.js';
import type { OrchestratorConfig, TaskStatus, DAG } from '../types/index.js';
export { validateDAG };
export type { ValidationResult };
export declare class Orchestrator {
    private config;
    private client;
    private storage;
    private running;
    constructor(config: OrchestratorConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    validateDAG(dag: DAG): ValidationResult;
    createTask(dag: DAG, escrow: bigint, deadline: number): Promise<string>;
    assignStep(taskId: string, stepIndex: number, agentId: string): Promise<void>;
    getTaskStatus(taskId: string): Promise<TaskStatus>;
    lockEscrow(taskId: string, amount: bigint): Promise<void>;
    releaseEscrow(taskId: string): Promise<void>;
    slashEscrow(taskId: string, amount: bigint): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map