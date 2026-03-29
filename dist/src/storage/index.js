export class Storage {
    dbPath;
    agents = new Map();
    tasks = new Map();
    disputes = new Map();
    config = new Map();
    encryptedOutputs = new Map();
    constructor(dbPath) {
        this.dbPath = dbPath;
    }
    async open() {
        console.log('Storage opened at:', this.dbPath);
    }
    async close() {
        console.log('Storage closed');
        this.agents.clear();
        this.tasks.clear();
        this.disputes.clear();
        this.config.clear();
        this.encryptedOutputs.clear();
    }
    // Task storage
    async saveTask(taskId, task) {
        this.tasks.set(taskId, task);
    }
    async getTask(taskId) {
        return this.tasks.get(taskId) || null;
    }
    async listTasks() {
        return Array.from(this.tasks.values());
    }
    async deleteTask(taskId) {
        this.tasks.delete(taskId);
    }
    // Agent storage
    async saveAgent(agentId, agent) {
        this.agents.set(agentId, agent);
    }
    async getAgent(agentId) {
        return this.agents.get(agentId) || null;
    }
    async listAgents() {
        return Array.from(this.agents.values());
    }
    // Config storage
    async saveConfig(key, value) {
        this.config.set(key, value);
    }
    async getConfig(key) {
        return this.config.get(key);
    }
    // Encrypted outputs storage
    async saveEncryptedOutput(taskId, stepIndex, encrypted) {
        const key = `${taskId}:${stepIndex}`;
        this.encryptedOutputs.set(key, encrypted);
    }
    async getEncryptedOutput(taskId, stepIndex) {
        const key = `${taskId}:${stepIndex}`;
        return this.encryptedOutputs.get(key) || null;
    }
}
//# sourceMappingURL=index.js.map