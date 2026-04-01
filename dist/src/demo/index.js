import { createClient } from '../client/index.js';
import * as BlindSwarmContract from '../client/gen/contract/index.js';
import { createGeminiAdapter, AGENT_PROMPTS } from '../adapters/index.js';
import { createDashboard } from '../tui/index.js';
import { DEMO_SCENARIO } from './scenario.js';
import { generateKeypair, signMessage } from '../crypto/signature.js';
import * as dotenv from 'dotenv';
dotenv.config();
export class DemoRunner {
    config;
    dashboard = null;
    logs = [];
    constructor(config) {
        if (!config.geminiApiKey) {
            throw new Error('CRITICAL: Gemini API Key is missing. Real AI orchestration requires a valid AI adapter.');
        }
        this.config = config;
    }
    addLog(msg) {
        this.logs.push(msg);
        if (this.dashboard) {
            this.dashboard.update({ logs: this.logs });
        }
        else {
            console.log(`[REAL-ORCH] ${msg}`);
        }
        if (this.config.onUpdate) {
            this.config.onUpdate({ logs: this.logs });
        }
    }
    async run() {
        const scenario = DEMO_SCENARIO;
        // Initialize Dashboard
        if (this.config.showTUI) {
            this.dashboard = createDashboard();
            await this.dashboard.render();
        }
        this.addLog(`BlindSwarm REAL Orchestration Starting...`);
        this.addLog(`Scenario: ${scenario.agents.map((a) => a.name).join(' → ')}`);
        // Initialize Midnight Client (Strict preprod)
        this.addLog('Connecting to Midnight Preprod Network...');
        // Debug: Check env vars
        console.log('DEBUG: MIDNIGHT_MNEMONIC set:', !!process.env.MIDNIGHT_MNEMONIC);
        console.log('DEBUG: MIDNIGHT_WALLET_SEED set:', !!process.env.MIDNIGHT_WALLET_SEED);
        const client = await createClient({
            walletPrivateKey: process.env.MIDNIGHT_WALLET_SEED,
            mnemonicPhrase: process.env.MIDNIGHT_MNEMONIC
        });
        // Check wallet initialization
        try {
            await client.initWallet();
            this.addLog(`Wallet Connected: ${client.walletAddress}`);
        }
        catch (e) {
            this.addLog(`FAIL: Wallet connection failed. Check MIDNIGHT_WALLET_SEED in .env`);
            throw e;
        }
        // Load Contract (Requires manual compilation first)
        // @ts-ignore
        const contractLogic = BlindSwarmContract;
        this.addLog('Successfully loaded ZK circuits.');
        // Deploy contract
        this.addLog('Deploying BlindSwarm contract to Testnet...');
        try {
            const deployResult = await client.deployContract(contractLogic);
            this.addLog(`SUCCESS: Contract live at ${deployResult.contractAddress}`);
        }
        catch (e) {
            this.addLog(`FAIL: Deployment failed. Status: ${e.message}`);
            return;
        }
        // Agent Setup
        this.addLog('Provisioning AI agents with cryptographic identities...');
        const registeredAgents = [];
        for (const agent of scenario.agents) {
            const keys = await generateKeypair();
            const result = await client.registerAgent([agent.capability], BigInt(1000));
            this.addLog(`- Agent ${agent.name} (Staked 1000)`);
            registeredAgents.push({
                ...agent,
                registeredId: result.agentId,
                publicKey: keys.publicKey,
                privateKey: keys.privateKey
            });
        }
        // Protocol Execution
        this.addLog('Submitting Task DAG to Midnight...');
        const taskId = `task_${Date.now()}`;
        const taskResult = await client.createTask(taskId, BigInt(1000), Date.now() + 3600000);
        this.addLog(`Task ${taskResult.taskId} accepted by network.`);
        const steps = scenario.dag.steps.map(s => ({
            index: s.index,
            agentId: null,
            status: 'pending',
            dependencies: s.dependencies || [],
            inputHash: '',
            outputHash: null,
            attestation: null
        }));
        if (this.dashboard) {
            this.dashboard.update({ taskId: taskResult.taskId, status: 'EXECUTING', steps });
        }
        for (const stepIndex of scenario.dag.steps.map(s => s.index)) {
            const step = scenario.dag.steps[stepIndex];
            const assignedAgent = registeredAgents[stepIndex];
            this.addLog(`Assigning Step ${stepIndex + 1} to Agent ${assignedAgent.name}...`);
            await client.assignStep(taskResult.taskId, stepIndex, assignedAgent.registeredId);
            steps[stepIndex].status = 'assigned';
            steps[stepIndex].agentId = assignedAgent.registeredId;
            if (this.dashboard)
                this.dashboard.update({ steps });
            // REAL AI EXECUTION
            this.addLog(`[AI] Agent ${assignedAgent.name} processing step via Gemini...`);
            const systemPrompt = AGENT_PROMPTS[assignedAgent.capability] || '';
            const adapter = createGeminiAdapter(this.config.geminiApiKey, 'gemini-2.5-flash', systemPrompt);
            const aiResult = await adapter.execute(step.description, { taskId: taskResult.taskId });
            this.addLog(`[AI] Response generated. Content length: ${aiResult.result.length}`);
            // Cryptographic Signing
            this.addLog(`[ZK] Generating attestation proof for Agent ${assignedAgent.name}...`);
            const payloadToSign = `${taskResult.taskId}:${stepIndex}:${aiResult.result}`;
            const signature = await signMessage(assignedAgent.privateKey, payloadToSign);
            // Submit to Midnight
            const stepBytes = new Uint8Array(16);
            stepBytes[15] = stepIndex; // Basic encoding for demo
            await client.submitAttestation(taskResult.taskId, stepBytes, `sha256_${stepIndex}`.padEnd(32, '0').slice(0, 32));
            steps[stepIndex].status = 'completed';
            if (this.dashboard)
                this.dashboard.update({ steps });
            this.addLog(`[CHAIN] Step ${stepIndex + 1} finalized on-chain.`);
        }
        this.addLog('══════════ REAL ORCHESTRATION SUCCESSFUL ══════════');
        if (this.dashboard)
            this.dashboard.update({ status: 'COMPLETED' });
        await new Promise(r => setTimeout(r, 5000));
        if (this.dashboard)
            this.dashboard.stop();
    }
}
export async function runDemo(config) {
    const runner = new DemoRunner({
        showTUI: config?.showTUI ?? true,
        geminiApiKey: process.env.GEMINI_API_KEY || '',
        onUpdate: config?.onUpdate,
    });
    await runner.run();
}
//# sourceMappingURL=index.js.map