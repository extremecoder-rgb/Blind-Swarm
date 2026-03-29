import type { Agent, Task } from '../types/index.js';
export declare class Storage {
    private dbPath;
    private agents;
    private tasks;
    private disputes;
    private config;
    private encryptedOutputs;
    constructor(dbPath: string);
    open(): Promise<void>;
    close(): Promise<void>;
    saveTask(taskId: string, task: Task): Promise<void>;
    getTask(taskId: string): Promise<Task | null>;
    listTasks(): Promise<Task[]>;
    deleteTask(taskId: string): Promise<void>;
    saveAgent(agentId: string, agent: Agent): Promise<void>;
    getAgent(agentId: string): Promise<Agent | null>;
    listAgents(): Promise<Agent[]>;
    saveConfig(key: string, value: any): Promise<void>;
    getConfig(key: string): Promise<any>;
    saveEncryptedOutput(taskId: string, stepIndex: number, encrypted: Buffer): Promise<void>;
    getEncryptedOutput(taskId: string, stepIndex: number): Promise<Buffer | null>;
}
//# sourceMappingURL=index.d.ts.map