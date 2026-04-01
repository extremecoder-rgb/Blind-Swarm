import { hashObject } from '../crypto/index.js';
export class AgentNode {
    config;
    running = false;
    eventHandlers = new Map();
    constructor(config) {
        this.config = config;
    }
    async start() {
        console.log(`AgentNode ${this.config.agentId} starting...`);
        this.running = true;
        // Set up event listener for step assignments
        this.config.client.watchEvent('StepAssigned', async (data) => {
            if (data.agentId === this.config.agentId) {
                console.log(`Agent ${this.config.agentId} received step assignment:`, data);
                await this.executeStep(data.taskId, data.stepIndex);
            }
        });
        console.log(`AgentNode ${this.config.agentId} listening for assignments`);
    }
    async stop() {
        console.log(`AgentNode ${this.config.agentId} stopping...`);
        this.running = false;
    }
    async executeStep(taskId, stepIndex) {
        console.log(`Executing step ${stepIndex} for task ${taskId}`);
        try {
            // Get task details from contract
            const state = await this.config.client.getContractState();
            const task = state.tasks?.find((t) => t.id === taskId);
            if (!task) {
                throw new Error(`Task ${taskId} not found`);
            }
            const step = task.steps?.find((s) => s.index === stepIndex);
            if (!step) {
                throw new Error(`Step ${stepIndex} not found`);
            }
            const prompt = step.description || `Execute step ${stepIndex}`;
            const context = { taskId, stepIndex, dependencies: step.dependencies };
            const executionResult = await this.config.adapter.execute(prompt, context);
            // Generate proof
            const proof = await this.generateProof(executionResult);
            // Submit attestation
            await this.submitAttestation(taskId, stepIndex, proof, executionResult);
            console.log(`Step ${stepIndex} completed successfully`);
        }
        catch (error) {
            console.error(`Error executing step ${stepIndex}:`, error);
            throw error;
        }
    }
    async generateProof(output) {
        const data = JSON.stringify({
            agentId: this.config.agentId,
            output,
            timestamp: Date.now(),
        });
        return hashObject(data);
    }
    async submitAttestation(taskId, stepIndex, proof, output) {
        const outputHash = hashObject(output);
        // Create signature (simplified)
        const signature = `sig_${this.config.agentId}_${Date.now()}`;
        const stepBytes = new Uint8Array(16);
        stepBytes[15] = stepIndex;
        await this.config.client.submitAttestation(taskId, stepBytes, outputHash);
        console.log(`Attestation submitted for step ${stepIndex}`);
    }
}
export function createAgentNode(config) {
    return new AgentNode(config);
}
//# sourceMappingURL=AgentNode.js.map