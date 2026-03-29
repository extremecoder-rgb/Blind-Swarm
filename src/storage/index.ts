import type { Agent, Task, Dispute } from '../types/index.js';

interface StorageOptions {
  dbPath: string;
}

export class Storage {
  private dbPath: string;
  private agents: Map<string, Agent> = new Map();
  private tasks: Map<string, Task> = new Map();
  private disputes: Map<string, Dispute> = new Map();
  private config: Map<string, any> = new Map();
  private encryptedOutputs: Map<string, Buffer> = new Map();

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  async open(): Promise<void> {
    console.log('Storage opened at:', this.dbPath);
  }

  async close(): Promise<void> {
    console.log('Storage closed');
    this.agents.clear();
    this.tasks.clear();
    this.disputes.clear();
    this.config.clear();
    this.encryptedOutputs.clear();
  }

  // Task storage
  async saveTask(taskId: string, task: Task): Promise<void> {
    this.tasks.set(taskId, task);
  }

  async getTask(taskId: string): Promise<Task | null> {
    return this.tasks.get(taskId) || null;
  }

  async listTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async deleteTask(taskId: string): Promise<void> {
    this.tasks.delete(taskId);
  }

  // Agent storage
  async saveAgent(agentId: string, agent: Agent): Promise<void> {
    this.agents.set(agentId, agent);
  }

  async getAgent(agentId: string): Promise<Agent | null> {
    return this.agents.get(agentId) || null;
  }

  async listAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  // Config storage
  async saveConfig(key: string, value: any): Promise<void> {
    this.config.set(key, value);
  }

  async getConfig(key: string): Promise<any> {
    return this.config.get(key);
  }

  // Encrypted outputs storage
  async saveEncryptedOutput(taskId: string, stepIndex: number, encrypted: Buffer): Promise<void> {
    const key = `${taskId}:${stepIndex}`;
    this.encryptedOutputs.set(key, encrypted);
  }

  async getEncryptedOutput(taskId: string, stepIndex: number): Promise<Buffer | null> {
    const key = `${taskId}:${stepIndex}`;
    return this.encryptedOutputs.get(key) || null;
  }
}
