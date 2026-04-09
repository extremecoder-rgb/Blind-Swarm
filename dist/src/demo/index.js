import { createGeminiAdapter, createGroqAdapter, createMockAdapter } from '../adapters/index.js';
import { createDashboard } from '../tui/index.js';
import { SCENARIO } from './scenario.js';
import { generateKeypair, signMessage } from '../crypto/signature.js';
import { sha256 } from '../crypto/hash.js';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const AGENT_PROMPTS = {
    fetcher: `You are an On-Chain Data Fetcher specialized in DeFi analytics. 
Your role is to fetch and normalize on-chain data from blockchain nodes.
Focus on: pool reserves, token balances, volume, gas fees, block timestamps.
Provide raw data in structured JSON format with exact values and timestamps.`,
    risk: `You are a DeFi Risk Analyst specialized in protocol security assessment.
Your role is to analyze smart contract risk, impermanent loss, and protocol exposure.
Consider: TVL concentration, audit reports, exploit history, volatility, oracle manipulation.
Provide risk scores (0-100) with specific vulnerability findings and severity levels.`,
    yield: `You are a Yield Optimization Engine specialized in DeFi strategy analysis.
Your role is to calculate optimal yield strategies across different protocols.
Analyze: APY comparisons, incentive rewards, gas costs, impermanent loss estimates.
Provide ranked recommendations with expected returns and risk-adjusted scores.`,
    report: `You are a DeFi Analytics Report Generator specialized in executive summaries.
Your role is to synthesize data from all agents into actionable insights.
Create: executive summary, key metrics, risk alerts, yield recommendations, next steps.
Format as clean markdown with clear sections and bullet points for decision makers.`,
};
class PipelineRunner {
    config;
    dashboard = null;
    logs = [];
    constructor(config) {
        this.config = config;
    }
    addLog(msg) {
        this.logs.push(msg);
        this.broadcastState({ logs: this.logs, message: msg });
    }
    broadcastState(partialState) {
        if (this.dashboard) {
            this.dashboard.update(partialState);
        }
        if (this.config.onUpdate) {
            this.config.onUpdate(partialState);
        }
    }
    async run() {
        const scenario = SCENARIO;
        if (this.config.showTUI) {
            this.dashboard = createDashboard();
            await this.dashboard.render();
        }
        // Initialize and broadcast empty steps immediately for instant UI feedback
        const initialSteps = scenario.dag.steps.map((s) => ({
            index: s.index,
            agentId: null,
            status: 'pending',
            dependencies: s.dependencies || [],
            inputHash: '',
            outputHash: null,
            attestation: null
        }));
        this.broadcastState({ status: 'STARTING', steps: initialSteps });
        this.addLog(`🚀 DeFi Analytics Pipeline Starting...`);
        this.addLog(`Project: ${scenario.projectName}`);
        this.addLog(`Agents: ${scenario.agents.map((a) => a.name).join(', ')}`);
        this.addLog(`\n📊 Pipeline Stages:`);
        for (const step of scenario.dag.steps) {
            const deps = step.dependencies.length > 0
                ? `(awaiting: step ${step.dependencies.join(', ')})`
                : '(ready)';
            this.addLog(`  → ${step.description.substring(0, 60)}... ${deps}`);
        }
        this.addLog(`\n🔐 Provisioning cryptographic agent identities...`);
        const registeredAgents = [];
        for (const agent of scenario.agents) {
            const keys = await generateKeypair();
            this.addLog(`  ✓ ${agent.name} [${agent.role}]`);
            this.addLog(`    Key: ${keys.publicKey.substring(0, 14)}...`);
            registeredAgents.push({
                ...agent,
                publicKey: keys.publicKey,
                privateKey: keys.privateKey
            });
        }
        this.broadcastState({ agents: registeredAgents });
        this.addLog(`\n⚡ Executing DeFi Analytics Pipeline...`);
        const steps = scenario.dag.steps.map((s) => ({
            index: s.index,
            agentId: null,
            status: 'pending',
            dependencies: s.dependencies || [],
            inputHash: '',
            outputHash: null,
            attestation: null
        }));
        if (this.dashboard) {
            this.dashboard.update({ status: 'RUNNING', steps });
        }
        this.broadcastState({ status: 'RUNNING', steps });
        const stepToAgent = {
            0: registeredAgents[0], // Fetcher
            1: registeredAgents[1], // Risk
            2: registeredAgents[2], // Yield
            3: registeredAgents[3], // Report
        };
        for (const stepIndex of scenario.dag.steps.map((s) => s.index)) {
            const step = scenario.dag.steps[stepIndex];
            const assignedAgent = stepToAgent[stepIndex];
            this.addLog(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            this.addLog(`📡 [Step ${stepIndex + 1}/4] Assigning Agent: ${assignedAgent.name}...`);
            this.addLog(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            steps[stepIndex].status = 'assigned';
            steps[stepIndex].agentId = assignedAgent.publicKey;
            this.broadcastState({ steps });
            this.addLog(`🔐 Cryptographic link established: ${assignedAgent.publicKey.substring(0, 16)}...`);
            const systemPrompt = AGENT_PROMPTS[assignedAgent.capability] || '';
            let aiResult;
            if (this.config.useMockAI) {
                const adapter = createMockAdapter(assignedAgent.capability);
                aiResult = await adapter.execute(step.description, { step: stepIndex, project: scenario.projectName });
            }
            else if (this.config.groqApiKey) {
                this.addLog(`🤖 AI Processing via Groq (Llama 3.1)...`);
                const adapter = createGroqAdapter(this.config.groqApiKey, 'llama-3.1-8b-instant', systemPrompt);
                try {
                    aiResult = await adapter.execute(step.description, {
                        step: stepIndex,
                        project: scenario.projectName,
                        previousSteps: steps.slice(0, stepIndex).map(s => s.outputHash).filter(Boolean)
                    });
                }
                catch (e) {
                    this.addLog(`⚠ AI error: ${e.message}, using fallback...`);
                    const mock = createMockAdapter(assignedAgent.capability);
                    aiResult = await mock.execute(step.description, { step: stepIndex, project: scenario.projectName });
                }
            }
            else if (this.config.geminiApiKey) {
                try {
                    const adapter = createGeminiAdapter(this.config.geminiApiKey, 'gemini-2.0-flash', systemPrompt);
                    aiResult = await adapter.execute(step.description, { step: stepIndex, project: scenario.projectName });
                }
                catch {
                    const mock = createMockAdapter(assignedAgent.capability);
                    aiResult = await mock.execute(step.description, { step: stepIndex, project: scenario.projectName });
                }
            }
            else {
                const adapter = createMockAdapter(assignedAgent.capability);
                aiResult = await adapter.execute(step.description, { step: stepIndex, project: scenario.projectName });
            }
            this.addLog(`\n📊 ${assignedAgent.name} Output:`);
            const outputPreview = aiResult.result.substring(0, 200).replace(/\n/g, ' ');
            this.addLog(`   ${outputPreview}...`);
            this.addLog(`   Confidence: ${aiResult.confidence}%`);
            const payloadToSign = `${scenario.projectName}:step${stepIndex}:${aiResult.result}`;
            const signature = await signMessage(assignedAgent.privateKey, payloadToSign);
            const outputHash = sha256(aiResult.result);
            this.addLog(`\n🔏 Cryptographic Attestation:`);
            this.addLog(`   Signer: ${assignedAgent.name}`);
            this.addLog(`   Signature: ${signature.substring(0, 24)}...`);
            this.addLog(`   SHA-256: ${outputHash.substring(0, 16)}...`);
            steps[stepIndex].status = 'completed';
            steps[stepIndex].outputHash = outputHash;
            steps[stepIndex].attestation = signature;
            this.broadcastState({ steps });
            this.addLog(`\n✅ Step ${stepIndex + 1}/4 Complete`);
        }
        this.addLog(`\n╔═══════════════════════════════════════════════════════╗`);
        this.addLog(`║          DEFI ANALYTICS PIPELINE COMPLETE            ║`);
        this.addLog(`╚═══════════════════════════════════════════════════════╝`);
        this.addLog(`Project: ${scenario.projectName}`);
        this.addLog(`Pipeline: 4 stages executed`);
        this.addLog(`Agents: 4 AI agents with Ed25519 attestations`);
        this.addLog(`Status: All outputs cryptographically signed`);
        if (this.dashboard)
            this.dashboard.update({ status: 'COMPLETED' });
        this.broadcastState({ status: 'COMPLETED' });
        await new Promise(r => setTimeout(r, 3000));
        if (this.dashboard)
            this.dashboard.stop();
    }
}
export async function runPipeline(config) {
    const runner = new PipelineRunner({
        showTUI: config?.showTUI ?? false,
        geminiApiKey: process.env.GEMINI_API_KEY || '',
        groqApiKey: process.env.GROQ_API_KEY || '',
        useMockAI: config?.useMockAI ?? false,
        onUpdate: config?.onUpdate,
    });
    await runner.run();
}
export async function runDemo(config) {
    return runPipeline(config);
}
//# sourceMappingURL=index.js.map