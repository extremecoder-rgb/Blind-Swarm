import { Storage } from '../storage/index.js';
import { validateDAG } from './dag.js';
export { validateDAG };
export class Orchestrator {
    config;
    client = null;
    storage = null;
    running = false;
    constructor(config) {
        this.config = config;
    }
    async start() {
        console.log('Starting Orchestrator...');
        this.storage = new Storage(this.config.storagePath);
        await this.storage.open();
        this.client = await import('../client/index.js').then((m) => m.createClient({
            providerUrl: 'https://testnet.midnight.network',
            walletPrivateKey: this.config.walletPrivateKey,
            contractAddress: this.config.contractAddress,
        }));
        this.running = true;
        console.log('Orchestrator started');
    }
    async stop() {
        console.log('Stopping Orchestrator...');
        this.running = false;
        if (this.storage) {
            await this.storage.close();
        }
        console.log('Orchestrator stopped');
    }
    validateDAG(dag) {
        return validateDAG(dag);
    }
    async createTask(dag, escrow, deadline) {
        if (!this.client)
            throw new Error('Orchestrator not started');
        const validation = this.validateDAG(dag);
        if (!validation.valid) {
            throw new Error(`Invalid DAG: ${validation.errors.join(', ')}`);
        }
        const result = await this.client.createTask(dag, escrow, deadline);
        return result.taskId;
    }
    async assignStep(taskId, stepIndex, agentId) {
        if (!this.client)
            throw new Error('Orchestrator not started');
        await this.client.assignStep(taskId, stepIndex, agentId);
    }
    async getTaskStatus(taskId) {
        if (!this.client)
            throw new Error('Orchestrator not started');
        const state = await this.client.getContractState();
        const task = state.tasks?.find((t) => t.id === taskId);
        if (!task) {
            return 'not_found';
        }
        return task.status;
    }
    async lockEscrow(taskId, amount) {
        console.log(`Locking escrow for task ${taskId}: ${amount}`);
    }
    async releaseEscrow(taskId) {
        console.log(`Releasing escrow for task ${taskId}`);
    }
    async slashEscrow(taskId, amount) {
        console.log(`Slashing escrow for task ${taskId}: ${amount}`);
    }
}
//# sourceMappingURL=index.js.map